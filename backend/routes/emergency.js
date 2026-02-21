const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public routes (no authentication required for emergency)
router.post('/card-block', emergencyController.instantCardBlock);
router.post('/fraud-report', emergencyController.reportFraud);
router.post('/helpline', emergencyController.requestHelpline);
router.get('/status/:emergencyId', emergencyController.getEmergencyStatus);
router.get('/helpline-numbers', emergencyController.getHelplineNumbers);

// Protected routes (require authentication)
router.get('/my-emergencies', verifyToken, emergencyController.getUserEmergencies);

module.exports = router;
