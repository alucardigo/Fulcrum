import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseRequestsService } from './purchaserequests.service';
import { PrismaService } from '../../prisma.service';
import { CaslAbilityFactory } from '../../casl/casl-ability.factory';
import { purchaseRequestMachine } from '../../workflow/purchase-request.machine';
import { PurchaseRequestState, UserRole, PurchaseRequestPriority } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

describe('PurchaseRequestsService', () => {
  let service: PurchaseRequestsService;
  let prisma: PrismaService;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    password: 'hashed',
    firstName: 'Test',
    lastName: 'User',
    department: null,
    roles: [{ id: 'r1', userId: '1', role: UserRole.SOLICITANTE, createdAt: new Date(), updatedAt: new Date() }],
    isActive: true,
    costCenter: 'TI',
    approvalLimit: new Decimal(5000.00),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseRequestsService,
        {
          provide: PrismaService,
          useValue: {
            purchaseRequest: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            $transaction: jest.fn((callback) => callback()),
          },
        },
        CaslAbilityFactory,
        {
          provide: 'ItemsService',
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<PurchaseRequestsService>(PurchaseRequestsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('createPurchaseRequest', () => {
    it('should create a purchase request in RASCUNHO status', async () => {
      const createDto = {
        title: 'Test Request',
        description: 'Test Description',
        priority: PurchaseRequestPriority.NORMAL,
        justification: 'Justificativa de teste',
        items: [
          {
            name: 'Item 1',
            quantity: 1,
            unitPrice: 100.00,
          },
        ],
      };
      const expectedResult = {
        id: '1',
        ...createDto,
        status: PurchaseRequestState.RASCUNHO,
        requesterId: mockUser.id,
        costCenter: 'TI',
        projectId: null,
        totalAmount: new Decimal(100.00),
        createdAt: new Date(),
        updatedAt: new Date(),
        approverId: null,
        justification: 'Justificativa de teste',
        expectedDeliveryDate: null,
        deliveredAt: null,
        items: [],
        requester: mockUser,
        project: null,
        histories: [],
        rejectionReason: null,
        approvedAt: null,
        rejectedAt: null,
        orderedAt: null,
      };
      jest.spyOn(prisma.purchaseRequest, 'create').mockResolvedValue(expectedResult);
      const result = await service.create(createDto, mockUser.id);
      expect(result).toEqual(expectedResult);
      expect(prisma.purchaseRequest.create).toHaveBeenCalledWith(expect.any(Object));
    });
  });
});
