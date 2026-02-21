const Notification = require('../models/Notification');

// Generate notification ID
const generateNotificationId = () => {
  return 'NOTIF' + Date.now() + Math.floor(Math.random() * 1000);
};

// Get All Notifications for Admin
exports.getAdminNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, priority, isRead } = req.query;
    const adminId = req.adminId;

    let query = {};
    
    // Don't filter by adminId - show all notifications for all admins
    
    if (type && type !== 'All') {
      query.type = type;
    }
    
    if (priority && priority !== 'All') {
      query.priority = priority;
    }
    
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalNotifications = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ isRead: false });

    res.json({
      success: true,
      notifications: notifications.map(n => ({
        id: n.notificationId,
        type: n.type,
        priority: n.priority,
        title: n.title,
        message: n.message,
        isRead: n.isRead,
        readAt: n.readAt,
        actionUrl: n.actionUrl,
        createdAt: n.createdAt
      })),
      unreadCount,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalNotifications / parseInt(limit)),
        totalNotifications
      }
    });

  } catch (error) {
    console.error('Get admin notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Mark Notification as Read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({ notificationId });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Mark All as Read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Delete Notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndDelete({ notificationId });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Create Notification (System/Admin)
exports.createNotification = async (req, res) => {
  try {
    const { userId, type, priority, title, message, actionUrl, metadata } = req.body;
    const adminId = req.adminId; // Get from authenticated admin

    const notification = new Notification({
      notificationId: generateNotificationId(),
      adminId,
      userId,
      type,
      priority: priority || 'Medium',
      title,
      message,
      actionUrl,
      metadata
    });

    await notification.save();

    res.json({
      success: true,
      message: 'Notification created successfully',
      notification: {
        id: notification.notificationId,
        type: notification.type,
        title: notification.title
      }
    });

  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Get Unread Count
exports.getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({ isRead: false });

    res.json({
      success: true,
      unreadCount
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

module.exports = exports;
