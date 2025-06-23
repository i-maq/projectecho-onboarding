"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { createClientComponentClient } from '@/lib/supabase';

export function AuthForm({ onSuccess }: { onSuccess: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          toast.error(error.message || 'Login failed');
        } else if (data.user) {
          // Store session in localStorage for API calls
          if (data.session) {
            localStorage.setItem('supabase_session', JSON.stringify(data.session));
            localStorage.setItem('token', data.session.access_token);
          }
          toast.success('Welcome back!');
          onSuccess();
        }
      } else {
        // Sign up with Supabase
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          toast.error(error.message || 'Registration failed');
        } else if (data.user) {
          // Store session in localStorage for API calls
          if (data.session) {
            localStorage.setItem('supabase_session', JSON.stringify(data.session));
            localStorage.setItem('token', data.session.access_token);
          }
          toast.success('Account created successfully!');
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('An unexpected error occurred');
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
        <h1 className="text-5xl font-bold mb-2 text-gray-800">Echo</h1>
        <p className="text-gray-600 mb-8">
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
            className="w-full p-3 rounded-lg bg-white/50 border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-800"
            required
          />
          <input
            type="password" 
            placeholder="Password"
            value={formData.password} 
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full p-3 rounded-lg bg-white/50 border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-800"
            required
            minLength={6}
          />
          <button 
            type="submit" 
            className="w-full neumorphic-button-light h-12" 
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>
        <div className="mt-6">
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-sm text-gray-500 hover:text-purple-600 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}