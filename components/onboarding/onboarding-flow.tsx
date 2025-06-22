"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<'language' | 'soundCheck'>('language');
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
  
  return (
    <div className="w-full h-full flex items-center justify-center">
      <audio ref={musicRef} src="/ambient-music.mp3" preload="auto" />
      <audio ref={soundRef} src="/tap-sound.mp3" preload="auto" />

      <AnimatePresence mode="wait">
        {stage === 'language' && (
          <motion.div key="language" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="glass-panel-light text-center">
              <h1 className="text-3xl font-bold mb-2 text-gray-800">Welcome</h1>
              <p className="text-gray-600 mb-8">Please select your language.</p>
              <div className="space-y-4">
                <button onClick={handleLanguageSelect} className="w-full neumorphic-button-light h-12">English</button>
                <button onClick={handleLanguageSelect} className="w-full neumorphic-button-light h-12">Español</button>
                <button onClick={handleLanguageSelect} className="w-full neumorphic-button-light h-12">Français</button>
              </div>
            </div>
          </motion.div>
        )}

        {stage === 'soundCheck' && (
           <motion.div key="soundCheck" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="glass-panel-light text-center max-w-lg">
              <h2 className="text-3xl font-bold mb-4 text-gray-800">A Cinematic Experience</h2>
              <p className="text-lg text-gray-600 mb-8">This experience is best enjoyed with sound.</p>
              <button onClick={() => { onComplete(); localStorage.setItem('onboardingComplete', 'true'); }} className="neumorphic-button-light">
                Finish Onboarding (Temp)
              </button>
            </div>
           </motion.div>
        )}
      </AnimatePresence>
      
      {clickPulse && <div key={clickPulse.key} className="click-pulse" style={{ left: clickPulse.x, top: clickPulse.y }} />}
    </div>
  );
}