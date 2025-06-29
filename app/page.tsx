"use client";

import React, { useState, useEffect } from 'react';
import { AuthForm } from '@/components/auth/auth-form';
import { ExtendedOnboardingFlow } from '@/components/onboarding/extended-onboarding-flow';
import { Dashboard } from '@/components/dashboard/dashboard';
import { MasterBackground } from '@/components/master-background';

// --- The main page component ---
export default function HomePage() {
  const [currentStep, setCurrentStep] = useState<'auth' | 'onboarding' | 'dashboard' | 'loading'>('loading');

  useEffect(() => {
    // Check for existing token and user
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const hasCompletedOnboarding = localStorage.getItem('onboardingComplete');
    
    if (token && user) {
      if (hasCompletedOnboarding) {
        setCurrentStep('dashboard');
      } else {
        setCurrentStep('onboarding');
      }
    } else {
      setCurrentStep('auth');
    }
  }, []);
  
  return (
    <main style={{
      backgroundColor: '#f0f2f5',
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden', 
      position: 'relative',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
    }}>
      
      <MasterBackground />
      
      <div style={{ zIndex: 1, color: '#1a1a1a' }}>
        {currentStep === 'loading' && (
          <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
        )}
        {currentStep === 'auth' && (
          <AuthForm onSuccess={() => setCurrentStep('onboarding')} />
        )}
        {currentStep === 'onboarding' && (
          <ExtendedOnboardingFlow onComplete={() => setCurrentStep('dashboard')} />
        )}
        {currentStep === 'dashboard' && <Dashboard />}
      </div>
    </main>
  );
}