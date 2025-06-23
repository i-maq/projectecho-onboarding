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
      
      // 📱 Reduced opacity for mobile - much lighter particles
      let opacity;
      if (isMobile) {
        opacity = depthLevel < 0.3 ? 0.4 : 
                 depthLevel < 0.6 ? 0.3 : 
                 depthLevel < 0.8 ? 0.2 : 0.15;
      } else {
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

  // 📱 Responsive particle count - fewer particles on mobile
  const particleCount = useMemo(() => {
    return isMobile ? 150 : 300;
  }, [isMobile]);

  const particles = useMemo(() => 
    Array.from({ length: particleCount }).map((_, i) => <Particle key={i} />), 
    [particleCount, isMobile]
  );

  // 🌈 ENHANCED Aurora borealis color palette with more vibrant greens and purples
  const auroraColors = [
    { r: 50, g: 255, b: 50 },     // Bright green 
    { r: 100, g: 255, b: 100 },   // Light green
    { r: 0, g: 200, b: 100 },     // Emerald green
    { r: 150, g: 50, b: 255 },    // Bright purple
    { r: 200, g: 100, b: 255 },   // Light purple
    { r: 100, g: 0, b: 200 },     // Deep purple
    { r: 255, g: 100, b: 200 },   // Pink-purple
    { r: 0, g: 255, b: 150 },     // Cyan-green
    { r: 100, g: 150, b: 255 },   // Light blue
    { r: 50, g: 100, b: 255 },    // Deep blue
    { r: 255, g: 150, b: 0 },     // Orange (for warm contrast)
    { r: 255, g: 200, b: 100 },   // Warm yellow
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

    // Enhanced blob layers for detailed fluid effect with MORE SEGMENTS for smoother curves
    const blobLayers = [
      {
        baseRadius: 75,
        segments: 32, // DOUBLED for smoother curves
        speed: 0.012,
        noiseScale: 0.8,
        opacity: 0.9,
        offset: { x: 0, y: 0 },
        colorOffset: 0 // For color variation per layer
      },
      {
        baseRadius: 60,
        segments: 28, // INCREASED for smoother curves
        speed: 0.018,
        noiseScale: 1.1,
        opacity: 0.8,
        offset: { x: 6, y: -4 },
        colorOffset: 2.5 // Different color progression
      },
      {
        baseRadius: 85,
        segments: 36, // INCREASED for smoother curves
        speed: 0.009,
        noiseScale: 0.6,
        opacity: 0.7,
        offset: { x: -5, y: 3 },
        colorOffset: 5.0 // Different color progression
      },
      {
        baseRadius: 45,
        segments: 24, // INCREASED for smoother curves
        speed: 0.024,
        noiseScale: 1.4,
        opacity: 0.95,
        offset: { x: 2, y: 6 },
        colorOffset: 7.5 // Different color progression
      },
      {
        baseRadius: 95,
        segments: 40, // INCREASED for smoother curves
        speed: 0.006,
        noiseScale: 0.4,
        opacity: 0.6,
        offset: { x: 0, y: 0 },
        colorOffset: 10.0 // Different color progression
      },
      {
        baseRadius: 35,
        segments: 20, // INCREASED for smoother curves
        speed: 0.030,
        noiseScale: 1.8,
        opacity: 1.0,
        offset: { x: 4, y: -2 },
        colorOffset: 12.5 // Different color progression
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
      const noise4 = Math.sin(theta * scale * 2.2 + t * 0.8) * Math.cos(r * scale * 1.5 + t * 1.3);
      
      return (noise1 + noise2 * 0.6 + noise3 * 0.4 + noise4 * 0.3) / 2.3;
    };

    const getFlowOffset = (t: number, layer: number) => {
      const flowSpeed = 0.008 + layer * 0.003;
      return {
        x: Math.sin(t * flowSpeed) * 15 + Math.cos(t * flowSpeed * 1.5) * 10,
        y: Math.cos(t * flowSpeed * 0.9) * 12 + Math.sin(t * flowSpeed * 1.2) * 8
      };
    };

    // Generate detailed blob points with enhanced smoothness
    const generateBlobPoints = (layer: any, t: number, audioBoost: number) => {
      const points = [];
      const segments = layer.segments;
      
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        
        // Enhanced multi-layer spherical noise
        const noise1 = sphericalNoise(
          Math.cos(angle) * 100,
          Math.sin(angle) * 100,
          t * layer.speed,
          layer.noiseScale
        );
        
        const noise2 = sphericalNoise(
          Math.cos(angle) * 160,
          Math.sin(angle) * 160,
          t * layer.speed * 0.7,
          layer.noiseScale * 0.5
        );

        const noise3 = sphericalNoise(
          Math.cos(angle) * 50,
          Math.sin(angle) * 50,
          t * layer.speed * 1.5,
          layer.noiseScale * 1.2
        );

        const combinedNoise = noise1 + noise2 * 0.4 + noise3 * 0.2;
        
        // Enhanced radius with more dynamic variation
        let jumpBoost = jumpState.isJumping ? 1.4 + Math.sin(jumpState.jumpProgress * Math.PI) * 0.6 : 1;
        
        const radiusVariation = layer.baseRadius * audioBoost * jumpBoost + 
                              combinedNoise * 30 + 
                              audioLevel * 25 +
                              Math.sin(t * 0.02 + angle * 3) * 8;
        
        const flowOffset = getFlowOffset(t, i);
        
        const x = orbPosition.x + Math.cos(angle) * radiusVariation + layer.offset.x + flowOffset.x;
        const y = orbPosition.y + Math.sin(angle) * radiusVariation + layer.offset.y + flowOffset.y;
        
        points.push({ x, y, angle });
      }
      
      return points;
    };

    // 🌈 ENHANCED color selection for better variety and vibrancy
    const getLayerColors = (layer: any, t: number, index: number) => {
      // More dynamic color cycling with layer-specific offsets
      const baseColorIndex = (t * 0.008 + layer.colorOffset + audioLevel * 2) % auroraColors.length;
      const jumpColorShift = jumpState.isJumping ? jumpState.jumpProgress * 2 : 0;
      
      // Get multiple colors for rich blending
      const colorIndex1 = Math.floor(baseColorIndex + jumpColorShift) % auroraColors.length;
      const colorIndex2 = Math.floor(baseColorIndex + jumpColorShift + 3) % auroraColors.length;
      const colorIndex3 = Math.floor(baseColorIndex + jumpColorShift + 6) % auroraColors.length;
      
      const color1 = auroraColors[colorIndex1];
      const color2 = auroraColors[colorIndex2];
      const color3 = auroraColors[colorIndex3];
      
      // Enhanced color mixing for richer results
      const mix1 = (baseColorIndex % 1);
      const mix2 = ((baseColorIndex + 3) % 1);
      
      const r = Math.floor(
        color1.r * (1 - mix1) + color2.r * mix1 * 0.7 + color3.r * mix2 * 0.3
      );
      const g = Math.floor(
        color1.g * (1 - mix1) + color2.g * mix1 * 0.7 + color3.g * mix2 * 0.3
      );
      const b = Math.floor(
        color1.b * (1 - mix1) + color2.b * mix1 * 0.7 + color3.b * mix2 * 0.3
      );
      
      return { r, g, b };
    };

    // Enhanced smooth blob drawing with HEAVY BLUR and better blending
    const drawSmoothBlob = (points: any[], layer: any, layerIndex: number, t: number) => {
      if (points.length < 3) return;
      
      ctx.save();
      
      // CRITICAL: Apply heavy blur to the entire drawing context
      ctx.filter = 'blur(8px) saturate(1.4) brightness(1.2)'; // INCREASED BLUR
      
      // Create spherical clipping mask
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2 - 1, 0, Math.PI * 2);
      ctx.clip();
      
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      
      // Enhanced smooth curves with more control points and better smoothing
      for (let i = 0; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[(i + 1) % (points.length - 1)];
        const nextnext = points[(i + 2) % (points.length - 1)];
        const prev = points[i > 0 ? i - 1 : points.length - 2];
        
        // Enhanced control points for smoother curves
        const tension = 0.4; // Curve tension
        const controlX1 = current.x + (next.x - prev.x) * tension;
        const controlY1 = current.y + (next.y - prev.y) * tension;
        const controlX2 = next.x - (nextnext.x - current.x) * tension;
        const controlY2 = next.y - (nextnext.y - current.y) * tension;
        
        ctx.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, next.x, next.y);
      }
      
      ctx.closePath();
      
      // Get vibrant colors for this layer
      const colors = getLayerColors(layer, t, layerIndex);
      
      // Enhanced radial gradient with more stops for smoother blending
      const gradient = ctx.createRadialGradient(
        orbPosition.x, orbPosition.y, 0,
        orbPosition.x, orbPosition.y, layer.baseRadius * 2.5
      );
      
      const baseOpacity = layer.opacity * (0.3 + audioLevel * 0.7);
      const jumpGlow = jumpState.isJumping ? 0.5 : 0;
      const opacity = Math.min(baseOpacity + jumpGlow, 1.0);
      
      // Multi-stop gradient for better depth and smoother blending with VIBRANT COLORS
      gradient.addColorStop(0, `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${opacity})`);
      gradient.addColorStop(0.15, `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${opacity * 0.95})`);
      gradient.addColorStop(0.3, `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${opacity * 0.85})`);
      gradient.addColorStop(0.45, `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${opacity * 0.7})`);
      gradient.addColorStop(0.6, `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${opacity * 0.5})`);
      gradient.addColorStop(0.75, `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${opacity * 0.3})`);
      gradient.addColorStop(0.9, `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${opacity * 0.15})`);
      gradient.addColorStop(1, `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${opacity * 0.05})`);
      
      // Enhanced blending with multiple composition modes
      ctx.globalCompositeOperation = layer.baseRadius < 50 ? 'screen' : 'multiply';
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // CRITICAL: Add multiple blur layers for smoother effect with VIBRANT COLORS
      ctx.globalCompositeOperation = 'screen';
      ctx.strokeStyle = `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${opacity * 0.8})`;
      ctx.lineWidth = 4; // INCREASED line width
      ctx.filter = 'blur(12px) saturate(1.6)'; // HEAVY BLUR for stroke
      ctx.stroke();
      
      // Additional heavy blur layer for ultra-smooth effect
      ctx.globalCompositeOperation = 'soft-light';
      ctx.lineWidth = 8;
      ctx.strokeStyle = `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${opacity * 0.6})`;
      ctx.filter = 'blur(20px) saturate(2.0)'; // ULTRA HEAVY BLUR
      ctx.stroke();
      
      ctx.restore();
    };

    const drawFrame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // CRITICAL: Apply heavy blur to the entire canvas context
      ctx.filter = 'blur(4px) saturate(1.8) brightness(1.3) contrast(1.1)'; // BASE BLUR
      
      time += 1;
      updateOrbPosition();
      
      // Enhanced audio reactivity
      let jumpIntensity = jumpState.isJumping ? 1.3 + Math.sin(jumpState.jumpProgress * Math.PI * 2) * 0.4 : 1;
      const audioBoost = (1 + audioLevel * 0.7) * jumpIntensity;
      
      // Sort layers for proper depth rendering
      const sortedLayers = [...blobLayers].sort((a, b) => b.baseRadius - a.baseRadius);
      
      sortedLayers.forEach((layer, index) => {
        const points = generateBlobPoints(layer, time, audioBoost);
        drawSmoothBlob(points, layer, index, time);
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

      {/* Enhanced detailed spherical orb */}
      <motion.div
        className="relative z-10 mx-4 md:mx-0"
        animate={{ 
          scale: isTapped ? 1.04 : 1,
          y: isAudioPlaying ? [0, -3, 3, 0] : 0
        }}
        transition={{ 
          type: "spring", 
          stiffness: 350, 
          damping: 20,
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        {/* Multi-layered spherical container with enhanced depth */}
        <div className={`relative ${orbSize}`}>
          {/* Primary glass sphere with detailed effects */}
          <div 
            className="absolute inset-0 rounded-full overflow-hidden"
            style={{
              background: `
                radial-gradient(circle at 30% 20%, 
                  rgba(255, 255, 255, 0.4) 0%,
                  rgba(255, 255, 255, 0.25) 15%,
                  rgba(220, 235, 255, 0.2) 30%,
                  rgba(180, 210, 255, 0.15) 45%,
                  rgba(140, 180, 255, 0.1) 60%,
                  rgba(100, 150, 255, 0.08) 75%,
                  rgba(80, 120, 255, 0.05) 90%,
                  transparent 100%),
                radial-gradient(circle at 70% 80%, 
                  rgba(150, 100, 255, 0.15) 0%,
                  rgba(120, 150, 255, 0.1) 30%,
                  transparent 60%),
                linear-gradient(135deg,
                  rgba(255, 255, 255, 0.1) 0%,
                  rgba(200, 220, 255, 0.05) 50%,
                  rgba(150, 180, 255, 0.02) 100%)
              `,
              backdropFilter: 'blur(20px) saturate(1.8) brightness(1.1)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.8) brightness(1.1)',
              boxShadow: `
                0 0 80px rgba(100, 150, 255, 0.4),
                0 0 40px rgba(150, 200, 255, 0.3),
                inset 0 0 80px rgba(255, 255, 255, 0.15),
                inset 0 0 40px rgba(200, 220, 255, 0.1)
              `
            }}
          >
            {/* CRITICAL: Enhanced fluid canvas with HEAVY BLUR filtering */}
            <canvas 
              ref={canvasRef} 
              width={canvasSize} 
              height={canvasSize} 
              className="w-full h-full rounded-full"
              style={{
                filter: 'saturate(1.8) brightness(1.4) contrast(1.2) blur(6px)', // INCREASED BLUR
                opacity: 0.95,
                mixBlendMode: 'screen'
              }}
            />
          </div>

          {/* Enhanced spherical highlights and reflections */}
          <div 
            className="absolute rounded-full pointer-events-none"
            style={{
              top: '8%',
              left: '12%',
              width: '45%',
              height: '35%',
              background: `
                radial-gradient(ellipse 100% 80%, 
                  rgba(255, 255, 255, 0.6) 0%,
                  rgba(255, 255, 255, 0.4) 25%,
                  rgba(240, 250, 255, 0.25) 50%,
                  rgba(220, 235, 255, 0.1) 75%,
                  transparent 100%)
              `,
              filter: 'blur(6px)',
              transform: 'rotate(-25deg)'
            }}
          />

          {/* Secondary highlight for more depth */}
          <div 
            className="absolute rounded-full pointer-events-none"
            style={{
              top: '60%',
              right: '15%',
              width: '25%',
              height: '20%',
              background: `
                radial-gradient(ellipse, 
                  rgba(180, 220, 255, 0.3) 0%,
                  rgba(150, 200, 255, 0.15) 50%,
                  transparent 80%)
              `,
              filter: 'blur(8px)',
              transform: 'rotate(15deg)'
            }}
          />

          {/* Inner rim lighting effect */}
          <div 
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: `
                radial-gradient(circle, 
                  transparent 85%,
                  rgba(255, 255, 255, 0.2) 90%,
                  rgba(200, 220, 255, 0.3) 95%,
                  rgba(150, 180, 255, 0.2) 100%)
              `,
              filter: 'blur(2px)'
            }}
          />

          {/* Dynamic atmospheric glow with audio reactivity */}
          <motion.div 
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{
              boxShadow: [
                `0 0 ${100 + audioLevel * 120}px ${40 + audioLevel * 50}px rgba(100, 255, 100, ${0.35 + audioLevel * 0.45})`,
                `0 0 ${110 + audioLevel * 130}px ${45 + audioLevel * 55}px rgba(200, 100, 255, ${0.3 + audioLevel * 0.4})`,
                `0 0 ${95 + audioLevel * 115}px ${35 + audioLevel * 45}px rgba(80, 220, 150, ${0.4 + audioLevel * 0.5})`,
                `0 0 ${105 + audioLevel * 125}px ${42 + audioLevel * 52}px rgba(150, 200, 255, ${0.32 + audioLevel * 0.42})`
              ]
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Outer atmospheric halo */}
          <motion.div 
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              transform: 'scale(1.3)',
              opacity: 0.6
            }}
            animate={{
              boxShadow: [
                `0 0 ${150 + audioLevel * 80}px ${20 + audioLevel * 30}px rgba(50, 255, 50, ${0.2 + audioLevel * 0.25})`,
                `0 0 ${160 + audioLevel * 90}px ${25 + audioLevel * 35}px rgba(200, 50, 255, ${0.15 + audioLevel * 0.2})`,
                `0 0 ${140 + audioLevel * 75}px ${18 + audioLevel * 28}px rgba(80, 200, 180, ${0.25 + audioLevel * 0.3})`
              ]
            }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>

      {/* Audio elements */}
      <audio ref={scriptAudioRef} src={audioSrc} preload="auto" />
      <audio ref={tapAudioRef} src="/tap-sound.mp3" preload="auto" />

      {/* Enhanced captions with better blur effects */}
      <AnimatePresence mode="wait">
        {captions[step] && (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 30, filter: "blur(15px)", scale: 0.95 }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
            exit={{ opacity: 0, y: -20, filter: "blur(8px)", scale: 1.02 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="absolute bottom-16 w-full px-6 max-w-3xl text-center z-10"
          >
            <div 
              className="relative rounded-2xl p-8 shadow-2xl"
              style={{
                background: `
                  linear-gradient(135deg,
                    rgba(255, 255, 255, 0.25) 0%,
                    rgba(240, 248, 255, 0.2) 50%,
                    rgba(230, 240, 255, 0.15) 100%)
                `,
                backdropFilter: 'blur(25px) saturate(1.4)',
                WebkitBackdropFilter: 'blur(25px) saturate(1.4)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: `
                  0 20px 40px rgba(0, 0, 0, 0.1),
                  0 8px 20px rgba(100, 150, 255, 0.15),
                  inset 0 1px 0 rgba(255, 255, 255, 0.4)
                `
              }}
            >
              <p className="text-lg leading-relaxed text-gray-800 font-medium">
                {captions[step]}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced tap instruction */}
      <motion.div 
        className="absolute bottom-4 text-sm text-gray-600 font-medium z-10"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          textShadow: '0 1px 3px rgba(255, 255, 255, 0.8)'
        }}
      >
        Tap to continue • Watch the orb bounce! 🌟
      </motion.div>
    </div>
  );
};

export default OrbIntro;