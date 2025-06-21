import { create } from 'zustand';
import { apiClient } from '../lib/api/apiClient'; // Assuming apiClient is correctly set up
import type { RequisicaoCompra as PurchaseRequest, ItemRequisicao, Usuario as User } from '@fulcrum/shared'; // Adjust if path is different

// Define a local RequestHistoryEntry type as it's not in shared
export interface RequestHistoryEntry {
  id: string;
  actionType: string; // e.g., "CRIADA", "APROVADA_COMPRAS", "REJEITADA_GERENCIA"
  actionDescription: string; // e.g., "Requisição criada", "Aprovada pelo departamento de compras"
  timestamp: string; // ISO date string
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>; // User who performed the action
  previousState?: string; // Optional: JSON string of previous state
  newState?: string; // Optional: JSON string of new state
}

// Augment PurchaseRequest to include a history field of our local type
export interface PurchaseRequestWithHistory extends PurchaseRequest {
  history?: RequestHistoryEntry[];
  // Ensure other fields from RequisicaoCompra are present or adjust mock data accordingly
  // For example, `requisitante` might be just an ID or a full User object.
  // The mock data needs to align with this.
}

interface RequestStoreState {
  requests: PurchaseRequestWithHistory[];
  currentRequest: PurchaseRequestWithHistory | null;
  isLoading: boolean;
  error: string | null;
  fetchRequests: () => Promise<void>;
  fetchRequestById: (id: string) => Promise<void>;
  createRequest: (data: Omit<PurchaseRequest, 'id' | 'criadoEm' | 'atualizadoEm' | 'status' | 'history' | 'itens'> & { itens: Omit<ItemRequisicao, 'id'>[] } ) => Promise<PurchaseRequestWithHistory | undefined>;
}

// Mock Data - Replace with API calls
const mockUsers: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>[] = [
  { id: 'user-1', firstName: 'João', lastName: 'Solicitante', email: 'joao.solicitante@example.com' },
  { id: 'user-2', firstName: 'Maria', lastName: 'Compras', email: 'maria.compras@example.com' },
  { id: 'user-3', firstName: 'Carlos', lastName: 'Gerente', email: 'carlos.gerente@example.com' },
];

