// src/lib/validators/habit.schema.ts
import { z } from 'zod';

export const habitCreateSchema = z.object({
  name: z.string().min(1, 'Nama kebiasaan wajib diisi').max(100, 'Maksimal 100 karakter'),
  description: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  icon: z.string().default('sparkles'),
  color: z.string().default('#10b981'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  frequency_type: z.enum(['DAILY', 'SELECTED_DAYS', 'WEEKLY_TARGET']),
  target_value: z.coerce.number().positive('Target harus lebih besar dari 0').default(1),
  target_unit: z.string().min(1).default('times'),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD').optional().nullable(),
  reminder_time: z.string().optional().nullable(),
  selected_days: z.array(z.number().int().min(0).max(6)).optional(),
});

export const habitUpdateSchema = habitCreateSchema.partial().extend({
  is_active: z.boolean().optional(),
  is_archived: z.boolean().optional(),
});

export type HabitCreateInput = z.infer<typeof habitCreateSchema>;
export type HabitUpdateInput = z.infer<typeof habitUpdateSchema>;
