import { Coordinates } from '../types';

/**
 * Calculates the great-circle distance between two coordinates using the Haversine formula.
 * Returns distance in kilometers.
 */
export function calculateHaversineDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) *
      Math.cos(toRad(coord2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Formats distance for user display (e.g., "350 m" or "1.4 km")
 */
export function formatDistance(distanceInKm: number): string {
  if (distanceInKm < 1) {
    const meters = Math.round(distanceInKm * 1000);
    return `${meters} m`;
  }
  return `${distanceInKm.toFixed(1)} km`;
}

/**
 * Estimates walking time (assuming average 4.5 km/h walking speed for street food)
 */
export function estimateWalkingTimeMinutes(distanceInKm: number): number {
  return Math.max(1, Math.round((distanceInKm / 4.5) * 60));
}

/**
 * Calculates smooth next waypoint along realistic street nodes.
 * If waypoints are provided, vendor walks sequentially along the street path,
 * turning at intersections and looping back, ensuring marker matches the actual road grid.
 */
export function getSimulatedNextPositionAlongPath(
  waypoints: Coordinates[],
  stepIndex: number,
  fallbackAnchor: Coordinates
): { newCoords: Coordinates; updatedArea: string; headingAngle: number } {
  if (!waypoints || waypoints.length < 2) {
    // Fallback if no specific street waypoints
    const angle = (stepIndex * 0.1) % (2 * Math.PI);
    const r = 0.0012;
    return {
      newCoords: {
        lat: Number((fallbackAnchor.lat + r * Math.sin(angle)).toFixed(6)),
        lng: Number((fallbackAnchor.lng + r * Math.cos(angle)).toFixed(6)),
      },
      updatedArea: 'Jl. Kemang Utara',
      headingAngle: (angle * 180) / Math.PI,
    };
  }

  const numWaypoints = waypoints.length;
  // Calculate continuous progress index through waypoints loop
  const speed = 0.08; // smooth step advance
  const totalProgress = (stepIndex * speed) % numWaypoints;
  const currentIndex = Math.floor(totalProgress);
  const nextIndex = (currentIndex + 1) % numWaypoints;
  const fraction = totalProgress - currentIndex;

  const currentWp = waypoints[currentIndex];
  const nextWp = waypoints[nextIndex];

  // Linear interpolation between the two street points
  const lat = currentWp.lat + (nextWp.lat - currentWp.lat) * fraction;
  const lng = currentWp.lng + (nextWp.lng - currentWp.lng) * fraction;

  // Calculate bearing angle (heading in degrees)
  const y = Math.sin(toRad(nextWp.lng - currentWp.lng)) * Math.cos(toRad(nextWp.lat));
  const x =
    Math.cos(toRad(currentWp.lat)) * Math.sin(toRad(nextWp.lat)) -
    Math.sin(toRad(currentWp.lat)) *
      Math.cos(toRad(nextWp.lat)) *
      Math.cos(toRad(nextWp.lng - currentWp.lng));
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  const headingAngle = (bearing + 360) % 360;

  // Dynamic road name according to waypoint segment
  const areaName = getStreetNameForSegment(currentIndex, numWaypoints);

  return {
    newCoords: {
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
    },
    updatedArea: areaName,
    headingAngle: Math.round(headingAngle),
  };
}

function getStreetNameForSegment(index: number, total: number): string {
  const ratio = index / total;
  if (ratio < 0.25) return 'Jl. Kemang Utara (Dekat Indomaret)';
  if (ratio < 0.5) return 'Jl. Kemang Raya (Simpang Resto)';
  if (ratio < 0.75) return 'Gg. Cempaka Putih (Perumahan Warga)';
  return 'Jl. Kemang Utara IV (Dekat Lapangan)';
}

/**
 * Generates an external Google Maps navigation link
 */
export function getGoogleMapsNavigationUrl(coords: Coordinates, label?: string): string {
  const query = label
    ? `${coords.lat},${coords.lng}+(${encodeURIComponent(label)})`
    : `${coords.lat},${coords.lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
}
