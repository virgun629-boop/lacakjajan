import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Compass,
  Moon,
  Sun,
  Store,
  Radio,
  ArrowLeft,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme, userMode, setUserMode, setActiveTab, showToast } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-500/30">
            <Compass size={18} className="animate-[spin_12s_linear_infinite]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base tracking-tight text-stone-900 dark:text-stone-100">
                Lacak Jajan
              </h1>
              {userMode === 'vendor' ? (
                <span className="text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.2 rounded-md">
                  Pedagang
                </span>
              ) : (
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-1.5 py-0.2 rounded-md border border-teal-200 dark:border-teal-800">
                  UMKM
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5">
          {userMode === 'vendor' && (
            <button
              onClick={() => {
                setUserMode('buyer');
                setActiveTab('home');
                showToast('Kembali ke Mode Pembeli');
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-200 transition-all"
            >
              <ArrowLeft size={13} />
              <span>Pembeli</span>
            </button>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};
