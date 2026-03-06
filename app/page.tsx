"use client";

import React, { useState, useEffect } from 'react';
import { AuthForm } from '@/components/auth/auth-form';
import { ExtendedOnboardingFlow } from '@/components/onboarding/extended-onboarding-flow';
import { Dashboard } from '@/components/dashboard/dashboard';
import { MasterBackground } from '@/components/master-background';
import { supabase } from '@/lib/supabase-client';

// --- The main page component ---
export default function HomePage() {
  const [currentStep, setCurrentStep] = useState<'auth' | 'onboarding' | 'dashboard' | 'loading'>('loading');

  useEffect(() => {
    checkSession();

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setCurrentStep('auth');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setCurrentStep('auth');
        return;
      }

      // Check onboarding status from DB
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('onboarding_completed')
        .eq('user_id', session.user.id)
        .single();

      if (profile?.onboarding_completed) {
        // Cache in localStorage for faster subsequent loads
        localStorage.setItem('onboardingComplete', 'true');
        setCurrentStep('dashboard');
      } else {
        localStorage.removeItem('onboardingComplete');
        setCurrentStep('onboarding');
      }
    } catch {
      // If DB query fails, fall back to localStorage cache
      const cached = localStorage.getItem('onboardingComplete');
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentStep(cached ? 'dashboard' : 'onboarding');
      } else {
        setCurrentStep('auth');
      }
    }
  };

  const handleAuthSuccess = () => {
    // Re-run session check to determine onboarding vs dashboard
    checkSession();
  };

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
          <AuthForm onSuccess={handleAuthSuccess} />
        )}
        {currentStep === 'onboarding' && (
          <ExtendedOnboardingFlow onComplete={() => setCurrentStep('dashboard')} />
        )}
        {currentStep === 'dashboard' && <Dashboard />}
      </div>
    </main>
  );
}
