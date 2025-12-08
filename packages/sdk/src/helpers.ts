// ============================================================================
// SAFRUN SDK Helpers - Shared utility functions
// ============================================================================

/**
 * Format distance in meters to human-readable string
 * @param meters - Distance in meters
 * @returns Formatted string like "500 m" or "5.25 km"
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

/**
 * Format duration in seconds to human-readable string
 * @param seconds - Duration in seconds
 * @returns Formatted string like "5:30" or "1:30:00"
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format duration to verbose string
 * @param seconds - Duration in seconds
 * @returns Formatted string like "1h 30m" or "45m 30s"
 */
export function formatDurationVerbose(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * Format pace in minutes per kilometer
 * @param metersPerSecond - Speed in m/s
 * @returns Formatted string like "5'30\"" or "--'--\""
 */
export function formatPace(metersPerSecond: number | null | undefined): string {
  if (!metersPerSecond || metersPerSecond <= 0) {
    return "--'--\"";
  }

  const secondsPerKm = 1000 / metersPerSecond;
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.round(secondsPerKm % 60);

  return `${minutes}'${seconds.toString().padStart(2, '0')}"`;
}

/**
 * Format pace per kilometer (alternative format)
 * @param metersPerSecond - Speed in m/s
 * @returns Formatted string like "5:30/km"
 */
export function formatPacePerKm(metersPerSecond: number | null | undefined): string {
  if (!metersPerSecond || metersPerSecond <= 0) return '--:--/km';
  const minPerKm = (1000 / metersPerSecond) / 60;
  const mins = Math.floor(minPerKm);
  const secs = Math.round((minPerKm - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, '0')}/km`;
}

/**
 * Format relative time (e.g., "2 min ago")
 * @param date - Date object or timestamp
 * @returns Formatted string like "Just now", "5m ago", "2h ago"
 */
export function formatRelativeTime(date: Date | string | number): string {
  const now = Date.now();
  const then = typeof date === 'number' ? date : new Date(date).getTime();
  const diffMs = now - then;
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return new Date(then).toLocaleDateString();
}

/**
 * Format coordinates to readable string
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Formatted string like "37.7749°N, 122.4194°W"
 */
export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
}

/**
 * Get initials from a name
 * @param name - Full name
 * @returns Initials like "JD" for "John Doe"
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 - Latitude of first point
 * @param lng1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lng2 - Longitude of second point
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Generate a dicebear avatar URL
 * @param seed - Seed string for avatar generation
 * @returns URL to avatar image
 */
export function generateAvatarUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

