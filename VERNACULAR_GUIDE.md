# 🗂️ Echo App Component Vernacular Guide

## 📋 **Main Application Sections**

### **Authentication Flow**
- **Auth Form** - Login/register component (`components/auth/auth-form.tsx`)
- **Landing State** - Initial app load before auth

### **Onboarding Journey** 
- **Language Gate** - Language selection screen
- **Sound Check** - Headphones prompt with Lottie animation
- **Orb Experience** - The main 8-part audio-visual journey

### **Main Application**
- **Dashboard** - Primary journaling interface after onboarding
- **Echo Creation** - Memory input area with prompts
- **Echo Timeline** - Display of saved memories

---

## 🌟 **Orb Experience Components**

### **Core Orb System**
- **Aurora Orb** - The main fluid, color-changing sphere
- **Orb Canvas** - HTML5 canvas containing the animated orb
- **Orb Jump** - Tap-triggered position changes of the orb
- **Orb Reactivity** - Audio-level responsive size/color changes

### **Visual Layers (Inside to Outside)**
1. **Blob Layers** - 6 fluid shape layers creating the orb effect
2. **Glass Sphere** - Outer transparent container with highlights
3. **Atmospheric Glow** - Outer light emission effects
4. **Background Particles** - Floating depth particles
5. **Pulse Rings** - Large background circle animations

### **Audio System**
- **Voice Track** - Current playing audio file (ob-vo-1.mp3 through ob-vo-8.mp3)
- **Audio Analysis** - Real-time frequency analysis for orb reactivity
- **Background Ambient** - Low-volume atmospheric music
- **Tap Audio** - Sound effect when tapping

---

## 🎨 **Visual Effects & Animations**

### **Click/Tap Effects**
- **Click Pulse** - Expanding circle effect on button taps
- **Orb Bounce** - Visual feedback when tapping the orb
- **Button Press** - Neumorphic button depression effect

### **Background Elements**
- **Particle Field** - Floating background particles with depth layers
- **Pulse Circles** - Large animated rings in background
- **Glass Panels** - Translucent UI containers
- **Gradient Background** - Main app background color system

### **Color Systems**
- **Aurora Palette** - 12-color gradient system for orb
- **Neumorphic Colors** - White/purple button styling
- **Glass Tints** - Translucent panel color overlays

---

## 📱 **Responsive & Mobile**

### **Breakpoints**
- **Mobile View** - Under 768px width
- **Desktop View** - 768px and above
- **Orb Scaling** - w-64 h-64 (mobile) vs w-96 h-96 (desktop)
- **Particle Density** - 150 (mobile) vs 300 (desktop) particles

---

## 🔊 **Audio Architecture**

### **File Structure**
- **Voice Files** - `/public/audio/onboarding/ob-vo-[1-8].mp3`
- **Ambient Track** - `/public/ambient-music.mp3`
- **UI Sounds** - `/public/tap-sound.mp3`

### **Audio States**
- **Audio Context** - Web Audio API connection
- **Audio Analysis** - Real-time frequency data
- **Auto-Progression** - Moving to next section when audio ends
- **Manual Advancement** - Tap-to-continue functionality

---

## 📊 **Progress & State Management**

### **Journey Progression**
- **Section Steps** - Current position in 8-part sequence (0-7)
- **Progress Dots** - Visual indicators showing current/completed steps
- **Audio Status** - Playing/paused/error states
- **Section Duration** - Expected length of each voice segment

### **User Interaction**
- **Tap Zone** - Full-screen clickable area
- **Manual Skip** - User-initiated section advancement
- **Audio Feedback** - Visual orb response to voice levels

---

## 🔧 **Technical Components**

### **Canvas Animation**
- **Frame Loop** - requestAnimationFrame rendering cycle
- **Blob Generation** - Mathematical shape creation
- **Noise Functions** - Spherical distortion algorithms
- **Color Interpolation** - Smooth color transitions

### **State Management**
- **Step Counter** - Current section index
- **Audio Refs** - React refs for audio elements
- **Animation Refs** - Canvas and timing references
- **Mobile Detection** - Screen size responsive logic

---

## 🎯 **Common Edit Targets**

### **Content Changes**
- **Script Text** - Caption content in `captionSections` array
- **Audio Files** - Voice-over MP3 files
- **Timing** - Duration values for each section

### **Visual Tweaks**
- **Orb Colors** - `auroraColors` array
- **Animation Speed** - Blob layer speed values
- **Effect Intensity** - Audio reactivity multipliers
- **UI Styling** - Glass panel and button appearances

### **Behavior Adjustments**
- **Auto-Advance** - Section progression timing
- **Audio Volume** - Background music levels
- **Tap Sensitivity** - Click response areas
- **Error Handling** - Missing audio file behavior

---

## 🏷️ **Quick Reference Tags**

When discussing edits, use these tags for clarity:

- **#orb** - Main aurora orb component
- **#audio** - Voice/sound system
- **#progression** - Section advancement logic
- **#visual** - Colors, animations, effects
- **#mobile** - Responsive behavior
- **#background** - Particles, rings, ambient elements
- **#ui** - Buttons, panels, text displays
- **#timing** - Durations, delays, transitions

---

## 📞 **Example Usage**

✅ **Good**: "Can we adjust the #orb #visual aurora colors to be more blue-dominant?"

✅ **Good**: "The #audio #progression auto-advance seems too fast between sections"

✅ **Good**: "Let's modify the #mobile #ui button sizing for better touch targets"

❌ **Avoid**: "Make the thing more colorful" (too vague)

❌ **Avoid**: "Fix the audio stuff" (unclear scope)

---

This vernacular system will help us communicate precisely about any component when making future edits! 🎯