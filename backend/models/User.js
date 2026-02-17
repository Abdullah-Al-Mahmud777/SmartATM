const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  cardNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  pin: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Frozen', 'Blocked'],
    default: 'Active'
  },
  cardStatus: {
    type: String,
    enum: ['Active', 'Blocked'],
    default: 'Active'
  },
  dailyWithdrawalLimit: {
    type: Number,
    default: 50000
  },
  monthlyWithdrawalLimit: {
    type: Number,
    default: 500000
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash PIN before saving (Modern Mongoose - no need for next() with async)
userSchema.pre('save', async function() {
  if (!this.isModified('pin')) return;
  this.pin = await bcrypt.hash(this.pin, 10);
});

// Compare PIN method
userSchema.methods.comparePin = async function(candidatePin) {
  return await bcrypt.compare(candidatePin, this.pin);
};

module.exports = mongoose.model('User', userSchema);
