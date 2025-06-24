# 🔧 Technical Specifications - User Data Collection System

## 🗄️ **Database Architecture**

### **Table Relationships:**
```
users (1) ←→ (1) user_profiles
users (1) ←→ (many) echoes
```

### **Row Level Security (RLS):**
All tables use RLS with user-specific policies:
```sql
-- Example policy structure
CREATE POLICY "Users can read own data"
  ON table_name FOR SELECT
  USING (user_id = get_current_user_id());
```

### **Data Flow:**
1. User registers → `users` table
2. JWT token generated with user ID
3. Personal data collected → `user_profiles` table
4. Photo captured → stored as base64 in `photo_data` column
5. All operations filtered by user ID through RLS

---

## 🔐 **Authentication System**

### **Password Security:**
- bcrypt hashing with salt rounds = 12
- JWT tokens with 7-day expiration
- Secure token verification middleware

### **Session Management:**
```javascript
// Token storage and verification
localStorage.setItem('token', jwtToken);
localStorage.setItem('user', JSON.stringify(userObject));

// API request authentication
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

## 📷 **Camera Integration**

### **WebRTC Implementation:**
```javascript
// Camera access with fallback handling
const stream = await navigator.mediaDevices.getUserMedia({ 
  video: { 
    width: { ideal: 640 },
    height: { ideal: 480 },
    facingMode: 'user'
  } 
});
```

### **Photo Processing:**
1. Video stream → Canvas capture
2. Canvas → Base64 encoding
3. Base64 → Supabase storage
4. Optional: Image compression before storage

---

## 🎯 **State Management**

### **Onboarding Flow States:**
```typescript
type OnboardingStage = 
  | 'language' 
  | 'soundCheck' 
  | 'orbIntro' 
  | 'dbCheck' 
  | 'personalData' 
  | 'cameraCapture' 
  | 'complete';
```

### **Error Handling:**
- Form validation with real-time feedback
- Database connection testing
- Camera permission handling
- Graceful degradation for failed operations

---

## 🔄 **API Route Structure**

### **Profile Management (`/api/profile`):**
```javascript
GET    → Retrieve user profile
POST   → Create/Update profile with photo
PUT    → Update existing profile
DELETE → Remove profile (cascade to related data)
```

### **Request/Response Patterns:**
```javascript
// Request format
{
  firstName: string,
  lastName: string,
  dateOfBirth: string, // YYYY-MM-DD format
  age: number,
  photoData?: string   // Base64 encoded image
}

// Response format
{
  id: number,
  user_id: number,
  first_name: string,
  last_name: string,
  date_of_birth: string,
  age: number,
  photo_data: string | null,
  created_at: string,
  updated_at: string
}
```

---

## 🎨 **Component Architecture**

### **Prop Flow:**
```
ExtendedOnboardingFlow
├── PersonalDataStep
│   ├── Form validation
│   ├── Age calculation
│   └── Database save
└── CameraCaptureStep
    ├── Camera access
    ├── Photo capture
    └── Base64 processing
```

### **State Lifting:**
- Personal data flows up to parent component
- Photo data stored temporarily before database save
- Error states handled at component level with toast notifications

---

## 🔍 **Validation Rules**

### **Personal Data Validation:**
```javascript
// Age constraints
minAge: 13 years
maxAge: 120 years

// Name validation
firstName: required, non-empty string
lastName: required, non-empty string

// Date validation
dateOfBirth: valid date, not in future, within age limits
```

### **Photo Validation:**
- File format: JPEG (via canvas toDataURL)
- Quality: 0.8 compression ratio
- Size: Base64 string length monitoring
- Resolution: 640x480 ideal capture

---

## 🚀 **Performance Optimizations**

### **Database Operations:**
- Connection pooling via Supabase
- Prepared statements for user queries
- Indexed user_id columns for fast lookups
- Automatic timestamp updates via triggers

### **Frontend Optimizations:**
- Lazy loading of camera component
- Debounced form validation
- Optimistic UI updates with rollback
- Memory cleanup for media streams

---

## 🛡️ **Security Considerations**

### **Data Protection:**
- All user data isolated via RLS policies
- JWT tokens with short expiration (7 days)
- HTTPS-only cookie settings (when applicable)
- Base64 photo storage (consider encryption for production)

### **Input Sanitization:**
- SQL injection prevention via prepared statements
- XSS protection via React's built-in escaping
- File type validation for photos
- Age verification for compliance

---

## 🔧 **Development Setup**

### **Environment Requirements:**
```bash
Node.js: >=18.0.0
Next.js: ^13.5.11
React: 18.2.0
Supabase: Latest
TypeScript: 5.2.2
```

### **Development Workflow:**
1. Local development with `.env.local`
2. Database migrations via Supabase dashboard
3. Component testing with React DevTools
4. API testing with browser network tab

---

**Implementation Status: Production Ready** ✅