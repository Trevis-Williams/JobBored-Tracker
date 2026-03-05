import { z } from 'zod';

const nutritionObj = z.object({
  calories: z.number().min(0).max(50000).optional(),
  protein: z.number().min(0).max(5000).optional(),
  carbs: z.number().min(0).max(5000).optional(),
  fat: z.number().min(0).max(5000).optional(),
  fiber: z.number().min(0).max(1000).optional(),
  sugar: z.number().min(0).max(5000).optional(),
  sodium: z.number().min(0).max(100000).optional(),
}).optional();

export const createFoodSchema = z.object({
  name: z.string().min(1, 'Name is required').max(500),
  brand: z.string().max(500).optional(),
  servingSize: z.number().min(0).max(10000).optional(),
  servingUnit: z.string().max(50).optional(),
  nutritionPer100g: nutritionObj,
  nutritionPerServing: nutritionObj,
  ingredients: z.string().max(5000).optional(),
  allergens: z.array(z.string().max(100)).max(50).optional(),
  imageUrl: z.string().url().nullable().optional(),
}).strict();

export const batchSearchSchema = z.object({
  ingredients: z
    .array(z.string().max(200))
    .min(1, 'At least one ingredient required')
    .max(50, 'Maximum 50 ingredients'),
});

export const barcodeParamSchema = z.object({
  code: z.string().min(1).max(20).regex(/^[a-zA-Z0-9]+$/, 'Invalid barcode format'),
});

export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Query is required').max(200),
});
