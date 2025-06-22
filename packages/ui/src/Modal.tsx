// packages/ui/src/Modal.tsx
import React, { ReactNode } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
  bodyClassName?: string;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  titleClassName = '',
  bodyClassName = '',
  showCloseButton = true,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out"
      onClick={onClose} // Optional: close on overlay click
    >
      <div
        className={`relative p-6 border w-full max-w-lg shadow-xl rounded-2xl bg-white transform transition-all duration-300 ease-in-out scale-95 group-hover:scale-100 ${className}`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-2xl font-light"
            aria-label="Fechar modal"
          >
            &times;
          </button>
        )}
        {title && (
          <h3 className={`text-xl font-semibold text-gray-800 mb-4 ${titleClassName}`}>
            {title}
          </h3>
        )}
        <div className={bodyClassName}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
