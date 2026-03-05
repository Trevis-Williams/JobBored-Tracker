import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Toggle from '../components/ui/Toggle';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { canUseNotifications, getPermissionState, requestPermission, subscribeToPush } from '../hooks/useNotifications';
import api from '../api/axios';
import toast from 'react-hot-toast';

function kgToLbs(kg) { return Math.round(kg * 2.20462 * 10) / 10; }
function cmToFtIn(cm) {
  const totalIn = cm / 2.54;
  return `${Math.floor(totalIn / 12)}' ${Math.round(totalIn % 12)}"`;
}

const ACTIVITY_LABELS = {
  sedentary: 'Sedentary',
  light: 'Lightly Active',
  moderate: 'Moderately Active',
  active: 'Active',
  very_active: 'Very Active',
};

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const isImperial = user?.unitSystem === 'imperial';
  const isAdvanced = user?.accountMode === 'advanced';

  const [goals, setGoals] = useState({
    calories: user?.dailyGoals?.calories || 2000,
    protein: user?.dailyGoals?.protein || 50,
    carbs: user?.dailyGoals?.carbs || 250,
    fat: user?.dailyGoals?.fat || 65,
  });
  const [saving, setSaving] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(user?.notificationsEnabled || false);
  const [notifTimes, setNotifTimes] = useState(user?.notificationTimes || []);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [newTime, setNewTime] = useState('12:00');
  const [savingNotif, setSavingNotif] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const safeGoals = {
        calories: goals.calories || 2000,
        protein: goals.protein || 50,
        carbs: goals.carbs || 250,
        fat: goals.fat || 65,
      };
      const { data } = await api.put('/auth/me', { dailyGoals: safeGoals });
      updateUser(data);
      toast.success('Goals updated!');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleModeToggle = async (checked) => {
    const newMode = checked ? 'advanced' : 'simple';
    try {
      const { data } = await api.put('/auth/me', { accountMode: newMode });
      updateUser(data);
      toast.success(`Switched to ${newMode} mode`);
    } catch {
      toast.error('Failed to update mode');
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const { data } = await api.post('/auth/recalculate-goals');
      updateUser(data);
      setGoals(data.dailyGoals);
      toast.success('Goals recalculated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to recalculate');
    } finally {
      setRecalculating(false);
    }
  };

  const handleChange = (field, value) => {
    setGoals((prev) => ({ ...prev, [field]: value === '' ? '' : (parseInt(value) ?? '') }));
  };

  const displayWeight = user?.weight
    ? (isImperial ? `${kgToLbs(user.weight)} lbs` : `${user.weight} kg`)
    : '—';

  const displayHeight = user?.height
    ? (isImperial ? cmToFtIn(user.height) : `${user.height} cm`)
    : '—';

  return (
    <div>
      <div className="page-container pt-2">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <div className="card animate-fade-in">
          <h2 className="text-base font-semibold text-gray-900 mb-2">Account</h2>
          <p className="text-sm text-gray-500">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>

        <div className="card animate-fade-in stagger-1">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Body Stats</h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Weight</p>
              <p className="text-sm font-semibold text-gray-800">{displayWeight}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Height</p>
              <p className="text-sm font-semibold text-gray-800">{displayHeight}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Age</p>
              <p className="text-sm font-semibold text-gray-800">{user?.age || '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Activity</p>
              <p className="text-sm font-semibold text-gray-800">
                {ACTIVITY_LABELS[user?.activityLevel] || '—'}
              </p>
            </div>
          </div>
        </div>

        <div className="card animate-fade-in stagger-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Tracking Mode</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {isAdvanced ? 'Full macro tracking' : 'Calorie tracking only'}
              </p>
            </div>
            <Toggle checked={isAdvanced} onChange={handleModeToggle} />
          </div>
        </div>

        <div className="card animate-fade-in stagger-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Reminders</h2>
              <p className="text-xs text-gray-500 mt-0.5">Get notified to log food</p>
            </div>
            {canUseNotifications() ? (
              <Toggle
                checked={notifEnabled}
                onChange={async (checked) => {
                  if (checked && getPermissionState() !== 'granted') {
                    const perm = await requestPermission();
                    if (perm !== 'granted') {
                      toast.error('Notification permission denied');
                      return;
                    }
                  }
                  if (checked) {
                    await subscribeToPush();
                  }
                  setNotifEnabled(checked);
                  try {
                    const { data } = await api.put('/auth/me', { notificationsEnabled: checked });
                    updateUser(data);
                  } catch {
                    toast.error('Failed to update');
                    setNotifEnabled(!checked);
                  }
                }}
              />
            ) : (
              <span className="text-xs text-gray-400">Not supported</span>
            )}
          </div>

          {notifEnabled && (
            <div className="space-y-3 animate-fade-in">
              {getPermissionState() === 'denied' && (
                <p className="text-xs text-danger-500">Notifications are blocked. Enable them in your browser settings.</p>
              )}

              <div className="flex flex-wrap gap-2">
                {notifTimes
                  .slice()
                  .sort()
                  .map((time) => (
                    <span key={time} className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 text-sm font-medium px-3 py-1.5 rounded-lg">
                      {time}
                      <button
                        onClick={async () => {
                          const updated = notifTimes.filter((t) => t !== time);
                          setNotifTimes(updated);
                          try {
                            const { data } = await api.put('/auth/me', { notificationTimes: updated });
                            updateUser(data);
                          } catch {
                            toast.error('Failed to update');
                          }
                        }}
                        className="ml-0.5 text-primary-400 hover:text-primary-700"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}

                {!showTimePicker ? (
                  <button
                    onClick={() => setShowTimePicker(true)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add time
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      className="input-field py-1.5 px-2 text-sm w-28"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                    />
                    <button
                      onClick={async () => {
                        if (notifTimes.includes(newTime)) {
                          toast.error('Time already added');
                          return;
                        }
                        const updated = [...notifTimes, newTime];
                        setNotifTimes(updated);
                        setShowTimePicker(false);
                        setSavingNotif(true);
                        try {
                          const { data } = await api.put('/auth/me', { notificationTimes: updated });
                          updateUser(data);
                        } catch {
                          toast.error('Failed to save');
                        } finally {
                          setSavingNotif(false);
                        }
                      }}
                      className="btn-primary text-sm py-1.5 px-3"
                      disabled={savingNotif}
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowTimePicker(false)}
                      className="btn-ghost text-sm py-1.5 px-2"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {notifTimes.length === 0 && (
                <p className="text-xs text-gray-400">No reminder times set. Tap "Add time" to get started.</p>
              )}

              <div className="bg-blue-50 rounded-xl p-3 mt-2">
                <p className="text-xs text-blue-700">
                  <span className="font-semibold">iPhone tip:</span> Add NutriScan to your home screen (Share &gt; Add to Home Screen) to receive notifications even when the app is closed.
                </p>
              </div>
            </div>
          )}
        </div>

        {isAdvanced && (
          <div className="card animate-fade-in space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Daily Goals</h2>
              <button
                onClick={handleRecalculate}
                disabled={recalculating}
                className="text-sm text-primary-600 font-medium hover:underline disabled:opacity-50"
              >
                {recalculating ? 'Calculating...' : 'Recalculate'}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Calories (kcal)</label>
              <input type="number" className="input-field" value={goals.calories} onChange={(e) => handleChange('calories', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Protein (g)</label>
              <input type="number" className="input-field" value={goals.protein} onChange={(e) => handleChange('protein', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Carbs (g)</label>
              <input type="number" className="input-field" value={goals.carbs} onChange={(e) => handleChange('carbs', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fat (g)</label>
              <input type="number" className="input-field" value={goals.fat} onChange={(e) => handleChange('fat', e.target.value)} />
            </div>

            <button onClick={handleSave} className="btn-primary w-full" disabled={saving}>
              {saving ? 'Saving...' : 'Save Goals'}
            </button>
          </div>
        )}

        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="btn-ghost w-full text-danger-500 hover:bg-danger-50"
        >
          Sign Out
        </button>

        <ConfirmDialog
          open={showLogoutConfirm}
          title="Sign out?"
          message="You'll need to log in again to access your data."
          confirmLabel="Sign Out"
          danger
          onConfirm={() => { setShowLogoutConfirm(false); logout(); }}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      </div>
    </div>
  );
}
