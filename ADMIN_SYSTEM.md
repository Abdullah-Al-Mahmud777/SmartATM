# Admin Dashboard System - Complete Implementation

## ✅ সম্পূর্ণ হয়েছে

### Backend Implementation:

#### 1. Admin Model (`backend/models/Admin.js`)
**Fields:**
- username (unique)
- email (unique)
- password (hashed with bcrypt)
- name
- role (Super Admin, Admin, Moderator)
- permissions (array)
- status (Active, Inactive, Suspended)
- lastLogin
- loginAttempts
- lockUntil (account lock after 5 failed attempts)

**Methods:**
- `comparePassword()` - Verify password
- `isLocked()` - Check if account is locked
- `incLoginAttempts()` - Increment failed login attempts
- `resetLoginAttempts()` - Reset on successful login

**Security Features:**
- Password hashing with bcrypt
- Account lock after 5 failed attempts (2 hours)
- Login attempt tracking
- Status management

#### 2. Admin Controller (`backend/controllers/adminController.js`)

**Methods:**

##### `login`
- **Route:** POST /api/admin/login
- **Auth:** Public
- **Function:** Admin authentication
- **Process:**
  1. Validates credentials
  2. Checks if account is locked
  3. Checks if account is active
  4. Verifies password
  5. Increments login attempts on failure
  6. Resets attempts on success
  7. Generates JWT token
  8. Returns admin data

##### `getProfile`
- **Route:** GET /api/admin/profile
- **Auth:** Protected
- **Function:** Get admin profile information

##### `getDashboardStats`
- **Route:** GET /api/admin/dashboard/stats
- **Auth:** Protected
- **Function:** Get comprehensive dashboard statistics
- **Returns:**
  - User stats (total, active, blocked, today)
  - Transaction stats (total, completed, amounts, today)
  - Emergency stats (total, pending, critical, today)
  - Recent transactions (last 10)

##### `getAllUsers`
- **Route:** GET /api/admin/users
- **Auth:** Protected (requires 'view_users' permission)
- **Function:** Get all users with pagination and filters
- **Query Params:** page, limit, status, search

##### `getAllTransactions`
- **Route:** GET /api/admin/transactions
- **Auth:** Protected (requires 'view_transactions' permission)
- **Function:** Get all transactions with pagination and filters
- **Query Params:** page, limit, type, status

##### `getAllEmergencies`
- **Route:** GET /api/admin/emergencies
- **Auth:** Protected (requires 'view_emergencies' permission)
- **Function:** Get all emergency requests with pagination and filters
- **Query Params:** page, limit, type, status, priority

##### `toggleUserStatus`
- **Route:** PUT /api/admin/users/:userId/status
- **Auth:** Protected (requires 'manage_users' permission)
- **Function:** Freeze or unfreeze user accounts
- **Body:** { action: 'freeze' | 'unfreeze' }

##### `createAdmin`
- **Route:** POST /api/admin/create
- **Auth:** Protected (Super Admin only)
- **Function:** Create new admin accounts

#### 3. Admin Middleware (`backend/middleware/adminMiddleware.js`)

**Functions:**

##### `verifyAdminToken`
- Verifies JWT token
- Checks if admin exists and is active
- Attaches adminId and admin object to request

##### `isSuperAdmin`
- Checks if admin has Super Admin role
- Used for sensitive operations

##### `checkPermission(permission)`
- Checks if admin has specific permission
- Super Admin bypasses all permission checks
- Returns 403 if permission denied

#### 4. Admin Routes (`backend/routes/admin.js`)

**Public Routes:**
```
POST   /api/admin/login
```

**Protected Routes:**
```
GET    /api/admin/profile
GET    /api/admin/dashboard/stats
GET    /api/admin/users
PUT    /api/admin/users/:userId/status
GET    /api/admin/transactions
GET    /api/admin/emergencies
POST   /api/admin/create (Super Admin only)
```

#### 5. Default Admin Creation Script

**File:** `backend/scripts/createDefaultAdmin.js`

**Run Command:**
```bash
cd backend
npm run create-admin
```

**Default Credentials:**
```
Username: admin
Password: admin123
Role: Super Admin
Email: admin@smartatm.com
```

**Permissions:**
- view_users
- manage_users
- view_transactions
- manage_transactions
- view_emergencies
- manage_emergencies
- view_reports
- manage_admins

### Frontend Implementation:

#### Admin Login Page (`frontend/app/admin/login/page.jsx`)

**Features:**
- Username and password fields
- Backend API integration
- Token storage in localStorage
- Error handling
- Loading states
- Auto-redirect if already logged in
- Shows default credentials for testing

**Process:**
1. User enters credentials
2. Submits to backend
3. Backend validates and returns token
4. Token saved in localStorage
5. Admin data saved in localStorage
6. Redirects to dashboard

## 🔒 Security Features:

