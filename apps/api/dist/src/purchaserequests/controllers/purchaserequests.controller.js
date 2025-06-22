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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PurchaseRequestsController_1;
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseRequestsController = void 0;
const common_1 = require("@nestjs/common");
const purchaserequests_service_1 = require("../services/purchaserequests.service");
const create_purchase_request_dto_1 = require("../dto/create-purchase-request.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../auth/decorators/current-user.decorator");
const casl_ability_factory_1 = require("../../casl/casl-ability.factory");
const swagger_1 = require("@nestjs/swagger");
class TransitionEventDto {
    type;
    payload;
    notes;
}
let PurchaseRequestsController = PurchaseRequestsController_1 = class PurchaseRequestsController {
    purchaseRequestsService;
    caslFactory;
    logger = new common_1.Logger(PurchaseRequestsController_1.name);
    constructor(purchaseRequestsService, caslFactory) {
        this.purchaseRequestsService = purchaseRequestsService;
        this.caslFactory = caslFactory;
    }
    async create(createDto, user) {
        this.logger.log(`Usuário ${user.email} (ID: ${user.id}) criando nova requisição de compra: ${createDto.title}`);
        const ability = this.caslFactory.createForUser(user);
        if (!ability.can(casl_ability_factory_1.Action.Create, 'PurchaseRequest')) {
            this.logger.warn(`Usuário ${user.email} não tem permissão para criar requisições.`);
            throw new common_1.ForbiddenException('Você não tem permissão para criar requisições de compra.');
        }
        return this.purchaseRequestsService.create(createDto, user.id);
    }
    async findAll(user) {
        this.logger.log(`Usuário ${user.email} (ID: ${user.id}) buscando requisições de compra.`);
        const ability = this.caslFactory.createForUser(user);
        const isAdminOrManagerOrCompras = user.roles.some(role => role.role === 'ADMINISTRADOR' ||
            role.role === 'GERENCIA' ||
            role.role === 'COMPRAS');
        if (isAdminOrManagerOrCompras && ability.can(casl_ability_factory_1.Action.Read, 'PurchaseRequest')) {
            this.logger.log(`Usuário ${user.email} é ADMIN/GERENCIA/COMPRAS. Listando todas as requisições.`);
            return this.purchaseRequestsService.findAllAdmin();
        }
        this.logger.log(`Usuário ${user.email} (SOLICITANTE ou similar). Listando apenas suas requisições.`);
        return this.purchaseRequestsService.findAllForUser(user.id);
    }
    async findOne(id, user) {
        this.logger.log(`Usuário ${user.email} (ID: ${user.id}) buscando requisição de compra ID: ${id}`);
        return this.purchaseRequestsService.findOneForUser(id, user);
    }
    async transition(requestId, user, transitionDto) {
        this.logger.log(`Usuário ${user.email} (ID: ${user.id}) tentando transição '${transitionDto.type}' para Requisição ID: ${requestId}`);
        if (!transitionDto || !transitionDto.type) {
            throw new common_1.BadRequestException('O tipo do evento de transição é obrigatório.');
        }
        return this.purchaseRequestsService.transition(requestId, user, transitionDto);
    }
};
exports.PurchaseRequestsController = PurchaseRequestsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Criar nova requisição de compra',
        description: 'Cria uma nova requisição de compra no sistema. O usuário deve ter permissão para criar requisições.'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Requisição criada com sucesso',
        type: Object
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.FORBIDDEN,
        description: 'Usuário não tem permissão para criar requisições'
    }),
    (0, swagger_1.ApiBody)({ type: create_purchase_request_dto_1.CreatePurchaseRequestDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_purchase_request_dto_1.CreatePurchaseRequestDto, typeof (_a = typeof casl_ability_factory_1.UserWithRoles !== "undefined" && casl_ability_factory_1.UserWithRoles) === "function" ? _a : Object]),
    __metadata("design:returntype", Promise)
], PurchaseRequestsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Listar todas as requisições de compra',
        description: 'Retorna todas as requisições de compra que o usuário tem permissão para visualizar'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Lista de requisições de compra',
        type: [Object]
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof casl_ability_factory_1.UserWithRoles !== "undefined" && casl_ability_factory_1.UserWithRoles) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], PurchaseRequestsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Buscar requisição de compra por ID',
        description: 'Retorna os detalhes de uma requisição de compra específica pelo ID'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Detalhes da requisição de compra',
        type: Object
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Requisição de compra não encontrada'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', description: 'ID da requisição de compra' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_c = typeof casl_ability_factory_1.UserWithRoles !== "undefined" && casl_ability_factory_1.UserWithRoles) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], PurchaseRequestsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/transition'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Transitar requisição de compra',
        description: 'Realiza a transição de estado de uma requisição de compra existente'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Requisição de compra atualizada com sucesso',
        type: Object
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Dados de transição inválidos'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Requisição de compra não encontrada'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', description: 'ID da requisição de compra' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_d = typeof casl_ability_factory_1.UserWithRoles !== "undefined" && casl_ability_factory_1.UserWithRoles) === "function" ? _d : Object, TransitionEventDto]),
    __metadata("design:returntype", Promise)
], PurchaseRequestsController.prototype, "transition", null);
exports.PurchaseRequestsController = PurchaseRequestsController = PurchaseRequestsController_1 = __decorate([
    (0, swagger_1.ApiTags)('purchaserequests'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('purchase-requests'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [purchaserequests_service_1.PurchaseRequestsService,
        casl_ability_factory_1.CaslAbilityFactory])
], PurchaseRequestsController);
//# sourceMappingURL=purchaserequests.controller.js.map