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
var ItemsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const library_1 = require("@prisma/client/runtime/library");
let ItemsService = ItemsService_1 = class ItemsService {
    prisma;
    logger = new common_1.Logger(ItemsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async _calculateTotalPrice(quantity, unitPrice) {
        const unitPriceDecimal = new library_1.Decimal(unitPrice.toString());
        return unitPriceDecimal.mul(quantity);
    }
    async _validatePurchaseRequestExists(purchaseRequestId) {
        const purchaseRequest = await this.prisma.purchaseRequest.findUnique({
            where: { id: purchaseRequestId },
        });
        if (!purchaseRequest) {
            this.logger.warn(`Requisição de Compra com ID: ${purchaseRequestId} não encontrada ao tentar operar em um Item.`);
            throw new common_1.NotFoundException(`Requisição de Compra com ID '${purchaseRequestId}' não encontrada.`);
        }
    }
    async create(createItemDto) {
        const { purchaseRequestId, quantity, unitPrice, ...itemData } = createItemDto;
        this.logger.log(`Criando novo item para Requisição ID: ${purchaseRequestId} com nome: ${itemData.name}`);
        await this._validatePurchaseRequestExists(purchaseRequestId);
        const unitPriceDecimal = new library_1.Decimal(unitPrice);
        const totalPrice = await this._calculateTotalPrice(quantity, unitPriceDecimal);
        try {
            const item = await this.prisma.item.create({
                data: {
                    ...itemData,
                    quantity,
                    unitPrice: unitPriceDecimal,
                    totalPrice,
                    purchaseRequest: {
                        connect: { id: purchaseRequestId },
                    },
                },
            });
            this.logger.log(`Item ID: ${item.id} criado com sucesso para Requisição ID: ${purchaseRequestId}`);
            return item;
        }
        catch (error) {
            this.logger.error(`Falha ao criar item para Requisição ID: ${purchaseRequestId}`, error.stack);
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException(`Requisição de Compra com ID '${purchaseRequestId}' não encontrada ao tentar conectar o item.`);
            }
            throw new common_1.InternalServerErrorException('Não foi possível criar o item.');
        }
    }
    async findAllByRequestId(purchaseRequestId) {
        this.logger.log(`Buscando todos os itens para Requisição ID: ${purchaseRequestId}`);
        await this._validatePurchaseRequestExists(purchaseRequestId);
        return this.prisma.item.findMany({
            where: { purchaseRequestId },
        });
    }
    async findOne(id) {
        this.logger.log(`Buscando item com ID: ${id}`);
        const item = await this.prisma.item.findUnique({
            where: { id },
        });
        if (!item) {
            this.logger.warn(`Item com ID: ${id} não encontrado.`);
            throw new common_1.NotFoundException(`Item com ID '${id}' não encontrado.`);
        }
        return item;
    }
    async update(id, updateItemDto) {
        this.logger.log(`Atualizando item com ID: ${id}`);
        const existingItem = await this.prisma.item.findUnique({ where: { id } });
        if (!existingItem) {
            this.logger.warn(`Item com ID: ${id} não encontrado para atualização.`);
            throw new common_1.NotFoundException(`Item com ID '${id}' não encontrado.`);
        }
        const dataToUpdate = { ...updateItemDto };
        const newQuantity = updateItemDto.quantity !== undefined ? updateItemDto.quantity : existingItem.quantity;
        const newUnitPriceSource = updateItemDto.unitPrice !== undefined ? updateItemDto.unitPrice : existingItem.unitPrice;
        const newUnitPriceDecimal = new library_1.Decimal(newUnitPriceSource.toString());
        if (updateItemDto.quantity !== undefined || updateItemDto.unitPrice !== undefined) {
            dataToUpdate.totalPrice = await this._calculateTotalPrice(newQuantity, newUnitPriceDecimal);
        }
        if (updateItemDto.unitPrice !== undefined) {
            dataToUpdate.unitPrice = newUnitPriceDecimal;
        }
        try {
            const updatedItem = await this.prisma.item.update({
                where: { id },
                data: dataToUpdate,
            });
            this.logger.log(`Item ID: ${id} atualizado com sucesso.`);
            return updatedItem;
        }
        catch (error) {
            this.logger.error(`Falha ao atualizar item ID: ${id}`, error.stack);
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException(`Item com ID '${id}' não encontrado para atualização.`);
            }
            throw new common_1.InternalServerErrorException('Não foi possível atualizar o item.');
        }
    }
    async remove(id) {
        this.logger.log(`Removendo item com ID: ${id}`);
        const existingItem = await this.prisma.item.findUnique({ where: { id } });
        if (!existingItem) {
            this.logger.warn(`Item com ID: ${id} não encontrado para remoção.`);
            throw new common_1.NotFoundException(`Item com ID '${id}' não encontrado.`);
        }
        try {
            const deletedItem = await this.prisma.item.delete({
                where: { id },
            });
            this.logger.log(`Item ID: ${id} removido com sucesso.`);
            return deletedItem;
        }
        catch (error) {
            this.logger.error(`Falha ao remover item ID: ${id}`, error.stack);
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException(`Item com ID '${id}' não encontrado para remoção.`);
            }
            throw new common_1.InternalServerErrorException('Não foi possível remover o item.');
        }
    }
};
exports.ItemsService = ItemsService;
exports.ItemsService = ItemsService = ItemsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ItemsService);
//# sourceMappingURL=items.service.js.map