# SmartATM - Render (Backend) + Vercel (Frontend) Setup

## Current Setup:
- ✅ **Backend**: Render - `https://smartatm-5s3p.onrender.com`
- ✅ **Frontend**: Vercel - `https://smart-atm-three.vercel.app`
- ✅ **Database**: MongoDB Atlas

---

## সমস্যা সমাধান (Step by Step):

### ধাপ ১: Backend (Render) Configuration চেক করুন

#### 1.1 Render Dashboard-এ যান
- https://dashboard.render.com
- আপনার backend service select করুন

#### 1.2 Environment Variables চেক করুন
নিশ্চিত করুন এই variables আছে:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/smartatm?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
PORT=10000
```

**Important**: Render automatically `PORT` set করে, তবে আপনার code-এ `process.env.PORT` use করা আছে তাই ঠিক আছে।

#### 1.3 Backend Redeploy করুন
যেহেতু আমি `backend/server.js`-এ CORS configuration update করেছি:

1. Git-এ changes push করুন:
   ```bash
   cd backend
   git add server.js
   git commit -m "Fix CORS for Vercel frontend"
   git push
   ```

2. Render automatically redeploy করবে
   - অথবা Render Dashboard থেকে manually "Deploy latest commit" করুন

#### 1.4 Backend Test করুন
Browser-এ test করুন:
```
https://smartatm-5s3p.onrender.com/health
```

Expected Response:
```json
{
  "status": "OK",
  "timestamp": "2024-...",
  "uptime": 123.45
}
```

---

### ধাপ ২: MongoDB Atlas Configuration

#### 2.1 Network Access Configure করুন
1. MongoDB Atlas Dashboard: https://cloud.mongodb.com
2. **Network Access** → **IP Access List**
3. **"Add IP Address"** ক্লিক করুন
4. **"Allow Access from Anywhere"** select করুন
   - IP Address: `0.0.0.0/0`
   - Comment: "Allow Render and Vercel"
5. **Confirm** করুন

#### 2.2 Database User চেক করুন
1. **Database Access** tab-এ যান
2. User এর permissions চেক করুন:
   - Role: "Atlas Admin" অথবা "Read and write to any database"
3. Password সঠিক আছে কিনা verify করুন

---

### ধাপ ৩: Frontend (Vercel) Configuration

#### 3.1 Environment Variables Set করুন

**Option A: Vercel Dashboard থেকে:**
1. https://vercel.com/dashboard
2. আপনার frontend project select করুন
3. **Settings** → **Environment Variables**
4. Add করুন:
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://smartatm-5s3p.onrender.com
   Environment: Production, Preview, Development (সব select করুন)
   ```
5. **Save** করুন

**Option B: Git থেকে (Already done):**
- `frontend/.env.local` ফাইলে already set করা আছে
- কিন্তু Vercel Dashboard-এও set করতে হবে

#### 3.2 Frontend Redeploy করুন

**Method 1: Git Push (Recommended):**
```bash
git add .
git commit -m "Configure backend URL for Render"
git push
```
Vercel automatically redeploy করবে।

**Method 2: Manual Redeploy:**
1. Vercel Dashboard → Your Project
2. **Deployments** tab
3. Latest deployment-এ **"..."** → **"Redeploy"**

---

### ধাপ ৪: Test করুন

#### 4.1 Backend API Test
Terminal থেকে:
```bash
# Health check
curl https://smartatm-5s3p.onrender.com/health

# API root
curl https://smartatm-5s3p.onrender.com/

# Test CORS
curl -H "Origin: https://smart-atm-three.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://smartatm-5s3p.onrender.com/api/auth/login -v
```

#### 4.2 Frontend Test
1. Browser-এ যান: `https://smart-atm-three.vercel.app`
2. **Developer Console** খুলুন (F12)
3. **Network** tab select করুন
4. Login page-এ যান
5. Login করার চেষ্টা করুন
6. Network tab-এ API requests দেখুন:
   - Request URL: `https://smartatm-5s3p.onrender.com/api/auth/login`
   - Status: 200 (success) অথবা 401 (wrong credentials)
   - যদি CORS error না আসে তাহলে ঠিক আছে!

---

## Common Issues এবং Solutions:

### Issue 1: "Unable to connect to server"

**Possible Causes:**
- Backend Render-এ sleeping mode-এ আছে (free tier)
- CORS configuration সঠিক না
- Environment variable সঠিক না

