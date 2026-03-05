import mongoose from 'mongoose';

const foodLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      required: true,
    },
    date: { type: Date, required: true },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true,
    },
    servings: { type: Number, required: true, default: 1 },
    nutrition: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      fiber: { type: Number, default: 0 },
      sugar: { type: Number, default: 0 },
      sodium: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

foodLogSchema.index({ userId: 1, date: 1 });

const FoodLog = mongoose.model('FoodLog', foodLogSchema);
export default FoodLog;
