// src/components/ui/sign-in-page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { createClient } from '@/lib/supabase/client';

export function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setErrorMsg(null);
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/app/dashboard`,
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setIsGoogleLoading(false);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menghubungkan ke layanan autentikasi Google.');
      setIsGoogleLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setErrorMsg('Email dan password wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error?.message || 'Login gagal. Periksa email & password.');
      }

      // Immediately clear cached queries so prior account data never lingers
      queryClient.clear();
      router.push('/app/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat masuk.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white dark:bg-[#020617] text-slate-900 dark:text-[#f8fafc]">
      {/* Left Panel - Image Section with Sunlit Tree Meadow Landscape (50% split) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-950 select-none">
        {/* Floating Back Button */}
        <div className="absolute top-6 left-6 z-20">
          <Link
            href="/"
            className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/60 transition-all border border-white/15 text-white shadow-lg group"
            title="Kembali ke Beranda"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Brand Asset Image */}
        <div className="absolute inset-0">
          <img
            src="/image/Sunlit Tree Meadow Landscape.png"
            alt="HabitGrow Sunlit Tree Meadow Landscape"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Right Panel - Form Section (50% split) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 min-h-screen bg-white dark:bg-[#020617]">
        {/* Top Header Bar with Mobile Back & Theme Toggle */}
        <div className="w-full flex items-center justify-between pb-6">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="lg:hidden p-2 -ml-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0f172a] transition"
              title="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link href="/" title="HabitGrow">
              <BrandLogo className="h-7 w-auto" />
            </Link>
          </div>
          <ThemeToggle />
        </div>

        {/* Center Form Container */}
        <div className="w-full max-w-md mx-auto my-auto py-4">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#f8fafc] tracking-tight mb-2">
              Selamat Datang Kembali
            </h1>
            <p className="text-sm text-slate-600 dark:text-[#94a3b8]">
              Belum punya akun?{' '}
              <Link
                href="/register"
                className="text-emerald-600 hover:text-emerald-500 dark:text-[#aff33e] dark:hover:text-[#9de62e] font-semibold transition"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-5 p-3.5 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-900/50 flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Alamat Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="nama@email.com"
                className="w-full px-4 py-3 border border-slate-300 dark:border-[#1e293b] rounded-xl bg-slate-50/50 dark:bg-[#0f172a] text-slate-900 dark:text-[#f8fafc] placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/60 dark:focus:ring-[#aff33e]/60 focus:border-transparent outline-none transition text-sm"
                required
              />
            </div>

            {/* Password with Eye Toggle */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 border border-slate-300 dark:border-[#1e293b] rounded-xl bg-slate-50/50 dark:bg-[#0f172a] text-slate-900 dark:text-[#f8fafc] placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/60 dark:focus:ring-[#aff33e]/60 focus:border-transparent outline-none transition text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 dark:hover:bg-[#1e293b] rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me + Forgot Password */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <label className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-emerald-600 dark:text-[#aff33e] border-slate-300 dark:border-[#1e293b] rounded focus:ring-emerald-500 dark:focus:ring-[#aff33e] cursor-pointer"
                />
                <span>Ingat saya</span>
              </label>
              <button
                type="button"
                onClick={() => alert('Untuk mereset kata sandi, hubungi admin sistem atau gunakan verifikasi email Anda.')}
                className="text-emerald-600 hover:text-emerald-700 dark:text-[#aff33e] dark:hover:text-[#9de62e] font-semibold transition cursor-pointer"
              >
                Lupa kata sandi?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-[#aff33e] dark:hover:bg-[#9de62e] text-white dark:text-[#020617] py-3.5 px-4 rounded-xl font-bold transition shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 text-sm"
            >
              {isSubmitting ? 'Memproses...' : 'Masuk Sekarang'}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-[#1e293b]"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-3 bg-white dark:bg-[#020617] text-slate-400 dark:text-[#94a3b8] font-semibold tracking-wider">
                  atau lanjutkan dengan
                </span>
              </div>
            </div>

            {/* Social Button - Google Only */}
            <div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting || isGoogleLoading}
                className="w-full flex items-center justify-center px-4 py-3 border border-slate-200 dark:border-[#1e293b] rounded-xl hover:bg-slate-50 dark:hover:bg-[#0f172a] text-slate-700 dark:text-slate-200 font-semibold text-sm transition shadow-xs cursor-pointer disabled:opacity-50 gap-2.5"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#aff33e]" />
                ) : (
                  /* Google SVG */
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                <span>Masuk dengan Google</span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <div className="w-full text-center pt-6 text-[11px] text-slate-400 dark:text-slate-500">
          &copy; {new Date().getFullYear()} HabitGrow. Platform pelacak kebiasaan &amp; gamifikasi pohon virtual.
        </div>
      </div>
    </div>
  );
}
