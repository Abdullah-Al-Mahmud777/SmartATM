import { ClientSession, Types } from 'mongoose';
import { env } from '../../config/env';
import { Account } from '../../models/account.model';
import { Transaction } from '../../models/transaction.model';
import { ApiError } from '../../utils/ApiError';

const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function formatBdt(paisa: number): string {
  return `BDT ${(paisa / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function exchangeRateFor(currency: string): number {
  const rate = env.exchangeRates[currency];
  if (!rate || rate <= 0) {
    throw ApiError.badRequest(`No exchange rate is available for ${currency}.`);
  }
  return rate;
}

export function formatForeignAmount(paisa: number, currency: string): string {
  const amount = (paisa / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency} ${amount}`;
}

function dhakaDayBounds(now = new Date()): { start: Date; end: Date } {
  const dhakaNow = new Date(now.getTime() + DHAKA_OFFSET_MS);
  const start = new Date(
    Date.UTC(
      dhakaNow.getUTCFullYear(),
      dhakaNow.getUTCMonth(),
      dhakaNow.getUTCDate()
    ) - DHAKA_OFFSET_MS
  );
  return { start, end: new Date(start.getTime() + DAY_MS) };
}

export async function findMainAccount(
  userId: string,
  session?: ClientSession
) {
  const query = Account.findOne({ userId, status: 'active' }).sort({
    isPrimary: -1,
    createdAt: 1,
  });
  if (session) query.session(session);
  const account = await query.exec();
  if (!account) {
    throw ApiError.notFound('An active bank account is required for this operation.');
  }
  return account;
}

export async function getDailyWithdrawnPaisa(
  userId: string,
  session?: ClientSession
): Promise<number> {
  const { start, end } = dhakaDayBounds();
  const aggregate = Transaction.aggregate<{ totalPaisa: number }>([
    {
      $match: {
        userId: new Types.ObjectId(userId),
        type: 'withdrawal',
        status: { $in: ['pending', 'completed'] },
        createdAt: { $gte: start, $lt: end },
      },
    },
    {
      $group: {
        _id: null,
        totalPaisa: { $sum: '$amountPaisa' },
      },
    },
  ]);
  if (session) aggregate.session(session);
  const rows = await aggregate.exec();
  return rows[0]?.totalPaisa ?? 0;
}

export function bankingLimits() {
  return {
    depositMinPaisa: env.depositMinPaisa,
    depositMaxPaisa: env.depositMaxPaisa,
    withdrawMinPaisa: env.withdrawMinPaisa,
    withdrawMaxPaisa: env.withdrawMaxPaisa,
    withdrawDailyLimitPaisa: env.withdrawDailyLimitPaisa,
    transferMinPaisa: env.transferMinPaisa,
    transferMaxPaisa: env.transferMaxPaisa,
    withdrawCancelWindowSeconds: env.withdrawCancelWindowSeconds,
    exchangeMinPaisa: env.exchangeMinPaisa,
    exchangeMaxPaisa: env.exchangeMaxPaisa,
  };
}