1. **Password Hashing** - bcrypt with salt rounds
2. **JWT Authentication** - 24-hour token expiry
3. **Account Locking** - After 5 failed attempts for 2 hours
4. **Role-Based Access** - Super Admin, Admin, Moderator
5. **Permission System** - Granular permission control
6. **Status Management** - Active, Inactive, Suspended
7. **Login Attempt Tracking** - Monitor failed logins
8. **Token Verification** - Every request validated

## 📊 Permission System:

### Available Permissions:
- `view_users` - View user list
- `manage_users` - Freeze/unfreeze accounts
- `view_transactions` - View transaction list
- `manage_transactions` - Manage transactions
- `view_emergencies` - View emergency requests
- `manage_emergencies` - Handle emergencies
- `view_reports` - View reports
- `manage_admins` - Create/manage admins

### Role Hierarchy:
1. **Super Admin** - All permissions, can create admins
2. **Admin** - Most permissions, cannot create admins
3. **Moderator** - Limited permissions

## 🎯 User Flow:

### Admin Login Flow:
```
Admin goes to /admin/login
  ↓
Enters username and password
  ↓
Submits form
  ↓
Backend validates credentials
  ↓
Checks account status and lock
  ↓
Verifies password
  ↓
Generates JWT token
  ↓
Returns token and admin data
  ↓
Frontend saves to localStorage
  ↓
Redirects to /admin/dashboard
```

### Dashboard Access Flow:
```
Admin tries to access dashboard
  ↓
Frontend checks localStorage for token
  ↓
Token exists? → Sends with API requests
Token missing? → Redirects to login
  ↓
Backend verifies token
  ↓
Valid? → Returns data
Invalid? → Returns 401 error
  ↓
Frontend handles response
```

## 📝 API Usage Examples:

### 1. Admin Login:
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "...",
    "username": "admin",
    "email": "admin@smartatm.com",
    "name": "System Administrator",
    "role": "Super Admin",
    "permissions": [...]
  }
}
```

### 2. Get Dashboard Stats:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/admin/dashboard/stats
```

### 3. Get All Users:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/admin/users?page=1&limit=20"
```

### 4. Freeze User Account:
```bash
curl -X PUT http://localhost:5000/api/admin/users/USER_ID/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "freeze"}'
```

## 🚀 Setup Instructions:

### 1. Create Default Admin:
```bash
cd backend
npm run create-admin
```

### 2. Start Backend:
```bash
cd backend
node server.js
```

### 3. Start Frontend:
```bash
cd frontend
npm run dev
```

### 4. Login:
- Go to: http://localhost:3000/admin/login
- Username: admin
- Password: admin123

### 5. Change Password (Recommended):
After first login, change the default password for security.

## 🧪 Testing:

### Test Case 1: Admin Login
1. Go to /admin/login
2. Enter: admin / admin123
3. Click Login
4. **Expected:** Redirects to /admin/dashboard

### Test Case 2: Wrong Password
1. Go to /admin/login
2. Enter wrong password
3. **Expected:** Error message shown

### Test Case 3: Account Lock
1. Enter wrong password 5 times
2. **Expected:** Account locked for 2 hours

### Test Case 4: Dashboard Access Without Login
1. Clear localStorage
2. Try to access /admin/dashboard
3. **Expected:** Redirects to /admin/login

### Test Case 5: Token Expiry
1. Login successfully
2. Wait 24 hours (or manually expire token)
3. Try to access dashboard
4. **Expected:** Token expired error, redirect to login

## 📦 Database Schema:

### Admin Collection:
```javascript
{
  username: "admin",
  email: "admin@smartatm.com",
  password: "$2b$10$...", // hashed
  name: "System Administrator",
  role: "Super Admin",
  permissions: [
    "view_users",
    "manage_users",
    "view_transactions",
    ...
  ],
  status: "Active",
  lastLogin: Date,
  loginAttempts: 0,
  lockUntil: null,
  createdAt: Date,
  updatedAt: Date
}
```

## ✨ Benefits:

1. ✅ **Secure Authentication** - Password hashing, JWT tokens
2. ✅ **Account Protection** - Auto-lock after failed attempts
3. ✅ **Role-Based Access** - Different permission levels
4. ✅ **Permission System** - Granular control
5. ✅ **Dashboard Statistics** - Comprehensive overview
6. ✅ **User Management** - View and manage users
7. ✅ **Transaction Monitoring** - View all transactions
8. ✅ **Emergency Handling** - Monitor emergency requests
9. ✅ **Easy Setup** - Default admin creation script
10. ✅ **Frontend Integration** - Complete login system

## 🎉 সম্পূর্ণ!

Admin system সম্পূর্ণভাবে implement করা হয়েছে:
- ✅ Backend: Model, Controller, Middleware, Routes
- ✅ Frontend: Login page with backend integration
- ✅ Security: Password hashing, JWT, account locking
- ✅ Permissions: Role-based access control
- ✅ Dashboard: Statistics and management features
- ✅ Default Admin: Easy setup with script

**Next Steps:**
1. Run `npm run create-admin` to create default admin
2. Start backend server
3. Login at /admin/login
4. Access dashboard features
5. Change default password for security
