const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// User Login Controller
exports.login = async (req, res) => {
  try {
    const { cardNumber, pin } = req.body;

    // Validation
    if (!cardNumber || !pin) {
      return res.status(400).json({ 
        success: false, 
        message: 'Card number and PIN are required' 
      });
    }

    // Find user by card number
    const user = await User.findOne({ cardNumber });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid card number or PIN' 
      });
    }

    // Check if account is active
    if (user.status !== 'Active') {
      return res.status(403).json({ 
        success: false, 
        message: `Account is ${user.status}. Please contact support.` 
      });
    }

    // Check if card is active
    if (user.cardStatus !== 'Active') {
      return res.status(403).json({ 
        success: false, 
        message: 'Card is blocked. Please contact support.' 
      });
    }

    // Verify PIN
    const isValidPin = await user.comparePin(pin);
    if (!isValidPin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid card number or PIN' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, cardNumber: user.cardNumber },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data (without PIN)
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        cardNumber: user.cardNumber,
        accountNumber: user.accountNumber,
        balance: user.balance,
        email: user.email,
        phone: user.phone,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};

// User Registration Controller
exports.register = async (req, res) => {
  try {
    const { cardNumber, pin, name, email, phone, accountNumber } = req.body;

    // Validation
    if (!cardNumber || !pin || !name || !email || !phone || !accountNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // PIN validation
    if (pin.length !== 4) {
      return res.status(400).json({ 
        success: false, 
        message: 'PIN must be 4 digits' 
      });
    }

    // Card number validation
    if (cardNumber.length !== 16) {
      return res.status(400).json({ 
        success: false, 
        message: 'Card number must be 16 digits' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ cardNumber }, { email }, { accountNumber }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this card number, email, or account number already exists' 
      });
    }

    // Create new user
    const user = new User({
      cardNumber,
      pin,
      name,
      email,
      phone,
      accountNumber,
      balance: 10000 // Initial balance
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, cardNumber: user.cardNumber },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        cardNumber: user.cardNumber,
        accountNumber: user.accountNumber,
        balance: user.balance,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};

// Get User Profile Controller
exports.getProfile = async (req, res) => {
  try {
    // req.userId comes from auth middleware
    const user = await User.findById(req.userId).select('-pin');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        cardNumber: user.cardNumber,
        accountNumber: user.accountNumber,
        balance: user.balance,
        email: user.email,
        phone: user.phone,
        status: user.status,
        cardStatus: user.cardStatus,
        dailyWithdrawalLimit: user.dailyWithdrawalLimit,
        monthlyWithdrawalLimit: user.monthlyWithdrawalLimit
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};

// Update User Profile Controller
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};

// Change PIN Controller
exports.changePin = async (req, res) => {
  try {
    const { oldPin, newPin } = req.body;

    if (!oldPin || !newPin) {
      return res.status(400).json({ 
        success: false, 
        message: 'Old PIN and new PIN are required' 
      });
    }

    if (newPin.length !== 4) {
      return res.status(400).json({ 
        success: false, 
        message: 'New PIN must be 4 digits' 
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Verify old PIN
    const isValidPin = await user.comparePin(oldPin);
    if (!isValidPin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid old PIN' 
      });
    }

    // Update PIN
    user.pin = newPin;
    await user.save();

    res.json({
      success: true,
      message: 'PIN changed successfully'
    });

  } catch (error) {
    console.error('Change PIN error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};
