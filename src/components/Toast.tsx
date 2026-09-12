import React, { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info';

interface Toast { id: number; kind: ToastKind; message: string; }

const ToastContext = createContext<{ notify: (kind: ToastKind, message: string) => void } | undefined>(undefined);

let toastId = 0;

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((kind: ToastKind, message: string) => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const remove = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[70] space-y-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-2.5 px-4 py-3 rounded-md shadow-lg text-sm animate-fadeIn border ${
              t.kind === 'success' ? 'bg-white border-emerald-200 text-emerald-800'
              : t.kind === 'error' ? 'bg-white border-red-200 text-red-700'
              : 'bg-white border-primary-200 text-primary-900'
            }`}
            role="status"
          >
            {t.kind === 'success' && <CheckCircle2 size={17} className="shrink-0 mt-0.5 text-emerald-600" />}
            {t.kind === 'error' && <XCircle size={17} className="shrink-0 mt-0.5 text-red-500" />}
            {t.kind === 'info' && <Info size={17} className="shrink-0 mt-0.5 text-primary-700" />}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => remove(t.id)} className="text-slate-400 hover:text-slate-600" aria-label="Dismiss">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
