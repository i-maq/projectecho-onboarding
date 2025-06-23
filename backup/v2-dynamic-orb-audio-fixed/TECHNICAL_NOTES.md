# 🔧 Technical Implementation Notes

## 🚨 **Critical Audio Fix Details:**

### **Problem:**
- `createMediaElementSource()` was being called multiple times on the same audio element
- React's development mode and component re-renders were triggering duplicate initializations
- Each call created a new MediaElementSourceNode, but audio elements can only connect to one

### **Solution:**
```javascript
const initAudioAnalysis = async () => {
  if (!audioRef.current) return;
  
  // GUARD CLAUSE - Prevents duplicate initialization
  if (audioContextRef.current) return;
  
  // ... rest of initialization
};
```

### **Why This Works:**
- `audioContextRef.current` persists across re-renders due to `useRef`
- Guard clause prevents creating multiple AudioContext instances
- Single MediaElementSourceNode per audio element lifecycle
- Cleanup handled in useEffect return functions

---

## 🎵 **Audio System Architecture:**

### **File Structure:**
```
public/audio/onboarding/
├── ob-vo-1.mp3 (0:12) - "Think of who you are right now..."
├── ob-vo-2.mp3 (0:03) - "You are not a single, solid thing."
├── ob-vo-3.mp3 (0:04) - "You are a symphony..."
├── ob-vo-4.mp3 (0:05) - "Your courage today..."
├── ob-vo-5.mp3 (0:05) - "Your laughter..."
├── ob-vo-6.mp3 (0:05) - "Your wisdom..."
├── ob-vo-7.mp3 (0:06) - "An echo is not a distant..."
└── ob-vo-8.mp3 (0:05) - "Here, you will become..."
```

### **Dynamic Loading:**
```javascript
useEffect(() => {
  const currentSection = captionSections[step];
  if (currentSection && currentSection.audioFile && audioRef.current) {
    audioRef.current.src = `/audio/onboarding/${currentSection.audioFile}`;
    audioRef.current.load();
    
    setTimeout(() => {
      audioRef.current?.play().catch((error) => {
        console.log(`Could not play audio: ${currentSection.audioFile}`, error);
        setAudioError(true);
      });
    }, 200);
  }
}, [step]);
```

---

## 🌟 **Orb Animation System:**

### **Aurora Color Transitions:**
- 12-color palette with smooth cubic interpolation
- Layer-specific color phases for variety
- Ultra-slow cycling (0.0015 speed) for gradual transitions
- Audio-reactive color shifts

### **Spherical Movement:**
- 3D spherical coordinates for natural positioning
- Jump animations with easing curves
- Flow offsets for organic movement
- Audio-reactive radius variations

### **Multi-layer Rendering:**
- 6 blob layers with different properties
- Heavy blur effects for smooth appearance
- Multiple composition modes for depth
- Real-time audio level integration

---

## 📱 **Performance Optimizations:**

### **Mobile Adaptations:**
```javascript
const particleCount = useMemo(() => {
  return isMobile ? 150 : 300;
}, [isMobile]);

const orbSize = isMobile ? 'w-64 h-64' : 'w-96 h-96';
const canvasSize = isMobile ? 256 : 384;
```

### **Memory Management:**
- Proper cleanup in useEffect returns
- Canvas animation frame cancellation
- Audio event listener removal
- Reference nullification

---

## 🛠 **Error Handling:**

### **Audio Fallbacks:**
- Missing file detection
- Visual-only mode when audio fails
- Error state display to user
- Graceful degradation

### **Robustness:**
- Multiple initialization prevention
- Context state validation
- Network failure handling
- Component unmount cleanup