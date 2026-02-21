'use client';

import { useState } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';

export default function Users() {
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', account: '1234567890', email: 'john@example.com', balance: '৳50,000', status: 'Active', cardStatus: 'Active', joined: '2024-01-15' },
    { id: 2, name: 'Jane Smith', account: '0987654321', email: 'jane@example.com', balance: '৳75,000', status: 'Active', cardStatus: 'Active', joined: '2024-01-20' },
    { id: 3, name: 'Mike Johnson', account: '5678901234', email: 'mike@example.com', balance: '৳30,000', status: 'Frozen', cardStatus: 'Blocked', joined: '2024-02-01' },
    { id: 4, name: 'Sarah Williams', account: '4321098765', email: 'sarah@example.com', balance: '৳90,000', status: 'Active', cardStatus: 'Active', joined: '2024-02-05' },
    { id: 5, name: 'Chris Brown', account: '6789012345', email: 'chris@example.com', balance: '৳45,000', status: 'Active', cardStatus: 'Active', joined: '2024-02-10' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });

  // Notification ফাংশন
  const showToast = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleFreezeAccount = (userId) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: user.status === 'Active' ? 'Frozen' : 'Active' } : user
    ));
    showToast("Account status updated!");
  };

  const handleBlockCard = (userId) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, cardStatus: user.cardStatus === 'Active' ? 'Blocked' : 'Active' } : user
    ));
    showToast("Card status updated!");
  };

  const handleResetPIN = (userId) => {
    showToast(`PIN reset link sent for user ID: ${userId}`);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.account.includes(searchTerm) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-black mb-2">User Management</h1>
              <p className="text-gray-700">View and manage all registered users</p>
            </div>
            <Link href="/admin/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition">
              ← Back to Dashboard
            </Link>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <p className="text-gray-500 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-black">{users.length}</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <p className="text-gray-500 text-sm font-medium">Active Users</p>
              <p className="text-3xl font-bold text-green-600">{users.filter(u => u.status === 'Active').length}</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <p className="text-gray-500 text-sm font-medium">Frozen Accounts</p>
              <p className="text-3xl font-bold text-red-600">{users.filter(u => u.status === 'Frozen').length}</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <p className="text-gray-500 text-sm font-medium">Blocked Cards</p>
              <p className="text-3xl font-bold text-orange-600">{users.filter(u => u.cardStatus === 'Blocked').length}</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-200">
            <input
              type="text"
              placeholder="Search by name, account, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">User Info</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">Account No</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">Balance</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">Card</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <p className="font-bold text-black">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">{user.account}</td>
                      <td className="px-6 py-4 font-bold text-black">{user.balance}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          user.cardStatus === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {user.cardStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleFreezeAccount(user.id)} className={`px-3 py-1 rounded text-xs font-bold text-white transition ${user.status === 'Active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'}`}>
                            {user.status === 'Active' ? 'Freeze' : 'Unfreeze'}
                          </button>
                          <button onClick={() => handleBlockCard(user.id)} className={`px-3 py-1 rounded text-xs font-bold text-white transition ${user.cardStatus === 'Active' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            {user.cardStatus === 'Active' ? 'Block' : 'Unblock'}
                          </button>
                          <button onClick={() => handleResetPIN(user.id)} className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-bold transition">
                            Reset PIN
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-5 right-5 bg-black text-white px-6 py-3 rounded-lg shadow-2xl animate-bounce">
          {toast.message}
        </div>
      )}
    </div>
  );
}