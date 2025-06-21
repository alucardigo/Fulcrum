import { setup, assign } from 'xstate';
import { AppAbility, Action } from '../casl/casl-ability.factory';
import { PurchaseRequest, User, PurchaseRequestState } from '@prisma/client';

export interface PurchaseRequestContext {
  currentUser: User | null;
  requestData: PurchaseRequest | null;
  ability: AppAbility | null;
  errorMessage?: string;
  notes?: string;
}

export type PurchaseRequestEvent =
  | { type: 'DRAFT'; payload?: any }
  | { type: 'SUBMIT'; payload?: any; notes?: string }
  | { type: 'APPROVE_PURCHASE'; payload?: any; notes?: string }
  | { type: 'APPROVE_MANAGEMENT'; payload?: any; notes?: string }
  | { type: 'REJECT'; payload?: any; notes?: string; reason: string }
  | { type: 'PLACE_ORDER'; payload?: any; notes?: string }
  | { type: 'RECEIVE_PARTIAL'; payload?: { itemId: string; quantity: number }; notes?: string }
  | { type: 'RECEIVE_COMPLETE'; payload?: any; notes?: string }
  | { type: 'CANCEL'; payload?: any; notes?: string };

function makeAbilityGuard(action: Action, extraCheck?: (context: PurchaseRequestContext) => boolean) {
  return ({ context }: { context: PurchaseRequestContext }) => {
    const { ability, requestData, currentUser } = context;
    if (!ability || !requestData) return false;
    const ok = ability.can(action, 'PurchaseRequest') && (!extraCheck || extraCheck(context));
    if (!ok) {
      console.warn(`[Guard ${action}] Denied for ${currentUser?.email} on PR ${requestData.id}`);
    }
    return ok;
  };
}

const guardDefinitions = [
  { key: 'canSubmit', action: Action.Submit },
  { key: 'canApprovePurchase', action: Action.ApprovePurchase },
  { 
    key: 'canApproveManagement', 
    action: Action.ApproveManagement,
    extraCheck: (context: PurchaseRequestContext) => {
      const totalAmount = context.requestData?.totalAmount || 0;
      const approvalLimit = context.currentUser?.approvalLimit || 0;
      return totalAmount <= approvalLimit;
    }
  },
  { key: 'canReject', action: Action.Reject },
  { key: 'canPlaceOrder', action: Action.PlaceOrder },
];

const guards = Object.fromEntries(
  guardDefinitions.map(({ key, action, extraCheck }) => [key, makeAbilityGuard(action, extraCheck)])
);

const machine = setup({
  types: {
    context: {} as PurchaseRequestContext,
    events: {} as PurchaseRequestEvent,
  },
  guards,
  actions: {
    assignDraft: assign(({ context }) => ({
      requestData: context.requestData ? { ...context.requestData, status: PurchaseRequestState.RASCUNHO } : null,
    })),
    assignPendingPurchase: assign(({ context }) => ({
      requestData: context.requestData ? { ...context.requestData, status: PurchaseRequestState.PENDENTE_COMPRAS } : null,
    })),
    assignPendingManagement: assign(({ context }) => ({
      requestData: context.requestData ? { ...context.requestData, status: PurchaseRequestState.PENDENTE_GERENCIA } : null,
    })),
    assignApproved: assign(({ context }) => ({
      requestData: context.requestData ? { ...context.requestData, status: PurchaseRequestState.APROVADO } : null,
    })),
    assignRejected: assign(({ context, event }) => ({
      requestData: context.requestData ? { ...context.requestData, status: PurchaseRequestState.REJEITADO, ...(event && 'notes' in event ? { notes: (event as any).notes } : {}) } : null,
    })),
    assignOrdered: assign(({ context }) => ({
      requestData: context.requestData ? { ...context.requestData, status: PurchaseRequestState.COMPRADO } : null,
    })),
  },
}).createMachine({
  context: {} as PurchaseRequestContext,
  states: {
    // ...existing states config...
  },
});

export { machine as purchaseRequestMachine };
