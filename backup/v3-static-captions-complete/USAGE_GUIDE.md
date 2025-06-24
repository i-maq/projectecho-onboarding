# 📖 Usage Guide - Static Captions Complete

## 🔄 **How to Restore This Version:**

### **Quick Full Restore:**
```bash
# Copy all components
cp -r backup/v3-static-captions-complete/components/* components/

# Copy enhanced styles  
cp backup/v3-static-captions-complete/app/globals.css app/globals.css

# Copy audio documentation
cp backup/v3-static-captions-complete/public/audio/onboarding/README.md public/audio/onboarding/README.md

# Verify audio files exist
ls public/audio/onboarding/ob-vo-*.mp3
```

### **Individual Component Restore:**
```bash
# Just the orb component
cp backup/v3-static-captions-complete/components/orb/dynamic-orb-intro.tsx components/orb/dynamic-orb-intro.tsx

# Just the onboarding flow
cp backup/v3-static-captions-complete/components/onboarding/onboarding-flow.tsx components/onboarding/onboarding-flow.tsx

# Just the enhanced styles
cp backup/v3-static-captions-complete/app/globals.css app/globals.css
```

---

## 🎵 **Audio File Requirements**

### **Required Files in `public/audio/onboarding/`:**
1. **ob-vo-1.mp3** - "Think of who you are right now, in this moment." (0:12)
2. **ob-vo-2.mp3** - "You are not a single, solid thing." (0:03)
3. **ob-vo-3.mp3** - "You are a symphony of all the moments that came before." (0:04)
4. **ob-vo-4.mp3** - "Your courage today is an echo of a time you were scared, and pushed through anyway." (0:05)
5. **ob-vo-5.mp3** - "Your laughter is an echo of a thousand jokes shared with friends." (0:05)
6. **ob-vo-6.mp3** - "Your wisdom is an echo of mistakes made, and lessons learned." (0:05)
7. **ob-vo-7.mp3** - "An echo is not a distant, faded copy. It proves you are there." (0:06)
8. **ob-vo-8.mp3** - "Here, you will become your echo for your future self to hear." (0:05)

### **Audio Format Guidelines:**
- **Format:** MP3 (best browser compatibility)
- **Quality:** 128kbps minimum, 320kbps maximum
- **Size:** Keep under 1MB per file for fast loading
- **Timing:** Match the durations listed above

---

## 🎨 **Customization Guide**

### **Changing Orb Colors:**
```javascript
// In components/orb/dynamic-orb-intro.tsx
const auroraColors = [
  { r: 50, g: 255, b: 50 },     // Bright green 
  { r: 150, g: 50, b: 255 },    // Bright purple
  // Add your custom colors here
  { r: 255, g: 100, b: 50 },    // Custom orange
];
```

### **Modifying Script Content:**
```javascript
// In components/orb/dynamic-orb-intro.tsx
const captionSections = [
  {
    audioFile: "ob-vo-1.mp3",
    text: "Your custom text here",
    duration: 12 // Adjust duration as needed
  },
  // ... more sections
];
```

### **Adjusting Animation Speed:**
```javascript
// In the orb animation system
const blobLayers = [
  {
    speed: 0.012,  // Lower = slower animation
    // ... other properties
  }
];
```

---

## 🔧 **Common Modifications**

### **Adding New Audio Sections:**
1. Add new audio file to `public/audio/onboarding/`
2. Add entry to `captionSections` array
3. Update progress indicator count if needed

### **Changing Auto-Advance Timing:**
```javascript
// In the handleEnded audio event
const handleEnded = () => {
  setIsAudioPlaying(false);
  if (step < captionSections.length - 1) {
    setTimeout(() => setStep(step + 1), 500); // Adjust delay here
  }
};
```

### **Modifying Mobile Breakpoint:**
```javascript
// In mobile detection
useEffect(() => {
  const checkScreenSize = () => {
    setIsMobile(window.innerWidth < 768); // Change breakpoint here
  };
  // ...
}, []);
```

---

## 🛠 **Troubleshooting**

### **Audio Not Playing:**
1. Check browser console for 404 errors
2. Verify audio files are in correct location
3. Check file naming (must be exact: ob-vo-1.mp3, etc.)
4. Ensure user has interacted with page (browser audio policy)

### **Orb Not Animating:**
1. Check browser console for canvas errors
2. Verify WebGL/Canvas support in browser
3. Check if hardware acceleration is enabled
4. Reduce particle count for performance

### **Mobile Performance Issues:**
1. Reduce `particleCount` for mobile
2. Lower `canvasSize` for mobile
3. Disable heavy effects on slower devices
4. Check network speed for audio loading

---

## 📊 **Performance Monitoring**

### **Key Metrics to Watch:**
```javascript
// Add to component for debugging
useEffect(() => {
  console.log('Audio Level:', audioLevel);
  console.log('Current Step:', step);
  console.log('Is Mobile:', isMobile);
  console.log('Particle Count:', particleCount);
}, [audioLevel, step, isMobile, particleCount]);
```

### **Memory Usage Check:**
```javascript
// Add to check memory usage
const checkMemory = () => {
  if (performance.memory) {
    console.log('Memory Usage:', performance.memory.usedJSHeapSize / 1048576, 'MB');
  }
};
```

---

## 🎯 **Integration with Next Steps**

### **When Adding Personal Data Collection:**
- Keep orb system intact as foundation
- Add new components after `onAdvance()` call
- Maintain audio system for future use
- Preserve backup for rollback capability

### **When Adding Camera Integration:**
- Ensure audio context remains stable
- Test mobile camera permissions
- Maintain responsive design patterns
- Consider performance impact on older devices

---

## 📞 **Support Reference**

### **Use Established Vernacular:**
- **#orb** - Aurora orb component
- **#audio** - Voice/sound system  
- **#progression** - Section advancement
- **#visual** - Colors, animations, effects
- **#mobile** - Responsive behavior
- **#ui** - Interface elements

### **Example Support Requests:**
✅ "The #orb #visual aurora colors need more blue tones"  
✅ "Can we slow down the #audio #progression auto-advance?"  
✅ "The #mobile #ui tap targets feel too small"  

---

**Status: Ready for Production & Next Phase** 🚀