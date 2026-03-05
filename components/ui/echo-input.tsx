'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface EchoInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const EchoInput = forwardRef<HTMLInputElement, EchoInputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-echo-text-secondary mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'echo-input',
            error && 'border-echo-error focus:border-echo-error focus:ring-red-100',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-echo-error">{error}</p>
        )}
      </div>
    );
  }
);
EchoInput.displayName = 'EchoInput';
