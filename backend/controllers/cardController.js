const User = require('../models/User');
const CardBlock = require('../models/CardBlock');

// Block Card
exports.blockCard = async (req, res) => {
  try {
    const { reason } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (user.cardStatus === 'Blocked') {
      return res.status(400).json({ 
        success: false, 
        message: 'Card is already blocked' 
      });
    }

    // Update card status
    user.cardStatus = 'Blocked';
    await user.save();

    // Create block record
    const cardBlock = new CardBlock({
      userId: user._id,
      cardNumber: user.cardNumber,
      reason: reason || 'User requested',
      blockedBy: 'User',
      status: 'Blocked'
    });
    await cardBlock.save();

    res.json({
      success: true,
      message: 'Card blocked successfully',
      cardStatus: user.cardStatus
    });

  } catch (error) {
    console.error('Block card error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};

// Unblock Card (Admin only)
exports.unblockCard = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (user.cardStatus === 'Active') {
      return res.status(400).json({ 
        success: false, 
        message: 'Card is already active' 
      });
    }

    // Update card status
    user.cardStatus = 'Active';
    await user.save();

    // Update block record
    await CardBlock.findOneAndUpdate(
      { userId: user._id, status: 'Blocked' },
      { 
        status: 'Unblocked',
        unblockedAt: Date.now(),
        unblockedBy: 'Admin'
      }
    );

    res.json({
      success: true,
      message: 'Card unblocked successfully',
      cardStatus: user.cardStatus
    });

  } catch (error) {
    console.error('Unblock card error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};

// Get Card Status
exports.getCardStatus = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('cardNumber cardStatus');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Get block history
    const blockHistory = await CardBlock.find({ userId: user._id })
      .sort({ blockedAt: -1 })
      .limit(5);

    res.json({
      success: true,
      cardNumber: user.cardNumber,
      cardStatus: user.cardStatus,
      blockHistory: blockHistory.map(block => ({
        reason: block.reason,
        blockedAt: block.blockedAt,
        blockedBy: block.blockedBy,
        status: block.status,
        unblockedAt: block.unblockedAt
      }))
    });

  } catch (error) {
    console.error('Get card status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};

// Report Lost/Stolen Card
exports.reportCard = async (req, res) => {
  try {
    const { reportType, description } = req.body;

    if (!reportType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Report type is required' 
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Block card immediately
    user.cardStatus = 'Blocked';
    await user.save();

    // Create block record
    const cardBlock = new CardBlock({
      userId: user._id,
      cardNumber: user.cardNumber,
      reason: `${reportType}: ${description || 'No description provided'}`,
      blockedBy: 'User',
      status: 'Blocked',
      reportType
    });
    await cardBlock.save();

    res.json({
      success: true,
      message: `Card reported as ${reportType} and blocked successfully`,
      cardStatus: user.cardStatus
    });

  } catch (error) {
    console.error('Report card error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};
