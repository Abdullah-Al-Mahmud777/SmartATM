import { z } from 'zod';

export const notificationQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    unreadOnly: z
      .enum(['true', 'false'])
      .optional()
      .transform((value) => value === 'true'),
  })
  .strict();

export const notificationIdParamSchema = z
  .object({
    id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid notification identifier'),
  })
  .strict();
