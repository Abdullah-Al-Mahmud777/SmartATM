# SmartATM System Troubleshooting Guide

## 🔍 System Check করুন

### 1. Backend Server Check

#### Backend Start করুন:
```bash
cd backend
node server.js
```

#### Expected Output:
```
🚀 Server running on http://localhost:5000
📝 Environment: development
🔗 API Documentation: http://localhost:5000
✅ MongoDB Atlas Connected Successfully!
📊 Database: smart_atm_db
```

#### যদি Error আসে:

**Error: Cannot find module**
```bash
cd backend
npm install
node server.js
```

**Error: MongoDB Connection Failed**
- Check `.env` file এ MongoDB URI সঠিক আছে কিনা
- Internet connection check করুন
- MongoDB Atlas এ IP whitelist করা আছে কিনা check করুন

**Error: Port 5000 already in use**
```bash
# Port 5000 এ চলমান process kill করুন
lsof -ti:5000 | xargs kill -9
# তারপর আবার start করুন
node server.js
```

### 2. Frontend Server Check

#### Frontend Start করুন:
```bash
cd frontend
npm run dev
```

#### Expected Output:
```
▲ Next.js 16.1.6 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://192.168.0.101:3000
✓ Starting...
✓ Ready in 3.1s
```

#### যদি Error আসে:

**Error: Port 3000 already in use**
```bash
# সব Next.js processes kill করুন
pkill -f "next dev"
# Lock file remove করুন
rm -rf frontend/.next/dev
# তারপর আবার start করুন
npm run dev
```

**Error: Module not found**
```bash
cd frontend
npm install
npm run dev
```

**Error: Unable to acquire lock**
```bash
# Lock file remove করুন
rm -rf frontend/.next/dev/lock
rm -rf frontend/.next/dev
# তারপর আবার start করুন
npm run dev
```

## 🐛 Common Problems এবং Solutions

### Problem 1: Dashboard এ login করার পরও redirect হচ্ছে

**Solution:**
1. Browser console open করুন (F12)
2. Application/Storage tab এ যান
3. localStorage check করুন - `atmToken` এবং `atmUser` আছে কিনা
4. যদি না থাকে, আবার login করুন
5. Network tab এ check করুন API call successful হচ্ছে কিনা

### Problem 2: API calls failed হচ্ছে

**Check করুন:**
```bash
# Backend running কিনা check করুন
curl http://localhost:5000/health

# Expected response:
# {"status":"OK","timestamp":"...","uptime":...}
```

**যদি response না আসে:**
- Backend server চলছে কিনা check করুন
- Port 5000 blocked কিনা check করুন
- Firewall settings check করুন

### Problem 3: MongoDB Connection Error

**Solutions:**
1. `.env` file check করুন:
```env
MONGODB_URI=mongodb+srv://shuvo:1234@cluster0.bfd2hb1.mongodb.net/smart_atm_db
JWT_SECRET=smartatm-secret-key-2024-change-in-production
PORT=5000
```

2. MongoDB Atlas এ:
   - Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
   - Database Access → User এর password সঠিক আছে কিনা check করুন

3. Internet connection check করুন

### Problem 4: Registration/Login Failed

**Check করুন:**
1. Backend console এ error message দেখুন
2. Browser console এ network tab check করুন
3. Request payload সঠিক আছে কিনা verify করুন

**Common Issues:**
- PIN 4 digits না হলে error আসবে
- Card number 16 digits হতে হবে
- Email unique হতে হবে
- Phone number valid হতে হবে

### Problem 5: Balance দেখাচ্ছে না

**Solution:**
1. Login করার পর token সঠিকভাবে save হয়েছে কিনা check করুন
2. Backend API `/api/transactions/balance` working কিনা test করুন:
```bash
# Replace YOUR_TOKEN with actual token from localStorage
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/transactions/balance
```

### Problem 6: Logout কাজ করছে না

