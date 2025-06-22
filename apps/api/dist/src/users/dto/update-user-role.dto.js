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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserRoleDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
class UpdateUserRoleDto {
    role;
}
exports.UpdateUserRoleDto = UpdateUserRoleDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'O novo cargo a ser atribuído ao usuário.',
        enum: client_1.UserRole,
        example: client_1.UserRole.COMPRAS,
    }),
    (0, class_validator_1.IsNotEmpty)({ message: 'O cargo não pode estar vazio.' }),
    (0, class_validator_1.IsEnum)(client_1.UserRole, { message: 'Cargo inválido.' }),
    __metadata("design:type", typeof (_a = typeof client_1.UserRole !== "undefined" && client_1.UserRole) === "function" ? _a : Object)
], UpdateUserRoleDto.prototype, "role", void 0);
//# sourceMappingURL=update-user-role.dto.js.map