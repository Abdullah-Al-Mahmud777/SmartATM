const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { verifyToken } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(verifyToken);

// Analytics Routes
router.get('/', analyticsController.getUserAnalytics);
router.get('/spending', analyticsController.getSpendingInsights);

module.exports = router;
