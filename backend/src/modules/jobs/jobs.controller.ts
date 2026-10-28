import { Request, Response } from 'express';
import { completeExpiredPendingWithdrawals } from '../../jobs/completePendingWithdrawals';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';

export const runPendingWithdrawalsJob = asyncHandler(
  async (_req: Request, res: Response) => {
    const completed = await completeExpiredPendingWithdrawals();
    sendSuccess(res, { completed }, 'Pending withdrawal sweep finished');
  }
);
