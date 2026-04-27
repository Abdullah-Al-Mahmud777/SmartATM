'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/useAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Withdraw() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAmount, setPendingAmount] = useState(0);

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  useEffect(() => {
    if (isAuthenticated) fetchBalance();
  }, [isAuthenticated]);

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem('atmToken');
      const response = await fetch(`${API_URL}/api/transactions/balance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setBalance(data.balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setBalanceLoading(false);
    }
  };

  const initiateWithdraw = (withdrawAmount: number) => {
    setMessage({ text: '', type: '' });
    if (!withdrawAmount || withdrawAmount <= 0) {
      setMessage({ text: 'Please enter a valid amount', type: 'error' });
      return;
    }
    if (withdrawAmount > balance) {
      setMessage({ text: 'Insufficient balance', type: 'error' });
      return;
    }
    if (withdrawAmount % 100 !== 0) {
      setMessage({ text: 'Amount must be a multiple of 100', type: 'error' });
      return;
    }
    setPendingAmount(withdrawAmount);
    setShowConfirm(true);
  };

  const handleWithdraw = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      const token = localStorage.getItem('atmToken');
      const response = await fetch(`${API_URL}/api/transactions/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount: pendingAmount })
      });
      const data = await response.json();
      if (data.success) {
        setBalance(data.balance);
        setMessage({ text: `✅ Successfully withdrawn ৳${pendingAmount.toLocaleString()}`, type: 'success' });
        setAmount('');
        setTimeout(() => router.push('/atm/dashboard'), 2000);
      } else {
        setMessage({ text: data.message || 'Withdrawal failed', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Unable to process withdrawal. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar title="Withdraw Money" />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 rounded-xl shadow-lg mb-6">
          <p className="text-green-100 text-sm mb-1">Available Balance</p>
          <h2 className="text-4xl font-bold">
            {balanceLoading ? '...' : `৳${balance.toLocaleString()}`}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          {/* Custom Amount */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">Enter Amount</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount (multiple of 100)"
                min="100"
                step="100"
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-black outline-none"
              />
              <button
                onClick={() => initiateWithdraw(Number(amount))}
                disabled={loading || !amount}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold disabled:opacity-50 transition"
              >
                {loading ? '...' : 'Withdraw'}
              </button>
            </div>
          </div>

          {/* Quick Amounts */}
          <div className="mb-6">
            <p className="text-sm font-bold text-gray-700 mb-3">Quick Withdraw</p>
            <div className="grid grid-cols-3 gap-3">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => initiateWithdraw(amt)}
                  disabled={loading || amt > balance}
                  className="bg-green-50 border-2 border-green-200 hover:bg-green-100 hover:border-green-400 text-green-700 py-3 rounded-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  ৳{amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {message.text && (
            <div className={`px-4 py-3 rounded-lg font-medium ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <div className="mt-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-800">⚠️ Amounts must be multiples of ৳100. Max single withdrawal: ৳50,000</p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Withdrawal</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-green-600 text-xl">৳{pendingAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Balance After:</span>
                <span className="font-bold text-gray-800">৳{(balance - pendingAmount).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-bold transition">Cancel</button>
              <button onClick={handleWithdraw} className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
