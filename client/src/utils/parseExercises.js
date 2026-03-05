const MET_DATABASE = {
  running: 9.8,
  jogging: 7.0,
  sprinting: 14.0,
  walking: 3.5,
  'brisk walking': 4.5,
  'power walking': 5.0,
  hiking: 6.0,
  cycling: 7.5,
  biking: 7.5,
  swimming: 8.0,
  'lap swimming': 9.0,
  'weight lifting': 6.0,
  'weightlifting': 6.0,
  'strength training': 6.0,
  'resistance training': 6.0,
  'bench press': 6.0,
  squats: 6.0,
  deadlifts: 6.0,
  'jump rope': 12.3,
  'jumping rope': 12.3,
  'skipping rope': 12.3,
  yoga: 3.0,
  'hot yoga': 4.0,
  pilates: 3.5,
  stretching: 2.3,
  'foam rolling': 2.0,
  hiit: 8.0,
  'high intensity interval training': 8.0,
  'interval training': 8.0,
  crossfit: 8.0,
  rowing: 7.0,
  'rowing machine': 7.0,
  dancing: 5.0,
  'dance': 5.0,
  zumba: 6.5,
  boxing: 9.0,
  kickboxing: 9.0,
  'martial arts': 7.0,
  'jump squats': 8.0,
  burpees: 8.0,
  'mountain climbers': 8.0,
  planking: 3.5,
  plank: 3.5,
  'push ups': 8.0,
  'pushups': 8.0,
  'pull ups': 8.0,
  'pullups': 8.0,
  'sit ups': 5.0,
  'situps': 5.0,
  crunches: 5.0,
  'jumping jacks': 8.0,
  'elliptical': 5.0,
  'stair climber': 9.0,
  'stair climbing': 9.0,
  'rock climbing': 8.0,
  climbing: 8.0,
  tennis: 7.0,
  basketball: 8.0,
  soccer: 8.0,
  football: 8.0,
  volleyball: 4.0,
  baseball: 5.0,
  golf: 4.5,
  skiing: 7.0,
  snowboarding: 5.5,
  skating: 7.0,
  'ice skating': 7.0,
  surfing: 3.0,
  paddleboarding: 4.0,
  kayaking: 5.0,
  canoeing: 3.5,
  'battle ropes': 10.0,
  'kettlebell': 8.0,
  'tire flips': 8.0,
  'sled push': 8.0,
  'ab workout': 5.0,
  'abs': 5.0,
  'arm workout': 5.5,
  'leg workout': 6.0,
  'back workout': 6.0,
  'chest workout': 6.0,
  'shoulder workout': 5.5,
  'cardio': 7.0,
  'aerobics': 6.5,
  'spin class': 8.5,
  'spinning': 8.5,
  'treadmill': 9.0,
  'stationary bike': 7.0,
};

const UNIT_ALIASES = {
  min: true, mins: true, minute: true, minutes: true, m: true,
};

function findMET(name) {
  const lower = name.toLowerCase().trim();

  if (MET_DATABASE[lower] != null) return { met: MET_DATABASE[lower], matched: lower };

  for (const [key, met] of Object.entries(MET_DATABASE)) {
    if (lower.includes(key) || key.includes(lower)) {
      return { met, matched: key };
    }
  }

  for (const [key, met] of Object.entries(MET_DATABASE)) {
    const words = lower.split(/\s+/);
    if (words.some((w) => key.includes(w) && w.length > 3)) {
      return { met, matched: key };
    }
  }

  return { met: 5.0, matched: null };
}

export function parseExerciseLine(line) {
  line = line.trim();
  if (!line) return null;

  const durationFirst = line.match(/^(\d+)\s*(min|mins|minute|minutes|m)\s+(.+)/i);
  if (durationFirst) {
    const duration = parseInt(durationFirst[1]);
    const name = durationFirst[3].replace(/^of\s+/i, '').trim();
    const { met, matched } = findMET(name);
    return { name, durationMinutes: duration, met, matched, raw: line };
  }

  const durationLast = line.match(/^(.+?)\s+(\d+)\s*(min|mins|minute|minutes|m)$/i);
  if (durationLast) {
    const name = durationLast[1].trim();
    const duration = parseInt(durationLast[2]);
    const { met, matched } = findMET(name);
    return { name, durationMinutes: duration, met, matched, raw: line };
  }

  const durationFor = line.match(/^(.+?)\s+for\s+(\d+)\s*(min|mins|minute|minutes|m)?/i);
  if (durationFor) {
    const name = durationFor[1].trim();
    const duration = parseInt(durationFor[2]);
    const { met, matched } = findMET(name);
    return { name, durationMinutes: duration, met, matched, raw: line };
  }

  const anyNumber = line.match(/(\d+)/);
  if (anyNumber) {
    const duration = parseInt(anyNumber[1]);
    const name = line.replace(/\d+/g, '').replace(/\s*(min|mins|minute|minutes|m)\s*/gi, '').trim();
    if (name) {
      const { met, matched } = findMET(name);
      return { name, durationMinutes: duration, met, matched, raw: line };
    }
  }

  return { name: line, durationMinutes: 0, met: 5.0, matched: null, raw: line };
}

export function parseWorkoutText(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map(parseExerciseLine)
    .filter(Boolean);
}

export function calculateCalories(exercise, weightKg) {
  if (!exercise.durationMinutes || !weightKg) return 0;
  return Math.round(exercise.met * weightKg * (exercise.durationMinutes / 60));
}

export function totalCaloriesBurned(exercises, weightKg) {
  return exercises.reduce((sum, ex) => sum + calculateCalories(ex, weightKg), 0);
}
