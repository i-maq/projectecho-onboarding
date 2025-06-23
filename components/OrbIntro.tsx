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

  // Enhanced Siri-like fluid orb animation with tap-to-jump movement
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    // 🌟 NEW: Tap-to-jump orb position system
    const orbPosition = { x: canvas.width / 2, y: canvas.height / 2 };
    const targetPosition = { x: canvas.width / 2, y: canvas.height / 2 };
    let isJumping = false;
    let jumpProgress = 0;
    const jumpDuration = 0.8; // Duration in seconds for jump animation
    const jumpStartTime = { value: 0 };

    // 🌈 NEW: Trail system for beautiful glowing path
    const trailPoints: Array<{ x: number; y: number; age: number; intensity: number }> = [];
    const maxTrailLength = 25;
    const trailFadeTime = 1.5; // Time in seconds for trail to fade

    const orbBounds = {
      left: 80,
      right: canvas.width - 80,
      top: 80,
      bottom: canvas.height - 80
    };

    // ✨ NEW: Generate random jump target within orb bounds
    const generateRandomTarget = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxRadius = Math.min(orbBounds.right - centerX, orbBounds.bottom - centerY) * 0.8;
      
      // Generate random position within circular bounds
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * maxRadius;
      
      return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };
    };

    // 🎯 NEW: Jump to random position (called on tap)
    const jumpToRandomPosition = () => {
      const newTarget = generateRandomTarget();
      targetPosition.x = newTarget.x;
      targetPosition.y = newTarget.y;
      isJumping = true;
      jumpProgress = 0;
      jumpStartTime.value = time;
    };

    // 🚀 NEW: Smooth easing function for jump animation
    const easeOutQuart = (t: number): number => {
      return 1 - Math.pow(1 - t, 4);
    };

    // 🌟 NEW: Update orb position with smooth jumping
    const updateOrbPosition = () => {
      if (isJumping) {
        const elapsed = (time - jumpStartTime.value) / 60; // Convert to seconds (assuming 60fps)
        jumpProgress = Math.min(elapsed / jumpDuration, 1);
        
        if (jumpProgress >= 1) {
          // Jump completed
          isJumping = false;
          orbPosition.x = targetPosition.x;
          orbPosition.y = targetPosition.y;
        } else {
          // Smooth interpolation with easing
          const eased = easeOutQuart(jumpProgress);
          const startX = orbPosition.x;
          const startY = orbPosition.y;
          
          // Calculate start position if this is first frame of jump
          if (jumpProgress === 0) {
            jumpStartTime.value = time;
          }
          
          orbPosition.x = startX + (targetPosition.x - startX) * eased;
          orbPosition.y = startY + (targetPosition.y - startY) * eased;
        }
      }

      // 🌈 NEW: Add current position to trail
      if (time % 2 === 0) { // Add trail point every 2 frames for performance
        trailPoints.push({
          x: orbPosition.x,
          y: orbPosition.y,
          age: 0,
          intensity: isJumping ? 1.2 : 0.8
        });
      }

      // 🌈 NEW: Update and clean up trail points
      for (let i = trailPoints.length - 1; i >= 0; i--) {
        trailPoints[i].age += 1/60; // Increment age (assuming 60fps)
        
        if (trailPoints[i].age > trailFadeTime || trailPoints.length > maxTrailLength) {
          trailPoints.splice(i, 1);
        }
      }
    };

    // 🌈 NEW: Draw beautiful glowing trail
    const drawTrail = () => {
      if (trailPoints.length < 2) return;

      // Draw trail as connected glowing segments
      for (let i = 1; i < trailPoints.length; i++) {
        const current = trailPoints[i];
        const previous = trailPoints[i - 1];
        
        const fadeAmount = 1 - (current.age / trailFadeTime);
        const alpha = fadeAmount * 0.6 * current.intensity;
        const width = fadeAmount * 8 + 2;
        
        if (alpha > 0.05) {
          // Create gradient for trail segment
          const gradient = ctx.createLinearGradient(
            previous.x, previous.y,
            current.x, current.y
          );
          
          // Use aurora colors for trail
          const colorIndex = (time * 0.02 + i * 0.1) % auroraColors.length;
          const color = auroraColors[Math.floor(colorIndex)];
          
          gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.5})`);
          gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`);
          
          // Draw trail segment with glow effect
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          ctx.strokeStyle = gradient;
          ctx.lineWidth = width;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          
          // Add soft glow
          ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.4)`;
          ctx.shadowBlur = width * 2;
          
          ctx.beginPath();
          ctx.moveTo(previous.x, previous.y);
          ctx.lineTo(current.x, current.y);
          ctx.stroke();
          
          ctx.restore();
        }
      }
    };

    // Make jump function available globally for tap handler
    (window as any).orbJump = jumpToRandomPosition;

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
        
        // 🚀 NEW: Add jumping excitement to radius variation
        const jumpBoost = isJumping ? 1.2 + Math.sin(jumpProgress * Math.PI) * 0.3 : 1;
        const radiusVariation = layer.baseRadius * audioBoost * jumpBoost + combinedNoise * 15 + audioLevel * 12;
        
        // Flowing offset for internal movement
        const flowOffset = getFlowOffset(t, segments);
        
        // Use the jumping orb position as the center
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
      
      // 🌟 NEW: Update orb position with jumping logic
      updateOrbPosition();
      
      // 🌈 NEW: Draw trailing path first (behind orb)
      drawTrail();
      
      // Audio-reactive scaling with jump excitement
      const jumpIntensity = isJumping ? 1.1 + Math.sin(jumpProgress * Math.PI * 2) * 0.2 : 1;
      const audioBoost = (1 + audioLevel * 0.4) * jumpIntensity;
      
      // Draw multiple blob layers from back to front
      blobLayers.forEach((layer, index) => {
        const points = generateBlobPoints(layer, time, audioBoost);
        
        // Dynamic color mixing with jump effect
        const jumpColorShift = isJumping ? jumpProgress * 2 : 0;
        const colorIndex = (time * 0.01 + index * 0.3 + audioLevel * 1.5 + jumpColorShift) % auroraColors.length;
        const color1 = auroraColors[Math.floor(colorIndex)];
        const color2 = auroraColors[Math.floor(colorIndex + 1) % auroraColors.length];
        
        // Interpolate colors
        const mix = colorIndex % 1;
        const r = Math.floor(color1.r * (1 - mix) + color2.r * mix);
        const g = Math.floor(color1.g * (1 - mix) + color2.g * mix);
        const b = Math.floor(color1.b * (1 - mix) + color2.b * mix);
        
        // Create gradient for each layer centered on the orb position
        const gradient = ctx.createRadialGradient(
          orbPosition.x, orbPosition.y, 0,
          orbPosition.x, orbPosition.y, layer.baseRadius * audioBoost * 1.5
        );
        
        const baseOpacity = layer.opacity * (0.6 + audioLevel * 0.4);
        const jumpGlow = isJumping ? 0.3 : 0;
        const opacity = baseOpacity + jumpGlow;
        
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacity})`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${opacity * 0.7})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        
        // Add enhanced glow during jumps
        const glowIntensity = isJumping ? 30 + jumpProgress * 20 : 20;
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.3)`;
        ctx.shadowBlur = glowIntensity;
        
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
      // Clean up global function
      delete (window as any).orbJump;
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
    // 🌟 NEW: Trigger orb jump on tap!
    if ((window as any).orbJump) {
      (window as any).orbJump();
    }
    
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

      {/* Enhanced tap instruction with interaction hint */}
      <motion.div 
        className="absolute bottom-4 text-sm text-gray-600 font-medium z-10"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Tap to continue • Watch the orb dance ✨
      </motion.div>
    </div>
  );
};

export default OrbIntro;