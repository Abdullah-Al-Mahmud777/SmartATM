'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type Step = 'email' | 'otp' | 'newPin' | 'success';

export default function ForgotPin() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');

  // Step 1
  const [email, setEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');

  // Step 2
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');

  // Step 3
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // ─── Step 1: Send OTP ───────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Please enter your email'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setMaskedEmail(data.email);
        setStep('otp');
        startResendTimer();
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── OTP input handler ──────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    // Auto-focus next
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  };

  // ─── Step 2: Verify OTP ─────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const otpValue = otp.join('');
    if (otpValue.length !== 6) { setError('Please enter the complete 6-digit OTP'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpValue })
      });
      const data = await res.json();
      if (data.success) {
        setResetToken(data.resetToken);
        setStep('newPin');
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 3: Reset PIN ──────────────────────────────────────────
  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPin.length !== 4) { setError('PIN must be 4 digits'); return; }
    if (newPin !== confirmPin) { setError('PINs do not match'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPin, confirmPin })
      });
      const data = await res.json();
      if (data.success) {
        setStep('success');
      } else {
        setError(data.message || 'Failed to reset PIN');
      }
    } catch {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Resend OTP timer ───────────────────────────────────────────
  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError('');
    setOtp(['', '', '', '', '', '']);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        startResendTimer();
      } else {
        setError(data.message);
      }
    } catch {
      setError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step indicator ─────────────────────────────────────────────
  const steps = [
    { id: 'email', label: 'Email', num: 1 },
    { id: 'otp', label: 'OTP', num: 2 },
    { id: 'newPin', label: 'New PIN', num: 3 },
  ];

  const currentStepNum = step === 'email' ? 1 : step === 'otp' ? 2 : step === 'newPin' ? 3 : 4;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
          <div className="text-4xl mb-2">🔐</div>
          <h1 className="text-2xl font-bold text-white">Forgot PIN</h1>
          <p className="text-blue-200 text-sm mt-1">Reset your ATM PIN securely</p>
        </div>

        {/* Step Indicator */}
        {step !== 'success' && (
          <div className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-50 border-b">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  currentStepNum > s.num ? 'bg-green-500 text-white' :
                  currentStepNum === s.num ? 'bg-blue-600 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {currentStepNum > s.num ? '✓' : s.num}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${
                  currentStepNum === s.num ? 'text-blue-600' : 'text-gray-400'
                }`}>{s.label}</span>
                {i < steps.length - 1 && (
                  <div className={`w-8 h-0.5 ${currentStepNum > s.num ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="p-6">
          {/* ── STEP 1: Email ── */}
          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">Enter your email</h2>
                <p className="text-gray-500 text-sm">We'll send a 6-digit OTP to your registered email.</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-black transition"
                />
              </div>
              {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg border border-red-200">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg disabled:opacity-50 transition"
              >
                {loading ? 'Sending OTP...' : 'Send OTP →'}
              </button>
              <button type="button" onClick={() => router.push('/atm/login')} className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm font-medium">
                ← Back to Login
              </button>
            </form>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">Enter OTP</h2>
                <p className="text-gray-500 text-sm">6-digit OTP sent to <span className="font-bold text-blue-600">{maskedEmail}</span></p>
              </div>

              {/* OTP Boxes */}
              <div className="flex gap-2 justify-center">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    maxLength={1}
                    disabled={loading}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-black transition"
                  />
                ))}
              </div>

              <p className="text-center text-xs text-gray-500">⏰ OTP expires in 10 minutes</p>

              {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg border border-red-200">{error}</p>}

              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg disabled:opacity-50 transition"
              >
                {loading ? 'Verifying...' : 'Verify OTP →'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendTimer > 0 || loading}
                  className={`text-sm font-medium ${resendTimer > 0 ? 'text-gray-400' : 'text-blue-600 hover:underline'}`}
                >
                  {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>

              <button type="button" onClick={() => { setStep('email'); setError(''); }} className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm font-medium">
                ← Change Email
              </button>
            </form>
          )}

          {/* ── STEP 3: New PIN ── */}
          {step === 'newPin' && (
            <form onSubmit={handleResetPin} className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">Set New PIN</h2>
                <p className="text-gray-500 text-sm">Choose a new 4-digit PIN for your account.</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">New PIN</label>
                <input
                  type="password"
                  value={newPin}
                  onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  maxLength={4}
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-black text-center text-2xl tracking-widest transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New PIN</label>
                <input
                  type="password"
                  value={confirmPin}
                  onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  maxLength={4}
                  disabled={loading}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none text-black text-center text-2xl tracking-widest transition ${
                    confirmPin && newPin !== confirmPin ? 'border-red-400 bg-red-50' :
                    confirmPin && newPin === confirmPin ? 'border-green-400 bg-green-50' :
                    'border-gray-200 focus:border-blue-500'
                  }`}
                />
                {confirmPin && newPin !== confirmPin && (
                  <p className="text-red-500 text-xs mt-1">PINs do not match</p>
                )}
                {confirmPin && newPin === confirmPin && (
                  <p className="text-green-500 text-xs mt-1">✓ PINs match</p>
                )}
              </div>
              {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg border border-red-200">{error}</p>}
              <button
                type="submit"
                disabled={loading || newPin.length !== 4 || newPin !== confirmPin}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg disabled:opacity-50 transition"
              >
                {loading ? 'Resetting PIN...' : 'Reset PIN ✓'}
              </button>
            </form>
          )}

          {/* ── SUCCESS ── */}
          {step === 'success' && (
            <div className="text-center py-4 space-y-4">
              <div className="text-6xl">🎉</div>
              <h2 className="text-2xl font-bold text-gray-800">PIN Reset Successful!</h2>
              <p className="text-gray-500">Your PIN has been reset. You can now login with your new PIN.</p>
              <button
                onClick={() => router.push('/atm/login')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition"
              >
                Go to Login →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
