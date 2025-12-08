import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ===========================================
      // 🎨 SAFRUN Design System Colors
      // ===========================================
      colors: {
        // Brand - SAFRUN Orange Gradient
        safrun: {
          DEFAULT: '#FF8A00',
          start: '#FF8A00',
          end: '#FF5E00',
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#FF8A00',
          600: '#FF5E00',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        // Navy - Primary Dark
        navy: {
          DEFAULT: '#0E172A',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0E172A',
          950: '#0A0F1A',
        },
        // Accents
        accent: {
          blue: '#E6F4FF',
          green: '#DFF7E6',
          'blue-dark': '#1E3A5F',
          'green-dark': '#1E3A32',
        },
        // Light Gray Background
        background: {
          light: '#F7F9FC',
          dark: '#0E172A',
        },
        // Text Colors
        text: {
          'light-heading': '#0E172A',
          'light-body': '#4B5563',
          'dark-heading': '#FFFFFF',
          'dark-body': '#CBD5E1',
        },
        // Safety - Green
        safety: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Danger - Red
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },

      // ===========================================
      // 📝 Typography - Plus Jakarta Sans
      // ===========================================
      fontFamily: {
        sans: [
          'var(--font-plus-jakarta)',
          'Plus Jakarta Sans',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
        display: [
          'var(--font-plus-jakarta)',
          'Plus Jakarta Sans',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'SF Mono',
          'Monaco',
          'monospace',
        ],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.6' }],
        'lg': ['1.125rem', { lineHeight: '1.7' }],
        'xl': ['1.25rem', { lineHeight: '1.7' }],
        '2xl': ['1.5rem', { lineHeight: '1.4' }],
        '3xl': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.02em' }],
        '4xl': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        '5xl': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.025em' }],
        '6xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        '7xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },

      // ===========================================
      // 📐 Spacing & Layout (8/12/16/24/32 grid)
      // ===========================================
      spacing: {
        '4.5': '1.125rem',   // 18px
        '13': '3.25rem',     // 52px
        '18': '4.5rem',      // 72px
        '22': '5.5rem',      // 88px
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      gap: {
        'grid-1': '8px',
        'grid-2': '12px',
        'grid-3': '16px',
        'grid-4': '24px',
        'grid-5': '32px',
      },
      padding: {
        'grid-1': '8px',
        'grid-2': '12px',
        'grid-3': '16px',
        'grid-4': '24px',
        'grid-5': '32px',
      },
      margin: {
        'grid-1': '8px',
        'grid-2': '12px',
        'grid-3': '16px',
        'grid-4': '24px',
        'grid-5': '32px',
      },

      // ===========================================
      // 🔲 Border Radius (18-24px modern)
      // ===========================================
      borderRadius: {
        'sm': '12px',
        'DEFAULT': '18px',
        'md': '18px',
        'lg': '24px',
        'xl': '28px',
        '2xl': '32px',
        '3xl': '40px',
        '4xl': '48px',
      },

      // ===========================================
      // 🌑 Box Shadow (Soft & Realistic, blur 24-32)
      // ===========================================
      boxShadow: {
        // Subtle, realistic shadows
        'soft-xs': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'soft-sm': '0 2px 8px rgba(0, 0, 0, 0.05)',
        'soft': '0 4px 24px rgba(0, 0, 0, 0.06)',
        'soft-md': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 12px 40px rgba(0, 0, 0, 0.1)',
        'soft-xl': '0 24px 48px rgba(0, 0, 0, 0.12)',
        // Cards
        'card': '0 4px 24px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'card-dark': '0 4px 24px rgba(0, 0, 0, 0.25)',
        'card-dark-hover': '0 8px 32px rgba(0, 0, 0, 0.35)',
        // Glows
        'glow-orange': '0 4px 24px rgba(255, 138, 0, 0.35)',
        'glow-orange-lg': '0 8px 40px rgba(255, 138, 0, 0.4)',
        'glow-orange-xl': '0 12px 48px rgba(255, 138, 0, 0.45)',
        'glow-red': '0 4px 24px rgba(239, 68, 68, 0.35)',
        'glow-red-lg': '0 8px 40px rgba(239, 68, 68, 0.4)',
        'glow-green': '0 4px 24px rgba(34, 197, 94, 0.35)',
        'glow-green-lg': '0 8px 40px rgba(34, 197, 94, 0.4)',
        'glow-blue': '0 4px 24px rgba(59, 130, 246, 0.35)',
        // Input focus
        'input-focus': '0 0 0 3px rgba(255, 138, 0, 0.1)',
        'input-focus-dark': '0 0 0 3px rgba(255, 138, 0, 0.15)',
      },

      // ===========================================
      // 🎭 Backdrop Blur
      // ===========================================
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '40px',
      },

      // ===========================================
      // 🎬 Animation
      // ===========================================
      animation: {
        'pulse-ring': 'pulse-ring 1.5s cubic-bezier(0.24, 0, 0.38, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-down': 'slide-down 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-in-up': 'fade-in-up 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },

      // ===========================================
      // 🖼️ Background
      // ===========================================
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-safrun': 'linear-gradient(135deg, #FF8A00 0%, #FF5E00 100%)',
        'gradient-safrun-soft': 'linear-gradient(135deg, rgba(255, 138, 0, 0.1) 0%, rgba(255, 94, 0, 0.05) 100%)',
        'gradient-navy': 'linear-gradient(180deg, #0E172A 0%, #1E293B 100%)',
        'gradient-hero-light': 'radial-gradient(ellipse 100% 80% at 50% 0%, rgba(255, 138, 0, 0.08), transparent 50%), radial-gradient(ellipse 60% 50% at 100% 0%, rgba(59, 130, 246, 0.05), transparent 50%)',
        'gradient-hero-dark': 'radial-gradient(ellipse 100% 80% at 50% 0%, rgba(255, 138, 0, 0.12), transparent 50%), radial-gradient(ellipse 60% 50% at 100% 0%, rgba(59, 130, 246, 0.08), transparent 50%)',
      },

      // ===========================================
      // 🔄 Transition
      // ===========================================
      transitionDuration: {
        '250': '250ms',
        '400': '400ms',
      },
      transitionTimingFunction: {
        'ease-out-expo': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
