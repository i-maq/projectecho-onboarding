"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Send } from 'lucide-react';

interface FirstMemoryStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function FirstMemoryStep({ onNext, onBack }: FirstMemoryStepProps) {
  const [memory, setMemory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!memory.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/echoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: memory })
      });
      
      setTimeout(() => {
        onNext();
      }, 1000);
    } catch (error) {
      console.error('Error saving memory:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-primary-foreground" />
        </div>
        <h2 className="text-3xl font-bold text-gradient">Your First Memory</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Let's start with something simple. What's a memory from today that made you smile?
        </p>
      </div>

      <Card className="card-glow max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>Echo asks:</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <p className="text-sm text-primary">
              "What's one small moment from today that brought you joy? It could be something as simple as a good cup of coffee, a text from a friend, or a beautiful sunset."
            </p>
          </div>
          
          <div className="space-y-2">
            <Textarea
              placeholder="I remember..."
              value={memory}
              onChange={(e) => setMemory(e.target.value)}
              className="min-h-[120px] echo-input resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Take your time. There's no pressure to write a lot - even a sentence is perfect.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between max-w-2xl mx-auto">
        <Button 
          onClick={onBack}
          variant="outline"
          className="echo-button echo-button-secondary"
        >
          Back
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={!memory.trim() || isSubmitting}
          className="echo-button echo-button-primary"
        >
          {isSubmitting ? (
            'Saving...'
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Save Memory
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}