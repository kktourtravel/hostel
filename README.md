# 🏨 Hostel Booking System - Secure Admin Authentication

## 🔒 NEW: Enterprise-Grade JWT Authentication

Your hostel admin panel now has **complete security implementation** with JWT tokens, session management, and protected routes!

---

## ✅ Security Features Added

### Frontend Security Layer
✅ **auth-guard.js** - Protects admin pages with backend token verification  
✅ **admin.html** - Updated login with secure JWT token storage  
✅ **adminDashboard.html** - Fully protected dashboard with session timer  
✅ **Session timeout** - Auto-logout after 30 minutes of inactivity  
✅ **Token verification** - All API calls authenticated  

### Backend Security Layer
✅ **server.js** - Complete Node.js/Express backend with JWT  
✅ **JWT authentication** - Secure tokens with 30-minute expiry  
✅ **Password hashing** - bcrypt for secure password storage  
✅ **Protected routes** - Middleware verifies all admin requests  
✅ **CORS protection** - Only your domain can access APIs  
✅ **Security headers** - Helmet.js for additional protection  

### Configuration & Protection
✅ **package.json** - All dependencies specified  
✅ **.env.example** - Configuration template  
✅ **.gitignore** - Protects secrets and dependencies  
✅ **SECURITY_GUIDE.md** - Complete deployment guide  

---

## 📋 Original Features (Still Working!)

### 🛏️ Booking System
- Real‑time bed availability  
- Bed selection  
- Guest details form  
- Booking confirmation  
- Automatic email notifications  
- Google Calendar event creation  

### 🧑‍💼 Admin Dashboard (Now Secure!)
- ✅ Login with JWT authentication  
- View all bookings  
- Filter by date, room, status  
- Add manual bookings  
- Cancel bookings  
- Block beds (maintenance/cleaning)  
- Export bookings to Excel  

### 📄 Frontend Pages
- Homepage  
- Rooms page  
- Booking page  
- Admin login (JWT secured)
- Admin dashboard (Protected with auth guard)

### 📦 Backend API
- `/api/rooms`
- `/api/availability`
- `/api/book`
- `/api/admin/login` - Now returns JWT token
- `/api/admin/verify` - Verify token validity
- `/api/admin/bookings` - Protected route
- `/api/admin/bookings/add` - Protected route
- `/api/admin/bookings/cancel` - Protected route
- `/api/admin/block` - Protected route
- `/api/admin/export/excel` - Protected route

---

## 🧱 Tech Stack

**Frontend:**  
- HTML  
- CSS (Poppins, sky‑blue theme)  
- Vanilla JavaScript  
- **NEW:** JWT authentication guard

**Backend:**  
- Node.js  
- Express.js  
- MySQL/PostgreSQL (ready to connect)
- **NEW:** JWT Authentication  
- **NEW:** bcryptjs password hashing
- **NEW:** Helmet security headers
- **NEW:** CORS protection
- Nodemailer  
- XLSX (Excel export)  

**Deployment:**  
- Render.com (recommended for backend)
- GitHub Pages (frontend)
- Nginx / PM2 / Certbot (alternative)
- Linux server (Ubuntu recommended)

---

## 🚀 Quick Start (5 Steps)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Create Environment File
```bash
cp .env.example .env
```

### Step 3: Configure Settings
Edit `.env`:
```env
PORT=5000
NODE_ENV=production
JWT_SECRET=your_unique_secret_key_min_32_chars_abc123xyz
JWT_EXPIRY=30m
CORS_ORIGIN=https://kktourtravel.github.io
```

**⚠️ CRITICAL:** Change `JWT_SECRET` to something unique!

### Step 4: Create Admin Account
Generate secure password hash:
```bash
node -e "require('bcryptjs').hash('your_password', 10).then(console.log)"
```

Update `admins` array in `server.js`:
```javascript
const admins = [
    {
        id: 1,
        email: 'admin@hostel.com',
        name: 'Your Name',
        passwordHash: 'paste_the_hash_here'
    }
];
```

### Step 5: Deploy
```bash
# Test locally
npm run dev

# Then deploy to Render.com
git push origin main
```

---

## 🔐 How Security Works

