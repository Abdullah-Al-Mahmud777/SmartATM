# Troubleshooting Guide - Admin Analytics & ATM Monitoring

## ✅ Backend Status: WORKING

Backend endpoints are confirmed working via curl tests:
- ✅ Admin Login
- ✅ Analytics API
- ✅ ATM Monitoring API

## 🔍 Diagnostic Steps

### Step 1: Test Connection Page

I've created a diagnostic page to test the connection:

**URL:** http://localhost:3000/admin/test-connection

This page will:
1. Test backend health
2. Test admin login
3. Test analytics endpoint
4. Test ATM monitoring endpoint
5. Check localStorage

**How to use:**
```bash
# Make sure both servers are running
# Terminal 1
cd backend
node server.js

# Terminal 2
cd frontend
npm run dev

# Then open browser:
http://localhost:3000/admin/test-connection
```

Click "Run Tests" and check results.

### Step 2: Check Browser Console

Open browser console (F12) and look for:

**Common Errors:**

1. **CORS Error:**
```
Access to fetch at 'http://localhost:5000/api/admin/analytics' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```
**Solution:** Backend already has CORS enabled, but restart backend server

2. **Network Error:**
```
Failed to fetch
TypeError: Failed to fetch
```
**Solution:** Backend not running or wrong URL

3. **401 Unauthorized:**
```
{"success":false,"message":"No token provided"}
```
**Solution:** Login again to get fresh token

4. **Token Expired:**
```
{"success":false,"message":"Invalid or expired token"}
```
**Solution:** Login again (tokens expire after 24 hours)

### Step 3: Verify Servers Running

**Backend Check:**
```bash
# Check if backend is running
curl http://localhost:5000/health

# Should return:
{"status":"OK","timestamp":"...","uptime":...}
```

**Frontend Check:**
```bash
# Check if frontend is running
curl http://localhost:3000

# Should return HTML
```

### Step 4: Check LocalStorage

In browser console:
```javascript
// Check if admin token exists
localStorage.getItem('adminToken')

// Check if admin user exists
localStorage.getItem('adminUser')

// If null, login again
```

### Step 5: Clear Cache and Retry

```javascript
// In browser console
localStorage.clear()
location.reload()
```

Then login again at: http://localhost:3000/admin/login

## 🐛 Common Issues & Solutions

### Issue 1: "Loading..." Forever

**Symptoms:**
- Page shows loading spinner forever
- No data appears

**Causes:**
- Backend not running
- Wrong API URL
- Network error

**Solutions:**
```bash
# 1. Check backend is running
curl http://localhost:5000/health

# 2. Restart backend
cd backend
node server.js

# 3. Check frontend API_URL
# Should be: const API_URL = 'http://localhost:5000';
```

### Issue 2: Redirects to Login

**Symptoms:**
- Automatically redirects to /admin/login
- Can't access analytics or ATM monitoring

**Causes:**
- No token in localStorage
- Token expired

**Solutions:**
1. Login at http://localhost:3000/admin/login
2. Use credentials: admin / admin123
3. Check localStorage has token

### Issue 3: Empty Data / "No data available"

**Symptoms:**
- Pages load but show no data
- "No transaction data available"
- "No ATM data available"

**Solutions:**

**For Analytics:**
```bash
# Need transaction data
# Login as user and make some transactions
# Or use existing user data
```

**For ATM Monitoring:**
```bash
# Click "Seed Sample ATM Data" button on the page
# Or use curl:
curl -X POST http://localhost:5000/api/admin/atm-monitoring/seed/sample-data \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Issue 4: Console Shows Errors

**Check for these specific errors:**

**Error: "Unexpected token < in JSON"**
- Backend returned HTML instead of JSON
- Usually means endpoint doesn't exist
- Check route is registered in server.js

**Error: "Cannot read property 'map' of undefined"**
- Data structure doesn't match expected format
- Check API response structure

**Error: "localStorage is not defined"**
- Server-side rendering issue
- Make sure using 'use client' directive

## 📋 Verification Checklist

### Backend Checklist:
- [ ] Backend server running on port 5000
- [ ] MongoDB connected
- [ ] No errors in backend console
- [ ] Routes registered in server.js
- [ ] CORS enabled
- [ ] Admin user exists in database

### Frontend Checklist:
- [ ] Frontend server running on port 3000
- [ ] No errors in terminal
- [ ] No errors in browser console
- [ ] Admin token in localStorage
- [ ] Correct API_URL in pages
- [ ] 'use client' directive present

### Database Checklist:
- [ ] MongoDB running
- [ ] Database: smart_atm_db
- [ ] Admin collection has admin user
- [ ] ATM collection has ATMs (or can seed)
- [ ] Transaction collection has data (optional)

## 🔧 Quick Fixes

### Fix 1: Complete Restart

```bash
# Stop everything (Ctrl+C in all terminals)

# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend  
cd frontend
npm run dev

# Browser
# Clear cache: Ctrl+Shift+Delete
# Clear localStorage: localStorage.clear()
# Reload: Ctrl+Shift+R
```

### Fix 2: Re-login

```bash
# Browser
1. Go to: http://localhost:3000/admin/login
2. Login: admin / admin123
3. Go to: http://localhost:3000/admin/analytics
4. Go to: http://localhost:3000/admin/atm-monitoring
```

### Fix 3: Reseed Data

```bash
# Get fresh token
TOKEN=$(curl -s -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Seed ATMs
curl -X POST http://localhost:5000/api/admin/atm-monitoring/seed/sample-data \
  -H "Authorization: Bearer $TOKEN"
```

## 🧪 Manual Testing

### Test Analytics Page:

1. **Open page:**
   ```
   http://localhost:3000/admin/analytics
   ```

2. **Check browser console (F12):**
   - Should see: "Fetching analytics..."
   - Should NOT see: Errors

3. **Check Network tab:**
   - Should see: GET request to /api/admin/analytics
   - Status: 200 OK
   - Response: JSON with analytics data

4. **Check page:**
   - Should see: Statistics cards
   - Should see: Transaction trends chart
   - Should see: Peak hours chart
   - Should see: Top users list

### Test ATM Monitoring Page:

1. **Open page:**
   ```
   http://localhost:3000/admin/atm-monitoring
   ```

2. **Check browser console (F12):**
   - Should see: "Fetching ATMs..."
   - Should NOT see: Errors

3. **Check Network tab:**
   - Should see: GET request to /api/admin/atm-monitoring
   - Status: 200 OK
   - Response: JSON with ATMs data

4. **Check page:**
   - Should see: Summary cards (5 cards)
   - Should see: ATM grid (8 ATMs)
   - Should see: Status badges
   - Should see: Refill/Service buttons

## 📞 Still Not Working?

If after all these steps it's still not working, provide:

1. **Backend terminal output:**
   ```bash
   cd backend
   node server.js
   # Copy all output
   ```

2. **Frontend terminal output:**
   ```bash
   cd frontend
   npm run dev
   # Copy all output
   ```

3. **Browser console errors:**
   - Press F12
   - Go to Console tab
   - Copy all red errors

4. **Network tab:**
   - Press F12
   - Go to Network tab
   - Filter: Fetch/XHR
   - Screenshot failed requests

5. **Test connection results:**
   - Go to: http://localhost:3000/admin/test-connection
   - Click "Run Tests"
   - Screenshot all results

## 🎯 Expected Working State

When everything is working correctly:

### Backend Terminal:
```
🚀 Server running on http://localhost:5000
📝 Environment: development
🔗 API Documentation: http://localhost:5000
✅ Connected to MongoDB
📊 Database: smart_atm_db
GET /api/admin/analytics - 2024-02-22T...
GET /api/admin/atm-monitoring - 2024-02-22T...
```

### Frontend Terminal:
```
▲ Next.js 16.1.6 (Turbopack)
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000
✓ Starting...
✓ Ready in 2.5s
```

### Browser Console:
```
(No errors)
```

### Browser Network Tab:
```
GET /api/admin/analytics?timeRange=7days    200 OK
GET /api/admin/atm-monitoring               200 OK
```

### Pages:
- ✅ Analytics page shows data
- ✅ ATM Monitoring page shows 8 ATMs
- ✅ No loading spinners stuck
- ✅ No error messages

## 🚀 Success Indicators

You'll know it's working when:

1. ✅ No errors in backend terminal
2. ✅ No errors in frontend terminal
3. ✅ No errors in browser console
4. ✅ Analytics page shows charts and data
5. ✅ ATM Monitoring page shows ATM cards
6. ✅ Can click time range buttons (analytics)
7. ✅ Can click Refill/Service buttons (ATM monitoring)
8. ✅ Data updates when actions performed

**Backend is confirmed working via curl. If frontend still has issues, use the test connection page to diagnose!**
