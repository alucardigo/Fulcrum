import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseRequestsService } from './purchaserequests.service';
import { PrismaService } from '../../prisma.service';
import { createActor } from 'xstate';
import { ItemsService } from '../../items/services/items.service';
import { CaslAbilityFactory, UserWithRoles, UserRole as CaslUserRole } from '../../casl/casl-ability.factory';
import { createMockPrismaClient, MockPrismaClient } from '../../../test/prisma-mock.helper';
import { PurchaseRequestState, UserRole, PurchaseRequestPriority, PurchaseRequest, User, Item } from '@prisma/client';
import { CreatePurchaseRequestDto } from '../dto/create-purchase-request.dto';
import { TransitionPurchaseRequestDto, EventType } from '../dto/transition-purchase-request.dto';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { purchaseRequestMachine } from '../../workflow/purchase-request.machine';

// Mock User helper unificado
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
});

// Mock global do xstate, mantido da sua branch por ser uma abordagem limpa.
const mockActorGlobal = {
  start: jest.fn(),
  stop: jest.fn(),
  getSnapshot: jest.fn(),
  send: jest.fn(),
  // Adicionar um mock para 'on' se o seu código o utilizar para escutar eventos do ator
  on: jest.fn(() => ({ unsubscribe: jest.fn() })),
};
jest.mock('xstate', () => {
  const originalXState = jest.requireActual('xstate');
  return {
   ...originalXState,
    createActor: jest.fn(() => mockActorGlobal),
  };
});

