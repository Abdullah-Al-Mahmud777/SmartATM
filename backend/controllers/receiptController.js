const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Receipt = require('../models/Receipt');

// Generate unique receipt ID
const generateReceiptId = () => {
  return 'RCP' + Date.now() + Math.floor(Math.random() * 1000);
};

// Create Receipt for Transaction
exports.createReceipt = async (req, res) => {
  try {
    const { transactionId } = req.body;
    
    const transaction = await Transaction.findOne({ 
      transactionId,
      userId: req.userId 
    });

    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }

    const user = await User.findById(req.userId).select('name accountNumber cardNumber');

    // Check if receipt already exists
    let receipt = await Receipt.findOne({ transactionId });

    if (receipt) {
      return res.json({
        success: true,
        message: 'Receipt already exists',
        receipt: {
          receiptId: receipt.receiptId,
          transactionId: receipt.transactionId,
          receiptType: receipt.receiptType,
          amount: receipt.amount,
          balanceAfter: receipt.balanceAfter,
          status: receipt.status,
          description: receipt.description,
          date: receipt.createdAt,
          accountHolder: receipt.accountHolder,
          accountNumber: receipt.accountNumber,
          cardNumber: receipt.cardNumber,
          atmLocation: receipt.atmLocation
        }
      });
    }

    // Create new receipt
    receipt = new Receipt({
      receiptId: generateReceiptId(),
      transactionId: transaction.transactionId,
      userId: user._id,
      receiptType: transaction.type,
      amount: Math.abs(transaction.amount),
      accountNumber: user.accountNumber,
      accountHolder: user.name,
      cardNumber: user.cardNumber,
      balanceAfter: transaction.balanceAfter,
      status: transaction.status,
      description: transaction.description
    });

    await receipt.save();

    res.json({
      success: true,
      message: 'Receipt created successfully',
      receipt: {
        receiptId: receipt.receiptId,
        transactionId: receipt.transactionId,
        receiptType: receipt.receiptType,
        amount: receipt.amount,
        balanceAfter: receipt.balanceAfter,
        status: receipt.status,
        description: receipt.description,
        date: receipt.createdAt,
        accountHolder: receipt.accountHolder,
        accountNumber: receipt.accountNumber,
        cardNumber: receipt.cardNumber,
        atmLocation: receipt.atmLocation
      }
    });

  } catch (error) {
    console.error('Create receipt error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};

// Get Single Transaction for Receipt
exports.getTransactionReceipt = async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    const transaction = await Transaction.findOne({ 
      transactionId,
      userId: req.userId 
    });

    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }

    const user = await User.findById(req.userId).select('name accountNumber cardNumber');

    // Try to get existing receipt
    let receipt = await Receipt.findOne({ transactionId });

    if (!receipt) {
      // Auto-create receipt if doesn't exist
      receipt = new Receipt({
        receiptId: generateReceiptId(),
        transactionId: transaction.transactionId,
        userId: user._id,
        receiptType: transaction.type,
        amount: Math.abs(transaction.amount),
        accountNumber: user.accountNumber,
        accountHolder: user.name,
        cardNumber: user.cardNumber,
        balanceAfter: transaction.balanceAfter,
        status: transaction.status,
        description: transaction.description
      });
      await receipt.save();
    }

    res.json({
      success: true,
      receipt: {
        receiptId: receipt.receiptId,
        transactionId: receipt.transactionId,
        type: receipt.receiptType,
        amount: receipt.amount,
        balanceAfter: receipt.balanceAfter,
        status: receipt.status,
        description: receipt.description,
        date: receipt.createdAt,
        accountHolder: receipt.accountHolder,
        accountNumber: receipt.accountNumber,
        cardNumber: receipt.cardNumber,
        atmLocation: receipt.atmLocation
      }
    });

  } catch (error) {
    console.error('Get receipt error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};

// Get Recent Transactions for Receipt Page
exports.getRecentTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(10);

    const user = await User.findById(req.userId).select('cardNumber');

    res.json({
      success: true,
      transactions: transactions.map(t => ({
        id: t.transactionId,
        type: t.type,
        amount: Math.abs(t.amount),
        date: new Date(t.createdAt).toLocaleDateString(),
        time: new Date(t.createdAt).toLocaleTimeString(),
        status: t.status,
        cardNumber: user.cardNumber.slice(-4)
      }))
    });

  } catch (error) {
    console.error('Get recent transactions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};

// Get All Receipts for User
exports.getAllReceipts = async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    
    const receipts = await Receipt.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalReceipts = await Receipt.countDocuments({ userId: req.userId });

    res.json({
      success: true,
      receipts: receipts.map(r => ({
        receiptId: r.receiptId,
        transactionId: r.transactionId,
        type: r.receiptType,
        amount: r.amount,
        status: r.status,
        date: r.createdAt,
        atmLocation: r.atmLocation
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReceipts / parseInt(limit)),
        totalReceipts
      }
    });

  } catch (error) {
    console.error('Get all receipts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};

// Mark Receipt as PDF Generated
exports.markPdfGenerated = async (req, res) => {
  try {
    const { receiptId } = req.params;
    
    const receipt = await Receipt.findOne({ 
      receiptId,
      userId: req.userId 
    });

    if (!receipt) {
      return res.status(404).json({ 
        success: false, 
        message: 'Receipt not found' 
      });
    }

    receipt.pdfGenerated = true;
    await receipt.save();

    res.json({
      success: true,
      message: 'Receipt marked as PDF generated'
    });

  } catch (error) {
    console.error('Mark PDF generated error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};
