# 🏦 SmartATM - Complete Banking System

A full-stack ATM and banking management system with admin dashboard, user portal, and real-time notifications.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [User Guide](#user-guide)
- [Admin Guide](#admin-guide)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### User Features
- 🔐 Secure Login & Registration with PIN
- 💰 Check Balance
- 💸 Withdraw Money
- 💳 Deposit Money
- 🔄 Transfer Money to Other Users
- 📊 Transaction History
- 📱 Currency Converter
- 🔔 Real-time Notifications
- 📄 Receipt Generation
- 🚨 Emergency Services (Card Block, Fraud Report)
- 🔒 Change PIN
- 📈 Analytics Dashboard
- 💬 AI Chatbot Support

### Admin Features
- 👨‍💼 Admin Dashboard with Statistics
- 👥 User Management (View, Freeze, Unfreeze, Block)
- 💳 Transaction Monitoring
- 🔔 Send Notifications to Users
- 🚨 Emergency Request Management
- 📊 Analytics & Reports
- 🏧 ATM Monitoring
- ⚙️ System Settings

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (React)
- **Language:** TypeScript/JavaScript
- **Styling:** Tailwind CSS
- **State Management:** React Hooks
- **HTTP Client:** Fetch API

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt
- **Environment:** dotenv

### Deployment
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

## 📁 Project Structure

```
SmartATM/
├── backend/
│   ├── api/
│   │   └── index.js              # Vercel serverless entry
│   ├── config/
│   │   └── database.js           # MongoDB connection
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── transactionController.js
│   │   ├── transferController.js
│   │   ├── notificationController.js
│   │   └── ...
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── adminMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Admin.js
│   │   ├── Transaction.js
│   │   ├── Transfer.js
│   │   ├── Notification.js
│   │   └── ...
│   ├── routes/
│   │   ├── auth.js
│   │   ├── admin.js
│   │   ├── transactions.js
│   │   ├── transfer.js
│   │   ├── notifications.js
│   │   └── ...
│   ├── scripts/
│   │   ├── createDefaultAdmin.js
│   │   └── ...
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── server.js              # Main server file
│   └── vercel.json            # Vercel config
│
├── frontend/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── users/
│   │   │   ├── transactions/
│   │   │   ├── notifications/
│   │   │   ├── security/
│   │   │   └── ...
│   │   ├── atm/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── dashboard/
│   │   │   ├── transfer/
│   │   │   ├── notifications/
│   │   │   └── ...
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── AdminSidebar.jsx
│   │   └── CardStat.tsx
│   ├── lib/
│   │   ├── useAuth.ts
│   │   └── adminAuth.js
│   ├── .env.local
│   ├── .gitignore
│   ├── next.config.js
│   ├── package.json
│   └── tailwind.config.js
│
└── README.md
```

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account
- Git

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/SmartATM.git
cd SmartATM
```

### Step 2: Backend Setup
```bash
cd backend
npm install
```

### Step 3: Frontend Setup
```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### Backend Configuration

Create `.env` file in `backend/` directory:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/smart_atm_db?retryWrites=true&w=majority

# JWT Secret (Change this!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Port
PORT=10000

# Environment
NODE_ENV=development
```

### Frontend Configuration

Create `.env.local` file in `frontend/` directory:

```env
# Backend API URL
# For local development
NEXT_PUBLIC_API_URL=http://localhost:10000

# For production (Render)
# NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

### MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (Free tier available)
3. Create a database user
4. Whitelist IP: `0.0.0.0/0` (Allow from anywhere)
5. Get connection string
6. Replace in `.env` file

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# or
node server.js
```

Backend will run on: `http://localhost:10000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Frontend will run on: `http://localhost:3000`

### Create Default Admin

```bash
cd backend
node scripts/createDefaultAdmin.js
```

Default Admin Credentials:
- Username: `admin`
- Password: `admin123`
- Role: Super Admin

**⚠️ Important:** Change password after first login!

### Access the Application

- **User Portal:** http://localhost:3000/atm/login
- **Admin Portal:** http://localhost:3000/admin/login
- **API Docs:** http://localhost:10000

## 🌐 Deployment

### Backend Deployment (Render)

1. **Create Render Account**
   - Go to [Render](https://render.com)
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Select `backend` folder

3. **Configure Service**
   ```
   Name: smartatm-backend
   Environment: Node
   Build Command: npm install
   Start Command: node server.js
   ```

4. **Add Environment Variables**
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your secret key
   - `PORT`: 10000
   - `NODE_ENV`: production

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (2-3 minutes)
   - Copy the URL: `https://your-app.onrender.com`

### Frontend Deployment (Vercel)

1. **Create Vercel Account**
   - Go to [Vercel](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Import GitHub repository
   - Select `frontend` folder

3. **Configure Project**
   ```
   Framework Preset: Next.js
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: .next
   ```

4. **Add Environment Variables**
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment (instant)
   - Your app is live!

### Update Environment Variables

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

Push changes and Vercel will auto-deploy.

## 📚 API Documentation

### Authentication Endpoints

#### User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "accountNumber": "1234567890",
  "pin": "1234"
}

Response:
{
  "success": true,
  "token": "jwt-token",
  "user": { ... }
}
```

#### User Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "01712345678",
  "pin": "1234"
}
```

### Transaction Endpoints

#### Get Balance
```http
GET /api/transactions/balance
Authorization: Bearer <token>

Response:
{
  "success": true,
  "balance": 5000
}
```

#### Withdraw Money
```http
POST /api/transactions/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1000
}
```

#### Deposit Money
```http
POST /api/transactions/deposit
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 2000
}
```

### Transfer Endpoints

#### Verify Account
```http
POST /api/transfer/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "accountNumber": "0987654321"
}

Response:
{
  "success": true,
  "account": {
    "name": "Jane Smith",
    "accountNumber": "0987654321",
    "status": "Active"
  }
}
```

#### Transfer Money
```http
POST /api/transfer
Authorization: Bearer <token>
Content-Type: application/json

{
  "toAccountNumber": "0987654321",
  "amount": 1000,
  "description": "Payment"
}
```

### Notification Endpoints

#### Get User Notifications
```http
GET /api/notifications?limit=20
Authorization: Bearer <token>

Response:
{
  "success": true,
  "notifications": [...],
  "unreadCount": 5
}
```

#### Get Unread Count
```http
GET /api/notifications/unread-count
Authorization: Bearer <token>

Response:
{
  "success": true,
  "unreadCount": 5
}
```

### Admin Endpoints

#### Admin Login
```http
POST /api/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

#### Get All Users
```http
GET /api/admin/users?page=1&limit=20
Authorization: Bearer <admin-token>
```

#### Send Broadcast Notification
```http
POST /api/admin/notifications/broadcast
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "type": "System",
  "priority": "High",
  "title": "System Maintenance",
  "message": "System will be down for maintenance"
}
```

## 👤 User Guide

### Registration Process

1. Go to `/atm/register`
2. Fill in details:
   - Full Name
   - Email
   - Phone Number
   - Create 4-digit PIN
3. Click "Register"
4. You'll receive:
   - Account Number (10 digits)
   - Card Number (16 digits)
5. Save these credentials!

### Login Process

1. Go to `/atm/login`
2. Enter Account Number
3. Enter PIN
4. Click "Login"

### Transfer Money

1. Go to "Transfer Money"
2. Enter recipient's account number
3. Click "Verify" to see recipient name
4. Enter amount
5. Click "Transfer Money"
6. Confirm in modal
7. Done! Both users get transaction records

### View Notifications

1. Look at navbar - bell icon 🔔
2. Red badge shows unread count
3. Click bell for dropdown
4. Click "View All Notifications" for full page
5. Click "Mark Read" to mark as read

## 👨‍💼 Admin Guide

### Admin Login

1. Go to `/admin/login`
2. Username: `admin`
3. Password: `admin123`
4. Click "Login"

### User Management

1. Go to "User Management"
2. View all registered users
3. Actions available:
   - Freeze/Unfreeze account
   - Block/Unblock card
   - Reset PIN
   - View details

### Send Notifications

1. Go to "Notifications"
2. Fill form:
   - Type: System, Security, etc.
   - Priority: Low, Medium, High, Critical
   - Target: All Users
   - Title & Message
3. Click "Send Notification"
4. All users will receive it instantly

### Monitor Transactions

1. Go to "Transactions"
2. View all transactions
3. Filter by:
   - Account number
   - Type
   - Status
4. View details in modal

### Emergency Management

1. Go to "Security & Emergency Center"
2. View all emergency requests
3. Filter by type and status
4. Click "Mark Resolved" to resolve

## 🔧 Troubleshooting

### Backend Issues

**Problem:** MongoDB connection failed
```bash
Solution:
1. Check MONGO_URI in .env
2. Verify MongoDB Atlas network access (0.0.0.0/0)
3. Check database user credentials
```

**Problem:** Port already in use
```bash
Solution:
# Find process using port 10000
lsof -i :10000

# Kill the process
kill -9 <PID>

# Or change PORT in .env
```

### Frontend Issues

**Problem:** API calls failing
```bash
Solution:
1. Check NEXT_PUBLIC_API_URL in .env.local
2. Verify backend is running
3. Check browser console for errors
4. Clear browser cache (Ctrl + Shift + Delete)
```

**Problem:** "Failed to fetch"
```bash
Solution:
1. Backend not running - start it
2. CORS issue - check backend CORS config
3. Wrong API URL - verify .env.local
```

### Notification Issues

**Problem:** Notifications not showing
```bash
Solution:
1. Restart frontend: npm run dev
2. Clear browser cache
3. Check token: localStorage.getItem('atmToken')
4. Check browser console for errors
5. Verify backend logs
```

### Deployment Issues

**Problem:** Render deployment failed
```bash
Solution:
1. Check build logs in Render dashboard
2. Verify environment variables
3. Check package.json scripts
4. Ensure MongoDB Atlas allows Render IPs
```

**Problem:** Vercel deployment failed
```bash
Solution:
1. Check build logs in Vercel dashboard
2. Verify NEXT_PUBLIC_API_URL
3. Check next.config.js
4. Clear Vercel cache and redeploy
```

## 🔐 Security Best Practices

1. **Change Default Credentials**
   - Change admin password after first login
   - Use strong passwords

2. **Environment Variables**
   - Never commit .env files
   - Use different secrets for production
   - Rotate JWT secrets periodically

3. **Database Security**
   - Use strong MongoDB passwords
   - Limit network access when possible
   - Enable MongoDB authentication

4. **API Security**
   - All sensitive endpoints require authentication
   - JWT tokens expire after 10 years (configurable)
   - Passwords hashed with bcrypt

## 📝 Development Notes

### Adding New Features

1. **Backend:**
   - Create model in `models/`
   - Create controller in `controllers/`
   - Create routes in `routes/`
   - Register route in `server.js`

2. **Frontend:**
   - Create page in `app/`
   - Create components in `components/`
   - Add navigation links

### Database Schema

**User Schema:**
- name, email, phone
- accountNumber (10 digits)
- cardNumber (16 digits)
- pin (hashed)
- balance
- status (Active, Frozen, Blocked)

**Transaction Schema:**
- transactionId
- userId
- type (Withdraw, Deposit, Transfer)
- amount
- balanceAfter
- status
- description

**Notification Schema:**
- notificationId
- userId (null for broadcast)
- adminId
- type, priority
- title, message
- isRead

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m "Add new feature"`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Your Name** - Initial work

## 🙏 Acknowledgments

- MongoDB Atlas for database hosting
- Render for backend hosting
- Vercel for frontend hosting
- Next.js team for the amazing framework

## 📞 Support

For support, email: support@smartatm.com

## 🎉 Version History

- **v1.0.0** (2024-02-27)
  - Initial release
  - User authentication & registration
  - Transaction management
  - Money transfer system
  - Admin dashboard
  - Notification system
  - Emergency services

---

Made with  by Abdullah-Al-Mahmud 
