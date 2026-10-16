// src/app/app/layout.tsx
import { Navbar } from '@/components/layout/Navbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbfcf8] dark:bg-[#020617] text-slate-900 dark:text-[#f8fafc]">
      <Navbar />
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 pb-24 md:pb-12">
        {children}
      </main>
    </div>
  );
}
