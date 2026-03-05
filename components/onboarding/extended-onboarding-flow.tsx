"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DynamicOrbIntro } from '../orb/dynamic-orb-intro';
import { DatabaseSetupCheck } from './database-setup-check';
import { PersonalDataStep } from './personal-data-step';
import { CameraCaptureStep } from './camera-capture-step';
import { VideoCaptureStep } from '../avatar/video-capture-step';
import { WelcomeStep } from './welcome-step';
import { SoundCheck } from './sound-check';
import { toast } from 'sonner';

type OnboardingStage = 'soundCheck' | 'welcome' | 'orbIntro' | 'dbCheck' | 'personalData' | 'cameraCapture' | 'videoCapture' | 'complete';

interface PersonalData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
}

const pageVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

const pageTransition = {
  duration: 0.4,
  ease: [0.4, 0, 0.2, 1],
};

export function ExtendedOnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<OnboardingStage>('soundCheck');
  const [personalData, setPersonalData] = useState<PersonalData | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [replicaId, setReplicaId] = useState<string | null>(null);
  const [clickPulse, setClickPulse] = useState<{ x: number; y: number; key: number } | null>(null);

  const musicRef = useRef<HTMLAudioElement | null>(null);
  const soundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.loop = true;
      musicRef.current.volume = 0.1;
      musicRef.current.play().catch(e => console.error("Audio play failed:", e));
    }
  }, []);

  const handleSoundCheckNext = (event: React.MouseEvent<HTMLButtonElement>) => {
    soundRef.current?.play();
    setClickPulse({ x: event.clientX, y: event.clientY, key: Date.now() });
    setTimeout(() => setStage('welcome'), 300);
  };

  const handleWelcomeNext = () => setStage('orbIntro');
  const handleOrbComplete = () => setStage('dbCheck');
  const handleDatabaseReady = () => setStage('personalData');
  const handlePersonalDataComplete = (data: PersonalData) => { setPersonalData(data); setStage('cameraCapture'); };
  const handleCameraCaptureComplete = (photoData: string) => { setUserPhoto(photoData); setStage('videoCapture'); };
  const handleVideoCaptureComplete = (id: string) => { setReplicaId(id); localStorage.setItem('onboardingComplete', 'true'); localStorage.setItem('replicaId', id); onComplete(); };
  const handleSkipCameraCapture = () => { toast.info('Camera capture skipped.'); setStage('videoCapture'); };
  const handleSkipVideoCapture = () => { localStorage.setItem('onboardingComplete', 'true'); toast.info('Video capture skipped.'); onComplete(); };

  return (
    <div className="w-full h-full flex items-center justify-center px-4 sm:px-6 py-8">
      <audio ref={musicRef} src="/ambient-music.mp3" preload="auto" />
      <audio ref={soundRef} src="/tap-sound.mp3" preload="auto" />

      <AnimatePresence mode="wait">
        {stage === 'soundCheck' && (
          <motion.div key="soundCheck" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={pageTransition} className="w-full max-w-lg mx-auto">
            <SoundCheck onNext={handleSoundCheckNext} />
          </motion.div>
        )}

        {stage === 'welcome' && (
          <motion.div key="welcome" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={pageTransition} className="w-full flex flex-col overflow-y-auto">
            <WelcomeStep onNext={handleWelcomeNext} onBack={() => setStage('soundCheck')} />
          </motion.div>
        )}

        {stage === 'orbIntro' && (
          <motion.div key="orbIntro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={pageTransition} className="w-full">
            <DynamicOrbIntro onAdvance={handleOrbComplete} />
          </motion.div>
        )}

        {stage === 'dbCheck' && (
          <motion.div key="dbCheck" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={pageTransition} className="w-full flex flex-col overflow-y-auto">
            <DatabaseSetupCheck onContinue={handleDatabaseReady} />
          </motion.div>
        )}

        {stage === 'personalData' && (
          <motion.div key="personalData" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={pageTransition} className="w-full flex flex-col overflow-y-auto">
            <PersonalDataStep onComplete={handlePersonalDataComplete} onBack={() => setStage('dbCheck')} />
          </motion.div>
        )}

        {stage === 'cameraCapture' && personalData && (
          <motion.div key="cameraCapture" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={pageTransition} className="w-full flex flex-col overflow-y-auto">
            <CameraCaptureStep personalData={personalData} onComplete={handleCameraCaptureComplete} onBack={() => setStage('personalData')} onSkip={handleSkipCameraCapture} />
          </motion.div>
        )}

        {stage === 'videoCapture' && personalData && (
          <motion.div key="videoCapture" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={pageTransition} className="w-full flex flex-col overflow-y-auto">
            <VideoCaptureStep personalData={personalData} onComplete={handleVideoCaptureComplete} onBack={() => setStage('cameraCapture')} onSkip={handleSkipVideoCapture} />
          </motion.div>
        )}
      </AnimatePresence>

      {clickPulse && <div key={clickPulse.key} className="click-pulse" style={{ left: clickPulse.x, top: clickPulse.y }} />}
    </div>
  );
}
