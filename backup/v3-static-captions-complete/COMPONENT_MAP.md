# 🗂️ Component File Structure Map

## 📁 **Core Application Files**

### **Main Components:**
```
components/
├── orb/
│   └── dynamic-orb-intro.tsx      # 🌟 Main orb system (2,800+ lines)
├── onboarding/
│   └── onboarding-flow.tsx        # 🎯 Integration layer
├── auth/
│   └── auth-form.tsx              # 🔐 Login/register
└── dashboard/
    └── dashboard.tsx              # 📊 Main journaling interface
```

### **Styling & Configuration:**
```
app/
├── globals.css                    # 🎨 Enhanced animations & styles
├── layout.tsx                     # 📱 Font & theme setup
└── page.tsx                       # 🏠 Main app orchestration
```

### **Audio & Assets:**
```
public/
├── audio/
│   └── onboarding/
│       ├── ob-vo-1.mp3           # 🎵 Voice track 1
│       ├── ob-vo-2.mp3           # 🎵 Voice track 2
│       └── ... (ob-vo-3 through ob-vo-8)
├── ambient-music.mp3             # 🎶 Background music
└── tap-sound.mp3                 # 🔊 UI feedback sound
```

---

## 🌟 **Dynamic Orb Intro Component Breakdown**

### **Main Sections (`components/orb/dynamic-orb-intro.tsx`):**

#### **1. Configuration & State (Lines 1-100)**
- Caption sections array with 8 script parts
- React hooks for state management
- Mobile detection system
- Audio error handling

#### **2. Particle System (Lines 101-200)**  
- Background particle generation
- Depth-layered rendering
- Mobile/desktop particle count optimization
- Floating animation definitions

#### **3. Audio Analysis System (Lines 201-350)**
- Web Audio API initialization
- MediaElementSourceNode connection (with fix)
- Real-time frequency analysis
- Audio level monitoring for orb reactivity

#### **4. Orb Animation Engine (Lines 351-800)**
- Canvas setup and rendering loop
- 3D spherical movement system
- Jump animation with easing
- Position targeting and interpolation

#### **5. Blob Layer System (Lines 801-1200)**
- 6 fluid shape layers with different properties
- Spherical noise generation
- Flow offset calculations
- Audio-reactive radius variations

#### **6. Color System (Lines 1201-1400)**
- Aurora color palette (12 colors)
- Smooth cubic interpolation
- Layer-specific color phases
- Audio-influenced color shifts

#### **7. Rendering Pipeline (Lines 1401-1800)**
- Multi-layer blob rendering
- Heavy blur effects for smoothness
- Gradient generation and application
- Canvas composition modes

#### **8. Audio Event Handling (Lines 1801-2000)**
- Play/pause/ended event listeners
- Auto-progression logic
- Error state management
- Audio file loading system

#### **9. User Interaction (Lines 2001-2200)**
- Tap handling and feedback
- Orb jump triggering
- Sound effect playback
- Section advancement logic

#### **10. Render & UI (Lines 2201-2400)**
- React component JSX structure
- Static caption container
- Progress indicators
- Mobile-responsive sizing

---

## 🎨 **Enhanced Styles Breakdown**

### **CSS Organization (`app/globals.css`):**

#### **1. Font System (Lines 1-50)**
- Poppins font configuration
- Weight hierarchy (Light 300, Extrabold 800, etc.)
- Typography utilities

#### **2. Animation Keyframes (Lines 51-150)**
- Click pulse animations with multi-layer effects
- Background particle floating
- Pulse circle animations
- Blur and glow transitions

#### **3. UI Components (Lines 151-250)**
- Glass panel styling
- Neumorphic button effects
- Hover and active states
- Purple/white color scheme

#### **4. Enhanced Click Effects (Lines 251-350)**
- Multi-layer pulse system
- Gradient backgrounds
- Box-shadow animations
- Sparkle effect layers

#### **5. Global Animations (Lines 351-400)**
- Particle float definitions
- Pulse circle system
- Background ring animations
- Timing and easing curves

---

## 🔗 **Integration Flow**

### **User Journey Through Components:**

```
1. app/page.tsx
   ├── Checks auth status
   └── Routes to onboarding

2. components/onboarding/onboarding-flow.tsx
   ├── Language selection
   ├── Sound check with Lottie headphones
   └── Calls DynamicOrbIntro

3. components/orb/dynamic-orb-intro.tsx
   ├── 8-part audio journey
   ├── Aurora orb with real-time reactivity
   ├── Static caption display
   └── onAdvance() callback

4. Back to onboarding-flow.tsx
   └── Calls onComplete() → Dashboard
```

### **State Flow:**
```
localStorage checks → Auth form OR Onboarding → Orb intro → Dashboard
     ↓                    ↓                      ↓           ↓
  'token'            'onboardingComplete'   Audio files  Echo system
   'user'                  = 'true'         ob-vo-*.mp3  (next phase)
```

---

## 📱 **Responsive Behavior Map**

### **Breakpoint System:**
```javascript
// Mobile Detection (< 768px)
isMobile ? {
  orbSize: 'w-64 h-64',           // Smaller orb
  canvasSize: 256,                // Reduced canvas
  particleCount: 150,             // Fewer particles
  opacity: [0.4, 0.3, 0.2, 0.15] // Lighter effects
} : {
  orbSize: 'w-96 h-96',           // Full-size orb
  canvasSize: 384,                // Full canvas
  particleCount: 300,             // More particles
  opacity: [0.6, 0.45, 0.3, 0.2] // Richer effects
}
```

---

## 🎵 **Audio System Map**

### **File Loading Sequence:**
```
Step 0: ob-vo-1.mp3 → "Think of who you are..."
Step 1: ob-vo-2.mp3 → "You are not a single..."
Step 2: ob-vo-3.mp3 → "You are a symphony..."
...
Step 7: ob-vo-8.mp3 → "Here, you will become..."
```

### **Audio Analysis Pipeline:**
```
Audio Element → AudioContext → MediaElementSourceNode → AnalyserNode
     ↓              ↓               ↓                       ↓
   HTML5 Audio → Web Audio API → Source Connection → Frequency Data
     ↓              ↓               ↓                       ↓
    Playback → Real-time Analysis → Error Prevention → Visual Feedback
```

---

## 🔄 **State Dependencies**

### **Critical State Variables:**
```javascript
step              // Controls which audio/caption section (0-7)
audioLevel        // Real-time audio amplitude (0-1)
isAudioPlaying    // Drives visual audio-reactive effects
audioError        // Handles missing file gracefully
isMobile          // Determines responsive behavior
```

### **Ref Dependencies:**
```javascript
audioRef          // Current playing audio element
canvasRef         // Orb animation canvas
audioContextRef   // Web Audio API context (prevents duplicates)
analyserRef       // Frequency analyzer
dataArrayRef      // Audio data buffer
```

---

**This map provides a complete technical overview for maintenance and future development!** 🗺️