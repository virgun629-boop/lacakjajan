import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import {
  Vendor,
  SaleRecord,
  InAppNotification,
  StockStatus,
  OperatingStatus,
  UserRole,
  Coordinates,
} from '../types';
import {
  INITIAL_BUYER_LOCATION,
  INITIAL_MOCK_VENDORS,
  INITIAL_SALES_RECORDS,
} from '../data/mockVendors';
import {
  calculateHaversineDistance,
  getSimulatedNextPositionAlongPath,
} from '../utils/geo';

interface AppContextType {
  // Mode & UI
  userMode: UserRole;
  setUserMode: (mode: UserRole) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Vendors & Filtering
  vendors: Vendor[];
  buyerLocation: Coordinates & { address: string };
  setBuyerLocation: (loc: Coordinates & { address: string }) => void;
  radiusFilter: number; // 0 = all, 1, 3, 5 km
  setRadiusFilter: (km: number) => void;
  categoryFilter: string;
  setCategoryFilter: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onlyActiveFilter: boolean;
  setOnlyActiveFilter: (val: boolean) => void;
  filteredVendors: (Vendor & { distanceKm: number })[];

  // Favorites & Alerts
  favorites: string[];
  toggleFavorite: (vendorId: string) => void;
  isFavorite: (vendorId: string) => boolean;
  favoriteAlertsEnabled: boolean;
  setFavoriteAlertsEnabled: (enabled: boolean) => void;
  notifications: InAppNotification[];
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;

  // Selected for inspection
  selectedMapVendorId: string | null;
  setSelectedMapVendorId: (id: string | null) => void;
  detailVendorId: string | null;
  setDetailVendorId: (id: string | null) => void;

  // Simulation & Map Controls
  isSimulatingMovement: boolean;
  setIsSimulatingMovement: (val: boolean) => void;
  recenterTrigger: number;
  triggerRecenter: () => void;

  // Vendor merchant mode & actions
  currentMerchantVendor: Vendor;
  updateVendorOperatingStatus: (status: OperatingStatus) => void;
  updateVendorStockStatus: (status: StockStatus) => void;
  updateVendorLocationSharing: (isSharing: boolean) => void;
  updateVendorProfileData: (data: Partial<Vendor>) => void;

  // Sales records (Catatan Penjualan Kasir)
  salesRecords: SaleRecord[];
  addSaleRecord: (record: {
    menuItemName: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
  }) => { success: boolean; error?: string };
  deleteSaleRecord: (id: string) => void;

  // Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const VENDORS_STORAGE_KEY = 'lacak_jajan_vendors_v2';
const FAVORITES_STORAGE_KEY = 'lacak_jajan_favorites_v2';
const THEME_STORAGE_KEY = 'lacak_jajan_theme_v2';
const SALES_STORAGE_KEY = 'lacak_jajan_sales_v2';
const NOTIFS_STORAGE_KEY = 'lacak_jajan_notifs_v2';
const ALERTS_STORAGE_KEY = 'lacak_jajan_alerts_enabled_v2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // User Mode (defaults strictly to 'buyer' so app immediately opens buyer experience)
  const [userMode, setUserMode] = useState<UserRole>('buyer');
  const [activeTab, setActiveTab] = useState<string>('home');

  // Buyer location state
  const [buyerLocation, setBuyerLocation] = useState(INITIAL_BUYER_LOCATION);

