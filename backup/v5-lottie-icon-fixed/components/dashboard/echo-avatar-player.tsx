"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // If a specific replica ID is provided, use it
  // Otherwise, get it from localStorage
  useEffect(() => {
    if (!replicaId) {
      const storedReplicaId = localStorage.getItem('replicaId');
      if (!storedReplicaId) {
        setError('No Echo avatar found. Please complete the onboarding process.');
      }
    }
  }, [replicaId]);

  // Function to generate video
  const generateVideo = async (text: string) => {
    setIsLoading(true);
    setError(null);
    setVideoUrl(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required. Please sign in again.');
        setIsLoading(false);
        return;
      }
      
      const actualReplicaId = replicaId || localStorage.getItem('replicaId');
      
      if (!actualReplicaId) {
        setError('No Echo avatar found. Please complete the onboarding process.');
        setIsLoading(false);
        return;
      }
      
      // Generate video with the replica
      const response = await fetch('/api/tavus/video', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          replicaId: actualReplicaId,
          script: text
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate video');
      }
      
      const videoData = await response.json();
      setVideoId(videoData.id);
      
      // If video is immediately ready (unlikely, but possible)
      if (videoData.status === 'ready' && videoData.url) {
        setVideoUrl(videoData.url);
        setIsLoading(false);
        return;
      }
      
      // Poll for video status
      const interval = setInterval(async () => {
        await checkVideoStatus(videoData.id);
      }, 5000); // Check every 5 seconds
      
      setStatusCheckInterval(interval);
      
    } catch (error) {
      console.error('Error generating video:', error);
      setError('Failed to generate video. Please try again.');
      setIsLoading(false);
    }
  };

  // Function to check video status
  const checkVideoStatus = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required. Please sign in again.');
        return;
      }
      
      const response = await fetch(`/api/tavus/video?id=${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to check video status');
      }
      
      const videoData = await response.json();
      
      // If the video is ready, set the URL
      if (videoData.status === 'ready' && videoData.url) {
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval);
          setStatusCheckInterval(null);
        }
        
        setVideoUrl(videoData.url);
        setIsLoading(false);
        
        if (autoplay && videoRef.current) {
          videoRef.current.play().catch(err => {
            console.error('Error auto-playing video:', err);
          });
          setIsPlaying(true);
        }
      } else if (videoData.status === 'failed') {
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval);
          setStatusCheckInterval(null);
        }
        
        setError('Failed to generate video. Please try again.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error checking video status:', error);
    }
  };

  // When prompt changes, generate new video
  useEffect(() => {
    if (prompt && prompt.trim()) {
      generateVideo(prompt);
    }
  }, [prompt]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [statusCheckInterval]);

  // Play/pause functions
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Mute/unmute functions
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Regenerate video with same prompt
  const handleRegenerate = () => {
    if (prompt) {
      generateVideo(prompt);
    }
  };

  return (
    <div className={`relative rounded-xl overflow-hidden shadow-xl ${className}`}>
      {/* Video container with minimum height */}
      <div className="relative bg-gray-200 w-full h-[320px] flex items-center justify-center">
        {isLoading ? (
          // Loading state
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-purple-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Creating your Echo's response...</p>
          </div>
        ) : error ? (
          // Error state
          <div className="text-center px-4">
            <p className="text-red-500 mb-2">{error}</p>
            <button 
              onClick={() => prompt && generateVideo(prompt)} 
              className="text-sm text-purple-600 hover:text-purple-800 underline"
            >
              Try Again
            </button>
          </div>
        ) : videoUrl ? (
          // Video player
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="w-full h-full"
          >
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-cover"
              playsInline
              controls={false}
              onEnded={() => setIsPlaying(false)}
            />
            
            {/* Video controls overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent flex justify-between items-center">
              <button 
                onClick={togglePlayPause} 
                className="text-white hover:text-purple-300"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </button>
              
              <div className="flex space-x-3">
                <button 
                  onClick={toggleMute} 
                  className="text-white hover:text-purple-300"
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                
                <button 
                  onClick={handleRegenerate}
                  className="text-white hover:text-purple-300" 
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          // Initial state
          <div className="text-center">
            <p className="text-gray-500">Your Echo will respond here</p>
          </div>
        )}
      </div>
    </div>
  );
}