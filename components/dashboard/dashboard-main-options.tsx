"use client";

import { motion } from 'framer-motion';
import { Book, Calendar, Clock, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { Echo } from './dashboard';
import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { EchoButton } from '@/components/ui/echo-button';
import { LottieIcon } from '@/components/ui/lottie-icon';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface DashboardMainOptionsProps {
  onCreateMemory: () => void;
  onViewMemories: () => void;
  recentEchoes: Echo[];
  isLoading: boolean;
}

export function DashboardMainOptions({
  onCreateMemory,
  onViewMemories,
  recentEchoes,
  isLoading,
}: DashboardMainOptionsProps) {
  const [notebookAnimation, setNotebookAnimation] = useState(null);
  const [calendarAnimation, setCalendarAnimation] = useState(null);

  useEffect(() => {
    fetch('/wired-outline-738-notebook-2-hover-pinch.json')
      .then(res => res.json())
      .then(setNotebookAnimation)
      .catch(err => console.log('Failed to load notebook animation:', err));

    fetch('/wired-outline-28-calendar-hover-pinch.json')
      .then(res => res.json())
      .then(setCalendarAnimation)
      .catch(err => console.log('Failed to load calendar animation:', err));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col space-y-6 overflow-y-auto"
    >
      {/* Welcome */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-echo-text-primary mb-2">Welcome to Echo</h2>
        <p className="text-echo-text-secondary">Your personal memory journal</p>
      </div>

      {/* Main options */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Create Memory */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreateMemory}
          className="cursor-pointer"
        >
          <GlassCard variant="strong" className="hover:shadow-echo-elevated transition-shadow">
            <div className="flex flex-col items-center text-center p-4 sm:p-6">
              <div className="w-24 h-24 bg-echo-gradient rounded-full flex items-center justify-center shadow-echo-glow mb-4 p-2">
                <LottieIcon animationData={notebookAnimation} size={60} />
              </div>
              <h3 className="text-xl font-bold text-echo-text-primary mb-3">Create a Memory</h3>
              <p className="text-echo-text-secondary mb-4">Record a video, add photos, or write about your day</p>
              <EchoButton variant="primary" size="md">
                Start Creating
              </EchoButton>
            </div>
          </GlassCard>
        </motion.div>

        {/* Visit Memory */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onViewMemories}
          className="cursor-pointer"
        >
          <GlassCard variant="strong" className="hover:shadow-echo-elevated transition-shadow">
            <div className="flex flex-col items-center text-center p-4 sm:p-6">
              <div className="w-24 h-24 bg-echo-gradient-soft rounded-full flex items-center justify-center shadow-echo-glow mb-4 p-2">
                <LottieIcon animationData={calendarAnimation} size={60} />
              </div>
              <h3 className="text-xl font-bold text-echo-text-primary mb-3">Visit a Memory</h3>
              <p className="text-echo-text-secondary mb-4">Browse through your past entries by date</p>
              <EchoButton variant="primary" size="md">
                Browse Memories
              </EchoButton>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Recent Memories */}
      <div className="mt-12 flex-grow overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-echo-text-primary flex items-center">
            <Clock className="h-5 w-5 text-echo-purple-600 mr-2" />
            Recent Memories
          </h3>
          {recentEchoes.length > 0 && (
            <button
              onClick={onViewMemories}
              className="text-echo-purple-600 hover:text-echo-purple-800 text-sm flex items-center transition-colors"
            >
              View All <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : recentEchoes.length > 0 ? (
          <div className="space-y-4">
            {recentEchoes.map((echo) => (
              <motion.div
                key={echo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <GlassCard className="!p-4 sm:!p-5">
                  <div className="flex items-start">
                    <div className="bg-echo-purple-100 rounded-full p-2 mr-4">
                      <Book className="h-5 w-5 text-echo-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-echo-text-primary mb-2 line-clamp-2">{echo.content}</p>
                      <p className="text-xs text-echo-text-muted">
                        {format(new Date(echo.created_at), 'MMMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <GlassCard className="text-center !p-8">
            <Calendar className="h-12 w-12 text-echo-text-muted mx-auto mb-4" />
            <p className="text-echo-text-muted mb-4">No memories yet. Start creating your first memory!</p>
            <EchoButton variant="primary" onClick={onCreateMemory}>
              Create Memory
            </EchoButton>
          </GlassCard>
        )}
      </div>
    </motion.div>
  );
}
