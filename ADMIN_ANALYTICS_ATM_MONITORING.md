# Admin Analytics & ATM Monitoring Features

## ✅ সম্পূর্ণ হয়েছে (Completed)

Complete backend and frontend implementation for Admin Analytics and ATM Monitoring systems.

---

## 📊 Admin Analytics Feature

### Backend Implementation

#### 1. Analytics Model (`backend/models/Analytics.js`)

**Purpose:** Store aggregated analytics data for different time periods

**Fields:**
- `date` - Date of analytics record
- `type` - Type: daily, hourly, weekly, monthly
- `transactions` - Transaction statistics (total, withdrawals, deposits, transfers, completed, failed)
- `amounts` - Amount statistics (totalAmount, withdrawalAmount, depositAmount, transferAmount, averageAmount)
- `users` - User statistics (totalActive, newRegistrations, uniqueUsers)
- `atms` - ATM statistics (totalOnline, totalOffline, totalMaintenance, lowCashAlerts)
- `hourlyData` - Peak hours data array
- `topUsers` - Top users array with transaction counts
- `errors` - Error statistics by severity

#### 2. Admin Analytics Controller (`backend/controllers/adminAnalyticsController.js`)

**Methods:**

##### `getAnalytics`
- **Route:** GET `/api/admin/analytics?timeRange=7days`
- **Auth:** Admin Token Required
- **Query Params:** 
  - `timeRange`: 24hours, 7days, 30days, 90days
- **Returns:**
  - Transaction trends (withdrawals, deposits, transfers by day/hour)
  - Peak hours data
  - Top 5 active users
  - Recent error logs from ATMs
  - Overall statistics

##### `getTransactionStats`
- **Route:** GET `/api/admin/analytics/transactions`
- **Auth:** Admin Token Required
- **Query Params:** startDate, endDate
- **Returns:** Transaction statistics grouped by type

##### `getUserGrowth`
- **Route:** GET `/api/admin/analytics/user-growth?timeRange=30days`
- **Auth:** Admin Token Required
- **Returns:** User registration growth over time

#### 3. Routes (`backend/routes/adminAnalytics.js`)
```
GET  /api/admin/analytics              - Get analytics data
GET  /api/admin/analytics/transactions - Get transaction stats
GET  /api/admin/analytics/user-growth  - Get user growth
```

### Frontend Implementation

#### Admin Analytics Page (`frontend/app/admin/analytics/page.jsx`)

**Features:**
- ✅ Time range selector (24 hours, 7 days, 30 days, 90 days)
- ✅ Statistics summary cards (total, completed, failed transactions, total amount)
- ✅ Transaction trends chart (withdrawals, deposits, transfers)
- ✅ Peak hours visualization
- ✅ Top 5 active users list
- ✅ System alerts & error logs
- ✅ Real-time data from backend
- ✅ Loading states
- ✅ Auto-redirect if not logged in

**API Integration:**
```javascript
GET http://localhost:5000/api/admin/analytics?timeRange=7days
Headers: { Authorization: Bearer <adminToken> }
```

---

## 🏧 ATM Monitoring Feature

### Backend Implementation

#### 1. ATM Model (`backend/models/ATM.js`)

**Purpose:** Store ATM machine information and status

**Fields:**
- `atmId` - Unique ATM identifier (e.g., ATM-001)
- `location` - Location name
- `address` - Full address
- `coordinates` - Latitude and longitude
- `status` - Online, Offline, Maintenance, Low Cash
- `cashAvailable` - Current cash amount
- `cashCapacity` - Maximum cash capacity (default: 1,000,000)
- `lastRefillDate` - Last cash refill date
- `lastServiceDate` - Last service date
- `nextServiceDate` - Next scheduled service
- `todayTransactions` - Today's transaction count
- `totalTransactions` - Total transaction count
- `lastOnlineTime` - Last time ATM was online
- `errors` - Array of error logs with type, message, severity, timestamp, resolved status
- `maintenanceHistory` - Array of maintenance records

**Virtual Fields:**
- `capacityPercentage` - Calculated cash capacity percentage
- `isLowCash` - Boolean if capacity < 20%

#### 2. ATM Monitoring Controller (`backend/controllers/atmMonitoringController.js`)

**Methods:**

##### `getAllATMs`
- **Route:** GET `/api/admin/atm-monitoring`
- **Auth:** Admin Token Required
- **Returns:** 
  - List of all ATMs with formatted data
  - Summary statistics (total, online, offline, maintenance, lowCash)

##### `getATMDetails`
- **Route:** GET `/api/admin/atm-monitoring/:atmId`
- **Auth:** Admin Token Required
- **Returns:** Detailed ATM information and recent transactions

##### `refillCash`
- **Route:** POST `/api/admin/atm-monitoring/:atmId/refill`
- **Auth:** Admin Token Required
- **Body:** `{ amount: number }`
- **Function:** Add cash to ATM, update status if needed

##### `updateATMStatus`
- **Route:** PUT `/api/admin/atm-monitoring/:atmId/status`
- **Auth:** Admin Token Required
- **Body:** `{ status: string }`
- **Function:** Update ATM status manually

##### `createServiceRequest`
- **Route:** POST `/api/admin/atm-monitoring/:atmId/service`
- **Auth:** Admin Token Required
- **Body:** `{ type, notes, technician }`
- **Function:** Create service request, add to maintenance history

##### `addErrorLog`
- **Route:** POST `/api/admin/atm-monitoring/:atmId/error`
- **Auth:** Admin Token Required
- **Body:** `{ type, message, severity }`
- **Function:** Add error log to ATM

##### `resolveError`
- **Route:** PUT `/api/admin/atm-monitoring/:atmId/error/:errorId/resolve`
- **Auth:** Admin Token Required
- **Function:** Mark error as resolved

