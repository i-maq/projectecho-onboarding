# Project Echo — Complete Design System Migration Prompt for Claude Code

> **Purpose:** Feed this entire document to Claude Code as a single prompt (or add it to your CLAUDE.md / project instructions) so it has complete design context when refactoring every screen, component, and UI element in the Project Echo codebase.
>
> **Repository:** `i-maq/projectecho-onboarding` — Live branch
> **Domain:** projectecho.me (Netlify-hosted)
> **Stack:** Next.js 13 App Router, TypeScript, Tailwind CSS, Framer Motion, Radix/shadcn

---

## TASK

Migrate the entire Project Echo application from its current design (neumorphic/purple/Poppins) to the **Liquid Glass v3** design system defined below. Every screen, component, button, panel, input, card, navigation element, toggle, and background must be updated. The result should feel like Apple's Liquid Glass aesthetic (WWDC 2025 / iOS 26) — translucent, alive, minimal.

---

## 1. DESIGN PHILOSOPHY — WHAT THIS IS AND ISN'T

### ✅ THIS IS:
- **Apple Liquid Glass (iOS 26)** — translucent surfaces defined by backdrop-blur distortion, not fills
- Calm, serene, "lo-fi sci-fi" — an interface from 2076
- Light mode only with white base `#ffffff` and coloured aurora blobs drifting behind
- Buttons are near-invisible glass lenses — you see them because they distort what's behind them
- Panels are translucent glass sheets with specular top-edge highlights and single soft drop shadows
- Everything feels like it's floating in a luminous atmosphere

### ❌ THIS IS NOT:
- **NOT neumorphic** — never use dual shadows (white top-left + coloured bottom-right). This was the old design. Kill it everywhere.
- **NOT opaque button fills** — no `linear-gradient(180deg, #f6f7fa, #eceef3)` style raised buttons. That's 2010 WordPress.
- **NOT purple** — the old accent was `#8b5cf6`. The new palette is blue/green aurora.
- **NOT Poppins** — the new typeface is **Plus Jakarta Sans**

---

## 2. COLOUR TOKENS

```typescript
const tokens = {
  bg: "#ffffff",
  
  // Primary: Sky Blue
  accent: "#0ea5e9",
  accentLight: "#38bdf8",
  accentDark: "#0284c7",
  accentGlow: "rgba(14, 165, 233, 0.25)",
  accentTint: "rgba(14, 165, 233, 0.08)",
  
  // Secondary: Green spectrum
  green: "#10b981",
  greenLight: "#34d399",
  greenDark: "#059669",
  teal: "#14b8a6",
  
  // Text
  text: "#0f172a",
  textMuted: "#475569",
  textLight: "#94a3b8",
  
  // Liquid Glass material
  glass: {
    surface: "rgba(255, 255, 255, 0.12)",
    surfaceHover: "rgba(255, 255, 255, 0.18)",
    surfaceSubtle: "rgba(255, 255, 255, 0.06)",
    border: "rgba(255, 255, 255, 0.35)",
    borderSubtle: "rgba(255, 255, 255, 0.18)",
    specular: "rgba(255, 255, 255, 0.7)",
    specularSoft: "rgba(255, 255, 255, 0.4)",
    // Single soft drop shadow — NEVER dual neumorphic
    shadow: "0 4px 24px rgba(0, 0, 20, 0.06), 0 1px 4px rgba(0, 0, 20, 0.04)",
    shadowElevated: "0 8px 40px rgba(0, 0, 20, 0.08), 0 2px 8px rgba(0, 0, 20, 0.05)",
    shadowButton: "0 2px 12px rgba(0, 0, 20, 0.05), 0 1px 3px rgba(0, 0, 20, 0.04)",
    blur: "blur(12px) saturate(1.6)",
    blurHeavy: "blur(20px) saturate(1.8)",
    blurLight: "blur(8px) saturate(1.4)",
  },
};
```

### Old → New Colour Mapping
| Old Token | Old Value | New Token | New Value |
|-----------|----------|-----------|----------|
| Purple accent | `#8b5cf6` | Sky Blue | `#0ea5e9` |
| Purple glow | `rgba(139, 92, 246, …)` | Blue glow | `rgba(14, 165, 233, …)` |
| Background | `#f0f2f5` | White | `#ffffff` |
| — | — | Emerald (secondary) | `#10b981` |
| — | — | Teal (tertiary) | `#14b8a6` |

