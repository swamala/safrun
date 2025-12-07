'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Shield,
  MapPin,
  Users,
  Bell,
  ArrowRight,
  Check,
  Zap,
  Heart,
  Radio,
  Phone,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

const features = [
  {
    icon: Users,
    title: 'Group Running',
    description: 'See all runners on a live map. Never run alone again.',
  },
  {
    icon: Radio,
    title: 'Live Tracking',
    description: 'Real-time location updates every 3 seconds.',
  },
  {
    icon: Bell,
    title: 'Instant SOS',
    description: 'One tap emergency alerts to nearby runners and guardians.',
  },
  {
    icon: Shield,
    title: 'Smart Safety',
    description: 'Fall detection and no-movement alerts activate automatically.',
  },
  {
    icon: Phone,
    title: 'Guardian Network',
    description: 'Emergency contacts get notified with your exact location.',
  },
  {
    icon: MapPin,
    title: 'Nearby Discovery',
    description: 'Find runners near you in real-time.',
  },
];

const benefits = [
  'Real-time group map with all participants',
  'Emergency SOS broadcasts to nearby runners',
  'Guardian alerts with live location sharing',
  'Automatic fall detection and safety checks',
  'Anonymous mode for privacy',
  'Session leaderboards and challenges',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-secondary-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary-500" />
            <span className="text-xl font-bold text-secondary-900">SAFRUN</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-secondary-600 hover:text-secondary-900 transition-colors">
              Features
            </Link>
            <Link href="#safety" className="text-secondary-600 hover:text-secondary-900 transition-colors">
              Safety
            </Link>
            <Link href="#pricing" className="text-secondary-600 hover:text-secondary-900 transition-colors">
              Pricing
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-safety-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                The #1 Social Running Safety Platform
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-secondary-900 leading-tight mb-6">
                Run Safe,
                <br />
                <span className="text-gradient">Run Together</span>
              </h1>
              <p className="text-xl text-secondary-600 mb-8 leading-relaxed max-w-lg">
                Join group runs, track live locations, and stay protected with emergency SOS alerts that broadcast to nearby runners and your guardians.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start Running Safe
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    See How It Works
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-8 text-secondary-500 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-safety-500" />
                  Free to start
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-safety-500" />
                  No credit card
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-safety-500" />
                  Cancel anytime
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-secondary-800 to-secondary-900 rounded-3xl p-2 shadow-2xl">
                <div className="bg-secondary-900 rounded-2xl overflow-hidden">
                  <div className="aspect-[4/3] bg-gradient-to-br from-safety-900/50 to-primary-900/50 flex items-center justify-center">
                    <div className="text-center text-white p-8">
                      <div className="w-20 h-20 mx-auto mb-4 bg-primary-500/20 rounded-full flex items-center justify-center">
                        <MapPin className="w-10 h-10 text-primary-400" />
                      </div>
                      <p className="text-lg text-white/80">Live Group Map</p>
                      <p className="text-sm text-white/50 mt-1">See all runners in real-time</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating badges */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -left-8 top-1/4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-safety-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-safety-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-secondary-900">5 runners nearby</p>
                  <p className="text-xs text-secondary-500">Within 500m</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="absolute -right-8 bottom-1/4 bg-white rounded-2xl shadow-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center relative">
                    <Heart className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-secondary-900">Guardian Active</p>
                    <p className="text-xs text-safety-600">Sarah is watching</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl font-bold text-secondary-900 mb-4">
                Everything You Need to Run Safe
              </h2>
              <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
                SAFRUN combines social running with industry-leading safety features.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group p-6 bg-secondary-50 rounded-2xl hover:bg-primary-50 transition-colors duration-300"
              >
                <div className="w-12 h-12 bg-primary-100 group-hover:bg-primary-200 rounded-xl flex items-center justify-center mb-4 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">{feature.title}</h3>
                <p className="text-secondary-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SOS Section */}
      <section id="safety" className="py-20 px-6 bg-gradient-to-br from-secondary-900 to-secondary-950 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-danger-500/20 text-danger-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Shield className="w-4 h-4" />
                Emergency SOS System
              </div>
              <h2 className="text-4xl font-bold mb-6">
                Help Is Always
                <br />
                <span className="text-danger-400">One Tap Away</span>
              </h2>
              <p className="text-lg text-secondary-300 mb-8">
                When you trigger an SOS, SAFRUN immediately notifies nearby runners, your emergency contacts, and starts recording your location.
              </p>
              <div className="space-y-4">
                {[
                  'Nearby runners within 1km get instant alerts',
                  'Emergency contacts receive SMS with your location',
                  'Location history saved for responders',
                  '3-level escalation ensures help arrives',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-danger-500/20 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-danger-400" />
                    </div>
                    <span className="text-secondary-200">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-danger-500 to-danger-600 rounded-3xl p-8 text-center">
                <div className="w-32 h-32 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-white/10 rounded-full animate-ping" />
                  <Shield className="w-16 h-16" />
                </div>
                <h3 className="text-2xl font-bold mb-2">SOS Activated</h3>
                <p className="text-white/80 mb-6">Help is on the way</p>
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-sm text-white/60 mb-2">Responders notified</p>
                  <p className="text-3xl font-bold">3 runners</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-secondary-900 mb-4">
              Why Runners Love SAFRUN
            </h2>
            <p className="text-xl text-secondary-600 mb-12">
              Everything you need for safer, more social runs.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4 text-left">
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-4 bg-secondary-50 rounded-xl"
              >
                <Check className="w-5 h-5 text-safety-500 flex-shrink-0" />
                <span className="text-secondary-700">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Ready to Run Safer?</h2>
            <p className="text-xl text-white/80 mb-8">
              Join thousands of runners who trust SAFRUN for every run.
            </p>
            <Link href="/auth/signup">
              <Button variant="secondary" size="lg">
                Get Started Free
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary-400" />
              <span className="text-xl font-bold">SAFRUN</span>
            </div>
            <div className="flex items-center gap-6 text-secondary-400 text-sm">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
            <p className="text-secondary-500 text-sm">
              © 2024 SAFRUN. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

