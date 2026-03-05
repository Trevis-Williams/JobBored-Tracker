import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/ui/Spinner';
import NutritionLabel from '../components/food/NutritionLabel';
import toast from 'react-hot-toast';
import { todayISO } from '../utils/nutrition';

export default function FoodDetail() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const meal = params.get('meal') || 'snack';

  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState(meal);
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    api.get(`/food/${id}`)
      .then(({ data }) => setFood(data))
      .catch(() => toast.error('Could not load food'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleLog = async () => {
    setLogging(true);
    try {
      await api.post('/logs', {
        foodId: id,
        date: todayISO(),
        mealType,
        servings,
      });
      toast.success(`${food.name} logged!`);
      navigate('/');
    } catch {
      toast.error('Failed to log food');
    } finally {
      setLogging(false);
    }
  };

  const backRow = (
    <div className="flex items-center gap-2 mb-4">
      <button onClick={() => navigate(-1)} className="p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Go back">
        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 className="text-xl font-bold text-gray-900">Food Details</h1>
    </div>
  );

  if (loading) {
    return (
      <div className="page-container pt-2">
        {backRow}
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="page-container pt-2">
        {backRow}
        <p className="text-center text-gray-500 py-20">Food not found</p>
      </div>
    );
  }

  const nutrition = food.nutritionPerServing?.calories
    ? food.nutritionPerServing
    : food.nutritionPer100g;

  return (
    <div>
      <div className="page-container pt-2">
        {backRow}
        <div className="animate-fade-in flex gap-4 items-start">
          {food.imageUrl ? (
            <img src={food.imageUrl} alt={food.name} className="w-24 h-24 rounded-2xl object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-primary-50 flex items-center justify-center">
              <svg className="w-10 h-10 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0A2.704 2.704 0 014.5 16 2.704 2.704 0 013 15.546V12a9 9 0 0118 0v3.546z" />
              </svg>
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900">{food.name}</h2>
            {food.brand && <p className="text-sm text-gray-500">{food.brand}</p>}
            <p className="text-xs text-gray-500 mt-1 capitalize">Source: {food.source}</p>
          </div>
        </div>

        <NutritionLabel
          nutrition={nutrition}
          servingSize={food.servingSize}
          servingUnit={food.servingUnit}
          servings={servings}
        />

        {food.ingredients && (
          <div className="card animate-fade-in stagger-1">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Ingredients</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{food.ingredients}</p>
          </div>
        )}

        <div className="card animate-fade-in stagger-2 space-y-3">
          <h3 className="text-base font-semibold text-gray-900">Log this food</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Servings</label>
            <input
              type="number"
              min="0.25"
              step="0.25"
              className="input-field"
              value={servings}
              onChange={(e) => setServings(parseFloat(e.target.value) || 1)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meal</label>
            <select
              className="input-field"
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          <button
            onClick={handleLog}
            className="btn-primary w-full"
            disabled={logging}
          >
            {logging ? 'Logging...' : 'Log Food'}
          </button>
        </div>
      </div>
    </div>
  );
}
