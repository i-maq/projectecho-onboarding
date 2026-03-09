"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, User } from 'lucide-react';
import { MiniOrb } from './mini-orb';
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

// Only echo conversation is a full-screen immersive overlay (hides nav)
const OVERLAY_SCREENS: DashboardScreen[] = ['echoConversation'];

// In-shell screens that show inside the nav layout (nav stays visible)
const IN_SHELL_FULL_SCREENS: DashboardScreen[] = ['memoryTimeline', 'memoryReceipt'];


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
  const isHomeTabActive = currentScreen === 'main' || currentScreen === 'memoryTimeline' || currentScreen === 'memoryReceipt';

  return (
    <div className="min-h-[100dvh] flex flex-col text-gray-800" style={{ background: 'transparent' }}>
      {/* ── Main content area ── */}
      {!isOverlay && !IN_SHELL_FULL_SCREENS.includes(currentScreen) && (
        <div
          className="flex-1 overflow-y-auto"
          style={{ paddingBottom: 80 }}
        >
          <div className="p-4" style={{ maxWidth: 400, margin: '0 auto', width: '100%' }}>
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
      )}

      {/* ── In-shell full screens (nav stays visible, own layout) ── */}
      {currentScreen === 'memoryTimeline' && (
        <MemoryTimelineScreen onBack={navigateToMain} onSelectMemory={() => navigateToMemoryReceipt()} />
      )}
      {currentScreen === 'memoryReceipt' && (
        <MemoryReceiptScreen onAddMore={navigateToEchoConversation} onDone={navigateToMain} />
      )}

      {/* ── Full-screen overlay (hides nav) ── */}
      <AnimatePresence>
        {currentScreen === 'echoConversation' && (
          <EchoConversationScreen onBack={navigateToMain} onViewReceipt={navigateToMemoryReceipt} />
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
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            {/* Home tab — 25% width */}
            <button
              onClick={navigateToMain}
              style={{
                flex: "0 0 25%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                padding: "6px 0",
                borderRadius: 12,
                background: isHomeTabActive ? "rgba(14, 165, 233, 0.08)" : "transparent",
                border: "none",
                cursor: "pointer",
                transition: "all 0.25s cubic-bezier(0.25,0.46,0.45,0.94)",
              }}
            >
              <Home
                style={{
                  width: 20,
                  height: 20,
                  color: isHomeTabActive ? "#0ea5e9" : "#94a3b8",
                  transition: "color 0.25s cubic-bezier(0.25,0.46,0.45,0.94)",
                }}
              />
              <span
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: isHomeTabActive ? 500 : 300,
                  fontSize: 10,
                  color: isHomeTabActive ? "#0ea5e9" : "#94a3b8",
                  transition: "all 0.25s cubic-bezier(0.25,0.46,0.45,0.94)",
                }}
              >
                Home
              </span>
            </button>

            {/* Echo hero center — 50% width, 64px orb raised above nav */}
            <div
              style={{
                flex: "0 0 50%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* Button wrapper — raised above nav, contains button + ripples + glow */}
              <div
                style={{
                  position: "relative",
                  width: 64,
                  height: 64,
                  transform: "translateY(-20px)",
                }}
              >
                {/* Pool-of-light radial glow behind the Echo button */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 120,
                    height: 120,
                    background: "radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, rgba(16, 185, 129, 0.06) 40%, transparent 70%)",
                    borderRadius: "50%",
                    pointerEvents: "none",
                    zIndex: 0,
                  }}
                />

                {/* Concentric ripple rings pulsing outward from button center */}
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={`echo-ripple-${i}`}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      width: 64,
                      height: 64,
                      marginTop: -32,
                      marginLeft: -32,
                      borderRadius: "50%",
                      boxShadow: "inset 0 0 0 1px rgba(14, 165, 233, 0.25)",
                      animation: `echo-btn-ripple 4s ${i}s infinite cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
                      pointerEvents: "none",
                      zIndex: 1,
                      willChange: "transform, opacity",
                    }}
                  />
                ))}

                <button
                  onClick={navigateToEchoConversation}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    border: "1px solid rgba(255, 255, 255, 0.45)",
                    boxShadow: [
                      "0 0 30px rgba(14, 165, 233, 0.4)",
                      "0 0 60px rgba(16, 185, 129, 0.2)",
                      "0 4px 16px rgba(0, 0, 20, 0.1)",
                    ].join(", "),
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    padding: 0,
                    background: "transparent",
                    display: "block",
                    transition: "all 0.35s cubic-bezier(0.25,0.46,0.45,0.94)",
                    zIndex: 2,
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
                        rgba(14, 165, 233, 0.3),
                        rgba(20, 184, 166, 0.25),
                        rgba(167, 139, 250, 0.18),
                        rgba(244, 114, 182, 0.14),
                        rgba(14, 165, 233, 0.3)
                      )`,
                      mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                      WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                      maskComposite: "exclude",
                      WebkitMaskComposite: "xor",
                      padding: 1.5,
                      pointerEvents: "none",
                      opacity: 0.9,
                      zIndex: 3,
                    }}
                  />
                  {/* MiniOrb canvas fills the button */}
                  <MiniOrb size={64} />
                </button>
              </div>
              <span
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 500,
                  fontSize: 10,
                  color: "#0ea5e9",
                  marginTop: -14,
                  position: "relative",
                  zIndex: 2,
                }}
              >
                Echo
              </span>
            </div>

            {/* Profile tab — 25% width */}
            <button
              style={{
                flex: "0 0 25%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                padding: "6px 0",
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
