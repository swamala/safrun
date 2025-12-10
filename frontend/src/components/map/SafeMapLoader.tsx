'use client';

/**
 * SAFRUN Safe Map Loader
 * Wrapper component that ensures maps only render on the client
 * Prevents all Mapbox hydration errors
 */

import { useEffect, useState, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface SafeMapLoaderProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

export function SafeMapLoader({
  children,
  fallback,
  className = '',
}: SafeMapLoaderProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      fallback || (
        <div
          className={`flex items-center justify-center bg-slate-100 dark:bg-slate-800/50 rounded-2xl ${className}`}
          style={{ minHeight: '400px', width: '100%', height: '100%' }}
        >
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loading map...
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}

export default SafeMapLoader;

