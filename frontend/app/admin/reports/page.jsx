'use client';

import { useState } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';

export default function Reports() {
  const [reportData] = useState({
    daily: {
      transactions: 145,
      revenue: '৳2,45,000',
      newUsers: 12,
      activeUsers: 980
    },
    weekly: {
      transactions: 1024,
      revenue: '৳15,80,000',
      newUsers: 85,
      activeUsers: 950
    },
    monthly: {
      transactions: 5420,
      revenue: '৳65,40,000',
      newUsers: 320,
      activeUsers: 1250
    }
  });

  const [selectedPeriod, setSelectedPeriod] = useState('daily');

  const currentData = reportData[selectedPeriod];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">System Reports</h1>
            <p className="text-gray-600">Analytics and statistics overview</p>
          </div>
          <Link href="/admin/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Period Selector */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedPeriod('daily')}
              className={`px-6 py-2 rounded-lg font-semibold ${
                selectedPeriod === 'daily' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setSelectedPeriod('weekly')}
              className={`px-6 py-2 rounded-lg font-semibold ${
                selectedPeriod === 'weekly' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setSelectedPeriod('monthly')}
              className={`px-6 py-2 rounded-lg font-semibold ${
                selectedPeriod === 'monthly' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Transactions</p>
                <h3 className="text-3xl font-bold">{currentData.transactions}</h3>
              </div>
              <div className="text-4xl opacity-80">💳</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Revenue</p>
                <h3 className="text-3xl font-bold">{currentData.revenue}</h3>
              </div>
              <div className="text-4xl opacity-80">💰</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">New Users</p>
                <h3 className="text-3xl font-bold">{currentData.newUsers}</h3>
              </div>
              <div className="text-4xl opacity-80">👤</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Active Users</p>
                <h3 className="text-3xl font-bold">{currentData.activeUsers}</h3>
              </div>
              <div className="text-4xl opacity-80">✅</div>
            </div>
          </div>
        </div>

        {/* Detailed Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transaction Breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Transaction Breakdown</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">💸</div>
                  <div>
                    <p className="font-semibold text-gray-800">Withdrawals</p>
                    <p className="text-sm text-gray-600">Total withdrawals</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-800">45</p>
                  <p className="text-sm text-gray-600">৳5,40,000</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">💵</div>
                  <div>
                    <p className="font-semibold text-gray-800">Deposits</p>
                    <p className="text-sm text-gray-600">Total deposits</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-800">52</p>
                  <p className="text-sm text-gray-600">৳8,20,000</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🔄</div>
                  <div>
                    <p className="font-semibold text-gray-800">Transfers</p>
                    <p className="text-sm text-gray-600">Total transfers</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-800">38</p>
                  <p className="text-sm text-gray-600">৳4,50,000</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">💳</div>
                  <div>
                    <p className="font-semibold text-gray-800">Payments</p>
                    <p className="text-sm text-gray-600">Total payments</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-800">10</p>
                  <p className="text-sm text-gray-600">৳35,000</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">System Health</h2>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-800">Success Rate</p>
                  <p className="text-xl font-bold text-green-600">98.5%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '98.5%'}}></div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-800">System Uptime</p>
                  <p className="text-xl font-bold text-blue-600">99.9%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '99.9%'}}></div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-800">User Satisfaction</p>
                  <p className="text-xl font-bold text-yellow-600">95.2%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{width: '95.2%'}}></div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-800">Response Time</p>
                  <p className="text-xl font-bold text-purple-600">1.2s</p>
                </div>
                <p className="text-sm text-gray-600">Average response time</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
