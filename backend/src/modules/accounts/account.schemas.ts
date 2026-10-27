import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid identifier');

export const accountIdParamSchema = z
  .object({
    id: objectId,
  })
  .strict();

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format')
  .optional();

const transactionType = z.enum([
  'deposit',
  'withdrawal',
  'transfer_debit',
  'transfer_credit',
  'exchange',
  'bill_payment',
  'mobile_recharge',
  'card_payment',
  'loan_installment',
  'fdr_open',
  'dps_contribution',
  'fee',
  'interest',
  'reversal',
]);

const transactionStatus = z.enum(['completed', 'pending', 'cancelled', 'failed']);

const transactionFilters = z.object({
  search: z.string().trim().max(100).optional(),
  type: transactionType.optional(),
  direction: z.enum(['debit', 'credit']).optional(),
  status: transactionStatus.optional(),
  from: isoDate,
  to: isoDate,
  minAmountPaisa: z.coerce.number().int().min(0).optional(),
  maxAmountPaisa: z.coerce.number().int().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const validateDateRange = (value: {
  from?: string;
  to?: string;
  minAmountPaisa?: number;
  maxAmountPaisa?: number;
}) => {
  if (value.from && value.to && value.from > value.to) return false;
  if (
    value.minAmountPaisa !== undefined &&
    value.maxAmountPaisa !== undefined &&
    value.minAmountPaisa > value.maxAmountPaisa
  ) {
    return false;
  }
  return true;
};

const dateRangeMessage = {
  message: 'Check the selected date and amount range.',
  path: ['to'],
};

export const transactionQuerySchema = transactionFilters
  .strict()
  .refine(validateDateRange, dateRangeMessage);

export const globalTransactionQuerySchema = transactionFilters
  .extend({ accountId: objectId.optional() })
  .strict()
  .refine(validateDateRange, dateRangeMessage);

export const statementQuerySchema = z
  .object({
    format: z.enum(['pdf', 'xlsx']).default('pdf'),
    from: isoDate,
    to: isoDate,
  })
  .strict()
  .refine((value) => !value.from || !value.to || value.from <= value.to, {
    message: 'Start date must be on or before end date',
    path: ['to'],
  });
