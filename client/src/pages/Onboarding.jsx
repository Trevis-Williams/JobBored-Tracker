import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
  { value: 'light', label: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
  { value: 'moderate', label: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
  { value: 'active', label: 'Active', desc: 'Hard exercise 6-7 days/week' },
  { value: 'very_active', label: 'Very Active', desc: 'Very hard exercise & physical job' },
];

function lbsToKg(lbs) { return Math.round(lbs * 0.453592 * 100) / 100; }
function kgToLbs(kg) { return Math.round(kg * 2.20462 * 10) / 10; }
function ftInToCm(ft, inches) { return Math.round((ft * 30.48 + inches * 2.54) * 100) / 100; }
function cmToFtIn(cm) {
  const totalIn = cm / 2.54;
  return { ft: Math.floor(totalIn / 12), inches: Math.round(totalIn % 12) };
}

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i === current ? 'w-8 bg-primary-500' : i < current ? 'w-2 bg-primary-300' : 'w-2 bg-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

function BodyStatsStep({ data, onChange }) {
  const isImperial = data.unitSystem === 'imperial';

  const displayWeight = isImperial
    ? (data.weightKg ? kgToLbs(data.weightKg) : '')
    : (data.weightKg || '');

  const { ft, inches } = data.heightCm ? cmToFtIn(data.heightCm) : { ft: '', inches: '' };
  const displayHeightCm = !isImperial ? (data.heightCm || '') : '';

  const setWeight = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) { onChange({ weightKg: null }); return; }
    onChange({ weightKg: isImperial ? lbsToKg(num) : num });
  };

  const setHeightFtIn = (newFt, newIn) => {
    const f = parseInt(newFt) || 0;
    const i = parseInt(newIn) || 0;
    onChange({ heightCm: ftInToCm(f, i) });
  };

  const setHeightCm = (val) => {
    const num = parseFloat(val);
    onChange({ heightCm: isNaN(num) ? null : num });
  };

  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">About You</h2>
        <p className="text-gray-500 mt-1">Help us personalize your experience</p>
      </div>

      <div className="flex justify-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => onChange({ unitSystem: 'imperial' })}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            isImperial ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Imperial (lbs, ft)
        </button>
        <button
          type="button"
          onClick={() => onChange({ unitSystem: 'metric' })}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            !isImperial ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Metric (kg, cm)
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Weight ({isImperial ? 'lbs' : 'kg'})
        </label>
        <input
          type="number"
          className="input-field"
          placeholder={isImperial ? 'e.g. 170' : 'e.g. 77'}
          value={displayWeight}
          onChange={(e) => setWeight(e.target.value)}
        />
      </div>

      {isImperial ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="number"
                className="input-field"
                placeholder="ft"
                value={ft}
                onChange={(e) => setHeightFtIn(e.target.value, inches)}
              />
            </div>
            <div className="flex-1">
              <input
                type="number"
                className="input-field"
                placeholder="in"
                value={inches}
                onChange={(e) => setHeightFtIn(ft, e.target.value)}
              />
            </div>
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
          <input
            type="number"
            className="input-field"
            placeholder="e.g. 175"
            value={displayHeightCm}
            onChange={(e) => setHeightCm(e.target.value)}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
        <input
          type="number"
          className="input-field"
          placeholder="e.g. 25"
          value={data.age || ''}
          onChange={(e) => onChange({ age: parseInt(e.target.value) || null })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
        <div className="grid grid-cols-2 gap-3">
          {['male', 'female'].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onChange({ gender: g })}
              className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                data.gender === g
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {g === 'male' ? 'Male' : 'Female'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
        <div className="space-y-2">
          {ACTIVITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ activityLevel: opt.value })}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                data.activityLevel === opt.value
                  ? 'bg-primary-50 border-2 border-primary-500'
                  : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }`}
            >
              <p className={`text-sm font-semibold ${data.activityLevel === opt.value ? 'text-primary-700' : 'text-gray-800'}`}>
                {opt.label}
              </p>
              <p className="text-xs text-gray-500">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ModeStep({ mode, onChange }) {
  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">How do you want to track?</h2>
        <p className="text-gray-500 mt-1">You can change this later in Settings</p>
      </div>

      <button
        type="button"
        onClick={() => onChange('simple')}
        className={`w-full text-left p-5 rounded-2xl transition-all ${
          mode === 'simple'
            ? 'bg-primary-50 border-2 border-primary-500 shadow-md'
            : 'bg-white border-2 border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Simple</h3>
            <p className="text-sm text-gray-500 mt-1">
              Just track what I eat. Show me calories and a food log. Keep it clean and easy.
            </p>
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onChange('advanced')}
        className={`w-full text-left p-5 rounded-2xl transition-all ${
          mode === 'advanced'
            ? 'bg-primary-50 border-2 border-primary-500 shadow-md'
            : 'bg-white border-2 border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Advanced</h3>
            <p className="text-sm text-gray-500 mt-1">
              Track macros in detail. Set daily goals for protein, carbs, and fat. Charts and progress bars included.
            </p>
          </div>
        </div>
      </button>
    </div>
  );
}

function GoalSetupStep({ goalMethod, setGoalMethod, goals, setGoals, calculatedGoals, setCalculatedGoals }) {
  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Set Your Goals</h2>
        <p className="text-gray-500 mt-1">Daily nutrition targets to aim for</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          type="button"
          onClick={() => setGoalMethod('auto')}
          className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
            goalMethod === 'auto'
              ? 'bg-primary-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Calculate for me
        </button>
        <button
          type="button"
          onClick={() => setGoalMethod('manual')}
          className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
            goalMethod === 'manual'
              ? 'bg-primary-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Set my own
        </button>
      </div>

      {goalMethod === 'auto' && calculatedGoals && (
        <div className="card bg-primary-50 border-primary-100">
          <p className="text-sm text-primary-700 font-medium mb-3">
            Based on your body stats, here are your recommended daily goals. Feel free to adjust them.
          </p>
          <GoalInputs goals={calculatedGoals} onChange={setCalculatedGoals} />
        </div>
      )}

      {goalMethod === 'manual' && (
        <div className="card">
          <GoalInputs goals={goals} onChange={setGoals} />
        </div>
      )}
    </div>
  );
}

function GoalInputs({ goals, onChange }) {
  const update = (field, value) => {
    onChange({ ...goals, [field]: parseInt(value) || 0 });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Calories (kcal)</label>
        <input type="number" className="input-field" value={goals.calories} onChange={(e) => update('calories', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Protein (g)</label>
        <input type="number" className="input-field" value={goals.protein} onChange={(e) => update('protein', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Carbs (g)</label>
        <input type="number" className="input-field" value={goals.carbs} onChange={(e) => update('carbs', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fat (g)</label>
        <input type="number" className="input-field" value={goals.fat} onChange={(e) => update('fat', e.target.value)} />
      </div>
    </div>
  );
}

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
};

function clientCalculateGoals(weightKg, heightCm, age, gender, activityLevel) {
  const bmr = gender === 'male'
    ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  const mult = ACTIVITY_MULTIPLIERS[activityLevel] || 1.55;
  const tdee = Math.round(bmr * mult);
  const weightLbs = weightKg * 2.20462;
  const protein = Math.round(weightLbs * 0.8);
  const fatCals = tdee * 0.25;
  const fat = Math.round(fatCals / 9);
  const carbs = Math.round((tdee - protein * 4 - fatCals) / 4);
  return { calories: tdee, protein, carbs, fat };
}

export default function Onboarding() {
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [bodyStats, setBodyStats] = useState({
    unitSystem: 'imperial',
    weightKg: null,
    heightCm: null,
    age: null,
    gender: null,
    activityLevel: null,
  });

  const [accountMode, setAccountMode] = useState('simple');
  const [goalMethod, setGoalMethod] = useState('auto');
  const [manualGoals, setManualGoals] = useState({ calories: 2000, protein: 150, carbs: 250, fat: 65 });
  const [autoGoals, setAutoGoals] = useState(null);

  const totalSteps = accountMode === 'advanced' ? 3 : 2;

  const updateBodyStats = (partial) => {
    setBodyStats((prev) => ({ ...prev, ...partial }));
  };

  const canAdvanceStep0 =
    bodyStats.weightKg && bodyStats.heightCm && bodyStats.age && bodyStats.gender && bodyStats.activityLevel;

  const handleNext = () => {
    if (step === 0 && !canAdvanceStep0) {
      toast.error('Please fill in all fields');
      return;
    }

    if (step === 1 && accountMode === 'advanced') {
      const calc = clientCalculateGoals(
        bodyStats.weightKg, bodyStats.heightCm, bodyStats.age, bodyStats.gender, bodyStats.activityLevel
      );
      setAutoGoals(calc);
      setStep(2);
      return;
    }

    if (step === 1 && accountMode === 'simple') {
      handleFinish();
      return;
    }

    setStep((s) => s + 1);
  };

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      const isAuto = accountMode === 'advanced' && goalMethod === 'auto';
      const goals = accountMode === 'advanced'
        ? (goalMethod === 'auto' ? autoGoals : manualGoals)
        : null;

      const { data } = await api.put('/auth/onboarding', {
        weight: bodyStats.weightKg,
        height: bodyStats.heightCm,
        age: bodyStats.age,
        gender: bodyStats.gender,
        activityLevel: bodyStats.activityLevel,
        unitSystem: bodyStats.unitSystem,
        accountMode,
        autoCalculate: isAuto,
        dailyGoals: goals,
      });

      updateUser(data);
      toast.success("You're all set!");
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-lg mx-auto">
        <StepIndicator current={step} total={totalSteps} />

        {step === 0 && (
          <BodyStatsStep data={bodyStats} onChange={updateBodyStats} />
        )}

        {step === 1 && (
          <ModeStep mode={accountMode} onChange={setAccountMode} />
        )}

        {step === 2 && (
          <GoalSetupStep
            goalMethod={goalMethod}
            setGoalMethod={setGoalMethod}
            goals={manualGoals}
            setGoals={setManualGoals}
            calculatedGoals={autoGoals}
            setCalculatedGoals={setAutoGoals}
          />
        )}

        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="btn-secondary flex-1"
            >
              Back
            </button>
          )}

          {(step < totalSteps - 1) ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary flex-1"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={step === 2 ? handleFinish : handleNext}
              className="btn-primary flex-1"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Finish'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
