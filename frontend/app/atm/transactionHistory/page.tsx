'use client';

import { useRouter } from 'next/navigation';
import TransactionTable from '@/components/TransactionTable';

export default function TransactionHistory() {
  const router = useRouter();

  const transactions = [
    { id: 1, type: 'Withdraw', amount: 5000, date: '2026-02-13', time: '10:30 AM', status: 'Success' },
    { id: 2, type: 'Deposit', amount: 10000, date: '2026-02-12', time: '02:15 PM', status: 'Success' },
    { id: 3, type: 'Transfer', amount: 3000, date: '2026-02-11', time: '11:45 AM', status: 'Success' },
    { id: 4, type: 'Withdraw', amount: 2000, date: '2026-02-10', time: '09:20 AM', status: 'Success' },
    { id: 5, type: 'Deposit', amount: 15000, date: '2026-02-09', time: '04:30 PM', status: 'Success' },
    { id: 6, type: 'Transfer', amount: 7500, date: '2026-02-08', time: '03:10 PM', status: 'Success' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-orange-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Transaction History</h1>
          <button
            onClick={() => router.push('/atm/dashboard')}
            className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-orange-50"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <TransactionTable transactions={transactions} />
      </div>
    </div>
  );
}