describe('PurchaseRequestsService', () => {
  let service: PurchaseRequestsService;
  let mockPrisma: MockPrismaClient;
  let caslAbilityFactory: CaslAbilityFactory;

  // Mock da CaslAbilityFactory
  const mockAbility = {
    can: jest.fn(),
    cannot: jest.fn(),
  };

  beforeEach(async () => {
    // Usando o helper da 'main' para um setup mais limpo
    mockPrisma = createMockPrismaClient();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseRequestsService,
        { provide: PrismaService, useValue: mockPrisma },
        {
          provide: CaslAbilityFactory,
          useValue: {
            createForUser: jest.fn(() => mockAbility),
          },
        },
        {
          provide: ItemsService,
          useValue: {
            calculateTotalAmount: jest.fn().mockResolvedValue(new Decimal(101.0)),
          },
        },
      ],
    }).compile();

    service = module.get<PurchaseRequestsService>(PurchaseRequestsService);
    caslAbilityFactory = module.get<CaslAbilityFactory>(CaslAbilityFactory);

    // Resetar todos os mocks antes de cada teste
    jest.clearAllMocks();
    (createActor as jest.Mock).mockReturnValue(mockActorGlobal);
  });

  describe('create', () => {
    it('should create a purchase request with initial status RASCUNHO', async () => {
      const userId = 'user-solicitante-id';
      const createDto: CreatePurchaseRequestDto = {
        title: 'New Test Request',
        description: 'A description for the test request',
        priority: PurchaseRequestPriority.NORMAL,
        items: [{ name: 'Test Item', quantity: 2, unitPrice: 50.5 }],
        costCenter: 'CC_Create',
        justification: 'Justificativa de teste Create',
      };

      const totalAmount = new Decimal(101.0); // 2 * 50.5
      const createdPrId = 'new-pr-id';

      const mockCreatedPr: any = {
        id: createdPrId,
       ...createDto,
        totalAmount,
        status: PurchaseRequestState.RASCUNHO,
        requesterId: userId,
        items: [],
        histories: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Simular a transação do Prisma
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const prismaTransactionClient = {
          purchaseRequest: {
            create: jest.fn().mockResolvedValue({ id: createdPrId, totalAmount }),
            findUniqueOrThrow: jest.fn().mockResolvedValue(mockCreatedPr),
          },
          item: {
            create: jest.fn().mockResolvedValue({ id: 'item-1' }),
          },
          requestHistory: {
            create: jest.fn(),
          },
        };
        return await callback(prismaTransactionClient);
      });

      const result = await service.create(createDto, userId);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      const transactionCallback = mockPrisma.$transaction.mock.calls[0][0];
      const mockTxClient = {
        purchaseRequest: {
          create: jest.fn().mockResolvedValue({ id: createdPrId, totalAmount }),
          findUniqueOrThrow: jest.fn().mockResolvedValue(mockCreatedPr),
        },
        item: { create: jest.fn() },
        requestHistory: { create: jest.fn() },
      };
      await transactionCallback(mockTxClient);

      expect(mockTxClient.purchaseRequest.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: createDto.title,
          totalAmount,
          status: PurchaseRequestState.RASCUNHO,
          requester: { connect: { id: userId } },
        }),
      });
      expect(mockTxClient.item.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCreatedPr);
    });
  });

  // Testes de transição adaptados da sua branch para a nova API da 'main'
  describe('transition', () => {
    const requestId = 'pr-to-transition';
    const solicitante = mockAppUser('user-solicitante-id', [CaslUserRole.SOLICITANTE]);
    const gerente = mockAppUser('user-gerente-id', [CaslUserRole.GERENCIA]);
    const compras = mockAppUser('user-compras-id', [CaslUserRole.COMPRAS]);

    const baseMockPr: any = {
      id: requestId,
      title: 'Transition Test PR',
      status: PurchaseRequestState.RASCUNHO,
      totalAmount: new Decimal(100),
      requesterId: solicitante.id,
      items: [],
      histories: [],
    };

    // Função helper para simular a máquina de estado
    const setupMachineMock = (currentState: any, nextState: any) => {
      mockActorGlobal.getSnapshot.mockReturnValueOnce({ value: currentState }).mockReturnValueOnce({ value: nextState });
    };

    beforeEach(() => {
      // Configuração padrão para a transação nos testes de transição
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const prismaTransactionClient = {
          purchaseRequest: {
            update: mockPrisma.purchaseRequest.update,
          },
          requestHistory: {
            create: mockPrisma.requestHistory.create,
          },
        };
        return await callback(prismaTransactionClient);
      });
    });

    it('should transition from RASCUNHO to PENDENTE_COMPRAS on SUBMIT event', async () => {
      const transitionDto: TransitionPurchaseRequestDto = { eventType: EventType.SUBMIT };
      const mockPrRascunho = {...baseMockPr, status: PurchaseRequestState.RASCUNHO };
      const mockPrUpdated = {...mockPrRascunho, status: PurchaseRequestState.PENDENTE_COMPRAS };

      mockPrisma.purchaseRequest.findUniqueOrThrow.mockResolvedValue(mockPrRascunho);
      mockPrisma.purchaseRequest.update.mockResolvedValue(mockPrUpdated);
      mockAbility.can.mockReturnValue(true); // O solicitante pode submeter
      setupMachineMock(PurchaseRequestState.RASCUNHO, PurchaseRequestState.PENDENTE_COMPRAS);

      const result = await service.transition(requestId, transitionDto, solicitante);

      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(solicitante);
      expect(mockAbility.can).toHaveBeenCalled();
      expect(mockPrisma.purchaseRequest.update).toHaveBeenCalledWith(expect.objectContaining({
        data: { status: PurchaseRequestState.PENDENTE_COMPRAS },
      }));
      expect(mockPrisma.requestHistory.create).toHaveBeenCalled();
      expect(result.status).toBe(PurchaseRequestState.PENDENTE_COMPRAS);
    });

    it('should transition from PENDENTE_GERENCIA to APROVADA on APPROVE event by GERENCIA', async () => {
      const transitionDto: TransitionPurchaseRequestDto = { eventType: EventType.APPROVE };
      const mockPrPendenteGerencia = {...baseMockPr, status: PurchaseRequestState.PENDENTE_GERENCIA };
      const mockPrAprovada = {...mockPrPendenteGerencia, status: PurchaseRequestState.APROVADA, approvedAt: new Date() };

      mockPrisma.purchaseRequest.findUniqueOrThrow.mockResolvedValue(mockPrPendenteGerencia);
      mockPrisma.purchaseRequest.update.mockResolvedValue(mockPrAprovada);
      mockAbility.can.mockReturnValue(true); // O gerente pode aprovar
      setupMachineMock(PurchaseRequestState.PENDENTE_GERENCIA, PurchaseRequestState.APROVADA);

      const result = await service.transition(requestId, transitionDto, gerente);

      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(gerente);
      expect(mockPrisma.purchaseRequest.update).toHaveBeenCalledWith(expect.objectContaining({
        data: { status: PurchaseRequestState.APROVADA, approvedAt: expect.any(Date), approver: { connect: { id: gerente.id } } },
      }));
      expect(result.status).toBe(PurchaseRequestState.APROVADA);
    });

    it('should handle REJECT event with rejectionReason', async () => {
      const rejectionReason = 'Budget exceeded';
      const transitionDto: TransitionPurchaseRequestDto = {
        eventType: EventType.REJECT,
        payload: { rejectionReason },
      };
      const mockPrPendente = {...baseMockPr, status: PurchaseRequestState.PENDENTE_COMPRAS };
      const mockPrRejeitada = {...mockPrPendente, status: PurchaseRequestState.REJEITADA, rejectionReason };

      mockPrisma.purchaseRequest.findUniqueOrThrow.mockResolvedValue(mockPrPendente);
      mockPrisma.purchaseRequest.update.mockResolvedValue(mockPrRejeitada);
      mockAbility.can.mockReturnValue(true);
      setupMachineMock(PurchaseRequestState.PENDENTE_COMPRAS, PurchaseRequestState.REJEITADA);

      const result = await service.transition(requestId, transitionDto, gerente);

      expect(mockPrisma.purchaseRequest.update).toHaveBeenCalledWith(expect.objectContaining({
        data: {
          status: PurchaseRequestState.REJEITADA,
          rejectionReason,
          rejectedAt: expect.any(Date),
        },
      }));
      expect(mockPrisma.requestHistory.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          rejectionReason,
        }),
      }));
      expect(result.status).toBe(PurchaseRequestState.REJEITADA);
      expect(result.rejectionReason).toBe(rejectionReason);
    });

    it('should transition from APROVADA to EM_COTACAO on EXECUTE event by COMPRAS', async () => {
        const transitionDto: TransitionPurchaseRequestDto = { eventType: EventType.EXECUTE };
        const mockPrAprovada = {...baseMockPr, status: PurchaseRequestState.APROVADA };
        const mockPrEmCotacao = {...mockPrAprovada, status: PurchaseRequestState.EM_COTACAO };
  
        mockPrisma.purchaseRequest.findUniqueOrThrow.mockResolvedValue(mockPrAprovada);
        mockPrisma.purchaseRequest.update.mockResolvedValue(mockPrEmCotacao);
        mockAbility.can.mockReturnValue(true); // Compras pode executar
        setupMachineMock(PurchaseRequestState.APROVADA, PurchaseRequestState.EM_COTACAO);
  
        const result = await service.transition(requestId, transitionDto, compras);
  
        expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(compras);
        expect(mockPrisma.purchaseRequest.update).toHaveBeenCalledWith(expect.objectContaining({
          data: { status: PurchaseRequestState.EM_COTACAO, orderedAt: expect.any(Date) },
        }));
        expect(result.status).toBe(PurchaseRequestState.EM_COTACAO);
      });

    it('should throw ForbiddenException for an invalid transition', async () => {
      const transitionDto: TransitionPurchaseRequestDto = { eventType: EventType.SUBMIT };
      const mockPrAprovada = {...baseMockPr, status: PurchaseRequestState.APROVADA };

      mockPrisma.purchaseRequest.findUniqueOrThrow.mockResolvedValue(mockPrAprovada);
      mockAbility.can.mockReturnValue(true);
      // A máquina de estado não permitirá a transição
      setupMachineMock(PurchaseRequestState.APROVADA, PurchaseRequestState.APROVADA);

      await expect(service.transition(requestId, transitionDto, solicitante))
       .rejects.toThrow(ForbiddenException);

      expect(mockPrisma.purchaseRequest.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user does not have permission (CASL check)', async () => {
        const transitionDto: TransitionPurchaseRequestDto = { eventType: EventType.APPROVE };
        const mockPrPendente = {...baseMockPr, status: PurchaseRequestState.PENDENTE_GERENCIA };
  
        mockPrisma.purchaseRequest.findUniqueOrThrow.mockResolvedValue(mockPrPendente);
        mockAbility.can.mockReturnValue(false); // CASL retorna 'false'
  
        // A máquina de estado não será nem consultada se o CASL falhar primeiro
  
        await expect(service.transition(requestId, transitionDto, solicitante)) // Solicitante tentando aprovar
         .rejects.toThrow(ForbiddenException);
  
        expect(mockPrisma.purchaseRequest.update).not.toHaveBeenCalled();
      });

    it('should throw NotFoundException if purchase request not found', async () => {
      const transitionDto: TransitionPurchaseRequestDto = { eventType: EventType.SUBMIT };
      mockPrisma.purchaseRequest.findUniqueOrThrow.mockRejectedValue(new Error('Record not found'));

      await expect(service.transition('non-existent-id', transitionDto, solicitante))
       .rejects.toThrow(NotFoundException);
    });
  });
});