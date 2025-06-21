"use client";

import React, { useEffect } from 'react';
import { useParams, useRouter }
from 'next/navigation'; // useParams for getting id, useRouter for navigation
import Link from 'next/link';
import useRequestStore from '../../../../stores/useRequestStore'; // Adjust path
import { RequestHistoryEntry, PurchaseRequestWithHistory } from '../../../../stores/useRequestStore'; // Assuming type is exported

// Re-usable StatusBadge (consider moving to a shared components folder if not already)
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let color = 'bg-gray-400'; // Default
  if (status === 'PENDENTE') color = 'bg-yellow-500 text-yellow-800';
  else if (status === 'APROVADA') color = 'bg-green-500 text-green-800';
  else if (status === 'REJEITADA') color = 'bg-red-500 text-red-800';
  else if (status === 'EM_COTACAO') color = 'bg-blue-500 text-blue-800';
  else if (status === 'PEDIDO_REALIZADO') color = 'bg-purple-500 text-purple-800';
  else if (status === 'ENTREGUE_PARCIALMENTE') color = 'bg-teal-500 text-teal-800';
  else if (status === 'ENTREGUE_TOTALMENTE') color = 'bg-emerald-500 text-emerald-800';
  else if (status === 'CANCELADA') color = 'bg-slate-500 text-slate-800';

  return (
    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${color.replace(/text-\w+-\d+/, 'text-white')}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

// Re-usable LoadingSpinner (consider moving)
const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600"></div>
  </div>
);

// DetailItem for consistent layout
const DetailItem: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
  <div className="mb-3">
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="text-md text-gray-800">{value || 'N/A'}</p>
  </div>
);

// Timeline Component
const RequestTimeline: React.FC<{ history: RequestHistoryEntry[] }> = ({ history }) => {
  if (!history || history.length === 0) {
    return <p className="text-gray-600">Nenhum histórico disponível para esta requisição.</p>;
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Histórico da Requisição</h3>
      <div className="relative border-l-2 border-blue-500 pl-6 space-y-8">
        {history.map((entry, index) => (
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


const RequestDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : undefined;

  const { currentRequest, isLoading, error, fetchRequestById } = useRequestStore();

  useEffect(() => {
    if (id) {
      fetchRequestById(id);
    }
  }, [id, fetchRequestById]);

  if (isLoading || !id) {
    return (
      <div className="container mx-auto p-6">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Erro</h1>
        <p className="text-red-500">{error}</p>
        <Link href="/dashboard/requests" legacyBehavior>
          <a className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">
            Voltar para Lista
          </a>
        </Link>
      </div>
    );
  }

  if (!currentRequest) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Requisição Não Encontrada</h1>
        <p>A requisição que você está procurando não foi encontrada.</p>
        <Link href="/dashboard/requests" legacyBehavior>
          <a className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">
            Voltar para Lista
          </a>
        </Link>
      </div>
    );
  }

  const { titulo, descricao, status, prioridade, valorTotalEstimado, requisitante, projeto, itens, criadoEm, atualizadoEm, history } = currentRequest;

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Link href="/dashboard/requests" legacyBehavior>
          <a className="text-blue-600 hover:text-blue-800 font-semibold">&larr; Voltar para Lista de Requisições</a>
        </Link>
      </div>

      <div className="bg-white shadow-xl rounded-lg p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{titulo}</h1>
            <p className="text-sm text-gray-500 mt-1">ID da Requisição: {currentRequest.id}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <StatusBadge status={status} />
          </div>
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
    </div>
  );
};

export default RequestDetailsPage;
