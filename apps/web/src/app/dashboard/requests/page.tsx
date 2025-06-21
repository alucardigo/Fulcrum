"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter
import useRequestStore from '../../../stores/useRequestStore'; // Adjust path as necessary
import { useAuthStore } from '../../../stores/authStore'; // Import useAuthStore
import { PurchaseRequestWithHistory } from '../../../stores/useRequestStore'; // Assuming type is exported
import toast, { Toaster } from 'react-hot-toast'; // For potential notifications

// A simple StatusBadge component (can be moved to a shared components folder)
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let color = 'bg-gray-400'; // Default
  if (status === 'PENDENTE') color = 'bg-yellow-500';
  else if (status === 'APROVADA') color = 'bg-green-500';
  else if (status === 'REJEITADA') color = 'bg-red-500';
  else if (status === 'EM_COTACAO') color = 'bg-blue-500';
  // Add more statuses as needed

  return (
    <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${color}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

// A simple LoadingSpinner component (can be moved)
const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-32">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const RequestsListPage = () => {
  const { requests, isLoading, error, fetchRequests } = useRequestStore();
  const { clearAuthentication, user } = useAuthStore(); // Get clearAuthentication and user
  const router = useRouter(); // Initialize router

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleLogout = () => {
    clearAuthentication();
    toast.success('Logout bem-sucedido!');
    router.push('/login'); // Redirect to login page
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Minhas Requisições</h1>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Minhas Requisições</h1>
        <p className="text-red-500">Erro ao carregar requisições: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Add Toaster for notifications from logout or other actions */}
      <Toaster position="top-right" reverseOrder={false} />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Minhas Requisições</h1>
          {user && <p className="text-sm text-gray-600">Logado como: {user.email}</p>}
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/requests/new" legacyBehavior>
            <a className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out">
              Nova Requisição
            </a>
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out"
          >
            Logout
          </button>
        </div>
      </div>

      {requests.length === 0 ? (
        <p className="text-gray-600">Nenhuma requisição encontrada.</p>
      ) : (
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Título
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Prioridade
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Valor Estimado
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Data Criação
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req: PurchaseRequestWithHistory) => (
                <tr key={req.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                  <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{req.id}</p>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{req.titulo}</p>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{req.prioridade}</p>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {req.valorTotalEstimado?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'N/A'}
                    </p>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {new Date(req.criadoEm).toLocaleDateString('pt-BR')}
                    </p>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                    <Link href={`/dashboard/requests/${req.id}`} legacyBehavior>
                      <a className="text-indigo-600 hover:text-indigo-900 font-semibold">
                        Ver Detalhes
                      </a>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RequestsListPage;
