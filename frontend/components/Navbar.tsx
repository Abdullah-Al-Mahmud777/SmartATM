'use client';

import { useRouter } from 'next/navigation';

interface NavbarProps {
  title?: string;
  showLogout?: boolean;
}

export default function Navbar({ title = 'ATM System', showLogout = true }: NavbarProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('atmUser');
    router.push('/');
  };

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        
        {showLogout && (
          <button
            onClick={handleLogout}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
