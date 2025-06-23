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
      const size = Math.random() * 3 + 0.5;
      const depthLevel = Math.random();
      let blurAmount = 0;
      
      if (depthLevel < 0.3) {
        blurAmount = 0;
      } else if (depthLevel < 0.6) {
        blurAmount = 0.5;
      } else if (depthLevel < 0.8) {
        blurAmount = 1;
      } else {
        blurAmount = 1.5;
      }
      
      const opacity = depthLevel < 0.3 ? 0.8 : 
                     depthLevel < 0.6 ? 0.6 : 
                     depthLevel < 0.8 ? 0.4 : 0.3;
      
      return {
        position: 'absolute' as 'absolute', 
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`, 
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: `rgba(0, 0, 50, ${opacity})`,
        borderRadius: '50%',
        filter: `blur(${blurAmount}px)`,
        animation: `random-float-animation ${Math.random() * 35 + 15}s infinite linear`,
        zIndex: Math.floor(depthLevel * 5),
      };
    }, []);
    
    return <div style={style}></div>;
  };

  const circles = useMemo(() => [
    { delay: '0s', duration: '8s' }, 
    { delay: '2s', duration: '8s' },
    { delay: '4s', duration: '8s' }, 
    { delay: '6s', duration: '8s' },
  ], []);

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
        const average = dataArrayRef.current.reduce((sum, value) => sum + value, 0) / dataArrayRef.current.length;
        setAudioLevel(average / 255);
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

  // Enhanced Siri-like fluid orb animation with bouncing movement
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    // Bouncing orb physics
    const orbPosition = { x: canvas.width / 2, y: canvas.height / 2 };
    const orbVelocity = { 
      x: (Math.random() - 0.5) * 0.4, // Slow initial velocity
      y: (Math.random() - 0.5) * 0.4 
    };
    const orbBounds = {
      left: 80,   // Boundary margin from edges
      right: canvas.width - 80,
      top: 80,
      bottom: canvas.height - 80
    };
    const friction = 0.998; // Slight friction for more natural movement
    const bounceDeceleration = 0.85; // Energy loss on bounce

    // Multiple blob layers for Siri-like effect
    const blobLayers = [
      {
        baseRadius: 60,
        segments: 12,
        speed: 0.015,
        noiseScale: 0.8,
        opacity: 0.7,
        offset: { x: 0, y: 0 }
      },
      {
        baseRadius: 45,
        segments: 10,
        speed: 0.022,
        noiseScale: 1.2,
        opacity: 0.6,
        offset: { x: 15, y: -10 }
      },
      {
        baseRadius: 70,
        segments: 14,
        speed: 0.012,
        noiseScale: 0.6,
        opacity: 0.5,
        offset: { x: -10, y: 8 }
      },
      {
        baseRadius: 35,
        segments: 8,
        speed: 0.028,
        noiseScale: 1.5,
        opacity: 0.8,
        offset: { x: 5, y: 12 }
      }
    ];

    // Update orb position with bouncing physics
    const updateOrbPosition = () => {
      // Apply gravity-like subtle force toward center
      const centerPull = 0.001;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const distanceFromCenter = Math.sqrt(
        Math.pow(orbPosition.x - centerX, 2) + Math.pow(orbPosition.y - centerY, 2)
      );
      
      if (distanceFromCenter > 0) {
        const pullX = (centerX - orbPosition.x) / distanceFromCenter * centerPull;
        const pullY = (centerY - orbPosition.y) / distanceFromCenter * centerPull;
        orbVelocity.x += pullX;
        orbVelocity.y += pullY;
      }

      // Add slight random movement for organic feel
      orbVelocity.x += (Math.random() - 0.5) * 0.02;
      orbVelocity.y += (Math.random() - 0.5) * 0.02;

      // Apply friction
      orbVelocity.x *= friction;
      orbVelocity.y *= friction;

      // Update position
      orbPosition.x += orbVelocity.x;
      orbPosition.y += orbVelocity.y;

      // Boundary collision with soft bouncing
      if (orbPosition.x <= orbBounds.left || orbPosition.x >= orbBounds.right) {
        orbVelocity.x = -orbVelocity.x * bounceDeceleration;
        orbPosition.x = Math.max(orbBounds.left, Math.min(orbBounds.right, orbPosition.x));
      }
      
      if (orbPosition.y <= orbBounds.top || orbPosition.y >= orbBounds.bottom) {
        orbVelocity.y = -orbVelocity.y * bounceDeceleration;
        orbPosition.y = Math.max(orbBounds.top, Math.min(orbBounds.bottom, orbPosition.y));
      }

      // Keep minimum velocity to prevent complete stopping
      const minVel = 0.1;
      const currentSpeed = Math.sqrt(orbVelocity.x * orbVelocity.x + orbVelocity.y * orbVelocity.y);
      if (currentSpeed < minVel && currentSpeed > 0) {
        const multiplier = minVel / currentSpeed;
        orbVelocity.x *= multiplier;
        orbVelocity.y *= multiplier;
      }
    };

    // Improved Perlin-like noise function
    const smoothNoise = (x: number, y: number, t: number, scale: number) => {
      const noise1 = Math.sin(x * 0.02 * scale + t) * Math.cos(y * 0.015 * scale + t * 0.7);
      const noise2 = Math.sin(x * 0.03 * scale + t * 1.3) * Math.cos(y * 0.025 * scale + t * 0.9);
      const noise3 = Math.sin(x * 0.01 * scale + t * 0.6) * Math.cos(y * 0.018 * scale + t * 1.1);
      
      return (noise1 + noise2 * 0.5 + noise3 * 0.3) / 1.8;
    };

    // Create smooth flowing movement for internal blob deformation
    const getFlowOffset = (t: number, layer: number) => {
      const flowSpeed = 0.008 + layer * 0.003;
      return {
        x: Math.sin(t * flowSpeed) * 8 + Math.cos(t * flowSpeed * 1.3) * 5,
        y: Math.cos(t * flowSpeed * 0.8) * 6 + Math.sin(t * flowSpeed * 1.1) * 4
      };
    };

    // Generate smooth bezier curve points for organic shapes
    const generateBlobPoints = (layer: any, t: number, audioBoost: number) => {
      const points = [];
      const segments = layer.segments;
      
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        
        // Multi-octave noise for more organic deformation
        const noise1 = smoothNoise(
          Math.cos(angle) * 50,
          Math.sin(angle) * 50,
          t * layer.speed,
          layer.noiseScale
        );
        
        const noise2 = smoothNoise(
          Math.cos(angle) * 100,
          Math.sin(angle) * 100,
          t * layer.speed * 0.7,
          layer.noiseScale * 0.5
        );

        const combinedNoise = noise1 + noise2 * 0.3;
        const radiusVariation = layer.baseRadius * audioBoost + combinedNoise * 15 + audioLevel * 12;
        
        // Flowing offset for internal movement
        const flowOffset = getFlowOffset(t, segments);
        
        // Use the bouncing orb position as the center instead of canvas center
        const x = orbPosition.x + Math.cos(angle) * radiusVariation + layer.offset.x + flowOffset.x;
        const y = orbPosition.y + Math.sin(angle) * radiusVariation + layer.offset.y + flowOffset.y;
        
        points.push({ x, y, angle });
      }
      
      return points;
    };

    // Draw smooth blob using bezier curves
    const drawSmoothBlob = (points: any[], color: string) => {
      if (points.length < 3) return;
      
      ctx.beginPath();
      
      // Start from the first point
      ctx.moveTo(points[0].x, points[0].y);
      
      // Create smooth curves using quadratic bezier curves
      for (let i = 0; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[(i + 1) % (points.length - 1)];
        
        // Control point for smooth curves
        const controlX = (current.x + next.x) / 2;
        const controlY = (current.y + next.y) / 2;
        
        // Add some curvature variation
        const curvature = Math.sin(time * 0.02 + i * 0.5) * 3;
        
        ctx.quadraticCurveTo(
          current.x + curvature, 
          current.y + curvature, 
          controlX, 
          controlY
        );
      }
      
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };

    const drawFrame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      time += 1;
      
      // Update orb bouncing position
      updateOrbPosition();
      
      // Audio-reactive scaling
      const audioBoost = 1 + audioLevel * 0.4;
      
      // Draw multiple blob layers from back to front
      blobLayers.forEach((layer, index) => {
        const points = generateBlobPoints(layer, time, audioBoost);
        
        // Dynamic color mixing
        const colorIndex = (time * 0.01 + index * 0.3 + audioLevel * 1.5) % auroraColors.length;
        const color1 = auroraColors[Math.floor(colorIndex)];
        const color2 = auroraColors[Math.floor(colorIndex + 1) % auroraColors.length];
        
        // Interpolate colors
        const mix = colorIndex % 1;
        const r = Math.floor(color1.r * (1 - mix) + color2.r * mix);
        const g = Math.floor(color1.g * (1 - mix) + color2.g * mix);
        const b = Math.floor(color1.b * (1 - mix) + color2.b * mix);
        
        // Create gradient for each layer centered on the bouncing orb position
        const gradient = ctx.createRadialGradient(
          orbPosition.x, orbPosition.y, 0,
          orbPosition.x, orbPosition.y, layer.baseRadius * audioBoost * 1.5
        );
        
        const opacity = layer.opacity * (0.6 + audioLevel * 0.4);
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacity})`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${opacity * 0.7})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        
        // Add subtle glow
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.3)`;
        ctx.shadowBlur = 20;
        
        drawSmoothBlob(points, gradient);
        
        // Reset shadow for next layer
        ctx.shadowBlur = 0;
      });

      animationId = requestAnimationFrame(drawFrame);
    };

    drawFrame();

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
          scale: isTapped ? 1.03 : 1,
          y: isAudioPlaying ? [0, -2, 2, 0] : 0
        }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 25,
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        {/* Liquid glass sphere container */}
        <div className="relative w-96 h-96">
          {/* Outer frosted glass shell */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/25 via-white/10 to-white/5 backdrop-blur-3xl border border-white/40 shadow-2xl" />
          
          {/* Inner clear glass layer */}
          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-white/15 via-transparent to-white/8 backdrop-blur-xl border border-white/25" />
          
          {/* Innermost content layer with enhanced blur for fluid fusion */}
          <div className="absolute inset-6 rounded-full bg-gradient-to-br from-white/10 via-transparent to-white/5 backdrop-blur-lg overflow-hidden">
            <div 
              className="w-full h-full rounded-full overflow-hidden"
              style={{
                filter: 'blur(8px) saturate(1.4) brightness(1.1)',
                transform: 'scale(1.05)'
              }}
            >
              <canvas 
                ref={canvasRef} 
                width={336} 
                height={336} 
                className="w-full h-full"
                style={{
                  filter: 'blur(4px) contrast(1.2)',
                  opacity: 0.9
                }}
              />
            </div>
          </div>
          
          {/* Additional soft blur overlay for seamless fusion */}
          <div 
            className="absolute inset-6 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, 
                rgba(100, 200, 255, 0.1) 0%, 
                rgba(150, 100, 255, 0.08) 30%, 
                rgba(200, 150, 255, 0.06) 60%, 
                transparent 100%)`,
              filter: 'blur(12px)',
              mixBlendMode: 'soft-light'
            }}
          />
          
          {/* Glass depth and refraction effects */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/8 to-white/15 pointer-events-none" />
          <div className="absolute inset-0 rounded-full shadow-inner shadow-blue-400/10" />
          
          {/* Subtle rim highlight */}
          <div className="absolute inset-0 rounded-full ring-1 ring-white/30 ring-inset" />
          
          {/* Audio-reactive outer glow with softer edges */}
          <motion.div 
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{
              boxShadow: [
                `0 0 ${40 + audioLevel * 60}px ${15 + audioLevel * 20}px rgba(59, 130, 246, ${0.15 + audioLevel * 0.25})`,
                `0 0 ${45 + audioLevel * 65}px ${18 + audioLevel * 22}px rgba(168, 85, 247, ${0.12 + audioLevel * 0.2})`,
                `0 0 ${40 + audioLevel * 60}px ${15 + audioLevel * 20}px rgba(34, 197, 94, ${0.15 + audioLevel * 0.25})`
              ]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>

      {/* Audio elements */}
      <audio ref={scriptAudioRef} src={audioSrc} preload="auto" />
      <audio ref={tapAudioRef} src="/tap-sound.mp3" preload="auto" />

      {/* Captions with enhanced liquid glass styling */}
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