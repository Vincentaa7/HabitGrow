// src/app/page.tsx
import Link from 'next/link';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LandingHeroShowcase } from '@/components/landing/LandingHeroShowcase';
import { TreeVisualization } from '@/components/tree/TreeVisualization';
import { TreeStage } from '@/types/database';
import {
  ArrowRight,
  CalendarCheck,
  BellRing,
  Trees,
  CheckCircle2,
  Compass,
} from 'lucide-react';

const TREE_STAGES_DATA: { stage: TreeStage; name: string; range: string; desc: string }[] = [
  { stage: 'Seed', name: 'Benih', range: '0–19%', desc: 'Awal mula kebiasaan baru ditanam' },
  { stage: 'Sprout', name: 'Tunas', range: '20–39%', desc: 'Mulai berakar melalui konsistensi awal' },
  { stage: 'Young Tree', name: 'Pohon Muda', range: '40–59%', desc: 'Batang mulai menguat dengan jadwal teratur' },
  { stage: 'Healthy Tree', name: 'Pohon Sehat', range: '60–79%', desc: 'Daun rimbun dari rutinitas yang stabil' },
  { stage: 'Mature Tree', name: 'Pohon Dewasa', range: '80–100%', desc: 'Puncak konsistensi kebiasaan jangka panjang' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf9] dark:bg-[#090e0c] text-slate-900 dark:text-slate-100 font-sans">
      {/* Top Navigation */}
      <header className="w-full border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center group transition-opacity hover:opacity-95" title="HabitGrow">
            <BrandLogo className="h-8 sm:h-9 w-auto" />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition shadow-xs"
            >
              Daftar Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-12 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-5 sm:space-y-6">
          {/* Main Headline — Solid, Confident, No Gradient Tropes */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] max-w-4xl mx-auto">
            Bangun kebiasaan harian.{' '}
            <span className="text-slate-900 dark:text-white block sm:inline">
              Saksikan pohonmu bertumbuh.
            </span>
          </h1>

          {/* Subheading in Clean Indonesian */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Setiap kebiasaan yang Anda tuntaskan memberi nutrisi bagi pohon virtual Anda. Raih XP, jaga konsistensi, dan pantau kemajuan diri tanpa rasa tertekan.
          </p>

          {/* Direct CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition shadow-sm hover:shadow"
            >
              Mulai Rawat Kebiasaan
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Masuk ke Aplikasi
            </Link>
          </div>
        </div>

        {/* Hero Interactive Showcase Centerpiece */}
        <div className="mt-12 sm:mt-16">
          <LandingHeroShowcase />
        </div>
      </section>

      {/* Core Pillars / Bento Showcase with Varied Card Proportions */}
      <section className="py-16 sm:py-20 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Dirancang untuk menjaga konsistensi jangka panjang
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
              Bukan sekadar daftar centang biasa. HabitGrow menyatukan pelacakan kebiasaan dengan visualisasi nyata dan sistem pengingat yang adaptif.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Bento Card 1: 7 Columns — Evolusi Pohon Berdasarkan Konsistensi */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0c1410] border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                  <Trees className="w-5 h-5" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Visualisasi Pohon Berdasarkan Konsistensi
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Pohon Anda bertumbuh melalui 5 tahap: dari Benih, Tunas, Pohon Muda, Pohon Sehat, hingga Pohon Dewasa. Pertumbuhan dihitung dari skor konsistensi harian, memberikan umpan balik visual yang langsung terasa.
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  Konsistensi 0–100%
                </span>
                <span>5 Fase Pertumbuhan Dinamis</span>
              </div>
            </div>

            {/* Bento Card 2: 5 Columns — Streak yang Fleksibel */}
            <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0c1410] border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Streak yang Menghormati Jadwal
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Kebiasaan dapat dijadwalkan pada hari-hari tertentu dalam seminggu. Streak Anda tidak akan hangus di hari yang memang tidak Anda jadwalkan untuk beristirahat.
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  Jadwal Kustom
                </span>
                <span>Tanpa Beban Hangus Palsu</span>
              </div>
            </div>

            {/* Bento Card 3: 5 Columns — Peringatan Dini Kebiasaan Terancam */}
            <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0c1410] border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
                  <BellRing className="w-5 h-5" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Peringatan Dini Kebiasaan
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Sistem mengevaluasi riwayat penyelesaian 14 hari terakhir dan mengirimkan pengingat proaktif sebelum streak kebiasaan penting Anda berisiko terputus.
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium text-teal-600 dark:text-teal-400">
                  Notifikasi Proaktif
                </span>
                <span>Pukul 20:00–22:00</span>
              </div>
            </div>

            {/* Bento Card 4: 7 Columns — Gamifikasi & Level Pengguna */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0c1410] border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Pengalaman Bertumbuh yang Memotivasi
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Setiap penyelesaian kebiasaan menghasilkan XP proporsional berdasarkan tingkat kesulitan. Naikkan level pengguna Anda dan buka pencapaian baru secara bertahap seiring berjalannya waktu.
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  Sistem Level &amp; XP
                </span>
                <span>Progres Bertahap</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Tree Stages Evolution Row */}
      <section className="py-16 sm:py-20 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Lima Fase Evolusi Pohon
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5">
              Setiap fase merefleksikan tingkat konsistensi Anda dalam merawat kebiasaan harian.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {TREE_STAGES_DATA.map((item, idx) => (
              <div
                key={item.stage}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0c1410] border border-slate-200/90 dark:border-slate-800 text-center flex flex-col items-center justify-between"
              >
                <div className="w-full flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                  <span>Tahap {idx + 1}</span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">{item.range}</span>
                </div>

                <div className="my-4">
                  <TreeVisualization stage={item.stage} size="sm" showStageName={false} />
                </div>

                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clean, Honest Footer */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070b09] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
              <Link href="/" title="HabitGrow">
                <BrandLogo className="h-7 w-auto" />
              </Link>
              <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">|</span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Aplikasi pelacak kebiasaan berbasis gamifikasi pohon virtual.
              </p>
            </div>

            <div className="flex items-center gap-5 text-xs font-medium text-slate-600 dark:text-slate-400">
              <Link href="/login" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                Masuk
              </Link>
              <Link href="/register" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                Daftar
              </Link>
              <Link href="/app/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                Dashboard
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 dark:text-slate-500">
            <div>
              &copy; {new Date().getFullYear()} HabitGrow. Hak cipta dilindungi.
            </div>
            <div>
              Fokus pada pertumbuhan kebiasaan yang tenang dan konsisten.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
