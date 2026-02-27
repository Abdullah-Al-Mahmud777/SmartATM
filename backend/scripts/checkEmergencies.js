require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Emergency = require('../models/Emergency');

const checkEmergencies = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all emergencies
    const allEmergencies = await Emergency.find({}).sort({ createdAt: -1 }).limit(10);
    
    console.log(`Total emergencies in database: ${await Emergency.countDocuments()}`);
    console.log(`Pending: ${await Emergency.countDocuments({ status: 'Pending' })}`);
    console.log(`Resolved: ${await Emergency.countDocuments({ status: 'Resolved' })}\n`);

    if (allEmergencies.length === 0) {
      console.log('⚠️  No emergencies found in database\n');
      console.log('Creating a test emergency...\n');
      
      // Create test emergency
      const testEmergency = new Emergency({
        emergencyId: `EMG${Date.now()}`,
        type: 'Card Block',
        status: 'Pending',
        priority: 'High',
        contactName: 'Test User',
        contactPhone: '01700000000',
        description: 'Test emergency for testing resolve functionality',
        accountNumber: '1234567890'
      });
      
      await testEmergency.save();
      console.log('✅ Test emergency created!');
      console.log('Emergency ID:', testEmergency.emergencyId);
      console.log('Status:', testEmergency.status);
    } else {
      console.log('Recent emergencies:\n');
      allEmergencies.forEach((e, i) => {
        console.log(`${i + 1}. Emergency ID: ${e.emergencyId}`);
        console.log(`   Type: ${e.type}`);
        console.log(`   Status: ${e.status}`);
        console.log(`   Priority: ${e.priority}`);
        console.log(`   Contact: ${e.contactName} (${e.contactPhone})`);
        console.log(`   Description: ${e.description}`);
        console.log(`   Created: ${e.createdAt}`);
        console.log('');
      });
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkEmergencies();
