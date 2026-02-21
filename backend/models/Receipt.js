const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  receiptId: {
    type: String,
    required: true,
    unique: true
  },
  transactionId: {
    type: String,
    required: true,
    ref: 'Transaction'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiptType: {
    type: String,
    enum: ['Withdraw', 'Deposit', 'Transfer', 'Payment'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  accountNumber: {
    type: String,
    required: true
  },
  accountHolder: {
    type: String,
    required: true
  },
  cardNumber: {
    type: String,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Completed', 'Pending', 'Failed'],
    default: 'Completed'
  },
  description: {
    type: String
  },
  atmLocation: {
    type: String,
    default: 'SmartATM - Main Branch'
  },
  receiptGenerated: {
    type: Boolean,
    default: true
  },
  pdfGenerated: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries (userId and createdAt composite index)
receiptSchema.index({ userId: 1, createdAt: -1 });
receiptSchema.index({ transactionId: 1 });
// Note: receiptId already has unique index from schema definition

module.exports = mongoose.model('Receipt', receiptSchema);
