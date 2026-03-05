import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/ui/Spinner';
import CalendarModal from '../components/ui/CalendarModal';
import StreakCard from '../components/dashboard/StreakCard';
import WaterTracker from '../components/dashboard/WaterTracker';
import DailySummary from '../components/dashboard/DailySummary';
import MacroChart from '../components/dashboard/MacroChart';
import MealSection from '../components/dashboard/MealSection';
import useAnimatedNumber from '../hooks/useAnimatedNumber';
import useNotifications from '../hooks/useNotifications';
import { totalNutrition, groupByMeal, todayISO, formatDate } from '../utils/nutrition';
import toast from 'react-hot-toast';

const MEAL_STAGGER = { breakfast: 'stagger-1', lunch: 'stagger-2', dinner: 'stagger-3', snack: 'stagger-4' };

function SimpleSummary({ totals }) {
  const displayCal = useAnimatedNumber(totals.calories);

  return (
    <div className="card animate-fade-in text-center py-6">
      <p className="text-sm text-gray-500 mb-1">Calories Today</p>
      <p className="text-3xl font-extrabold text-primary-600">{displayCal}</p>
      <p className="text-xs text-gray-500 mt-1">kcal consumed</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  useNotifications(user);
  const [params] = useSearchParams();
  const [logs, setLogs] = useState([]);
  const [date, setDate] = useState(params.get('date') || todayISO());
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [streaks, setStreaks] = useState({ loggingStreak: 0, goalStreak: 0 });

  const isAdvanced = user?.accountMode === 'advanced';
  const isToday = date === todayISO();

  useEffect(() => {
    api.get('/logs/streaks').then(({ data }) => setStreaks(data)).catch(() => {});
  }, []);

  const fetchLogs = async (d) => {
    setLoading(true);
    try {
      const { data } = await api.get('/logs', { params: { date: d } });
      setLogs(data);
    } catch {
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(date);
  }, [date]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/logs/${id}`);
      setLogs((prev) => prev.filter((l) => l._id !== id));
      toast.success('Removed');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const shiftDate = (days) => {
    const [y, m, d] = date.split('-').map(Number);
    const local = new Date(y, m - 1, d + days);
    const result = `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, '0')}-${String(local.getDate()).padStart(2, '0')}`;
    setDate(result);
  };

  const totals = totalNutrition(logs);
  const groups = groupByMeal(logs);

  return (
    <div>
      <div className="page-container pt-2">
        <div className="flex items-center justify-between">
          <button onClick={() => shiftDate(-1)} className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 active:scale-[0.90] transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => setShowCalendar(true)}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 hover:text-primary-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 active:scale-[0.97] transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            {date === todayISO() ? 'Today' : formatDate(date)}
          </button>

          <button
            onClick={() => shiftDate(1)}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 active:scale-[0.90] transition-all"
            disabled={date === todayISO()}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : (
          <div className="animate-fade-in space-y-4">
            {isToday && (
              <StreakCard loggingStreak={streaks.loggingStreak} goalStreak={streaks.goalStreak} />
            )}

            {isAdvanced ? (
              <>
                <div className="animate-fade-in"><DailySummary totals={totals} goals={user?.dailyGoals || {}} /></div>
                <div className="animate-fade-in stagger-1"><MacroChart totals={totals} /></div>
              </>
            ) : (
              <SimpleSummary totals={totals} />
            )}

            {['breakfast', 'lunch', 'dinner', 'snack'].map((meal) => (
              <div key={meal} className={`animate-fade-in ${MEAL_STAGGER[meal]}`}>
                <MealSection
                  mealType={meal}
                  logs={groups[meal]}
                  onDelete={handleDelete}
                />
              </div>
            ))}

            <WaterTracker date={date} />
          </div>
        )}
      </div>

      <CalendarModal
        open={showCalendar}
        selectedDate={date}
        onSelect={(d) => {
          setDate(d);
          setShowCalendar(false);
        }}
        onClose={() => setShowCalendar(false)}
        dailyGoal={user?.dailyGoals?.calories || 2000}
      />
    </div>
  );
}
