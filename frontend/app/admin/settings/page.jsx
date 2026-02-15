'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

export default function Settings() {
  const [systemSettings, setSystemSettings] = useState({
    dailyWithdrawalLimit: '50000',
    monthlyWithdrawalLimit: '500000',
    minTransactionAmount: '100',
    maxTransactionAmount: '100000',
    sessionTimeout: '15',
    maxPINAttempts: '3',
    maintenanceMode: false,
    twoFactorAuth: true,
    emailNotifications: true,
    smsNotifications: true,
  });

  const handleSaveSettings = (e) => {
    e.preventDefault();
    alert('System settings updated successfully!');
  };

  const handleToggle = (setting) => {
    setSystemSettings({
      ...systemSettings,
      [setting]: !systemSettings[setting]
    });
  };

  // Eikhane text-black force kora hoyeche
  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black font-medium";

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">System Settings</h1>
            <p className="text-gray-600">Configure system parameters and preferences</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* Transaction Limits */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Transaction Limits</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Daily Withdrawal Limit (৳)</label>
                  <input
                    type="number"
                    value={systemSettings.dailyWithdrawalLimit}
                    onChange={(e) => setSystemSettings({...systemSettings, dailyWithdrawalLimit: e.target.value})}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Withdrawal Limit (৳)</label>
                  <input
                    type="number"
                    value={systemSettings.monthlyWithdrawalLimit}
                    onChange={(e) => setSystemSettings({...systemSettings, monthlyWithdrawalLimit: e.target.value})}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Transaction Amount (৳)</label>
                  <input
                    type="number"
                    value={systemSettings.minTransactionAmount}
                    onChange={(e) => setSystemSettings({...systemSettings, minTransactionAmount: e.target.value})}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Transaction Amount (৳)</label>
                  <input
                    type="number"
                    value={systemSettings.maxTransactionAmount}
                    onChange={(e) => setSystemSettings({...systemSettings, maxTransactionAmount: e.target.value})}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Security Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    value={systemSettings.sessionTimeout}
                    onChange={(e) => setSystemSettings({...systemSettings, sessionTimeout: e.target.value})}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max PIN Attempts</label>
                  <input
                    type="number"
                    value={systemSettings.maxPINAttempts}
                    onChange={(e) => setSystemSettings({...systemSettings, maxPINAttempts: e.target.value})}
                    className={inputClass}
                  />
                </div>

                {/* Toggles and other sections... */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-black">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600">Require 2FA for all users</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle('twoFactorAuth')}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                      systemSettings.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${systemSettings.twoFactorAuth ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-black">Maintenance Mode</p>
                    <p className="text-sm text-gray-600">Disable user access temporarily</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle('maintenanceMode')}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                      systemSettings.maintenanceMode ? 'bg-red-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${systemSettings.maintenanceMode ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex gap-4">
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg transition text-lg">
                Save All Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}