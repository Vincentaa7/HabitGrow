// src/lib/validators/completion.schema.ts
import { z } from 'zod';

export const habitCompletionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD').optional(),
  value: z.number().positive().default(1),
  note: z.string().max(300, 'Catatan maksimal 300 karakter').optional().nullable(),
});

export type HabitCompletionInput = z.infer<typeof habitCompletionSchema>;
