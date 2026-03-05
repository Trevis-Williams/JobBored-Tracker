const UNIT_ALIASES = {
  cup: ['cup', 'cups', 'c'],
  tbsp: ['tbsp', 'tbsp.', 'tablespoon', 'tablespoons', 'tbs', 'tbs.'],
  tsp: ['tsp', 'tsp.', 'teaspoon', 'teaspoons'],
  oz: ['oz', 'oz.', 'ounce', 'ounces'],
  lb: ['lb', 'lb.', 'lbs', 'lbs.', 'pound', 'pounds'],
  g: ['g', 'gram', 'grams'],
  kg: ['kg', 'kilogram', 'kilograms'],
  ml: ['ml', 'milliliter', 'milliliters', 'millilitre'],
  l: ['l', 'liter', 'liters', 'litre', 'litres'],
  clove: ['clove', 'cloves'],
  slice: ['slice', 'slices'],
  piece: ['piece', 'pieces', 'pc', 'pcs'],
  can: ['can', 'cans'],
  bunch: ['bunch', 'bunches'],
  pinch: ['pinch', 'pinches'],
  dash: ['dash', 'dashes'],
  stick: ['stick', 'sticks'],
  head: ['head', 'heads'],
  sprig: ['sprig', 'sprigs'],
  stalk: ['stalk', 'stalks'],
  ear: ['ear', 'ears'],
  fillet: ['fillet', 'fillets'],
  breast: ['breast', 'breasts'],
  thigh: ['thigh', 'thighs'],
  whole: ['whole'],
  large: ['large'],
  medium: ['medium'],
  small: ['small'],
};

const UNIT_MAP = {};
for (const [canonical, aliases] of Object.entries(UNIT_ALIASES)) {
  for (const alias of aliases) {
    UNIT_MAP[alias.toLowerCase()] = canonical;
  }
}

const BASE_UNIT_GRAMS = {
  cup: 240, tbsp: 15, tsp: 5, oz: 28.35, lb: 453.6,
  g: 1, kg: 1000, ml: 1, l: 1000,
  clove: 3, slice: 30, piece: 100, can: 400,
  stick: 113, pinch: 0.5, dash: 0.5, head: 600,
  bunch: 150, sprig: 2, stalk: 60, ear: 100,
  fillet: 200, breast: 260, thigh: 180, whole: 150,
  large: 150, medium: 130, small: 100,
};

const DENSITY_OVERRIDES = {
  flour: { cup: 125 },
  'all-purpose flour': { cup: 125 },
  'bread flour': { cup: 130 },
  sugar: { cup: 200 },
  'brown sugar': { cup: 220 },
  'powdered sugar': { cup: 120 },
  butter: { cup: 227, tbsp: 14, stick: 113 },
  'salted butter': { cup: 227, tbsp: 14, stick: 113 },
  'unsalted butter': { cup: 227, tbsp: 14, stick: 113 },
  honey: { cup: 340, tbsp: 21 },
  'olive oil': { cup: 216, tbsp: 13.5 },
  'vegetable oil': { cup: 218, tbsp: 13.6 },
  oil: { cup: 218, tbsp: 13.6 },
  milk: { cup: 244 },
  'heavy cream': { cup: 238, tbsp: 15 },
  cream: { cup: 238 },
  'sour cream': { cup: 230 },
  'cream cheese': { cup: 232 },
  rice: { cup: 185 },
  oats: { cup: 80 },
  'rolled oats': { cup: 80 },
  'cocoa powder': { cup: 86 },
  'parmesan': { cup: 100 },
  'grated parmesan': { cup: 100 },
  'shredded cheese': { cup: 113 },
  'chicken broth': { cup: 240 },
  'tomato paste': { tbsp: 16 },
  'soy sauce': { tbsp: 18 },
};

