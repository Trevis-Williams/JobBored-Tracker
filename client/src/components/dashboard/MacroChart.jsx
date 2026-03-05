import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { MACRO_COLORS, MACRO_LABELS } from '../../utils/colors';
import EmptyState from '../ui/EmptyState';

const COLORS_ARR = [MACRO_COLORS.protein, MACRO_COLORS.carbs, MACRO_COLORS.fat];

export default function MacroChart({ totals }) {
  const data = [
    { name: MACRO_LABELS.protein, value: Math.round(totals.protein) || 0 },
    { name: MACRO_LABELS.carbs, value: Math.round(totals.carbs) || 0 },
    { name: MACRO_LABELS.fat, value: Math.round(totals.fat) || 0 },
  ];

  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return (
      <div className="card">
        <EmptyState
          title="No macros yet"
          description="Log some food to see your breakdown"
        />
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-base font-semibold text-gray-900 mb-2">Macro Breakdown</h3>
      <div className="flex items-center">
        <ResponsiveContainer width="50%" height={160}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={65}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS_ARR[i]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="flex-1 space-y-2 pl-2">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center gap-2 text-sm">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS_ARR[i] }}
              />
              <span className="text-gray-600">{d.name}</span>
              <span className="ml-auto font-medium">{d.value}g</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
