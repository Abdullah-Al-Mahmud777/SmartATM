const Analytics = require('../models/Analytics');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const ATM = require('../models/ATM');
const Emergency = require('../models/Emergency');

// Get Analytics Data
exports.getAnalytics = async (req, res) => {
  try {
    const { timeRange = '7days' } = req.query;

    let startDate = new Date();
    let groupBy = 'day';

    // Calculate date range
    switch(timeRange) {
      case '24hours':
        startDate.setHours(startDate.getHours() - 24);
        groupBy = 'hour';
        break;
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        groupBy = 'day';
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        groupBy = 'day';
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        groupBy = 'week';
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Transaction Trends
    const transactionTrends = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: groupBy === 'hour' ? '%Y-%m-%d %H:00' : '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            type: '$type'
          },
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Format transaction trends
    const trendsMap = {};
    transactionTrends.forEach(item => {
      const date = item._id.date;
      if (!trendsMap[date]) {
        trendsMap[date] = { date, withdrawals: 0, deposits: 0, transfers: 0 };
      }
      trendsMap[date][item._id.type.toLowerCase() + 's'] = item.count;
    });

    const formattedTrends = Object.values(trendsMap).map(item => ({
      day: groupBy === 'hour' ? item.date.split(' ')[1] : new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
      withdrawals: item.withdrawals || 0,
      deposits: item.deposits || 0,
      transfers: item.transfers || 0
    }));

    // Peak Hours
    const peakHours = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          transactions: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    const formattedPeakHours = peakHours.map(item => ({
      hour: `${item._id}:00`,
      transactions: item.transactions
    }));

    // Top Users
    const topUsers = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'Completed'
        }
      },
      {
        $group: {
          _id: '$userId',
          transactions: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $sort: { transactions: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      }
    ]);

    const formattedTopUsers = topUsers.map(item => ({
      name: item.user.name,
      transactions: item.transactions,
      amount: `৳${item.totalAmount.toLocaleString()}`
    }));

    // Error Logs from ATMs
    const atms = await ATM.find({
      'errorLogs.timestamp': { $gte: startDate }
    }).select('errorLogs atmId');

    const errorLogs = [];
    atms.forEach(atm => {
      atm.errorLogs.forEach(error => {
        if (error.timestamp >= startDate && !error.resolved) {
          errorLogs.push({
            time: error.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            type: error.type,
            severity: error.severity,
            message: `${error.message} on ${atm.atmId}`
          });
        }
      });
    });

    // Sort by timestamp (most recent first)
    errorLogs.sort((a, b) => new Date(b.time) - new Date(a.time));

    // Overall Statistics
    const totalTransactions = await Transaction.countDocuments({ createdAt: { $gte: startDate } });
    const completedTransactions = await Transaction.countDocuments({ 
      createdAt: { $gte: startDate },
      status: 'Completed'
    });
    const failedTransactions = await Transaction.countDocuments({ 
      createdAt: { $gte: startDate },
      status: 'Failed'
    });

    const transactionAmounts = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'Completed'
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      timeRange,
      analytics: {
        transactionTrends: formattedTrends,
        peakHours: formattedPeakHours,
        topUsers: formattedTopUsers,
        errorLogs: errorLogs.slice(0, 10), // Latest 10 errors
        statistics: {
          totalTransactions,
          completedTransactions,
          failedTransactions,
          totalAmount: transactionAmounts[0]?.totalAmount || 0,
          avgAmount: transactionAmounts[0]?.avgAmount || 0
        }
      }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Get Transaction Statistics
exports.getTransactionStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Get User Growth Analytics
exports.getUserGrowth = async (req, res) => {
  try {
    const { timeRange = '30days' } = req.query;

    let startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange.replace('days', '')));

    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          newUsers: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    res.json({
      success: true,
      userGrowth
    });

  } catch (error) {
    console.error('Get user growth error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

module.exports = exports;
