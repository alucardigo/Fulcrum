import { setup, assign } from 'xstate';
import { AppAbility, Action, UserWithRoles } from '../casl/casl-ability.factory'; // Importar UserWithRoles
import { PurchaseRequest, User, PurchaseRequestState } from '@prisma/client'; // PurchaseRequestState do Prisma agora tem CONCLUIDO

export interface PurchaseRequestContext {
  currentUser: UserWithRoles | null; // Usar UserWithRoles
  requestData: PurchaseRequest | null; // Prisma PurchaseRequest
  ability: AppAbility | null;
  errorMessage?: string;
  notes?: string;
}

export type PurchaseRequestEvent =
  | { type: 'DRAFT'; payload?: any }
  | { type: 'SUBMIT'; payload?: any; notes?: string }
  | { type: 'APPROVE_PURCHASE'; payload?: any; notes?: string } // Compras aprova para Gerência
  | { type: 'APPROVE_MANAGEMENT'; payload?: any; notes?: string } // Gerência aprova (Legado ou genérico, pode ser usado se Action.ApproveManagement for mantida)
  | { type: 'APPROVE_LEVEL_2'; payload?: any; notes?: string } // Gerência aprova (Específico Nível 2)
  | { type: 'REJECT'; payload?: any; notes?: string; reason?: string } // Adicionado '?' para reason, pois o payload pode não ter sempre. O serviço lida com isso.
  | { type: 'EXECUTE'; payload?: any; notes?: string } // Compras executa a compra
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
  { key: 'canApproveLevel2', action: Action.ApproveLevel2 }, // Nova guarda
  { key: 'canExecute', action: Action.Execute },             // Nova guarda
];

const guards = Object.fromEntries(
  guardDefinitions.map(({ key, action, extraCheck }) => [key, makeAbilityGuard(action, extraCheck)])
);

const machine = setup({
  types: {
    context: {} as PurchaseRequestContext,
    events: {} as PurchaseRequestEvent,
    // Adicionando os novos eventos ao PurchaseRequestEvent já foi feito acima.
  },
  guards, // guards agora inclui canApproveLevel2 e canExecute
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
    assignRejected: assign(({ context, event }) => {
      const typedEvent = event as Extract<PurchaseRequestEvent, { type: 'REJECT' }>;
      return {
        requestData: context.requestData ? {
          ...context.requestData,
          status: PurchaseRequestState.REJEITADO,
          notes: typedEvent.notes || context.requestData.notes, // Mantém notas existentes se não houver novas
          rejectionReason: typedEvent.payload?.reason || typedEvent.reason || null // Pega de payload.reason ou event.reason
        } : null,
      };
    }),
    assignOrdered: assign(({ context }) => ({
      requestData: context.requestData ? { ...context.requestData, status: PurchaseRequestState.COMPRADO } : null,
    })),
    assignConcluido: assign(({ context }) => ({ // Nova action
      requestData: context.requestData ? { ...context.requestData, status: PurchaseRequestState.CONCLUIDO } : null,
    })),
  },
}).createMachine({
  id: 'purchaseRequestWorkflow',
  initial: PurchaseRequestState.RASCUNHO,
  context: {
    currentUser: null,
    requestData: null,
    ability: null,
    errorMessage: undefined,
    notes: undefined,
  } as PurchaseRequestContext, // Definindo o contexto inicial diretamente
  // O input será fornecido ao createActor e mesclado pela XState se necessário,
  // ou o serviço que cria o ator precisa preparar o contexto completo.
  // O serviço já faz: const service = createActor(purchaseRequestMachine, { input: machineContext });
  // Então o machineContext (que é PurchaseRequestContext) será o contexto inicial.
  states: {
    [PurchaseRequestState.RASCUNHO]: {
      on: {
        SUBMIT: { target: PurchaseRequestState.PENDENTE_COMPRAS, cond: 'canSubmit', actions: 'assignPendingPurchase' },
      },
    },
    [PurchaseRequestState.PENDENTE_COMPRAS]: {
      on: {
        APPROVE_PURCHASE: { target: PurchaseRequestState.PENDENTE_GERENCIA, cond: 'canApprovePurchase', actions: 'assignPendingManagement' },
        REJECT: { target: PurchaseRequestState.REJEITADO, cond: 'canReject', actions: 'assignRejected' },
      },
    },
    [PurchaseRequestState.PENDENTE_GERENCIA]: {
      on: {
        APPROVE_LEVEL_2: { target: PurchaseRequestState.APROVADO, cond: 'canApproveLevel2', actions: 'assignApproved' },
        REJECT: { target: PurchaseRequestState.REJEITADO, cond: 'canReject', actions: 'assignRejected' },
      },
    },
    [PurchaseRequestState.APROVADO]: {
      on: {
        EXECUTE: { target: PurchaseRequestState.CONCLUIDO, cond: 'canExecute', actions: 'assignConcluido' },
        // Poderia haver uma transição para CANCELADO ou PLACE_ORDER aqui também, dependendo do fluxo completo.
        // Por ora, apenas EXECUTE.
      },
    },
    [PurchaseRequestState.REJEITADO]: {
      type: 'final',
    },
    [PurchaseRequestState.CONCLUIDO]: {
      type: 'final',
    },
    // Outros estados como COMPRADO, ENTREGUE, CANCELADO podem ser adicionados aqui se fizerem parte do fluxo principal da máquina.
    // Por enquanto, o foco é no fluxo até CONCLUIDO.
  },
});

export { machine as purchaseRequestMachine };
