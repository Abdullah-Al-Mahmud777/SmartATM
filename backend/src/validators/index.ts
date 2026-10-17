import { z } from 'zod';

export const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'manager', 'operator']),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  phone: z.string().optional(),
});

export const updateUserSchema = createUserSchema
  .partial()
  .omit({ password: true })
  .extend({ password: z.string().min(6).optional() });

export const atmStatus = z.enum(['online', 'offline', 'maintenance']);

export const createAtmSchema = z.object({
  atmId: z.string().min(2),
  name: z.string().min(2),
  area: z.string().min(2),
  location: z.object({
    lat: z.number().gte(-90).lte(90),
    lng: z.number().gte(-180).lte(180),
    address: z.string().min(3),
  }),
  status: atmStatus.optional(),
  cash: z.number().min(0).optional(),
  capacity: z.number().min(0).optional(),
  denominations: z
    .object({
      thousand: z.number().min(0),
      fiveHundred: z.number().min(0),
      twoHundred: z.number().min(0),
      oneHundred: z.number().min(0),
      fifty: z.number().min(0),
    })
    .partial()
    .optional(),
});

export const updateAtmSchema = createAtmSchema.partial();

export const refillSchema = z.object({
  denominations: z.object({
    thousand: z.number().min(0).optional(),
    fiveHundred: z.number().min(0).optional(),
    twoHundred: z.number().min(0).optional(),
    oneHundred: z.number().min(0).optional(),
    fifty: z.number().min(0).optional(),
  }),
  technician: z.string().optional(),
});

export const transactionType = z.enum([
  'withdrawal',
  'deposit',
  'balance_inquiry',
  'transfer',
]);
export const transactionStatus = z.enum(['success', 'failed', 'pending']);

export const transactionQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
  type: transactionType.optional(),
  status: transactionStatus.optional(),
  atm: z.string().optional(),
  search: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  sort: z.enum(['newest', 'oldest', 'amount_desc', 'amount_asc']).optional(),
});

export const createTransactionSchema = z.object({
  atm: objectId,
  type: transactionType,
  amount: z.number().min(0),
  fee: z.number().min(0).optional(),
  status: transactionStatus.optional(),
  cardMasked: z.string().optional(),
  customerName: z.string().optional(),
});

export const alertStatus = z.enum(['active', 'acknowledged', 'resolved']);
export const alertSeverity = z.enum(['low', 'medium', 'high', 'critical']);

export const updateAlertSchema = z.object({
  status: alertStatus,
});

export const createAlertSchema = z.object({
  type: z.enum(['cash_low', 'cash_out', 'offline', 'maintenance', 'security', 'network']),
  severity: alertSeverity.optional(),
  title: z.string().min(2),
  message: z.string().min(2),
  atm: objectId.optional(),
  atmCode: z.string().optional(),
});

export const alertQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
  status: alertStatus.optional(),
  severity: alertSeverity.optional(),
  type: z.string().optional(),
});

export const settingsSchema = z.object({
  orgName: z.string().min(2).optional(),
  currency: z.string().min(1).optional(),
  currencySymbol: z.string().min(1).optional(),
  timezone: z.string().min(1).optional(),
  lowCashThreshold: z.number().min(0).optional(),
  criticalCashThreshold: z.number().min(0).optional(),
  refreshInterval: z.number().int().min(5).max(600).optional(),
  alertEmail: z.string().email().optional(),
  maintenanceMode: z.boolean().optional(),
});

export const reportQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d']).optional(),
});
