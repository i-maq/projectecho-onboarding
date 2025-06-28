"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';

interface WelcomeStepProps {
  onNext: () => void;
  onBack?: () => void;
}

export function WelcomeStep({ onNext, onBack }: WelcomeStepProps) {
  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Perfectly centered logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      >
        <Image 
          src="/projectechologo.png"
          alt="Project Echo Logo"
          width={280} 
          height={70}
          className="h-auto"
          priority
        />
      </motion.div>
      
      {/* Button in lower third */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="absolute bottom-16 left-1/2 transform -translate-x-1/2"
      >
        <button 
          onClick={onNext}
          className="neumorphic-button-light text-button"
        >
          Find My Echo
        </button>
      </motion.div>
    </div>
  );
}