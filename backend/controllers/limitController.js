const User = require('../models/User');
const Limit = require('../models/Limit');

// Get User Limits
exports.getLimits = async (req, res) => {
  try {
    let limit = await Limit.findOne({ userId: req.userId });

    // Create default limits if not exists
    if (!limit) {
      limit = new Limit({
        userId: req.userId,
        dailyWithdrawalLimit: 50000,
        monthlyWithdrawalLimit: 500000,
        dailyTransferLimit: 100000,
        monthlyTransferLimit: 1000000
      });
      await limit.save();
    }

    // Check and reset limits if needed
    limit.checkAndResetDaily();
    limit.checkAndResetMonthly();
    await limit.save();

    res.json({
      success: true,
      limits: {
        daily: {
          withdrawalLimit: limit.dailyWithdrawalLimit,
          withdrawalUsed: limit.dailyWithdrawn,
          withdrawalRemaining: limit.dailyWithdrawalLimit - limit.dailyWithdrawn,
          transferLimit: limit.dailyTransferLimit,
          transferUsed: limit.dailyTransferred,
          transferRemaining: limit.dailyTransferLimit - limit.dailyTransferred
        },
        monthly: {
          withdrawalLimit: limit.monthlyWithdrawalLimit,
          withdrawalUsed: limit.monthlyWithdrawn,
          withdrawalRemaining: limit.monthlyWithdrawalLimit - limit.monthlyWithdrawn,
          transferLimit: limit.monthlyTransferLimit,
          transferUsed: limit.monthlyTransferred,
          transferRemaining: limit.monthlyTransferLimit - limit.monthlyTransferred
        }
      }
    });

  } catch (error) {
    console.error('Get limits error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};

// Update User Limits (Admin only)
exports.updateLimits = async (req, res) => {
  try {
    const { 
      dailyWithdrawalLimit, 
      monthlyWithdrawalLimit,
      dailyTransferLimit,
      monthlyTransferLimit 
    } = req.body;

    let limit = await Limit.findOne({ userId: req.userId });

    if (!limit) {
      limit = new Limit({ userId: req.userId });
    }

    // Update limits
    if (dailyWithdrawalLimit) limit.dailyWithdrawalLimit = dailyWithdrawalLimit;
    if (monthlyWithdrawalLimit) limit.monthlyWithdrawalLimit = monthlyWithdrawalLimit;
    if (dailyTransferLimit) limit.dailyTransferLimit = dailyTransferLimit;
    if (monthlyTransferLimit) limit.monthlyTransferLimit = monthlyTransferLimit;

    limit.updatedAt = Date.now();
    await limit.save();

    res.json({
      success: true,
      message: 'Limits updated successfully',
      limits: {
        dailyWithdrawalLimit: limit.dailyWithdrawalLimit,
        monthlyWithdrawalLimit: limit.monthlyWithdrawalLimit,
        dailyTransferLimit: limit.dailyTransferLimit,
        monthlyTransferLimit: limit.monthlyTransferLimit
      }
    });

  } catch (error) {
    console.error('Update limits error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};

// Check if transaction is within limits
exports.checkLimit = async (userId, amount, type) => {
  try {
    let limit = await Limit.findOne({ userId });

    if (!limit) {
      limit = new Limit({ userId });
      await limit.save();
    }

    // Reset limits if needed
    limit.checkAndResetDaily();
    limit.checkAndResetMonthly();

    // Check limits based on transaction type
    if (type === 'withdraw') {
      if (limit.dailyWithdrawn + amount > limit.dailyWithdrawalLimit) {
        return { 
          allowed: false, 
          message: `Daily withdrawal limit exceeded. Remaining: ৳${limit.dailyWithdrawalLimit - limit.dailyWithdrawn}` 
        };
      }
      if (limit.monthlyWithdrawn + amount > limit.monthlyWithdrawalLimit) {
        return { 
          allowed: false, 
          message: `Monthly withdrawal limit exceeded. Remaining: ৳${limit.monthlyWithdrawalLimit - limit.monthlyWithdrawn}` 
        };
      }

      // Update used amounts
      limit.dailyWithdrawn += amount;
      limit.monthlyWithdrawn += amount;
      await limit.save();
    }

    if (type === 'transfer') {
      if (limit.dailyTransferred + amount > limit.dailyTransferLimit) {
        return { 
          allowed: false, 
          message: `Daily transfer limit exceeded. Remaining: ৳${limit.dailyTransferLimit - limit.dailyTransferred}` 
        };
      }
      if (limit.monthlyTransferred + amount > limit.monthlyTransferLimit) {
        return { 
          allowed: false, 
          message: `Monthly transfer limit exceeded. Remaining: ৳${limit.monthlyTransferLimit - limit.monthlyTransferred}` 
        };
      }

      // Update used amounts
      limit.dailyTransferred += amount;
      limit.monthlyTransferred += amount;
      await limit.save();
    }

    return { allowed: true };

  } catch (error) {
    console.error('Check limit error:', error);
    return { allowed: false, message: 'Error checking limits' };
  }
};
