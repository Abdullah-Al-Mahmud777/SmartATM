'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Deposit() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  const quickAmounts = [1000, 2000, 5000, 10000, 20000];

  const handleDeposit = (depositAmount: number) => {
    setMessage('');

    if (!depositAmount || depositAmount <= 0) {
      setMessage('Please enter a valid amount');
      return;
    }

    if (depositAmount > 100000) {
      setMessage('Maximum deposit limit is ৳100,000');
      return;
    }

    setMessage(`Successfully deposited ৳${depositAmount}`);
    setAmount(''); // সাকসেস হলে ইনপুট ফিল্ড খালি হবে

    setTimeout(() => router.push('/atm/dashboard'), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Deposit Money</h1>
          <button
            onClick={() => router.push('/atm/dashboard')}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Back
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          {/* Input Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount to deposit"
              // এখানে text-black এবং bg-white যোগ করা হয়েছে
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black bg-white font-semibold"
            />
          </div>

          {/* Quick Deposit Buttons */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Quick Deposit</p>
            <div className="grid grid-cols-3 gap-3">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleDeposit(amt)}
                  className="bg-blue-100 text-blue-700 py-3 rounded-lg font-semibold hover:bg-blue-200 transition-colors"
                >
                  ৳{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mb-4 px-4 py-3 rounded-lg font-medium ${
              message.includes('Success') 
                ? 'bg-green-50 text-green-600 border border-green-100' 
                : 'bg-red-50 text-red-600 border border-red-100'
            }`}>
              {message}
            </div>
          )}

          {/* Main Deposit Button */}
          <button
            onClick={() => handleDeposit(Number(amount))}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
          >
            Deposit
          </button>

          {/* Info Note */}
          <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Maximum deposit limit is ৳100,000 per transaction
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}