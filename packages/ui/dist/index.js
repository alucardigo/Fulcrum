"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.tsx
var index_exports = {};
__export(index_exports, {
  Modal: () => Modal,
  StatusBadge: () => StatusBadge,
  Toaster: () => import_react_hot_toast2.Toaster,
  uiToast: () => uiToast
});
module.exports = __toCommonJS(index_exports);

// src/StatusBadge.tsx
var import_jsx_runtime = require("react/jsx-runtime");
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "span",
    {
      className: `px-3 py-1 text-xs font-semibold rounded-full inline-block ${colorClasses} ${className}`,
      children: typeof status === "string" ? status.replace(/_/g, " ") : "Status Desconhecido"
    }
  );
};

// src/Modal.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
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
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    "div",
    {
      className: "fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out",
      onClick: onClose,
      children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
        "div",
        {
          className: `relative p-6 border w-full max-w-lg shadow-xl rounded-2xl bg-white transform transition-all duration-300 ease-in-out scale-95 group-hover:scale-100 ${className}`,
          onClick: (e) => e.stopPropagation(),
          children: [
            showCloseButton && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "button",
              {
                onClick: onClose,
                className: "absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-2xl font-light",
                "aria-label": "Fechar modal",
                children: "\xD7"
              }
            ),
            title && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h3", { className: `text-xl font-semibold text-gray-800 mb-4 ${titleClassName}`, children: title }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: bodyClassName, children })
          ]
        }
      )
    }
  );
};

// src/ToastInvokers.tsx
var import_react_hot_toast = __toESM(require("react-hot-toast"));
var import_react_hot_toast2 = require("react-hot-toast");
var defaultToastOptions = {
  duration: 4e3
  // position: 'top-center', // Default position can be set here or in Toaster component
  // style: {}, // Default style for all toasts
  // className: '',
};
var uiToast = {
  success: (message, options) => {
    return import_react_hot_toast.default.success(message, { ...defaultToastOptions, ...options });
  },
  error: (message, options) => {
    return import_react_hot_toast.default.error(message, { ...defaultToastOptions, ...options });
  },
  loading: (message, options) => {
    return import_react_hot_toast.default.loading(message, { ...defaultToastOptions, ...options });
  },
  custom: (message, options) => {
    return (0, import_react_hot_toast.default)(message, { ...defaultToastOptions, ...options });
  },
  dismiss: (toastId) => {
    import_react_hot_toast.default.dismiss(toastId);
  }
  // You can add more specific invokers if needed
  // e.g., promiseToast, specific types of errors, etc.
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Modal,
  StatusBadge,
  Toaster,
  uiToast
});
