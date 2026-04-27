const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { sendOtpEmail } = require('../config/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Generate 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

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
      { expiresIn: '3650d' }
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
      { expiresIn: '3650d' }
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

// Step 1: Send OTP to email
exports.forgotPin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    if (user.status !== 'Active') {
      return res.status(403).json({ success: false, message: `Account is ${user.status}. Please contact support.` });
    }

    // Generate OTP
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to user (hashed)
    user.resetOtp = await bcrypt.hash(otp, 10);
    user.resetOtpExpiry = otpExpiry;
    await user.save();

    // Send email
    const emailSent = await sendOtpEmail(user.email, otp, user.name);

    if (!emailSent) {
      return res.status(500).json({ success: false, message: 'Failed to send OTP email. Please try again.' });
    }

    res.json({
      success: true,
      message: `OTP sent to ${user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}`,
      email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    });

  } catch (error) {
    console.error('Forgot PIN error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// Step 2: Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || !user.resetOtp || !user.resetOtpExpiry) {
      return res.status(400).json({ success: false, message: 'OTP not found. Please request a new one.' });
    }

    // Check expiry
    if (new Date() > user.resetOtpExpiry) {
      user.resetOtp = null;
      user.resetOtpExpiry = null;
      await user.save();
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Verify OTP
    const isValidOtp = await bcrypt.compare(otp, user.resetOtp);
    if (!isValidOtp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }

    // Generate a short-lived reset token
    const resetToken = jwt.sign(
      { userId: user._id, purpose: 'pin_reset' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({
      success: true,
      message: 'OTP verified successfully',
      resetToken
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// Step 3: Reset PIN with token
exports.resetPin = async (req, res) => {
  try {
    const { resetToken, newPin, confirmPin } = req.body;

    if (!resetToken || !newPin || !confirmPin) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      return res.status(400).json({ success: false, message: 'PIN must be exactly 4 digits' });
    }

    if (newPin !== confirmPin) {
      return res.status(400).json({ success: false, message: 'PINs do not match' });
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Reset session expired. Please start over.' });
    }

    if (decoded.purpose !== 'pin_reset') {
      return res.status(400).json({ success: false, message: 'Invalid reset token.' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Update PIN
    user.pin = newPin; // pre-save hook will hash it
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    res.json({ success: true, message: 'PIN reset successfully! You can now login with your new PIN.' });

  } catch (error) {
    console.error('Reset PIN error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};
