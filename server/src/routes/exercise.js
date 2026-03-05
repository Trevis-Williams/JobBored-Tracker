import { Router } from 'express';
import protect from '../middleware/auth.js';
import validate, { validateQuery } from '../middleware/validate.js';
import {
  createExerciseLogSchema,
  exerciseDateSchema,
  exerciseRangeSchema,
  createSavedWorkoutSchema,
} from '../schemas/exercise.js';
import {
  createExerciseLog,
  getExercisesByDate,
  getExercisesByRange,
  deleteExerciseLog,
  createSavedWorkout,
  getSavedWorkouts,
  deleteSavedWorkout,
} from '../controllers/exerciseController.js';

const router = Router();

router.post('/', protect, validate(createExerciseLogSchema), createExerciseLog);
router.get('/', protect, validateQuery(exerciseDateSchema), getExercisesByDate);
router.get('/range', protect, validateQuery(exerciseRangeSchema), getExercisesByRange);
router.delete('/:id', protect, deleteExerciseLog);

router.post('/saved', protect, validate(createSavedWorkoutSchema), createSavedWorkout);
router.get('/saved', protect, getSavedWorkouts);
router.delete('/saved/:id', protect, deleteSavedWorkout);

export default router;
