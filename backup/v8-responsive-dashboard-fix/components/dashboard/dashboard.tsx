"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { DashboardMainOptions } from './dashboard-main-options';
import { CreateMemoryScreen } from './create-memory-screen';
import { ViewMemoriesScreen } from './view-memories-screen';
import { DaySummaryView } from './day-summary-view';

// Types for memory/journal entries
export interface Echo {
  id: string;
  content: string;
  created_at: string;
  video_url?: string;
  photos?: string[]; // Array of photo URLs or base64 data
  notes?: string; // Additional notes
}

type DashboardScreen = 'main' | 'createMemory' | 'viewMemories' | 'daySummary';

export function Dashboard() {
  const [currentScreen, setCurrentScreen] = useState<DashboardScreen>('main');
  const [echoes, setEchoes] = useState<Echo[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEcho, setSelectedEcho] = useState<Echo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchEchoes();
  }, []);

  const fetchEchoes = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/echoes', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEchoes(data);
        
        // If we have echoes, select the first one for reference
        if (data.length > 0) {
          setSelectedEcho(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching echoes:', error);
      toast.error('Failed to load your memories');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('onboardingComplete');
    window.location.reload();
  };

  // Navigation handlers
  const navigateToCreateMemory = () => setCurrentScreen('createMemory');
  const navigateToViewMemories = () => setCurrentScreen('viewMemories');
  const navigateToMain = () => setCurrentScreen('main');
  const navigateToDaySummary = (date: Date) => {
    setSelectedDate(date);
    setCurrentScreen('daySummary');
  };

  // Data handlers
  const handleMemorySaved = (newEcho: Echo) => {
    setEchoes([newEcho, ...echoes]);
    toast.success('Memory saved successfully!');
    // Optionally navigate back to main or stay on create screen
    setCurrentScreen('main');
  };

  return (
    <div className="min-h-screen h-full flex flex-col bg-[#f0f2f5] text-gray-800">
      {/* Header - Fixed across all dashboard screens */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-6 flex justify-between items-center border-b border-gray-200 bg-white/80 backdrop-blur-sm"
      >
        <div className="flex items-center space-x-4">
          <div className="h-12 sm:h-20">
            <Image 
              src="/projectechologo.png"
              alt="Echo Logo"
              width={280}
              height={70}
              className="h-full w-auto"
              priority
            />
          </div>
          {currentScreen !== 'main' && (
            <button 
              onClick={navigateToMain}
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              ← Back to Main
            </button>
          )}
        </div>
        <button 
          onClick={logout} 
          className="neumorphic-button-light text-button text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
        >
          <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 inline" />
          Logout
        </button>
      </motion.header>

      {/* Main Content Area - Changes based on current screen */}
      <div className="flex-grow p-4 sm:p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto h-full flex flex-col">
          {/* Conditional rendering based on currentScreen */}
          {currentScreen === 'main' && (
            <DashboardMainOptions 
              onCreateMemory={navigateToCreateMemory}
              onViewMemories={navigateToViewMemories}
              recentEchoes={echoes.slice(0, 3)}
              isLoading={isLoading}
            />
          )}

          {currentScreen === 'createMemory' && (
            <CreateMemoryScreen 
              onMemorySaved={handleMemorySaved}
              onCancel={navigateToMain}
            />
          )}

          {currentScreen === 'viewMemories' && (
            <ViewMemoriesScreen 
              echoes={echoes}
              onSelectDate={navigateToDaySummary}
              onBack={navigateToMain}
              isLoading={isLoading}
            />
          )}

          {currentScreen === 'daySummary' && selectedDate && (
            <DaySummaryView 
              date={selectedDate}
              echoes={echoes.filter(echo => {
                const echoDate = new Date(echo.created_at);
                return echoDate.toDateString() === selectedDate.toDateString();
              })}
              onBack={() => setCurrentScreen('viewMemories')}
            />
          )}
        </div>
      </div>
    </div>
  );
}