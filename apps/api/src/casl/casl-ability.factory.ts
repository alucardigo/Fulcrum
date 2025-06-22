import { Injectable, Logger } from '@nestjs/common';
import { Ability, AbilityBuilder, AbilityClass, ExtractSubjectType, InferSubjects } from '@casl/ability';
import { Prisma, User as PrismaUser, PurchaseRequest as PrismaPurchaseRequest, Project as PrismaProject, Item as PrismaItem } from '@prisma/client';

// Define os modelos base para o CASL
type Models = {
  User: PrismaUser;
  PurchaseRequest: PrismaPurchaseRequest;
  Project: PrismaProject;
  Item: PrismaItem;
};

// Enums necessários
// Importar PurchaseRequestState do Prisma Client, pois ele agora contém CONCLUIDO
// e é o tipo usado no modelo PrismaPurchaseRequest.
import { PurchaseRequestState, UserRole as PrismaUserRole } from '@prisma/client';
// Mantemos UserRole local se ele tiver valores diferentes ou for usado apenas internamente pela factory,
// ou podemos mapear/usar PrismaUserRole se forem idênticos. Por ora, UserRole local.
// Se UserRole local for idêntico ao do Prisma, poderíamos usar PrismaUserRole também.
// No entanto, o erro não está em UserRole, então vamos focar em PurchaseRequestState.

export { PurchaseRequestState }; // Re-exportar para que outros módulos que usavam o local continuem funcionando, ou ajustar as importações nesses módulos.

export enum UserRole { // Mantendo este local por enquanto, pode ser alinhado com PrismaUserRole se necessário.
  SOLICITANTE = 'SOLICITANTE',
  COMPRAS = 'COMPRAS',
  GERENCIA = 'GERENCIA',
  ADMINISTRADOR = 'ADMINISTRADOR'
}

// O enum PurchaseRequestState local foi removido. Usaremos o do @prisma/client.

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
  Submit = 'submit',
  ApprovePurchase = 'approve_purchase', // Aprovação Nível Compras
  ApproveManagement = 'approve_management', // Aprovação Nível Gerência (Legado ou genérico)
  ApproveLevel2 = 'approve_level_2', // Aprovação Nível 2 (Gerência - Específico)
  Reject = 'reject',
  Execute = 'execute', // Execução da Compra
  PlaceOrder = 'place_order',
  ReceiveItems = 'receive_items',
  Cancel = 'cancel',
}

export type Subjects = InferSubjects<keyof Models> | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

export type UserWithRoles = Prisma.UserGetPayload<{
  include: { roles: true }
}>;

@Injectable()
export class CaslAbilityFactory {
  private readonly logger = new Logger(CaslAbilityFactory.name);

  createForUser(user: UserWithRoles | null) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      Ability as AbilityClass<AppAbility>
    );

    if (!user) {
      this.logger.debug('Construindo habilidades para usuário não autenticado');
      cannot(Action.Manage, 'all');
      return build();
    }

    this.logger.debug(
      `Construindo habilidades para usuário: ${user.email} (ID: ${user.id}), Roles: ${user.roles.map(r => r.role).join(', ')}`
    );

    // Administrador tem acesso total
    if (user.roles.some(r => r.role === UserRole.ADMINISTRADOR)) {
      can(Action.Manage, 'all');
    }

    // Solicitante pode criar e gerenciar suas próprias requisições
    if (user.roles.some(r => r.role === UserRole.SOLICITANTE)) {
      can(Action.Create, 'PurchaseRequest');
      can([Action.Read, Action.Update], 'PurchaseRequest');
      can(Action.Submit, 'PurchaseRequest');
      can(Action.Cancel, 'PurchaseRequest');
    }

    // Setor de Compras pode aprovar requisições pendentes e criar pedidos
    if (user.roles.some(r => r.role === UserRole.COMPRAS)) {
      can(Action.Read, 'PurchaseRequest');
      // Permissão para aprovar o nível 1 (Compras) - PENDENTE_COMPRAS -> PENDENTE_GERENCIA
      can(Action.ApprovePurchase, 'PurchaseRequest', undefined, { status: { $eq: PurchaseRequestState.PENDENTE_COMPRAS } } as any);
      can(Action.Reject, 'PurchaseRequest', undefined, { status: { $eq: PurchaseRequestState.PENDENTE_COMPRAS } } as any);
      // Compras pode executar uma requisição SE ela estiver no estado APROVADO
      can(Action.Execute, 'PurchaseRequest', undefined, { status: { $eq: PurchaseRequestState.APROVADO } } as any);
      // Outras permissões de Compras
      can(Action.PlaceOrder, 'PurchaseRequest'); // Geralmente após aprovação
      can(Action.ReceiveItems, 'PurchaseRequest');
    }

    // Gerência pode aprovar requisições dentro do seu limite
    if (user.roles.some(r => r.role === UserRole.GERENCIA)) {
      can(Action.Read, 'PurchaseRequest'); // Gerência pode ver TODAS as requisições
      // Gerência pode aprovar (nível 2) ou rejeitar uma requisição SE ela estiver no estado PENDENTE_GERENCIA
      can(Action.ApproveLevel2, 'PurchaseRequest', undefined, { status: { $eq: PurchaseRequestState.PENDENTE_GERENCIA } } as any);
      can(Action.Reject, 'PurchaseRequest', undefined, { status: { $eq: PurchaseRequestState.PENDENTE_GERENCIA } } as any);
      // Mantendo ApproveManagement se houver outros usos, mas especificando para PENDENTE_GERENCIA também se aplicável
      // ou se ApproveManagement for o evento usado pela máquina de estados para o fluxo da gerência.
      // A instrução original foca em ApproveLevel2 para a nova lógica.
      // Se ApproveManagement é um nome legado para a aprovação da gerência, podemos adicionar a condição de status aqui também.
      // Por ora, vou manter como está e focar em ApproveLevel2 para a nova transição.
      // can(Action.ApproveManagement, 'PurchaseRequest', { status: PurchaseRequestState.PENDENTE_GERENCIA });
    }

    return build({
      detectSubjectType: (item) => {
        if (item === 'all') return item;
        if (item && typeof item === 'object' && 'email' in item) return 'User';
        if (item && typeof item === 'object' && 'title' in item) return 'PurchaseRequest';
        if (item && typeof item === 'object' && 'budget' in item) return 'Project';
        if (item && typeof item === 'object' && 'quantity' in item) return 'Item';
        try {
          return (item as any)?.constructor?.name || 'all';
        } catch {
          return 'all';
        }
      }
    });
  }
}
