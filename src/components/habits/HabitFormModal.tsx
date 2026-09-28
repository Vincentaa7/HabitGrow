// src/components/habits/HabitFormModal.tsx
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { habitCreateSchema, HabitCreateInput } from '@/lib/validators/habit.schema';
import { Habit, HabitCategory } from '@/types/database';
import { toDateString } from '@/lib/algorithms/schedule';
import { X, Sparkles, Dumbbell, BookOpen, Heart, Briefcase, Smile, Zap, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HabitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  categories: HabitCategory[];
  initialHabit?: Habit | null;
}

const ICONS = [
  { id: 'sparkles', icon: Sparkles, label: 'Umum' },
  { id: 'book-open', icon: BookOpen, label: 'Belajar' },
  { id: 'dumbbell', icon: Dumbbell, label: 'Olahraga' },
  { id: 'heart', icon: Heart, label: 'Kesehatan' },
  { id: 'briefcase', icon: Briefcase, label: 'Kerja' },
  { id: 'smile', icon: Smile, label: 'Diri' },
  { id: 'zap', icon: Zap, label: 'Energi' },
];

const COLORS = [
  { hex: '#10b981', name: 'Emerald' },
  { hex: '#3b82f6', name: 'Biru' },
  { hex: '#8b5cf6', name: 'Ungu' },
  { hex: '#f59e0b', name: 'Kuning' },
  { hex: '#ef4444', name: 'Merah' },
  { hex: '#ec4899', name: 'Pink' },
  { hex: '#14b8a6', name: 'Teal' },
];

const DAYS_OF_WEEK = [
  { day: 1, label: 'Sen' },
  { day: 2, label: 'Sel' },
  { day: 3, label: 'Rab' },
  { day: 4, label: 'Kam' },
  { day: 5, label: 'Jum' },
  { day: 6, label: 'Sab' },
  { day: 0, label: 'Min' },
];

const DIFFICULTY_OPTIONS = [
  { id: 'EASY', label: 'Mudah', sub: '+10 XP', color: 'text-emerald-600 dark:text-emerald-400', activeBg: 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-400' },
  { id: 'MEDIUM', label: 'Sedang', sub: '+15 XP', color: 'text-amber-600 dark:text-amber-400', activeBg: 'bg-amber-50 dark:bg-amber-950/70 border-amber-400' },
  { id: 'HARD', label: 'Tantangan', sub: '+20 XP', color: 'text-red-600 dark:text-red-400', activeBg: 'bg-red-50 dark:bg-red-950/70 border-red-400' },
];

const FREQUENCY_OPTIONS = [
  { id: 'DAILY', label: 'Setiap Hari', icon: '📅' },
  { id: 'SELECTED_DAYS', label: 'Hari Tertentu', icon: '🗓️' },
  { id: 'WEEKLY_TARGET', label: 'Target Mingguan', icon: '📊' },
];

// Reusable label component
function FormLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
      {children}
    </span>
  );
}

