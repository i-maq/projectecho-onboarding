"use client";

import { motion } from 'framer-motion';
import { Book, Calendar, Clock, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { Echo } from './dashboard';
import Lottie from 'lottie-react';
import notebookAnimation from '@/assets/animations/wired-outline-738-notebook-2-hover-pinch.json';
import calendarAnimation from '@/assets/animations/wired-outline-28-calendar-hover-pinch.json';

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
  isLoading 
}: DashboardMainOptionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col space-y-6 overflow-y-auto"
    >
      {/* Welcome message */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Welcome to Echo</h2>
        <p className="text-gray-600">Your personal memory journal</p>
      </div>
      
      {/* Main options */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Create Memory Option */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreateMemory}
          className="glass-panel-light !bg-white/60 !border-white/20 !shadow-xl rounded-2xl cursor-pointer hover:shadow-2xl transition-all"
        >
          <div className="flex flex-col items-center text-center p-6 sm:p-8">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg mb-4 p-2">
              <Lottie
                animationData={notebookAnimation}
                loop={true}
                style={{
                  width: '100%',
                  height: '100%',
                }}
              />
            </div>
            <h3 className="text-xl font-bold mb-3">Create a Memory</h3>
            <p className="text-gray-600 mb-4">Record a video, add photos, or write about your day</p>
            <button className="neumorphic-button-light bg-purple-600 text-white shadow-lg hover:bg-purple-700 text-button px-6 py-3 mt-2">
              Start Creating
            </button>
          </div>
        </motion.div>

        {/* Visit Memory Option */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onViewMemories}
          className="glass-panel-light !bg-white/60 !border-white/20 !shadow-xl rounded-2xl cursor-pointer hover:shadow-2xl transition-all"
        >
          <div className="flex flex-col items-center text-center p-6 sm:p-8">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg mb-4 p-2">
              <Lottie
                animationData={calendarAnimation}
                loop={true}
                style={{
                  width: '100%',
                  height: '100%',
                }}
              />
            </div>
            <h3 className="text-xl font-bold mb-3">Visit a Memory</h3>
            <p className="text-gray-600 mb-4">Browse through your past entries by date</p>
            <button className="neumorphic-button-light bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 text-button px-6 py-3 mt-2">
              Browse Memories
            </button>
          </div>
        </motion.div>
      </div>

      {/* Recent Memories Section */}
      <div className="mt-12 flex-grow overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold flex items-center">
            <Clock className="h-5 w-5 text-purple-600 mr-2" />
            Recent Memories
          </h3>
          {recentEchoes.length > 0 && (
            <button 
              onClick={onViewMemories}
              className="text-purple-600 hover:text-purple-800 text-sm flex items-center"
            >
              View All <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        ) : recentEchoes.length > 0 ? (
          <div className="space-y-4">
            {recentEchoes.map((echo) => (
              <motion.div
                key={echo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel-light !bg-white/60 !p-4 sm:!p-5 rounded-xl"
              >
                <div className="flex items-start">
                  <div className="bg-purple-100 rounded-full p-2 mr-4">
                    <Book className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 mb-2 line-clamp-2">{echo.content}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(echo.created_at), 'MMMM d, yyyy • h:mm a')}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No memories yet. Start creating your first memory!</p>
            <button 
              onClick={onCreateMemory}
              className="neumorphic-button-light bg-purple-600 text-white shadow-lg hover:bg-purple-700 text-button px-6 py-2"
            >
              Create Memory
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}