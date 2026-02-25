"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Return a no-op function if not in provider (for safety)
    return {
      showToast: (type: ToastType, title: string, message?: string) => {
        console.log("[v0] Toast:", type, title, message);
      },
    };
  }
  return context;
}

const toastIcons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const toastStyles = {
  success: "bg-success/10 border-success/30 text-success",
  error: "bg-destructive/10 border-destructive/30 text-destructive",
  warning: "bg-warning/10 border-warning/30 text-warning",
  info: "bg-primary/10 border-primary/30 text-primary",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => {
          const Icon = toastIcons[toast.type];
          return (
            <div
              key={toast.id}
              className={cn(
                "flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-right-full fade-in duration-300",
                "bg-card",
                toastStyles[toast.type]
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground">{toast.title}</p>
                {toast.message && (
                  <p className="text-xs text-muted-foreground mt-1">{toast.message}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
