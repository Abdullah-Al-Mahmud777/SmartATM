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

// Send broadcast notification to all users
router.post('/broadcast', notificationController.sendBroadcastNotification);

// Send notification to specific user
router.post('/send', notificationController.sendUserNotification);

// Mark notification as read
router.put('/:notificationId/read', notificationController.markAsRead);

// Mark all as read
router.put('/mark-all-read', notificationController.markAllAsRead);

// Delete notification
router.delete('/:notificationId', notificationController.deleteNotification);

// Create notification (legacy)
router.post('/', notificationController.createNotification);

module.exports = router;
