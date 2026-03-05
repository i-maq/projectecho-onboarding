"use client";

import React, { useState, useEffect } from 'react';
import { AuthForm } from '@/components/auth/auth-form';
import { ExtendedOnboardingFlow } from '@/components/onboarding/extended-onboarding-flow';
import { Dashboard } from '@/components/dashboard/dashboard';
import { AppShell } from '@/components/layout/app-shell';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState<'auth' | 'onboarding' | 'dashboard' | 'loading'>('loading');

  useEffect(() => {
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

  // Dashboard has its own full-page layout
  if (currentStep === 'dashboard') {
    return <Dashboard />;
  }

  return (
    <AppShell>
      {currentStep === 'loading' && <LoadingSpinner size="lg" />}
      {currentStep === 'auth' && (
        <AuthForm onSuccess={() => setCurrentStep('onboarding')} />
      )}
      {currentStep === 'onboarding' && (
        <ExtendedOnboardingFlow onComplete={() => setCurrentStep('dashboard')} />
      )}
    </AppShell>
  );
}
