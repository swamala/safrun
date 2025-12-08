import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Re-export SDK helpers for convenience
export {
  formatDistance,
  formatDuration,
  formatDurationVerbose,
  formatPace,
  formatPacePerKm,
  formatRelativeTime,
  formatCoordinates,
  getInitials,
  generateAvatarUrl,
  calculateDistance,
} from '@safrun/sdk';

/**
 * Tailwind CSS class merger utility
 * Combines clsx with tailwind-merge for optimal class handling
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

