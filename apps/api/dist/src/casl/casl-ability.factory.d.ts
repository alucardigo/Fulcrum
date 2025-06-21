import { Ability, InferSubjects } from '@casl/ability';
import { Prisma } from '@prisma/client';
type Models = {
    User: any;
    PurchaseRequest: any;
    Project: any;
    Item: any;
};
export declare enum UserRole {
    SOLICITANTE = "SOLICITANTE",
    COMPRAS = "COMPRAS",
    GERENCIA = "GERENCIA",
    ADMINISTRADOR = "ADMINISTRADOR"
}
export declare enum PurchaseRequestState {
    RASCUNHO = "RASCUNHO",
    PENDENTE_COMPRAS = "PENDENTE_COMPRAS",
    PENDENTE_GERENCIA = "PENDENTE_GERENCIA",
    APROVADO = "APROVADO",
    REJEITADO = "REJEITADO",
    COMPRADO = "COMPRADO",
    ENTREGUE = "ENTREGUE",
    CANCELADO = "CANCELADO"
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
    Reject = "reject",
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
export {};
