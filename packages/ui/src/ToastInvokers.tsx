// packages/ui/src/ToastInvokers.tsx
import toast, { ToastOptions, ToasterProps, ToastPosition } from 'react-hot-toast';

// This component would typically be placed in the root layout of the consuming application.
// Exporting it from 'ui' allows the consuming app to use a pre-styled/configured Toaster.
export { Toaster } from 'react-hot-toast';
export type { ToasterProps, ToastPosition };


// Wrapper functions for consistent toast notifications
// These can be customized with default options, styles, icons, etc.

const defaultToastOptions: ToastOptions = {
  duration: 4000,
  // position: 'top-center', // Default position can be set here or in Toaster component
  // style: {}, // Default style for all toasts
  // className: '',
};

export const uiToast = {
  success: (message: string, options?: ToastOptions) => {
    return toast.success(message, { ...defaultToastOptions, ...options });
  },
  error: (message: string, options?: ToastOptions) => {
    return toast.error(message, { ...defaultToastOptions, ...options });
  },
  loading: (message: string, options?: ToastOptions) => {
    return toast.loading(message, { ...defaultToastOptions, ...options });
  },
  custom: (message: string, options?: ToastOptions) => {
    // For more complex custom toasts if needed
    return toast(message, { ...defaultToastOptions, ...options });
  },
  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },
  // You can add more specific invokers if needed
  // e.g., promiseToast, specific types of errors, etc.
};

// Example of how this might be used in apps/web:
// import { uiToast, Toaster } from 'ui';
// // In a component:
// // uiToast.success('Operation successful!');
// // In the main layout:
// // <Toaster position="top-right" />

export default uiToast;
