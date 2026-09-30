import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ServiceWorkerRegister } from '@/components/providers/ServiceWorkerRegister';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'HabitGrow — Gamified Habit Tracker & Virtual Tree Progression',
  description:
    'Bangun kebiasaan positif setiap hari, dapatkan XP, rawat streak, dan saksikan pohon virtualmu bertumbuh semakin megah.',
  keywords: ['habit tracker', 'gamification', 'virtual tree', 'productivity', 'streak', 'habits', 'spk'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HabitGrow',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HabitGrow" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="min-h-full flex flex-col bg-[#f8faf9] text-slate-900 dark:bg-[#090e0c] dark:text-slate-100 font-sans transition-colors duration-200">
        {/* Inline script executed before paint to prevent FOUC */}
        <Script id="theme-init" strategy="beforeInteractive">{`
(function() {
  try {
    var saved = localStorage.getItem('habitgrow_theme');
    var isDark = saved === 'dark' || ((!saved || saved === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) document.documentElement.classList.add('dark');
  } catch(e) {}
})();
        `}</Script>
        <ServiceWorkerRegister />
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
