'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function TestConnection() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testBackend = async () => {
    setLoading(true);
    const testResults = {};

    // Test 1: Backend Health
    try {
      const response = await fetch(`${API_URL}/health`);
      const data = await response.json();
      testResults.health = { success: true, data };
    } catch (error) {
      testResults.health = { success: false, error: error.message };
    }

    // Test 2: Admin Login
    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin123' })
      });
      const data = await response.json();
      testResults.login = { success: data.success, data };
      
      if (data.success && data.token) {
        localStorage.setItem('testToken', data.token);
        
        // Test 3: Analytics with token
        try {
          const analyticsResponse = await fetch(`${API_URL}/api/admin/analytics?timeRange=7days`, {
            headers: { 'Authorization': `Bearer ${data.token}` }
          });
          const analyticsData = await analyticsResponse.json();
          testResults.analytics = { success: analyticsData.success, data: analyticsData };
        } catch (error) {
          testResults.analytics = { success: false, error: error.message };
        }

        // Test 4: ATM Monitoring with token
        try {
          const atmResponse = await fetch(`${API_URL}/api/admin/atm-monitoring`, {
            headers: { 'Authorization': `Bearer ${data.token}` }
          });
          const atmData = await atmResponse.json();
          testResults.atmMonitoring = { success: atmData.success, data: atmData };
        } catch (error) {
          testResults.atmMonitoring = { success: false, error: error.message };
        }
      }
    } catch (error) {
      testResults.login = { success: false, error: error.message };
    }

    // Test 5: LocalStorage
    testResults.localStorage = {
      adminToken: localStorage.getItem('adminToken') ? 'Found' : 'Not Found',
      adminUser: localStorage.getItem('adminUser') ? 'Found' : 'Not Found'
    };

    setResults(testResults);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Backend Connection Test</h1>
        
        <button
          onClick={testBackend}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold mb-6 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Run Tests'}
        </button>

        {Object.keys(results).length > 0 && (
          <div className="space-y-4">
            {/* Health Check */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-3">1. Backend Health Check</h2>
              <div className={`p-4 rounded ${results.health?.success ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className="font-semibold">{results.health?.success ? '✅ Success' : '❌ Failed'}</p>
                <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(results.health, null, 2)}</pre>
              </div>
            </div>

            {/* Admin Login */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-3">2. Admin Login</h2>
              <div className={`p-4 rounded ${results.login?.success ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className="font-semibold">{results.login?.success ? '✅ Success' : '❌ Failed'}</p>
                <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(results.login, null, 2)}</pre>
              </div>
            </div>

            {/* Analytics */}
            {results.analytics && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-3">3. Analytics Endpoint</h2>
                <div className={`p-4 rounded ${results.analytics?.success ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className="font-semibold">{results.analytics?.success ? '✅ Success' : '❌ Failed'}</p>
                  <pre className="text-xs mt-2 overflow-auto max-h-64">{JSON.stringify(results.analytics, null, 2)}</pre>
                </div>
              </div>
            )}

            {/* ATM Monitoring */}
            {results.atmMonitoring && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-3">4. ATM Monitoring Endpoint</h2>
                <div className={`p-4 rounded ${results.atmMonitoring?.success ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className="font-semibold">{results.atmMonitoring?.success ? '✅ Success' : '❌ Failed'}</p>
                  <pre className="text-xs mt-2 overflow-auto max-h-64">{JSON.stringify(results.atmMonitoring, null, 2)}</pre>
                </div>
              </div>
            )}

            {/* LocalStorage */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-3">5. LocalStorage Check</h2>
              <div className="p-4 rounded bg-blue-50">
                <pre className="text-xs overflow-auto">{JSON.stringify(results.localStorage, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-3">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Click "Run Tests" button above</li>
            <li>Check if all tests pass (green ✅)</li>
            <li>If any test fails (red ❌), check the error message</li>
            <li>Make sure backend is running on http://localhost:5000</li>
            <li>Make sure you're logged in as admin</li>
          </ol>
        </div>

        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This is a diagnostic page. If all tests pass but the actual pages don't work, 
            check the browser console (F12) for errors on those pages.
          </p>
        </div>
      </div>
    </div>
  );
}