##### `seedATMs`
- **Route:** POST `/api/admin/atm-monitoring/seed/sample-data`
- **Auth:** Admin Token Required
- **Function:** Create 8 sample ATMs for testing

#### 3. Routes (`backend/routes/atmMonitoring.js`)
```
GET   /api/admin/atm-monitoring                        - Get all ATMs
GET   /api/admin/atm-monitoring/:atmId                 - Get ATM details
POST  /api/admin/atm-monitoring/:atmId/refill          - Refill cash
PUT   /api/admin/atm-monitoring/:atmId/status          - Update status
POST  /api/admin/atm-monitoring/:atmId/service         - Create service request
POST  /api/admin/atm-monitoring/:atmId/error           - Add error log
PUT   /api/admin/atm-monitoring/:atmId/error/:errorId/resolve - Resolve error
POST  /api/admin/atm-monitoring/seed/sample-data       - Seed sample ATMs
```

### Frontend Implementation

#### ATM Monitoring Page (`frontend/app/admin/atm-monitoring/page.jsx`)

**Features:**
- ✅ Summary statistics cards (total, online, offline, maintenance, low cash)
- ✅ ATM grid view with status badges
- ✅ Cash capacity visualization with color coding
- ✅ Today's transaction count per ATM
- ✅ Unresolved error count display
- ✅ Refill cash functionality (with prompt)
- ✅ Create service request (with prompt)
- ✅ Real-time data from backend
- ✅ Loading states
- ✅ Seed sample data button (if no ATMs exist)
- ✅ Interactive map placeholder
- ✅ Auto-redirect if not logged in

**API Integration:**
```javascript
// Get all ATMs
GET http://localhost:5000/api/admin/atm-monitoring
Headers: { Authorization: Bearer <adminToken> }

// Refill cash
POST http://localhost:5000/api/admin/atm-monitoring/ATM-001/refill
Headers: { Authorization: Bearer <adminToken> }
Body: { amount: 500000 }

// Create service request
POST http://localhost:5000/api/admin/atm-monitoring/ATM-001/service
Headers: { Authorization: Bearer <adminToken> }
Body: { type: "General Service", notes: "Routine maintenance", technician: "Admin" }
```

---

## 🚀 Setup & Usage

### 1. Start Backend Server
```bash
cd backend
node server.js
```

### 2. Start Frontend Server
```bash
cd frontend
npm run dev
```

### 3. Login as Admin
```
URL: http://localhost:3000/admin/login
Username: admin
Password: admin123
```

### 4. Access Features
- **Analytics:** http://localhost:3000/admin/analytics
- **ATM Monitoring:** http://localhost:3000/admin/atm-monitoring

### 5. Seed Sample ATM Data (First Time)
- Go to ATM Monitoring page
- Click "Seed Sample ATM Data" button
- 8 sample ATMs will be created

---

## 📋 Sample ATM Data

When seeded, the following ATMs are created:

1. **ATM-001** - Dhaka - Gulshan (Online, ৳550,000)
2. **ATM-002** - Dhaka - Banani (Online, ৳320,000)
3. **ATM-003** - Chittagong - Agrabad (Offline, ৳150,000)
4. **ATM-004** - Dhaka - Dhanmondi (Online, ৳680,000)
5. **ATM-005** - Sylhet - Zindabazar (Maintenance, ৳240,000)
6. **ATM-006** - Dhaka - Mirpur (Online, ৳490,000)
7. **ATM-007** - Rajshahi - Shaheb Bazar (Online, ৳375,000)
8. **ATM-008** - Dhaka - Uttara (Low Cash, ৳80,000)

---

## 🎯 Key Features

### Analytics Dashboard:
- ✅ Real-time transaction trends
- ✅ Peak hour analysis
- ✅ Top user identification
- ✅ Error log monitoring
- ✅ Multiple time range views
- ✅ Comprehensive statistics

### ATM Monitoring:
- ✅ Real-time ATM status tracking
- ✅ Cash level monitoring with alerts
- ✅ Service request management
- ✅ Error tracking per ATM
- ✅ Transaction count monitoring
- ✅ Quick refill and service actions
- ✅ Visual capacity indicators

---

## 🔒 Security

- All routes require admin authentication
- JWT token verification on every request
- Admin token stored in localStorage
- Auto-redirect to login if token missing
- Protected API endpoints

---

## 📊 Data Flow

### Analytics:
```
Frontend → GET /api/admin/analytics?timeRange=7days
         ← { success, analytics: { transactionTrends, peakHours, topUsers, errorLogs, statistics } }
```

### ATM Monitoring:
```
Frontend → GET /api/admin/atm-monitoring
         ← { success, atms: [...], summary: {...} }

Frontend → POST /api/admin/atm-monitoring/ATM-001/refill
         ← { success, message, atm: {...} }
```

---

## ✨ Benefits

1. **Real-time Monitoring** - Live ATM status and analytics
2. **Proactive Management** - Low cash alerts, error tracking
3. **Data-Driven Decisions** - Transaction trends, peak hours
4. **Quick Actions** - Instant refill and service requests
5. **User Insights** - Top users, transaction patterns
6. **Error Management** - Track and resolve ATM errors
7. **Service Scheduling** - Maintenance history tracking

---

## 🎉 সম্পূর্ণ! (Complete!)

✅ Backend Models: Analytics, ATM
✅ Backend Controllers: adminAnalyticsController, atmMonitoringController
✅ Backend Routes: adminAnalytics, atmMonitoring
✅ Frontend Pages: Analytics, ATM Monitoring
✅ API Integration: Complete
✅ Authentication: Admin token required
✅ Sample Data: Seed functionality
✅ Real-time Updates: Fetch on load and after actions

**All features are working and connected!**
