"use client";
import React, { useRef, useEffect, useState, useMemo } from "react";
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
  "You've got to help me–help you remember all of this, so that by the time you are me, nothing is forgotten.",
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
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  
  const [step, setStep] = useState(0);
  const [isTapped, setIsTapped] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Enhanced background particles component with perfect circles and better depth
  const Particle = () => {
    const style = useMemo(() => {
      // Create perfect circles by using same value for width and height
      const size = Math.random() * 3 + 0.5; // Size range: 0.5px to 3.5px
      
      // Enhanced depth of field blur - more gradual levels
      const depthLevel = Math.random();
      let blurAmount = 0;
      
      if (depthLevel < 0.3) {
        blurAmount = 0; // Sharp foreground particles
      } else if (depthLevel < 0.6) {
        blurAmount = 0.5; // Slightly blurred mid-ground
      } else if (depthLevel < 0.8) {
        blurAmount = 1; // Medium blur background
      } else {
        blurAmount = 1.5; // Heavy blur far background
      }
      
      // Opacity based on depth (farther = more transparent)
      const opacity = depthLevel < 0.3 ? 0.8 : 
                     depthLevel < 0.6 ? 0.6 : 
                     depthLevel < 0.8 ? 0.4 : 0.3;
      
      return {
        position: 'absolute' as 'absolute', 
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`, 
        width: `${size}px`,
        height: `${size}px`, // Same as width for perfect circles
        backgroundColor: `rgba(0, 0, 50, ${opacity})`,
        borderRadius: '50%', // Ensures perfect circle
        filter: `blur(${blurAmount}px)`,
        animation: `random-float-animation ${Math.random() * 35 + 15}s infinite linear`,
        zIndex: Math.floor(depthLevel * 5), // Layer particles by depth
      };
    }, []);
    
    return <div style={style}></div>;
  };

  // Background pulse circles configuration
  const circles = useMemo(() => [
    { delay: '0s', duration: '8s' }, 
    { delay: '2s', duration: '8s' },
    { delay: '4s', duration: '8s' }, 
    { delay: '6s', duration: '8s' },
  ], []);

  // Generate MORE particles for increased intensity (300 instead of 150)
  const particles = useMemo(() => Array.from({ length: 300 }).map((_, i) => <Particle key={i} />), []);

  // Aurora borealis color palette
  const auroraColors = [
    { r: 0, g: 255, b: 127 },    // Spring green
    { r: 64, g: 224, b: 255 },   // Deep sky blue  
    { r: 138, g: 43, b: 226 },   // Blue violet
    { r: 0, g: 191, b: 255 },    // Deep sky blue
    { r: 127, g: 255, b: 212 },  // Aquamarine
    { r: 72, g: 61, b: 139 },    // Dark slate blue
    { r: 0, g: 206, b: 209 },    // Dark turquoise
  ];

  // Initialize audio analysis
  const initAudioAnalysis = async () => {
    if (!scriptAudioRef.current) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaElementSource(scriptAudioRef.current);
      const analyser = audioContext.createAnalyser();
      
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      source.connect(analyser);
      analyser.connect(audioContext.destination);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
    } catch (error) {
      console.error('Audio analysis setup failed:', error);
    }
  };

  // Audio level monitoring
  useEffect(() => {
    let animationId: number;
    
    const updateAudioLevel = () => {
      if (analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        
        // Calculate average volume
        const average = dataArrayRef.current.reduce((sum, value) => sum + value, 0) / dataArrayRef.current.length;
        setAudioLevel(average / 255); // Normalize to 0-1
      }
      animationId = requestAnimationFrame(updateAudioLevel);
    };

    if (isAudioPlaying) {
      updateAudioLevel();
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isAudioPlaying]);

  // Orb animation with audio reactivity
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    // Blob parameters
    const blobConfig = {
      centerX: canvas.width / 2,
      centerY: canvas.height / 2,
      baseRadius: 80,
      audioRadius: 40,
      segments: 8,
      noiseScale: 0.005,
      timeScale: 0.02,
    };

    // Simplified noise function
    const noise = (x: number, y: number, t: number) => {
      return Math.sin(x * 0.1 + t) * Math.cos(y * 0.1 + t * 0.7) * Math.sin(t * 0.3);
    };

    const drawBlob = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      time += blobConfig.timeScale;
      
      // Audio-reactive scaling
      const audioBoost = 1 + audioLevel * 0.8;
      const currentRadius = blobConfig.baseRadius * audioBoost;
      
      // Create gradient
      const gradient = ctx.createRadialGradient(
        blobConfig.centerX, blobConfig.centerY, 0,
        blobConfig.centerX, blobConfig.centerY, currentRadius * 2
      );

      // Aurora color mixing based on time and audio
      const colorIndex = (time * 0.5 + audioLevel * 2) % auroraColors.length;
      const color1 = auroraColors[Math.floor(colorIndex)];
      const color2 = auroraColors[Math.floor(colorIndex + 1) % auroraColors.length];
      
      // Interpolate colors
      const mix = colorIndex % 1;
      const r = Math.floor(color1.r * (1 - mix) + color2.r * mix);
      const g = Math.floor(color1.g * (1 - mix) + color2.g * mix);
      const b = Math.floor(color1.b * (1 - mix) + color2.b * mix);

      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.9)`);
      gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, 0.6)`);
      gradient.addColorStop(0.7, `rgba(${Math.floor(r * 0.7)}, ${Math.floor(g * 0.8)}, ${Math.floor(b * 1.2)}, 0.3)`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

      ctx.fillStyle = gradient;

      // Draw organic blob shape
      ctx.beginPath();
      
      for (let i = 0; i <= blobConfig.segments; i++) {
        const angle = (i / blobConfig.segments) * Math.PI * 2;
        
        // Add noise for organic movement
        const noiseValue = noise(
          Math.cos(angle) * 100,
          Math.sin(angle) * 100,
          time + audioLevel * 5
        );
        
        const radiusVariation = currentRadius + noiseValue * 30 + audioLevel * 20;
        
        // Slight offset for floating movement
        const offsetX = Math.sin(time * 0.3) * 15;
        const offsetY = Math.cos(time * 0.4) * 10;
        
        const x = blobConfig.centerX + Math.cos(angle) * radiusVariation + offsetX;
        const y = blobConfig.centerY + Math.sin(angle) * radiusVariation + offsetY;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          // Smooth curves
          const prevAngle = ((i - 1) / blobConfig.segments) * Math.PI * 2;
          const prevNoiseValue = noise(
            Math.cos(prevAngle) * 100,
            Math.sin(prevAngle) * 100,
            time + audioLevel * 5
          );
          const prevRadiusVariation = currentRadius + prevNoiseValue * 30 + audioLevel * 20;
          const prevX = blobConfig.centerX + Math.cos(prevAngle) * prevRadiusVariation + offsetX;
          const prevY = blobConfig.centerY + Math.sin(prevAngle) * prevRadiusVariation + offsetY;
          
          const cpX = (prevX + x) / 2;
          const cpY = (prevY + y) / 2;
          
          ctx.quadraticCurveTo(cpX, cpY, x, y);
        }
      }
      
      ctx.closePath();
      ctx.fill();

      // Add inner glow
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
      ctx.shadowBlur = 30;
      ctx.fill();
      
      // Reset shadow
      ctx.shadowBlur = 0;

      animationId = requestAnimationFrame(drawBlob);
    };

    drawBlob();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [audioLevel]);

  // Audio event handlers
  useEffect(() => {
    const audio = scriptAudioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      setIsAudioPlaying(true);
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };

    const handlePause = () => setIsAudioPlaying(false);
    const handleEnded = () => setIsAudioPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Initialize audio analysis when audio is loaded
  useEffect(() => {
    const audio = scriptAudioRef.current;
    if (!audio) return;

    const handleCanPlay = () => {
      initAudioAnalysis();
    };

    audio.addEventListener('canplaythrough', handleCanPlay);
    return () => audio.removeEventListener('canplaythrough', handleCanPlay);
  }, []);

  // Ambient background music
  useEffect(() => {
    const bg = new Audio("/ambient-music.mp3");
    bg.loop = true;
    bg.volume = 0.3;
    bg.play().catch(() => {});
    return () => { bg.pause(); };
  }, []);

  // Play script audio on mount
  useEffect(() => {
    scriptAudioRef.current?.play();
  }, []);

  const handleTap = () => {
    // Visual feedback
    setIsTapped(true);
    setTimeout(() => setIsTapped(false), 300);
    
    // Tap sound
    if (tapAudioRef.current) {
      tapAudioRef.current.currentTime = 0;
      tapAudioRef.current.play();
    }
    
    // Advance or finish
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
      className="fixed inset-0 flex items-center justify-center bg-[#f0f2f5] cursor-pointer overflow-hidden"
      onClick={handleTap}
    >
      {/* Enhanced background particles and floating elements */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, overflow:'hidden' }}>
        {circles.map((circle, index) => (
          <div 
            key={index} 
            className='pulse-circle-light' 
            style={{ 
              animationDuration: circle.duration, 
              animationDelay: circle.delay 
            }} 
          />
        ))}
        {particles}
      </div>

      {/* Main orb container */}
      <motion.div
        className="relative z-10"
        animate={{ 
          scale: isTapped ? 1.05 : 1,
          rotateY: isAudioPlaying ? [0, 5, -5, 0] : 0
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20,
          rotateY: { duration: 8, repeat: Infinity, ease: "linear" }
        }}
      >
        {/* Outer glass sphere with frosted rim */}
        <div className="relative w-96 h-96">
          {/* Outer frosted ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 via-white/10 to-transparent backdrop-blur-xl border border-white/30 shadow-2xl" />
          
          {/* Inner clear glass */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/10 via-transparent to-white/5 backdrop-blur-sm border border-white/20" />
          
          {/* Canvas for the blob */}
          <div className="absolute inset-8 rounded-full overflow-hidden">
            <canvas 
              ref={canvasRef} 
              width={320} 
              height={320} 
              className="w-full h-full filter blur-[1px]"
            />
          </div>
          
          {/* Depth layers */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/5 to-white/10" />
          <div className="absolute inset-0 rounded-full shadow-inner shadow-blue-500/20" />
          
          {/* Audio-reactive rim glow */}
          <motion.div 
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                `0 0 ${20 + audioLevel * 40}px rgba(59, 130, 246, ${0.3 + audioLevel * 0.4})`,
                `0 0 ${25 + audioLevel * 45}px rgba(168, 85, 247, ${0.2 + audioLevel * 0.3})`,
                `0 0 ${20 + audioLevel * 40}px rgba(34, 197, 94, ${0.3 + audioLevel * 0.4})`
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>

      {/* Audio elements */}
      <audio ref={scriptAudioRef} src={audioSrc} preload="auto" />
      <audio ref={tapAudioRef} src="/tap-sound.mp3" preload="auto" />

      {/* Captions with liquid glass styling */}
      <AnimatePresence mode="wait">
        {captions[step] && (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(5px)" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute bottom-16 w-full px-6 max-w-3xl text-center z-10"
          >
            <div className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-2xl p-8 shadow-2xl">
              <p className="text-lg leading-relaxed text-gray-800 font-medium">
                {captions[step]}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tap instruction */}
      <motion.div 
        className="absolute bottom-4 text-sm text-gray-600 font-medium z-10"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Tap to continue
      </motion.div>
    </div>
  );
};

export default OrbIntro;