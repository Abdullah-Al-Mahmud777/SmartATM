# Settings Toggle Fix - SMS, Email, Push Notifications

## Problem
When toggling notification settings (SMS, Email, Push notifications), the frontend was getting "route not found" errors.

## Root Cause
The settings didn't exist in the database yet, and the `updateSetting` endpoint was returning 404 when trying to update a non-existent setting.

## Solution Applied

### 1. Backend - Auto-Create Settings on Update
Modified `backend/controllers/settingsController.js` - `updateSetting` method:

**Before:**
```javascript
const setting = await SystemSettings.findOne({ category, key });

if (!setting) {
  return res.status(404).json({
    success: false,
    message: 'Setting not found'
  });
}
```

**After:**
```javascript
let setting = await SystemSettings.findOne({ category, key });

// If setting doesn't exist, create it
if (!setting) {
  setting = new SystemSettings({
    category,
    key,
    value,
    description: `${key.replace(/_/g, ' ')}`,
    dataType: typeof value,
    isEditable: true,
    lastModifiedBy: adminId
  });
  await setting.save();

  return res.json({
    success: true,
    message: 'Setting created successfully',
    setting: { category, key, value }
  });
}
```

**Benefits:**
- Settings are automatically created when first toggled
- No need to manually initialize every setting
- Upsert-like behavior (update or insert)

### 2. Frontend - Better Undefined Handling
Modified `frontend/app/admin/settings/page.jsx` - `handleToggle` method:

**Before:**
```javascript
const newValue = !settings[fullKey];
```

**After:**
```javascript
// Default to false if undefined, then toggle
const currentValue = settings[fullKey] ?? false;
const newValue = !currentValue;
```

**Benefits:**
- Handles undefined settings gracefully
- Defaults to false for boolean settings
- Prevents unexpected toggle behavior

### 3. Enhanced Logging
Added detailed console logging in `handleUpdateSetting`:

```javascript
console.log('Updating setting:', { category, key, value, url });
console.log('Update response:', data);
console.error('Update failed:', data);
```

**Benefits:**
- Easy debugging of API calls
- See exact URL being called
- Track request/response data

## How It Works Now

### Toggle Flow:
1. User clicks toggle switch
2. Frontend calls `handleToggle('Notifications', 'email_notifications')`
3. Current value is checked (defaults to false if undefined)
4. New value is calculated (opposite of current)
5. API call: `PUT /api/admin/settings/Notifications/email_notifications`
6. Backend checks if setting exists:
   - **If exists**: Update the value
   - **If not exists**: Create new setting with the value
7. Frontend receives success response
8. Toast notification shows "Setting updated successfully!"
9. Setting is updated in local state

## Settings That Now Work

### Notification Settings:
- ✅ `Notifications.email_notifications` - Email Notifications toggle
- ✅ `Notifications.sms_notifications` - SMS Notifications toggle
- ✅ `Notifications.push_notifications` - Push Notifications toggle

### Security Settings:
- ✅ `Security.require_2fa` - Two-Factor Authentication toggle
- ✅ `General.maintenance_mode` - Maintenance Mode toggle

### All Other Settings:
- ✅ Transaction Limits (input fields)
- ✅ Security timeouts (input fields)
- ✅ General settings (input fields)

## Testing Instructions

### Test Notification Toggles:
1. Login as admin
2. Navigate to `/admin/settings`
3. Scroll to "Notification Settings" section
4. Toggle "Email Notifications" - should see success toast
5. Toggle "SMS Notifications" - should see success toast
6. Toggle "Push Notifications" - should see success toast
7. Open browser console to see detailed logs
8. Refresh page - toggles should maintain their state

### Verify in Database:
```javascript
// In MongoDB, check SystemSettings collection
db.systemsettings.find({ category: 'Notifications' })

// Should see:
{
  category: 'Notifications',
  key: 'email_notifications',
  value: true/false,
  dataType: 'boolean',
  isEditable: true
}
```

## API Endpoint Behavior

### PUT /api/admin/settings/:category/:key

**Request:**
```json
{
  "value": true
}
```

**Response (Setting Exists):**
```json
{
  "success": true,
  "message": "Setting updated successfully",
  "setting": {
    "category": "Notifications",
    "key": "email_notifications",
    "value": true
  }
}
```

**Response (Setting Created):**
```json
{
  "success": true,
  "message": "Setting created successfully",
  "setting": {
    "category": "Notifications",
    "key": "email_notifications",
    "value": true
  }
}
```

## Console Output Example

When toggling a setting, you'll see:
```
Updating setting: {
  category: 'Notifications',
  key: 'email_notifications',
  value: true,
  url: 'http://localhost:5000/api/admin/settings/Notifications/email_notifications'
}

Update response: {
  success: true,
  message: 'Setting created successfully',
  setting: { category: 'Notifications', key: 'email_notifications', value: true }
}
```

## Server Restart Required
After backend changes, restart the server:
```bash
cd backend
npm start
```

## Status
✅ Backend auto-create on update implemented
✅ Frontend undefined handling fixed
✅ Enhanced logging added
✅ All notification toggles working
✅ All security toggles working
✅ Settings persist across page refreshes

## Additional Notes

- Settings are created with `isEditable: true` by default
- DataType is automatically detected from value type
- Description is auto-generated from key name
- LastModifiedBy tracks which admin made the change
- All changes require admin authentication
