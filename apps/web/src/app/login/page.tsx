'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/apiClient';
import { useAuthStore, AuthUser } from '@/stores/authStore'; // Import AuthUser type
import toast, { Toaster } from 'react-hot-toast'; // Import toast

export default function PaginaLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Added loading state
  // const [erro, setErro] = useState<string | null>(null); // Replaced by toast
  const router = useRouter();
  const { setAuthentication } = useAuthStore(); // Updated to setAuthentication

  const tratarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setErro(null); // Not needed with toast
    setIsLoading(true);
    try {
      // Assuming API returns { accessToken: string, user: AuthUser }
      const response = await apiClient.post<{ accessToken: string; user: AuthUser }>('/auth/login', { email, password: senha });

      const { accessToken, user } = response.data;

      if (!accessToken || !user) {
        throw new Error('Resposta de login inválida da API.');
      }

      // Ensure user object from API matches AuthUser structure, especially roles
      // If roles are missing or in a different format, this needs adjustment or backend alignment.
      // For example, if backend returns user.roles as string[], map it to { role: UserRole }[]
      // const formattedUser: AuthUser = {
      //   ...user,
      //   roles: user.roles.map(roleString => ({ role: roleString as UserRole })) // Example mapping
      // };

      setAuthentication(accessToken, user); // Pass the user data directly

      toast.success('Login bem-sucedido!');
      router.push('/dashboard'); // Redirect to dashboard
    } catch (err: any) {
      console.error('Falha no login:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Falha no login. Verifique suas credenciais.';
      // setErro(errorMessage); // Replaced by toast
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} /> {/* Add Toaster for notifications */}
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="p-8 bg-white shadow-xl rounded-lg w-full max-w-md">
          <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Bem-vindo ao Fulcrum</h1>
          <form onSubmit={tratarSubmit}>
            <div className="mb-5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
                placeholder="seu@email.com"
                disabled={isLoading}
              />
            </div>
            <div className="mb-6">
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                id="senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
                placeholder="Sua senha"
                disabled={isLoading}
              />
            </div>
            {/* {erro && <p className="text-red-500 text-sm mb-4">{erro}</p>} // Replaced by toast */}
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-70"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
