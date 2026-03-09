"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Search } from 'lucide-react';

const easing = [0.25, 0.46, 0.45, 0.94] as const;

// ── Mock data ──────────────────────────────────────────────────────────────

interface MockMemory {
  id: string;
  date: string;          // ISO
  summary: string;
  tags: string[];
  people: string[];
  emotion: string;       // emoji
}

const MOCK_MEMORIES: MockMemory[] = [
  // March 2026
  { id: "m1",  date: "2026-03-08T09:15:00", summary: "Productive morning on Project Echo. Finally cracked the animation system and everything feels smooth now.", tags: ["Productive", "Work", "Creative"], people: ["Sarah"], emotion: "😊" },
  { id: "m2",  date: "2026-03-07T20:30:00", summary: "Long phone call with Mum. She told me about the garden — the daffodils are coming in early this year.", tags: ["Family", "Grateful"], people: ["Mum"], emotion: "🥰" },
  { id: "m3",  date: "2026-03-06T14:00:00", summary: "Frustrated with a production bug that kept reappearing. Spent three hours only to find a one-line fix.", tags: ["Work", "Frustrated"], people: [], emotion: "😤" },
  { id: "m4",  date: "2026-03-05T18:45:00", summary: "Walked through the park after work. The light through the trees felt cinematic. Grateful for moments like that.", tags: ["Grateful", "Reflective", "Personal Growth"], people: [], emotion: "😌" },
  { id: "m5",  date: "2026-03-04T10:00:00", summary: "Brainstorming session with James about the memory receipt feature. We sketched something beautiful on the whiteboard.", tags: ["Work", "Creative", "Productive"], people: ["James"], emotion: "😊" },
  { id: "m6",  date: "2026-03-03T21:00:00", summary: "Couldn't sleep. Wrote down some thoughts about where I want to be in five years. Scary but clarifying.", tags: ["Reflective", "Personal Growth"], people: [], emotion: "🤔" },
  { id: "m7",  date: "2026-03-02T12:30:00", summary: "Cooked lunch for the first time in weeks. Simple pasta but it felt like a small victory.", tags: ["Grateful", "Personal Growth"], people: [], emotion: "😊" },
  { id: "m8",  date: "2026-03-01T16:00:00", summary: "Team demo went well. Sarah said it was the best iteration yet. Felt proud of what we built together.", tags: ["Work", "Productive", "Grateful"], people: ["Sarah", "James"], emotion: "🥰" },
  // February 2026
  { id: "m9",  date: "2026-02-28T19:00:00", summary: "Dinner with James. We talked about old university days and how much has changed. Bittersweet evening.", tags: ["Family", "Reflective"], people: ["James"], emotion: "🤔" },
  { id: "m10", date: "2026-02-26T08:30:00", summary: "Morning run in the cold. Lungs burned but my head was clear for the first time this week.", tags: ["Personal Growth", "Grateful"], people: [], emotion: "😌" },
  { id: "m11", date: "2026-02-24T14:15:00", summary: "Got critical feedback on my design proposal. Stung at first but they were right. Rewrote the whole thing.", tags: ["Work", "Frustrated", "Reflective"], people: ["Sarah"], emotion: "😤" },
  { id: "m12", date: "2026-02-22T20:00:00", summary: "Mum's birthday video call. She cried when we all sang. Reminded me how little it takes to make someone's day.", tags: ["Family", "Grateful"], people: ["Mum"], emotion: "🥰" },
  { id: "m13", date: "2026-02-19T11:00:00", summary: "Quiet day. Read half a book and barely looked at my phone. Felt like a luxury.", tags: ["Reflective", "Personal Growth"], people: [], emotion: "😌" },
  { id: "m14", date: "2026-02-15T17:30:00", summary: "Paired with Sarah on the conversation flow. We finished in half the time I expected. Good creative energy.", tags: ["Work", "Productive", "Creative"], people: ["Sarah"], emotion: "😊" },
  { id: "m15", date: "2026-02-12T09:45:00", summary: "Woke up anxious for no reason. Journaling helped — writing things down took the edge off.", tags: ["Reflective", "Personal Growth", "Frustrated"], people: [], emotion: "🤔" },
];

