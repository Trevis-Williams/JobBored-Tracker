import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
});

export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const updateMeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  accountMode: z.enum(['simple', 'advanced']).optional(),
  weight: z.number().min(20).max(500).optional(),
  height: z.number().min(50).max(300).optional(),
  age: z.number().int().min(13).max(120).optional(),
  gender: z.enum(['male', 'female']).optional(),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']).optional(),
  unitSystem: z.enum(['imperial', 'metric']).optional(),
  dailyGoals: z
    .object({
      calories: z.number().min(500).max(10000).optional(),
      protein: z.number().min(0).max(1000).optional(),
      carbs: z.number().min(0).max(2000).optional(),
      fat: z.number().min(0).max(1000).optional(),
    })
    .optional(),
  notificationsEnabled: z.boolean().optional(),
  notificationTimes: z.array(z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM')).max(10).optional(),
}).strict();

export const onboardingSchema = z.object({
  weight: z.number().min(20, 'Weight is required').max(500),
  height: z.number().min(50, 'Height is required').max(300),
  age: z.number().int().min(13).max(120),
  gender: z.enum(['male', 'female']),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  unitSystem: z.enum(['imperial', 'metric']).optional(),
  accountMode: z.enum(['simple', 'advanced']).optional(),
  dailyGoals: z
    .object({
      calories: z.number().min(500).max(10000),
      protein: z.number().min(0).max(1000),
      carbs: z.number().min(0).max(2000),
      fat: z.number().min(0).max(1000),
    })
    .nullable()
    .optional(),
  autoCalculate: z.boolean().optional(),
});
