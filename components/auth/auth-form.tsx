"use client";

import { useState } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase-client';

export function AuthForm({ onSuccess }: { onSuccess: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        toast.success('Welcome back!');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;

        // Supabase returns a user with empty identities if the email is already registered
        // (security measure to avoid leaking whether an account exists)
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          throw new Error('An account with this email may already exist. Try signing in instead.');
        }

        // If email confirmation is required, session will be null
        if (!data.session) {
          toast.success('Check your email to confirm your account before signing in.');
          setIsLogin(true);
          return;
        }

        toast.success('Account created successfully!');
      }
      onSuccess();
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7 }}
      className="w-full max-w-md"
    >
      <div className="glass-panel-light text-center">
        {/* Bolt.new badge at top center */}
        <div className="flex justify-center mb-4">
          <a href="https://bolt.new/" target="_blank" rel="noopener noreferrer">
            <img
              src="/white_circle_360x360.png"
              alt="Powered by Bolt"
              className="h-16 w-auto"
            />
          </a>
        </div>
        <img src="/projectechologo.png" alt="Project Echo logo" className="w-3/4 max-w-xs mx-auto mb-2" />
        <p className="text-gray-600 mb-8 text-body">
          {isLogin
            ? 'Sign in to access your personal legacy'
            : 'Create an account to begin your story'
          }
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-3 rounded-lg bg-white/50 border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-800 text-body"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full p-3 rounded-lg bg-white/50 border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-800 text-body"
            required
            minLength={6}
          />
          <button
            type="submit"
            className="w-full neumorphic-button-light h-12 text-button"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-gray-500 hover:text-purple-600 transition-colors text-caption"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