**Solutions:**
1. Backend URL browser-এ খুলে wake up করুন
2. Render logs চেক করুন:
   - Render Dashboard → Your Service → Logs
3. Backend redeploy করুন

### Issue 2: "CORS Error"

**Solution:**
- Backend `server.js`-এ CORS configuration ঠিক আছে (আমি fix করেছি)
- Backend redeploy করুন
- Browser cache clear করুন (Ctrl+Shift+Delete)

### Issue 3: "MongoNetworkError"

**Solution:**
- MongoDB Atlas Network Access-এ `0.0.0.0/0` আছে কিনা চেক করুন
- `MONGO_URI` সঠিক আছে কিনা verify করুন
- MongoDB cluster paused নেই তো?

### Issue 4: Render Free Tier - Backend Sleeping

**Problem:**
Render free tier-এ 15 minutes inactivity পর service sleep করে যায়।

**Solutions:**

**Option A: Keep-Alive Service (Recommended):**
1. https://uptimerobot.com বা https://cron-job.org use করুন
2. Every 10 minutes-এ আপনার backend health endpoint ping করুন:
   ```
   https://smartatm-5s3p.onrender.com/health
   ```

**Option B: Frontend থেকে Keep-Alive:**
`frontend/app/layout.tsx`-এ যোগ করুন:
```typescript
useEffect(() => {
  // Keep backend alive
  const keepAlive = setInterval(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`)
      .catch(() => {}); // Ignore errors
  }, 10 * 60 * 1000); // Every 10 minutes

  return () => clearInterval(keepAlive);
}, []);
```

**Option C: Upgrade to Paid Plan:**
- Render paid plan ($7/month) - No sleeping

---

## Deployment Checklist:

### Backend (Render):
- [x] Deployed at: `https://smartatm-5s3p.onrender.com`
- [ ] Environment variables set (MONGO_URI, JWT_SECRET, etc.)
- [ ] CORS configured for Vercel domain
- [ ] `/health` endpoint working
- [ ] Redeploy after CORS fix

### Database (MongoDB Atlas):
- [ ] Network Access: `0.0.0.0/0` added
- [ ] Database user has proper permissions
- [ ] Connection string correct in Render env vars

### Frontend (Vercel):
- [x] Deployed at: `https://smart-atm-three.vercel.app`
- [ ] `NEXT_PUBLIC_API_URL` set in Vercel Dashboard
- [ ] Redeploy after environment variable change
- [ ] Test API calls from browser

---

## Testing Commands:

```bash
# Test backend health
curl https://smartatm-5s3p.onrender.com/health

# Test backend API root
curl https://smartatm-5s3p.onrender.com/

# Test login endpoint (example)
curl -X POST https://smartatm-5s3p.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://smart-atm-three.vercel.app" \
  -d '{"cardNumber":"1234567890123456","pin":"1234"}'

# Check if backend is responding
ping smartatm-5s3p.onrender.com
```

---

## Files Updated:

1. ✅ `backend/server.js` - CORS configuration fixed
2. ✅ `frontend/.env.local` - Backend URL set to Render

---

## Next Steps:

1. **Backend redeploy করুন** (CORS fix apply করার জন্য)
2. **Vercel Dashboard-এ environment variable set করুন**
3. **Frontend redeploy করুন**
4. **Test করুন**

---

## Important URLs:

- **Frontend**: https://smart-atm-three.vercel.app
- **Backend**: https://smartatm-5s3p.onrender.com
- **Backend Health**: https://smartatm-5s3p.onrender.com/health
- **Backend API Docs**: https://smartatm-5s3p.onrender.com/

- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **MongoDB Atlas**: https://cloud.mongodb.com

---

## Support:

যদি সমস্যা হয়:
1. **Render Logs** চেক করুন
2. **Vercel Function Logs** চেক করুন
3. **Browser Console** চেক করুন
4. **MongoDB Atlas Logs** চেক করুন

---

## Performance Tips:

1. **Render Free Tier**: 15 minutes inactivity পর sleep করে
   - Solution: UptimeRobot দিয়ে keep-alive setup করুন

2. **Cold Start**: First request slow হতে পারে
   - Solution: Keep-alive service use করুন

3. **MongoDB Atlas Free Tier**: M0 cluster limited performance
   - Upgrade করলে better performance পাবেন
