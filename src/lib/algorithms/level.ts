// src/lib/algorithms/level.ts

/**
 * Centralized Level XP Thresholds per PRD Section 24.
 * Level is determined from cumulative XP.
 */
export const LEVEL_THRESHOLDS = [
  { level: 1, minXp: 0, maxXp: 99 },
  { level: 2, minXp: 100, maxXp: 249 },
  { level: 3, minXp: 250, maxXp: 449 },
  { level: 4, minXp: 450, maxXp: 699 },
  { level: 5, minXp: 700, maxXp: 999 },
  { level: 6, minXp: 1000, maxXp: 1349 },
  { level: 7, minXp: 1350, maxXp: 1749 },
  { level: 8, minXp: 1750, maxXp: 2199 },
  { level: 9, minXp: 2200, maxXp: 2699 },
  { level: 10, minXp: 2700, maxXp: 3299 },
  { level: 11, minXp: 3300, maxXp: 3999 },
  { level: 12, minXp: 4000, maxXp: 4799 },
  { level: 13, minXp: 4800, maxXp: 5699 },
  { level: 14, minXp: 5700, maxXp: 6699 },
  { level: 15, minXp: 6700, maxXp: 7799 },
];

export interface LevelInfo {
  level: number;
  totalXp: number;
  currentLevelMinXp: number;
  nextLevelXp: number;
  xpInCurrentLevel: number;
  xpRequiredForNextLevel: number;
  progressPercentage: number;
}

export function calculateLevel(totalXp: number): LevelInfo {
  const safeXp = Math.max(0, Math.floor(totalXp));

  // Find corresponding tier
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    const tier = LEVEL_THRESHOLDS[i];
    if (safeXp <= tier.maxXp) {
      const nextTierMin = LEVEL_THRESHOLDS[i + 1]?.minXp ?? tier.maxXp + 1;
      const xpInCurrentLevel = safeXp - tier.minXp;
      const xpRequired = nextTierMin - tier.minXp;
      const progressPercentage = Math.min(100, Math.floor((xpInCurrentLevel / xpRequired) * 100));

      return {
        level: tier.level,
        totalXp: safeXp,
        currentLevelMinXp: tier.minXp,
        nextLevelXp: nextTierMin,
        xpInCurrentLevel,
        xpRequiredForNextLevel: xpRequired,
        progressPercentage,
      };
    }
  }

  // Beyond defined thresholds: formulaic scaling for high levels
  const lastTier = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const excessXp = safeXp - lastTier.minXp;
  const extraLevels = Math.floor(excessXp / 1000);
  const currentLevel = lastTier.level + extraLevels;
  const currentMin = lastTier.minXp + extraLevels * 1000;
  const nextMin = currentMin + 1000;
  const xpInLevel = safeXp - currentMin;

  return {
    level: currentLevel,
    totalXp: safeXp,
    currentLevelMinXp: currentMin,
    nextLevelXp: nextMin,
    xpInCurrentLevel: xpInLevel,
    xpRequiredForNextLevel: 1000,
    progressPercentage: Math.min(100, Math.floor((xpInLevel / 1000) * 100)),
  };
}
