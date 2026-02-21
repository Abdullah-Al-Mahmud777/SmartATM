const Emergency = require('../models/Emergency');
const User = require('../models/User');
const CardBlock = require('../models/CardBlock');

// Generate unique emergency ID
const generateEmergencyId = () => {
  return 'EMG' + Date.now() + Math.floor(Math.random() * 1000);
};

// Instant Card Block (No authentication required for emergency)
exports.instantCardBlock = async (req, res) => {
  try {
    const { cardNumber, contactName, contactPhone, reason, description } = req.body;

    // Validation
    if (!cardNumber || !contactName || !contactPhone || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Card number, contact name, phone, and reason are required'
      });
    }

    // Find user by card number
    const user = await User.findOne({ cardNumber });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Card not found in system'
      });
    }

    // Check if card is already blocked
    const existingBlock = await CardBlock.findOne({ 
      userId: user._id,
      isBlocked: true 
    });

    if (existingBlock) {
      return res.status(400).json({
        success: false,
        message: 'Card is already blocked'
      });
    }

    // Block the card
    const cardBlock = new CardBlock({
      userId: user._id,
      cardNumber: user.cardNumber,
      reason: reason,
      isBlocked: true,
      blockedAt: new Date(),
      blockType: 'Emergency'
    });

    await cardBlock.save();

    // Update user card status
    user.cardStatus = 'Blocked';
    await user.save();

    // Create emergency record
    const emergency = new Emergency({
      emergencyId: generateEmergencyId(),
      userId: user._id,
      type: 'Card Block',
      priority: 'Critical',
      cardNumber: user.cardNumber,
      accountNumber: user.accountNumber,
      contactName,
      contactPhone,
      description: description || `Emergency card block: ${reason}`,
      actionTaken: 'Card blocked immediately',
      ipAddress: req.ip
    });

    await emergency.save();

    res.json({
      success: true,
      message: 'Card blocked successfully for security',
      emergency: {
        emergencyId: emergency.emergencyId,
        type: emergency.type,
        status: emergency.status,
        cardNumber: `**** **** **** ${user.cardNumber.slice(-4)}`,
        contactPhone: emergency.contactPhone
      }
    });

  } catch (error) {
    console.error('Instant card block error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Report Fraud
exports.reportFraud = async (req, res) => {
  try {
    const { 
      cardNumber, 
      accountNumber,
      contactName, 
      contactPhone, 
      contactEmail,
      fraudType,
      description,
      location 
    } = req.body;

    // Validation
    if (!contactName || !contactPhone || !fraudType || !description) {
      return res.status(400).json({
        success: false,
        message: 'Contact name, phone, fraud type, and description are required'
      });
    }

    let userId = null;
    let userCardNumber = cardNumber;
    let userAccountNumber = accountNumber;

    // Try to find user if card/account number provided
    if (cardNumber) {
      const user = await User.findOne({ cardNumber });
      if (user) {
        userId = user._id;
        userCardNumber = user.cardNumber;
        userAccountNumber = user.accountNumber;
      }
    } else if (accountNumber) {
      const user = await User.findOne({ accountNumber });
      if (user) {
        userId = user._id;
        userCardNumber = user.cardNumber;
        userAccountNumber = user.accountNumber;
      }
    }

    // Create fraud report
    const emergency = new Emergency({
      emergencyId: generateEmergencyId(),
      userId: userId,
      type: 'Fraud Report',
      priority: 'Critical',
      cardNumber: userCardNumber,
      accountNumber: userAccountNumber,
      contactName,
      contactPhone,
      contactEmail: contactEmail || '',
      description: `Fraud Type: ${fraudType}\n\nDetails: ${description}`,
      location: location || '',
      ipAddress: req.ip,
      actionTaken: 'Fraud report received, investigation initiated'
    });

    await emergency.save();

    // If user found and card exists, block it for security
    if (userId && userCardNumber) {
      const user = await User.findById(userId);
      if (user && user.cardStatus !== 'Blocked') {
        const cardBlock = new CardBlock({
          userId: user._id,
          cardNumber: user.cardNumber,
          reason: 'Fraud Report - Preventive Block',
          isBlocked: true,
          blockedAt: new Date(),
          blockType: 'Fraud Prevention'
        });
        await cardBlock.save();

        user.cardStatus = 'Blocked';
        await user.save();
      }
    }

    res.json({
      success: true,
      message: 'Fraud report submitted successfully. Our team will investigate immediately.',
      emergency: {
        emergencyId: emergency.emergencyId,
        type: emergency.type,
        status: emergency.status,
        priority: emergency.priority,
        contactPhone: emergency.contactPhone
      }
    });

  } catch (error) {
    console.error('Report fraud error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Request Helpline Call
exports.requestHelpline = async (req, res) => {
  try {
    const { 
      contactName, 
      contactPhone, 
      contactEmail,
      issueType,
      description,
      urgency 
    } = req.body;

    // Validation
    if (!contactName || !contactPhone || !issueType || !description) {
      return res.status(400).json({
        success: false,
        message: 'Contact name, phone, issue type, and description are required'
      });
    }

    // Determine priority based on urgency
    let priority = 'Medium';
    if (urgency === 'urgent') priority = 'High';
    if (urgency === 'critical') priority = 'Critical';

    // Create helpline request
    const emergency = new Emergency({
      emergencyId: generateEmergencyId(),
      type: 'Helpline Call',
      priority: priority,
      contactName,
      contactPhone,
      contactEmail: contactEmail || '',
      description: `Issue Type: ${issueType}\n\nDescription: ${description}`,
      ipAddress: req.ip,
      actionTaken: 'Helpline request received, callback scheduled'
    });

    await emergency.save();

    res.json({
      success: true,
      message: 'Helpline request submitted. Our team will call you within 15 minutes.',
      emergency: {
        emergencyId: emergency.emergencyId,
        type: emergency.type,
        status: emergency.status,
        priority: emergency.priority,
        contactPhone: emergency.contactPhone,
        estimatedCallbackTime: '15 minutes'
      }
    });

  } catch (error) {
    console.error('Request helpline error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Get Emergency Status (by emergency ID)
exports.getEmergencyStatus = async (req, res) => {
  try {
    const { emergencyId } = req.params;

    const emergency = await Emergency.findOne({ emergencyId });

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: 'Emergency request not found'
      });
    }

    res.json({
      success: true,
      emergency: {
        emergencyId: emergency.emergencyId,
        type: emergency.type,
        status: emergency.status,
        priority: emergency.priority,
        contactName: emergency.contactName,
        contactPhone: emergency.contactPhone,
        description: emergency.description,
        actionTaken: emergency.actionTaken,
        createdAt: emergency.createdAt,
        resolvedAt: emergency.resolvedAt
      }
    });

  } catch (error) {
    console.error('Get emergency status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Get User Emergency History (Protected)
exports.getUserEmergencies = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;

    const emergencies = await Emergency.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalEmergencies = await Emergency.countDocuments({ userId: req.userId });

    res.json({
      success: true,
      emergencies: emergencies.map(e => ({
        emergencyId: e.emergencyId,
        type: e.type,
        status: e.status,
        priority: e.priority,
        description: e.description,
        actionTaken: e.actionTaken,
        createdAt: e.createdAt,
        resolvedAt: e.resolvedAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalEmergencies / parseInt(limit)),
        totalEmergencies
      }
    });

  } catch (error) {
    console.error('Get user emergencies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Get Helpline Numbers
exports.getHelplineNumbers = async (req, res) => {
  try {
    res.json({
      success: true,
      helplines: {
        emergency: '16247',
        cardBlock: '16247',
        fraudReport: '16247',
        customerService: '09666716247',
        international: '+880-2-16247',
        email: 'emergency@smartatm.com',
        available: '24/7'
      }
    });
  } catch (error) {
    console.error('Get helpline numbers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};
