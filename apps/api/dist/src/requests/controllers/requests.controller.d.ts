import { RequestsService } from '../services/requests.service';
export declare class RequestsController {
    private readonly requestsService;
    constructor(requestsService: RequestsService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        costCenter: string | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import(".prisma/client").$Enums.PurchaseRequestState;
        title: string;
        priority: import(".prisma/client").$Enums.PurchaseRequestPriority;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        requesterId: string;
        approverId: string | null;
        projectId: string | null;
        justification: string | null;
        rejectionReason: string | null;
        expectedDeliveryDate: Date | null;
        approvedAt: Date | null;
        rejectedAt: Date | null;
        orderedAt: Date | null;
        deliveredAt: Date | null;
    }[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__PurchaseRequestClient<{
        id: string;
        costCenter: string | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import(".prisma/client").$Enums.PurchaseRequestState;
        title: string;
        priority: import(".prisma/client").$Enums.PurchaseRequestPriority;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        requesterId: string;
        approverId: string | null;
        projectId: string | null;
        justification: string | null;
        rejectionReason: string | null;
        expectedDeliveryDate: Date | null;
        approvedAt: Date | null;
        rejectedAt: Date | null;
        orderedAt: Date | null;
        deliveredAt: Date | null;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
