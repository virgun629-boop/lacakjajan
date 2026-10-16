import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatDistance,
  calculateHaversineDistance,
  estimateWalkingTimeMinutes,
  getGoogleMapsNavigationUrl,
} from '../../utils/geo';
import {
  X,
  MapPin,
  Clock,
  Navigation,
  Share2,
  Heart,
  Phone,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShoppingBag,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export const VendorDetailModal: React.FC = () => {
  const {
    detailVendorId,
    setDetailVendorId,
    vendors,
    buyerLocation,
    favorites,
    toggleFavorite,
    showToast,
  } = useApp();

  if (!detailVendorId) return null;

  const vendor = vendors.find((v) => v.id === detailVendorId);
  if (!vendor) return null;

  const isFav = favorites.includes(vendor.id);
  const distanceKm = calculateHaversineDistance(buyerLocation, vendor.location);

  const isRoaming = vendor.operatingStatus === 'roaming';
  const isStationary = vendor.operatingStatus === 'stationary';
  const isClosed = vendor.operatingStatus === 'closed';

  const stockBadgeConfig = {
    available: {
      text: 'Masih Tersedia',
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    },
    low: {
      text: 'Hampir Habis',
      icon: AlertTriangle,
      color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    },
    out_of_stock: {
      text: 'Habis Hari Ini',
      icon: XCircle,
      color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    },
  }[vendor.stockStatus];

  const StockIcon = stockBadgeConfig.icon;

  const handleShare = async () => {
    const mapsUrl = getGoogleMapsNavigationUrl(vendor.location, vendor.name);
    const shareText = `Lacak Jajan: ${vendor.name} (${vendor.category})\nStatus: ${
      isRoaming ? 'Sedang Keliling' : isStationary ? 'Sedang Mangkal' : 'Tutup'
    }\nStok: ${stockBadgeConfig.text}\nLokasi: ${
      vendor.isSharingLocation ? vendor.areaName : 'Lokasi tidak dibagikan'
    }\nUpdate: ${vendor.lastUpdated}\nNavigasi: ${mapsUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: vendor.name,
          text: shareText,
          url: mapsUrl,
        });
        showToast('Info lokasi berhasil dibagikan');
      } catch (err) {}
    } else {
      await navigator.clipboard.writeText(shareText);
      showToast('Informasi lokasi disalin ke clipboard');
    }
  };

  const handleOpenDirections = () => {
    if (!vendor.isSharingLocation) {
      showToast('Pedagang sedang tidak membagikan lokasi langsung');
      return;
    }
    const url = getGoogleMapsNavigationUrl(vendor.location, vendor.name);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleContactWhatsApp = () => {
    if (!vendor.phone) {
      showToast('Nomor kontak belum dicantumkan');
      return;
    }
    const cleanPhone = vendor.phone.replace(/[^0-9]/g, '');
    const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    const msg = encodeURIComponent(
      `Halo ${vendor.name}, saya menemukan lapak Anda di aplikasi Lacak Jajan. Apakah sekarang masih ada stok dagangan?`
    );
    window.open(`https://wa.me/${waNumber}?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4 pb-6">
        {/* Sticky Header with Close and Actions */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
              {vendor.category}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              {vendor.tradeType}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(vendor.id)}
              className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 transition-colors"
              title={isFav ? 'Hapus favorit' : 'Simpan favorit'}
            >
              <Heart
                size={20}
                className={isFav ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}
              />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-300 transition-colors"
              title="Bagikan"
            >
              <Share2 size={18} />
            </button>
            <button
              onClick={() => setDetailVendorId(null)}
              className="p-2 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 transition-colors"
              title="Tutup"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Hero Info */}
        <div className="px-5 space-y-3">
          <div>
            <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100">
              {vendor.name}
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
              {vendor.description}
            </p>
          </div>

          {/* Status Grid Cards */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {/* Operating status */}
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 space-y-1">
              <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                Status Berjualan
              </span>
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isRoaming
                      ? 'bg-teal-500 animate-pulse'
                      : isStationary
                      ? 'bg-blue-500'
                      : 'bg-stone-400'
                  }`}
                />
                <span className="text-stone-900 dark:text-stone-100">
                  {isRoaming
                    ? 'Sedang Keliling'
                    : isStationary
                    ? 'Sedang Mangkal'
                    : 'Tutup / Istirahat'}
                </span>
              </div>
            </div>

            {/* Stock status */}
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 space-y-1">
              <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                Ketersediaan Stok
              </span>
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <StockIcon
                  size={14}
                  className={
                    vendor.stockStatus === 'available'
                      ? 'text-emerald-600'
                      : vendor.stockStatus === 'low'
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }
                />
                <span className="text-stone-900 dark:text-stone-100">
                  {stockBadgeConfig.text}
                </span>
              </div>
            </div>
          </div>

          {/* Location & Tracking Details Card */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <MapPin size={15} className="text-teal-600" />
                <span>Posisi & Lokasi Terkini</span>
              </span>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                {formatDistance(distanceKm)} (~{estimateWalkingTimeMinutes(distanceKm)} mnt jalan)
              </span>
            </div>

            {vendor.isSharingLocation ? (
              <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
                <p className="font-semibold text-stone-900 dark:text-stone-100">
                  {vendor.areaName}
                </p>
                <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>Pembaruan: {vendor.lastUpdated}</span>
                  </span>
                  <span>Jam Buka: {vendor.operatingHours}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <p>
                  Pedagang sedang <strong>menonaktifkan berbagi lokasi live</strong>. Lokasi
                  peta disembunyikan demi privasi pedagang.
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleOpenDirections}
                disabled={!vendor.isSharingLocation}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  vendor.isSharingLocation
                    ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm active:scale-95'
                    : 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
                }`}
              >
                <Navigation size={14} />
                <span>Petunjuk Arah</span>
              </button>

              <button
                onClick={handleContactWhatsApp}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
              >
                <Phone size={14} />
                <span>Hubungi WA</span>
              </button>
            </div>
          </div>

          {/* Menu Items List */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <ShoppingBag size={15} className="text-teal-600" />
                <span>Daftar Menu & Harga</span>
              </h3>
              <span className="text-xs text-stone-500 font-medium">
                {vendor.items.length} Menu
              </span>
            </div>

            <div className="divide-y divide-stone-100 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden bg-white dark:bg-stone-900">
              {vendor.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-stone-900 dark:text-stone-100">
                      {item.name}
                    </p>
                    {item.description && (
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-extrabold text-teal-700 dark:text-teal-400">
                      Rp {item.price.toLocaleString('id-ID')}
                    </p>
                    <span
                      className={`text-[10px] font-semibold ${
                        item.isAvailable
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-stone-400 dark:text-stone-500'
                      }`}
                    >
                      {item.isAvailable ? 'Tersedia' : 'Habis'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
