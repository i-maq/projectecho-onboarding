"use client";

import React, { useEffect, useRef } from 'react';

// Aurora blob configuration — matches DOM version exactly
const auroraBlobs = [
  { color: [14, 165, 233], x: 0.25, y: 0.30, size: 600, speed: 0.4, phase: 0 },    // sky blue
  { color: [16, 185, 129], x: 0.70, y: 0.60, size: 550, speed: 0.3, phase: 2 },    // emerald
  { color: [20, 184, 166], x: 0.50, y: 0.20, size: 500, speed: 0.35, phase: 4 },   // teal
  { color: [99, 102, 241], x: 0.80, y: 0.40, size: 450, speed: 0.25, phase: 1.5 }, // indigo hint
  { color: [16, 185, 129], x: 0.20, y: 0.70, size: 480, speed: 0.45, phase: 3 },   // emerald 2
];

// Particle configuration — generated once
interface Particle {
  x: number;      // 0-1 normalized
  y: number;      // 0-1 normalized
  size: number;    // px
  color: number[]; // [r, g, b]
  opacity: number;
  speed: number;   // normalized vertical speed per second
  drift: number;   // horizontal drift amount
  phase: number;   // animation phase offset
}

function generateParticles(count: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const isBlue = i < count * 0.6;
    particles.push({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 5 + 1,
      color: isBlue ? [14, 165, 233] : [16, 185, 129],
      opacity: Math.random() * 0.35 + 0.08,
      speed: 1 / (Math.random() * 40 + 18), // inverse of duration = speed
      drift: (Math.random() - 0.5) * 0.02,
      phase: Math.random() * Math.PI * 2,
    });
  }
  return particles;
}


export const AuroraCanvasBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const lastFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Generate particles once
    particlesRef.current = generateParticles(120);

    const dpr = window.devicePixelRatio || 1;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    }
    resize();
    window.addEventListener('resize', resize);

    const MIN_FRAME_INTERVAL = 1000 / 30; // 30fps cap

    function draw(timestamp: number) {
      if (!ctx || !canvas) return;

      // Throttle to 30fps
      if (timestamp - lastFrameRef.current < MIN_FRAME_INTERVAL) {
        animFrameRef.current = requestAnimationFrame(draw);
        return;
      }
      lastFrameRef.current = timestamp;

      const w = canvas.width;
      const h = canvas.height;
      const time = timestamp / 1000;

      // Clear with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.scale(dpr, dpr);

      const vw = w / dpr;
      const vh = h / dpr;

      // --- Draw aurora blobs ---
      // Use 'lighter' composite for soft color blending
      ctx.globalCompositeOperation = 'multiply';
      for (const blob of auroraBlobs) {
        const bx = (blob.x + Math.sin(time * blob.speed + blob.phase) * 0.06) * vw;
        const by = (blob.y + Math.cos(time * blob.speed * 0.7 + blob.phase) * 0.04) * vh;
        const radius = blob.size / 2;

        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, radius);
        grad.addColorStop(0, `rgba(${blob.color[0]}, ${blob.color[1]}, ${blob.color[2]}, 0.18)`);
        grad.addColorStop(0.4, `rgba(${blob.color[0]}, ${blob.color[1]}, ${blob.color[2]}, 0.08)`);
        grad.addColorStop(0.7, `rgba(${blob.color[0]}, ${blob.color[1]}, ${blob.color[2]}, 0)`);
        grad.addColorStop(1, `rgba(${blob.color[0]}, ${blob.color[1]}, ${blob.color[2]}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(bx, by, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- Draw central teal glow ---
      ctx.globalCompositeOperation = 'multiply';
      const cx = vw / 2;
      const cy = vh / 2;
      const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 250);
      glowGrad.addColorStop(0, 'rgba(14, 184, 166, 0.035)');
      glowGrad.addColorStop(0.6, 'rgba(14, 184, 166, 0)');
      glowGrad.addColorStop(1, 'rgba(14, 184, 166, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(cx - 250, cy - 250, 500, 500);


      // --- Draw floating particles ---
      ctx.globalCompositeOperation = 'source-over';
      for (const p of particlesRef.current) {
        // Update particle position (float upward, wrap around)
        p.y -= p.speed * (MIN_FRAME_INTERVAL / 1000);
        p.x += Math.sin(time * 0.5 + p.phase) * 0.0003;

        // Wrap around when particle goes off screen
        if (p.y < -0.05) {
          p.y = 1.05;
          p.x = Math.random();
        }

        const px = p.x * vw;
        const py = p.y * vh;

        // Fade in/out near edges
        let fadeOpacity = p.opacity;
        if (p.y < 0.1) fadeOpacity *= p.y / 0.1;
        if (p.y > 0.9) fadeOpacity *= (1 - p.y) / 0.1;

        if (fadeOpacity > 0.005) {
          const pGrad = ctx.createRadialGradient(px, py, 0, px, py, p.size);
          pGrad.addColorStop(0, `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${fadeOpacity})`);
          pGrad.addColorStop(0.7, `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, 0)`);
          pGrad.addColorStop(1, `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, 0)`);

          ctx.fillStyle = pGrad;
          ctx.beginPath();
          ctx.arc(px, py, p.size + 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(draw);
    }

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};
