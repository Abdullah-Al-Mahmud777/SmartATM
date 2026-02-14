interface Transaction {
  id: number;
  type: string;
  amount: number;
  date: string;
  time: string;
  status: string;
  accountNumber?: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
}

export default function TransactionTable({ transactions }: TransactionTableProps) {
  return (
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
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    transaction.status === 'Success' ? 'bg-green-100 text-green-700' :
                    transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {transaction.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
