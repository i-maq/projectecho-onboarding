"use client";

import React, { useState, useEffect } from 'react';
import { AuthForm } from '@/components/auth/auth-form';
import { ExtendedOnboardingFlow } from '@/components/onboarding/extended-onboarding-flow';
import { Dashboard } from '@/components/dashboard/dashboard';
import { MasterBackground } from '@/components/master-background';
import { AmbientAudioProvider } from '@/components/ambient-audio';
import { supabase } from '@/lib/supabase-client';

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState<'auth' | 'onboarding' | 'dashboard' | 'loading'>('loading');

  useEffect(() => {
    checkSession();

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

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('onboarding_completed')
        .eq('user_id', session.user.id)
        .single();

      if (profile?.onboarding_completed) {
        localStorage.setItem('onboardingComplete', 'true');
        setCurrentStep('dashboard');
      } else {
        localStorage.removeItem('onboardingComplete');
        setCurrentStep('onboarding');
      }
    } catch {
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
    checkSession();
  };

  return (
    <AmbientAudioProvider>
    <main style={{
      backgroundColor: '#ffffff',
      width: '100vw',
      minHeight: '100dvh',
      overflowY: 'auto',
      overflowX: 'hidden',
      position: 'relative',
    }}>

      <MasterBackground />

      {currentStep === 'dashboard' ? (
        <div style={{ zIndex: 2, position: 'relative', minHeight: '100dvh' }}>
          <Dashboard />
        </div>
      ) : (
        <div style={{
          zIndex: 2,
          color: '#1a1a1a',
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
          {currentStep === 'loading' && (
            <div className="w-8 h-8 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin"></div>
          )}
          {currentStep === 'auth' && (
            <AuthForm onSuccess={handleAuthSuccess} />
          )}
          {currentStep === 'onboarding' && (
            <ExtendedOnboardingFlow onComplete={() => setCurrentStep('dashboard')} />
          )}
        </div>
      )}
    </main>
    </AmbientAudioProvider>
  );
}
