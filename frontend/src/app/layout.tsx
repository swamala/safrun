import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { Providers } from './providers';
import './globals.css';

/**
 * SAFRUN Root Layout
 * Uses Plus Jakarta Sans as the primary font per design spec
 * Font weights: 400 (body), 500-600 (labels/CTA), 700-800 (headings)
 */

// Primary font - Plus Jakarta Sans (same as landing page)
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: {
    default: 'SAFRUN - Run Safe, Run Together',
    template: '%s | SAFRUN',
  },
  description:
    'The social running platform that keeps you safe. Join group runs, track live locations, and stay protected with emergency SOS alerts.',
  keywords: ['running', 'safety', 'social running', 'SOS', 'group running', 'fitness'],
  authors: [{ name: 'SAFRUN Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://safrun.app',
    siteName: 'SAFRUN',
    title: 'SAFRUN - Run Safe, Run Together',
    description:
      'The social running platform that keeps you safe. Join group runs and stay protected.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SAFRUN',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SAFRUN - Run Safe, Run Together',
    description: 'The social running platform that keeps you safe.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7F9FC' },
    { media: '(prefers-color-scheme: dark)', color: '#0E172A' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning 
      className={plusJakarta.variable}
    >
      <body className="min-h-screen bg-background-light dark:bg-background-dark font-sans antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'font-sans',
              style: {
                borderRadius: '18px',
                background: '#0E172A',
                color: '#F8FAFC',
                padding: '16px 20px',
                fontFamily: 'var(--font-plus-jakarta), system-ui, sans-serif',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              },
              success: {
                iconTheme: {
                  primary: '#22C55E',
                  secondary: '#F8FAFC',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#F8FAFC',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
