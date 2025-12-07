'use client';

import Link from 'next/link';

interface LogoProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Show icon */
  showIcon?: boolean;
  /** Show text */
  showText?: boolean;
  /** Link to homepage */
  href?: string;
  /** Additional classes */
  className?: string;
  /** Variant style */
  variant?: 'default' | 'white' | 'dark';
}

const sizeConfig = {
  sm: {
    icon: 32,
    iconRadius: 8,
    fontSize: 'text-lg',
    spacing: 'gap-2',
  },
  md: {
    icon: 44,
    iconRadius: 12,
    fontSize: 'text-xl',
    spacing: 'gap-2.5',
  },
  lg: {
    icon: 52,
    iconRadius: 14,
    fontSize: 'text-2xl',
    spacing: 'gap-3',
  },
  xl: {
    icon: 64,
    iconRadius: 16,
    fontSize: 'text-3xl',
    spacing: 'gap-4',
  },
};

// Shield Icon SVG Component matching the brand design
function ShieldIcon({ size = 44 }: { size?: number }) {
  const scale = size / 52;
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      <defs>
        <linearGradient id="shield-bg-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF8A2B" />
          <stop offset="100%" stopColor="#FF6A00" />
        </linearGradient>
        <filter id="shield-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#FF6A00" floodOpacity="0.35" />
        </filter>
      </defs>
      
      {/* Shield Background with gradient and shadow */}
      <rect
        x="0"
        y="0"
        width="52"
        height="52"
        rx="14"
        fill="url(#shield-bg-gradient)"
        filter="url(#shield-shadow)"
      />
      
      {/* Shield Icon Path */}
      <path
        d="M26 11C26.4 11 26.8 11.1 27.1 11.3L37.3 16.8C37.9 17.1 38.3 17.7 38.3 18.4V30.5C38.3 33.5 37 36.3 34.8 38.1C32.5 40 29.3 41 26 41C22.7 41 19.5 40 17.2 38.1C15 36.3 13.7 33.5 13.7 30.5V18.4C13.7 17.7 14.1 17.1 14.7 16.8L24.9 11.3C25.2 11.1 25.6 11 26 11ZM26 20.5C25.4 20.5 24.9 20.7 24.5 21.1C24.1 21.5 23.9 22 23.9 22.6V30.4C23.9 31 24.1 31.5 24.5 31.9C24.9 32.3 25.4 32.5 26 32.5C26.6 32.5 27.1 32.3 27.5 31.9C27.9 31.5 28.1 31 28.1 30.4V22.6C28.1 22 27.9 21.5 27.5 21.1C27.1 20.7 26.6 20.5 26 20.5Z"
        fill="white"
      />
    </svg>
  );
}

export function Logo({
  size = 'md',
  showIcon = true,
  showText = true,
  href = '/',
  className = '',
  variant = 'default',
}: LogoProps) {
  const config = sizeConfig[size];

  const LogoContent = (
    <div className={`flex items-center ${config.spacing} ${className}`}>
      {/* Logo Icon */}
      {showIcon && <ShieldIcon size={config.icon} />}

      {/* Logo Text */}
      {showText && (
        <div className={`${config.fontSize} font-bold tracking-tight select-none flex items-baseline`}>
          {/* SAF - Clean, semibold */}
          <span
            className={`font-sans font-semibold ${
              variant === 'dark' ? 'text-slate-900' : 'text-white'
            }`}
            style={{ letterSpacing: '0.5px' }}
          >
            SAF
          </span>
          {/* RUN - Bold with gradient */}
          <span
            className="font-display font-bold bg-gradient-to-br from-[#FF7A18] to-[#FFB347] bg-clip-text text-transparent"
            style={{ letterSpacing: '0.5px' }}
          >
            RUN
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded-xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {LogoContent}
      </Link>
    );
  }

  return LogoContent;
}

// Logo Mark Only (Icon without text)
export function LogoMark({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const config = sizeConfig[size];
  
  return (
    <div className={className}>
      <ShieldIcon size={config.icon} />
    </div>
  );
}

// Wordmark Only (Text without icon)
export function LogoWordmark({
  size = 'md',
  className = '',
  variant = 'default',
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'default' | 'white' | 'dark';
}) {
  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  return (
    <div
      className={`font-bold tracking-tight select-none flex items-baseline ${textSizes[size]} ${className}`}
    >
      <span
        className={`font-sans font-semibold ${
          variant === 'dark' ? 'text-slate-900' : variant === 'white' ? 'text-white' : 'text-slate-800 dark:text-white'
        }`}
        style={{ letterSpacing: '0.5px' }}
      >
        SAF
      </span>
      <span
        className="font-display font-bold bg-gradient-to-br from-[#FF7A18] to-[#FFB347] bg-clip-text text-transparent"
        style={{ letterSpacing: '0.5px' }}
      >
        RUN
      </span>
    </div>
  );
}

// Full SVG Logo for exports/downloads
export function LogoSVG({ width = 260, height = 60 }: { width?: number; height?: number }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 260 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="safrun-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF7A18" />
          <stop offset="100%" stopColor="#FFB347" />
        </linearGradient>
        <linearGradient id="shield-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF8A2B" />
          <stop offset="100%" stopColor="#FF6A00" />
        </linearGradient>
      </defs>

      {/* Shield Background */}
      <rect x="0" y="4" width="52" height="52" rx="14" fill="url(#shield-bg)" />

      {/* Shield Icon Path */}
      <path
        d="M26 15C26.4 15 26.8 15.1 27.1 15.3L37.3 20.8C37.9 21.1 38.3 21.7 38.3 22.4V34.5C38.3 37.5 37 40.3 34.8 42.1C32.5 44 29.3 45 26 45C22.7 45 19.5 44 17.2 42.1C15 40.3 13.7 37.5 13.7 34.5V22.4C13.7 21.7 14.1 21.1 14.7 20.8L24.9 15.3C25.2 15.1 25.6 15 26 15ZM26 24.5C25.4 24.5 24.9 24.7 24.5 25.1C24.1 25.5 23.9 26 23.9 26.6V34.4C23.9 35 24.1 35.5 24.5 35.9C24.9 36.3 25.4 36.5 26 36.5C26.6 36.5 27.1 36.3 27.5 35.9C27.9 35.5 28.1 35 28.1 34.4V26.6C28.1 26 27.9 25.5 27.5 25.1C27.1 24.7 26.6 24.5 26 24.5Z"
        fill="white"
      />

      {/* SAF */}
      <text
        x="70"
        y="40"
        fontFamily="Plus Jakarta Sans, sans-serif"
        fontWeight="600"
        fontSize="28px"
        fill="#FFFFFF"
        letterSpacing="0.5"
      >
        SAF
      </text>

      {/* RUN (Gradient) */}
      <text
        x="132"
        y="40"
        fontFamily="Outfit, sans-serif"
        fontWeight="700"
        fontSize="28px"
        fill="url(#safrun-gradient)"
        letterSpacing="0.5"
      >
        RUN
      </text>
    </svg>
  );
}

// Brand Lockup for marketing materials
export function LogoBrand({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <LogoMark size="xl" />
      <LogoWordmark size="xl" className="mt-4" />
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium tracking-widest uppercase">
        Run Safe, Run Together
      </p>
    </div>
  );
}

export default Logo;
