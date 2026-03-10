"use client";

import { ChevronRight, Check } from 'lucide-react';
import { MiniOrb } from './mini-orb';
import { useAmbientAudio } from '../ambient-audio';

/* ── Glass panel styles ── */
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

const glassPanelElevated: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.12)",
  backdropFilter: "blur(12px) saturate(1.6)",
  WebkitBackdropFilter: "blur(12px) saturate(1.6)",
  borderRadius: 20,
  border: "1px solid rgba(255, 255, 255, 0.35)",
  boxShadow:
    "0 8px 40px rgba(0,0,20,0.08), 0 2px 8px rgba(0,0,20,0.05), inset 0 1px 0 0 rgba(255,255,255,0.4)",
  position: "relative",
  overflow: "hidden",
};

const glassPanelStandard: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.12)",
  backdropFilter: "blur(12px) saturate(1.6)",
  WebkitBackdropFilter: "blur(12px) saturate(1.6)",
  borderRadius: 20,
  border: "1px solid rgba(255, 255, 255, 0.35)",
  boxShadow:
    "0 4px 24px rgba(0,0,20,0.06), 0 1px 4px rgba(0,0,20,0.04), inset 0 1px 0 0 rgba(255,255,255,0.4)",
  position: "relative",
  overflow: "hidden",
};

const glassPanelSubtle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.06)",
  backdropFilter: "blur(12px) saturate(1.6)",
  WebkitBackdropFilter: "blur(12px) saturate(1.6)",
  borderRadius: 20,
  border: "1px solid rgba(255, 255, 255, 0.18)",
  boxShadow:
    "0 4px 24px rgba(0,0,20,0.06), 0 1px 4px rgba(0,0,20,0.04), inset 0 1px 0 0 rgba(255,255,255,0.4)",
  position: "relative",
  overflow: "hidden",
};

const font = "'Plus Jakarta Sans', sans-serif";

/* ── Mock data ── */
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const filledDays = [true, true, false, true, true, true, false]; // 5 of 7

const themes = [
  { name: "Work", count: 12 },
  { name: "Family", count: 8 },
  { name: "Creative", count: 6 },
];

const people = [
  { name: "Sarah", count: 5 },
  { name: "Mum", count: 3 },
  { name: "James", count: 2 },
];

const settingsRows = [
  { label: "Sound", type: "toggle" as const },
  { label: "Notification preferences", type: "chevron" as const },
  { label: "Export my data", type: "chevron" as const },
  { label: "About Project Echo", type: "chevron" as const },
];

/* ── GlassToggle (inline) ── */
function GlassToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: 52,
        height: 30,
        borderRadius: 15,
        cursor: "pointer",
        background: on ? "rgba(14, 165, 233, 0.12)" : "rgba(255, 255, 255, 0.04)",
        backdropFilter: "blur(16px) saturate(1.5)",
        WebkitBackdropFilter: "blur(16px) saturate(1.5)",
        border: `1px solid rgba(255, 255, 255, ${on ? 0.25 : 0.18})`,
        position: "relative",
        transition: "all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        boxShadow: on
          ? "0 1px 6px rgba(14, 165, 233, 0.1), inset 0 0.5px 0 rgba(255,255,255,0.15)"
          : "0 1px 4px rgba(0,0,0,0.03)",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          background: on ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.6)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          position: "absolute",
          top: 2,
          left: on ? 25 : 2,
          transition: "all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.06)",
        }}
      />
    </div>
  );
}

