"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PersonalizationStepProps {
  userData: {
    name: string;
    purpose: string;
    frequency: string;
  };
  setUserData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PersonalizationStep({ userData, setUserData, onNext, onBack }: PersonalizationStepProps) {
  const handleNext = () => {
    if (userData.name.trim()) {
      onNext();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gradient mb-4">
          Let's Personalize Your Experience
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Help Echo understand how to best support your journaling journey
        </p>
      </div>

      <Card className="card-glow max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Tell us about yourself</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">What should Echo call you?</Label>
            <Input
              id="name"
              placeholder="Your name or nickname"
              value={userData.name}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              className="echo-input"
            />
          </div>

          <div className="space-y-3">
            <Label>What brings you to journaling?</Label>
            <RadioGroup
              value={userData.purpose}
              onValueChange={(value) => setUserData({ ...userData, purpose: value })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reflection" id="reflection" />
                <Label htmlFor="reflection">Self-reflection and growth</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="memories" id="memories" />
                <Label htmlFor="memories">Preserving memories</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mindfulness" id="mindfulness" />
                <Label htmlFor="mindfulness">Mindfulness and gratitude</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="creative" id="creative" />
                <Label htmlFor="creative">Creative expression</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>How often would you like Echo to check in?</Label>
            <RadioGroup
              value={userData.frequency}
              onValueChange={(value) => setUserData({ ...userData, frequency: value })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily">Daily</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="few-times-week" id="few-times-week" />
                <Label htmlFor="few-times-week">A few times a week</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly">Weekly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="whenever" id="whenever" />
                <Label htmlFor="whenever">Whenever I feel like it</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between max-w-lg mx-auto">
        <Button 
          onClick={onBack}
          variant="outline"
          className="echo-button echo-button-secondary"
        >
          Back
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!userData.name.trim()}
          className="echo-button echo-button-primary"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}