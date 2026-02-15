'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { name: 'Users', path: '/admin/users', icon: '👥' },
    { name: 'Transactions', path: '/admin/transactions', icon: '💳' },
    { name: 'Reports', path: '/admin/reports', icon: '📈' },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-6">
      {/* Logo/Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Admin Panel</h1>
        <p className="text-sm text-gray-400">ATM Management System</p>
      </div>

      {/* Menu Items */}
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
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
      <div className="mt-auto pt-8">
        <Link
          href="/admin/login"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition"
        >
          <span className="text-xl">🚪</span>
          <span className="font-medium">Logout</span>
        </Link>
      </div>
    </div>
  );
}
