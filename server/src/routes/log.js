import { Router } from 'express';
import protect from '../middleware/auth.js';
import validate, { validateQuery } from '../middleware/validate.js';
import { createLogSchema, dateQuerySchema, rangeQuerySchema } from '../schemas/log.js';
import {
  createLog,
  getLogsByDate,
  getLogsByRange,
  deleteLog,
} from '../controllers/logController.js';

const router = Router();

router.post('/', protect, validate(createLogSchema), createLog);
router.get('/', protect, validateQuery(dateQuerySchema), getLogsByDate);
router.get('/range', protect, validateQuery(rangeQuerySchema), getLogsByRange);
router.delete('/:id', protect, deleteLog);

export default router;
