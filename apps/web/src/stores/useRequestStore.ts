import { create } from 'zustand';

export type RequestStatus = 'RASCUNHO' | 'PENDENTE_COMPRAS' | 'APROVADO' | 'REJEITADO' | 'EM_COMPRA' | 'CONCLUIDO';

export interface PurchaseRequest {
  id: string;
  itemName: string;
  projectId: string;
  projectName?: string; // Opcional, pode ser preenchido depois
  quantity: number;
  reason: string;
  urgency: 'Baixa' | 'Média' | 'Alta';
  purchaseLink?: string;
  status: RequestStatus;
  createdAt: string; // Usar string para simplicidade no mock, idealmente seria Date
  updatedAt: string;
  userId?: string; // ID do utilizador que criou
  // Adicionar mais campos conforme necessário (ex: aprovador, data de aprovação, etc.)
}

interface RequestStoreState {
  requests: PurchaseRequest[];
  isLoading: boolean;
  error: string | null;
  fetchRequests: () => Promise<void>; // Simula uma chamada API
  addRequest: (newRequest: Omit<PurchaseRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<void>;
  updateRequestStatus: (requestId: string, status: RequestStatus) => Promise<void>;
}

// Dados mockados iniciais
const mockRequests: PurchaseRequest[] = [
  {
    id: 'req-001',
    itemName: 'Licença Software X',
    projectId: 'proj-alpha',
    projectName: 'Projeto Alpha',
    quantity: 1,
    reason: 'Necessário para desenvolvimento da nova funcionalidade',
    urgency: 'Alta',
    status: 'PENDENTE_COMPRAS',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias atrás
    updatedAt: new Date().toISOString(),
    userId: 'user-123',
  },
  {
    id: 'req-002',
    itemName: 'Monitor Adicional 27"',
    projectId: 'proj-beta',
    projectName: 'Projeto Beta',
    quantity: 2,
    reason: 'Melhorar produtividade da equipa de design',
    urgency: 'Média',
    status: 'APROVADO',
    purchaseLink: 'https://example.com/monitor',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 dias atrás
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'user-456',
  },
  {
    id: 'req-003',
    itemName: 'Cadeira Ergonómica',
    projectId: 'proj-infra',
    projectName: 'Infraestrutura Escritório',
    quantity: 1,
    reason: 'Substituição de cadeira danificada',
    urgency: 'Baixa',
    status: 'REJEITADO',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 dias atrás
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'user-123',
  },
  {
    id: 'req-004',
    itemName: 'Serviço de Cloud AWS - Créditos',
    projectId: 'proj-gamma',
    projectName: 'Projeto Gamma',
    quantity: 100, // USD
    reason: 'Hospedagem da aplicação em produção',
    urgency: 'Alta',
    status: 'RASCUNHO',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'user-789',
  },
];

export const useRequestStore = create<RequestStoreState>((set, get) => ({
  requests: [],
  isLoading: false,
  error: null,
  fetchRequests: async () => {
    set({ isLoading: true, error: null });
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      // Em uma aplicação real, faria uma chamada API aqui
      // Por agora, usamos os dados mockados
      set({ requests: mockRequests, isLoading: false });
    } catch (err) {
      set({ error: 'Falha ao buscar requisições.', isLoading: false });
    }
  },
  addRequest: async (newRequestData) => {
    set({ isLoading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 300)); // Simular delay
    try {
      const newId = `req-${String(Date.now()).slice(-5)}`; // Gerador de ID simples
      const now = new Date().toISOString();
      const requestToAdd: PurchaseRequest = {
        ...newRequestData,
        id: newId,
        status: 'RASCUNHO', // Novas requisições começam como rascunho
        createdAt: now,
        updatedAt: now,
        // userId: Deveria vir do useAuthStore ou ser passado
      };
      set(state => ({
        requests: [requestToAdd, ...state.requests],
        isLoading: false,
      }));
    } catch (err) {
      set({ error: 'Falha ao adicionar requisição.', isLoading: false });
      // Lançar o erro para que o formulário possa tratar
      throw new Error('Falha ao adicionar requisição.');
    }
  },
  updateRequestStatus: async (requestId, status) => {
    set({ isLoading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 200));
    try {
      set(state => ({
        requests: state.requests.map(req =>
          req.id === requestId ? { ...req, status, updatedAt: new Date().toISOString() } : req
        ),
        isLoading: false,
      }));
    } catch (err) {
      set({ error: 'Falha ao atualizar status da requisição.', isLoading: false });
      throw new Error('Falha ao atualizar status da requisição.');
    }
  },
}));

// Para carregar as requisições iniciais quando a store é usada pela primeira vez.
// Em um app real, isso pode ser chamado em um useEffect de um componente de layout.
if (typeof window !== 'undefined') {
  // useRequestStore.getState().fetchRequests();
}
