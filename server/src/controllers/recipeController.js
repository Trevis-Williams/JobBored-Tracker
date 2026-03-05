import SavedRecipe from '../models/SavedRecipe.js';

export async function createRecipe(req, res) {
  const { name, ingredientsText, servings, totalNutrition, perServing } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Recipe name is required' });
  }

  const recipe = await SavedRecipe.create({
    userId: req.userId,
    name,
    ingredientsText,
    servings: servings || 4,
    totalNutrition,
    perServing,
  });

  res.status(201).json(recipe);
}

export async function getRecipes(req, res) {
  const recipes = await SavedRecipe.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(recipes);
}

export async function getRecipeById(req, res) {
  const recipe = await SavedRecipe.findOne({ _id: req.params.id, userId: req.userId });
  if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
  res.json(recipe);
}

export async function deleteRecipe(req, res) {
  const recipe = await SavedRecipe.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
  res.json({ message: 'Recipe deleted' });
}
