const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyAdminToken } = require('../middleware/adminMiddleware');

// All routes require admin authentication
router.use(verifyAdminToken);

// Get all notifications for admin
router.get('/', notificationController.getAdminNotifications);

// Get unread count
router.get('/unread-count', notificationController.getUnreadCount);

// Mark notification as read
router.put('/:notificationId/read', notificationController.markAsRead);

// Mark all as read
router.put('/mark-all-read', notificationController.markAllAsRead);

// Delete notification
router.delete('/:notificationId', notificationController.deleteNotification);

// Create notification
router.post('/', notificationController.createNotification);

module.exports = router;
