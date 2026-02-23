'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, frozen: 0, blockedCards: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });

  // Notification function
  const showToast = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  // Fetch users from database
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        window.location.href = '/admin/login';
        return;
      }

      const response = await fetch(`${API_URL}/api/admin/users?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      console.log('API Response:', data); // Debug log

      if (data.success) {
        setUsers(data.users || []);
        setSummary(data.summary || { total: 0, active: 0, frozen: 0, blockedCards: 0 });
        
        // Refresh summary after setting users
        if (data.users && data.users.length > 0) {
          const total = data.users.length;
          const active = data.users.filter(u => u.status === 'Active').length;
          const frozen = data.users.filter(u => u.status === 'Frozen').length;
          const blockedCards = data.users.filter(u => u.cardStatus === 'Blocked').length;
          
          setSummary({ total, active, frozen, blockedCards });
        }
      } else {
        showToast('Failed to load users');
        console.error('API Error:', data.message);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleFreezeAccount = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const action = currentStatus === 'Active' ? 'freeze' : 'unfreeze';

      const response = await fetch(`${API_URL}/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        const updatedUsers = users.map(user => 
          user.id === userId ? { ...user, status: data.user.status } : user
        );
        setUsers(updatedUsers);
        
        // Update summary
        const total = updatedUsers.length;
        const active = updatedUsers.filter(u => u.status === 'Active').length;
        const frozen = updatedUsers.filter(u => u.status === 'Frozen').length;
        const blockedCards = updatedUsers.filter(u => u.cardStatus === 'Blocked').length;
        setSummary({ total, active, frozen, blockedCards });
        
        showToast(data.message);
      } else {
        showToast(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Error updating account status');
    }
  };

  const handleBlockCard = async (userId, currentCardStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const action = currentCardStatus === 'Active' ? 'block' : 'unblock';

      const response = await fetch(`${API_URL}/api/admin/users/${userId}/card-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        const updatedUsers = users.map(user => 
          user.id === userId ? { ...user, cardStatus: data.user.cardStatus } : user
        );
        setUsers(updatedUsers);
        
        // Update summary
        const total = updatedUsers.length;
        const active = updatedUsers.filter(u => u.status === 'Active').length;
        const frozen = updatedUsers.filter(u => u.status === 'Frozen').length;
        const blockedCards = updatedUsers.filter(u => u.cardStatus === 'Blocked').length;
        setSummary({ total, active, frozen, blockedCards });
        
        showToast(data.message);
      } else {
        showToast(data.message || 'Failed to update card status');
      }
    } catch (error) {
      console.error('Error updating card status:', error);
      showToast('Error updating card status');
    }
  };

  const handleResetPIN = async (userId) => {
    try {
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`${API_URL}/api/admin/users/${userId}/reset-pin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        showToast(data.message);
      } else {
        showToast(data.message || 'Failed to reset PIN');
      }
    } catch (error) {
      console.error('Error resetting PIN:', error);
      showToast('Error resetting PIN');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.accountNumber?.includes(searchTerm) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
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
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-2">User Management</h1>
                <p className="text-sm md:text-base text-gray-700">View and manage all registered users</p>
              </div>
              <Link href="/admin/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition text-center text-sm md:text-base">
                ← Back to Dashboard
              </Link>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
            <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-200">
              <p className="text-gray-500 text-xs md:text-sm font-medium mb-1">Total Users</p>
              <p className="text-2xl md:text-3xl font-bold text-black">{summary?.total || users.length || 0}</p>
            </div>
            <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-200">
              <p className="text-gray-500 text-xs md:text-sm font-medium mb-1">Active Users</p>
              <p className="text-2xl md:text-3xl font-bold text-green-600">{summary?.active || users.filter(u => u.status === 'Active').length || 0}</p>
            </div>
            <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-200">
              <p className="text-gray-500 text-xs md:text-sm font-medium mb-1">Frozen Accounts</p>
              <p className="text-2xl md:text-3xl font-bold text-red-600">{summary?.frozen || users.filter(u => u.status === 'Frozen').length || 0}</p>
            </div>
            <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-200">
              <p className="text-gray-500 text-xs md:text-sm font-medium mb-1">Blocked Cards</p>
              <p className="text-2xl md:text-3xl font-bold text-orange-600">{summary?.blockedCards || users.filter(u => u.cardStatus === 'Blocked').length || 0}</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm mb-6 border border-gray-200">
            <input
              type="text"
              placeholder="Search by name, account, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black text-sm md:text-base"
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-xs font-bold text-gray-600 uppercase">User Info</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-xs font-bold text-gray-600 uppercase">Account No</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-xs font-bold text-gray-600 uppercase">Balance</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-xs font-bold text-gray-600 uppercase">Status</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-xs font-bold text-gray-600 uppercase">Card</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-xs font-bold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition">
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <p className="font-bold text-black text-sm md:text-base">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-gray-900 font-medium text-sm md:text-base">{user.accountNumber}</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 font-bold text-black text-sm md:text-base">৳{user.balance?.toLocaleString() || 0}</td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                            user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                            user.cardStatus === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {user.cardStatus}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button 
                              onClick={() => handleFreezeAccount(user.id, user.status)} 
                              className={`px-2 md:px-3 py-1 rounded text-xs font-bold text-white transition whitespace-nowrap ${
                                user.status === 'Active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'
                              }`}
                            >
                              {user.status === 'Active' ? 'Freeze' : 'Unfreeze'}
                            </button>
                            <button 
                              onClick={() => handleBlockCard(user.id, user.cardStatus)} 
                              className={`px-2 md:px-3 py-1 rounded text-xs font-bold text-white transition whitespace-nowrap ${
                                user.cardStatus === 'Active' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'
                              }`}
                            >
                              {user.cardStatus === 'Active' ? 'Block' : 'Unblock'}
                            </button>
                            <button 
                              onClick={() => handleResetPIN(user.id)} 
                              className="px-2 md:px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-bold transition whitespace-nowrap"
                            >
                              Reset PIN
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500 text-sm md:text-base">
                        {searchTerm ? 'No users found matching your search' : 'No users registered yet'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-5 right-5 bg-black text-white px-4 md:px-6 py-2 md:py-3 rounded-lg shadow-2xl animate-bounce z-50 text-sm md:text-base">
          {toast.message}
        </div>
      )}
    </div>
  );
}