'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Map,
  Users,
  AlertTriangle,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/auth.store';
import { useSOSStore } from '@/stores/sos.store';
import { useSocket } from '@/hooks/useSocket';
import { api } from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle, useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

/**
 * SAFRUN App Layout
 * Consistent navigation with SAFRUN design system
 * Uses Plus Jakarta Sans, 18-24px radius, soft shadows
 */

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Live Map', href: '/run', icon: Map },
  { name: 'Sessions', href: '/sessions', icon: Users },
  { name: 'SOS Center', href: '/sos', icon: AlertTriangle },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { activeAlert, nearbyAlerts } = useSOSStore();
  const { isDark } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize WebSocket connection
  useSocket();

  // Check for active SOS alerts
  useEffect(() => {
    const checkActiveAlert = async () => {
      try {
        const alert = await api.getActiveSOSAlert();
        if (alert) {
          // Handle active alert
        }
      } catch {
        // No active alert
      }
    };
    checkActiveAlert();
  }, []);

  const handleLogout = async () => {
    try {
      await api.signOut();
      logout();
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      router.push('/');
      toast.success('Signed out successfully');
    } catch {
      toast.error('Failed to sign out');
    }
  };

  const hasAlerts = activeAlert || nearbyAlerts.length > 0;

  return (
    <div className="min-h-screen transition-colors duration-300 bg-background-light dark:bg-background-dark">
      {/* Top Navigation */}
      <header 
        className={cn(
          'fixed top-0 left-0 right-0 z-50 h-16 backdrop-blur-xl',
          'bg-white/90 dark:bg-navy-900/95',
          'border-b border-navy-200/50 dark:border-white/[0.06]'
        )}
      >
        <div className="flex items-center justify-between px-4 lg:px-6 h-full">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                'lg:hidden p-2 rounded-xl transition-colors',
                'text-text-light-body dark:text-text-dark-body',
                'hover:bg-navy-100 dark:hover:bg-white/5'
              )}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/dashboard">
              <Logo size="sm" variant={isDark ? 'default' : 'dark'} />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <ThemeToggle size="md" />

            {/* Notifications */}
            <Link
              href="/sos"
              className={cn(
                'relative p-2.5 rounded-xl transition-all duration-200',
                hasAlerts
                  ? 'bg-danger-100 dark:bg-danger-500/15 text-danger-600 dark:text-danger-400'
                  : cn(
                      'text-text-light-body dark:text-text-dark-body',
                      'bg-navy-100 dark:bg-white/5',
                      'border border-navy-200/50 dark:border-white/10',
                      'hover:bg-navy-200 dark:hover:bg-white/10'
                    )
              )}
            >
              <Bell className="w-5 h-5" />
              {hasAlerts && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full animate-pulse" />
              )}
            </Link>

            {/* User Menu */}
            <Link 
              href="/settings" 
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl transition-colors',
                'hover:bg-navy-100 dark:hover:bg-white/5'
              )}
            >
              <Avatar
                src={user?.avatarUrl}
                name={user?.displayName || 'User'}
                size="sm"
              />
              <span className="hidden md:block text-sm font-medium text-text-light-heading dark:text-text-dark-body">
                {user?.displayName}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.nav
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className={cn(
                'fixed left-0 top-0 bottom-0 w-72',
                'bg-white dark:bg-navy-900',
                'border-r border-navy-200/50 dark:border-white/[0.06]'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pt-20">
                <div className="space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-[18px] transition-all duration-200',
                          isActive
                            ? 'bg-safrun-500/10 text-safrun-500 dark:text-safrun-400 font-medium'
                            : 'text-text-light-body dark:text-text-dark-body hover:bg-navy-100 dark:hover:bg-white/5'
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                        {item.name === 'SOS Center' && hasAlerts && (
                          <span className="ml-auto w-2 h-2 bg-danger-500 rounded-full animate-pulse" />
                        )}
                      </Link>
                    );
                  })}
                  <button
                    onClick={handleLogout}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-[18px] transition-colors',
                      'text-text-light-body dark:text-text-dark-body',
                      'hover:bg-navy-100 dark:hover:bg-white/5'
                    )}
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          'hidden lg:fixed lg:left-0 lg:top-16 lg:bottom-0 lg:w-64 lg:flex lg:flex-col',
          'bg-white dark:bg-navy-900/97',
          'border-r border-navy-200/50 dark:border-white/[0.06]'
        )}
      >
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-[18px] transition-all duration-200',
                  isActive
                    ? 'bg-safrun-500/10 text-safrun-500 dark:text-safrun-400 font-medium'
                    : 'text-text-light-body dark:text-text-dark-body hover:bg-navy-100 dark:hover:bg-white/5'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
                {item.name === 'SOS Center' && hasAlerts && (
                  <span className="ml-auto w-2 h-2 bg-danger-500 rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-navy-200/50 dark:border-white/[0.06]">
          <button
            onClick={handleLogout}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-[18px] transition-colors',
              'text-text-light-body dark:text-text-dark-body',
              'hover:bg-navy-100 dark:hover:bg-white/5'
            )}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="p-4 lg:p-8">{children}</div>
      </main>

      {/* SOS Quick Button (Mobile) - Gradient red with glow */}
      <Link
        href="/sos"
        className={cn(
          'lg:hidden fixed bottom-6 right-6 z-30 w-16 h-16 rounded-full',
          'flex items-center justify-center',
          'bg-gradient-to-br from-danger-500 to-danger-600',
          'shadow-glow-red',
          'transition-transform hover:scale-105 active:scale-95'
        )}
      >
        <AlertTriangle className="w-7 h-7 text-white" />
      </Link>
    </div>
  );
}
