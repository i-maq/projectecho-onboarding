"use client";
import React, { useRef, useEffect, useState } from "react";
import MasterBackground from './MasterBackground';
import { motion, AnimatePresence } from "framer-motion";

interface OrbIntroProps {
  audioSrc: string;
  onAdvance: () => void;
}

const captions = [
  "Hey you... or should I say Hey, me.",
  "I'm you, from years in the future. How many? I can't say without giving too much away.",
  "I'm not as sharp as you–as I once was. My memories are beginning to fade. Some of the moments I've cherished are becoming... hazy.",
  "I don't want to forget. Everything we've done, everything we've loved, everything we've lost.",
  "It was all beautiful, and it can't be forgotten.",
  "You've got to help me–help you remember all of this, so that by the you, are me, nothing is forgotten.",
  "",
  "Think of who you are right now, in this moment.",
  "You are not a single, solid thing.",
  "You are a symphony of all the moments that came before.",
  "",
  "Your courage today... is an echo of a time you were scared, and pushed through anyway.",
  "Your laughter... is an echo of a thousand jokes shared with friends.",
  "Your wisdom... is an echo of mistakes made, and lessons learned.",
  "",
  "An echo is not a distant, faded copy... It proves... you are there.",
  "",
  "Here, you will become your echo for our future self to hear."
];

export const OrbIntro: React.FC<OrbIntroProps> = ({ audioSrc, onAdvance }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scriptAudioRef = useRef<HTMLAudioElement>(null);
  const tapAudioRef = useRef<HTMLAudioElement>(null);
  const [step, setStep] = useState(0);
  const [isTapped, setIsTapped] = useState(false);

  // 1) Orb particle animation
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    type P = { angle: number; radius: number; speed: number; hue: number; size: number };
    const particles: P[] = Array.from({ length: 120 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 0.3 + Math.random() * 0.5,
      speed: 0.002 + Math.random() * 0.008,
      hue: 230 + Math.random() * 100,
      size: 3 + Math.random() * 4,
    }));
    let animId: number;
    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.angle += p.speed;
        const x = width/2 + Math.cos(p.angle)*(width/2)*p.radius;
        const y = height/2 + Math.sin(p.angle)*(height/2)*p.radius;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI*2);
        ctx.fillStyle = `hsla(${p.hue},80%,60%,0.8)`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  // 2) Ambient background music
  useEffect(() => {
    const bg = new Audio("/ambient-music.mp3");
    bg.loop = true;
    bg.volume = 0.3;
    bg.play().catch(() => {});
    return () => { bg.pause(); };
  }, []);

  // 3) Play script audio on mount
  useEffect(() => {
    scriptAudioRef.current?.play();
  }, []);

  const handleTap = () => {
    // tap bump
    setIsTapped(true);
    setTimeout(() => setIsTapped(false), 300);
    // tap sound
    if (tapAudioRef.current) {
      tapAudioRef.current.currentTime = 0;
      tapAudioRef.current.play();
    }
    // advance or finish
    if (step < captions.length - 1) {
      setStep(step + 1);
      if (scriptAudioRef.current) {
        scriptAudioRef.current.currentTime = 0;
        scriptAudioRef.current.play();
      }
    } else {
      onAdvance();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-[#f0f2f5] cursor-pointer"
      onClick={handleTap}
    >
      {/* Background rings & particles */}
      <MasterBackground />
      {/* Global full-screen pulse */}
      <div className="pulse-circle-light" />

      {/* Centered orb with tap-scale */}
      <motion.div
        className="relative w-80 h-80 rounded-full bg-white bg-opacity-25 backdrop-blur-5xl overflow-hidden border border-white border-opacity-10 shadow-2xl"
        animate={{ scale: isTapped ? 1.08 : 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        {/* Gradient backlight */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 opacity-20 filter blur-4xl animate-pulse-slow" />
        <canvas ref={canvasRef} width={320} height={320} className="relative" />
      </motion.div>

      {/* Audio elements */}
      <audio ref={scriptAudioRef} src={audioSrc} preload="auto" />
      <audio ref={tapAudioRef} src="/tap-sound.mp3" preload="auto" />

      {/* Captions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
          className="absolute bottom-16 w-full px-4 max-w-2xl text-center text-lg leading-relaxed bg-white bg-opacity-60 backdrop-blur rounded-lg p-6 whitespace-pre-wrap"
        >
          {captions[step]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default OrbIntro;