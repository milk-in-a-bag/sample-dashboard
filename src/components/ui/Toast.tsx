import React from 'react';
import { useApp } from '../../context/AppContext';
export function ToastContainer() {
  const { toasts } = useApp();
  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 pointer-events-none">
      {toasts.map((toast) =>
      <div
        key={toast.id}
        className={`pointer-events-auto w-full max-w-sm bg-white dark:bg-zinc-800 shadow-lg rounded-lg border-l-4 border-y border-r border-y-zinc-200 border-r-zinc-200 dark:border-y-zinc-700 dark:border-r-zinc-700 p-4 animate-slide-in-right flex items-center
            ${toast.type === 'success' ? 'border-l-green-500' : 'border-l-red-500'}
          `}>
        
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {toast.message}
          </p>
        </div>
      )}
    </div>);

}