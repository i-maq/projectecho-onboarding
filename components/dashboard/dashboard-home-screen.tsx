"use client";

import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Mic, BookOpen } from 'lucide-react';

const easing = [0.25, 0.46, 0.45, 0.94] as const;

// ── Shared styles ──────────────────────────────────────────────────────────

const specularHighlight: React.CSSProperties = {
  position: "absolute",
  top: 0, left: 0, right: 0,
  height: "1px",
  background:
    "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.4) 15%, rgba(255,255,255,0.7) 35%, rgba(255,255,255,0.7) 65%, rgba(255,255,255,0.4) 85%, transparent 95%)",
  borderRadius: "20px 20px 0 0",
  pointerEvents: "none",
  zIndex: 2,
};

const glassPanelBase: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.12)",
  backdropFilter: "blur(12px) saturate(1.6)",
  WebkitBackdropFilter: "blur(12px) saturate(1.6)",
  border: "1px solid rgba(255, 255, 255, 0.35)",
  borderRadius: 20,
  position: "relative",
  overflow: "hidden",
};

const glassPanelElevated: React.CSSProperties = {
  ...glassPanelBase,
  boxShadow:
    "0 8px 40px rgba(0,0,20,0.08), 0 2px 8px rgba(0,0,20,0.05), inset 0 1px 0 0 rgba(255,255,255,0.4)",
};

const glassPanelSubtle: React.CSSProperties = {
  ...glassPanelBase,
  background: "rgba(255, 255, 255, 0.06)",
  border: "1px solid rgba(255, 255, 255, 0.18)",
  boxShadow:
    "0 4px 24px rgba(0,0,20,0.06), 0 1px 4px rgba(0,0,20,0.04), inset 0 1px 0 0 rgba(255,255,255,0.4)",
};

// ── Mock data ──────────────────────────────────────────────────────────────

const MOCK_RECENT = {
  date: "Mar 7",
  label: "Yesterday's echo",
  summary:
    "Productive morning on Project Echo. Finally cracked the animation system and everything feels smooth now.",
  tags: ["Productive", "Work", "Creative"],
  people: ["Sarah"],
};

const STREAK_DAYS = 5;
const STREAK_MAX = 7;

// ── Helpers ────────────────────────────────────────────────────────────────

function getGreeting(): { greeting: string; subtitle: string } {
  const h = new Date().getHours();
  if (h < 12) return { greeting: "Good morning, Imran", subtitle: "Start your day with a thought" };
  if (h < 18) return { greeting: "Good afternoon, Imran", subtitle: "How's today going?" };
  return { greeting: "Good evening, Imran", subtitle: "Ready to capture today?" };
}

// ── Component ──────────────────────────────────────────────────────────────

interface DashboardHomeScreenProps {
  onCreateMemory: () => void;
  onViewMemories: () => void;
  onViewReceipt: () => void;
}

