import mongoose from 'mongoose';

const exerciseLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: { type: Date, required: true },
    exercises: [
      {
        name: { type: String, required: true },
        durationMinutes: { type: Number, required: true },
        caloriesBurned: { type: Number, default: 0 },
      },
    ],
    totalCaloriesBurned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

exerciseLogSchema.index({ userId: 1, date: 1 });

const ExerciseLog = mongoose.model('ExerciseLog', exerciseLogSchema);
export default ExerciseLog;
