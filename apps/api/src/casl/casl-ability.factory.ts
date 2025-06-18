import { Injectable, Logger } from '@nestjs/common';
import { Ability, AbilityBuilder, AbilityClass, ExtractSubjectType, InferSubjects } from '@casl/ability';
// Import Item as PrismaItem if it needs to be a CASL subject directly
import { User as PrismaUser, Role as PrismaRole, PurchaseRequest as PrismaPurchaseRequest, Project as PrismaProject, Item as PrismaItem } from '@prisma/client';

export interface UserWithRoles extends PrismaUser {
  roles: PrismaRole[];
}

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
  Submit = 'submit',
  ApproveLevel1 = 'approve_level_1',
  // ApproveLevel2 = 'approve_level_2', // Future
  Reject = 'reject',
}

// Add PrismaItem to Subjects if direct CASL rules apply to Item entities
export type Subjects = InferSubjects<typeof PrismaPurchaseRequest | typeof PrismaUser | typeof PrismaProject | typeof PrismaItem, true> | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  private readonly logger = new Logger(CaslAbilityFactory.name);

  createForUser(user: UserWithRoles | null) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(Ability as AbilityClass<AppAbility>);

    if (!user) {
      this.logger.debug('Construindo habilidades para usuário não autenticado/anônimo.');
      cannot(Action.Manage, 'all');
    } else {
      this.logger.debug(`Construindo habilidades para usuário: ${user.email} (ID: ${user.id}), Roles: ${user.roles?.map(r => r.name).join(', ') || 'N/A'}`);

      const userRoles = user.roles?.map(role => role.name) || [];

      if (userRoles.includes('ADMINISTRADOR')) {
        this.logger.log(`Usuário ${user.email} é ADMINISTRADOR. Concedendo todas as permissões.`);
        can(Action.Manage, 'all');
      } else { // Permissões para não-administradores
        can(Action.Read, PrismaUser, { id: user.id });
        can(Action.Update, PrismaUser, { id: user.id });

        if (userRoles.includes('SOLICITANTE')) {
          this.logger.log(`Usuário ${user.email} é SOLICITANTE.`);
          can(Action.Create, PrismaPurchaseRequest);
          can(Action.Read, PrismaPurchaseRequest, { requesterId: user.id });
          can(Action.Update, PrismaPurchaseRequest, { requesterId: user.id, status: 'RASCUNHO' });
          can(Action.Submit, PrismaPurchaseRequest, { requesterId: user.id, status: 'RASCUNHO' });
          // can(Action.Delete, PrismaPurchaseRequest, { requesterId: user.id, status: 'RASCUNHO' });
          // can(Action.Read, PrismaProject); // Example: Solicitante pode ler projetos
        }

        if (userRoles.includes('COMPRAS')) {
          this.logger.log(`Usuário ${user.email} é do setor de COMPRAS.`);
          can(Action.Read, PrismaPurchaseRequest);
          can(Action.ApproveLevel1, PrismaPurchaseRequest, { status: 'PENDENTE_COMPRAS' });
          can(Action.Reject, PrismaPurchaseRequest, { status: 'PENDENTE_COMPRAS' });
          // can(Action.Update, PrismaPurchaseRequest, { status: 'PENDENTE_COMPRAS' });
          // can(Action.Manage, PrismaProject); // Example
          // can(Action.Manage, PrismaItem); // Example
        }

        if (userRoles.includes('GERENCIA')) {
          this.logger.log(`Usuário ${user.email} é da GERENCIA.`);
          can(Action.Read, PrismaPurchaseRequest);
          can(Action.Read, PrismaProject);
          // can(Action.ApproveLevel2, PrismaPurchaseRequest, { status: 'PENDENTE_GERENCIA' });
          // can(Action.Reject, PrismaPurchaseRequest, { status: 'PENDENTE_GERENCIA' });
        }
      }
    }

    return build({
      detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
