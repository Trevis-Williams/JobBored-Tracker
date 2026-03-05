import { describe, it, expect } from 'vitest';
import {
  parseIngredientLine,
  parseRecipeText,
  calculateIngredientNutrition,
  sumNutrition,
  divideNutrition,
} from './parseIngredients';

describe('parseIngredientLine', () => {
  it('parses a simple ingredient with unit', () => {
    const r = parseIngredientLine('1/2 cup all-purpose flour');
    expect(r.qty).toBe(0.5);
    expect(r.unit).toBe('cup');
    expect(r.name).toBe('all-purpose flour');
    expect(r.skipped).toBe(false);
  });

  it('parses tablespoon abbreviation', () => {
    const r = parseIngredientLine('2 Tbsp. tomato paste');
    expect(r.qty).toBe(2);
    expect(r.unit).toBe('tbsp');
    expect(r.name).toBe('tomato paste');
  });

  it('parses whole number without unit', () => {
    const r = parseIngredientLine('4 garlic cloves');
    expect(r.qty).toBe(4);
    expect(r.name).toContain('garlic');
  });

  it('skips "to taste" ingredients', () => {
    const r = parseIngredientLine('Kosher salt, to taste');
    expect(r.skipped).toBe(true);
  });

  it('skips "for serving" ingredients', () => {
    const r = parseIngredientLine('Flat leaf parsley, finely chopped, for serving');
    expect(r.skipped).toBe(true);
  });

  it('strips prep instructions after commas', () => {
    const r = parseIngredientLine('1/2 small yellow onion, finely diced');
    expect(r.name).not.toContain('diced');
  });

  it('handles mixed numbers', () => {
    const r = parseIngredientLine('1 1/2 cups sugar');
    expect(r.qty).toBe(1.5);
    expect(r.unit).toBe('cup');
  });

  it('strips parenthetical descriptions', () => {
    const r = parseIngredientLine('4 (9- to 10-oz.) boneless skinless chicken breasts');
    expect(r.name).toContain('chicken');
    expect(r.name).not.toContain('9-');
  });

  it('returns null for empty lines', () => {
    expect(parseIngredientLine('')).toBeNull();
  });

  it('calculates grams using density overrides', () => {
    const r = parseIngredientLine('1 cup all-purpose flour');
    expect(r.grams).toBe(125);
  });
});

describe('parseRecipeText', () => {
  it('parses multi-line recipe text', () => {
    const text = '1 cup flour\n2 Tbsp. butter\nSalt, to taste';
    const results = parseRecipeText(text);
    expect(results.length).toBe(3);
    expect(results[0].name).toBe('flour');
    expect(results[2].skipped).toBe(true);
  });

  it('skips empty lines', () => {
    const text = '1 cup flour\n\n2 cups sugar';
    const results = parseRecipeText(text);
    expect(results.length).toBe(2);
  });
});

describe('calculateIngredientNutrition', () => {
  const mockFood = {
    nutritionPer100g: {
      calories: 364,
      protein: 10,
      carbs: 76,
      fat: 1,
      fiber: 2.7,
      sugar: 0.3,
      sodium: 2,
    },
  };

  it('calculates nutrition based on grams', () => {
    const ingredient = { qty: 1, unit: 'cup', name: 'flour', grams: 125, skipped: false };
    const result = calculateIngredientNutrition(ingredient, mockFood);
    expect(result.calories).toBe(455);
    expect(result.protein).toBeGreaterThan(0);
  });

  it('returns zeros for skipped ingredients', () => {
    const ingredient = { qty: 0, unit: null, name: 'salt', grams: 0, skipped: true };
    const result = calculateIngredientNutrition(ingredient, mockFood);
    expect(result.calories).toBe(0);
  });

  it('returns zeros when no food match', () => {
    const ingredient = { qty: 1, unit: 'cup', name: 'xyz', grams: 240, skipped: false };
    const result = calculateIngredientNutrition(ingredient, null);
    expect(result.calories).toBe(0);
  });
});

describe('sumNutrition', () => {
  it('sums multiple nutrition objects', () => {
    const items = [
      { calories: 100, protein: 5, carbs: 20, fat: 3, fiber: 1, sugar: 2, sodium: 50 },
      { calories: 200, protein: 10, carbs: 30, fat: 5, fiber: 2, sugar: 3, sodium: 100 },
    ];
    const result = sumNutrition(items);
    expect(result.calories).toBe(300);
    expect(result.protein).toBe(15);
  });
});

describe('divideNutrition', () => {
  it('divides by serving count', () => {
    const total = { calories: 1000, protein: 40, carbs: 120, fat: 50, fiber: 10, sugar: 20, sodium: 500 };
    const result = divideNutrition(total, 4);
    expect(result.calories).toBe(250);
    expect(result.protein).toBe(10);
  });

  it('returns original values for 0 or negative servings', () => {
    const total = { calories: 500, protein: 20, carbs: 60, fat: 25, fiber: 5, sugar: 10, sodium: 250 };
    const result = divideNutrition(total, 0);
    expect(result.calories).toBe(500);
  });
});
