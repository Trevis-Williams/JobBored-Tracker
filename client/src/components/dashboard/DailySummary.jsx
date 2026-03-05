import { pct } from '../../utils/nutrition';

export default function DailySummary({ totals, goals }) {
  const calPct = pct(totals.calories, goals.calories);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-900">Daily Summary</h2>
        <span className="text-sm text-gray-500">
          {totals.calories} / {goals.calories} cal
        </span>
      </div>

      <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden mb-4">
        <div
          className="absolute inset-y-0 left-0 bg-primary-500 rounded-full transition-all duration-500"
          style={{ width: `${calPct}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MacroBar label="Protein" value={totals.protein} goal={goals.protein} color="bg-protein-500" />
        <MacroBar label="Carbs" value={totals.carbs} goal={goals.carbs} color="bg-carbs-500" />
        <MacroBar label="Fat" value={totals.fat} goal={goals.fat} color="bg-fat-500" />
      </div>
    </div>
  );
}

function MacroBar({ label, value, goal, color }) {
  const p = pct(value, goal);

  return (
    <div className="text-center">
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
        <div
          className={`absolute inset-y-0 left-0 ${color} rounded-full transition-all duration-500`}
          style={{ width: `${p}%` }}
        />
      </div>
      <p className="text-xs font-medium text-gray-700">{Math.round(value)}g</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
