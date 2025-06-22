// Este arquivo irá re-exportar funções do react-hot-toast
// para que a aplicação web possa usá-las através do pacote ui.
// A configuração do <Toaster /> em si deve ser feita na aplicação web (apps/web).

import { toast, ToastOptions, Toaster } from 'react-hot-toast';

// Re-exportar o componente Toaster para que a app web possa usá-lo
// a partir daqui se desejado, embora seja mais comum importá-lo diretamente.
export { Toaster };

// Funções utilitárias para mostrar toasts comuns
// Estas podem ser personalizadas com opções padrão se necessário.

export const showSuccessToast = (message: string, options?: ToastOptions) => {
  return toast.success(message, {
    duration: 4000,
    position: 'top-right',
    ...options,
  });
};

export const showErrorToast = (message: string, options?: ToastOptions) => {
  return toast.error(message, {
    duration: 5000,
    position: 'top-right',
    ...options,
  });
};

export const showLoadingToast = (message: string, options?: ToastOptions) => {
  return toast.loading(message, {
    position: 'top-right',
    ...options,
  });
};

export const showInfoToast = (message: string, options?: ToastOptions) => {
  // react-hot-toast não tem um `toast.info` por padrão, mas podemos usar `toast.custom`
  // ou apenas `toast` com um ícone. Por simplicidade, vamos usar `toast()`.
  return toast(message, {
    duration: 4000,
    position: 'top-right',
    icon: 'ℹ️', // Exemplo de ícone
    ...options,
  });
};

export const dismissToast = (toastId?: string) => {
  toast.dismiss(toastId);
};

// Re-exportar o objeto toast inteiro se for necessário acesso a mais funcionalidades
export { toast as genericToast };
