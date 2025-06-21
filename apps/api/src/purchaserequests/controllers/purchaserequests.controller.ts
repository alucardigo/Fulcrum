import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, HttpCode, HttpStatus, Logger, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PurchaseRequestsService } from '../services/purchaserequests.service';
import { CreatePurchaseRequestDto } from '../dto/create-purchase-request.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserWithRoles, CaslAbilityFactory, Action, Subjects } from '../../casl/casl-ability.factory';
import { PurchaseRequest as PurchaseRequestModel, User as PrismaUser } from '@prisma/client';
import { PurchaseRequestEvent } from '../../workflow/purchase-request.machine';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';

class TransitionEventDto {
  type: PurchaseRequestEvent['type'];
  payload?: any;
  notes?: string;
}

@ApiTags('purchaserequests')
@ApiBearerAuth()
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
  @ApiOperation({ 
    summary: 'Criar nova requisição de compra',
    description: 'Cria uma nova requisição de compra no sistema. O usuário deve ter permissão para criar requisições.'
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Requisição criada com sucesso',
    type: Object // Use Object ou um DTO, não um tipo do Prisma
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Usuário não tem permissão para criar requisições'
  })
  @ApiBody({ type: CreatePurchaseRequestDto })
  async create(
    @Body() createDto: CreatePurchaseRequestDto,
    @CurrentUser() user: UserWithRoles,
  ): Promise<any> { // Use any ou um DTO
    this.logger.log(`Usuário ${user.email} (ID: ${user.id}) criando nova requisição de compra: ${createDto.title}`);

    const ability = this.caslFactory.createForUser(user);
    if (!ability.can(Action.Create, 'PurchaseRequest')) { // Use string subject
        this.logger.warn(`Usuário ${user.email} não tem permissão para criar requisições.`);
        throw new ForbiddenException('Você não tem permissão para criar requisições de compra.');
    }

    return this.purchaseRequestsService.create(createDto, user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas as requisições de compra',
    description: 'Retorna todas as requisições de compra que o usuário tem permissão para visualizar'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de requisições de compra',
    type: [Object] // Use Object array
  })
  async findAll(@CurrentUser() user: UserWithRoles): Promise<any[]> {
    this.logger.log(`Usuário ${user.email} (ID: ${user.id}) buscando requisições de compra.`);

    const ability = this.caslFactory.createForUser(user);
    const isAdminOrManagerOrCompras = user.roles.some(role =>
        role.role === 'ADMINISTRADOR' ||
        role.role === 'GERENCIA' ||
        role.role === 'COMPRAS'
    );

    if (isAdminOrManagerOrCompras && ability.can(Action.Read, 'PurchaseRequest')) {
        this.logger.log(`Usuário ${user.email} é ADMIN/GERENCIA/COMPRAS. Listando todas as requisições.`);
        return this.purchaseRequestsService.findAllAdmin();
    }

    this.logger.log(`Usuário ${user.email} (SOLICITANTE ou similar). Listando apenas suas requisições.`);
    return this.purchaseRequestsService.findAllForUser(user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar requisição de compra por ID',
    description: 'Retorna os detalhes de uma requisição de compra específica pelo ID'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Detalhes da requisição de compra',
    type: Object
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Requisição de compra não encontrada'
  })
  @ApiParam({ name: 'id', type: 'string', description: 'ID da requisição de compra' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: UserWithRoles,
  ): Promise<any> {
    this.logger.log(`Usuário ${user.email} (ID: ${user.id}) buscando requisição de compra ID: ${id}`);
    return this.purchaseRequestsService.findOneForUser(id, user);
  }

  @Patch(':id/transition')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Transitar requisição de compra',
    description: 'Realiza a transição de estado de uma requisição de compra existente'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Requisição de compra atualizada com sucesso',
    type: Object
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de transição inválidos'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Requisição de compra não encontrada'
  })
  @ApiParam({ name: 'id', type: 'string', description: 'ID da requisição de compra' })
  async transition(
    @Param('id') requestId: string,
    @CurrentUser() user: UserWithRoles,
    @Body() transitionDto: TransitionEventDto,
  ): Promise<any> {
    this.logger.log(`Usuário ${user.email} (ID: ${user.id}) tentando transição '${transitionDto.type}' para Requisição ID: ${requestId}`);
    if (!transitionDto || !transitionDto.type) {
      throw new BadRequestException('O tipo do evento de transição é obrigatório.');
    }
    return this.purchaseRequestsService.transition(requestId, user, transitionDto);
  }
}
