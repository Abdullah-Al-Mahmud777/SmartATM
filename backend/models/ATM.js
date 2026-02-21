const mongoose = require('mongoose');

const atmSchema = new mongoose.Schema({
  atmId: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  address: {
    type: String
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  status: {
    type: String,
    enum: ['Online', 'Offline', 'Maintenance', 'Low Cash'],
    default: 'Online'
  },
  cashAvailable: {
    type: Number,
    default: 0
  },
  cashCapacity: {
    type: Number,
    default: 1000000 // 10 lakh default capacity
  },
  lastRefillDate: {
    type: Date
  },
  lastServiceDate: {
    type: Date
  },
  nextServiceDate: {
    type: Date
  },
  todayTransactions: {
    type: Number,
    default: 0
  },
  totalTransactions: {
    type: Number,
    default: 0
  },
  lastOnlineTime: {
    type: Date,
    default: Date.now
  },
  errorLogs: [{
    type: {
      type: String
    },
    message: String,
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    resolved: {
      type: Boolean,
      default: false
    }
  }],
  maintenanceHistory: [{
    date: Date,
    type: String,
    technician: String,
    notes: String
  }]
}, {
  timestamps: true
});

// Calculate capacity percentage
atmSchema.virtual('capacityPercentage').get(function() {
  return Math.round((this.cashAvailable / this.cashCapacity) * 100);
});

// Check if cash is low
atmSchema.virtual('isLowCash').get(function() {
  return this.capacityPercentage < 20;
});

// Indexes
atmSchema.index({ atmId: 1 }, { unique: true });
atmSchema.index({ status: 1 });
atmSchema.index({ location: 1 });

module.exports = mongoose.model('ATM', atmSchema);
