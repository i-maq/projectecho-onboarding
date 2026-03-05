"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { GlassCard } from '@/components/ui/glass-card';
import { EchoButton } from '@/components/ui/echo-button';
import { LottieIcon } from '@/components/ui/lottie-icon';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface SoundCheckProps {
  onNext: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export function SoundCheck({ onNext }: SoundCheckProps) {
  const [headphonesAnimation, setHeadphonesAnimation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/wired-outline-1055-earbud-wireless-earphones-hover-pinch.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load animation');
        return res.json();
      })
      .then(data => { setHeadphonesAnimation(data); setIsLoading(false); })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="w-full text-center flex flex-col items-center justify-center py-16">
        <LoadingSpinner size="lg" />
        <p className="text-echo-text-muted mt-4">Loading...</p>
      </div>
    );
  }

  return (
    <GlassCard className="text-center">
      <motion.div
        className="flex justify-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="w-24 h-24">
          {headphonesAnimation ? (
            <LottieIcon animationData={headphonesAnimation} size={96} />
          ) : (
            <div className="w-24 h-24 bg-echo-gradient rounded-full flex items-center justify-center">
              <span className="text-3xl text-white">🎧</span>
            </div>
          )}
        </div>
      </motion.div>

      <h2 className="text-3xl font-extrabold mb-4 text-echo-text-primary">
        Can You Hear Me?
      </h2>
      <p className="text-lg text-echo-text-secondary mb-8">
        This experience is best enjoyed with sound.
      </p>
      <EchoButton variant="neumorphic" onClick={onNext}>
        Continue
      </EchoButton>
    </GlassCard>
  );
}
