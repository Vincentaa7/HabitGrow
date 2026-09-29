// src/app/(auth)/register/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@/lib/validators/auth.schema';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function RegisterPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isSuccessVerificationSent, setIsSuccessVerificationSent] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error?.message || 'Registrasi gagal. Silakan coba lagi.');
      }

      // If email confirmation is required by Supabase, session will be null
      if (!json.data?.session) {
        setIsSuccessVerificationSent(data.email);
        return;
      }

      // Immediately clear cached queries so prior account data never lingers
      queryClient.clear();
      router.push('/app/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan sistem');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      {/* Top bar with theme toggle */}
      <div className="flex items-center justify-between px-6 py-4">
        <span className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">
          <span className="text-lg">🌱</span>
          HabitGrow
        </span>
        <ThemeToggle />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-[#111a16] border border-slate-200 dark:border-[#1e2e26] shadow-xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>

        <div className="text-center mb-6">
          <span className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 inline-flex items-center justify-center text-2xl shadow-sm mb-3">
            🌱
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Buat Akun HabitGrow
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Mulai petualangan kebiasaan dan rawat pohon virtualmu hari ini
          </p>
        </div>

        {isSuccessVerificationSent ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-3xl">
              ✉️
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Periksa Email Anda
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                Tautan verifikasi telah dikirim ke <span className="font-bold text-emerald-600 dark:text-emerald-400">{isSuccessVerificationSent}</span>.
                Silakan buka kotak masuk atau folder spam email Anda dan klik tombol verifikasi untuk mengaktifkan akun.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm"
            >
              Kembali ke Halaman Login
            </Link>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="mb-4 p-3 text-xs text-red-700 bg-red-50 dark:bg-red-950/50 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-900">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Nama Lengkap / Panggilan
            </label>
            <input
              type="text"
              placeholder="Masukkan nama lengkap atau panggilan"
              {...register('display_name')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.display_name && (
              <p className="text-xs text-red-500 mt-1">{errors.display_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="nama@email.com"
              {...register('email')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Password (min. 6 karakter)
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Mendaftarkan...' : 'Daftar Sekarang'}
            <UserPlus className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Sudah memiliki akun?{' '}
          <Link
            href="/login"
            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Masuk di sini
          </Link>
        </p>
        </>
        )}
      </div>
      </div>
    </div>
  );
}
