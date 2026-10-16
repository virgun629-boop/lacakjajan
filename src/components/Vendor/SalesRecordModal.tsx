import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Plus, AlertCircle, ShoppingCart } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const SalesRecordModal: React.FC<Props> = ({ onClose }) => {
  const { currentMerchantVendor, addSaleRecord } = useApp();

  const [menuItemName, setMenuItemName] = useState<string>(
    currentMerchantVendor.items[0]?.name || ''
  );
  const [customItemName, setCustomItemName] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [unitPrice, setUnitPrice] = useState<string>(
    String(currentMerchantVendor.items[0]?.price || 15000)
  );
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If selecting from pre-defined menu
  const handleSelectMenuItem = (name: string) => {
    setMenuItemName(name);
    const item = currentMerchantVendor.items.find((i) => i.name === name);
    if (item) {
      setUnitPrice(String(item.price));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const activeItemName = menuItemName === 'CUSTOM' ? customItemName.trim() : menuItemName.trim();

    if (!activeItemName) {
      setErrorMsg('Nama menu atau jajanan harus diisi.');
      return;
    }

    const qtyNumber = Number(quantity);
    const priceNumber = Number(unitPrice);

    // CRITICAL REQUIREMENT: Strict input validation preventing negative or invalid values
    if (isNaN(qtyNumber) || qtyNumber <= 0) {
      setErrorMsg('Jumlah (porsi) harus berupa angka positif minimal 1.');
      return;
    }

    if (isNaN(priceNumber) || priceNumber < 0) {
      setErrorMsg('Harga nominal tidak boleh bernilai negatif (kurang dari 0).');
      return;
    }

    const res = addSaleRecord({
      menuItemName: activeItemName,
      quantity: qtyNumber,
      unitPrice: priceNumber,
      notes,
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Gagal menyimpan catatan penjualan.');
      return;
    }

    onClose();
  };

  const calculatedTotal = Math.max(0, (Number(quantity) || 0) * (Number(unitPrice) || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
              <ShoppingCart size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                Catat Transaksi Penjualan Kasir
              </h3>
              <p className="text-[11px] text-stone-500">
                Pencatatan jualan harian UMKM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Menu Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Pilih Menu / Dagangan
            </label>
            <select
              value={menuItemName}
              onChange={(e) => handleSelectMenuItem(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {currentMerchantVendor.items.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name} - Rp {item.price.toLocaleString('id-ID')}
                </option>
              ))}
              <option value="CUSTOM">+ Menu Lainnya (Tulis Manual)</option>
            </select>
          </div>

          {menuItemName === 'CUSTOM' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Nama Menu Kustom
              </label>
              <input
                type="text"
                placeholder="Contoh: Es Teh Jumbo"
                value={customItemName}
                onChange={(e) => setCustomItemName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          )}

          {/* Quantity & Unit Price Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Jumlah Porsi
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => {
                  const val = e.target.value;
                  // Immediately prevent negative numbers on typing
                  if (Number(val) < 0) return;
                  setQuantity(val);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="1"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Harga Satuan (Rp)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={unitPrice}
                onChange={(e) => {
                  const val = e.target.value;
                  // Immediately prevent negative price on typing
                  if (Number(val) < 0) return;
                  setUnitPrice(val);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="0"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Catatan Pembeli (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Tanpa kuah, sambal dipisah"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Total Calculation Display */}
          <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-800 dark:text-teal-200">
              Total Nominal:
            </span>
            <span className="text-base font-extrabold text-teal-900 dark:text-teal-100">
              Rp {calculatedTotal.toLocaleString('id-ID')}
            </span>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-3 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-colors"
            >
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
