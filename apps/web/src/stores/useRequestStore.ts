import { create } from 'zustand';
import { apiClient } from '../lib/api/apiClient';
import type { RequisicaoCompra as PurchaseRequest, ItemRequisicao, Usuario as User, RequisicaoCompraStatus as PurchaseStatus, RequisicaoCompraPrioridade } from '@fulcrum/shared';
import { useAuthStore } from './authStore'; // To get current user for history entries

// Define a local RequestHistoryEntry type as it's not in shared
// (Could be moved to shared if it becomes a common entity)
export interface RequestHistoryEntry {
  id: string;
  actionType: string; // e.g., "CRIAÇÃO", "SUBMISSÃO", "APROVAÇÃO_COMPRAS", "REJEIÇÃO_GERENCIA"
  actionDescription: string; // e.g., "Requisição criada", "Aprovada pelo departamento de compras"
  timestamp: string; // ISO date string
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>; // User who performed the action
  rejectionReason?: string; // Optional field for rejection reason
  previousState?: PurchaseStatus; // Optional: previous status
  newState?: PurchaseStatus; // Optional: new status
}

// Augment PurchaseRequest to include a history field of our local type
export interface PurchaseRequestWithHistory extends PurchaseRequest {
  history: RequestHistoryEntry[]; // Make history non-optional and initialize as empty array
}

// Type for data passed to createRequest, ensuring items are correctly typed
export type CreateRequestData = Omit<PurchaseRequest, 'id' | 'criadoEm' | 'atualizadoEm' | 'status' | 'history' | 'itens' | 'requisitante' | 'idRequisitante'> & {
    itens: Omit<ItemRequisicao, 'id' | 'precoTotal'>[]
};


interface RequestStoreState {
  requests: PurchaseRequestWithHistory[];
  currentRequest: PurchaseRequestWithHistory | null;
  isLoading: boolean;
  error: string | null;
  fetchRequests: () => Promise<void>;
  fetchRequestById: (id: string) => Promise<void>;
  createRequest: (data: CreateRequestData) => Promise<PurchaseRequestWithHistory | undefined>;
  transitionRequestState: (
    requestId: string,
    newStatus: PurchaseStatus,
    rejectionReason?: string
  ) => Promise<void>;
}

// Mock Data - Replace with API calls
// For simplicity, using a global mockUser for actions, replace with actual logged-in user from useAuthStore
const getActingUser = (): Pick<User, 'id' | 'firstName' | 'lastName' | 'email'> | undefined => {
    const authUser = useAuthStore.getState().user;
    if (!authUser) return undefined; // Or a default system user
    return {
        id: authUser.id,
        email: authUser.email,
        firstName: authUser.firstName,
        lastName: authUser.lastName,
    };
}


const mockUsers: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>[] = [
  { id: 'user-1', firstName: 'João', lastName: 'Solicitante', email: 'joao.solicitante@example.com' },
  { id: 'user-2', firstName: 'Maria', lastName: 'Compras', email: 'maria.compras@example.com' },
  { id: 'user-3', firstName: 'Carlos', lastName: 'Gerente', email: 'carlos.gerente@example.com' },
];

