import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import protect from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createFoodSchema, batchSearchSchema } from '../schemas/food.js';
import {
  getByBarcode,
  search,
  getById,
  createManual,
  batchSearch,
} from '../controllers/foodController.js';

const batchLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: { message: 'Too many recipe lookups, try again later' } });
const router = Router();

router.get('/barcode/:code', protect, getByBarcode);
router.get('/search', protect, search);
router.post('/batch-search', protect, batchLimiter, validate(batchSearchSchema), batchSearch);
router.get('/:id', protect, getById);
router.post('/', protect, validate(createFoodSchema), createManual);

export default router;
