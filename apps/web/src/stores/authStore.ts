import {create} from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface DadosAutenticacao {
  accessToken: string | null;
  estaAutenticado: boolean;
  usuario: { email: string; idUsuario: string } | null; // Informações básicas do usuário
  definirAutenticacao: (token: string, dadosUsuario: { email: string; idUsuario: string }) => void;
  limparAutenticacao: () => void;
}

export const useAuthStore = create<DadosAutenticacao>()(
  persist(
    (set) => ({
      accessToken: null,
      estaAutenticado: false,
      usuario: null,
      definirAutenticacao: (token, dadosUsuario) => set({ accessToken: token, usuario: dadosUsuario, estaAutenticado: true }),
      limparAutenticacao: () => set({ accessToken: null, usuario: null, estaAutenticado: false }),
    }),
    {
      name: 'auth-storage-br', // Chave no localStorage (nome ajustado)
      storage: createJSONStorage(() => localStorage),
    }
  )
);
