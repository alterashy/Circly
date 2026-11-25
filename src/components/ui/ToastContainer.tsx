import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useCirclyStore } from '../../store/useCirclyStore';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useCirclyStore();

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl border bg-white dark:bg-[#121A17] border-[#E2ECE7] dark:border-[#1F2E29] text-[#0B1612] dark:text-[#F2FBF7] backdrop-glass"
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-teal-500 dark:text-teal-400 shrink-0" />}
              <span className="text-xs font-medium">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#6E8B7F] dark:text-[#8BA49B] hover:text-[#0B1612] dark:hover:text-[#F2FBF7] p-1 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
