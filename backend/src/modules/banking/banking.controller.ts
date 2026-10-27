import { Request, Response } from 'express';
import { HydratedDocument } from 'mongoose';
import { env } from '../../config/env';
import { Account, IAccount } from '../../models/account.model';
import { Notification } from '../../models/notification.model';
import { Transaction } from '../../models/transaction.model';
import { User } from '../../models/user.model';
import { ApiError } from '../../utils/ApiError';
import { asyncHandler } from '../../utils/asyncHandler';
import { executeIdempotent, requireIdempotencyKey } from '../../utils/idempotency';
import { sendSuccess } from '../../utils/response';
import { generateReference, verifyPin } from '../../utils/security';
import { serializeAccount, serializeTransaction } from '../../utils/serializers';
import {
  bankingLimits,
  exchangeRateFor,
  findMainAccount,
  formatBdt,
  formatForeignAmount,
  getDailyWithdrawnPaisa,
} from './banking.service';

interface DepositInput {
  amountPaisa: number;
  note?: string;
}

interface WithdrawInput extends DepositInput {
  transactionPin: string;
}

interface TransferInput extends WithdrawInput {
  fromAccountId: string;
  toAccountId: string;
}

interface ExchangeInput {
  amountPaisa: number;
  currency: 'USD' | 'EUR' | 'GBP';
  transactionPin: string;
}

function cancelWindowLabel(seconds: number): string {
  if (seconds % 60 === 0) {
    const minutes = seconds / 60;
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  }
  return `${seconds} seconds`;
}

function movementData(account: HydratedDocument<IAccount>, transaction: unknown) {
  return {
    accountId: account._id.toString(),
    balancePaisa: account.balancePaisa,
    availableBalancePaisa: account.availableBalancePaisa,
    transaction,
  };
}

function assertDepositAmount(amountPaisa: number): void {
  if (amountPaisa < env.depositMinPaisa || amountPaisa > env.depositMaxPaisa) {
    throw ApiError.badRequest(
      `Deposit amount must be between ${formatBdt(env.depositMinPaisa)} and ${formatBdt(
        env.depositMaxPaisa
      )}.`
    );
  }
}

function assertWithdrawAmount(amountPaisa: number): void {
  if (amountPaisa < env.withdrawMinPaisa || amountPaisa > env.withdrawMaxPaisa) {
    throw ApiError.badRequest(
      `Withdrawal amount must be between ${formatBdt(env.withdrawMinPaisa)} and ${formatBdt(
        env.withdrawMaxPaisa
      )}.`
    );
  }
}

function assertTransferAmount(amountPaisa: number): void {
  if (amountPaisa < env.transferMinPaisa || amountPaisa > env.transferMaxPaisa) {
    throw ApiError.badRequest(
      `Transfer amount must be between ${formatBdt(env.transferMinPaisa)} and ${formatBdt(
        env.transferMaxPaisa
      )}.`
    );
  }
}

function assertExchangeAmount(amountPaisa: number): void {
  if (amountPaisa < env.exchangeMinPaisa || amountPaisa > env.exchangeMaxPaisa) {
    throw ApiError.badRequest(
      `Exchange amount must be between ${formatBdt(env.exchangeMinPaisa)} and ${formatBdt(
        env.exchangeMaxPaisa
      )}.`
    );
  }
}

export const getBalance = asyncHandler(async (req: Request, res: Response) => {
  const account = await findMainAccount(req.user!.id);
  const dailyWithdrawnPaisa = await getDailyWithdrawnPaisa(req.user!.id);

  sendSuccess(res, {
    account: serializeAccount(account),
    balancePaisa: account.balancePaisa,
    availableBalancePaisa: account.availableBalancePaisa,
    currency: account.currency,
    dailyWithdrawnPaisa,
    dailyRemainingPaisa: Math.max(
      0,
      env.withdrawDailyLimitPaisa - dailyWithdrawnPaisa
    ),
    limits: bankingLimits(),
  });
});

