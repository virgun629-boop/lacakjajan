import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import {
  Locate,
  Plus,
  Minus,
  Play,
  Pause,
  Layers,
  SlidersHorizontal,
  Navigation,
  Compass,
  Footprints,
  Sparkles,
  Search,
  X,
  RotateCcw,
} from 'lucide-react';
import { VendorPreviewSheet } from './VendorPreviewSheet';
import {
  calculateHaversineDistance,
  formatDistance,
  estimateWalkingTimeMinutes,
} from '../../utils/geo';
import { INITIAL_BUYER_LOCATION } from '../../data/mockVendors';

const CATEGORIES = [
  'Semua',
  'Makanan Berat',
  'Jajanan & Gorengan',
  'Minuman & Es',
  'Camilan Manis',
];

const RADIUS_OPTIONS = [
  { label: 'Semua', value: 0 },
  { label: '≤ 1 km', value: 1 },
  { label: '≤ 3 km', value: 3 },
  { label: '≤ 5 km', value: 5 },
];

export const InteractiveMap: React.FC = () => {
  const {
    filteredVendors,
    buyerLocation,
    setBuyerLocation,
    radiusFilter,
    setRadiusFilter,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    selectedMapVendorId,
    setSelectedMapVendorId,
    recenterTrigger,
    isSimulatingMovement,
    setIsSimulatingMovement,
    showToast,
  } = useApp();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const vendorMarkersMapRef = useRef<Map<string, L.Marker>>(new Map());
  const buyerMarkerRef = useRef<L.Marker | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const vendorPathPolylineRef = useRef<L.Polyline | null>(null);

  const [mapStyle, setMapStyle] = useState<'voyager' | 'streets' | 'osm'>('voyager');
  const [showFiltersOnMap, setShowFiltersOnMap] = useState<boolean>(false);
  const [isDraggableHelpShown, setIsDraggableHelpShown] = useState<boolean>(true);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [buyerLocation.lat, buyerLocation.lng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });

      // Default high quality voyager tiles
      const tile = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          maxZoom: 19,
          subdomains: 'abcd',
        }
      ).addTo(map);
      tileLayerRef.current = tile;

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Change Tile Style when mapStyle changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    let url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    let sub = 'abcd';

    if (mapStyle === 'streets') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      sub = 'abc';
    } else if (mapStyle === 'osm') {
      url = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
      sub = 'abcd';
    }

    const newTile = L.tileLayer(url, { maxZoom: 19, subdomains: sub }).addTo(map);
    tileLayerRef.current = newTile;
  }, [mapStyle]);

  // 3. Recenter trigger
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([buyerLocation.lat, buyerLocation.lng], 15, {
        animate: true,
      });
    }
  }, [recenterTrigger]);

  // 4. Buyer Marker (Interactive & Draggable with Pulse Ring)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    if (!buyerMarkerRef.current) {
      const buyerIcon = L.divIcon({
        className: 'custom-buyer-icon',
        html: `
          <div class="relative flex items-center justify-center w-10 h-10 cursor-grab active:cursor-grabbing">
            <div class="absolute -inset-1.5 rounded-full bg-blue-500/25 animate-ping-subtle"></div>
            <div class="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-[9px] font-bold">
              •
            </div>
            <div class="absolute -bottom-5 whitespace-nowrap bg-blue-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shadow-md pointer-events-none flex items-center gap-1">
              <span>Anda</span>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([buyerLocation.lat, buyerLocation.lng], {
        icon: buyerIcon,
        draggable: true,
        zIndexOffset: 1200,
      }).addTo(markersLayer);

      marker.on('dragend', (e) => {
        const target = e.target as L.Marker;
        const pos = target.getLatLng();
        setBuyerLocation({
          lat: Number(pos.lat.toFixed(6)),
          lng: Number(pos.lng.toFixed(6)),
          address: `Posisi Pembeli Dipindahkan (${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)})`,
        });
        showToast('Lokasi pembeli digeser! Jarak pedagang dihitung ulang.');
      });

      buyerMarkerRef.current = marker;
    } else {
      buyerMarkerRef.current.setLatLng([buyerLocation.lat, buyerLocation.lng]);
    }
  }, [buyerLocation, setBuyerLocation, showToast]);

  // 5. Radius Circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
      radiusCircleRef.current = null;
    }

    if (radiusFilter > 0) {
      const radiusMeters = radiusFilter * 1000;
      const circle = L.circle([buyerLocation.lat, buyerLocation.lng], {
        radius: radiusMeters,
        color: '#0d9488',
        weight: 1.8,
        dashArray: '6, 8',
        fillColor: '#14b8a6',
        fillOpacity: 0.08,
      }).addTo(map);
      radiusCircleRef.current = circle;
    }
  }, [radiusFilter, buyerLocation]);

  // 6. Vendor Markers - RE-USE & SMOOTH INTERPOLATION (Zero Flickering)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    const currentMarkersMap = vendorMarkersMapRef.current;
    const activeVendorIds = new Set<string>();

    filteredVendors.forEach((vendor) => {
      // Privacy rule: do NOT display if vendor turned off location sharing
      if (!vendor.isSharingLocation) return;

      activeVendorIds.add(vendor.id);
      const isSelected = selectedMapVendorId === vendor.id;
      const isClosed = vendor.operatingStatus === 'closed';

      // Pick distinct street food icon SVG
      const categoryIconSvg = getCategorySvg(vendor.category);

      const markerHtml = `
        <div class="relative group cursor-pointer flex flex-col items-center">
          ${
            !isClosed
              ? `<div class="absolute -inset-1 rounded-2xl bg-teal-500/25 animate-ping-subtle"></div>`
              : ''
          }
          <div class="relative w-10 h-10 rounded-2xl ${
            isClosed
              ? 'bg-stone-500 text-stone-200 border-stone-400'
              : 'bg-teal-600 text-white border-white shadow-lg shadow-teal-600/40'
          } border-2 flex items-center justify-center transition-all ${
        isSelected ? 'ring-4 ring-teal-400 scale-115 -translate-y-1' : 'hover:scale-110'
      }">
            ${categoryIconSvg}
            ${
              vendor.operatingStatus === 'roaming'
                ? `<span class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white ring-1 ring-emerald-500/50"></span>`
                : ''
            }
          </div>
          <div class="mt-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold tracking-tight ${
            isSelected
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white/95 dark:bg-stone-900/95 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 shadow-sm'
          } whitespace-nowrap max-w-[110px] truncate pointer-events-none">
            ${vendor.name.split(' ')[0]}
          </div>
        </div>
      `;

      const vendorIcon = L.divIcon({
        className: 'custom-vendor-marker',
        html: markerHtml,
        iconSize: [44, 58],
        iconAnchor: [22, 29],
      });

      if (currentMarkersMap.has(vendor.id)) {
        // SMOOTH UPDATE: Update position directly without rebuilding DOM!
        const existingMarker = currentMarkersMap.get(vendor.id)!;
        existingMarker.setLatLng([vendor.location.lat, vendor.location.lng]);
        existingMarker.setIcon(vendorIcon);
        existingMarker.setZIndexOffset(isSelected ? 900 : 200);
      } else {
        // Create new marker
        const marker = L.marker([vendor.location.lat, vendor.location.lng], {
          icon: vendorIcon,
          zIndexOffset: isSelected ? 900 : 200,
        }).addTo(markersLayer);

        marker.on('click', () => {
          setSelectedMapVendorId(vendor.id);
          map.panTo([vendor.location.lat, vendor.location.lng], {
            animate: true,
            duration: 0.6,
          });
        });

        currentMarkersMap.set(vendor.id, marker);
      }
    });

    // Remove any markers that no longer match active filter or are closed/hidden
    currentMarkersMap.forEach((marker, vendorId) => {
      if (!activeVendorIds.has(vendorId)) {
        marker.remove();
        currentMarkersMap.delete(vendorId);
      }
    });
  }, [filteredVendors, selectedMapVendorId, setSelectedMapVendorId]);

  // 7. Route Polyline & Vendor Street Circuit Path
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous routes
    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }
    if (vendorPathPolylineRef.current) {
      vendorPathPolylineRef.current.remove();
      vendorPathPolylineRef.current = null;
    }

    if (!selectedMapVendorId) return;

    const selectedVendor = filteredVendors.find((v) => v.id === selectedMapVendorId);
    if (!selectedVendor || !selectedVendor.isSharingLocation) return;

    // Draw route line between buyer and selected vendor
    const routeLine = L.polyline(
      [
        [buyerLocation.lat, buyerLocation.lng],
        [selectedVendor.location.lat, selectedVendor.location.lng],
      ],
      {
        color: '#0d9488',
        weight: 3.5,
        opacity: 0.85,
        dashArray: '7, 9',
      }
    ).addTo(map);

    const distKm = calculateHaversineDistance(buyerLocation, selectedVendor.location);
    const walkMins = estimateWalkingTimeMinutes(distKm);

    routeLine.bindTooltip(
      `<strong>${formatDistance(distKm)}</strong> • ~${walkMins} mnt jalan kaki`,
      {
        permanent: true,
        direction: 'center',
        className:
          'bg-stone-900 text-white text-[11px] font-bold px-2 py-1 rounded-lg shadow-lg border border-teal-400',
      }
    );

    routePolylineRef.current = routeLine;

    // If vendor has full street circuit waypoints, display subtle circuit line
    if (selectedVendor.streetWaypoints && selectedVendor.streetWaypoints.length > 2) {
      const pathPoints = selectedVendor.streetWaypoints.map(
        (wp) => [wp.lat, wp.lng] as [number, number]
      );
      // Close loop
      pathPoints.push([
        selectedVendor.streetWaypoints[0].lat,
        selectedVendor.streetWaypoints[0].lng,
      ]);

      const circuitLine = L.polyline(pathPoints, {
        color: '#0284c7', // sky-600
        weight: 2,
        opacity: 0.45,
        dashArray: '4, 6',
      }).addTo(map);

      vendorPathPolylineRef.current = circuitLine;
    }
  }, [selectedMapVendorId, filteredVendors, buyerLocation]);

  return (
    <div className="relative w-full h-[calc(100vh-130px)] min-h-[480px] bg-stone-100 dark:bg-stone-900 overflow-hidden select-none">
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Header: Status & Quick Controls */}
      <div className="absolute top-2 left-2 right-2 z-[400] space-y-2 pointer-events-none">
        <div className="flex items-center justify-between gap-2">
          {/* Live GPS Heartbeat Badge */}
          <div className="flex items-center gap-2 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-200/90 dark:border-stone-800 shadow-md pointer-events-auto">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isSimulatingMovement ? 'bg-teal-400' : 'bg-stone-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isSimulatingMovement ? 'bg-teal-500' : 'bg-stone-500'
                }`}
              />
            </span>
            <span className="text-[11px] font-bold text-stone-800 dark:text-stone-200">
              {isSimulatingMovement ? 'Live Rute Jalan' : 'Dijeda'}
            </span>
            <button
              onClick={() => setIsSimulatingMovement(!isSimulatingMovement)}
              className="p-1 rounded-full text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
              title={isSimulatingMovement ? 'Jeda Simulasi' : 'Lanjutkan Simulasi'}
            >
              {isSimulatingMovement ? <Pause size={12} /> : <Play size={12} />}
            </button>
          </div>

          {/* Quick Floating Filter Toggle & Tile Style */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              onClick={() => setShowFiltersOnMap(!showFiltersOnMap)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold shadow-md transition-all ${
                showFiltersOnMap || radiusFilter > 0 || categoryFilter !== 'Semua'
                  ? 'bg-teal-600 text-white'
                  : 'bg-white/95 dark:bg-stone-900/95 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800'
              }`}
            >
              <SlidersHorizontal size={13} />
              <span>Filter</span>
              {radiusFilter > 0 && <span className="text-[10px] bg-white/20 px-1 rounded">≤{radiusFilter}km</span>}
            </button>

            <button
              onClick={() => {
                const nextStyle =
                  mapStyle === 'voyager'
                    ? 'streets'
                    : mapStyle === 'streets'
                    ? 'osm'
                    : 'voyager';
                setMapStyle(nextStyle);
                showToast(
                  `Gaya peta: ${
                    nextStyle === 'voyager'
                      ? 'Clean Voyager'
                      : nextStyle === 'streets'
                      ? 'OpenStreetMap'
                      : 'Light Pastel'
                  }`
                );
              }}
              className="p-2 rounded-full bg-white/95 dark:bg-stone-900/95 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 shadow-md hover:bg-stone-50"
              title="Ganti Tampilan Tile Peta"
            >
              <Layers size={14} />
            </button>
          </div>
        </div>

        {/* Expandable Filter Chips Directly Over Map */}
        {showFiltersOnMap && (
          <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-2xl p-3 border border-stone-200/90 dark:border-stone-800 shadow-xl space-y-2 pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Radius Filters */}
            <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600 dark:text-stone-300">
              <span>Radius Jarak:</span>
              <div className="flex items-center gap-1">
                {RADIUS_OPTIONS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setRadiusFilter(r.value)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                      radiusFilter === r.value
                        ? 'bg-teal-600 text-white'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Chips */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                    categoryFilter === cat
                      ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Draggable Tip Banner */}
        {isDraggableHelpShown && (
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-blue-50/95 dark:bg-blue-950/90 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100 text-[11px] shadow-sm pointer-events-auto">
            <div className="flex items-center gap-1.5 truncate">
              <Navigation size={13} className="text-blue-600 shrink-0" />
              <span className="truncate">
                Tips: <strong>Geser pin biru</strong> Anda di peta untuk simulasi pindah lokasi!
              </span>
            </div>
            <button
              onClick={() => setIsDraggableHelpShown(false)}
              className="text-blue-600 p-0.5"
            >
              <X size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Floating Right Map Controls: Recenter, Reset Buyer Pos, Zoom */}
      <div className="absolute bottom-24 right-3 z-[400] flex flex-col gap-2 pointer-events-auto">
        {/* Reset Buyer location button */}
        <button
          onClick={() => {
            setBuyerLocation(INITIAL_BUYER_LOCATION);
            mapInstanceRef.current?.setView(
              [INITIAL_BUYER_LOCATION.lat, INITIAL_BUYER_LOCATION.lng],
              15,
              { animate: true }
            );
            showToast('Lokasi pembeli dikembalikan ke titik awal');
          }}
          className="w-10 h-10 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md flex items-center justify-center text-stone-700 dark:text-stone-300 hover:bg-stone-50 active:scale-95 transition-all"
          title="Reset ke Lokasi Awal"
        >
          <RotateCcw size={15} />
        </button>

        {/* Recenter Button */}
        <button
          onClick={() => {
            mapInstanceRef.current?.setView([buyerLocation.lat, buyerLocation.lng], 15, {
              animate: true,
            });
          }}
          className="w-10 h-10 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-stone-50 active:scale-95 transition-all"
          title="Fokus ke Posisi Saya"
        >
          <Locate size={18} />
        </button>

        {/* Zoom Controls */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md overflow-hidden">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="w-10 h-10 flex items-center justify-center text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 border-b border-stone-100 dark:border-stone-800 active:scale-95"
            title="Perbesar"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="w-10 h-10 flex items-center justify-center text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 active:scale-95"
            title="Perkecil"
          >
            <Minus size={16} />
          </button>
        </div>
      </div>

      {/* Compact Interactive Legend */}
      <div className="absolute bottom-24 left-3 z-[400] pointer-events-auto">
        <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-md px-3 py-2 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-md text-[10px] space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-stone-700 dark:text-stone-300">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block border border-white"></span>
            <span>Anda (Bisa Digeser)</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-stone-700 dark:text-stone-300">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block border border-white"></span>
            <span>Pedagang Aktif Jalan</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-500">
            <span className="w-2 h-0.5 bg-teal-600 inline-block"></span>
            <span>Garis Rute Terhubung</span>
          </div>
        </div>
      </div>

      {/* Selected Vendor Preview Bottom Sheet */}
      <VendorPreviewSheet />
    </div>
  );
};

// Helper to provide authentic Indonesian street food SVG symbols
function getCategorySvg(category: string): string {
  if (category === 'Makanan Berat') {
    // Noodle/Bakso bowl icon
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"/><path d="M7 12V5"/><path d="M11 12V3"/><path d="M15 12V4"/><path d="M19 12V6"/></svg>`;
  }
  if (category === 'Minuman & Es') {
    // Drink/Cup with straw
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 7-2 14H7L5 7"/><path d="M4 7h16"/><path d="m15 2-4 5"/></svg>`;
  }
  if (category === 'Camilan Manis') {
    // Cake/Pastry slice
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><circle cx="12" cy="5" r="2"/></svg>`;
  }
  // Jajanan & Gorengan (skewer / food cart)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><circle cx="16" cy="8" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="8" cy="16" r="2"/></svg>`;
}
