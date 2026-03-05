import { useNavigate } from 'react-router-dom';
import FoodSearch from '../components/food/FoodSearch';

export default function Search() {
  const navigate = useNavigate();

  return (
    <div className="page-container pt-2">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Go back">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900">Search Food</h1>
      </div>
      <FoodSearch />
    </div>
  );
}
