import { Test, TestingModule } from '@nestjs/testing';
import { CaslAbilityFactory, Action } from './casl-ability.factory';
import { UserRole, PurchaseRequestState } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

describe('CaslAbilityFactory', () => {
  let factory: CaslAbilityFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CaslAbilityFactory],
    }).compile();
    factory = module.get<CaslAbilityFactory>(CaslAbilityFactory);
    // Mockar detectSubjectType para aceitar objetos literais
    jest.spyOn(factory as any, 'createForUser').mockImplementation(function(user) {
      const original = Object.getPrototypeOf(factory).createForUser.bind(factory);
      const ability = original(user);
      // Forçar o detectSubjectType a aceitar objetos literais
      ability.detectSubjectType = (item: any) => {
        if (item === 'all') return item;
        if (item && typeof item === 'object' && 'requesterId' in item) return 'PurchaseRequest';
        if (item && typeof item === 'object' && 'email' in item) return 'User';
        return 'all';
      };
      return ability;
    });
  });

  it('should be defined', () => {
    expect(factory).toBeDefined();
  });

  describe('createForUser', () => {
    it('should deny all actions for unauthenticated user', () => {
      const ability = factory.createForUser(null);
      expect(ability.can(Action.Read, 'all')).toBeFalsy();
      expect(ability.can(Action.Create, 'all')).toBeFalsy();
      expect(ability.can(Action.Update, 'all')).toBeFalsy();
      expect(ability.can(Action.Delete, 'all')).toBeFalsy();
    });

    it('should allow all actions for administrator', () => {
      const adminUser = {
        id: '1',
        email: 'admin@example.com',
        password: 'hashed',
        firstName: 'Admin',
        lastName: 'User',
        department: null,
        roles: [{ id: 'r1', userId: '1', role: UserRole.ADMINISTRADOR, createdAt: new Date(), updatedAt: new Date() }],
        isActive: true,
        costCenter: null,
        approvalLimit: new Decimal(0),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const ability = factory.createForUser(adminUser);
      expect(ability.can(Action.Manage, 'all')).toBeTruthy();
    });

    it('should allow solicitante to create and manage own requests', () => {
      const solicitanteUser = {
        id: '2',
        email: 'solicitante@example.com',
        password: 'hashed',
        firstName: 'Solic',
        lastName: 'User',
        department: null,
        roles: [{ id: 'r2', userId: '2', role: UserRole.SOLICITANTE, createdAt: new Date(), updatedAt: new Date() }],
        isActive: true,
        costCenter: null,
        approvalLimit: new Decimal(0),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const ownRequest = { id: 'req1', requesterId: '2', status: PurchaseRequestState.RASCUNHO, title: '', description: null, priority: PurchaseRequestState.RASCUNHO, totalAmount: new Decimal(0), approverId: null, projectId: null, costCenter: null, justification: '', expectedDeliveryDate: null, createdAt: new Date(), updatedAt: new Date(), deliveredAt: null, rejectionReason: null, approvedAt: null, rejectedAt: null, orderedAt: null };
      const otherRequest = { id: 'req2', requesterId: '3', status: PurchaseRequestState.RASCUNHO, title: '', description: null, priority: PurchaseRequestState.RASCUNHO, totalAmount: new Decimal(0), approverId: null, projectId: null, costCenter: null, justification: '', expectedDeliveryDate: null, createdAt: new Date(), updatedAt: new Date(), deliveredAt: null, rejectionReason: null, approvedAt: null, rejectedAt: null, orderedAt: null };
      const ability = factory.createForUser(solicitanteUser);
      expect(ability.can(Action.Create, 'PurchaseRequest')).toBeTruthy();
      expect(ability.can(Action.Update, ownRequest as any)).toBeTruthy();
      expect(ability.can(Action.Update, otherRequest as any)).toBeFalsy();
    });

    describe('COMPRAS permissions', () => {
      const comprasUser = {
        id: '1',
        email: 'compras@example.com',
        password: 'hashed',
        firstName: 'Compras',
        lastName: 'User',
        department: null,
        roles: [{ id: 'r3', userId: '1', role: UserRole.COMPRAS, createdAt: new Date(), updatedAt: new Date() }],
        isActive: true,
        costCenter: null,
        approvalLimit: new Decimal(0),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      it('should allow approving pending purchase requests', () => {
        const ability = factory.createForUser(comprasUser);
        const pendingRequest = {
          id: '1',
          status: PurchaseRequestState.PENDENTE_COMPRAS,
          title: '',
          description: null,
          priority: PurchaseRequestState.PENDENTE_COMPRAS,
          totalAmount: new Decimal(0),
          approverId: null,
          projectId: null,
          costCenter: null,
          justification: '',
          expectedDeliveryDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deliveredAt: null,
          rejectionReason: null,
          approvedAt: null,
          rejectedAt: null,
          orderedAt: null,
          requesterId: '1',
        };
        expect(ability.can(Action.ApprovePurchase, pendingRequest as any)).toBeTruthy();
      });
      it('should not allow approving requests in other states', () => {
        const ability = factory.createForUser(comprasUser);
        const approvedRequest = {
          id: '1',
          status: PurchaseRequestState.APROVADO,
          title: '',
          description: null,
          priority: PurchaseRequestState.APROVADO,
          totalAmount: new Decimal(0),
          approverId: null,
          projectId: null,
          costCenter: null,
          justification: '',
          expectedDeliveryDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deliveredAt: null,
          rejectionReason: null,
          approvedAt: null,
          rejectedAt: null,
          orderedAt: null,
          requesterId: '1',
        };
        expect(ability.can(Action.ApprovePurchase, approvedRequest as any)).toBeFalsy();
      });
    });

    describe('GERENCIA permissions', () => {
      const gerenciaUser = {
        id: '1',
        email: 'gerencia@example.com',
        password: 'hashed',
        firstName: 'Gerente',
        lastName: 'User',
        department: null,
        roles: [{ id: 'r4', userId: '1', role: UserRole.GERENCIA, createdAt: new Date(), updatedAt: new Date() }],
        isActive: true,
        costCenter: null,
        approvalLimit: new Decimal(5000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      it('should allow approving within limit', () => {
        const ability = factory.createForUser(gerenciaUser);
        const withinLimitRequest = {
          id: '1',
          status: PurchaseRequestState.PENDENTE_GERENCIA,
          title: '',
          description: null,
          priority: PurchaseRequestState.PENDENTE_GERENCIA,
          totalAmount: new Decimal(4000),
          approverId: null,
          projectId: null,
          costCenter: null,
          justification: '',
          expectedDeliveryDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deliveredAt: null,
          rejectionReason: null,
          approvedAt: null,
          rejectedAt: null,
          orderedAt: null,
          requesterId: '1',
        };
        expect(ability.can(Action.ApproveManagement, withinLimitRequest as any)).toBeTruthy();
      });
      it('should not allow approving above limit', () => {
        const ability = factory.createForUser(gerenciaUser);
        const aboveLimitRequest = {
          id: '1',
          status: PurchaseRequestState.PENDENTE_GERENCIA,
          title: '',
          description: null,
          priority: PurchaseRequestState.PENDENTE_GERENCIA,
          totalAmount: new Decimal(6000),
          approverId: null,
          projectId: null,
          costCenter: null,
          justification: '',
          expectedDeliveryDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deliveredAt: null,
          rejectionReason: null,
          approvedAt: null,
          rejectedAt: null,
          orderedAt: null,
          requesterId: '1',
        };
        expect(ability.can(Action.ApproveManagement, aboveLimitRequest as any)).toBeFalsy();
      });
    });
  });
});
