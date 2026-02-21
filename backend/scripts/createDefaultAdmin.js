require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const createDefaultAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Default admin already exists');
      console.log('Username: admin');
      console.log('You can login with existing credentials');
      process.exit(0);
    }

    // Create default admin
    const admin = new Admin({
      username: 'admin',
      email: 'admin@smartatm.com',
      password: 'admin123', // Will be hashed automatically
      name: 'System Administrator',
      role: 'Super Admin',
      permissions: [
        'view_users',
        'manage_users',
        'view_transactions',
        'manage_transactions',
        'view_emergencies',
        'manage_emergencies',
        'view_reports',
        'manage_admins'
      ],
      status: 'Active'
    });

    await admin.save();

    console.log('✅ Default admin created successfully!');
    console.log('');
    console.log('=================================');
    console.log('Admin Login Credentials:');
    console.log('=================================');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Role: Super Admin');
    console.log('=================================');
    console.log('');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    console.log('');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating default admin:', error);
    process.exit(1);
  }
};

createDefaultAdmin();
