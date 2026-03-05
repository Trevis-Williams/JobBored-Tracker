export default function NutritionLabel({ nutrition, servingSize, servingUnit, servings = 1 }) {
  if (!nutrition) return null;

  const n = {
    calories: Math.round((nutrition.calories || 0) * servings),
    protein: Math.round((nutrition.protein || 0) * servings * 10) / 10,
    carbs: Math.round((nutrition.carbs || 0) * servings * 10) / 10,
    fat: Math.round((nutrition.fat || 0) * servings * 10) / 10,
    fiber: Math.round((nutrition.fiber || 0) * servings * 10) / 10,
    sugar: Math.round((nutrition.sugar || 0) * servings * 10) / 10,
    sodium: Math.round((nutrition.sodium || 0) * servings * 10) / 10,
  };

  const rows = [
    { label: 'Calories', value: n.calories, unit: 'kcal', bold: true },
    { label: 'Protein', value: n.protein, unit: 'g' },
    { label: 'Carbohydrates', value: n.carbs, unit: 'g' },
    { label: 'Fat', value: n.fat, unit: 'g' },
    { label: 'Fiber', value: n.fiber, unit: 'g', indent: true },
    { label: 'Sugar', value: n.sugar, unit: 'g', indent: true },
    { label: 'Sodium', value: n.sodium, unit: 'mg' },
  ];

  return (
    <div className="card">
      <h3 className="text-lg font-bold mb-1">Nutrition Facts</h3>
      {servingSize && (
        <p className="text-sm text-gray-500 mb-3">
          Serving size: {servingSize}
          {servingUnit}
          {servings !== 1 && ` × ${servings}`}
        </p>
      )}

      <div className="border-t-8 border-gray-900 pt-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className={`flex justify-between py-1 border-b border-gray-200 ${
              row.indent ? 'pl-4' : ''
            }`}
          >
            <span className={row.bold ? 'font-bold text-lg' : 'text-sm text-gray-700'}>
              {row.label}
            </span>
            <span className={row.bold ? 'font-bold text-lg' : 'text-sm font-medium'}>
              {row.value}
              {row.unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
