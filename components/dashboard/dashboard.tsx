"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Sparkles, User } from 'lucide-react';
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

  const isOverlay = OVERLAY_SCREENS.includes(currentScreen);

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

      {/* ── Bottom navigation bar (3 items: Home / Echo hero / Profile) ── */}
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
          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-end" }}>
            {/* Home tab */}
            <button
              onClick={navigateToMain}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                padding: "6px 14px",
                borderRadius: 12,
                background: currentScreen === 'main' ? "rgba(14, 165, 233, 0.08)" : "transparent",
                border: "none",
                cursor: "pointer",
                transition: "all 0.25s cubic-bezier(0.25,0.46,0.45,0.94)",
              }}
            >
              <Home
                style={{
                  width: 20,
                  height: 20,
                  color: currentScreen === 'main' ? "#0ea5e9" : "#94a3b8",
                  transition: "color 0.25s cubic-bezier(0.25,0.46,0.45,0.94)",
                }}
              />
              <span
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: currentScreen === 'main' ? 500 : 300,
                  fontSize: 10,
                  color: currentScreen === 'main' ? "#0ea5e9" : "#94a3b8",
                  transition: "all 0.25s cubic-bezier(0.25,0.46,0.45,0.94)",
                }}
              >
                Home
              </span>
            </button>

            {/* Echo hero center button — raised above nav bar */}
            <button
              onClick={navigateToEchoConversation}
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                transform: "translateY(-16px)",
                background: `radial-gradient(circle at 40% 40%,
                  rgba(14, 165, 233, 0.35),
                  rgba(20, 184, 166, 0.28) 50%,
                  rgba(16, 185, 129, 0.2) 80%,
                  rgba(14, 165, 233, 0.12))`,
                backdropFilter: "blur(16px) saturate(1.6)",
                WebkitBackdropFilter: "blur(16px) saturate(1.6)",
                border: "1px solid rgba(255, 255, 255, 0.45)",
                boxShadow: [
                  "0 0 20px rgba(14, 165, 233, 0.3)",
                  "0 0 40px rgba(16, 185, 129, 0.15)",
                  "0 4px 16px rgba(0, 0, 20, 0.08)",
                  "inset 0 1px 0 rgba(255, 255, 255, 0.4)",
                  "inset 0 -1px 2px rgba(0, 0, 0, 0.03)",
                ].join(", "),
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.35s cubic-bezier(0.25,0.46,0.45,0.94)",
              }}
            >
              {/* Iridescent rim shimmer */}
              <div
                style={{
                  position: "absolute",
                  inset: -1,
                  borderRadius: "50%",
                  background: `conic-gradient(
                    from 180deg,
                    rgba(14, 165, 233, 0.25),
                    rgba(20, 184, 166, 0.2),
                    rgba(167, 139, 250, 0.15),
                    rgba(244, 114, 182, 0.12),
                    rgba(14, 165, 233, 0.25)
                  )`,
                  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  maskComposite: "exclude",
                  WebkitMaskComposite: "xor",
                  padding: 1.5,
                  pointerEvents: "none",
                  opacity: 0.8,
                }}
              />
              {/* Specular top highlight */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "10%",
                  right: "10%",
                  height: "1px",
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
                  pointerEvents: "none",
                }}
              />
              <Sparkles
                style={{
                  width: 24,
                  height: 24,
                  color: "#ffffff",
                  position: "relative",
                  zIndex: 1,
                  filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.15))",
                }}
              />
            </button>

            {/* Profile tab */}
            <button
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                padding: "6px 14px",
                borderRadius: 12,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                transition: "all 0.25s cubic-bezier(0.25,0.46,0.45,0.94)",
              }}
            >
              <User
                style={{
                  width: 20,
                  height: 20,
                  color: "#94a3b8",
                  transition: "color 0.25s cubic-bezier(0.25,0.46,0.45,0.94)",
                }}
              />
              <span
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 300,
                  fontSize: 10,
                  color: "#94a3b8",
                  transition: "all 0.25s cubic-bezier(0.25,0.46,0.45,0.94)",
                }}
              >
                Profile
              </span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