export function HabitFormModal({
  isOpen,
  onClose,
  onSubmitSuccess,
  categories,
  initialHabit,
}: HabitFormModalProps) {
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(habitCreateSchema),
    defaultValues: {
      name: '',
      description: '',
      category_id: categories[0]?.id || null,
      icon: 'sparkles',
      color: '#10b981',
      difficulty: 'MEDIUM',
      frequency_type: 'DAILY',
      target_value: 1,
      target_unit: 'kali',
      start_date: toDateString(new Date()),
      selected_days: [1, 2, 3, 4, 5],
    },
  });

  // Pre-fill form when editing an existing habit
  React.useEffect(() => {
    if (initialHabit && isOpen) {
      const habitSchedules =
        (initialHabit as any).schedules?.map((s: any) => s.day_of_week) ??
        (initialHabit as any).habit_schedules?.map((s: any) => s.day_of_week) ??
        [1, 2, 3, 4, 5];
      setSelectedDays(habitSchedules);

      reset({
        name: initialHabit.name || '',
        description: initialHabit.description || '',
        category_id: initialHabit.category_id || categories[0]?.id || null,
        icon: initialHabit.icon || 'sparkles',
        color: initialHabit.color || '#10b981',
        difficulty: initialHabit.difficulty || 'MEDIUM',
        frequency_type: initialHabit.frequency_type || 'DAILY',
        target_value: Number(initialHabit.target_value) || 1,
        target_unit: initialHabit.target_unit || 'kali',
        start_date: initialHabit.start_date || toDateString(new Date()),
        selected_days: habitSchedules,
      });
    } else if (isOpen) {
      setSelectedDays([1, 2, 3, 4, 5]);
      reset({
        name: '',
        description: '',
        category_id: categories[0]?.id || null,
        icon: 'sparkles',
        color: '#10b981',
        difficulty: 'MEDIUM',
        frequency_type: 'DAILY',
        target_value: 1,
        target_unit: 'kali',
        start_date: toDateString(new Date()),
        selected_days: [1, 2, 3, 4, 5],
      });
    }
  }, [initialHabit, isOpen, reset, categories]);

  const frequencyType = watch('frequency_type');
  const selectedIcon = watch('icon');
  const selectedColor = watch('color');
  const selectedCategoryId = watch('category_id');
  const selectedDifficulty = watch('difficulty');

  if (!isOpen) return null;

  const toggleDay = (day: number) => {
    let updated: number[];
    if (selectedDays.includes(day)) {
      updated = selectedDays.filter((d) => d !== day);
    } else {
      updated = [...selectedDays, day];
    }
    setSelectedDays(updated);
    setValue('selected_days', updated);
  };

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      setServerError(null);

      const url = initialHabit ? `/api/habits/${initialHabit.id}` : '/api/habits';
      const method = initialHabit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          selected_days: data.frequency_type === 'SELECTED_DAYS' ? selectedDays : undefined,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error?.message || 'Gagal menyimpan kebiasaan');
      }

      reset();
      onSubmitSuccess();
      onClose();
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#111a16] border border-slate-100 dark:border-[#1e2e26] shadow-2xl">

        {/* Sticky Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[#1e2e26] bg-white/95 dark:bg-[#111a16]/95 backdrop-blur-sm rounded-t-2xl">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 text-lg shadow-sm">
              {initialHabit ? '✏️' : '🌱'}
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {initialHabit ? 'Edit Kebiasaan' : 'Buat Kebiasaan Baru'}
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {initialHabit
                  ? 'Perbarui target, jadwal, atau detail kebiasaanmu'
                  : 'Tanam kebiasaan dan rawat pohon virtualmu'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">

          {/* Server Error */}
          {serverError && (
            <div className="p-3 text-xs text-red-700 bg-red-50 dark:bg-red-950/50 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-900">
              {serverError}
            </div>
          )}

          {/* Name */}
          <div>
            <FormLabel>Nama Kebiasaan *</FormLabel>
            <input
              type="text"
              placeholder="Misal: Belajar Coding, Minum Air 2L, Baca Buku"
              {...register('name')}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#1e2e26] bg-slate-50 dark:bg-[#0d1612] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60 transition"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <FormLabel>Deskripsi / Motivasi</FormLabel>
            <textarea
              rows={2}
              placeholder="Kenapa kebiasaan ini berharga bagimu?"
              {...register('description')}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#1e2e26] bg-slate-50 dark:bg-[#0d1612] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60 transition resize-none"
            />
          </div>

          {/* Category — Custom button grid */}
          <div>
            <FormLabel>Kategori</FormLabel>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setValue('category_id', c.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all',
                    selectedCategoryId === c.id
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                      : 'border-slate-200 dark:border-[#1e2e26] text-slate-600 dark:text-slate-400 hover:border-emerald-400 dark:hover:border-emerald-700 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-50 dark:bg-[#0d1612]'
                  )}
                >
                  {selectedCategoryId === c.id && <Check className="w-3 h-3" />}
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty — Custom segmented control */}
          <div>
            <FormLabel>Tingkat Kesulitan</FormLabel>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTY_OPTIONS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setValue('difficulty', d.id as any)}
                  className={cn(
                    'flex flex-col items-center gap-0.5 py-2.5 px-3 rounded-xl border text-center transition-all',
                    selectedDifficulty === d.id
                      ? `${d.activeBg} shadow-sm`
                      : 'border-slate-200 dark:border-[#1e2e26] bg-slate-50 dark:bg-[#0d1612] hover:border-slate-300 dark:hover:border-slate-600'
                  )}
                >
                  <span className={cn('text-xs font-bold', selectedDifficulty === d.id ? d.color : 'text-slate-600 dark:text-slate-400')}>
                    {d.label}
                  </span>
                  <span className={cn('text-[10px] font-medium', selectedDifficulty === d.id ? d.color : 'text-slate-400')}>
                    {d.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Frequency Type */}
          <div>
            <FormLabel>Frekuensi Jadwal</FormLabel>
            <div className="grid grid-cols-3 gap-2">
              {FREQUENCY_OPTIONS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setValue('frequency_type', f.id as any)}
                  className={cn(
                    'flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border text-center transition-all',
                    frequencyType === f.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/70 shadow-sm'
                      : 'border-slate-200 dark:border-[#1e2e26] bg-slate-50 dark:bg-[#0d1612] hover:border-slate-300 dark:hover:border-slate-600'
                  )}
                >
                  <span className="text-base leading-none">{f.icon}</span>
                  <span className={cn('text-[11px] font-semibold leading-tight', frequencyType === f.id ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400')}>
                    {f.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* If SELECTED_DAYS: Day Buttons */}
          {frequencyType === 'SELECTED_DAYS' && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0d1612] border border-slate-200 dark:border-[#1e2e26]">
              <FormLabel>Pilih hari pelaksanaan</FormLabel>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((d) => {
                  const isSelected = selectedDays.includes(d.day);
                  return (
                    <button
                      key={d.day}
                      type="button"
                      onClick={() => toggleDay(d.day)}
                      className={cn(
                        'w-10 h-10 text-xs font-bold rounded-xl border transition-all',
                        isSelected
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm scale-105'
                          : 'bg-white dark:bg-[#111a16] border-slate-200 dark:border-[#1e2e26] text-slate-600 dark:text-slate-400 hover:border-emerald-400 hover:text-emerald-600'
                      )}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Target Value & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormLabel>Target Harian</FormLabel>
              <input
                type="number"
                min="1"
                step="1"
                {...register('target_value', { valueAsNumber: true })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#1e2e26] bg-slate-50 dark:bg-[#0d1612] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60 transition"
              />
              {/* Quick Preset Numbers 1 to 5 */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[10px] text-slate-400 font-semibold mr-0.5">Pilihan Cepat:</span>
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setValue('target_value', num, { shouldValidate: true })}
                    className={cn(
                      'w-7 h-7 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center justify-center',
                      watch('target_value') === num
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-[#111a16] border-slate-200 dark:border-[#1e2e26] text-slate-600 dark:text-slate-400 hover:border-emerald-400 hover:text-emerald-600'
                    )}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <FormLabel>Satuan</FormLabel>
              <input
                type="text"
                placeholder="kali, menit, halaman"
                {...register('target_unit')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#1e2e26] bg-slate-50 dark:bg-[#0d1612] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60 transition"
              />
              {/* Quick Preset Unit Chips */}
              <div className="flex items-center gap-1 mt-2 flex-wrap">
                {['kali', 'menit', 'halaman', 'jam', 'liter', 'ml', 'gelas', 'bab'].map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => setValue('target_unit', unit, { shouldValidate: true })}
                    className={cn(
                      'px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-all cursor-pointer',
                      watch('target_unit') === unit
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-[#111a16] border-slate-200 dark:border-[#1e2e26] text-slate-600 dark:text-slate-400 hover:border-emerald-400 hover:text-emerald-600'
                    )}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Icon & Color Selector */}
          <div>
            <FormLabel>Ikon & Aksen Warna</FormLabel>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0d1612] border border-slate-200 dark:border-[#1e2e26] space-y-3">
              {/* Icons row */}
              <div className="flex items-center gap-2 flex-wrap">
                {ICONS.map((item) => {
                  const IconComp = item.icon;
                  const isSelected = selectedIcon === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setValue('icon', item.id)}
                      title={item.label}
                      className={cn(
                        'w-9 h-9 flex items-center justify-center rounded-xl border transition-all',
                        isSelected
                          ? 'border-emerald-500 bg-white dark:bg-[#111a16] shadow-sm scale-110'
                          : 'border-slate-200 dark:border-[#1e2e26] bg-white dark:bg-[#111a16] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-300'
                      )}
                    >
                      <IconComp
                        className={cn(
                          'w-4 h-4',
                          isSelected ? 'text-emerald-600 dark:text-emerald-400' : ''
                        )}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Colors row */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {COLORS.map((c) => {
                  const isSelected = selectedColor === c.hex;
                  return (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setValue('color', c.hex)}
                      title={c.name}
                      className={cn(
                        'w-7 h-7 rounded-full border-2 transition-all',
                        isSelected
                          ? 'scale-125 border-white dark:border-[#111a16] shadow-lg ring-2 ring-offset-1 dark:ring-offset-[#0d1612]'
                          : 'border-transparent hover:scale-110 opacity-80 hover:opacity-100'
                      )}
                      style={{
                        backgroundColor: c.hex,
                        boxShadow: isSelected ? `0 0 0 2px ${c.hex}` : undefined,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-[#1e2e26]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/20 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>{initialHabit ? 'Simpan Perubahan ✨' : 'Tanam Kebiasaan 🌱'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
