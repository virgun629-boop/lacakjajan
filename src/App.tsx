import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/Buyer/HomeScreen';
import { InteractiveMap } from './components/Map/InteractiveMap';
import { FavoritesScreen } from './components/Buyer/FavoritesScreen';
import { ProfileScreen } from './components/Buyer/ProfileScreen';
import { VendorDashboard } from './components/Vendor/VendorDashboard';
import { VendorDetailModal } from './components/Buyer/VendorDetailModal';
import { CheckCircle2 } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, toastMessage } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-stone-900/90 text-white dark:bg-white/95 dark:text-stone-900 shadow-xl backdrop-blur-md text-xs font-semibold max-w-xs text-center border border-white/10 dark:border-stone-800">
            <CheckCircle2 size={15} className="text-teal-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-md mx-auto">
        {activeTab === 'home' && (
          <div className="p-3 sm:p-4">
            <HomeScreen />
          </div>
        )}

        {activeTab === 'map' && <InteractiveMap />}

        {activeTab === 'favorites' && (
          <div className="p-3 sm:p-4">
            <FavoritesScreen />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="p-3 sm:p-4">
            <ProfileScreen />
          </div>
        )}

        {activeTab === 'vendor_dashboard' && (
          <div className="p-3 sm:p-4">
            <VendorDashboard />
          </div>
        )}
      </main>

      {/* Vendor Detail Sheet Modal */}
      <VendorDetailModal />

      {/* Bottom Thumb Navigation */}
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