/* ── Profile Screen ── */
export function ProfileScreen() {
  const { isMuted, toggleMute } = useAmbientAudio();

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "0 auto",
        width: "100%",
        padding: 16,
        paddingBottom: 88,
        fontFamily: font,
      }}
    >
      {/* ── Echo Identity Card ── */}
      <div style={{ ...glassPanelElevated, padding: 24, marginBottom: 12 }}>
        <div style={specularHighlight} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          {/* MiniOrb avatar */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              overflow: "hidden",
              border: "1px solid rgba(255, 255, 255, 0.45)",
              boxShadow:
                "0 0 20px rgba(14, 165, 233, 0.25), 0 4px 12px rgba(0,0,20,0.08)",
            }}
          >
            <MiniOrb size={64} />
          </div>

          {/* Name */}
          <span
            style={{
              fontWeight: 700,
              fontSize: 22,
              color: "#0f172a",
              letterSpacing: "-0.02em",
            }}
          >
            Imran
          </span>

          {/* Member since */}
          <span
            style={{
              fontWeight: 300,
              fontSize: 12,
              color: "#94a3b8",
            }}
          >
            Echo member since March 2026
          </span>

          {/* Memories count */}
          <span
            style={{
              fontWeight: 300,
              fontSize: 13,
              color: "#475569",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#10b981",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            23 memories captured
          </span>
        </div>
      </div>

      {/* ── Streak & Consistency Card ── */}
      <div style={{ ...glassPanelStandard, padding: 16, marginBottom: 12 }}>
        <div style={specularHighlight} />
        <span
          style={{
            fontWeight: 600,
            fontSize: 15,
            color: "#0f172a",
            display: "block",
            marginBottom: 12,
          }}
        >
          Your rhythm
        </span>

        {/* Day circles */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 6,
            marginBottom: 10,
          }}
        >
          {weekDays.map((day, i) => (
            <div
              key={day}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: filledDays[i]
                    ? "rgba(16, 185, 129, 0.15)"
                    : "rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                }}
              >
                {filledDays[i] && (
                  <Check
                    style={{ width: 14, height: 14, color: "#10b981" }}
                  />
                )}
              </div>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 300,
                  color: "#94a3b8",
                }}
              >
                {day}
              </span>
            </div>
          ))}
        </div>

        <span
          style={{
            fontWeight: 300,
            fontSize: 12,
            color: "#475569",
          }}
        >
          5 of 7 days this week
        </span>
      </div>

      {/* ── Emotional Insights Card ── */}
      <div style={{ ...glassPanelStandard, padding: 16, marginBottom: 12 }}>
        <div style={specularHighlight} />
        <span
          style={{
            fontWeight: 600,
            fontSize: 15,
            color: "#0f172a",
            display: "block",
            marginBottom: 12,
          }}
        >
          This month
        </span>

        {/* Stat row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontWeight: 300,
              fontSize: 13,
              color: "#475569",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#10b981",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            34 gratitudes
          </span>
          <span
            style={{
              fontWeight: 300,
              fontSize: 13,
              color: "#475569",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#0ea5e9",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            8 frustrations
          </span>
        </div>

        {/* Ratio bar */}
        <div
          style={{
            height: 6,
            borderRadius: 3,
            background: "rgba(255, 255, 255, 0.08)",
            overflow: "hidden",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              height: "100%",
            }}
          >
            <div
              style={{
                width: "80%",
                height: "100%",
                background: "#10b981",
                borderRadius: "3px 0 0 3px",
              }}
            />
            <div
              style={{
                width: "20%",
                height: "100%",
                background: "#0ea5e9",
                borderRadius: "0 3px 3px 0",
              }}
            />
          </div>
        </div>

        <span
          style={{
            fontWeight: 300,
            fontSize: 12,
            color: "#475569",
            fontStyle: "italic",
          }}
        >
          Your gratitude ratio is 4:1 — that&apos;s excellent
        </span>
      </div>

      {/* ── Top Themes Card ── */}
      <div style={{ ...glassPanelSubtle, padding: 16, marginBottom: 12 }}>
        <div style={specularHighlight} />
        <span
          style={{
            fontWeight: 500,
            fontSize: 13,
            color: "#0f172a",
            display: "block",
            marginBottom: 10,
          }}
        >
          Top themes
        </span>
        {themes.map((theme, i) => (
          <div
            key={theme.name}
            style={{
              fontWeight: 300,
              fontSize: 13,
              color: "#475569",
              marginBottom: i < themes.length - 1 ? 6 : 0,
            }}
          >
            {theme.name} —{" "}
            <span style={{ fontWeight: 500 }}>{theme.count} mentions</span>
          </div>
        ))}
      </div>

      {/* ── People Card ── */}
      <div style={{ ...glassPanelSubtle, padding: 16, marginBottom: 12 }}>
        <div style={specularHighlight} />
        <span
          style={{
            fontWeight: 500,
            fontSize: 13,
            color: "#0f172a",
            display: "block",
            marginBottom: 10,
          }}
        >
          People in your story
        </span>
        {people.map((person, i) => (
          <div
            key={person.name}
            style={{
              fontWeight: 300,
              fontSize: 13,
              color: "#475569",
              marginBottom: i < people.length - 1 ? 6 : 0,
            }}
          >
            {person.name} —{" "}
            <span style={{ fontWeight: 500 }}>{person.count} memories</span>
          </div>
        ))}
      </div>

      {/* ── Settings Section ── */}
      <div style={{ ...glassPanelStandard, padding: 0, marginBottom: 12 }}>
        <div style={specularHighlight} />
        {settingsRows.map((row, i) => (
          <div
            key={row.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 16,
              borderBottom:
                i < settingsRows.length - 1
                  ? "1px solid rgba(255, 255, 255, 0.1)"
                  : "none",
              cursor: row.type === "chevron" ? "pointer" : undefined,
            }}
          >
            <span
              style={{
                fontWeight: 300,
                fontSize: 14,
                color: "#0f172a",
              }}
            >
              {row.label}
            </span>
            {row.type === "toggle" ? (
              <GlassToggle on={!isMuted} onToggle={toggleMute} />
            ) : (
              <ChevronRight
                style={{
                  width: 16,
                  height: 16,
                  color: "#94a3b8",
                  flexShrink: 0,
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* ── Charity Card ── */}
      <div style={{ ...glassPanelSubtle, padding: 20, marginTop: 8 }}>
        <div style={specularHighlight} />
        <p
          style={{
            fontWeight: 300,
            fontSize: 13,
            color: "#475569",
            fontStyle: "italic",
            lineHeight: 1.6,
            textAlign: "center",
            margin: 0,
            marginBottom: 8,
          }}
        >
          Project Echo was built because someone&apos;s mother started to forget. A
          portion of everything we earn goes to helping families facing the same
          thing.
        </p>
        <p
          style={{
            fontWeight: 300,
            fontSize: 11,
            color: "#94a3b8",
            textAlign: "center",
            margin: 0,
          }}
        >
          projectecho.me
        </p>
      </div>
    </div>
  );
}
