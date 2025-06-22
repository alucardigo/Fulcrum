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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../services/users.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const abilities_guard_1 = require("../../casl/abilities.guard");
const check_abilities_decorator_1 = require("../../casl/check-abilities.decorator");
const casl_ability_factory_1 = require("../../casl/casl-ability.factory");
const update_user_role_dto_1 = require("../dto/update-user-role.dto");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../auth/decorators/current-user.decorator");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async findAll(user) {
        return this.usersService.findAll();
    }
    async findOne(id, user) {
        return this.usersService.findOne(id);
    }
    async updateUserRole(userId, updateUserRoleDto, user) {
        return this.usersService.updateUserRole(userId, updateUserRoleDto.role);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, abilities_guard_1.AbilitiesGuard),
    (0, check_abilities_decorator_1.CheckAbilities)({ action: casl_ability_factory_1.Action.Read, subject: 'User' }),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos os usuários (somente Administradores)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de usuários retornada com sucesso.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Acesso negado.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof casl_ability_factory_1.UserWithRoles !== "undefined" && casl_ability_factory_1.UserWithRoles) === "function" ? _a : Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, abilities_guard_1.AbilitiesGuard),
    (0, check_abilities_decorator_1.CheckAbilities)({ action: casl_ability_factory_1.Action.Read, subject: 'User' }),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar um usuário pelo ID (somente Administradores ou o próprio usuário)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Usuário retornado com sucesso.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Acesso negado.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usuário não encontrado.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID do usuário' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_b = typeof casl_ability_factory_1.UserWithRoles !== "undefined" && casl_ability_factory_1.UserWithRoles) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/role'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, abilities_guard_1.AbilitiesGuard),
    (0, check_abilities_decorator_1.CheckAbilities)({ action: casl_ability_factory_1.Action.Update, subject: 'User' }),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar o cargo de um usuário (somente Administradores)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cargo do usuário atualizado com sucesso.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dados inválidos na requisição.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Acesso negado.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usuário não encontrado.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID do usuário a ser atualizado' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_role_dto_1.UpdateUserRoleDto, typeof (_c = typeof casl_ability_factory_1.UserWithRoles !== "undefined" && casl_ability_factory_1.UserWithRoles) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUserRole", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map