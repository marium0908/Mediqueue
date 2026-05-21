import React, { useState, useEffect, createContext, useContext } from "react";
import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const ToastContext = createContext(undefined);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  };

  const success = (msg) => addToast(msg, "success");
  const error = (msg) => addToast(msg, "error");
  const info = (msg) => addToast(msg, "info");

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info }}>
      {children}
      <div className="fixed bottom-6 right-6 z-100 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`p-4 rounded-xl border shadow-lg flex items-start gap-3 pointer-events-auto ${
                item.type === "success"
                  ? "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/90 dark:text-emerald-300 dark:border-emerald-800"
                  : item.type === "error"
                  ? "bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/90 dark:text-rose-300 dark:border-rose-800"
                  : "bg-slate-50 text-slate-900 border-slate-200 dark:bg-slate-900/90 dark:text-slate-350 dark:border-slate-800"
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {item.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
                {item.type === "error" && <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
                {item.type === "info" && <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
              </div>
              <div className="flex-grow text-xs font-medium pr-2">
                {item.message}
              </div>
              <button
                onClick={() => removeToast(item.id)}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
