// src/app/app/habits/page.tsx
'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Habit, HabitCategory } from '@/types/database';
import { HabitFormModal } from '@/components/habits/HabitFormModal';
import {
  Plus,
  Pencil,
  Archive,
  RotateCcw,
  Trash2,
  Sparkles,
  Dumbbell,
  BookOpen,
  Heart,
  Briefcase,
  Smile,
  Zap,
  Flame,
  AlertTriangle,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  sparkles: Sparkles,
  'book-open': BookOpen,
  dumbbell: Dumbbell,
  heart: Heart,
  briefcase: Briefcase,
  smile: Smile,
  zap: Zap,
};

export default function HabitsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'active' | 'archived'>('active');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);

  // 1. Fetch Categories
  const { data: categories = [] } = useQuery<HabitCategory[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      const json = await res.json();
      return json.data || [];
    },
  });

  // 2. Fetch Habits
  const { data: habits = [], isLoading } = useQuery<Habit[]>({
    queryKey: ['habits', tab, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('archived', tab === 'archived' ? 'true' : 'false');
      if (selectedCategory !== 'all') params.set('categoryId', selectedCategory);

      const res = await fetch(`/api/habits?${params.toString()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Gagal memuat kebiasaan');
      return json.data || [];
    },
  });

  // 3. Archive Mutation
  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/habits/${id}/archive`, { method: 'POST' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits'] }),
  });

  // 4. Restore Mutation
  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/habits/${id}/restore`, { method: 'POST' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits'] }),
  });

  // 5. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/habits/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      setDeletingHabit(null);
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Manajemen Kebiasaan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola daftar rutinitas, jadwal, dan arsip kebiasaanmu.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition shadow-emerald-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Tambah Kebiasaan
        </button>
      </div>

      {/* Filter Tabs & Category Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60">
          <button
            onClick={() => setTab('active')}
            className={cn(
              'px-4 py-1.5 rounded-lg text-xs font-bold transition',
              tab === 'active'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            )}
          >
            Aktif
          </button>
          <button
            onClick={() => setTab('archived')}
            className={cn(
              'px-4 py-1.5 rounded-lg text-xs font-bold transition',
              tab === 'archived'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            )}
          >
            Diarsipkan
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              'px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition border',
              selectedCategory === 'all'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
            )}
          >
            Semua Kategori
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition border',
                selectedCategory === c.id
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Habits List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          <div className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      ) : habits.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500">
            {tab === 'active'
              ? 'Tidak ada kebiasaan aktif. Klik "Tambah Kebiasaan" untuk memulai.'
              : 'Tidak ada kebiasaan yang diarsipkan.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map((habit) => {
            const IconComp = ICON_MAP[habit.icon] || Sparkles;
            const streakCount = habit.streak?.current_streak ?? 0;

            return (
              <div
                key={habit.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-inner"
                        style={{
                          backgroundColor: `${habit.color}18`,
                          color: habit.color,
                        }}
                      >
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">
                          {habit.name}
                        </h3>
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {habit.category?.name || 'Umum'}
                        </span>
                      </div>
                    </div>

                    {/* Streak badge */}
                    {streakCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-1 rounded-lg">
                        <Flame className="w-3.5 h-3.5 fill-amber-500" />
                        {streakCount}
                      </span>
                    )}
                  </div>

                  {habit.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 line-clamp-2">
                      {habit.description}
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                    <span>
                      Jadwal: <strong>{habit.frequency_type === 'DAILY' ? 'Setiap Hari' : 'Hari Tertentu'}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Target: <strong>{habit.target_value} {habit.target_unit}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Kesulitan: <strong>{habit.difficulty}</strong>
                    </span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2">
                  {tab === 'active' ? (
                    <>
                      <button
                        onClick={() => setEditingHabit(habit)}
                        className="p-2 text-xs font-semibold text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                        title="Edit Kebiasaan"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => archiveMutation.mutate(habit.id)}
                        disabled={archiveMutation.isPending}
                        className="p-2 text-xs font-semibold text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                        title="Arsipkan"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => restoreMutation.mutate(habit.id)}
                      disabled={restoreMutation.isPending}
                      className="p-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-lg transition cursor-pointer"
                      title="Pulihkan"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => setDeletingHabit(habit)}
                    disabled={deleteMutation.isPending}
                    className="p-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition cursor-pointer"
                    title="Hapus Permanen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Buat & Edit Kebiasaan */}
      <HabitFormModal
        isOpen={isCreateModalOpen || Boolean(editingHabit)}
        initialHabit={editingHabit}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingHabit(null);
        }}
        onSubmitSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['habits'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
        }}
        categories={categories}
      />

      {/* Custom Professional Delete Confirmation Modal */}
      {deletingHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl sm:rounded-3xl bg-white dark:bg-[#111a16] border border-rose-100 dark:border-rose-950/60 p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setDeletingHabit(null)}
              disabled={deleteMutation.isPending}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Warning Icon Badge */}
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200/60 dark:border-rose-900/50 shadow-inner">
              <AlertTriangle className="w-6 h-6" />
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Hapus Kebiasaan?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Apakah kamu yakin ingin menghapus kebiasaan{' '}
                <strong className="text-slate-900 dark:text-white font-semibold">
                  &ldquo;{deletingHabit.name}&rdquo;
                </strong>
                ? Seluruh riwayat penyelesaian, checklist, dan streak terkait kebiasaan ini akan dihapus secara permanen.
              </p>
            </div>

            {/* Callout Notice */}
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <span className="shrink-0 text-base leading-none">⚠️</span>
              <span>
                Tindakan ini tidak dapat dibatalkan. Jika hanya ingin rehat sementara, kamu bisa memilih opsi <strong>Arsipkan</strong>.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingHabit(null)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(deletingHabit.id)}
                disabled={deleteMutation.isPending}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-600/20 transition active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {deleteMutation.isPending ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus Permanen</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
