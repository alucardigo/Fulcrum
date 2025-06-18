import { Injectable, Logger, NotFoundException, ForbiddenException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
// ItemsService é injetado no construtor, mas não usado ativamente nos métodos atuais após refatoração do 'create'.
// Pode ser mantido para futuras funcionalidades de gerenciamento de itens.
import { ItemsService } from '../../items/services/items.service';
import { CreatePurchaseRequestDto } from '../dto/create-purchase-request.dto';
import { PurchaseRequest, Item, RequisicaoCompraStatus, Prisma, User as PrismaUser, Role as PrismaRole, Project as PrismaProject, RequestHistory } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

import { CaslAbilityFactory, Action, AppAbility, UserWithRoles, Subjects } from '../../casl/casl-ability.factory';
import { purchaseRequestMachine, PurchaseRequestContext, PurchaseRequestEvent } from '../../workflow/purchase-request.machine';
import { createActor, EventObject } from 'xstate'; // AnyActorLogic removido pois não é explicitamente usado

@Injectable()
export class PurchaseRequestsService {
  private readonly logger = new Logger(PurchaseRequestsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly itemsService: ItemsService, // Mantido para potencial uso futuro
    private readonly caslFactory: CaslAbilityFactory,
  ) {}

  async create(createDto: CreatePurchaseRequestDto, userId: string): Promise<PurchaseRequest> {
    const { title, description, projectId, priority, items: itemsDto } = createDto;
    this.logger.log(`Usuário ID: ${userId} criando nova requisição de compra: ${title}`);

    if (projectId) {
      const projectExists = await this.prisma.project.findUnique({ where: { id: projectId } });
      if (!projectExists) {
        this.logger.warn(`Projeto com ID: ${projectId} não encontrado ao criar requisição.`);
        throw new NotFoundException(`Projeto com ID '${projectId}' não encontrado.`);
      }
    }

    try {
      const newPurchaseRequest = await this.prisma.$transaction(async (tx) => {
        const createdRequest = await tx.purchaseRequest.create({
          data: {
            title,
            description,
            requester: { connect: { id: userId } },
            project: projectId ? { connect: { id: projectId } } : undefined,
            status: 'RASCUNHO', // Estado inicial da máquina XState (conforme definido na máquina)
            priority: priority || undefined,
          },
        });
        this.logger.log(`Requisição de Compra ID: ${createdRequest.id} criada (transação).`);

        if (itemsDto && itemsDto.length > 0) {
          for (const itemDto of itemsDto) {
            const unitPriceDecimal = new Decimal(itemDto.unitPrice.toString());
            const totalPrice = unitPriceDecimal.mul(itemDto.quantity);
            await tx.item.create({
              data: {
                name: itemDto.name,
                description: itemDto.description,
                quantity: itemDto.quantity,
                unitPrice: unitPriceDecimal,
                totalPrice: totalPrice,
                supplier: itemDto.supplier,
                url: itemDto.url,
                purchaseRequest: { connect: { id: createdRequest.id } },
              },
            });
          }
          this.logger.log(`${itemsDto.length} itens criados para Req ID: ${createdRequest.id} (transação).`);
        }

        const fullRequest = await tx.purchaseRequest.findUniqueOrThrow({
            where: { id: createdRequest.id },
            include: { items: true, requester: {select:{id:true, email:true, firstName:true, lastName:true, roles: true}}, project: true },
        });
        return fullRequest;
      });

      this.logger.log(`Requisição de Compra ID: ${newPurchaseRequest.id} e itens criados com sucesso.`);
      return newPurchaseRequest;

    } catch (error) {
      this.logger.error(`Falha ao criar requisição de compra para usuário ID: ${userId}`, error.stack);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
             throw new NotFoundException(`Erro de referência: ${error.meta?.cause || 'Projeto ou usuário não encontrado.'}`);
        }
      }
      throw new InternalServerErrorException('Não foi possível criar a requisição de compra.');
    }
  }

  async findAllForUser(userId: string): Promise<PurchaseRequest[]> {
    this.logger.log(`Buscando todas as requisições de compra para o usuário ID: ${userId}`);
    return this.prisma.purchaseRequest.findMany({
      where: { requesterId: userId }, // Filtro básico, CASL pode refinar para outros roles
      include: {
        items: true,
        requester: {select:{id:true, email:true, firstName:true, lastName:true, roles: true}},
        project: true,
        histories: { orderBy: { timestamp: 'desc' }, take: 5 },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllAdmin(): Promise<PurchaseRequest[]> {
    this.logger.log('Buscando todas as requisições de compra (visão administrativa).');
    return this.prisma.purchaseRequest.findMany({
      include: {
        items: true,
        requester: { select: { id: true, email: true, firstName: true, lastName: true, roles: true } },
        project: true,
        histories: { orderBy: { timestamp: 'desc' }, take: 5 },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneWithDetails(id: string): Promise<PrismaPurchaseRequest | null> {
    // Método auxiliar para buscar a requisição com todos os includes necessários para CASL e XState context
    return this.prisma.purchaseRequest.findUnique({
      where: { id },
      include: {
        items: true,
        requester: { include: { roles: true } }, // Incluir roles do solicitante para CASL
        project: true,
        histories: { orderBy: { timestamp: 'desc' } },
      },
    });
  }

  async findOneForUser(id: string, userPerformingAction: UserWithRoles): Promise<PurchaseRequest | null> {
    this.logger.log(`Buscando requisição ID: ${id} para usuário ID: ${userPerformingAction.id}`);
    const purchaseRequest = await this.findOneWithDetails(id);

    if (!purchaseRequest) {
      this.logger.warn(`Requisição ID: ${id} não encontrada.`);
      throw new NotFoundException(`Requisição de compra com ID '${id}' não encontrada.`);
    }

    const ability = this.caslFactory.createForUser(userPerformingAction);
    if (!ability.can(Action.Read, purchaseRequest as unknown as ExtractSubjectType<Subjects>)) { // Cast para o tipo correto esperado pelo CASL
      this.logger.warn(`Usuário ID: ${userPerformingAction.id} não tem permissão para ler a requisição ID: ${id}.`);
      throw new ForbiddenException('Você não tem permissão para acessar esta requisição de compra.');
    }

    return purchaseRequest;
  }

  async transition(
    requestId: string,
    performingUser: UserWithRoles,
    eventDto: { type: PurchaseRequestEvent['type']; payload?: any; notes?: string },
  ): Promise<PurchaseRequest> {
    this.logger.log(`Tentando transição para Req ID: ${requestId}, Evento: ${eventDto.type}, Usuário: ${performingUser.email}`);

    const currentRequestState = await this.findOneWithDetails(requestId);

    if (!currentRequestState) {
      this.logger.warn(`Requisição ID: ${requestId} não encontrada para transição.`);
      throw new NotFoundException(`Requisição de compra com ID '${requestId}' não encontrada.`);
    }

    const ability = this.caslFactory.createForUser(performingUser);

    // O tipo PrismaPurchaseRequest (de currentRequestState) é compatível com o que CASL espera via InferSubjects
    const machineContext: PurchaseRequestContext = {
      currentUser: performingUser,
      requestData: currentRequestState as unknown as ExtractSubjectType<Subjects>, // Cast para o tipo correto
      ability: ability,
      errorMessage: undefined,
    };

    const service = createActor(purchaseRequestMachine, {
        input: machineContext,
    });

    service.start(currentRequestState.status as any);

    this.logger.debug(`Máquina XState para Req ID: ${requestId}. Estado atual: ${service.getSnapshot().value}`);

    const eventToSend: EventObject = { type: eventDto.type, payload: eventDto.payload, notes: eventDto.notes };
    service.send(eventToSend);

    const snapshot = service.getSnapshot();
    const newState = snapshot.value as RequisicaoCompraStatus;

    this.logger.debug(`Após evento '${eventDto.type}' para Req ID: ${requestId}, Novo Estado: ${newState}, Mudou?: ${snapshot.changed}`);

    if (!snapshot.changed) {
      const canTransition = service.machine.states[currentRequestState.status as string]?.can(eventToSend.type);
      if (!canTransition) {
          this.logger.warn(`Evento '${eventDto.type}' inválido para estado '${currentRequestState.status}' da Req ID: ${requestId}.`);
          throw new BadRequestException(`A ação '${eventDto.type}' não é permitida para o estado atual da requisição.`);
      } else {
          this.logger.warn(`Transição bloqueada por guarda (permissão CASL) para Req ID: ${requestId}, Evento: ${eventDto.type}, Usuário: ${performingUser.email}`);
          throw new ForbiddenException('Você não tem permissão para realizar esta ação nesta requisição ou neste estado.');
      }
    }

    this.logger.log(`Transição bem-sucedida para Req ID: ${requestId}. De '${currentRequestState.status}' para '${newState}'.`);

    try {
      const [updatedRequest, _historyLog] = await this.prisma.$transaction([
        this.prisma.purchaseRequest.update({
          where: { id: requestId },
          data: { status: newState },
          include: { items: true, requester: {select:{id:true, email:true, firstName:true, lastName:true, roles: true}}, project: true, histories: { orderBy: { timestamp: 'desc' }, take: 5 } },
        }),
        this.prisma.requestHistory.create({
          data: {
            purchaseRequestId: requestId,
            userId: performingUser.id,
            previousState: currentRequestState.status,
            newState: newState,
            actionDescription: `Evento: ${eventDto.type}${eventDto.payload?.reason ? ` - Motivo: ${eventDto.payload.reason}` : ''}`,
            notes: eventDto.notes,
          },
        }),
      ]);

      this.logger.log(`Requisição ID: ${requestId} atualizada para estado: ${newState} e histórico registrado.`);
      service.stop();
      return updatedRequest;

    } catch (error) {
        this.logger.error(`Erro ao persistir novo estado/histórico para Req ID: ${requestId}`, error.stack);
        service.stop();
        throw new InternalServerErrorException('Erro ao atualizar o estado da requisição.');
    }
  }
}
