"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ATMLogin() {
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic Validation
    if (!cardNumber || !pin) {
      setError("Please enter card number and PIN");
      setLoading(false);
      return;
    }
    if (pin.length !== 4) {
      setError("PIN must be 4 digits");
      setLoading(false);
      return;
    }

    try {
      // Call backend API
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cardNumber, pin }),
      });

      const data = await response.json();

      if (data.success) {
        // Save token and user data to localStorage
        localStorage.setItem('atmToken', data.token);
        localStorage.setItem('atmUser', JSON.stringify(data.user));
        
        // Redirect to dashboard
        router.push("/atm/dashboard");
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error('Login error:', err);
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-blue-200">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🏧</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ATM Login</h1>
          <p className="text-gray-600">Enter your card details</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Number
            </label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) =>
                setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))
              }
              placeholder="1234567890123456"
              className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black outline-none"
              maxLength={16}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PIN
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) =>
                setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="****"
              className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black outline-none"
              maxLength={4}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <button
            onClick={() => router.push("/atm/register")}
            className="text-blue-600 hover:underline text-sm font-medium block"
          >
            Don't have an account? Register
          </button>
          <button
            onClick={() => router.push("/")}
            className="text-gray-600 hover:underline text-sm font-medium block"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}