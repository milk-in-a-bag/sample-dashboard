import React, { forwardRef } from 'react';
interface InputProps extends
  React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  textarea?: boolean;
  helperText?: string;
}
export const Input = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputProps>(
  ({ label, error, textarea, helperText, className = '', ...props }, ref) => {
    const baseStyles =
    'block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500 transition-colors';
    const errorStyles = error ?
    'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-500/50 dark:text-red-400' :
    '';
    return (
      <div className={className}>
      {label &&
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          {label}
        </label>
        }
      {textarea ?
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          className={`${baseStyles} ${errorStyles}`}
          {...props as React.TextareaHTMLAttributes<HTMLTextAreaElement>} /> :


        <input
          ref={ref as React.Ref<HTMLInputElement>}
          className={`${baseStyles} ${errorStyles}`}
          {...props as React.InputHTMLAttributes<HTMLInputElement>} />

        }
      {helperText && !error &&
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {helperText}
        </p>
        }
      {error &&
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
        }
    </div>);

  });
Input.displayName = 'Input';