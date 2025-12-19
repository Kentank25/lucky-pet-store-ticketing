import { createPortal } from "react-dom";
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  isDanger = false,
  isLoading = false,
}) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4 z-[9999]">
      <div className="bg-bg-surface rounded-3xl w-full max-w-sm shadow-2xl dark:shadow-none border border-border-subtle overflow-hidden scale-100 animate-scale-in">
        <div
          className={`p-6 border-b ${
            isDanger
              ? "bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/30"
              : "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/30"
          }`}
        >
          <h3
            className={`text-xl font-bold flex items-center gap-2 ${
              isDanger
                ? "text-rose-800 dark:text-rose-200"
                : "text-indigo-800 dark:text-indigo-200"
            }`}
          >
            {isDanger ? (
              <ExclamationTriangleIcon className="w-6 h-6" />
            ) : (
              <InformationCircleIcon className="w-6 h-6" />
            )}
            {title}
          </h3>
          <p
            className={`text-sm mt-1 opacity-80 ${
              isDanger
                ? "text-rose-700 dark:text-rose-300"
                : "text-indigo-700 dark:text-indigo-300"
            }`}
          >
            {message}
          </p>
        </div>

        <div className="p-6 flex gap-3 justify-end bg-bg-surface">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl font-bold text-text-secondary hover:bg-bg-subtle transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none flex items-center gap-2 ${
              isDanger
                ? "bg-rose-600 hover:bg-rose-700 shadow-rose-200 dark:shadow-none"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none"
            }`}
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
