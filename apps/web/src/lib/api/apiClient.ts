import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const { accessToken } = useAuthStore.getState();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
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
      console.error('API Error: 401 Unauthorized. Clearing authentication.');
      // Ensure the correct method name from the updated authStore is used.
      // Assuming it's now clearAuthentication as per recent authStore updates.
      useAuthStore.getState().clearAuthentication();
      if (typeof window !== 'undefined') {
        // Consider a more Next.js-friendly way to redirect if needed, e.g., via router context or a dedicated service
        // For now, direct redirect is commented out.
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
