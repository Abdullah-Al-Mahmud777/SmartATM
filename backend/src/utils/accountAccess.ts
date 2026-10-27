import { Account } from '../models/account.model';
import { ApiError } from './ApiError';

export async function findOwnedAccount(userId: string, accountId: string) {
  const account = await Account.findById(accountId);
  if (!account || !account.userId) {
    throw ApiError.notFound('Account not found.');
  }
  if (account.userId.toString() !== userId) {
    throw ApiError.forbidden('You do not have access to this account.');
  }
  return account;
}
