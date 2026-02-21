const ATM = require('../models/ATM');
const Transaction = require('../models/Transaction');

// Get All ATMs
exports.getAllATMs = async (req, res) => {
  try {
    const atms = await ATM.find().sort({ atmId: 1 });

    const formattedATMs = atms.map(atm => ({
      id: atm.atmId,
      location: atm.location,
      address: atm.address,
      status: atm.status,
      cash: `৳${atm.cashAvailable.toLocaleString()}`,
      cashRaw: atm.cashAvailable,
      capacity: `${atm.capacityPercentage}%`,
      capacityRaw: atm.capacityPercentage,
      lastService: atm.lastServiceDate ? atm.lastServiceDate.toISOString().split('T')[0] : 'N/A',
      transactions: atm.todayTransactions,
      coordinates: atm.coordinates,
      errors: atm.errorLogs.filter(e => !e.resolved).length
    }));

    // Summary statistics
    const summary = {
      total: atms.length,
      online: atms.filter(atm => atm.status === 'Online').length,
      offline: atms.filter(atm => atm.status === 'Offline').length,
      maintenance: atms.filter(atm => atm.status === 'Maintenance').length,
      lowCash: atms.filter(atm => atm.capacityPercentage < 20 || atm.status === 'Low Cash').length
    };

    res.json({
      success: true,
      atms: formattedATMs,
      summary
    });

  } catch (error) {
    console.error('Get all ATMs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Get ATM Details
exports.getATMDetails = async (req, res) => {
  try {
    const { atmId } = req.params;

    const atm = await ATM.findOne({ atmId });

    if (!atm) {
      return res.status(404).json({
        success: false,
        message: 'ATM not found'
      });
    }

    // Get recent transactions for this ATM
    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name accountNumber');

    res.json({
      success: true,
      atm: {
        id: atm.atmId,
        location: atm.location,
        address: atm.address,
        status: atm.status,
        cashAvailable: atm.cashAvailable,
        cashCapacity: atm.cashCapacity,
        capacityPercentage: atm.capacityPercentage,
        lastRefillDate: atm.lastRefillDate,
        lastServiceDate: atm.lastServiceDate,
        nextServiceDate: atm.nextServiceDate,
        todayTransactions: atm.todayTransactions,
        totalTransactions: atm.totalTransactions,
        lastOnlineTime: atm.lastOnlineTime,
        coordinates: atm.coordinates,
        errors: atm.errorLogs.filter(e => !e.resolved),
        maintenanceHistory: atm.maintenanceHistory
      },
      recentTransactions: recentTransactions.map(t => ({
        id: t.transactionId,
        type: t.type,
        amount: t.amount,
        status: t.status,
        user: t.userId?.name || 'Unknown',
        date: t.createdAt
      }))
    });

  } catch (error) {
    console.error('Get ATM details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Refill ATM Cash
exports.refillCash = async (req, res) => {
  try {
    const { atmId } = req.params;
    const { amount } = req.body;

    const atm = await ATM.findOne({ atmId });

    if (!atm) {
      return res.status(404).json({
        success: false,
        message: 'ATM not found'
      });
    }

    // Update cash
    atm.cashAvailable += amount;
    if (atm.cashAvailable > atm.cashCapacity) {
      atm.cashAvailable = atm.cashCapacity;
    }

    atm.lastRefillDate = new Date();

    // Update status based on cash level
    if (atm.capacityPercentage >= 20) {
      atm.status = 'Online';
    }

    await atm.save();

    res.json({
      success: true,
      message: 'Cash refilled successfully',
      atm: {
        id: atm.atmId,
        cashAvailable: atm.cashAvailable,
        capacityPercentage: atm.capacityPercentage,
        status: atm.status
      }
    });

  } catch (error) {
    console.error('Refill cash error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Update ATM Status
exports.updateATMStatus = async (req, res) => {
  try {
    const { atmId } = req.params;
    const { status } = req.body;

    const atm = await ATM.findOne({ atmId });

    if (!atm) {
      return res.status(404).json({
        success: false,
        message: 'ATM not found'
      });
    }

    atm.status = status;
    
    if (status === 'Online') {
      atm.lastOnlineTime = new Date();
    }

    await atm.save();

    res.json({
      success: true,
      message: 'ATM status updated successfully',
      atm: {
        id: atm.atmId,
        status: atm.status
      }
    });

  } catch (error) {
    console.error('Update ATM status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Create Service Request
exports.createServiceRequest = async (req, res) => {
  try {
    const { atmId } = req.params;
    const { type, notes, technician } = req.body;

    const atm = await ATM.findOne({ atmId });

    if (!atm) {
      return res.status(404).json({
        success: false,
        message: 'ATM not found'
      });
    }

    // Add to maintenance history
    atm.maintenanceHistory.push({
      date: new Date(),
      type: type || 'General Service',
      technician: technician || 'Unassigned',
      notes: notes || 'Service request created'
    });

    atm.status = 'Maintenance';
    atm.lastServiceDate = new Date();

    await atm.save();

    res.json({
      success: true,
      message: 'Service request created successfully',
      atm: {
        id: atm.atmId,
        status: atm.status
      }
    });

  } catch (error) {
    console.error('Create service request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Add Error Log
exports.addErrorLog = async (req, res) => {
  try {
    const { atmId } = req.params;
    const { type, message, severity } = req.body;

    const atm = await ATM.findOne({ atmId });

    if (!atm) {
      return res.status(404).json({
        success: false,
        message: 'ATM not found'
      });
    }

    atm.errorLogs.push({
      type,
      message,
      severity: severity || 'Medium',
      timestamp: new Date(),
      resolved: false
    });

    // Auto-update status for critical errors
    if (severity === 'Critical' || severity === 'High') {
      if (type.toLowerCase().includes('cash') && atm.capacityPercentage < 20) {
        atm.status = 'Low Cash';
      } else if (type.toLowerCase().includes('offline') || type.toLowerCase().includes('network')) {
        atm.status = 'Offline';
      }
    }

    await atm.save();

    res.json({
      success: true,
      message: 'Error log added successfully'
    });

  } catch (error) {
    console.error('Add error log error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Resolve Error
exports.resolveError = async (req, res) => {
  try {
    const { atmId, errorId } = req.params;

    const atm = await ATM.findOne({ atmId });

    if (!atm) {
      return res.status(404).json({
        success: false,
        message: 'ATM not found'
      });
    }

    const error = atm.errorLogs.id(errorId);
    if (error) {
      error.resolved = true;
    }

    await atm.save();

    res.json({
      success: true,
      message: 'Error resolved successfully'
    });

  } catch (error) {
    console.error('Resolve error error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Create/Seed ATM Data (for testing)
exports.seedATMs = async (req, res) => {
  try {
    const existingATMs = await ATM.countDocuments();
    
    if (existingATMs > 0) {
      return res.json({
        success: true,
        message: 'ATMs already exist in database'
      });
    }

    const sampleATMs = [
      { atmId: 'ATM-001', location: 'Dhaka - Gulshan', address: 'Gulshan Avenue, Dhaka 1212', cashAvailable: 550000, status: 'Online', todayTransactions: 145 },
      { atmId: 'ATM-002', location: 'Dhaka - Banani', address: 'Banani Road 11, Dhaka 1213', cashAvailable: 320000, status: 'Online', todayTransactions: 98 },
      { atmId: 'ATM-003', location: 'Chittagong - Agrabad', address: 'Agrabad C/A, Chittagong', cashAvailable: 150000, status: 'Offline', todayTransactions: 0 },
      { atmId: 'ATM-004', location: 'Dhaka - Dhanmondi', address: 'Dhanmondi 27, Dhaka 1209', cashAvailable: 680000, status: 'Online', todayTransactions: 182 },
      { atmId: 'ATM-005', location: 'Sylhet - Zindabazar', address: 'Zindabazar, Sylhet', cashAvailable: 240000, status: 'Maintenance', todayTransactions: 0 },
      { atmId: 'ATM-006', location: 'Dhaka - Mirpur', address: 'Mirpur 10, Dhaka 1216', cashAvailable: 490000, status: 'Online', todayTransactions: 156 },
      { atmId: 'ATM-007', location: 'Rajshahi - Shaheb Bazar', address: 'Shaheb Bazar, Rajshahi', cashAvailable: 375000, status: 'Online', todayTransactions: 112 },
      { atmId: 'ATM-008', location: 'Dhaka - Uttara', address: 'Uttara Sector 7, Dhaka 1230', cashAvailable: 80000, status: 'Low Cash', todayTransactions: 203 }
    ];

    const atms = await ATM.insertMany(sampleATMs.map(atm => ({
      ...atm,
      cashCapacity: 1000000,
      lastServiceDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      lastOnlineTime: new Date()
    })));

    res.json({
      success: true,
      message: 'Sample ATMs created successfully',
      count: atms.length
    });

  } catch (error) {
    console.error('Seed ATMs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

module.exports = exports;
