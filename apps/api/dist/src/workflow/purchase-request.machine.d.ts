import { AppAbility, UserWithRoles } from '../casl/casl-ability.factory';
import { PurchaseRequest, PurchaseRequestState } from '@prisma/client';
export interface PurchaseRequestContext {
    currentUser: UserWithRoles | null;
    requestData: PurchaseRequest | null;
    ability: AppAbility | null;
    errorMessage?: string;
    notes?: string;
}
export type PurchaseRequestEvent = {
    type: 'DRAFT';
    payload?: any;
} | {
    type: 'SUBMIT';
    payload?: any;
    notes?: string;
} | {
    type: 'APPROVE_PURCHASE';
    payload?: any;
    notes?: string;
} | {
    type: 'APPROVE_MANAGEMENT';
    payload?: any;
    notes?: string;
} | {
    type: 'APPROVE_LEVEL_2';
    payload?: any;
    notes?: string;
} | {
    type: 'REJECT';
    payload?: any;
    notes?: string;
    reason?: string;
} | {
    type: 'EXECUTE';
    payload?: any;
    notes?: string;
} | {
    type: 'PLACE_ORDER';
    payload?: any;
    notes?: string;
} | {
    type: 'RECEIVE_PARTIAL';
    payload?: {
        itemId: string;
        quantity: number;
    };
    notes?: string;
} | {
    type: 'RECEIVE_COMPLETE';
    payload?: any;
    notes?: string;
} | {
    type: 'CANCEL';
    payload?: any;
    notes?: string;
};
declare const machine: import("xstate").StateMachine<PurchaseRequestContext, {
    type: "DRAFT";
    payload?: any;
} | {
    type: "SUBMIT";
    payload?: any;
    notes?: string;
} | {
    type: "APPROVE_PURCHASE";
    payload?: any;
    notes?: string;
} | {
    type: "APPROVE_MANAGEMENT";
    payload?: any;
    notes?: string;
} | {
    type: "APPROVE_LEVEL_2";
    payload?: any;
    notes?: string;
} | {
    type: "REJECT";
    payload?: any;
    notes?: string;
    reason?: string;
} | {
    type: "EXECUTE";
    payload?: any;
    notes?: string;
} | {
    type: "PLACE_ORDER";
    payload?: any;
    notes?: string;
} | {
    type: "RECEIVE_PARTIAL";
    payload?: {
        itemId: string;
        quantity: number;
    };
    notes?: string;
} | {
    type: "RECEIVE_COMPLETE";
    payload?: any;
    notes?: string;
} | {
    type: "CANCEL";
    payload?: any;
    notes?: string;
}, {}, never, import("xstate").Values<{
    assignDraft: {
        type: "assignDraft";
        params: import("xstate").NonReducibleUnknown;
    };
    assignPendingPurchase: {
        type: "assignPendingPurchase";
        params: import("xstate").NonReducibleUnknown;
    };
    assignPendingManagement: {
        type: "assignPendingManagement";
        params: import("xstate").NonReducibleUnknown;
    };
    assignApproved: {
        type: "assignApproved";
        params: import("xstate").NonReducibleUnknown;
    };
    assignRejected: {
        type: "assignRejected";
        params: import("xstate").NonReducibleUnknown;
    };
    assignOrdered: {
        type: "assignOrdered";
        params: import("xstate").NonReducibleUnknown;
    };
    assignConcluido: {
        type: "assignConcluido";
        params: import("xstate").NonReducibleUnknown;
    };
}>, {
    type: string;
    params: unknown;
}, never, never, string, import("xstate").NonReducibleUnknown, import("xstate").NonReducibleUnknown, import("xstate").EventObject, import("xstate").MetaObject, {
    readonly id: "purchaseRequestWorkflow";
    readonly initial: any;
    readonly context: PurchaseRequestContext;
    readonly states: {
        readonly [PurchaseRequestState.RASCUNHO]: {
            on: {
                SUBMIT: {
                    target: any;
                    cond: "canSubmit";
                    actions: "assignPendingPurchase";
                };
            };
        };
        readonly [PurchaseRequestState.PENDENTE_COMPRAS]: {
            on: {
                APPROVE_PURCHASE: {
                    target: any;
                    cond: "canApprovePurchase";
                    actions: "assignPendingManagement";
                };
                REJECT: {
                    target: any;
                    cond: "canReject";
                    actions: "assignRejected";
                };
            };
        };
        readonly [PurchaseRequestState.PENDENTE_GERENCIA]: {
            on: {
                APPROVE_LEVEL_2: {
                    target: any;
                    cond: "canApproveLevel2";
                    actions: "assignApproved";
                };
                REJECT: {
                    target: any;
                    cond: "canReject";
                    actions: "assignRejected";
                };
            };
        };
        readonly [PurchaseRequestState.APROVADO]: {
            on: {
                EXECUTE: {
                    target: any;
                    cond: "canExecute";
                    actions: "assignConcluido";
                };
            };
        };
        readonly [PurchaseRequestState.REJEITADO]: {
            type: "final";
        };
        readonly [PurchaseRequestState.CONCLUIDO]: {
            type: "final";
        };
    };
}>;
export { machine as purchaseRequestMachine };
