import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Moon,
  Sun,
  Store,
  Shield,
  HelpCircle,
  RotateCcw,
  ChevronRight,
  Info,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const {
    theme,
    toggleTheme,
    setUserMode,
    setActiveTab,
    showToast,
    favorites,
  } = useApp();

  const [showSwitchModal, setShowSwitchModal] = useState<boolean>(false);

  const handleResetData = () => {
    if (window.confirm('Reset data prototipe ke kondisi awal (default)?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleConfirmSwitchToVendor = () => {
    setShowSwitchModal(false);
    setUserMode('vendor');
    setActiveTab('vendor_dashboard');
    showToast('Beralih ke Dashboard Mode Pedagang');
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Profile Card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400 font-extrabold text-xl shrink-0">
          <User size={28} />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-base text-stone-900 dark:text-stone-100">
              Pengguna Pembeli
            </h2>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
              Aktif
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Kemang & Sekitarnya • {favorites.length} Pedagang Favorit
          </p>
        </div>
      </div>

      {/* App Preferences */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-4 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider px-1">
          Pengaturan Aplikasi
        </h3>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-stone-200/70 dark:bg-stone-700 text-stone-700 dark:text-stone-200">
              {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            </div>
            <div>
              <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                Tema Tampilan
              </p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                {theme === 'dark' ? 'Mode Gelap (Dark)' : 'Mode Terang (Light)'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-xs font-bold shadow-sm hover:bg-stone-50 transition-all"
          >
            Ganti Tema
          </button>
        </div>

        {/* Reset Prototype Data */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-stone-200/70 dark:bg-stone-700 text-stone-700 dark:text-stone-200">
              <RotateCcw size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                Reset Data Simulasi
              </p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Kembalikan daftar pedagang & stok ke awal
              </p>
            </div>
          </div>
          <button
            onClick={handleResetData}
            className="px-3 py-1.5 rounded-xl bg-stone-200/80 dark:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold hover:bg-rose-100 hover:text-rose-700 transition-all"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Merchant / Vendor Portal Entry (Subtle and non-intrusive as requested) */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-4 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider px-1">
          Untuk Pedagang Keliling
        </h3>

        <div
          onClick={() => setShowSwitchModal(true)}
          className="flex items-center justify-between p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 cursor-pointer hover:bg-teal-100/70 dark:hover:bg-teal-950/60 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-600 text-white shrink-0">
              <Store size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-teal-900 dark:text-teal-100 flex items-center gap-1.5">
                <span>Mulai Berjualan (Mode Pedagang)</span>
              </p>
              <p className="text-[11px] text-teal-700 dark:text-teal-300">
                Atur status jualan, stok realtime, dan berbagi lokasi
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-teal-600 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Information & Privacy Transparency */}
      <div className="bg-stone-100 dark:bg-stone-900/60 rounded-3xl p-4 text-xs text-stone-600 dark:text-stone-400 space-y-2 border border-stone-200/60 dark:border-stone-800">
        <div className="flex items-center gap-1.5 font-bold text-stone-800 dark:text-stone-200">
          <Info size={14} className="text-teal-600" />
          <span>Informasi Prototipe & Privasi</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Lacak Jajan prototipe ini berjalan di peramban dengan koordinat simulasi pergerakan pedagang di sekitar Kemang, Jakarta Selatan. Fitur berbagi lokasi menghormati preferensi privasi pedagang: jika pedagang mematikan berbagi lokasi, titik marker langsung disembunyikan dari peta publik.
        </p>
      </div>

      {/* Switch to Merchant Mode Modal */}
      {showSwitchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center mx-auto">
              <Store size={24} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                Buka Mode Pedagang?
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Anda akan masuk ke Dashboard Pedagang UMKM (contoh: Bakso Pak Kumis) untuk mengatur status keliling, update stok dagangan, kelola lokasi, dan mencatat transaksi kasir.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300">
              *Catatan Transparansi: Akses ini adalah prototipe lokal untuk pengujian alur pedagang dan belum dilindungi autentikasi akun server.
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setShowSwitchModal(false)}
                className="py-2.5 px-3 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmSwitchToVendor}
                className="py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-colors"
              >
                Masuk Pedagang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
