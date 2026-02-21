const mongoose = require('mongoose');

const cardBlockSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cardNumber: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  reportType: {
    type: String,
    enum: ['Lost', 'Stolen', 'Damaged', 'Suspicious', 'User Request', null],
    default: null
  },
  blockedBy: {
    type: String,
    enum: ['User', 'Admin', 'System'],
    default: 'User'
  },
  status: {
    type: String,
    enum: ['Blocked', 'Unblocked'],
    default: 'Blocked'
  },
  blockedAt: {
    type: Date,
    default: Date.now
  },
  unblockedAt: {
    type: Date
  },
  unblockedBy: {
    type: String
  }
});

module.exports = mongoose.model('CardBlock', cardBlockSchema);
