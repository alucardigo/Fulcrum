import { setup, assign, log } from 'xstate';
// Ajustado o caminho para ../casl/casl-ability.factory assuming casl-ability.factory.ts is in src/casl/
import { AppAbility, Action, UserWithRoles } from '../casl/casl-ability.factory';
import { PurchaseRequest as PrismaPurchaseRequest, User as PrismaUser } from '@prisma/client';

export interface PurchaseRequestContext {
  currentUser: UserWithRoles | null;
  requestData: PrismaPurchaseRequest | null;
  ability: AppAbility | null;
  errorMessage?: string;
}

export type PurchaseRequestEvent =
  | { type: 'SUBMIT'; payload?: any; notes?: string }
  | { type: 'APPROVE_PURCHASE'; payload?: any; notes?: string }
  | { type: 'REJECT'; payload?: any; notes?: string }
  | { type: 'APPROVE_MANAGEMENT'; payload?: any; notes?: string }
  | { type: 'CANCEL'; payload?: any; notes?: string }
  | { type: 'PLACE_ORDER'; payload?: any; notes?: string }      // Evento para fazer o pedido
  | { type: 'RECEIVE_ITEMS'; payload?: any; notes?: string };   // Evento para registrar recebimento

export const purchaseRequestMachine = setup({
  types: {
    context: {} as PurchaseRequestContext,
    events: {} as PurchaseRequestEvent,
  },
  guards: {
    canSubmit: function ({ context }) {
      if (!context.ability || !context.requestData) return false;
      const can = context.ability.can(Action.Submit, context.requestData);
      if (!can) console.warn(`[Guard canSubmit] Denied for user ${context.currentUser?.email} on PR ${context.requestData?.id}`);
      return can;
    },
    canApproveLevel1: function ({ context }) {
      if (!context.ability || !context.requestData) return false;
      const can = context.ability.can(Action.ApproveLevel1, context.requestData);
      if (!can) console.warn(`[Guard canApproveLevel1] Denied for user ${context.currentUser?.email} on PR ${context.requestData?.id}`);
      return can;
    },
    canReject: function ({ context }) {
      if (!context.ability || !context.requestData) return false;
      const can = context.ability.can(Action.Reject, context.requestData);
      if (!can) console.warn(`[Guard canReject] Denied for user ${context.currentUser?.email} on PR ${context.requestData?.id}`);
      return can;
    },
    // canApproveLevel2: function ({ context }) { /* ... */ },
    // canPlaceOrder: function ({ context }) { /* ... */ },
    // canReceiveItems: function ({ context }) { /* ... */ },
    // canCancel: function ({ context }) { /* ... */ },
  },
  actions: {
    logTransition: log(({ event }) => `Event: ${event.type}`),
    // assignError: assign({ errorMessage: (context, event, { G }) => G.message }), // Example for assigning error from guard
    // clearError: assign({ errorMessage: undefined }),
  },
}).createMachine({
  id: 'purchaseRequestWorkflow',
  initial: 'RASCUNHO',
  context: {
    currentUser: null,
    requestData: null,
    ability: null,
    errorMessage: undefined,
  },
  states: {
    RASCUNHO: {
      on: {
        SUBMIT: {
          target: 'PENDENTE_COMPRAS',
          cond: 'canSubmit',
          actions: ['logTransition'],
        },
        CANCEL: { target: 'CANCELADA', actions: ['logTransition'] /* cond: 'canCancel' */ },
      },
      meta: { description: 'Requisição em elaboração pelo solicitante.' },
    },
    PENDENTE_COMPRAS: {
      on: {
        APPROVE_PURCHASE: {
          target: 'PENDENTE_GERENCIA', // Ou APROVADA se não precisar de mais aprovação
          cond: 'canApproveLevel1',
          actions: ['logTransition'],
        },
        REJECT: {
          target: 'REJEITADA',
          cond: 'canReject',
          actions: ['logTransition'],
        },
        CANCEL: { target: 'CANCELADA', actions: ['logTransition'] /* cond: 'canCancel' */ },
      },
      meta: { description: 'Aguardando aprovação do setor de Compras.' },
    },
    PENDENTE_GERENCIA: {
      on: {
        APPROVE_MANAGEMENT: {
            target: 'APROVADA',
            // cond: 'canApproveLevel2',
            actions: ['logTransition']
        },
        REJECT: {
            target: 'REJEITADA',
            // cond: 'canReject', // ou canRejectManagement
            actions: ['logTransition']
        },
        CANCEL: { target: 'CANCELADA', actions: ['logTransition'] /* cond: 'canCancel' */ },
      },
      meta: { description: 'Aguardando aprovação da Gerência (valores altos).' },
    },
    APROVADA: {
      on: {
        PLACE_ORDER: {
            target: 'PEDIDO_REALIZADO',
            // cond: 'canPlaceOrder',
            actions: ['logTransition']
        },
        CANCEL: { target: 'CANCELADA', actions: ['logTransition'] /* cond: 'canCancelBeforeOrder' */ },
      },
      meta: { description: 'Requisição aprovada, pronta para pedido.' },
    },
    REJEITADA: {
      type: 'final',
      meta: { description: 'Requisição rejeitada.' },
    },
    PEDIDO_REALIZADO: {
      on: {
        RECEIVE_ITEMS: {
            target: 'CONCLUIDA',
            // cond: 'canReceiveItems',
            actions: ['logTransition']
        },
        // Evento para problemas no pedido, voltar para APROVADA ou um estado de EM_REVISAO_PEDIDO
      },
      meta: { description: 'Pedido realizado ao fornecedor.' },
    },
    CONCLUIDA: {
      type: 'final',
      meta: { description: 'Requisição concluída, itens recebidos.' },
    },
    CANCELADA: {
      type: 'final',
      meta: { description: 'Requisição cancelada.' },
    },
  },
});
