'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

const API_URL = 'http://localhost:5000';

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        const flatSettings = {};
        Object.keys(data.settings).forEach(category => {
          data.settings[category].forEach(setting => {
            flatSettings[`${category}.${setting.key}`] = setting.value;
          });
        });
        setSettings(flatSettings);
      } else {
        await initializeSettings();
      }
    } catch (error) {
      showToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const initializeSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/settings/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        fetchSettings();
      }
    } catch (error) {
      // Silently fail - settings will be created on first update
    }
  };

  const handleUpdateSetting = async (category, key, value) => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = `${API_URL}/api/admin/settings/${category}/${key}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ value })
      });

      const data = await response.json();

      if (data.success) {
        setSettings({
          ...settings,
          [`${category}.${key}`]: value
        });
        showToast('Setting updated successfully!', 'success');
      } else {
        showToast(data.message || 'Failed to update setting', 'error');
      }
    } catch (error) {
      showToast('Failed to update setting', 'error');
    }
  };

  const handleSaveAllSettings = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('adminToken');
      const updates = [];

      for (const [fullKey, value] of Object.entries(settings)) {
        const [category, key] = fullKey.split('.');
        updates.push(
          fetch(`${API_URL}/api/admin/settings/${category}/${key}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ value })
          })
        );
      }

      await Promise.all(updates);
      showToast('All settings saved successfully!', 'success');
    } catch (error) {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (category, key) => {
    const fullKey = `${category}.${key}`;
    // Default to false if undefined, then toggle
    const currentValue = settings[fullKey] ?? false;
    const newValue = !currentValue;
    setSettings({
      ...settings,
      [fullKey]: newValue
    });
    handleUpdateSetting(category, key, newValue);
  };

  const handleInputChange = (category, key, value) => {
    const fullKey = `${category}.${key}`;
    setSettings({
      ...settings,
      [fullKey]: value
    });
  };

  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black font-medium";

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-2xl font-bold text-gray-600">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {toast.show && (
            <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white font-semibold animate-slideIn`}>
              {toast.message}
            </div>
          )}

          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">System Settings</h1>
            <p className="text-gray-600">Configure system parameters and preferences</p>
          </div>

          <form onSubmit={handleSaveAllSettings} className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Transaction Limits</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Daily Withdrawal Limit (৳)</label>
                  <input
                    type="number"
                    value={settings['Limits.daily_withdrawal_limit'] || 50000}
                    onChange={(e) => handleInputChange('Limits', 'daily_withdrawal_limit', parseInt(e.target.value))}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Daily Transfer Limit (৳)</label>
                  <input
                    type="number"
                    value={settings['Limits.daily_transfer_limit'] || 100000}
                    onChange={(e) => handleInputChange('Limits', 'daily_transfer_limit', parseInt(e.target.value))}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Transaction Amount (৳)</label>
                  <input
                    type="number"
                    value={settings['Limits.min_transaction_amount'] || 100}
                    onChange={(e) => handleInputChange('Limits', 'min_transaction_amount', parseInt(e.target.value))}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ATM Service Fee (৳)</label>
                  <input
                    type="number"
                    value={settings['ATM.atm_service_fee'] || 10}
                    onChange={(e) => handleInputChange('ATM', 'atm_service_fee', parseInt(e.target.value))}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Security Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    value={settings['Security.session_timeout'] || 30}
                    onChange={(e) => handleInputChange('Security', 'session_timeout', parseInt(e.target.value))}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                  <input
                    type="number"
                    value={settings['Security.max_login_attempts'] || 5}
                    onChange={(e) => handleInputChange('Security', 'max_login_attempts', parseInt(e.target.value))}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (days)</label>
                  <input
                    type="number"
                    value={settings['Security.password_expiry_days'] || 90}
                    onChange={(e) => handleInputChange('Security', 'password_expiry_days', parseInt(e.target.value))}
                    className={inputClass}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-black">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600">Require 2FA for all users</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle('Security', 'require_2fa')}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                      settings['Security.require_2fa'] ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${settings['Security.require_2fa'] ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-black">Maintenance Mode</p>
                    <p className="text-sm text-gray-600">Disable user access temporarily</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle('General', 'maintenance_mode')}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                      settings['General.maintenance_mode'] ? 'bg-red-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${settings['General.maintenance_mode'] ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Notification Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-black">Email Notifications</p>
                    <p className="text-sm text-gray-600">Send email alerts to users</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle('Notifications', 'email_notifications')}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                      settings['Notifications.email_notifications'] ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${settings['Notifications.email_notifications'] ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-black">SMS Notifications</p>
                    <p className="text-sm text-gray-600">Send SMS alerts to users</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle('Notifications', 'sms_notifications')}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                      settings['Notifications.sms_notifications'] ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${settings['Notifications.sms_notifications'] ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-black">Push Notifications</p>
                    <p className="text-sm text-gray-600">Send push notifications</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle('Notifications', 'push_notifications')}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                      settings['Notifications.push_notifications'] ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${settings['Notifications.push_notifications'] ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">General Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">System Name</label>
                  <input
                    type="text"
                    value={settings['General.system_name'] || 'SmartATM'}
                    onChange={(e) => handleInputChange('General', 'system_name', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                  <input
                    type="email"
                    value={settings['General.support_email'] || 'support@smartatm.com'}
                    onChange={(e) => handleInputChange('General', 'support_email', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Support Phone</label>
                  <input
                    type="text"
                    value={settings['General.support_phone'] || '16247'}
                    onChange={(e) => handleInputChange('General', 'support_phone', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Low Cash Threshold (৳)</label>
                  <input
                    type="number"
                    value={settings['ATM.low_cash_threshold'] || 100000}
                    onChange={(e) => handleInputChange('ATM', 'low_cash_threshold', parseInt(e.target.value))}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                type="submit" 
                disabled={saving}
                className={`flex-1 ${saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold py-4 rounded-lg transition text-lg`}
              >
                {saving ? 'Saving...' : 'Save All Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
