'use client';

import { cn, getInitials, generateAvatarUrl } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'busy';
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

const statusClasses = {
  online: 'bg-safety-500',
  offline: 'bg-secondary-400',
  busy: 'bg-danger-500',
};

export function Avatar({
  src,
  name,
  size = 'md',
  className,
  showStatus = false,
  status = 'offline',
}: AvatarProps) {
  const initials = getInitials(name);
  const avatarUrl = src || generateAvatarUrl(name);

  return (
    <div className={cn('relative inline-flex', className)}>
      <div
        className={cn(
          'rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold overflow-hidden',
          sizeClasses[size]
        )}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <span className={avatarUrl ? 'hidden' : ''}>{initials}</span>
      </div>
      {showStatus && (
        <span
          className={cn(
            'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white',
            statusClasses[status]
          )}
        />
      )}
    </div>
  );
}

