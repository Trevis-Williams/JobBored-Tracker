import { z } from 'zod';

export const createExerciseLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  exercises: z.array(z.object({
    name: z.string().min(1).max(200),
    durationMinutes: z.number().min(0).max(1440),
    caloriesBurned: z.number().min(0).max(50000),
  })).min(1).max(50),
  totalCaloriesBurned: z.number().min(0).max(100000),
});

export const exerciseDateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
});

export const exerciseRangeSchema = z.object({
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'start must be YYYY-MM-DD'),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'end must be YYYY-MM-DD'),
});

export const createSavedWorkoutSchema = z.object({
  name: z.string().min(1, 'Workout name is required').max(200),
  exercisesText: z.string().max(5000).optional(),
  totalCaloriesBurned: z.number().min(0).max(100000).optional(),
});
