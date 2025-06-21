import { PurchaseRequestsService } from '../services/purchaserequests.service';
import { CreatePurchaseRequestDto } from '../dto/create-purchase-request.dto';
import { UserWithRoles, CaslAbilityFactory } from '../../casl/casl-ability.factory';
import { PurchaseRequestEvent } from '../../workflow/purchase-request.machine';
declare class TransitionEventDto {
    type: PurchaseRequestEvent['type'];
    payload?: any;
    notes?: string;
}
export declare class PurchaseRequestsController {
    private readonly purchaseRequestsService;
    private readonly caslFactory;
    private readonly logger;
    constructor(purchaseRequestsService: PurchaseRequestsService, caslFactory: CaslAbilityFactory);
    create(createDto: CreatePurchaseRequestDto, user: UserWithRoles): Promise<any>;
    findAll(user: UserWithRoles): Promise<any[]>;
    findOne(id: string, user: UserWithRoles): Promise<any>;
    transition(requestId: string, user: UserWithRoles, transitionDto: TransitionEventDto): Promise<any>;
}
export {};
