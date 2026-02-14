'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Withdraw() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(50000); // ব্যালেন্স আপডেট করার জন্য state ব্যবহার করা হয়েছে
  const [message, setMessage] = useState('');

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  const handleWithdraw = (withdrawAmount: number) => {
    setMessage('');

    if (!withdrawAmount || withdrawAmount <= 0) {
      setMessage('Please enter a valid amount');
      return;
    }

    if (withdrawAmount > balance) {
      setMessage('Insufficient balance');
      return;
    }

    if (withdrawAmount % 100 !== 0) {
      setMessage('Amount must be multiple of 100');
      return;
    }

    setBalance(prev => prev - withdrawAmount);
    setMessage(`Successfully withdrawn ৳${withdrawAmount}`);
    setAmount(''); // সাকসেস হওয়ার পর ইনপুট খালি হবে
    
    setTimeout(() => router.push('/atm/dashboard'), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-green-600 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Withdraw Money</h1>
          <button
            onClick={() => router.push('/atm/dashboard')}
            className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50"
          >
            Back
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="mb-6">
            <p className="text-gray-600 mb-2">Available Balance</p>
            <h2 className="text-3xl font-bold text-gray-800">৳{balance.toLocaleString()}</h2>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              /* এখানে text-black এবং bg-white যোগ করা হয়েছে যাতে লিখা কালো দেখায় */
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-black bg-white outline-none"
            />
          </div>

          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Quick Withdraw</p>
            <div className="grid grid-cols-3 gap-3">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleWithdraw(amt)}
                  className="bg-green-100 text-green-700 py-3 rounded-lg font-semibold hover:bg-green-200 transition-colors"
                >
                  ৳{amt}
                </button>
              ))}
            </div>
          </div>

          {message && (
            <div className={`mb-4 px-4 py-3 rounded-lg ${message.includes('Success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {message}
            </div>
          )}

          <button
            onClick={() => handleWithdraw(Number(amount))}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md"
          >
            Withdraw
          </button>
        </div>
      </div>
    </div>
  );
}