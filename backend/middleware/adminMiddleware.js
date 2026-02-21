const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Verify Admin Token
exports.verifyAdminToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if admin exists and is active
    const admin = await Admin.findById(decoded.adminId);
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Admin not found.'
      });
    }

    if (admin.status !== 'Active') {
      return res.status(403).json({
        success: false,
        message: 'Admin account is not active.'
      });
    }

    req.adminId = decoded.adminId;
    req.admin = admin;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

// Check if Super Admin
exports.isSuperAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.adminId);

    if (!admin || admin.role !== 'Super Admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super Admin privileges required.'
      });
    }

    next();

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during authorization.'
    });
  }
};

// Check Permission
exports.checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const admin = await Admin.findById(req.adminId);

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Admin not found.'
        });
      }

      // Super Admin has all permissions
      if (admin.role === 'Super Admin') {
        return next();
      }

      // Check if admin has the required permission
      if (!admin.permissions.includes(permission)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. ${permission} permission required.`
        });
      }

      next();

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error during permission check.'
      });
    }
  };
};
