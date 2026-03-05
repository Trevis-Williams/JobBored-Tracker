import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import {
  parseRecipeText,
  calculateIngredientNutrition,
  sumNutrition,
  divideNutrition,
} from '../utils/parseIngredients';
import useAnimatedNumber from '../hooks/useAnimatedNumber';
import { todayISO } from '../utils/nutrition';
import toast from 'react-hot-toast';

export default function Recipe() {
  const [view, setView] = useState('list');

  return (
    <div>
      <div className="page-container pt-2">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold text-gray-900">Recipes</h1>
          {view === 'list' ? (
            <button onClick={() => setView('new')} className="btn-primary text-sm py-2 px-4">
              + New Recipe
            </button>
          ) : (
            <button onClick={() => setView('list')} className="flex items-center gap-1 text-sm font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 active:scale-[0.97] py-2 px-4 rounded-xl transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              My Recipes
            </button>
          )}
        </div>

        {view === 'list' ? <SavedRecipesList /> : <RecipeCalculator onSaved={() => setView('list')} onBack={() => setView('list')} />}
      </div>
    </div>
  );
}

function SavedRecipesList() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [mealType, setMealType] = useState('dinner');
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    api.get('/recipes')
      .then(({ data }) => setRecipes(data))
      .catch(() => toast.error('Failed to load recipes'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/recipes/${deleteTarget}`);
      setRecipes((prev) => prev.filter((r) => r._id !== deleteTarget));
      setDeleteTarget(null);
      setExpanded(null);
      toast.success('Recipe deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleQuickLog = async (recipe) => {
    setLogging(true);
    try {
      const { data: food } = await api.post('/food', {
        name: recipe.name,
        brand: `${recipe.servings} servings`,
        servingSize: 1,
        servingUnit: 'serving',
        nutritionPer100g: recipe.perServing,
        nutritionPerServing: recipe.perServing,
      });

      await api.post('/logs', {
        foodId: food._id,
        date: todayISO(),
        mealType,
        servings: 1,
      });

      toast.success(`${recipe.name} logged!`);
      navigate('/');
    } catch {
      toast.error('Failed to log recipe');
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

  if (recipes.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
          </svg>
        }
        title="No saved recipes"
        description="Calculate a recipe and save it for quick access later"
      />
    );
  }

  return (
    <>
      <div className="space-y-3">
        {recipes.map((recipe) => {
          const isExpanded = expanded === recipe._id;
          return (
            <div key={recipe._id} className="card animate-fade-in">
              <button
                onClick={() => setExpanded(isExpanded ? null : recipe._id)}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{recipe.name}</h3>
                    <p className="text-xs text-gray-500">{recipe.servings} servings</p>
                  </div>
                  <div className="text-right ml-3 flex-shrink-0">
                    <p className="text-sm font-semibold text-primary-600">{recipe.perServing?.calories || 0} cal</p>
                    <p className="text-xs text-gray-500">per serving</p>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-3 animate-fade-in">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-50 rounded-xl py-2">
                      <p className="text-xs text-gray-500">Protein</p>
                      <p className="text-sm font-semibold text-protein-500">{recipe.perServing?.protein || 0}g</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl py-2">
                      <p className="text-xs text-gray-500">Carbs</p>
                      <p className="text-sm font-semibold text-carbs-500">{recipe.perServing?.carbs || 0}g</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl py-2">
                      <p className="text-xs text-gray-500">Fat</p>
                      <p className="text-sm font-semibold text-fat-500">{recipe.perServing?.fat || 0}g</p>
                    </div>
                  </div>

                  <div className="card bg-primary-50 border-primary-100 text-center py-2">
                    <p className="text-xs text-primary-600">Total Recipe</p>
                    <p className="text-base font-bold text-primary-700">{recipe.totalNutrition?.calories || 0} cal</p>
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
                    onClick={() => handleQuickLog(recipe)}
                    className="btn-primary w-full"
                    disabled={logging}
                  >
                    {logging ? 'Logging...' : 'Log 1 Serving'}
                  </button>

                  <button
                    onClick={() => setDeleteTarget(recipe._id)}
                    className="btn-ghost w-full text-danger-500 hover:bg-danger-50"
                  >
                    Delete Recipe
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete recipe?"
        message="This recipe will be permanently removed."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

function RecipeCalculator({ onSaved, onBack }) {
  const navigate = useNavigate();
  const [recipeText, setRecipeText] = useState('');
  const [servings, setServings] = useState(4);
  const [recipeName, setRecipeName] = useState('');

  const [calculating, setCalculating] = useState(false);
  const [results, setResults] = useState(null);
  const [mealType, setMealType] = useState('dinner');
  const [logging, setLogging] = useState(false);
  const [saving, setSaving] = useState(false);
  const displayCal = useAnimatedNumber(results?.perServing?.calories || 0);

  const handleCalculate = async () => {
    if (!recipeText.trim()) {
      toast.error('Paste some ingredients first');
      return;
    }

    setCalculating(true);
    setResults(null);

    try {
      const parsed = parseRecipeText(recipeText);
      const activeIngredients = parsed.filter((i) => !i.skipped);

      if (activeIngredients.length === 0) {
        toast.error('No measurable ingredients found');
        setCalculating(false);
        return;
      }

      const names = activeIngredients.map((i) => i.name);
      const { data: matches } = await api.post('/food/batch-search', { ingredients: names });

      const matchMap = {};
      for (const m of matches) {
        matchMap[m.query] = m.match;
      }

      const rows = parsed.map((ingredient) => {
        const match = ingredient.skipped ? null : matchMap[ingredient.name] || null;
        const nutrition = calculateIngredientNutrition(ingredient, match);
        return { ingredient, match, nutrition };
      });

      const totalNutrition = sumNutrition(rows.map((r) => r.nutrition));
      const effectiveServings = servings || 1;
      const perServing = divideNutrition(totalNutrition, effectiveServings);

      setResults({ rows, totalNutrition, perServing });
    } catch {
      toast.error('Failed to look up ingredients');
    } finally {
      setCalculating(false);
    }
  };

  const handleSave = async () => {
    if (!results) return;
    const name = recipeName.trim();
    if (!name) {
      toast.error('Enter a recipe name to save');
      return;
    }

    setSaving(true);
    try {
      await api.post('/recipes', {
        name,
        ingredientsText: recipeText,
        servings: servings || 1,
        totalNutrition: results.totalNutrition,
        perServing: results.perServing,
      });
      toast.success('Recipe saved!');
      onSaved();
    } catch {
      toast.error('Failed to save recipe');
    } finally {
      setSaving(false);
    }
  };

  const handleLog = async () => {
    if (!results) return;

    setLogging(true);
    try {
      const name = recipeName.trim() || 'Custom Recipe';
      const { data: food } = await api.post('/food', {
        name,
        brand: `${servings || 1} servings`,
        servingSize: 1,
        servingUnit: 'serving',
        nutritionPer100g: results.perServing,
        nutritionPerServing: results.perServing,
      });

      await api.post('/logs', {
        foodId: food._id,
        date: todayISO(),
        mealType,
        servings: 1,
      });

      toast.success(`${name} logged!`);
      navigate('/');
    } catch {
      toast.error('Failed to log recipe');
    } finally {
      setLogging(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setRecipeText('');
    setRecipeName('');
  };

  if (!results) {
    return (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paste recipe ingredients
          </label>
          <textarea
            className="input-field min-h-[200px] resize-y"
            placeholder={"1/2 cup all-purpose flour\n2 Tbsp. butter\n4 chicken breasts\n1 cup heavy cream\n..."}
            value={recipeText}
            onChange={(e) => setRecipeText(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of servings
          </label>
          <input
            type="number"
            min="1"
            className="input-field"
            value={servings}
            onChange={(e) => {
              const val = e.target.value;
              setServings(val === '' ? '' : parseInt(val) || '');
            }}
          />
        </div>

        <button
          onClick={handleCalculate}
          className="btn-primary w-full"
          disabled={calculating || !recipeText.trim()}
        >
          {calculating ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner size="sm" className="border-white/30 border-t-white" />
              Looking up ingredients...
            </span>
          ) : (
            'Calculate Nutrition'
          )}
        </button>
      </>
    );
  }

  return (
    <>
      <div className="card animate-fade-in text-center py-5">
        <p className="text-sm text-gray-500 mb-1">
          Per Serving (1 of {servings || 1})
        </p>
        <p className="text-3xl font-extrabold text-primary-600">
          {displayCal} cal
        </p>
        <div className="flex justify-center gap-4 mt-2 text-sm text-gray-600">
          <span><span className="font-semibold text-protein-500">P</span> {results.perServing.protein}g</span>
          <span><span className="font-semibold text-carbs-500">C</span> {results.perServing.carbs}g</span>
          <span><span className="font-semibold text-fat-500">F</span> {results.perServing.fat}g</span>
        </div>
      </div>

      <div className="card animate-fade-in stagger-1">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Ingredients</h3>
        <ul className="divide-y divide-gray-100">
          {results.rows.map((row, i) => (
            <li key={i} className="py-2.5">
              {row.ingredient.skipped ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400 italic">{row.ingredient.name}</span>
                  <span className="text-xs text-gray-400">skipped</span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {row.ingredient.qty} {row.ingredient.unit} {row.ingredient.name}
                    </p>
                    {row.match ? (
                      <p className="text-xs text-gray-500 truncate">Matched: {row.match.name}</p>
                    ) : (
                      <p className="text-xs text-danger-500">No match found</p>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 ml-3 flex-shrink-0">
                    {row.nutrition.calories} cal
                  </span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="card animate-fade-in stagger-2 bg-primary-50 border-primary-100">
        <div className="text-center">
          <p className="text-sm text-primary-700 font-medium mb-1">Total Recipe</p>
          <p className="text-2xl font-extrabold text-primary-700">{results.totalNutrition.calories} cal</p>
          <div className="flex justify-center gap-4 mt-1 text-sm text-primary-600">
            <span>P: {results.totalNutrition.protein}g</span>
            <span>C: {results.totalNutrition.carbs}g</span>
            <span>F: {results.totalNutrition.fat}g</span>
          </div>
        </div>
      </div>

      <div className="card animate-fade-in stagger-3 space-y-3">
        <h3 className="text-base font-semibold text-gray-900">Save or Log</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Recipe name</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Tuscan Chicken"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
          />
        </div>

        <button
          onClick={handleSave}
          className="btn-secondary w-full"
          disabled={saving || !recipeName.trim()}
        >
          {saving ? 'Saving...' : 'Save to My Recipes'}
        </button>

        <div className="relative my-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-gray-400">or log now</span>
          </div>
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
          {logging ? 'Logging...' : 'Log 1 Serving'}
        </button>
      </div>

      <button onClick={handleReset} className="btn-ghost w-full">
        Start Over
      </button>
    </>
  );
}
