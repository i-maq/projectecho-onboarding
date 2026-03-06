"use client";
import { motion } from 'motion/react';
import Image from 'next/image';
import { useRef, useState } from 'react';
interface WelcomeStepProps {
 onNext: () => void;
 onBack?: () => void;
}
export function WelcomeStep({ onNext, onBack }: WelcomeStepProps) {
 const soundRef = useRef<HTMLAudioElement | null>(null);
 const [clickPulse, setClickPulse] = useState<{ x: number, y: number, key: number } | null>(null);
 const handleClick = (event: React.MouseEvent<HTMLButtonElement | HTMLImageElement>) => {
   // Set click position for visual effect
   setClickPulse({ x: event.clientX, y: event.clientY, key: Date.now() });
   
   // Play sound
   soundRef.current?.play().catch(e => console.error("Audio play failed:", e));
   
   // Call the onNext function
   setTimeout(() => onNext(), 300);
 };
 
 return (
   <div className="absolute inset-0 flex items-center justify-center">
     {/* Hidden audio element for button click sound */}
     <audio ref={soundRef} src="/tap-sound.mp3" preload="auto" />
     
     {/* Centered logo - made much larger */}
     <motion.div
       animate={{ scale: [0.95, 1, 0.95] }}
       transition={{ duration: 2, repeat: Infinity }}
     >
       <Image 
         src="/projectechologo.png"
         alt="Project Echo Logo"
         width={560}  // Increased from 400 to 560
         height={140} // Increased from 100 to 140
         className="h-auto w-80 sm:w-auto cursor-pointer"
         priority
         onClick={(e) => handleClick(e as unknown as React.MouseEvent<HTMLImageElement>)}
       />
     </motion.div>
     
     {/* Click pulse animation */}
     {clickPulse && <div className="click-pulse" style={{ left: clickPulse.x, top: clickPulse.y }} />}
   </div>
 );
}