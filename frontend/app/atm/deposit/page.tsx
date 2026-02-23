'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Deposit() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const quickAmounts = [1000, 2000, 5000, 10000, 20000];

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem('atmToken');
      if (!token) {
        router.push('/atm/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/transactions/balance`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setBalance(data.balance);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const handleDeposit = async (depositAmount: number) => {
    setMessage('');
    setLoading(true);

    if (!depositAmount || depositAmount <= 0) {
      setMessage('Please enter a valid amount');
      setLoading(false);
      return;
    }

    if (depositAmount > 100000) {
      setMessage('Maximum deposit limit is ৳100,000');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('atmToken');
      if (!token) {
        router.push('/atm/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/transactions/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: depositAmount })
      });

      const data = await response.json();

      if (data.success) {
        setBalance(data.balance);
        setMessage(`Successfully deposited ৳${depositAmount}`);
        setAmount('');
        
        setTimeout(() => router.push('/atm/dashboard'), 2000);
      } else {
        setMessage(data.message || 'Deposit failed');
      }
    } catch (error) {
      console.error('Deposit error:', error);
      setMessage('Unable to process deposit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
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
          <div className="mb-6">
            <p className="text-gray-600 mb-2">Current Balance</p>
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
              placeholder="Enter amount to deposit"
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black bg-white font-semibold"
            />
          </div>

          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Quick Deposit</p>
            <div className="grid grid-cols-3 gap-3">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleDeposit(amt)}
                  disabled={loading}
                  className="bg-blue-100 text-blue-700 py-3 rounded-lg font-semibold hover:bg-blue-200 transition-colors disabled:opacity-50"
                >
                  ৳{amt}
                </button>
              ))}
            </div>
          </div>

          {message && (
            <div className={`mb-4 px-4 py-3 rounded-lg font-medium ${
              message.includes('Success') 
                ? 'bg-green-50 text-green-600 border border-green-100' 
                : 'bg-red-50 text-red-600 border border-red-100'
            }`}>
              {message}
            </div>
          )}

          <button
            onClick={() => handleDeposit(Number(amount))}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Deposit'}
          </button>

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
