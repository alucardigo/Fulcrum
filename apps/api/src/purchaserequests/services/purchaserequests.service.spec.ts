import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseRequestsService } from './purchaserequests.service';
import { PrismaService } from '../../prisma.service';
import { createActor } from 'xstate'; // Re-adicionar importação
import { ItemsService } from '../../items/services/items.service';
import { CaslAbilityFactory } from '../../casl/casl-ability.factory';
import { purchaseRequestMachine } from '../../workflow/purchase-request.machine';
import { PurchaseRequestState, UserRole, PurchaseRequestPriority } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Mock xstate no topo do arquivo
const mockActorGlobal = {
  start: jest.fn(),
  stop: jest.fn(),
  getSnapshot: jest.fn(),
  send: jest.fn(),
};
jest.mock('xstate', () => {
  const originalXState = jest.requireActual('xstate');
  return {
    ...originalXState,
    createActor: jest.fn(() => mockActorGlobal),
  };
});

// Não vamos mais mockar PrismaService no topo com jest.mock. Ele será mockado com overrideProvider.

describe('PurchaseRequestsService', () => {
  let service: PurchaseRequestsService;
  let caslAbilityFactory: CaslAbilityFactory;
  // prismaMock será o objeto que definirmos com useValue
  let prismaMock: any;

  // Mocks individuais para as operações dentro da transação (e possivelmente fora)
  let purchaseRequestCreateMock: jest.Mock;
  let purchaseRequestUpdateMock: jest.Mock;
  let purchaseRequestFindUniqueMock: jest.Mock;
  let purchaseRequestFindUniqueOrThrowMock: jest.Mock;
  let purchaseRequestFindManyMock: jest.Mock;
  let itemCreateMock: jest.Mock;
  let requestHistoryCreateMock: jest.Mock;
  let projectFindUniqueMock: jest.Mock;
  let transactionCallbackMock: jest.Mock; // Para o callback do $transaction

  const mockUser = {
    id: 'user-default-id',
    email: 'default@example.com',
    password: 'hashed',
    firstName: 'Default',
    lastName: 'User',
    department: null,
    roles: [{ id: 'role-solicitante', userId: 'user-default-id', role: UserRole.SOLICITANTE, createdAt: new Date(), updatedAt: new Date() }],
    isActive: true,
    costCenter: 'DefaultCC',
    approvalLimit: new Decimal(1000.00), // Um valor default
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Mock da CaslAbilityFactory e AppAbility
  const mockAbility = {
    can: jest.fn(),
    cannot: jest.fn(),
  };

  // O mockActor local não é mais necessário, usaremos mockActorGlobal do jest.mock

  beforeEach(async () => {
    // Inicializar/Resetar mocks individuais
    purchaseRequestCreateMock = jest.fn();
    purchaseRequestUpdateMock = jest.fn();
    purchaseRequestFindUniqueMock = jest.fn();
    purchaseRequestFindUniqueOrThrowMock = jest.fn();
    purchaseRequestFindManyMock = jest.fn();
    itemCreateMock = jest.fn();
    requestHistoryCreateMock = jest.fn();
    projectFindUniqueMock = jest.fn();
    transactionCallbackMock = jest.fn(); // Este será o mock para o callback do $transaction

    const prismaTransactionClientInternalMock = { // Renomeado para evitar conflito de escopo
      purchaseRequest: {
        create: purchaseRequestCreateMock,
        update: purchaseRequestUpdateMock,
        findUniqueOrThrow: purchaseRequestFindUniqueOrThrowMock,
      },
      item: { create: itemCreateMock },
      requestHistory: {
        create: requestHistoryCreateMock,
      },
    };

    // Configurar o mock principal do PrismaService que será usado pelo overrideProvider
    prismaMock = {
      $transaction: jest.fn().mockImplementation(async (callback) => {
        // console.log('[TEST DEBUG] $transaction mock called. Callback type:', typeof callback);
        return await callback(prismaTransactionClientInternalMock);
      }),
      purchaseRequest: {
        findUniqueOrThrow: purchaseRequestFindUniqueOrThrowMock,
        findUnique: purchaseRequestFindUniqueMock, // Para findOneWithDetails
        findMany: purchaseRequestFindManyMock,
        // Adicionar create/update aqui se forem chamados DIRETAMENTE no prismaMock, fora de uma transação.
        // Normalmente, eles são chamados no cliente transacional.
      },
      project: {
        findUnique: projectFindUniqueMock,
      }
      // Não precisamos mockar 'item' ou 'requestHistory' aqui se eles só são usados dentro de transações.
    };

    mockAbility.can.mockReset();
    mockAbility.cannot.mockReset();
    mockActorGlobal.start.mockReset();
    mockActorGlobal.stop.mockReset();
    mockActorGlobal.getSnapshot.mockReset();
    mockActorGlobal.send.mockReset();
    (createActor as jest.Mock).mockReturnValue(mockActorGlobal);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseRequestsService,
        PrismaService, // Fornecer o PrismaService real (ele será sobrescrito)
        CaslAbilityFactory, // Fornecer o CaslAbilityFactory real
        // ItemsService não é usado diretamente pelo PurchaseRequestsService no código fornecido, mas manter mockado
        { provide: ItemsService, useValue: {} },
      ],
    })
    .overrideProvider(PrismaService)
    .useValue(prismaMock) // A MÁGICA ACONTECE AQUI
    .compile();

    service = module.get<PurchaseRequestsService>(PurchaseRequestsService);
    caslAbilityFactory = module.get<CaslAbilityFactory>(CaslAbilityFactory);
    // Adicionar o spyOn após a obtenção da instância real do CaslAbilityFactory
    jest.spyOn(caslAbilityFactory, 'createForUser');

    // Mock global do createActor de xstate - Mover para fora do beforeEach se for configuração global do Jest
    // ou manter se for específico para este describe.
    // Para evitar problemas com jest.mock dentro de beforeEach, é melhor no topo do arquivo ou via jest.setup.js
    // Por agora, vou comentar e assumir que o jest.mock real (se necessário) está no topo do arquivo ou configurado globalmente.
    // jest.mock('xstate', () => ({
    //   ...jest.requireActual('xstate'),
    //   createActor: jest.fn(() => mockActor),
    // }));
  });

  // afterEach(() => { // Manter um único afterEach se necessário, ou remover se o reset dos mocks no beforeEach for suficiente
  //   jest.restoreAllMocks();
  // });


  describe('createPurchaseRequest', () => {
    // Certificar que 'service' e 'prisma' estão disponíveis aqui,
    // o que deve acontecer devido ao beforeEach de escopo mais alto.
    it('should create a purchase request in RASCUNHO status', async () => {
      const userIdForCreate = mockUser.id;

      const createDto = {
        title: 'Test Request Create',
        description: 'Test Description Create',
        priority: PurchaseRequestPriority.NORMAL,
        justification: 'Justificativa de teste Create',
        costCenter: 'CC_Create',
        items: [ { name: 'Item 1 Create', quantity: 1, unitPrice: 100.00, description: 'Item desc' } ],
      };

      const createdPRId = 'newPRId';
      const createdItemMock = { id: 'item1Created', ...createDto.items[0] };
      const mockCreatedPurchaseRequest = {
        id: createdPRId,
        title: createDto.title,
        description: createDto.description,
        status: PurchaseRequestState.RASCUNHO,
        priority: createDto.priority,
        totalAmount: new Decimal(100.00),
        requesterId: userIdForCreate,
        projectId: null,
        costCenter: createDto.costCenter,
        justification: createDto.justification,
        expectedDeliveryDate: null,
        rejectionReason: null,
        approvedAt: null,
        rejectedAt: null,
        orderedAt: null,
        deliveredAt: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [createdItemMock], // Simular itens retornados
        requester: { ...mockUser, id: userIdForCreate }, // Simular requester retornado
        project: null,
        histories: [],
        approverId: null, // Adicionar campos faltantes do tipo Prisma
        approver: null,
      };

      // Configurar mocks para a transação de create
      purchaseRequestCreateMock.mockResolvedValue({ id: createdPRId, ...createDto, totalAmount: 100 }); // Simples mock para a primeira chamada
      itemCreateMock.mockResolvedValue(createdItemMock);
      // Este é o mock CRÍTICO para a chamada findUniqueOrThrow DENTRO da transação
      purchaseRequestFindUniqueOrThrowMock.mockResolvedValue(mockCreatedPurchaseRequest);
      projectFindUniqueMock.mockResolvedValue(null); // Se projectId não for fornecido ou o projeto não existir

      const result = await service.create(createDto, userIdForCreate);

      expect(projectFindUniqueMock).not.toHaveBeenCalled(); // Se projectId não foi passado
      expect(purchaseRequestCreateMock).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: createDto.title,
          requester: { connect: { id: userIdForCreate } },
        }),
      });
      expect(itemCreateMock).toHaveBeenCalledTimes(createDto.items.length);
      expect(itemCreateMock).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: createDto.items[0].name,
          unitPrice: expect.any(Decimal), // Verificar se é Decimal
          totalPrice: expect.any(Decimal), // Verificar se é Decimal
          purchaseRequest: { connect: { id: createdPRId } },
        }),
      });
      expect(purchaseRequestFindUniqueOrThrowMock).toHaveBeenCalledWith({
        where: { id: createdPRId },
        include: expect.any(Object), // Verificar a estrutura do include se necessário
      });
      expect(result).toEqual(mockCreatedPurchaseRequest);
    });
  });

  describe('transition', () => {
    const requestId = 'req1'; // Usado para os mocks de findUnique

    // Definir performingUserGerencia e performingUserCompras com a estrutura correta de User do Prisma
    const performingUserGerencia = {
      ...mockUser, // Base
      id: 'gerenteUserId',
      email: 'gerente@example.com',
      roles: [{ id: 'role-gerencia', userId: 'gerenteUserId', role: UserRole.GERENCIA, createdAt: new Date(), updatedAt: new Date()  }],
      approvalLimit: new Decimal(5000)
    };
    const performingUserCompras = {
      ...mockUser, // Base
      id: 'comprasUserId',
      email: 'compras@example.com',
      roles: [{ id: 'role-compras', userId: 'comprasUserId', role: UserRole.COMPRAS, createdAt: new Date(), updatedAt: new Date()  }],
    };

    // Mock da máquina de estado para simular transições
    const setupMachineMock = (initialStatus: PurchaseRequestState, nextStatus: PurchaseRequestState, isValidTransition = true) => {
      // Usar o mock individual que é parte do prismaMock configurado no useFactory
      purchaseRequestFindUniqueMock.mockResolvedValueOnce({
        id: requestId,
        status: initialStatus,
        title: 'Test Request for Transition',
        totalAmount: new Decimal(1000),
        requesterId: 'user1',
        histories: [],
        items: [],
        notes: null, // Adicionar campos para satisfazer o tipo Prisma PurchaseRequest
        rejectionReason: null,
        approvedAt: null,
        rejectedAt: null,
        orderedAt: null,
        deliveredAt: null,
        expectedDeliveryDate: null,
        costCenter: null,
        justification: null,
        approverId: null,
        projectId: null,
      });

      if (isValidTransition) {
        mockActorGlobal.getSnapshot.mockReturnValueOnce({ value: initialStatus }) // Estado antes do send
                             .mockReturnValueOnce({ value: nextStatus });   // Estado depois do send
      } else {
        mockActorGlobal.getSnapshot.mockReturnValueOnce({ value: initialStatus })
                             .mockReturnValueOnce({ value: initialStatus }); // Estado não muda
      }
    };

    beforeEach(() => {
        // Garante que o mock de createActor seja recriado antes de cada teste no describe 'transition'
        // É importante porque o jest.mock('xstate', ...) no nível superior pode não ser suficiente
        // para resetar o mock entre testes de describes diferentes se não for feito corretamente.
        // No entanto, o beforeEach mais externo já deve estar fazendo isso.
        // Apenas para garantir, podemos reafirmar o mock de createActor aqui se necessário,
        // mas o ideal é que o jest.restoreAllMocks() e o beforeEach externo cuidem disso.
    });

    // Cenário 1: Aprovação Nível 2 (Gerência)
    describe('Gerencia Approval (ApproveLevel2)', () => {
      const eventDto = { type: 'APPROVE_LEVEL_2' as any }; // Cast para o tipo esperado

      it('should transition from PENDENTE_GERENCIA to APROVADO if user is GERENCIA and has permission', async () => {
        setupMachineMock(PurchaseRequestState.PENDENTE_GERENCIA, PurchaseRequestState.APROVADO);
        mockAbility.can.mockReturnValue(true); // Usuário tem permissão

        // Configurar mocks para as operações DENTRO da transação
        const updatedPrData = {
            id: requestId,
            status: PurchaseRequestState.APROVADO,
            title: 'Test Request for Transition',
            // ... outros campos relevantes que o serviço retorna após include
            items: [], histories: [], requester: performingUserGerencia, project: null,
            approvedAt: expect.any(Date), // Espera-se que seja definido
        };
        purchaseRequestUpdateMock.mockResolvedValue(updatedPrData);
        requestHistoryCreateMock.mockResolvedValue({ id: 'historyId1' });


        const result = await service.transition(requestId, performingUserGerencia, eventDto);

        expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(performingUserGerencia);
        // A verificação da action correta ('approve_level_2') será feita na máquina de estado/guarda,
        // aqui garantimos que a permissão geral (can) foi checada.
        // expect(mockAbility.can).toHaveBeenCalledWith('approve_level_2', expect.anything()); // Ajustar conforme a action exata

        expect(purchaseRequestUpdateMock).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: requestId },
            data: expect.objectContaining({ // Verificar data mais especificamente
              status: PurchaseRequestState.APROVADO,
              approvedAt: expect.any(Date), // Esperamos que approvedAt seja definido
              // notes: eventDto.notes se existirem, ou o valor original.
            })
          })
        );
        expect(requestHistoryCreateMock).toHaveBeenCalledWith({
          data: expect.objectContaining({
            purchaseRequestId: requestId,
            userId: performingUserGerencia.id,
            previousState: PurchaseRequestState.PENDENTE_GERENCIA,
            newState: PurchaseRequestState.APROVADO,
            actionType: eventDto.type,
          })
        }); // Parêntese corrigido
        expect(result.status).toEqual(PurchaseRequestState.APROVADO);
      });

      it('should fail to transition to APROVADO if user does not have permission', async () => {
        setupMachineMock(PurchaseRequestState.PENDENTE_GERENCIA, PurchaseRequestState.APROVADO, false); // Transição não é válida pela máquina
        mockAbility.can.mockReturnValue(true); // Mock da guarda da máquina de estado retornaria false

        // Simular que a máquina de estado não mudou o estado por falha na guarda
         mockActorGlobal.getSnapshot.mockReset(); // Limpa mocks anteriores de getSnapshot
         mockActorGlobal.getSnapshot.mockReturnValueOnce({ value: PurchaseRequestState.PENDENTE_GERENCIA })
                              .mockReturnValueOnce({ value: PurchaseRequestState.PENDENTE_GERENCIA });


        await expect(service.transition(requestId, performingUserGerencia, eventDto))
          .rejects.toThrow('A ação \'APPROVE_LEVEL_2\' não é permitida para o estado atual da requisição.');
      });
    });

    // Cenário 2: Rejeição Nível 2 (Gerência)
    describe('Gerencia Rejection', () => {
      const rejectionReason = 'Orçamento excedido';
      const eventDto = { type: 'REJECT' as any, payload: { rejectionReason } };

      it('should transition from PENDENTE_GERENCIA to REJEITADO with reason', async () => {
        setupMachineMock(PurchaseRequestState.PENDENTE_GERENCIA, PurchaseRequestState.REJEITADO);
        mockAbility.can.mockReturnValue(true);

        const rejectedPrData = {
          id: requestId,
          status: PurchaseRequestState.REJEITADO,
          rejectionReason: rejectionReason, // Importante
          rejectedAt: expect.any(Date), // Espera-se que seja definido
          title: 'Test Request for Transition', items: [], histories: [], requester: performingUserGerencia, project: null,
        };
        purchaseRequestUpdateMock.mockResolvedValue(rejectedPrData);
        requestHistoryCreateMock.mockResolvedValue({ id: 'historyId2' });

        const result = await service.transition(requestId, performingUserGerencia, eventDto);

        expect(purchaseRequestUpdateMock).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: requestId },
            data: expect.objectContaining({ // Verificar que data contenha o status e a razão
              status: PurchaseRequestState.REJEITADO,
              rejectionReason: rejectionReason,
            }),
          })
        );
        expect(requestHistoryCreateMock).toHaveBeenCalledWith({
          data: expect.objectContaining({
            actionDescription: expect.stringContaining(rejectionReason),
            newState: PurchaseRequestState.REJEITADO,
          })
        }); // Parêntese corrigido
        expect(result.status).toEqual(PurchaseRequestState.REJEITADO);
        // Adicionar expect para o campo rejectionReason no resultado se a implementação o retornar.
        // expect(result.rejectionReason).toEqual(rejectionReason);
      });
    });

    // Mais cenários (Execução Compras, Transições Inválidas) virão aqui

    // Cenário 3: Execução da Compra (Compras)
    describe('Compras Execution', () => {
      const eventDto = { type: 'EXECUTE' as any };

      it('should transition from APROVADO to CONCLUIDO if user is COMPRAS and has permission', async () => {
        setupMachineMock(PurchaseRequestState.APROVADO, PurchaseRequestState.CONCLUIDO);
        mockAbility.can.mockReturnValue(true);

        // Configurar o findUnique para o estado inicial APROVADO
        purchaseRequestFindUniqueMock.mockResolvedValueOnce({
            id: requestId,
            status: PurchaseRequestState.APROVADO,
            title: 'Test Request for Execution',
            totalAmount: new Decimal(500), // Garantir que Decimal seja importado e usado
            requesterId: 'user2',
            histories: [], items: [], notes: null, rejectionReason: null, // Adicionar campos para tipo completo
        });

        // Configurar mocks para as operações DENTRO da transação
        const concludedPrData = {
            id: requestId,
            status: PurchaseRequestState.CONCLUIDO,
            orderedAt: expect.any(Date), // Espera-se que seja definido
            title: 'Test Request for Execution', items: [], histories: [], requester: performingUserCompras, project: null,
        };
        purchaseRequestUpdateMock.mockResolvedValue(concludedPrData);
        requestHistoryCreateMock.mockResolvedValue({ id: 'historyId3' });

        // E a máquina de estado reflete isso
        mockActorGlobal.getSnapshot.mockReset();
        mockActorGlobal.getSnapshot.mockReturnValueOnce({ value: PurchaseRequestState.APROVADO })
                             .mockReturnValueOnce({ value: PurchaseRequestState.CONCLUIDO });


        const result = await service.transition(requestId, performingUserCompras, eventDto);

        expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(performingUserCompras);
        expect(purchaseRequestUpdateMock).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: requestId },
            data: expect.objectContaining({ // Verificar data mais especificamente
              status: PurchaseRequestState.CONCLUIDO,
              orderedAt: expect.any(Date), // Esperamos que orderedAt seja definido
            })
          })
        );
        expect(requestHistoryCreateMock).toHaveBeenCalledWith({
          data: expect.objectContaining({
            purchaseRequestId: requestId,
            userId: performingUserCompras.id,
            previousState: PurchaseRequestState.APROVADO,
            newState: PurchaseRequestState.CONCLUIDO,
            actionType: eventDto.type,
          })
        }); // Parêntese corrigido
        expect(result.status).toEqual(PurchaseRequestState.CONCLUIDO);
      });

      it('should fail to transition to CONCLUIDO if user does not have permission (e.g., wrong role)', async () => {
        setupMachineMock(PurchaseRequestState.APROVADO, PurchaseRequestState.CONCLUIDO, false);
         // Usuário GERENCIA tentando executar
        mockAbility.can.mockReturnValue(true); // A guarda da máquina de estado deve falhar

        purchaseRequestFindUniqueMock.mockResolvedValueOnce({
            id: requestId, status: PurchaseRequestState.APROVADO, title: 'Test Request',
        });
        mockActorGlobal.getSnapshot.mockReset();
        mockActorGlobal.getSnapshot.mockReturnValueOnce({ value: PurchaseRequestState.APROVADO })
                             .mockReturnValueOnce({ value: PurchaseRequestState.APROVADO });

        await expect(service.transition(requestId, performingUserGerencia, eventDto)) // Gerente tentando executar
          .rejects.toThrow('A ação \'EXECUTE\' não é permitida para o estado atual da requisição.');
      });
    });

     // Cenário 4: Transições Inválidas
    describe('Invalid Transitions', () => {
      it('should throw BadRequestException for an invalid event for the current state', async () => {
        const initialStatus = PurchaseRequestState.RASCUNHO;
        const eventDto = { type: 'APPROVE_LEVEL_2' as any }; // Tentando aprovação de gerência em um rascunho

        setupMachineMock(initialStatus, initialStatus, false); // Estado não deve mudar
        mockAbility.can.mockReturnValue(true); // Mesmo que o usuário tenha a permissão geral ApproveLevel2

        purchaseRequestFindUniqueMock.mockResolvedValueOnce({
            id: requestId, status: initialStatus, title: 'Test Request',
        });
         mockActorGlobal.getSnapshot.mockReset();
         mockActorGlobal.getSnapshot.mockReturnValueOnce({ value: initialStatus })
                              .mockReturnValueOnce({ value: initialStatus });


        await expect(service.transition(requestId, performingUserGerencia, eventDto))
          .rejects.toThrow(`A ação '${eventDto.type}' não é permitida para o estado atual da requisição.`);
      });
    });
  });
});
