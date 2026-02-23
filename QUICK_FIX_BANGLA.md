# SmartATM - Vercel Deployment সমস্যা সমাধান

## সমস্যা:
আপনার frontend `smart-atm-three.vercel.app` domain-এ আছে কিন্তু backend এর সাথে connect হচ্ছে না। "Unable to connect to server" error আসছে।

## কারণ:
1. Frontend `.env.local`-এ Render URL আছে, কিন্তু আপনি Vercel-এ backend deploy করতে চাচ্ছেন
2. CORS configuration-এ শুধু `/atm/home` path ছিল, পুরো domain ছিল না
3. Vercel serverless function এর জন্য proper configuration ছিল না

## সমাধান (Step by Step):

### ধাপ ১: Backend Vercel-এ Deploy করুন

1. **Vercel Dashboard** এ যান: https://vercel.com/dashboard
2. **"Add New" → "Project"** ক্লিক করুন
3. আপনার **GitHub repository** select করুন
4. **Important Settings:**
   - **Root Directory**: `backend` লিখুন
   - **Framework Preset**: "Other" রাখুন
   - **Build Command**: খালি রাখুন
   - **Output Directory**: খালি রাখুন

5. **Environment Variables** যোগ করুন (Settings → Environment Variables):
   ```
   MONGO_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/smartatm?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key
   NODE_ENV=production
   PORT=5000
   ```

6. **Deploy** বাটনে ক্লিক করুন

7. Deployment শেষ হলে আপনার backend URL পাবেন, যেমন:
   ```
   https://smartatm-backend-xyz123.vercel.app
   ```

### ধাপ ২: MongoDB Atlas Configure করুন

1. **MongoDB Atlas Dashboard** এ যান
2. **Network Access** → **IP Access List** এ যান
3. **"Add IP Address"** ক্লিক করুন
4. **"Allow Access from Anywhere"** select করুন (0.0.0.0/0)
5. **Confirm** করুন

### ধাপ ৩: Backend Test করুন

Browser-এ আপনার backend URL দিয়ে test করুন:
```
https://your-backend-url.vercel.app/health
```

যদি এরকম response আসে তাহলে backend ঠিক আছে:
```json
{
  "status": "OK",
  "timestamp": "2024-...",
  "uptime": 123.45
}
```

### ধাপ ৪: Frontend Configuration আপডেট করুন

`frontend/.env.local` ফাইল খুলুন এবং আপনার backend URL দিন:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
```

**উদাহরণ:**
```env
NEXT_PUBLIC_API_URL=https://smartatm-backend-xyz123.vercel.app
```

### ধাপ ৫: Frontend Redeploy করুন

**Option A: Vercel Dashboard থেকে:**
1. Vercel Dashboard-এ frontend project এ যান
2. **Settings** → **Environment Variables** এ যান
3. `NEXT_PUBLIC_API_URL` variable আপডেট করুন
4. **Deployments** tab-এ যান
5. Latest deployment-এ **"..."** → **"Redeploy"** ক্লিক করুন

**Option B: Git Push করে:**
1. Changes commit করুন:
   ```bash
   git add frontend/.env.local
   git commit -m "Update backend URL"
   git push
   ```
2. Vercel automatically redeploy করবে

### ধাপ ৬: Test করুন

1. আপনার frontend URL খুলুন: `https://smart-atm-three.vercel.app`
2. Browser Console (F12) খুলুন
3. **Network** tab দেখুন
4. Login করার চেষ্টা করুন
5. API requests দেখুন - এখন কাজ করবে!

---

## যদি এখনও সমস্যা হয়:

### সমস্যা: "CORS Error"

**সমাধান:**
- Backend এ CORS configuration ঠিক আছে (আমি already fix করে দিয়েছি)
- Backend redeploy করুন

### সমস্যা: "MongoNetworkError"

**সমাধান:**
- MongoDB Atlas Network Access-এ `0.0.0.0/0` আছে কিনা চেক করুন
- `MONGO_URI` সঠিক আছে কিনা verify করুন

### সমস্যা: "404 Not Found"

**সমাধান:**
- Backend Vercel-এ properly deployed আছে কিনা চেক করুন
- `/health` endpoint test করুন

---

## Files যা আমি Update করেছি:

1. ✅ `backend/vercel.json` - CORS headers এবং proper routing যোগ করেছি
2. ✅ `backend/server.js` - CORS configuration ঠিক করেছি (domain path remove করেছি)
3. ✅ `frontend/.env.local` - Comment যোগ করেছি (আপনাকে backend URL দিতে হবে)

---

## Important Notes:

- **Backend URL পাওয়ার পর** `frontend/.env.local` আপডেট করতে ভুলবেন না
- **Environment variables change করার পর** redeploy করতে হয়
- **MongoDB Atlas Network Access** অবশ্যই configure করতে হবে
- **Local development** এর জন্য `http://localhost:5000` use করতে পারেন

---

## Quick Commands:

```bash
# Verification script চালান
./verify-deployment.sh

# Backend locally test করুন
cd backend
npm install
npm start

# Frontend locally test করুন
cd frontend
npm install
npm run dev
```

---

## Help:

বিস্তারিত guide এর জন্য দেখুন: **VERCEL_DEPLOYMENT_GUIDE.md**

যদি আরও সমস্যা হয় তাহলে:
1. Vercel logs চেক করুন
2. Browser console চেক করুন
3. MongoDB Atlas logs চেক করুন
