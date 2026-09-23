import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';

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
  keywords: ['habit tracker', 'gamification', 'virtual tree', 'productivity', 'streak', 'habits'],
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
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
