"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";

type ToastType = "success" | "error" | "info" | "notification";

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const removeToast = useCallback((id: string) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, title: string, message?: string, duration?: number) => {
    const id = crypto.randomUUID();
    const dur = duration || (type === "error" ? 5000 : 3000);
    setToasts(prev => [...prev.slice(-4), { id, type, title, message, duration: dur }]);
    timers.current[id] = setTimeout(() => removeToast(id), dur);
  }, [removeToast]);

  const icons: Record<ToastType, string> = {
    success: "check_circle",
    error: "error",
    info: "info",
    notification: "notifications_active",
  };

  const colors: Record<ToastType, string> = {
    success: "text-emerald-500",
    error: "text-red-500",
    info: "text-blue-500",
    notification: "text-primary",
  };

  const borders: Record<ToastType, string> = {
    success: "border-l-emerald-500",
    error: "border-l-red-500",
    info: "border-l-blue-500",
    notification: "border-l-primary",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container - top right */}
      <div className="fixed top-20 right-4 z-[10000] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-surface-container-lowest border border-outline-variant/20 border-l-4 ${borders[toast.type]} rounded-xl px-4 py-3 editorial-shadow flex items-start gap-3 toast-slide-in`}
          >
            <span className={`material-symbols-outlined text-[22px] mt-0.5 ${colors[toast.type]}`}>
              {icons[toast.type]}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-on-surface">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-0.5 rounded-full text-on-surface-variant/40 hover:text-on-surface-variant hover:bg-surface-container-high transition-colors flex-shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
