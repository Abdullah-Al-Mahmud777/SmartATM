'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';
import { fetchWithAuth } from '@/lib/adminAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Security() {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

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
        setEmergencies(data.emergencies || []);
      }
    } catch (error) {
      console.error('Error fetching emergencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (emergencyId) => {
    try {
      const data = await fetchWithAuth(`${API_URL}/api/admin/emergencies/${emergencyId}/resolve`, {
        method: 'PUT'
      });

      if (data && data.success) {
        alert('Emergency resolved successfully');
        fetchEmergencies();
      }
    } catch (error) {
      console.error('Error resolving emergency:', error);
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
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-4 md:p-6 w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
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
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold whitespace-nowrap"
                        >
                          Mark Resolved
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
  );
}
