import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatDistance,
  getGoogleMapsNavigationUrl,
  estimateWalkingTimeMinutes,
} from '../../utils/geo';
import {
  Search,
  MapPin,
  Clock,
  Navigation,
  Share2,
  Heart,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Map as MapIcon,
  Filter,
  Flame,
  Radio,
  SlidersHorizontal,
  Bell,
  X,
  Compass,
} from 'lucide-react';

const CATEGORIES = [
  'Semua',
  'Makanan Berat',
  'Jajanan & Gorengan',
  'Minuman & Es',
  'Camilan Manis',
];

const RADIUS_OPTIONS = [
  { label: 'Semua Jarak', value: 0 },
  { label: '≤ 1 km', value: 1 },
  { label: '≤ 3 km', value: 3 },
  { label: '≤ 5 km', value: 5 },
];

export const HomeScreen: React.FC = () => {
  const {
    filteredVendors,
    buyerLocation,
    setBuyerLocation,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    radiusFilter,
    setRadiusFilter,
    onlyActiveFilter,
    setOnlyActiveFilter,
    favorites,
    toggleFavorite,
    setDetailVendorId,
    setActiveTab,
    notifications,
    dismissNotification,
    showToast,
  } = useApp();

  const activeCount = filteredVendors.filter(
    (v) => v.operatingStatus !== 'closed' && v.isSharingLocation
  ).length;

  const handleShare = async (vendor: typeof filteredVendors[0], e: React.MouseEvent) => {
    e.stopPropagation();
    const isRoaming = vendor.operatingStatus === 'roaming';
    const isStationary = vendor.operatingStatus === 'stationary';
    const mapsUrl = getGoogleMapsNavigationUrl(vendor.location, vendor.name);
    const text = `Lacak Jajan: ${vendor.name} (${vendor.category})\nStatus: ${
      isRoaming ? 'Sedang Keliling' : isStationary ? 'Sedang Mangkal' : 'Tutup'
    }\nLokasi: ${vendor.areaName}\nNavigasi: ${mapsUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: vendor.name, text, url: mapsUrl });
        showToast('Info pedagang berhasil dibagikan');
      } catch (err) {}
    } else {
      await navigator.clipboard.writeText(text);
      showToast('Info & link navigasi disalin ke clipboard');
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* In-App Notifications Banner (e.g. Favorite vendor started roaming) */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="flex items-start justify-between gap-3 p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-100 shadow-sm animate-in fade-in"
            >
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-full bg-teal-600 text-white shrink-0 mt-0.5">
                  <Bell size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold">{notif.title}</h4>
                  <p className="text-xs text-teal-800 dark:text-teal-200 mt-0.5">
                    {notif.message}
                  </p>
                </div>
              </div>
              <button
                onClick={() => dismissNotification(notif.id)}
                className="text-teal-600 dark:text-teal-400 p-1 hover:bg-teal-100 dark:hover:bg-teal-900 rounded-full"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hero Location & Search Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-4 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-3">
        {/* User Current Location Indicator */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-blue-500/30"></span>
            <span className="font-semibold text-stone-700 dark:text-stone-300">Lokasi Anda:</span>
            <span className="truncate max-w-[190px]">{buyerLocation.address.split(',')[0]}</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
            GPS Demo
          </span>
        </div>

        {/* Search Input Box */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari bakso, cilok, es doger, martabak..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Radius Filter Pills */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-medium">
            <span className="flex items-center gap-1">
              <SlidersHorizontal size={13} className="text-teal-600" />
              <span>Jarak Maksimal (Radius Haversine):</span>
            </span>
            {radiusFilter > 0 && (
              <button
                onClick={() => setRadiusFilter(0)}
                className="text-[11px] text-teal-600 dark:text-teal-400 font-bold hover:underline"
              >
                Reset
              </button>
            )}
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {RADIUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRadiusFilter(opt.value)}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold text-center transition-all ${
                  radiusFilter === opt.value
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Pills & Active Filter Switch */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setOnlyActiveFilter(!onlyActiveFilter)}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
            onlyActiveFilter
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Buka Saja</span>
        </button>

        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              categoryFilter === cat
                ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-sm'
                : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:border-stone-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Interactive Map Quick Card Banner */}
      <div
        onClick={() => setActiveTab('map')}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 p-4 text-white shadow-md cursor-pointer group active:scale-[0.99] transition-all"
      >
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold tracking-wide uppercase">
              <Radio size={11} className="animate-pulse" />
              <span>Live Tracking Demo</span>
            </div>
            <h3 className="font-extrabold text-base leading-tight">
              {activeCount} Pedagang Sedang Aktif di Peta
            </h3>
            <p className="text-xs text-teal-100 opacity-90">
              Pantau posisi gerobak keliling secara visual di peta interaktif
            </p>
          </div>

          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <MapIcon size={22} className="text-white" />
          </div>
        </div>
      </div>

      {/* Header Results Count */}
      <div className="flex items-center justify-between px-1">
        <h2 className="font-bold text-sm text-stone-900 dark:text-stone-100">
          Daftar Pedagang UMKM Sekitar ({filteredVendors.length})
        </h2>
        {radiusFilter > 0 && (
          <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">
            Radius ≤ {radiusFilter} km
          </span>
        )}
      </div>

      {/* Vendors Cards List */}
      {filteredVendors.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-8 border border-stone-200/80 dark:border-stone-800 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-stone-100 dark:bg-stone-800 mx-auto flex items-center justify-center text-stone-400">
            <Filter size={24} />
          </div>
          <h3 className="font-bold text-stone-800 dark:text-stone-200 text-sm">
            Tidak ada pedagang ditemukan
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
            Coba ubah kata kunci pencarian, perluas filter jarak radius, atau aktifkan pedagang yang tutup.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('Semua');
              setRadiusFilter(0);
              setOnlyActiveFilter(false);
            }}
            className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVendors.map((vendor) => {
            const isFav = favorites.includes(vendor.id);
            const isRoaming = vendor.operatingStatus === 'roaming';
            const isStationary = vendor.operatingStatus === 'stationary';
            const isClosed = vendor.operatingStatus === 'closed';

            const stockConfig = {
              available: {
                text: 'Tersedia',
                icon: CheckCircle2,
                color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
              },
              low: {
                text: 'Hampir Habis',
                icon: AlertTriangle,
                color: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
              },
              out_of_stock: {
                text: 'Habis',
                icon: XCircle,
                color: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
              },
            }[vendor.stockStatus];

            const StockIcon = stockConfig.icon;

            return (
              <div
                key={vendor.id}
                onClick={() => setDetailVendorId(vendor.id)}
                className="bg-white dark:bg-stone-900 rounded-3xl p-4 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.99] group space-y-3"
              >
                {/* Top row: Name & Favorite */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                        {vendor.category}
                      </span>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                        {vendor.tradeType}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 group-hover:text-teal-600 transition-colors leading-tight">
                      {vendor.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(vendor.id);
                      }}
                      className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-rose-500 transition-colors"
                      title={isFav ? 'Hapus favorit' : 'Simpan favorit'}
                    >
                      <Heart
                        size={18}
                        className={isFav ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}
                      />
                    </button>
                    <button
                      onClick={(e) => handleShare(vendor, e)}
                      className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                      title="Bagikan Lokasi"
                    >
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Status Badges & Distance Row */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  {/* Distance badge */}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold">
                    <Navigation size={12} className="rotate-45" />
                    <span>{formatDistance(vendor.distanceKm)}</span>
                    <span className="text-[10px] text-blue-500 font-medium">
                      (~{estimateWalkingTimeMinutes(vendor.distanceKm)} mnt)
                    </span>
                  </span>

                  {/* Operating status badge */}
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border ${
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

                  {/* Stock status badge */}
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${stockConfig.color}`}
                  >
                    <StockIcon size={12} />
                    {stockConfig.text}
                  </span>
                </div>

                {/* Location area & last update info */}
                <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 border-t border-stone-100 dark:border-stone-800 pt-2.5">
                  <span className="flex items-center gap-1 truncate max-w-[210px]">
                    <MapPin size={13} className="text-teal-600 dark:text-teal-400 shrink-0" />
                    <span className="truncate">
                      {vendor.isSharingLocation
                        ? vendor.areaName
                        : 'Lokasi tidak dibagikan (Privasi)'}
                    </span>
                  </span>

                  <span className="flex items-center gap-1 shrink-0">
                    <Clock size={11} />
                    {vendor.lastUpdated}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
