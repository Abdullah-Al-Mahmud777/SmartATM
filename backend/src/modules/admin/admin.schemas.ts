import { z } from 'zod';

export const adminLoginSchema = z
  .object({
    email: z.string().trim().email('Enter a valid email address.'),
    password: z.string().min(1, 'Password is required.'),
  })
  .strict();

export const adminSettingsSchema = z
  .object({
    transactionFeePaisa: z.coerce.number().int().min(0).optional(),
    withdrawCancelWindowSeconds: z.coerce.number().int().min(10).max(3600).optional(),
    defaultDailyLimitPaisa: z.coerce.number().int().min(0).optional(),
    defaultMonthlyLimitPaisa: z.coerce.number().int().min(0).optional(),
    userAutoLogoutMinutes: z.coerce.number().int().min(1).max(1440).optional(),
    approvalThresholdPaisa: z.coerce.number().int().min(0).optional(),
    announcement: z.string().max(500).optional(),
    maintenanceMode: z.boolean().optional(),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters.'),
  })
  .strict();
