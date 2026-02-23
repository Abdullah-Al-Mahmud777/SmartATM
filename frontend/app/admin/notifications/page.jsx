'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Notifications() {
  const [notificationType, setNotificationType] = useState('System');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [targetUsers, setTargetUsers] = useState('all');
  const [priority, setPriority] = useState('Medium');
  const [sentNotifications, setSentNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [stats, setStats] = useState({
    totalSent: 0,
    today: 0,
    unreadCount: 0
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/notifications?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setSentNotifications(data.notifications || []);
        setStats({
          totalSent: data.notifications?.length || 0,
          today: data.notifications?.filter(n => {
            const today = new Date().toDateString();
            return new Date(n.createdAt).toDateString() === today;
          }).length || 0,
          unreadCount: data.unreadCount || 0
        });
      }
    } catch (error) {
      console.error('Fetch notifications error:', error);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: notificationType,
          priority,
          title: notificationTitle,
          message: notificationMessage,
          metadata: { targetUsers }
        })
      });

      const data = await response.json();

      if (data.success) {
        showToast('Notification sent successfully!', 'success');
        setNotificationTitle('');
        setNotificationMessage('');
        fetchNotifications();
      } else {
        showToast(data.message || 'Failed to send notification', 'error');
      }
    } catch (error) {
      console.error('Send notification error:', error);
      showToast('Failed to send notification', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Toast Notification */}
          {toast.show && (
            <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white font-semibold animate-slideIn`}>
              {toast.message}
            </div>
          )}

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-black mb-2">Notification Center</h1>
            <p className="text-black opacity-80">Send announcements and alerts to users</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Sent', value: stats.totalSent, color: 'text-black' },
              { label: 'Today', value: stats.today, color: 'text-blue-600' },
              { label: 'Unread', value: stats.unreadCount, color: 'text-orange-600' },
              { label: 'Delivery Rate', value: '98.5%', color: 'text-green-600' },
            ].map((stat, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow">
                <p className="text-black text-sm font-medium">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Send Notification Form */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-black mb-4">Send New Notification</h2>
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Notification Type
                  </label>
                  <select
                    value={notificationType}
                    onChange={(e) => setNotificationType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value="System">System</option>
                    <option value="Security">Security</option>
                    <option value="Transaction">Transaction</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Promotion">Promotion</option>
                    <option value="ATM">ATM</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Target Users
                  </label>
                  <select
                    value={targetUsers}
                    onChange={(e) => setTargetUsers(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value="all">All Users</option>
                    <option value="active">Active Users</option>
                    <option value="premium">Premium Users</option>
                    <option value="inactive">Inactive Users</option>
                    <option value="new">New Users</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Notification Title
                </label>
                <input
                  type="text"
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Enter notification title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Message
                </label>
                <textarea
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Enter notification message"
                  required
                ></textarea>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold py-3 rounded-lg transition`}
                >
                  {loading ? 'Sending...' : 'Send Notification'}
                </button>
              </div>
            </form>
          </div>

          {/* Sent Notifications History */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-black mb-4">Notification History</h2>
            {sentNotifications.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No notifications sent yet</p>
            ) : (
              <div className="space-y-3">
                {sentNotifications.map((notification) => (
                  <div key={notification.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-black">{notification.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            notification.type === 'System' ? 'bg-blue-100 text-blue-800' :
                            notification.type === 'Security' ? 'bg-red-100 text-red-800' :
                            notification.type === 'Transaction' ? 'bg-green-100 text-green-800' :
                            notification.type === 'Emergency' ? 'bg-red-100 text-red-800' :
                            notification.type === 'ATM' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {notification.type}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            notification.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                            notification.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                            notification.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {notification.priority}
                          </span>
                        </div>
                        <p className="text-sm text-black mb-2 font-medium">{notification.message}</p>
                        <div className="flex items-center gap-4 text-xs text-black font-semibold">
                          <span>📅 {formatDate(notification.createdAt)}</span>
                          <span className={notification.isRead ? 'text-gray-500' : 'text-green-600'}>
                            {notification.isRead ? '✓ Read' : '● Unread'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
