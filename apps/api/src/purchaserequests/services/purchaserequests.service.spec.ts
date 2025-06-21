import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseRequestsService } from './purchaserequests.service';
import { PrismaService } from '../../prisma.service';
import { CaslAbilityFactory, UserWithRoles, UserRole as CaslUserRole } from '../../casl/casl-ability.factory'; // Assuming Casl UserRole is distinct or aliased
import { createMockPrismaClient, MockPrismaClient } from '../../../test/prisma-mock.helper';
import { PurchaseRequestState, UserRole, PurchaseRequestPriority, PurchaseRequest, User, Item } from '@prisma/client';
import { CreatePurchaseRequestDto } from '../dto/create-purchase-request.dto';
import { TransitionPurchaseRequestDto, EventType } from '../dto/transition-purchase-request.dto';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library'; // Required for Decimal fields
import { interpret } from 'xstate';
import { purchaseRequestMachine } from '../../workflow/purchase-request.machine';


// Mock User helper (similar to one in users.controller.spec.ts, could be shared)
const mockAppUser = (id: string, roles: CaslUserRole[]): UserWithRoles => ({
  id,
  email: `${id}@example.com`,
  firstName: 'Mock',
  lastName: 'User',
  password: 'password',
  isActive: true,
  department: 'IT',
  costCenter: 'CC123',
  approvalLimit: new Decimal(1000),
  createdAt: new Date(),
  updatedAt: new Date(),
  roles: roles.map(role => ({ id: `role-${role}`, userId: id, role, createdAt: new Date(), updatedAt: new Date() })),
  // purchaseRequests: [], projectsOwned: [], requestHistories: [], approvedRequests: [] // satisfy Prisma.UserGetPayload
});

