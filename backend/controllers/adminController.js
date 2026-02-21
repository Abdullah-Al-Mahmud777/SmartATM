const Admin = require('../models/Admin');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Emergency = require('../models/Emergency');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (adminId) => {
  return jwt.sign({ adminId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// Admin Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Find admin
    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (admin.isLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Account is locked due to too many failed login attempts. Try again later.'
      });
    }

    // Check if account is active
    if (admin.status !== 'Active') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active. Contact super admin.'
      });
    }

    // Verify password
    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      // Increment login attempts
      await admin.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Reset login attempts on successful login
    await admin.resetLoginAttempts();

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = generateToken(admin._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Admin Logout
exports.logout = async (req, res) => {
  try {
    // In a JWT-based system, logout is handled client-side by removing the token
    // But we can log the logout event here if needed
    
    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Get Admin Profile
exports.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId).select('-password');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions,
        status: admin.status,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt
      }
    });

  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Get Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Total users
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'Active' });
    const blockedUsers = await User.countDocuments({ status: 'Blocked' });

    // Total transactions
    const totalTransactions = await Transaction.countDocuments();
    const completedTransactions = await Transaction.countDocuments({ status: 'Completed' });
    
    // Transaction amounts
    const transactionStats = await Transaction.aggregate([
      { $match: { status: 'Completed' } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' }
        }
      }
    ]);

    // Recent transactions
    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name accountNumber');

    // Emergency requests
    const totalEmergencies = await Emergency.countDocuments();
    const pendingEmergencies = await Emergency.countDocuments({ status: 'Pending' });
    const criticalEmergencies = await Emergency.countDocuments({ priority: 'Critical', status: { $ne: 'Resolved' } });

    // Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayUsers = await User.countDocuments({ createdAt: { $gte: today } });
    const todayTransactions = await Transaction.countDocuments({ createdAt: { $gte: today } });
    const todayEmergencies = await Emergency.countDocuments({ createdAt: { $gte: today } });

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          blocked: blockedUsers,
          today: todayUsers
        },
        transactions: {
          total: totalTransactions,
          completed: completedTransactions,
          today: todayTransactions,
          totalAmount: transactionStats[0]?.totalAmount || 0,
          avgAmount: transactionStats[0]?.avgAmount || 0
        },
        emergencies: {
          total: totalEmergencies,
          pending: pendingEmergencies,
          critical: criticalEmergencies,
          today: todayEmergencies
        },
        recentTransactions: recentTransactions.map(t => ({
          id: t.transactionId,
          type: t.type,
          amount: t.amount,
          user: t.userId?.name || 'Unknown',
          accountNumber: t.userId?.accountNumber || 'N/A',
          status: t.status,
          date: t.createdAt
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

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    let query = {};
    
    if (status) {
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

// Get All Transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;

    let query = {};
    
    if (type) query.type = type;
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .populate('userId', 'name accountNumber')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalTransactions = await Transaction.countDocuments(query);

    res.json({
      success: true,
      transactions: transactions.map(t => ({
        id: t.transactionId,
        type: t.type,
        amount: t.amount,
        status: t.status,
        balanceAfter: t.balanceAfter,
        description: t.description,
        user: t.userId?.name || 'Unknown',
        accountNumber: t.userId?.accountNumber || 'N/A',
        date: t.createdAt
      })),
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

// Get All Emergencies
exports.getAllEmergencies = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, priority } = req.query;

    let query = {};
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const emergencies = await Emergency.find(query)
      .populate('userId', 'name accountNumber')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalEmergencies = await Emergency.countDocuments(query);

    res.json({
      success: true,
      emergencies: emergencies.map(e => ({
        emergencyId: e.emergencyId,
        type: e.type,
        status: e.status,
        priority: e.priority,
        contactName: e.contactName,
        contactPhone: e.contactPhone,
        description: e.description,
        actionTaken: e.actionTaken,
        user: e.userId?.name || 'Anonymous',
        accountNumber: e.userId?.accountNumber || 'N/A',
        date: e.createdAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalEmergencies / parseInt(limit)),
        totalEmergencies
      }
    });

  } catch (error) {
    console.error('Get all emergencies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// Freeze/Unfreeze User Account
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

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { username, email, password, name, role } = req.body;

    // Check if requesting admin is Super Admin
    const requestingAdmin = await Admin.findById(req.adminId);
    if (requestingAdmin.role !== 'Super Admin') {
      return res.status(403).json({
        success: false,
        message: 'Only Super Admin can create new admins'
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ $or: [{ username }, { email }] });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this username or email already exists'
      });
    }

    // Create new admin
    const admin = new Admin({
      username,
      email,
      password,
      name,
      role: role || 'Admin'
    });

    await admin.save();

    res.json({
      success: true,
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};
