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

  const handleFreezeAccount = (userId) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: user.status === 'Active' ? 'Frozen' : 'Active' } : user
    ));
  };

  const handleBlockCard = (userId) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, cardStatus: user.cardStatus === 'Active' ? 'Blocked' : 'Active' } : user
    ));
  };

  const handleResetPIN = (userId) => {
    alert(`PIN reset for user ID: ${userId}`);
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
            <h1 className="text-4xl font-bold text-gray-800 mb-2">User Management</h1>
            <p className="text-gray-600">View and manage all registered users</p>
          </div>
          <Link href="/admin/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total Users</p>
            <p className="text-2xl font-bold text-gray-800">{users.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Active Users</p>
            <p className="text-2xl font-bold text-green-600">{users.filter(u => u.status === 'Active').length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Frozen Accounts</p>
            <p className="text-2xl font-bold text-red-600">{users.filter(u => u.status === 'Frozen').length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Blocked Cards</p>
            <p className="text-2xl font-bold text-orange-600">{users.filter(u => u.cardStatus === 'Blocked').length}</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <input
            type="text"
            placeholder="Search by name, account number, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Card</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-800">{user.account}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{user.balance}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.cardStatus === 'Active' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {user.cardStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.joined}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFreezeAccount(user.id)}
                          className={`px-3 py-1 rounded text-xs font-semibold ${
                            user.status === 'Active' 
                              ? 'bg-red-500 hover:bg-red-600 text-white' 
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          {user.status === 'Active' ? 'Freeze' : 'Unfreeze'}
                        </button>
                        <button
                          onClick={() => handleBlockCard(user.id)}
                          className={`px-3 py-1 rounded text-xs font-semibold ${
                            user.cardStatus === 'Active' 
                              ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}
                        >
                          {user.cardStatus === 'Active' ? 'Block' : 'Unblock'}
                        </button>
                        <button
                          onClick={() => handleResetPIN(user.id)}
                          className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-xs font-semibold"
                        >
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
    </div>
  );
}
