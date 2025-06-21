"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import useRequestStore from '../../../../stores/useRequestStore';
import { useAuthStore, UserRole } from '../../../../stores/authStore'; // Import UserRole
import { RequestHistoryEntry, PurchaseRequestWithHistory } from '../../../../stores/useRequestStore';
import { RequisicaoCompraStatus as PurchaseStatus } from '@fulcrum/shared'; // Import status enum

// --- RejectionReasonModal Component ---
interface RejectionReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  isLoading?: boolean;
}

const RejectionReasonModal: React.FC<RejectionReasonModalProps> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (reason.trim()) {
      onSubmit(reason);
    } else {
      alert("Por favor, forneça um motivo para a rejeição.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div className="relative p-6 border w-full max-w-md shadow-lg rounded-md bg-white">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
          aria-label="Fechar modal"
          disabled={isLoading}
        >
          &times;
        </button>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Motivo da Rejeição</h3>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Descreva o motivo da rejeição..."
        />
        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm disabled:opacity-50"
            disabled={isLoading || !reason.trim()}
          >
            {isLoading ? 'Rejeitando...' : 'Rejeitar Requisição'}
          </button>
        </div>
      </div>
    </div>
  );
};


// --- StatusBadge, LoadingSpinner, DetailItem, RequestTimeline (assumed to be the same as before) ---
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let color = 'bg-gray-400'; // Default
  // Using PurchaseStatus enum for comparison
  if (status === PurchaseStatus.PENDENTE) color = 'bg-yellow-500 text-yellow-800';
  else if (status === PurchaseStatus.APROVADA) color = 'bg-green-500 text-green-800';
  else if (status === PurchaseStatus.REJEITADA) color = 'bg-red-500 text-red-800';
  else if (status === PurchaseStatus.EM_COTACAO) color = 'bg-blue-500 text-blue-800';
  else if (status === PurchaseStatus.PEDIDO_REALIZADO) color = 'bg-purple-500 text-purple-800';
  else if (status === PurchaseStatus.ENTREGUE_PARCIALMENTE) color = 'bg-teal-500 text-teal-800';
  else if (status === PurchaseStatus.ENTREGUE_TOTALMENTE) color = 'bg-emerald-500 text-emerald-800';
  else if (status === PurchaseStatus.CANCELADA) color = 'bg-slate-500 text-slate-800';
  // Add RASCUNHO status if defined in PurchaseStatus enum and used
  else if (status === 'RASCUNHO') color = 'bg-stone-500 text-stone-800';


  return (
    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${color.replace(/text-\w+-\d+/, 'text-white')}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600"></div>
  </div>
);

const DetailItem: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
  <div className="mb-3">
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="text-md text-gray-800">{value || 'N/A'}</p>
  </div>
);

