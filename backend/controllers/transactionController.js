const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Generate unique transaction ID
const generateTransactionId = () => {
  return 'TXN' + Date.now() + Math.floor(Math.random() * 1000);
};

// Withdraw Money Controller
exports.withdraw = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid amount' 
      });
    }

    // Check balance
    if (user.balance < amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient balance' 
      });
    }

    // Check daily limit (optional - you can implement this)
    // if (amount > user.dailyWithdrawalLimit) {
    //   return res.status(400).json({ 
    //     success: false, 
    //     message: 'Amount exceeds daily withdrawal limit' 
    //   });
    // }

    // Update balance
    user.balance -= amount;
    await user.save();

    // Create transaction record
    const transaction = new Transaction({
      transactionId: generateTransactionId(),
      userId: user._id,
      type: 'Withdraw',
      amount,
      balanceAfter: user.balance,
      status: 'Completed',
      description: `Withdrew ৳${amount}`
    });
    await transaction.save();

    res.json({
      success: true,
      message: 'Withdrawal successful',
      balance: user.balance,
      transaction: {
        id: transaction.transactionId,
        amount,
        type: 'Withdraw',
        balanceAfter: user.balance,
        date: transaction.createdAt
      }
    });

  } catch (error) {
    console.error('Withdraw error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};

// Deposit Money Controller
exports.deposit = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid amount' 
      });
    }

    // Update balance
    user.balance += amount;
    await user.save();

    // Create transaction record
    const transaction = new Transaction({
      transactionId: generateTransactionId(),
      userId: user._id,
      type: 'Deposit',
      amount,
      balanceAfter: user.balance,
      status: 'Completed',
      description: `Deposited ৳${amount}`
    });
    await transaction.save();

    res.json({
      success: true,
      message: 'Deposit successful',
      balance: user.balance,
      transaction: {
        id: transaction.transactionId,
        amount,
        type: 'Deposit',
        balanceAfter: user.balance,
        date: transaction.createdAt
      }
    });

  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};

// Transfer Money Controller
exports.transfer = async (req, res) => {
  try {
    const { toAccountNumber, amount } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Validation
    if (!toAccountNumber || !amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid transfer details' 
      });
    }

    // Check balance
    if (user.balance < amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient balance' 
      });
    }

    // Find recipient
    const recipient = await User.findOne({ accountNumber: toAccountNumber });
    if (!recipient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Recipient account not found' 
      });
    }

    // Check if transferring to self
    if (user.accountNumber === toAccountNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot transfer to your own account' 
      });
    }

    // Perform transfer
    user.balance -= amount;
    recipient.balance += amount;

    await user.save();
    await recipient.save();

    // Create transaction records for both users
    const senderTransaction = new Transaction({
      transactionId: generateTransactionId(),
      userId: user._id,
      type: 'Transfer',
      amount: -amount,
      balanceAfter: user.balance,
      status: 'Completed',
      description: `Transferred ৳${amount} to ${recipient.name}`
    });

    const recipientTransaction = new Transaction({
      transactionId: generateTransactionId(),
      userId: recipient._id,
      type: 'Transfer',
      amount: amount,
      balanceAfter: recipient.balance,
      status: 'Completed',
      description: `Received ৳${amount} from ${user.name}`
    });

    await senderTransaction.save();
    await recipientTransaction.save();

    res.json({
      success: true,
      message: 'Transfer successful',
      balance: user.balance,
      transaction: {
        id: senderTransaction.transactionId,
        amount,
        type: 'Transfer',
        recipient: recipient.name,
        balanceAfter: user.balance,
        date: senderTransaction.createdAt
      }
    });

  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};

// Get Transaction History Controller
exports.getHistory = async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    
    const transactions = await Transaction.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalTransactions = await Transaction.countDocuments({ userId: req.userId });

    res.json({
      success: true,
      transactions: transactions.map(t => ({
        id: t.transactionId,
        type: t.type,
        amount: t.amount,
        status: t.status,
        balanceAfter: t.balanceAfter,
        description: t.description,
        date: t.createdAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalTransactions / parseInt(limit)),
        totalTransactions
      }
    });

  } catch (error) {
    console.error('Transaction history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};

// Get Balance Controller
exports.getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('balance');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      balance: user.balance
    });

  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};
