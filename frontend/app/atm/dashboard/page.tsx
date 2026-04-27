'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import CardStat from '@/components/CardStat';
import { useAuth } from '@/lib/useAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ATMDashboard() {
  const router = useRouter();
  const { isAuthenticated, loading, user, logout } = useAuth();
  const [balance, setBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBalance();
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
    } finally {
      setLoadingBalance(false);
    }
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, useAuth hook will redirect to login
  if (!isAuthenticated) {
    return null;
  }

  const mainMenuItems = [
    { title: 'Withdraw', icon: '💵', path: '/atm/withdraw', color: 'bg-green-500' },
    { title: 'Deposit', icon: '💰', path: '/atm/deposit', color: 'bg-blue-500' },
    { title: 'Transfer', icon: '💸', path: '/atm/transfer', color: 'bg-purple-500' },
    { title: 'Payment Gateway', icon: '💳', path: '/atm/payment', color: 'bg-teal-500' },
    { title: 'Transaction History', icon: '📊', path: '/atm/transactionHistory', color: 'bg-orange-500' },
    { title: 'Change PIN', icon: '🔐', path: '/atm/changePin', color: 'bg-indigo-500' },
  ];

  const smartFeatures = [
    { title: 'AI Chatbot', icon: '🤖', path: '/atm/chatbot', color: 'bg-cyan-500' },
    { title: 'Receipt Generator', icon: '📄', path: '/atm/receipt', color: 'bg-indigo-500' },
    { title: 'Analytics', icon: '📈', path: '/atm/analytics', color: 'bg-purple-500' },
    { title: 'Currency Converter', icon: '💱', path: '/atm/converter', color: 'bg-teal-500' },
    { title: 'Set Limits', icon: '⚙️', path: '/atm/limits', color: 'bg-pink-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar title="ATM Dashboard" />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Emergency Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/atm/emergency')}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition"
          >
            🚨 Emergency Services (Card Block / Fraud Report)
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <CardStat
            title="Available Balance"
            value={loadingBalance ? 'Loading...' : `৳${balance.toLocaleString()}`}
            icon="💰"
            color="bg-gradient-to-r from-blue-600 to-purple-600"
          />
          <CardStat
            title="Card Number"
            value={user?.cardNumber ? `**** ${user.cardNumber.slice(-4)}` : '****'}
            icon="💳"
            color="bg-gradient-to-r from-green-600 to-teal-600"
          />
          <CardStat
            title="Account Holder"
            value={user?.name || 'User'}
            icon="👤"
            color="bg-gradient-to-r from-orange-600 to-red-600"
          />
        </div>

        {/* Main Menu */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Main Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainMenuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`${item.color} text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all`}
              >
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
              </button>
            ))}
          </div>
        </div>

        {/* Smart Features */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">🌟 Smart Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {smartFeatures.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`${item.color} text-white p-5 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all`}
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
              </button>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-8 text-center">
          <button
            onClick={logout}
            className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-lg"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
}
