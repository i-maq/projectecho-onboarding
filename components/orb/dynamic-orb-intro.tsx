"use client";
import React, { useRef, useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DynamicOrbIntroProps {
  onAdvance: () => void;
}

// Updated caption system matching your new script
const captionSections = [
  {
    audioFile: "ob-vo-1.mp3",
    text: "Think of who you are right now, in this moment.",
    duration: 12 // seconds
  },
  {
    audioFile: "ob-vo-2.mp3", 
    text: "You are not a single, solid thing.",
    duration: 3
  },
  {
    audioFile: "ob-vo-3.mp3",
    text: "You are a symphony of all the moments that came before.",
    duration: 4
  },
  {
    audioFile: "ob-vo-4.mp3",
    text: "Your courage today is an echo of a time you were scared, and pushed through anyway.",
    duration: 5
  },
  {
    audioFile: "ob-vo-5.mp3",
    text: "Your laughter is an echo of a thousand jokes shared with friends.",
    duration: 5
  },
  {
    audioFile: "ob-vo-6.mp3",
    text: "Your wisdom is an echo of mistakes made, and lessons learned.",
    duration: 5
  },
  {
    audioFile: "ob-vo-7.mp3",
    text: "An echo is not a distant, faded copy. It proves you are there.",
    duration: 6
  },
  {
    audioFile: "ob-vo-8.mp3",
    text: "Here, you will become your echo for your future self to hear.",
    duration: 5
  }
];

export const DynamicOrbIntro: React.FC<DynamicOrbIntroProps> = ({ onAdvance }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const tapAudioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  
  const [step, setStep] = useState(0);
  const [isTapped, setIsTapped] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [audioError, setAudioError] = useState(false);
  
  // FIXED: Word highlighting now syncs with actual audio playback
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // Mobile detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Enhanced background particles with depth layers
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

  const particleCount = useMemo(() => {
    return isMobile ? 150 : 300;
  }, [isMobile]);

  const particles = useMemo(() => 
    Array.from({ length: particleCount }).map((_, i) => <Particle key={i} />), 
    [particleCount, isMobile]
  );

  // Aurora borealis color palette with smooth gradients
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
    { r: 255, g: 150, b: 0 },     // Orange
    { r: 255, g: 200, b: 100 },   // Warm yellow
  ];

  // Initialize audio analysis
  const initAudioAnalysis = async () => {
    if (!audioRef.current) return;
    
    // Prevent duplicate initialization
    if (audioContextRef.current) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaElementSource(audioRef.current);
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

  // Audio level monitoring for real-time orb reactivity
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

  // FIXED: Real-time audio-synced word highlighting
  useEffect(() => {
    if (!isAudioPlaying || audioError || !audioRef.current) return;

    const currentSection = captionSections[step];
    if (!currentSection) return;

    const words = currentSection.text.split(' ');

    const updateWordHighlight = () => {
      if (!audioRef.current) return;
      
      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration || currentSection.duration;
      
      // Calculate which word should be highlighted based on actual audio position
      const progress = currentTime / duration;
      const wordIndex = Math.floor(progress * words.length);
      
      // Ensure we don't go beyond the word count
      const clampedIndex = Math.min(wordIndex, words.length - 1);
      
      if (clampedIndex !== currentWordIndex && clampedIndex >= 0) {
        setCurrentWordIndex(clampedIndex);
      }
    };

    // Update word highlighting every 100ms for smooth sync
    const interval = setInterval(updateWordHighlight, 100);

    return () => clearInterval(interval);
  }, [isAudioPlaying, step, currentWordIndex, audioError]);

  // Enhanced Siri-like fluid orb animation with 3D spherical movement
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const orbPosition = { x: canvas.width / 2, y: canvas.height / 2 };
    const targetPosition = { x: canvas.width / 2, y: canvas.height / 2 };
    
    const jumpState = {
      isJumping: false,
      jumpProgress: 0,
      jumpStartTime: 0,
    };
    
    const jumpDuration = 0.8;

    const generateSphericalTarget = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxRadius = Math.min(canvas.width, canvas.height) * 0.35;
      
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      const radius = Math.random() * maxRadius;
      const x = centerX + radius * Math.sin(phi) * Math.cos(theta);
      const y = centerY + radius * Math.sin(phi) * Math.sin(theta) * 0.8;
      
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

    (window as any).orbJump = jumpToRandomPosition;

    // Enhanced blob layers for detailed fluid effect
    const blobLayers = [
      {
        baseRadius: 75,
        segments: 32,
        speed: 0.012,
        noiseScale: 0.8,
        opacity: 0.9,
        offset: { x: 0, y: 0 },
        colorPhase: 0
      },
      {
        baseRadius: 60,
        segments: 28,
        speed: 0.018,
        noiseScale: 1.1,
        opacity: 0.8,
        offset: { x: 6, y: -4 },
        colorPhase: 1.2
      },
      {
        baseRadius: 85,
        segments: 36,
        speed: 0.009,
        noiseScale: 0.6,
        opacity: 0.7,
        offset: { x: -5, y: 3 },
        colorPhase: 2.8
      },
      {
        baseRadius: 45,
        segments: 24,
        speed: 0.024,
        noiseScale: 1.4,
        opacity: 0.95,
        offset: { x: 2, y: 6 },
        colorPhase: 4.5
      },
      {
        baseRadius: 95,
        segments: 40,
        speed: 0.006,
        noiseScale: 0.4,
        opacity: 0.6,
        offset: { x: 0, y: 0 },
        colorPhase: 5.7
      },
      {
        baseRadius: 35,
        segments: 20,
        speed: 0.030,
        noiseScale: 1.8,
        opacity: 1.0,
        offset: { x: 4, y: -2 },
        colorPhase: 7.1
      }
    ];

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

    const generateBlobPoints = (layer: any, t: number, audioBoost: number) => {
      const points = [];
      const segments = layer.segments;
      
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        
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

    const smoothColorInterpolation = (color1: any, color2: any, factor: number) => {
      const easedFactor = factor * factor * (3 - 2 * factor);
      
      return {
        r: Math.round(color1.r + (color2.r - color1.r) * easedFactor),
        g: Math.round(color1.g + (color2.g - color1.g) * easedFactor),
        b: Math.round(color1.b + (color2.b - color1.b) * easedFactor)
      };
    };

    const getLayerColors = (layer: any, t: number, index: number) => {
      const colorTime = t * 0.0015 + layer.colorPhase;
      
      const jumpInfluence = jumpState.isJumping ? 
        Math.sin(jumpState.jumpProgress * Math.PI) * 0.3 : 0;
      
      const audioInfluence = audioLevel * 0.8;
      
      const colorPosition = colorTime + jumpInfluence + audioInfluence;
      
      const colorIndex1 = colorPosition % auroraColors.length;
      const colorIndex2 = (colorPosition + 3) % auroraColors.length;
      const colorIndex3 = (colorPosition + 6) % auroraColors.length;
      
      const baseIndex1 = Math.floor(colorIndex1);
      const baseIndex2 = Math.floor(colorIndex2);
      const baseIndex3 = Math.floor(colorIndex3);
      const fraction1 = colorIndex1 - baseIndex1;
      const fraction2 = colorIndex2 - baseIndex2;
      const fraction3 = colorIndex3 - baseIndex3;
      
      const color1a = auroraColors[baseIndex1 % auroraColors.length];
      const color1b = auroraColors[(baseIndex1 + 1) % auroraColors.length];
      const color2a = auroraColors[baseIndex2 % auroraColors.length];
      const color2b = auroraColors[(baseIndex2 + 1) % auroraColors.length];
      const color3a = auroraColors[baseIndex3 % auroraColors.length];
      const color3b = auroraColors[(baseIndex3 + 1) % auroraColors.length];
      
      const interpolatedColor1 = smoothColorInterpolation(color1a, color1b, fraction1);
      const interpolatedColor2 = smoothColorInterpolation(color2a, color2b, fraction2);
      const interpolatedColor3 = smoothColorInterpolation(color3a, color3b, fraction3);
      
      const primaryWeight = 0.6;
      const secondaryWeight = 0.25;
      const tertiaryWeight = 0.15;
      
      const finalColor = {
        r: Math.round(
          interpolatedColor1.r * primaryWeight + 
          interpolatedColor2.r * secondaryWeight + 
          interpolatedColor3.r * tertiaryWeight
        ),
        g: Math.round(
          interpolatedColor1.g * primaryWeight + 
          interpolatedColor2.g * secondaryWeight + 
          interpolatedColor3.g * tertiaryWeight
        ),
        b: Math.round(
          interpolatedColor1.b * primaryWeight + 
          interpolatedColor2.b * secondaryWeight + 
          interpolatedColor3.b * tertiaryWeight
        )
      };
      
      return finalColor;
    };

    const drawSmoothBlob = (points: any[], layer: any, layerIndex: number, t: number) => {
      if (points.length < 3) return;
      
      ctx.save();
      
      ctx.filter = 'blur(8px) saturate(1.4) brightness(1.2)';
      
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2 - 1, 0, Math.PI * 2);
      ctx.clip();
      
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      
      for (let i = 0; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[(i + 1) % (points.length - 1)];
        const nextnext = points[(i + 2) % (points.length - 1)];
        const prev = points[i > 0 ? i - 1 : points.length - 2];
        
        const tension = 0.4;
        const controlX1 = current.x + (next.x - prev.x) * tension;
        const controlY1 = current.y + (next.y - prev.y) * tension;
        const controlX2 = next.x - (nextnext.x - current.x) * tension;
        const controlY2 = next.y - (nextnext.y - current.y) * tension;
        
        ctx.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, next.x, next.y);
      }
      
      ctx.closePath();
      
      const colors = getLayerColors(layer, t, layerIndex);
      
      const gradient = ctx.createRadialGradient(
        orbPosition.x, orbPosition.y, 0,
        orbPosition.x, orbPosition.y, layer.baseRadius * 2.5
      );
      
      const baseOpacity = layer.opacity * (0.3 + audioLevel * 0.7);
      const jumpGlow = jumpState.isJumping ? 0.5 : 0;
      const opacity = Math.min(baseOpacity + jumpGlow, 1.0);
      
      gradient.addColorStop(0, `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${opacity})`);
      gradient.addColorStop(0.15, `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${opacity * 0.95})`);
      gradient.addColorStop(0.3, `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${opacity * 0.85})`);
      gradient.addColorStop(0.45, `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${opacity * 0.7})`);
      gradient.addColorStop(0.6, `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${opacity * 0.5})`);
      gradient.addColorStop(0.75, `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${opacity * 0.3})`);
      gradient.addColorStop(0.9, `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${opacity * 0.15})`);
      gradient.addColorStop(1, `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${opacity * 0.05})`);
      
      ctx.globalCompositeOperation = layer.baseRadius < 50 ? 'screen' : 'multiply';
      ctx.fillStyle = gradient;
      ctx.fill();
      
      ctx.globalCompositeOperation = 'screen';
      ctx.strokeStyle = `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${opacity * 0.8})`;
      ctx.lineWidth = 4;
      ctx.filter = 'blur(12px) saturate(1.6)';
      ctx.stroke();
      
      ctx.globalCompositeOperation = 'soft-light';
      ctx.lineWidth = 8;
      ctx.strokeStyle = `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${opacity * 0.6})`;
      ctx.filter = 'blur(20px) saturate(2.0)';
      ctx.stroke();
      
      ctx.restore();
    };

    const drawFrame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.filter = 'blur(4px) saturate(1.8) brightness(1.3) contrast(1.1)';
      
      time += 1;
      updateOrbPosition();
      
      let jumpIntensity = jumpState.isJumping ? 1.3 + Math.sin(jumpState.jumpProgress * Math.PI * 2) * 0.4 : 1;
      const audioBoost = (1 + audioLevel * 0.7) * jumpIntensity;
      
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
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      setIsAudioPlaying(true);
      setAudioError(false);
      setCurrentWordIndex(0); // Reset to first word when audio starts
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };

    const handlePause = () => setIsAudioPlaying(false);
    
    const handleEnded = () => {
      setIsAudioPlaying(false);
      // Auto-advance to next section when audio ends
      if (step < captionSections.length - 1) {
        setTimeout(() => setStep(step + 1), 500); // Brief pause between sections
      }
    };

    const handleError = () => {
      console.log(`Audio file not found: ${captionSections[step]?.audioFile}`);
      setAudioError(true);
      setIsAudioPlaying(false);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [step]);

  // Initialize audio analysis when audio is loaded
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => {
      initAudioAnalysis();
    };

    audio.addEventListener('canplaythrough', handleCanPlay);
    return () => audio.removeEventListener('canplaythrough', handleCanPlay);
  }, []);

  // Load and play current audio section
  useEffect(() => {
    const currentSection = captionSections[step];
    if (currentSection && currentSection.audioFile && audioRef.current) {
      audioRef.current.src = `/audio/onboarding/${currentSection.audioFile}`;
      audioRef.current.load();
      
      // Reset word highlighting for new section
      setCurrentWordIndex(0);
      
      // Play after a short delay to ensure it's loaded
      setTimeout(() => {
        audioRef.current?.play().catch((error) => {
          console.log(`Could not play audio: ${currentSection.audioFile}`, error);
          setAudioError(true);
        });
      }, 200);
    }
  }, [step]);

  // Ambient background music (very low volume)
  useEffect(() => {
    const bg = new Audio("/ambient-music.mp3");
    bg.loop = true;
    bg.volume = 0.05; // Very low volume to not interfere with voice
    bg.play().catch(() => {});
    return () => { bg.pause(); };
  }, []);

  const handleTap = () => {
    // Trigger orb jump animation
    if ((window as any).orbJump) {
      (window as any).orbJump();
    }
    
    // Visual feedback
    setIsTapped(true);
    setTimeout(() => setIsTapped(false), 300);
    
    // Tap sound effect
    if (tapAudioRef.current) {
      tapAudioRef.current.currentTime = 0;
      tapAudioRef.current.play();
    }
    
    // Advance or finish
    if (step < captionSections.length - 1) {
      setStep(step + 1);
    } else {
      onAdvance();
    }
  };

  // FIXED: Render words with REAL audio-synced highlighting
  const renderHighlightedText = () => {
    const currentSection = captionSections[step];
    if (!currentSection) return '';

    const words = currentSection.text.split(' ');
    
    return words.map((word, index) => (
      <span
        key={index}
        className={`word-highlight ${index === currentWordIndex ? 'active-word' : ''}`}
        style={{
          transition: 'all 0.2s ease-in-out',
          ...(index === currentWordIndex ? {
            transform: 'scale(1.08)',
            textShadow: `
              0 0 8px rgba(139, 92, 246, 0.6),
              0 0 16px rgba(139, 92, 246, 0.4),
              0 0 24px rgba(139, 92, 246, 0.2)
            `,
            fontWeight: '600',
            color: '#8B5CF6'
          } : {})
        }}
      >
        {word}
        {index < words.length - 1 && ' '}
      </span>
    ));
  };

  // Get current caption
  const currentCaption = captionSections[step] ? captionSections[step].text : '';

  // Responsive sizing
  const orbSize = isMobile ? 'w-64 h-64' : 'w-96 h-96';
  const canvasSize = isMobile ? 256 : 384;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-[#f0f2f5] cursor-pointer overflow-hidden"
      onClick={handleTap}
    >
      {/* Enhanced background particles with depth */}
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
        {/* Multi-layered spherical container with glass effects */}
        <div className={`relative ${orbSize}`}>
          {/* Primary glass sphere with detailed gradients */}
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
            {/* Enhanced fluid canvas with heavy blur */}
            <canvas 
              ref={canvasRef} 
              width={canvasSize} 
              height={canvasSize} 
              className="w-full h-full rounded-full"
              style={{
                filter: 'saturate(1.8) brightness(1.4) contrast(1.2) blur(6px)',
                opacity: 0.95,
                mixBlendMode: 'screen'
              }}
            />
          </div>

          {/* Spherical highlights and reflections */}
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

          {/* Gradually shifting atmospheric glow - enhanced with audio reactivity */}
          <motion.div 
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{
              boxShadow: [
                `0 0 ${100 + audioLevel * 120}px ${40 + audioLevel * 50}px rgba(100, 255, 100, ${0.35 + audioLevel * 0.45})`,
                `0 0 ${110 + audioLevel * 130}px ${45 + audioLevel * 55}px rgba(150, 200, 255, ${0.3 + audioLevel * 0.4})`,
                `0 0 ${105 + audioLevel * 125}px ${42 + audioLevel * 52}px rgba(200, 100, 255, ${0.32 + audioLevel * 0.42})`,
                `0 0 ${95 + audioLevel * 115}px ${35 + audioLevel * 45}px rgba(80, 220, 150, ${0.4 + audioLevel * 0.5})`
              ]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div 
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              transform: 'scale(1.3)',
              opacity: 0.6
            }}
            animate={{
              boxShadow: [
                `0 0 ${150 + audioLevel * 80}px ${20 + audioLevel * 30}px rgba(50, 255, 50, ${0.2 + audioLevel * 0.25})`,
                `0 0 ${155 + audioLevel * 85}px ${22 + audioLevel * 32}px rgba(100, 200, 255, ${0.18 + audioLevel * 0.22})`,
                `0 0 ${160 + audioLevel * 90}px ${25 + audioLevel * 35}px rgba(200, 50, 255, ${0.15 + audioLevel * 0.2})`,
                `0 0 ${145 + audioLevel * 82}px ${19 + audioLevel * 29}px rgba(80, 200, 180, ${0.22 + audioLevel * 0.28})`
              ]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>

      {/* Audio elements */}
      <audio ref={audioRef} preload="auto" />
      <audio ref={tapAudioRef} src="/tap-sound.mp3" preload="auto" />

      {/* STATIC Caption Container with AUDIO-SYNCED Word Highlighting */}
      {currentCaption && (
        <div className="absolute bottom-16 w-full px-6 max-w-3xl text-center z-10">
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
            <p className="text-lg leading-relaxed text-gray-800 font-light text-body">
              {renderHighlightedText()}
            </p>
            
            {/* Audio status indicator */}
            {audioError && (
              <div className="mt-3 text-sm text-amber-600 font-medium">
                Audio file not found - using visual-only mode
              </div>
            )}
            
            {/* Progress indicator */}
            <div className="mt-4 flex justify-center">
              <div className="flex space-x-2">
                {captionSections.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === step 
                        ? 'bg-purple-500 w-6' 
                        : index < step 
                        ? 'bg-purple-300' 
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced tap instruction */}
      <motion.div 
        className="absolute bottom-4 text-sm text-gray-600 font-light z-10 text-caption"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          textShadow: '0 1px 3px rgba(255, 255, 255, 0.8)'
        }}
      >
        {step < captionSections.length - 1 ? 'Tap to continue' : 'Tap to begin your journey'} • Step {step + 1} of {captionSections.length} ✨
      </motion.div>
    </div>
  );
};

export default DynamicOrbIntro;