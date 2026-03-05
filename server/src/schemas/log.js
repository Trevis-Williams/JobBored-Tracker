import { z } from 'zod';

export const createLogSchema = z.object({
  foodId: z.string().min(1, 'foodId is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  servings: z.number().min(0.25).max(100).optional(),
});

export const dateQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
});

export const rangeQuerySchema = z.object({
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'start must be YYYY-MM-DD'),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'end must be YYYY-MM-DD'),
});
