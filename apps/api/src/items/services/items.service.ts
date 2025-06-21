import { Injectable, Logger, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto'; // Assuming update-item.dto.ts exports UpdateItemDto (which is UpdateItemManuallyDto)
import { Item, Prisma } from '@prisma/client'; // Import Prisma for Prisma.Decimal
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ItemsService {
  private readonly logger = new Logger(ItemsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async _calculateTotalPrice(quantity: number, unitPrice: number | Decimal): Promise<Decimal> {
    const unitPriceDecimal = new Decimal(unitPrice.toString()); // Ensure unitPrice is treated as Decimal source
    return unitPriceDecimal.mul(quantity);
  }

  private async _validatePurchaseRequestExists(purchaseRequestId: string): Promise<void> {
    const purchaseRequest = await this.prisma.purchaseRequest.findUnique({
      where: { id: purchaseRequestId },
    });
    if (!purchaseRequest) {
      this.logger.warn(`Requisição de Compra com ID: ${purchaseRequestId} não encontrada ao tentar operar em um Item.`);
      throw new NotFoundException(`Requisição de Compra com ID '${purchaseRequestId}' não encontrada.`);
    }
  }

  async create(createItemDto: CreateItemDto): Promise<Item> {
    const { purchaseRequestId, quantity, unitPrice, ...itemData } = createItemDto;
    this.logger.log(`Criando novo item para Requisição ID: ${purchaseRequestId} com nome: ${itemData.name}`);

    await this._validatePurchaseRequestExists(purchaseRequestId);

    const unitPriceDecimal = new Decimal(unitPrice);
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
    } catch (error) {
      this.logger.error(`Falha ao criar item para Requisição ID: ${purchaseRequestId}`, error.stack);
      if (error.code === 'P2025') {
        throw new NotFoundException(`Requisição de Compra com ID '${purchaseRequestId}' não encontrada ao tentar conectar o item.`);
      }
      throw new InternalServerErrorException('Não foi possível criar o item.');
    }
  }

  async findAllByRequestId(purchaseRequestId: string): Promise<Item[]> {
    this.logger.log(`Buscando todos os itens para Requisição ID: ${purchaseRequestId}`);
    await this._validatePurchaseRequestExists(purchaseRequestId);
    return this.prisma.item.findMany({
      where: { purchaseRequestId },
    });
  }

  async findOne(id: string): Promise<Item | null> {
    this.logger.log(`Buscando item com ID: ${id}`);
    const item = await this.prisma.item.findUnique({
      where: { id },
    });
    if (!item) {
      this.logger.warn(`Item com ID: ${id} não encontrado.`);
      throw new NotFoundException(`Item com ID '${id}' não encontrado.`);
    }
    return item;
  }

  async update(id: string, updateItemDto: UpdateItemDto): Promise<Item> {
    this.logger.log(`Atualizando item com ID: ${id}`);

    const existingItem = await this.prisma.item.findUnique({ where: { id } });
    if (!existingItem) {
      this.logger.warn(`Item com ID: ${id} não encontrado para atualização.`);
      throw new NotFoundException(`Item com ID '${id}' não encontrado.`);
    }

    // purchaseRequestId should not be in UpdateItemDto as per Turn 57 DTO definition
    // if ('purchaseRequestId' in updateItemDto && (updateItemDto as any).purchaseRequestId !== undefined) {
    //     this.logger.error(`Tentativa de alterar purchaseRequestId do item ${id}, o que não é permitido.`);
    //     throw new BadRequestException('Não é permitido alterar a requisição de compra de um item existente.');
    // }

    const dataToUpdate: Prisma.ItemUpdateInput = { ...updateItemDto };

    const newQuantity = updateItemDto.quantity !== undefined ? updateItemDto.quantity : existingItem.quantity;
    // existingItem.unitPrice is already a Decimal type from Prisma
    const newUnitPriceSource = updateItemDto.unitPrice !== undefined ? updateItemDto.unitPrice : existingItem.unitPrice;
    const newUnitPriceDecimal = new Decimal(newUnitPriceSource.toString());


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
    } catch (error) {
      this.logger.error(`Falha ao atualizar item ID: ${id}`, error.stack);
      if (error.code === 'P2025') {
        throw new NotFoundException(`Item com ID '${id}' não encontrado para atualização.`);
      }
      throw new InternalServerErrorException('Não foi possível atualizar o item.');
    }
  }

  async remove(id: string): Promise<Item> {
    this.logger.log(`Removendo item com ID: ${id}`);
    const existingItem = await this.prisma.item.findUnique({ where: { id } });
    if (!existingItem) {
      this.logger.warn(`Item com ID: ${id} não encontrado para remoção.`);
      throw new NotFoundException(`Item com ID '${id}' não encontrado.`);
    }

    try {
      const deletedItem = await this.prisma.item.delete({
        where: { id },
      });
      this.logger.log(`Item ID: ${id} removido com sucesso.`);
      return deletedItem;
    } catch (error) {
      this.logger.error(`Falha ao remover item ID: ${id}`, error.stack);
      if (error.code === 'P2025') {
        throw new NotFoundException(`Item com ID '${id}' não encontrado para remoção.`);
      }
      throw new InternalServerErrorException('Não foi possível remover o item.');
    }
  }
}