function parseFraction(str) {
  str = str.trim();
  if (!str) return 0;

  const mixed = str.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return parseInt(mixed[1]) + parseInt(mixed[2]) / parseInt(mixed[3]);

  const frac = str.match(/^(\d+)\/(\d+)$/);
  if (frac) return parseInt(frac[1]) / parseInt(frac[2]);

  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

const SKIP_PHRASES = [
  'to taste', 'as needed', 'for serving', 'for garnish',
  'optional', 'to garnish', 'for topping',
];

export function parseIngredientLine(line) {
  line = line.trim();
  if (!line) return null;

  const isSkipLine = SKIP_PHRASES.some((p) => line.toLowerCase().includes(p)) &&
    !line.match(/^\d/);
  if (isSkipLine) return { qty: 0, unit: null, name: line, grams: 0, skipped: true };

  let cleaned = line
    .replace(/\(.*?\)/g, '')
    .replace(/,\s*(finely |roughly |freshly |thinly )?(chopped|diced|minced|grated|sliced|cubed|crushed|julienned|torn|halved|quartered|divided|melted|softened|packed|sifted|peeled|deveined|trimmed|rinsed|drained).*$/i, '')
    .replace(/,\s*(for serving|for garnish|to taste|plus more|as needed|optional).*$/i, '')
    .replace(/,\s*$/, '')
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const qtyMatch = cleaned.match(/^([\d\s/]+(?:\s+\d+\/\d+)?)\s*/);
  let qty = 0;
  let rest = cleaned;

  if (qtyMatch) {
    qty = parseFraction(qtyMatch[1]);
    rest = cleaned.slice(qtyMatch[0].length).trim();
  }

  if (qty === 0) {
    return { qty: 0, unit: null, name: line, grams: 0, skipped: true };
  }

  let unit = null;
  const words = rest.split(/\s+/);
  const firstWord = words[0]?.toLowerCase().replace(/\.$/, '');

  if (UNIT_MAP[firstWord]) {
    unit = UNIT_MAP[firstWord];
    rest = words.slice(1).join(' ');
  } else if (words.length > 1) {
    const twoWord = `${firstWord} ${words[1]?.toLowerCase().replace(/\.$/, '')}`;
    if (UNIT_MAP[twoWord]) {
      unit = UNIT_MAP[twoWord];
      rest = words.slice(2).join(' ');
    }
  }

  const name = rest
    .replace(/^(of\s+)/i, '')
    .trim()
    .toLowerCase();

  const grams = convertToGrams(qty, unit, name);

  return { qty, unit, name, grams, skipped: false };
}

function convertToGrams(qty, unit, ingredientName) {
  if (!unit) return qty * 100;

  if (unit === 'g') return qty;
  if (unit === 'kg') return qty * 1000;

  const override = DENSITY_OVERRIDES[ingredientName];
  if (override && override[unit]) return qty * override[unit];

  for (const [key, densities] of Object.entries(DENSITY_OVERRIDES)) {
    if (ingredientName.includes(key) && densities[unit]) {
      return qty * densities[unit];
    }
  }

  return qty * (BASE_UNIT_GRAMS[unit] || 100);
}

export function parseRecipeText(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map(parseIngredientLine)
    .filter(Boolean);
}

export function calculateIngredientNutrition(ingredient, foodMatch) {
  if (!foodMatch || ingredient.skipped || ingredient.grams === 0) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 };
  }

  const per100 = foodMatch.nutritionPer100g || {};
  const factor = ingredient.grams / 100;

  return {
    calories: Math.round((per100.calories || 0) * factor),
    protein: Math.round((per100.protein || 0) * factor * 10) / 10,
    carbs: Math.round((per100.carbs || 0) * factor * 10) / 10,
    fat: Math.round((per100.fat || 0) * factor * 10) / 10,
    fiber: Math.round((per100.fiber || 0) * factor * 10) / 10,
    sugar: Math.round((per100.sugar || 0) * factor * 10) / 10,
    sodium: Math.round((per100.sodium || 0) * factor * 10) / 10,
  };
}

export function sumNutrition(nutritionArray) {
  return nutritionArray.reduce(
    (acc, n) => ({
      calories: acc.calories + (n.calories || 0),
      protein: Math.round((acc.protein + (n.protein || 0)) * 10) / 10,
      carbs: Math.round((acc.carbs + (n.carbs || 0)) * 10) / 10,
      fat: Math.round((acc.fat + (n.fat || 0)) * 10) / 10,
      fiber: Math.round((acc.fiber + (n.fiber || 0)) * 10) / 10,
      sugar: Math.round((acc.sugar + (n.sugar || 0)) * 10) / 10,
      sodium: Math.round((acc.sodium + (n.sodium || 0)) * 10) / 10,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
  );
}

export function divideNutrition(nutrition, servings) {
  if (!servings || servings <= 0) return nutrition;
  return {
    calories: Math.round(nutrition.calories / servings),
    protein: Math.round((nutrition.protein / servings) * 10) / 10,
    carbs: Math.round((nutrition.carbs / servings) * 10) / 10,
    fat: Math.round((nutrition.fat / servings) * 10) / 10,
    fiber: Math.round((nutrition.fiber / servings) * 10) / 10,
    sugar: Math.round((nutrition.sugar / servings) * 10) / 10,
    sodium: Math.round((nutrition.sodium / servings) * 10) / 10,
  };
}
