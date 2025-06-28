"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';

interface WelcomeStepProps {
  onNext: () => void;
  onBack?: () => void;
}

export function WelcomeStep({ onNext, onBack }: WelcomeStepProps) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 overflow-auto">
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
          onClick={onNext}
          className="neumorphic-button-light text-button"
        >
          Find My Echo
        </button>
      </motion.div>
    </div>
  );
}