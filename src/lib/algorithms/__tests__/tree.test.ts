// src/lib/algorithms/__tests__/tree.test.ts
import { describe, it, expect } from 'vitest';
import { calculateTreeStage, calculateTreeHealth } from '../tree';

describe('calculateTreeStage Algorithm', () => {
  it('maps 0-19 to Seed', () => {
    expect(calculateTreeStage(0)).toBe('Seed');
    expect(calculateTreeStage(10)).toBe('Seed');
    expect(calculateTreeStage(19.9)).toBe('Seed');
  });

  it('maps 20-39 to Sprout', () => {
    expect(calculateTreeStage(20)).toBe('Sprout');
    expect(calculateTreeStage(35)).toBe('Sprout');
  });

  it('maps 40-59 to Young Tree', () => {
    expect(calculateTreeStage(40)).toBe('Young Tree');
    expect(calculateTreeStage(55)).toBe('Young Tree');
  });

  it('maps 60-79 to Healthy Tree (PRD Section 94)', () => {
    expect(calculateTreeStage(65)).toBe('Healthy Tree');
  });

  it('maps 80-100 to Mature Tree (PRD Section 94)', () => {
    expect(calculateTreeStage(85)).toBe('Mature Tree');
    expect(calculateTreeStage(100)).toBe('Mature Tree');
  });

  it('enforces progression gate (minimum active completed days) on early days', () => {
    // Day 1-2 with 100% consistency -> capped at Sprout
    expect(calculateTreeStage(100, 1)).toBe('Sprout');
    expect(calculateTreeStage(100, 2)).toBe('Sprout');
    // Day 3-6 with 100% consistency -> capped at Young Tree
    expect(calculateTreeStage(100, 3)).toBe('Young Tree');
    expect(calculateTreeStage(100, 6)).toBe('Young Tree');
    // Day 7-13 with 100% consistency -> capped at Healthy Tree
    expect(calculateTreeStage(100, 7)).toBe('Healthy Tree');
    expect(calculateTreeStage(100, 13)).toBe('Healthy Tree');
    // Day 14+ with 85%+ consistency -> reaches Mature Tree
    expect(calculateTreeStage(100, 14)).toBe('Mature Tree');
    // Still shrinks immediately if consistency score drops even after 20+ active days
    expect(calculateTreeStage(50, 20)).toBe('Young Tree');
  });

  it('calculates health score within bounds', () => {
    expect(calculateTreeHealth(87.4)).toBe(87);
    expect(calculateTreeHealth(0)).toBe(0);
    expect(calculateTreeHealth(105)).toBe(100);
  });
});
