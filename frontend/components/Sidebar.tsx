'use client';

import { useRouter, usePathname } from 'next/navigation';

interface MenuItem {
  title: string;
  icon: string;
  path: string;
}

interface SidebarProps {
  menuItems: MenuItem[];
}

export default function Sidebar({ menuItems }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Menu</h2>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              pathname === item.path
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-700'
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="font-medium">{item.title}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
