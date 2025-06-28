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
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 overflow-auto">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center space-y-12 py-8"
      >
        <Image 
          src="/projectechologo.png"
          alt="Project Echo Logo"
          width={280} 
          height={70}
          className="h-auto"
          priority
        />

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Button 
            onClick={onNext}
            className="neumorphic-button-light text-button bg-purple-600 text-white shadow-lg hover:bg-purple-700 px-10 py-6 text-xl"
          >
            Find My Echo
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}