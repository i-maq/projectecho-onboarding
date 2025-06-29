"use client";

import React, { useMemo } from 'react';

export const MasterBackground = () => {
  const Particle = () => {
    const style = useMemo(() => ({
      position: 'absolute' as 'absolute', 
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`, 
      width: `${Math.random() * 2 + 1}px`,
      height: `${Math.random() * 2 + 1}px`, 
      backgroundColor: `rgba(0, 0, 50, ${Math.random() * 0.4 + 0.1})`,
      borderRadius: '50%', 
      filter: `blur(${Math.random() > 0.5 ? 1 : 0}px)`,
      animation: `random-float-animation ${Math.random() * 30 + 20}s infinite linear`,
    }), []);
    return <div style={style}></div>;
  };

  const circles = useMemo(() => [
      { delay: '0s', duration: '8s' }, 
      { delay: '2s', duration: '8s' },
      { delay: '4s', duration: '8s' }, 
      { delay: '6s', duration: '8s' },
  ], []);
  
  const particles = useMemo(() => Array.from({ length: 150 }).map((_, i) => <Particle key={i} />), []);

  return (
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
  );
};