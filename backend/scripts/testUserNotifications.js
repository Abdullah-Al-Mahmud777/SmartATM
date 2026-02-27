require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const testUserNotifications = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get a test user
    const user = await User.findOne({});
    if (!user) {
      console.log('❌ No user found');
      process.exit(1);
    }

    console.log('Test User:');
    console.log(`  Name: ${user.name}`);
    console.log(`  Account: ${user.accountNumber}`);
    console.log(`  ID: ${user._id}\n`);

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '3650d' });
    console.log('Generated Token:');
    console.log(token);
    console.log('\n');

    // Test API calls
    console.log('📋 Test API Calls:\n');
    
    console.log('1. Get Unread Count:');
    console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:10000/api/notifications/unread-count\n`);
    
    console.log('2. Get Notifications:');
    console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:10000/api/notifications\n`);

    console.log('3. Test in Browser Console:');
    console.log(`localStorage.setItem('atmToken', '${token}');\n`);

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testUserNotifications();
