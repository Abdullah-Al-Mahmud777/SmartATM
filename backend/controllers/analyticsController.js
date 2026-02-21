const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Get User Analytics
exports.getUserAnalytics = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Get all transactions
    const transactions = await Transaction.find({ userId: req.userId });

    // Calculate statistics
    const totalTransactions = transactions.length;
    const withdrawals = transactions.filter(t => t.type === 'Withdraw');
    const deposits = transactions.filter(t => t.type === 'Deposit');
    const transfers = transactions.filter(t => t.type === 'Transfer');

    const totalWithdrawn = withdrawals.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalDeposited = deposits.reduce((sum, t) => sum + t.amount, 0);
    const totalTransferred = transfers.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Get monthly data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTransactions = await Transaction.aggregate([
      {
        $match: {
          userId: user._id,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get transaction by type
    const transactionsByType = await Transaction.aggregate([
      {
        $match: { userId: user._id }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: { $abs: '$amount' } }
        }
      }
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await Transaction.aggregate([
      {
        $match: {
          userId: user._id,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Calculate average transaction amount
    const avgWithdrawal = withdrawals.length > 0 
      ? totalWithdrawn / withdrawals.length 
      : 0;
    const avgDeposit = deposits.length > 0 
      ? totalDeposited / deposits.length 
      : 0;

    res.json({
      success: true,
      analytics: {
        overview: {
          currentBalance: user.balance,
          totalTransactions,
          accountAge: Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)) // days
        },
        transactions: {
          withdrawals: {
            count: withdrawals.length,
            total: totalWithdrawn,
            average: Math.round(avgWithdrawal)
          },
          deposits: {
            count: deposits.length,
            total: totalDeposited,
            average: Math.round(avgDeposit)
          },
          transfers: {
            count: transfers.length,
            total: totalTransferred
          }
        },
        monthlyData: monthlyTransactions,
        transactionsByType,
        recentActivity,
        spending: {
          thisMonth: await getMonthlySpending(user._id),
          lastMonth: await getMonthlySpending(user._id, 1)
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

// Helper function to get monthly spending
async function getMonthlySpending(userId, monthsAgo = 0) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsAgo);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  const transactions = await Transaction.find({
    userId,
    createdAt: { $gte: startDate, $lt: endDate },
    type: { $in: ['Withdraw', 'Transfer'] }
  });

  return transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
}

// Get Spending Insights
exports.getSpendingInsights = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const transactions = await Transaction.find({
      userId: req.userId,
      createdAt: { $gte: daysAgo },
      type: { $in: ['Withdraw', 'Transfer'] }
    });

    const totalSpent = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const avgDaily = totalSpent / parseInt(period);

    // Get top spending days
    const dailySpending = await Transaction.aggregate([
      {
        $match: {
          userId: req.userId,
          createdAt: { $gte: daysAgo },
          type: { $in: ['Withdraw', 'Transfer'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          total: { $sum: { $abs: '$amount' } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      },
      {
        $limit: 5
      }
    ]);

    res.json({
      success: true,
      insights: {
        period: `${period} days`,
        totalSpent,
        avgDaily: Math.round(avgDaily),
        transactionCount: transactions.length,
        topSpendingDays: dailySpending
      }
    });

  } catch (error) {
    console.error('Get spending insights error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};
