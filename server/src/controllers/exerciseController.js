import ExerciseLog from '../models/ExerciseLog.js';
import SavedWorkout from '../models/SavedWorkout.js';

export async function createExerciseLog(req, res) {
  const { date, exercises, totalCaloriesBurned } = req.validated;

  const log = await ExerciseLog.create({
    userId: req.userId,
    date: new Date(date),
    exercises,
    totalCaloriesBurned,
  });

  res.status(201).json(log);
}

export async function getExercisesByDate(req, res) {
  const { date } = req.validatedQuery;

  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  const logs = await ExerciseLog.find({
    userId: req.userId,
    date: { $gte: start, $lt: end },
  });

  res.json(logs);
}

export async function getExercisesByRange(req, res) {
  const { start, end } = req.validatedQuery;

  const startDate = new Date(start);
  startDate.setUTCHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setUTCHours(23, 59, 59, 999);

  const logs = await ExerciseLog.find({
    userId: req.userId,
    date: { $gte: startDate, $lte: endDate },
  });

  res.json(logs);
}

export async function deleteExerciseLog(req, res) {
  const log = await ExerciseLog.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId,
  });

  if (!log) return res.status(404).json({ message: 'Exercise log not found' });
  res.json({ message: 'Exercise log deleted' });
}

export async function createSavedWorkout(req, res) {
  const { name, exercisesText, totalCaloriesBurned } = req.validated;

  const workout = await SavedWorkout.create({
    userId: req.userId,
    name,
    exercisesText,
    totalCaloriesBurned: totalCaloriesBurned || 0,
  });

  res.status(201).json(workout);
}

export async function getSavedWorkouts(req, res) {
  const workouts = await SavedWorkout.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(workouts);
}

export async function deleteSavedWorkout(req, res) {
  const workout = await SavedWorkout.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId,
  });

  if (!workout) return res.status(404).json({ message: 'Workout not found' });
  res.json({ message: 'Workout deleted' });
}
