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
exports.CreatePurchaseRequestDto = void 0;
const nestjs_zod_1 = require("nestjs-zod");
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const CreatePurchaseRequestSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(200).nonempty('O título da requisição não pode estar vazio.'),
    description: zod_1.z.string().max(1000).optional(),
    priority: zod_1.z.nativeEnum(client_1.PurchaseRequestPriority),
    projectId: zod_1.z.string().cuid().optional(),
    costCenter: zod_1.z.string().optional(),
    justification: zod_1.z.string().min(10).max(2000),
    expectedDeliveryDate: zod_1.z.date().optional(),
    items: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string().min(3).max(200),
        description: zod_1.z.string().max(1000).optional(),
        quantity: zod_1.z.number().int().positive(),
        unitPrice: zod_1.z.number().positive(),
        supplier: zod_1.z.string().optional(),
        supplierCNPJ: zod_1.z.string().regex(/^\d{14}$/, 'CNPJ inválido').optional(),
    }))
});
class CreatePurchaseRequestDto extends (0, nestjs_zod_1.createZodDto)(CreatePurchaseRequestSchema) {
    title;
    description;
    priority;
    projectId;
    costCenter;
    justification;
    expectedDeliveryDate;
    items;
}
exports.CreatePurchaseRequestDto = CreatePurchaseRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Compra de laptops',
        description: 'Título da requisição de compra'
    }),
    __metadata("design:type", String)
], CreatePurchaseRequestDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Aquisição de 10 laptops para o time de desenvolvimento',
        description: 'Descrição detalhada da requisição',
        required: false
    }),
    __metadata("design:type", String)
], CreatePurchaseRequestDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.PurchaseRequestPriority,
        example: 'NORMAL',
        description: 'Prioridade da requisição'
    }),
    __metadata("design:type", typeof (_a = typeof client_1.PurchaseRequestPriority !== "undefined" && client_1.PurchaseRequestPriority) === "function" ? _a : Object)
], CreatePurchaseRequestDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'ckwq3c9p30000jkr9j8q1q1q1',
        description: 'ID do projeto relacionado',
        required: false
    }),
    __metadata("design:type", String)
], CreatePurchaseRequestDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'CC-001',
        description: 'Centro de custo',
        required: false
    }),
    __metadata("design:type", String)
], CreatePurchaseRequestDto.prototype, "costCenter", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Necessário para equipar novos desenvolvedores',
        description: 'Justificativa para a compra'
    }),
    __metadata("design:type", String)
], CreatePurchaseRequestDto.prototype, "justification", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-12-31',
        description: 'Data prevista para entrega',
        required: false
    }),
    __metadata("design:type", Date)
], CreatePurchaseRequestDto.prototype, "expectedDeliveryDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'array',
        items: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Laptop Dell XPS' },
                description: { type: 'string', example: 'Laptop Dell XPS 15" 32GB RAM' },
                quantity: { type: 'number', example: 10 },
                unitPrice: { type: 'number', example: 8000.00 },
                supplier: { type: 'string', example: 'Dell Computadores' },
                supplierCNPJ: { type: 'string', example: '72381189000110' }
            }
        }
    }),
    __metadata("design:type", Array)
], CreatePurchaseRequestDto.prototype, "items", void 0);
//# sourceMappingURL=create-purchase-request.dto.js.map