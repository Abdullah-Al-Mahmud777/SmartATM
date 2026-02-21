"use client";

import { useRouter } from 'next/navigation';

export default function ATMHome() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="max-w-2xl text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to SmartATM
          </h1>
          <p className="text-xl text-gray-700 mb-12">
            Your gateway to seamless digital banking and ATM management
          </p>
          
          {/* Login Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => router.push('/atm/login')}
              className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
            >
              User Login
            </button>
            <button 
              onClick={() => router.push('/atm/emergency')}
              className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
             Emergency Services
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white py-6 mt-auto border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-700">
          <p>&copy; {new Date().getFullYear()} SmartATM Developed by Abdullah-Al-Mahmud</p>
        </div>
      </footer>
    </div>
  );
}
