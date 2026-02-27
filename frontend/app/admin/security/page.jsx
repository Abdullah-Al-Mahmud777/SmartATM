'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';
import { fetchWithAuth } from '@/lib/adminAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Add animation styles
const styles = `
  @keyframes slide-in {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  .animate-slide-in {
    animation: slide-in 0.3s ease-out;
  }
`;

export default function Security() {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [resolvingId, setResolvingId] = useState(null);

  useEffect(() => {
    fetchEmergencies();
  }, [filterType, filterStatus]);

  const fetchEmergencies = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        limit: '100',
        ...(filterType !== 'All' && { type: filterType }),
        ...(filterStatus !== 'All' && { status: filterStatus })
      });

      const data = await fetchWithAuth(`${API_URL}/api/admin/emergencies?${params}`);
      
      if (data && data.success) {
        console.log('Fetched emergencies:', data.emergencies);
        setEmergencies(data.emergencies || []);
      }
    } catch (error) {
      console.error('Error fetching emergencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 5000);
  };

  const handleResolve = async (emergencyId) => {
    if (!confirm('Are you sure you want to mark this emergency as resolved?')) {
      return;
    }

    setResolvingId(emergencyId);

    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        showNotification('Please login again', 'error');
        setTimeout(() => window.location.href = '/admin/login', 2000);
        return;
      }

      console.log('=== Resolving Emergency ===');
      console.log('Emergency ID:', emergencyId);
      console.log('API URL:', `${API_URL}/api/admin/emergencies/${emergencyId}/resolve`);

      const response = await fetch(`${API_URL}/api/admin/emergencies/${emergencyId}/resolve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          actionTaken: 'Resolved by admin'
        })
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        showNotification('Server error. Please try again later.', 'error');
        setResolvingId(null);
        return;
      }

      const data = await response.json();

      console.log('Response status:', response.status);
      console.log('Response data:', data);

      if (response.ok && data.success) {
        showNotification('Emergency resolved successfully!', 'success');
        fetchEmergencies();
      } else {
        if (response.status === 403) {
          showNotification('Permission denied. Contact super admin.', 'error');
        } else if (response.status === 404) {
          showNotification('Emergency not found or already resolved.', 'error');
        } else if (response.status === 401) {
          showNotification('Session expired. Redirecting to login...', 'error');
          setTimeout(() => window.location.href = '/admin/login', 2000);
        } else {
          showNotification(data.message || 'Failed to resolve emergency', 'error');
        }
      }
    } catch (error) {
      console.error('Error resolving emergency:', error);
      showNotification('Network error. Please check your connection.', 'error');
    } finally {
      setResolvingId(null);
    }
  };

  const getSeverityColor = (priority) => {
    switch(priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-500';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-500';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-500';
      case 'Low': return 'bg-blue-100 text-blue-800 border-blue-500';
      default: return 'bg-gray-100 text-gray-800 border-gray-500';
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'Card Block': return '🚫';
      case 'Fraud Report': return '⚠️';
      case 'Helpline': return '📞';
      default: return '🔔';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading emergency requests...</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    pending: emergencies.filter(e => e.status === 'Pending').length,
    resolved: emergencies.filter(e => e.status === 'Resolved').length,
    critical: emergencies.filter(e => e.priority === 'Critical' && e.status !== 'Resolved').length,
    cardBlocks: emergencies.filter(e => e.type === 'Card Block').length,
    fraudReports: emergencies.filter(e => e.type === 'Fraud Report').length
  };

  return (
    <>
      <style>{styles}</style>
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 p-4 md:p-6 w-full overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {/* Notification */}
            {notification.show && (
              <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg ${
                notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              } text-white font-semibold animate-slide-in`}>
                {notification.message}
              </div>
            )}

            {/* Header */}
          <div className="mb-6 mt-16 lg:mt-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Security & Emergency Center</h1>
                <p className="text-sm md:text-base text-gray-600">Monitor emergency requests, card blocks, and fraud reports</p>
              </div>
              <Link href="/admin/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition text-center text-sm md:text-base">
                ← Back to Dashboard
              </Link>
            </div>
          </div>

          {/* Security Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 md:p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm opacity-90 mb-1">Pending</p>
                  <h3 className="text-2xl md:text-3xl font-bold">{stats.pending}</h3>
                </div>
                <div className="text-2xl md:text-4xl opacity-80">🚨</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 md:p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm opacity-90 mb-1">Critical</p>
                  <h3 className="text-2xl md:text-3xl font-bold">{stats.critical}</h3>
                </div>
                <div className="text-2xl md:text-4xl opacity-80">⚠️</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 md:p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm opacity-90 mb-1">Card Blocks</p>
                  <h3 className="text-2xl md:text-3xl font-bold">{stats.cardBlocks}</h3>
                </div>
                <div className="text-2xl md:text-4xl opacity-80">🚫</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-4 md:p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm opacity-90 mb-1">Fraud Reports</p>
                  <h3 className="text-2xl md:text-3xl font-bold">{stats.fraudReports}</h3>
                </div>
                <div className="text-2xl md:text-4xl opacity-80">🔍</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 md:p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm opacity-90 mb-1">Resolved</p>
                  <h3 className="text-2xl md:text-3xl font-bold">{stats.resolved}</h3>
                </div>
                <div className="text-2xl md:text-4xl opacity-80">✅</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm mb-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black text-sm md:text-base outline-none"
              >
                <option value="All">All Types</option>
                <option value="Card Block">Card Block</option>
                <option value="Fraud Report">Fraud Report</option>
                <option value="Helpline">Helpline</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black text-sm md:text-base outline-none"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Emergency Requests */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Emergency Requests</h2>
            <div className="space-y-4">
              {emergencies.length > 0 ? (
                emergencies.map((emergency) => (
                  <div key={emergency.emergencyId} className={`p-4 rounded-lg border-l-4 ${getSeverityColor(emergency.priority)}`}>
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-2xl">{getTypeIcon(emergency.type)}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            emergency.priority === 'Critical' ? 'bg-red-200 text-red-800' :
                            emergency.priority === 'High' ? 'bg-orange-200 text-orange-800' :
                            emergency.priority === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-blue-200 text-blue-800'
                          }`}>
                            {emergency.priority}
                          </span>
                          <span className="font-bold text-gray-800 text-sm md:text-base">{emergency.type}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            emergency.status === 'Pending' ? 'bg-red-100 text-red-700' :
                            emergency.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {emergency.status}
                          </span>
                        </div>
                        
                        <p className="text-sm md:text-base text-gray-600 mb-2">{emergency.description}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm text-gray-500">
                          <div>👤 User: {emergency.user}</div>
                          <div>🏦 Account: {emergency.accountNumber}</div>
                          <div>📞 Contact: {emergency.contactName} ({emergency.contactPhone})</div>
                          <div>🕐 {new Date(emergency.date).toLocaleString()}</div>
                        </div>

                        {emergency.actionTaken && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-xs md:text-sm">
                            <strong>Action Taken:</strong> {emergency.actionTaken}
                          </div>
                        )}
                      </div>
                      
                      {emergency.status !== 'Resolved' && (
                        <button
                          onClick={() => handleResolve(emergency.emergencyId)}
                          disabled={resolvingId === emergency.emergencyId}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${
                            resolvingId === emergency.emergencyId
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-green-500 hover:bg-green-600'
                          } text-white`}
                        >
                          {resolvingId === emergency.emergencyId ? 'Resolving...' : 'Mark Resolved'}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No emergency requests found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
