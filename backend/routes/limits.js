const express = require('express');
const router = express.Router();
const limitController = require('../controllers/limitController');
const { verifyToken } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(verifyToken);

// Limit Routes
router.get('/', limitController.getLimits);
router.put('/', limitController.updateLimits);

module.exports = router;
