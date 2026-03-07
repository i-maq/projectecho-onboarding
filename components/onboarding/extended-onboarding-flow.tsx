"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Lottie from 'lottie-react';
import { DynamicOrbIntro } from '../orb/dynamic-orb-intro';
import { DatabaseSetupCheck } from './database-setup-check';
import { PersonalDataStep } from './personal-data-step';
import { CameraCaptureStep } from './camera-capture-step';
import { WelcomeStep } from './welcome-step';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase-client';

type OnboardingStage = 'soundCheck' | 'welcome' | 'orbIntro' | 'dbCheck' | 'personalData' | 'cameraCapture' | 'complete';

interface PersonalData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
}

export function ExtendedOnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<OnboardingStage>('soundCheck');
  const [personalData, setPersonalData] = useState<PersonalData | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [clickPulse, setClickPulse] = useState<{ x: number, y: number, key: number } | null>(null);
  const [headphonesAnimation, setHeadphonesAnimation] = useState<any>(null);

  const musicRef = useRef<HTMLAudioElement | null>(null);
  const soundRef = useRef<HTMLAudioElement | null>(null);

  // Play background music immediately when component mounts
  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.loop = true;
      musicRef.current.volume = 0.1;
      musicRef.current.play().catch(e => console.error("Audio play failed:", e));
    }
  }, []);

  // Load Lottie JSON from public at runtime
  useEffect(() => {
    fetch('/wired-outline-1055-earbud-wireless-earphones-hover-pinch.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load animation');
        return res.json();
      })
      .then(setHeadphonesAnimation)
      .catch(err => {
        console.error(err);
        toast.error('Couldn\u2019t load sound-check animation.');
      });
  }, []);

  const markOnboardingComplete = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase
          .from('user_profiles')
          .upsert({
            user_id: session.user.id,
            onboarding_completed: true,
          }, { onConflict: 'user_id' });
      }
    } catch (error) {
      console.error('Failed to mark onboarding complete in DB:', error);
    }
    // Cache in localStorage as fallback
    localStorage.setItem('onboardingComplete', 'true');
    onComplete();
  };

  const handleSoundCheckNext = (event: React.MouseEvent<HTMLButtonElement>) => {
    soundRef.current?.play();
    setClickPulse({ x: event.clientX, y: event.clientY, key: Date.now() });
    setTimeout(() => setStage('welcome'), 300); // Transition to welcome
  };

  const handleWelcomeNext = () => { setStage('orbIntro'); };
  const handleBackToSoundCheck = () => { setStage('soundCheck'); };
  const handleOrbComplete = () => { setStage('dbCheck'); };
  const handleDatabaseReady = () => { setStage('personalData'); };
  const handlePersonalDataComplete = (data: PersonalData) => { setPersonalData(data); setStage('cameraCapture'); };
  const handleCameraCaptureComplete = (photoData: string) => { setUserPhoto(photoData); markOnboardingComplete(); };
  const handleSkipCameraCapture = () => { toast.info('Camera capture skipped. You can add a photo later.'); markOnboardingComplete(); };
  const handleBackToWelcome = () => { setStage('welcome'); };
  const handleBackToDatabaseCheck = () => { setStage('dbCheck'); };
  const handleBackToPersonalData = () => { setStage('personalData'); };

  return (
    <div className="w-full h-full flex items-center justify-center px-6 py-8">
      <audio ref={musicRef} src="/ambient-music.mp3" preload="auto" />
      <audio ref={soundRef} src="/tap-sound.mp3" preload="auto" />

      <AnimatePresence mode="wait">
        {stage === 'soundCheck' && (
          !headphonesAnimation ? (
            <div className="w-full max-w-lg mx-auto text-center">
              Loading sound-check&hellip;
            </div>
          ) : (
            <motion.div
              key="soundCheck"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-lg mx-auto"
            >
              <div className="glass-panel-light text-center">
                {/* Animated Headphone Icon */}
                <motion.div className="flex justify-center mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
                  <div className="w-24 h-24">
                    <Lottie animationData={headphonesAnimation} loop style={{ width:'100%', height:'100%', filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))' }} />
                  </div>
                </motion.div>

                <h2 className="text-3xl font-extrabold mb-4 text-gray-800 text-title">Can You Hear Me?</h2>
                <p className="text-lg text-gray-600 mb-8 text-body">This experience is best enjoyed with sound.</p>
                <button onClick={handleSoundCheckNext} className="neumorphic-button-light text-button">Continue</button>
              </div>
            </motion.div>
          )
        )}

        {stage === 'welcome' && (
          <motion.div key="welcome" initial={{ opacity:0, x:100 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-100 }} transition={{duration:0.5}} className="w-full flex flex-col overflow-y-auto">
            <WelcomeStep onNext={handleWelcomeNext} onBack={handleBackToSoundCheck} />
          </motion.div>
        )}

        {stage === 'orbIntro' && (
          <motion.div key="orbIntro" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{duration:0.5}} className="w-full">
            <DynamicOrbIntro onAdvance={handleOrbComplete} />
          </motion.div>
        )}

        {stage === 'dbCheck' && (
          <motion.div key="dbCheck" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.95 }} transition={{duration:0.5}} className="w-full flex flex-col overflow-y-auto">
            <DatabaseSetupCheck onContinue={handleDatabaseReady} />
          </motion.div>
        )}

        {stage === 'personalData' && (
          <motion.div key="personalData" initial={{ opacity:0, x:100 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-100 }} transition={{duration:0.5}} className="w-full flex flex-col overflow-y-auto">
            <PersonalDataStep onComplete={handlePersonalDataComplete} onBack={handleBackToDatabaseCheck} />
          </motion.div>
        )}

        {stage === 'cameraCapture' && personalData && (
          <motion.div key="cameraCapture" initial={{opacity:0, x:100}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-100}} transition={{duration:0.5}} className="w-full flex flex-col overflow-y-auto">
            <CameraCaptureStep personalData={personalData} onComplete={handleCameraCaptureComplete} onBack={handleBackToPersonalData} onSkip={handleSkipCameraCapture} />
          </motion.div>
        )}


      </AnimatePresence>

      {clickPulse && <div key={clickPulse.key} className="click-pulse" style={{ left: clickPulse.x, top: clickPulse.y }} />}
    </div>
  );
}
