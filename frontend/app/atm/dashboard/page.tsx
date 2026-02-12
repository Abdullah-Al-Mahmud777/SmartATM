'use client';

import { useRouter } from 'next/navigation';

export default function ATMDashboard() {
  const router = useRouter();
  const [balance] = [50000];

  const handleLogout = () => {
    localStorage.removeItem('atmUser');
    router.push('/');
  };

  const menuItems = [
    { title: 'Withdraw', icon: '💵', path: '/atm/withdraw', color: 'bg-green-500' },
    { title: 'Deposit', icon: '💰', path: '/atm/deposit', color: 'bg-blue-500' },
    { title: 'Transfer', icon: '💸', path: '/atm/transfer', color: 'bg-purple-500' },
    { title: 'Transaction History', icon: '📊', path: '/atm/transactionHistory', color: 'bg-orange-500' },
    { title: 'Change PIN', icon: '🔐', path: '/atm/changePin', color: 'bg-indigo-500' },
    { title: 'Block Card', icon: '🚫', path: '/atm/blockCard', color: 'bg-red-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">ATM Dashboard</h1>
            <p className="text-blue-100">Card: **** **** **** 1234</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-xl shadow-lg mb-8">
          <p className="text-blue-100 mb-2">Available Balance</p>
          <h2 className="text-4xl font-bold">৳{balance.toLocaleString()}</h2>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
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
    </div>
  );
}
