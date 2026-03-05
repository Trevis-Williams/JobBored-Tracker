import mongoose from 'mongoose';

const savedWorkoutSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    exercisesText: { type: String, default: '' },
    totalCaloriesBurned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const SavedWorkout = mongoose.model('SavedWorkout', savedWorkoutSchema);
export default SavedWorkout;
