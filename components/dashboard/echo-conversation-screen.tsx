"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Mic, Type } from 'lucide-react';
import { MiniOrb } from './mini-orb';

const ECHO_PROMPTS = [
  "What made today different from yesterday?",
  "What moment today do you want to remember?",
  "How did you feel when you woke up this morning?",
  "What conversation stuck with you today?",
  "What surprised you about today?",
  "What are you grateful for right now?",
];

const SAMPLE_TRANSCRIPTION =
  "Today was actually a really interesting day at work. I had this meeting with the design team where we finally cracked the problem we'd been stuck on for weeks. Sarah suggested we flip the whole approach and look at it from the user's perspective instead. It was one of those lightbulb moments where everything just clicked. After that I went for a walk during lunch and noticed the cherry blossoms are starting to bloom. It reminded me of last spring when I first started this job. So much has changed since then.";

const easing = [0.25, 0.46, 0.45, 0.94] as const;

interface EchoConversationScreenProps {
  onBack: () => void;
  onViewReceipt?: () => void;
}

type SessionState = 'idle' | 'listening' | 'processing' | 'saved';

export function EchoConversationScreen({ onBack, onViewReceipt }: EchoConversationScreenProps) {
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [interfaceMode, setInterfaceMode] = useState(false);
  const [promptIndex] = useState(() => Math.floor(Math.random() * ECHO_PROMPTS.length));
  const [showQuestion, setShowQuestion] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState('');
  const transcriptionRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fade in the question after 1 second
  useEffect(() => {
    const t = setTimeout(() => setShowQuestion(true), 1000);
    return () => clearTimeout(t);
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Typing animation for transcription
  useEffect(() => {
    if (sessionState === 'listening' && interfaceMode) {
      const words = SAMPLE_TRANSCRIPTION.split(' ');
      let wordIndex = 0;
      setTranscriptionText('');
      intervalRef.current = setInterval(() => {
        if (wordIndex < words.length) {
          setTranscriptionText(prev => (prev ? prev + ' ' : '') + words[wordIndex]);
          wordIndex++;
        }
      }, 200);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [sessionState, interfaceMode]);

  // Auto-scroll transcription
  useEffect(() => {
    if (transcriptionRef.current) {
      transcriptionRef.current.scrollTop = transcriptionRef.current.scrollHeight;
    }
  }, [transcriptionText]);

  const handleRecord = useCallback(() => {
    if (sessionState === 'idle' || sessionState === 'saved') {
      setSessionState('listening');
      setTranscriptionText('');

      // Auto-stop after 8 seconds
      timerRef.current = setTimeout(() => {
        setSessionState('processing');
        if (intervalRef.current) clearInterval(intervalRef.current);

        // Brief pause, then saved
        timerRef.current = setTimeout(() => {
          setSessionState('saved');
        }, 1500);
      }, 8000);
    } else if (sessionState === 'listening') {
      // Manual stop
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSessionState('processing');
      timerRef.current = setTimeout(() => {
        setSessionState('saved');
      }, 1500);
    }
  }, [sessionState]);

  const handleDone = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSessionState('processing');
    timerRef.current = setTimeout(() => {
      setSessionState('saved');
    }, 1500);
  }, []);

  const currentPrompt = ECHO_PROMPTS[promptIndex];
  const isListening = sessionState === 'listening';
  const isSaved = sessionState === 'saved';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: easing }}
      className="fixed inset-0 z-10 flex flex-col"
    >
      {/* Top bar */}
      <div className="relative z-20 flex justify-between items-center p-4">
        {/* Back button */}
        <button
          onClick={onBack}
          className="glass-button glass-button-sm flex items-center gap-1.5"
          style={{ padding: '8px 16px', fontSize: 13 }}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only">Back</span>
        </button>

        {/* Interface mode toggle */}
        <button
          onClick={() => setInterfaceMode(!interfaceMode)}
          className="glass-button glass-button-sm flex items-center gap-1.5"
          style={{ padding: '8px 14px', fontSize: 13 }}
          aria-label="Toggle interface mode"
        >
          <Type className="h-4 w-4" />
          <span className="text-xs">Aa</span>
        </button>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-4">
        <AnimatePresence mode="wait">
          {!interfaceMode ? (
            /* ===== Full-Screen Mode ===== */
            <motion.div
              key="fullscreen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: easing }}
              className="flex flex-col items-center"
            >
              {/* Echo Avatar — living mini orb */}
              <motion.div
                animate={isSaved ? { y: [0, -2, 0] } : {}}
                transition={isSaved ? { duration: 1.5, ease: 'easeInOut' } : {}}
              >
                <MiniOrb size={200} listening={isListening} saved={isSaved} />
              </motion.div>

              {/* Question / Status text */}
              <AnimatePresence mode="wait">
                {isSaved ? (
                  <motion.p
                    key="saved"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: easing }}
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 300,
                      fontSize: 18,
                      color: '#10b981',
                      textAlign: 'center',
                      maxWidth: 300,
                      marginTop: 32,
                    }}
                  >
                    Memory saved ✓
                  </motion.p>
                ) : (
                  <motion.p
                    key="question"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: showQuestion ? 1 : 0, y: showQuestion ? 0 : 10 }}
                    transition={{ duration: 0.8, ease: easing }}
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 300,
                      fontSize: 18,
                      color: '#475569',
                      textAlign: 'center',
                      maxWidth: 300,
                      marginTop: 32,
                      lineHeight: 1.6,
                    }}
                  >
                    {currentPrompt}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* View Receipt button */}
              <AnimatePresence>
                {isSaved && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: easing, delay: 2 }}
                    onClick={onViewReceipt}
                    className="glass-button glass-button-primary text-button mt-6"
                    style={{ padding: '12px 28px', fontSize: 14 }}
                  >
                    View Receipt
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* ===== Interface Mode ===== */
            <motion.div
              key="interface"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: easing }}
              className="w-full max-w-md flex flex-col items-end gap-4 flex-1"
              style={{ paddingTop: 8, paddingBottom: 120 }}
            >
              {/* Small avatar in top-right — mini orb */}
              <div style={{ flexShrink: 0 }}>
                <MiniOrb size={80} listening={isListening} saved={isSaved} />
              </div>

              {/* Transcription area */}
              <div
                ref={transcriptionRef}
                className="w-full flex-1 overflow-y-auto"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  backdropFilter: 'blur(12px) saturate(1.6)',
                  WebkitBackdropFilter: 'blur(12px) saturate(1.6)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  borderRadius: 20,
                  padding: '20px',
                  boxShadow: '0 4px 24px rgba(0, 0, 20, 0.06), 0 1px 4px rgba(0, 0, 20, 0.04), inset 0 1px 0 0 rgba(255, 255, 255, 0.4)',
                  position: 'relative',
                }}
              >
                {/* Specular highlight */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.4) 15%, rgba(255,255,255,0.7) 35%, rgba(255,255,255,0.7) 65%, rgba(255,255,255,0.4) 85%, transparent 95%)',
                    borderRadius: '20px 20px 0 0',
                    pointerEvents: 'none',
                    zIndex: 2,
                  }}
                />
                {isSaved ? (
                  <p
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 300,
                      fontSize: 15,
                      color: '#10b981',
                      lineHeight: 1.7,
                    }}
                  >
                    Memory saved ✓
                  </p>
                ) : transcriptionText ? (
                  <p
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 300,
                      fontSize: 15,
                      color: '#0f172a',
                      lineHeight: 1.7,
                    }}
                  >
                    {transcriptionText}
                    {isListening && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        style={{ color: '#0ea5e9' }}
                      >
                        |
                      </motion.span>
                    )}
                  </p>
                ) : (
                  <p
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 300,
                      fontSize: 15,
                      color: '#94a3b8',
                      lineHeight: 1.7,
                    }}
                  >
                    {isListening
                      ? 'Listening...'
                      : currentPrompt}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div className="relative z-20 pb-8 pt-4 flex items-center justify-center gap-4">
        {/* Done button (interface mode only, when listening) */}
        <AnimatePresence>
          {interfaceMode && isListening && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: easing }}
              onClick={handleDone}
              className="glass-button glass-button-primary text-button"
              style={{ padding: '12px 24px', fontSize: 14 }}
            >
              Done
            </motion.button>
          )}
        </AnimatePresence>

        {/* Record button */}
        <motion.button
          onClick={handleRecord}
          whileTap={{ scale: 0.95 }}
          disabled={sessionState === 'processing'}
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: isListening
              ? 'rgba(14, 165, 233, 0.15)'
              : 'rgba(14, 165, 233, 0.09)',
            backdropFilter: 'blur(16px) saturate(1.6)',
            WebkitBackdropFilter: 'blur(16px) saturate(1.6)',
            border: '1px solid rgba(255, 255, 255, 0.45)',
            boxShadow: [
              '0 2px 12px rgba(0, 0, 0, 0.06)',
              '0 1px 2px rgba(0, 0, 0, 0.04)',
              'inset 0 1px 0 rgba(255, 255, 255, 0.4)',
              'inset 0 -1px 2px rgba(0, 0, 0, 0.03)',
              isListening ? '0 0 24px rgba(14, 165, 233, 0.3)' : 'none',
            ].filter(Boolean).join(', '),
            cursor: sessionState === 'processing' ? 'not-allowed' : 'pointer',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            opacity: sessionState === 'processing' ? 0.5 : 1,
          }}
        >
          {/* Iridescent rim */}
          <div
            style={{
              position: 'absolute',
              inset: -1,
              borderRadius: '50%',
              background: `conic-gradient(
                from 180deg,
                rgba(14, 165, 233, 0.2),
                rgba(20, 184, 166, 0.15),
                rgba(167, 139, 250, 0.12),
                rgba(244, 114, 182, 0.1),
                rgba(14, 165, 233, 0.2)
              )`,
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude',
              WebkitMaskComposite: 'xor',
              padding: 1.5,
              pointerEvents: 'none',
              opacity: isListening ? 1 : 0.7,
            }}
          />
          {/* Specular top highlight */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '10%',
              right: '10%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
              pointerEvents: 'none',
            }}
          />
          {/* Pulse ring when listening */}
          {isListening && (
            <motion.div
              animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '2px solid rgba(14, 165, 233, 0.4)',
                pointerEvents: 'none',
              }}
            />
          )}
          <Mic
            className="relative z-10"
            style={{
              width: 24,
              height: 24,
              color: isListening ? '#0284c7' : '#0ea5e9',
            }}
          />
        </motion.button>

        {/* View Receipt button (interface mode, saved) */}
        <AnimatePresence>
          {interfaceMode && isSaved && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: easing, delay: 2 }}
              onClick={onViewReceipt}
              className="glass-button glass-button-primary text-button"
              style={{ padding: '12px 24px', fontSize: 14 }}
            >
              View Receipt
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
