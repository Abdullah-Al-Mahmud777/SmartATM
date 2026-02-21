const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Transfer = require('../models/Transfer');
const Receipt = require('../models/Receipt');

// Generate unique IDs
const generateTransferId = () => {
  return 'TRF' + Date.now() + Math.floor(Math.random() * 1000);
};

const generateTransactionId = () => {
  return 'TXN' + Date.now() + Math.floor(Math.random() * 1000);
};

const generateReceiptId = () => {
  return 'RCP' + Date.now() + Math.floor(Math.random() * 1000);
};

// Transfer Money Controller
exports.transferMoney = async (req, res) => {
  try {
    const { toAccountNumber, amount, description, reference } = req.body;
    const sender = await User.findById(req.userId);

    if (!sender) {
      return res.status(404).json({ 
        success: false, 
        message: 'Sender account not found' 
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
    if (sender.balance < amount) {
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
    if (sender.accountNumber === toAccountNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot transfer to your own account' 
      });
    }

    // Check if recipient account is active
    if (recipient.status !== 'Active') {
      return res.status(400).json({ 
        success: false, 
        message: 'Recipient account is not active' 
      });
    }

    // Store balances before transfer
    const senderBalanceBefore = sender.balance;
    const recipientBalanceBefore = recipient.balance;

    // Perform transfer
    sender.balance -= amount;
    recipient.balance += amount;

    await sender.save();
    await recipient.save();

    // Create transfer record
    const transferId = generateTransferId();
    const transactionId = generateTransactionId();

    const transfer = new Transfer({
      transferId,
      transactionId,
      senderUserId: sender._id,
      senderAccountNumber: sender.accountNumber,
      senderName: sender.name,
      recipientUserId: recipient._id,
      recipientAccountNumber: recipient.accountNumber,
      recipientName: recipient.name,
      amount,
      transferType: 'Internal',
      status: 'Completed',
      senderBalanceBefore,
      senderBalanceAfter: sender.balance,
      recipientBalanceBefore,
      recipientBalanceAfter: recipient.balance,
      description: description || `Transfer to ${recipient.name}`,
      reference: reference || '',
      completedAt: new Date()
    });

    await transfer.save();

    // Create transaction records for both users
    const senderTransaction = new Transaction({
      transactionId: generateTransactionId(),
      userId: sender._id,
      type: 'Transfer',
      amount: -amount,
      balanceAfter: sender.balance,
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
      description: `Received ৳${amount} from ${sender.name}`
    });

    await senderTransaction.save();
    await recipientTransaction.save();

    // Create receipt for sender
    const receipt = new Receipt({
      receiptId: generateReceiptId(),
      transactionId: senderTransaction.transactionId,
      userId: sender._id,
      receiptType: 'Transfer',
      amount: amount,
      accountNumber: sender.accountNumber,
      accountHolder: sender.name,
      cardNumber: sender.cardNumber,
      balanceAfter: sender.balance,
      status: 'Completed',
      description: `Transfer to ${recipient.name} (${recipient.accountNumber})`
    });

    await receipt.save();

    res.json({
      success: true,
      message: 'Transfer successful',
      transfer: {
        transferId: transfer.transferId,
        transactionId: senderTransaction.transactionId,
        amount,
        recipient: recipient.name,
        recipientAccount: recipient.accountNumber,
        senderBalance: sender.balance,
        date: transfer.createdAt,
        receiptId: receipt.receiptId
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

// Get Transfer History
exports.getTransferHistory = async (req, res) => {
  try {
    const { limit = 20, page = 1, type = 'all' } = req.query;
    
    let query = {};
    
    if (type === 'sent') {
      query.senderUserId = req.userId;
    } else if (type === 'received') {
      query.recipientUserId = req.userId;
    } else {
      query = {
        $or: [
          { senderUserId: req.userId },
          { recipientUserId: req.userId }
        ]
      };
    }

    const transfers = await Transfer.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalTransfers = await Transfer.countDocuments(query);

    res.json({
      success: true,
      transfers: transfers.map(t => ({
        transferId: t.transferId,
        transactionId: t.transactionId,
        type: t.senderUserId.toString() === req.userId.toString() ? 'Sent' : 'Received',
        amount: t.amount,
        sender: t.senderName,
        senderAccount: t.senderAccountNumber,
        recipient: t.recipientName,
        recipientAccount: t.recipientAccountNumber,
        status: t.status,
        description: t.description,
        date: t.createdAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalTransfers / parseInt(limit)),
        totalTransfers
      }
    });

  } catch (error) {
    console.error('Get transfer history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};

// Get Single Transfer Details
exports.getTransferDetails = async (req, res) => {
  try {
    const { transferId } = req.params;
    
    const transfer = await Transfer.findOne({ 
      transferId,
      $or: [
        { senderUserId: req.userId },
        { recipientUserId: req.userId }
      ]
    });

    if (!transfer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transfer not found' 
      });
    }

    res.json({
      success: true,
      transfer: {
        transferId: transfer.transferId,
        transactionId: transfer.transactionId,
        type: transfer.senderUserId.toString() === req.userId.toString() ? 'Sent' : 'Received',
        amount: transfer.amount,
        fee: transfer.fee,
        totalAmount: transfer.amount + transfer.fee,
        sender: {
          name: transfer.senderName,
          account: transfer.senderAccountNumber,
          balanceBefore: transfer.senderBalanceBefore,
          balanceAfter: transfer.senderBalanceAfter
        },
        recipient: {
          name: transfer.recipientName,
          account: transfer.recipientAccountNumber,
          balanceBefore: transfer.recipientBalanceBefore,
          balanceAfter: transfer.recipientBalanceAfter
        },
        status: transfer.status,
        description: transfer.description,
        reference: transfer.reference,
        transferType: transfer.transferType,
        createdAt: transfer.createdAt,
        completedAt: transfer.completedAt
      }
    });

  } catch (error) {
    console.error('Get transfer details error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};

// Verify Account Before Transfer
exports.verifyAccount = async (req, res) => {
  try {
    const { accountNumber } = req.body;

    if (!accountNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Account number is required' 
      });
    }

    const user = await User.findOne({ accountNumber }).select('name accountNumber status');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Account not found' 
      });
    }

    if (user.status !== 'Active') {
      return res.status(400).json({ 
        success: false, 
        message: 'Account is not active' 
      });
    }

    res.json({
      success: true,
      account: {
        name: user.name,
        accountNumber: user.accountNumber,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Verify account error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};

// Get Transfer Statistics
exports.getTransferStats = async (req, res) => {
  try {
    const sentTransfers = await Transfer.find({ senderUserId: req.userId, status: 'Completed' });
    const receivedTransfers = await Transfer.find({ recipientUserId: req.userId, status: 'Completed' });

    const totalSent = sentTransfers.reduce((sum, t) => sum + t.amount, 0);
    const totalReceived = receivedTransfers.reduce((sum, t) => sum + t.amount, 0);

    res.json({
      success: true,
      stats: {
        totalSent,
        totalReceived,
        sentCount: sentTransfers.length,
        receivedCount: receivedTransfers.length,
        netTransfer: totalReceived - totalSent
      }
    });

  } catch (error) {
    console.error('Get transfer stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};
