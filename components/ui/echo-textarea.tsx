'use client';

import { forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface EchoTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const EchoTextarea = forwardRef<HTMLTextAreaElement, EchoTextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-echo-text-secondary mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'echo-input min-h-[120px] resize-y',
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
EchoTextarea.displayName = 'EchoTextarea';
