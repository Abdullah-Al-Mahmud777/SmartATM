'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = 'http://localhost:5000';

export default function Transfer() {
  const router = useRouter();
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    if (!accountNumber || !amount) {
      setMessage('Please fill all fields');
      setLoading(false);
      return;
    }

    const transferAmount = Number(amount);

    if (transferAmount <= 0) {
      setMessage('Please enter a valid amount');
      setLoading(false);
      return;
    }

    if (transferAmount > balance) {
      setMessage('Insufficient balance');
      setLoading(false);
      return;
    }

    if (accountNumber.length < 10) {
      setMessage('Invalid account number');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('atmToken');
      if (!token) {
        router.push('/atm/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/transactions/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          toAccountNumber: accountNumber, 
          amount: transferAmount 
        })
      });

      const data = await response.json();

      if (data.success) {
        setBalance(data.balance);
        setMessage(`Successfully transferred ৳${transferAmount} to ${data.transaction.recipient}`);
        setAccountNumber('');
        setAmount('');
        
        setTimeout(() => router.push('/atm/dashboard'), 2000);
      } else {
        setMessage(data.message || 'Transfer failed');
      }
    } catch (error) {
      console.error('Transfer error:', error);
      setMessage('Unable to process transfer. Please try again.');
    } finally {
      setLoading(false);
    }
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
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-black bg-white outline-none"
                maxLength={10}
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
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-black bg-white outline-none"
              />
            </div>

            {message && (
              <div className={`px-4 py-3 rounded-lg ${message.includes('Success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Transfer'}
            </button>
          </form>

          <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Please verify the account number before transferring
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
