import { createActor } from 'xstate';
import { purchaseRequestMachine } from './purchase-request.machine';
import { PurchaseRequestState, UserRole, PurchaseRequestPriority } from '@prisma/client';

describe('Purchase Request State Machine', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    roles: [{ id: 'r1', userId: '1', role: UserRole.SOLICITANTE }],
    isActive: true,
  };
  const mockRequest = {
    id: '1',
    status: PurchaseRequestState.RASCUNHO,
    title: '',
    description: null,
    priority: PurchaseRequestPriority.NORMAL,
    totalAmount: 0,
    requesterId: '1',
  };

  const mockAbility = {
    can: jest.fn(),
  };

  const baseContext = {
    currentUser: mockUser,
    requestData: mockRequest,
    ability: mockAbility,
  };

  beforeEach(() => {
    mockAbility.can.mockReset();
  });

  it('should start in draft state', () => {
    const service = createActor(purchaseRequestMachine, { input: baseContext });
    service.start();
    expect(service.getSnapshot().value).toBe('draft');
  });

  describe('SUBMIT transition', () => {
    it('should transition from draft to pendingPurchase when user has permission', () => {
      mockAbility.can.mockReturnValue(true);
      const service = createActor(purchaseRequestMachine, { input: baseContext });
      service.start();
      service.send({
        type: 'SUBMIT',
      });
      expect(service.getSnapshot().value).toBe('pendingPurchase');
    });

    it('should not transition when user lacks permission', () => {
      mockAbility.can.mockReturnValue(false);
      const service = createActor(purchaseRequestMachine, { input: baseContext });
      service.start();
      service.send({
        type: 'SUBMIT',
      });
      expect(service.getSnapshot().value).toBe('draft');
    });
  });

  describe('APPROVE_PURCHASE transition', () => {
    it('should transition from pendingPurchase to pendingManagement when approved', () => {
      mockAbility.can.mockReturnValue(true);
      const service = createActor(purchaseRequestMachine, { input: baseContext });
      service.start();
      service.send({ type: 'SUBMIT' });
      service.send({
        type: 'APPROVE_PURCHASE',
      });
      expect(service.getSnapshot().value).toBe('pendingManagement');
    });
  });

  describe('APPROVE_MANAGEMENT transition', () => {
    it('should transition to approved when within approval limit', () => {
      mockAbility.can.mockReturnValue(true);
      const service = createActor(purchaseRequestMachine, { input: baseContext });
      service.start();
      service.send({ type: 'SUBMIT' });
      service.send({ type: 'APPROVE_PURCHASE' });
      service.send({
        type: 'APPROVE_MANAGEMENT',
      });
      expect(service.getSnapshot().value).toBe('approved');
    });

    it('should not transition when above approval limit', () => {
      mockAbility.can.mockReturnValue(true);
      const service = createActor(purchaseRequestMachine, { input: baseContext });
      service.start();
      service.send({ type: 'SUBMIT' });
      service.send({ type: 'APPROVE_PURCHASE' });
      service.send({
        type: 'APPROVE_MANAGEMENT',
      });
      expect(service.getSnapshot().value).toBe('pendingManagement');
    });
  });

  describe('REJECT transition', () => {
    it('should transition to rejected from any approval state', () => {
      mockAbility.can.mockReturnValue(true);
      const servicePendingPurchase = createActor(purchaseRequestMachine, { input: baseContext });
      servicePendingPurchase.start();
      servicePendingPurchase.send({ type: 'SUBMIT' });
      servicePendingPurchase.send({
        type: 'REJECT',
        notes: 'Rejected by purchase department',
        reason: 'Motivo de teste',
      });
      expect(servicePendingPurchase.getSnapshot().value).toBe('rejected');
      const servicePendingManagement = createActor(purchaseRequestMachine, { input: baseContext });
      servicePendingManagement.start();
      servicePendingManagement.send({ type: 'SUBMIT' });
      servicePendingManagement.send({ type: 'APPROVE_PURCHASE' });
      servicePendingManagement.send({
        type: 'REJECT',
        notes: 'Rejected by management',
        reason: 'Motivo de teste',
      });
      expect(servicePendingManagement.getSnapshot().value).toBe('rejected');
    });
  });
});
