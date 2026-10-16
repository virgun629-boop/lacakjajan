import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatDistance, calculateHaversineDistance } from '../../utils/geo';
import {
  Heart,
  Bell,
  MapPin,
  ChevronRight,
  Compass,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Navigation,
} from 'lucide-react';

export const FavoritesScreen: React.FC = () => {
  const {
    vendors,
    favorites,
    toggleFavorite,
    favoriteAlertsEnabled,
    setFavoriteAlertsEnabled,
    buyerLocation,
    setDetailVendorId,
    setActiveTab,
    showToast,
  } = useApp();

  const favoriteVendors = vendors.filter((v) => favorites.includes(v.id));

  const handleToggleAlerts = () => {
    const nextState = !favoriteAlertsEnabled;
    setFavoriteAlertsEnabled(nextState);
    showToast(
      nextState
        ? 'Pengingat pedagang favorit diaktifkan (Notifikasi Dalam Aplikasi)'
        : 'Pengingat pedagang favorit dinonaktifkan'
    );
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header & Notification Toggle Card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-4 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-500">
              <Heart size={20} className="fill-rose-500" />
            </div>
            <div>
              <h2 className="font-bold text-base text-stone-900 dark:text-stone-100">
                Pedagang Favorit ({favoriteVendors.length})
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Lapak jajan langganan yang Anda simpan
              </p>
            </div>
          </div>
        </div>

        {/* In-app reminder toggle */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60">
          <div className="flex items-center gap-2.5">
            <Bell size={16} className="text-teal-600 dark:text-teal-400" />
            <div>
              <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                Pengingat In-App Saat Berjualan
              </p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Beri notifikasi saat pedagang favorit mulai jualan
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleAlerts}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              favoriteAlertsEnabled ? 'bg-teal-600' : 'bg-stone-300 dark:bg-stone-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                favoriteAlertsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="text-[10px] text-stone-400 dark:text-stone-500 px-1 italic">
          *Catatan prototipe: Notifikasi bekerja secara in-app saat aplikasi dibuka.
        </div>
      </div>

      {/* Favorites List */}
      {favoriteVendors.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-8 border border-stone-200/80 dark:border-stone-800 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-400 mx-auto flex items-center justify-center">
            <Heart size={26} />
          </div>
          <h3 className="font-bold text-stone-800 dark:text-stone-200 text-sm">
            Belum ada pedagang favorit
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
            Tekan ikon hati pada pedagang bakso, cilok, atau jajanan keliling lainnya untuk memantau keberadaan mereka.
          </p>
          <button
            onClick={() => setActiveTab('home')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors"
          >
            <Compass size={14} />
            <span>Eksplor Pedagang Sekitar</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {favoriteVendors.map((vendor) => {
            const distance = calculateHaversineDistance(buyerLocation, vendor.location);
            const isRoaming = vendor.operatingStatus === 'roaming';
            const isStationary = vendor.operatingStatus === 'stationary';

            return (
              <div
                key={vendor.id}
                onClick={() => setDetailVendorId(vendor.id)}
                className="bg-white dark:bg-stone-900 rounded-3xl p-4 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                      {vendor.category}
                    </span>
                    <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 mt-1 leading-tight">
                      {vendor.name}
                    </h3>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(vendor.id);
                    }}
                    className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-rose-500"
                    title="Hapus favorit"
                  >
                    <Heart size={18} className="fill-rose-500" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`px-2 py-0.5 rounded-md font-bold text-[11px] border ${
                      isRoaming
                        ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                        : isStationary
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                        : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    {isRoaming
                      ? 'Sedang Keliling'
                      : isStationary
                      ? 'Sedang Mangkal'
                      : 'Tutup'}
                  </span>

                  <span className="text-stone-500 dark:text-stone-400 font-medium">
                    {formatDistance(distance)} dari Anda
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <span className="flex items-center gap-1 truncate max-w-[220px]">
                    <MapPin size={13} className="text-teal-600 shrink-0" />
                    <span className="truncate">{vendor.areaName}</span>
                  </span>
                  <ChevronRight size={15} className="text-stone-400" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
