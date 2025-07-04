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
exports.CreateProjectDto = void 0;
const class_validator_1 = require("class-validator");
class CreateProjectDto {
    name;
    description;
    budget;
}
exports.CreateProjectDto = CreateProjectDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'O nome do projeto deve ser uma string.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'O nome do projeto não pode estar vazio.' }),
    (0, class_validator_1.MaxLength)(100, { message: 'O nome do projeto deve ter no máximo 100 caracteres.' }),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'A descrição do projeto deve ser uma string.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500, { message: 'A descrição do projeto deve ter no máximo 500 caracteres.' }),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }, { message: 'O orçamento deve ser um número com no máximo 2 casas decimais.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPositive)({ message: 'O orçamento deve ser um valor positivo.' }),
    __metadata("design:type", Number)
], CreateProjectDto.prototype, "budget", void 0);
//# sourceMappingURL=create-project.dto.js.map