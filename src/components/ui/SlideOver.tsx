import React, { useEffect } from 'react';
import { XIcon } from 'lucide-react';
interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}
export function SlideOver({
  open,
  onClose,
  title,
  children,
  footer
}: SlideOverProps) {
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
    <div className="fixed inset-0 z-40 overflow-hidden">
      <div
        className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true" />
      

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md transform transition-transform animate-slide-in-right">
          <div className="flex h-full flex-col bg-white dark:bg-zinc-900 shadow-xl border-l border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300 focus:outline-none">
                
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="relative flex-1 px-6 py-6 overflow-y-auto">
              {children}
            </div>

            {footer &&
            <div className="flex items-center justify-end px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                {footer}
              </div>
            }
          </div>
        </div>
      </div>
    </div>);

}