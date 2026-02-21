'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = 'http://localhost:5000';

export default function Emergency() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'block' | 'fraud' | 'helpline'>('block');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [emergencyId, setEmergencyId] = useState('');

  // Card Block Form
  const [blockForm, setBlockForm] = useState({
    cardNumber: '',
    contactName: '',
    contactPhone: '',
    reason: 'Lost Card',
    description: ''
  });

  // Fraud Report Form
  const [fraudForm, setFraudForm] = useState({
    cardNumber: '',
    accountNumber: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    fraudType: 'Unauthorized Transaction',
    description: '',
    location: ''
  });

  // Helpline Form
  const [helplineForm, setHelplineForm] = useState({
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    issueType: 'Card Issue',
    description: '',
    urgency: 'normal'
  });

  const handleCardBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/emergency/card-block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blockForm)
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ ${data.message}`);
        setEmergencyId(data.emergency.emergencyId);
        setBlockForm({
          cardNumber: '',
          contactName: '',
          contactPhone: '',
          reason: 'Lost Card',
          description: ''
        });
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleFraudReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/emergency/fraud-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fraudForm)
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ ${data.message}`);
        setEmergencyId(data.emergency.emergencyId);
        setFraudForm({
          cardNumber: '',
          accountNumber: '',
          contactName: '',
          contactPhone: '',
          contactEmail: '',
          fraudType: 'Unauthorized Transaction',
          description: '',
          location: ''
        });
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleHelplineRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/emergency/helpline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(helplineForm)
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ ${data.message}`);
        setEmergencyId(data.emergency.emergencyId);
        setHelplineForm({
          contactName: '',
          contactPhone: '',
          contactEmail: '',
          issueType: 'Card Issue',
          description: '',
          urgency: 'normal'
        });
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-red-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">🚨 Emergency Services</h1>
            <p className="text-red-100 mt-1">24/7 Support - Call: 16247</p>
          </div>
          <button
            onClick={() => router.push('/atm/home')}
            className="bg-white text-red-600 px-6 py-2 rounded-lg font-semibold hover:bg-red-50"
          >
            Back to Home
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('block')}
            className={`flex-1 py-4 rounded-lg font-semibold transition-colors ${
              activeTab === 'block'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            🔒 Instant Card Block
          </button>
          <button
            onClick={() => setActiveTab('fraud')}
            className={`flex-1 py-4 rounded-lg font-semibold transition-colors ${
              activeTab === 'fraud'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            ⚠️ Report Fraud
          </button>
          <button
            onClick={() => setActiveTab('helpline')}
            className={`flex-1 py-4 rounded-lg font-semibold transition-colors ${
              activeTab === 'helpline'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            📞 Call Helpline
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <p className="font-semibold">{message}</p>
            {emergencyId && (
              <p className="text-sm mt-2">Emergency ID: <span className="font-mono">{emergencyId}</span></p>
            )}
          </div>
        )}

        {/* Card Block Form */}
        {activeTab === 'block' && (
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Instant Card Block</h2>
            <form onSubmit={handleCardBlock} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Number *</label>
                <input
                  type="text"
                  value={blockForm.cardNumber}
                  onChange={(e) => setBlockForm({...blockForm, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16)})}
                  placeholder="1234567890123456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
                  maxLength={16}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name *</label>
                  <input
                    type="text"
                    value={blockForm.contactName}
                    onChange={(e) => setBlockForm({...blockForm, contactName: e.target.value})}
                    placeholder="Your Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone *</label>
                  <input
                    type="tel"
                    value={blockForm.contactPhone}
                    onChange={(e) => setBlockForm({...blockForm, contactPhone: e.target.value})}
                    placeholder="01712345678"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
                <select
                  value={blockForm.reason}
                  onChange={(e) => setBlockForm({...blockForm, reason: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
                  required
                >
                  <option value="Lost Card">Lost Card</option>
                  <option value="Stolen Card">Stolen Card</option>
                  <option value="Suspicious Activity">Suspicious Activity</option>
                  <option value="Damaged Card">Damaged Card</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={blockForm.description}
                  onChange={(e) => setBlockForm({...blockForm, description: e.target.value})}
                  placeholder="Provide additional details..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Blocking Card...' : '🔒 Block Card Immediately'}
              </button>
            </form>
          </div>
        )}

        {/* Fraud Report Form */}
        {activeTab === 'fraud' && (
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Report Fraud</h2>
            <form onSubmit={handleFraudReport} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Card Number (Optional)</label>
                  <input
                    type="text"
                    value={fraudForm.cardNumber}
                    onChange={(e) => setFraudForm({...fraudForm, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16)})}
                    placeholder="1234567890123456"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
                    maxLength={16}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Number (Optional)</label>
                  <input
                    type="text"
                    value={fraudForm.accountNumber}
                    onChange={(e) => setFraudForm({...fraudForm, accountNumber: e.target.value})}
                    placeholder="1234567890"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name *</label>
                  <input
                    type="text"
                    value={fraudForm.contactName}
                    onChange={(e) => setFraudForm({...fraudForm, contactName: e.target.value})}
                    placeholder="Your Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone *</label>
                  <input
                    type="tel"
                    value={fraudForm.contactPhone}
                    onChange={(e) => setFraudForm({...fraudForm, contactPhone: e.target.value})}
                    placeholder="01712345678"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                <input
                  type="email"
                  value={fraudForm.contactEmail}
                  onChange={(e) => setFraudForm({...fraudForm, contactEmail: e.target.value})}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fraud Type *</label>
                <select
                  value={fraudForm.fraudType}
                  onChange={(e) => setFraudForm({...fraudForm, fraudType: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
                  required
                >
                  <option value="Unauthorized Transaction">Unauthorized Transaction</option>
                  <option value="Phishing">Phishing</option>
                  <option value="Card Cloning">Card Cloning</option>
                  <option value="Identity Theft">Identity Theft</option>
                  <option value="ATM Skimming">ATM Skimming</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location (Optional)</label>
                <input
                  type="text"
                  value={fraudForm.location}
                  onChange={(e) => setFraudForm({...fraudForm, location: e.target.value})}
                  placeholder="Where did the fraud occur?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={fraudForm.description}
                  onChange={(e) => setFraudForm({...fraudForm, description: e.target.value})}
                  placeholder="Describe the fraud incident in detail..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Submitting Report...' : '⚠️ Submit Fraud Report'}
              </button>
            </form>
          </div>
        )}

        {/* Helpline Form */}
        {activeTab === 'helpline' && (
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Request Helpline Call</h2>
            
            {/* Helpline Numbers */}
            <div className="bg-blue-50 p-6 rounded-lg mb-6 border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-3">📞 Direct Helpline Numbers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-800">
                <div>
                  <p className="font-semibold">Emergency: <a href="tel:16247" className="text-blue-600 hover:underline">16247</a></p>
                  <p className="font-semibold">Customer Service: <a href="tel:09666716247" className="text-blue-600 hover:underline">09666716247</a></p>
                </div>
                <div>
                  <p className="font-semibold">International: <a href="tel:+880216247" className="text-blue-600 hover:underline">+880-2-16247</a></p>
                  <p className="font-semibold">Email: <a href="mailto:emergency@smartatm.com" className="text-blue-600 hover:underline">emergency@smartatm.com</a></p>
                </div>
              </div>
              <p className="text-sm text-blue-700 mt-3">Available 24/7</p>
            </div>

            <form onSubmit={handleHelplineRequest} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name *</label>
                  <input
                    type="text"
                    value={helplineForm.contactName}
                    onChange={(e) => setHelplineForm({...helplineForm, contactName: e.target.value})}
                    placeholder="Your Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone *</label>
                  <input
                    type="tel"
                    value={helplineForm.contactPhone}
                    onChange={(e) => setHelplineForm({...helplineForm, contactPhone: e.target.value})}
                    placeholder="01712345678"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                <input
                  type="email"
                  value={helplineForm.contactEmail}
                  onChange={(e) => setHelplineForm({...helplineForm, contactEmail: e.target.value})}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type *</label>
                <select
                  value={helplineForm.issueType}
                  onChange={(e) => setHelplineForm({...helplineForm, issueType: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
                  required
                >
                  <option value="Card Issue">Card Issue</option>
                  <option value="Transaction Problem">Transaction Problem</option>
                  <option value="Account Access">Account Access</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Urgency *</label>
                <select
                  value={helplineForm.urgency}
                  onChange={(e) => setHelplineForm({...helplineForm, urgency: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
                  required
                >
                  <option value="normal">Normal (Callback within 1 hour)</option>
                  <option value="urgent">Urgent (Callback within 30 minutes)</option>
                  <option value="critical">Critical (Callback within 15 minutes)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={helplineForm.description}
                  onChange={(e) => setHelplineForm({...helplineForm, description: e.target.value})}
                  placeholder="Describe your issue..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Submitting Request...' : '📞 Request Callback'}
              </button>
            </form>
          </div>
        )}

        {/* Emergency Tips */}
        <div className="mt-8 bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h3 className="font-bold text-yellow-900 mb-3">⚠️ Emergency Tips:</h3>
          <ul className="text-yellow-800 space-y-2 text-sm">
            <li>• For immediate card block, use the Instant Card Block feature above</li>
            <li>• Report any suspicious activity immediately</li>
            <li>• Never share your PIN or OTP with anyone</li>
            <li>• Keep your emergency ID for reference</li>
            <li>• Our team is available 24/7 to assist you</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
