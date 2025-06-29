"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Database, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface DatabaseSetupCheckProps {
  onContinue: () => void;
}

export function DatabaseSetupCheck({ onContinue }: DatabaseSetupCheckProps) {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    checkDatabaseConnection();
  }, []);

  const checkDatabaseConnection = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setConnectionStatus('error');
        setErrorMessage('Please sign in again');
        return;
      }

      // Test the database connection
      const response = await fetch('/api/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setConnectionStatus('success');
        setTimeout(() => {
          onContinue();
        }, 1500);
      } else {
        const errorData = await response.json();
        setConnectionStatus('error');
        setErrorMessage(errorData.details || errorData.error || 'Database connection failed');
      }
    } catch (error) {
      console.error('Database connection test failed:', error);
      setConnectionStatus('error');
      setErrorMessage('Unable to connect to database. Please check your configuration.');
    }
  };

  const retryConnection = () => {
    setConnectionStatus('checking');
    setErrorMessage('');
    checkDatabaseConnection();
  };

  return (
    <div className="w-full h-full flex items-center justify-center px-6 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="glass-panel-light text-center">
          <motion.div 
            className="flex justify-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${
              connectionStatus === 'success' 
                ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                : connectionStatus === 'error'
                ? 'bg-gradient-to-br from-red-500 to-red-600'
                : 'bg-gradient-to-br from-blue-500 to-indigo-600'
            }`}>
              {connectionStatus === 'checking' && <Loader2 className="h-10 w-10 text-white animate-spin" />}
              {connectionStatus === 'success' && <CheckCircle className="h-10 w-10 text-white" />}
              {connectionStatus === 'error' && <AlertCircle className="h-10 w-10 text-white" />}
            </div>
          </motion.div>

          <h2 className="text-3xl font-extrabold mb-3 text-gray-800 text-title">
            {connectionStatus === 'checking' && 'Connecting to Your Journal'}
            {connectionStatus === 'success' && 'Connected Securely!'}
            {connectionStatus === 'error' && 'Connection Failed'}
          </h2>
          
          <p className="text-gray-600 mb-8 text-body">
            {connectionStatus === 'checking' && 'Setting up your private journal storage...'}
            {connectionStatus === 'success' && 'Your secure journal database is ready.'}
            {connectionStatus === 'error' && 'Unable to connect to your database.'}
          </p>

          {connectionStatus === 'error' && (
            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700 text-sm text-body">{errorMessage}</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left text-sm text-body">
                <h4 className="font-semibold text-blue-800 mb-2">Setup Required:</h4>
                <ol className="list-decimal list-inside space-y-1 text-blue-700">
                  <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a> and create/sign into your account</li>
                  <li>Find your project URL and API keys in Project Settings → API</li>
                  <li>Update your <code className="bg-blue-100 px-1 rounded">.env.local</code> file with these values</li>
                  <li>Restart the development server</li>
                </ol>
              </div>

              <button
                onClick={retryConnection}
                className="neumorphic-button-light bg-blue-600 text-white shadow-lg hover:bg-blue-700 text-button px-8 mt-4"
              >
                Retry Connection
              </button>
            </div>
          )}

          {connectionStatus === 'checking' && (
            <div className="flex items-center justify-center">
              <Database className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-500 text-body">Testing connection...</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}