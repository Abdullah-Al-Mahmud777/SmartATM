'use client';

import { useRouter } from 'next/navigation';

export default function TransactionHistory() {
  const router = useRouter();

  const transactions = [
    { id: 1, type: 'Withdraw', amount: 5000, date: '2026-02-13', time: '10:30 AM', status: 'Success' },
    { id: 2, type: 'Deposit', amount: 10000, date: '2026-02-12', time: '02:15 PM', status: 'Success' },
    { id: 3, type: 'Transfer', amount: 3000, date: '2026-02-11', time: '11:45 AM', status: 'Success' },
    { id: 4, type: 'Withdraw', amount: 2000, date: '2026-02-10', time: '09:20 AM', status: 'Success' },
    { id: 5, type: 'Deposit', amount: 15000, date: '2026-02-09', time: '04:30 PM', status: 'Success' },
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
            Back
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Time</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">#{transaction.id}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        transaction.type === 'Withdraw' ? 'bg-red-100 text-red-700' :
                        transaction.type === 'Deposit' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ৳{transaction.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{transaction.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{transaction.time}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
