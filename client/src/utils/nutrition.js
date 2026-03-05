export function totalNutrition(logs) {
  return logs.reduce(
    (acc, log) => {
      acc.calories += log.nutrition?.calories || 0;
      acc.protein += log.nutrition?.protein || 0;
      acc.carbs += log.nutrition?.carbs || 0;
      acc.fat += log.nutrition?.fat || 0;
      acc.fiber += log.nutrition?.fiber || 0;
      acc.sugar += log.nutrition?.sugar || 0;
      acc.sodium += log.nutrition?.sodium || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
  );
}

export function pct(value, goal) {
  if (!goal) return 0;
  return Math.min(Math.round((value / goal) * 100), 100);
}

export function formatDate(date) {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function groupByMeal(logs) {
  const groups = { breakfast: [], lunch: [], dinner: [], snack: [] };
  for (const log of logs) {
    const key = log.mealType || 'snack';
    if (groups[key]) groups[key].push(log);
  }
  return groups;
}
