"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { EchoButton } from '@/components/ui/echo-button';

interface WelcomeStepProps {
  onNext: () => void;
  onBack?: () => void;
}

export function WelcomeStep({ onNext, onBack }: WelcomeStepProps) {
  const soundRef = useRef<HTMLAudioElement | null>(null);
  const [clickPulse, setClickPulse] = useState<{ x: number; y: number; key: number } | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setClickPulse({ x: event.clientX, y: event.clientY, key: Date.now() });
    soundRef.current?.play().catch(e => console.error("Audio play failed:", e));
    setTimeout(() => onNext(), 300);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 overflow-auto">
      <audio ref={soundRef} src="/tap-sound.mp3" preload="auto" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="mb-16"
      >
        <Image
          src="/projectechologo.png"
          alt="Project Echo Logo"
          width={560}
          height={140}
          className="h-auto w-80 sm:w-auto"
          priority
        />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <EchoButton variant="neumorphic" size="lg" onClick={handleClick} className="text-xl px-12 py-6">
          Find My Echo
        </EchoButton>
      </motion.div>

      {clickPulse && <div className="click-pulse" style={{ left: clickPulse.x, top: clickPulse.y }} />}
    </div>
  );
}
