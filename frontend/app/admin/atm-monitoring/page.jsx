'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

export default function ATMMonitoring() {
  const [atmMachines] = useState([
    { id: 'ATM-001', location: 'Dhaka - Gulshan', status: 'Online', cash: '৳5,50,000', capacity: '80%', lastService: '2024-02-10', transactions: 145 },
    { id: 'ATM-002', location: 'Dhaka - Banani', status: 'Online', cash: '৳3,20,000', capacity: '45%', lastService: '2024-02-12', transactions: 98 },
    { id: 'ATM-003', location: 'Chittagong - Agrabad', status: 'Offline', cash: '৳1,50,000', capacity: '20%', lastService: '2024-02-08', transactions: 0 },
    { id: 'ATM-004', location: 'Dhaka - Dhanmondi', status: 'Online', cash: '৳6,80,000', capacity: '95%', lastService: '2024-02-14', transactions: 182 },
    { id: 'ATM-005', location: 'Sylhet - Zindabazar', status: 'Maintenance', cash: '৳2,40,000', capacity: '35%', lastService: '2024-02-11', transactions: 0 },
    { id: 'ATM-006', location: 'Dhaka - Mirpur', status: 'Online', cash: '৳4,90,000', capacity: '70%', lastService: '2024-02-13', transactions: 156 },
    { id: 'ATM-007', location: 'Rajshahi - Shaheb Bazar', status: 'Online', cash: '৳3,75,000', capacity: '55%', lastService: '2024-02-09', transactions: 112 },
    { id: 'ATM-008', location: 'Dhaka - Uttara', status: 'Low Cash', cash: '৳80,000', capacity: '12%', lastService: '2024-02-15', transactions: 203 },
  ]);

  const [selectedATM, setSelectedATM] = useState(null);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Online': return 'bg-green-100 text-green-800';
      case 'Offline': return 'bg-red-100 text-red-800';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'Low Cash': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRefillCash = (atmId) => {
    alert(`Cash refill initiated for ${atmId}`);
  };

  const handleServiceRequest = (atmId) => {
    alert(`Service request created for ${atmId}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">ATM Monitoring</h1>
            <p className="text-gray-600">Real-time ATM machine status and management</p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Total ATMs</p>
              <p className="text-2xl font-bold text-gray-800">{atmMachines.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Online</p>
              <p className="text-2xl font-bold text-green-600">
                {atmMachines.filter(atm => atm.status === 'Online').length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Offline/Maintenance</p>
              <p className="text-2xl font-bold text-red-600">
                {atmMachines.filter(atm => atm.status === 'Offline' || atm.status === 'Maintenance').length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Low Cash Alert</p>
              <p className="text-2xl font-bold text-orange-600">
                {atmMachines.filter(atm => atm.status === 'Low Cash' || parseInt(atm.capacity) < 20).length}
              </p>
            </div>
          </div>

          {/* ATM Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {atmMachines.map((atm) => (
              <div key={atm.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{atm.id}</h3>
                    <p className="text-sm text-gray-600">{atm.location}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(atm.status)}`}>
                    {atm.status}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Cash Available</span>
                      <span className="text-sm font-semibold text-gray-800">{atm.cash}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          parseInt(atm.capacity) > 50 ? 'bg-green-500' :
                          parseInt(atm.capacity) > 20 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{width: atm.capacity}}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{atm.capacity} capacity</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Today's Transactions</span>
                    <span className="text-sm font-bold text-blue-600">{atm.transactions}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Service</span>
                    <span className="text-xs text-gray-500">{atm.lastService}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleRefillCash(atm.id)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold"
                  >
                    Refill Cash
                  </button>
                  <button
                    onClick={() => handleServiceRequest(atm.id)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg text-sm font-semibold"
                  >
                    Service
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Map View Placeholder */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">ATM Location Map</h2>
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <p className="text-xl font-semibold text-gray-700">Interactive Map View</p>
                <p className="text-gray-600">Real-time ATM locations and status</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
