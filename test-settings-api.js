// Test script for settings API
const API_URL = 'http://localhost:5000';

// First, login as admin to get token
async function loginAdmin() {
  try {
    const response = await fetch(`${API_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('✅ Login successful');
      return data.token;
    } else {
      console.log('❌ Login failed:', data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return null;
  }
}

// Test getting all settings
async function testGetSettings(token) {
  try {
    const response = await fetch(`${API_URL}/api/admin/settings`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    console.log('\n📋 Get Settings Response:');
    console.log(JSON.stringify(data, null, 2));
    return data.success;
  } catch (error) {
    console.log('❌ Get settings error:', error.message);
    return false;
  }
}

// Test updating a notification setting
async function testUpdateNotificationSetting(token) {
  try {
    const response = await fetch(`${API_URL}/api/admin/settings/Notifications/email_notifications`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ value: true })
    });
    
    const data = await response.json();
    console.log('\n📧 Update Email Notification Response:');
    console.log(JSON.stringify(data, null, 2));
    return data.success;
  } catch (error) {
    console.log('❌ Update setting error:', error.message);
    return false;
  }
}

// Test updating SMS notification
async function testUpdateSMSSetting(token) {
  try {
    const response = await fetch(`${API_URL}/api/admin/settings/Notifications/sms_notifications`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ value: true })
    });
    
    const data = await response.json();
    console.log('\n📱 Update SMS Notification Response:');
    console.log(JSON.stringify(data, null, 2));
    return data.success;
  } catch (error) {
    console.log('❌ Update SMS setting error:', error.message);
    return false;
  }
}

// Test updating Push notification
async function testUpdatePushSetting(token) {
  try {
    const response = await fetch(`${API_URL}/api/admin/settings/Notifications/push_notifications`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ value: true })
    });
    
    const data = await response.json();
    console.log('\n🔔 Update Push Notification Response:');
    console.log(JSON.stringify(data, null, 2));
    return data.success;
  } catch (error) {
    console.log('❌ Update push setting error:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Testing Settings API...\n');
  
  const token = await loginAdmin();
  if (!token) {
    console.log('\n❌ Cannot proceed without valid token');
    return;
  }
  
  await testGetSettings(token);
  await testUpdateNotificationSetting(token);
  await testUpdateSMSSetting(token);
  await testUpdatePushSetting(token);
  await testGetSettings(token);
  
  console.log('\n✅ All tests completed!');
}

runTests();
