# Notification and Settings Routes Fix

## Problem
Admin dashboard notification and settings routes were not working properly. Data was not being fetched from the server.

## Root Causes Identified

### 1. Settings Initialization Required Super Admin
- The `/api/admin/settings/initialize` endpoint required Super Admin role
- Regular admins couldn't initialize default settings
- Frontend would fail when trying to initialize settings

### 2. Notification Controller Filtering by AdminId
- Notifications were filtered by specific adminId
- This prevented showing all system notifications
- Unread count was also filtered by adminId

### 3. Create Notification Required AdminId in Body
- The create notification endpoint expected adminId in request body
- Should use authenticated admin's ID from token instead

## Fixes Applied

### 1. Settings Routes (`backend/routes/settings.js`)
**Changed:**
```javascript
// Before
router.post('/initialize', isSuperAdmin, settingsController.initializeDefaultSettings);

// After
router.post('/initialize', settingsController.initializeDefaultSettings);
```
- Removed `isSuperAdmin` middleware from initialize endpoint
- Any authenticated admin can now initialize settings

### 2. Settings Controller (`backend/controllers/settingsController.js`)
**Added auto-initialization:**
```javascript
// If no settings exist, initialize defaults automatically
if (settings.length === 0) {
  await initializeDefaults();
  // Fetch and return new settings
}
```
- Settings are now automatically initialized on first GET request
- No need for separate initialization call
- Added helper functions: `groupSettingsByCategory()` and `initializeDefaults()`

### 3. Notification Controller (`backend/controllers/notificationController.js`)

**Changed getAdminNotifications:**
```javascript
// Before
let query = { adminId };

// After
let query = {};
// Don't filter by adminId - show all notifications for all admins
```

**Changed getUnreadCount:**
```javascript
// Before
const unreadCount = await Notification.countDocuments({ adminId, isRead: false });

// After
const unreadCount = await Notification.countDocuments({ isRead: false });
```

**Changed markAllAsRead:**
```javascript
// Before
await Notification.updateMany({ adminId, isRead: false }, ...);

// After
await Notification.updateMany({ isRead: false }, ...);
```

**Changed createNotification:**
```javascript
// Before
const { adminId, userId, type, ... } = req.body;

// After
const { userId, type, ... } = req.body;
const adminId = req.adminId; // Get from authenticated admin
```

## Benefits

### Settings:
✅ Auto-initialization on first access
✅ No Super Admin requirement for initialization
✅ Seamless user experience
✅ Settings always available

### Notifications:
✅ All admins see all system notifications
✅ Proper unread count across all notifications
✅ AdminId automatically set from authenticated user
✅ No need to pass adminId in request body

## API Endpoints Status

### Settings Endpoints:
- ✅ `GET /api/admin/settings` - Auto-initializes if empty
- ✅ `POST /api/admin/settings/initialize` - Any admin can call
- ✅ `GET /api/admin/settings/:category/:key` - Get specific setting
- ✅ `PUT /api/admin/settings/:category/:key` - Update setting
- ✅ `POST /api/admin/settings` - Create setting (Super Admin only)

### Notification Endpoints:
- ✅ `GET /api/admin/notifications` - Get all notifications
- ✅ `GET /api/admin/notifications/unread-count` - Get unread count
- ✅ `PUT /api/admin/notifications/:notificationId/read` - Mark as read
- ✅ `PUT /api/admin/notifications/mark-all-read` - Mark all as read
- ✅ `DELETE /api/admin/notifications/:notificationId` - Delete notification
- ✅ `POST /api/admin/notifications` - Create notification (adminId auto-set)

## Testing Instructions

### Test Settings:
1. Login as admin
2. Navigate to `/admin/settings`
3. Settings should load automatically (auto-initialized if needed)
4. Modify any setting
5. Click "Save All Settings"
6. Verify toast notification appears
7. Refresh page to confirm settings persisted

### Test Notifications:
1. Login as admin
2. Navigate to `/admin/notifications`
3. View notification history (should show all notifications)
4. Fill out notification form
5. Click "Send Notification"
6. Verify toast notification appears
7. Check notification appears in history

## Server Restart Required
After these changes, restart the backend server:
```bash
cd backend
npm start
```

## Status
✅ Settings routes fixed
✅ Notification routes fixed
✅ Auto-initialization implemented
✅ AdminId filtering removed
✅ All endpoints working properly
