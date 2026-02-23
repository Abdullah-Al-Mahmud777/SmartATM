'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ total: 0, completed: 0, pending: 0, totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [showDetails, setShowDetails] = useState(null);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchInput, setSearchInput] = useState(''); // For input field

  useEffect(() => {
    fetchTransactions();
  }, [filterType, filterStatus]); // Remove searchTerm from dependencies

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        window.location.href = '/admin/login';
        return;
      }

      const params = new URLSearchParams({
        limit: '100',
        ...(filterType !== 'All' && { type: filterType }),
        ...(filterStatus !== 'All' && { status: filterStatus }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`${API_URL}/api/admin/transactions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions || []);
        setSummary(data.summary || { total: 0, completed: 0, pending: 0, totalAmount: 0 });
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions;

  // Get unique accounts with user names for filter
  const uniqueAccountsWithNames = transactions.reduce((acc, t) => {
    if (t.account && !acc.find(item => item.account === t.account)) {
      acc.push({
        account: t.account,
        name: t.user
      });
    }
    return acc;
  }, []).sort((a, b) => a.name.localeCompare(b.name));

  // Handle search input change with suggestions
  const handleSearchChange = (value) => {
    setSearchInput(value); // Update input immediately
    
    if (value.length > 0) {
      // Find matching accounts or names for suggestions
      const matches = uniqueAccountsWithNames.filter(item => 
        item.account.includes(value) || 
        item.name.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      
      setSearchSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Select suggestion
  const selectSuggestion = (item) => {
    setSearchInput(item.account);
    setShowSuggestions(false);
  };

  // Handle search button click
  const handleSearch = () => {
    setSearchTerm(searchInput);
    setShowSuggestions(false);
    fetchTransactions();
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Filter by selected account
  const displayTransactions = selectedAccount 
    ? filteredTransactions.filter(t => t.account === selectedAccount)
    : filteredTransactions;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading transactions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-4 md:p-6 w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 mt-16 lg:mt-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-2">Transaction Management</h1>
                <p className="text-sm md:text-base text-gray-700">View and monitor all transactions</p>
              </div>
              <Link href="/admin/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold text-center text-sm md:text-base">
                ← Back to Dashboard
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
            <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-200">
              <p className="text-gray-500 text-xs md:text-sm font-medium mb-1">Total Transactions</p>
              <p className="text-2xl md:text-3xl font-bold text-black">{summary.total || filteredTransactions.length}</p>
            </div>
            <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-200">
              <p className="text-gray-500 text-xs md:text-sm font-medium mb-1">Completed</p>
              <p className="text-2xl md:text-3xl font-bold text-green-600">{summary.completed || filteredTransactions.filter(t => t.status === 'Completed').length}</p>
            </div>
            <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-200">
              <p className="text-gray-500 text-xs md:text-sm font-medium mb-1">Pending</p>
              <p className="text-2xl md:text-3xl font-bold text-yellow-600">{summary.pending || filteredTransactions.filter(t => t.status === 'Pending').length}</p>
            </div>
            <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-200">
              <p className="text-gray-500 text-xs md:text-sm font-medium mb-1">Total Amount</p>
              <p className="text-2xl md:text-3xl font-bold text-purple-600">৳{(summary.totalAmount || 0).toLocaleString()}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm mb-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
              {/* Search with Button */}
              <div className="relative lg:col-span-2">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Search by ID, user, or account..."
                      value={searchInput}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onKeyPress={handleKeyPress}
                      onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black text-sm md:text-base outline-none"
                    />
                    
                    {/* Search Suggestions Dropdown */}
                    {showSuggestions && searchSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {searchSuggestions.map((item, index) => (
                          <div
                            key={index}
                            onClick={() => selectSuggestion(item)}
                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-bold text-black text-sm">{item.name}</div>
                            <div className="text-xs text-gray-600">Account: {item.account}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Search Button */}
                  <button
                    onClick={handleSearch}
                    className="px-4 md:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition text-sm md:text-base whitespace-nowrap"
                  >
                    🔍 Search
                  </button>
                </div>
              </div>
              
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black text-sm md:text-base outline-none"
              >
                <option value="">All Accounts</option>
                {uniqueAccountsWithNames.map(item => (
                  <option key={item.account} value={item.account}>
                    {item.name} - {item.account}
                  </option>
                ))}
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black text-sm md:text-base outline-none"
              >
                <option value="All">All Types</option>
                <option value="Withdraw">Withdraw</option>
                <option value="Deposit">Deposit</option>
                <option value="Transfer">Transfer</option>
                <option value="Payment">Payment</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black text-sm md:text-base outline-none"
              >
                <option value="All">All Status</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
            
            {/* Active Filters Display */}
            {selectedAccount && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600">Filtering by:</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold flex items-center gap-2">
                  {uniqueAccountsWithNames.find(item => item.account === selectedAccount)?.name} - {selectedAccount}
                  <button 
                    onClick={() => setSelectedAccount('')}
                    className="hover:bg-blue-200 rounded-full p-1"
                  >
                    ✕
                  </button>
                </span>
              </div>
            )}
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[900px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-xs font-bold text-gray-600 uppercase">Transaction ID</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-xs font-bold text-gray-600 uppercase">User</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-xs font-bold text-gray-600 uppercase">Account</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-xs font-bold text-gray-600 uppercase">Type</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-xs font-bold text-gray-600 uppercase">Amount</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-xs font-bold text-gray-600 uppercase">Status</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-xs font-bold text-gray-600 uppercase">Date & Time</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-xs font-bold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {displayTransactions.length > 0 ? (
                    displayTransactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-gray-50 transition">
                        <td className="px-3 md:px-6 py-3 md:py-4 font-mono text-xs md:text-sm text-black font-medium">{txn.id}</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 font-bold text-black text-sm md:text-base">{txn.user}</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-black font-medium text-sm md:text-base">{txn.account}</td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                            txn.type === 'Withdraw' ? 'bg-red-100 text-red-700' :
                            txn.type === 'Deposit' ? 'bg-green-100 text-green-700' :
                            txn.type === 'Transfer' ? 'bg-blue-100 text-blue-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {txn.type}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 font-bold text-black text-sm md:text-base">৳{txn.amount?.toLocaleString() || 0}</td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                            txn.status === 'Completed' ? 'bg-green-100 text-green-700' :
                            txn.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {txn.status}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-black">
                          <div className="font-bold">{txn.date}</div>
                          <div className="text-xs opacity-70">{txn.time}</div>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <button
                            onClick={() => setShowDetails(txn)}
                            className="px-2 md:px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition whitespace-nowrap"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-gray-500 text-sm md:text-base">
                        {searchTerm || filterType !== 'All' || filterStatus !== 'All' || selectedAccount
                          ? 'No transactions found matching your filters' 
                          : 'No transactions yet'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-black">Transaction Details</h2>
                <button
                  onClick={() => setShowDetails(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Transaction ID</p>
                    <p className="font-mono font-bold text-black">{showDetails.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      showDetails.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      showDetails.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {showDetails.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">User Name</p>
                    <p className="font-bold text-black">{showDetails.user}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Account Number</p>
                    <p className="font-bold text-black">{showDetails.account}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Transaction Type</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      showDetails.type === 'Withdraw' ? 'bg-red-100 text-red-700' :
                      showDetails.type === 'Deposit' ? 'bg-green-100 text-green-700' :
                      showDetails.type === 'Transfer' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {showDetails.type}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="text-2xl font-bold text-black">৳{showDetails.amount?.toLocaleString() || 0}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-bold text-black">{showDetails.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-bold text-black">{showDetails.time}</p>
                  </div>
                </div>

                {showDetails.description && (
                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="text-black">{showDetails.description}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowDetails(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black rounded-lg font-semibold transition"
                >
                  Close
                </button>
                <button
                  onClick={() => setSelectedAccount(showDetails.account)}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                >
                  View All from This Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