export const deposit = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as DepositInput;
  const idempotencyKey = requireIdempotencyKey(req);

  const result = await executeIdempotent({
    userId: req.user!.id,
    key: idempotencyKey,
    operation: 'deposit',
    body,
    statusCode: 201,
    message: 'Deposit completed successfully.',
    run: async (session) => {
      assertDepositAmount(body.amountPaisa);
      const account = await findMainAccount(req.user!.id, session);
      const updated = await Account.findOneAndUpdate(
        { _id: account._id, userId: req.user!.id, status: 'active' },
        {
          $inc: {
            balancePaisa: body.amountPaisa,
            availableBalancePaisa: body.amountPaisa,
          },
        },
        { new: true, session }
      );
      if (!updated) {
        throw ApiError.conflict('This account is not available for deposits.');
      }

      const [transaction] = await Transaction.create(
        [
          {
            accountId: updated._id,
            userId: req.user!.id,
            type: 'deposit',
            direction: 'credit',
            amountPaisa: body.amountPaisa,
            feePaisa: 0,
            balanceAfterPaisa: updated.balancePaisa,
            referenceNumber: generateReference('DEP'),
            counterpartyName: 'Cash deposit',
            description: body.note || 'Online deposit',
            status: 'completed',
            channel: 'online',
            completedAt: new Date(),
            metadata: { source: 'customer_dashboard' },
          },
        ],
        { session }
      );

      await Notification.create(
        [
          {
            userId: req.user!.id,
            type: 'transaction',
            title: 'Deposit received',
            message: `${formatBdt(body.amountPaisa)} was added to account ending ${updated.accountNumber.slice(
              -4
            )}. Available balance: ${formatBdt(updated.availableBalancePaisa)}.`,
            severity: 'success',
            isRead: false,
            metadata: {
              transactionId: transaction._id.toString(),
              referenceNumber: transaction.referenceNumber,
            },
          },
        ],
        { session }
      );

      return movementData(updated, serializeTransaction(transaction));
    },
  });

  if (result.replay) res.setHeader('Idempotent-Replayed', 'true');
  sendSuccess(res, result.data, result.message, result.statusCode);
});

export const withdraw = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as WithdrawInput;
  const idempotencyKey = requireIdempotencyKey(req);

  const result = await executeIdempotent({
    userId: req.user!.id,
    key: idempotencyKey,
    operation: 'withdraw',
    body,
    statusCode: 201,
    message: `Withdrawal initiated. It can be cancelled for ${cancelWindowLabel(
      env.withdrawCancelWindowSeconds
    )}.`,
    run: async (session) => {
      assertWithdrawAmount(body.amountPaisa);
      const account = await findMainAccount(req.user!.id, session);

      const user = await User.findById(req.user!.id)
        .select('transactionPinHash')
        .session(session);
      if (!user?.transactionPinHash) {
        throw ApiError.conflict('A transaction PIN is not configured for this account.');
      }
      const pinMatches = await verifyPin(body.transactionPin, user.transactionPinHash);
      if (!pinMatches) {
        throw new ApiError(400, 'Incorrect transaction PIN.', 'INVALID_PIN');
      }

      if (account.balancePaisa < body.amountPaisa) {
        throw ApiError.badRequest(
          `Insufficient balance. Available balance is ${formatBdt(
            account.availableBalancePaisa
          )}.`
        );
      }

      const dailyWithdrawnPaisa = await getDailyWithdrawnPaisa(
        req.user!.id,
        session
      );
      if (
        dailyWithdrawnPaisa + body.amountPaisa >
        env.withdrawDailyLimitPaisa
      ) {
        const remaining = Math.max(
          0,
          env.withdrawDailyLimitPaisa - dailyWithdrawnPaisa
        );
        throw ApiError.badRequest(
          `Daily withdrawal limit exceeded. Remaining limit today: ${formatBdt(
            remaining
          )}.`
        );
      }

      const updated = await Account.findOneAndUpdate(
        {
          _id: account._id,
          userId: req.user!.id,
          status: 'active',
          balancePaisa: { $gte: body.amountPaisa },
        },
        {
          $inc: {
            balancePaisa: -body.amountPaisa,
            availableBalancePaisa: -body.amountPaisa,
          },
        },
        { new: true, session }
      );
      if (!updated) {
        throw ApiError.badRequest('Insufficient balance for this withdrawal.');
      }

      const cancelableUntil = new Date(
        Date.now() + env.withdrawCancelWindowSeconds * 1000
      );
      const [transaction] = await Transaction.create(
        [
          {
            accountId: updated._id,
            userId: req.user!.id,
            type: 'withdrawal',
            direction: 'debit',
            amountPaisa: body.amountPaisa,
            feePaisa: 0,
            balanceAfterPaisa: updated.balancePaisa,
            referenceNumber: generateReference('WDR'),
            counterpartyName: 'Cash withdrawal',
            description: body.note || 'Online withdrawal',
            status: 'pending',
            channel: 'online',
            cancelableUntil,
            metadata: { source: 'customer_dashboard' },
          },
        ],
        { session }
      );

      await Notification.create(
        [
          {
            userId: req.user!.id,
            type: 'transaction',
            title: 'Withdrawal initiated',
            message: `${formatBdt(body.amountPaisa)} is pending from account ending ${updated.accountNumber.slice(
              -4
            )}. You can cancel it from Recent transactions for the next ${cancelWindowLabel(
              env.withdrawCancelWindowSeconds
            )}.`,
            severity: 'warning',
            isRead: false,
            metadata: {
              transactionId: transaction._id.toString(),
              referenceNumber: transaction.referenceNumber,
              cancelableUntil,
            },
          },
        ],
        { session }
      );

      return movementData(updated, serializeTransaction(transaction));
    },
  });

  if (result.replay) res.setHeader('Idempotent-Replayed', 'true');
  sendSuccess(res, result.data, result.message, result.statusCode);
});

