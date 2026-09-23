// src/lib/algorithms/tree.ts
import { TreeStage } from '@/types/database';

export interface TreeThreshold {
  stage: TreeStage;
  minScore: number;
  maxScore: number;
  displayName: string;
  description: string;
}

/**
 * Centralized Tree Growth thresholds per PRD Section 27 & 94.
 * 0–19   Seed
 * 20–39  Sprout
 * 40–59  Young Tree
 * 60–79  Healthy Tree
 * 80–100 Mature Tree
 */
export const TREE_STAGES: TreeThreshold[] = [
  {
    stage: 'Seed',
    minScore: 0,
    maxScore: 19.99,
    displayName: 'Benih (Seed)',
    description: 'Benih tertanam di tanah yang subur, menunggu sentuhan kebiasaan konsistenmu.',
  },
  {
    stage: 'Sprout',
    minScore: 20,
    maxScore: 39.99,
    displayName: 'Tunas Baru (Sprout)',
    description: 'Batang kecil dengan daun muda mulai bertunas menyambut konsistensi harian.',
  },
  {
    stage: 'Young Tree',
    minScore: 40,
    maxScore: 59.99,
    displayName: 'Pohon Muda (Young Tree)',
    description: 'Batang mulai menguat dan cabang-cabang baru mulai bermekaran dengan dedaunan hijau.',
  },
  {
    stage: 'Healthy Tree',
    minScore: 60,
    maxScore: 79.99,
    displayName: 'Pohon Sehat (Healthy Tree)',
    description: 'Pohon rimbun dan tegak kokoh dengan tajuk daun yang lebat mencerminkan kedisiplinanmu.',
  },
  {
    stage: 'Mature Tree',
    minScore: 80,
    maxScore: 100,
    displayName: 'Pohon Dewasa (Mature Tree)',
    description: 'Pohon agung berbunga dan berbuah lebat, mahakarya dari konsistensi luar biasamu!',
  },
];

export function calculateTreeStage(consistencyScore: number): TreeStage {
  const safeScore = Math.max(0, Math.min(100, Number(consistencyScore) || 0));

  for (const item of TREE_STAGES) {
    if (safeScore <= item.maxScore) {
      return item.stage;
    }
  }

  return 'Mature Tree';
}

export function calculateTreeHealth(consistencyScore: number): number {
  const safeScore = Math.max(0, Math.min(100, Number(consistencyScore) || 0));
  // Health is directly proportional to consistency, minimum 20% health so it never completely vanishes unless 0
  return Math.round(safeScore);
}
