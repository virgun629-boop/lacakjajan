import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OperatingStatus, StockStatus } from '../../types';
import {
  Store,
  MapPin,
  Clock,
  Radio,
  Eye,
  EyeOff,
  ShoppingBag,
  DollarSign,
  Plus,
  Trash2,
  Edit3,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Truck,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { SalesRecordModal } from './SalesRecordModal';
import { VendorEditModal } from './VendorEditModal';

export const VendorDashboard: React.FC = () => {
  const {
    currentMerchantVendor,
    updateVendorOperatingStatus,
    updateVendorStockStatus,
    updateVendorLocationSharing,
    salesRecords,
    deleteSaleRecord,
    setUserMode,
    setActiveTab,
    showToast,
  } = useApp();

  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const vendor = currentMerchantVendor;

  // Filter sales for this vendor
  const merchantSales = salesRecords.filter((s) => s.vendorId === vendor.id);
  const totalRevenue = merchantSales.reduce((sum, s) => sum + s.totalPrice, 0);

  const handleReturnToBuyerMode = () => {
    setUserMode('buyer');
    setActiveTab('home');
    showToast('Kembali ke Mode Pembeli');
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Return to Buyer Mode Header Banner */}
      <div className="flex items-center justify-between bg-stone-900 text-white dark:bg-stone-800 p-3.5 rounded-3xl shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-600 text-white shrink-0">
            <Store size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-teal-400 uppercase">
              Dashboard Pedagang UMKM
            </span>
            <h2 className="text-sm font-bold truncate max-w-[170px]">{vendor.name}</h2>
          </div>
        </div>

        <button
          onClick={handleReturnToBuyerMode}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all active:scale-95"
        >
          <ArrowLeft size={14} />
          <span>Ke Pembeli</span>
        </button>
      </div>

      {/* 1. Status Berjualan (Operating Status) */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-4 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
              Status Berjualan
            </h3>
            <p className="text-[11px] text-stone-500">
              Pilih apakah Anda sedang berkeliling atau mangkal
            </p>
          </div>

          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
              vendor.operatingStatus === 'roaming'
                ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                : vendor.operatingStatus === 'stationary'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 border-stone-200 dark:border-stone-700'
            }`}
          >
            {vendor.operatingStatus === 'roaming'
              ? 'Sedang Keliling'
              : vendor.operatingStatus === 'stationary'
              ? 'Sedang Mangkal'
              : 'Tutup / Istirahat'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => updateVendorOperatingStatus('roaming')}
            className={`py-2.5 px-2 rounded-2xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
              vendor.operatingStatus === 'roaming'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
            }`}
          >
            <Truck size={16} />
            <span>Keliling</span>
          </button>

          <button
            onClick={() => updateVendorOperatingStatus('stationary')}
            className={`py-2.5 px-2 rounded-2xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
              vendor.operatingStatus === 'stationary'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
            }`}
          >
            <MapPin size={16} />
            <span>Mangkal</span>
          </button>

          <button
            onClick={() => updateVendorOperatingStatus('closed')}
            className={`py-2.5 px-2 rounded-2xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
              vendor.operatingStatus === 'closed'
                ? 'bg-stone-700 text-white shadow-md'
                : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
            }`}
          >
            <XCircle size={16} />
            <span>Tutup</span>
          </button>
        </div>
      </div>

      {/* 2. Privasi Berbagi Lokasi (Location Sharing Privacy Toggle) */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-4 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                Privasi Berbagi Lokasi
              </h3>
              {vendor.isSharingLocation ? (
                <ShieldCheck size={16} className="text-teal-600" />
              ) : (
                <ShieldAlert size={16} className="text-amber-500" />
              )}
            </div>
            <p className="text-[11px] text-stone-500">
              {vendor.isSharingLocation
                ? 'Lokasi Anda ditampilkan di peta pembeli'
                : 'Lokasi Anda disembunyikan (Privasi aktif)'}
            </p>
          </div>

          <button
            onClick={() => updateVendorLocationSharing(!vendor.isSharingLocation)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              vendor.isSharingLocation ? 'bg-teal-600' : 'bg-stone-300 dark:bg-stone-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                vendor.isSharingLocation ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-stone-600 dark:text-stone-300">
            <span className="flex items-center gap-1 font-medium">
              <MapPin size={13} className="text-teal-600" />
              <span>Area Saat Ini:</span>
            </span>
            <span className="font-bold text-stone-900 dark:text-stone-100 truncate max-w-[190px]">
              {vendor.isSharingLocation ? vendor.areaName : 'Lokasi Disembunyikan'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-500">
            <span>Koordinat Demo:</span>
            <span>
              {vendor.location.lat.toFixed(4)}, {vendor.location.lng.toFixed(4)}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-500">
            <span>Pembaruan Terakhir:</span>
            <span>{vendor.lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* 3. Status Stok Ketersediaan (Stock Status) */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-4 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
              Ketersediaan Stok Dagangan
            </h3>
            <p className="text-[11px] text-stone-500">
              Beri tahu pembeli kondisi sisa stok jualan Anda
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => updateVendorStockStatus('available')}
            className={`py-2 px-2 rounded-2xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all ${
              vendor.stockStatus === 'available'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            }`}
          >
            <CheckCircle2 size={16} />
            <span>Tersedia</span>
          </button>

          <button
            onClick={() => updateVendorStockStatus('low')}
            className={`py-2 px-2 rounded-2xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all ${
              vendor.stockStatus === 'low'
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
            }`}
          >
            <AlertTriangle size={16} />
            <span>Hampir Habis</span>
          </button>

          <button
            onClick={() => updateVendorStockStatus('out_of_stock')}
            className={`py-2 px-2 rounded-2xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all ${
              vendor.stockStatus === 'out_of_stock'
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
            }`}
          >
            <XCircle size={16} />
            <span>Habis</span>
          </button>
        </div>
      </div>

      {/* 4. Kasir & Pencatatan Transaksi Penjualan */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-4 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
              Pencatatan Penjualan Hari Ini
            </h3>
            <p className="text-[11px] text-stone-500">
              Rekap pemasukan dan riwayat kasir pedagang
            </p>
          </div>
          <button
            onClick={() => setShowSalesModal(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
          >
            <Plus size={14} />
            <span>Catat Jualan</span>
          </button>
        </div>

        {/* Revenue Summary Card */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 space-y-0.5">
            <span className="text-[11px] font-semibold text-teal-800 dark:text-teal-300">
              Total Pemasukan:
            </span>
            <p className="text-base font-extrabold text-teal-900 dark:text-teal-100">
              Rp {totalRevenue.toLocaleString('id-ID')}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 space-y-0.5">
            <span className="text-[11px] font-semibold text-stone-500">
              Transaksi:
            </span>
            <p className="text-base font-extrabold text-stone-900 dark:text-stone-100">
              {merchantSales.length} Transaksi
            </p>
          </div>
        </div>

        {/* Sales Records List */}
        <div className="divide-y divide-stone-100 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden bg-white dark:bg-stone-900">
          {merchantSales.length === 0 ? (
            <div className="p-4 text-center text-xs text-stone-500">
              Belum ada transaksi dicatat hari ini. Tekan tombol &quot;Catat Jualan&quot;.
            </div>
          ) : (
            merchantSales.slice(0, 5).map((record) => (
              <div
                key={record.id}
                className="p-3 flex items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5">
                  <p className="font-bold text-stone-900 dark:text-stone-100">
                    {record.menuItemName}
                  </p>
                  <p className="text-[11px] text-stone-500">
                    {record.quantity} porsi @ Rp {record.unitPrice.toLocaleString('id-ID')} • {record.date}
                  </p>
                  {record.notes && (
                    <p className="text-[10px] text-stone-400 italic">{record.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-teal-700 dark:text-teal-400">
                    Rp {record.totalPrice.toLocaleString('id-ID')}
                  </span>
                  <button
                    onClick={() => deleteSaleRecord(record.id)}
                    className="p-1 text-stone-400 hover:text-rose-500"
                    title="Hapus catatan"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5. Profil Usaha & Menu Card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-4 border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
            Profil Lapak & Daftar Menu
          </h3>
          <p className="text-xs text-stone-500">
            {vendor.items.length} menu terdaftar • Jam buka {vendor.operatingHours}
          </p>
        </div>

        <button
          onClick={() => setShowEditModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold transition-all active:scale-95"
        >
          <Edit3 size={14} />
          <span>Edit Usaha</span>
        </button>
      </div>

      {/* Modals */}
      {showSalesModal && <SalesRecordModal onClose={() => setShowSalesModal(false)} />}
      {showEditModal && <VendorEditModal onClose={() => setShowEditModal(false)} />}
    </div>
  );
};
