'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CurrencyConverter() {
  const router = useRouter();
  const [bdtAmount, setBdtAmount] = useState('');
  const [usdAmount, setUsdAmount] = useState('');
  const [exchangeRate] = useState(110); // 1 USD = 110 BDT (example rate)

  const convertToUSD = (bdt: string) => {
    const amount = parseFloat(bdt);
    if (!isNaN(amount)) {
      setUsdAmount((amount / exchangeRate).toFixed(2));
    } else {
      setUsdAmount('');
    }
  };

  const convertToBDT = (usd: string) => {
    const amount = parseFloat(usd);
    if (!isNaN(amount)) {
      setBdtAmount((amount * exchangeRate).toFixed(2));
    } else {
      setBdtAmount('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-black">
      <div className="bg-teal-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">💱 Currency Converter</h1>
          <button
            onClick={() => router.push('/atm/dashboard')}
            className="bg-white text-teal-600 px-4 py-2 rounded-lg font-semibold hover:bg-teal-50"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Exchange Rate Display */}
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-6 rounded-xl shadow-lg mb-8">
          <p className="text-sm opacity-90 mb-2">Current Exchange Rate</p>
          <h2 className="text-3xl font-bold">1 USD = ৳{exchangeRate}</h2>
          <p className="text-sm opacity-75 mt-2">Last updated: Today, 10:30 AM</p>
        </div>

        {/* Converter */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <div className="space-y-6">
            {/* BDT Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bangladeshi Taka (BDT)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-500 text-lg">৳</span>
                <input
                  type="number"
                  value={bdtAmount}
                  onChange={(e) => {
                    setBdtAmount(e.target.value);
                    convertToUSD(e.target.value);
                  }}
                  placeholder="0.00"
                  // এখানে text-black এবং bg-white যোগ করা হয়েছে
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-lg text-black bg-white outline-none"
                />
              </div>
            </div>

            {/* Swap Icon */}
            <div className="flex justify-center">
              <div className="bg-teal-100 p-3 rounded-full">
                <span className="text-2xl text-teal-700">⇅</span>
              </div>
            </div>

            {/* USD Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                US Dollar (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-500 text-lg">$</span>
                <input
                  type="number"
                  value={usdAmount}
                  onChange={(e) => {
                    setUsdAmount(e.target.value);
                    convertToBDT(e.target.value);
                  }}
                  placeholder="0.00"
                  // এখানেও text-black এবং bg-white যোগ করা হয়েছে
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-lg text-black bg-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Quick Convert Buttons */}
          <div className="mt-8">
            <p className="text-sm font-medium text-gray-700 mb-3">Quick Convert</p>
            <div className="grid grid-cols-4 gap-3">
              {[1000, 5000, 10000, 50000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setBdtAmount(amount.toString());
                    convertToUSD(amount.toString());
                  }}
                  className="bg-teal-100 text-teal-700 py-2 rounded-lg font-semibold hover:bg-teal-200 transition-colors"
                >
                  ৳{amount}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Note: Exchange rates are indicative and may vary. Actual rates will be applied at the time of transaction.
          </p>
        </div>
      </div>
    </div>
  );
}