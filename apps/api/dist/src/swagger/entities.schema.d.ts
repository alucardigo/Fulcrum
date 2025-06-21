export declare class PurchaseRequestEntity {
    id: number;
    title: string;
    description: string;
    state: string;
    projectId: number;
    createdById: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class UserEntity {
    id: number;
    email: string;
    name: string;
    isActive: boolean;
    roles: string[];
    createdAt: Date;
    updatedAt: Date;
}
export declare class ProjectEntity {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
    managerId: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class ItemEntity {
    id: number;
    name: string;
    description: string;
    category: string;
    sku: string;
    createdAt: Date;
    updatedAt: Date;
}
