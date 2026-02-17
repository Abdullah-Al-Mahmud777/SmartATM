"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ATMRegister() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cardNumber: "",
    accountNumber: "",
    pin: "",
    confirmPin: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.cardNumber || !formData.accountNumber || !formData.pin) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (formData.pin.length !== 4) {
      setError("PIN must be 4 digits");
      setLoading(false);
      return;
    }

    if (formData.pin !== formData.confirmPin) {
      setError("PINs do not match");
      setLoading(false);
      return;
    }

    if (formData.cardNumber.length !== 16) {
      setError("Card number must be 16 digits");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          cardNumber: formData.cardNumber,
          accountNumber: formData.accountNumber,
          pin: formData.pin
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Save token and user data
        localStorage.setItem('atmToken', data.token);
        localStorage.setItem('atmUser', JSON.stringify(data.user));
        
        // Redirect to dashboard
        router.push("/atm/dashboard");
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-8">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-blue-200">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📝</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Register New Account</h1>
          <p className="text-gray-600">Create your ATM account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black outline-none"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black outline-none"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="01712345678"
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black outline-none"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Number
              </label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={(e) => setFormData({...formData, accountNumber: e.target.value.replace(/\D/g, "").slice(0, 10)})}
                placeholder="1234567890"
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black outline-none"
                maxLength={10}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number (16 digits)
              </label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={(e) => setFormData({...formData, cardNumber: e.target.value.replace(/\D/g, "").slice(0, 16)})}
                placeholder="1234567890123456"
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black outline-none"
                maxLength={16}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PIN (4 digits)
              </label>
              <input
                type="password"
                name="pin"
                value={formData.pin}
                onChange={(e) => setFormData({...formData, pin: e.target.value.replace(/\D/g, "").slice(0, 4)})}
                placeholder="****"
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black outline-none"
                maxLength={4}
                disabled={loading}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm PIN
              </label>
              <input
                type="password"
                name="confirmPin"
                value={formData.confirmPin}
                onChange={(e) => setFormData({...formData, confirmPin: e.target.value.replace(/\D/g, "").slice(0, 4)})}
                placeholder="****"
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black outline-none"
                maxLength={4}
                disabled={loading}
              />
            </div>
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
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <button
            onClick={() => router.push("/atm/login")}
            className="text-blue-600 hover:underline text-sm font-medium block"
          >
            Already have an account? Login
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
