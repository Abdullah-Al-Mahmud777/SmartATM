const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
  emergencyId: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Can be null for anonymous reports
  },
  type: {
    type: String,
    enum: ['Card Block', 'Fraud Report', 'Helpline Call', 'Lost Card', 'Stolen Card', 'Suspicious Activity', 'Other'],
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Closed'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'High'
  },
  cardNumber: {
    type: String,
    required: false
  },
  accountNumber: {
    type: String,
    required: false
  },
  contactName: {
    type: String,
    required: true
  },
  contactPhone: {
    type: String,
    required: true
  },
  contactEmail: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: ''
  },
  ipAddress: {
    type: String
  },
  deviceInfo: {
    type: String
  },
  actionTaken: {
    type: String,
    default: ''
  },
  resolvedAt: {
    type: Date
  },
  resolvedBy: {
    type: String
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
emergencySchema.index({ userId: 1, createdAt: -1 });
emergencySchema.index({ emergencyId: 1 }, { unique: true });
emergencySchema.index({ type: 1, status: 1 });
emergencySchema.index({ cardNumber: 1 });
emergencySchema.index({ status: 1, priority: 1 });

module.exports = mongoose.model('Emergency', emergencySchema);
