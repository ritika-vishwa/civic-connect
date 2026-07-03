import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface NotificationContextProps {
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type'], duration?: number) => void;
  removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast Render Area */}
      <div className="fixed top-24 right-4 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => {
            let icon = 'info';
            let colorClass = 'text-primary border-primary-container/30';
            if (toast.type === 'success') {
              icon = 'check_circle';
              colorClass = 'text-green-400 border-green-500/30';
            } else if (toast.type === 'error') {
              icon = 'error';
              colorClass = 'text-error border-error-container/30';
            } else if (toast.type === 'warning') {
              icon = 'warning';
              colorClass = 'text-yellow-400 border-yellow-500/30';
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl glass-card border ${colorClass} shadow-lg`}
              >
                <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">{icon}</span>
                <p className="text-xs font-mono tracking-wide text-white font-medium">{toast.message}</p>
                <button 
                  onClick={() => removeToast(toast.id)}
                  className="ml-auto text-white/40 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
export default NotificationContext;