const mockRequests: PurchaseRequestWithHistory[] = [
  {
    id: 'req-001',
    titulo: 'Aquisição de Novos Laptops para Equipe de Desenvolvimento',
    descricao: 'Precisamos de 5 laptops de alta performance para os novos desenvolvedores.',
    status: 'PENDENTE', // Matches RequisicaoCompraStatus
    prioridade: 'ALTA', // Matches RequisicaoCompraPrioridade
    valorTotalEstimado: 25000,
    idRequisitante: mockUsers[0].id,
    requisitante: mockUsers[0],
    idProjeto: 'proj-dev-01',
    // projeto: { id: 'proj-dev-01', nome: 'Atualização Infra Dev', ... }, // Add if needed
    itens: [
      { nome: 'Laptop Dell XPS 15', quantidade: 5, precoUnitario: 5000, descricao: 'i7, 32GB RAM, 1TB SSD' },
    ],
    criadoEm: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    atualizadoEm: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    history: [
      { id: 'hist-1-1', actionType: 'CRIAÇÃO', actionDescription: 'Requisição criada', user: mockUsers[0], timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'hist-1-2', actionType: 'PENDÊNCIA COMPRAS', actionDescription: 'Enviada para aprovação do setor de compras', user: mockUsers[0], timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    ],
  },
  {
    id: 'req-002',
    titulo: 'Material de Escritório Urgente',
    descricao: 'Canetas, blocos de nota e post-its para o mês.',
    status: 'APROVADA',
    prioridade: 'MEDIA',
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
      { id: 'hist-2-1', actionType: 'CRIAÇÃO', actionDescription: 'Requisição criada', user: mockUsers[1], timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'hist-2-2', actionType: 'APROVAÇÃO COMPRAS', actionDescription: 'Aprovada pelo setor de compras', user: mockUsers[1], timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'hist-2-3', actionType: 'APROVAÇÃO GERÊNCIA', actionDescription: 'Aprovada pela gerência', user: mockUsers[2], timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'hist-2-4', actionType: 'PEDIDO REALIZADO', actionDescription: 'Pedido de compra realizado ao fornecedor', user: mockUsers[1], timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    ],
  },
  {
    id: 'req-003',
    titulo: 'Licenças de Software de Design',
    status: 'REJEITADA',
    prioridade: 'BAIXA',
    idRequisitante: mockUsers[0].id,
    requisitante: mockUsers[0],
    valorTotalEstimado: 1200,
    itens: [
      { nome: 'Licença Adobe Photoshop (Anual)', quantidade: 2, precoUnitario: 600 },
    ],
    criadoEm: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    atualizadoEm: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    history: [
        { id: 'hist-3-1', actionType: 'CRIAÇÃO', actionDescription: 'Requisição criada', user: mockUsers[0], timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'hist-3-2', actionType: 'PENDÊNCIA COMPRAS', actionDescription: 'Enviada para aprovação do setor de compras', user: mockUsers[0], timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'hist-3-3', actionType: 'REJEIÇÃO GERÊNCIA', actionDescription: 'Rejeitada pela gerência por falta de orçamento.', user: mockUsers[2], timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
    ]
  },
];


export const useRequestStore = create<RequestStoreState>((set, get) => ({
  requests: [],
  currentRequest: null,
  isLoading: false,
  error: null,

  fetchRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // const response = await apiClient.get<PurchaseRequestWithHistory[]>('/purchaserequests');
      // set({ requests: response.data, isLoading: false });
      set({ requests: mockRequests, isLoading: false }); // Using mock data
    } catch (err: any) {
      console.error("Error fetching requests:", err);
      set({ error: err.message || 'Falha ao buscar requisições.', isLoading: false });
    }
  },

  fetchRequestById: async (id: string) => {
    set({ isLoading: true, error: null, currentRequest: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // const response = await apiClient.get<PurchaseRequestWithHistory>(`/purchaserequests/${id}`);
      // set({ currentRequest: response.data, isLoading: false });
      const request = mockRequests.find(r => r.id === id);
      if (request) {
        set({ currentRequest: request, isLoading: false });
      } else {
        throw new Error('Requisição não encontrada.');
      }
    } catch (err: any) {
      console.error(`Error fetching request by ID ${id}:`, err);
      set({ error: err.message || `Falha ao buscar requisição ${id}.`, isLoading: false });
    }
  },

  createRequest: async (data) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // const response = await apiClient.post<PurchaseRequestWithHistory>('/purchaserequests', data);
      // set(state => ({
      //   requests: [...state.requests, response.data],
      //   isLoading: false,
      // }));
      // return response.data;

      // Mocking creation
      const newId = `req-${String(Date.now()).slice(-3)}${mockRequests.length + 1}`;
      const newRequest: PurchaseRequestWithHistory = {
        ...data,
        id: newId,
        status: 'PENDENTE', // Default status
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
        idRequisitante: mockUsers[0].id, // Mock a requisitioner
        requisitante: mockUsers[0],
        valorTotalEstimado: data.itens.reduce((acc, item) => acc + (item.quantidade * (item.precoUnitario || 0)), 0),
        history: [
          { id: `hist-${newId}-1`, actionType: 'CRIAÇÃO', actionDescription: 'Requisição criada', user: mockUsers[0], timestamp: new Date().toISOString() }
        ]
      };
      mockRequests.push(newRequest); // Add to the mock data array for persistence in this session
      set(state => ({
        requests: [...state.requests, newRequest],
        isLoading: false,
      }));
      return newRequest;

    } catch (err: any) {
      console.error("Error creating request:", err);
      set({ error: err.message || 'Falha ao criar requisição.', isLoading: false });
      return undefined;
    }
  },
}));

// Ensure this store can be used by components
export default useRequestStore;

// Example of how to use the store in a component:
// import useRequestStore from '@/stores/useRequestStore';
//
// const MyComponent = () => {
//   const { requests, isLoading, error, fetchRequests } = useRequestStore();
//
//   useEffect(() => {
//     fetchRequests();
//   }, [fetchRequests]);
//
//   if (isLoading) return <p>Loading...</p>;
//   if (error) return <p>Error: {error}</p>;
//
//   return (
//     <ul>
//       {requests.map(req => <li key={req.id}>{req.titulo}</li>)}
//     </ul>
//   );
// };
