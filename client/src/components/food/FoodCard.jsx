import { Link } from 'react-router-dom';

export default function FoodCard({ food, showLink = true }) {
  if (!food) return null;

  const n = food.nutritionPerServing?.calories
    ? food.nutritionPerServing
    : food.nutritionPer100g;

  const content = (
    <div className="card flex gap-3 items-center">
      {food.imageUrl ? (
        <img
          src={food.imageUrl}
          alt={food.name}
          className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-16 h-16 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
          <svg className="w-8 h-8 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0A2.704 2.704 0 014.5 16 2.704 2.704 0 013 15.546V12a9 9 0 0118 0v3.546z" />
          </svg>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 truncate">{food.name}</h3>
        {food.brand && (
          <p className="text-xs text-gray-500 truncate">{food.brand}</p>
        )}
        <div className="flex gap-3 mt-1 text-xs text-gray-500">
          <span className="font-medium text-primary-600">{n?.calories || 0} cal</span>
          <span>P {n?.protein || 0}g</span>
          <span>C {n?.carbs || 0}g</span>
          <span>F {n?.fat || 0}g</span>
        </div>
      </div>
    </div>
  );

  if (showLink && food._id) {
    return (
      <Link to={`/food/${food._id}`} className="block active:scale-[0.98] transition-transform">
        {content}
      </Link>
    );
  }

  return content;
}
