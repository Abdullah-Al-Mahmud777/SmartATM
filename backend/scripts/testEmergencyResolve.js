require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Emergency = require('../models/Emergency');
const Admin = require('../models/Admin');

const testEmergencyResolve = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get first emergency
    const emergency = await Emergency.findOne({ status: 'Pending' });
    
    if (!emergency) {
      console.log('⚠️  No pending emergencies found');
      
      // Show all emergencies
      const allEmergencies = await Emergency.find({}).limit(5);
      console.log(`\nFound ${allEmergencies.length} total emergencies:`);
      allEmergencies.forEach(e => {
        console.log(`- ${e.emergencyId}: ${e.type} - ${e.status}`);
      });
      
      process.exit(0);
    }

    console.log('\nTesting emergency resolution:');
    console.log('Emergency ID:', emergency.emergencyId);
    console.log('Type:', emergency.type);
    console.log('Status:', emergency.status);

    // Get admin
    const admin = await Admin.findOne({ role: 'Super Admin' });
    if (!admin) {
      console.log('❌ No admin found');
      process.exit(1);
    }

    console.log('Admin:', admin.username);
    console.log('Permissions:', admin.permissions);

    // Update emergency
    emergency.status = 'Resolved';
    emergency.resolvedAt = new Date();
    emergency.resolvedBy = admin._id.toString();
    emergency.actionTaken = 'Test resolution';

    await emergency.save();

    console.log('\n✅ Emergency resolved successfully!');
    console.log('New status:', emergency.status);
    console.log('Resolved at:', emergency.resolvedAt);

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testEmergencyResolve();
