# Vercel Deployment Guide - SmartATM

## সমস্যা সমাধান করার ধাপসমূহ

### ১. Backend Vercel-এ Deploy করুন

#### Step 1: Vercel-এ Backend Project তৈরি করুন

1. [Vercel Dashboard](https://vercel.com/dashboard) এ যান
2. "Add New" → "Project" ক্লিক করুন
3. আপনার GitHub repository select করুন
4. **Root Directory**: `backend` সিলেক্ট করুন
5. **Framework Preset**: Other রাখুন

#### Step 2: Environment Variables যোগ করুন

Vercel Dashboard-এ নিচের environment variables যোগ করুন:

```
MONGO_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/smartatm?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=production
PORT=5000
```

**গুরুত্বপূর্ণ**: 
- MongoDB Atlas-এ **Network Access** সেটিংসে যান
- "Allow Access from Anywhere" (0.0.0.0/0) যোগ করুন
- অথবা Vercel এর IP addresses whitelist করুন

#### Step 3: Deploy করুন

- "Deploy" বাটনে ক্লিক করুন
- Deployment সম্পন্ন হলে আপনার backend URL পাবেন
- উদাহরণ: `https://smartatm-backend.vercel.app`

#### Step 4: Backend Test করুন

Browser-এ যান:
```
https://your-backend-url.vercel.app/health
```

যদি এই response পান তাহলে backend সঠিকভাবে কাজ করছে:
```json
{
  "status": "OK",
  "timestamp": "2024-...",
  "uptime": 123.45
}
```

---

### ২. Frontend Configuration আপডেট করুন

#### Step 1: `.env.local` ফাইল আপডেট করুন

```bash
cd frontend
```

`.env.local` ফাইলে আপনার Vercel backend URL দিন:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
```

#### Step 2: Frontend Vercel-এ Deploy করুন

1. Vercel Dashboard-এ নতুন project তৈরি করুন
2. **Root Directory**: `frontend` সিলেক্ট করুন
3. **Framework Preset**: Next.js সিলেক্ট করুন
4. Environment Variables যোগ করুন:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
   ```
5. Deploy করুন

---

### ৩. CORS সমস্যা সমাধান

যদি এখনও "Unable to connect to server" error আসে:

#### Backend এ CORS চেক করুন

`backend/server.js` ফাইলে CORS configuration ঠিক আছে কিনা দেখুন:

```javascript
const corsOptions = {
  origin: ["https://smart-atm-three.vercel.app", "http://localhost:3000"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

#### Vercel Dashboard থেকে Redeploy করুন

1. Backend project-এ যান
2. "Deployments" tab-এ যান
3. Latest deployment-এ "..." ক্লিক করে "Redeploy" করুন

---

### ৪. MongoDB Atlas Configuration

#### Network Access চেক করুন:

1. MongoDB Atlas Dashboard-এ যান
2. "Network Access" → "IP Access List" এ যান
3. নিশ্চিত করুন যে `0.0.0.0/0` added আছে
4. অথবা Vercel এর IP ranges যোগ করুন

#### Database User চেক করুন:

1. "Database Access" এ যান
2. User এর password সঠিক আছে কিনা verify করুন
3. User এর "Built-in Role" হিসেবে "Atlas Admin" অথবা "Read and write to any database" আছে কিনা চেক করুন

---

### ৫. Testing

#### Backend API Test:

```bash
# Health check
curl https://your-backend-url.vercel.app/health

# API documentation
curl https://your-backend-url.vercel.app/

# Test login (example)
curl -X POST https://your-backend-url.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"cardNumber":"1234567890123456","pin":"1234"}'
```

#### Frontend Test:

1. Browser-এ frontend URL খুলুন
2. Developer Console (F12) খুলুন
3. Network tab দেখুন
4. Login করার চেষ্টা করুন
5. API requests দেখুন - কোন error আসছে কিনা

---

### ৬. Common Issues এবং Solutions

#### Issue 1: "Unable to connect to server"

**Solution:**
- Frontend `.env.local`-এ সঠিক backend URL আছে কিনা চেক করুন
- Backend Vercel-এ properly deployed আছে কিনা verify করুন
- CORS configuration সঠিক আছে কিনা দেখুন

#### Issue 2: "MongoNetworkError" বা "Connection timeout"

**Solution:**
- MongoDB Atlas Network Access-এ `0.0.0.0/0` যোগ করুন
- `MONGO_URI` environment variable সঠিক আছে কিনা চেক করুন
- MongoDB cluster running আছে কিনা verify করুন

#### Issue 3: "404 Not Found" on API routes

**Solution:**
- `backend/vercel.json` configuration চেক করুন
- Backend redeploy করুন
- Route paths সঠিক আছে কিনা verify করুন

#### Issue 4: Environment variables কাজ করছে না

**Solution:**
- Vercel Dashboard → Project Settings → Environment Variables চেক করুন
- সব variables properly set আছে কিনা verify করুন
- Redeploy করুন (environment variables change করার পর redeploy করতে হয়)

---

### ৭. Deployment Checklist

Backend:
- [ ] `backend/vercel.json` configured
- [ ] Environment variables set in Vercel
- [ ] MongoDB Atlas Network Access configured
- [ ] Backend deployed successfully
- [ ] `/health` endpoint working
- [ ] CORS configured with frontend domain

Frontend:
- [ ] `.env.local` updated with backend URL
- [ ] Environment variable set in Vercel
- [ ] Frontend deployed successfully
- [ ] Can access frontend URL
- [ ] API calls working from frontend

---

### ৮. Useful Commands

```bash
# Backend এ locally test করুন
cd backend
npm install
npm start

# Frontend এ locally test করুন
cd frontend
npm install
npm run dev

# Vercel CLI দিয়ে deploy করুন (optional)
npm i -g vercel
cd backend
vercel
cd ../frontend
vercel
```

---

### ৯. Support Links

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Express CORS Documentation](https://expressjs.com/en/resources/middleware/cors.html)

---

## আপনার Current Setup:

- **Frontend Domain**: `https://smart-atm-three.vercel.app`
- **Backend**: Vercel-এ deploy করতে হবে
- **Database**: MongoDB Atlas (already connected)

## Next Steps:

1. Backend Vercel-এ deploy করুন
2. Backend URL পাওয়ার পর `frontend/.env.local` আপডেট করুন
3. Frontend redeploy করুন
4. Test করুন

যদি কোন সমস্যা হয় তাহলে Vercel logs চেক করুন:
- Vercel Dashboard → Your Project → Deployments → Click on deployment → View Function Logs
