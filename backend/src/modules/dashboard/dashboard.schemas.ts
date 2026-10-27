import { z } from 'zod';

export const dashboardQuerySchema = z
  .object({
    accountId: z
      .string()
      .regex(/^[a-f\d]{24}$/i, 'Invalid account identifier')
      .optional(),
  })
  .strict();
