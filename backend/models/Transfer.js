const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  transferId: {
    type: String,
    required: true,
    unique: true
  },
  transactionId: {
    type: String,
    required: true
  },
  senderUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderAccountNumber: {
    type: String,
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  recipientUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientAccountNumber: {
    type: String,
    required: true
  },
  recipientName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  transferType: {
    type: String,
    enum: ['Internal', 'External', 'Instant'],
    default: 'Internal'
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Completed', 'Failed', 'Cancelled'],
    default: 'Completed'
  },
  senderBalanceBefore: {
    type: Number,
    required: true
  },
  senderBalanceAfter: {
    type: Number,
    required: true
  },
  recipientBalanceBefore: {
    type: Number,
    required: true
  },
  recipientBalanceAfter: {
    type: Number,
    required: true
  },
  fee: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  reference: {
    type: String,
    default: ''
  },
  failureReason: {
    type: String
  },
  ipAddress: {
    type: String
  },
  deviceInfo: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for faster queries (composite indexes)
transferSchema.index({ senderUserId: 1, createdAt: -1 });
transferSchema.index({ recipientUserId: 1, createdAt: -1 });
transferSchema.index({ transactionId: 1 });
transferSchema.index({ status: 1 });
// Note: transferId already has unique index from schema definition

// Virtual for total amount including fee
transferSchema.virtual('totalAmount').get(function() {
  return this.amount + this.fee;
});

module.exports = mongoose.model('Transfer', transferSchema);
