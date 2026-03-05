import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PageHeader({ title, showBack = false, rightAction }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="text-xl font-bold text-gray-900">{title || 'NutriScan'}</h1>
        </div>

        <div className="flex items-center gap-2">
          {rightAction}
          {user && !rightAction && (
            user.avatar ? (
              <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">
                {user.name?.[0]?.toUpperCase()}
              </div>
            )
          )}
        </div>
      </div>
    </header>
  );
}
