import type { Metadata, Viewport } from 'next';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { Providers } from './providers';
import './globals.css';

// Primary font for headings - Modern, geometric, tech-forward
const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
  weight: ['400', '500', '600', '700', '800', '900'],
});

// Secondary font for body text - Clean, professional, highly readable
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
  weight: ['400', '500', '600', '700'],
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
    { media: '(prefers-color-scheme: light)', color: '#f97316' },
    { media: '(prefers-color-scheme: dark)', color: '#ea580c' },
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
      className={`${outfit.variable} ${plusJakarta.variable}`}
    >
      <body className="min-h-screen bg-slate-50 font-sans antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'font-sans',
              style: {
                borderRadius: '12px',
                background: '#1e293b',
                color: '#f8fafc',
                padding: '16px',
                fontFamily: 'var(--font-plus-jakarta), system-ui, sans-serif',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#f8fafc',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#f8fafc',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
