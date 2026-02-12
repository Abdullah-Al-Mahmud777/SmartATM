'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Transfer() {
  const router = useRouter();
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [balance] = useState(50000);
  const [message, setMessage] = useState('');

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!accountNumber || !amount) {
      setMessage('Please fill all fields');
      return;
    }

    const transferAmount = Number(amount);

    if (transferAmount <= 0) {
      setMessage('Please enter a valid amount');
      return;
    }

    if (transferAmount > balance) {
      setMessage('Insufficient balance');
      return;
    }

    if (accountNumber.length < 10) {
      setMessage('Invalid account number');
      return;
    }

    setMessage(`Successfully transferred ৳${transferAmount} to account ${accountNumber}`);
    setTimeout(() => router.push('/atm/dashboard'), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-purple-600 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Transfer Money</h1>
          <button
            onClick={() => router.push('/atm/dashboard')}
            className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50"
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

          <form onSubmit={handleTransfer} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter recipient account number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount to transfer"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {message && (
              <div className={`px-4 py-3 rounded-lg ${message.includes('Success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Transfer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
