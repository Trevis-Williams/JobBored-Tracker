import { useState, useEffect } from 'react';
import useAnimatedNumber from '../../hooks/useAnimatedNumber';

const GOAL_GLASSES = 8;

function getStorageKey(date) {
  return `nutriscan_water_${date}`;
}

export default function WaterTracker({ date }) {
  const [glasses, setGlasses] = useState(0);

  useEffect(() => {
    const saved = parseInt(localStorage.getItem(getStorageKey(date))) || 0;
    setGlasses(saved);
  }, [date]);

  const update = (newVal) => {
    const clamped = Math.max(0, Math.min(newVal, 20));
    setGlasses(clamped);
    localStorage.setItem(getStorageKey(date), clamped);
  };

  const displayGlasses = useAnimatedNumber(glasses);
  const pct = Math.min(Math.round((glasses / GOAL_GLASSES) * 100), 100);

  return (
    <div className="card animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.2 0-2.4.6-3 1.5C8.4 5.4 7.2 6 6 6c-1.7 0-3 1.3-3 3 0 3.3 4 9 9 12 5-3 9-8.7 9-12 0-1.7-1.3-3-3-3-1.2 0-2.4-.6-3-1.5-.6-.9-1.8-1.5-3-1.5z" />
          </svg>
          <h3 className="text-base font-semibold text-gray-900">Water</h3>
        </div>
        <span className="text-sm text-gray-500">{displayGlasses} / {GOAL_GLASSES} glasses</span>
      </div>

      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
        <div
          className="absolute inset-y-0 left-0 bg-blue-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => update(glasses - 1)}
          disabled={glasses <= 0}
          className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-[0.93] transition-all flex items-center justify-center disabled:opacity-30"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
          </svg>
        </button>

        <div className="flex gap-1">
          {Array.from({ length: GOAL_GLASSES }, (_, i) => (
            <div
              key={i}
              className={`w-3 h-6 rounded-sm transition-colors duration-300 ${
                i < glasses ? 'bg-blue-400' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => update(glasses + 1)}
          className="w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 active:scale-[0.93] transition-all flex items-center justify-center"
        >
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
