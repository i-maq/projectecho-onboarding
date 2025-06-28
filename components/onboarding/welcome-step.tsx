"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface WelcomeStepProps {
  onNext: () => void;
  onBack?: () => void;
}

export function WelcomeStep({ onNext, onBack }: WelcomeStepProps) {
  return (
   <div className="min-h-screen w-full flex flex-col relative p-6 overflow-auto">
  {/* Absolutely centered logo using flex */}
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Image 
        src="/projectechologo.png"
        alt="Project Echo Logo"
        width={400}  // Increased from 280
        height={100} // Increased from 70
        className="h-auto w-auto" // Changed to maintain aspect ratio
        priority
      />
    </motion.div>
  </div>
  
  {/* Button positioned below center */}
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.4, duration: 0.5 }}
    className="absolute top-2/3 left-1/2 transform -translate-x-1/2 pointer-events-auto"
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