"use client";

import { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, ArrowLeft, Video, Image, FileText, Clock, ChevronRight, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Echo } from './dashboard';

interface DaySummaryViewProps {
  date: Date;
  echoes: Echo[];
  onBack: () => void;
}

export function DaySummaryView({ date, echoes, onBack }: DaySummaryViewProps) {
  const [currentEchoIndex, setCurrentEchoIndex] = useState(0);

  const currentEcho = echoes[currentEchoIndex];
  const hasMultipleEchoes = echoes.length > 1;

  const handleNext = () => {
    if (currentEchoIndex < echoes.length - 1) {
      setCurrentEchoIndex(currentEchoIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentEchoIndex > 0) {
      setCurrentEchoIndex(currentEchoIndex - 1);
    }
  };

  const getMediaTypeIcons = (echo: Echo) => {
    const icons = [];
    if (echo.video_url) icons.push(<Video key="video" className="h-4 w-4 text-red-500" />);
    if (echo.photos && echo.photos.length > 0) icons.push(<Image key="image" className="h-4 w-4 text-sky-500" />);
    if (echo.content) icons.push(<FileText key="text" className="h-4 w-4 text-emerald-500" />);
    return icons;
  };

  if (echoes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-full flex flex-col glass-panel-light overflow-y-auto"
      >
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="glass-button p-2 mr-4" style={{ borderRadius: 14 }}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-2xl font-bold flex items-center">
            <Calendar className="h-6 w-6 text-sky-600 mr-2" />
            {format(date, 'MMMM d, yyyy')}
          </h2>
        </div>

        <div className="glass-panel-light text-center flex-grow !p-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No memories found for this date.</p>
          <button
            onClick={onBack}
            className="glass-button text-button px-4 py-2 mt-4"
          >
            Go Back
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col glass-panel-light overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button onClick={onBack} className="glass-button p-2 mr-4" style={{ borderRadius: 14 }}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center">
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-sky-600 mr-2" />
            {format(date, 'MMMM d, yyyy')}
          </h2>
        </div>

        {hasMultipleEchoes && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{currentEchoIndex + 1} of {echoes.length}</span>
            <div className="flex space-x-1">
              <button
                onClick={handlePrev}
                disabled={currentEchoIndex === 0}
                className={`p-1 rounded-full ${currentEchoIndex === 0 ? 'text-gray-300' : 'text-gray-700 hover:bg-white/10'}`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentEchoIndex === echoes.length - 1}
                className={`p-1 rounded-full ${currentEchoIndex === echoes.length - 1 ? 'text-gray-300' : 'text-gray-700 hover:bg-white/10'}`}
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
          <div className="rounded-lg overflow-hidden bg-black">
            <video
              src={currentEcho.video_url}
              controls
              className="w-full max-h-[400px] mx-auto"
            />
          </div>
        )}

        {currentEcho.photos && currentEcho.photos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            {currentEcho.photos.map((photo, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={photo}
                  alt={`Memory ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Text Content */}
        <div className="rounded-lg p-5" style={{ background: 'rgba(14, 165, 233, 0.06)', border: '1px solid rgba(14, 165, 233, 0.12)' }}>
          <p className="text-gray-800 leading-relaxed">{currentEcho.content}</p>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap justify-between items-center text-sm text-gray-500">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{format(new Date(currentEcho.created_at), 'h:mm a')}</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex space-x-1">
              {getMediaTypeIcons(currentEcho)}
            </div>
            <span>Memory #{currentEcho.id}</span>
          </div>
        </div>
      </div>

      {/* Navigation for mobile */}
      {hasMultipleEchoes && (
        <div className="sm:hidden mt-6 flex flex-row gap-3">
          <button
            onClick={handlePrev}
            disabled={currentEchoIndex === 0}
            className={`glass-button flex-1 ${currentEchoIndex === 0 ? 'opacity-50' : ''}`}
          >
            <ChevronLeft className="h-4 w-4 mr-1 inline" />
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={currentEchoIndex === echoes.length - 1}
            className={`glass-button flex-1 ${currentEchoIndex === echoes.length - 1 ? 'opacity-50' : ''}`}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1 inline" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
