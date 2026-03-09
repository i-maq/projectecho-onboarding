"use client";

import React, { useRef, useEffect } from 'react';

// Simplified aurora palette: sky blue, teal, emerald
const orbColors = [
  { r: 14, g: 165, b: 233 },   // sky blue
  { r: 56, g: 189, b: 248 },   // light sky
  { r: 20, g: 184, b: 166 },   // teal
  { r: 16, g: 185, b: 129 },   // emerald
];

interface MiniOrbProps {
  size: number;
  listening?: boolean;
  saved?: boolean;
}

export function MiniOrb({ size, listening = false, saved = false }: MiniOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    let time = 0;
    const cx = size / 2;
    const cy = size / 2;

    // 4 blob layers
    const layers = [
      { baseRadius: size * 0.38, segments: 24, speed: 0.012, noiseScale: 0.7, colorPhase: 0, opacity: 0.7 },
      { baseRadius: size * 0.30, segments: 20, speed: 0.018, noiseScale: 1.0, colorPhase: 1.5, opacity: 0.8 },
      { baseRadius: size * 0.42, segments: 28, speed: 0.008, noiseScale: 0.5, colorPhase: 3.0, opacity: 0.6 },
      { baseRadius: size * 0.22, segments: 16, speed: 0.025, noiseScale: 1.3, colorPhase: 4.5, opacity: 0.9 },
    ];

    const noise = (x: number, y: number, t: number, scale: number) => {
      const r = Math.sqrt(x * x + y * y) * 0.01;
      const theta = Math.atan2(y, x);
      const n1 = Math.sin(r * scale * Math.PI + t) * Math.cos(theta * scale * 1.3 + t * 0.7);
      const n2 = Math.sin(r * scale * 1.4 + t * 1.2) * Math.cos(theta * scale * 0.8 + t * 0.9);
      return (n1 + n2 * 0.6) / 1.6;
    };

    const getColor = (phase: number, t: number) => {
      const idx = (t * 0.0015 + phase) % orbColors.length;
      const i1 = Math.floor(idx);
      const i2 = (i1 + 1) % orbColors.length;
      const f = idx - i1;
      const ef = f * f * (3 - 2 * f); // smoothstep
      const c1 = orbColors[i1];
      const c2 = orbColors[i2];
      return {
        r: Math.round(c1.r + (c2.r - c1.r) * ef),
        g: Math.round(c1.g + (c2.g - c1.g) * ef),
        b: Math.round(c1.b + (c2.b - c1.b) * ef),
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, size, size);

      // Clip to circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, size / 2 - 0.5, 0, Math.PI * 2);
      ctx.clip();

      time += 1;

      // Breathing scale
      const breathCycle = listening ? 2 : 4;
      const breathMin = listening ? 0.92 : 0.97;
      const breathMax = listening ? 1.08 : 1.03;
      const breathPhase = (time / 60) * (Math.PI * 2 / breathCycle);
      const breathScale = breathMin + (breathMax - breathMin) * (0.5 + 0.5 * Math.sin(breathPhase));

      // Color cycle speed boost when listening
      const colorSpeed = listening ? 3 : 1;

      // Draw layers back to front (largest first)
      const sorted = [...layers].sort((a, b) => b.baseRadius - a.baseRadius);
      for (const layer of sorted) {
        const points: { x: number; y: number }[] = [];
        for (let i = 0; i <= layer.segments; i++) {
          const angle = (i / layer.segments) * Math.PI * 2;
          const nx = Math.cos(angle) * 100;
          const ny = Math.sin(angle) * 100;
          const n = noise(nx, ny, time * layer.speed, layer.noiseScale);
          const r = layer.baseRadius * breathScale + n * size * 0.12;
          points.push({
            x: cx + Math.cos(angle) * r,
            y: cy + Math.sin(angle) * r,
          });
        }

        // Draw smooth blob
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 0; i < points.length - 1; i++) {
          const curr = points[i];
          const next = points[(i + 1) % (points.length - 1)];
          const nextnext = points[(i + 2) % (points.length - 1)];
          const prev = points[i > 0 ? i - 1 : points.length - 2];
          const tension = 0.4;
          ctx.bezierCurveTo(
            curr.x + (next.x - prev.x) * tension,
            curr.y + (next.y - prev.y) * tension,
            next.x - (nextnext.x - curr.x) * tension,
            next.y - (nextnext.y - curr.y) * tension,
            next.x,
            next.y,
          );
        }
        ctx.closePath();

        const color = getColor(layer.colorPhase, time * colorSpeed);
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, layer.baseRadius * 2);
        const op = layer.opacity;
        gradient.addColorStop(0, `rgba(${color.r},${color.g},${color.b},${op})`);
        gradient.addColorStop(0.4, `rgba(${color.r},${color.g},${color.b},${op * 0.7})`);
        gradient.addColorStop(0.7, `rgba(${color.r},${color.g},${color.b},${op * 0.35})`);
        gradient.addColorStop(1, `rgba(${color.r},${color.g},${color.b},${op * 0.05})`);

        ctx.globalCompositeOperation = layer.baseRadius < size * 0.25 ? 'screen' : 'multiply';
        ctx.filter = 'blur(6px) saturate(1.4) brightness(1.2)';
        ctx.fillStyle = gradient;
        ctx.fill();

        // Glow edge
        ctx.globalCompositeOperation = 'screen';
        ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},${op * 0.5})`;
        ctx.lineWidth = 3;
        ctx.filter = 'blur(10px) saturate(1.6)';
        ctx.stroke();
      }

      ctx.restore();
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [size, listening, saved]);

  const glowColor = saved
    ? '0 0 40px rgba(16, 185, 129, 0.25), 0 0 20px rgba(16, 185, 129, 0.15)'
    : listening
      ? '0 0 40px rgba(14, 165, 233, 0.25), 0 0 20px rgba(14, 165, 233, 0.15)'
      : '0 0 30px rgba(14, 165, 233, 0.1)';

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(12px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(12px) saturate(1.6)',
        border: '1px solid rgba(255, 255, 255, 0.35)',
        boxShadow: `0 4px 24px rgba(0,0,20,0.06), 0 1px 4px rgba(0,0,20,0.04), inset 0 1px 0 0 rgba(255,255,255,0.4), ${glowColor}`,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          display: 'block',
        }}
      />
      {/* Specular top highlight */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background:
            'linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.4) 15%, rgba(255,255,255,0.7) 35%, rgba(255,255,255,0.7) 65%, rgba(255,255,255,0.4) 85%, transparent 95%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />
      {/* Spherical rim light */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, transparent 75%, rgba(255,255,255,0.15) 90%, rgba(255,255,255,0.25) 100%)',
          pointerEvents: 'none',
          zIndex: 3,
        }}
      />
    </div>
  );
}
