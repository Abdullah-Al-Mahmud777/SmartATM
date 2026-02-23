'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7days');
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    transactionTrends: [],
    peakHours: [],
    topUsers: [],
    errorLogs: [],
    statistics: {}
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        window.location.href = '/admin/login';
        return;
      }

      const response = await fetch(`${API_URL}/api/admin/analytics?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setChartData(data.analytics);
      } else {
        console.error('Failed to fetch analytics:', data.message);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
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
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Advanced Analytics</h1>
            <p className="text-gray-600">Real-time insights and data visualization</p>
          </div>

          {/* Time Range Selector */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex gap-3">
              {['24hours', '7days', '30days', '90days'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    timeRange === range
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {range === '24hours' ? '24 Hours' : range === '7days' ? '7 Days' : range === '30days' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
          </div>

          {/* Statistics Summary */}
          {chartData.statistics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-600 text-sm">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-800">{chartData.statistics.totalTransactions || 0}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-2xl font-bold text-green-600">{chartData.statistics.completedTransactions || 0}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-600 text-sm">Failed</p>
                <p className="text-2xl font-bold text-red-600">{chartData.statistics.failedTransactions || 0}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-600 text-sm">Total Amount</p>
                <p className="text-2xl font-bold text-blue-600">৳{(chartData.statistics.totalAmount || 0).toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Transaction Trends Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Transaction Trends</h2>
            {chartData.transactionTrends.length > 0 ? (
              <div className="space-y-4">
                {chartData.transactionTrends.map((data, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-700 w-16">{data.day}</span>
                      <div className="flex-1 flex gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                              <div 
                                className="bg-red-500 h-6 rounded-full flex items-center justify-end pr-2"
                                style={{width: `${Math.min((data.withdrawals / 100) * 100, 100)}%`}}
                              >
                                <span className="text-xs text-white font-semibold">{data.withdrawals}</span>
                              </div>
                            </div>
                            <span className="text-xs text-gray-600 w-20">Withdrawals</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                              <div 
                                className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2"
                                style={{width: `${Math.min((data.deposits / 100) * 100, 100)}%`}}
                              >
                                <span className="text-xs text-white font-semibold">{data.deposits}</span>
                              </div>
                            </div>
                            <span className="text-xs text-gray-600 w-20">Deposits</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                              <div 
                                className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                                style={{width: `${Math.min((data.transfers / 100) * 100, 100)}%`}}
                              >
                                <span className="text-xs text-white font-semibold">{data.transfers}</span>
                              </div>
                            </div>
                            <span className="text-xs text-gray-600 w-20">Transfers</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No transaction data available</p>
            )}
          </div>

          {/* Peak Hours & Top Users */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Peak Hours */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Peak Transaction Hours</h2>
              {chartData.peakHours.length > 0 ? (
                <div className="space-y-3">
                  {chartData.peakHours.map((data, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="font-semibold text-gray-700 w-16">{data.hour}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-8 rounded-full flex items-center justify-end pr-3"
                          style={{width: `${Math.min((data.transactions / 100) * 100, 100)}%`}}
                        >
                          <span className="text-sm text-white font-semibold">{data.transactions}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No peak hours data available</p>
              )}
            </div>

            {/* Top Users */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Top Active Users</h2>
              {chartData.topUsers.length > 0 ? (
                <div className="space-y-3">
                  {chartData.topUsers.map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.transactions} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">{user.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No top users data available</p>
              )}
            </div>
          </div>

          {/* Error Logs & Alerts */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">System Alerts & Error Logs</h2>
            {chartData.errorLogs.length > 0 ? (
              <div className="space-y-3">
                {chartData.errorLogs.map((log, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    log.severity === 'High' || log.severity === 'Critical' ? 'bg-red-50 border-red-500' :
                    log.severity === 'Medium' ? 'bg-yellow-50 border-yellow-500' :
                    'bg-blue-50 border-blue-500'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            log.severity === 'High' || log.severity === 'Critical' ? 'bg-red-200 text-red-800' :
                            log.severity === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-blue-200 text-blue-800'
                          }`}>
                            {log.severity}
                          </span>
                          <span className="font-semibold text-gray-800">{log.type}</span>
                        </div>
                        <p className="text-sm text-gray-600">{log.message}</p>
                      </div>
                      <span className="text-sm text-gray-500">{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No error logs available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
