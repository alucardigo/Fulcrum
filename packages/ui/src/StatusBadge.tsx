// packages/ui/src/StatusBadge.tsx
import React from 'react';

// Define status types if you want specific ones, or allow any string
// For now, let's keep it flexible but demonstrate potential known statuses
export type BadgeStatus =
  | 'PENDENTE'
  | 'APROVADA'
  | 'REJEITADA'
  | 'EM_COTACAO'
  | 'PEDIDO_REALIZADO'
  | 'ENTREGUE_PARCIALMENTE'
  | 'ENTREGUE_TOTALMENTE'
  | 'CANCELADA'
  | 'RASCUNHO'
  | string; // Allow other strings

export interface StatusBadgeProps {
  status: BadgeStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  let colorClasses = 'bg-gray-200 text-gray-800'; // Default

  // Normalize status for comparison (optional, good for case-insensitivity)
  const normalizedStatus = typeof status === 'string' ? status.toUpperCase().replace(/\s+/g, '_') : 'UNKNOWN';

  switch (normalizedStatus) {
    case 'PENDENTE':
    case 'PENDENTE_COMPRAS':
    case 'PENDENTE_GERENCIA':
      colorClasses = 'bg-yellow-100 text-yellow-800';
      break;
    case 'APROVADA':
      colorClasses = 'bg-green-100 text-green-800';
      break;
    case 'REJEITADA':
      colorClasses = 'bg-red-100 text-red-800';
      break;
    case 'EM_COTACAO':
      colorClasses = 'bg-blue-100 text-blue-800';
      break;
    case 'PEDIDO_REALIZADO':
      colorClasses = 'bg-purple-100 text-purple-800';
      break;
    case 'ENTREGUE_PARCIALMENTE':
      colorClasses = 'bg-teal-100 text-teal-800';
      break;
    case 'ENTREGUE_TOTALMENTE':
      colorClasses = 'bg-emerald-100 text-emerald-800';
      break;
    case 'CANCELADA':
      colorClasses = 'bg-slate-100 text-slate-800';
      break;
    case 'RASCUNHO':
      colorClasses = 'bg-stone-100 text-stone-800';
      break;
    default:
      // Keep default for unknown statuses
      break;
  }

  return (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full inline-block ${colorClasses} ${className}`}
    >
      {typeof status === 'string' ? status.replace(/_/g, ' ') : 'Status Desconhecido'}
    </span>
  );
};

export default StatusBadge;
