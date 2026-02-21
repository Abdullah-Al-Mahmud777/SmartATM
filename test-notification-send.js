// Test script for sending notifications
const API_URL = 'http://localhost:5000';

// Login as admin
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

// Test sending different types of notifications
async function testSendNotifications(token) {
  const notificationTypes = [
    { type: 'System', title: 'System Update', message: 'System will be updated tonight' },
    { type: 'Security', title: 'Security Alert', message: 'Please update your password' },
    { type: 'Transaction', title: 'Transaction Limit', message: 'Daily limit increased' },
    { type: 'Maintenance', title: 'Scheduled Maintenance', message: 'Maintenance on Sunday' },
    { type: 'Promotion', title: 'New Feature', message: 'Check out our new currency converter' }
  ];

  for (const notif of notificationTypes) {
    try {
      const response = await fetch(`${API_URL}/api/admin/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: notif.type,
          priority: 'Medium',
          title: notif.title,
          message: notif.message,
          metadata: { targetUsers: 'all' }
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ ${notif.type} notification sent successfully`);
      } else {
        console.log(`❌ ${notif.type} notification failed:`, data.message);
      }
    } catch (error) {
      console.log(`❌ ${notif.type} notification error:`, error.message);
    }
  }
}

// Get all notifications
async function getNotifications(token) {
  try {
    const response = await fetch(`${API_URL}/api/admin/notifications?limit=10`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('\n📋 Recent Notifications:');
      data.notifications.forEach(n => {
        console.log(`  - [${n.type}] ${n.title}: ${n.message}`);
      });
      console.log(`\n📊 Total: ${data.notifications.length}, Unread: ${data.unreadCount}`);
    }
  } catch (error) {
    console.log('❌ Get notifications error:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🧪 Testing Notification Send...\n');
  
  const token = await loginAdmin();
  if (!token) {
    console.log('\n❌ Cannot proceed without valid token');
    return;
  }
  
  console.log('\n📤 Sending test notifications...\n');
  await testSendNotifications(token);
  
  console.log('\n📥 Fetching notifications...');
  await getNotifications(token);
  
  console.log('\n✅ All tests completed!');
}

runTests();
