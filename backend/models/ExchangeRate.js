const mongoose = require('mongoose');

const exchangeRateSchema = new mongoose.Schema({
  baseCurrency: {
    type: String,
    required: true,
    default: 'BDT'
  },
  rates: {
    USD: { type: Number, default: 0.0092 },  // 1 BDT = 0.0092 USD
    EUR: { type: Number, default: 0.0085 },  // 1 BDT = 0.0085 EUR
    GBP: { type: Number, default: 0.0073 },  // 1 BDT = 0.0073 GBP
    INR: { type: Number, default: 0.77 },    // 1 BDT = 0.77 INR
    JPY: { type: Number, default: 1.35 },    // 1 BDT = 1.35 JPY
    CNY: { type: Number, default: 0.067 },   // 1 BDT = 0.067 CNY
    AUD: { type: Number, default: 0.014 },   // 1 BDT = 0.014 AUD
    CAD: { type: Number, default: 0.013 },   // 1 BDT = 0.013 CAD
    SAR: { type: Number, default: 0.035 },   // 1 BDT = 0.035 SAR
    AED: { type: Number, default: 0.034 }    // 1 BDT = 0.034 AED
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ExchangeRate', exchangeRateSchema);
