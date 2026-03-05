import useAnimatedNumber from '../../hooks/useAnimatedNumber';

export default function StreakCard({ loggingStreak, goalStreak }) {
  const displayLogging = useAnimatedNumber(loggingStreak);
  const displayGoal = useAnimatedNumber(goalStreak);

  if (loggingStreak === 0 && goalStreak === 0) {
    return (
      <div className="card animate-fade-in text-center py-5">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-700">Start your streak!</p>
        <p className="text-xs text-gray-500 mt-0.5">Log food every day to build your streak</p>
      </div>
    );
  }

  return (
    <div className="card animate-fade-in">
      <div className="flex gap-3">
        <div className="flex-1 flex items-center gap-3 bg-primary-50 rounded-xl p-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-extrabold text-primary-700 leading-none">{displayLogging}</p>
            <p className="text-[11px] text-primary-600 mt-0.5">day streak</p>
          </div>
        </div>

        <div className="flex-1 flex items-center gap-3 bg-protein-50 rounded-xl p-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-protein-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-extrabold text-blue-700 leading-none">{displayGoal}</p>
            <p className="text-[11px] text-blue-600 mt-0.5">on goal</p>
          </div>
        </div>
      </div>
    </div>
  );
}
