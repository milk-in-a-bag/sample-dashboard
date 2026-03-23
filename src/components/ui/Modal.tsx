import React, { useEffect } from 'react';
import { XIcon } from 'lucide-react';
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div
        className="fixed inset-0 bg-zinc-900/80 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true" />
      

      <div className="relative bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-md border border-zinc-200 dark:border-zinc-800 animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300 focus:outline-none">
            
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4">{children}</div>
      </div>
    </div>);

}