### Login Flow 🔄
```
1. User enters email/password → admin.html
   ↓
2. Frontend POST /api/admin/login with credentials
   ↓
3. Backend verifies password (bcrypt comparison)
   ↓
4. Backend generates JWT token (expires 30 min)
   ↓
5. Frontend stores token in localStorage
   ↓
6. User redirected to protected adminDashboard.html
```

### Protected API Calls 🛡️
```
Every admin request includes:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
   ↓
Backend middleware verifies JWT signature
   ↓
If valid → Return requested data
If expired/invalid → Return 401 Unauthorized
   ↓
Frontend catches 401 and redirects to login
```

### Session Management ⏱️
```
30 minutes of no activity
   ↓
Token expires automatically
   ↓
Next API call fails with 401
   ↓
Frontend detects and redirects to login
   ↓
Admin must login again
```

### Private vs Public Repository?
**Answer:** NO - Don't need to make it private! Here's why:
- ✅ Frontend code is already public (GitHub Pages)
- ✅ Backend runs on Render.com (not GitHub)
- ✅ Secrets in `.env` never committed (protected by .gitignore)
- ✅ Security enforced by backend JWT verification
- ✅ Recommendation: Keep public, security depends on backend

---

## 📊 Files & Changes

| File | Status | Purpose |
|------|--------|---------|
| `admin.html` | ✅ Updated | JWT token login |
| `adminDashboard.html` | ✅ Created | Protected dashboard + session timer |
| `auth-guard.js` | ✅ Created | Frontend security middleware |
| `server.js` | ✅ Created | Complete backend with JWT |
| `package.json` | ✅ Created | Dependencies |
| `.env.example` | ✅ Created | Configuration template |
| `.gitignore` | ✅ Created | Protect secrets |
| `SECURITY_GUIDE.md` | ✅ Created | Deployment guide |
| `BACKEND_SETUP.js` | ✅ Created | Implementation reference |
| `README.md` | ✅ Updated | This file |

---

## 🔑 API Endpoints

| Method | Endpoint | Protected | Purpose |
|--------|----------|-----------|---------|
| POST | `/api/admin/login` | ❌ | Get JWT token |
| GET | `/api/admin/verify` | ✅ | Verify token valid |
| GET | `/api/admin/bookings` | ✅ | Get all bookings |
| GET | `/api/admin/rooms` | ✅ | Get all rooms |
| PUT | `/api/admin/bookings/:id` | ✅ | Update booking |
| PUT | `/api/admin/rooms/:number` | ✅ | Update room status |
| POST | `/api/admin/logout` | ✅ | Logout |
| GET | `/health` | ❌ | Server status |

---

## 🧪 Test Security

### Test 1: Wrong Password
```
Email: admin@hostel.com
Password: wrong123
Expected: "Login failed. Please try again."
```

### Test 2: No Authentication Token
```javascript
// Browser console (F12)
localStorage.removeItem("adminToken")
// Refresh page
// Expected: Auto-redirect to login page
```

### Test 3: Invalid Token
```javascript
// Browser console (F12)
localStorage.setItem("adminToken", "invalid_fake_token")
// Refresh page
// Expected: Token verification fails → redirect to login
```

### Test 4: Session Timeout
1. Login normally
2. Wait 30 minutes without activity
3. Try to click anything
4. Expected: "Session expired" alert + redirect to login

---

## 🛠️ Environment Variables

```env
PORT              # Server listening port (default: 5000)
NODE_ENV          # 'production' or 'development'
JWT_SECRET        # Secret key for signing tokens (CHANGE THIS!)
JWT_EXPIRY        # Token lifetime (default: 30m, can use 2h, 7d)
CORS_ORIGIN       # Your frontend URL (e.g., GitHub Pages)
```

### Generate Password Hash
```bash
node -e "require('bcryptjs').hash('your_password_here', 10).then(console.log)"
# Output: $2a$10$...
# Copy this and use as passwordHash in server.js
```

---

## ✨ Security Checklist

- ✅ JWT tokens (not simple localStorage boolean)
- ✅ Password hashing (bcrypt)
- ✅ Backend token verification middleware
- ✅ Automatic session timeout (30 minutes)
- ✅ CORS protection (domain-specific)
- ✅ Security headers (Helmet.js)
- ✅ Frontend auth guards
- ✅ Auto-logout on 401/403 errors
- ✅ Activity-based session tracking
- ✅ Sensitive files in .gitignore

