/**
 * Core type definitions for Lacak Jajan
 */

export type StockStatus = 'available' | 'low' | 'out_of_stock';

export type OperatingStatus = 'roaming' | 'stationary' | 'closed';

export type UserRole = 'buyer' | 'vendor';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
  description?: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: 'Makanan Berat' | 'Jajanan & Gorengan' | 'Minuman & Es' | 'Camilan Manis' | 'Lainnya';
  tradeType: string; // e.g. "Gerobak Dorong", "Sepeda Keliling", "Motor Roda 3", "Pikulan"
  description: string;
  operatingStatus: OperatingStatus; // 'roaming' = Keliling, 'stationary' = Mangkal, 'closed' = Tutup
  stockStatus: StockStatus; // 'available' = Masih Tersedia, 'low' = Hampir Habis, 'out_of_stock' = Habis
  isSharingLocation: boolean; // Privacy toggle
  location: Coordinates;
  initialLocation: Coordinates; // anchor for realistic simulation path
  headingAngle?: number;
  areaName: string;
  lastUpdated: string; // e.g. "Baru saja", "5 menit lalu"
  phone?: string;
  operatingHours: string;
  ratingAverage: number; // Demo reference rating
  items: MenuItem[];
  imageUrl?: string;
  streetWaypoints?: Coordinates[]; // Specific street path sequence
  streetRouteDescription?: string;
}

export interface SaleRecord {
  id: string;
  vendorId: string;
  date: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface InAppNotification {
  id: string;
  vendorId: string;
  vendorName: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}
