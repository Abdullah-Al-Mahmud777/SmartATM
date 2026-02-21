# Backend Connection Test

## Backend Status: ✅ WORKING

Both endpoints are working correctly:

### 1. Admin Login
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```
✅ Response: Success with token

### 2. Analytics Endpoint
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/api/admin/analytics?timeRange=7days"
```
✅ Response: 
```json
{
  "success": true,
  "timeRange": "7days",
  "analytics": {
    "transactionTrends": [...],
    "peakHours": [...],
    "topUsers": [...],
    "errorLogs": [],
    "statistics": {...}
  }
}
```

### 3. ATM Monitoring Endpoint
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/api/admin/atm-monitoring"
```
✅ Response:
```json
{
  "success": true,
  "atms": [8 ATMs with full data],
  "summary": {
    "total": 8,
    "online": 5,
    "offline": 1,
    "maintenance": 1,
    "lowCash": 1
  }
}
```

## Frontend Issues to Check

If the frontend is not working but backend is working, check:

### 1. Is Frontend Running?
```bash
cd frontend
npm run dev
```
Should show: `http://localhost:3000`

### 2. Browser Console Errors
Open browser console (F12) and check for:
- CORS errors
- Network errors
- JavaScript errors
- Token issues

### 3. Admin Token
Check if admin token is saved in localStorage:
```javascript
// In browser console
localStorage.getItem('adminToken')
```

### 4. Network Tab
Check browser Network tab:
- Are requests being made?
- What's the response status?
- Are there any failed requests?

## Common Issues & Solutions

### Issue 1: CORS Error
**Symptom:** "Access to fetch blocked by CORS policy"
**Solution:** Backend already has CORS enabled for all origins
```javascript
app.use(cors({
  origin: '*',
  credentials: false
}));
```

### Issue 2: Token Not Found
**Symptom:** Redirects to login page
**Solution:** Login first at `/admin/login` with admin/admin123

### Issue 3: Network Error
**Symptom:** "Failed to fetch" or "Network request failed"
**Solution:** 
- Check if backend is running on port 5000
- Check if frontend is running on port 3000
- Check firewall settings

### Issue 4: Empty Data
**Symptom:** Pages load but show "No data available"
**Solution:** 
- For Analytics: Create some transactions first
- For ATM Monitoring: Click "Seed Sample ATM Data" button

## Testing Steps

### Step 1: Verify Backend
```bash
# Terminal 1 - Start backend
cd backend
node server.js

# Should show:
# 🚀 Server running on http://localhost:5000
# ✅ Connected to MongoDB
```

### Step 2: Test Endpoints
```bash
# Terminal 2 - Test endpoints
# Login
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Copy the token from response

# Test Analytics
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/admin/analytics?timeRange=7days"

# Test ATM Monitoring
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/admin/atm-monitoring"
```

### Step 3: Start Frontend
```bash
# Terminal 3 - Start frontend
cd frontend
npm run dev

# Should show:
# ▲ Next.js 16.1.6
# - Local: http://localhost:3000
```

### Step 4: Test in Browser
1. Go to: http://localhost:3000/admin/login
2. Login with: admin / admin123
3. Go to: http://localhost:3000/admin/analytics
4. Go to: http://localhost:3000/admin/atm-monitoring

### Step 5: Check Browser Console
Press F12 and check:
- Console tab for errors
- Network tab for API calls
- Application tab for localStorage

## Debug Commands

### Check if ports are in use:
```bash
# Check port 5000 (backend)
lsof -i :5000

# Check port 3000 (frontend)
lsof -i :3000
```

### Check backend logs:
```bash
# Backend should show requests
# Example:
# GET /api/admin/analytics - 2024-02-22T10:30:00.000Z
# GET /api/admin/atm-monitoring - 2024-02-22T10:30:05.000Z
```

### Test with curl and save response:
```bash
# Save analytics response
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/api/admin/analytics?timeRange=7days" \
  > analytics_response.json

# Save ATM monitoring response
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/api/admin/atm-monitoring" \
  > atm_response.json

# Check the files
cat analytics_response.json
cat atm_response.json
```

## What's Working ✅

1. ✅ Backend server running
2. ✅ MongoDB connected
3. ✅ Admin login endpoint
4. ✅ Analytics endpoint returning data
5. ✅ ATM monitoring endpoint returning data
6. ✅ 8 ATMs seeded in database
7. ✅ Transaction data available
8. ✅ CORS configured
9. ✅ JWT authentication working

## Next Steps

Since backend is working perfectly, the issue is likely:

1. **Frontend not running** - Start with `npm run dev`
2. **Token not saved** - Login again at `/admin/login`
3. **Browser cache** - Clear cache and reload
4. **Wrong URL** - Make sure using `http://localhost:3000`
5. **Console errors** - Check browser console for specific errors

## Quick Fix

Try this in order:

1. **Restart Backend:**
```bash
cd backend
# Stop with Ctrl+C
node server.js
```

2. **Restart Frontend:**
```bash
cd frontend
# Stop with Ctrl+C
npm run dev
```

3. **Clear Browser:**
- Clear cache (Ctrl+Shift+Delete)
- Clear localStorage
- Reload page (Ctrl+Shift+R)

4. **Login Again:**
- Go to http://localhost:3000/admin/login
- Login with admin/admin123
- Try analytics and ATM monitoring pages

## Contact Points

If still not working, provide:
1. Browser console errors (screenshot)
2. Network tab errors (screenshot)
3. Backend terminal output
4. Frontend terminal output

This will help identify the exact issue!