---

## 🚀 Deployment to Render.com

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Add JWT authentication and security"
git push origin main
```

### Step 2: Create Web Service on Render.com
1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Select your `hostel` repository
4. Fill in settings:
   - Name: `hostel-admin-backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `node server.js`

### Step 3: Add Environment Variables
In Render dashboard, add:
```
PORT = 5000
NODE_ENV = production
JWT_SECRET = your_unique_secret_key_min_32_chars
JWT_EXPIRY = 30m
CORS_ORIGIN = https://kktourtravel.github.io
```

### Step 4: Deploy
- Click "Create Web Service"
- Wait 2-3 minutes for deployment
- Get your URL (e.g., `https://hostel-abc123.onrender.com`)

### Step 5: Test
- Visit your GitHub Pages admin page
- Login with credentials
- You should see the protected dashboard

---

## 🐛 Troubleshooting

**CORS Error?**
```
→ Update CORS_ORIGIN in .env to your GitHub Pages URL
```

**Login says "Server error"?**
```
→ Check Render logs: Dashboard → Select Service → Logs
→ Verify .env variables are set correctly
```

**Token expires too quickly?**
```
→ Change JWT_EXPIRY in .env to 2h (2 hours) or longer
```

**Can't login with password?**
```
→ Regenerate hash: node -e "require('bcryptjs').hash('password', 10).then(console.log)"
→ Update passwordHash in server.js admins array
```

**Getting 403 Forbidden errors?**
```
→ Verify JWT_SECRET is the same in .env and server.js
→ Check token hasn't expired in browser
→ Try logging out and logging back in
```

---

## 📚 Documentation

- **SECURITY_GUIDE.md** - Detailed setup & deployment guide
- **BACKEND_SETUP.js** - Implementation examples & utilities
- **.env.example** - Configuration template with explanations

---

## 🎯 Implementation Checklist

- [ ] Step 1: Run `npm install`
- [ ] Step 2: Copy `.env.example` → `.env`
- [ ] Step 3: Generate unique JWT_SECRET
- [ ] Step 4: Generate password hash for admin account
- [ ] Step 5: Update admins array in server.js
- [ ] Step 6: Test locally with `npm run dev`
- [ ] Step 7: Push to GitHub
- [ ] Step 8: Deploy to Render.com
- [ ] Step 9: Test login on live site
- [ ] Step 10: Celebrate! 🎉

---

## 🔄 Tech Stack (Complete)

**Frontend (Public on GitHub Pages):**  
- HTML  
- CSS (Poppins, sky‑blue theme)  
- Vanilla JavaScript  
- JWT Authentication Guard (new!)

**Backend (Private on Render.com):**  
- Node.js  
- Express.js  
- JWT Authentication (new!)
- bcryptjs password hashing (new!)
- Helmet security headers (new!)
- CORS protection (new!)
- MySQL/PostgreSQL ready
- Nodemailer  
- XLSX (Excel export)  

**Deployment:**  
- GitHub Pages (frontend)
- Render.com (backend)
- Nginx / PM2 / Certbot (alternative)

---

## 📞 Next Steps

### Immediate
1. ✅ Follow "Quick Start" section (5 steps)
2. ✅ Deploy to Render.com
3. ✅ Test login/logout

### Short-term
- [ ] Connect real database (MongoDB/PostgreSQL)
- [ ] Add password reset
- [ ] Setup email confirmations
- [ ] Test all admin features

### Long-term
- [ ] Two-factor authentication
- [ ] Admin activity logging
- [ ] User role management
- [ ] API rate limiting

---

## 📖 Full Documentation

See **SECURITY_GUIDE.md** for:
- Detailed backend setup
- Private vs Public repository explanation
- Production hardening recommendations
- Complete troubleshooting guide
- Testing procedures

See **BACKEND_SETUP.js** for:
- Code examples
- Implementation patterns
- Utility functions
- Database integration guide

---

**🚀 Ready to secure your admin panel? Start with Step 1 in "Quick Start"!**

---

*Last Updated: 2026-08-30*  
*Version: 2.0.0 - JWT Authentication Edition*
