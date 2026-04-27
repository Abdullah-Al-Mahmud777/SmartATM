'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/useAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Deposit() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAmount, setPendingAmount] = useState(0);

  const quickAmounts = [1000, 2000, 5000, 10000, 20000];

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

  const initiateDeposit = (depositAmount: number) => {
    setMessage({ text: '', type: '' });
    if (!depositAmount || depositAmount <= 0) {
      setMessage({ text: 'Please enter a valid amount', type: 'error' });
      return;
    }
    if (depositAmount > 100000) {
      setMessage({ text: 'Maximum deposit limit is ৳1,00,000', type: 'error' });
      return;
    }
    setPendingAmount(depositAmount);
    setShowConfirm(true);
  };

  const handleDeposit = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      const token = localStorage.getItem('atmToken');
      const response = await fetch(`${API_URL}/api/transactions/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount: pendingAmount })
      });
      const data = await response.json();
      if (data.success) {
        setBalance(data.balance);
        setMessage({ text: `✅ Successfully deposited ৳${pendingAmount.toLocaleString()}`, type: 'success' });
        setAmount('');
        setTimeout(() => router.push('/atm/dashboard'), 2000);
      } else {
        setMessage({ text: data.message || 'Deposit failed', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Unable to process deposit. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar title="Deposit Money" />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl shadow-lg mb-6">
          <p className="text-blue-100 text-sm mb-1">Current Balance</p>
          <h2 className="text-4xl font-bold">
            {balanceLoading ? '...' : `৳${balance.toLocaleString()}`}
          </h2>
          {!balanceLoading && pendingAmount > 0 && (
            <p className="text-blue-200 text-sm mt-1">After deposit: ৳{(balance + pendingAmount).toLocaleString()}</p>
          )}
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
                placeholder="Enter amount to deposit"
                min="1"
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black outline-none"
              />
              <button
                onClick={() => initiateDeposit(Number(amount))}
                disabled={loading || !amount}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold disabled:opacity-50 transition"
              >
                {loading ? '...' : 'Deposit'}
              </button>
            </div>
          </div>

          {/* Quick Amounts */}
          <div className="mb-6">
            <p className="text-sm font-bold text-gray-700 mb-3">Quick Deposit</p>
            <div className="grid grid-cols-3 gap-3">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => initiateDeposit(amt)}
                  disabled={loading}
                  className="bg-blue-50 border-2 border-blue-200 hover:bg-blue-100 hover:border-blue-400 text-blue-700 py-3 rounded-lg font-bold disabled:opacity-50 transition"
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
            <p className="text-xs text-yellow-800">⚠️ Maximum deposit limit: ৳1,00,000 per transaction</p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Deposit</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-blue-600 text-xl">৳{pendingAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Balance After:</span>
                <span className="font-bold text-gray-800">৳{(balance + pendingAmount).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-bold transition">Cancel</button>
              <button onClick={handleDeposit} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
