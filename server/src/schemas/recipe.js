import { z } from 'zod';

export const createRecipeSchema = z.object({
  name: z.string().min(1, 'Recipe name is required').max(200),
  ingredientsText: z.string().max(5000).optional(),
  servings: z.number().int().min(1).max(100).optional(),
  totalNutrition: z
    .object({
      calories: z.number().min(0).optional(),
      protein: z.number().min(0).optional(),
      carbs: z.number().min(0).optional(),
      fat: z.number().min(0).optional(),
      fiber: z.number().min(0).optional(),
      sugar: z.number().min(0).optional(),
      sodium: z.number().min(0).optional(),
    })
    .optional(),
  perServing: z
    .object({
      calories: z.number().min(0).optional(),
      protein: z.number().min(0).optional(),
      carbs: z.number().min(0).optional(),
      fat: z.number().min(0).optional(),
      fiber: z.number().min(0).optional(),
      sugar: z.number().min(0).optional(),
      sodium: z.number().min(0).optional(),
    })
    .optional(),
});