const FILTER_OPTIONS = ["All", "Grateful", "Work", "Family", "Personal Growth", "People"] as const;

// ── Specular highlight ─────────────────────────────────────────────────────

const specularHighlight: React.CSSProperties = {
  position: "absolute",
  top: 0, left: 0, right: 0,
  height: "1px",
  background: "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.4) 15%, rgba(255,255,255,0.7) 35%, rgba(255,255,255,0.7) 65%, rgba(255,255,255,0.4) 85%, transparent 95%)",
  borderRadius: "20px 20px 0 0",
  pointerEvents: "none",
  zIndex: 2,
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function groupByMonth(memories: MockMemory[]): { label: string; key: string; items: MockMemory[] }[] {
  const map = new Map<string, MockMemory[]>();
  for (const m of memories) {
    const d = new Date(m.date);
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
    const arr = map.get(key) ?? [];
    arr.push(m);
    map.set(key, arr);
  }
  return Array.from(map.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, items]) => {
      const d = new Date(items[0].date);
      const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      return { label, key, items };
    });
}

function monthStats(items: MockMemory[]) {
  const gratitudes = items.filter(m => m.tags.includes("Grateful")).length;
  const frustrations = items.filter(m => m.tags.includes("Frustrated")).length;
  return { entries: items.length, gratitudes, frustrations };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Component ──────────────────────────────────────────────────────────────

interface MemoryTimelineScreenProps {
  onBack: () => void;
  onSelectMemory: (id: string) => void;
}

export function MemoryTimelineScreen({ onBack, onSelectMemory }: MemoryTimelineScreenProps) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const filtered = useMemo(() => {
    let list = MOCK_MEMORIES;

    // search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        m =>
          m.summary.toLowerCase().includes(q) ||
          m.tags.some(t => t.toLowerCase().includes(q)) ||
          m.people.some(p => p.toLowerCase().includes(q)),
      );
    }

    // filter pills
    if (activeFilter !== "All") {
      if (activeFilter === "People") {
        list = list.filter(m => m.people.length > 0);
      } else {
        list = list.filter(m => m.tags.includes(activeFilter));
      }
    }

    return list;
  }, [search, activeFilter]);

  const groups = useMemo(() => groupByMonth(filtered), [filtered]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: easing }}
      className="fixed inset-0 z-10 flex flex-col overflow-hidden"
    >
      {/* ── Sticky header area ── */}
      <div
        className="relative z-20 flex-shrink-0 px-4 pt-4 pb-3"
        style={{
          background: "rgba(255, 255, 255, 0.06)",
          backdropFilter: "blur(16px) saturate(1.6)",
          WebkitBackdropFilter: "blur(16px) saturate(1.6)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.18)",
        }}
      >
        {/* Back + Title */}
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="glass-button glass-button-sm flex items-center"
            style={{ padding: "8px 12px", fontSize: 13 }}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: 26,
                color: "#0f172a",
                letterSpacing: "-0.025em",
                lineHeight: 1.2,
              }}
            >
              Your Memories
            </h1>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 300,
                fontSize: 13,
                color: "#94a3b8",
                marginTop: 2,
              }}
            >
              {MOCK_MEMORIES.length} memories captured
            </p>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 12 }}>
          <Search
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              width: 16,
              height: 16,
              color: "#94a3b8",
              zIndex: 2,
            }}
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search memories, people, feelings..."
            style={{
              width: "100%",
              background: "rgba(255, 255, 255, 0.06)",
              backdropFilter: "blur(8px) saturate(1.4)",
              WebkitBackdropFilter: "blur(8px) saturate(1.4)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              borderRadius: 14,
              padding: "12px 14px 12px 40px",
              color: "#0f172a",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 300,
              fontSize: 14,
              outline: "none",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.03)",
              boxSizing: "border-box" as const,
            }}
          />
        </div>

        {/* Filter pills */}
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {FILTER_OPTIONS.map(f => {
            const active = activeFilter === f;
            return (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  flexShrink: 0,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 500,
                  fontSize: 12,
                  padding: "7px 16px",
                  borderRadius: 999,
                  border: `1px solid rgba(255, 255, 255, ${active ? 0.45 : 0.3})`,
                  background: active
                    ? "rgba(14, 165, 233, 0.09)"
                    : "rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(16px) saturate(1.6)",
                  WebkitBackdropFilter: "blur(16px) saturate(1.6)",
                  color: active ? "#0284c7" : "#475569",
                  cursor: "pointer",
                  transition: "all 0.35s cubic-bezier(0.25,0.46,0.45,0.94)",
                  boxShadow: active
                    ? "0 2px 12px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.4)"
                    : "0 1px 4px rgba(0,0,0,0.03)",
                }}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Scrollable timeline ── */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8">
        <AnimatePresence mode="wait">
          {groups.length === 0 ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 300,
                fontSize: 15,
                color: "#94a3b8",
                textAlign: "center",
                marginTop: 60,
              }}
            >
              No memories match your search.
            </motion.p>
          ) : (
            <motion.div
              key={`${activeFilter}-${search}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: easing }}
              className="max-w-lg mx-auto"
            >
              {groups.map(group => {
                const stats = monthStats(group.items);
                return (
                  <div key={group.key} style={{ marginBottom: 28 }}>
                    {/* Month header */}
                    <div style={{ marginBottom: 12 }}>
                      <h2
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 600,
                          fontSize: 17,
                          color: "#0f172a",
                          lineHeight: 1.3,
                        }}
                      >
                        {group.label}
                      </h2>
                      <p
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 300,
                          fontSize: 11,
                          color: "#94a3b8",
                          marginTop: 2,
                        }}
                      >
                        {stats.entries} {stats.entries === 1 ? "entry" : "entries"} · {stats.gratitudes} gratitude{stats.gratitudes !== 1 ? "s" : ""} · {stats.frustrations} frustration{stats.frustrations !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {/* Cards */}
                    <div className="flex flex-col" style={{ gap: 12 }}>
                      {group.items.map((memory, idx) => (
                        <motion.div
                          key={memory.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, ease: easing, delay: idx * 0.04 }}
                          onClick={() => onSelectMemory(memory.id)}
                          style={{
                            background: "rgba(255, 255, 255, 0.12)",
                            backdropFilter: "blur(12px) saturate(1.6)",
                            WebkitBackdropFilter: "blur(12px) saturate(1.6)",
                            border: "1px solid rgba(255, 255, 255, 0.35)",
                            borderRadius: 20,
                            padding: 16,
                            boxShadow:
                              "0 4px 24px rgba(0,0,20,0.06), 0 1px 4px rgba(0,0,20,0.04), inset 0 1px 0 0 rgba(255,255,255,0.4)",
                            position: "relative",
                            overflow: "hidden",
                            cursor: "pointer",
                            transition: "all 0.35s cubic-bezier(0.25,0.46,0.45,0.94)",
                          }}
                        >
                          {/* Specular highlight */}
                          <div style={specularHighlight} />

                          {/* Date + emotion */}
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
                                fontWeight: 300,
                                fontSize: 11,
                                color: "#94a3b8",
                              }}
                            >
                              {formatDate(memory.date)}
                            </span>
                            <span style={{ fontSize: 16 }}>{memory.emotion}</span>
                          </div>

                          {/* Summary */}
                          <p
                            style={{
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                              fontWeight: 300,
                              fontSize: 14,
                              color: "#475569",
                              lineHeight: 1.5,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              marginBottom: 10,
                            }}
                          >
                            {memory.summary}
                          </p>

                          {/* Tags + people */}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                            {memory.tags.map(tag => (
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
                            {memory.people.map(p => (
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
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
