# Security & Admin Authentication Setup Guide

## Overview
Your hostel admin system is now secured with JWT (JSON Web Token) authentication. This guide explains:
- How private repos work with GitHub Pages
- Complete security implementation
- Deployment instructions

---

## 1. GITHUB PAGES WITH PRIVATE REPOSITORY

### Answer: NO - Private repos don't work with GitHub Pages

**Problem:** GitHub Pages requires a public repository to serve content on `username.github.io` domain.

**Solutions:**

#### Option A: Keep Frontend Public (Recommended)
- Frontend (HTML/CSS/JS) stays in public repo
- Backend (Node.js server) is completely separate and private
- Admin tokens are only valid on backend - frontend is just a UI layer
- **This is what you have now!**

#### Option B: Use Private Repository with Alternative Hosting
- Use Vercel, Netlify, or AWS to host the frontend privately
- Backend on Render (or your current setup)
- More complex but fully private

**We recommend Option A** - Your GitHub Pages stays public for the website, but security is enforced on the backend.

---

## 2. SECURITY IMPLEMENTATION COMPLETED ✅

### Frontend Security (Already Implemented)

#### ✅ `auth-guard.js` 
- Protects admin pages
- Verifies tokens with backend
- Session timeout (30 minutes)
- Auto-logout on inactivity

#### ✅ `admin.html`
- Updated login to use JWT tokens
- Stores token securely
- Prevents already-logged-in users from seeing login page

#### ✅ `adminDashboard.html`
- Automatically redirects unauthorized users to login
- Session timer display
- Logout functionality
- All API calls include JWT token

### Backend Security (Implement on Your Server)

#### ✅ `server.js`
- JWT token generation on login
- Token verification middleware
- Protected routes (bookings, rooms)
- Password hashing with bcrypt
- CORS configuration

---

## 3. STEP-BY-STEP DEPLOYMENT

### Step 1: Setup Local Development

```bash
# Clone your repo
git clone https://github.com/kktourtravel/hostel.git
cd hostel

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env with your values
# Change JWT_SECRET to something unique!
```

### Step 2: Configure Environment Variables

Edit `.env`:
```env
PORT=5000
NODE_ENV=production
JWT_SECRET=your_unique_secret_key_min_32_chars_long_abc123def456
JWT_EXPIRY=30m
CORS_ORIGIN=https://kktourtravel.github.io
```

### Step 3: Setup Admin User

In `server.js`, find the `admins` array and update it:

```javascript
const admins = [
    {
        id: 1,
        email: 'your_admin_email@hostel.com',
        name: 'Your Name',
        // Get this hash by running: node -e "require('bcryptjs').hash('your_password', 10).then(console.log)"
        passwordHash: '$2a$10$...' // Paste the hash here
    }
];
```

To generate a password hash:
```bash
node
> require('bcryptjs').hash('your_secure_password', 10).then(console.log)
# Copy the output and paste it as passwordHash
```

### Step 4: Test Locally

```bash
# Start development server
npm run dev

# Test login in browser
# Go to: http://localhost:5000/health
# Should see: {"status":"ok","message":"Server is running"}
```

### Step 5: Deploy to Render.com

1. **Push to GitHub** (Make sure all files are committed)
```bash
git add .
git commit -m "Add JWT authentication and security"
git push origin main
```

2. **Go to Render.com Dashboard**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Choose the `hostel` repository

3. **Configure Deployment**
   - Name: `hostel-admin-backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Add Environment Variables (from .env file):
     ```
     PORT = 5000
     NODE_ENV = production
     JWT_SECRET = your_unique_secret_key_here
     JWT_EXPIRY = 30m
     CORS_ORIGIN = https://kktourtravel.github.io
     ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (2-3 minutes)
   - Get your URL (e.g., `https://hostel-qhe0.onrender.com`)

### Step 6: Update Frontend URL (if changed)

Update the API_BASE in `admin.html` and `adminDashboard.html`:
```javascript
const API_BASE = "https://your-new-render-url.onrender.com";
```

