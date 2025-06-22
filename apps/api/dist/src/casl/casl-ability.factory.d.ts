import { Ability, InferSubjects } from '@casl/ability';
import { Prisma, User as PrismaUser, PurchaseRequest as PrismaPurchaseRequest, Project as PrismaProject, Item as PrismaItem } from '@prisma/client';
type Models = {
    User: PrismaUser;
    PurchaseRequest: PrismaPurchaseRequest;
    Project: PrismaProject;
    Item: PrismaItem;
};
import { PurchaseRequestState } from '@prisma/client';
export { PurchaseRequestState };
export declare enum UserRole {
    SOLICITANTE = "SOLICITANTE",
    COMPRAS = "COMPRAS",
    GERENCIA = "GERENCIA",
    ADMINISTRADOR = "ADMINISTRADOR"
}
export declare enum Action {
    Manage = "manage",
    Create = "create",
    Read = "read",
    Update = "update",
    Delete = "delete",
    Submit = "submit",
    ApprovePurchase = "approve_purchase",
    ApproveManagement = "approve_management",
    ApproveLevel2 = "approve_level_2",
    Reject = "reject",
    Execute = "execute",
    PlaceOrder = "place_order",
    ReceiveItems = "receive_items",
    Cancel = "cancel"
}
export type Subjects = InferSubjects<keyof Models> | 'all';
export type AppAbility = Ability<[Action, Subjects]>;
export type UserWithRoles = Prisma.UserGetPayload<{
    include: {
        roles: true;
    };
}>;
export declare class CaslAbilityFactory {
    private readonly logger;
    createForUser(user: UserWithRoles | null): AppAbility;
}
