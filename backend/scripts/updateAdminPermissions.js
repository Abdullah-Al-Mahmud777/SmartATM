require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const updateAdminPermissions = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all admins
    const admins = await Admin.find({});
    
    if (admins.length === 0) {
      console.log('⚠️  No admins found in database');
      process.exit(0);
    }

    console.log(`Found ${admins.length} admin(s)`);

    // Update each admin
    for (const admin of admins) {
      const requiredPermissions = [
        'view_users',
        'manage_users',
        'view_transactions',
        'manage_transactions',
        'view_emergencies',
        'manage_emergencies',
        'view_reports'
      ];

      // Add missing permissions
      const missingPermissions = requiredPermissions.filter(
        perm => !admin.permissions.includes(perm)
      );

      if (missingPermissions.length > 0) {
        admin.permissions = [...new Set([...admin.permissions, ...missingPermissions])];
        await admin.save();
        console.log(`✅ Updated permissions for admin: ${admin.username}`);
        console.log(`   Added: ${missingPermissions.join(', ')}`);
      } else {
        console.log(`✓ Admin ${admin.username} already has all permissions`);
      }
    }

    console.log('');
    console.log('✅ All admins updated successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error updating admin permissions:', error);
    process.exit(1);
  }
};

updateAdminPermissions();
