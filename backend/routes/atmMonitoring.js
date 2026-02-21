const express = require('express');
const router = express.Router();
const atmMonitoringController = require('../controllers/atmMonitoringController');
const { verifyAdminToken } = require('../middleware/adminMiddleware');

// All routes require admin authentication
router.use(verifyAdminToken);

// Get all ATMs
router.get('/', atmMonitoringController.getAllATMs);

// Get ATM details
router.get('/:atmId', atmMonitoringController.getATMDetails);

// Refill ATM cash
router.post('/:atmId/refill', atmMonitoringController.refillCash);

// Update ATM status
router.put('/:atmId/status', atmMonitoringController.updateATMStatus);

// Create service request
router.post('/:atmId/service', atmMonitoringController.createServiceRequest);

// Add error log
router.post('/:atmId/error', atmMonitoringController.addErrorLog);

// Resolve error
router.put('/:atmId/error/:errorId/resolve', atmMonitoringController.resolveError);

// Seed sample ATMs (for testing)
router.post('/seed/sample-data', atmMonitoringController.seedATMs);

module.exports = router;
