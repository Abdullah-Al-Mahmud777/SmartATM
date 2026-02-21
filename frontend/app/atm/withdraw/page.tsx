'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = 'http://localhost:5000';

export default function Withdraw() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  // Fetch user balance on load
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

  const handleWithdraw = async (withdrawAmount: number) => {
    setMessage('');
    setLoading(true);

    if (!withdrawAmount || withdrawAmount <= 0) {
      setMessage('Please enter a valid amount');
      setLoading(false);
      return;
    }

    if (withdrawAmount > balance) {
      setMessage('Insufficient balance');
      setLoading(false);
      return;
    }

    if (withdrawAmount % 100 !== 0) {
      setMessage('Amount must be multiple of 100');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('atmToken');
      if (!token) {
        router.push('/atm/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/transactions/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: withdrawAmount })
      });

      const data = await response.json();

      if (data.success) {
        setBalance(data.balance);
        setMessage(`Successfully withdrawn ৳${withdrawAmount}`);
        setAmount('');
        
        setTimeout(() => router.push('/atm/dashboard'), 2000);
      } else {
        setMessage(data.message || 'Withdrawal failed');
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      setMessage('Unable to process withdrawal. Please try again.');
    } finally {
      setLoading(false);
    }
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
              disabled={loading}
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
                  disabled={loading}
                  className="bg-green-100 text-green-700 py-3 rounded-lg font-semibold hover:bg-green-200 transition-colors disabled:opacity-50"
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
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Withdraw'}
          </button>
        </div>
      </div>
    </div>
  );
}
