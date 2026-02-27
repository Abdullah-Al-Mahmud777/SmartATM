require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const getAdminToken = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const admin = await Admin.findOne({ role: 'Super Admin' });
    
    if (!admin) {
      console.log('❌ No admin found');
      process.exit(1);
    }

    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, { expiresIn: '3650d' });

    console.log('\n=================================');
    console.log('Admin Token Generated:');
    console.log('=================================');
    console.log('Admin:', admin.username);
    console.log('Role:', admin.role);
    console.log('Permissions:', admin.permissions.join(', '));
    console.log('\nToken:');
    console.log(token);
    console.log('=================================\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

getAdminToken();
