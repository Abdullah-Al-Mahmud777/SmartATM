import { Types } from 'mongoose';
import { IAccount } from '../models/account.model';
import { ITransaction } from '../models/transaction.model';
import { INotification } from '../models/notification.model';
import { IUser } from '../models/user.model';

type WithId<T> = T & { _id: Types.ObjectId };

export function serializeUser(user: WithId<IUser>) {
  return {
    id: user._id.toString(),
    userId: user.userId,
    email: user.email,
    fullName: user.fullName,
    mobile: user.mobile,
    dateOfBirth: user.dateOfBirth.toISOString().slice(0, 10),
    lowBalanceThresholdPaisa: user.lowBalanceThresholdPaisa,
    notificationPreferences: user.notificationPreferences,
    lastLoginAt: user.lastLoginAt ?? null,
    createdAt: user.createdAt,
  };
}

export function serializeAccount(account: WithId<IAccount>) {
  return {
    id: account._id.toString(),
    accountNumber: account.accountNumber,
    accountType: account.accountType,
    branchCode: account.branchCode,
    branchName: account.branchName,
    holderName: account.holderName,
    balancePaisa: account.balancePaisa,
    availableBalancePaisa: account.availableBalancePaisa,
    currency: account.currency,
    status: account.status,
    isPrimary: account.isPrimary,
    openedAt: account.openedAt,
  };
}

export function serializeTransaction(transaction: WithId<ITransaction>) {
  return {
    id: transaction._id.toString(),
    accountId: transaction.accountId.toString(),
    type: transaction.type,
    direction: transaction.direction,
    amountPaisa: transaction.amountPaisa,
    feePaisa: transaction.feePaisa,
    balanceAfterPaisa: transaction.balanceAfterPaisa,
    referenceNumber: transaction.referenceNumber,
    counterpartyName: transaction.counterpartyName ?? null,
    counterpartyAccount: transaction.counterpartyAccount ?? null,
    description: transaction.description ?? null,
    status: transaction.status,
    channel: transaction.channel,
    cancelableUntil: transaction.cancelableUntil ?? null,
    completedAt: transaction.completedAt ?? null,
    cancelledAt: transaction.cancelledAt ?? null,
    cancelledBy: transaction.cancelledBy ?? null,
    createdAt: transaction.createdAt,
  };
}

export function serializeNotification(notification: WithId<INotification>) {
  return {
    id: notification._id.toString(),
    type: notification.type,
    title: notification.title,
    message: notification.message,
    severity: notification.severity,
    isRead: notification.isRead,
    readAt: notification.readAt ?? null,
    createdAt: notification.createdAt,
  };
}
