"use client";

import { motion } from 'motion/react';
import { Check } from 'lucide-react';

const easing = [0.25, 0.46, 0.45, 0.94] as const;

const MOCK_RECEIPT = {
  summary:
    "You talked about a productive morning working on Project Echo. You mentioned feeling good about the progress and expressed gratitude for the creative momentum. A conversation with Sarah sparked a breakthrough idea.",
  themes: ["Productive", "Work", "Gratitude", "Creative"],
  people: ["Sarah", "James"],
  emotion: { emoji: "😊", label: "Positive & Reflective" },
  gratitudeCount: 2,
  durationMin: 3,
};

// Shared glass styles
const glassPanel = {
  background: "rgba(255, 255, 255, 0.12)",
  backdropFilter: "blur(12px) saturate(1.6)",
  WebkitBackdropFilter: "blur(12px) saturate(1.6)",
  border: "1px solid rgba(255, 255, 255, 0.35)",
  borderRadius: 20,
  boxShadow:
    "0 8px 40px rgba(0,0,20,0.08), 0 2px 8px rgba(0,0,20,0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.4)",
  position: "relative" as const,
  overflow: "hidden" as const,
};

const specularHighlight: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: "1px",
  background:
    "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.4) 15%, rgba(255,255,255,0.7) 35%, rgba(255,255,255,0.7) 65%, rgba(255,255,255,0.4) 85%, transparent 95%)",
  borderRadius: "20px 20px 0 0",
  pointerEvents: "none",
  zIndex: 2,
};

interface MemoryReceiptScreenProps {
  onAddMore: () => void;
  onDone: () => void;
}

export function MemoryReceiptScreen({ onAddMore, onDone }: MemoryReceiptScreenProps) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: easing }}
      className="flex-1 flex items-center justify-center px-4 py-8 overflow-y-auto"
      style={{ position: 'relative', zIndex: 1, paddingBottom: 88 }}
    >
      {/* Receipt card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: easing }}
        style={{
          ...glassPanel,
          width: "100%",
          maxWidth: 400,
          padding: "28px 24px",
        }}
      >
        {/* Specular highlight */}
        <div style={specularHighlight} />

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.12)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Check style={{ width: 14, height: 14, color: "#10b981" }} />
            </div>
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 600,
                fontSize: 20,
                color: "#10b981",
              }}
            >
              Memory Saved
            </span>
          </div>
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 300,
              fontSize: 12,
              color: "#94a3b8",
            }}
          >
            {dateStr} · {MOCK_RECEIPT.durationMin} min session
          </p>
        </div>

        {/* Summary */}
        <p
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 300,
            fontSize: 15,
            color: "#475569",
            lineHeight: 1.6,
            marginBottom: 20,
          }}
        >
          {MOCK_RECEIPT.summary}
        </p>

        {/* Themes */}
        <div style={{ marginBottom: 16 }}>
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 500,
              fontSize: 13,
              color: "#0f172a",
              marginBottom: 8,
            }}
          >
            Themes
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {MOCK_RECEIPT.themes.map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 500,
                  fontSize: 11,
                  color: "#0ea5e9",
                  background: "rgba(14, 165, 233, 0.08)",
                  padding: "4px 12px",
                  borderRadius: 999,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* People mentioned */}
        <div style={{ marginBottom: 16 }}>
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 500,
              fontSize: 13,
              color: "#0f172a",
              marginBottom: 8,
            }}
          >
            People mentioned
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {MOCK_RECEIPT.people.map((name) => (
              <span
                key={name}
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 500,
                  fontSize: 11,
                  color: "#10b981",
                  background: "rgba(16, 185, 129, 0.08)",
                  padding: "4px 12px",
                  borderRadius: 999,
                }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Emotion indicator */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.06)",
            backdropFilter: "blur(8px) saturate(1.4)",
            WebkitBackdropFilter: "blur(8px) saturate(1.4)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            borderRadius: 14,
            padding: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 18 }}>{MOCK_RECEIPT.emotion.emoji}</span>
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 300,
              fontSize: 13,
              color: "#475569",
            }}
          >
            {MOCK_RECEIPT.emotion.label}
          </span>
        </div>

        {/* Gratitude count */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#10b981",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 300,
              fontSize: 13,
              color: "#475569",
            }}
          >
            Gratitudes: {MOCK_RECEIPT.gratitudeCount}
          </span>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: "rgba(255, 255, 255, 0.2)",
            margin: "16px 0",
          }}
        />

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onAddMore}
            className="glass-button text-button"
            style={{ flex: 1, padding: "12px 16px", fontSize: 14 }}
          >
            Add More
          </button>
          <button
            onClick={onDone}
            className="glass-button glass-button-primary text-button"
            style={{ flex: 1, padding: "12px 16px", fontSize: 14 }}
          >
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
