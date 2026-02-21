const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['General', 'Security', 'Notifications', 'Limits', 'ATM', 'Email'],
    required: true
  },
  key: {
    type: String,
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String
  },
  dataType: {
    type: String,
    enum: ['string', 'number', 'boolean', 'object', 'array'],
    default: 'string'
  },
  isEditable: {
    type: Boolean,
    default: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Compound unique index
systemSettingsSchema.index({ category: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
