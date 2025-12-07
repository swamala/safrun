'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Shield,
  MapPin,
  Users,
  Bell,
  ArrowRight,
  Play,
  Star,
  ChevronRight,
  ChevronLeft,
  Zap,
  Heart,
  Radio,
  Smartphone,
  Sun,
  Moon,
  Menu,
  X,
  Check,
  Quote,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

// Dynamic import for map to avoid SSR issues
const RunnerMap = dynamic(() => import('@/components/map/RunnerMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-slate-200 dark:bg-slate-800/50 rounded-3xl animate-pulse flex items-center justify-center border border-slate-200 dark:border-slate-700/50">
      <span className="text-slate-500 dark:text-slate-400">Loading map...</span>
    </div>
  ),
});

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

// Feature data
const features = [
  {
    icon: MapPin,
    title: 'Live Location Tracking',
    description: 'Share your real-time location with running buddies and guardians. Know where your group is at all times.',
    gradient: 'from-orange-500 to-amber-500',
    shadow: 'shadow-orange-500/20',
  },
  {
    icon: Bell,
    title: 'Emergency SOS Alerts',
    description: 'One tap to alert nearby runners and emergency contacts. Help arrives fast when you need it most.',
    gradient: 'from-red-500 to-rose-500',
    shadow: 'shadow-red-500/20',
  },
  {
    icon: Users,
    title: 'Nearby Runners',
    description: 'Discover and connect with runners in your area. Join group runs and build your running community.',
    gradient: 'from-blue-500 to-cyan-500',
    shadow: 'shadow-blue-500/20',
  },
  {
    icon: Shield,
    title: 'Safety Score',
    description: 'Get safety insights for your running routes. We analyze crowd density, lighting, and more.',
    gradient: 'from-green-500 to-emerald-500',
    shadow: 'shadow-green-500/20',
  },
];

// Stats data
const stats = [
  { value: '50K+', label: 'Active Runners' },
  { value: '2M+', label: 'Safe Runs Completed' },
  { value: '99.9%', label: 'SOS Response Rate' },
  { value: '150+', label: 'Cities Worldwide' },
];

// Testimonials
const testimonials = [
  {
    quote: "SAFRUN gave me confidence to run alone again. Knowing my family can track me in real-time is priceless. I feel safe on every run now.",
    author: 'Maria Santos',
    role: 'Marathon Runner',
    location: 'San Francisco, CA',
    avatar: 'MS',
    rating: 5,
  },
  {
    quote: "The SOS feature saved my running partner when she twisted her ankle on a trail. Help arrived in minutes. This app is a lifesaver!",
    author: 'James Wilson',
    role: 'Trail Running Club Leader',
    location: 'Denver, CO',
    avatar: 'JW',
    rating: 5,
  },
  {
    quote: "I've connected with amazing runners in my neighborhood. What started as safety became a real community of friends.",
    author: 'Aisha Okonkwo',
    role: 'Community Organizer',
    location: 'Austin, TX',
    avatar: 'AO',
    rating: 5,
  },
  {
    quote: "As a parent, knowing my teenager is tracked during their runs gives me peace of mind. The guardian feature is brilliant.",
    author: 'Michael Chen',
    role: 'Parent & Runner',
    location: 'Seattle, WA',
    avatar: 'MC',
    rating: 5,
  },
  {
    quote: "The nearby runners feature helped me find training partners. Now I run with a group every morning. Game changer!",
    author: 'Emma Thompson',
    role: 'Ultra Runner',
    location: 'Portland, OR',
    avatar: 'ET',
    rating: 5,
  },
];

// Navigation links
const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#map', label: 'Live Map' },
  { href: '#testimonials', label: 'Community' },
  { href: '#download', label: 'Download' },
];

