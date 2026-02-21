'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = 'http://localhost:5000';

export default function LimitSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [limits, setLimits] = useState({
    daily: {
      withdrawalLimit: 50000,
      withdrawalUsed: 0,
      withdrawalRemaining: 50000,
      transferLimit: 100000,
      transferUsed: 0,
      transferRemaining: 100000
    },
    monthly: {
      withdrawalLimit: 500000,
      withdrawalUsed: 0,
      withdrawalRemaining: 500000,
      transferLimit: 1000000,
      transferUsed: 0,
      transferRemaining: 1000000
    }
  });
  const [dailyWithdrawalLimit, setDailyWithdrawalLimit] = useState('50000');
  const [dailyTransferLimit, setDailyTransferLimit] = useState('100000');
  const [monthlyWithdrawalLimit, setMonthlyWithdrawalLimit] = useState('500000');
  const [monthlyTransferLimit, setMonthlyTransferLimit] = useState('1000000');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLimits();
  }, []);

  const fetchLimits = async () => {
    try {
      const token = localStorage.getItem('atmToken');
      if (!token) {
        router.push('/atm/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/limits`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setLimits(data.limits);
        setDailyWithdrawalLimit(data.limits.daily.withdrawalLimit.toString());
        setDailyTransferLimit(data.limits.daily.transferLimit.toString());
        setMonthlyWithdrawalLimit(data.limits.monthly.withdrawalLimit.toString());
        setMonthlyTransferLimit(data.limits.monthly.transferLimit.toString());
      } else {
        setError(data.message || 'Failed to load limits');
      }
    } catch (err) {
      console.error('Error fetching limits:', err);
      setError('Unable to load limits');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('atmToken');
      if (!token) {
        router.push('/atm/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/limits`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dailyWithdrawalLimit: parseInt(dailyWithdrawalLimit),
          dailyTransferLimit: parseInt(dailyTransferLimit),
          monthlyWithdrawalLimit: parseInt(monthlyWithdrawalLimit),
          monthlyTransferLimit: parseInt(monthlyTransferLimit)
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Limits updated successfully!');
        fetchLimits(); // Refresh limits
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to update limits');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('Error updating limits:', err);
      setError('Unable to update limits');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-black">
      <div className="bg-pink-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">⚙️ Transaction Limits</h1>
          <button
            onClick={() => router.push('/atm/dashboard')}
            className="bg-white text-pink-600 px-4 py-2 rounded-lg font-semibold hover:bg-pink-50"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading limits...</p>
          </div>
        ) : (
          <>
            {/* Daily Usage */}
            <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Daily Usage</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Withdrawal</span>
                    <span className="font-semibold text-black">
                      ৳{limits.daily.withdrawalUsed.toLocaleString()} / ৳{limits.daily.withdrawalLimit.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all" 
                      style={{ width: `${(limits.daily.withdrawalUsed / limits.daily.withdrawalLimit) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Remaining: ৳{limits.daily.withdrawalRemaining.toLocaleString()}
                  </p>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Transfer</span>
                    <span className="font-semibold text-black">
                      ৳{limits.daily.transferUsed.toLocaleString()} / ৳{limits.daily.transferLimit.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full transition-all" 
                      style={{ width: `${(limits.daily.transferUsed / limits.daily.transferLimit) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Remaining: ৳{limits.daily.transferRemaining.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Monthly Usage */}
            <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📅 Monthly Usage</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Withdrawal</span>
                    <span className="font-semibold text-black">
                      ৳{limits.monthly.withdrawalUsed.toLocaleString()} / ৳{limits.monthly.withdrawalLimit.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-orange-500 h-3 rounded-full transition-all" 
                      style={{ width: `${(limits.monthly.withdrawalUsed / limits.monthly.withdrawalLimit) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Remaining: ৳{limits.monthly.withdrawalRemaining.toLocaleString()}
                  </p>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Transfer</span>
                    <span className="font-semibold text-black">
                      ৳{limits.monthly.transferUsed.toLocaleString()} / ৳{limits.monthly.transferLimit.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-purple-500 h-3 rounded-full transition-all" 
                      style={{ width: `${(limits.monthly.transferUsed / limits.monthly.transferLimit) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Remaining: ৳{limits.monthly.transferRemaining.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Limit Settings */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-6">⚙️ Update Transaction Limits</h2>

              <div className="space-y-6">
                {/* Daily Withdrawal Limit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Withdrawal Limit
                  </label>
                  <input
                    type="number"
                    value={dailyWithdrawalLimit}
                    onChange={(e) => setDailyWithdrawalLimit(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 text-black bg-white outline-none font-medium"
                  />
                  <p className="text-sm text-gray-500 mt-1">Maximum withdrawal amount per day</p>
                </div>

                {/* Daily Transfer Limit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Transfer Limit
                  </label>
                  <input
                    type="number"
                    value={dailyTransferLimit}
                    onChange={(e) => setDailyTransferLimit(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 text-black bg-white outline-none font-medium"
                  />
                  <p className="text-sm text-gray-500 mt-1">Maximum transfer amount per day</p>
                </div>

                {/* Monthly Withdrawal Limit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Withdrawal Limit
                  </label>
                  <input
                    type="number"
                    value={monthlyWithdrawalLimit}
                    onChange={(e) => setMonthlyWithdrawalLimit(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 text-black bg-white outline-none font-medium"
                  />
                  <p className="text-sm text-gray-500 mt-1">Maximum withdrawal amount per month</p>
                </div>

                {/* Monthly Transfer Limit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Transfer Limit
                  </label>
                  <input
                    type="number"
                    value={monthlyTransferLimit}
                    onChange={(e) => setMonthlyTransferLimit(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 text-black bg-white outline-none font-medium"
                  />
                  <p className="text-sm text-gray-500 mt-1">Maximum transfer amount per month</p>
                </div>
              </div>

              {message && (
                <div className="mt-6 bg-green-50 text-green-600 px-4 py-3 rounded-lg border border-green-100">
                  ✅ {message}
                </div>
              )}

              {error && (
                <div className="mt-6 bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-100">
                  ❌ {error}
                </div>
              )}

              <button
                onClick={handleSave}
                className="w-full mt-6 bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors shadow-md"
              >
                Save Limits
              </button>
            </div>

            {/* Info Area */}
            <div className="mt-6 bg-blue-50 p-5 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800 font-bold mb-2 flex items-center">
                <span className="mr-2">💡</span> Security Tips:
              </p>
              <ul className="text-sm text-blue-700 space-y-1 ml-4 list-disc">
                <li>Set limits based on your daily and monthly needs</li>
                <li>Lower limits provide better security</li>
                <li>You can change limits anytime</li>
                <li>Daily limits reset at midnight every day</li>
                <li>Monthly limits reset on the 1st of each month</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
