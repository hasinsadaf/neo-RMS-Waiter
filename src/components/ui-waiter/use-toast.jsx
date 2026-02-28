import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, description, variant = "default" }) => {
      const id = Date.now().toString();
      setToasts((current) => [
        ...current,
        {
          id,
          title,
          description,
          variant,
        },
      ]);

      // Auto dismiss after 3 seconds
      setTimeout(() => removeToast(id), 3000);
    },
    [removeToast]
  );

  const value = useMemo(
    () => ({
      toast: addToast,
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex items-start justify-center px-4 sm:justify-end sm:px-6">
        <div className="flex w-full max-w-sm flex-col gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto overflow-hidden rounded-xl border px-4 py-3 shadow-lg backdrop-blur ${
                toast.variant === "destructive"
                  ? "border-red-500/40 bg-red-950/80 text-red-50"
                  : "border-neutral-700 bg-neutral-900/90 text-neutral-50"
              }`}
            >
              {toast.title && (
                <div className="text-sm font-semibold">{toast.title}</div>
              )}
              {toast.description && (
                <div className="mt-1 text-xs text-neutral-300">
                  {toast.description}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    return {
      toast: () => {
        // eslint-disable-next-line no-console
        console.warn("useToast must be used within a ToastProvider.");
      },
    };
  }

  return context;
}

