const SystemSettings = require('../models/SystemSettings');

// Get All Settings
exports.getAllSettings = async (req, res) => {
  try {
    const { category } = req.query;

    let query = {};
    if (category && category !== 'All') {
      query.category = category;
    }

    const settings = await SystemSettings.find(query)
      .populate('lastModifiedBy', 'name username')
      .sort({ category: 1, key: 1 });

    // If no settings exist, initialize defaults
    if (settings.length === 0) {
      await initializeDefaults();
      const newSettings = await SystemSettings.find(query)
        .populate('lastModifiedBy', 'name username')
        .sort({ category: 1, key: 1 });
      
      const groupedSettings = groupSettingsByCategory(newSettings);
      return res.json({
        success: true,
        settings: groupedSettings,
        initialized: true
      });
    }

    // Group by category
    const groupedSettings = groupSettingsByCategory(settings);

    res.json({
      success: true,
      settings: groupedSettings
    });

  } catch (error) {
    console.error('Get all settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Helper function to group settings by category
const groupSettingsByCategory = (settings) => {
  return settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push({
      key: setting.key,
      value: setting.value,
      description: setting.description,
      dataType: setting.dataType,
      isEditable: setting.isEditable,
      lastModifiedBy: setting.lastModifiedBy?.name || 'System',
      updatedAt: setting.updatedAt
    });
    return acc;
  }, {});
};

// Helper function to initialize defaults
const initializeDefaults = async () => {
  const defaultSettings = [
    // General Settings
    { category: 'General', key: 'system_name', value: 'SmartATM', description: 'System name', dataType: 'string' },
    { category: 'General', key: 'maintenance_mode', value: false, description: 'Enable maintenance mode', dataType: 'boolean' },
    { category: 'General', key: 'support_email', value: 'support@smartatm.com', description: 'Support email address', dataType: 'string' },
    { category: 'General', key: 'support_phone', value: '16247', description: 'Support phone number', dataType: 'string' },
    
    // Security Settings
    { category: 'Security', key: 'max_login_attempts', value: 5, description: 'Maximum login attempts before lock', dataType: 'number' },
    { category: 'Security', key: 'session_timeout', value: 30, description: 'Session timeout in minutes', dataType: 'number' },
    { category: 'Security', key: 'require_2fa', value: false, description: 'Require two-factor authentication', dataType: 'boolean' },
    { category: 'Security', key: 'password_expiry_days', value: 90, description: 'Password expiry in days', dataType: 'number' },
    
    // Notification Settings
    { category: 'Notifications', key: 'email_notifications', value: true, description: 'Enable email notifications', dataType: 'boolean' },
    { category: 'Notifications', key: 'sms_notifications', value: true, description: 'Enable SMS notifications', dataType: 'boolean' },
    { category: 'Notifications', key: 'push_notifications', value: true, description: 'Enable push notifications', dataType: 'boolean' },
    
    // Transaction Limits
    { category: 'Limits', key: 'daily_withdrawal_limit', value: 50000, description: 'Daily withdrawal limit', dataType: 'number' },
    { category: 'Limits', key: 'daily_transfer_limit', value: 100000, description: 'Daily transfer limit', dataType: 'number' },
    { category: 'Limits', key: 'min_transaction_amount', value: 100, description: 'Minimum transaction amount', dataType: 'number' },
    
    // ATM Settings
    { category: 'ATM', key: 'atm_service_fee', value: 10, description: 'ATM service fee', dataType: 'number' },
    { category: 'ATM', key: 'low_cash_threshold', value: 100000, description: 'Low cash alert threshold', dataType: 'number' },
    { category: 'ATM', key: 'maintenance_interval_days', value: 30, description: 'Maintenance interval in days', dataType: 'number' }
  ];

  for (const setting of defaultSettings) {
    const exists = await SystemSettings.findOne({ 
      category: setting.category, 
      key: setting.key 
    });
    
    if (!exists) {
      await SystemSettings.create(setting);
    }
  }
};

// Get Setting by Key
exports.getSetting = async (req, res) => {
  try {
    const { category, key } = req.params;

    const setting = await SystemSettings.findOne({ category, key });

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    res.json({
      success: true,
      setting: {
        category: setting.category,
        key: setting.key,
        value: setting.value,
        description: setting.description,
        dataType: setting.dataType,
        isEditable: setting.isEditable
      }
    });

  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Update Setting (with auto-create if not exists)
exports.updateSetting = async (req, res) => {
  try {
    const { category, key } = req.params;
    const { value } = req.body;
    const adminId = req.adminId;

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
        setting: {
          category: setting.category,
          key: setting.key,
          value: setting.value
        }
      });
    }

    if (!setting.isEditable) {
      return res.status(403).json({
        success: false,
        message: 'This setting cannot be edited'
      });
    }

    setting.value = value;
    setting.lastModifiedBy = adminId;
    await setting.save();

    res.json({
      success: true,
      message: 'Setting updated successfully',
      setting: {
        category: setting.category,
        key: setting.key,
        value: setting.value
      }
    });

  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Create Setting
exports.createSetting = async (req, res) => {
  try {
    const { category, key, value, description, dataType, isEditable } = req.body;
    const adminId = req.adminId;

    // Check if setting already exists
    const existingSetting = await SystemSettings.findOne({ category, key });
    if (existingSetting) {
      return res.status(400).json({
        success: false,
        message: 'Setting already exists'
      });
    }

    const setting = new SystemSettings({
      category,
      key,
      value,
      description,
      dataType: dataType || 'string',
      isEditable: isEditable !== undefined ? isEditable : true,
      lastModifiedBy: adminId
    });

    await setting.save();

    res.json({
      success: true,
      message: 'Setting created successfully',
      setting: {
        category: setting.category,
        key: setting.key,
        value: setting.value
      }
    });

  } catch (error) {
    console.error('Create setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Initialize Default Settings
exports.initializeDefaultSettings = async (req, res) => {
  try {
    const defaultSettings = [
      // General Settings
      { category: 'General', key: 'system_name', value: 'SmartATM', description: 'System name', dataType: 'string' },
      { category: 'General', key: 'maintenance_mode', value: false, description: 'Enable maintenance mode', dataType: 'boolean' },
      { category: 'General', key: 'support_email', value: 'support@smartatm.com', description: 'Support email address', dataType: 'string' },
      { category: 'General', key: 'support_phone', value: '16247', description: 'Support phone number', dataType: 'string' },
      
      // Security Settings
      { category: 'Security', key: 'max_login_attempts', value: 5, description: 'Maximum login attempts before lock', dataType: 'number' },
      { category: 'Security', key: 'session_timeout', value: 30, description: 'Session timeout in minutes', dataType: 'number' },
      { category: 'Security', key: 'require_2fa', value: false, description: 'Require two-factor authentication', dataType: 'boolean' },
      { category: 'Security', key: 'password_expiry_days', value: 90, description: 'Password expiry in days', dataType: 'number' },
      
      // Notification Settings
      { category: 'Notifications', key: 'email_notifications', value: true, description: 'Enable email notifications', dataType: 'boolean' },
      { category: 'Notifications', key: 'sms_notifications', value: true, description: 'Enable SMS notifications', dataType: 'boolean' },
      { category: 'Notifications', key: 'push_notifications', value: true, description: 'Enable push notifications', dataType: 'boolean' },
      
      // Transaction Limits
      { category: 'Limits', key: 'daily_withdrawal_limit', value: 50000, description: 'Daily withdrawal limit', dataType: 'number' },
      { category: 'Limits', key: 'daily_transfer_limit', value: 100000, description: 'Daily transfer limit', dataType: 'number' },
      { category: 'Limits', key: 'min_transaction_amount', value: 100, description: 'Minimum transaction amount', dataType: 'number' },
      
      // ATM Settings
      { category: 'ATM', key: 'atm_service_fee', value: 10, description: 'ATM service fee', dataType: 'number' },
      { category: 'ATM', key: 'low_cash_threshold', value: 100000, description: 'Low cash alert threshold', dataType: 'number' },
      { category: 'ATM', key: 'maintenance_interval_days', value: 30, description: 'Maintenance interval in days', dataType: 'number' }
    ];

    for (const setting of defaultSettings) {
      const exists = await SystemSettings.findOne({ 
        category: setting.category, 
        key: setting.key 
      });
      
      if (!exists) {
        await SystemSettings.create(setting);
      }
    }

    res.json({
      success: true,
      message: 'Default settings initialized successfully'
    });

  } catch (error) {
    console.error('Initialize default settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

module.exports = exports;
