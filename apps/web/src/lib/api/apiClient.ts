import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const requisicaoOriginal = error.config;
    if (error.response?.status === 401 && !requisicaoOriginal._retry) {
      requisicaoOriginal._retry = true;
      console.error('Erro na API: 401 Não Autorizado. Limpando autenticação.');
      useAuthStore.getState().limparAutenticacao();
      if (typeof window !== 'undefined') {
        // window.location.href = '/login'; // Comentado para não causar hard refresh durante testes
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
