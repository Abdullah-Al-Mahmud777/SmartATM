const express = require('express');
const router = express.Router();
const adminUsersController = require('../controllers/adminUsersController');
const { verifyAdminToken } = require('../middleware/adminMiddleware');

// All routes require admin authentication
router.use(verifyAdminToken);

// Get all users
router.get('/', adminUsersController.getAllUsers);

// Get user details
router.get('/:userId', adminUsersController.getUserDetails);

// Toggle user account status (freeze/unfreeze)
router.put('/:userId/status', adminUsersController.toggleUserStatus);

// Toggle card status (block/unblock)
router.put('/:userId/card-status', adminUsersController.toggleCardStatus);

// Reset user PIN
router.post('/:userId/reset-pin', adminUsersController.resetUserPIN);

module.exports = router;
