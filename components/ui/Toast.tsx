"use client";

import { createContext, useContext, useCallback, useReducer, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type ToastType = "success" | "error";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

type ToastAction =
  | { type: "ADD"; toast: Toast }
  | { type: "REMOVE"; id: string };

// ─── Reducer ──────────────────────────────────────────────────────────────────
function toastReducer(state: Toast[], action: ToastAction): Toast[] {
  switch (action.type) {
    case "ADD":
      return [...state.slice(-2), action.toast]; // max 3 visible
    case "REMOVE":
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ─── Individual Toast ─────────────────────────────────────────────────────────
function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    timerRef.current = setTimeout(() => onRemove(toast.id), 3500);
    return () => clearTimeout(timerRef.current);
  }, [toast.id, onRemove]);

  const isSuccess = toast.type === "success";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      role="alert"
      aria-live="polite"
      className={`relative flex items-center gap-3 px-4 py-3 rounded-xl bg-surface border shadow-xl max-w-xs w-full ${
        isSuccess ? "border-primary border-l-[3px] border-l-primary" : "border-red-500 border-l-[3px] border-l-red-500"
      }`}
    >
      {isSuccess ? (
        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
      )}
      <p className="text-white text-sm font-inter flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss notification"
        className="text-text-muted hover:text-white transition-colors ml-1 flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const add = useCallback((message: string, type: ToastType) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    dispatch({ type: "ADD", toast: { id, message, type } });
  }, []);

  const remove = useCallback((id: string) => {
    dispatch({ type: "REMOVE", id });
  }, []);

  const success = useCallback((message: string) => add(message, "success"), [add]);
  const error = useCallback((message: string) => add(message, "error"), [add]);

  return (
    <ToastContext.Provider value={{ success, error }}>
      {children}
      {/* Toast container — fixed top-right */}
      <div
        aria-label="Notifications"
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <ToastItem toast={t} onRemove={remove} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
