'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

/**
 * SAFRUN Avatar Component
 * Consistent avatar styling with gradient fallback
 * Uses SAFRUN orange gradient for initials
 */

interface AvatarProps {
  /** Image source URL */
  src?: string | null;
  /** User name for fallback initials */
  name?: string;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Optional custom className */
  className?: string;
  /** Show online indicator */
  showOnline?: boolean;
  /** Whether user is online */
  isOnline?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-20 h-20 text-xl',
};

const onlineIndicatorSizes = {
  xs: 'w-1.5 h-1.5 border',
  sm: 'w-2 h-2 border',
  md: 'w-2.5 h-2.5 border-2',
  lg: 'w-3 h-3 border-2',
  xl: 'w-3.5 h-3.5 border-2',
  '2xl': 'w-4 h-4 border-2',
};

function getInitials(name: string): string {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({
  src,
  name = 'User',
  size = 'md',
  className,
  showOnline = false,
  isOnline = false,
}: AvatarProps) {
  const initials = getInitials(name);

  return (
    <div className={cn('relative inline-flex', className)}>
      {src ? (
        <div
          className={cn(
            'relative rounded-full overflow-hidden',
            'ring-2 ring-white dark:ring-navy-900',
            sizeClasses[size]
          )}
        >
          <Image
            src={src}
            alt={name}
            fill
            className="object-cover"
            sizes={size === '2xl' ? '80px' : size === 'xl' ? '64px' : size === 'lg' ? '48px' : '40px'}
          />
        </div>
      ) : (
        <div
          className={cn(
            'rounded-full flex items-center justify-center',
            'bg-gradient-to-br from-safrun-start to-safrun-end',
            'text-white font-semibold',
            'shadow-glow-orange/30',
            sizeClasses[size]
          )}
        >
          {initials}
        </div>
      )}
      
      {/* Online indicator */}
      {showOnline && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full',
            'border-white dark:border-navy-900',
            isOnline ? 'bg-safety-500' : 'bg-navy-300 dark:bg-navy-600',
            onlineIndicatorSizes[size]
          )}
        />
      )}
    </div>
  );
}

/**
 * Avatar Group - Display multiple avatars in a stack
 */
interface AvatarGroupProps {
  avatars: Array<{ src?: string; name: string }>;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AvatarGroup({
  avatars,
  max = 4,
  size = 'md',
  className,
}: AvatarGroupProps) {
  const displayed = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className={cn('flex -space-x-2', className)}>
      {displayed.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          name={avatar.name}
          size={size}
          className="ring-2 ring-white dark:ring-navy-900"
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'rounded-full flex items-center justify-center',
            'bg-navy-100 dark:bg-navy-700',
            'text-text-light-body dark:text-text-dark-body',
            'font-semibold',
            'ring-2 ring-white dark:ring-navy-900',
            sizeClasses[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}

/**
 * Avatar with Status - Avatar with customizable status indicator
 */
interface AvatarWithStatusProps extends Omit<AvatarProps, 'showOnline' | 'isOnline'> {
  status?: 'online' | 'offline' | 'away' | 'busy' | 'running';
}

const statusColors = {
  online: 'bg-safety-500',
  offline: 'bg-navy-300 dark:bg-navy-600',
  away: 'bg-amber-500',
  busy: 'bg-danger-500',
  running: 'bg-safrun-500 animate-pulse',
};

export function AvatarWithStatus({
  status,
  size = 'md',
  ...props
}: AvatarWithStatusProps) {
  return (
    <div className="relative inline-flex">
      <Avatar size={size} {...props} />
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full',
            'border-2 border-white dark:border-navy-900',
            statusColors[status],
            onlineIndicatorSizes[size]
          )}
        />
      )}
    </div>
  );
}
