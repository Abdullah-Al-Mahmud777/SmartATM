const express = require('express');
const router = express.Router();
const currencyController = require('../controllers/currencyController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public Routes
router.get('/rates', currencyController.getExchangeRates);
router.get('/currencies', currencyController.getSupportedCurrencies);

// Protected Routes
router.post('/convert', verifyToken, currencyController.convertCurrency);

// Admin Routes (add admin middleware later)
router.put('/rates', verifyToken, currencyController.updateExchangeRates);

module.exports = router;