describe('PurchaseRequestsService', () => {
  let service: PurchaseRequestsService;
  let mockPrisma: MockPrismaClient;

  beforeEach(async () => {
    mockPrisma = createMockPrismaClient();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseRequestsService,
        { provide: PrismaService, useValue: mockPrisma },
        CaslAbilityFactory, // Provide real factory, service might not use it directly but good for consistency
        // ItemsService is injected but its methods are not called by create/transition in the provided service code.
        // If they were, it would need mocking. For now, an empty mock is fine.
        { provide: 'ItemsService', useValue: { createMany: jest.fn().mockResolvedValue([]) } },
      ],
    }).compile();

    service = module.get<PurchaseRequestsService>(PurchaseRequestsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a purchase request with initial status RASCUNHO', async () => {
      const userId = 'user-solicitante-id';
      const createDto: CreatePurchaseRequestDto = {
        title: 'New Test Request',
        description: 'A description for the test request',
        priority: PurchaseRequestPriority.MEDIA,
        items: [{ name: 'Test Item 1', quantity: 2, unitPrice: new Decimal(50.5) }],
        // Optional fields: projectId, costCenter, justification, expectedDeliveryDate
      };

      const mockCreatedPr: PurchaseRequest & { items: Item[] } = {
        id: 'new-pr-id',
        ...createDto,
        items: createDto.items.map((item, i) => ({
            ...item,
            id: `item-${i}`,
            totalPrice: item.unitPrice.mul(item.quantity),
            purchaseRequestId: 'new-pr-id',
            // fill other Item fields if necessary
            supplier: null, supplierCNPJ: null, url: null, category: null, deliveryStatus: null, receivedQuantity: 0, notes: null, createdAt: new Date(), updatedAt: new Date()
        })),
        status: PurchaseRequestState.RASCUNHO,
        requesterId: userId,
        totalAmount: new Decimal(101.0), // 2 * 50.5
        costCenter: null, // Assuming default or to be set by service logic
        projectId: null,
        justification: null,
        expectedDeliveryDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        approverId: null,
        rejectionReason: null,
        approvedAt: null,
        rejectedAt: null,
        orderedAt: null,
        deliveredAt: null,
      };

      mockPrisma.purchaseRequest.create.mockResolvedValue(mockCreatedPr as any);
      // If ItemsService.createMany is called within the same transaction or flow by PurchaseRequestsService.create
      // (The provided service code snippet for create does not show this, but it's common)
      // mockPrisma.item.createMany.mockResolvedValue({ count: createDto.items.length });
      // Or if ItemsService is used:
      // itemsServiceMock.createMany.mockResolvedValue(mockCreatedPr.items as any);


      const result = await service.create(createDto, userId);

      expect(mockPrisma.purchaseRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: createDto.title,
            requesterId: userId,
            status: PurchaseRequestState.RASCUNHO,
            totalAmount: new Decimal(101.0), // Ensure this is calculated correctly
            // items: { createMany: { data: createDto.items } } // If using nested create for items
          }),
          include: service['includeOptions'], // Accessing private property for test, better to check result structure
        }),
      );
      expect(result.status).toBe(PurchaseRequestState.RASCUNHO);
      expect(result.title).toBe(createDto.title);
      expect(result.totalAmount.toNumber()).toBe(101.0); // Check Decimal value
    });
  });

  describe('transitionState', () => {
    const requestId = 'pr-to-transition';
    const mockUser = mockAppUser('user-test-id', [CaslUserRole.SOLICITANTE]);

    const baseMockPr: PurchaseRequest = {
      id: requestId,
      title: 'Transition Test PR',
      description: 'Test',
      status: PurchaseRequestState.RASCUNHO, // Initial state for most tests
      priority: PurchaseRequestPriority.NORMAL,
      totalAmount: new Decimal(100),
      requesterId: mockUser.id,
      projectId: null, costCenter: null, justification: null, expectedDeliveryDate: null,
      createdAt: new Date(), updatedAt: new Date(), approverId: null, rejectionReason: null,
      approvedAt: null, rejectedAt: null, orderedAt: null, deliveredAt: null,
    };

    it('should transition from RASCUNHO to PENDENTE_COMPRAS on SUBMIT event', async () => {
      const transitionDto: TransitionPurchaseRequestDto = { eventType: EventType.SUBMIT };
      const mockPrRascunho = { ...baseMockPr, status: PurchaseRequestState.RASCUNHO, items: [], histories: [] };
      const mockPrUpdated = { ...mockPrRascunho, status: PurchaseRequestState.PENDENTE_COMPRAS, updatedAt: new Date() };

      mockPrisma.purchaseRequest.findUniqueOrThrow.mockResolvedValue(mockPrRascunho as any);
      mockPrisma.purchaseRequest.update.mockResolvedValue(mockPrUpdated as any);
      mockPrisma.requestHistory.create.mockResolvedValue({} as any); // Mock history creation

      const result = await service.transitionState(requestId, transitionDto, mockUser);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.purchaseRequest.findUniqueOrThrow).toHaveBeenCalledWith({ where: { id: requestId }, include: service['includeOptions'] });
      expect(mockPrisma.purchaseRequest.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: requestId },
        data: expect.objectContaining({ status: PurchaseRequestState.PENDENTE_COMPRAS }),
      }));
      expect(mockPrisma.requestHistory.create).toHaveBeenCalled();
      expect(result.status).toBe(PurchaseRequestState.PENDENTE_COMPRAS);
    });

    it('should throw ForbiddenException for an invalid transition (e.g., SUBMIT on APPROVED PR)', async () => {
      const transitionDto: TransitionPurchaseRequestDto = { eventType: EventType.SUBMIT };
      const mockPrApproved = { ...baseMockPr, status: PurchaseRequestState.APROVADA, items: [], histories: [] };

      mockPrisma.purchaseRequest.findUniqueOrThrow.mockResolvedValue(mockPrApproved as any);

      // The XState machine should prevent this transition
      await expect(service.transitionState(requestId, transitionDto, mockUser))
        .rejects.toThrow(ForbiddenException); // Or BadRequestException depending on how service handles invalid machine transitions

      expect(mockPrisma.purchaseRequest.update).not.toHaveBeenCalled();
    });

    it('should handle REJECT event with rejectionReason', async () => {
      const transitionDto: TransitionPurchaseRequestDto = {
        eventType: EventType.REJECT,
        payload: { rejectionReason: 'Budget exceeded' }
      };
      const mockPrPendingCompras = { ...baseMockPr, status: PurchaseRequestState.PENDENTE_COMPRAS, items: [], histories: [] };
      const mockPrRejected = { ...mockPrPendingCompras, status: PurchaseRequestState.REJEITADA, rejectionReason: 'Budget exceeded', updatedAt: new Date() };

      mockPrisma.purchaseRequest.findUniqueOrThrow.mockResolvedValue(mockPrPendingCompras as any);
      mockPrisma.purchaseRequest.update.mockResolvedValue(mockPrRejected as any);
      mockPrisma.requestHistory.create.mockResolvedValue({} as any);

      const result = await service.transitionState(requestId, transitionDto, mockUser);

      expect(mockPrisma.purchaseRequest.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          status: PurchaseRequestState.REJEITADA,
          rejectionReason: 'Budget exceeded',
        }),
      }));
      expect(mockPrisma.requestHistory.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          actionType: `EVENT_${EventType.REJECT}`,
          rejectionReason: 'Budget exceeded',
          newState: PurchaseRequestState.REJEITADA,
        })
      }));
      expect(result.status).toBe(PurchaseRequestState.REJEITADA);
      expect(result.rejectionReason).toBe('Budget exceeded');
    });

    it('should throw NotFoundException if purchase request not found during transition', async () => {
      const transitionDto: TransitionPurchaseRequestDto = { eventType: EventType.SUBMIT };
      mockPrisma.purchaseRequest.findUniqueOrThrow.mockRejectedValue(new Error('Record not found')); // Simulate Prisma's behavior for not found

      await expect(service.transitionState('non-existent-id', transitionDto, mockUser))
        .rejects.toThrow(NotFoundException);
    });
  });

  // Add more tests for other methods like findAll, findOne, update, delete as needed,
  // following the same pattern of using mockPrisma.
});
