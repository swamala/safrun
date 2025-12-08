'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle2, Shield, MapPin, Users, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { useTheme, ThemeToggle } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

/**
 * SAFRUN Sign Up Page
 * Uses consistent design system with 18-24px radius, soft shadows
 * Plus Jakarta Sans font, SAFRUN orange gradient
 */

const features = [
  { icon: MapPin, text: 'Real-time group running with live map' },
  { icon: Shield, text: 'Emergency SOS alerts to nearby runners' },
  { icon: Users, text: 'Guardian protection for peace of mind' },
  { icon: Zap, text: 'Smart safety features that work automatically' },
];

export default function SignUpPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const { isDark } = useTheme();

  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.signUp({
        email: formData.email,
        displayName: formData.displayName,
        password: formData.password,
      });

      api.setTokens(response.accessToken, response.refreshToken);
      setUser(response.user);
      document.cookie = `accessToken=${response.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}`;
      toast.success('Welcome to SAFRUN!');
      router.push('/dashboard');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to create account');
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
          <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-safrun-500/20 to-amber-500/10 blur-[100px]" />
          <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-safety-500/10 to-emerald-500/5 blur-[100px]" />
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
              Join the World&apos;s Safest
              <br />
              <span className="bg-gradient-to-r from-safrun-500 to-amber-400 bg-clip-text text-transparent">
                Running Community
              </span>
            </h1>
            
            <p className="text-lg text-text-dark-body mb-10 leading-relaxed">
              Start your safe running journey today with features designed to protect you.
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
                  <div className="w-6 h-6 rounded-full bg-safety-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-safety-400" />
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
              Create your account
            </h2>
            <p className="text-text-light-body dark:text-text-dark-body mb-8">
              Start your safe running journey today
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Display Name"
                type="text"
                required
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Your name"
                leftIcon={<User className="w-5 h-5" />}
              />

              <Input
                label="Email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="runner@example.com"
                leftIcon={<Mail className="w-5 h-5" />}
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
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

              <Input
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                leftIcon={<Lock className="w-5 h-5" />}
              />

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className={cn(
                    'mt-1 w-4 h-4 rounded',
                    'border-navy-300 dark:border-navy-600',
                    'text-safrun-500 focus:ring-safrun-500/50',
                    'bg-transparent'
                  )}
                />
                <span className="text-sm text-text-light-body dark:text-text-dark-body">
                  I agree to the{' '}
                  <Link href="/terms" className="text-safrun-500 hover:text-safrun-600 dark:text-safrun-400 dark:hover:text-safrun-300">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-safrun-500 hover:text-safrun-600 dark:text-safrun-400 dark:hover:text-safrun-300">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              <Button 
                type="submit" 
                fullWidth 
                size="lg" 
                isLoading={isLoading}
                rightIcon={!isLoading && <ArrowRight className="w-5 h-5" />}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-navy-200/60 dark:border-white/10 text-center">
              <p className="text-text-light-body dark:text-text-dark-body">
                Already have an account?{' '}
                <Link 
                  href="/auth/signin" 
                  className="text-safrun-500 hover:text-safrun-600 dark:text-safrun-400 dark:hover:text-safrun-300 font-semibold"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
