const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Get All Transactions with Filters
exports.getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, search, startDate, endDate } = req.query;

    let query = {};
    
    if (type && type !== 'All') {
      query.type = type;
    }
    
    if (status && status !== 'All') {
      query.status = status;
    }
    
    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { accountNumber: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      const userIds = users.map(u => u._id);
      
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { userId: { $in: userIds } }
      ];
    }
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const transactions = await Transaction.find(query)
      .populate('userId', 'name accountNumber')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalTransactions = await Transaction.countDocuments(query);
    
    // Summary statistics
    const completedCount = await Transaction.countDocuments({ ...query, status: 'Completed' });
    const pendingCount = await Transaction.countDocuments({ ...query, status: 'Pending' });
    const failedCount = await Transaction.countDocuments({ ...query, status: 'Failed' });
    
    const totalAmount = await Transaction.aggregate([
      { $match: { ...query, status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      transactions: transactions.map(t => ({
        id: t.transactionId,
        user: t.userId?.name || 'Unknown',
        account: t.userId?.accountNumber || 'N/A',
        type: t.type,
        amount: t.amount,
        status: t.status,
        balanceAfter: t.balanceAfter,
        description: t.description,
        date: t.createdAt.toISOString().split('T')[0],
        time: t.createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      })),
      summary: {
        total: totalTransactions,
        completed: completedCount,
        pending: pendingCount,
        failed: failedCount,
        totalAmount: totalAmount[0]?.total || 0
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalTransactions / parseInt(limit)),
        totalTransactions
      }
    });

  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Get Transaction Details
exports.getTransactionDetails = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findOne({ transactionId })
      .populate('userId', 'name email accountNumber cardNumber');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      transaction: {
        id: transaction.transactionId,
        type: transaction.type,
        amount: transaction.amount,
        status: transaction.status,
        balanceBefore: transaction.balanceBefore,
        balanceAfter: transaction.balanceAfter,
        description: transaction.description,
        atmLocation: transaction.atmLocation,
        ipAddress: transaction.ipAddress,
        deviceInfo: transaction.deviceInfo,
        createdAt: transaction.createdAt,
        user: {
          name: transaction.userId?.name,
          email: transaction.userId?.email,
          account: transaction.userId?.accountNumber,
          card: `**** **** **** ${transaction.userId?.cardNumber.slice(-4)}`
        }
      }
    });

  } catch (error) {
    console.error('Get transaction details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Update Transaction Status (Admin override)
exports.updateTransactionStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { status, reason } = req.body;

    const transaction = await Transaction.findOne({ transactionId });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    transaction.status = status;
    if (reason) {
      transaction.description = `${transaction.description} - Admin: ${reason}`;
    }

    await transaction.save();

    res.json({
      success: true,
      message: 'Transaction status updated successfully',
      transaction: {
        id: transaction.transactionId,
        status: transaction.status
      }
    });

  } catch (error) {
    console.error('Update transaction status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Get Transaction Statistics
exports.getTransactionStats = async (req, res) => {
  try {
    const { period = '7days' } = req.query;

    let startDate = new Date();
    switch(period) {
      case '24hours':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
    }

    const stats = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' }
        }
      }
    ]);

    const statusStats = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      period,
      stats: {
        byType: stats,
        byStatus: statusStats
      }
    });

  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

module.exports = exports;