---

## 3. TYPOGRAPHY

**Old:** Poppins (300–800 weights)
**New:** Plus Jakarta Sans (300–800 weights)

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
```

### Weight Usage
| Role | Weight | Size | Letter Spacing |
|------|--------|------|---------------|
| Hero heading | 700 | 30–44px | -0.03em to -0.04em |
| Section heading | 700 | 26px | -0.025em |
| Subheading | 500 | 17–18px | 0 |
| Body text | 300 | 15px | 0 |
| Caption / metadata | 300 | 11–12px | 0 |
| Buttons | 500 | 13–15px | 0.01em |
| Code snippets | JetBrains Mono 400 | 11px | 0 |

### Migration: Find-and-Replace
```
font-family: "Poppins"  →  font-family: "Plus Jakarta Sans"
fontFamily: 'Poppins'   →  fontFamily: "'Plus Jakarta Sans', sans-serif"
```
In `tailwind.config.ts`, update the font family:
```typescript
fontFamily: {
  sans: ['"Plus Jakarta Sans"', 'sans-serif'],
  mono: ['"JetBrains Mono"', 'monospace'],
},
```

---

## 4. GLASS PANEL COMPONENT

Every card, modal, container, section wrapper, and content group should use this pattern:

```typescript
const glassPanel = (elevated = false, subtle = false) => ({
  background: subtle
    ? "rgba(255, 255, 255, 0.06)"
    : "rgba(255, 255, 255, 0.12)",
  backdropFilter: "blur(12px) saturate(1.6)",
  WebkitBackdropFilter: "blur(12px) saturate(1.6)",
  borderRadius: 20,
  border: `1px solid ${subtle
    ? "rgba(255, 255, 255, 0.18)"
    : "rgba(255, 255, 255, 0.35)"}`,
  boxShadow: [
    elevated
      ? "0 8px 40px rgba(0,0,20,0.08), 0 2px 8px rgba(0,0,20,0.05)"
      : "0 4px 24px rgba(0,0,20,0.06), 0 1px 4px rgba(0,0,20,0.04)",
    "inset 0 1px 0 0 rgba(255, 255, 255, 0.4)",
  ].join(", "),
  position: "relative",
  overflow: "hidden",
});
```

### Specular Highlight (required on every glass panel)
A pseudo-element or child `<div>` across the top edge:
```typescript
const specularHighlight = {
  position: "absolute",
  top: 0, left: 0, right: 0,
  height: "1px",
  background: `linear-gradient(90deg, 
    transparent 5%, 
    rgba(255,255,255,0.4) 15%,
    rgba(255,255,255,0.7) 35%, 
    rgba(255,255,255,0.7) 65%, 
    rgba(255,255,255,0.4) 85%,
    transparent 95%)`,
  borderRadius: "20px 20px 0 0",
  pointerEvents: "none",
  zIndex: 2,
};
```

### Panel Variants
- **Elevated:** Hero cards, modals, primary containers. Stronger shadow + prominent specular.
- **Standard:** Content cards, sections, grouped info.
- **Subtle:** Nested containers, secondary panels, background grouping.
- **Nav bar:** borderRadius 24, padding 10px 16px.

### Tailwind Equivalents
For Tailwind-based components, use these utility classes where appropriate:
```
bg-white/[0.12] backdrop-blur-[12px] backdrop-saturate-[1.6]
border border-white/35 rounded-[20px]
shadow-[0_4px_24px_rgba(0,0,20,0.06),0_1px_4px_rgba(0,0,20,0.04)]
```

---

## 5. BUTTON COMPONENT — CRITICAL (READ CAREFULLY)

Buttons are the most important element to get right. They must look like Apple Liquid Glass — defined by blur distortion, NOT by opaque fills.

### Structure
```typescript
const GlassButton = ({ children, primary, small }) => (
  <button style={{
    // Ultra-light fill — barely visible
    background: primary
      ? "rgba(14, 165, 233, 0.09)"   // faint blue tint
      : "rgba(255, 255, 255, 0.08)",  // clear glass
    // Strong blur — this defines the button shape
    backdropFilter: "blur(16px) saturate(1.6)",
    WebkitBackdropFilter: "blur(16px) saturate(1.6)",
    // Visible border — enough to trace the edge
    border: "1px solid rgba(255, 255, 255, 0.45)",
    // PILL SHAPED — always
    borderRadius: 999,
    padding: small ? "10px 22px" : "14px 32px",
    color: primary ? "#0284c7" : "#0f172a",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 500,
    fontSize: small ? 13 : 15,
    letterSpacing: "0.01em",
    cursor: "pointer",
    transition: "all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    // Soft shadow + inner top gleam for glass curvature
    boxShadow: [
      "0 2px 12px rgba(0, 0, 0, 0.06)",
      "0 1px 2px rgba(0, 0, 0, 0.04)",
      `inset 0 1px 0 rgba(255, 255, 255, ${primary ? 0.4 : 0.55})`,
      "inset 0 -1px 2px rgba(0, 0, 0, 0.03)",
    ].join(", "),
    position: "relative",
    overflow: "hidden",
  }}>
    {/* Iridescent rim shimmer — conic gradient with mask */}
    <div style={{
      position: "absolute", inset: -1, borderRadius: 999,
      background: `conic-gradient(
        from 180deg,
        rgba(14, 165, 233, 0.2),
        rgba(20, 184, 166, 0.15),
        rgba(167, 139, 250, 0.12),
        rgba(244, 114, 182, 0.1),
        rgba(14, 165, 233, 0.2)
      )`,
      mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
      WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
      maskComposite: "exclude",
      WebkitMaskComposite: "xor",
      padding: 1.5,
      pointerEvents: "none",
      opacity: 0.7,
    }} />
    {/* Specular top-edge highlight */}
    <div style={{
      position: "absolute", top: 0, left: "10%", right: "10%",
      height: "1px",
      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
      pointerEvents: "none",
    }} />
    <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
  </button>
);
```

### Hover State
On hover, increase fill opacity slightly and rim glow:
```typescript
// Primary hover: rgba(14, 165, 233, 0.14)
// Secondary hover: rgba(255, 255, 255, 0.14)
// Border hover: rgba(255, 255, 255, 0.6)
// Rim shimmer opacity: 1
// Transform: translateY(-0.5px)
```

### ABSOLUTE DON'TS FOR BUTTONS
- ❌ `background: linear-gradient(180deg, #f6f7fa, #eceef3)` — this is neumorphic, not glass
- ❌ Dual box-shadows like `8px 20px -4px rgba(0,0,0,0.12), inset 2px 4px rgba(255,255,255,0.8)` — this is neumorphic
- ❌ Opaque solid fills of any kind
- ❌ `border-radius: 32px` — use `999` for true pills
- ❌ Any purple/violet colour values

---

## 6. INPUT COMPONENT

```typescript
const GlassInput = ({ placeholder, value, onChange, icon }) => (
  <div style={{ position: "relative" }}>
    {icon && (
      <span style={{
        position: "absolute", left: 16, top: "50%",
        transform: "translateY(-50%)", color: "#94a3b8",
        fontSize: 15, zIndex: 2,
      }}>{icon}</span>
    )}
    <input style={{
      width: "100%",
      background: "rgba(255, 255, 255, 0.06)",
      backdropFilter: "blur(8px) saturate(1.4)",
      WebkitBackdropFilter: "blur(8px) saturate(1.4)",
      border: "1px solid rgba(255, 255, 255, 0.18)",
      borderRadius: 14,
      padding: icon ? "13px 16px 13px 42px" : "13px 16px",
      color: "#0f172a",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: 300,
      fontSize: 15,
      outline: "none",
      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.03)",
      boxSizing: "border-box",
    }}
    // Focus state:
    // borderColor: rgba(14, 165, 233, 0.4)
    // boxShadow: inset 0 1px 2px rgba(0,0,0,0.03), 0 0 0 3px rgba(14, 165, 233, 0.1)
    // background: rgba(255, 255, 255, 0.1)
    />
  </div>
);
```

---

## 7. TOGGLE COMPONENT

```typescript
const GlassToggle = ({ on, onToggle }) => (
  <div onClick={onToggle} style={{
    width: 52, height: 30, borderRadius: 15, cursor: "pointer",
    background: on ? "rgba(14, 165, 233, 0.12)" : "rgba(255, 255, 255, 0.04)",
    backdropFilter: "blur(16px) saturate(1.5)",
    border: `1px solid rgba(255, 255, 255, ${on ? 0.25 : 0.18})`,
    position: "relative",
    transition: "all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    boxShadow: on
      ? "0 1px 6px rgba(14, 165, 233, 0.1), inset 0 0.5px 0 rgba(255,255,255,0.15)"
      : "0 1px 4px rgba(0,0,0,0.03)",
  }}>
    <div style={{
      width: 24, height: 24, borderRadius: 12,
      background: on ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.6)",
      backdropFilter: "blur(8px)",
      position: "absolute", top: 2,
      left: on ? 25 : 2,
      transition: "all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.06)",
    }} />
  </div>
);
```

---

## 8. AURORA BACKGROUND SYSTEM

The entire app sits on top of animated aurora blobs. This replaces the old purple particle background in `master-background.tsx`.

### Drifting Colour Blobs (5 blobs)
```typescript
const auroraBlobs = [
  { color: "14, 165, 233", x: 25, y: 30, size: 600, speed: 0.4, phase: 0 },    // sky blue
  { color: "16, 185, 129", x: 70, y: 60, size: 550, speed: 0.3, phase: 2 },    // emerald
  { color: "20, 184, 166", x: 50, y: 20, size: 500, speed: 0.35, phase: 4 },   // teal
  { color: "99, 102, 241", x: 80, y: 40, size: 450, speed: 0.25, phase: 1.5 }, // indigo hint
  { color: "16, 185, 129", x: 20, y: 70, size: 480, speed: 0.45, phase: 3 },   // emerald 2
];
```
Each blob is a `<div>` with:
- `position: absolute`, positioned by `calc(x% + sin(time) * 60px)`
- `radial-gradient(circle, rgba(color, 0.18) 0%, rgba(color, 0.08) 40%, transparent 70%)`
- `filter: blur(80px)`
- `border-radius: 50%`

### Concentric Ripples (6 ripples, sky blue)
- Evenly staggered through a 20-second cycle
- `border: 1.5px solid rgba(14, 165, 233, opacity)` where opacity fades as ripple expands
- `max-size: 1200px`, scale from 0.02 to 1.0
- Centered on screen `(50%, 50%)`

### Floating Particles (120 particles)
- Mix of sky blue `(14, 165, 233)` and emerald `(16, 185, 129)` — 60/40 split
- Size 1–6px, float upward over 18–58 second cycles
- Radial gradients with blur 1–6px
- Opacity 0.08–0.43 with fade-in/fade-out at edges

### Central Ambient Glow
- Fixed teal glow at center: `radial-gradient(circle, rgba(14,184,166,0.035) 0%, transparent 60%)`
- 500×500px, centered

---

## 9. COMPONENT-BY-COMPONENT MIGRATION GUIDE

### `app/globals.css`
- Replace `.glass-panel-light` class with the new glass panel tokens above
- Replace `.neumorphic-button-light` class with glass button styles
- Remove ALL dual-shadow patterns
- Update all purple color references to blue/green
- Update font-family declarations from Poppins to Plus Jakarta Sans
- Update background from `#f0f2f5` to `#ffffff`

### `app/layout.tsx`
- Update Google Fonts import from Poppins to Plus Jakarta Sans
- Add JetBrains Mono as secondary font
- Update base theme colours

### `components/master-background.tsx`
- Replace the purple particle field with the aurora background system (§8)
- Replace purple ripples with sky blue concentric ripples
- Replace purple particles with blue/green floating particles
- Add drifting aurora blobs
- Add central teal ambient glow

### `components/auth/auth-form.tsx`
- Replace glass panel styling with new glass tokens
- Replace button styling with GlassButton pattern
- Update input styling with GlassInput pattern
- Replace purple accent colors with sky blue

### `components/onboarding/extended-onboarding-flow.tsx`
- Update all button instances to glass button style
- Update panel containers to glass panel style
- Replace purple accents with blue/green aurora

### `components/onboarding/welcome-step.tsx`
- Update any button or panel styling
- Purple pulse glow → sky blue glow `rgba(14, 165, 233, 0.25)`

### `components/onboarding/personal-data-step.tsx`
- Form inputs → GlassInput pattern
- Buttons → GlassButton pattern
- Form container → glass panel

### `components/dashboard/dashboard.tsx` and sub-components
- `dashboard-main-options.tsx` — cards → glass panels, buttons → glass buttons
- `create-memory-screen.tsx` — text area and prompts → glass inputs and panels
- `view-memories-screen.tsx` — timeline cards → glass panels with specular highlights
- `day-summary-view.tsx` — content container → glass panel
- Navigation elements → glass nav bar pattern

### `tailwind.config.ts`
- Update font family to Plus Jakarta Sans
- Add new color tokens for sky blue, emerald, teal
- Remove purple color tokens
- Update shadow utilities

---

## 10. TRANSITION & ANIMATION STANDARDS

### Easing
Use this cubic bezier everywhere:
```
cubic-bezier(0.25, 0.46, 0.45, 0.94)
```

### Durations
| Element | Duration |
|---------|----------|
| Button hover | 0.35s |
| Panel appear | 0.35s |
| Tab switch | 0.25s |
| Toggle | 0.35s |
| Slider knob | 0.2s |
| Page transition (Framer Motion) | 0.4–0.6s |

### Hover States
- Buttons: `translateY(-0.5px)`, increased fill opacity, increased rim glow
- Cards: slightly elevated shadow (use `shadowElevated`)
- Nav items: background tint `rgba(14, 165, 233, 0.08)`

---

## 11. MOBILE SCREEN REFERENCE (375px)

The design system includes a phone-sized reference layout. Key dimensions:
- Phone frame: 375×740px (iPhone proportions)
- Content padding: 16px horizontal
- Bottom nav: glass panel with icons, borderRadius 20, padding 8px 6px
- Cards: 2-column grid, gap 10px, padding 14px
- Tags: padding 2px 8px, borderRadius 6, fontSize 10, background `rgba(14,165,233,0.08)`
- Active nav item: background tint `rgba(14,165,233,0.08)`, font-weight 500, color `#0ea5e9`

---

## 12. FIGMA REFERENCE

The definitive button and component specs are in Figma:
- **File key:** `S5nGzpILKaNfMzub6cSYsQ`
- Note: The Figma file uses `mix-blend-mode: plus-lighter` which doesn't work in React — use the frosted gradient + glow shadows approach documented above instead.

---

## 13. SUMMARY CHECKLIST

Before considering the migration complete, verify:

- [ ] **Zero purple** — no `#8b5cf6`, no `rgba(139, 92, 246, …)` anywhere in codebase
- [ ] **Zero Poppins** — no references to Poppins font anywhere
- [ ] **Zero neumorphic shadows** — no dual white+dark inner/outer shadow combos
- [ ] **Zero opaque button fills** — no gradient fills on buttons
- [ ] **Background is `#ffffff`** — not `#f0f2f5`
- [ ] **All panels** have backdrop-blur, translucent background, specular highlight, single soft shadow
- [ ] **All buttons** are pill-shaped, near-invisible fill, backdrop-blur, iridescent rim
- [ ] **All inputs** have glass styling with blue focus ring
- [ ] **Aurora background** with drifting blobs, particles, and ripples active on every screen
- [ ] **Plus Jakarta Sans** loaded and applied everywhere
- [ ] **Blue/green accent palette** used consistently (sky blue primary, emerald/teal secondary)
- [ ] **Transitions** use the standard cubic-bezier easing

---

## 14. HOW TO USE THIS DOCUMENT

### Option A — Single Prompt
Copy this entire document and paste it as the first message in a Claude Code session, followed by:
```
Apply this design system to every file in the Project Echo codebase. Start with globals.css, layout.tsx, tailwind.config.ts, and master-background.tsx, then work through each component systematically.
```

### Option B — CLAUDE.md (Recommended)
Save this file as `CLAUDE.md` at the repository root. Claude Code will automatically read it at the start of every session.

### Option C — Staged Migration
Break the migration into phases:
1. **Foundation:** globals.css, layout.tsx, tailwind.config.ts, master-background.tsx
2. **Auth & Onboarding:** auth-form.tsx, extended-onboarding-flow.tsx, welcome-step.tsx, personal-data-step.tsx
3. **Dashboard:** dashboard.tsx and all sub-components
4. **Polish:** Verify checklist, fix edge cases, test responsive breakpoints
