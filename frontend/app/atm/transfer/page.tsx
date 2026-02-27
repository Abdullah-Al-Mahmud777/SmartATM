'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/useAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Transfer() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifiedAccount, setVerifiedAccount] = useState<any>(null);
  const [recentTransfers, setRecentTransfers] = useState<any[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBalance();
      fetchRecentTransfers();
    }
  }, [isAuthenticated]);

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem('atmToken');
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

  const fetchRecentTransfers = async () => {
    try {
      const token = localStorage.getItem('atmToken');
      const response = await fetch(`${API_URL}/api/transfer/history?limit=5&type=sent`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setRecentTransfers(data.transfers || []);
      }
    } catch (error) {
      console.error('Error fetching recent transfers:', error);
    }
  };

  const verifyAccount = async () => {
    if (!accountNumber || accountNumber.length < 10) {
      setMessage('Please enter a valid 10-digit account number');
      return;
    }

    if (user?.accountNumber === accountNumber) {
      setMessage('Cannot transfer to your own account');
      return;
    }

    setVerifying(true);
    setMessage('');
    setVerifiedAccount(null);

    try {
      const token = localStorage.getItem('atmToken');
      const response = await fetch(`${API_URL}/api/transfer/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ accountNumber })
      });

      const data = await response.json();

      if (data.success) {
        setVerifiedAccount(data.account);
        setMessage('');
      } else {
        setMessage(data.message || 'Account not found');
        setVerifiedAccount(null);
      }
    } catch (error) {
      console.error('Verify account error:', error);
      setMessage('Unable to verify account. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verifiedAccount) {
      setMessage('Please verify the account first');
      return;
    }

    setShowConfirmation(true);
  };

  const confirmTransfer = async () => {
    setMessage('');
    setLoading(true);
    setShowConfirmation(false);

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

    try {
      const token = localStorage.getItem('atmToken');
      const response = await fetch(`${API_URL}/api/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          toAccountNumber: accountNumber, 
          amount: transferAmount,
          description: `Transfer to ${verifiedAccount.name}`
        })
      });

      const data = await response.json();

      if (data.success) {
        setBalance(data.transfer.senderBalance);
        setMessage(`✅ Successfully transferred ৳${transferAmount.toLocaleString()} to ${verifiedAccount.name}`);
        setAccountNumber('');
        setAmount('');
        setVerifiedAccount(null);
        fetchRecentTransfers();
        
        setTimeout(() => router.push('/atm/dashboard'), 3000);
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

  const fillFromRecent = (transfer: any) => {
    setAccountNumber(transfer.recipientAccount);
    setVerifiedAccount({
      name: transfer.recipient,
      accountNumber: transfer.recipientAccount,
      status: 'Active'
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar title="Transfer Money" />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Transfer Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-gray-600 mb-2">Available Balance</p>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800">৳{balance.toLocaleString()}</h2>
              </div>

              <form onSubmit={handleTransfer} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Recipient Account Number
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => {
                        setAccountNumber(e.target.value.replace(/\D/g, ''));
                        setVerifiedAccount(null);
                      }}
                      placeholder="Enter 10-digit account number"
                      disabled={loading || verifying}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-black bg-white outline-none"
                      maxLength={10}
                    />
                    <button
                      type="button"
                      onClick={verifyAccount}
                      disabled={verifying || accountNumber.length < 10}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {verifying ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                  {verifiedAccount && (
                    <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 text-xl">✓</span>
                        <div>
                          <p className="font-bold text-green-800">{verifiedAccount.name}</p>
                          <p className="text-sm text-green-600">Account: {verifiedAccount.accountNumber}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Amount (৳)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount to transfer"
                    disabled={loading || !verifiedAccount}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-black bg-white outline-none"
                  />
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {[500, 1000, 2000, 5000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmount(preset.toString())}
                        disabled={loading || !verifiedAccount}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-semibold disabled:opacity-50"
                      >
                        ৳{preset}
                      </button>
                    ))}
                  </div>
                </div>

                {message && (
                  <div className={`px-4 py-3 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !verifiedAccount || !amount}
                  className="w-full bg-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Transfer Money'}
                </button>
              </form>

              <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-800">
                  <strong>💡 Note:</strong> Please verify the recipient account before transferring. Transfers are instant and cannot be reversed.
                </p>
              </div>
            </div>
          </div>

          {/* Recent Transfers Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Transfers</h3>
              {recentTransfers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent transfers</p>
              ) : (
                <div className="space-y-3">
                  {recentTransfers.map((transfer) => (
                    <div
                      key={transfer.transferId}
                      onClick={() => fillFromRecent(transfer)}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-300 cursor-pointer transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-bold text-gray-800">{transfer.recipient}</p>
                          <p className="text-sm text-gray-600">{transfer.recipientAccount}</p>
                          <p className="text-sm text-purple-600 font-semibold mt-1">৳{transfer.amount.toLocaleString()}</p>
                        </div>
                        <button className="text-purple-600 hover:text-purple-700">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => router.push('/atm/transactionHistory')}
                className="w-full mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition"
              >
                View All History
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 md:p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Confirm Transfer</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">To:</span>
                <span className="font-bold text-gray-800">{verifiedAccount?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Account:</span>
                <span className="font-bold text-gray-800">{accountNumber}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-purple-600 text-xl">৳{Number(amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">New Balance:</span>
                <span className="font-bold text-gray-800">৳{(balance - Number(amount)).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmTransfer}
                className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
