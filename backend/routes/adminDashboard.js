const express = require('express');
const router = express.Router();
const adminDashboardController = require('../controllers/adminDashboardController');
const { verifyAdminToken } = require('../middleware/adminMiddleware');

// All routes require admin authentication
router.use(verifyAdminToken);

// Get dashboard statistics
router.get('/stats', adminDashboardController.getDashboardStats);

// Get system health
router.get('/health', adminDashboardController.getSystemHealth);

module.exports = router;
