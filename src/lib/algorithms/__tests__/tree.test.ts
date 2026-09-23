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

  it('calculates health score within bounds', () => {
    expect(calculateTreeHealth(87.4)).toBe(87);
    expect(calculateTreeHealth(0)).toBe(0);
    expect(calculateTreeHealth(105)).toBe(100);
  });
});
