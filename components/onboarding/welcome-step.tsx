"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Heart, Shield } from 'lucide-react';
import Image from 'next/image';

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="text-center space-y-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto mb-6 flex justify-center">
          <Image 
            src="/projectechologo.png"
            alt="Project Echo Logo"
            width={320}
            height={120}
            className="h-auto"
          />
        </div>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          Your personal AI biographer for capturing and cherishing life's precious memories
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="grid gap-4 max-w-2xl mx-auto"
      >
        <Card className="card-glow">
          <CardContent className="p-6 flex items-start space-x-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold mb-2">AI-Powered Memory Prompts</h3>
              <p className="text-sm text-muted-foreground">
                Echo helps you discover and record memories you don't want to forget
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardContent className="p-6 flex items-start space-x-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold mb-2">Personal & Meaningful</h3>
              <p className="text-sm text-muted-foreground">
                Focus on what matters most to you - your experiences, feelings, and growth
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardContent className="p-6 flex items-start space-x-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold mb-2">Private & Secure</h3>
              <p className="text-sm text-muted-foreground">
                Your memories are yours alone - your Echo's memory is secure.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Button 
          onClick={onNext}
          className="echo-button echo-button-primary px-8 py-3 text-lg"
        >
          Let's Get Started
        </Button>
      </motion.div>
    </div>
  );
}