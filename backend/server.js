const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const currencyRoutes = require('./routes/currency');
const limitRoutes = require('./routes/limits');
const analyticsRoutes = require('./routes/analytics');
const cardRoutes = require('./routes/card');
const receiptRoutes = require('./routes/receipt');
const transferRoutes = require('./routes/transfer');
const emergencyRoutes = require('./routes/emergency');
const adminRoutes = require('./routes/admin');
const adminAnalyticsRoutes = require('./routes/adminAnalytics');
const atmMonitoringRoutes = require('./routes/atmMonitoring');
const adminDashboardRoutes = require('./routes/adminDashboard');
const adminUsersRoutes = require('./routes/adminUsers');
const adminTransactionsRoutes = require('./routes/adminTransactions');
const notificationsRoutes = require('./routes/notifications');
const settingsRoutes = require('./routes/settings');

const app = express();

// Connect to Database
connectDB();

// CORS Configuration - Allow all origins for testing
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger (Development only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
  });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/currency', currencyRoutes);
app.use('/api/limits', limitRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/card', cardRoutes);
app.use('/api/receipt', receiptRoutes);
app.use('/api/transfer', transferRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/analytics', adminAnalyticsRoutes);
app.use('/api/admin/atm-monitoring', atmMonitoringRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/admin/transactions', adminTransactionsRoutes);
app.use('/api/admin/notifications', notificationsRoutes);
app.use('/api/admin/settings', settingsRoutes);

// Root Route - API Documentation
app.get('/', (req, res) => {
  res.json({ 
    message: 'SmartATM Backend API', 
    version: '1.0.0',
    status: 'Running',
    endpoints: {
      authentication: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        profile: 'GET /api/auth/profile (Protected)',
        updateProfile: 'PUT /api/auth/profile (Protected)',
        changePin: 'POST /api/auth/change-pin (Protected)'
      },
      transactions: {
        withdraw: 'POST /api/transactions/withdraw (Protected)',
        deposit: 'POST /api/transactions/deposit (Protected)',
        transfer: 'POST /api/transactions/transfer (Protected)',
        history: 'GET /api/transactions/history (Protected)',
        balance: 'GET /api/transactions/balance (Protected)'
      },
      currency: {
        rates: 'GET /api/currency/rates',
        convert: 'POST /api/currency/convert (Protected)',
        currencies: 'GET /api/currency/currencies'
      },
      limits: {
        get: 'GET /api/limits (Protected)',
        update: 'PUT /api/limits (Protected)'
      },
      analytics: {
        overview: 'GET /api/analytics (Protected)',
        spending: 'GET /api/analytics/spending (Protected)'
      },
      card: {
        block: 'POST /api/card/block (Protected)',
        unblock: 'POST /api/card/unblock (Protected)',
        status: 'GET /api/card/status (Protected)',
        report: 'POST /api/card/report (Protected)'
      },
      receipt: {
        recent: 'GET /api/receipt/recent (Protected)',
        single: 'GET /api/receipt/:transactionId (Protected)',
        create: 'POST /api/receipt/create (Protected)',
        all: 'GET /api/receipt/all (Protected)',
        markPdf: 'PUT /api/receipt/:receiptId/pdf (Protected)'
      },
      transfer: {
        send: 'POST /api/transfer (Protected)',
        verify: 'POST /api/transfer/verify (Protected)',
        history: 'GET /api/transfer/history (Protected)',
        stats: 'GET /api/transfer/stats (Protected)',
        details: 'GET /api/transfer/:transferId (Protected)'
      },
      emergency: {
        cardBlock: 'POST /api/emergency/card-block (Public)',
        fraudReport: 'POST /api/emergency/fraud-report (Public)',
        helpline: 'POST /api/emergency/helpline (Public)',
        status: 'GET /api/emergency/status/:emergencyId (Public)',
        helplineNumbers: 'GET /api/emergency/helpline-numbers (Public)',
        myEmergencies: 'GET /api/emergency/my-emergencies (Protected)'
      },
      admin: {
        login: 'POST /api/admin/login (Public)',
        profile: 'GET /api/admin/profile (Protected)',
        dashboardStats: 'GET /api/admin/dashboard/stats (Protected)',
        users: 'GET /api/admin/users (Protected)',
        toggleUserStatus: 'PUT /api/admin/users/:userId/status (Protected)',
        transactions: 'GET /api/admin/transactions (Protected)',
        emergencies: 'GET /api/admin/emergencies (Protected)',
        createAdmin: 'POST /api/admin/create (Super Admin Only)'
      }
    }
  });
});

// Health Check Route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API Documentation: http://localhost:${PORT}`);
  });
}

// Export for Vercel
module.exports = app;

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});
