import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MenuItem } from '../../types';
import { X, Store, AlertCircle, Plus, Trash2 } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const VendorEditModal: React.FC<Props> = ({ onClose }) => {
  const { currentMerchantVendor, updateVendorProfileData } = useApp();

  const [name, setName] = useState(currentMerchantVendor.name);
  const [category, setCategory] = useState(currentMerchantVendor.category);
  const [tradeType, setTradeType] = useState(currentMerchantVendor.tradeType);
  const [phone, setPhone] = useState(currentMerchantVendor.phone || '');
  const [operatingHours, setOperatingHours] = useState(currentMerchantVendor.operatingHours);
  const [description, setDescription] = useState(currentMerchantVendor.description);
  const [items, setItems] = useState<MenuItem[]>(currentMerchantVendor.items);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePriceChange = (id: string, newPrice: number) => {
    // Validation: prevent negative price
    if (newPrice < 0) return;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, price: newPrice } : item))
    );
  };

  const handleToggleItemAvailability = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  const handleAddItem = () => {
    const newItem: MenuItem = {
      id: `menu_${Date.now()}`,
      name: 'Menu Baru',
      price: 10000,
      isAvailable: true,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama usaha tidak boleh kosong.');
      return;
    }

    // Check all menu prices are valid non-negative numbers
    for (const item of items) {
      if (item.price < 0 || isNaN(item.price)) {
        setErrorMsg(`Harga menu ${item.name} tidak boleh negatif.`);
        return;
      }
    }

    updateVendorProfileData({
      name: name.trim(),
      category: category as any,
      tradeType: tradeType.trim(),
      phone: phone.trim(),
      operatingHours: operatingHours.trim(),
      description: description.trim(),
      items,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
              <Store size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                Edit Profil Usaha & Menu
              </h3>
              <p className="text-[11px] text-stone-500">
                Perbarui identitas lapak dan harga menu jualan
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

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Nama Usaha / Lapak
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Kategori Dagangan
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Makanan Berat">Makanan Berat</option>
                <option value="Jajanan & Gorengan">Jajanan & Gorengan</option>
                <option value="Minuman & Es">Minuman & Es</option>
                <option value="Camilan Manis">Camilan Manis</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Jenis Kendaraan / Lapak
              </label>
              <input
                type="text"
                value={tradeType}
                onChange={(e) => setTradeType(e.target.value)}
                placeholder="Contoh: Gerobak Dorong"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                No. WhatsApp / Kontak
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08123456789"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Jam Operasional
              </label>
              <input
                type="text"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                placeholder="10:00 - 18:00 WIB"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Deskripsi Lapak
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Menu Items Table */}
          <div className="space-y-2 border-t border-stone-100 dark:border-stone-800 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                Daftar Menu & Harga
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline"
              >
                <Plus size={13} />
                <span>Tambah Menu</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs"
                >
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => {
                      const v = e.target.value;
                      setItems(
                        items.map((i) => (i.id === item.id ? { ...i, name: v } : i))
                      );
                    }}
                    className="flex-1 px-2 py-1 rounded bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100"
                  />
                  <div className="flex items-center gap-1 w-28">
                    <span className="text-[10px] text-stone-400">Rp</span>
                    <input
                      type="number"
                      min="0"
                      value={item.price}
                      onChange={(e) =>
                        handlePriceChange(item.id, Number(e.target.value))
                      }
                      className="w-full px-2 py-1 rounded bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-900 dark:text-stone-100"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleItemAvailability(item.id)}
                    className={`px-2 py-1 rounded text-[10px] font-bold ${
                      item.isAvailable
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-400'
                    }`}
                  >
                    {item.isAvailable ? 'Ada' : 'Habis'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1 text-stone-400 hover:text-rose-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
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
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
