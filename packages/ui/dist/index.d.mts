import React, { ReactNode } from 'react';
import { ToastOptions } from 'react-hot-toast';
export { ToastPosition, Toaster, ToasterProps } from 'react-hot-toast';

type BadgeStatus = 'PENDENTE' | 'APROVADA' | 'REJEITADA' | 'EM_COTACAO' | 'PEDIDO_REALIZADO' | 'ENTREGUE_PARCIALMENTE' | 'ENTREGUE_TOTALMENTE' | 'CANCELADA' | 'RASCUNHO' | string;
interface StatusBadgeProps {
    status: BadgeStatus;
    className?: string;
}
declare const StatusBadge: React.FC<StatusBadgeProps>;

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    className?: string;
    titleClassName?: string;
    bodyClassName?: string;
    showCloseButton?: boolean;
}
declare const Modal: React.FC<ModalProps>;

declare const uiToast: {
    success: (message: string, options?: ToastOptions) => string;
    error: (message: string, options?: ToastOptions) => string;
    loading: (message: string, options?: ToastOptions) => string;
    custom: (message: string, options?: ToastOptions) => string;
    dismiss: (toastId?: string) => void;
};

export { type BadgeStatus, Modal, type ModalProps, StatusBadge, type StatusBadgeProps, uiToast };
