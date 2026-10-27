import cron, { ScheduledTask } from 'node-cron';
import { env } from '../config/env';
import { Transaction } from '../models/transaction.model';

let task: ScheduledTask | null = null;

export async function completeExpiredPendingWithdrawals(): Promise<number> {
  const now = new Date();
  const result = await Transaction.updateMany(
    {
      type: 'withdrawal',
      status: 'pending',
      cancelableUntil: { $lte: now },
    },
    {
      $set: {
        status: 'completed',
        completedAt: now,
      },
    }
  );

  if (result.modifiedCount > 0) {
    console.log(
      `[cron] completed ${result.modifiedCount} pending withdrawal${
        result.modifiedCount === 1 ? '' : 's'
      }`
    );
  }
  return result.modifiedCount;
}

export function startPendingWithdrawalJob(): void {
  if (task) return;
  if (!cron.validate(env.pendingWithdrawalCron)) {
    throw new Error(
      `Invalid PENDING_WITHDRAWAL_CRON expression: ${env.pendingWithdrawalCron}`
    );
  }

  task = cron.schedule(
    env.pendingWithdrawalCron,
    async () => {
      try {
        await completeExpiredPendingWithdrawals();
      } catch (error) {
        console.error(
          '[cron] pending withdrawal completion failed',
          error instanceof Error ? error.message : error
        );
      }
    },
    { name: 'pending-withdrawals', noOverlap: true }
  );
  console.log(
    `[cron] pending withdrawal completion scheduled: ${env.pendingWithdrawalCron}`
  );
}

export async function stopPendingWithdrawalJob(): Promise<void> {
  if (!task) return;
  await task.stop();
  task = null;
}
