"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Heart, Shield } from 'lucide-react';

interface WelcomeStepProps {
  onNext: () => void;
  onBack: () => void; // Add onBack prop
}

export function WelcomeStep({ onNext, onBack }: WelcomeStepProps) { // Destructure onBack
  return (
    <div className="text-center space-y-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mb-6">
          <span className="text-4xl font-bold text-primary-foreground">E</span>
        </div>
        <h1 className="text-4xl font-bold text-gradient mb-4">
          Welcome to Echo
        </h1>
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
              <h3 className="font-semibold mb-2">AI-Powered Memory Journaling</h3>
              <p className="text-sm text-muted-foreground">
                Echo helps you discover and record memories so you never forget.
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
                Focus on what matters most to you - your experiences, feelings, and growth.
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
                Your memories are yours alone, stored securely.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="flex justify-between max-w-lg mx-auto" // Add flex and justify-between for buttons
      >
        <button
          onClick={onBack} // Use onBack prop
          className="neumorphic-button-light text-button px-8 py-3 text-lg" // Apply existing button styles
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="neumorphic-button-light text-button px-8 py-3 text-lg" // Apply existing button styles
        >
          Find Your Echo
        </button>
      </motion.div>
    </div>
  );
}