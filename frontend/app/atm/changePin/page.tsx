'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ChangePin() {
  const router = useRouter();
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [message, setMessage] = useState('');

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!currentPin || !newPin || !confirmPin) {
      setMessage('Please fill all fields');
      return;
    }

    if (currentPin.length !== 4 || newPin.length !== 4 || confirmPin.length !== 4) {
      setMessage('PIN must be 4 digits');
      return;
    }

    if (newPin !== confirmPin) {
      setMessage('New PIN and Confirm PIN do not match');
      return;
    }

    if (currentPin === newPin) {
      setMessage('New PIN must be different from current PIN');
      return;
    }

    setMessage('PIN changed successfully!');
    setTimeout(() => router.push('/atm/dashboard'), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-indigo-600 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Change PIN</h1>
          <button
            onClick={() => router.push('/atm/dashboard')}
            className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50"
          >
            Back
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <form onSubmit={handleChangePin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current PIN
              </label>
              <input
                type="password"
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="****"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                maxLength={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New PIN
              </label>
              <input
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="****"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                maxLength={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New PIN
              </label>
              <input
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="****"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                maxLength={4}
              />
            </div>

            {message && (
              <div className={`px-4 py-3 rounded-lg ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Change PIN
            </button>
          </form>

          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Security Tips:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
              <li>Never share your PIN with anyone</li>
              <li>Use a unique PIN that is not easy to guess</li>
              <li>Change your PIN regularly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
