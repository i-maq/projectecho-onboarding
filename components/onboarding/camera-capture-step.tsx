"use client";

import React, { useState, useRef, useCallback } from 'react';
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

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please ensure you have granted camera permissions.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const photoData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedPhoto(photoData);
    
    // Stop the camera
    stopCamera();
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedPhoto(null);
    startCamera();
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

  // Cleanup camera when component unmounts
  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

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
              <Camera className="h-10 w-10 text-white" />
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
                    <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-body">Camera preview will appear here</p>
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
                    onClick={startCamera}
                    disabled={isProcessing}
                    className="neumorphic-button-light bg-purple-600 text-white shadow-lg hover:bg-purple-700 text-button px-8 py-3 disabled:opacity-50 flex flex-col items-center"
                  >
                    <div className="w-10 h-10 mb-1">
                      <Lottie
                        animationData={faceIdAnimation}
                        loop={true}
                      />
                    </div>
                    Start Camera
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
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-80 h-60 bg-black rounded-2xl mx-auto object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
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