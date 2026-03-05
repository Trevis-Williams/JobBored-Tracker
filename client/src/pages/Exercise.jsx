import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import useAnimatedNumber from '../hooks/useAnimatedNumber';
import { parseWorkoutText, calculateCalories, totalCaloriesBurned } from '../utils/parseExercises';
import { todayISO } from '../utils/nutrition';
import toast from 'react-hot-toast';

export default function Exercise() {
  const [view, setView] = useState('list');

  return (
    <div>
      <div className="page-container pt-2">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold text-gray-900">Exercise</h1>
          {view === 'list' ? (
            <button onClick={() => setView('new')} className="btn-primary text-sm py-2 px-4">
              + New Workout
            </button>
          ) : (
            <button onClick={() => setView('list')} className="flex items-center gap-1 text-sm font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 active:scale-[0.97] py-2 px-4 rounded-xl transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              My Workouts
            </button>
          )}
        </div>

        {view === 'list' ? <SavedWorkoutsList /> : <WorkoutCalculator onSaved={() => setView('list')} />}
      </div>
    </div>
  );
}

function SavedWorkoutsList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    api.get('/exercises/saved')
      .then(({ data }) => setWorkouts(data))
      .catch(() => toast.error('Failed to load workouts'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/exercises/saved/${deleteTarget}`);
      setWorkouts((prev) => prev.filter((w) => w._id !== deleteTarget));
      setDeleteTarget(null);
      setExpanded(null);
      toast.success('Workout deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleQuickLog = async (workout) => {
    setLogging(true);
    try {
      const parsed = parseWorkoutText(workout.exercisesText);
      const weightKg = user?.weight || 70;
      const exercises = parsed
        .filter((ex) => ex.durationMinutes > 0)
        .map((ex) => ({
          name: ex.name,
          durationMinutes: ex.durationMinutes,
          caloriesBurned: calculateCalories(ex, weightKg),
        }));

      const total = exercises.reduce((s, e) => s + e.caloriesBurned, 0);

      await api.post('/exercises', {
        date: todayISO(),
        exercises,
        totalCaloriesBurned: total,
      });

      toast.success(`${workout.name} logged!`);
      navigate('/');
    } catch {
      toast.error('Failed to log workout');
    } finally {
      setLogging(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
        }
        title="No saved workouts"
        description="Create a workout to save it for quick logging"
      />
    );
  }

  return (
    <>
      <div className="space-y-3">
        {workouts.map((workout) => {
          const isExpanded = expanded === workout._id;
          return (
            <div key={workout._id} className="card animate-fade-in">
              <button
                onClick={() => setExpanded(isExpanded ? null : workout._id)}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{workout.name}</h3>
                  </div>
                  <div className="text-right ml-3 flex-shrink-0">
                    <p className="text-sm font-semibold text-orange-600">{workout.totalCaloriesBurned || 0} cal</p>
                    <p className="text-xs text-gray-500">burned</p>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-3 animate-fade-in">
                  <button
                    onClick={() => handleQuickLog(workout)}
                    className="btn-primary w-full"
                    disabled={logging}
                  >
                    {logging ? 'Logging...' : 'Log Workout'}
                  </button>

                  <button
                    onClick={() => setDeleteTarget(workout._id)}
                    className="btn-ghost w-full text-danger-500 hover:bg-danger-50"
                  >
                    Delete Workout
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete workout?"
        message="This workout will be permanently removed."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

function WorkoutCalculator({ onSaved }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const weightKg = user?.weight || 70;

  const [workoutText, setWorkoutText] = useState('');
  const [results, setResults] = useState(null);
  const [workoutName, setWorkoutName] = useState('');
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logging, setLogging] = useState(false);

  const displayTotal = useAnimatedNumber(results?.total || 0);

  const handleCalculate = () => {
    if (!workoutText.trim()) {
      toast.error('Paste some exercises first');
      return;
    }

    setCalculating(true);
    const parsed = parseWorkoutText(workoutText);
    const active = parsed.filter((ex) => ex.durationMinutes > 0);

    if (active.length === 0) {
      toast.error('No exercises with duration found');
      setCalculating(false);
      return;
    }

    const rows = parsed.map((ex) => ({
      ...ex,
      caloriesBurned: calculateCalories(ex, weightKg),
    }));

    const total = totalCaloriesBurned(parsed, weightKg);
    setResults({ rows, total });
    setCalculating(false);
  };

  const handleSave = async () => {
    if (!results) return;
    const name = workoutName.trim();
    if (!name) {
      toast.error('Enter a workout name to save');
      return;
    }

    setSaving(true);
    try {
      await api.post('/exercises/saved', {
        name,
        exercisesText: workoutText,
        totalCaloriesBurned: results.total,
      });
      toast.success('Workout saved!');
      onSaved();
    } catch {
      toast.error('Failed to save workout');
    } finally {
      setSaving(false);
    }
  };

  const handleLog = async () => {
    if (!results) return;

    setLogging(true);
    try {
      const exercises = results.rows
        .filter((r) => r.durationMinutes > 0)
        .map((r) => ({
          name: r.name,
          durationMinutes: r.durationMinutes,
          caloriesBurned: r.caloriesBurned,
        }));

      await api.post('/exercises', {
        date: todayISO(),
        exercises,
        totalCaloriesBurned: results.total,
      });

      toast.success('Workout logged!');
      navigate('/');
    } catch {
      toast.error('Failed to log workout');
    } finally {
      setLogging(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setWorkoutText('');
    setWorkoutName('');
  };

  if (!results) {
    return (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paste your workout
          </label>
          <textarea
            className="input-field min-h-[200px] resize-y"
            placeholder={"30 min running\n15 min jump rope\n20 min weight lifting\n45 min cycling\n10 min stretching"}
            value={workoutText}
            onChange={(e) => setWorkoutText(e.target.value)}
          />
        </div>

        <div className="card bg-gray-50 border-gray-200">
          <p className="text-xs text-gray-500">
            <span className="font-medium text-gray-700">Your weight:</span> {weightKg} kg — used for calorie estimates.
            Update in Settings if needed.
          </p>
        </div>

        <button
          onClick={handleCalculate}
          className="btn-primary w-full"
          disabled={calculating || !workoutText.trim()}
        >
          Calculate Calories Burned
        </button>
      </>
    );
  }

  return (
    <>
      <div className="card animate-fade-in text-center py-5">
        <p className="text-sm text-gray-500 mb-1">Total Calories Burned</p>
        <p className="text-3xl font-extrabold text-orange-600">{displayTotal} cal</p>
      </div>

      <div className="card animate-fade-in stagger-1">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Exercises</h3>
        <ul className="divide-y divide-gray-100">
          {results.rows.map((row, i) => (
            <li key={i} className="py-2.5">
              {row.durationMinutes === 0 ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400 italic">{row.name}</span>
                  <span className="text-xs text-gray-400">no duration</span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{row.name}</p>
                    <p className="text-xs text-gray-500">
                      {row.durationMinutes} min
                      {row.matched ? ` · matched: ${row.matched}` : ' · general estimate'}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-orange-600 ml-3 flex-shrink-0">
                    {row.caloriesBurned} cal
                  </span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="card animate-fade-in stagger-2 space-y-3">
        <h3 className="text-base font-semibold text-gray-900">Save or Log</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Workout name</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Morning HIIT"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
          />
        </div>

        <button
          onClick={handleSave}
          className="btn-secondary w-full"
          disabled={saving || !workoutName.trim()}
        >
          {saving ? 'Saving...' : 'Save to My Workouts'}
        </button>

        <div className="relative my-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-gray-400">or log now</span>
          </div>
        </div>

        <button
          onClick={handleLog}
          className="btn-primary w-full"
          disabled={logging}
        >
          {logging ? 'Logging...' : 'Log Workout'}
        </button>
      </div>

      <button onClick={handleReset} className="btn-ghost w-full">
        Start Over
      </button>
    </>
  );
}
