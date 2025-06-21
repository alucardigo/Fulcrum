import { create } from 'zustand';
import { apiClient } from '../lib/api/apiClient';
import type {
  RequisicaoCompra as PurchaseRequest,
  ItemRequisicao,
  Usuario as User,
  RequisicaoCompraStatus as PurchaseStatus,
  RequisicaoCompraPrioridade,
  CriarRequisicaoCompraDto // Use this for create
} from '@fulcrum/shared';
import { useAuthStore } from './authStore';
import toast from 'react-hot-toast';

// RequestHistoryEntry might come from backend or remain a frontend construct
// For now, assuming API returns history that can be mapped or directly used.
// If API returns history, PurchaseRequestWithHistory might just be PurchaseRequest if history is embedded.
export interface RequestHistoryEntry {
  id: string;
  actionType: string;
  actionDescription: string;
  timestamp: string;
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
  rejectionReason?: string;
  previousState?: PurchaseStatus;
  newState?: PurchaseStatus;
}

// Assuming API returns PurchaseRequest which might include 'history' or we adapt.
// For now, let's assume the API returns data compatible with PurchaseRequest from shared.
// The 'history' part will be tricky if not directly provided by GET /requests or GET /requests/{id}.
// Let's assume for now that the backend's PurchaseRequest DTO includes a `history` field.
// If not, this type and the mapping in store actions will need adjustment.
export interface PurchaseRequestAPIResponse extends PurchaseRequest {
    history?: RequestHistoryEntry[]; // Assuming backend might send this
}


interface RequestStoreState {
  requests: PurchaseRequestAPIResponse[];
  currentRequest: PurchaseRequestAPIResponse | null;
  isLoading: boolean;
  error: string | null;
  fetchRequests: () => Promise<void>;
  fetchRequestById: (id: string) => Promise<void>;
  createRequest: (data: CriarRequisicaoCompraDto) => Promise<PurchaseRequestAPIResponse | undefined>;
  transitionRequestState: (
    requestId: string,
    event: { type: PurchaseStatus | string; payload?: { rejectionReason?: string } } // string for custom event types if backend uses them
  ) => Promise<void>;
}

// Helper to get acting user from auth store
const getActingUser = (): Pick<User, 'id' | 'firstName' | 'lastName' | 'email'> | undefined => {
  const authUser = useAuthStore.getState().user;
  return authUser ? { id: authUser.id, email: authUser.email, firstName: authUser.firstName, lastName: authUser.lastName } : undefined;
};

export const useRequestStore = create<RequestStoreState>((set, get) => ({
  requests: [],
  currentRequest: null,
  isLoading: false,
  error: null,

  fetchRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<PurchaseRequestAPIResponse[]>('/requests');
      set({ requests: response.data || [], isLoading: false });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Falha ao buscar requisições.';
      console.error("Error fetching requests:", errorMessage);
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  fetchRequestById: async (id: string) => {
    set({ isLoading: true, error: null, currentRequest: null });
    try {
      const response = await apiClient.get<PurchaseRequestAPIResponse>(`/requests/${id}`);
      set({ currentRequest: response.data, isLoading: false });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || `Falha ao buscar requisição ${id}.`;
      console.error(`Error fetching request by ID ${id}:`, errorMessage);
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  createRequest: async (data: CriarRequisicaoCompraDto) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<PurchaseRequestAPIResponse>('/requests', data);
      const newRequest = response.data;
      set(state => ({
        requests: [...state.requests, newRequest],
        isLoading: false,
        currentRequest: newRequest // Optionally set as current
      }));
      toast.success('Requisição criada com sucesso!');
      return newRequest;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Falha ao criar requisição.';
      console.error("Error creating request:", errorMessage);
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return undefined;
    }
  },

  transitionRequestState: async (requestId: string, event: { type: PurchaseStatus | string; payload?: { rejectionReason?: string } }) => {
    set(state => ({ ...state, isLoading: true, error: null }));
    try {
      const response = await apiClient.patch<PurchaseRequestAPIResponse>(`/requests/${requestId}/transition`, event);
      const updatedRequest = response.data;

      set(state => ({
        requests: state.requests.map(r => r.id === requestId ? updatedRequest : r),
        currentRequest: state.currentRequest?.id === requestId ? updatedRequest : state.currentRequest,
        isLoading: false,
      }));
      toast.success(`Requisição ${requestId} atualizada para ${updatedRequest.status}.`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || `Falha ao atualizar status da requisição ${requestId}.`;
      console.error(`Error transitioning request ${requestId} to ${event.type}:`, errorMessage);
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  }
}));

export default useRequestStore;
