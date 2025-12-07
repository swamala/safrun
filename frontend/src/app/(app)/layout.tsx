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
  Sun,
  Moon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/auth.store';
import { useSOSStore } from '@/stores/sos.store';
import { useSocket } from '@/hooks/useSocket';
import { api } from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';
import { Logo } from '@/components/ui/Logo';
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
  const [isDark, setIsDark] = useState(true);

  // Initialize WebSocket connection
  useSocket();

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const stored = localStorage.getItem('theme');
    const dark = stored === 'dark' || (!stored && prefersDark);
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle('dark', newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
  };

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
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-[#0a0e19]' : 'bg-[#fafafa]'}`}>
      {/* Top Navigation */}
      <header 
        className="fixed top-0 left-0 right-0 z-50 h-16 backdrop-blur-xl"
        style={{
          background: isDark ? 'rgba(10, 14, 25, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(226,232,240,0.8)',
        }}
      >
        <div className="flex items-center justify-between px-4 lg:px-6 h-full">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/dashboard">
              <Logo size="sm" variant={isDark ? 'default' : 'dark'} />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              style={{
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(241,245,249,0.8)',
                border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(226,232,240,0.5)',
              }}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <Link
              href="/sos"
              className={cn(
                'relative p-2.5 rounded-xl transition-colors',
                hasAlerts
                  ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
              )}
              style={!hasAlerts ? {
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(241,245,249,0.8)',
                border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(226,232,240,0.5)',
              } : {}}
            >
              <Bell className="w-5 h-5" />
              {hasAlerts && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </Link>

            {/* User Menu */}
            <Link 
              href="/settings" 
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              <Avatar
                src={user?.avatarUrl}
                name={user?.displayName || 'User'}
                size="sm"
              />
              <span className="hidden md:block text-sm font-medium text-slate-700 dark:text-slate-300">
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
              className="fixed left-0 top-0 bottom-0 w-72"
              style={{
                background: isDark ? '#0a0e19' : 'white',
                borderRight: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(226,232,240,0.8)',
              }}
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
                          'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                          isActive
                            ? 'bg-orange-500/10 text-orange-500 dark:text-orange-400'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                        {item.name === 'SOS Center' && hasAlerts && (
                          <span className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        )}
                      </Link>
                    );
                  })}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
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
        className="hidden lg:fixed lg:left-0 lg:top-16 lg:bottom-0 lg:w-64 lg:flex lg:flex-col"
        style={{
          background: isDark ? 'rgba(10, 14, 25, 0.95)' : 'white',
          borderRight: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(226,232,240,0.8)',
        }}
      >
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-orange-500/10 text-orange-500 dark:text-orange-400 font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
                {item.name === 'SOS Center' && hasAlerts && (
                  <span className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
        <div 
          className="p-4"
          style={{
            borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(226,232,240,0.8)',
          }}
        >
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
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

      {/* SOS Quick Button (Mobile) */}
      <Link
        href="/sos"
        className="lg:hidden fixed bottom-6 right-6 z-30 w-16 h-16 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          boxShadow: '0 4px 24px rgba(239, 68, 68, 0.4)',
        }}
      >
        <AlertTriangle className="w-7 h-7 text-white" />
      </Link>
    </div>
  );
}
