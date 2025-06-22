"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PurchaseRequestsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseRequestsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const items_service_1 = require("../../items/services/items.service");
const client_1 = require("@prisma/client");
const library_1 = require("@prisma/client/runtime/library");
const casl_ability_factory_1 = require("../../casl/casl-ability.factory");
const purchase_request_machine_1 = require("../../workflow/purchase-request.machine");
const xstate_1 = require("xstate");
let PurchaseRequestsService = PurchaseRequestsService_1 = class PurchaseRequestsService {
    prisma;
    itemsService;
    caslFactory;
    logger = new common_1.Logger(PurchaseRequestsService_1.name);
    constructor(prisma, itemsService, caslFactory) {
        this.prisma = prisma;
        this.itemsService = itemsService;
        this.caslFactory = caslFactory;
    }
    async create(createDto, userId) {
        const { title, description, projectId, priority, costCenter, justification, expectedDeliveryDate, items: itemsDto } = createDto;
        this.logger.log(`Usuário ID: ${userId} criando nova requisição de compra: ${title}`);
        if (projectId) {
            const projectExists = await this.prisma.project.findUnique({ where: { id: projectId } });
            if (!projectExists) {
                this.logger.warn(`Projeto com ID: ${projectId} não encontrado ao criar requisição.`);
                throw new common_1.NotFoundException(`Projeto com ID '${projectId}' não encontrado.`);
            }
        }
        try {
            const newPurchaseRequest = await this.prisma.$transaction(async (tx) => {
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
                let totalAmountDecimal = new library_1.Decimal(0);
                if (itemsDto && itemsDto.length > 0) {
                    for (const itemDto of itemsDto) {
                        const unitPriceDecimal = new library_1.Decimal(itemDto.unitPrice.toString());
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
        }
        catch (error) {
            this.logger.error(`Falha ao criar requisição de compra para usuário ID: ${userId}`, error.stack);
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new common_1.NotFoundException(`Erro de referência: ${error.meta?.cause || 'Projeto ou usuário não encontrado.'}`);
                }
            }
            throw new common_1.InternalServerErrorException('Não foi possível criar a requisição de compra.');
        }
    }
    async findAllForUser(userId) {
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
    async findAllAdmin() {
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
    async findOneWithDetails(id) {
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
    async findOneForUser(id, userPerformingAction) {
        this.logger.log(`Buscando requisição ID: ${id} para usuário ID: ${userPerformingAction.id}`);
        const purchaseRequest = await this.findOneWithDetails(id);
        if (!purchaseRequest) {
            this.logger.warn(`Requisição ID: ${id} não encontrada.`);
            throw new common_1.NotFoundException(`Requisição de compra com ID '${id}' não encontrada.`);
        }
        const ability = this.caslFactory.createForUser(userPerformingAction);
        if (!ability.can(casl_ability_factory_1.Action.Read, 'PurchaseRequest')) {
            this.logger.warn(`Usuário ID: ${userPerformingAction.id} não tem permissão para ler a requisição ID: ${id}.`);
            throw new common_1.ForbiddenException('Você não tem permissão para acessar esta requisição de compra.');
        }
        return purchaseRequest;
    }
    async transition(requestId, performingUser, eventDto) {
        this.logger.log(`Tentando transição para Req ID: ${requestId}, Evento: ${eventDto.type}, Usuário: ${performingUser.email}`);
        const currentRequestState = await this.findOneWithDetails(requestId);
        if (!currentRequestState) {
            this.logger.warn(`Requisição ID: ${requestId} não encontrada para transição.`);
            throw new common_1.NotFoundException(`Requisição de compra com ID '${requestId}' não encontrada.`);
        }
        const ability = this.caslFactory.createForUser(performingUser);
        const machineContext = {
            currentUser: performingUser,
            requestData: currentRequestState,
            ability: ability,
            errorMessage: undefined,
        };
        const service = (0, xstate_1.createActor)(purchase_request_machine_1.purchaseRequestMachine, { input: machineContext });
        service.start();
        this.logger.debug(`Máquina XState para Req ID: ${requestId}. Estado atual: ${service.getSnapshot().value}`);
        const eventToSend = {
            type: eventDto.type,
            ...(eventDto.payload ? { payload: eventDto.payload } : {}),
            ...(eventDto.notes ? { notes: eventDto.notes } : {}),
        };
        service.send(eventDto);
        const snapshot = service.getSnapshot();
        const newState = snapshot.value;
        const stateChanged = currentRequestState.status !== newState;
        this.logger.debug(`Após evento '${eventDto.type}' para Req ID: ${requestId}, Novo Estado: ${newState}, Mudou?: ${stateChanged}`);
        if (!stateChanged) {
            this.logger.warn(`Evento '${eventDto.type}' inválido para estado '${currentRequestState.status}' da Req ID: ${requestId}.`);
            throw new common_1.BadRequestException(`A ação '${eventDto.type}' não é permitida para o estado atual da requisição.`);
        }
        this.logger.log(`Transição bem-sucedida para Req ID: ${requestId}. De '${currentRequestState.status}' para '${newState}'.`);
        try {
            const updateData = {
                status: newState,
                ...(eventDto.notes && stateChanged && { notes: eventDto.notes }),
            };
            let actionDescriptionDetails = '';
            if (eventDto.type === 'REJECT' && eventDto.payload?.rejectionReason) {
                updateData.rejectionReason = eventDto.payload.rejectionReason;
                actionDescriptionDetails = ` - Motivo da Rejeição: ${eventDto.payload.rejectionReason}`;
            }
            else if (eventDto.payload?.reason) {
                actionDescriptionDetails = ` - Motivo: ${eventDto.payload.reason}`;
            }
            if (newState === client_1.PurchaseRequestState.APROVADO && currentRequestState.status !== client_1.PurchaseRequestState.APROVADO) {
                updateData.approvedAt = new Date();
            }
            if (newState === client_1.PurchaseRequestState.REJEITADO && currentRequestState.status !== client_1.PurchaseRequestState.REJEITADO) {
                updateData.rejectedAt = new Date();
            }
            if (newState === client_1.PurchaseRequestState.CONCLUIDO && currentRequestState.status !== client_1.PurchaseRequestState.CONCLUIDO) {
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
                        notes: eventDto.notes,
                        metadata: eventDto.payload ? JSON.stringify(eventDto.payload) : undefined,
                    },
                });
                return [localUpdatedRequest, localHistoryLog];
            });
            this.logger.log(`Requisição ID: ${requestId} atualizada para estado: ${newState} e histórico registrado.`);
            service.stop();
            return updatedRequest;
        }
        catch (error) {
            this.logger.error(`Erro ao persistir novo estado/histórico para Req ID: ${requestId}`, error.stack);
            service.stop();
            throw new common_1.InternalServerErrorException('Erro ao atualizar o estado da requisição.');
        }
    }
};
exports.PurchaseRequestsService = PurchaseRequestsService;
exports.PurchaseRequestsService = PurchaseRequestsService = PurchaseRequestsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        items_service_1.ItemsService,
        casl_ability_factory_1.CaslAbilityFactory])
], PurchaseRequestsService);
//# sourceMappingURL=purchaserequests.service.js.map