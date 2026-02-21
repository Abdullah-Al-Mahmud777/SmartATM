'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { name: 'Users', path: '/admin/users', icon: '👥' },
    { name: 'Transactions', path: '/admin/transactions', icon: '💳' },
    { name: 'Reports', path: '/admin/reports', icon: '📈' },
    { name: 'Analytics', path: '/admin/analytics', icon: '📉' },
    { name: 'ATM Monitoring', path: '/admin/atm-monitoring', icon: '🏧' },
    { name: 'Notifications', path: '/admin/notifications', icon: '🔔' },
    { name: 'Security', path: '/admin/security', icon: '🔒' },
    { name: 'Settings', path: '/admin/settings', icon: '⚙️' },
  ];

  const handleLogout = () => {
    // Clear all admin data from localStorage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    
    // Close mobile menu
    setIsMobileMenuOpen(false);
    
    // Redirect to login page
    router.push('/admin/login');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-3 rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-gray-900 text-white min-h-screen p-6
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        overflow-y-auto
      `}>
        {/* Logo/Header */}
        <div className="mb-8 mt-12 lg:mt-0">
          <h1 className="text-2xl font-bold mb-1">Admin Panel</h1>
          <p className="text-sm text-gray-400">ATM Management System</p>
        </div>

        {/* Menu Items */}
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                pathname === item.path
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
