'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

export default function Notifications() {
  const [notificationType, setNotificationType] = useState('all');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [targetUsers, setTargetUsers] = useState('all');

  const [sentNotifications] = useState([
    { id: 1, title: 'System Maintenance', message: 'Scheduled maintenance on Feb 20', type: 'System', target: 'All Users', sentAt: '2024-02-15 10:00 AM', status: 'Sent' },
    { id: 2, title: 'New Feature Alert', message: 'Check out our new currency converter', type: 'Feature', target: 'Active Users', sentAt: '2024-02-14 03:30 PM', status: 'Sent' },
    { id: 3, title: 'Security Alert', message: 'Update your PIN for better security', type: 'Security', target: 'All Users', sentAt: '2024-02-13 09:15 AM', status: 'Sent' },
    { id: 4, title: 'Transaction Limit Update', message: 'Daily withdrawal limit increased', type: 'Update', target: 'Premium Users', sentAt: '2024-02-12 11:45 AM', status: 'Sent' },
  ]);

  const handleSendNotification = (e) => {
    e.preventDefault();
    alert(`Notification sent to ${targetUsers}!\nTitle: ${notificationTitle}\nMessage: ${notificationMessage}`);
    setNotificationTitle('');
    setNotificationMessage('');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Notification Center</h1>
            <p className="text-gray-600">Send announcements and alerts to users</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Total Sent</p>
              <p className="text-2xl font-bold text-gray-800">{sentNotifications.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Today</p>
              <p className="text-2xl font-bold text-blue-600">2</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Delivery Rate</p>
              <p className="text-2xl font-bold text-green-600">98.5%</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Open Rate</p>
              <p className="text-2xl font-bold text-purple-600">85.2%</p>
            </div>
          </div>

          {/* Send Notification Form */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Send New Notification</h2>
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Type
                  </label>
                  <select
                    value={notificationType}
                    onChange={(e) => setNotificationType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="system">System</option>
                    <option value="security">Security</option>
                    <option value="feature">Feature</option>
                    <option value="update">Update</option>
                    <option value="promotion">Promotion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Users
                  </label>
                  <select
                    value={targetUsers}
                    onChange={(e) => setTargetUsers(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Title
                </label>
                <input
                  type="text"
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter notification title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter notification message"
                  required
                ></textarea>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  Send Notification
                </button>
                <button
                  type="button"
                  className="px-6 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>

          {/* Sent Notifications History */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Notification History</h2>
            <div className="space-y-3">
              {sentNotifications.map((notification) => (
                <div key={notification.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-800">{notification.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          notification.type === 'System' ? 'bg-blue-100 text-blue-800' :
                          notification.type === 'Security' ? 'bg-red-100 text-red-800' :
                          notification.type === 'Feature' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {notification.type}
                        </span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          {notification.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>👥 {notification.target}</span>
                        <span>📅 {notification.sentAt}</span>
                      </div>
                    </div>
                    <button className="ml-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-semibold">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
