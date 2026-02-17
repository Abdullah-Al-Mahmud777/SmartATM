const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public Routes (No authentication required)
router.post('/login', authController.login);
router.post('/register', authController.register);

// Protected Routes (Authentication required)
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, authController.updateProfile);
router.post('/change-pin', verifyToken, authController.changePin);

module.exports = router;
