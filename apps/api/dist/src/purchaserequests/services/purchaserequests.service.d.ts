import { PrismaService } from '../../prisma.service';
import { ItemsService } from '../../items/services/items.service';
import { CreatePurchaseRequestDto } from '../dto/create-purchase-request.dto';
import { PurchaseRequest } from '@prisma/client';
import { CaslAbilityFactory, UserWithRoles } from '../../casl/casl-ability.factory';
import { PurchaseRequestEvent } from '../../workflow/purchase-request.machine';
export declare class PurchaseRequestsService {
    private readonly prisma;
    private readonly itemsService;
    private readonly caslFactory;
    private readonly logger;
    constructor(prisma: PrismaService, itemsService: ItemsService, caslFactory: CaslAbilityFactory);
    create(createDto: CreatePurchaseRequestDto, userId: string): Promise<any>;
    findAllForUser(userId: string): Promise<PurchaseRequest[]>;
    findAllAdmin(): Promise<PurchaseRequest[]>;
    findOneWithDetails(id: string): Promise<PurchaseRequest | null>;
    findOneForUser(id: string, userPerformingAction: UserWithRoles): Promise<any>;
    transition(requestId: string, performingUser: UserWithRoles, eventDto: {
        type: PurchaseRequestEvent['type'];
        payload?: any;
        notes?: string;
    }): Promise<PurchaseRequest>;
}