// Initial mockRequests - this array will be mutated by create/transition actions for now
// Statuses should match RequisicaoCompraStatus from @fulcrum/shared
let globalMockRequests: PurchaseRequestWithHistory[] = [
  {
    id: 'req-001',
    titulo: 'Aquisição de Novos Laptops para Equipe de Desenvolvimento',
    descricao: 'Precisamos de 5 laptops de alta performance para os novos desenvolvedores.',
    status: PurchaseStatus.PENDENTE_COMPRAS, // Changed from PENDENTE
    prioridade: 'ALTA' as RequisicaoCompraPrioridade,
    valorTotalEstimado: 25000,
    idRequisitante: mockUsers[0].id,
    requisitante: mockUsers[0],
    idProjeto: 'proj-dev-01',
    itens: [
      { nome: 'Laptop Dell XPS 15', quantidade: 5, precoUnitario: 5000, descricao: 'i7, 32GB RAM, 1TB SSD' },
    ],
    criadoEm: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    atualizadoEm: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    history: [
      { id: 'hist-1-0', actionType: 'CRIAÇÃO', actionDescription: 'Requisição criada como rascunho', user: mockUsers[0], timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), newState: 'RASCUNHO' as PurchaseStatus },
      { id: 'hist-1-1', actionType: 'SUBMISSÃO', actionDescription: 'Submetida para aprovação de Compras', user: mockUsers[0], timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), previousState: 'RASCUNHO' as PurchaseStatus, newState: PurchaseStatus.PENDENTE_COMPRAS },
    ],
  },
   {
    id: 'req-002',
    titulo: 'Material de Escritório Urgente',
    descricao: 'Canetas, blocos de nota e post-its para o mês.',
    status: PurchaseStatus.APROVADA,
    prioridade: 'MEDIA' as RequisicaoCompraPrioridade,
    valorTotalEstimado: 350,
    idRequisitante: mockUsers[1].id,
    requisitante: mockUsers[1],
    itens: [
      { nome: 'Caneta BIC (Azul, Cx c/50)', quantidade: 2, precoUnitario: 25 },
      { nome: 'Bloco de Notas A4 (100 folhas)', quantidade: 10, precoUnitario: 8 },
      { nome: 'Post-its coloridos (Pacote c/5)', quantidade: 5, precoUnitario: 15 },
    ],
    criadoEm: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    atualizadoEm: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    history: [
      { id: 'hist-2-0', actionType: 'CRIAÇÃO', actionDescription: 'Requisição criada', user: mockUsers[1], timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), newState: PurchaseStatus.PENDENTE_COMPRAS },
      { id: 'hist-2-1', actionType: 'APROVAÇÃO COMPRAS', actionDescription: 'Aprovada pelo setor de compras', user: mockUsers[1], timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), previousState: PurchaseStatus.PENDENTE_COMPRAS, newState: PurchaseStatus.PENDENTE_GERENCIA },
      { id: 'hist-2-2', actionType: 'APROVAÇÃO GERÊNCIA', actionDescription: 'Aprovada pela gerência', user: mockUsers[2], timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), previousState: PurchaseStatus.PENDENTE_GERENCIA, newState: PurchaseStatus.APROVADA },
      // { id: 'hist-2-3', actionType: 'PEDIDO REALIZADO', actionDescription: 'Pedido de compra realizado ao fornecedor', user: mockUsers[1], timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), previousState: PurchaseStatus.APROVADA, newState: PurchaseStatus.PEDIDO_REALIZADO },
    ],
  },
   {
    id: 'req-003',
    titulo: 'Licenças de Software de Design',
    status: PurchaseStatus.REJEITADA,
    prioridade: 'BAIXA' as RequisicaoCompraPrioridade,
    idRequisitante: mockUsers[0].id,
    requisitante: mockUsers[0],
    valorTotalEstimado: 1200,
    itens: [
      { nome: 'Licença Adobe Photoshop (Anual)', quantidade: 2, precoUnitario: 600 },
    ],
    criadoEm: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    atualizadoEm: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    history: [
        { id: 'hist-3-0', actionType: 'CRIAÇÃO', actionDescription: 'Requisição criada', user: mockUsers[0], timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), newState: PurchaseStatus.PENDENTE_COMPRAS },
        { id: 'hist-3-1', actionType: 'ENVIO P/ GERÊNCIA', actionDescription: 'Enviada para aprovação da Gerência', user: mockUsers[1], timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), previousState: PurchaseStatus.PENDENTE_COMPRAS, newState: PurchaseStatus.PENDENTE_GERENCIA },
        { id: 'hist-3-2', actionType: 'REJEIÇÃO GERÊNCIA', actionDescription: 'Rejeitada pela gerência por falta de orçamento.', user: mockUsers[2], timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), rejectionReason: 'Falta de orçamento.', previousState: PurchaseStatus.PENDENTE_GERENCIA, newState: PurchaseStatus.REJEITADA },
    ]
  },
  {
    id: 'req-004',
    titulo: 'Rascunho de Teste',
    descricao: 'Este é um rascunho.',
    status: 'RASCUNHO' as PurchaseStatus,
    prioridade: 'BAIXA' as RequisicaoCompraPrioridade,
    idRequisitante: mockUsers[0].id,
    requisitante: mockUsers[0],
    valorTotalEstimado: 100,
    itens: [ { nome: 'Item de Rascunho', quantidade: 1, precoUnitario: 100 }],
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
    history: [
        { id: 'hist-4-0', actionType: 'CRIAÇÃO', actionDescription: 'Requisição criada como rascunho', user: mockUsers[0], timestamp: new Date().toISOString(), newState: 'RASCUNHO' as PurchaseStatus },
    ]
  }
];


