const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { verifyToken } = require('../middleware/authMiddleware');

// All transaction routes require authentication
router.use(verifyToken);

// Transaction Routes
router.post('/withdraw', transactionController.withdraw);
router.post('/deposit', transactionController.deposit);
router.post('/transfer', transactionController.transfer);
router.get('/history', transactionController.getHistory);
router.get('/balance', transactionController.getBalance);

module.exports = router;