**Solution:**
1. Browser console check করুন
2. localStorage clear হচ্ছে কিনা verify করুন
3. Manual clear করুন:
```javascript
// Browser console এ run করুন
localStorage.removeItem('atmToken');
localStorage.removeItem('atmUser');
location.reload();
```

## 🔧 Manual Testing Commands

### Test Backend APIs:

#### 1. Health Check:
```bash
curl http://localhost:5000/health
```

#### 2. Register User:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "01712345678",
    "cardNumber": "1234567890123456",
    "pin": "1234",
    "accountNumber": "1234567890"
  }'
```

#### 3. Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "cardNumber": "1234567890123456",
    "pin": "1234"
  }'
```

#### 4. Get Balance (need token):
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:5000/api/transactions/balance
```

## 📋 System Requirements Check

### Node.js Version:
```bash
node --version
# Should be v18 or higher
```

### NPM Version:
```bash
npm --version
# Should be v9 or higher
```

### Check Ports:
```bash
# Check if port 5000 is free
lsof -ti:5000

# Check if port 3000 is free
lsof -ti:3000
```

## 🚀 Fresh Start (যদি সব কিছু reset করতে চান)

### Backend Fresh Start:
```bash
cd backend
# Kill any running process
lsof -ti:5000 | xargs kill -9
# Remove node_modules
rm -rf node_modules
# Fresh install
npm install
# Start server
node server.js
```

### Frontend Fresh Start:
```bash
cd frontend
# Kill any running process
pkill -f "next dev"
lsof -ti:3000 | xargs kill -9
# Remove build files
rm -rf .next
rm -rf node_modules
# Fresh install
npm install
# Start server
npm run dev
```

## 📊 Verify Everything is Working

### Checklist:
- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:3000
- [ ] MongoDB connected (check backend console)
- [ ] Can access http://localhost:3000 in browser
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Dashboard shows after login
- [ ] Balance displays correctly
- [ ] Can logout successfully
- [ ] Cannot access dashboard without login

## 🆘 যদি এখনও সমস্যা থাকে

### Debug Steps:

1. **Backend Console Check:**
   - কোনো error message আছে কিনা দেখুন
   - MongoDB connection successful কিনা verify করুন

2. **Frontend Console Check (Browser F12):**
   - Console tab এ error আছে কিনা দেখুন
   - Network tab এ API calls successful কিনা check করুন

3. **Browser localStorage Check:**
   - F12 → Application → Local Storage
   - `atmToken` এবং `atmUser` আছে কিনা verify করুন

4. **Network Check:**
   - Backend API accessible কিনা test করুন
   - CORS error আসছে কিনা check করুন

## 📝 Log Files

### Backend Logs:
Backend console এ সব logs দেখা যাবে:
- API requests
- MongoDB queries
- Errors

### Frontend Logs:
Browser console (F12) এ দেখা যাবে:
- Component errors
- API call errors
- State management issues

## 🎯 Quick Fix Commands

```bash
# Backend restart
cd backend && lsof -ti:5000 | xargs kill -9 && node server.js

# Frontend restart
cd frontend && pkill -f "next dev" && rm -rf .next/dev && npm run dev

# Clear all ports
lsof -ti:3000,5000 | xargs kill -9

# Fresh install everything
cd backend && rm -rf node_modules && npm install
cd frontend && rm -rf node_modules .next && npm install
```

## ✅ Success Indicators

যখন সব কিছু ঠিক থাকবে:

1. **Backend Console:**
   ```
   🚀 Server running on http://localhost:5000
   ✅ MongoDB Atlas Connected Successfully!
   ```

2. **Frontend Console:**
   ```
   ✓ Ready in 3.1s
   ```

3. **Browser:**
   - Home page load হবে
   - Login করা যাবে
   - Dashboard access করা যাবে
   - সব features কাজ করবে

## 📞 Support

যদি এখনও সমস্যা থাকে:
1. Backend console এর screenshot নিন
2. Browser console এর screenshot নিন
3. Error message copy করুন
4. কোন step এ সমস্যা হচ্ছে সেটা note করুন
