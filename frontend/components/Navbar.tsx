'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface NavbarProps {
  title?: string;
  showLogout?: boolean;
  showNotifications?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Navbar({ title = 'ATM System', showLogout = true, showNotifications = true }: NavbarProps) {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (showNotifications) {
      fetchUnreadCount();
      fetchNotifications();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [showNotifications]);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('atmToken');
      if (!token) {
        console.log('❌ No token found for notifications');
        return;
      }

      console.log('🔔 Fetching unread count...');
      const response = await fetch(`${API_URL}/api/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Unread count data:', data);
      
      if (data.success) {
        setUnreadCount(data.unreadCount);
        console.log('✅ Unread count:', data.unreadCount);
      } else {
        console.error('❌ Failed to fetch unread count:', data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('atmToken');
      if (!token) {
        console.log('❌ No token found for notifications list');
        return;
      }

      console.log('📋 Fetching notifications list...');
      const response = await fetch(`${API_URL}/api/notifications?limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Notifications response status:', response.status);
      const data = await response.json();
      console.log('Notifications data:', data);
      
      if (data.success) {
        setNotifications(data.notifications || []);
        console.log('✅ Loaded notifications:', data.notifications?.length || 0);
      } else {
        console.error('❌ Failed to fetch notifications:', data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('atmToken');
      await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      fetchUnreadCount();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('atmUser');
    localStorage.removeItem('atmToken');
    router.push('/');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-lg relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {showNotifications && (
            <div className="relative">
              <button
                onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                className="relative p-2 hover:bg-blue-700 rounded-lg transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Panel */}
              {showNotificationPanel && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800">Notifications</h3>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => !notif.isRead && markAsRead(notif.id)}
                          className={`p-4 hover:bg-gray-50 cursor-pointer ${
                            !notif.isRead ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-800 text-sm">{notif.title}</h4>
                                {!notif.isRead && (
                                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mb-1">{notif.message}</p>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  notif.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                                  notif.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                                  notif.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {notif.priority}
                                </span>
                                <span className="text-xs text-gray-500">{formatDate(notif.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="p-3 border-t border-gray-200 text-center">
                    <button
                      onClick={() => {
                        setShowNotificationPanel(false);
                        router.push('/atm/notifications');
                      }}
                      className="text-blue-600 text-sm font-semibold hover:underline"
                    >
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {showLogout && (
            <button
              onClick={handleLogout}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
