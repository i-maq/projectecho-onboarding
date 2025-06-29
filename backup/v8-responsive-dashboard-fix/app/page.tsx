"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { AuthForm } from '@/components/auth/auth-form';
import { ExtendedOnboardingFlow } from '@/components/onboarding/extended-onboarding-flow';
import { Dashboard } from '@/components/dashboard/dashboard';

// --- Enhanced background component with improved performance ---
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
    <main className="w-full h-full flex flex-col" style={{
      backgroundColor: '#f0f2f5',
      overflow: 'hidden', 
      position: 'relative',
    }}>
      
      <MasterBackground />
      
      <div className="z-1 text-gray-800 h-full w-full flex flex-col flex-grow">
        {currentStep === 'loading' && (
          <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin m-auto"></div>
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