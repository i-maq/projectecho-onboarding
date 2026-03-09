"use client";

import React, { useMemo, useEffect, useRef, useState } from 'react';
import { AuroraCanvasBackground } from './aurora-canvas-background';

// Aurora blob configuration
const auroraBlobs = [
  { color: "14, 165, 233", x: 25, y: 30, size: 600, speed: 0.4, phase: 0 },    // sky blue
  { color: "16, 185, 129", x: 70, y: 60, size: 550, speed: 0.3, phase: 2 },    // emerald
  { color: "20, 184, 166", x: 50, y: 20, size: 500, speed: 0.35, phase: 4 },   // teal
  { color: "99, 102, 241", x: 80, y: 40, size: 450, speed: 0.25, phase: 1.5 }, // indigo hint
  { color: "16, 185, 129", x: 20, y: 70, size: 480, speed: 0.45, phase: 3 },   // emerald 2
];

// Ripple configuration — 6 concentric ripples
const rippleDelays = [0, 3.33, 6.67, 10, 13.33, 16.67]; // staggered across 20s

export const MasterBackground = () => {
  const blobRefs = useRef<(HTMLDivElement | null)[]>([]);
  const animFrameRef = useRef<number>(0);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  // Detect mobile device — run once on mount
  useEffect(() => {
    const touchDevice =
      window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
      navigator.maxTouchPoints > 0;
    setIsMobile(touchDevice);
  }, []);

  // Animate aurora blobs with sin/cos drift — direct DOM manipulation, zero re-renders
  useEffect(() => {
    if (isMobile !== false) return; // Only run on desktop
    const animate = () => {
      const time = Date.now() / 1000;
      blobRefs.current.forEach((el, i) => {
        if (!el) return;
        const blob = auroraBlobs[i];
        const x = blob.x + Math.sin(time * blob.speed + blob.phase) * 6;
        const y = blob.y + Math.cos(time * blob.speed * 0.7 + blob.phase) * 4;
        el.style.left = `${x}%`;
        el.style.top = `${y}%`;
      });
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isMobile]);

  // Generate floating particles once (120 particles, 60% blue / 40% green)
  const particles = useMemo(() => {
    return Array.from({ length: 120 }, (_, i) => {
      const isBlue = i < 72; // 60% blue
      const color = isBlue ? "14, 165, 233" : "16, 185, 129";
      const size = Math.random() * 5 + 1; // 1-6px
      const opacity = Math.random() * 0.35 + 0.08; // 0.08-0.43
      const duration = Math.random() * 40 + 18; // 18-58s
      const blur = Math.random() * 5 + 1; // 1-6px

      return (
        <div
          key={`particle-${i}`}
          style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${size}px`,
            height: `${size}px`,
            background: `radial-gradient(circle, rgba(${color}, ${opacity}) 0%, transparent 70%)`,
            borderRadius: '50%',
            filter: `blur(${blur}px)`,
            animation: `random-float-animation ${duration}s infinite linear`,
            animationDelay: `${Math.random() * duration}s`,
            pointerEvents: 'none' as const,
            willChange: 'transform, opacity',
          }}
        />
      );
    });
  }, []);

  // While detecting, render nothing (avoids flash)
  if (isMobile === null) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          background: '#ffffff',
        }}
      />
    );
  }

  // Mobile: use canvas-based background (no backdrop-filter flickering)
  if (isMobile) {
    return <AuroraCanvasBackground />;
  }

  // Desktop: use DOM-based background with backdrop-filter interactions
  return (
    <>
      {/* Base layer: white background + aurora blobs + central glow */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          overflow: 'hidden',
          background: '#ffffff',
        }}
      >
        {/* Aurora drifting blobs */}
        {auroraBlobs.map((blob, i) => (
          <div
            key={`blob-${i}`}
            ref={(el) => { blobRefs.current[i] = el; }}
            style={{
              position: 'absolute',
              width: `${blob.size}px`,
              height: `${blob.size}px`,
              left: `${blob.x}%`,
              top: `${blob.y}%`,
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle, rgba(${blob.color}, 0.18) 0%, rgba(${blob.color}, 0.08) 40%, transparent 70%)`,
              filter: 'blur(80px)',
              borderRadius: '50%',
              pointerEvents: 'none',
              willChange: 'left, top',
            }}
          />
        ))}

        {/* Central ambient teal glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(14, 184, 166, 0.035) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Atmosphere layer: particles — no overflow clipping */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {/* Floating particles */}
        {particles}
      </div>

      {/* Concentric ripples — rendered outside overflow:hidden container
          so they can expand fully without being clipped */}
      {rippleDelays.map((delay, index) => (
        <div
          key={`ripple-${index}`}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            width: '1200px',
            height: '1200px',
            borderRadius: '50%',
            border: '1.5px solid rgba(14, 165, 233, 0.25)',
            background: 'transparent',
            boxShadow: 'none',
            animation: `ripple-expand 20s ${delay}s infinite cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
            pointerEvents: 'none',
            zIndex: 1,
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </>
  );
};
