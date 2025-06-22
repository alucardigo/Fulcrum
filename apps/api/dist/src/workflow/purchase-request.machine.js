"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseRequestMachine = void 0;
const xstate_1 = require("xstate");
const casl_ability_factory_1 = require("../casl/casl-ability.factory");
const client_1 = require("@prisma/client");
function makeAbilityGuard(action, extraCheck) {
    return ({ context }) => {
        const { ability, requestData, currentUser } = context;
        if (!ability || !requestData)
            return false;
        const ok = ability.can(action, 'PurchaseRequest') && (!extraCheck || extraCheck(context));
        if (!ok) {
            console.warn(`[Guard ${action}] Denied for ${currentUser?.email} on PR ${requestData.id}`);
        }
        return ok;
    };
}
const guardDefinitions = [
    { key: 'canSubmit', action: casl_ability_factory_1.Action.Submit },
    { key: 'canApprovePurchase', action: casl_ability_factory_1.Action.ApprovePurchase },
    {
        key: 'canApproveManagement',
        action: casl_ability_factory_1.Action.ApproveManagement,
        extraCheck: (context) => {
            const totalAmount = context.requestData?.totalAmount || 0;
            const approvalLimit = context.currentUser?.approvalLimit || 0;
            return totalAmount <= approvalLimit;
        }
    },
    { key: 'canReject', action: casl_ability_factory_1.Action.Reject },
    { key: 'canPlaceOrder', action: casl_ability_factory_1.Action.PlaceOrder },
    { key: 'canApproveLevel2', action: casl_ability_factory_1.Action.ApproveLevel2 },
    { key: 'canExecute', action: casl_ability_factory_1.Action.Execute },
];
const guards = Object.fromEntries(guardDefinitions.map(({ key, action, extraCheck }) => [key, makeAbilityGuard(action, extraCheck)]));
const machine = (0, xstate_1.setup)({
    types: {
        context: {},
        events: {},
    },
    guards,
    actions: {
        assignDraft: (0, xstate_1.assign)(({ context }) => ({
            requestData: context.requestData ? { ...context.requestData, status: client_1.PurchaseRequestState.RASCUNHO } : null,
        })),
        assignPendingPurchase: (0, xstate_1.assign)(({ context }) => ({
            requestData: context.requestData ? { ...context.requestData, status: client_1.PurchaseRequestState.PENDENTE_COMPRAS } : null,
        })),
        assignPendingManagement: (0, xstate_1.assign)(({ context }) => ({
            requestData: context.requestData ? { ...context.requestData, status: client_1.PurchaseRequestState.PENDENTE_GERENCIA } : null,
        })),
        assignApproved: (0, xstate_1.assign)(({ context }) => ({
            requestData: context.requestData ? { ...context.requestData, status: client_1.PurchaseRequestState.APROVADO } : null,
        })),
        assignRejected: (0, xstate_1.assign)(({ context, event }) => {
            const typedEvent = event;
            return {
                requestData: context.requestData ? {
                    ...context.requestData,
                    status: client_1.PurchaseRequestState.REJEITADO,
                    notes: typedEvent.notes || context.requestData.notes,
                    rejectionReason: typedEvent.payload?.reason || typedEvent.reason || null
                } : null,
            };
        }),
        assignOrdered: (0, xstate_1.assign)(({ context }) => ({
            requestData: context.requestData ? { ...context.requestData, status: client_1.PurchaseRequestState.COMPRADO } : null,
        })),
        assignConcluido: (0, xstate_1.assign)(({ context }) => ({
            requestData: context.requestData ? { ...context.requestData, status: client_1.PurchaseRequestState.CONCLUIDO } : null,
        })),
    },
}).createMachine({
    id: 'purchaseRequestWorkflow',
    initial: client_1.PurchaseRequestState.RASCUNHO,
    context: {
        currentUser: null,
        requestData: null,
        ability: null,
        errorMessage: undefined,
        notes: undefined,
    },
    states: {
        [client_1.PurchaseRequestState.RASCUNHO]: {
            on: {
                SUBMIT: { target: client_1.PurchaseRequestState.PENDENTE_COMPRAS, cond: 'canSubmit', actions: 'assignPendingPurchase' },
            },
        },
        [client_1.PurchaseRequestState.PENDENTE_COMPRAS]: {
            on: {
                APPROVE_PURCHASE: { target: client_1.PurchaseRequestState.PENDENTE_GERENCIA, cond: 'canApprovePurchase', actions: 'assignPendingManagement' },
                REJECT: { target: client_1.PurchaseRequestState.REJEITADO, cond: 'canReject', actions: 'assignRejected' },
            },
        },
        [client_1.PurchaseRequestState.PENDENTE_GERENCIA]: {
            on: {
                APPROVE_LEVEL_2: { target: client_1.PurchaseRequestState.APROVADO, cond: 'canApproveLevel2', actions: 'assignApproved' },
                REJECT: { target: client_1.PurchaseRequestState.REJEITADO, cond: 'canReject', actions: 'assignRejected' },
            },
        },
        [client_1.PurchaseRequestState.APROVADO]: {
            on: {
                EXECUTE: { target: client_1.PurchaseRequestState.CONCLUIDO, cond: 'canExecute', actions: 'assignConcluido' },
            },
        },
        [client_1.PurchaseRequestState.REJEITADO]: {
            type: 'final',
        },
        [client_1.PurchaseRequestState.CONCLUIDO]: {
            type: 'final',
        },
    },
});
exports.purchaseRequestMachine = machine;
//# sourceMappingURL=purchase-request.machine.js.map