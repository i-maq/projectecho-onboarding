"use client";

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, ImagePlus, X, Loader2, Video, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Echo } from './dashboard';
import { EchoAvatarPlayer } from './echo-avatar-player';

const echoPrompts = [
  "What's a childhood memory that still makes you laugh?",
  "Describe a place where you feel completely at peace.",
  "What's something you learned about yourself recently?",
  "Tell me about a person who has influenced your life.",
  "What's a simple pleasure that you really appreciate?",
  "What's a challenge you overcame that you're proud of?",
  "Describe a perfect day from your perspective.",
  "What's something you're grateful for right now?",
  "What's a dream or goal that excites you?",
  "Tell me about a moment when you felt truly connected to someone."
];

interface CreateMemoryScreenProps {
  onMemorySaved: (echo: Echo) => void;
  onCancel: () => void;
}

export function CreateMemoryScreen({ onMemorySaved, onCancel }: CreateMemoryScreenProps) {
  const [currentPrompt, setCurrentPrompt] = useState(echoPrompts[Math.floor(Math.random() * echoPrompts.length)]);
  const [memoryContent, setMemoryContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [videoRecorded, setVideoRecorded] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const generateNewPrompt = () => {
    const newPrompt = echoPrompts[Math.floor(Math.random() * echoPrompts.length)];
    setCurrentPrompt(newPrompt);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
      
      // Generate previews
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setPreviewUrls(prev => [...prev, event.target?.result as string]);
            }
          };
          reader.readAsDataURL(file);
        } else if (file.type.startsWith('video/')) {
          const url = URL.createObjectURL(file);
          setPreviewUrls(prev => [...prev, url]);
        }
      });
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
    
    setPreviewUrls(prev => {
      const newUrls = [...prev];
      // If it's a blob URL, revoke it to free up memory
      if (newUrls[index].startsWith('blob:')) {
        URL.revokeObjectURL(newUrls[index]);
      }
      newUrls.splice(index, 1);
      return newUrls;
    });
  };

  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" }, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      chunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        // Create a File object from the Blob
        const videoFile = new File([blob], "selfie-video.webm", { type: 'video/webm' });
        setSelectedFiles(prev => [...prev, videoFile]);
        setPreviewUrls(prev => [...prev, url]);
        
        // Stop all tracks
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        
        setIsRecording(false);
        setVideoRecorded(true);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      
      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      }, 30000);
    } catch (error) {
      console.error('Error starting video recording:', error);
      toast.error('Unable to access camera or microphone');
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const saveMemory = async () => {
    if (!memoryContent.trim() && selectedFiles.length === 0) {
      toast.error('Please add some content to your memory');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Session expired. Please sign in again');
        return;
      }
      
      // For now, we'll just save the text content
      // In a real implementation, you'd upload files to storage and save references
      const response = await fetch('/api/echoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          content: memoryContent,
          // In a production app, you'd add references to uploaded media here
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save memory');
      }
      
      const savedEcho = await response.json();
      
      // Clean up any blob URLs
      previewUrls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      
      onMemorySaved(savedEcho);
    } catch (error) {
      console.error('Error saving memory:', error);
      toast.error('Failed to save memory');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col"
    >
      <div className="glass-panel-light !bg-white/90 !shadow-xl rounded-2xl flex-grow overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Create a Memory</h2>
          
          {/* Echo Avatar and Prompt */}
          <div className="mb-6">
            <EchoAvatarPlayer prompt={undefined} autoplay={false} />
            
            <div className="mt-4 bg-purple-100 border border-purple-200 rounded-lg p-4 mb-4">
              <p className="font-medium text-purple-800">{currentPrompt}</p>
            </div>
          </div>
          
          {/* Video Recording Interface */}
          {isRecording || videoRecorded ? (
            <div className="mb-6">
              <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden" style={{ minHeight: "200px" }}>
                <video 
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  muted={isRecording}
                  controls={!isRecording}
                />
                
                {isRecording && (
                  <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>Recording...</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex justify-center">
                {isRecording ? (
                  <button 
                    onClick={stopVideoRecording}
                    className="neumorphic-button-light bg-red-600 text-white shadow-lg hover:bg-red-700 text-button px-5 py-2"
                  >
                    Stop Recording
                  </button>
                ) : (
                  <button 
                    onClick={startVideoRecording}
                    className="neumorphic-button-light bg-purple-600 text-white shadow-lg hover:bg-purple-700 text-button px-5 py-2"
                  >
                    Record New Video
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <button
                onClick={startVideoRecording}
                className="neumorphic-button-light w-full py-6 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-300 transition-all"
              >
                <Video className="h-8 w-8 text-purple-500" />
                <span>Record Video Selfie</span>
              </button>
            </div>
          )}
          
          {/* Media Files */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Media</h3>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="neumorphic-button-light text-button text-sm px-4 py-1.5"
              >
                <ImagePlus className="h-4 w-4 mr-1 inline" />
                Add Photos/Videos
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,video/*"
                multiple
                onChange={handleFileChange}
              />
            </div>
            
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    {selectedFiles[index]?.type.startsWith('image/') ? (
                      <img 
                        src={url} 
                        alt={`Upload ${index + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <video 
                        src={url} 
                        className="w-full h-full object-cover"
                        controls
                      />
                    )}
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 bg-white/80 rounded-full p-1 hover:bg-white text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Memory Text */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Notes</h3>
            <textarea
              placeholder="Share your memory..."
              value={memoryContent}
              onChange={(e) => setMemoryContent(e.target.value)}
              className="w-full min-h-[150px] p-4 rounded-lg bg-white/80 border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none text-gray-800 text-body font-light"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-between mt-6">
            <div className="flex space-x-3">
              <button 
                onClick={generateNewPrompt} 
                className="neumorphic-button-light text-button px-4 py-2"
              >
                New Prompt
              </button>
              <button 
                onClick={onCancel} 
                className="neumorphic-button-light text-button px-4 py-2"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
            <button 
              onClick={saveMemory} 
              disabled={(!memoryContent.trim() && selectedFiles.length === 0) || isLoading}
              className="neumorphic-button-light bg-purple-600 text-white shadow-lg hover:bg-purple-700 text-button px-5 py-2 disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" />Save Memory</>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}