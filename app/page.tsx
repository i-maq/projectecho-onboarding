"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { AuthForm } from '@/components/auth/auth-form';
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { Dashboard } from '@/components/dashboard/dashboard';
import { createClientComponentClient } from '@/lib/supabase';

// --- This is our self-contained, reusable background component ---
export const MasterBackground = () => {
  const Particle = () => {
    const style = useMemo(() => ({
      position: 'absolute' as 'absolute', 
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`, 
      width: `${Math.random() * 2 + 1}px`,
      height: `${Math.random() * 2 + 1}px`, 
      backgroundColor: `rgba(0, 0, 50, ${Math.random() * 0.4 + 0.1})`,
      borderRadius: '50%', 
      filter: `blur(${Math.random() > 0.5 ? 1 : 0}px)`,
      animation: `random-float-animation ${Math.random() * 30 + 20}s infinite linear`,
    }), []);
    return <div style={style}></div>;
  };

  const circles = useMemo(() => [
      { delay: '0s', duration: '8s' }, 
      { delay: '2s', duration: '8s' },
      { delay: '4s', duration: '8s' }, 
      { delay: '6s', duration: '8s' },
  ], []);
  const particles = useMemo(() => Array.from({ length: 150 }).map((_, i) => <Particle key={i} />), []);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, overflow:'hidden' }}>
        {circles.map((circle, index) => (
            <div 
              key={index} 
              className='pulse-circle-light' 
              style={{ 
                animationDuration: circle.duration, 
                animationDelay: circle.delay 
              }} 
            />
        ))}
        {particles}
    </div>
  );
};

// --- The main page component ---
export default function HomePage() {
  const [currentStep, setCurrentStep] = useState<'auth' | 'onboarding' | 'dashboard' | 'loading'>('loading');
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Check for existing Supabase session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const hasCompletedOnboarding = localStorage.getItem('onboardingComplete');
      
      if (session) {
        // Store token for API calls
        localStorage.setItem('token', session.access_token);
        localStorage.setItem('supabase_session', JSON.stringify(session));
        
        if (hasCompletedOnboarding) {
          setCurrentStep('dashboard');
        } else {
          setCurrentStep('onboarding');
        }
      } else {
        setCurrentStep('auth');
      }
    };

    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        localStorage.setItem('token', session.access_token);
        localStorage.setItem('supabase_session', JSON.stringify(session));
        const hasCompletedOnboarding = localStorage.getItem('onboardingComplete');
        setCurrentStep(hasCompletedOnboarding ? 'dashboard' : 'onboarding');
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('token');
        localStorage.removeItem('supabase_session');
        localStorage.removeItem('onboardingComplete');
        setCurrentStep('auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);
  
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
          <OnboardingFlow onComplete={() => setCurrentStep('dashboard')} />
        )}
        {currentStep === 'dashboard' && <Dashboard />}
      </div>
    </main>
  );
}