'use client';

import { ReactNode } from 'react';
import { MasterBackground } from '@/components/master-background';

interface AppShellProps {
  children: ReactNode;
  showBackground?: boolean;
  className?: string;
}

export function AppShell({ children, showBackground = true, className = '' }: AppShellProps) {
  return (
    <main
      className={`bg-echo-bg-primary w-screen h-screen overflow-hidden relative flex items-center justify-center ${className}`}
    >
      {showBackground && <MasterBackground />}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {children}
      </div>
    </main>
  );
}
