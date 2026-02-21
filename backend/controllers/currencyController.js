const ExchangeRate = require('../models/ExchangeRate');

// Get Exchange Rates
exports.getExchangeRates = async (req, res) => {
  try {
    let exchangeRate = await ExchangeRate.findOne();

    // Create default rates if not exists
    if (!exchangeRate) {
      exchangeRate = new ExchangeRate();
      await exchangeRate.save();
    }

    res.json({
      success: true,
      baseCurrency: exchangeRate.baseCurrency,
      rates: exchangeRate.rates,
      lastUpdated: exchangeRate.lastUpdated
    });

  } catch (error) {
    console.error('Get exchange rates error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};

// Convert Currency
exports.convertCurrency = async (req, res) => {
  try {
    const { amount, fromCurrency, toCurrency } = req.body;

    if (!amount || !fromCurrency || !toCurrency) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount, from currency, and to currency are required' 
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount must be greater than 0' 
      });
    }

    let exchangeRate = await ExchangeRate.findOne();

    if (!exchangeRate) {
      exchangeRate = new ExchangeRate();
      await exchangeRate.save();
    }

    let convertedAmount;

    // Convert from BDT to other currency
    if (fromCurrency === 'BDT') {
      if (!exchangeRate.rates[toCurrency]) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid target currency' 
        });
      }
      convertedAmount = amount * exchangeRate.rates[toCurrency];
    }
    // Convert from other currency to BDT
    else if (toCurrency === 'BDT') {
      if (!exchangeRate.rates[fromCurrency]) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid source currency' 
        });
      }
      convertedAmount = amount / exchangeRate.rates[fromCurrency];
    }
    // Convert between two non-BDT currencies
    else {
      if (!exchangeRate.rates[fromCurrency] || !exchangeRate.rates[toCurrency]) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid currency' 
        });
      }
      // Convert to BDT first, then to target currency
      const bdtAmount = amount / exchangeRate.rates[fromCurrency];
      convertedAmount = bdtAmount * exchangeRate.rates[toCurrency];
    }

    res.json({
      success: true,
      conversion: {
        amount,
        fromCurrency,
        toCurrency,
        convertedAmount: parseFloat(convertedAmount.toFixed(2)),
        rate: fromCurrency === 'BDT' 
          ? exchangeRate.rates[toCurrency] 
          : (1 / exchangeRate.rates[fromCurrency]),
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Convert currency error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};

// Update Exchange Rates (Admin only)
exports.updateExchangeRates = async (req, res) => {
  try {
    const { rates } = req.body;

    if (!rates) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rates are required' 
      });
    }

    let exchangeRate = await ExchangeRate.findOne();

    if (!exchangeRate) {
      exchangeRate = new ExchangeRate();
    }

    // Update rates
    exchangeRate.rates = { ...exchangeRate.rates, ...rates };
    exchangeRate.lastUpdated = Date.now();
    await exchangeRate.save();

    res.json({
      success: true,
      message: 'Exchange rates updated successfully',
      rates: exchangeRate.rates,
      lastUpdated: exchangeRate.lastUpdated
    });

  } catch (error) {
    console.error('Update exchange rates error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};

// Get Supported Currencies
exports.getSupportedCurrencies = async (req, res) => {
  try {
    const currencies = [
      { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'GBP', name: 'British Pound', symbol: '£' },
      { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
      { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
      { code: 'SAR', name: 'Saudi Riyal', symbol: 'SR' },
      { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' }
    ];

    res.json({
      success: true,
      currencies
    });

  } catch (error) {
    console.error('Get currencies error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};
