const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['daily', 'hourly', 'weekly', 'monthly'],
    required: true
  },
  // Transaction statistics
  transactions: {
    total: { type: Number, default: 0 },
    withdrawals: { type: Number, default: 0 },
    deposits: { type: Number, default: 0 },
    transfers: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    failed: { type: Number, default: 0 }
  },
  // Amount statistics
  amounts: {
    totalAmount: { type: Number, default: 0 },
    withdrawalAmount: { type: Number, default: 0 },
    depositAmount: { type: Number, default: 0 },
    transferAmount: { type: Number, default: 0 },
    averageAmount: { type: Number, default: 0 }
  },
  // User statistics
  users: {
    totalActive: { type: Number, default: 0 },
    newRegistrations: { type: Number, default: 0 },
    uniqueUsers: { type: Number, default: 0 }
  },
  // ATM statistics
  atms: {
    totalOnline: { type: Number, default: 0 },
    totalOffline: { type: Number, default: 0 },
    totalMaintenance: { type: Number, default: 0 },
    lowCashAlerts: { type: Number, default: 0 }
  },
  // Peak hours data (for hourly analytics)
  hourlyData: [{
    hour: Number,
    transactions: Number,
    amount: Number
  }],
  // Top users (for daily/weekly analytics)
  topUsers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    transactionCount: Number,
    totalAmount: Number
  }],
  // Error statistics
  errorStats: {
    total: { type: Number, default: 0 },
    critical: { type: Number, default: 0 },
    high: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    low: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes
analyticsSchema.index({ date: 1, type: 1 });
analyticsSchema.index({ type: 1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
