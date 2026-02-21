const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transferController');
const { verifyToken } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(verifyToken);

// Transfer Routes
router.post('/', transferController.transferMoney);
router.post('/verify', transferController.verifyAccount);
router.get('/history', transferController.getTransferHistory);
router.get('/stats', transferController.getTransferStats);
router.get('/:transferId', transferController.getTransferDetails);

module.exports = router;
