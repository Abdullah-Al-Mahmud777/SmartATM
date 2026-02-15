'use client';

import { useState } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';

export default function Transactions() {
  const [transactions] = useState([
    { id: 'TXN001', user: 'John Doe', account: '1234567890', type: 'Withdraw', amount: '৳5,000', status: 'Completed', date: '2024-02-15', time: '10:30 AM' },
    { id: 'TXN002', user: 'Jane Smith', account: '0987654321', type: 'Deposit', amount: '৳3,500', status: 'Completed', date: '2024-02-15', time: '10:25 AM' },
    { id: 'TXN003', user: 'Mike Johnson', account: '5678901234', type: 'Transfer', amount: '৳2,000', status: 'Pending', date: '2024-02-15', time: '10:20 AM' },
    { id: 'TXN004', user: 'Sarah Williams', account: '4321098765', type: 'Withdraw', amount: '৳8,000', status: 'Completed', date: '2024-02-15', time: '10:15 AM' },
    { id: 'TXN005', user: 'Chris Brown', account: '6789012345', type: 'Payment', amount: '৳1,500', status: 'Completed', date: '2024-02-15', time: '10:10 AM' },
    { id: 'TXN006', user: 'John Doe', account: '1234567890', type: 'Deposit', amount: '৳10,000', status: 'Completed', date: '2024-02-14', time: '05:45 PM' },
    { id: 'TXN007', user: 'Jane Smith', account: '0987654321', type: 'Withdraw', amount: '৳4,000', status: 'Failed', date: '2024-02-14', time: '04:30 PM' },
    { id: 'TXN008', user: 'Mike Johnson', account: '5678901234', type: 'Transfer', amount: '৳6,500', status: 'Completed', date: '2024-02-14', time: '03:20 PM' },
  ]);

  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions.filter(txn => {
    const matchesType = filterType === 'All' || txn.type === filterType;
    const matchesStatus = filterStatus === 'All' || txn.status === filterStatus;
    const matchesSearch = txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         txn.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         txn.account.includes(searchTerm);
    return matchesType && matchesStatus && matchesSearch;
  });

  const totalAmount = filteredTransactions.reduce((sum, txn) => {
    const amount = parseInt(txn.amount.replace(/[৳,]/g, ''));
    return sum + amount;
  }, 0);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Transaction Management</h1>
            <p className="text-gray-600">View and monitor all transactions</p>
          </div>
          <Link href="/admin/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total Transactions</p>
            <p className="text-2xl font-bold text-gray-800">{filteredTransactions.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {filteredTransactions.filter(t => t.status === 'Completed').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {filteredTransactions.filter(t => t.status === 'Pending').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total Amount</p>
            <p className="text-2xl font-bold text-purple-600">৳{totalAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search by ID, user, or account..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Types</option>
              <option value="Withdraw">Withdraw</option>
              <option value="Deposit">Deposit</option>
              <option value="Transfer">Transfer</option>
              <option value="Payment">Payment</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-sm text-gray-800">{txn.id}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{txn.user}</td>
                    <td className="px-6 py-4 text-gray-600">{txn.account}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        txn.type === 'Withdraw' ? 'bg-red-100 text-red-800' :
                        txn.type === 'Deposit' ? 'bg-green-100 text-green-800' :
                        txn.type === 'Transfer' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {txn.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">{txn.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        txn.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        txn.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{txn.date}</div>
                      <div className="text-xs text-gray-500">{txn.time}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
