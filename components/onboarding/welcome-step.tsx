"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRef, useState } from 'react';

interface WelcomeStepProps {
  onNext: () => void;
  onBack?: () => void;
}

export function WelcomeStep({ onNext, onBack }: WelcomeStepProps) {
  const soundRef = useRef<HTMLAudioElement | null>(null);
  const [clickPulse, setClickPulse] = useState<{ x: number; y: number; key: number } | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement | HTMLImageElement>) => {
    setClickPulse({ x: event.clientX, y: event.clientY, key: Date.now() });
    soundRef.current?.play().catch(e => console.error("Audio play failed:", e));
    setTimeout(() => onNext(), 300);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <audio ref={soundRef} src="/tap-sound.mp3" preload="auto" />

      <motion.div
        animate={{ scale: [0.95, 1, 0.95] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Image
          src="/projectechologo.png"
          alt="Project Echo Logo"
          width={560}
          height={140}
          className="h-auto w-80 sm:w-auto cursor-pointer"
          priority
          onClick={(e) => handleClick(e as unknown as React.MouseEvent<HTMLImageElement>)}
        />
      </motion.div>

      {clickPulse && <div className="click-pulse" style={{ left: clickPulse.x, top: clickPulse.y }} />}
    </div>
  );
}
