import { NavLink } from 'react-router-dom';
import { 
  Radar, 
  Target, 
  History, 
  Star, 
  Settings as SettingsIcon, 
  Info,
  Smartphone,
  ScanLine
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: 'Discover', path: '/', icon: ScanLine },
  { name: 'Hunt', path: '/hunt', icon: Target },
  { name: 'Radar', path: '/radar', icon: Radar },
  { name: 'History', path: '/history', icon: History },
  { name: 'Favorites', path: '/favorites', icon: Star },
  { name: 'Settings', path: '/settings', icon: SettingsIcon },
  { name: 'About', path: '/about', icon: Info },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Find My Phone</h1>
            <p className="text-xs text-gray-400">Bluetooth Tracker</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                'text-sm font-medium',
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Status indicator */}
      <div className="p-4 border-t border-[#2a2a2a]">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Bluetooth Ready
        </div>
      </div>
    </aside>
  );
}
