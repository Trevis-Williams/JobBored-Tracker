import { useState } from 'react';
import { Link } from 'react-router-dom';
import ConfirmDialog from '../ui/ConfirmDialog';

const MEAL_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

const MEAL_ICONS = {
  breakfast: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  ),
  lunch: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.379a48.474 48.474 0 00-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265z" />
    </svg>
  ),
  dinner: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  ),
  snack: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0A2.704 2.704 0 014.5 16 2.704 2.704 0 013 15.546V12a9 9 0 0118 0v3.546z" />
    </svg>
  ),
};

export default function MealSection({ mealType, logs, onDelete }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [slidingOut, setSlidingOut] = useState(null);
  const totalCal = logs.reduce((s, l) => s + (l.nutrition?.calories || 0), 0);

  const confirmDelete = () => {
    if (deleteTarget) {
      setSlidingOut(deleteTarget);
      setDeleteTarget(null);
    }
  };

  const handleSlideEnd = (id) => {
    if (slidingOut === id) {
      setSlidingOut(null);
      onDelete(id);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-gray-400">{MEAL_ICONS[mealType]}</span>
          {MEAL_LABELS[mealType]}
        </h3>
        <span className="text-sm text-gray-500">{totalCal} cal</span>
      </div>

      {logs.length === 0 ? (
        <p className="text-sm text-gray-400 py-2">Nothing logged</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {logs.map((log) => (
            <li
              key={log._id}
              className={`flex items-center justify-between py-2.5 ${slidingOut === log._id ? 'animate-fade-out-slide overflow-hidden' : ''}`}
              onAnimationEnd={() => handleSlideEnd(log._id)}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {log.foodId?.name || 'Unknown'}
                </p>
                <p className="text-xs text-gray-500">
                  {log.servings} serving{log.servings !== 1 ? 's' : ''} · {log.nutrition?.calories || 0} cal
                </p>
              </div>
              <button
                onClick={() => setDeleteTarget(log._id)}
                className="ml-2 p-1.5 text-gray-400 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
                aria-label="Delete"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Link
        to={`/scanner?meal=${mealType}`}
        className="mt-2 block text-center text-sm text-primary-600 font-medium py-1.5 hover:bg-primary-50 rounded-xl transition-colors"
      >
        + Add food
      </Link>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove food?"
        message="This will remove this item from your log."
        confirmLabel="Remove"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
