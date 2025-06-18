'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/apiClient';
import { useAuthStore } from '@/stores/authStore';

export default function PaginaLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const router = useRouter();
  const { definirAutenticacao } = useAuthStore();

  const tratarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    try {
      const respostaLogin = await apiClient.post('/auth/login', { email, password: senha });
      const token = respostaLogin.data.accessToken;

      if (!token) {
        throw new Error('Token de acesso não recebido.');
      }

      // Simulação de obtenção de dados do usuário.
      // O ideal é que o backend retorne esses dados ou haja um endpoint /me ou /perfil.
      // Por agora, usamos um placeholder ou tentamos decodificar o token (o que não é ideal no cliente).
      // Para este exemplo, vamos usar um placeholder, assumindo que o backend precisa ser ajustado.
      const dadosUsuarioSimulados = { email: email, idUsuario: 'id_placeholder_jwt' };
      // Em um app real:
      // const respostaPerfil = await apiClient.get('/auth/perfil'); // Ou similar
      // definirAutenticacao(token, respostaPerfil.data);

      definirAutenticacao(token, dadosUsuarioSimulados);

      router.push('/');
    } catch (err: any) {
      console.error('Falha no login:', err);
      setErro(err.response?.data?.message || 'Falha no login. Verifique suas credenciais.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 bg-white shadow-md rounded-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <form onSubmit={tratarSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700">Senha</label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
            />
          </div>
          {erro && <p className="text-red-500 text-sm mb-4">{erro}</p>}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
