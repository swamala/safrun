'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Map,
  Users,
  AlertTriangle,
  Settings,
  LogOut,
  Shield,
  Bell,
  Menu,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useSOSStore } from '@/stores/sos.store';
import { useSocket } from '@/hooks/useSocket';
import { api } from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

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
    <div className="min-h-screen bg-secondary-50">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-secondary-200">
        <div className="flex items-center justify-between px-4 lg:px-6 h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-secondary-600 hover:bg-secondary-100 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary-500" />
              <span className="text-xl font-bold text-secondary-900 hidden sm:block">SAFRUN</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Link
              href="/sos"
              className={cn(
                'relative p-2 rounded-lg transition-colors',
                hasAlerts
                  ? 'bg-danger-100 text-danger-600'
                  : 'text-secondary-600 hover:bg-secondary-100'
              )}
            >
              <Bell className="w-6 h-6" />
              {hasAlerts && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />
              )}
            </Link>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <Link href="/settings" className="flex items-center gap-3 hover:bg-secondary-50 rounded-lg p-2 transition-colors">
                <Avatar
                  src={user?.avatarUrl}
                  name={user?.displayName || 'User'}
                  size="sm"
                />
                <span className="hidden md:block text-sm font-medium text-secondary-700">
                  {user?.displayName}
                </span>
              </Link>
            </div>
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
              className="fixed left-0 top-0 bottom-0 w-72 bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pt-20">
                <div className="space-y-2">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                          isActive
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-secondary-600 hover:bg-secondary-50'
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                        {item.name === 'SOS Center' && hasAlerts && (
                          <span className="ml-auto w-2 h-2 bg-danger-500 rounded-full" />
                        )}
                      </Link>
                    );
                  })}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-secondary-600 hover:bg-secondary-50 transition-colors"
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
      <aside className="hidden lg:fixed lg:left-0 lg:top-16 lg:bottom-0 lg:w-64 lg:bg-white lg:border-r lg:border-secondary-200 lg:flex lg:flex-col">
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-secondary-600 hover:bg-secondary-50'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
                {item.name === 'SOS Center' && hasAlerts && (
                  <span className="ml-auto w-2 h-2 bg-danger-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-secondary-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-secondary-600 hover:bg-secondary-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="p-4 lg:p-6">{children}</div>
      </main>

      {/* SOS Quick Button (Mobile) */}
      <Link
        href="/sos"
        className="lg:hidden fixed bottom-6 right-6 z-30 w-16 h-16 bg-danger-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-danger-500/40 hover:bg-danger-600 transition-colors"
      >
        <AlertTriangle className="w-7 h-7" />
      </Link>
    </div>
  );
}

