'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';

const API_URL = 'http://localhost:5000';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        window.location.href = '/admin/login';
        return;
      }

      const response = await fetch(`${API_URL}/api/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      } else {
        console.error('Failed to fetch stats:', data.message);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-4 md:p-6 w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8 mt-16 lg:mt-0">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
            <p className="text-sm md:text-base text-gray-600">System Overview & Management</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 md:p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm opacity-90 mb-1">Total Users</p>
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-bold">{stats?.users?.total || 0}</h3>
                </div>
                <div className="text-2xl md:text-3xl lg:text-4xl opacity-80">👥</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 md:p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm opacity-90 mb-1">Active Users</p>
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-bold">{stats?.users?.active || 0}</h3>
                </div>
                <div className="text-2xl md:text-3xl lg:text-4xl opacity-80">✅</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 md:p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm opacity-90 mb-1">Total Transactions</p>
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-bold">{stats?.transactions?.total || 0}</h3>
                </div>
                <div className="text-2xl md:text-3xl lg:text-4xl opacity-80">💳</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 md:p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm opacity-90 mb-1">Today's Transactions</p>
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-bold">{stats?.transactions?.today || 0}</h3>
                </div>
                <div className="text-2xl md:text-3xl lg:text-4xl opacity-80">📊</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 md:p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm opacity-90 mb-1">Blocked Cards</p>
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-bold">{stats?.cards?.blocked || 0}</h3>
                </div>
                <div className="text-2xl md:text-3xl lg:text-4xl opacity-80">🚫</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-4 md:p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm opacity-90 mb-1">Frozen Accounts</p>
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-bold">{stats?.users?.frozen || 0}</h3>
                </div>
                <div className="text-2xl md:text-3xl lg:text-4xl opacity-80">❄️</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white p-4 md:p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm opacity-90 mb-1">Total Revenue</p>
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-bold">৳{(stats?.revenue?.total || 0).toLocaleString()}</h3>
                </div>
                <div className="text-2xl md:text-3xl lg:text-4xl opacity-80">💰</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-4 md:p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm opacity-90 mb-1">Pending Issues</p>
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-bold">{stats?.emergencies?.pending || 0}</h3>
                </div>
                <div className="text-2xl md:text-3xl lg:text-4xl opacity-80">⚠️</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8">
            <Link href="/admin/users" className="bg-white p-3 md:p-4 rounded-lg shadow hover:shadow-lg transition text-center">
              <div className="text-2xl md:text-3xl mb-2">👥</div>
              <h3 className="text-xs md:text-sm font-semibold text-gray-800">Manage Users</h3>
            </Link>
            <Link href="/admin/transactions" className="bg-white p-3 md:p-4 rounded-lg shadow hover:shadow-lg transition text-center">
              <div className="text-2xl md:text-3xl mb-2">💳</div>
              <h3 className="text-xs md:text-sm font-semibold text-gray-800">Transactions</h3>
            </Link>
            <Link href="/admin/analytics" className="bg-white p-3 md:p-4 rounded-lg shadow hover:shadow-lg transition text-center">
              <div className="text-2xl md:text-3xl mb-2">📉</div>
              <h3 className="text-xs md:text-sm font-semibold text-gray-800">Analytics</h3>
            </Link>
            <Link href="/admin/atm-monitoring" className="bg-white p-3 md:p-4 rounded-lg shadow hover:shadow-lg transition text-center">
              <div className="text-2xl md:text-3xl mb-2">🏧</div>
              <h3 className="text-xs md:text-sm font-semibold text-gray-800">ATM Monitor</h3>
            </Link>
            <Link href="/admin/security" className="bg-white p-3 md:p-4 rounded-lg shadow hover:shadow-lg transition text-center">
              <div className="text-2xl md:text-3xl mb-2">🔒</div>
              <h3 className="text-xs md:text-sm font-semibold text-gray-800">Security</h3>
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Recent Transactions</h2>
              <div className="space-y-3">
                {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
                  stats.recentTransactions.map((txn) => (
                    <div key={txn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="font-semibold text-gray-800 text-sm md:text-base truncate">{txn.user}</p>
                        <p className="text-xs md:text-sm text-gray-600 truncate">{txn.id} • {txn.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800 text-sm md:text-base whitespace-nowrap">৳{txn.amount.toLocaleString()}</p>
                        <p className={`text-xs md:text-sm ${txn.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {txn.status}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent transactions</p>
                )}
              </div>
              <Link href="/admin/transactions" className="block mt-4 text-center text-blue-600 hover:text-blue-700 font-semibold text-sm md:text-base">
                View All Transactions →
              </Link>
            </div>

            {/* Recent Users */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Recent Users</h2>
              <div className="space-y-3">
                {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                  stats.recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="font-semibold text-gray-800 text-sm md:text-base truncate">{user.name}</p>
                        <p className="text-xs md:text-sm text-gray-600 truncate">{user.account}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs md:text-sm font-semibold ${user.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                          {user.status}
                        </p>
                        <p className="text-xs text-gray-500">{new Date(user.joined).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent users</p>
                )}
              </div>
              <Link href="/admin/users" className="block mt-4 text-center text-blue-600 hover:text-blue-700 font-semibold text-sm md:text-base">
                View All Users →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
