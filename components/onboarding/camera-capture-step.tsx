"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Check, AlertCircle, Loader2, Camera, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { GlassCard } from '@/components/ui/glass-card';
import { EchoButton } from '@/components/ui/echo-button';
import { LottieIcon } from '@/components/ui/lottie-icon';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface CameraCaptureStepProps {
  personalData: any;
  onComplete: (photoData: string) => void;
  onBack: () => void;
  onSkip: () => void;
}

export function CameraCaptureStep({ personalData, onComplete, onBack, onSkip }: CameraCaptureStepProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isComponentReady, setIsComponentReady] = useState(false);
  const [faceIdAnimation, setFaceIdAnimation] = useState<any>(null);

  useEffect(() => {
    fetch('/wired-outline-1376-face-id-hover-scanning.json')
      .then(res => res.ok ? res.json() : null)
      .then(data => data && setFaceIdAnimation(data))
      .catch(() => {});
  }, []);

  const waitForVideoReady = (videoElement: HTMLVideoElement): Promise<void> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Video failed to initialize')), 10000);
      const check = () => {
        if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) { clearTimeout(timeout); resolve(); }
        else setTimeout(check, 100);
      };
      check();
    });
  };

  const startCamera = useCallback(async () => {
    if (!videoRef.current) {
      let attempts = 0;
      while (!videoRef.current && attempts < 10) { await new Promise(r => setTimeout(r, 100)); attempts++; }
      if (!videoRef.current) { setError('Video element could not be initialized. Please refresh.'); return; }
    }
    setIsLoading(true);
    try {
      setError(null);
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera API not supported');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } });
      if (!videoRef.current) throw new Error('Video element became unavailable');
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      videoRef.current.onloadedmetadata = async () => {
        try {
          if (videoRef.current) { await videoRef.current.play(); await waitForVideoReady(videoRef.current); setIsCameraActive(true); setIsLoading(false); }
        } catch {
          if (videoRef.current) { try { await waitForVideoReady(videoRef.current); setIsCameraActive(true); setIsLoading(false); } catch { setError('Camera failed to initialize.'); setIsLoading(false); } }
        }
      };
    } catch (err: any) {
      setIsLoading(false);
      let msg = 'Unable to access camera. ';
      if (err.name === 'NotAllowedError') msg += 'Please allow camera permissions.';
      else if (err.name === 'NotFoundError') msg += 'No camera found.';
      else msg += err.message || 'Unknown error.';
      setError(msg);
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraActive(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    if (!context || video.videoWidth === 0) { toast.error('Camera not ready.'); return; }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setCapturedPhoto(canvas.toDataURL('image/jpeg', 0.8));
    stopCamera();
  }, [stopCamera]);

  const retakePhoto = useCallback(() => { setCapturedPhoto(null); setTimeout(() => startCamera(), 100); }, [startCamera]);

  const handleConfirmPhoto = async () => {
    if (!capturedPhoto) return;
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ ...personalData, photoData: capturedPhoto }),
        });
      }
      await new Promise(r => setTimeout(r, 1500));
      localStorage.setItem('userPhoto', capturedPhoto);
      toast.success('Your Echo avatar is being created!');
      onComplete(capturedPhoto);
    } catch (error) {
      console.error('Error processing photo:', error);
      toast.error('Failed to process your photo.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const check = () => { if (videoRef.current) setIsComponentReady(true); else setTimeout(check, 100); };
    setTimeout(check, 200);
  }, []);

  useEffect(() => { return () => { stopCamera(); }; }, [stopCamera]);

  return (
    <div className="w-full h-full flex items-center justify-center px-6 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-2xl mx-auto"
      >
        <GlassCard className="text-center">
          <motion.div className="flex justify-center mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
            <div className="w-20 h-20 bg-echo-gradient rounded-2xl flex items-center justify-center shadow-echo-glow">
              {faceIdAnimation ? <LottieIcon animationData={faceIdAnimation} size={80} /> : <Camera className="h-10 w-10 text-white" />}
            </div>
          </motion.div>

          <h2 className="text-3xl font-extrabold mb-3 text-echo-text-primary">Create Your Echo</h2>
          <p className="text-echo-text-secondary mb-8 max-w-lg mx-auto">
            {personalData?.firstName}, let&apos;s capture your likeness to create your Echo avatar.
          </p>

          <div className="relative">
            {!isCameraActive && !capturedPhoto && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="w-80 h-60 glass-panel rounded-2xl flex items-center justify-center mx-auto border-2 border-dashed border-echo-purple-200">
                  <div className="text-center">
                    {isLoading ? (
                      <><LoadingSpinner size="lg" /><p className="text-echo-text-muted mt-4">Starting camera...</p></>
                    ) : (
                      <><Camera className="h-16 w-16 text-echo-text-muted mx-auto mb-4" /><p className="text-echo-text-muted">Camera preview will appear here</p></>
                    )}
                  </div>
                </div>
                {error && (
                  <GlassCard className="!p-4 max-w-md mx-auto">
                    <div className="flex items-center"><AlertCircle className="h-5 w-5 text-echo-error mr-2 flex-shrink-0" /><p className="text-echo-error text-sm">{error}</p></div>
                  </GlassCard>
                )}
                <div className="flex justify-center">
                  <EchoButton variant="primary" onClick={() => { if (!isComponentReady) { toast.error('Please wait.'); return; } startCamera(); }} disabled={isProcessing || isLoading || !isComponentReady}>
                    {isLoading || !isComponentReady ? <><Loader2 className="h-5 w-5 mr-2 animate-spin inline" />{isLoading ? 'Starting...' : 'Loading...'}</> : <><Camera className="h-5 w-5 mr-2 inline" />Start Camera</>}
                  </EchoButton>
                </div>
              </motion.div>
            )}

            {isCameraActive && !capturedPhoto && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="relative">
                  <video ref={videoRef} autoPlay muted playsInline className="w-80 h-60 rounded-2xl mx-auto object-cover glass-panel" />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <div className="flex gap-4 justify-center">
                  <EchoButton variant="ghost" onClick={stopCamera} disabled={isProcessing}>Cancel</EchoButton>
                  <EchoButton variant="primary" onClick={capturePhoto} disabled={isProcessing}><Camera className="h-5 w-5 mr-2 inline" />Capture Photo</EchoButton>
                </div>
              </motion.div>
            )}

            <video ref={videoRef} autoPlay muted playsInline className="hidden" />
            <canvas ref={canvasRef} className="hidden" />

            {capturedPhoto && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <img src={capturedPhoto} alt="Captured" className="w-80 h-60 rounded-2xl mx-auto object-cover shadow-echo-card" />
                <GlassCard className="!p-4 max-w-md mx-auto">
                  <p className="text-echo-text-secondary text-sm">This photo will be securely stored and used to create your Echo avatar.</p>
                </GlassCard>
                <div className="flex gap-4 justify-center">
                  <EchoButton variant="ghost" onClick={retakePhoto} disabled={isProcessing}><RotateCcw className="h-4 w-4 mr-2 inline" />Retake</EchoButton>
                  <EchoButton variant="primary" onClick={handleConfirmPhoto} disabled={isProcessing}>
                    {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin inline" />Creating Echo...</> : <><Check className="h-4 w-4 mr-2 inline" />Looks Good!</>}
                  </EchoButton>
                </div>
              </motion.div>
            )}
          </div>

          <div className="flex justify-between pt-8">
            <div className="flex space-x-3">
              <EchoButton variant="ghost" onClick={onBack} disabled={isProcessing}>Back</EchoButton>
              <EchoButton variant="ghost" onClick={onSkip} disabled={isProcessing}>
                Skip for now <ArrowRight className="h-4 w-4 ml-2 inline" />
              </EchoButton>
            </div>
            <div className="text-sm text-echo-text-muted self-center">Step 2 of 2</div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
