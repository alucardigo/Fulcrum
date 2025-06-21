import { Injectable, Logger } from '@nestjs/common';
import { Ability, AbilityBuilder, AbilityClass, ExtractSubjectType, InferSubjects } from '@casl/ability';
import { Prisma } from '@prisma/client';

// Define os modelos base para o CASL
type Models = {
  User: any;
  PurchaseRequest: any;
  Project: any;
  Item: any;
};

// Enums necessários
export enum UserRole {
  SOLICITANTE = 'SOLICITANTE',
  COMPRAS = 'COMPRAS',
  GERENCIA = 'GERENCIA',
  ADMINISTRADOR = 'ADMINISTRADOR'
}

export enum PurchaseRequestState {
  RASCUNHO = 'RASCUNHO',
  PENDENTE_COMPRAS = 'PENDENTE_COMPRAS',
  PENDENTE_GERENCIA = 'PENDENTE_GERENCIA',
  APROVADO = 'APROVADO',
  REJEITADO = 'REJEITADO',
  COMPRADO = 'COMPRADO',
  ENTREGUE = 'ENTREGUE',
  CANCELADO = 'CANCELADO'
}

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
  Submit = 'submit',
  ApprovePurchase = 'approve_purchase',
  ApproveManagement = 'approve_management',
  Reject = 'reject',
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
      can(Action.ApprovePurchase, 'PurchaseRequest');
      can(Action.Reject, 'PurchaseRequest');
      can(Action.PlaceOrder, 'PurchaseRequest');
      can(Action.ReceiveItems, 'PurchaseRequest');
    }

    // Gerência pode aprovar requisições dentro do seu limite
    if (user.roles.some(r => r.role === UserRole.GERENCIA)) {
      can(Action.Read, 'PurchaseRequest');
      can(Action.ApproveManagement, 'PurchaseRequest');
      can(Action.Reject, 'PurchaseRequest');
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