// Testimonial Carousel Component
function TestimonialCarousel({ testimonials }: { testimonials: typeof testimonials }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextTestimonial = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const timer = setInterval(nextTestimonial, 6000);
    return () => clearInterval(timer);
  }, []);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const TestimonialCard = ({ testimonial, index }: { testimonial: typeof testimonials[0]; index: number }) => (
    <div className="relative bg-white dark:bg-white/[0.03] rounded-3xl p-8 border border-slate-200/80 dark:border-white/[0.06] hover:border-orange-500/30 dark:hover:border-orange-500/30 transition-all duration-300 group">
      <Quote className="w-10 h-10 text-orange-500/10 absolute top-6 right-6" />
      
      <div className="flex items-center gap-1 mb-5">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
        ))}
      </div>
      
      <p className="text-slate-700 dark:text-slate-300 mb-6 leading-[1.7]">
        "{testimonial.quote}"
      </p>
      
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-semibold shadow-lg shadow-orange-500/25">
          {testimonial.avatar}
        </div>
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">
            {testimonial.author}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {testimonial.role}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {testimonial.location}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Desktop Grid View */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-8">
        {testimonials.slice(0, 3).map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
          >
            <TestimonialCard testimonial={testimonial} index={index} />
          </motion.div>
        ))}
      </div>

      {/* Mobile/Tablet Carousel */}
      <div className="lg:hidden relative">
        <div className="overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
            >
              <TestimonialCard testimonial={testimonials[currentIndex]} index={currentIndex} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Controls */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={prevTestimonial}
            className="p-3 rounded-full bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] hover:border-orange-500 dark:hover:border-orange-500/50 transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          
          <div className="flex items-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-gradient-to-r from-orange-500 to-amber-500'
                    : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={nextTestimonial}
            className="p-3 rounded-full bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] hover:border-orange-500 dark:hover:border-orange-500/50 transition-all"
          >
            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* Desktop: View More Link */}
      <div className="hidden lg:flex justify-center mt-12">
        <button className="group flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-orange-500 transition-colors">
          <span className="font-medium">Read more stories</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [isDark, setIsDark] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.98]);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const stored = localStorage.getItem('theme');
    setIsDark(stored === 'dark' || (!stored && prefersDark));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDark 
        ? 'dark bg-[#0a0e19]' 
        : 'bg-[#fafafa]'
    }`}>
      {/* ==========================================
          NAVIGATION (Modern 2025 - 80px height)
          ========================================== */}
      <nav className={`fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 dark:bg-[#0a0e19]/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/[0.06]' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Logo size="md" variant={isDark ? 'default' : 'dark'} />

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all duration-200"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Theme toggle */}
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-3 rounded-xl bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-200/50 dark:border-white/[0.06] transition-all duration-200"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Sign In */}
              <Link
                href="/auth/signin"
                className="hidden sm:flex items-center px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Sign In
              </Link>

              {/* Get Started CTA */}
              <Link
                href="/auth/signup"
                className="hidden sm:flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                style={{
                  background: 'linear-gradient(135deg, #FF8A2B 0%, #FF6A00 100%)',
                  boxShadow: '0 4px 24px rgba(255, 140, 0, 0.35)',
                }}
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-3 rounded-xl bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-white/[0.06]"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-[#0a0e19] border-t border-slate-200/50 dark:border-white/[0.06]"
            >
              <div className="px-4 py-6 space-y-1">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-3 px-4 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-xl font-medium transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="pt-4 mt-4 border-t border-slate-200 dark:border-white/[0.06] space-y-3">
                  <Link
                    href="/auth/signin"
                    className="block py-3 px-4 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-xl font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block py-4 text-center text-white rounded-xl font-semibold"
                    style={{
                      background: 'linear-gradient(135deg, #FF8A2B 0%, #FF6A00 100%)',
                      boxShadow: '0 4px 24px rgba(255, 140, 0, 0.35)',
                    }}
                  >
                    Get Started Free
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ==========================================
          HERO SECTION (2025 Design)
          ========================================== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background layers */}
        <div className="absolute inset-0">
          {/* Base gradient - Light mode */}
          <div className="absolute inset-0 bg-gradient-to-b from-orange-50/60 via-white to-blue-50/40 dark:from-transparent dark:via-transparent dark:to-transparent" />
          
          {/* Radial gradients */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-orange-500/10 to-amber-500/10 dark:from-orange-500/[0.07] dark:to-amber-500/[0.07] blur-[100px]" />
            <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/5 dark:from-blue-500/[0.05] dark:to-cyan-500/[0.03] blur-[100px]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-gradient-to-br from-green-500/5 to-emerald-500/5 dark:from-green-500/[0.03] dark:to-emerald-500/[0.02] blur-[100px]" />
          </div>

          {/* Grid pattern - Subtle */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} 1px, transparent 1px), linear-gradient(to bottom, ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} 1px, transparent 1px)`,
              backgroundSize: '64px 64px',
              maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, black 40%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, black 40%, transparent 100%)',
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <motion.div
            style={{ opacity: heroOpacity, scale: heroScale }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-orange-100/80 dark:bg-orange-500/10 border border-orange-200/80 dark:border-orange-500/20 mb-8"
            >
              <Zap className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                #1 Social Running Safety Platform
              </span>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-[clamp(2.5rem,6vw,5rem)] font-extrabold leading-[1.1] tracking-[-0.03em] mb-8"
            >
              <span className="text-slate-900 dark:text-white">Run Safe,</span>
              <br />
              <span 
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #FF7A18 0%, #FFB347 50%, #FF8A2B 100%)',
                }}
              >
                Run Together
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-[1.7]"
            >
              Join group runs, track live locations, and stay protected with emergency SOS alerts 
              that broadcast to nearby runners and your guardians.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              {/* Primary CTA */}
              <Link
                href="/auth/signup"
                className="group flex items-center gap-3 px-8 py-4 text-white font-semibold rounded-2xl transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: 'linear-gradient(135deg, #FF8A2B 0%, #FF6A00 100%)',
                  boxShadow: '0 4px 24px rgba(255, 140, 0, 0.35)',
                }}
              >
                <Smartphone className="w-5 h-5" />
                <span>Download Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              {/* Secondary CTA */}
              <button 
                className="group flex items-center gap-3 px-8 py-4 font-semibold rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'white',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(226,232,240,1)',
                  color: isDark ? 'white' : '#0f172a',
                  boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.25)' : '0 4px 24px rgba(0,0,0,0.08)',
                }}
              >
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 text-orange-600 dark:text-orange-400 ml-0.5" />
                </div>
                <span>Watch Demo</span>
              </button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-16 flex flex-col items-center gap-4"
            >
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                  4.9/5 from 10,000+ reviews
                </span>
              </div>
              <div className="flex items-center gap-6 text-slate-400 dark:text-slate-500 text-sm">
                <span>App Store</span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span>Google Play</span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span>Featured in Forbes</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero App Preview */}
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-20 relative"
          >
            <div className="relative max-w-4xl mx-auto">
              {/* Glowing background */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 dark:from-orange-500/10 dark:to-amber-500/10 rounded-[32px] blur-3xl scale-95" />
              
              {/* App preview card */}
              <div 
                className="relative rounded-[32px] overflow-hidden"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'white',
                  border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(226,232,240,0.8)',
                  boxShadow: isDark ? '0 24px 48px rgba(0,0,0,0.4)' : '0 24px 48px rgba(0,0,0,0.1)',
                }}
              >
                <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                        <span className="text-white font-bold">SC</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">Sarah's Morning Run</p>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-sm text-slate-500 dark:text-slate-400">Live • 4 runners</span>
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-medium border border-green-200 dark:border-green-500/20">
                      All Safe
                    </div>
                  </div>
                  
                  {/* Mini map preview */}
                  <div className="aspect-video bg-slate-200 dark:bg-slate-700/50 rounded-2xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-blue-500/20 dark:from-green-500/10 dark:to-blue-500/10" />
                    <div className="absolute top-4 left-4 px-3 py-2 bg-white/90 dark:bg-slate-800/90 rounded-xl backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-orange-500 animate-pulse" />
                        <span className="text-sm font-medium text-slate-900 dark:text-white">Live Tracking</span>
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      {['orange', 'blue', 'green', 'purple'].map((color, i) => (
                        <div 
                          key={color}
                          className={`w-8 h-8 rounded-full border-2 border-white shadow-lg ${i > 0 ? '-ml-3' : ''}`}
                          style={{ background: `var(--${color}-500, ${color === 'orange' ? '#f97316' : color === 'blue' ? '#3b82f6' : color === 'green' ? '#22c55e' : '#a855f7'})` }}
                        >
                          {i === 3 && (
                            <span className="flex items-center justify-center h-full text-white text-xs font-bold">+2</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    {[
                      { value: '5.2km', label: 'Distance' },
                      { value: '28:45', label: 'Duration' },
                      { value: "5'32\"", label: 'Avg Pace' },
                    ].map((stat) => (
                      <div 
                        key={stat.label}
                        className="text-center p-4 rounded-2xl"
                        style={{
                          background: isDark ? 'rgba(255,255,255,0.03)' : 'white',
                          border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(226,232,240,0.5)',
                        }}
                      >
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==========================================
          STATS SECTION
          ========================================== */}
      <section 
        className="py-20 border-y"
        style={{
          background: isDark ? 'rgba(255,255,255,0.02)' : 'white',
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(226,232,240,0.8)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <p 
                  className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #FF7A18 0%, #FFB347 100%)',
                  }}
                >
                  {stat.value}
                </p>
                <p className="mt-2 text-slate-600 dark:text-slate-400 font-medium">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ==========================================
          FEATURES SECTION
          ========================================== */}
      <section 
        id="features" 
        className="py-28"
        style={{
          background: isDark ? '#0a0e19' : '#fafafa',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-sm font-semibold mb-6 border border-green-200 dark:border-green-500/20">
              Safety First
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-[-0.02em]">
              Your Safety, Our Priority
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-[1.7]">
              Comprehensive safety features designed by runners, for runners. 
              Stay connected, stay protected.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group p-6 rounded-3xl transition-all duration-300"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.02)' : 'white',
                  border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(226,232,240,0.8)',
                }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg ${feature.shadow}`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-[1.7]">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ==========================================
          LIVE MAP SECTION
          ========================================== */}
      <section 
        id="map" 
        className="py-28"
        style={{
          background: isDark ? 'rgba(255,255,255,0.02)' : 'white',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
            >
              <span className="inline-block px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-sm font-semibold mb-6 border border-blue-200 dark:border-blue-500/20">
                Real-Time Tracking
              </span>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-[-0.02em]">
                See Your Running
                <br />
                <span 
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #FF7A18 0%, #FFB347 100%)',
                  }}
                >
                  Community Live
                </span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-[1.7]">
                Watch runners in real-time on our interactive map. Connect with 
                nearby runners, join group runs, and always know help is close by.
              </p>

              <div className="space-y-4">
                {[
                  'Live location updates every 2 seconds',
                  'Safety status visible to nearby runners',
                  'One-tap SOS alert broadcasting',
                  'Route sharing with guardians',
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300">{item}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 mt-10 px-6 py-3 font-semibold rounded-xl transition-colors"
                style={{
                  background: isDark ? 'white' : '#0f172a',
                  color: isDark ? '#0f172a' : 'white',
                }}
              >
                Try Live Tracking
                <ChevronRight className="w-5 h-5" />
              </Link>
            </motion.div>

            <motion.div
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
            >
              <RunnerMap isDark={isDark} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==========================================
          SOS FEATURE HIGHLIGHT
          ========================================== */}
      <section className="py-28 bg-gradient-to-br from-red-500 via-rose-500 to-orange-500 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid lg:grid-cols-2 gap-16 items-center"
          >
            <motion.div variants={fadeInUp}>
              <span className="inline-block px-4 py-2 rounded-full bg-white/20 text-white text-sm font-semibold mb-6">
                Emergency Response
              </span>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-6 tracking-[-0.02em]">
                One Tap
                <br />
                To Safety
              </h2>
              <p className="text-xl text-white/90 mb-10 leading-[1.7]">
                When seconds matter, SAFRUN's SOS system instantly alerts nearby 
                runners, your emergency contacts, and local authorities.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { value: '<30s', label: 'Average Response Time' },
                  { value: '5km', label: 'Alert Broadcast Radius' },
                  { value: '24/7', label: 'Monitoring Active' },
                  { value: '100%', label: 'Alert Delivery Rate' },
                ].map((stat, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-white/70 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={scaleIn} className="relative">
              {/* SOS Button mockup */}
              <div className="relative mx-auto w-72 h-72">
                {/* Pulsing rings */}
                <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" style={{ animationDuration: '2s' }} />
                <div className="absolute inset-4 rounded-full bg-white/20 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                <div className="absolute inset-8 rounded-full bg-white/20 animate-ping" style={{ animationDuration: '2s', animationDelay: '1s' }} />
                
                {/* Main button */}
                <div className="absolute inset-12 rounded-full bg-white shadow-2xl flex items-center justify-center">
                  <div className="text-center">
                    <Bell className="w-12 h-12 text-red-500 mx-auto mb-2" />
                    <span className="text-2xl font-bold text-red-500">SOS</span>
                    <p className="text-xs text-slate-500 mt-1">Hold to activate</p>
                  </div>
                </div>
              </div>

              {/* Alert notification mockup */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
                className="absolute -right-4 top-1/4 bg-white rounded-2xl shadow-2xl p-4 w-64"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">SOS Alert Received</p>
                    <p className="text-xs text-slate-500 mt-0.5">Sarah needs help • 0.3km away</p>
                    <button className="mt-2 text-xs font-medium text-red-500">
                      View Location →
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ==========================================
          TESTIMONIALS SECTION
          ========================================== */}
      <section 
        id="testimonials" 
        className="py-28 overflow-hidden"
        style={{
          background: isDark ? '#0a0e19' : '#fafafa',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-sm font-semibold mb-6 border border-purple-200 dark:border-purple-500/20">
              Community Stories
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-[-0.02em]">
              Loved by Runners
              <br />
              <span 
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #FF7A18 0%, #FFB347 100%)',
                }}
              >
                Worldwide
              </span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-[1.7]">
              Join thousands of runners who trust SAFRUN for their safety and community.
            </p>
          </motion.div>

          <TestimonialCarousel testimonials={testimonials} />
        </div>
      </section>

      {/* ==========================================
          DOWNLOAD CTA SECTION
          ========================================== */}
      <section 
        id="download" 
        className="py-28"
        style={{
          background: isDark ? 'rgba(255,255,255,0.02)' : 'white',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-500/30 to-amber-500/30 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-[100px]" />

            <div className="relative z-10 px-8 py-20 sm:px-16 sm:py-24 text-center">
              <Heart className="w-16 h-16 text-orange-500 mx-auto mb-8" />
              
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-6 tracking-[-0.02em]">
                Ready to Run Safer?
              </h2>
              
              <p className="text-lg text-slate-400 max-w-xl mx-auto mb-12 leading-[1.7]">
                Download SAFRUN today and join a community of runners 
                who look out for each other.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="flex items-center gap-4 px-6 py-4 bg-white text-slate-900 font-semibold rounded-2xl hover:bg-slate-100 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-xs text-slate-500">Download on the</p>
                    <p className="font-semibold text-lg">App Store</p>
                  </div>
                </button>
                
                <button className="flex items-center gap-4 px-6 py-4 bg-white text-slate-900 font-semibold rounded-2xl hover:bg-slate-100 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
                    <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35zm13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27zm3.35-4.31c.34.27.59.69.59 1.19s-.22.9-.57 1.18l-2.29 1.32-2.5-2.5 2.5-2.5 2.27 1.31zM6.05 2.66l10.76 6.22-2.27 2.27-8.49-8.49z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-xs text-slate-500">Get it on</p>
                    <p className="font-semibold text-lg">Google Play</p>
                  </div>
                </button>
              </div>

              <p className="mt-10 text-sm text-slate-500">
                Free to download • No credit card required
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==========================================
          FOOTER
          ========================================== */}
      <footer 
        className="py-16 border-t"
        style={{
          background: isDark ? '#0a0e19' : '#f8fafc',
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(226,232,240,0.8)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand */}
            <div>
              <div className="mb-6">
                <Logo size="md" variant={isDark ? 'default' : 'dark'} />
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-6 leading-[1.7]">
                The social running platform that puts your safety first. Run with confidence.
              </p>
              <div className="flex items-center gap-3">
                {[
                  { icon: Twitter, href: '#', label: 'Twitter' },
                  { icon: Instagram, href: '#', label: 'Instagram' },
                  { icon: Facebook, href: '#', label: 'Facebook' },
                  { icon: Youtube, href: '#', label: 'Youtube' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-orange-500 transition-all duration-200"
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(241,245,249,0.8)',
                      border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(226,232,240,0.5)',
                    }}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-display font-semibold text-slate-900 dark:text-white mb-5">Product</h4>
              <ul className="space-y-3">
                {['Features', 'Safety', 'Pricing', 'Download', 'Changelog'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-orange-500 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-display font-semibold text-slate-900 dark:text-white mb-5">Company</h4>
              <ul className="space-y-3">
                {['About Us', 'Careers', 'Blog', 'Press', 'Partners'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-orange-500 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-display font-semibold text-slate-900 dark:text-white mb-5">Legal</h4>
              <ul className="space-y-3">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR', 'Contact'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-orange-500 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div 
            className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{
              borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(226,232,240,0.8)',
            }}
          >
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} SAFRUN. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {['Privacy', 'Terms', 'Sitemap'].map((link) => (
                <a key={link} href="#" className="text-sm text-slate-500 hover:text-orange-500 transition-colors">
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
