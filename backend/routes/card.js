const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const { verifyToken } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(verifyToken);

// Card Routes
router.post('/block', cardController.blockCard);
router.post('/unblock', cardController.unblockCard);
router.get('/status', cardController.getCardStatus);
router.post('/report', cardController.reportCard);

module.exports = router;
