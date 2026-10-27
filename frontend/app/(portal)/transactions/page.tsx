import type { Metadata } from 'next';
import { TransactionsClient } from '@/components/portal/transactions-client';

export const metadata: Metadata = { title: 'Transactions' };

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string }>;
}) {
  const params = await searchParams;
  const accountId =
    params.accountId && /^[a-f\d]{24}$/i.test(params.accountId)
      ? params.accountId
      : undefined;

  return <TransactionsClient initialAccountId={accountId} />;
}
