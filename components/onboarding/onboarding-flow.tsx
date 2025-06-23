"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import OrbIntro from '../OrbIntro';
import headphonesAnimation from '/public/wired-outline-1055-earbud-wireless-earphones-hover-pinch.json';

export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<'language' | 'soundCheck' | 'intro'>('language');
  const [clickPulse, setClickPulse] = useState<{ x: number, y: number, key: number } | null>(null);
  
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const soundRef = useRef<HTMLAudioElement | null>(null);

  const handleLanguageSelect = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (musicRef.current?.paused) {
      musicRef.current.loop = true;
      musicRef.current.volume = 0.3;
      musicRef.current.play().catch(e => console.error("Audio play failed"));
    }
    soundRef.current?.play();
    setClickPulse({ x: event.clientX, y: event.clientY, key: Date.now() });
    setTimeout(() => setStage('soundCheck'), 700);
  };

  const handleSoundCheckNext = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Add the same click pulse and sound effects as language buttons
    soundRef.current?.play();
    setClickPulse({ x: event.clientX, y: event.clientY, key: Date.now() });
    setTimeout(() => setStage('intro'), 300); // Shorter delay for snappier feel
  };

  if (stage === 'intro') {
    return (
      <OrbIntro
        audioSrc="/audio/onboarding-intro.mp3"
        onAdvance={() => {
          onComplete();
          localStorage.setItem('onboardingComplete', 'true');
        }}
      />
    );
  }
  
  return (
    <div className="w-full h-full flex items-center justify-center px-6 py-8">
      <audio ref={musicRef} src="/ambient-music.mp3" preload="auto" />
      <audio ref={soundRef} src="/tap-sound.mp3" preload="auto" />

      <AnimatePresence mode="wait">
        {stage === 'language' && (
          <motion.div 
            key="language" 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto"
          >
            <div className="glass-panel-light text-center">
              <h1 className="text-3xl font-extrabold mb-2 text-gray-800 text-title">Welcome</h1>
              <p className="text-gray-600 mb-8 text-body">Please select your language.</p>
              <div className="space-y-4">
                <button onClick={handleLanguageSelect} className="w-full neumorphic-button-light h-12 text-button">English</button>
                <button onClick={handleLanguageSelect} className="w-full neumorphic-button-light h-12 text-button">Español</button>
                <button onClick={handleLanguageSelect} className="w-full neumorphic-button-light h-12 text-button">Français</button>
              </div>
            </div>
          </motion.div>
        )}

        {stage === 'soundCheck' && (
          <motion.div 
            key="soundCheck" 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-lg mx-auto"
          >
            <div className="glass-panel-light text-center">
              {/* Animated Headphone Icon */}
              <motion.div 
                className="flex justify-center mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <div className="w-24 h-24">
                  <Lottie 
                    animationData={headphonesAnimation}
                    loop={true}
                    style={{
                      width: '100%',
                      height: '100%',
                      filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))'
                    }}
                  />
                </div>
              </motion.div>

              <h2 className="text-3xl font-extrabold mb-4 text-gray-800 text-title">Can You Hear Me?</h2>
              <p className="text-lg text-gray-600 mb-8 text-body">This experience is best enjoyed with sound.</p>
              <button onClick={handleSoundCheckNext} className="neumorphic-button-light text-button">
                Continue
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {clickPulse && <div key={clickPulse.key} className="click-pulse" style={{ left: clickPulse.x, top: clickPulse.y }} />}
    </div>
  );
}