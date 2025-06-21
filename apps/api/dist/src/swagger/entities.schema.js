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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemEntity = exports.ProjectEntity = exports.UserEntity = exports.PurchaseRequestEntity = void 0;
const swagger_1 = require("@nestjs/swagger");
class PurchaseRequestEntity {
    id;
    title;
    description;
    state;
    projectId;
    createdById;
    createdAt;
    updatedAt;
}
exports.PurchaseRequestEntity = PurchaseRequestEntity;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'ID único da requisição' }),
    __metadata("design:type", Number)
], PurchaseRequestEntity.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Compra de laptops', description: 'Título da requisição' }),
    __metadata("design:type", String)
], PurchaseRequestEntity.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Compra de 10 laptops para o time de desenvolvimento', description: 'Descrição detalhada' }),
    __metadata("design:type", String)
], PurchaseRequestEntity.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'DRAFT', description: 'Estado atual da requisição no workflow' }),
    __metadata("design:type", String)
], PurchaseRequestEntity.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'ID do projeto relacionado' }),
    __metadata("design:type", Number)
], PurchaseRequestEntity.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'ID do usuário que criou a requisição' }),
    __metadata("design:type", Number)
], PurchaseRequestEntity.prototype, "createdById", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: new Date(), description: 'Data de criação' }),
    __metadata("design:type", Date)
], PurchaseRequestEntity.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: new Date(), description: 'Data da última atualização' }),
    __metadata("design:type", Date)
], PurchaseRequestEntity.prototype, "updatedAt", void 0);
class UserEntity {
    id;
    email;
    name;
    isActive;
    roles;
    createdAt;
    updatedAt;
}
exports.UserEntity = UserEntity;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'ID único do usuário' }),
    __metadata("design:type", Number)
], UserEntity.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@example.com', description: 'Email do usuário' }),
    __metadata("design:type", String)
], UserEntity.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'João Silva', description: 'Nome completo do usuário' }),
    __metadata("design:type", String)
], UserEntity.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Se o usuário está ativo' }),
    __metadata("design:type", Boolean)
], UserEntity.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['USUARIO', 'COMPRAS'], description: 'Papéis do usuário no sistema' }),
    __metadata("design:type", Array)
], UserEntity.prototype, "roles", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: new Date(), description: 'Data de criação' }),
    __metadata("design:type", Date)
], UserEntity.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: new Date(), description: 'Data da última atualização' }),
    __metadata("design:type", Date)
], UserEntity.prototype, "updatedAt", void 0);
class ProjectEntity {
    id;
    name;
    description;
    isActive;
    managerId;
    createdAt;
    updatedAt;
}
exports.ProjectEntity = ProjectEntity;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'ID único do projeto' }),
    __metadata("design:type", Number)
], ProjectEntity.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Projeto Alpha', description: 'Nome do projeto' }),
    __metadata("design:type", String)
], ProjectEntity.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Projeto de expansão da área de TI', description: 'Descrição do projeto' }),
    __metadata("design:type", String)
], ProjectEntity.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Se o projeto está ativo' }),
    __metadata("design:type", Boolean)
], ProjectEntity.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'ID do gerente do projeto' }),
    __metadata("design:type", Number)
], ProjectEntity.prototype, "managerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: new Date(), description: 'Data de criação' }),
    __metadata("design:type", Date)
], ProjectEntity.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: new Date(), description: 'Data da última atualização' }),
    __metadata("design:type", Date)
], ProjectEntity.prototype, "updatedAt", void 0);
class ItemEntity {
    id;
    name;
    description;
    category;
    sku;
    createdAt;
    updatedAt;
}
exports.ItemEntity = ItemEntity;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'ID único do item' }),
    __metadata("design:type", Number)
], ItemEntity.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Laptop Dell XPS', description: 'Nome do item' }),
    __metadata("design:type", String)
], ItemEntity.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Laptop Dell XPS 15" 32GB RAM', description: 'Descrição do item' }),
    __metadata("design:type", String)
], ItemEntity.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'HARDWARE', description: 'Categoria do item' }),
    __metadata("design:type", String)
], ItemEntity.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ABC123', description: 'Código SKU do item' }),
    __metadata("design:type", String)
], ItemEntity.prototype, "sku", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: new Date(), description: 'Data de criação' }),
    __metadata("design:type", Date)
], ItemEntity.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: new Date(), description: 'Data da última atualização' }),
    __metadata("design:type", Date)
], ItemEntity.prototype, "updatedAt", void 0);
//# sourceMappingURL=entities.schema.js.map