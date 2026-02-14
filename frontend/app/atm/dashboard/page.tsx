'use client';

import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CardStat from '@/components/CardStat';

export default function ATMDashboard() {
  const router = useRouter();
  const balance = 50000;
  const cardNumber = '1234567812345678';

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
        

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <CardStat
            title="Available Balance"
            value={`৳${balance.toLocaleString()}`}
            icon="💰"
            color="bg-gradient-to-r from-blue-600 to-purple-600"
          />
          <CardStat
            title="Card Number"
            value={`**** ${cardNumber.slice(-4)}`}
            icon="💳"
            color="bg-gradient-to-r from-green-600 to-teal-600"
          />
          <CardStat
            title="Account Status"
            value="Active"
            icon="✅"
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
      </div>
    </div>
  );
}
