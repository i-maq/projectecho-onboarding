"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface AmbientAudioContextValue {
  isMuted: boolean;
  toggleMute: () => void;
}

const AmbientAudioContext = createContext<AmbientAudioContextValue>({
  isMuted: false,
  toggleMute: () => {},
});

export function useAmbientAudio() {
  return useContext(AmbientAudioContext);
}

const TARGET_VOLUME = 0.1;
const FADE_DURATION = 2000; // ms

export function AmbientAudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Create audio element once
  useEffect(() => {
    const audio = new Audio('/ambient-music.mp3');
    audio.loop = true;
    audio.volume = 0;
    audio.preload = 'auto';
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  // Fade volume helper
  const fadeTo = useCallback((target: number, duration: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    const startVol = audio.volume;
    const diff = target - startVol;
    const steps = Math.max(1, Math.round(duration / 50));
    let step = 0;

    fadeIntervalRef.current = setInterval(() => {
      step++;
      if (step >= steps) {
        audio.volume = target;
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
        return;
      }
      audio.volume = Math.max(0, Math.min(1, startVol + diff * (step / steps)));
    }, 50);
  }, []);

  // Start playback on first user interaction
  useEffect(() => {
    if (hasStarted) return;

    const startPlayback = () => {
      const audio = audioRef.current;
      if (!audio || hasStarted) return;

      audio.play().then(() => {
        setHasStarted(true);
        fadeTo(TARGET_VOLUME, FADE_DURATION);
      }).catch(() => {
        // Autoplay blocked — will retry on next interaction
      });
    };

    document.addEventListener('click', startPlayback, { once: true });
    document.addEventListener('touchstart', startPlayback, { once: true });

    return () => {
      document.removeEventListener('click', startPlayback);
      document.removeEventListener('touchstart', startPlayback);
    };
  }, [hasStarted, fadeTo]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.muted = false;
      fadeTo(TARGET_VOLUME, 500);
    } else {
      fadeTo(0, 300);
      setTimeout(() => {
        if (audioRef.current) audioRef.current.muted = true;
      }, 350);
    }
    setIsMuted(prev => !prev);
  }, [isMuted, fadeTo]);

  return (
    <AmbientAudioContext.Provider value={{ isMuted, toggleMute }}>
      {children}
    </AmbientAudioContext.Provider>
  );
}

/** Small glass mute/unmute button — place in top-right of screens */
export function MuteButton({ className = '' }: { className?: string }) {
  const { isMuted, toggleMute } = useAmbientAudio();

  return (
    <button
      onClick={toggleMute}
      aria-label={isMuted ? 'Unmute music' : 'Mute music'}
      className={className}
      style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(16px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(16px) saturate(1.6)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }}
    >
      {isMuted ? (
        <VolumeX style={{ width: 14, height: 14, color: '#94a3b8' }} />
      ) : (
        <Volume2 style={{ width: 14, height: 14, color: '#475569' }} />
      )}
    </button>
  );
}
