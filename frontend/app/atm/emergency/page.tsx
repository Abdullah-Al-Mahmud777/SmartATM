'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Emergency() {
  const router = useRouter();
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [fraudDescription, setFraudDescription] = useState('');
  const [showFraudForm, setShowFraudForm] = useState(false);

  const handleInstantBlock = () => {
    alert('Your card has been blocked successfully! Please contact customer service for a new card.');
    localStorage.removeItem('atmUser');
    router.push('/');
  };

  const handleFraudReport = () => {
    if (!fraudDescription) {
      alert('Please describe the fraud incident');
      return;
    }
    alert('Fraud report submitted successfully! Our team will investigate.');
    setShowFraudForm(false);
    setFraudDescription('');
  };

  const handleFindBranch = () => {
    // Open Google Maps with bank branch search
    window.open('https://www.google.com/maps/search/bank+branch+near+me', '_blank');
  };

  const handleCallHelpline = () => {
    window.location.href = 'tel:16247';
  };

  return (
    <div className="min-h-screen bg-red-50">
      {/* Header */}
      <div className="bg-red-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">🚨 Emergency Services</h1>
            <p className="text-red-100">Quick access to emergency banking services</p>
          </div>
          <button
            onClick={() => router.push('/atm/dashboard')}
            className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-50"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Emergency Alert */}
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-8">
          <p className="text-yellow-800 font-semibold">⚠️ Emergency Services</p>
          <p className="text-yellow-700 text-sm mt-1">
            Use these services only in case of emergency. All actions are logged and monitored.
          </p>
        </div>

        {/* Emergency Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Instant Card Block */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-red-200">
            <div className="text-5xl mb-4">🚫</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Instant Card Block</h3>
            <p className="text-gray-600 mb-4">
              Lost your card? Block it immediately to prevent unauthorized transactions.
            </p>
            <button
              onClick={() => setShowBlockConfirm(true)}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Block My Card Now
            </button>
          </div>

          {/* Report Fraud */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-orange-200">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Report Fraud</h3>
            <p className="text-gray-600 mb-4">
              Noticed suspicious activity? Report it immediately for investigation.
            </p>
            <button
              onClick={() => setShowFraudForm(true)}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Report Fraud
            </button>
          </div>

          {/* Find Nearest Branch */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-200">
            <div className="text-5xl mb-4">📍</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Find Nearest Branch</h3>
            <p className="text-gray-600 mb-4">
              Locate the nearest bank branch or ATM booth using Google Maps.
            </p>
            <button
              onClick={handleFindBranch}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Open Maps
            </button>
          </div>

          {/* Call Helpline */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-green-200">
            <div className="text-5xl mb-4">📞</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Call Helpline</h3>
            <p className="text-gray-600 mb-4">
              Speak directly with our customer care team for immediate assistance.
            </p>
            <button
              onClick={handleCallHelpline}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Call 16247
            </button>
          </div>
        </div>

        {/* Helpline Info */}
        <div className="mt-8 bg-blue-50 p-6 rounded-xl">
          <h3 className="text-lg font-bold text-blue-900 mb-3">📞 24/7 Customer Support</h3>
          <div className="space-y-2 text-blue-800">
            <p>• Hotline: 16247 (Available 24/7)</p>
            <p>• Email: support@smartatm.com</p>
            <p>• Emergency: +880-1234-567890</p>
          </div>
        </div>
      </div>

      {/* Block Confirmation Modal */}
      {showBlockConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-red-600 mb-4">⚠️ Confirm Card Block</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to block your card? This action cannot be undone. You will need to contact customer service to get a new card.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBlockConfirm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleInstantBlock}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700"
              >
                Yes, Block Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fraud Report Modal */}
      {showFraudForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-orange-600 mb-4">Report Fraud</h3>
            <textarea
              value={fraudDescription}
              onChange={(e) => setFraudDescription(e.target.value)}
              placeholder="Describe the suspicious activity or fraud incident..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 mb-4"
              rows={5}
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowFraudForm(false);
                  setFraudDescription('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleFraudReport}
                className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
