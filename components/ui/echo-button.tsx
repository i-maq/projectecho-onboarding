'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface EchoButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'neumorphic' | 'primary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-7 py-3.5 text-base',
  lg: 'px-8 py-4 text-lg',
};

const variantClasses = {
  neumorphic: 'neumorphic-button',
  primary: 'echo-button-primary',
  ghost: 'echo-button-ghost',
};

export const EchoButton = forwardRef<HTMLButtonElement, EchoButtonProps>(
  ({ className, variant = 'neumorphic', size = 'md', children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          variantClasses[variant],
          sizeClasses[size],
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);
EchoButton.displayName = 'EchoButton';
