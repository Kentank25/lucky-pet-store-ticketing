import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import Button from "../ui/Button";

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
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isLoading) {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={message ? descId : undefined}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in"
    >
      <div className="w-full max-w-sm scale-100 overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface shadow-xl animate-scale-in dark:shadow-black/50">
        <div
          className={`border-b p-6 ${
            isDanger
              ? "border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/30"
              : "border-teal-200 bg-teal-50 dark:border-teal-900/40 dark:bg-teal-950/30"
          }`}
        >
          <h3
            id={titleId}
            className={`flex items-center gap-2 font-heading text-lg font-bold ${
              isDanger
                ? "text-red-900 dark:text-red-200"
                : "text-teal-900 dark:text-teal-200"
            }`}
          >
            {isDanger ? (
              <ExclamationTriangleIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
            ) : (
              <InformationCircleIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
            )}
            <span>{title}</span>
          </h3>
          {message && (
            <p
              id={descId}
              className={`mt-1.5 text-sm ${
                isDanger
                  ? "text-red-800 dark:text-red-300"
                  : "text-teal-800 dark:text-teal-300"
              }`}
            >
              {message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 bg-bg-surface p-5">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={isDanger ? "danger" : "primary"}
            onClick={onConfirm}
            loading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