export const useRequestStore = create<RequestStoreState>((set, get) => ({
  requests: [],
  currentRequest: null,
  isLoading: false,
  error: null,

  fetchRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Shorter delay
      // When using API: const response = await apiClient.get<PurchaseRequestWithHistory[]>('/purchaserequests');
      // set({ requests: response.data, isLoading: false });
      set({ requests: [...globalMockRequests], isLoading: false }); // Use a copy to ensure re-render on changes
    } catch (err: any) {
      console.error("Error fetching requests:", err);
      set({ error: err.message || 'Falha ao buscar requisições.', isLoading: false });
    }
  },

  fetchRequestById: async (id: string) => {
    set({ isLoading: true, error: null, currentRequest: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      // When using API: const response = await apiClient.get<PurchaseRequestWithHistory>(`/purchaserequests/${id}`);
      // set({ currentRequest: response.data, isLoading: false });
      const request = globalMockRequests.find(r => r.id === id);
      if (request) {
        set({ currentRequest: { ...request }, isLoading: false }); // Use a copy
      } else {
        set({ error: 'Requisição não encontrada.', isLoading: false });
      }
    } catch (err: any) {
      console.error(`Error fetching request by ID ${id}:`, err);
      set({ error: err.message || `Falha ao buscar requisição ${id}.`, isLoading: false });
    }
  },

  createRequest: async (data: CreateRequestData) => {
    set({ isLoading: true, error: null });
    const actingUser = getActingUser() || mockUsers[0]; // Fallback to mockUser if no authUser
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      // When using API: const response = await apiClient.post<PurchaseRequestWithHistory>('/purchaserequests', data);
      // globalMockRequests.push(response.data); // Add to global mock if successful
      // set({ requests: [...globalMockRequests], currentRequest: response.data, isLoading: false });
      // return response.data;

      const newId = `req-${String(Date.now()).slice(-3)}${globalMockRequests.length + 1}`;
      const newRequest: PurchaseRequestWithHistory = {
        ...data,
        id: newId,
        status: 'RASCUNHO' as PurchaseStatus, // Initial status as RASCUNHO
        prioridade: data.prioridade || 'MEDIA' as RequisicaoCompraPrioridade,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
        idRequisitante: actingUser.id,
        requisitante: actingUser,
        valorTotalEstimado: data.itens.reduce((acc, item) => acc + (item.quantidade * (item.precoUnitario || 0)), 0),
        history: [
          {
            id: `hist-${newId}-1`,
            actionType: 'CRIAÇÃO',
            actionDescription: 'Requisição criada como rascunho.',
            user: actingUser,
            timestamp: new Date().toISOString(),
            newState: 'RASCUNHO' as PurchaseStatus,
          }
        ]
      };
      globalMockRequests = [...globalMockRequests, newRequest]; // Mutate global mock array
      set({ // Update Zustand state with a new array reference to trigger re-render
        requests: [...globalMockRequests],
        isLoading: false,
        currentRequest: { ...newRequest } // Optionally set as current
      });
      return { ...newRequest }; // Return a copy
    } catch (err: any) {
      console.error("Error creating request:", err);
      set({ error: err.message || 'Falha ao criar requisição.', isLoading: false });
      return undefined;
    }
  },

  transitionRequestState: async (requestId: string, newStatus: PurchaseStatus, rejectionReason?: string) => {
    set(state => ({ ...state, isLoading: true, error: null })); // Ensure isLoading is part of the state update
    const actingUser = getActingUser() || mockUsers[0]; // Fallback
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

      let foundRequest = false;
      const updatedGlobalMockRequests = globalMockRequests.map(req => {
        if (req.id === requestId) {
          foundRequest = true;
          const previousStatus = req.status;
          const newHistoryEntry: RequestHistoryEntry = {
            id: `hist-${req.id}-${(req.history?.length || 0) + 1}`,
            actionType: `MUDANÇA_STATUS: ${newStatus}`,
            actionDescription: `Status alterado de ${previousStatus} para ${newStatus}` + (rejectionReason ? `. Motivo: ${rejectionReason}` : ''),
            user: actingUser,
            timestamp: new Date().toISOString(),
            previousState: previousStatus,
            newState: newStatus,
            ...(rejectionReason && { rejectionReason }),
          };
          return {
            ...req,
            status: newStatus,
            atualizadoEm: new Date().toISOString(),
            history: [...(req.history || []), newHistoryEntry],
          };
        }
        return req;
      });

      if (foundRequest) {
        globalMockRequests = updatedGlobalMockRequests; // Update the global mutable array
        const updatedRequestInStore = globalMockRequests.find(r => r.id === requestId);

        set(state => ({
          requests: [...globalMockRequests], // New array reference for Zustand
          currentRequest: state.currentRequest?.id === requestId && updatedRequestInStore ? { ...updatedRequestInStore } : state.currentRequest,
          isLoading: false,
        }));
      } else {
        throw new Error("Requisição não encontrada para transição de estado.");
      }

    } catch (err: any) {
      console.error(`Error transitioning request ${requestId} to ${newStatus}:`, err);
      set({ error: err.message || `Falha ao atualizar status da requisição.`, isLoading: false });
    }
  }
}));

export default useRequestStore;
