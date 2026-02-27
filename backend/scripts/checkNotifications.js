require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User');

const checkNotifications = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all notifications
    const allNotifications = await Notification.find({}).sort({ createdAt: -1 }).limit(10);
    
    console.log(`Total notifications: ${await Notification.countDocuments()}`);
    console.log(`Broadcast notifications (userId=null): ${await Notification.countDocuments({ userId: null })}`);
    console.log(`User-specific notifications: ${await Notification.countDocuments({ userId: { $ne: null } })}\n`);

    if (allNotifications.length === 0) {
      console.log('⚠️  No notifications found in database\n');
    } else {
      console.log('Recent notifications:\n');
      allNotifications.forEach((n, i) => {
        console.log(`${i + 1}. Notification ID: ${n.notificationId}`);
        console.log(`   Type: ${n.type}`);
        console.log(`   Priority: ${n.priority}`);
        console.log(`   Title: ${n.title}`);
        console.log(`   Message: ${n.message}`);
        console.log(`   User ID: ${n.userId || 'null (Broadcast)'}`);
        console.log(`   Admin ID: ${n.adminId}`);
        console.log(`   Is Read: ${n.isRead}`);
        console.log(`   Created: ${n.createdAt}`);
        console.log('');
      });
    }

    // Get a test user
    const testUser = await User.findOne({}).select('_id name accountNumber');
    if (testUser) {
      console.log('Test User:');
      console.log(`  ID: ${testUser._id}`);
      console.log(`  Name: ${testUser.name}`);
      console.log(`  Account: ${testUser.accountNumber}\n`);

      // Check notifications for this user
      const userNotifications = await Notification.find({
        $or: [
          { userId: testUser._id },
          { userId: null }
        ]
      }).sort({ createdAt: -1 });

      console.log(`Notifications for ${testUser.name}: ${userNotifications.length}`);
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkNotifications();
