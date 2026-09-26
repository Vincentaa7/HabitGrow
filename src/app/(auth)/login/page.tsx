// src/app/(auth)/login/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/lib/validators/auth.schema';
import { LogIn, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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
            Selamat Datang Kembali
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Masuk untuk merawat kebiasaan dan pohon virtualmu
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 text-xs text-red-700 bg-red-50 dark:bg-red-950/50 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-900">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              Password
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
            {isSubmitting ? 'Memproses...' : 'Masuk Sekarang'}
            <LogIn className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Belum punya akun?{' '}
          <Link
            href="/register"
            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Daftar Gratis
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}
