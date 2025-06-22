import { purchaseRequestMachine, PurchaseRequestContext } from './purchase-request.machine';
import { PurchaseRequestState, UserRole, User as PrismaUser, PurchaseRequest as PrismaPurchaseRequest, PurchaseRequestPriority } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { Action, AppAbility, UserWithRoles } from '../casl/casl-ability.factory';

// Não vamos mockar xstate ou createActor aqui, vamos testar a máquina diretamente.

describe('Purchase Request State Machine Logic', () => {
  let mockAbility: AppAbility;
  let baseMockUser: UserWithRoles; // Usará a estrutura UserWithRoles
  let baseMockRequest: PrismaPurchaseRequest;
  let baseTestContext: PurchaseRequestContext;

  beforeEach(() => {
    // Mock da Ability simples para controle nos testes
    mockAbility = {
      can: jest.fn(),
      cannot: jest.fn(),
      // Adicionar outros métodos de AppAbility se a máquina os usar diretamente,
      // mas geralmente apenas 'can' é usado nas guardas.
    } as unknown as AppAbility;

    baseMockUser = {
      id: 'user1',
      email: 'test@example.com',
      // A estrutura de roles precisa ser compatível com UserWithRoles (Prisma.UserGetPayload<{ include: { roles: true } }>)
      // Onde 'roles' é UserRoleAssignment[]
      roles: [
        { id: 'ura1', userId: 'user1', role: UserRole.SOLICITANTE, createdAt: new Date(), updatedAt: new Date() }
      ],
      isActive: true,
      approvalLimit: new Decimal(1000),
      // Completar outros campos de PrismaUser para UserWithRoles
      password: 'password',
      firstName: 'Test',
      lastName: 'User',
      department: 'IT',
      costCenter: 'CC1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    baseMockRequest = {
      id: 'req1',
      status: PurchaseRequestState.RASCUNHO,
      title: 'Test Request',
      description: 'A test request',
      priority: PurchaseRequestPriority.NORMAL,
      totalAmount: new Decimal(100),
      requesterId: baseMockUser.id,
      notes: null,
      rejectionReason: null,
      approvedAt: null,
      rejectedAt: null,
      orderedAt: null,
      deliveredAt: null,
      expectedDeliveryDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      costCenter: 'CC1',
      justification: 'Test Justification',
      approverId: null,
      projectId: null,
      // items e histories são relações e não fazem parte do tipo base PrismaPurchaseRequest
      // Removido: items: [],
      // Removido: histories: [],
    };

    baseTestContext = {
      currentUser: baseMockUser,
      requestData: baseMockRequest,
      ability: mockAbility,
      errorMessage: undefined,
      notes: undefined,
    };
  });

  it('should start in RASCUNHO state by default (according to machine definition)', () => {
    const initialMachineState = purchaseRequestMachine.resolveState({value: PurchaseRequestState.RASCUNHO, context: baseTestContext});
    expect(initialMachineState.value).toBe(PurchaseRequestState.RASCUNHO);
  });

  describe('SUBMIT event', () => {
    it('should transition from RASCUNHO to PENDENTE_COMPRAS if canSubmit guard passes', () => {
      (mockAbility.can as jest.Mock).mockReturnValue(true);
      const currentState = purchaseRequestMachine.resolveState({ value: PurchaseRequestState.RASCUNHO, context: baseTestContext });
      // Não passar o terceiro argumento (context) para machine.transition se a guarda usa o contexto do 'currentState'
      const nextState = purchaseRequestMachine.transition(currentState, { type: 'SUBMIT' });

      expect(mockAbility.can).toHaveBeenCalledWith(Action.Submit, baseTestContext.requestData);
      expect(nextState.value).toBe(PurchaseRequestState.PENDENTE_COMPRAS);
      // Verificar 'changed' comparando os valores dos estados
      expect(nextState.value !== currentState.value).toBe(true);
    });

    it('should NOT transition from RASCUNHO if canSubmit guard fails', () => {
      (mockAbility.can as jest.Mock).mockReturnValue(false);
      const currentState = purchaseRequestMachine.resolveState({ value: PurchaseRequestState.RASCUNHO, context: baseTestContext });
      const nextState = purchaseRequestMachine.transition(currentState, { type: 'SUBMIT' });

      expect(mockAbility.can).toHaveBeenCalledWith(Action.Submit, baseTestContext.requestData);
      expect(nextState.value).toBe(PurchaseRequestState.RASCUNHO);
      expect(nextState.value === currentState.value).toBe(true); // ou nextState.changed === false se a API permitir
    });
  });

  describe('APPROVE_PURCHASE event', () => {
    it('should transition from PENDENTE_COMPRAS to PENDENTE_GERENCIA if canApprovePurchase guard passes', () => {
      baseTestContext.requestData!.status = PurchaseRequestState.PENDENTE_COMPRAS;
      (mockAbility.can as jest.Mock).mockReturnValue(true);
      const currentState = purchaseRequestMachine.resolveState({ value: PurchaseRequestState.PENDENTE_COMPRAS, context: baseTestContext });
      const nextState = purchaseRequestMachine.transition(currentState, { type: 'APPROVE_PURCHASE' });

      expect(mockAbility.can).toHaveBeenCalledWith(Action.ApprovePurchase, baseTestContext.requestData);
      expect(nextState.value).toBe(PurchaseRequestState.PENDENTE_GERENCIA);
      expect(nextState.value !== currentState.value).toBe(true);
    });
  });

  describe('APPROVE_LEVEL_2 event', () => {
    beforeEach(() => {
      baseTestContext.currentUser!.roles = [{ id: 'uraGerencia', userId: 'user1', role: UserRole.GERENCIA, createdAt: new Date(), updatedAt: new Date() }];
      baseTestContext.requestData!.status = PurchaseRequestState.PENDENTE_GERENCIA;
    });

    it('should transition from PENDENTE_GERENCIA to APROVADO if canApproveLevel2 guard passes', () => {
      (mockAbility.can as jest.Mock).mockReturnValue(true);
      const currentState = purchaseRequestMachine.resolveState({ value: PurchaseRequestState.PENDENTE_GERENCIA, context: baseTestContext });
      const nextState = purchaseRequestMachine.transition(currentState, { type: 'APPROVE_LEVEL_2' });

      expect(mockAbility.can).toHaveBeenCalledWith(Action.ApproveLevel2, baseTestContext.requestData);
      expect(nextState.value).toBe(PurchaseRequestState.APROVADO);
      expect(nextState.value !== currentState.value).toBe(true);
    });
  });

  describe('EXECUTE event', () => {
    beforeEach(() => {
      baseTestContext.currentUser!.roles = [{ id: 'uraCompras', userId: 'user1', role: UserRole.COMPRAS, createdAt: new Date(), updatedAt: new Date() }];
      baseTestContext.requestData!.status = PurchaseRequestState.APROVADO;
    });

    it('should transition from APROVADO to CONCLUIDO if canExecute guard passes', () => {
      (mockAbility.can as jest.Mock).mockReturnValue(true);
      const currentState = purchaseRequestMachine.resolveState({ value: PurchaseRequestState.APROVADO, context: baseTestContext });
      const nextState = purchaseRequestMachine.transition(currentState, { type: 'EXECUTE' });

      expect(mockAbility.can).toHaveBeenCalledWith(Action.Execute, baseTestContext.requestData);
      expect(nextState.value).toBe(PurchaseRequestState.CONCLUIDO);
      expect(nextState.value !== currentState.value).toBe(true);
    });
  });

  describe('REJECT event', () => {
    it('should transition from PENDENTE_COMPRAS to REJEITADO if canReject guard passes', () => {
      baseTestContext.requestData!.status = PurchaseRequestState.PENDENTE_COMPRAS;
      (mockAbility.can as jest.Mock).mockReturnValue(true);
      const currentState = purchaseRequestMachine.resolveState({ value: PurchaseRequestState.PENDENTE_COMPRAS, context: baseTestContext });
      const nextState = purchaseRequestMachine.transition(currentState, { type: 'REJECT', reason: 'Test' });

      expect(mockAbility.can).toHaveBeenCalledWith(Action.Reject, baseTestContext.requestData);
      expect(nextState.value).toBe(PurchaseRequestState.REJEITADO);
      expect(nextState.value !== currentState.value).toBe(true);
    });

    it('should transition from PENDENTE_GERENCIA to REJEITADO if canReject guard passes', () => {
      baseTestContext.currentUser!.roles = [{ id: 'uraGerencia', userId: 'user1', role: UserRole.GERENCIA, createdAt: new Date(), updatedAt: new Date() }];
      baseTestContext.requestData!.status = PurchaseRequestState.PENDENTE_GERENCIA;
      (mockAbility.can as jest.Mock).mockReturnValue(true);
      const currentState = purchaseRequestMachine.resolveState({ value: PurchaseRequestState.PENDENTE_GERENCIA, context: baseTestContext });
      const nextState = purchaseRequestMachine.transition(currentState, { type: 'REJECT', reason: 'Test' });

      expect(mockAbility.can).toHaveBeenCalledWith(Action.Reject, baseTestContext.requestData);
      expect(nextState.value).toBe(PurchaseRequestState.REJEITADO);
      expect(nextState.value !== currentState.value).toBe(true);
    });
  });

  describe('APPROVE_MANAGEMENT event (with limit check)', () => {
    beforeEach(() => {
      baseTestContext.currentUser!.roles = [{ id: 'uraGerencia', userId: 'user1', role: UserRole.GERENCIA, createdAt: new Date(), updatedAt: new Date() }];
      baseTestContext.currentUser!.approvalLimit = new Decimal(1000);
      baseTestContext.requestData!.status = PurchaseRequestState.PENDENTE_GERENCIA;
    });

    it('should transition to APROVADO if amount is within limit and canApproveManagement guard passes', () => {
      baseTestContext.requestData!.totalAmount = new Decimal(500);
      (mockAbility.can as jest.Mock).mockReturnValue(true);
      const currentState = purchaseRequestMachine.resolveState({ value: PurchaseRequestState.PENDENTE_GERENCIA, context: baseTestContext });
      const nextState = purchaseRequestMachine.transition(currentState, { type: 'APPROVE_MANAGEMENT' });

      expect(mockAbility.can).toHaveBeenCalledWith(Action.ApproveManagement, baseTestContext.requestData);
      expect(nextState.value).toBe(PurchaseRequestState.APROVADO);
      expect(nextState.value !== currentState.value).toBe(true);
    });

    it('should NOT transition if amount is above limit (extraCheck in guard fails)', () => {
      baseTestContext.requestData!.totalAmount = new Decimal(1500);
      (mockAbility.can as jest.Mock).mockReturnValue(true);
      const currentState = purchaseRequestMachine.resolveState({ value: PurchaseRequestState.PENDENTE_GERENCIA, context: baseTestContext });
      const nextState = purchaseRequestMachine.transition(currentState, { type: 'APPROVE_MANAGEMENT' });

      expect(mockAbility.can).toHaveBeenCalledWith(Action.ApproveManagement, baseTestContext.requestData);
      expect(nextState.value).toBe(PurchaseRequestState.PENDENTE_GERENCIA);
      expect(nextState.value === currentState.value).toBe(true);
    });
  });
});
