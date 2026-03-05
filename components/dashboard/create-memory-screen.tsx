"use client";

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ImagePlus, X, Loader2, Video, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Echo } from './dashboard';
import { EchoAvatarPlayer } from './echo-avatar-player';
import { GlassCard } from '@/components/ui/glass-card';
import { EchoButton } from '@/components/ui/echo-button';
import { EchoTextarea } from '@/components/ui/echo-textarea';

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
  "Tell me about a moment when you felt truly connected to someone.",
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
  const [videoRecorded, setVideoRecorded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const generateNewPrompt = () => {
    setCurrentPrompt(echoPrompts[Math.floor(Math.random() * echoPrompts.length)]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
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
          setPreviewUrls(prev => [...prev, URL.createObjectURL(file)]);
        }
      });
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => { const n = [...prev]; n.splice(index, 1); return n; });
    setPreviewUrls(prev => {
      const n = [...prev];
      if (n[index].startsWith('blob:')) URL.revokeObjectURL(n[index]);
      n.splice(index, 1);
      return n;
    });
  };

  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true });
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      chunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setSelectedFiles(prev => [...prev, new File([blob], "selfie-video.webm", { type: 'video/webm' })]);
        setPreviewUrls(prev => [...prev, url]);
        stream.getTracks().forEach(track => track.stop());
        if (videoRef.current) videoRef.current.srcObject = null;
        setIsRecording(false);
        setVideoRecorded(true);
      };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setTimeout(() => {
        if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop();
      }, 30000);
    } catch (error) {
      console.error('Error starting video recording:', error);
      toast.error('Unable to access camera or microphone');
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop();
  };

  const saveMemory = async () => {
    if (!memoryContent.trim() && selectedFiles.length === 0) {
      toast.error('Please add some content to your memory');
      return;
    }
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) { toast.error('Session expired. Please sign in again'); return; }
      const response = await fetch('/api/echoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: memoryContent }),
      });
      if (!response.ok) throw new Error('Failed to save memory');
      const savedEcho = await response.json();
      previewUrls.forEach(url => { if (url.startsWith('blob:')) URL.revokeObjectURL(url); });
      onMemorySaved(savedEcho);
    } catch (error) {
      console.error('Error saving memory:', error);
      toast.error('Failed to save memory');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col">
      <GlassCard variant="strong" className="flex-grow overflow-y-auto shadow-echo-elevated">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-echo-text-primary mb-4">Create a Memory</h2>

          {/* Echo Avatar and Prompt */}
          <div className="mb-6">
            <EchoAvatarPlayer prompt={undefined} autoplay={false} />
            <GlassCard className="mt-4 !p-4 bg-echo-gradient-subtle">
              <p className="font-medium text-echo-purple-800">{currentPrompt}</p>
            </GlassCard>
          </div>

          {/* Video Recording */}
          {isRecording || videoRecorded ? (
            <div className="mb-6">
              <div className="relative w-full rounded-xl overflow-hidden glass-panel" style={{ minHeight: "200px" }}>
                <video ref={videoRef} className="w-full h-full object-cover" muted={isRecording} controls={!isRecording} />
                {isRecording && (
                  <div className="absolute top-4 right-4 flex items-center space-x-2 bg-echo-error text-white px-3 py-1 rounded-full text-sm">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span>Recording...</span>
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-center">
                <EchoButton
                  variant={isRecording ? "ghost" : "primary"}
                  onClick={isRecording ? stopVideoRecording : startVideoRecording}
                >
                  {isRecording ? 'Stop Recording' : 'Record New Video'}
                </EchoButton>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <button
                onClick={startVideoRecording}
                className="echo-input w-full py-6 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-echo-purple-200 hover:border-echo-purple-400 transition-colors cursor-pointer"
              >
                <Video className="h-8 w-8 text-echo-purple-500" />
                <span className="text-echo-text-secondary">Record Video Selfie</span>
              </button>
            </div>
          )}

          {/* Media Files */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-echo-text-primary">Media</h3>
              <EchoButton variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                <ImagePlus className="h-4 w-4 mr-1 inline" />
                Add Photos/Videos
              </EchoButton>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" multiple onChange={handleFileChange} />
            </div>
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden glass-panel">
                    {selectedFiles[index]?.type.startsWith('image/') ? (
                      <img src={url} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <video src={url} className="w-full h-full object-cover" controls />
                    )}
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 bg-white/80 rounded-full p-1 hover:bg-white text-echo-text-primary"
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
            <EchoTextarea
              label="Notes"
              placeholder="Share your memory..."
              value={memoryContent}
              onChange={(e) => setMemoryContent(e.target.value)}
              className="min-h-[150px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-6">
            <div className="flex space-x-3">
              <EchoButton variant="ghost" size="sm" onClick={generateNewPrompt}>
                New Prompt
              </EchoButton>
              <EchoButton variant="ghost" size="sm" onClick={onCancel} disabled={isLoading}>
                Cancel
              </EchoButton>
            </div>
            <EchoButton
              variant="primary"
              onClick={saveMemory}
              disabled={(!memoryContent.trim() && selectedFiles.length === 0) || isLoading}
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin inline" />Saving...</>
              ) : (
                <><Save className="h-4 w-4 mr-2 inline" />Save Memory</>
              )}
            </EchoButton>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
