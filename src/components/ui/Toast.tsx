import React, { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastKind = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}

interface ToastContextValue {
  show: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, kind: ToastKind = "success") => {
    const id = ++counter;
    setItems((prev) => [...prev, { id, message, kind }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismiss = (id: number) => setItems((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6">
        {items.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-md animate-[toast-in_0.25s_ease-out] ${
              t.kind === "success"
                ? "border-emerald-200 bg-emerald-50/95 text-emerald-900"
                : t.kind === "error"
                ? "border-rose-200 bg-rose-50/95 text-rose-900"
                : "border-amber-200 bg-amber-50/95 text-amber-900"
            }`}
            role="status"
          >
            {t.kind === "success" && <CheckCircle2 className="h-5 w-5 shrink-0" />}
            {t.kind === "error" && <XCircle className="h-5 w-5 shrink-0" />}
            {t.kind === "info" && <Info className="h-5 w-5 shrink-0" />}
            <p className="flex-1 text-sm font-medium leading-snug">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="rounded-full p-1 text-current/70 hover:bg-black/5"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue | undefined {
  return useContext(ToastContext);
}
