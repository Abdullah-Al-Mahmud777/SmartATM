# SmartATM - সহজ Setup Guide (বাংলা)

## আপনার Current Setup:
- ✅ **Backend**: Render-এ আছে - `https://smartatm-5s3p.onrender.com`
- ✅ **Frontend**: Vercel-এ আছে - `https://smart-atm-three.vercel.app`
- ✅ **Database**: MongoDB Atlas-এ আছে

## আমি যা ঠিক করেছি:
1. ✅ `backend/server.js` - CORS configuration fix করেছি
2. ✅ `frontend/.env.local` - Render backend URL set করেছি

---

## এখন আপনাকে যা করতে হবে:

### ১. Backend Redeploy করুন (Render)

**কেন?** আমি CORS configuration update করেছি, তাই backend redeploy করতে হবে।

**কিভাবে:**

**Option A: Git Push করে (Recommended):**
```bash
# Terminal-এ এই commands run করুন:
git add .
git commit -m "Fix CORS configuration for Vercel frontend"
git push
```
Render automatically redeploy করবে (2-3 minutes লাগবে)।

**Option B: Render Dashboard থেকে:**
1. https://dashboard.render.com এ যান
2. আপনার backend service click করুন
3. **"Manual Deploy"** → **"Deploy latest commit"** click করুন

### ২. MongoDB Atlas Network Access Configure করুন

**কেন?** Render এবং Vercel থেকে database access করার জন্য।

**কিভাবে:**
1. https://cloud.mongodb.com এ যান
2. বাম পাশে **"Network Access"** click করুন
3. **"Add IP Address"** button click করুন
4. **"Allow Access from Anywhere"** select করুন
5. **"Confirm"** click করুন

**Important:** এটা না করলে "MongoNetworkError" আসবে!

### ৩. Vercel-এ Environment Variable Set করুন

**কেন?** Frontend-কে বলতে হবে backend কোথায় আছে।

**কিভাবে:**
1. https://vercel.com/dashboard এ যান
2. আপনার frontend project click করুন
3. **"Settings"** tab-এ যান
4. বাম পাশে **"Environment Variables"** click করুন
5. **"Add New"** button click করুন
6. Fill করুন:
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://smartatm-5s3p.onrender.com
   ```
7. **Environment**: তিনটাই select করুন (Production, Preview, Development)
8. **"Save"** click করুন

### ৪. Frontend Redeploy করুন (Vercel)

**কেন?** Environment variable change করার পর redeploy করতে হয়।

**কিভাবে:**

**Option A: Git Push করে:**
```bash
git add .
git commit -m "Update backend URL configuration"
git push
```
Vercel automatically redeploy করবে।

**Option B: Vercel Dashboard থেকে:**
1. Vercel Dashboard-এ আপনার project-এ যান
2. **"Deployments"** tab click করুন
3. সবচেয়ে উপরের deployment-এ **"..."** (three dots) click করুন
4. **"Redeploy"** click করুন
5. **"Redeploy"** confirm করুন

---

## Test করুন:

### Backend Test:
Browser-এ এই URL খুলুন:
```
https://smartatm-5s3p.onrender.com/health
```

যদি এরকম দেখায় তাহলে backend ঠিক আছে:
```json
{
  "status": "OK",
  "timestamp": "2024-...",
  "uptime": 123.45
}
```

### Frontend Test:
1. Browser-এ যান: `https://smart-atm-three.vercel.app`
2. **F12** press করে Developer Console খুলুন
3. **Network** tab select করুন
4. Login page-এ যান এবং login করার চেষ্টা করুন
5. Network tab-এ দেখুন:
   - Request URL: `https://smartatm-5s3p.onrender.com/api/auth/login`
   - যদি response আসে (200 বা 401) তাহলে connection ঠিক আছে!
   - যদি "Unable to connect" না আসে তাহলে সফল! ✅

---

## সমস্যা হলে:

### সমস্যা ১: "Unable to connect to server"

**সমাধান:**
1. Backend URL check করুন: https://smartatm-5s3p.onrender.com/health
2. যদি backend response না দেয় তাহলে:
   - Render Dashboard → Logs দেখুন
   - Backend redeploy করুন
3. Vercel environment variable ঠিক আছে কিনা check করুন

### সমস্যা ২: "CORS Error"

**সমাধান:**
1. Backend redeploy করেছেন কিনা check করুন
2. Browser cache clear করুন (Ctrl+Shift+Delete)
3. Hard refresh করুন (Ctrl+F5)

### সমস্যা ৩: "MongoNetworkError"

**সমাধান:**
1. MongoDB Atlas Network Access-এ `0.0.0.0/0` আছে কিনা check করুন
2. Render Dashboard-এ `MONGO_URI` environment variable ঠিক আছে কিনা check করুন

### সমস্যা ৪: Backend Slow বা Sleeping

**কারণ:** Render free tier-এ 15 minutes inactivity পর service sleep করে।

**সমাধান:**
1. https://uptimerobot.com এ account তৈরি করুন (free)
2. Monitor add করুন:
   - URL: `https://smartatm-5s3p.onrender.com/health`
   - Interval: 5 minutes
3. এটা আপনার backend-কে awake রাখবে

---

## Quick Checklist:

- [ ] Backend redeploy করেছি (Render)
- [ ] MongoDB Atlas Network Access configure করেছি (0.0.0.0/0)
- [ ] Vercel-এ `NEXT_PUBLIC_API_URL` environment variable set করেছি
- [ ] Frontend redeploy করেছি (Vercel)
- [ ] Backend health endpoint test করেছি
- [ ] Frontend থেকে login test করেছি

---

## সব ঠিক থাকলে:

আপনার SmartATM application এখন fully functional! 🎉

- **Frontend**: https://smart-atm-three.vercel.app
- **Backend**: https://smartatm-5s3p.onrender.com
- **Database**: MongoDB Atlas

---

## Additional Tips:

1. **Keep Backend Alive**: UptimeRobot setup করুন (free tier sleeping issue solve করবে)
2. **Monitor Logs**: Render এবং Vercel logs regularly check করুন
3. **Database Backup**: MongoDB Atlas automatic backup enable করুন
4. **Security**: Production-এ strong JWT_SECRET use করুন

---

## Help Resources:

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/

---

যদি আরও কোন সমস্যা হয় তাহলে:
1. Render logs check করুন
2. Vercel function logs check করুন
3. Browser console check করুন
4. MongoDB Atlas monitoring check করুন

**বিস্তারিত guide**: `RENDER_VERCEL_SETUP.md` দেখুন
