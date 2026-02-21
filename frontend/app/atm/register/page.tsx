"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Use environment variable for backend URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ATMRegister() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('atmToken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('atmToken');
    localStorage.removeItem('atmUser');
    setIsLoggedIn(false);
  };

  const goToDashboard = () => {
    router.push('/atm/dashboard');
  };
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.cardNumber || !formData.accountNumber || !formData.pin) {
      setError("All fields are required");
      setLoading(false);
      return;
    }
    if (formData.pin.length !== 4) { setError("PIN must be 4 digits"); setLoading(false); return; }
    if (formData.pin !== formData.confirmPin) { setError("PINs do not match"); setLoading(false); return; }
    if (formData.cardNumber.length !== 16) { setError("Card number must be 16 digits"); setLoading(false); return; }

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          cardNumber: formData.cardNumber,
          accountNumber: formData.accountNumber,
          pin: formData.pin
        })
      });

      const contentType = response.headers.get("content-type");
      let data;

      // Ensure server returns JSON
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
      }

      if (data.success) {
        localStorage.setItem("atmToken", data.token);
        localStorage.setItem("atmUser", JSON.stringify(data.user));
        router.push("/atm/dashboard");
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }

    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // If already logged in, show option to go to dashboard or logout
  if (isLoggedIn) {
    const userData = JSON.parse(localStorage.getItem('atmUser') || '{}');
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-blue-200">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Already Logged In</h1>
            <p className="text-gray-600">Welcome, {userData.name || 'User'}!</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={goToDashboard}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>

            <button
              onClick={handleLogout}
              className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Logout & Create New Account
            </button>

            <button
              onClick={() => router.push("/")}
              className="w-full py-3 bg-white text-gray-600 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black outline-none" disabled={loading} />
            </div>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black outline-none" disabled={loading} />
            </div>
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="01712345678" className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black outline-none" disabled={loading} />
            </div>
            {/* Account Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
              <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} placeholder="1234567890" maxLength={10} className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black outline-none" disabled={loading} />
            </div>
            {/* Card Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Card Number (16 digits)</label>
              <input type="text" name="cardNumber" value={formData.cardNumber} onChange={handleChange} placeholder="1234567890123456" maxLength={16} className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black outline-none" disabled={loading} />
            </div>
            {/* PIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PIN (4 digits)</label>
              <input type="password" name="pin" value={formData.pin} onChange={handleChange} maxLength={4} className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black outline-none" disabled={loading} />
            </div>
            {/* Confirm PIN */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm PIN</label>
              <input type="password" name="confirmPin" value={formData.confirmPin} onChange={handleChange} maxLength={4} className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black outline-none" disabled={loading} />
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-200">{error}</div>}

          <button type="submit" disabled={loading} className={`w-full py-3 rounded-lg font-semibold transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <button onClick={() => router.push("/atm/login")} className="text-blue-600 hover:underline text-sm font-medium block">Already have an account? Login</button>
          <button onClick={() => router.push("/")} className="text-gray-600 hover:underline text-sm font-medium block">Back to Home</button>
        </div>
      </div>
    </div>
  );
}