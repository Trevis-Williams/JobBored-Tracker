import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import protect from '../middleware/auth.js';
import validate, { validateQuery, validateParams } from '../middleware/validate.js';
import { createFoodSchema, batchSearchSchema, barcodeParamSchema, searchQuerySchema } from '../schemas/food.js';
import {
  getByBarcode,
  search,
  getById,
  createManual,
  batchSearch,
} from '../controllers/foodController.js';

const batchLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: { message: 'Too many recipe lookups, try again later' } });
const router = Router();

router.get('/barcode/:code', protect, validateParams(barcodeParamSchema), getByBarcode);
router.get('/search', protect, validateQuery(searchQuerySchema), search);
router.post('/batch-search', protect, batchLimiter, validate(batchSearchSchema), batchSearch);
router.get('/:id', protect, getById);
router.post('/', protect, validate(createFoodSchema), createManual);

export default router;
