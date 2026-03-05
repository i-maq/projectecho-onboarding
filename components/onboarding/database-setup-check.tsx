"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Database, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { EchoButton } from '@/components/ui/echo-button';

interface DatabaseSetupCheckProps {
  onContinue: () => void;
}

export function DatabaseSetupCheck({ onContinue }: DatabaseSetupCheckProps) {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    checkDatabaseConnection();
  }, []);

  const checkDatabaseConnection = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { setConnectionStatus('error'); setErrorMessage('Please sign in again'); return; }

      const response = await fetch('/api/profile', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      // Accept both 200 (found) and 404 (no profile yet) as success
      if (response.ok || response.status === 404) {
        setConnectionStatus('success');
        setTimeout(() => onContinue(), 1500);
      } else {
        const errorData = await response.json();
        setConnectionStatus('error');
        setErrorMessage(errorData.error || 'Connection failed');
      }
    } catch (error) {
      console.error('Database connection test failed:', error);
      setConnectionStatus('error');
      setErrorMessage('Unable to connect. Please check your configuration.');
    }
  };

  const statusColors = {
    checking: 'bg-echo-gradient',
    success: 'bg-gradient-to-br from-emerald-500 to-green-600',
    error: 'bg-gradient-to-br from-red-500 to-red-600',
  };

  return (
    <div className="w-full h-full flex items-center justify-center px-6 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md mx-auto"
      >
        <GlassCard className="text-center">
          <motion.div
            className="flex justify-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-echo-glow ${statusColors[connectionStatus]}`}>
              {connectionStatus === 'checking' && <Loader2 className="h-10 w-10 text-white animate-spin" />}
              {connectionStatus === 'success' && <CheckCircle className="h-10 w-10 text-white" />}
              {connectionStatus === 'error' && <AlertCircle className="h-10 w-10 text-white" />}
            </div>
          </motion.div>

          <h2 className="text-3xl font-extrabold mb-3 text-echo-text-primary">
            {connectionStatus === 'checking' && 'Connecting to Your Journal'}
            {connectionStatus === 'success' && 'Connected Securely!'}
            {connectionStatus === 'error' && 'Connection Failed'}
          </h2>

          <p className="text-echo-text-secondary mb-8">
            {connectionStatus === 'checking' && 'Setting up your private journal storage...'}
            {connectionStatus === 'success' && 'Your secure journal database is ready.'}
            {connectionStatus === 'error' && 'Unable to connect to your database.'}
          </p>

          {connectionStatus === 'error' && (
            <div className="mb-6">
              <GlassCard className="!p-4 mb-4 text-left">
                <p className="text-echo-error text-sm">{errorMessage}</p>
              </GlassCard>
              <EchoButton variant="primary" onClick={() => { setConnectionStatus('checking'); setErrorMessage(''); checkDatabaseConnection(); }}>
                Retry Connection
              </EchoButton>
            </div>
          )}

          {connectionStatus === 'checking' && (
            <div className="flex items-center justify-center">
              <Database className="h-5 w-5 text-echo-text-muted mr-2" />
              <span className="text-echo-text-muted">Testing connection...</span>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
