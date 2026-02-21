const express = require('express');
const router = express.Router();
const adminAnalyticsController = require('../controllers/adminAnalyticsController');
const { verifyAdminToken } = require('../middleware/adminMiddleware');

// All routes require admin authentication
router.use(verifyAdminToken);

// Get analytics data
router.get('/', adminAnalyticsController.getAnalytics);

// Get transaction statistics
router.get('/transactions', adminAnalyticsController.getTransactionStats);

// Get user growth analytics
router.get('/user-growth', adminAnalyticsController.getUserGrowth);

module.exports = router;
