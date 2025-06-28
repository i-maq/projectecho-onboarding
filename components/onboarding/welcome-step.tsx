"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';

interface WelcomeStepProps {
  onNext: () => void;
  onBack?: () => void;
}

export function WelcomeStep({ onNext, onBack }: WelcomeStepProps) {
  const soundRef = useRef<HTMLAudioElement | null>(null);

  const handleClick = () => {
    // Play sound
    soundRef.current?.play().catch(e => console.error("Audio play failed:", e));
    
    // Call the onNext function
    onNext();
  };
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 overflow-auto">
      {/* Hidden audio element for button click sound */}
      <audio ref={soundRef} src="/tap-sound.mp3" preload="auto" />
      
      {/* Centered logo - made larger */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <Image 
          src="/projectechologo.png"
          alt="Project Echo Logo"
          width={400}  // Increased from 280
          height={100} // Increased from 70
          className="h-auto"
          priority
        />
      </motion.div>
      
      {/* Button directly below logo - made larger */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <button 
          onClick={handleClick}
          className="neumorphic-button-light text-button"
        >
          Find My Echo
        </button>
      </motion.div>
    </div>
  );
}