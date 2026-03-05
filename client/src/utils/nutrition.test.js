import { describe, it, expect } from 'vitest';
import { totalNutrition, pct, formatDate, todayISO, groupByMeal } from './nutrition';

describe('totalNutrition', () => {
  it('sums nutrition from logs', () => {
    const logs = [
      { nutrition: { calories: 300, protein: 20, carbs: 40, fat: 10, fiber: 3, sugar: 5, sodium: 200 } },
      { nutrition: { calories: 500, protein: 30, carbs: 60, fat: 20, fiber: 5, sugar: 10, sodium: 400 } },
    ];
    const result = totalNutrition(logs);
    expect(result.calories).toBe(800);
    expect(result.protein).toBe(50);
  });

  it('handles empty logs', () => {
    const result = totalNutrition([]);
    expect(result.calories).toBe(0);
  });

  it('handles missing nutrition fields', () => {
    const logs = [{ nutrition: { calories: 100 } }, {}];
    const result = totalNutrition(logs);
    expect(result.calories).toBe(100);
  });
});

describe('pct', () => {
  it('calculates percentage', () => {
    expect(pct(50, 100)).toBe(50);
  });

  it('caps at 100', () => {
    expect(pct(150, 100)).toBe(100);
  });

  it('returns 0 for zero goal', () => {
    expect(pct(50, 0)).toBe(0);
  });
});

describe('todayISO', () => {
  it('returns YYYY-MM-DD format', () => {
    const result = todayISO();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('matches local date', () => {
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(todayISO()).toBe(expected);
  });
});

describe('formatDate', () => {
  it('formats a date string', () => {
    const result = formatDate('2026-03-05');
    expect(result).toContain('Mar');
    expect(result).toContain('5');
  });
});

describe('groupByMeal', () => {
  it('groups logs by meal type', () => {
    const logs = [
      { mealType: 'breakfast' },
      { mealType: 'lunch' },
      { mealType: 'breakfast' },
      { mealType: 'snack' },
    ];
    const groups = groupByMeal(logs);
    expect(groups.breakfast.length).toBe(2);
    expect(groups.lunch.length).toBe(1);
    expect(groups.dinner.length).toBe(0);
    expect(groups.snack.length).toBe(1);
  });
});
