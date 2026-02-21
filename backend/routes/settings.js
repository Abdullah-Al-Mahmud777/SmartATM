const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { verifyAdminToken, isSuperAdmin } = require('../middleware/adminMiddleware');

// All routes require admin authentication
router.use(verifyAdminToken);

// Get all settings
router.get('/', settingsController.getAllSettings);

// Initialize default settings (Any admin can initialize)
router.post('/initialize', settingsController.initializeDefaultSettings);

// Get specific setting
router.get('/:category/:key', settingsController.getSetting);

// Update setting
router.put('/:category/:key', settingsController.updateSetting);

// Create setting (Super Admin only)
router.post('/', isSuperAdmin, settingsController.createSetting);

module.exports = router;
