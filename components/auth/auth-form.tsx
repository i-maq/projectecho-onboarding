"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { GlassCard } from '@/components/ui/glass-card';
import { EchoButton } from '@/components/ui/echo-button';
import { EchoInput } from '@/components/ui/echo-input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function AuthForm({ onSuccess }: { onSuccess: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
        onSuccess();
      } else {
        toast.error(data.error || data.message || 'An error occurred');
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error((error as Error).message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="w-full max-w-md px-4"
    >
      <GlassCard variant="strong" className="text-center">
        <div className="flex justify-center mb-4">
          <img
            src="/white_circle_360x360.png"
            alt="Echo"
            className="h-16 w-auto"
          />
        </div>

        <img src="/projectechologo.png" alt="Project Echo logo" className="w-3/4 max-w-xs mx-auto mb-2" />
        <p className="text-echo-text-secondary mb-8">
          {isLogin
            ? 'Sign in to access your personal legacy'
            : 'Create an account to begin your story'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <EchoInput
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <EchoInput
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength={6}
          />
          <EchoButton
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" className="border-white/30 border-t-white" />
                Loading...
              </span>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </EchoButton>
        </form>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-echo-text-muted hover:text-echo-purple-600 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </GlassCard>
    </motion.div>
  );
}
