import { Router } from 'express';
import protect from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createRecipeSchema } from '../schemas/recipe.js';
import {
  createRecipe,
  getRecipes,
  getRecipeById,
  deleteRecipe,
} from '../controllers/recipeController.js';

const router = Router();

router.post('/', protect, validate(createRecipeSchema), createRecipe);
router.get('/', protect, getRecipes);
router.get('/:id', protect, getRecipeById);
router.delete('/:id', protect, deleteRecipe);

export default router;
