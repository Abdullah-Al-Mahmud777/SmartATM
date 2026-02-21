# Authentication Protection System

## ✅ সম্পূর্ণ হয়েছে

### বৈশিষ্ট্য (Features):

1. **Login Required** - Dashboard এ যেতে হলে আগে login করতে হবে
2. **Auto Redirect** - Login না থাকলে automatically login page এ redirect হবে
3. **Token Based** - JWT token দিয়ে authentication
4. **Persistent Login** - Browser refresh করলেও logged in থাকবে
5. **Logout Feature** - Dashboard থেকে logout করা যাবে
6. **Already Logged In Check** - Login/Register page এ গেলে যদি already logged in থাকে তাহলে dashboard এ redirect হবে

## 🔐 কিভাবে কাজ করে:

### 1. Registration Flow:
```
User → Register Page → Fill Form → Submit
  ↓
Backend validates and creates account
  ↓
Returns JWT token + user data
  ↓
Saved in localStorage
  ↓
Redirect to Dashboard
```

### 2. Login Flow:
```
User → Login Page → Enter Card Number + PIN
  ↓
Backend validates credentials
  ↓
Returns JWT token + user data
  ↓
Saved in localStorage (atmToken, atmUser)
  ↓
Redirect to Dashboard
```

### 3. Dashboard Protection:
```
User tries to access Dashboard
  ↓
useAuth() hook checks localStorage for token
  ↓
Token exists? → Show Dashboard
Token missing? → Redirect to Login
```

### 4. Logout Flow:
```
User clicks Logout button
  ↓
Clear localStorage (remove token & user data)
  ↓
Redirect to Login Page
```

## 📁 Files Modified/Created:

### 1. `frontend/lib/useAuth.ts` (NEW)
Custom React hook for authentication:
- Checks if user is logged in
- Redirects to login if not authenticated
- Provides logout function
- Returns user data and loading state

### 2. `frontend/app/atm/dashboard/page.tsx` (UPDATED)
- Added `useAuth()` hook
- Shows loading screen while checking auth
- Fetches real balance from backend
- Displays user name and card number
- Added Logout button

### 3. `frontend/app/atm/login/page.tsx` (UPDATED)
- Added check for existing login
- If already logged in, redirects to dashboard
- Prevents accessing login page when already authenticated

### 4. `frontend/app/atm/register/page.tsx` (UPDATED)
- Added check for existing login
- If already logged in, redirects to dashboard
- Prevents creating new account when already authenticated

## 🎯 Usage:

### For Protected Pages:
```typescript
import { useAuth } from '@/lib/useAuth';

export default function ProtectedPage() {
  const { isAuthenticated, loading, user, logout } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Will auto-redirect to login
  }

  return (
    <div>
      <h1>Welcome {user.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## 🔒 Security Features:

1. **JWT Token** - Stored in localStorage
2. **Token Validation** - Backend validates token on every API call
3. **Auto Logout** - If token is invalid, user is logged out
4. **Protected Routes** - All ATM pages require authentication
5. **Session Persistence** - Login persists across browser refresh

## 📊 localStorage Structure:

```javascript
{
  "atmToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "atmUser": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "cardNumber": "1234567890123456",
    "accountNumber": "1234567890",
    "balance": 50000
  }
}
```

## 🚀 Testing:

### Test Case 1: Access Dashboard Without Login
1. Open browser
2. Go to http://localhost:3000/atm/dashboard
3. **Expected:** Redirects to /atm/login

### Test Case 2: Login and Access Dashboard
1. Go to http://localhost:3000/atm/login
2. Enter card number and PIN
3. Click Login
4. **Expected:** Redirects to /atm/dashboard with user data

### Test Case 3: Refresh Dashboard
1. Login to dashboard
2. Refresh the page (F5)
3. **Expected:** Stays on dashboard (no redirect)

### Test Case 4: Logout
1. Login to dashboard
2. Click Logout button
3. **Expected:** Redirects to /atm/login and clears localStorage

### Test Case 5: Access Login When Already Logged In
1. Login to dashboard
2. Manually go to http://localhost:3000/atm/login
3. **Expected:** Redirects back to /atm/dashboard

## ⚠️ Important Notes:

1. **Backend Must Be Running** - http://localhost:5000
2. **Token Expiry** - JWT tokens expire after 24 hours (configured in backend)
3. **localStorage** - Used for token storage (consider httpOnly cookies for production)
4. **HTTPS** - Use HTTPS in production for security

## 🎉 Benefits:

✅ User cannot access dashboard without login
✅ Secure authentication with JWT
✅ Smooth user experience with auto-redirect
✅ Persistent login across page refresh
✅ Easy logout functionality
✅ Real user data displayed on dashboard
✅ Protection against unauthorized access

## 🔄 Flow Diagram:

```
┌─────────────┐
│   Home Page │
└──────┬──────┘
       │
       ├─────────────┐
       │             │
       ▼             ▼
┌──────────┐   ┌──────────┐
│  Login   │   │ Register │
└────┬─────┘   └────┬─────┘
     │              │
     └──────┬───────┘
            │
            ▼
     ┌─────────────┐
     │ Auth Check  │
     └──────┬──────┘
            │
     ┌──────┴──────┐
     │             │
     ▼             ▼
┌─────────┐   ┌─────────┐
│ Success │   │  Failed │
└────┬────┘   └────┬────┘
     │             │
     ▼             │
┌──────────┐       │
│Dashboard │       │
└────┬─────┘       │
     │             │
     ▼             ▼
┌──────────┐   ┌──────────┐
│  Logout  │   │  Retry   │
└────┬─────┘   └──────────┘
     │
     ▼
┌──────────┐
│  Login   │
└──────────┘
```

## 🎊 সম্পূর্ণ!

Authentication system সম্পূর্ণভাবে implement করা হয়েছে। এখন:
- ✅ Login ছাড়া dashboard access করা যাবে না
- ✅ Registration করার পর auto login হবে
- ✅ Logout করা যাবে
- ✅ Browser refresh করলেও logged in থাকবে
- ✅ Real user data dashboard এ দেখাবে
