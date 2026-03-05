'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { GlassCard } from './glass-card';
import { EchoButton } from './echo-button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-[200px] p-4">
          <GlassCard className="max-w-md text-center">
            <h3 className="text-lg font-bold text-echo-text-primary mb-2">
              Something went wrong
            </h3>
            <p className="text-sm text-echo-text-muted mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <EchoButton
              variant="ghost"
              size="sm"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try again
            </EchoButton>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}
