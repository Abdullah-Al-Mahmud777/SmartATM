const express = require('express');
const router = express.Router();
const adminTransactionsController = require('../controllers/adminTransactionsController');
const { verifyAdminToken } = require('../middleware/adminMiddleware');

// All routes require admin authentication
router.use(verifyAdminToken);

// Get all transactions
router.get('/', adminTransactionsController.getAllTransactions);

// Get transaction statistics
router.get('/stats', adminTransactionsController.getTransactionStats);

// Get transaction details
router.get('/:transactionId', adminTransactionsController.getTransactionDetails);

// Update transaction status
router.put('/:transactionId/status', adminTransactionsController.updateTransactionStatus);

module.exports = router;
