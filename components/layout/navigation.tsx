// components/layout/navigation.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home,
  Upload,
  Users,
  FileOutput,
  Settings
} from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };
  
  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Documents', path: '/documents', icon: Upload },
    { name: 'Reports', path: '/reports', icon: FileOutput },
    { name: 'Family', path: '/family', icon: Users },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];
  
  return (
    <nav className="fixed left-0 top-[61px] h-full w-[60px] md:w-[200px] bg-white dark:bg-zinc-950 border-r dark:border-zinc-800 pt-4 z-10 hidden md:block">
      <ul className="space-y-2 px-2">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              href={item.path}
              className={`
                flex items-center p-2 rounded-lg transition-colors
                ${isActive(item.path) 
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' 
                  : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'}
              `}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span className="hidden md:inline">{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
