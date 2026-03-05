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

const foodSchema = new mongoose.Schema(
  {
    barcode: {
      type: String,
      index: true,
      unique: true,
      sparse: true,
    },
    name: { type: String, required: true },
    brand: { type: String, default: '' },
    servingSize: { type: Number, default: 100 },
    servingUnit: { type: String, default: 'g' },
    nutritionPer100g: nutritionSchema,
    nutritionPerServing: nutritionSchema,
    ingredients: { type: String, default: '' },
    allergens: [String],
    imageUrl: { type: String, default: null },
    source: {
      type: String,
      enum: ['openfoodfacts', 'usda', 'manual'],
      default: 'manual',
    },
  },
  { timestamps: true }
);

foodSchema.index({ name: 'text', brand: 'text' });

const Food = mongoose.model('Food', foodSchema);
export default Food;
