import mongoose from 'mongoose';

const nutritionSchema = {
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  fiber: { type: Number, default: 0 },
  sugar: { type: Number, default: 0 },
  sodium: { type: Number, default: 0 },
};

const savedRecipeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    ingredientsText: { type: String, default: '' },
    servings: { type: Number, default: 4 },
    totalNutrition: nutritionSchema,
    perServing: nutritionSchema,
  },
  { timestamps: true }
);

const SavedRecipe = mongoose.model('SavedRecipe', savedRecipeSchema);
export default SavedRecipe;
