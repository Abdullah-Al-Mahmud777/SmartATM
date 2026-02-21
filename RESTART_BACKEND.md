# Backend Server Restart Instructions

## New Features Added
- Receipt generation backend (controller, routes)
- All frontend pages connected to backend APIs

## How to Restart Backend Server

### Step 1: Stop the current server
If the backend server is running, press `Ctrl + C` in the terminal to stop it.

### Step 2: Start the server again
```bash
cd backend
node server.js
```

### Step 3: Verify the server is running
You should see:
```
🚀 Server running on http://localhost:5000
📝 Environment: development
🔗 API Documentation: http://localhost:5000
```

### Step 4: Test the new receipt endpoint
Open your browser and go to: http://localhost:5000

You should see the API documentation including the new receipt endpoints:
- `GET /api/receipt/recent (Protected)`
- `GET /api/receipt/:transactionId (Protected)`

## Troubleshooting

### If you get "Cannot find module" error:
```bash
cd backend
npm install
node server.js
```

### If MongoDB connection fails:
Check your `.env` file in the backend folder and ensure:
```
MONGODB_URI=mongodb+srv://shuvo:1234@cluster0.bfd2hb1.mongodb.net/smart_atm_db
JWT_SECRET=smartatm-secret-key-2024-change-in-production
PORT=5000
```

## All Connected Features

### Frontend Pages Connected to Backend:
1. ✅ Login - `POST /api/auth/login`
2. ✅ Register - `POST /api/auth/register`
3. ✅ Withdraw - `POST /api/transactions/withdraw`
4. ✅ Deposit - `POST /api/transactions/deposit`
5. ✅ Transfer - `POST /api/transactions/transfer`
6. ✅ Transaction History - `GET /api/transactions/history`
7. ✅ Currency Converter - `GET /api/currency/rates`, `POST /api/currency/convert`
8. ✅ Change PIN - `POST /api/auth/change-pin`
9. ✅ Analytics - `GET /api/analytics`, `GET /api/analytics/spending`
10. ✅ Block Card - `POST /api/card/block`, `GET /api/card/status`
11. ✅ Transaction Limits - `GET /api/limits`, `PUT /api/limits`
12. ✅ Receipt Generator - `GET /api/receipt/recent`

All features are now fully functional with real-time MongoDB data!
