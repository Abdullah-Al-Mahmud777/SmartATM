'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LimitSettings() {
  const router = useRouter();
  const [dailyLimit, setDailyLimit] = useState('50000');
  const [withdrawLimit, setWithdrawLimit] = useState('20000');
  const [transferLimit, setTransferLimit] = useState('100000');
  const [message, setMessage] = useState('');

  const handleSave = () => {
    setMessage('Limits updated successfully!');
    setTimeout(() => setMessage(''), 3000);
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
        {/* Current Usage */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Today's Usage</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Withdrawal</span>
                <span className="font-semibold text-black">৳5,000 / ৳20,000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Transfer</span>
                <span className="font-semibold text-black">৳30,000 / ৳100,000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-blue-500 h-3 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Limit Settings */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Set Transaction Limits</h2>

          <div className="space-y-6">
            {/* Daily Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Transaction Limit
              </label>
              <input
                type="number"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
                // এখানে text-black এবং bg-white যোগ করা হয়েছে
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 text-black bg-white outline-none font-medium"
              />
              <p className="text-sm text-gray-500 mt-1">Maximum total transactions per day</p>
            </div>

            {/* Withdrawal Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Withdrawal Limit
              </label>
              <input
                type="number"
                value={withdrawLimit}
                onChange={(e) => setWithdrawLimit(e.target.value)}
                // এখানেও text-black এবং bg-white যোগ করা হয়েছে
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 text-black bg-white outline-none font-medium"
              />
              <p className="text-sm text-gray-500 mt-1">Maximum withdrawal amount per day</p>
            </div>

            {/* Transfer Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Transfer Limit
              </label>
              <input
                type="number"
                value={transferLimit}
                onChange={(e) => setTransferLimit(e.target.value)}
                // এখানেও text-black এবং bg-white যোগ করা হয়েছে
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 text-black bg-white outline-none font-medium"
              />
              <p className="text-sm text-gray-500 mt-1">Maximum transfer amount per day</p>
            </div>
          </div>

          {message && (
            <div className="mt-6 bg-green-50 text-green-600 px-4 py-3 rounded-lg border border-green-100">
              {message}
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
            <li>Set limits based on your daily needs</li>
            <li>Lower limits provide better security</li>
            <li>You can change limits anytime</li>
            <li>Limits reset at midnight every day</li>
          </ul>
        </div>
      </div>
    </div>
  );
}