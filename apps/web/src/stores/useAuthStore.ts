import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  // Adicionar outras propriedades relevantes do utilizador
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginAction: (data: { token: string; user: User }) => void;
  logoutAction: () => void;
  // Futuramente: pode incluir uma ação para verificar o status da autenticação
}

// Mock de um utilizador autenticado para desenvolvimento
const mockUser: User = {
  id: 'user-123',
  name: 'Utilizador Mock',
  email: 'mock@example.com',
};

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('authToken') || null, // Inicializa o token do localStorage se existir
  user: localStorage.getItem('authUser') ? JSON.parse(localStorage.getItem('authUser')!) : null, // Inicializa o user do localStorage
  isAuthenticated: !!localStorage.getItem('authToken'), // Define com base na existência do token
  isLoading: false,
  error: null,
  loginAction: ({ token, user }) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(user));
    set({ token, user, isAuthenticated: true, error: null, isLoading: false });
  },
  logoutAction: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    set({ token: null, user: null, isAuthenticated: false, error: null });
  },
}));

// Para desenvolvimento, podemos "logar" o utilizador mockado por defeito se não houver token
// Remova ou ajuste esta lógica para produção
if (typeof window !== 'undefined' && !localStorage.getItem('authToken')) {
  // console.log('Autenticando utilizador mock para desenvolvimento...');
  // useAuthStore.getState().loginAction({ token: 'mock-token-12345', user: mockUser });
}
