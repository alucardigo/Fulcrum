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
exports.CreateItemDto = void 0;
const class_validator_1 = require("class-validator");
class CreateItemDto {
    name;
    description;
    quantity;
    unitPrice;
    purchaseRequestId;
    supplier;
    url;
}
exports.CreateItemDto = CreateItemDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'O nome do item deve ser uma string.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'O nome do item não pode estar vazio.' }),
    (0, class_validator_1.MaxLength)(150, { message: 'O nome do item deve ter no máximo 150 caracteres.' }),
    __metadata("design:type", String)
], CreateItemDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'A descrição do item deve ser uma string.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500, { message: 'A descrição do item deve ter no máximo 500 caracteres.' }),
    __metadata("design:type", String)
], CreateItemDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'A quantidade deve ser um número.' }),
    (0, class_validator_1.IsPositive)({ message: 'A quantidade deve ser um número positivo.' }),
    (0, class_validator_1.Min)(1, { message: 'A quantidade deve ser pelo menos 1.' }),
    __metadata("design:type", Number)
], CreateItemDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }, { message: 'O preço unitário deve ser um número com no máximo 2 casas decimais.' }),
    (0, class_validator_1.IsPositive)({ message: 'O preço unitário deve ser um valor positivo.' }),
    __metadata("design:type", Number)
], CreateItemDto.prototype, "unitPrice", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'O ID da requisição de compra deve ser uma string.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'O ID da requisição de compra não pode estar vazio.' }),
    __metadata("design:type", String)
], CreateItemDto.prototype, "purchaseRequestId", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'O fornecedor deve ser uma string.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(100, { message: 'O nome do fornecedor deve ter no máximo 100 caracteres.' }),
    __metadata("design:type", String)
], CreateItemDto.prototype, "supplier", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'A URL do produto deve ser uma string.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(2048, { message: 'A URL do produto é muito longa.' }),
    __metadata("design:type", String)
], CreateItemDto.prototype, "url", void 0);
//# sourceMappingURL=create-item.dto.js.map