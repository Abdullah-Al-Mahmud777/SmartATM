'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type PaymentMethod = 'bkash' | 'nagad' | 'rocket' | 'card' | null;

export default function Payment() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    { id: 'bkash', name: 'bKash', icon: '💳', color: 'bg-pink-500', logo: '🅱️' },
    { id: 'nagad', name: 'Nagad', icon: '💰', color: 'bg-orange-500', logo: '🅽' },
    { id: 'rocket', name: 'Rocket', icon: '🚀', color: 'bg-purple-500', logo: '🅁' },
    { id: 'card', name: 'Credit/Debit Card', icon: '💳', color: 'bg-blue-500', logo: '💳' },
  ];

  const handlePayment = async () => {
    setMessage('');
    setIsProcessing(true);

    // Validation
    if (!amount || parseFloat(amount) <= 0) {
      setMessage('Please enter a valid amount');
      setIsProcessing(false);
      return;
    }

    if (!selectedMethod) {
      setMessage('Please select a payment method');
      setIsProcessing(false);
      return;
    }

    // Method-specific validation
    if ((selectedMethod === 'bkash' || selectedMethod === 'nagad' || selectedMethod === 'rocket') && !phoneNumber) {
      setMessage('Please enter your mobile number');
      setIsProcessing(false);
      return;
    }

    if (selectedMethod === 'card') {
      if (!cardNumber || !cardExpiry || !cardCVV) {
        setMessage('Please fill all card details');
        setIsProcessing(false);
        return;
      }
    }

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setMessage(`Payment of ৳${amount} via ${selectedMethod.toUpperCase()} successful!`);
      
      // Redirect after success
      setTimeout(() => {
        router.push('/atm/dashboard');
      }, 2000);
    }, 2000);
  };

  const renderPaymentForm = () => {
    if (!selectedMethod) return null;

    if (selectedMethod === 'bkash' || selectedMethod === 'nagad' || selectedMethod === 'rocket') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="01XXXXXXXXX"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              maxLength={11}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800 font-semibold mb-2">Payment Instructions:</p>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Enter your {selectedMethod.toUpperCase()} mobile number</li>
              <li>Click "Proceed to Pay"</li>
              <li>You will receive a payment request on your phone</li>
              <li>Enter your PIN to complete payment</li>
            </ol>
          </div>
        </div>
      );
    }

    if (selectedMethod === 'card') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Number
            </label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
              placeholder="1234 5678 9012 3456"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              maxLength={16}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <input
                type="text"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
                placeholder="MM/YY"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                maxLength={5}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV
              </label>
              <input
                type="password"
                value={cardCVV}
                onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, '').slice(0, 3))}
                placeholder="123"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                maxLength={3}
              />
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-800">
              🔒 Your card information is encrypted and secure. We never store your card details.
            </p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">💳 Payment Gateway</h1>
          <button
            onClick={() => router.push('/atm/dashboard')}
            className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Amount Input */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-4 text-gray-500 text-xl">৳</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-2xl font-bold"
            />
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Select Payment Method</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id as PaymentMethod)}
                className={`p-6 rounded-xl border-2 transition-all ${
                  selectedMethod === method.id
                    ? `${method.color} text-white border-transparent shadow-lg scale-105`
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-4xl mb-2">{method.logo}</div>
                <p className="font-semibold text-sm">{method.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Payment Form */}
        {selectedMethod && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {selectedMethod.toUpperCase()} Payment Details
            </h2>
            {renderPaymentForm()}
          </div>
        )}

        {/* Message */}
        {message && (
          <div className={`mb-6 px-4 py-3 rounded-lg ${
            message.includes('successful') 
              ? 'bg-green-50 text-green-600' 
              : 'bg-red-50 text-red-600'
          }`}>
            {message}
          </div>
        )}

        {/* Pay Button */}
        {selectedMethod && (
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              isProcessing
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              `Pay ৳${amount || '0'}`
            )}
          </button>
        )}

        {/* Security Info */}
        <div className="mt-6 bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800 font-semibold mb-2">🔒 Secure Payment</p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• All transactions are encrypted with SSL</li>
            <li>• We never store your payment credentials</li>
            <li>• PCI DSS compliant payment processing</li>
            <li>• 24/7 fraud monitoring and protection</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
