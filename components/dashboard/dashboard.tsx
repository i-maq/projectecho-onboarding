"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, PenLine, Sparkles, User } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardHomeScreen } from './dashboard-home-screen';
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

// Screens that render as full-screen overlays (hide shell chrome)
const OVERLAY_SCREENS: DashboardScreen[] = ['echoConversation', 'memoryReceipt', 'memoryTimeline'];

// Bottom nav tab definitions
const NAV_TABS = [
  { id: 'main' as const, label: 'Home', icon: Home },
  { id: 'capture' as const, label: 'Capture', icon: PenLine },
  { id: 'echo' as const, label: 'Echo', icon: Sparkles },
  { id: 'profile' as const, label: 'Profile', icon: User },
] as const;

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

  const navigateToMain = () => setCurrentScreen('main');
  const navigateToEchoConversation = () => setCurrentScreen('echoConversation');
  const navigateToMemoryReceipt = () => setCurrentScreen('memoryReceipt');
  const navigateToMemoryTimeline = () => setCurrentScreen('memoryTimeline');
  const navigateToDaySummary = (date: Date) => { setSelectedDate(date); setCurrentScreen('daySummary'); };
  const handleMemorySaved = (newEcho: Echo) => { setEchoes([newEcho, ...echoes]); toast.success('Memory saved successfully!'); setCurrentScreen('main'); };

  const handleNavTap = (id: string) => {
    switch (id) {
      case 'main': navigateToMain(); break;
      case 'capture': navigateToEchoConversation(); break;
      case 'echo': navigateToEchoConversation(); break;
      // profile: no-op for now
    }
  };

  const isOverlay = OVERLAY_SCREENS.includes(currentScreen);
  // Determine which nav tab is "active"
  const activeTab = currentScreen === 'echoConversation' ? 'echo' : currentScreen === 'main' ? 'main' : null;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white text-gray-800">
      {/* ── Main content area ── */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: isOverlay ? 0 : 80 }}
      >
        <div className="p-4" style={{ maxWidth: 400, margin: '0 auto', width: '100%' }}>
          {/* Inline screens (non-overlay) */}
          {currentScreen === 'main' && (
            <DashboardHomeScreen
              onCreateMemory={navigateToEchoConversation}
              onViewMemories={navigateToMemoryTimeline}
              onViewReceipt={navigateToMemoryReceipt}
            />
          )}
          {currentScreen === 'createMemory' && (
            <CreateMemoryScreen onMemorySaved={handleMemorySaved} onCancel={navigateToMain} />
          )}
          {currentScreen === 'viewMemories' && (
            <ViewMemoriesScreen echoes={echoes} onSelectDate={navigateToDaySummary} onBack={navigateToMain} isLoading={isLoading} />
          )}
          {currentScreen === 'daySummary' && selectedDate && (
            <DaySummaryView date={selectedDate} echoes={echoes.filter(echo => new Date(echo.created_at).toDateString() === selectedDate.toDateString())} onBack={() => setCurrentScreen('viewMemories')} />
          )}
        </div>
      </div>

      {/* ── Full-screen overlays ── */}
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

      {/* ── Bottom navigation bar ── */}
      {!isOverlay && (
        <nav
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 30,
            padding: "8px 6px",
            paddingBottom: "max(8px, env(safe-area-inset-bottom))",
            background: "rgba(255, 255, 255, 0.12)",
            backdropFilter: "blur(16px) saturate(1.6)",
            WebkitBackdropFilter: "blur(16px) saturate(1.6)",
            borderTop: "1px solid rgba(255, 255, 255, 0.25)",
            borderRadius: "20px 20px 0 0",
            boxShadow:
              "0 -4px 24px rgba(0,0,20,0.06), inset 0 1px 0 rgba(255,255,255,0.4)",
          }}
        >
          {/* Specular highlight */}
          <div
            style={{
              position: "absolute",
              top: 0, left: 0, right: 0,
              height: "1px",
              background:
                "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.4) 15%, rgba(255,255,255,0.7) 35%, rgba(255,255,255,0.7) 65%, rgba(255,255,255,0.4) 85%, transparent 95%)",
              borderRadius: "20px 20px 0 0",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
            {NAV_TABS.map(tab => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleNavTap(tab.id)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    padding: "6px 14px",
                    borderRadius: 12,
                    background: active ? "rgba(14, 165, 233, 0.08)" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.25s cubic-bezier(0.25,0.46,0.45,0.94)",
                  }}
                >
                  <Icon
                    style={{
                      width: 20,
                      height: 20,
                      color: active ? "#0ea5e9" : "#94a3b8",
                      transition: "color 0.25s cubic-bezier(0.25,0.46,0.45,0.94)",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: active ? 500 : 300,
                      fontSize: 10,
                      color: active ? "#0ea5e9" : "#94a3b8",
                      transition: "all 0.25s cubic-bezier(0.25,0.46,0.45,0.94)",
                    }}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
