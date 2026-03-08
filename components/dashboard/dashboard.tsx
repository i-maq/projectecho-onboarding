"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { DashboardMainOptions } from './dashboard-main-options';
import { CreateMemoryScreen } from './create-memory-screen';
import { ViewMemoriesScreen } from './view-memories-screen';
import { DaySummaryView } from './day-summary-view';
import { EchoConversationScreen } from './echo-conversation-screen';
import { MemoryReceiptScreen } from './memory-receipt-screen';
import { MemoryTimelineScreen } from './memory-timeline-screen';

export interface Echo {
  id: string;
  content: string;
  created_at: string;
  video_url?: string;
  photos?: string[];
  notes?: string;
}

type DashboardScreen = 'main' | 'createMemory' | 'viewMemories' | 'daySummary' | 'echoConversation' | 'memoryReceipt' | 'memoryTimeline';

export function Dashboard() {
  const [currentScreen, setCurrentScreen] = useState<DashboardScreen>('main');
  const [echoes, setEchoes] = useState<Echo[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEcho, setSelectedEcho] = useState<Echo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { fetchEchoes(); }, []);

  const fetchEchoes = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch('/api/echoes', { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        setEchoes(data);
        if (data.length > 0) setSelectedEcho(data[0]);
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
  const navigateToEchoConversation = () => setCurrentScreen('echoConversation');
  const navigateToMemoryReceipt = () => setCurrentScreen('memoryReceipt');
  const navigateToMemoryTimeline = () => setCurrentScreen('memoryTimeline');
  const navigateToDaySummary = (date: Date) => { setSelectedDate(date); setCurrentScreen('daySummary'); };
  const handleMemorySaved = (newEcho: Echo) => { setEchoes([newEcho, ...echoes]); toast.success('Memory saved successfully!'); setCurrentScreen('main'); };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white text-gray-800">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-6 flex justify-center items-center"
        style={{
          background: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(12px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(12px) saturate(1.6)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.18)',
        }}
      >
        <Image src="/projectechologo.png" alt="Echo Logo" width={280} height={70} priority />
      </motion.header>

      <div className="flex-grow p-4 sm:p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto h-full flex flex-col">
          {currentScreen !== 'main' && currentScreen !== 'echoConversation' && currentScreen !== 'memoryReceipt' && currentScreen !== 'memoryTimeline' && (
            <button onClick={navigateToMain} className="self-start mb-4 text-sm text-sky-600 hover:text-sky-800">
              ← Back to Main
            </button>
          )}
          {currentScreen === 'main' && <DashboardMainOptions onCreateMemory={navigateToEchoConversation} onViewMemories={navigateToMemoryTimeline} recentEchoes={echoes.slice(0, 3)} isLoading={isLoading} />}
          {currentScreen === 'createMemory' && <CreateMemoryScreen onMemorySaved={handleMemorySaved} onCancel={navigateToMain} />}
          {currentScreen === 'viewMemories' && <ViewMemoriesScreen echoes={echoes} onSelectDate={navigateToDaySummary} onBack={navigateToMain} isLoading={isLoading} />}
          {currentScreen === 'daySummary' && selectedDate && (
            <DaySummaryView date={selectedDate} echoes={echoes.filter(echo => new Date(echo.created_at).toDateString() === selectedDate.toDateString())} onBack={() => setCurrentScreen('viewMemories')} />
          )}
        </div>
      </div>

      {/* Full-screen overlays */}
      <AnimatePresence>
        {currentScreen === 'echoConversation' && (
          <EchoConversationScreen onBack={navigateToMain} onViewReceipt={navigateToMemoryReceipt} />
        )}
        {currentScreen === 'memoryReceipt' && (
          <MemoryReceiptScreen onAddMore={navigateToEchoConversation} onDone={navigateToMain} />
        )}
        {currentScreen === 'memoryTimeline' && (
          <MemoryTimelineScreen onBack={navigateToMain} onSelectMemory={() => navigateToMemoryReceipt()} />
        )}
      </AnimatePresence>

      <div className="p-4 sm:p-6 flex justify-center"
        style={{
          background: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(12px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(12px) saturate(1.6)',
          borderTop: '1px solid rgba(255, 255, 255, 0.18)',
        }}
      >
        <button onClick={logout} className="glass-button glass-button-sm text-button text-xs sm:text-sm">
          <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 inline" />Logout
        </button>
      </div>
    </div>
  );
}
