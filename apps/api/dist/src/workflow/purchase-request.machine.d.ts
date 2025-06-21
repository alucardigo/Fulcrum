import { AppAbility } from '../casl/casl-ability.factory';
import { PurchaseRequest, User } from '@prisma/client';
export interface PurchaseRequestContext {
    currentUser: User | null;
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
    type: 'REJECT';
    payload?: any;
    notes?: string;
    reason: string;
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
    type: "REJECT";
    payload?: any;
    notes?: string;
    reason: string;
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
}>, {
    type: string;
    params: unknown;
}, never, {}, string, import("xstate").NonReducibleUnknown, import("xstate").NonReducibleUnknown, import("xstate").EventObject, import("xstate").MetaObject, {
    readonly context: PurchaseRequestContext;
    readonly states: {};
}>;
export { machine as purchaseRequestMachine };
