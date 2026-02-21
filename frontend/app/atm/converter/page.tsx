'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = 'http://localhost:5000';

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export default function CurrencyConverter() {
  const router = useRouter();
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('BDT');
  const [toCurrency, setToCurrency] = useState('USD');
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    try {
      const response = await fetch(`${API_URL}/api/currency/currencies`);
      const data = await response.json();
      
      if (data.success) {
        setCurrencies(data.currencies);
      }
    } catch (error) {
      console.error('Error fetching currencies:', error);
    }
  };

  const convertCurrency = async (amount: string, from: string, to: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      setToAmount('');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('atmToken');
      
      const response = await fetch(`${API_URL}/api/currency/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          fromCurrency: from,
          toCurrency: to
        })
      });

      const data = await response.json();

      if (data.success) {
        setToAmount(data.conversion.convertedAmount.toString());
      }
    } catch (error) {
      console.error('Conversion error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    convertCurrency(value, fromCurrency, toCurrency);
  };

  const handleSwapCurrencies = () => {
    const tempCurrency = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(tempCurrency);
    
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const getCurrencySymbol = (code: string) => {
    const currency = currencies.find(c => c.code === code);
    return currency?.symbol || code;
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
            Back
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="space-y-6">
            {/* From Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
              <div className="flex gap-3">
                <select
                  value={fromCurrency}
                  onChange={(e) => {
                    setFromCurrency(e.target.value);
                    convertCurrency(fromAmount, e.target.value, toCurrency);
                  }}
                  className="w-32 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-black bg-white outline-none"
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => handleFromAmountChange(e.target.value)}
                  placeholder="0.00"
                  disabled={loading}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-lg text-black bg-white outline-none"
                />
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSwapCurrencies}
                className="bg-teal-100 p-3 rounded-full hover:bg-teal-200 transition"
              >
                <span className="text-2xl text-teal-700">⇅</span>
              </button>
            </div>

            {/* To Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
              <div className="flex gap-3">
                <select
                  value={toCurrency}
                  onChange={(e) => {
                    setToCurrency(e.target.value);
                    convertCurrency(fromAmount, fromCurrency, e.target.value);
                  }}
                  className="w-32 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-black bg-white outline-none"
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={toAmount}
                  readOnly
                  placeholder="0.00"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-lg text-black outline-none"
                />
              </div>
            </div>
          </div>

          {/* Quick Convert */}
          <div className="mt-8">
            <p className="text-sm font-medium text-gray-700 mb-3">Quick Convert</p>
            <div className="grid grid-cols-4 gap-3">
              {[1000, 5000, 10000, 50000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleFromAmountChange(amount.toString())}
                  className="bg-teal-100 text-teal-700 py-2 rounded-lg font-semibold hover:bg-teal-200 transition"
                >
                  ৳{amount}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
