// src/StatusBadge.tsx
import { jsx } from "react/jsx-runtime";
var StatusBadge = ({ status, className = "" }) => {
  let colorClasses = "bg-gray-200 text-gray-800";
  const normalizedStatus = typeof status === "string" ? status.toUpperCase().replace(/\s+/g, "_") : "UNKNOWN";
  switch (normalizedStatus) {
    case "PENDENTE":
    case "PENDENTE_COMPRAS":
    case "PENDENTE_GERENCIA":
      colorClasses = "bg-yellow-100 text-yellow-800";
      break;
    case "APROVADA":
      colorClasses = "bg-green-100 text-green-800";
      break;
    case "REJEITADA":
      colorClasses = "bg-red-100 text-red-800";
      break;
    case "EM_COTACAO":
      colorClasses = "bg-blue-100 text-blue-800";
      break;
    case "PEDIDO_REALIZADO":
      colorClasses = "bg-purple-100 text-purple-800";
      break;
    case "ENTREGUE_PARCIALMENTE":
      colorClasses = "bg-teal-100 text-teal-800";
      break;
    case "ENTREGUE_TOTALMENTE":
      colorClasses = "bg-emerald-100 text-emerald-800";
      break;
    case "CANCELADA":
      colorClasses = "bg-slate-100 text-slate-800";
      break;
    case "RASCUNHO":
      colorClasses = "bg-stone-100 text-stone-800";
      break;
    default:
      break;
  }
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: `px-3 py-1 text-xs font-semibold rounded-full inline-block ${colorClasses} ${className}`,
      children: typeof status === "string" ? status.replace(/_/g, " ") : "Status Desconhecido"
    }
  );
};

// src/Modal.tsx
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
var Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className = "",
  titleClassName = "",
  bodyClassName = "",
  showCloseButton = true
}) => {
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx2(
    "div",
    {
      className: "fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out",
      onClick: onClose,
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: `relative p-6 border w-full max-w-lg shadow-xl rounded-2xl bg-white transform transition-all duration-300 ease-in-out scale-95 group-hover:scale-100 ${className}`,
          onClick: (e) => e.stopPropagation(),
          children: [
            showCloseButton && /* @__PURE__ */ jsx2(
              "button",
              {
                onClick: onClose,
                className: "absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-2xl font-light",
                "aria-label": "Fechar modal",
                children: "\xD7"
              }
            ),
            title && /* @__PURE__ */ jsx2("h3", { className: `text-xl font-semibold text-gray-800 mb-4 ${titleClassName}`, children: title }),
            /* @__PURE__ */ jsx2("div", { className: bodyClassName, children })
          ]
        }
      )
    }
  );
};

// src/ToastInvokers.tsx
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
var defaultToastOptions = {
  duration: 4e3
  // position: 'top-center', // Default position can be set here or in Toaster component
  // style: {}, // Default style for all toasts
  // className: '',
};
var uiToast = {
  success: (message, options) => {
    return toast.success(message, { ...defaultToastOptions, ...options });
  },
  error: (message, options) => {
    return toast.error(message, { ...defaultToastOptions, ...options });
  },
  loading: (message, options) => {
    return toast.loading(message, { ...defaultToastOptions, ...options });
  },
  custom: (message, options) => {
    return toast(message, { ...defaultToastOptions, ...options });
  },
  dismiss: (toastId) => {
    toast.dismiss(toastId);
  }
  // You can add more specific invokers if needed
  // e.g., promiseToast, specific types of errors, etc.
};
export {
  Modal,
  StatusBadge,
  Toaster,
  uiToast
};
