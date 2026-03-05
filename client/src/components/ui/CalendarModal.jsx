import { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { totalNutrition } from '../../utils/nutrition';

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toISO(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay();
}

function calorieColor(cal, goal) {
  if (!cal || cal === 0) return '';
  const ratio = cal / goal;
  if (ratio > 1.2) return 'bg-danger-50';
  if (ratio >= 0.7) return 'bg-primary-50';
  return 'bg-carbs-50';
}

export default function CalendarModal({ open, selectedDate, onSelect, onClose, dailyGoal }) {
  const initDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());
  const [monthData, setMonthData] = useState({});
  const cacheRef = useRef({});

  useEffect(() => {
    if (!open) return;
    const d = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    fetchMonth(viewYear, viewMonth);
  }, [open, viewYear, viewMonth]);

  const fetchMonth = async (y, m) => {
    const key = `${y}-${m}`;
    if (cacheRef.current[key]) {
      setMonthData((prev) => ({ ...prev, [key]: cacheRef.current[key] }));
      return;
    }

    const daysInMonth = getDaysInMonth(y, m);
    const start = toISO(y, m, 1);
    const end = toISO(y, m, daysInMonth);

    try {
      const { data: logs } = await api.get('/logs/range', { params: { start, end } });
      const grouped = {};
      for (const log of logs) {
        const dateKey = new Date(log.date).toISOString().split('T')[0];
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(log);
      }

      const dayCals = {};
      for (const [dateKey, dayLogs] of Object.entries(grouped)) {
        dayCals[dateKey] = totalNutrition(dayLogs).calories;
      }

      cacheRef.current[key] = dayCals;
      setMonthData((prev) => ({ ...prev, [key]: dayCals }));
    } catch {
      cacheRef.current[key] = {};
      setMonthData((prev) => ({ ...prev, [key]: {} }));
    }
  };

  const shiftMonth = (dir) => {
    let m = viewMonth + dir;
    let y = viewYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setViewMonth(m);
    setViewYear(y);
  };

  if (!open) return null;

  const today = todayStr();
  const key = `${viewYear}-${viewMonth}`;
  const dayCals = monthData[key] || {};
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
  const goal = dailyGoal || 2000;

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/40 animate-fade-backdrop" onClick={onClose} />

      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto animate-slide-up">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        <div className="px-4 pb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => shiftMonth(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <h2 className="text-base font-bold text-gray-900">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </h2>

            <button
              onClick={() => shiftMonth(1)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAY_LABELS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) {
                return <div key={`empty-${i}`} className="aspect-square" />;
              }

              const dateStr = toISO(viewYear, viewMonth, day);
              const cal = dayCals[dateStr] || 0;
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === today;
              const bgColor = calorieColor(cal, goal);

              return (
                <button
                  key={dateStr}
                  onClick={() => onSelect(dateStr)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all relative ${
                    isSelected
                      ? 'bg-primary-500 text-white'
                      : isToday
                        ? `ring-2 ring-primary-400 ${bgColor || 'bg-white'}`
                        : `${bgColor || 'hover:bg-gray-50'}`
                  }`}
                >
                  <span className={`text-sm font-medium ${
                    isSelected ? 'text-white' : 'text-gray-800'
                  }`}>
                    {day}
                  </span>
                  {cal > 0 && (
                    <span className={`text-[10px] leading-none ${
                      isSelected ? 'text-white/80' : 'text-gray-500'
                    }`}>
                      {cal >= 1000 ? `${(cal / 1000).toFixed(1)}k` : cal}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-primary-50 border border-primary-200" /> On track
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-carbs-50 border border-carbs-500/30" /> Under
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-danger-50 border border-danger-500/30" /> Over
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
