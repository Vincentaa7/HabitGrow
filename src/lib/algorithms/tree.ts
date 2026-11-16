// src/lib/algorithms/tree.ts
import { TreeStage } from '@/types/database';

export interface TreeThreshold {
  stage: TreeStage;
  minScore: number;
  maxScore: number;
  minActiveDays: number;
  displayName: string;
  description: string;
}

/**
 * Centralized Tree Growth thresholds per PRD Section 27 & 94 + Progression Gate:
 * - 0–19%   Seed         (Min. 0 hari aktif)
 * - 20–39%  Sprout       (Min. 1 hari aktif menyelesaikan habit)
 * - 40–59%  Young Tree   (Min. 3 hari aktif menyelesaikan habit)
 * - 60–79%  Healthy Tree (Min. 7 hari aktif menyelesaikan habit)
 * - 80–100% Mature Tree  (Min. 14 hari aktif menyelesaikan habit)
 */
export const TREE_STAGES: TreeThreshold[] = [
  {
    stage: 'Seed',
    minScore: 0,
    maxScore: 19.99,
    minActiveDays: 0,
    displayName: 'Benih',
    description: 'Benih tertanam di tanah yang subur, menunggu sentuhan kebiasaan konsistenmu.',
  },
  {
    stage: 'Sprout',
    minScore: 20,
    maxScore: 39.99,
    minActiveDays: 1,
    displayName: 'Tunas Baru',
    description: 'Batang kecil dengan daun muda mulai bertunas menyambut konsistensi harian.',
  },
  {
    stage: 'Young Tree',
    minScore: 40,
    maxScore: 59.99,
    minActiveDays: 3,
    displayName: 'Pohon Muda',
    description: 'Batang mulai menguat dan cabang-cabang baru mulai bermekaran dengan dedaunan hijau.',
  },
  {
    stage: 'Healthy Tree',
    minScore: 60,
    maxScore: 79.99,
    minActiveDays: 7,
    displayName: 'Pohon Sehat',
    description: 'Pohon rimbun dan tegak kokoh dengan tajuk daun yang lebat mencerminkan kedisiplinanmu.',
  },
  {
    stage: 'Mature Tree',
    minScore: 80,
    maxScore: 100,
    minActiveDays: 14,
    displayName: 'Pohon Dewasa',
    description: 'Pohon agung berbunga dan berbuah lebat, mahakarya dari konsistensi luar biasamu!',
  },
];

/**
 * Determines the virtual tree stage based on rolling 30-day consistency score
 * AND minimum active completed days (Progression Gate) so brand-new users grow
 * progressively from Seed -> Sprout -> Young Tree -> Healthy Tree -> Mature Tree,
 * while still shrinking immediately if 30-day consistency drops.
 */
export function calculateTreeStage(
  consistencyScore: number,
  activeCompletedDays: number = 14
): TreeStage {
  const safeScore = Math.max(0, Math.min(100, Number(consistencyScore) || 0));
  const safeActiveDays = Math.max(0, Math.floor(Number(activeCompletedDays) ?? 14));

  let matchedStage: TreeStage = 'Seed';

  for (const item of TREE_STAGES) {
    if (safeScore >= item.minScore && safeActiveDays >= item.minActiveDays) {
      matchedStage = item.stage;
    }
  }

  return matchedStage;
}

export function calculateTreeHealth(consistencyScore: number): number {
  const safeScore = Math.max(0, Math.min(100, Number(consistencyScore) || 0));
  // Health is directly proportional to consistency, minimum 20% health so it never completely vanishes unless 0
  return Math.round(safeScore);
}
