import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Account } from '../../models/account.model';
import { Notification } from '../../models/notification.model';
import { Transaction } from '../../models/transaction.model';
import { User } from '../../models/user.model';
import { findOwnedAccount } from '../../utils/accountAccess';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { serializeAccount, serializeTransaction } from '../../utils/serializers';

interface MonthlySummary {
  _id: 'credit' | 'debit';
  totalPaisa: number;
}

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const requestedAccountId = (req.query as { accountId?: string }).accountId;

  const accounts = await Account.find({ userId })
    .sort({ isPrimary: -1, createdAt: 1 })
    .exec();

  let selectedAccount = accounts.find((account) => account.isPrimary) ?? accounts[0];
  if (requestedAccountId) {
    selectedAccount =
      accounts.find((account) => account._id.toString() === requestedAccountId) ??
      (await findOwnedAccount(userId, requestedAccountId));
  }

  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const [summaryRows, unreadNotifications, user, recentTransactions] = await Promise.all([
    Transaction.aggregate<MonthlySummary>([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          status: { $ne: 'cancelled' },
          createdAt: { $gte: monthStart },
        },
      },
      {
        $group: {
          _id: '$direction',
          totalPaisa: { $sum: '$amountPaisa' },
        },
      },
    ]),
    Notification.countDocuments({ userId, isRead: false }),
    User.findById(userId).select('lastLoginAt lowBalanceThresholdPaisa').lean(),
    selectedAccount
      ? Transaction.find({
          userId,
          accountId: selectedAccount._id,
        })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean()
          .exec()
      : Promise.resolve([]),
  ]);

  const inflow = summaryRows.find((row) => row._id === 'credit')?.totalPaisa ?? 0;
  const outflow = summaryRows.find((row) => row._id === 'debit')?.totalPaisa ?? 0;
  const totalBalancePaisa = accounts.reduce(
    (sum, account) => sum + account.balancePaisa,
    0
  );

  sendSuccess(res, {
    accounts: accounts.map(serializeAccount),
    selectedAccount: selectedAccount ? serializeAccount(selectedAccount) : null,
    summary: {
      totalBalancePaisa,
      accountCount: accounts.length,
      monthlyInflowPaisa: inflow,
      monthlyOutflowPaisa: outflow,
      unreadNotifications,
      lastLoginAt: user?.lastLoginAt ?? null,
      lowBalanceThresholdPaisa: user?.lowBalanceThresholdPaisa ?? 0,
    },
    recentTransactions: recentTransactions.map(serializeTransaction),
  });
});
