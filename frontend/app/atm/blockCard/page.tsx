'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BlockCard() {
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState('');

  const reasons = [
    'Lost Card',
    'Stolen Card',
    'Suspicious Activity',
    'Damaged Card',
    'Other'
  ];

  const handleBlockCard = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!reason) {
      setMessage('Please select a reason');
      return;
    }

    if (!confirmed) {
      setMessage('Please confirm that you want to block your card');
      return;
    }

    setMessage('Your card has been blocked successfully. Please contact customer service for a new card.');
    setTimeout(() => {
      localStorage.removeItem('atmUser');
      router.push('/');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-red-600 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Block Card</h1>
          <button
            onClick={() => router.push('/atm/dashboard')}
            className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-50"
          >
            Back
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-800 font-semibold">⚠️ Warning</p>
            <p className="text-red-700 text-sm mt-1">
              Blocking your card is permanent. You will need to contact customer service to get a new card.
            </p>
          </div>

          <form onSubmit={handleBlockCard} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Blocking
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select a reason</option>
                {reasons.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 mr-3 h-5 w-5 text-red-600 focus:ring-red-500"
              />
              <label className="text-sm text-gray-700">
                I understand that blocking my card is permanent and I will need to contact customer service to get a new card.
              </label>
            </div>

            {message && (
              <div className={`px-4 py-3 rounded-lg ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Block Card
            </button>
          </form>

          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800 font-semibold">Need Help?</p>
            <p className="text-sm text-blue-700 mt-1">
              Contact Customer Service: 16247 (24/7)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
