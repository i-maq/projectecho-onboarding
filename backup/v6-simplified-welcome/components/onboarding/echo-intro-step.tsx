"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface EchoIntroStepProps {
  userName: string;
  onNext: () => void;
  onBack: () => void;
}

const messages = [
  "Hello there! 👋",
  `Nice to meet you, ${'{userName}'}!`,
  "I'm Echo, your personal memory companion.",
  "I'm here to help you capture and explore your memories.",
  "Think of me as a curious friend who loves hearing your stories.",
  "Ready to begin this journey together?"
];

export function EchoIntroStep({ userName, onNext, onBack }: EchoIntroStepProps) {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentMessage < messages.length) {
      const timer = setTimeout(() => {
        setCurrentMessage(currentMessage + 1);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
    }
  }, [currentMessage]);

  const processedMessages = messages.map(msg => 
    msg.replace('{userName}', userName || 'friend')
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 text-center"
    >
      <div className="space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center"
        >
          <Sparkles className="h-10 w-10 text-primary-foreground" />
        </motion.div>
        
        <h2 className="text-3xl font-bold text-gradient">Meet Echo</h2>
      </div>

      <Card className="card-glow max-w-lg mx-auto min-h-[200px] flex items-center">
        <CardContent className="p-8 w-full">
          <div className="space-y-4">
            {processedMessages.slice(0, currentMessage + 1).map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className={`text-left p-3 rounded-lg ${
                  index === currentMessage ? 'bg-primary/10' : 'bg-muted/50'
                }`}
              >
                <p className="text-sm">{message}</p>
              </motion.div>
            ))}
            
            {currentMessage < messages.length && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                className="flex justify-start"
              >
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between max-w-lg mx-auto"
        >
          <Button 
            onClick={onBack}
            variant="outline"
            className="echo-button echo-button-secondary"
          >
            Back
          </Button>
          <Button 
            onClick={onNext}
            className="echo-button echo-button-primary"
          >
            Let's Start Journaling
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}