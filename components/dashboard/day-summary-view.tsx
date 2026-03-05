"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowLeft, Video, Image, FileText, Clock, ChevronRight, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Echo } from './dashboard';
import { GlassCard } from '@/components/ui/glass-card';
import { EchoButton } from '@/components/ui/echo-button';

interface DaySummaryViewProps {
  date: Date;
  echoes: Echo[];
  onBack: () => void;
}

export function DaySummaryView({ date, echoes, onBack }: DaySummaryViewProps) {
  const [currentEchoIndex, setCurrentEchoIndex] = useState(0);
  const currentEcho = echoes[currentEchoIndex];
  const hasMultipleEchoes = echoes.length > 1;

  const handleNext = () => { if (currentEchoIndex < echoes.length - 1) setCurrentEchoIndex(currentEchoIndex + 1); };
  const handlePrev = () => { if (currentEchoIndex > 0) setCurrentEchoIndex(currentEchoIndex - 1); };

  const getMediaTypeIcons = (echo: Echo) => {
    const icons = [];
    if (echo.video_url) icons.push(<Video key="video" className="h-4 w-4 text-echo-error" />);
    if (echo.photos && echo.photos.length > 0) icons.push(<Image key="image" className="h-4 w-4 text-echo-purple-500" />);
    if (echo.content) icons.push(<FileText key="text" className="h-4 w-4 text-echo-success" />);
    return icons;
  };

  if (echoes.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
        <GlassCard variant="strong" className="flex-grow overflow-y-auto shadow-echo-elevated">
          <div className="flex items-center mb-6">
            <EchoButton variant="ghost" size="sm" onClick={onBack} className="mr-4 !px-2">
              <ArrowLeft className="h-5 w-5" />
            </EchoButton>
            <h2 className="text-2xl font-bold text-echo-text-primary flex items-center">
              <Calendar className="h-6 w-6 text-echo-purple-600 mr-2" />
              {format(date, 'MMMM d, yyyy')}
            </h2>
          </div>
          <GlassCard className="text-center !p-8 flex-grow">
            <Calendar className="h-12 w-12 text-echo-text-muted mx-auto mb-4" />
            <p className="text-echo-text-muted">No memories found for this date.</p>
            <EchoButton variant="ghost" onClick={onBack} className="mt-4">
              Go Back
            </EchoButton>
          </GlassCard>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
      <GlassCard variant="strong" className="flex-grow overflow-y-auto shadow-echo-elevated">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <EchoButton variant="ghost" size="sm" onClick={onBack} className="mr-4 !px-2">
              <ArrowLeft className="h-5 w-5" />
            </EchoButton>
            <h2 className="text-xl sm:text-2xl font-bold text-echo-text-primary flex items-center">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-echo-purple-600 mr-2" />
              {format(date, 'MMMM d, yyyy')}
            </h2>
          </div>
          {hasMultipleEchoes && (
            <div className="flex items-center space-x-2 text-sm text-echo-text-muted">
              <span>{currentEchoIndex + 1} of {echoes.length}</span>
              <div className="flex space-x-1">
                <button
                  onClick={handlePrev}
                  disabled={currentEchoIndex === 0}
                  className={`p-1 rounded-full ${currentEchoIndex === 0 ? 'text-echo-text-muted/30' : 'text-echo-text-primary hover:bg-echo-purple-50'}`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentEchoIndex === echoes.length - 1}
                  className={`p-1 rounded-full ${currentEchoIndex === echoes.length - 1 ? 'text-echo-text-muted/30' : 'text-echo-text-primary hover:bg-echo-purple-50'}`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Memory Content */}
        <div className="flex-grow space-y-6 overflow-y-auto">
          {currentEcho.video_url && (
            <div className="rounded-xl overflow-hidden glass-panel">
              <video src={currentEcho.video_url} controls className="w-full max-h-[400px] mx-auto" />
            </div>
          )}

          {currentEcho.photos && currentEcho.photos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {currentEcho.photos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden glass-panel">
                  <img src={photo} alt={`Memory ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <GlassCard className="!bg-echo-gradient-subtle">
            <p className="text-echo-text-primary leading-relaxed">{currentEcho.content}</p>
          </GlassCard>

          <div className="flex flex-wrap justify-between items-center text-sm text-echo-text-muted">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{format(new Date(currentEcho.created_at), 'h:mm a')}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1">{getMediaTypeIcons(currentEcho)}</div>
              <span>Memory #{currentEcho.id}</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {hasMultipleEchoes && (
          <div className="sm:hidden mt-6 flex justify-between">
            <EchoButton variant="ghost" size="sm" onClick={handlePrev} disabled={currentEchoIndex === 0}>
              <ChevronLeft className="h-4 w-4 mr-1 inline" />Previous
            </EchoButton>
            <EchoButton variant="ghost" size="sm" onClick={handleNext} disabled={currentEchoIndex === echoes.length - 1}>
              Next<ChevronRight className="h-4 w-4 ml-1 inline" />
            </EchoButton>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}
