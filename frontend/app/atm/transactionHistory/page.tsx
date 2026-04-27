'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/useAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  balanceAfter: number;
  description: string;
  date: string;
}

export default function TransactionHistory() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filtered, setFiltered] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    if (isAuthenticated) fetchTransactions();
  }, [isAuthenticated]);

  useEffect(() => {
    if (filterType === 'All') {
      setFiltered(transactions);
    } else {
      setFiltered(transactions.filter(t => t.type === filterType));
    }
  }, [filterType, transactions]);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('atmToken');
      const response = await fetch(`${API_URL}/api/transactions/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setTransactions(data.transactions);
        setFiltered(data.transactions);
      } else {
        setError(data.message || 'Failed to load transactions');
      }
    } catch (err) {
      setError('Unable to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'Withdraw': return 'text-red-600 bg-red-50 border border-red-200';
      case 'Deposit': return 'text-green-600 bg-green-50 border border-green-200';
      case 'Transfer': return 'text-blue-600 bg-blue-50 border border-blue-200';
      case 'Payment': return 'text-purple-600 bg-purple-50 border border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border border-gray-200';
    }
  };

  const getAmountColor = (type: string) => {
    return (type === 'Withdraw' || (type === 'Transfer')) ? 'text-red-600' : 'text-green-600';
  };

  const getAmountPrefix = (type: string, amount: number) => {
    if (type === 'Withdraw') return '-';
    if (type === 'Transfer') return amount < 0 ? '-' : '+';
    return '+';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (authLoading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar title="Transaction History" />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {['All', 'Withdraw', 'Deposit', 'Transfer', 'Payment'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                  filterType === type
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <span className="text-sm text-gray-500 font-medium">
            {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading transactions...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center text-red-600">
            <p className="text-xl font-semibold mb-2">⚠️ Error</p>
            <p>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl font-semibold text-gray-800 mb-2">No Transactions Found</p>
            <p className="text-gray-500">
              {filterType !== 'All' ? `No ${filterType} transactions yet` : 'Your transaction history will appear here'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filtered.map((t) => (
                <div key={t.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${getTypeColor(t.type)}`}>{t.type}</span>
                    <span className={`text-lg font-bold ${getAmountColor(t.type)}`}>
                      {getAmountPrefix(t.type, t.amount)}৳{Math.abs(t.amount).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{t.description}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{formatDate(t.date)} {formatTime(t.date)}</span>
                    <span className={`font-semibold ${t.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'}`}>{t.status}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['Transaction ID', 'Type', 'Amount', 'Balance After', 'Description', 'Date & Time', 'Status'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-xs font-mono text-gray-500">{t.id.slice(-8)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${getTypeColor(t.type)}`}>{t.type}</span>
                        </td>
                        <td className={`px-4 py-3 font-bold ${getAmountColor(t.type)}`}>
                          {getAmountPrefix(t.type, t.amount)}৳{Math.abs(t.amount).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">৳{t.balanceAfter.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{t.description}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div>{formatDate(t.date)}</div>
                          <div className="text-xs text-gray-400">{formatTime(t.date)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                            t.status === 'Completed' ? 'bg-green-100 text-green-700' :
                            t.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>{t.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between items-center">
                <p className="text-sm text-gray-600">Total: <span className="font-bold text-gray-900">{filtered.length}</span> transactions</p>
                <button onClick={fetchTransactions} className="text-sm text-orange-600 hover:text-orange-700 font-bold">↻ Refresh</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  balanceAfter: number;
  description: string;
  date: string;
}

export default function TransactionHistory() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('atmToken');
      if (!token) {
        router.push('/atm/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/transactions/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions);
      } else {
        setError(data.message || 'Failed to load transactions');
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Unable to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'Withdraw': return 'text-red-600 bg-red-50';
      case 'Deposit': return 'text-green-600 bg-green-50';
      case 'Transfer': return 'text-blue-600 bg-blue-50';
      case 'Payment': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-orange-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Transaction History</h1>
          <button
            onClick={() => router.push('/atm/dashboard')}
            className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-orange-50"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading transactions...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center text-red-600">
              <p className="text-xl font-semibold mb-2">Error</p>
              <p>{error}</p>
            </div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl font-semibold text-gray-800 mb-2">No Transactions Yet</p>
            <p className="text-gray-600">Your transaction history will appear here</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance After
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {transaction.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(transaction.type)}`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {transaction.type === 'Withdraw' || transaction.type === 'Transfer' ? '-' : '+'}৳{Math.abs(transaction.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ৳{transaction.balanceAfter.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div>{formatDate(transaction.date)}</div>
                        <div className="text-xs text-gray-500">{formatTime(transaction.date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Total Transactions: <span className="font-semibold text-gray-900">{transactions.length}</span>
                </p>
                <button
                  onClick={fetchTransactions}
                  className="text-sm text-orange-600 hover:text-orange-700 font-semibold"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
