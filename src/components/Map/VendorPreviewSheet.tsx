import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatDistance,
  calculateHaversineDistance,
  estimateWalkingTimeMinutes,
  getGoogleMapsNavigationUrl,
} from '../../utils/geo';
import {
  Navigation,
  Share2,
  ChevronRight,
  X,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Heart,
  Phone,
  Footprints,
  Route,
} from 'lucide-react';

export const VendorPreviewSheet: React.FC = () => {
  const {
    vendors,
    selectedMapVendorId,
    setSelectedMapVendorId,
    setDetailVendorId,
    buyerLocation,
    favorites,
    toggleFavorite,
    showToast,
  } = useApp();

  if (!selectedMapVendorId) return null;

  const vendor = vendors.find((v) => v.id === selectedMapVendorId);
  if (!vendor) return null;

  const isFav = favorites.includes(vendor.id);
  const isRoaming = vendor.operatingStatus === 'roaming';
  const isStationary = vendor.operatingStatus === 'stationary';

  const distKm = calculateHaversineDistance(buyerLocation, vendor.location);
  const walkMins = estimateWalkingTimeMinutes(distKm);

  const stockBadgeConfig = {
    available: {
      text: 'Stok Tersedia',
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    },
    low: {
      text: 'Hampir Habis',
      icon: AlertTriangle,
      color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    },
    out_of_stock: {
      text: 'Stok Habis',
      icon: XCircle,
      color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    },
  }[vendor.stockStatus];

  const StockIcon = stockBadgeConfig.icon;

  const handleShare = async () => {
    const mapsUrl = getGoogleMapsNavigationUrl(vendor.location, vendor.name);
    const shareText = `Lacak Jajan: ${vendor.name} (${vendor.category})\nStatus: ${
      isRoaming ? 'Sedang Keliling' : isStationary ? 'Sedang Mangkal' : 'Tutup'
    }\nJarak: ${formatDistance(distKm)} (${walkMins} mnt jalan)\nLokasi: ${
      vendor.areaName
    }\nNavigasi: ${mapsUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: vendor.name,
          text: shareText,
          url: mapsUrl,
        });
        showToast('Lokasi berhasil dibagikan');
      } catch (err) {}
    } else {
      await navigator.clipboard.writeText(shareText);
      showToast('Informasi & link lokasi disalin ke clipboard');
    }
  };

  const handleOpenDirections = () => {
    const url = getGoogleMapsNavigationUrl(vendor.location, vendor.name);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenWhatsApp = () => {
    if (!vendor.phone) {
      showToast('Nomor kontak belum terdaftar');
      return;
    }
    const clean = vendor.phone.replace(/[^0-9]/g, '');
    const num = clean.startsWith('0') ? '62' + clean.slice(1) : clean;
    const msg = encodeURIComponent(
      `Halo ${vendor.name}, saya melihat posisi Anda di Lacak Jajan. Apakah dagangan masih ada?`
    );
    window.open(`https://wa.me/${num}?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="absolute bottom-2 left-2.5 right-2.5 z-[450] pointer-events-auto">
      <div className="bg-white/98 dark:bg-stone-900/98 backdrop-blur-md rounded-3xl border border-stone-200/90 dark:border-stone-800 p-4 shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-4 duration-200 space-y-2.5">
        {/* Header row: Category badge, favorite, close */}
        <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
              {vendor.category}
            </span>
            <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
              {vendor.tradeType}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleFavorite(vendor.id)}
              className="p-1.5 rounded-full text-stone-400 hover:text-rose-500 transition-colors"
              title={isFav ? 'Hapus favorit' : 'Simpan favorit'}
            >
              <Heart
                size={18}
                className={isFav ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}
              />
            </button>
            <button
              onClick={() => setSelectedMapVendorId(null)}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
              title="Tutup preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 leading-tight">
                {vendor.name}
              </h3>
              <p className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300 mt-1">
                <MapPin size={13} className="text-teal-600 dark:text-teal-400 shrink-0" />
                <span className="truncate max-w-[210px]">{vendor.areaName}</span>
              </p>
            </div>

            {/* Operating status badge */}
            <div className="shrink-0 text-right">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                  isRoaming
                    ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                    : isStationary
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                    : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 border-stone-200 dark:border-stone-700'
                }`}
              >
                {isRoaming ? 'Keliling' : isStationary ? 'Mangkal' : 'Tutup'}
              </span>
            </div>
          </div>

          {/* Real distance & Walking time + Stock Badge */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-extrabold">
              <Navigation size={12} className="rotate-45" />
              <span>{formatDistance(distKm)}</span>
              <span className="text-[10px] font-medium text-blue-500">
                (~{walkMins} mnt jalan)
              </span>
            </span>

            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${stockBadgeConfig.color}`}
            >
              <StockIcon size={12} />
              {stockBadgeConfig.text}
            </span>

            <span className="inline-flex items-center gap-1 text-[11px] text-stone-500 dark:text-stone-400 font-medium">
              <Clock size={11} />
              {vendor.lastUpdated}
            </span>
          </div>

          {/* Circuit description if moving */}
          {vendor.streetRouteDescription && (
            <div className="mt-2 p-2 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/60 flex items-center gap-2 text-[11px] text-stone-600 dark:text-stone-300">
              <Route size={14} className="text-teal-600 shrink-0" />
              <span className="truncate">{vendor.streetRouteDescription}</span>
            </div>
          )}

          {/* Action buttons row */}
          <div className="grid grid-cols-4 gap-1.5 mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800">
            <button
              onClick={handleOpenDirections}
              className="flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
            >
              <Navigation size={13} />
              <span>Arah</span>
            </button>

            <button
              onClick={handleOpenWhatsApp}
              className="flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
            >
              <Phone size={13} />
              <span>WA</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 text-xs font-semibold active:scale-95 transition-all"
            >
              <Share2 size={13} />
              <span>Bagi</span>
            </button>

            <button
              onClick={() => {
                setDetailVendorId(vendor.id);
                setSelectedMapVendorId(null);
              }}
              className="flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold shadow-sm active:scale-95 transition-all"
            >
              <span>Detail</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
