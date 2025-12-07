'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Shield,
  MapPin,
  Users,
  Bell,
  ArrowRight,
  Play,
  Star,
  ChevronRight,
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

// Dynamic import for map to avoid SSR issues
const RunnerMap = dynamic(() => import('@/components/map/RunnerMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse flex items-center justify-center">
      <span className="text-slate-500 dark:text-slate-400">Loading map...</span>
    </div>
  ),
});

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

// Feature data
const features = [
  {
    icon: MapPin,
    title: 'Live Location Tracking',
    description: 'Share your real-time location with running buddies and guardians. Know where your group is at all times.',
    color: 'bg-orange-500',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    icon: Bell,
    title: 'Emergency SOS Alerts',
    description: 'One tap to alert nearby runners and emergency contacts. Help arrives fast when you need it most.',
    color: 'bg-red-500',
    gradient: 'from-red-500 to-rose-500',
  },
  {
    icon: Users,
    title: 'Nearby Runners',
    description: 'Discover and connect with runners in your area. Join group runs and build your running community.',
    color: 'bg-blue-500',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Shield,
    title: 'Safety Score',
    description: 'Get safety insights for your running routes. We analyze crowd density, lighting, and more.',
    color: 'bg-green-500',
    gradient: 'from-green-500 to-emerald-500',
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
    featured: true,
  },
  {
    quote: "The SOS feature saved my running partner when she twisted her ankle on a trail. Help arrived in minutes. This app is a lifesaver!",
    author: 'James Wilson',
    role: 'Trail Running Club Leader',
    location: 'Denver, CO',
    avatar: 'JW',
    rating: 5,
    featured: false,
  },
  {
    quote: "I've connected with amazing runners in my neighborhood. What started as safety became a real community of friends.",
    author: 'Aisha Okonkwo',
    role: 'Community Organizer',
    location: 'Austin, TX',
    avatar: 'AO',
    rating: 5,
    featured: false,
  },
  {
    quote: "As a parent, knowing my teenager is tracked during their runs gives me peace of mind. The guardian feature is brilliant.",
    author: 'Michael Chen',
    role: 'Parent & Runner',
    location: 'Seattle, WA',
    avatar: 'MC',
    rating: 5,
    featured: false,
  },
  {
    quote: "The nearby runners feature helped me find training partners. Now I run with a group every morning. Game changer!",
    author: 'Emma Thompson',
    role: 'Ultra Runner',
    location: 'Portland, OR',
    avatar: 'ET',
    rating: 5,
    featured: false,
  },
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

  return (
    <div className="relative">
      {/* Desktop Grid View */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-8">
        {testimonials.slice(0, 3).map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className="relative bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 dark:hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300"
          >
            <Quote className="w-10 h-10 text-orange-500/20 absolute top-6 right-6" />
            
            <div className="flex items-center gap-1 mb-4">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            
            <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
              "{testimonial.quote}"
            </p>
            
            <div className="flex items-center gap-3">
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
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {testimonial.location}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mobile/Tablet Carousel */}
      <div className="lg:hidden relative">
        <div className="overflow-hidden">
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
            className="relative bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800"
          >
            <Quote className="w-10 h-10 text-orange-500/20 absolute top-6 right-6" />
            
            <div className="flex items-center gap-1 mb-4">
              {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            
            <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed text-lg">
              "{testimonials[currentIndex].quote}"
            </p>
            
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-semibold text-lg shadow-lg shadow-orange-500/25">
                {testimonials[currentIndex].avatar}
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-lg">
                  {testimonials[currentIndex].author}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {testimonials[currentIndex].role}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {testimonials[currentIndex].location}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Carousel Controls */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={prevTestimonial}
            className="p-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400 rotate-180" />
          </button>
          
          {/* Dots */}
          <div className="flex items-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-orange-500'
                    : 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={nextTestimonial}
            className="p-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 transition-colors"
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
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  useEffect(() => {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const stored = localStorage.getItem('theme');
    setIsDark(stored === 'dark' || (!stored && prefersDark));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                SAF<span className="text-orange-500">RUN</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                Features
              </a>
              <a href="#map" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                Live Map
              </a>
              <a href="#testimonials" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                Community
              </a>
              <a href="#download" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                Download
              </a>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <Link href="/auth/signin" className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                Sign In
              </Link>
              
              <Link
                href="/auth/signup"
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all duration-200"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800"
          >
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block py-2 text-slate-700 dark:text-slate-300">Features</a>
              <a href="#map" className="block py-2 text-slate-700 dark:text-slate-300">Live Map</a>
              <a href="#testimonials" className="block py-2 text-slate-700 dark:text-slate-300">Community</a>
              <a href="#download" className="block py-2 text-slate-700 dark:text-slate-300">Download</a>
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <Link href="/auth/signin" className="block py-2 text-slate-700 dark:text-slate-300">Sign In</Link>
                <Link href="/auth/signup" className="block py-3 text-center bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium">
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-64 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 blur-3xl" />
          <div className="absolute bottom-1/4 -right-64 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-green-500/10 to-emerald-500/10 blur-3xl" />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8881_1px,transparent_1px),linear-gradient(to_bottom,#8881_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            style={{ opacity: heroOpacity, scale: heroScale }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 mb-8"
            >
              <Zap className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
                #1 Social Running Safety Platform
              </span>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight"
            >
              Run Safe,
              <br />
              <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">
                Run Together
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Join group runs, track live locations, and stay protected with emergency SOS alerts 
              that broadcast to nearby runners and your guardians.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/auth/signup"
                className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-2xl shadow-xl shadow-orange-500/25 hover:shadow-2xl hover:shadow-orange-500/30 hover:-translate-y-1 transition-all duration-300"
              >
                <Smartphone className="w-5 h-5" />
                Download Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button className="group flex items-center gap-3 px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 text-orange-600 dark:text-orange-400 ml-0.5" />
                </div>
                Watch Demo
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
                <span className="ml-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                  4.9/5 from 10,000+ reviews
                </span>
              </div>
              <div className="flex items-center gap-6 text-slate-400 dark:text-slate-500 text-sm">
                <span>App Store</span>
                <span>•</span>
                <span>Google Play</span>
                <span>•</span>
                <span>Featured in Forbes</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero image / Phone mockup */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20 relative"
          >
            <div className="relative max-w-4xl mx-auto">
              {/* Glowing background */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl blur-3xl opacity-20 scale-95" />
              
              {/* App preview card */}
              <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
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
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-medium">
                        All Safe
                      </div>
                    </div>
                  </div>
                  
                  {/* Mini map preview */}
                  <div className="aspect-video bg-slate-200 dark:bg-slate-700 rounded-2xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-blue-500/20" />
                    <div className="absolute top-4 left-4 px-3 py-2 bg-white/90 dark:bg-slate-800/90 rounded-lg backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-orange-500 animate-pulse" />
                        <span className="text-sm font-medium text-slate-900 dark:text-white">Live Tracking</span>
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-orange-500 border-2 border-white shadow-lg" />
                      <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white shadow-lg -ml-3" />
                      <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-white shadow-lg -ml-3" />
                      <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-white shadow-lg -ml-3 flex items-center justify-center text-white text-xs font-bold">
                        +2
                      </div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 rounded-xl bg-white dark:bg-slate-800">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">5.2km</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Distance</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-white dark:bg-slate-800">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">28:45</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Duration</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-white dark:bg-slate-800">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">5'32"</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Avg Pace</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
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
                <p className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
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

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-sm font-medium mb-4">
              Safety First
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Your Safety, Our Priority
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
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
                className="group p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 dark:hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Live Map Section */}
      <section id="map" className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
            >
              <span className="inline-block px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-sm font-medium mb-4">
                Real-Time Tracking
              </span>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                See Your Running
                <br />
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                  Community Live
                </span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
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
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300">{item}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
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

      {/* SOS Feature Highlight */}
      <section className="py-24 bg-gradient-to-br from-red-500 via-rose-500 to-orange-500 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <motion.div variants={fadeInUp}>
              <span className="inline-block px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-4">
                Emergency Response
              </span>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-6">
                One Tap
                <br />
                To Safety
              </h2>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
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
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-white/70">{stat.label}</p>
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

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-slate-50 dark:bg-slate-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-sm font-medium mb-4">
              Community Stories
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Loved by Runners
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                Worldwide
              </span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Join thousands of runners who trust SAFRUN for their safety and community.
            </p>
          </motion.div>

          {/* Testimonial Carousel */}
          <TestimonialCarousel testimonials={testimonials} />
        </div>
      </section>

      {/* Download CTA Section */}
      <section id="download" className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="relative bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-3xl overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-500/30 to-amber-500/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl" />

            <div className="relative z-10 px-8 py-16 sm:px-16 sm:py-20 text-center">
              <Heart className="w-16 h-16 text-orange-500 mx-auto mb-6" />
              
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-6">
                Ready to Run Safer?
              </h2>
              
              <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10">
                Download SAFRUN today and join a community of runners 
                who look out for each other.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="flex items-center gap-3 px-6 py-4 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
                    <path d="M17.5 12.5c0-1.58-.79-2.98-2-3.81V7c0-1.1-.9-2-2-2h-3c-1.1 0-2 .9-2 2v1.69c-1.21.83-2 2.23-2 3.81 0 2.76 2.24 5 5 5s5-2.24 5-5z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-xs text-slate-500">Download on the</p>
                    <p className="font-semibold">App Store</p>
                  </div>
                </button>
                
                <button className="flex items-center gap-3 px-6 py-4 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
                    <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35zm13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27zm3.35-4.31c.34.27.59.69.59 1.19s-.22.9-.57 1.18l-2.29 1.32-2.5-2.5 2.5-2.5 2.27 1.31zM6.05 2.66l10.76 6.22-2.27 2.27-8.49-8.49z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-xs text-slate-500">Get it on</p>
                    <p className="font-semibold">Google Play</p>
                  </div>
                </button>
              </div>

              <p className="mt-8 text-sm text-slate-500">
                Free to download • No credit card required
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand */}
            <div>
              <Link href="/" className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  SAF<span className="text-orange-500">RUN</span>
                </span>
              </Link>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                The social running platform that puts your safety first.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-orange-500 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-orange-500 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-orange-500 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-orange-500 transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-display font-semibold text-slate-900 dark:text-white mb-4">Product</h4>
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
              <h4 className="font-display font-semibold text-slate-900 dark:text-white mb-4">Company</h4>
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
              <h4 className="font-display font-semibold text-slate-900 dark:text-white mb-4">Legal</h4>
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

          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 dark:text-slate-500 text-sm">
              © {new Date().getFullYear()} SAFRUN. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-slate-500 hover:text-orange-500 transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-slate-500 hover:text-orange-500 transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-slate-500 hover:text-orange-500 transition-colors">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
