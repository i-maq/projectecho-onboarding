"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Check, AlertCircle, Loader2, Camera } from 'lucide-react';
import { toast } from 'sonner';
import Lottie from 'lottie-react';
import faceIdAnimation from '/public/wired-outline-1376-face-id-hover-scanning.json';

interface CameraCaptureStepProps {
  personalData: any;
  onComplete: (photoData: string) => void;
  onBack: () => void;
}

export function CameraCaptureStep({ personalData, onComplete, onBack }: CameraCaptureStepProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isComponentReady, setIsComponentReady] = useState(false);

  const startCamera = useCallback(async () => {
    console.log('Starting camera...');
    console.log('videoRef.current:', videoRef.current);
    console.log('isComponentReady:', isComponentReady);
    
    // Ensure video element is available
    if (!videoRef.current) {
      console.error('Video element not available');
      console.log('Attempting to wait for video element...');
      
      // Try waiting a bit longer for the video element
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!videoRef.current && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
        console.log(`Attempt ${attempts}: videoRef.current =`, videoRef.current);
      }
      
      if (!videoRef.current) {
        setError('Video element could not be initialized. Please refresh the page and try again.');
        return;
      }
    }

    setIsLoading(true);
    
    try {
      setError(null);
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }

      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      console.log('Camera access granted, stream:', stream);
      
      // Double-check video element is still available
      if (!videoRef.current) {
        throw new Error('Video element became unavailable');
      }

      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      
      // Wait for the video to be ready and then play
      videoRef.current.onloadedmetadata = async () => {
        console.log('Video metadata loaded');
        try {
          if (videoRef.current) {
            await videoRef.current.play();
            console.log('Video playing successfully');
            setIsCameraActive(true);
            setIsLoading(false);
          }
        } catch (playError) {
          console.error('Error playing video:', playError);
          // Sometimes autoplay is blocked, but that's okay
          setIsCameraActive(true);
          setIsLoading(false);
          toast.info('Click the video area if camera preview doesn\'t appear');
        }
      };

      // Handle video errors
      videoRef.current.onerror = (e) => {
        console.error('Video element error:', e);
        setError('Error loading camera feed');
        setIsLoading(false);
      };
        
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setIsLoading(false);
      
      let errorMessage = 'Unable to access camera. ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera permissions and try again.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage += 'Camera not supported in this browser.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera is already in use by another application.';
      } else {
        errorMessage += err.message || 'Unknown error occurred.';
      }
      
      setError(errorMessage);
    }
  }, []);

  const stopCamera = useCallback(() => {
    console.log('Stopping camera...');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('Stopping track:', track);
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  const capturePhoto = useCallback(() => {
    console.log('Capturing photo...');
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas ref not available');
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('Canvas context not available');
      return;
    }

    // Check if video has valid dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error('Video dimensions are 0');
      toast.error('Camera not ready. Please wait and try again.');
      return;
    }

    console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const photoData = canvas.toDataURL('image/jpeg', 0.8);
    console.log('Photo captured, data length:', photoData.length);
    setCapturedPhoto(photoData);
    
    // Stop the camera
    stopCamera();
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedPhoto(null);
    // Add a small delay to ensure state is updated before starting camera
    setTimeout(() => {
      startCamera();
    }, 100);
  }, [startCamera]);

  const savePhotoToDatabase = async (photoData: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please sign in again');
        return false;
      }

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: personalData.firstName,
          lastName: personalData.lastName,
          dateOfBirth: personalData.dateOfBirth,
          age: personalData.age,
          photoData: photoData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save photo');
      }

      const savedProfile = await response.json();
      console.log('Photo saved successfully:', savedProfile.id);
      return true;
    } catch (error) {
      console.error('Error saving photo:', error);
      toast.error('Failed to save your photo. Please try again.');
      return false;
    }
  };

  const handleConfirmPhoto = async () => {
    if (!capturedPhoto) return;
    
    setIsProcessing(true);
    
    try {
      // Save photo to database
      const saved = await savePhotoToDatabase(capturedPhoto);
      
      if (saved) {
        // Simulate Echo creation processing time
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Store in localStorage for offline access
        localStorage.setItem('userPhoto', capturedPhoto);
        
        toast.success('Your Echo avatar is being created!');
        onComplete(capturedPhoto);
      }
    } catch (error) {
      console.error('Error processing photo:', error);
      toast.error('Failed to process your photo. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Initialize component and ensure DOM is ready
  useEffect(() => {
    console.log('Component mounted, videoRef.current:', videoRef.current);
    
    // Mark component as ready after ensuring video element exists
    const checkVideoElement = () => {
      console.log('Checking video element:', videoRef.current);
      if (videoRef.current) {
        console.log('Video element found, marking component as ready');
        setIsComponentReady(true);
      } else {
        console.log('Video element not found, retrying...');
        setTimeout(checkVideoElement, 100);
      }
    };

    // Start checking after a brief initial delay
    setTimeout(checkVideoElement, 200);
  }, []);

  // Cleanup camera when component unmounts
  useEffect(() => {
    return () => {
      console.log('Component unmounting, cleaning up camera...');
      stopCamera();
    };
  }, [stopCamera]);

  const handleStartCamera = () => {
    console.log('handleStartCamera called');
    console.log('isComponentReady:', isComponentReady);
    console.log('videoRef.current:', videoRef.current);
    
    if (!isComponentReady) {
      toast.error('Please wait a moment and try again.');
      return;
    }
    
    if (!videoRef.current) {
      console.error('Video element still not available in handleStartCamera');
      setError('Camera interface not ready. Please refresh the page.');
      return;
    }
    
    startCamera();
  };

  return (
    <div className="w-full h-full flex items-center justify-center px-6 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="glass-panel-light text-center">
          {/* Header */}
          <motion.div 
            className="flex justify-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Lottie
                animationData={faceIdAnimation}
                loop={true}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </motion.div>

          <h2 className="text-3xl font-extrabold mb-3 text-gray-800 text-title">
            Create Your Echo
          </h2>
          
          <p className="text-gray-600 mb-8 text-body max-w-lg mx-auto">
            {personalData?.firstName}, let's capture your likeness to create your Echo. 
            This will be stored securely in your personal database and used to generate your Echo avatar.
          </p>

          {/* Camera Interface */}
          <div className="relative">
            {!isCameraActive && !capturedPhoto && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="w-80 h-60 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-spin" />
                        <p className="text-gray-500 text-body">Starting camera...</p>
                      </>
                    ) : (
                      <>
                        <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 text-body">Camera preview will appear here</p>
                      </>
                    )}
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

                <div className="flex justify-center">
                  <button
                    onClick={handleStartCamera}
                    disabled={isProcessing || isLoading || !isComponentReady}
                    className="neumorphic-button-light bg-purple-600 text-white shadow-lg hover:bg-purple-700 text-button px-8 py-3 disabled:opacity-50 flex flex-col items-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mb-1 animate-spin" />
                        Starting...
                      </>
                    ) : !isComponentReady ? (
                      <>
                        <Loader2 className="h-5 w-5 mb-1 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Camera className="h-5 w-5 mb-1" />
                        Start Camera
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {isCameraActive && !capturedPhoto && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="relative">
                  {/* Always render video element when camera should be active */}
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    onClick={() => {
                      // Allow manual play if autoplay failed
                      if (videoRef.current && videoRef.current.paused) {
                        videoRef.current.play().catch(console.error);
                      }
                    }}
                    className="w-80 h-60 bg-black rounded-2xl mx-auto object-cover cursor-pointer"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Overlay for debugging */}
                  <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    Camera Active
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={stopCamera}
                    disabled={isProcessing}
                    className="neumorphic-button-light text-button px-6 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={capturePhoto}
                    disabled={isProcessing}
                    className="neumorphic-button-light bg-purple-600 text-white shadow-lg hover:bg-purple-700 text-button px-8 disabled:opacity-50"
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Capture Photo
                  </button>
                </div>
              </motion.div>
            )}

            {/* Always render video element but hide it when not active */}
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="hidden"
            />
            <canvas ref={canvasRef} className="hidden" />

            {capturedPhoto && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="relative">
                  <img
                    src={capturedPhoto}
                    alt="Captured"
                    className="w-80 h-60 bg-black rounded-2xl mx-auto object-cover"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-blue-800 text-sm text-body">
                    This photo will be securely stored in your database and used to create your aged Echo avatar.
                  </p>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={retakePhoto}
                    disabled={isProcessing}
                    className="neumorphic-button-light text-button px-6 disabled:opacity-50"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retake
                  </button>
                  
                  <button
                    onClick={handleConfirmPhoto}
                    disabled={isProcessing}
                    className="neumorphic-button-light bg-green-600 text-white shadow-lg hover:bg-green-700 text-button px-8 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Echo...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Looks Good!
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-8">
            <button
              onClick={onBack}
              disabled={isProcessing}
              className="neumorphic-button-light text-button px-6 disabled:opacity-50"
            >
              Back
            </button>
            
            <div className="text-sm text-gray-500 text-caption self-center">
              Step 2 of 2
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}