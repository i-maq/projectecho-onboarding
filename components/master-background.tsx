"use client";

import React, { useMemo, useEffect, useRef } from 'react';

// Aurora blob configuration
const auroraBlobs = [
  { color: "14, 165, 233", x: 25, y: 30, size: 600, speed: 0.4, phase: 0 },    // sky blue
  { color: "16, 185, 129", x: 70, y: 60, size: 550, speed: 0.3, phase: 2 },    // emerald
  { color: "20, 184, 166", x: 50, y: 20, size: 500, speed: 0.35, phase: 4 },   // teal
  { color: "99, 102, 241", x: 80, y: 40, size: 450, speed: 0.25, phase: 1.5 }, // indigo hint
  { color: "16, 185, 129", x: 20, y: 70, size: 480, speed: 0.45, phase: 3 },   // emerald 2
];

// Ripple configuration — 6 concentric ripples
const ripples = Array.from({ length: 6 }, (_, i) => ({
  delay: (i * 20) / 6, // stagger across 20s cycle
  index: i,
}));

export const MasterBackground = () => {
  const blobRefs = useRef<(HTMLDivElement | null)[]>([]);
  const animFrameRef = useRef<number>(0);

  // Animate aurora blobs with sin/cos drift
  useEffect(() => {
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
  }, []);

  // Generate floating particles (120 particles, 60% blue / 40% green)
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
            pointerEvents: 'none',
          }}
        />
      );
    });
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
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
          }}
        />
      ))}

      {/* Concentric ripples — sky blue */}
      {ripples.map(({ delay, index }) => (
        <div
          key={`ripple-${index}`}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) scale(0.02)',
            width: '1200px',
            height: '1200px',
            borderRadius: '50%',
            border: '1.5px solid rgba(14, 165, 233, 0.12)',
            animation: `ripple-expand 20s ${delay}s infinite cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Floating particles */}
      {particles}

      {/* Central ambient teal glow */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(14, 184, 166, 0.035) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* Inline keyframes for ripple animation */}
      <style>{`
        @keyframes ripple-expand {
          0% {
            transform: translate(-50%, -50%) scale(0.02);
            opacity: 0.5;
            border-color: rgba(14, 165, 233, 0.12);
          }
          80% {
            opacity: 0.03;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0;
            border-color: rgba(14, 165, 233, 0);
          }
        }
      `}</style>
    </div>
  );
};
