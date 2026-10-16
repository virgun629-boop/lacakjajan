import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Compass,
  Map as MapIcon,
  Heart,
  User,
  Store,
  LayoutDashboard,
} from 'lucide-react';

interface NavTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: number;
}

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, userMode, favorites } = useApp();

  // Tab definitions based on user mode
  const buyerTabs: NavTab[] = [
    { id: 'home', label: 'Eksplor', icon: Compass },
    { id: 'map', label: 'Peta', icon: MapIcon },
    {
      id: 'favorites',
      label: 'Favorit',
      icon: Heart,
      badge: favorites.length > 0 ? favorites.length : undefined,
    },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  const vendorTabs: NavTab[] = [
    { id: 'vendor_dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Cek Peta', icon: MapIcon },
    { id: 'profile', label: 'Pengaturan', icon: User },
  ];

  const tabs = userMode === 'vendor' ? vendorTabs : buyerTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200/80 dark:border-stone-800 transition-colors">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center w-16 py-1 transition-all duration-150 select-none ${
                isActive
                  ? 'text-teal-600 dark:text-teal-400 font-bold scale-105'
                  : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 font-medium'
              }`}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-2'} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-5 h-1 rounded-full bg-teal-600 dark:bg-teal-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