export const transfer = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as TransferInput;
  const idempotencyKey = requireIdempotencyKey(req);

  const result = await executeIdempotent({
    userId: req.user!.id,
    key: idempotencyKey,
    operation: 'transfer',
    body,
    statusCode: 200,
    message: 'Transfer completed successfully.',
    run: async (session) => {
      assertTransferAmount(body.amountPaisa);
      if (body.fromAccountId === body.toAccountId) {
        throw ApiError.badRequest('Choose two different accounts.');
      }

      const accounts = await Account.find({
        _id: { $in: [body.fromAccountId, body.toAccountId] },
      }).session(session);
      const from = accounts.find(
        (account) => account._id.toString() === body.fromAccountId
      );
      const to = accounts.find(
        (account) => account._id.toString() === body.toAccountId
      );

      if (!from) throw ApiError.notFound('Source account not found.');
      if (!to) throw ApiError.notFound('Destination account not found.');
      if (
        from.userId?.toString() !== req.user!.id ||
        to.userId?.toString() !== req.user!.id
      ) {
        throw ApiError.forbidden('You do not have access to this account.');
      }
      if (from.status !== 'active') {
        throw ApiError.badRequest('The source account is not active.');
      }
      if (to.status !== 'active') {
        throw ApiError.badRequest('The destination account is not active.');
      }

      const user = await User.findById(req.user!.id)
        .select('transactionPinHash')
        .session(session);
      if (!user?.transactionPinHash) {
        throw ApiError.conflict('A transaction PIN is not configured for this account.');
      }
      const pinMatches = await verifyPin(body.transactionPin, user.transactionPinHash);
      if (!pinMatches) {
        throw new ApiError(400, 'Incorrect transaction PIN.', 'INVALID_PIN');
      }

      if (
        from.balancePaisa < body.amountPaisa ||
        from.availableBalancePaisa < body.amountPaisa
      ) {
        throw ApiError.badRequest(
          `Insufficient balance. Available balance is ${formatBdt(
            from.availableBalancePaisa
          )}.`
        );
      }

      const debited = await Account.findOneAndUpdate(
        {
          _id: from._id,
          userId: req.user!.id,
          status: 'active',
          balancePaisa: { $gte: body.amountPaisa },
          availableBalancePaisa: { $gte: body.amountPaisa },
        },
        {
          $inc: {
            balancePaisa: -body.amountPaisa,
            availableBalancePaisa: -body.amountPaisa,
          },
        },
        { new: true, session }
      );
      if (!debited) {
        throw ApiError.badRequest('Insufficient balance for this transfer.');
      }

      const credited = await Account.findOneAndUpdate(
        {
          _id: to._id,
          userId: req.user!.id,
          status: 'active',
        },
        {
          $inc: {
            balancePaisa: body.amountPaisa,
            availableBalancePaisa: body.amountPaisa,
          },
        },
        { new: true, session }
      );
      if (!credited) {
        throw ApiError.conflict('The destination account is not available for transfers.');
      }

      const now = new Date();
      const transferReference = generateReference('TRF');
      const fromSuffix = debited.accountNumber.slice(-4);
      const toSuffix = credited.accountNumber.slice(-4);

      const [debit] = await Transaction.create(
        [
          {
            accountId: debited._id,
            userId: req.user!.id,
            type: 'transfer_debit',
            direction: 'debit',
            amountPaisa: body.amountPaisa,
            feePaisa: 0,
            balanceAfterPaisa: debited.balancePaisa,
            referenceNumber: generateReference('TRD'),
            counterpartyName: `Account ending ${toSuffix}`,
            counterpartyAccount: credited.accountNumber,
            description:
              body.note || `Transfer to account ending ${toSuffix}`,
            status: 'completed',
            channel: 'online',
            completedAt: now,
            metadata: {
              source: 'customer_dashboard',
              transferReference,
              counterpartyAccountId: credited._id.toString(),
            },
          },
        ],
        { session }
      );

      const [credit] = await Transaction.create(
        [
          {
            accountId: credited._id,
            userId: req.user!.id,
            type: 'transfer_credit',
            direction: 'credit',
            amountPaisa: body.amountPaisa,
            feePaisa: 0,
            balanceAfterPaisa: credited.balancePaisa,
            referenceNumber: generateReference('TRC'),
            counterpartyName: `Account ending ${fromSuffix}`,
            counterpartyAccount: debited.accountNumber,
            description:
              body.note || `Transfer from account ending ${fromSuffix}`,
            status: 'completed',
            channel: 'online',
            completedAt: now,
            metadata: {
              source: 'customer_dashboard',
              transferReference,
              counterpartyAccountId: debited._id.toString(),
            },
          },
        ],
        { session }
      );

      await Notification.create(
        [
          {
            userId: req.user!.id,
            type: 'transaction',
            title: 'Transfer completed',
            message: `${formatBdt(body.amountPaisa)} was transferred from account ending ${fromSuffix} to account ending ${toSuffix}.`,
            severity: 'success',
            isRead: false,
            metadata: {
              transactionId: debit._id.toString(),
              referenceNumber: debit.referenceNumber,
              transferReference,
            },
          },
        ],
        { session }
      );

      return {
        transferReference,
        fromAccount: serializeAccount(debited),
        toAccount: serializeAccount(credited),
        debit: serializeTransaction(debit),
        credit: serializeTransaction(credit),
      };
    },
  });

  if (result.replay) res.setHeader('Idempotent-Replayed', 'true');
  sendSuccess(res, result.data, result.message, result.statusCode);
});

