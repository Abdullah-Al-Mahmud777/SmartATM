# Vercel Deployment Guide

## 📦 Prerequisites

1. Vercel account (https://vercel.com)
2. Vercel CLI installed globally
3. MongoDB Atlas database

## 🚀 Deployment Steps

### Method 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Navigate to backend folder:**
```bash
cd backend
```

4. **Deploy to Vercel:**
```bash
vercel
```

5. **Follow the prompts:**
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N`
   - Project name? `smartatm-backend` (or your choice)
   - Directory? `./` (current directory)
   - Override settings? `N`

6. **Set Environment Variables:**
```bash
vercel env add MONGO_URI
# Paste your MongoDB connection string

vercel env add JWT_SECRET
# Enter your JWT secret key

vercel env add NODE_ENV
# Enter: production
```

7. **Deploy to Production:**
```bash
vercel --prod
```

### Method 2: Using Vercel Dashboard

1. **Go to Vercel Dashboard:**
   - Visit https://vercel.com/dashboard
   - Click "Add New" → "Project"

2. **Import Git Repository:**
   - Connect your GitHub/GitLab/Bitbucket
   - Select your repository
   - Select `backend` as root directory

3. **Configure Project:**
   - Framework Preset: `Other`
   - Root Directory: `backend`
   - Build Command: (leave empty)
   - Output Directory: (leave empty)

4. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add:
     - `MONGO_URI` = your MongoDB connection string
     - `JWT_SECRET` = your secret key
     - `NODE_ENV` = production

5. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete

## 🔧 Environment Variables

Add these in Vercel Dashboard or CLI:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=production
```

## 📝 After Deployment

1. **Get your deployment URL:**
   - Example: `https://smartatm-backend.vercel.app`

2. **Test API:**
```bash
curl https://your-deployment-url.vercel.app/health
```

3. **Update Frontend:**
   - Update API URL in frontend code
   - Change from `http://localhost:5000` to your Vercel URL

## 🔄 Update Deployment

```bash
# Make changes to code
git add .
git commit -m "Update backend"
git push

# Or redeploy manually
vercel --prod
```

## 🐛 Troubleshooting

### Issue: MongoDB Connection Timeout
**Solution:** Make sure MongoDB Atlas allows connections from anywhere (0.0.0.0/0) in Network Access

### Issue: CORS Error
**Solution:** Update CORS origin in server.js to include your frontend URL

### Issue: Environment Variables Not Working
**Solution:** 
- Check if variables are set in Vercel Dashboard
- Redeploy after adding variables

### Issue: 404 on API Routes
**Solution:** Check vercel.json routes configuration

## 📱 Update Frontend API URL

After deployment, update frontend files:

**frontend/app/atm/login/page.tsx:**
```typescript
const response = await fetch('https://your-vercel-url.vercel.app/api/auth/login', {
  // ...
});
```

**frontend/app/atm/register/page.tsx:**
```typescript
const response = await fetch('https://your-vercel-url.vercel.app/api/auth/register', {
  // ...
});
```

## 🔐 Security Checklist

- ✅ Environment variables set in Vercel
- ✅ MongoDB Atlas IP whitelist configured
- ✅ Strong JWT secret key
- ✅ CORS configured for production domain
- ✅ .env file in .gitignore

## 📊 Monitoring

- View logs: `vercel logs`
- View deployments: `vercel ls`
- View project: https://vercel.com/dashboard

## 🎯 Production URL Structure

```
https://your-project.vercel.app/
https://your-project.vercel.app/api/auth/login
https://your-project.vercel.app/api/auth/register
https://your-project.vercel.app/api/transactions/withdraw
```

## 💡 Tips

1. Use Vercel CLI for faster deployments
2. Set up automatic deployments from Git
3. Use environment variables for all secrets
4. Monitor logs regularly
5. Test all endpoints after deployment

## 🔗 Useful Links

- Vercel Docs: https://vercel.com/docs
- Vercel CLI: https://vercel.com/docs/cli
- Node.js on Vercel: https://vercel.com/docs/runtimes#official-runtimes/node-js
