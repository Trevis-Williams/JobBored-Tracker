import axios from 'axios';

const OFF_BASE = 'https://world.openfoodfacts.org/api/v2/product';
const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';

function parseOFF(data) {
  const p = data.product;
  if (!p) return null;

  const n = p.nutriments || {};
  return {
    barcode: p.code || null,
    name: p.product_name || 'Unknown Product',
    brand: p.brands || '',
    servingSize: parseFloat(p.serving_quantity) || 100,
    servingUnit: p.serving_quantity_unit || 'g',
    nutritionPer100g: {
      calories: n['energy-kcal_100g'] || 0,
      protein: n.proteins_100g || 0,
      carbs: n.carbohydrates_100g || 0,
      fat: n.fat_100g || 0,
      fiber: n.fiber_100g || 0,
      sugar: n.sugars_100g || 0,
      sodium: n.sodium_100g ? n.sodium_100g * 1000 : 0,
    },
    nutritionPerServing: {
      calories: n['energy-kcal_serving'] || 0,
      protein: n.proteins_serving || 0,
      carbs: n.carbohydrates_serving || 0,
      fat: n.fat_serving || 0,
      fiber: n.fiber_serving || 0,
      sugar: n.sugars_serving || 0,
      sodium: n.sodium_serving ? n.sodium_serving * 1000 : 0,
    },
    ingredients: p.ingredients_text || '',
    allergens: p.allergens_tags?.map((a) => a.replace('en:', '')) || [],
    imageUrl: p.image_front_url || null,
    source: 'openfoodfacts',
  };
}

function parseUSDA(food) {
  if (!food) return null;

  const get = (name) => {
    const nutrient = food.foodNutrients?.find((n) =>
      n.nutrientName?.toLowerCase().includes(name)
    );
    return nutrient?.value || 0;
  };

  return {
    barcode: food.gtinUpc || null,
    name: food.description || 'Unknown Product',
    brand: food.brandOwner || food.brandName || '',
    servingSize: food.servingSize || 100,
    servingUnit: food.servingSizeUnit || 'g',
    nutritionPer100g: {
      calories: get('energy'),
      protein: get('protein'),
      carbs: get('carbohydrate'),
      fat: get('total lipid'),
      fiber: get('fiber'),
      sugar: get('sugars'),
      sodium: get('sodium'),
    },
    nutritionPerServing: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    },
    ingredients: food.ingredients || '',
    allergens: [],
    imageUrl: null,
    source: 'usda',
  };
}

export async function lookupByBarcode(barcode) {
  try {
    const { data } = await axios.get(`${OFF_BASE}/${barcode}`, {
      params: { fields: 'code,product_name,brands,nutriments,serving_quantity,serving_quantity_unit,ingredients_text,allergens_tags,image_front_url' },
      timeout: 5000,
    });

    if (data.status === 1) {
      return parseOFF(data);
    }
  } catch {
    // fall through to USDA
  }

  if (process.env.USDA_API_KEY) {
    try {
      const { data } = await axios.get(`${USDA_BASE}/foods/search`, {
        params: { query: barcode, api_key: process.env.USDA_API_KEY, pageSize: 1 },
        timeout: 5000,
      });
      if (data.foods?.length) {
        return parseUSDA(data.foods[0]);
      }
    } catch {
      // not found
    }
  }

  return null;
}

export async function searchByName(query) {
  const results = [];

  try {
    const { data } = await axios.get('https://world.openfoodfacts.org/cgi/search.pl', {
      params: {
        search_terms: query,
        search_simple: 1,
        action: 'process',
        json: 1,
        page_size: 3,
        fields: 'code,product_name,brands,nutriments,serving_quantity,serving_quantity_unit',
      },
      timeout: 5000,
    });
    for (const product of data.products || []) {
      if (product.product_name && product.nutriments) {
        const parsed = parseOFF({ product });
        if (parsed && parsed.name !== 'Unknown Product') results.push(parsed);
      }
    }
  } catch {
    // ignore OFF errors
  }

  if (process.env.USDA_API_KEY) {
    try {
      const { data } = await axios.get(`${USDA_BASE}/foods/search`, {
        params: { query, api_key: process.env.USDA_API_KEY, pageSize: 20 },
        timeout: 5000,
      });
      for (const food of data.foods || []) {
        const parsed = parseUSDA(food);
        if (parsed) results.push(parsed);
      }
    } catch {
      // ignore USDA errors
    }
  }

  return results;
}