export const cancelWithdrawal = asyncHandler(
  async (req: Request, res: Response) => {
    const transactionId = req.params.id;
    const idempotencyKey = requireIdempotencyKey(req);

    const result = await executeIdempotent({
      userId: req.user!.id,
      key: idempotencyKey,
      operation: 'cancel_withdrawal',
      body: { transactionId },
      statusCode: 200,
      message: 'Withdrawal cancelled. The amount is available again.',
      run: async (session) => {
        const transaction = await Transaction.findOne({
          _id: transactionId,
          userId: req.user!.id,
        }).session(session);

        if (!transaction) {
          throw ApiError.notFound('Transaction not found.');
        }
        if (transaction.type !== 'withdrawal') {
          throw ApiError.badRequest('Only withdrawals can be cancelled.');
        }
        if (transaction.status === 'completed') {
          throw ApiError.conflict('This withdrawal has already been completed.');
        }
        if (transaction.status === 'cancelled') {
          throw ApiError.conflict('This withdrawal has already been cancelled.');
        }
        if (transaction.status !== 'pending') {
          throw ApiError.conflict('This withdrawal can no longer be cancelled.');
        }

        const now = new Date();
        if (!transaction.cancelableUntil || transaction.cancelableUntil <= now) {
          throw ApiError.conflict('The cancellation window has ended.');
        }

        const cancelled = await Transaction.findOneAndUpdate(
          {
            _id: transaction._id,
            userId: req.user!.id,
            status: 'pending',
            cancelableUntil: { $gt: now },
          },
          {
            $set: {
              status: 'cancelled',
              cancelledAt: now,
              cancelledBy: 'customer',
            },
          },
          { new: true, session }
        );
        if (!cancelled) {
          throw ApiError.conflict('The cancellation window has ended.');
        }

        const account = await Account.findOneAndUpdate(
          { _id: transaction.accountId, userId: req.user!.id },
          {
            $inc: {
              balancePaisa: transaction.amountPaisa,
              availableBalancePaisa: transaction.amountPaisa,
            },
          },
          { new: true, session }
        );
        if (!account) {
          throw ApiError.conflict('The linked account is not available.');
        }

        await Notification.create(
          [
            {
              userId: req.user!.id,
              type: 'transaction',
              title: 'Withdrawal cancelled',
              message: `${formatBdt(transaction.amountPaisa)} was returned to account ending ${account.accountNumber.slice(
                -4
              )}. Available balance: ${formatBdt(account.availableBalancePaisa)}.`,
              severity: 'success',
              isRead: false,
              metadata: {
                transactionId: cancelled._id.toString(),
                referenceNumber: cancelled.referenceNumber,
              },
            },
          ],
          { session }
        );

        return movementData(account, serializeTransaction(cancelled));
      },
    });

    if (result.replay) res.setHeader('Idempotent-Replayed', 'true');
    sendSuccess(res, result.data, result.message, result.statusCode);
  }
);

