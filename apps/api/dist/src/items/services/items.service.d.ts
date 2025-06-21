import { PrismaService } from '../../prisma.service';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { Item } from '@prisma/client';
export declare class ItemsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private _calculateTotalPrice;
    private _validatePurchaseRequestExists;
    create(createItemDto: CreateItemDto): Promise<Item>;
    findAllByRequestId(purchaseRequestId: string): Promise<Item[]>;
    findOne(id: string): Promise<Item | null>;
    update(id: string, updateItemDto: UpdateItemDto): Promise<Item>;
    remove(id: string): Promise<Item>;
}
