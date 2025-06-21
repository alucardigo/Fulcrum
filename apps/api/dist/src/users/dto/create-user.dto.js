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
exports.CreateUserDto = void 0;
const class_validator_1 = require("class-validator");
class CreateUserDto {
    primeiroNome;
    ultimoNome;
    email;
    senha;
    cargo;
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'O primeiro nome não pode estar vazio.' }),
    (0, class_validator_1.MaxLength)(50, { message: 'O primeiro nome deve ter no máximo 50 caracteres.' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "primeiroNome", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'O último nome não pode estar vazio.' }),
    (0, class_validator_1.MaxLength)(50, { message: 'O último nome deve ter no máximo 50 caracteres.' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "ultimoNome", void 0);
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Por favor, forneça um endereço de email válido.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'O email não pode estar vazio.' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'A senha não pode estar vazia.' }),
    (0, class_validator_1.MinLength)(8, { message: 'A senha deve ter pelo menos 8 caracteres.' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "senha", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(50, { message: 'O cargo deve ter no máximo 50 caracteres.' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "cargo", void 0);
//# sourceMappingURL=create-user.dto.js.map