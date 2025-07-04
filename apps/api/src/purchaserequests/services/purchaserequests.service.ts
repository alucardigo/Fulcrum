import { Injectable, Logger, NotFoundException, ForbiddenException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ItemsService } from '../../items/services/items.service';
import { CreatePurchaseRequestDto } from '../dto/create-purchase-request.dto';
import { PurchaseRequest, Item, PurchaseRequestState, PurchaseRequestPriority, Prisma, User as PrismaUser, Project as PrismaProject, RequestHistory } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

import { CaslAbilityFactory, Action, AppAbility, UserWithRoles } from '../../casl/casl-ability.factory';
import { purchaseRequestMachine, PurchaseRequestContext, PurchaseRequestEvent } from '../../workflow/purchase-request.machine';
import { createActor, EventObject } from 'xstate';

@Injectable()
export class PurchaseRequestsService {
  private readonly logger = new Logger(PurchaseRequestsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly itemsService: ItemsService, // Mantido para potencial uso futuro
    private readonly caslFactory: CaslAbilityFactory,
  ) {}

  async create(createDto: CreatePurchaseRequestDto, userId: string): Promise<any> {
    const { 
      title, 
      description, 
      projectId, 
      priority,
      costCenter,
      justification,
      expectedDeliveryDate,
      items: itemsDto 
    } = createDto;
    
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
        // Calcular totalAmount
        let totalAmount = 0;
        if (itemsDto && itemsDto.length > 0) {
          totalAmount = itemsDto.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
        }

        const createdRequest = await tx.purchaseRequest.create({
          data: {
            title,
            description,
            requester: { connect: { id: userId } },
            project: projectId ? { connect: { id: projectId } } : undefined,
            status: 'RASCUNHO',
            priority: priority || 'NORMAL',
            costCenter,
            justification,
            expectedDeliveryDate,
            totalAmount,
          },
        });
        this.logger.log(`Requisição de Compra ID: ${createdRequest.id} criada (transação).`);

        let totalAmountDecimal = new Decimal(0);
        if (itemsDto && itemsDto.length > 0) {
          for (const itemDto of itemsDto) {
            const unitPriceDecimal = new Decimal(itemDto.unitPrice.toString());
            const totalPrice = unitPriceDecimal.mul(itemDto.quantity);
            totalAmountDecimal = totalAmountDecimal.add(totalPrice);
            await tx.item.create({
              data: {
                name: itemDto.name,
                description: itemDto.description,
                quantity: itemDto.quantity,
                unitPrice: unitPriceDecimal,
                totalPrice: totalPrice,
                supplier: itemDto.supplier,
                supplierCNPJ: itemDto.supplierCNPJ,
                purchaseRequest: { connect: { id: createdRequest.id } },
              },
            });
          }
          this.logger.log(`${itemsDto.length} itens criados para Req ID: ${createdRequest.id} (transação).`);
        }

        const fullRequest = await tx.purchaseRequest.findUniqueOrThrow({
            where: { id: createdRequest.id },
            include: { 
              items: true, 
              requester: {
                include: {
                  roles: true
                }
              },
              project: true,
              histories: {
                orderBy: { timestamp: 'desc' },
                take: 5,
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                      firstName: true,
                      lastName: true
                    }
                  }
                }
              }
            },
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
      where: { requesterId: userId },
      include: {
        items: true,
        requester: {
          include: {
            roles: true
          }
        },
        project: true,
        histories: {
          orderBy: { timestamp: 'desc' },
          take: 5,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllAdmin(): Promise<PurchaseRequest[]> {
    this.logger.log('Buscando todas as requisições de compra (visão administrativa).');
    return this.prisma.purchaseRequest.findMany({
      include: {
        items: true,
        requester: {
          include: {
            roles: true
          }
        },
        project: true,
        histories: {
          orderBy: { timestamp: 'desc' },
          take: 5,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneWithDetails(id: string): Promise<PurchaseRequest | null> {
    return this.prisma.purchaseRequest.findUnique({
      where: { id },
      include: {
        items: true,
        requester: {
          include: {
            roles: true
          }
        },
        project: true,
        histories: {
          orderBy: { timestamp: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
      },
    });
  }

  async findOneForUser(id: string, userPerformingAction: UserWithRoles): Promise<any> {
    this.logger.log(`Buscando requisição ID: ${id} para usuário ID: ${userPerformingAction.id}`);
    const purchaseRequest = await this.findOneWithDetails(id);

    if (!purchaseRequest) {
      this.logger.warn(`Requisição ID: ${id} não encontrada.`);
      throw new NotFoundException(`Requisição de compra com ID '${id}' não encontrada.`);
    }

    const ability = this.caslFactory.createForUser(userPerformingAction);
    if (!ability.can(Action.Read, 'PurchaseRequest')) {
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

    const machineContext: PurchaseRequestContext = {
      currentUser: performingUser,
      requestData: currentRequestState as PurchaseRequest,
      ability: ability,
      errorMessage: undefined,
    };

    const service = createActor(purchaseRequestMachine, { input: machineContext });
    service.start();

    this.logger.debug(`Máquina XState para Req ID: ${requestId}. Estado atual: ${service.getSnapshot().value}`);

    const eventToSend = {
      type: eventDto.type,
      ...(eventDto.payload ? { payload: eventDto.payload } : {}),
      ...(eventDto.notes ? { notes: eventDto.notes } : {}),
    };
    service.send(eventDto as PurchaseRequestEvent);

    const snapshot = service.getSnapshot();
    const newState = snapshot.value as PurchaseRequestState;
    const stateChanged = currentRequestState.status !== newState;

    this.logger.debug(`Após evento '${eventDto.type}' para Req ID: ${requestId}, Novo Estado: ${newState}, Mudou?: ${stateChanged}`);

    if (!stateChanged) {
      this.logger.warn(`Evento '${eventDto.type}' inválido para estado '${currentRequestState.status}' da Req ID: ${requestId}.`);
      throw new BadRequestException(`A ação '${eventDto.type}' não é permitida para o estado atual da requisição.`);
    }

    this.logger.log(`Transição bem-sucedida para Req ID: ${requestId}. De '${currentRequestState.status}' para '${newState}'.`);

    try {
      // Preparar dados para atualização e histórico
      const updateData: Prisma.PurchaseRequestUpdateInput = {
        status: newState,
        // Adiciona notas se presentes no evento e o estado mudou
        ...(eventDto.notes && stateChanged && { notes: eventDto.notes }),
      };
      let actionDescriptionDetails = '';

      if (eventDto.type === 'REJECT' && eventDto.payload?.rejectionReason) {
        updateData.rejectionReason = eventDto.payload.rejectionReason;
        actionDescriptionDetails = ` - Motivo da Rejeição: ${eventDto.payload.rejectionReason}`;
      } else if (eventDto.payload?.reason) { // Manter lógica para 'reason' genérico se houver
        actionDescriptionDetails = ` - Motivo: ${eventDto.payload.reason}`;
      }

      // Se o estado mudou para APROVADO, registrar a data de aprovação
      if (newState === PurchaseRequestState.APROVADO && currentRequestState.status !== PurchaseRequestState.APROVADO) {
        updateData.approvedAt = new Date();
      }
      // Se o estado mudou para REJEITADO, registrar a data de rejeição
      if (newState === PurchaseRequestState.REJEITADO && currentRequestState.status !== PurchaseRequestState.REJEITADO) {
        updateData.rejectedAt = new Date();
      }
       // Se o estado mudou para COMPRADO (ou CONCLUIDO, dependendo da semântica), registrar a data
      if (newState === PurchaseRequestState.CONCLUIDO && currentRequestState.status !== PurchaseRequestState.CONCLUIDO) {
        // Assumindo que CONCLUIDO implica que o pedido foi feito e finalizado.
        // O campo 'orderedAt' está sendo usado aqui para indicar a data de conclusão/execução final.
        // Se um fluxo mais granular com um estado 'COMPRADO' distinto fosse implementado,
        // 'orderedAt' poderia ser definido nesse estado intermediário.
        updateData.orderedAt = new Date();
      }


      const [updatedRequest, _historyLog] = await this.prisma.$transaction(async (tx) => {
        const localUpdatedRequest = await tx.purchaseRequest.update({
          where: { id: requestId },
          data: updateData,
          include: {
            items: true,
            requester: {
              include: {
                roles: true
              }
            },
            project: true,
            histories: {
              orderBy: { timestamp: 'desc' },
              take: 5,
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        });
        const localHistoryLog = await tx.requestHistory.create({
          data: {
            purchaseRequestId: requestId,
            userId: performingUser.id,
            previousState: currentRequestState.status,
            newState: newState,
            actionType: eventDto.type,
            actionDescription: `Evento: ${eventDto.type}${actionDescriptionDetails}`,
            notes: eventDto.notes, // Registrar notas no histórico também
            metadata: eventDto.payload ? JSON.stringify(eventDto.payload) : undefined,
          },
        });
        return [localUpdatedRequest, localHistoryLog];
      });

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