export function DashboardHomeScreen({
  onCreateMemory,
  onViewMemories,
  onViewReceipt,
}: DashboardHomeScreenProps) {
  const { greeting, subtitle } = useMemo(getGreeting, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: easing }}
      className="flex flex-col gap-4"
      style={{ maxWidth: 400, margin: "0 auto", width: "100%", padding: "0 0 16px" }}
    >
      {/* ── Echo greeting card (elevated) ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: easing }}
        style={{ ...glassPanelElevated, padding: 20 }}
      >
        <div style={specularHighlight} />
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Mini Echo avatar */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              flexShrink: 0,
              background: `radial-gradient(circle at 40% 40%,
                rgba(14, 165, 233, 0.25),
                rgba(20, 184, 166, 0.2) 50%,
                rgba(16, 185, 129, 0.15) 80%,
                transparent)`,
              backdropFilter: "blur(8px) saturate(1.4)",
              WebkitBackdropFilter: "blur(8px) saturate(1.4)",
              border: "1px solid rgba(255, 255, 255, 0.35)",
              boxShadow:
                "0 2px 12px rgba(0,0,20,0.06), inset 0 1px 0 rgba(255,255,255,0.4)",
            }}
          />
          <div>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 600,
                fontSize: 17,
                color: "#0f172a",
                lineHeight: 1.3,
              }}
            >
              {greeting}
            </p>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 300,
                fontSize: 14,
                color: "#475569",
                marginTop: 2,
              }}
            >
              {subtitle}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Action cards (2-column grid) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Create Memory */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: easing, delay: 0.06 }}
          whileTap={{ scale: 0.97 }}
          onClick={onCreateMemory}
          style={{ ...glassPanelBase, padding: 16, cursor: "pointer", boxShadow: "0 4px 24px rgba(0,0,20,0.06), 0 1px 4px rgba(0,0,20,0.04), inset 0 1px 0 0 rgba(255,255,255,0.4)" }}
        >
          <div style={specularHighlight} />
          <Mic style={{ width: 24, height: 24, color: "#0ea5e9", marginBottom: 10 }} />
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 500,
              fontSize: 13,
              color: "#0f172a",
              marginBottom: 2,
            }}
          >
            Create Memory
          </p>
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 300,
              fontSize: 11,
              color: "#94a3b8",
            }}
          >
            Record today
          </p>
        </motion.div>

        {/* View Memories */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: easing, delay: 0.1 }}
          whileTap={{ scale: 0.97 }}
          onClick={onViewMemories}
          style={{ ...glassPanelBase, padding: 16, cursor: "pointer", boxShadow: "0 4px 24px rgba(0,0,20,0.06), 0 1px 4px rgba(0,0,20,0.04), inset 0 1px 0 0 rgba(255,255,255,0.4)" }}
        >
          <div style={specularHighlight} />
          <BookOpen style={{ width: 24, height: 24, color: "#0ea5e9", marginBottom: 10 }} />
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 500,
              fontSize: 13,
              color: "#0f172a",
              marginBottom: 2,
            }}
          >
            View Memories
          </p>
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 300,
              fontSize: 11,
              color: "#94a3b8",
            }}
          >
            Browse timeline
          </p>
        </motion.div>
      </div>

      {/* ── Daily streak card (subtle) ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: easing, delay: 0.14 }}
        style={{ ...glassPanelSubtle, padding: 16 }}
      >
        <div style={specularHighlight} />
        <p
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 500,
            fontSize: 14,
            color: "#0f172a",
            marginBottom: 10,
          }}
        >
          🔥 {STREAK_DAYS} day streak
        </p>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {Array.from({ length: STREAK_MAX }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background:
                  i < STREAK_DAYS
                    ? "#10b981"
                    : "rgba(255, 255, 255, 0.15)",
                transition: "background 0.35s cubic-bezier(0.25,0.46,0.45,0.94)",
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* ── Recent memory card (subtle) ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: easing, delay: 0.18 }}
        onClick={onViewReceipt}
        style={{ ...glassPanelSubtle, padding: 16, cursor: "pointer" }}
      >
        <div style={specularHighlight} />
        {/* Header row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 500,
              fontSize: 13,
              color: "#0f172a",
            }}
          >
            {MOCK_RECENT.label}
          </span>
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 300,
              fontSize: 11,
              color: "#94a3b8",
            }}
          >
            {MOCK_RECENT.date}
          </span>
        </div>

        {/* Summary */}
        <p
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 300,
            fontSize: 13,
            color: "#475569",
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            marginBottom: 10,
          }}
        >
          {MOCK_RECENT.summary}
        </p>

        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {MOCK_RECENT.tags.map(tag => (
            <span
              key={tag}
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 500,
                fontSize: 10,
                color: "#0ea5e9",
                background: "rgba(14, 165, 233, 0.08)",
                padding: "3px 10px",
                borderRadius: 999,
              }}
            >
              {tag}
            </span>
          ))}
          {MOCK_RECENT.people.map(p => (
            <span
              key={p}
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 500,
                fontSize: 10,
                color: "#10b981",
                background: "rgba(16, 185, 129, 0.08)",
                padding: "3px 10px",
                borderRadius: 999,
              }}
            >
              {p}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
