"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Video, RotateCcw, Check, AlertCircle, Loader2, Mic, MicOff, Play, Square, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface VideoCaptureStepProps {
  personalData: any;
  onComplete: (replicaId: string) => void;
  onBack: () => void;
}

// Script prompts from Tavus recommendations
const scriptPrompts = [
  "Hello, I'm creating my Echo avatar that will look and sound just like me.",
  "This technology is fascinating! I'm excited to see the final result.",
  "I'm recording this video to help create my digital replica.",
  "The weather today is quite nice, perfect for a walk outside.",
  "I find that journaling helps me remember important moments in my life."
];

export function VideoCaptureStep({ personalData, onComplete, onBack }: VideoCaptureStepProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentScript, setCurrentScript] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [replicaId, setReplicaId] = useState<string | null>(null);
  const [replicaStatus, setReplicaStatus] = useState<string | null>(null);
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Explicitly call play() to start the video stream
        try {
          await videoRef.current.play();
          console.log('Camera stream started successfully');
        } catch (playError) {
          console.error('Error auto-playing camera stream:', playError);
          // This error is non-fatal, as user may just need to interact with the page first
          toast.info('Click the video area if camera preview doesn\'t appear');
        }
        
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error('Error accessing camera or microphone:', err);
      setError('Unable to access camera and microphone. Please ensure you have granted camera and audio permissions.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraActive(false);
  }, []);

  const toggleMute = useCallback(() => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const startRecording = useCallback(async () => {
    if (!streamRef.current) return;
    
    try {
      // Using normal recording API since RecordRTC might not be fully initialized
      const chunks: BlobPart[] = [];
      const mediaRecorder = new MediaRecorder(streamRef.current);
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedVideo(blob);
        setIsRecording(false);
        
        if (previewRef.current) {
          const videoURL = URL.createObjectURL(blob);
          previewRef.current.src = videoURL;
          previewRef.current.onloadedmetadata = () => {
            previewRef.current?.play().catch(err => {
              console.error('Error playing video:', err);
            });
          };
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start recording timer
      const intervalId = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Auto-stop after 30 seconds to prevent large files
      setTimeout(() => {
        if (mediaRecorder.state !== 'inactive') {
          clearInterval(intervalId);
          mediaRecorder.stop();
        }
      }, 30000);
      
      // Clean up timer when recording stops
      return () => clearInterval(intervalId);
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to start recording. Please try again.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (!streamRef.current) return;
    
    try {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => {
        if (track.readyState === 'live' && track.kind === 'video') {
          track.stop();
        }
      });
      
      setIsRecording(false);
    } catch (err) {
      console.error('Error stopping recording:', err);
      setError('Failed to stop recording. Please try again.');
    }
  }, []);

  const startCountdown = useCallback(() => {
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          startRecording();
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  }, [startRecording]);

  const restartCapture = useCallback(() => {
    setRecordedVideo(null);
    setIsPlaying(false);
    setReplicaId(null);
    setReplicaStatus(null);
    
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
      setStatusCheckInterval(null);
    }
    
    if (!isCameraActive) {
      startCamera();
    }
  }, [isCameraActive, startCamera, statusCheckInterval]);

  const playPausePreview = useCallback(() => {
    if (previewRef.current) {
      if (isPlaying) {
        previewRef.current.pause();
      } else {
        previewRef.current.play().catch(err => {
          console.error('Error playing video:', err);
        });
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const uploadVideoToTavus = async () => {
    if (!recordedVideo) return;
    
    setIsProcessing(true);
    
    try {
      // Create form data for upload
      const formData = new FormData();
      formData.append('video', recordedVideo, 'user_recording.webm');
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required. Please sign in again.');
        setIsProcessing(false);
        return;
      }
      
      // Upload to our API endpoint that will call Tavus
      const response = await fetch('/api/tavus/replica', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create replica');
      }
      
      const replicaData = await response.json();
      setReplicaId(replicaData.id);
      setReplicaStatus(replicaData.status);
      
      // Start polling for status updates
      const interval = setInterval(async () => {
        await checkReplicaStatus(replicaData.id);
      }, 5000); // Check every 5 seconds
      
      setStatusCheckInterval(interval);
      
      toast.success('Video uploaded successfully! Your Echo avatar is being created.');
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Failed to upload video. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const checkReplicaStatus = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required. Please sign in again.');
        return;
      }
      
      const response = await fetch(`/api/tavus/replica?id=${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to check replica status');
      }
      
      const replicaData = await response.json();
      setReplicaStatus(replicaData.status);
      
      // If ready, complete the onboarding step
      if (replicaData.status === 'ready') {
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval);
          setStatusCheckInterval(null);
        }
        toast.success('Your Echo avatar is ready!');
        setTimeout(() => onComplete(id), 2000);
      } else if (replicaData.status === 'failed') {
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval);
          setStatusCheckInterval(null);
        }
        toast.error('Failed to create your Echo avatar. Please try again.');
      }
    } catch (error) {
      console.error('Error checking replica status:', error);
    }
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
      if (previewRef.current && previewRef.current.src.startsWith('blob:')) {
        URL.revokeObjectURL(previewRef.current.src);
      }
    };
  }, [stopCamera, statusCheckInterval]);
  
  // Format recording time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-full flex items-center justify-center px-6 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="glass-panel-light">
          {/* Header */}
          <motion.div 
            className="text-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
              <Video className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold mt-4 mb-3 text-gray-800 text-title">
              Create Your Echo Avatar
            </h2>
            <p className="text-gray-600 mb-4 text-body max-w-lg mx-auto">
              {personalData?.firstName}, we need a short video to create your personalized Echo avatar. This will let your Echo look and sound just like you!
            </p>

            {/* Script display */}
            {isCameraActive && !recordedVideo && (
              <div className="bg-purple-100 border border-purple-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-purple-800 mb-2">Please read aloud:</h3>
                <p className="font-medium text-purple-800 text-lg">"{scriptPrompts[currentScript]}"</p>
                {currentScript < scriptPrompts.length - 1 && (
                  <p className="text-sm text-purple-600 mt-2">
                    {currentScript + 1} of {scriptPrompts.length} phrases
                  </p>
                )}
              </div>
            )}

            {/* Status display when creating replica */}
            {replicaId && !replicaStatus?.includes('ready') && (
              <div className="bg-blue-100 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin mr-2" />
                  <h3 className="font-semibold text-blue-800">
                    Creating Your Echo Avatar ({replicaStatus || 'initializing'}...)
                  </h3>
                </div>
                <p className="text-sm text-blue-700 mt-2">
                  This process typically takes 10-15 minutes. You can continue using the app and we'll notify you when it's ready.
                </p>
              </div>
            )}

            {/* Success message when replica is ready */}
            {replicaStatus === 'ready' && (
              <div className="bg-green-100 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <h3 className="font-semibold text-green-800">
                    Your Echo Avatar is Ready!
                  </h3>
                </div>
                <p className="text-sm text-green-700 mt-2">
                  Proceeding to your dashboard where you can interact with your Echo.
                </p>
              </div>
            )}
          </motion.div>

          {/* Camera/Video Interface */}
          <div className="relative">
            {!isCameraActive && !recordedVideo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="w-full h-80 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-body">Video preview will appear here</p>
                  </div>
                </div>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                      <p className="text-red-700 text-sm text-body">{error}</p>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <button
                    onClick={startCamera}
                    disabled={isProcessing}
                    className="neumorphic-button-light bg-purple-600 text-white shadow-lg hover:bg-purple-700 text-button px-8 py-3 disabled:opacity-50"
                  >
                    <Camera className="h-5 w-5 mr-2 inline" />
                    Start Camera
                  </button>
                </div>
              </motion.div>
            )}

            {isCameraActive && !recordedVideo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="relative">
                  {countdown !== null && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 z-10 rounded-2xl">
                      <div className="bg-white rounded-full h-24 w-24 flex items-center justify-center">
                        <span className="text-5xl font-bold text-purple-600">{countdown}</span>
                      </div>
                    </div>
                  )}
                  
                  <video
                    ref={videoRef}
                    autoPlay
                    muted={isMuted}
                    playsInline
                    className="w-full h-80 bg-black rounded-2xl mx-auto object-cover"
                  />
                  
                  {isRecording && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center">
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse mr-2"></div>
                      <span>{formatTime(recordingTime)}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 justify-center">
                  {!isRecording ? (
                    <>
                      <button
                        onClick={stopCamera}
                        disabled={isProcessing || countdown !== null}
                        className="neumorphic-button-light text-button px-6 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      
                      <button
                        onClick={toggleMute}
                        className="neumorphic-button-light text-button px-4"
                      >
                        {isMuted ? (
                          <><MicOff className="h-4 w-4 mr-2" />Unmute</>
                        ) : (
                          <><Mic className="h-4 w-4 mr-2" />Mute</>
                        )}
                      </button>
                      
                      <button
                        onClick={() => {
                          if (currentScript < scriptPrompts.length - 1) {
                            setCurrentScript(currentScript + 1);
                          }
                          startCountdown();
                        }}
                        disabled={isProcessing || countdown !== null}
                        className="neumorphic-button-light bg-red-600 text-white shadow-lg hover:bg-red-700 text-button px-8 disabled:opacity-50"
                      >
                        <Camera className="h-5 w-5 mr-2" />
                        {currentScript < scriptPrompts.length - 1 ? 'Record & Next Phrase' : 'Record Final Phrase'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="neumorphic-button-light bg-red-600 text-white shadow-lg hover:bg-red-700 text-button px-8"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Stop Recording
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {recordedVideo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="relative">
                  <video
                    ref={previewRef}
                    controls
                    className="w-full h-80 bg-black rounded-2xl mx-auto object-cover"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-blue-800 text-sm text-body">
                    This video will be used to create your Echo avatar. The AI needs clear audio and video to work best.
                  </p>
                </div>

                <div className="flex gap-4 justify-center">
                  {!replicaId && (
                    <>
                      <button
                        onClick={restartCapture}
                        disabled={isProcessing}
                        className="neumorphic-button-light text-button px-6 disabled:opacity-50"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Record Again
                      </button>
                      
                      <button
                        onClick={uploadVideoToTavus}
                        disabled={isProcessing}
                        className="neumorphic-button-light bg-green-600 text-white shadow-lg hover:bg-green-700 text-button px-8 disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Create My Echo Avatar
                          </>
                        )}
                      </button>
                    </>
                  )}
                  
                  {replicaId && replicaStatus !== 'ready' && (
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-purple-500 mr-2 animate-pulse" />
                      <span className="text-purple-700">Processing your Echo avatar...</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-8">
            <button
              onClick={onBack}
              disabled={isProcessing || isRecording || (replicaId && replicaStatus !== 'ready')}
              className="neumorphic-button-light text-button px-6 disabled:opacity-50"
            >
              Back
            </button>
            
            <div className="text-sm text-gray-500 text-caption self-center">
              Step 3 of 3
            </div>
          </div>
          
          {/* Recording tips */}
          {isCameraActive && !recordedVideo && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Tips for best results:</h3>
              <ul className="text-xs text-gray-600 space-y-1 list-disc pl-5">
                <li>Ensure your face is well-lit from the front</li>
                <li>Speak clearly and at a normal pace</li>
                <li>Face the camera directly</li>
                <li>Avoid background noise</li>
                <li>Record at least 10-15 seconds of video</li>
              </ul>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}