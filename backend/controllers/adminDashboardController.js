const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Emergency = require('../models/Emergency');
const ATM = require('../models/ATM');
const CardBlock = require('../models/CardBlock');

// Get Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // User Statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'Active' });
    const frozenAccounts = await User.countDocuments({ status: 'Frozen' });
    const blockedCards = await CardBlock.countDocuments({ status: 'Blocked', isResolved: false });
    const todayUsers = await User.countDocuments({ createdAt: { $gte: today } });

    // Transaction Statistics
    const totalTransactions = await Transaction.countDocuments();
    const todayTransactions = await Transaction.countDocuments({ createdAt: { $gte: today } });
    const completedTransactions = await Transaction.countDocuments({ status: 'Completed' });
    const pendingTransactions = await Transaction.countDocuments({ status: 'Pending' });
    const failedTransactions = await Transaction.countDocuments({ status: 'Failed' });

    // Revenue Statistics
    const revenueData = await Transaction.aggregate([
      { $match: { status: 'Completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          avgTransaction: { $avg: '$amount' }
        }
      }
    ]);

    const todayRevenue = await Transaction.aggregate([
      { $match: { status: 'Completed', createdAt: { $gte: today } } },
      {
        $group: {
          _id: null,
          amount: { $sum: '$amount' }
        }
      }
    ]);

    // Emergency Statistics
    const pendingEmergencies = await Emergency.countDocuments({ status: 'Pending' });
    const criticalEmergencies = await Emergency.countDocuments({ 
      priority: 'Critical', 
      status: { $ne: 'Resolved' } 
    });

    // ATM Statistics
    const totalATMs = await ATM.countDocuments();
    const onlineATMs = await ATM.countDocuments({ status: 'Online' });
    const offlineATMs = await ATM.countDocuments({ status: 'Offline' });
    const maintenanceATMs = await ATM.countDocuments({ status: 'Maintenance' });

    // Recent Transactions
    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name accountNumber');

    // Recent Users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name accountNumber email status createdAt');

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          frozen: frozenAccounts,
          today: todayUsers
        },
        transactions: {
          total: totalTransactions,
          today: todayTransactions,
          completed: completedTransactions,
          pending: pendingTransactions,
          failed: failedTransactions
        },
        revenue: {
          total: revenueData[0]?.totalRevenue || 0,
          today: todayRevenue[0]?.amount || 0,
          average: revenueData[0]?.avgTransaction || 0
        },
        cards: {
          blocked: blockedCards
        },
        emergencies: {
          pending: pendingEmergencies,
          critical: criticalEmergencies
        },
        atms: {
          total: totalATMs,
          online: onlineATMs,
          offline: offlineATMs,
          maintenance: maintenanceATMs
        },
        recentTransactions: recentTransactions.map(t => ({
          id: t.transactionId,
          user: t.userId?.name || 'Unknown',
          amount: t.amount,
          type: t.type,
          status: t.status,
          time: t.createdAt
        })),
        recentUsers: recentUsers.map(u => ({
          id: u._id,
          name: u.name,
          account: u.accountNumber,
          email: u.email,
          status: u.status,
          joined: u.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Get System Health
exports.getSystemHealth = async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    
    res.json({
      success: true,
      health: {
        database: dbStatus,
        server: 'Running',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Get system health error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

module.exports = exports;