export const getExchangeRates = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, { rates: env.exchangeRates });
});

export const exchange = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as ExchangeInput;
  const idempotencyKey = requireIdempotencyKey(req);

  const result = await executeIdempotent({
    userId: req.user!.id,
    key: idempotencyKey,
    operation: 'exchange',
    body,
    statusCode: 201,
    message: 'Exchange completed successfully.',
    run: async (session) => {
      assertExchangeAmount(body.amountPaisa);
      const account = await findMainAccount(req.user!.id, session);

      const user = await User.findById(req.user!.id)
        .select('transactionPinHash')
        .session(session);
      if (!user?.transactionPinHash) {
        throw ApiError.conflict('A transaction PIN is not configured for this account.');
      }
      const pinMatches = await verifyPin(body.transactionPin, user.transactionPinHash);
      if (!pinMatches) {
        throw new ApiError(400, 'Incorrect transaction PIN.', 'INVALID_PIN');
      }

      const rate = exchangeRateFor(body.currency);
      const foreignAmountPaisa = Math.round(body.amountPaisa * rate);

      const updated = await Account.findOneAndUpdate(
        {
          _id: account._id,
          userId: req.user!.id,
          status: 'active',
          balancePaisa: { $gte: body.amountPaisa },
        },
        {
          $inc: {
            balancePaisa: -body.amountPaisa,
            availableBalancePaisa: -body.amountPaisa,
          },
        },
        { new: true, session }
      );
      if (!updated) {
        throw ApiError.badRequest('Insufficient balance for this exchange.');
      }

      const now = new Date();
      const [transaction] = await Transaction.create(
        [
          {
            accountId: updated._id,
            userId: req.user!.id,
            type: 'exchange',
            direction: 'debit',
            amountPaisa: body.amountPaisa,
            feePaisa: 0,
            balanceAfterPaisa: updated.balancePaisa,
            referenceNumber: generateReference('EXG'),
            counterpartyName: `Foreign exchange (${body.currency})`,
            description: `Exchanged to ${body.currency}`,
            status: 'completed',
            channel: 'online',
            completedAt: now,
            metadata: {
              source: 'customer_dashboard',
              exchangeRate: rate,
              foreignCurrency: body.currency,
              foreignAmountPaisa,
            },
          },
        ],
        { session }
      );

      await Notification.create(
        [
          {
            userId: req.user!.id,
            type: 'transaction',
            title: 'Exchange completed',
            message: `${formatBdt(body.amountPaisa)} was exchanged to ${body.currency} at a rate of ${rate}. Received ${formatForeignAmount(
              foreignAmountPaisa,
              body.currency
            )}. Available balance: ${formatBdt(updated.availableBalancePaisa)}.`,
            severity: 'success',
            isRead: false,
            metadata: {
              transactionId: transaction._id.toString(),
              referenceNumber: transaction.referenceNumber,
              exchangeRate: rate,
              foreignCurrency: body.currency,
              foreignAmountPaisa,
            },
          },
        ],
        { session }
      );

      return {
        exchange: {
          rate,
          foreignCurrency: body.currency,
          foreignAmountPaisa,
        },
        accountId: updated._id.toString(),
        balancePaisa: updated.balancePaisa,
        availableBalancePaisa: updated.availableBalancePaisa,
        transaction: serializeTransaction(transaction),
      };
    },
  });

  if (result.replay) res.setHeader('Idempotent-Replayed', 'true');
  sendSuccess(res, result.data, result.message, result.statusCode);
});
