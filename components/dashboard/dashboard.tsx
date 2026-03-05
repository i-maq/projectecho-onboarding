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
import { EchoButton } from '@/components/ui/echo-button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export interface Echo {
  id: string;
  content: string;
  created_at: string;
  video_url?: string;
  photos?: string[];
  notes?: string;
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
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setEchoes(data);
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

  const navigateToCreateMemory = () => setCurrentScreen('createMemory');
  const navigateToViewMemories = () => setCurrentScreen('viewMemories');
  const navigateToMain = () => setCurrentScreen('main');
  const navigateToDaySummary = (date: Date) => {
    setSelectedDate(date);
    setCurrentScreen('daySummary');
  };

  const handleMemorySaved = (newEcho: Echo) => {
    setEchoes([newEcho, ...echoes]);
    toast.success('Memory saved successfully!');
    setCurrentScreen('main');
  };

  return (
    <div className="min-h-screen h-full flex flex-col bg-echo-bg-primary text-echo-text-primary">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-6 flex justify-center items-center border-b border-white/30 glass-panel-strong"
        style={{ borderRadius: 0 }}
      >
        <Image
          src="/projectechologo.png"
          alt="Echo Logo"
          width={280}
          height={70}
          priority
        />
      </motion.header>

      {/* Main Content */}
      <div className="flex-grow p-4 sm:p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto h-full flex flex-col">
          {currentScreen !== 'main' && (
            <button
              onClick={navigateToMain}
              className="self-start mb-4 text-sm text-echo-purple-600 hover:text-echo-purple-800 transition-colors"
            >
              &larr; Back to Main
            </button>
          )}

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

      {/* Footer */}
      <div className="p-4 sm:p-6 flex justify-center border-t border-white/30 glass-panel-strong" style={{ borderRadius: 0 }}>
        <EchoButton variant="ghost" size="sm" onClick={logout}>
          <LogOut className="h-4 w-4 mr-2 inline" />
          Logout
        </EchoButton>
      </div>
    </div>
  );
}
