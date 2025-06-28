"use client";
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRef, useState } from 'react';
interface WelcomeStepProps {
 onNext: () => void;
 onBack?: () => void;
}
export function WelcomeStep({ onNext, onBack }: WelcomeStepProps) {
 const soundRef = useRef<HTMLAudioElement | null>(null);
 const [clickPulse, setClickPulse] = useState<{ x: number, y: number, key: number } | null>(null);
 const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
   // Set click position for visual effect
   setClickPulse({ x: event.clientX, y: event.clientY, key: Date.now() });
   
   // Play sound
   soundRef.current?.play().catch(e => console.error("Audio play failed:", e));
   
   // Call the onNext function
   setTimeout(() => onNext(), 300);
 };
 
 return (
   <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 overflow-auto">
     {/* Hidden audio element for button click sound */}
     <audio ref={soundRef} src="/tap-sound.mp3" preload="auto" />
     
     {/* Centered logo - made much larger */}
     <motion.div
       initial={{ scale: 0.8, opacity: 0 }}
       animate={{ scale: 1, opacity: 1 }}
       transition={{ duration: 0.5 }}
       className="mb-16"
     >
       <Image 
         src="/projectechologo.png"
         alt="Project Echo Logo"
         width={560}  // Increased from 400 to 560
         height={140} // Increased from 100 to 140
         className="h-auto"
         priority
       />
     </motion.div>
     
     {/* Button directly below logo - made much larger */}
     <motion.div
       initial={{ y: 20, opacity: 0 }}
       animate={{ y: 0, opacity: 1 }}
       transition={{ delay: 0.4, duration: 0.5 }}
     >
       <button 
         onClick={handleClick}
         className="neumorphic-button-light text-button text-xl px-12 py-6"
       >
         Find My Echo
       </button>
     </motion.div>
     
     {/* Click pulse animation */}
     {clickPulse && <div className="click-pulse" style={{ left: clickPulse.x, top: clickPulse.y }} />}
   </div>
 );
}