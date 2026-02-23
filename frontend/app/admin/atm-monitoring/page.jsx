'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ATMMonitoring() {
  const [atmMachines, setAtmMachines] = useState([]);
  const [summary, setSummary] = useState({ total: 0, online: 0, offline: 0, maintenance: 0, lowCash: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedATM, setSelectedATM] = useState(null);
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [refillAmount, setRefillAmount] = useState('');
  const [serviceNotes, setServiceNotes] = useState('');
  const [serviceTechnician, setServiceTechnician] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  useEffect(() => {
    fetchATMs();
  }, []);

  const fetchATMs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        window.location.href = '/admin/login';
        return;
      }
      const response = await fetch(`${API_URL}/api/admin/atm-monitoring`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAtmMachines(data.atms);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching ATMs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Online': return 'bg-green-100 text-green-800';
      case 'Offline': return 'bg-red-100 text-red-800';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'Low Cash': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100"> 
      <AdminSidebar />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header - Text Black */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-black mb-2">ATM Monitoring</h1>
            <p className="text-gray-700">Real-time ATM machine status and management</p>
          </div>

          {/* Summary Stats - Text Black */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {[
              { label: 'Total ATMs', value: summary.total, color: 'text-black' },
              { label: 'Online', value: summary.online, color: 'text-green-600' },
              { label: 'Offline', value: summary.offline, color: 'text-red-600' },
              { label: 'Maintenance', value: summary.maintenance, color: 'text-yellow-600' },
              { label: 'Low Cash Alert', value: summary.lowCash, color: 'text-orange-600' },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <p className="text-gray-600 text-sm font-medium">{item.label}</p>
                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* ATM Grid - All Text Dark */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {atmMachines.map((atm) => (
              <div key={atm.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-black">{atm.id}</h3>
                    <p className="text-sm text-gray-600">{atm.location}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(atm.status)}`}>
                    {atm.status}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">Cash Available</span>
                    <span className="text-sm font-bold text-black">{atm.cash}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${atm.capacityRaw > 50 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{width: atm.capacity}}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-600 font-medium">
                    <span>Transactions: {atm.transactions}</span>
                    <span>Last: {atm.lastService}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => {setSelectedATM(atm.id); setShowRefillModal(true);}} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold transition">Refill</button>
                  <button onClick={() => {setSelectedATM(atm.id); setShowServiceModal(true);}} className="flex-1 bg-gray-200 hover:bg-gray-300 text-black py-2 rounded-lg text-sm font-semibold transition">Service</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal - Text Black */}
      {showRefillModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-black mb-4">Refill - {selectedATM}</h2>
            <input
              type="number"
              value={refillAmount}
              onChange={(e) => setRefillAmount(e.target.value)}
              className="w-full border border-gray-300 text-black px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter amount (৳)"
            />
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowRefillModal(false)} className="flex-1 bg-gray-100 text-black py-3 rounded-lg font-medium">Cancel</button>
              <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}