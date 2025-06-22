"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export function AuthForm({ onSuccess }: { onSuccess: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // ... (This logic remains the same)
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        toast.success(isLogin ? 'Welcome.' : 'Account created.');
        onSuccess();
      } else {
        toast.error(data.error || 'An error occurred.');
      }
    } catch (error) {
      toast.error('An error occurred.');
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
            type="email" placeholder="Email"
            value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-3 rounded-lg bg-white/50 border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-800"
            required
          />
          <input
            type="password" placeholder="Password"
            value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full p-3 rounded-lg bg-white/50 border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-800"
            required
          />
          <button type="submit" className="w-full neumorphic-button-light h-12" disabled={isLoading} >
            {isLoading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>
        <div className="mt-6">
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-sm text-gray-500 hover:text-purple-600 transition-colors" >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}