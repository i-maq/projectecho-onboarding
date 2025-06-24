# 🔄 Quick Restoration Commands

## 🚀 **One-Command Full Restore:**
```bash
# Complete restoration of this version
cp backup/v3-static-captions-complete/components/orb/dynamic-orb-intro.tsx components/orb/dynamic-orb-intro.tsx && \
cp backup/v3-static-captions-complete/components/onboarding/onboarding-flow.tsx components/onboarding/onboarding-flow.tsx && \
cp backup/v3-static-captions-complete/app/globals.css app/globals.css && \
echo "✅ Version 3 (Static Captions Complete) restored successfully!"
```

## 🎯 **Individual Component Restoration:**

### **Orb System Only:**
```bash
cp backup/v3-static-captions-complete/components/orb/dynamic-orb-intro.tsx components/orb/dynamic-orb-intro.tsx
```

### **Onboarding Flow Only:**
```bash
cp backup/v3-static-captions-complete/components/onboarding/onboarding-flow.tsx components/onboarding/onboarding-flow.tsx
```

### **Enhanced Styles Only:**
```bash
cp backup/v3-static-captions-complete/app/globals.css app/globals.css
```

### **Documentation Only:**
```bash
cp backup/v3-static-captions-complete/VERNACULAR_GUIDE.md ./
```

## 🔍 **Verification Commands:**

### **Check Audio Files Exist:**
```bash
ls -la public/audio/onboarding/ob-vo-*.mp3 | wc -l
# Should return: 8
```

### **Test Development Server:**
```bash
npm run dev
# Navigate to localhost:3000 and test orb intro
```

### **Check for Console Errors:**
```bash
# Open browser dev tools console during orb intro
# Should see NO MediaElementSourceNode errors
```

## 📊 **Backup Verification:**
```bash
# Verify backup contents
ls -la backup/v3-static-captions-complete/
echo "📁 Components:" && ls backup/v3-static-captions-complete/components/orb/
echo "📁 Documentation:" && ls backup/v3-static-captions-complete/*.md
echo "✅ Backup verification complete!"
```

---

**All commands tested and ready for instant restoration!** ⚡