"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { GlassCard } from '@/components/ui/glass-card';
import { EchoButton } from '@/components/ui/echo-button';
import { EchoInput } from '@/components/ui/echo-input';
import { LottieIcon } from '@/components/ui/lottie-icon';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface PersonalDataStepProps {
  onComplete: (data: PersonalData) => void;
  onBack: () => void;
}

interface PersonalData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
}

export function PersonalDataStep({ onComplete, onBack }: PersonalDataStepProps) {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', dateOfBirth: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [personalDataAnimation, setPersonalDataAnimation] = useState<any>(null);

  useEffect(() => {
    fetch('/personal-data-icon.json')
      .then(res => { if (!res.ok) throw new Error('Animation load failed'); return res.json(); })
      .then(setPersonalDataAnimation)
      .catch(err => console.error(err));
  }, []);

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const age = calculateAge(formData.dateOfBirth);
      if (age < 13) newErrors.dateOfBirth = 'You must be at least 13 years old';
      else if (age > 120) newErrors.dateOfBirth = 'Please enter a valid date of birth';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveProfileToDatabase = async (personalData: PersonalData): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { toast.error('Please sign in again'); return false; }
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(personalData),
      });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || 'Failed to save profile'); }
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save your information. Please try again.');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    const age = calculateAge(formData.dateOfBirth);
    const personalData: PersonalData = { firstName: formData.firstName.trim(), lastName: formData.lastName.trim(), dateOfBirth: formData.dateOfBirth, age };
    const saved = await saveProfileToDatabase(personalData);
    if (saved) {
      localStorage.setItem('personalData', JSON.stringify(personalData));
      toast.success(`Welcome, ${personalData.firstName}!`);
      onComplete(personalData);
    }
    setIsSubmitting(false);
  };

  const isFormValid = () => formData.firstName.trim() && formData.lastName.trim() && formData.dateOfBirth && Object.keys(errors).length === 0;

  if (!personalDataAnimation) {
    return (
      <div className="w-full h-full flex items-center justify-center px-6 py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center px-6 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md mx-auto"
      >
        <GlassCard className="text-center">
          <motion.div
            className="flex justify-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="w-20 h-20 bg-echo-gradient rounded-2xl flex items-center justify-center shadow-echo-glow overflow-hidden">
              <LottieIcon animationData={personalDataAnimation} size={80} />
            </div>
          </motion.div>

          <h2 className="text-3xl font-extrabold mb-3 text-echo-text-primary">
            Personalize your Echo
          </h2>
          <p className="text-echo-text-secondary mb-8">
            Your Echo needs some basic information to create your perfect experience
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <EchoInput
              label="First Name"
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              disabled={isSubmitting}
              placeholder="Enter your first name"
              error={errors.firstName}
            />

            <EchoInput
              label="Last Name"
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              disabled={isSubmitting}
              placeholder="Enter your last name"
              error={errors.lastName}
            />

            <div>
              <EchoInput
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                disabled={isSubmitting}
                max={new Date().toISOString().split('T')[0]}
                min="1900-01-01"
                error={errors.dateOfBirth}
              />
              {formData.dateOfBirth && !errors.dateOfBirth && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1 text-sm text-echo-purple-600">
                  <Sparkles className="inline h-3 w-3 mr-1" />
                  Age: {calculateAge(formData.dateOfBirth)} years old
                </motion.p>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <EchoButton type="button" variant="ghost" onClick={onBack} disabled={isSubmitting}>
                Back
              </EchoButton>
              <EchoButton
                type="submit"
                variant={isFormValid() ? 'primary' : 'neumorphic'}
                disabled={!isFormValid() || isSubmitting}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin inline" />}
                {isSubmitting ? 'Saving...' : 'Continue'}
              </EchoButton>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}
