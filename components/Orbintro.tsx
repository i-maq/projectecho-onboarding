import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OrbIntroProps {
  audioSrc: string;
  onAdvance: () => void;
}

const captions = [
  `Hey you... or should I say Hey, me.

I'm you, from years in the future. How many? I can't say without giving too much away.

I'm not as sharp as you-as I once was. My memories are beginning to fade. Some of the moments I've cherished are becoming... hazy.

I don't want to forget. Everything we've done, everything we've loved, everything we've lost. It was all beautiful, and it can't be forgotten.

You've got to me help me-help you remember all of this, so that by the you, are me, nothing is forgotten.`,
  `Think of who you are right now, in this moment. 

You are not a single, solid thing. 

You are a symphony of all the moments that came before.`,
  `Your courage today... is an echo of a time you were scared, and pushed through anyway. 

Your laughter... is an echo of a thousand jokes shared with friends. 

Your wisdom... is an echo of mistakes made, and lessons learned.`,
  `An echo is not a distant, faded copy... It proves... you are there.`,
  `Here, you will me become your echo for our future self to hear.`
];

const OrbIntro: React.FC<OrbIntroProps> = ({ audioSrc, onAdvance }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const particles = Array.from({ length: 60 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 0.4 + Math.random() * 0.4,
      speed: 0.005 + Math.random() * 0.005,
      hue: 240 + Math.random() * 60,
    }));
    let anim: number;
    function draw() {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.angle += p.speed;
        const x = width/2 + Math.cos(p.angle) * (width/2) * p.radius;
        const y = height/2 + Math.sin(p.angle) * (height/2) * p.radius;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI*2);
        ctx.fillStyle = `hsla(${p.hue},80%,60%,0.6)`;
        ctx.fill();
      });
      anim = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(anim);
  }, []);

  useEffect(() => {
    audioRef.current?.play();
  }, []);

  const handleTap = () => {
    if (step < captions.length - 1) {
      setStep(step + 1);
      audioRef.current!.currentTime = 0;
      audioRef.current!.play();
    } else {
      onAdvance();
    }
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center bg-[#f0f2f5] cursor-pointer"
      onClick={handleTap}
    >
      <div className="relative w-64 h-64 mb-8 rounded-full bg-white bg-opacity-20 backdrop-blur-lg overflow-hidden">
        <canvas ref={canvasRef} width={256} height={256} />
      </div>
      <audio ref={audioRef} src={audioSrc} />
      <AnimatePresence exitBeforeEnter>
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="max-w-xl text-center text-lg bg-white bg-opacity-60 backdrop-blur rounded-lg p-6"
        >
          {captions[step]}
        </motion.div>
      </AnimatePresence>
      <div className="mt-4 text-sm text-gray-600">Tap to continue</div>
    </div>
  );
};

export default OrbIntro;