"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { GlassCard } from '@/components/ui/glass-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface EchoAvatarPlayerProps {
  replicaId?: string;
  prompt?: string;
  autoplay?: boolean;
  className?: string;
}

export function EchoAvatarPlayer({ replicaId, prompt, autoplay = false, className = '' }: EchoAvatarPlayerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null);
  const [hasAvatar, setHasAvatar] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const storedReplicaId = localStorage.getItem('replicaId');
    const avatarExists = Boolean(replicaId || storedReplicaId);
    setHasAvatar(avatarExists);
    if (!avatarExists) {
      setError('No Echo avatar found. You can create one in your profile settings.');
    }
  }, [replicaId]);

  const generateVideo = async (text: string) => {
    setIsLoading(true);
    setError(null);
    setVideoUrl(null);

    if (!hasAvatar) {
      setTimeout(() => {
        setIsLoading(false);
        setError('No avatar available. Your Echo is still collecting your memories!');
      }, 1500);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) { toast.error('Authentication required.'); setIsLoading(false); return; }
      const actualReplicaId = replicaId || localStorage.getItem('replicaId');
      if (!actualReplicaId) { setError('No Echo avatar found.'); setIsLoading(false); return; }

      const response = await fetch('/api/tavus/video', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ replicaId: actualReplicaId, script: text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate video');
      }

      const videoData = await response.json();
      setVideoId(videoData.id);

      if (videoData.status === 'ready' && videoData.url) {
        setVideoUrl(videoData.url);
        setIsLoading(false);
        return;
      }

      const interval = setInterval(async () => { await checkVideoStatus(videoData.id); }, 5000);
      setStatusCheckInterval(interval);
    } catch (error) {
      console.error('Error generating video:', error);
      setError('Failed to generate video. Please try again.');
      setIsLoading(false);
    }
  };

  const checkVideoStatus = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`/api/tavus/video?id=${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!response.ok) throw new Error('Failed to check video status');
      const videoData = await response.json();
      if (videoData.status === 'ready' && videoData.url) {
        if (statusCheckInterval) { clearInterval(statusCheckInterval); setStatusCheckInterval(null); }
        setVideoUrl(videoData.url);
        setIsLoading(false);
        if (autoplay && videoRef.current) { videoRef.current.play().catch(() => {}); setIsPlaying(true); }
      } else if (videoData.status === 'failed') {
        if (statusCheckInterval) { clearInterval(statusCheckInterval); setStatusCheckInterval(null); }
        setError('Failed to generate video.'); setIsLoading(false);
      }
    } catch (error) { console.error('Error checking video status:', error); }
  };

  useEffect(() => { if (prompt?.trim()) generateVideo(prompt); }, [prompt]);
  useEffect(() => { return () => { if (statusCheckInterval) clearInterval(statusCheckInterval); }; }, [statusCheckInterval]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause(); else videoRef.current.play().catch(() => {});
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) { videoRef.current.muted = !isMuted; setIsMuted(!isMuted); }
  };

  return (
    <div className={`relative rounded-xl overflow-hidden shadow-echo-card glass-panel ${className}`}>
      <div className="relative w-full h-[320px] flex items-center justify-center bg-echo-bg-secondary">
        {isLoading ? (
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-echo-text-secondary font-medium mt-4">Creating your Echo&apos;s response...</p>
          </div>
        ) : error ? (
          <div className="text-center px-4">
            <p className={`${!hasAvatar ? "text-echo-text-secondary" : "text-echo-error"} mb-2`}>{error}</p>
            {hasAvatar && (
              <button onClick={() => prompt && generateVideo(prompt)} className="text-sm text-echo-purple-600 hover:text-echo-purple-800 underline">
                Try Again
              </button>
            )}
          </div>
        ) : videoUrl ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full">
            <video ref={videoRef} src={videoUrl} className="w-full h-full object-cover" playsInline controls={false} onEnded={() => setIsPlaying(false)} />
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent flex justify-between items-center">
              <button onClick={togglePlayPause} className="text-white hover:text-echo-purple-300">
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </button>
              <div className="flex space-x-3">
                <button onClick={toggleMute} className="text-white hover:text-echo-purple-300">
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                <button onClick={() => prompt && generateVideo(prompt)} className="text-white hover:text-echo-purple-300">
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center">
            <p className="text-echo-text-muted">Your Echo will respond here</p>
            {!hasAvatar && <p className="text-sm text-echo-text-muted mt-2">No avatar found. Responses will be text-only.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
