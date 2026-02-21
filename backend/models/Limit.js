const mongoose = require('mongoose');

const limitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dailyWithdrawalLimit: {
    type: Number,
    default: 50000
  },
  monthlyWithdrawalLimit: {
    type: Number,
    default: 500000
  },
  dailyTransferLimit: {
    type: Number,
    default: 100000
  },
  monthlyTransferLimit: {
    type: Number,
    default: 1000000
  },
  dailyWithdrawn: {
    type: Number,
    default: 0
  },
  monthlyWithdrawn: {
    type: Number,
    default: 0
  },
  dailyTransferred: {
    type: Number,
    default: 0
  },
  monthlyTransferred: {
    type: Number,
    default: 0
  },
  lastResetDate: {
    type: Date,
    default: Date.now
  },
  lastMonthResetDate: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Reset daily limits if a new day
limitSchema.methods.checkAndResetDaily = function() {
  const now = new Date();
  const lastReset = new Date(this.lastResetDate);
  
  if (now.getDate() !== lastReset.getDate() || 
      now.getMonth() !== lastReset.getMonth() || 
      now.getFullYear() !== lastReset.getFullYear()) {
    this.dailyWithdrawn = 0;
    this.dailyTransferred = 0;
    this.lastResetDate = now;
  }
};

// Reset monthly limits if a new month
limitSchema.methods.checkAndResetMonthly = function() {
  const now = new Date();
  const lastReset = new Date(this.lastMonthResetDate);
  
  if (now.getMonth() !== lastReset.getMonth() || 
      now.getFullYear() !== lastReset.getFullYear()) {
    this.monthlyWithdrawn = 0;
    this.monthlyTransferred = 0;
    this.lastMonthResetDate = now;
  }
};

module.exports = mongoose.model('Limit', limitSchema);
