'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, MapPin, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { useTheme, ThemeToggle } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

/**
 * SAFRUN Sign In Page
 * Uses consistent design system with 18-24px radius, soft shadows
 * Plus Jakarta Sans font, SAFRUN orange gradient
 */

const features = [
  { icon: MapPin, text: 'Real-time location tracking' },
  { icon: Shield, text: 'Emergency SOS alerts' },
  { icon: Users, text: 'Community protection' },
];

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const { setUser } = useAuthStore();
  const { isDark } = useTheme();

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.signIn(formData);
      api.setTokens(response.accessToken, response.refreshToken);
      setUser(response.user);
      document.cookie = `accessToken=${response.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}`;
      toast.success('Welcome back!');
      router.push(redirect);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background-light dark:bg-background-dark">
      {/* Left side - Visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900" />
        
        {/* Radial gradients */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-safrun-500/20 to-amber-500/10 blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/5 blur-[100px]" />
        </div>

        {/* Grid pattern */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 lg:p-16 max-w-xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Logo size="lg" className="mb-8" />
            
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Run Safe,
              <br />
              <span className="bg-gradient-to-r from-safrun-500 to-amber-400 bg-clip-text text-transparent">
                Run Together
              </span>
            </h1>
            
            <p className="text-lg text-text-dark-body mb-10 leading-relaxed">
              Join thousands of runners who trust SAFRUN to keep them safe during every run.
            </p>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-[18px] bg-white/5 border border-white/10 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-safrun-400" />
                  </div>
                  <span className="text-text-dark-body">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo & Theme Toggle */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <Logo size="md" variant={isDark ? 'default' : 'dark'} />
            <ThemeToggle />
          </div>

          {/* Form Card */}
          <div 
            className={cn(
              'p-8 rounded-[24px]',
              'bg-white dark:bg-white/[0.03]',
              'border border-navy-200/60 dark:border-white/[0.06]',
              'shadow-soft-md dark:shadow-soft-lg'
            )}
          >
            <h2 className="text-2xl font-bold text-text-light-heading dark:text-text-dark-heading mb-2">
              Welcome back
            </h2>
            <p className="text-text-light-body dark:text-text-dark-body mb-8">
              Sign in to continue your safe running journey
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email or Phone"
                type="text"
                required
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                placeholder="runner@example.com"
                leftIcon={<Mail className="w-5 h-5" />}
              />

              <div>
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-5 h-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-text-light-body/60 hover:text-text-light-heading dark:hover:text-text-dark-heading transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className={cn(
                      'w-4 h-4 rounded border-navy-300 dark:border-navy-600',
                      'text-safrun-500 focus:ring-safrun-500/50',
                      'bg-transparent'
                    )}
                  />
                  <span className="text-sm text-text-light-body dark:text-text-dark-body">Remember me</span>
                </label>
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-safrun-500 hover:text-safrun-600 dark:text-safrun-400 dark:hover:text-safrun-300 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                fullWidth 
                size="lg" 
                isLoading={isLoading}
                rightIcon={!isLoading && <ArrowRight className="w-5 h-5" />}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-navy-200/60 dark:border-white/10 text-center">
              <p className="text-text-light-body dark:text-text-dark-body">
                Don&apos;t have an account?{' '}
                <Link 
                  href="/auth/signup" 
                  className="text-safrun-500 hover:text-safrun-600 dark:text-safrun-400 dark:hover:text-safrun-300 font-semibold"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
