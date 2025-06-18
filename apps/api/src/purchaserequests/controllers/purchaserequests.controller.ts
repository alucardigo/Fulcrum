import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, HttpCode, HttpStatus, Logger, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PurchaseRequestsService } from '../services/purchaserequests.service';
import { CreatePurchaseRequestDto } from '../dto/create-purchase-request.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserWithRoles, CaslAbilityFactory, Action, Subjects } from '../../casl/casl-ability.factory';
import { PurchaseRequest as PurchaseRequestModel, Prisma, User as PrismaUser, PurchaseRequest as PrismaPurchaseRequest } from '@prisma/client';
import { PurchaseRequestEvent } from '../../workflow/purchase-request.machine';

class TransitionEventDto {
  type: PurchaseRequestEvent['type'];
  payload?: any;
  notes?: string;
}

@Controller('purchase-requests')
@UseGuards(JwtAuthGuard)
export class PurchaseRequestsController {
  private readonly logger = new Logger(PurchaseRequestsController.name);

  constructor(
    private readonly purchaseRequestsService: PurchaseRequestsService,
    private readonly caslFactory: CaslAbilityFactory,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreatePurchaseRequestDto,
    @CurrentUser() user: UserWithRoles,
  ): Promise<PurchaseRequestModel> {
    this.logger.log(`Usuário ${user.email} (ID: ${user.id}) criando nova requisição de compra: ${createDto.title}`);

    const ability = this.caslFactory.createForUser(user);
    if (!ability.can(Action.Create, PrismaPurchaseRequest)) {
        this.logger.warn(`Usuário ${user.email} não tem permissão para criar requisições.`);
        throw new ForbiddenException('Você não tem permissão para criar requisições de compra.');
    }

    return this.purchaseRequestsService.create(createDto, user.id);
  }

  @Get()
  async findAll(@CurrentUser() user: UserWithRoles): Promise<PurchaseRequestModel[]> {
    this.logger.log(`Usuário ${user.email} (ID: ${user.id}) buscando requisições de compra.`);

    const ability = this.caslFactory.createForUser(user);
    const isAdminOrManagerOrCompras = user.roles.some(role =>
        role.name === 'ADMINISTRADOR' ||
        role.name === 'GERENCIA' ||
        role.name === 'COMPRAS'
    );

    if (isAdminOrManagerOrCompras && ability.can(Action.Read, PrismaPurchaseRequest)) {
        this.logger.log(`Usuário ${user.email} é ADMIN/GERENCIA/COMPRAS. Listando todas as requisições.`);
        return this.purchaseRequestsService.findAllAdmin();
    }

    this.logger.log(`Usuário ${user.email} (SOLICITANTE ou similar). Listando apenas suas requisições.`);
    return this.purchaseRequestsService.findAllForUser(user.id);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: UserWithRoles,
  ): Promise<PurchaseRequestModel> {
    this.logger.log(`Usuário ${user.email} (ID: ${user.id}) buscando requisição de compra ID: ${id}`);
    return this.purchaseRequestsService.findOneForUser(id, user);
  }

  @Patch(':id/transition')
  @HttpCode(HttpStatus.OK)
  async transition(
    @Param('id') requestId: string,
    @CurrentUser() user: UserWithRoles,
    @Body() transitionDto: TransitionEventDto,
  ): Promise<PurchaseRequestModel> {
    this.logger.log(`Usuário ${user.email} (ID: ${user.id}) tentando transição '${transitionDto.type}' para Requisição ID: ${requestId}`);
    if (!transitionDto || !transitionDto.type) {
      throw new BadRequestException('O tipo do evento de transição é obrigatório.');
    }
    return this.purchaseRequestsService.transition(requestId, user, transitionDto);
  }
}
