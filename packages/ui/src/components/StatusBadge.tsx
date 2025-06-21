import React from 'react';
import { cn } from '../lib/utils'; // Assumindo que teremos um utilitário cn como o do Shadcn

export type RequestStatus = 'RASCUNHO' | 'PENDENTE_COMPRAS' | 'APROVADO' | 'REJEITADO' | 'EM_COMPRA' | 'CONCLUIDO';

interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: RequestStatus;
}

const statusStyles: Record<RequestStatus, string> = {
  RASCUNHO: 'bg-gray-200 text-gray-800 border-gray-300',
  PENDENTE_COMPRAS: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  APROVADO: 'bg-green-100 text-green-800 border-green-300',
  REJEITADO: 'bg-red-100 text-red-800 border-red-300',
  EM_COMPRA: 'bg-blue-100 text-blue-800 border-blue-300',
  CONCLUIDO: 'bg-purple-100 text-purple-800 border-purple-300',
};

const statusTexts: Record<RequestStatus, string> = {
  RASCUNHO: 'Rascunho',
  PENDENTE_COMPRAS: 'Pendente Compras',
  APROVADO: 'Aprovado',
  REJEITADO: 'Rejeitado',
  EM_COMPRA: 'Em Compra',
  CONCLUIDO: 'Concluído',
};

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        statusStyles[status],
        className
      )}
      {...props}
    >
      {statusTexts[status]}
    </div>
  );
}