const RequestTimeline: React.FC<{ history: RequestHistoryEntry[] }> = ({ history }) => {
  if (!history || history.length === 0) {
    return <p className="text-gray-600">Nenhum histórico disponível para esta requisição.</p>;
  }
  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Histórico da Requisição</h3>
      <div className="relative border-l-2 border-blue-500 pl-6 space-y-8">
        {history.map((entry) => (
          <div key={entry.id} className="relative">
            <div className="absolute -left-[34.5px] top-1.5 w-4 h-4 bg-blue-600 rounded-full border-2 border-white"></div>
            <div className="ml-4 p-4 bg-gray-50 rounded-lg shadow">
              <p className="font-semibold text-blue-700">{entry.actionType.replace('_', ' ')}</p>
              <p className="text-sm text-gray-700 mt-1">{entry.actionDescription}</p>
              {entry.user && (
                <p className="text-xs text-gray-500 mt-2">
                  Por: {entry.user.firstName || entry.user.email} {entry.user.lastName || ''}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Em: {new Date(entry.timestamp).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
// --- End of assumed components ---


const RequestDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : undefined;

  const { currentRequest, isLoading, error, fetchRequestById, transitionRequestState } = useRequestStore();
  const { user: authUser, isLoading: authLoading } = useAuthStore(); // Get authUser and authLoading

  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<{ action: 'reject'; newStatus: PurchaseStatus } | null>(null);


  useEffect(() => {
    if (id) {
      fetchRequestById(id);
    }
  }, [id, fetchRequestById]);

  const handleAction = async (newStatus: PurchaseStatus, rejectionReason?: string) => {
    if (!id || !currentRequest) return;
    // The transitionRequestState function needs to be defined in the store
    await transitionRequestState(id, newStatus, rejectionReason);
    // Optionally, refetch or rely on store's optimistic update
    // fetchRequestById(id);
  };

  const openRejectionModal = (newStatus: PurchaseStatus) => {
    setActionToConfirm({ action: 'reject', newStatus });
    setIsRejectionModalOpen(true);
  };

  const handleRejectionSubmit = (reason: string) => {
    if (actionToConfirm) {
      handleAction(actionToConfirm.newStatus, reason);
    }
    setIsRejectionModalOpen(false);
    setActionToConfirm(null);
  };


  if (isLoading || authLoading || !id) {
    return <div className="container mx-auto p-6"><LoadingSpinner /></div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Erro</h1>
        <p className="text-red-500">{error}</p>
        <Link href="/dashboard/requests" legacyBehavior><a className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">Voltar para Lista</a></Link>
      </div>
    );
  }

  if (!currentRequest) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Requisição Não Encontrada</h1>
        <p>A requisição que você está procurando não foi encontrada.</p>
        <Link href="/dashboard/requests" legacyBehavior><a className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">Voltar para Lista</a></Link>
      </div>
    );
  }

  const userHasRole = (role: UserRole) => authUser?.roles?.some(r => r.role === role);

  const renderActions = () => {
    if (!authUser || !currentRequest) return <p className="text-gray-600">Nenhuma ação disponível para si neste momento.</p>;

    const { status } = currentRequest;

    // Using explicit event types for clarity, backend must support these.
    // The `handleAction` function will construct the event object for `transitionRequestState`.
    if (status === 'RASCUNHO' && userHasRole(UserRole.SOLICITANTE)) {
      return <button onClick={() => handleActionClick('SUBMIT')} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Submeter Requisição</button>;
    }
    if (status === PurchaseStatus.PENDENTE_COMPRAS && userHasRole(UserRole.COMPRAS)) {
      return (
        <div className="space-x-3">
          <button onClick={() => handleActionClick('APPROVE_LVL1')} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Aprovar (Compras)</button>
          <button onClick={() => openRejectionModalWithAction('REJECT_LVL1')} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Rejeitar (Compras)</button>
        </div>
      );
    }
    if (status === PurchaseStatus.PENDENTE_GERENCIA && userHasRole(UserRole.GERENCIA)) {
      return (
        <div className="space-x-3">
          <button onClick={() => handleActionClick('APPROVE_LVL2')} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Aprovar (Gerência)</button>
          <button onClick={() => openRejectionModalWithAction('REJECT_LVL2')} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Rejeitar (Gerência)</button>
        </div>
      );
    }
    if (status === PurchaseStatus.APROVADA && userHasRole(UserRole.COMPRAS)) {
      return <button onClick={() => handleActionClick('PLACE_ORDER')} className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">Marcar Pedido Realizado</button>;
    }
     if (status === PurchaseStatus.PEDIDO_REALIZADO && userHasRole(UserRole.COMPRAS)) {
      return <button onClick={() => handleActionClick('MARK_DELIVERED')} className="bg-emerald-500 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded">Marcar como Entregue Totalmente</button>;
    }
    // Add more states and actions as needed, e.g., CANCEL for SOLICITANTE on RASCUNHO/PENDENTE_COMPRAS

    return <p className="text-gray-600 italic">Nenhuma ação disponível para si neste momento para o estado "{status}".</p>;
  };

  // Wrapper for simple actions
  const handleActionClick = (eventType: string) => {
    if (!id || !currentRequest) return;
    transitionRequestState(id, { type: eventType });
  };

  // Wrapper for rejection to store event type before opening modal
  const openRejectionModalWithAction = (eventType: string) => {
    setActionToConfirm({ action: 'reject', eventType }); // Store eventType instead of newStatus
    setIsRejectionModalOpen(true);
  };

  // Modified handleRejectionSubmit
   const handleRejectionSubmit = (reason: string) => {
    if (actionToConfirm && id) {
      transitionRequestState(id, { type: actionToConfirm.eventType, payload: { rejectionReason: reason } });
    }
    setIsRejectionModalOpen(false);
    setActionToConfirm(null);
  };


  const { titulo, descricao, status, prioridade, valorTotalEstimado, requisitante, projeto, itens, criadoEm, atualizadoEm, history } = currentRequest;

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Link href="/dashboard/requests" legacyBehavior><a className="text-blue-600 hover:text-blue-800 font-semibold">&larr; Voltar para Lista de Requisições</a></Link>
      </div>

      <div className="bg-white shadow-xl rounded-lg p-8">
        {/* ... (existing details rendering code - title, status badge, detail items, items list) ... */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{titulo}</h1>
            <p className="text-sm text-gray-500 mt-1">ID da Requisição: {currentRequest.id}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Actions Section */}
        <div className="my-8 p-6 border border-gray-200 rounded-lg bg-slate-50">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Ações Disponíveis</h3>
          {renderActions()}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6 mb-8">
          <DetailItem label="Descrição" value={descricao} />
          <DetailItem label="Prioridade" value={prioridade} />
          <DetailItem label="Valor Total Estimado" value={valorTotalEstimado?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
          <DetailItem label="Requisitante" value={requisitante?.firstName ? `${requisitante.firstName} ${requisitante.lastName}` : requisitante?.email} />
          <DetailItem label="Projeto Associado" value={projeto?.nome || 'N/A'} />
          <DetailItem label="Data de Criação" value={new Date(criadoEm).toLocaleDateString('pt-BR')} />
          <DetailItem label="Última Atualização" value={new Date(atualizadoEm).toLocaleDateString('pt-BR')} />
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Itens da Requisição</h3>
          {itens && itens.length > 0 ? (
            <ul className="space-y-4">
              {itens.map((item, index) => (
                <li key={item.id || index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="font-semibold text-gray-700">{item.nome} <span className="text-sm text-gray-600">(Qtd: {item.quantidade})</span></p>
                  {item.descricao && <p className="text-sm text-gray-600 mt-1">{item.descricao}</p>}
                  {item.precoUnitario && <p className="text-sm text-gray-600">Preço Unit.: {item.precoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>}
                  {item.fornecedor && <p className="text-sm text-gray-600">Fornecedor: {item.fornecedor}</p>}
                  {item.urlProduto && <p className="text-sm text-blue-500 hover:underline"><a href={item.urlProduto} target="_blank" rel="noopener noreferrer">Link do Produto</a></p>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">Nenhum item nesta requisição.</p>
          )}
        </div>

        {history && <RequestTimeline history={history} />}
      </div>
      <RejectionReasonModal
        isOpen={isRejectionModalOpen}
        onClose={() => { setIsRejectionModalOpen(false); setActionToConfirm(null); }}
        onSubmit={handleRejectionSubmit}
        isLoading={isLoading} // You might want a specific loading state for action submission
      />
    </div>
  );
};

export default RequestDetailsPage;
