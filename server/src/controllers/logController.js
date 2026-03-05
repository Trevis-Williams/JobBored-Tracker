import FoodLog from '../models/FoodLog.js';
import Food from '../models/Food.js';
import User from '../models/User.js';

export async function createLog(req, res) {
  const { foodId, date, mealType, servings } = req.validated;

  const food = await Food.findById(foodId);
  if (!food) return res.status(404).json({ message: 'Food not found' });

  const mult = servings || 1;
  const base = food.nutritionPerServing.calories
    ? food.nutritionPerServing
    : food.nutritionPer100g;

  const nutrition = {
    calories: Math.round(base.calories * mult),
    protein: Math.round(base.protein * mult * 10) / 10,
    carbs: Math.round(base.carbs * mult * 10) / 10,
    fat: Math.round(base.fat * mult * 10) / 10,
    fiber: Math.round(base.fiber * mult * 10) / 10,
    sugar: Math.round(base.sugar * mult * 10) / 10,
    sodium: Math.round(base.sodium * mult * 10) / 10,
  };

  const log = await FoodLog.create({
    userId: req.userId,
    foodId,
    date: new Date(date),
    mealType,
    servings: mult,
    nutrition,
  });

  const populated = await log.populate('foodId');
  res.status(201).json(populated);
}

export async function getLogsByDate(req, res) {
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: 'Date is required' });

  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  const logs = await FoodLog.find({
    userId: req.userId,
    date: { $gte: start, $lt: end },
  }).populate('foodId');

  res.json(logs);
}

export async function getLogsByRange(req, res) {
  const { start, end } = req.query;
  if (!start || !end) {
    return res.status(400).json({ message: 'start and end dates are required' });
  }

  const startDate = new Date(start);
  startDate.setUTCHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setUTCHours(23, 59, 59, 999);

  const logs = await FoodLog.find({
    userId: req.userId,
    date: { $gte: startDate, $lte: endDate },
  }).populate('foodId');

  res.json(logs);
}

export async function getStreaks(req, res) {
  const user = await User.findById(req.userId);
  const calorieGoal = user?.dailyGoals?.calories || 2000;

  const now = new Date();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const ninetyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);

  const logs = await FoodLog.find({
    userId: req.userId,
    date: { $gte: ninetyDaysAgo, $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate()) },
  });

  const dayMap = {};
  for (const log of logs) {
    const d = new Date(log.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!dayMap[key]) dayMap[key] = 0;
    dayMap[key] += log.nutrition?.calories || 0;
  }

  let loggingStreak = 0;
  let goalStreak = 0;
  let loggingBroken = false;
  let goalBroken = false;

  const cursor = new Date(yesterday);
  for (let i = 0; i < 90; i++) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
    const dayCals = dayMap[key];

    if (!loggingBroken) {
      if (dayCals != null) loggingStreak++;
      else loggingBroken = true;
    }

    if (!goalBroken) {
      if (dayCals != null && dayCals >= calorieGoal * 0.9 && dayCals <= calorieGoal * 1.1) goalStreak++;
      else goalBroken = true;
    }

    if (loggingBroken && goalBroken) break;
    cursor.setDate(cursor.getDate() - 1);
  }

  res.json({ loggingStreak, goalStreak });
}

export async function deleteLog(req, res) {
  const log = await FoodLog.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId,
  });

  if (!log) return res.status(404).json({ message: 'Log not found' });
  res.json({ message: 'Log deleted' });
}
