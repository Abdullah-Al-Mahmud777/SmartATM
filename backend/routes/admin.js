const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyAdminToken, isSuperAdmin, checkPermission } = require('../middleware/adminMiddleware');

// Public routes
router.post('/login', adminController.login);

// Protected routes (require admin authentication)
router.use(verifyAdminToken);

// Admin profile and logout
router.get('/profile', adminController.getProfile);
router.post('/logout', adminController.logout);

// Dashboard statistics
router.get('/dashboard/stats', adminController.getDashboardStats);

// User management
router.get('/users', checkPermission('view_users'), adminController.getAllUsers);
router.put('/users/:userId/status', checkPermission('manage_users'), adminController.toggleUserStatus);

// Transaction management
router.get('/transactions', checkPermission('view_transactions'), adminController.getAllTransactions);

// Emergency management
router.get('/emergencies', checkPermission('view_emergencies'), adminController.getAllEmergencies);

// Admin management (Super Admin only)
router.post('/create', isSuperAdmin, adminController.createAdmin);

module.exports = router;
