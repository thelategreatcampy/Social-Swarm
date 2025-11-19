import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto min-w-[250px] px-4 py-3 border-l-4 shadow-lg backdrop-blur-md animate-slideIn
              ${toast.type === 'success' ? 'bg-black/90 border-neon-green text-white' : ''}
              ${toast.type === 'error' ? 'bg-black/90 border-neon-red text-white' : ''}
              ${toast.type === 'info' ? 'bg-black/90 border-neon-blue text-white' : ''}
            `}
          >
            <div className="flex items-center gap-3 font-mono text-sm">
              {toast.type === 'success' && <i className="fas fa-check-circle text-neon-green"></i>}
              {toast.type === 'error' && <i className="fas fa-exclamation-triangle text-neon-red"></i>}
              {toast.type === 'info' && <i className="fas fa-info-circle text-neon-blue"></i>}
              <span>{toast.message}</span>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};