"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter
import useRequestStore from '../../../stores/useRequestStore'; // Adjust path as necessary
import { useAuthStore } from '../../../stores/authStore'; // Import useAuthStore
import { PurchaseRequestAPIResponse as PurchaseRequestWithHistory } from '../../../stores/useRequestStore'; // Use updated type
import { StatusBadge } from 'ui'; // Import from ui package
import toast, { Toaster } from 'react-hot-toast'; // For potential notifications

// Local StatusBadge component is now removed, will use the one from 'ui'

// A simple LoadingSpinner component (can be moved or replaced by one from 'ui' if available)
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

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRequestStore, PurchaseRequest, RequestStatus } from '@/stores/useRequestStore';
import { StatusBadge } from 'ui/components/StatusBadge'; // Do packages/ui
// Modal e botão virão do Shadcn/UI ou do nosso pacote ui
import { Button } from 'ui/components/Button'; // Assumindo que teremos um Button em ui
import { Modal } from 'ui/components/Modal'; // Do packages/ui
import CreateRequestModal from '@/components/modals/CreateRequestModal'; // A ser criado
import { PlusCircle, Eye } from 'lucide-react';

// Componentes Shadcn/UI para a tabela (ou equivalentes)
// Se não pudermos usar Shadcn diretamente, teremos que criar/mockar
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from 'ui/components/Table'; // Assumindo que teremos Table em ui

// Mock simples de componentes de Tabela se não disponíveis em ui
const TableMock: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => <div className={`overflow-x-auto ${className}`}><table className="min-w-full divide-y divide-gray-200 border border-gray-200">{children}</table></div>;
const TableHeaderMock: React.FC<{ children: React.ReactNode }> = ({ children }) => <thead className="bg-gray-50">{children}</thead>;
const TableRowMock: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => <tr className={className}>{children}</tr>;
const TableHeadMock: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => <th scope="col" className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>{children}</th>;
const TableBodyMock: React.FC<{ children: React.ReactNode }> = ({ children }) => <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>;
const TableCellMock: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 ${className}`}>{children}</td>;


// Mock de Button se não disponível em ui
const ButtonMock: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {variant?: string; children: React.ReactNode}> = ({children, variant, ...props}) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  const variantStyle = variant === 'outline'
    ? "border border-input hover:bg-accent hover:text-accent-foreground"
    : "bg-primary text-primary-foreground hover:bg-primary/90";
  return <button className={`${baseStyle} ${variantStyle} px-4 py-2`} {...props}>{children}</button>;
}


export default function RequestsPage() {
  const { requests, isLoading, error, fetchRequests } = useRequestStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Usar os componentes reais se disponíveis, senão os mocks
  const Table = TableMock; // Ou Table (do Shadcn/UI)
  const TableHeader = TableHeaderMock; // Ou TableHeader
  const TableRow = TableRowMock; // Ou TableRow
  const TableHead = TableHeadMock; // Ou TableHead
  const TableBody = TableBodyMock; // Ou TableBody
  const TableCell = TableCellMock; // Ou TableCell
  const ActualButton = Button || ButtonMock; // Use o Button de 'ui' se existir, senão o mock

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Minhas Requisições de Compra</h1>
          <ActualButton onClick={() => setIsModalOpen(true)}>
            <PlusCircle size={18} className="mr-2" />
            Nova Requisição
          </ActualButton>
        </div>

        {isLoading && <p className="text-gray-600">Carregando requisições...</p>}
        {error && <p className="text-red-500">Erro ao carregar requisições: {error}</p>}

        {!isLoading && !error && requests.length === 0 && (
          <p className="text-gray-600">Nenhuma requisição encontrada.</p>
        )}

        {!isLoading && !error && requests.length > 0 && (
          <div className="bg-white shadow-md rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Criação</TableHead>
                  <TableHead>Urgência</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">{req.id.substring(0, 8)}...</TableCell>
                    <TableCell>{req.itemName}</TableCell>
                    <TableCell>{req.projectName || req.projectId}</TableCell>
                    <TableCell>
                      <StatusBadge status={req.status} />
                    </TableCell>
                    <TableCell>{formatDate(req.createdAt)}</TableCell>
                    <TableCell>{req.urgency}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <ActualButton
                        variant="outline"
                        size="sm"
                        onClick={() => alert(`Ver detalhes da Requisição: ${req.id}`)}
                        className="px-2 py-1 text-xs" // Shadcn/UI Button size 'sm' already does this
                      >
                        <Eye size={14} className="mr-1" />
                        Detalhes
                      </ActualButton>
                      {/* Outros botões de ação podem ir aqui (ex: Editar, Cancelar) */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Modal de Criação de Requisição */}
      {/* O componente Modal de `ui` será usado aqui, mas o conteúdo será o `CreateRequestModal` */}
      <CreateRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </DashboardLayout>
  );
}
