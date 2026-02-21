const User = require('../models/User');
const Transaction = require('../models/Transaction');
const CardBlock = require('../models/CardBlock');

// Get All Users with Pagination and Filters
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    let query = {};
    
    if (status && status !== 'All') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { accountNumber: { $regex: search, $options: 'i' } },
        { cardNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-pin')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalUsers = await User.countDocuments(query);
    const activeUsers = await User.countDocuments({ ...query, status: 'Active' });
    const frozenUsers = await User.countDocuments({ ...query, status: 'Frozen' });
    const blockedCards = await User.countDocuments({ ...query, cardStatus: 'Blocked' });

    res.json({
      success: true,
      users: users.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        accountNumber: u.accountNumber,
        cardNumber: `**** **** **** ${u.cardNumber.slice(-4)}`,
        balance: u.balance,
        status: u.status,
        cardStatus: u.cardStatus,
        createdAt: u.createdAt
      })),
      summary: {
        total: totalUsers,
        active: activeUsers,
        frozen: frozenUsers,
        blockedCards: blockedCards
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / parseInt(limit)),
        totalUsers
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Toggle User Account Status (Freeze/Unfreeze)
exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body; // 'freeze' or 'unfreeze'

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (action === 'freeze') {
      user.status = 'Frozen';
    } else if (action === 'unfreeze') {
      user.status = 'Active';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
    }

    await user.save();

    res.json({
      success: true,
      message: `User account ${action}d successfully`,
      user: {
        id: user._id,
        name: user.name,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Toggle Card Status (Block/Unblock)
exports.toggleCardStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body; // 'block' or 'unblock'

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (action === 'block') {
      user.cardStatus = 'Blocked';
      
      // Create card block record
      await CardBlock.create({
        userId: user._id,
        cardNumber: user.cardNumber,
        reason: 'Admin blocked',
        blockedBy: 'Admin',
        status: 'Blocked'
      });
    } else if (action === 'unblock') {
      user.cardStatus = 'Active';
      
      // Update card block record
      await CardBlock.updateMany(
        { userId: user._id, isResolved: false },
        { isResolved: true, resolvedAt: new Date() }
      );
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
    }

    await user.save();

    res.json({
      success: true,
      message: `Card ${action}ed successfully`,
      user: {
        id: user._id,
        name: user.name,
        cardStatus: user.cardStatus
      }
    });

  } catch (error) {
    console.error('Toggle card status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Reset User PIN
exports.resetUserPIN = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPIN } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (newPIN) {
      // If new PIN provided, set it
      user.pin = newPIN;
      await user.save();
      
      res.json({
        success: true,
        message: 'PIN reset successfully'
      });
    } else {
      // Generate temporary PIN and send notification
      const tempPIN = Math.floor(1000 + Math.random() * 9000).toString();
      
      res.json({
        success: true,
        message: 'PIN reset link sent to user',
        tempPIN: tempPIN // In production, send via email/SMS
      });
    }

  } catch (error) {
    console.error('Reset user PIN error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Get User Details
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-pin');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's transactions
    const transactions = await Transaction.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user's card blocks
    const cardBlocks = await CardBlock.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        accountNumber: user.accountNumber,
        cardNumber: `**** **** **** ${user.cardNumber.slice(-4)}`,
        balance: user.balance,
        status: user.status,
        cardStatus: user.cardStatus,
        createdAt: user.createdAt
      },
      transactions: transactions.map(t => ({
        id: t.transactionId,
        type: t.type,
        amount: t.amount,
        status: t.status,
        date: t.createdAt
      })),
      cardBlocks: cardBlocks.map(cb => ({
        reason: cb.reason,
        status: cb.status,
        date: cb.createdAt,
        resolved: cb.isResolved
      }))
    });

  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

module.exports = exports;
