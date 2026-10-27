import { z } from 'zod';

const amountPaisa = z.coerce
  .number()
  .int('Amount must be a whole number of paisa.')
  .positive('Amount must be greater than zero.')
  .max(1_000_000_000, 'Amount is too large.');

const note = z.string().trim().max(200, 'Note must be 200 characters or fewer.').optional();

const accountId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Invalid account identifier.');

export const depositSchema = z
  .object({
    amountPaisa,
    note,
  })
  .strict();

export const withdrawSchema = z
  .object({
    amountPaisa,
    note,
    transactionPin: z
      .string()
      .regex(/^\d{4,6}$/, 'Transaction PIN must be 4 to 6 digits.'),
  })
  .strict();

export const transferSchema = z
  .object({
    fromAccountId: accountId,
    toAccountId: accountId,
    amountPaisa,
    note,
    transactionPin: z
      .string()
      .regex(/^\d{4,6}$/, 'Transaction PIN must be 4 to 6 digits.'),
  })
  .strict()
  .refine((value) => value.fromAccountId !== value.toAccountId, {
    message: 'Choose two different accounts.',
    path: ['toAccountId'],
  });

export const exchangeSchema = z
  .object({
    amountPaisa,
    currency: z.enum(['USD', 'EUR', 'GBP']),
    transactionPin: z
      .string()
      .regex(/^\d{4,6}$/, 'Transaction PIN must be 4 to 6 digits.'),
  })
  .strict();

export const cancelTransactionParamSchema = z
  .object({
    id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid transaction identifier.'),
  })
  .strict();
