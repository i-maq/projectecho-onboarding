"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Lottie from 'lottie-react';
import personalDataAnimation from '/public/personal-data-icon.json';

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
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: ''
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const age = calculateAge(formData.dateOfBirth);
      if (age < 13) {
        newErrors.dateOfBirth = 'You must be at least 13 years old to use Echo';
      } else if (age > 120) {
        newErrors.dateOfBirth = 'Please enter a valid date of birth';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveProfileToDatabase = async (personalData: PersonalData): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please sign in again');
        return false;
      }

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: personalData.firstName,
          lastName: personalData.lastName,
          dateOfBirth: personalData.dateOfBirth,
          age: personalData.age
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save profile');
      }

      const savedProfile = await response.json();
      console.log('Profile saved successfully:', savedProfile);
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save your information. Please try again.');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const age = calculateAge(formData.dateOfBirth);
    const personalData: PersonalData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      dateOfBirth: formData.dateOfBirth,
      age
    };

    // Save to database
    const saved = await saveProfileToDatabase(personalData);
    
    if (saved) {
      // Also store in localStorage for offline access
      localStorage.setItem('personalData', JSON.stringify(personalData));
      toast.success(`Welcome, ${personalData.firstName}!`);
      onComplete(personalData);
    }

    setIsSubmitting(false);
  };

  const isFormValid = () => {
    return formData.firstName.trim() && 
           formData.lastName.trim() && 
           formData.dateOfBirth && 
           Object.keys(errors).length === 0;
  };

  return (
    <div className="w-full h-full flex items-center justify-center px-6 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="glass-panel-light text-center">
          {/* Lottie animation icon */}
          <motion.div 
            className="flex justify-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
              <Lottie 
                animationData={personalDataAnimation}
                loop={true}
                style={{
                  width: '100%',
                  height: '100%',
                }}
              />
            </div>
          </motion.div>

          <h2 className="text-3xl font-extrabold mb-3 text-gray-800 text-title">
            Personalize your Echo
          </h2>
          
          <p className="text-gray-600 mb-8 text-body">
            Your Echo needs some basic information to create your perfect experience
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2 text-button">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                disabled={isSubmitting}
                className={`w-full p-3 rounded-lg bg-white/70 border ${
                  errors.firstName ? 'border-red-400' : 'border-gray-300'
                } focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-gray-800 text-body disabled:opacity-50`}
                placeholder="Enter your first name"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-500 text-caption">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2 text-button">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={isSubmitting}
                className={`w-full p-3 rounded-lg bg-white/70 border ${
                  errors.lastName ? 'border-red-400' : 'border-gray-300'
                } focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-gray-800 text-body disabled:opacity-50`}
                placeholder="Enter your last name"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-500 text-caption">{errors.lastName}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-700 mb-2 text-button">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date of Birth
              </label>
              <input
                type="date"
                id="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                disabled={isSubmitting}
                className={`w-full p-3 rounded-lg bg-white/70 border ${
                  errors.dateOfBirth ? 'border-red-400' : 'border-gray-300'
                } focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-gray-800 text-body disabled:opacity-50`}
                max={new Date().toISOString().split('T')[0]}
                min="1900-01-01"
              />
              {errors.dateOfBirth && (
                <p className="mt-1 text-sm text-red-500 text-caption">{errors.dateOfBirth}</p>
              )}
              {formData.dateOfBirth && !errors.dateOfBirth && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 text-sm text-purple-600 text-caption"
                >
                  <Sparkles className="inline h-3 w-3 mr-1" />
                  Age: {calculateAge(formData.dateOfBirth)} years old
                </motion.p>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={onBack}
                disabled={isSubmitting}
                className="neumorphic-button-light text-button px-6 disabled:opacity-50"
              >
                Back
              </button>
              
              <button
                type="submit"
                disabled={!isFormValid() || isSubmitting}
                className={`neumorphic-button-light text-button px-8 flex items-center ${
                  !isFormValid() || isSubmitting
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'bg-purple-600 text-white shadow-lg hover:bg-purple-700'
                }`}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isSubmitting ? 'Saving...' : 'Continue'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}