Or in `auth-guard.js`:
```javascript
const AUTH_CONFIG = {
    API_BASE: "https://your-new-render-url.onrender.com"
};
```

---

## 4. HOW SECURITY WORKS

### Login Flow
```
1. User enters email/password on admin.html
   ↓
2. Frontend sends to backend: POST /api/admin/login
   ↓
3. Backend verifies password (bcrypt)
   ↓
4. Backend generates JWT token (expires in 30 minutes)
   ↓
5. Frontend stores token in localStorage
   ↓
6. User redirected to adminDashboard.html
```

### Protected API Calls
```
1. Frontend calls API endpoint (e.g., /api/admin/bookings)
   ↓
2. Frontend includes JWT token in Authorization header:
   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
   ↓
3. Backend middleware verifies token
   ↓
4. If valid: Return data
   If expired/invalid: Return 401/403 error
   ↓
5. Frontend catches 401/403 and redirects to login
```

### Session Timeout
```
30 minutes of inactivity
   ↓
Token expires automatically
   ↓
Any API call fails with 401
   ↓
Frontend detects and redirects to login
   ↓
User must login again
```

---

## 5. SECURITY CHECKLIST

- ✅ JWT tokens for authentication
- ✅ Password hashing with bcrypt
- ✅ Token verification on all protected routes
- ✅ Automatic session timeout (30 minutes)
- ✅ CORS protection (only your domain)
- ✅ Helmet.js for security headers
- ✅ Frontend guards on admin pages
- ✅ Protected API endpoints

---

## 6. TESTING SECURITY

### Test 1: Login with Wrong Password
```
Email: admin@hostel.com
Password: wrong_password
Expected: "Login failed"
```

### Test 2: Access Dashboard Without Login
```
- Open browser console: F12
- Type: localStorage.removeItem("adminToken")
- Refresh page
Expected: Redirected to login page
```

### Test 3: Invalid Token
```
- Open browser console: F12
- Type: localStorage.setItem("adminToken", "invalid_token_123")
- Refresh page
Expected: Redirected to login page
```

### Test 4: Session Timeout
```
- Login normally
- Wait 30 minutes without activity
- Try to click anything
Expected: "Session expired" message and redirect to login
```

---

## 7. TROUBLESHOOTING

### Issue: CORS Error
**Solution:** Update `CORS_ORIGIN` in .env to match your frontend URL

### Issue: Login fails with "Server error"
**Solution:** Check backend logs on Render dashboard

### Issue: Token expires too quickly
**Solution:** Update `JWT_EXPIRY` in .env (e.g., `2h` for 2 hours)

### Issue: Password hash not working
**Solution:** Regenerate password hash:
```bash
node -e "require('bcryptjs').hash('your_password', 10).then(console.log)"
```

---

## 8. NEXT STEPS

1. **Database Setup** (Recommended)
   - Replace array-based data with MongoDB/PostgreSQL
   - Store bookings and rooms in database
   - Store admin logs for audit trail

2. **Add Features**
   - Admin email verification
   - Password reset functionality
   - Two-factor authentication
   - Admin activity logging

3. **Production Hardening**
   - Use environment variables for secrets
   - Enable HTTPS (Render does this automatically)
   - Add rate limiting to prevent brute force
   - Setup database encryption

---

## Quick Reference: API Endpoints

| Method | Endpoint | Protected | Purpose |
|--------|----------|-----------|---------|
| POST | `/api/admin/login` | ❌ | Admin login, returns JWT |
| GET | `/api/admin/verify` | ✅ | Verify token validity |
| GET | `/api/admin/bookings` | ✅ | Get all bookings |
| GET | `/api/admin/rooms` | ✅ | Get all rooms |
| PUT | `/api/admin/bookings/:id` | ✅ | Update booking |
| PUT | `/api/admin/rooms/:number` | ✅ | Update room status |
| POST | `/api/admin/logout` | ✅ | Logout (frontend handles) |
| GET | `/health` | ❌ | Check server status |

---

**Questions or issues?** Check the backend logs in Render dashboard → Logs section.
