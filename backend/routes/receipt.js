const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receiptController');
const { verifyToken } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(verifyToken);

// Receipt Routes
router.post('/create', receiptController.createReceipt);
router.get('/recent', receiptController.getRecentTransactions);
router.get('/all', receiptController.getAllReceipts);
router.get('/:transactionId', receiptController.getTransactionReceipt);
router.put('/:receiptId/pdf', receiptController.markPdfGenerated);

module.exports = router;
