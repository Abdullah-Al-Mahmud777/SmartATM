'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

export default function Security() {
  const [securityAlerts] = useState([
    { id: 1, type: 'Suspicious Activity', user: 'John Doe', account: '1234567890', severity: 'High', time: '10:45 AM', description: 'Multiple failed PIN attempts from different locations', status: 'Active' },
    { id: 2, type: 'Unusual Transaction', user: 'Jane Smith', account: '0987654321', severity: 'Medium', time: '11:20 AM', description: 'Large withdrawal amount detected', status: 'Investigating' },
    { id: 3, type: 'Card Cloning Attempt', user: 'Mike Johnson', account: '5678901234', severity: 'Critical', time: '02:15 PM', description: 'Card used in multiple ATMs simultaneously', status: 'Blocked' },
    { id: 4, type: 'Login Anomaly', user: 'Sarah Williams', account: '4321098765', severity: 'Low', time: '03:30 PM', description: 'Login from unusual IP address', status: 'Resolved' },
  ]);

  const [blockedIPs] = useState([
    { ip: '192.168.1.100', reason: 'Brute force attack', blockedAt: '2024-02-15 09:30 AM', attempts: 25 },
    { ip: '10.0.0.45', reason: 'SQL injection attempt', blockedAt: '2024-02-15 10:15 AM', attempts: 12 },
    { ip: '172.16.0.88', reason: 'DDoS attack', blockedAt: '2024-02-15 11:45 AM', attempts: 150 },
  ]);

  const [auditLogs] = useState([
    { id: 1, admin: 'Admin User', action: 'Froze Account', target: 'User #1234', timestamp: '2024-02-15 10:30 AM' },
    { id: 2, admin: 'Admin User', action: 'Reset PIN', target: 'User #5678', timestamp: '2024-02-15 11:15 AM' },
    { id: 3, admin: 'Admin User', action: 'Blocked Card', target: 'Card #9012', timestamp: '2024-02-15 02:45 PM' },
    { id: 4, admin: 'Admin User', action: 'Updated Limits', target: 'User #3456', timestamp: '2024-02-15 03:20 PM' },
  ]);

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-500';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-500';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-500';
      case 'Low': return 'bg-blue-100 text-blue-800 border-blue-500';
      default: return 'bg-gray-100 text-gray-800 border-gray-500';
    }
  };

  const handleResolveAlert = (alertId) => {
    alert(`Alert ${alertId} marked as resolved`);
  };

  const handleUnblockIP = (ip) => {
    alert(`IP ${ip} unblocked`);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Security Center</h1>
            <p className="text-gray-600">Monitor threats, alerts, and security events</p>
          </div>

          {/* Security Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Active Threats</p>
                  <h3 className="text-3xl font-bold">
                    {securityAlerts.filter(a => a.status === 'Active').length}
                  </h3>
                </div>
                <div className="text-4xl opacity-80">🚨</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Blocked IPs</p>
                  <h3 className="text-3xl font-bold">{blockedIPs.length}</h3>
                </div>
                <div className="text-4xl opacity-80">🛡️</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Investigating</p>
                  <h3 className="text-3xl font-bold">
                    {securityAlerts.filter(a => a.status === 'Investigating').length}
                  </h3>
                </div>
                <div className="text-4xl opacity-80">🔍</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Resolved Today</p>
                  <h3 className="text-3xl font-bold">
                    {securityAlerts.filter(a => a.status === 'Resolved').length}
                  </h3>
                </div>
                <div className="text-4xl opacity-80">✅</div>
              </div>
            </div>
          </div>

          {/* Security Alerts */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Security Alerts</h2>
            <div className="space-y-4">
              {securityAlerts.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${getSeverityColor(alert.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          alert.severity === 'Critical' ? 'bg-red-200 text-red-800' :
                          alert.severity === 'High' ? 'bg-orange-200 text-orange-800' :
                          alert.severity === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-blue-200 text-blue-800'
                        }`}>
                          {alert.severity}
                        </span>
                        <span className="font-bold text-gray-800">{alert.type}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          alert.status === 'Active' ? 'bg-red-100 text-red-700' :
                          alert.status === 'Investigating' ? 'bg-yellow-100 text-yellow-700' :
                          alert.status === 'Blocked' ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {alert.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>👤 {alert.user}</span>
                        <span>🏦 {alert.account}</span>
                        <span>🕐 {alert.time}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      className="ml-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blocked IPs & Audit Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Blocked IPs */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Blocked IP Addresses</h2>
              <div className="space-y-3">
                {blockedIPs.map((ip, index) => (
                  <div key={index} className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-mono font-bold text-gray-800">{ip.ip}</p>
                        <p className="text-sm text-gray-600">{ip.reason}</p>
                      </div>
                      <span className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-xs font-semibold">
                        {ip.attempts} attempts
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{ip.blockedAt}</span>
                      <button
                        onClick={() => handleUnblockIP(ip.ip)}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-semibold"
                      >
                        Unblock
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Logs */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Audit Logs</h2>
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800">{log.admin}</span>
                      <span className="text-gray-500">→</span>
                      <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs font-semibold">
                        {log.action}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Target: {log.target}</p>
                    <p className="text-xs text-gray-500">{log.timestamp}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