  // Vendors state
  const [vendors, setVendors] = useState<Vendor[]>(() => {
    try {
      const saved = localStorage.getItem(VENDORS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved vendors', e);
    }
    return INITIAL_MOCK_VENDORS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(VENDORS_STORAGE_KEY, JSON.stringify(vendors));
    } catch (e) {
      console.error('Failed to persist vendors', e);
    }
  }, [vendors]);

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse favorites', e);
    }
    return ['v1', 'v2'];
  });

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to persist favorites', e);
    }
  }, [favorites]);

  const [favoriteAlertsEnabled, setFavoriteAlertsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(ALERTS_STORAGE_KEY);
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem(ALERTS_STORAGE_KEY, String(favoriteAlertsEnabled));
  }, [favoriteAlertsEnabled]);

  // In-app notifications
  const [notifications, setNotifications] = useState<InAppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(NOTIFS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load notifications', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to persist notifications', e);
    }
  }, [notifications]);

  // Sales records for merchant
  const [salesRecords, setSalesRecords] = useState<SaleRecord[]>(() => {
    try {
      const saved = localStorage.getItem(SALES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load sales records', e);
    }
    return INITIAL_SALES_RECORDS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(salesRecords));
    } catch (e) {
      console.error('Failed to persist sales records', e);
    }
  }, [salesRecords]);

  // Filters
  const [radiusFilter, setRadiusFilter] = useState<number>(0); // 0 = all, 1, 3, 5 km
  const [categoryFilter, setCategoryFilter] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyActiveFilter, setOnlyActiveFilter] = useState<boolean>(false);

  // Selected detail & map selection
  const [selectedMapVendorId, setSelectedMapVendorId] = useState<string | null>(null);
  const [detailVendorId, setDetailVendorId] = useState<string | null>(null);

  // Simulation & Recenter
  const [isSimulatingMovement, setIsSimulatingMovement] = useState<boolean>(true);
  const [recenterTrigger, setRecenterTrigger] = useState<number>(0);
  const triggerRecenter = () => setRecenterTrigger((prev) => prev + 1);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  // Vendor account for current merchant (defaults to v1 - Pak Kumis)
  const currentMerchantVendor = useMemo(() => {
    return vendors.find((v) => v.id === 'v1') || vendors[0];
  }, [vendors]);

  // Movement simulation step tracker
  const simulationStepRef = useRef<number>(0);

  useEffect(() => {
    if (!isSimulatingMovement) return;

    const interval = setInterval(() => {
      simulationStepRef.current += 1;
      const step = simulationStepRef.current;

      setVendors((prevVendors) => {
        return prevVendors.map((vendor, idx) => {
          // Only roam if sharing location, operating roaming, and active
          if (vendor.isSharingLocation && vendor.operatingStatus === 'roaming') {
            const waypoints =
              vendor.streetWaypoints && vendor.streetWaypoints.length > 1
                ? vendor.streetWaypoints
                : [vendor.initialLocation];

            const { newCoords, updatedArea, headingAngle } = getSimulatedNextPositionAlongPath(
              waypoints,
              step + idx * 3,
              vendor.initialLocation
            );

            return {
              ...vendor,
              location: newCoords,
              areaName: updatedArea,
              headingAngle,
              lastUpdated: 'Baru saja',
            };
          }
          return vendor;
        });
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [isSimulatingMovement]);

  // Favorites toggle
  const toggleFavorite = (vendorId: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(vendorId);
      const target = vendors.find((v) => v.id === vendorId);
      if (exists) {
        showToast(`${target?.name || 'Pedagang'} dihapus dari favorit`);
        return prev.filter((id) => id !== vendorId);
      } else {
        showToast(`${target?.name || 'Pedagang'} disimpan ke favorit!`);
        return [...prev, vendorId];
      }
    });
  };

  const isFavorite = (vendorId: string) => favorites.includes(vendorId);

  // Dismiss / Clear Notifications
  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Vendor actions for merchant mode
  const updateVendorOperatingStatus = (status: OperatingStatus) => {
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === currentMerchantVendor.id) {
          const wasClosed = v.operatingStatus === 'closed';
          const isNowOpen = status !== 'closed';

          // In-app alert notification trigger if favorite
          if (wasClosed && isNowOpen && favoriteAlertsEnabled && favorites.includes(v.id)) {
            const newNotifId = `notif_${v.id}_${Date.now()}`;
            setNotifications((n) => [
              {
                id: newNotifId,
                vendorId: v.id,
                vendorName: v.name,
                title: 'Pedagang Favorit Mulai Berjualan!',
                message: `${v.name} kini sedang ${
                  status === 'roaming' ? 'keliling' : 'mangkal'
                } di ${v.areaName}.`,
                timestamp: 'Baru saja',
                read: false,
              },
              ...n,
            ]);
          }

          return {
            ...v,
            operatingStatus: status,
            lastUpdated: 'Baru saja',
          };
        }
        return v;
      })
    );
    showToast(
      `Status berjualan diperbarui: ${
        status === 'roaming'
          ? 'Sedang Keliling'
          : status === 'stationary'
          ? 'Sedang Mangkal'
          : 'Tutup / Istirahat'
      }`
    );
  };

  const updateVendorStockStatus = (status: StockStatus) => {
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === currentMerchantVendor.id) {
          return {
            ...v,
            stockStatus: status,
            lastUpdated: 'Baru saja',
          };
        }
        return v;
      })
    );
    showToast(
      `Status stok diperbarui: ${
        status === 'available'
          ? 'Masih Tersedia'
          : status === 'low'
          ? 'Hampir Habis'
          : 'Habis'
      }`
    );
  };

  const updateVendorLocationSharing = (isSharing: boolean) => {
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === currentMerchantVendor.id) {
          return {
            ...v,
            isSharingLocation: isSharing,
            lastUpdated: 'Baru saja',
          };
        }
        return v;
      })
    );
    showToast(
      isSharing
        ? 'Berbagi lokasi diaktifkan. Marker tampil di peta pembeli.'
        : 'Berbagi lokasi dinonaktifkan. Titik Anda disembunyikan dari peta pembeli.'
    );
  };

  const updateVendorProfileData = (data: Partial<Vendor>) => {
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === currentMerchantVendor.id) {
          return { ...v, ...data, lastUpdated: 'Baru saja' };
        }
        return v;
      })
    );
    showToast('Profil usaha berhasil disimpan!');
  };

  // Add Sale Record with STRICT INPUT VALIDATION to prevent negative nominals or counts
  const addSaleRecord = (record: {
    menuItemName: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
  }) => {
    const trimmedName = record.menuItemName?.trim();
    if (!trimmedName) {
      return { success: false, error: 'Nama menu / dagangan tidak boleh kosong.' };
    }

    // Validation: prevent negative or zero quantity
    if (isNaN(record.quantity) || record.quantity <= 0) {
      return { success: false, error: 'Jumlah item harus angka positif (minimal 1).' };
    }

    // Validation: prevent negative unit price
    if (isNaN(record.unitPrice) || record.unitPrice < 0) {
      return { success: false, error: 'Harga satuan tidak boleh berupa nilai negatif.' };
    }

    const total = Math.round(record.quantity * record.unitPrice);

    const newRecord: SaleRecord = {
      id: `sale_${Date.now()}`,
      vendorId: currentMerchantVendor.id,
      date: `Hari ini, ${new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      })} WIB`,
      menuItemName: trimmedName,
      quantity: Math.floor(record.quantity),
      unitPrice: Math.round(record.unitPrice),
      totalPrice: total,
      notes: record.notes?.trim() || undefined,
    };

    setSalesRecords((prev) => [newRecord, ...prev]);
    showToast(`Catatan penjualan Rp ${total.toLocaleString('id-ID')} tersimpan!`);
    return { success: true };
  };

  const deleteSaleRecord = (id: string) => {
    setSalesRecords((prev) => prev.filter((s) => s.id !== id));
    showToast('Catatan penjualan berhasil dihapus');
  };

  // Filtered vendors with exact Haversine distance
  const filteredVendors = useMemo(() => {
    return vendors
      .map((vendor) => {
        const distanceKm = calculateHaversineDistance(buyerLocation, vendor.location);
        return {
          ...vendor,
          distanceKm: Number(distanceKm.toFixed(2)),
        };
      })
      .filter((vendor) => {
        // Radius filter
        if (radiusFilter > 0 && vendor.distanceKm > radiusFilter) {
          return false;
        }

        // Category filter
        if (categoryFilter !== 'Semua' && vendor.category !== categoryFilter) {
          return false;
        }

        // Active only filter
        if (onlyActiveFilter && vendor.operatingStatus === 'closed') {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = vendor.name.toLowerCase().includes(q);
          const matchCategory = vendor.category.toLowerCase().includes(q);
          const matchArea = vendor.areaName.toLowerCase().includes(q);
          const matchTrade = vendor.tradeType.toLowerCase().includes(q);
          const matchItems = vendor.items.some((item) =>
            item.name.toLowerCase().includes(q)
          );

          if (!matchName && !matchCategory && !matchArea && !matchTrade && !matchItems) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Sort active vendors first, then by distance
        if (a.operatingStatus === 'closed' && b.operatingStatus !== 'closed') return 1;
        if (a.operatingStatus !== 'closed' && b.operatingStatus === 'closed') return -1;
        return a.distanceKm - b.distanceKm;
      });
  }, [
    vendors,
    buyerLocation,
    radiusFilter,
    categoryFilter,
    onlyActiveFilter,
    searchQuery,
  ]);

  return (
    <AppContext.Provider
      value={{
        userMode,
        setUserMode,
        theme,
        toggleTheme,
        activeTab,
        setActiveTab,

        vendors,
        buyerLocation,
        setBuyerLocation,
        radiusFilter,
        setRadiusFilter,
        categoryFilter,
        setCategoryFilter,
        searchQuery,
        setSearchQuery,
        onlyActiveFilter,
        setOnlyActiveFilter,
        filteredVendors,

        favorites,
        toggleFavorite,
        isFavorite,
        favoriteAlertsEnabled,
        setFavoriteAlertsEnabled,
        notifications,
        dismissNotification,
        clearAllNotifications,

        selectedMapVendorId,
        setSelectedMapVendorId,
        detailVendorId,
        setDetailVendorId,

        isSimulatingMovement,
        setIsSimulatingMovement,
        recenterTrigger,
        triggerRecenter,

        currentMerchantVendor,
        updateVendorOperatingStatus,
        updateVendorStockStatus,
        updateVendorLocationSharing,
        updateVendorProfileData,

        salesRecords,
        addSaleRecord,
        deleteSaleRecord,

        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
