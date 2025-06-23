"use client";
import React, { useRef, useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OrbIntroProps {
  audioSrc: string;
  onAdvance: () => void;
}

const captions = [
  "Hey you... or should I say Hey, me.",
  "I'm you, from years in the future.",
  "How many? I can't say without giving too much away.",
  "I'm not as sharp as you–as I once was.",
  "My memories are beginning to fade.",
  "Some of the moments I've cherished are becoming... hazy.",
  "I don't want to forget.",
  "Everything we've done, everything we've loved, everything we've lost.",
  "It was all beautiful, and it can't be forgotten.",
  "You've got to help me–help you remember all of this, so that by the time you are me, nothing is forgotten.",
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
  const [isMobile, setIsMobile] = useState(false);

  // 📱 Check for mobile/small screen
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // Mobile breakpoint
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Enhanced background particles component with mobile-friendly opacity
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
      
      // 📱 NEW: Reduced opacity for mobile - much lighter particles
      let opacity;
      if (isMobile) {
        // Mobile: Much lighter particles, max opacity 0.4
        opacity = depthLevel < 0.3 ? 0.4 : 
                 depthLevel < 0.6 ? 0.3 : 
                 depthLevel < 0.8 ? 0.2 : 0.15;
      } else {
        // Desktop: Slightly reduced from original, max opacity 0.6
        opacity = depthLevel < 0.3 ? 0.6 : 
                 depthLevel < 0.6 ? 0.45 : 
                 depthLevel < 0.8 ? 0.3 : 0.2;
      }
      
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
    }, [isMobile]);
    
    return <div style={style}></div>;
  };

  const circles = useMemo(() => [
    { delay: '0s', duration: '8s' }, 
    { delay: '2s', duration: '8s' },
    { delay: '4s', duration: '8s' }, 
    { delay: '6s', duration: '8s' },
  ], []);

  // 📱 NEW: Responsive particle count - fewer particles on mobile
  const particleCount = useMemo(() => {
    return isMobile ? 150 : 300; // 50% fewer particles on mobile
  }, [isMobile]);

  const particles = useMemo(() => 
    Array.from({ length: particleCount }).map((_, i) => <Particle key={i} />), 
    [particleCount, isMobile]
  );

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

  // Enhanced Siri-like fluid orb animation with spherical movement
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    // Enhanced orb position system with 3D sphere movement
    const orbPosition = { x: canvas.width / 2, y: canvas.height / 2 };
    const targetPosition = { x: canvas.width / 2, y: canvas.height / 2 };
    
    const jumpState = {
      isJumping: false,
      jumpProgress: 0,
      jumpStartTime: 0,
    };
    
    const jumpDuration = 0.8;

    // Generate spherical target positions
    const generateSphericalTarget = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxRadius = Math.min(canvas.width, canvas.height) * 0.35;
      
      // 3D spherical coordinates
      const theta = Math.random() * Math.PI * 2; // Azimuth
      const phi = Math.acos(2 * Math.random() - 1); // Inclination for uniform distribution
      
      // Project to 2D with spherical perspective
      const radius = Math.random() * maxRadius;
      const x = centerX + radius * Math.sin(phi) * Math.cos(theta);
      const y = centerY + radius * Math.sin(phi) * Math.sin(theta) * 0.8; // Flatten slightly for better visual
      
      return { x, y };
    };

    const jumpToRandomPosition = () => {
      if (jumpState.isJumping) return;
      
      const newTarget = generateSphericalTarget();
      targetPosition.x = newTarget.x;
      targetPosition.y = newTarget.y;
      
      jumpState.isJumping = true;
      jumpState.jumpProgress = 0;
      jumpState.jumpStartTime = time;
    };

    const easeOutQuart = (t: number): number => {
      return 1 - Math.pow(1 - t, 4);
    };

    const updateOrbPosition = () => {
      if (jumpState.isJumping) {
        const elapsed = (time - jumpState.jumpStartTime) / 60;
        jumpState.jumpProgress = Math.min(elapsed / jumpDuration, 1);
        
        if (jumpState.jumpProgress >= 1) {
          orbPosition.x = targetPosition.x;
          orbPosition.y = targetPosition.y;
          jumpState.isJumping = false;
        } else {
          const eased = easeOutQuart(jumpState.jumpProgress);
          const startX = orbPosition.x;
          const startY = orbPosition.y;
          
          orbPosition.x = startX + (targetPosition.x - startX) * eased;
          orbPosition.y = startY + (targetPosition.y - startY) * eased;
        }
      }
    };

    // Make jump function available globally
    (window as any).orbJump = jumpToRandomPosition;

    // Enhanced blob layers for seamless spherical effect
    const blobLayers = [
      {
        baseRadius: 85,  // Larger to fill more space
        segments: 16,
        speed: 0.012,
        noiseScale: 0.6,
        opacity: 0.8,
        offset: { x: 0, y: 0 }
      },
      {
        baseRadius: 70,
        segments: 14,
        speed: 0.018,
        noiseScale: 0.9,
        opacity: 0.7,
        offset: { x: 8, y: -5 }
      },
      {
        baseRadius: 95,  // Even larger for edge filling
        segments: 18,
        speed: 0.009,
        noiseScale: 0.4,
        opacity: 0.6,
        offset: { x: -6, y: 4 }
      },
      {
        baseRadius: 55,
        segments: 12,
        speed: 0.024,
        noiseScale: 1.2,
        opacity: 0.9,
        offset: { x: 3, y: 8 }
      },
      {
        baseRadius: 110, // Largest layer to extend to edges
        segments: 20,
        speed: 0.006,
        noiseScale: 0.3,
        opacity: 0.5,
        offset: { x: 0, y: 0 }
      }
    ];

    // Enhanced 3D noise for spherical deformation
    const sphericalNoise = (x: number, y: number, t: number, scale: number) => {
      const r = Math.sqrt(x * x + y * y) * 0.01;
      const theta = Math.atan2(y, x);
      const phi = r * Math.PI;
      
      const noise1 = Math.sin(phi * scale + t) * Math.cos(theta * scale * 1.3 + t * 0.7);
      const noise2 = Math.sin(phi * scale * 1.4 + t * 1.2) * Math.cos(theta * scale * 0.8 + t * 0.9);
      const noise3 = Math.sin(r * scale * 2 + t * 0.5) * Math.cos(phi * scale * 0.6 + t * 1.1);
      
      return (noise1 + noise2 * 0.6 + noise3 * 0.4) / 2;
    };

    const getFlowOffset = (t: number, layer: number) => {
      const flowSpeed = 0.006 + layer * 0.002;
      return {
        x: Math.sin(t * flowSpeed) * 12 + Math.cos(t * flowSpeed * 1.5) * 8,
        y: Math.cos(t * flowSpeed * 0.9) * 10 + Math.sin(t * flowSpeed * 1.2) * 6
      };
    };

    // Generate blob points that extend to sphere edges
    const generateBlobPoints = (layer: any, t: number, audioBoost: number) => {
      const points = [];
      const segments = layer.segments;
      
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        
        // Enhanced spherical noise
        const noise1 = sphericalNoise(
          Math.cos(angle) * 80,
          Math.sin(angle) * 80,
          t * layer.speed,
          layer.noiseScale
        );
        
        const noise2 = sphericalNoise(
          Math.cos(angle) * 140,
          Math.sin(angle) * 140,
          t * layer.speed * 0.8,
          layer.noiseScale * 0.6
        );

        const combinedNoise = noise1 + noise2 * 0.4;
        
        // Enhanced radius that can extend to sphere edges
        let jumpBoost = jumpState.isJumping ? 1.3 + Math.sin(jumpState.jumpProgress * Math.PI) * 0.4 : 1;
        
        const radiusVariation = layer.baseRadius * audioBoost * jumpBoost + combinedNoise * 25 + audioLevel * 18;
        
        const flowOffset = getFlowOffset(t, segments);
        
        const x = orbPosition.x + Math.cos(angle) * radiusVariation + layer.offset.x + flowOffset.x;
        const y = orbPosition.y + Math.sin(angle) * radiusVariation + layer.offset.y + flowOffset.y;
        
        points.push({ x, y, angle });
      }
      
      return points;
    };

    // Enhanced smooth blob drawing with edge blending
    const drawSmoothBlob = (points: any[], color: string, layer: any) => {
      if (points.length < 3) return;
      
      ctx.save();
      
      // Create clipping mask for spherical shape
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2 - 2, 0, Math.PI * 2);
      ctx.clip();
      
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      
      // Enhanced smooth curves
      for (let i = 0; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[(i + 1) % (points.length - 1)];
        
        const controlX = (current.x + next.x) / 2;
        const controlY = (current.y + next.y) / 2;
        
        const curvature = Math.sin(time * 0.015 + i * 0.4) * 5;
        
        ctx.quadraticCurveTo(
          current.x + curvature, 
          current.y + curvature, 
          controlX, 
          controlY
        );
      }
      
      ctx.closePath();
      
      // Enhanced blending for seamless sphere effect
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = color;
      ctx.fill();
      
      ctx.restore();
    };

    const drawFrame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      time += 1;
      updateOrbPosition();
      
      // Enhanced audio reactivity with spherical expansion
      let jumpIntensity = jumpState.isJumping ? 1.2 + Math.sin(jumpState.jumpProgress * Math.PI * 2) * 0.3 : 1;
      const audioBoost = (1 + audioLevel * 0.5) * jumpIntensity;
      
      // Draw layers from largest to smallest for better blending
      const sortedLayers = [...blobLayers].sort((a, b) => b.baseRadius - a.baseRadius);
      
      sortedLayers.forEach((layer, index) => {
        const points = generateBlobPoints(layer, time, audioBoost);
        
        // Enhanced dynamic color mixing for spherical depth
        let jumpColorShift = jumpState.isJumping ? jumpState.jumpProgress * 2.5 : 0;
        
        const colorIndex = (time * 0.008 + index * 0.4 + audioLevel * 2 + jumpColorShift) % auroraColors.length;
        const color1 = auroraColors[Math.floor(colorIndex)];
        const color2 = auroraColors[Math.floor(colorIndex + 1) % auroraColors.length];
        
        const mix = colorIndex % 1;
        const r = Math.floor(color1.r * (1 - mix) + color2.r * mix);
        const g = Math.floor(color1.g * (1 - mix) + color2.g * mix);
        const b = Math.floor(color1.b * (1 - mix) + color2.b * mix);
        
        // Spherical gradient from center outward
        const gradient = ctx.createRadialGradient(
          orbPosition.x, orbPosition.y, 0,
          orbPosition.x, orbPosition.y, layer.baseRadius * audioBoost * 2
        );
        
        const baseOpacity = layer.opacity * (0.4 + audioLevel * 0.6);
        const jumpGlow = jumpState.isJumping ? 0.4 : 0;
        const opacity = baseOpacity + jumpGlow;
        
        // Enhanced spherical gradient for edge extension
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacity})`);
        gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${opacity * 0.9})`);
        gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${opacity * 0.6})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${opacity * 0.2})`);
        
        drawSmoothBlob(points, gradient, layer);
      });

      animationId = requestAnimationFrame(drawFrame);
    };

    drawFrame();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
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
    // Trigger orb jump
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

  // Responsive sizing with mobile padding
  const orbSize = isMobile ? 'w-64 h-64' : 'w-96 h-96';
  const canvasSize = isMobile ? 256 : 384;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-[#f0f2f5] cursor-pointer overflow-hidden"
      onClick={handleTap}
    >
      {/* Enhanced background particles */}
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

      {/* Borderless spherical orb with extended fluid effect */}
      <motion.div
        className="relative z-10 mx-4 md:mx-0"
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
        {/* Seamless spherical container */}
        <div className={`relative ${orbSize}`}>
          {/* Pure spherical shape without borders */}
          <div 
            className="absolute inset-0 rounded-full overflow-hidden"
            style={{
              background: `radial-gradient(circle at 35% 25%, 
                rgba(255, 255, 255, 0.2) 0%,
                rgba(255, 255, 255, 0.1) 20%,
                rgba(200, 220, 255, 0.08) 40%,
                rgba(150, 180, 255, 0.06) 60%,
                rgba(100, 140, 255, 0.04) 80%,
                transparent 100%)`,
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
              boxShadow: `
                0 0 60px rgba(100, 150, 255, 0.3),
                inset 0 0 60px rgba(255, 255, 255, 0.1)
              `
            }}
          >
            {/* Fluid effect extends to edges */}
            <canvas 
              ref={canvasRef} 
              width={canvasSize} 
              height={canvasSize} 
              className="w-full h-full rounded-full"
              style={{
                filter: 'saturate(1.4) brightness(1.2) contrast(1.1)',
                opacity: 0.95,
                mixBlendMode: 'screen'
              }}
            />
          </div>

          {/* Subtle spherical highlight without border */}
          <div 
            className="absolute rounded-full pointer-events-none"
            style={{
              top: '10%',
              left: '15%',
              width: '40%',
              height: '30%',
              background: `radial-gradient(ellipse, 
                rgba(255, 255, 255, 0.4) 0%,
                rgba(255, 255, 255, 0.2) 40%,
                transparent 70%)`,
              filter: 'blur(8px)',
              transform: 'rotate(-20deg)'
            }}
          />

          {/* Enhanced atmospheric glow */}
          <motion.div 
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{
              boxShadow: [
                `0 0 ${80 + audioLevel * 100}px ${30 + audioLevel * 40}px rgba(100, 180, 255, ${0.3 + audioLevel * 0.4})`,
                `0 0 ${90 + audioLevel * 110}px ${35 + audioLevel * 45}px rgba(150, 120, 255, ${0.25 + audioLevel * 0.35})`,
                `0 0 ${80 + audioLevel * 100}px ${30 + audioLevel * 40}px rgba(80, 220, 150, ${0.3 + audioLevel * 0.4})`
              ]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>

      {/* Audio elements */}
      <audio ref={scriptAudioRef} src={audioSrc} preload="auto" />
      <audio ref={tapAudioRef} src="/tap-sound.mp3" preload="auto" />

      {/* Captions */}
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
        Tap to continue • Watch the orb bounce! 🌟
      </motion.div>
    </div>
  );
};

export default OrbIntro;