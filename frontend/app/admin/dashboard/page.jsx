'use client';

import { useState } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminDashboard() {
  const [stats] = useState({
    totalUsers: 1250,
    activeUsers: 980,
    totalTransactions: 5420,
    todayTransactions: 145,
    blockedCards: 23,
    frozenAccounts: 8,
    totalRevenue: '৳12,45,000',
    pendingIssues: 5
  });

  const [recentTransactions] = useState([
    { id: 'TXN001', user: 'John Doe', amount: '৳5,000', type: 'Withdraw', status: 'Completed', time: '10:30 AM' },
    { id: 'TXN002', user: 'Jane Smith', amount: '৳3,500', type: 'Deposit', status: 'Completed', time: '10:25 AM' },
    { id: 'TXN003', user: 'Mike Johnson', amount: '৳2,000', type: 'Transfer', status: 'Pending', time: '10:20 AM' },
    { id: 'TXN004', user: 'Sarah Williams', amount: '৳8,000', type: 'Withdraw', status: 'Completed', time: '10:15 AM' },
  ]);

  const [recentUsers] = useState([
    { id: 'U001', name: 'Alex Brown', account: '1234567890', status: 'Active', joined: '2024-02-10' },
    { id: 'U002', name: 'Emily Davis', account: '0987654321', status: 'Active', joined: '2024-02-09' },
    { id: 'U003', name: 'Chris Wilson', account: '5678901234', status: 'Frozen', joined: '2024-02-08' },
  ]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">System Overview & Management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Total Users</p>
                <h3 className="text-3xl font-bold">{stats.totalUsers}</h3>
              </div>
              <div className="text-4xl opacity-80">👥</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Active Users</p>
                <h3 className="text-3xl font-bold">{stats.activeUsers}</h3>
              </div>
              <div className="text-4xl opacity-80">✅</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Total Transactions</p>
                <h3 className="text-3xl font-bold">{stats.totalTransactions}</h3>
              </div>
              <div className="text-4xl opacity-80">💳</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Today's Transactions</p>
                <h3 className="text-3xl font-bold">{stats.todayTransactions}</h3>
              </div>
              <div className="text-4xl opacity-80">📊</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Blocked Cards</p>
                <h3 className="text-3xl font-bold">{stats.blockedCards}</h3>
              </div>
              <div className="text-4xl opacity-80">🚫</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Frozen Accounts</p>
                <h3 className="text-3xl font-bold">{stats.frozenAccounts}</h3>
              </div>
              <div className="text-4xl opacity-80">❄️</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Total Revenue</p>
                <h3 className="text-3xl font-bold">{stats.totalRevenue}</h3>
              </div>
              <div className="text-4xl opacity-80">💰</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Pending Issues</p>
                <h3 className="text-3xl font-bold">{stats.pendingIssues}</h3>
              </div>
              <div className="text-4xl opacity-80">⚠️</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/admin/users" className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition text-center">
            <div className="text-3xl mb-2">👥</div>
            <h3 className="font-semibold text-gray-800">Manage Users</h3>
          </Link>
          <Link href="/admin/transactions" className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition text-center">
            <div className="text-3xl mb-2">💳</div>
            <h3 className="font-semibold text-gray-800">View Transactions</h3>
          </Link>
          <Link href="/admin/reports" className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition text-center">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-semibold text-gray-800">Reports</h3>
          </Link>
          <button className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition text-center">
            <div className="text-3xl mb-2">⚙️</div>
            <h3 className="font-semibold text-gray-800">Settings</h3>
          </button>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Transactions</h2>
            <div className="space-y-3">
              {recentTransactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-800">{txn.user}</p>
                    <p className="text-sm text-gray-600">{txn.id} • {txn.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{txn.amount}</p>
                    <p className={`text-sm ${txn.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {txn.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/admin/transactions" className="block mt-4 text-center text-blue-600 hover:text-blue-700 font-semibold">
              View All Transactions →
            </Link>
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Users</h2>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.account}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${user.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                      {user.status}
                    </p>
                    <p className="text-xs text-gray-500">{user.joined}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/admin/users" className="block mt-4 text-center text-blue-600 hover:text-blue-700 font-semibold">
              View All Users →
            </Link>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
