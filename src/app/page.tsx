// src/app/page.tsx
import Link from 'next/link';
import { TreeVisualization } from '@/components/tree/TreeVisualization';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
  Sparkles,
  CheckCircle2,
  Flame,
  Trees,
  BarChart3,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf9] dark:bg-[#090e0c] text-slate-900 dark:text-slate-100">
      {/* Top Bar */}
      <header className="w-full border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black text-lg shadow-sm">
              🌱
            </span>
            <span className="font-extrabold text-xl tracking-tight">
              Habit<span className="text-emerald-600 dark:text-emerald-400">Grow</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition"
            >
              Daftar Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <Sparkles className="w-3.5 h-3.5" />
                Gamified Habit Tracker with Virtual Tree Progression
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                Grow Better Habits.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-green-400">
                  Grow Your Tree.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Ubah rutinitas membosankan menjadi petualangan visual. Bangun kebiasaan harian, pertahankan streak, raih XP, dan saksikan pohon virtualmu bertumbuh mekar seiring konsistensimu.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 group transition-all hover:scale-105"
                >
                  Mulai Rawat Pohonmu
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-bold text-base hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  Masuk ke Dashboard
                </Link>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-6 pt-6 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  100% Berbasis Data Nyata
                </div>
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500" />
                  Gamifikasi Motivatif
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-teal-500" />
                  Responsif di Semua Device
                </div>
              </div>
            </div>

            {/* Right Interactive Tree Showcase */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md p-8 rounded-3xl bg-gradient-to-b from-white to-emerald-50/50 dark:from-slate-900 dark:to-emerald-950/20 border border-emerald-100 dark:border-emerald-900/60 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Live Tree Engine
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                    Konsistensi: 88%
                  </span>
                </div>

                <TreeVisualization stage="Mature Tree" size="lg" showStageName={true} />

                <div className="mt-6 p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Penyelesaian Hari Ini:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">4 dari 4 Habit Selesai (100%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full w-full transition-all duration-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24 bg-white/70 dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Alur Gamifikasi
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
              Bukan Sekadar Centang Checklist
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-4 text-base">
              Setiap kali Anda menuntaskan kebiasaan, sistem engine kami memperhitungkan XP, streak berjadwal, dan skor konsistensi untuk menyiram pohon virtual Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Tentukan Kebiasaan',
                desc: 'Pilih jadwal harian atau hari tertentu dengan target realistis.',
                icon: CheckCircle2,
                color: 'text-emerald-500',
              },
              {
                step: '02',
                title: 'Selesaikan & Raih XP',
                desc: 'Centang habit setiap hari, kumpulkan XP untuk naik level.',
                icon: Zap,
                color: 'text-amber-500',
              },
              {
                step: '03',
                title: 'Jaga Streak Harian',
                desc: 'Streak cerdas yang menghormati jadwal libur atau non-scheduled days.',
                icon: Flame,
                color: 'text-orange-500',
              },
              {
                step: '04',
                title: 'Saksikan Pohon Mekar',
                desc: 'Dari Benih (Seed) hingga Pohon Dewasa (Mature Tree) yang megah.',
                icon: Trees,
                color: 'text-green-500',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-sm hover:shadow-md transition"
                >
                  <span className="text-2xl font-black text-slate-300 dark:text-slate-700">
                    {item.step}
                  </span>
                  <div className="mt-4 mb-3">
                    <Icon className={`w-8 h-8 ${item.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5 Tree Stages Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Siklus Pertumbuhan
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
              5 Tahap Evolusi Pohon Virtual
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-4 text-base">
              Kondisi pohon dihitung secara presisi dari Consistency Score (0–100%).
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { stage: 'Seed' as const, name: '1. Benih', score: '0–19%' },
              { stage: 'Sprout' as const, name: '2. Tunas', score: '20–39%' },
              { stage: 'Young Tree' as const, name: '3. Pohon Muda', score: '40–59%' },
              { stage: 'Healthy Tree' as const, name: '4. Pohon Sehat', score: '60–79%' },
              { stage: 'Mature Tree' as const, name: '5. Pohon Dewasa', score: '80–100%' },
            ].map((t) => (
              <div
                key={t.stage}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm flex flex-col items-center justify-between"
              >
                <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                  {t.score}
                </span>
                <div className="my-2">
                  <TreeVisualization stage={t.stage} size="sm" />
                </div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  {t.name}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-base">🌱</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">HabitGrow</span>
            <span>— Gamified Habit Tracker</span>
          </div>
          <div>
            Dikembangkan dengan Next.js 15, TypeScript, Tailwind CSS, & Supabase.
          </div>
        </div>
      </footer>
    </div>
  );
}
