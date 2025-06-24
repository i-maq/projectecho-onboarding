# 🚀 Deployment Guide - User Data Collection System

## 📋 **Pre-Deployment Checklist**

### **Environment Setup:**
✅ Supabase project created and configured  
✅ Database migrations applied  
✅ Environment variables configured  
✅ Authentication flow tested  
✅ Camera permissions verified  

### **Security Verification:**
✅ RLS policies active on all tables  
✅ JWT secrets are secure and unique  
✅ API endpoints return proper error codes  
✅ User data isolation confirmed  

---

## 🌐 **Production Deployment**

### **1. Supabase Production Setup:**

```sql
-- Apply these migrations in Supabase Dashboard → SQL Editor:

-- Migration 1: Basic schema
CREATE TABLE IF NOT EXISTS users (
  id serial PRIMARY KEY,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Migration 2: Helper function
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS integer AS $$
BEGIN
  RETURN COALESCE(current_setting('app.current_user_id', true)::integer, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Migration 3: User profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date NOT NULL,
  age integer NOT NULL,
  photo_data text,
  echo_avatar_data text,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_unique UNIQUE (user_id);
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Migration 4: RLS Policies
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (user_id = get_current_user_id());

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (user_id = get_current_user_id());
```

### **2. Environment Variables for Production:**

```bash
# In your hosting platform (Vercel, Netlify, etc.)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=your-super-secure-production-jwt-secret-256-bits-minimum
NODE_ENV=production
```

### **3. Build Configuration:**

```json
// package.json build scripts
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "deploy": "npm run build && npm run start"
  }
}
```

---

## 📊 **Performance Monitoring**

### **Key Metrics to Track:**
- Database connection latency
- Authentication response times
- Photo upload success rates
- User onboarding completion rates
- Error rates by API endpoint

### **Monitoring Setup:**
```javascript
// Add to API routes for production monitoring
console.log(`[${new Date().toISOString()}] ${method} ${route} - ${status} - ${responseTime}ms`);
```

---

## 🛡️ **Security Hardening**

### **Production Security Checklist:**
✅ HTTPS enforced everywhere  
✅ Environment variables secured  
✅ Database RLS policies active  
✅ JWT secrets rotated from development  
✅ Rate limiting on API endpoints (recommended)  
✅ Input validation on all forms  

### **Additional Security Measures:**
```javascript
// Add rate limiting (optional)
import { NextApiRequest, NextApiResponse } from 'next';

// Implement request throttling for production
const rateLimiter = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
};
```

---

## 🔄 **Backup and Recovery**

### **Database Backup Strategy:**
- Supabase automatically backs up data
- Export user data periodically for redundancy
- Test restoration procedures

### **Application Backup:**
```bash
# Create deployment backup
git tag -a v4-production -m "User data collection system - production ready"
git push origin v4-production

# Store environment variables securely
# (Use your hosting platform's secret management)
```

---

## 📈 **Scaling Considerations**

### **Database Scaling:**
- Monitor connection pool usage
- Add indexes for frequently queried columns
- Consider read replicas for heavy read workloads

### **Application Scaling:**
- Stateless design allows horizontal scaling
- Photo storage may need dedicated solution (S3, Cloudinary)
- Consider CDN for static assets

---

## 🔍 **Testing in Production**

### **Deployment Verification:**
```bash
# Test critical user flows
1. User registration/login
2. Onboarding flow completion
3. Personal data submission
4. Camera capture and photo storage
5. Dashboard access and functionality
```

### **Production Health Checks:**
```javascript
// Add health check endpoint
// GET /api/health
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-01-24T...",
  "version": "4.0.0"
}
```

---

## 🚨 **Troubleshooting Guide**

### **Common Issues:**

**Issue: Database connection fails**
```bash
Solution:
1. Verify SUPABASE_SERVICE_ROLE_KEY is set correctly
2. Check Supabase project URL format
3. Confirm database migrations were applied
4. Test connection in Supabase dashboard
```

**Issue: Camera permissions denied**
```bash
Solution:
1. Ensure HTTPS is enabled (required for camera access)
2. Check browser camera permissions
3. Verify getUserMedia API support
4. Test on different browsers/devices
```

**Issue: Authentication tokens invalid**
```bash
Solution:
1. Verify JWT_SECRET matches across environments
2. Check token expiration (7 days default)
3. Confirm localStorage is accessible
4. Test with fresh browser session
```

---

## 📞 **Support and Maintenance**

### **Regular Maintenance Tasks:**
- Monitor error logs weekly
- Update dependencies monthly
- Review security configurations quarterly
- Backup verification monthly

### **Emergency Contacts:**
- Database: Supabase support
- Hosting: Platform-specific support
- Application: Development team

---

**Deployment Status: Ready for Production** 🚀

This system is production-ready with user authentication, secure data storage, and full onboarding functionality!