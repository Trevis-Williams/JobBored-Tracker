import Food from '../models/Food.js';
import { lookupByBarcode, searchByName } from '../services/foodLookup.js';

export async function getByBarcode(req, res) {
  const { code } = req.params;

  let food = await Food.findOne({ barcode: code });
  if (food) return res.json(food);

  const data = await lookupByBarcode(code);
  if (!data) {
    return res.status(404).json({ message: 'Product not found' });
  }

  food = await Food.create(data);
  res.json(food);
}

export async function search(req, res) {
  const { q } = req.query;
  if (!q) return res.status(400).json({ message: 'Query is required' });

  const cached = await Food.find(
    { $text: { $search: q } },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(20);

  if (cached.length >= 5) return res.json(cached);

  const external = await searchByName(q);
  const merged = [...cached];

  for (const item of external) {
    const exists = merged.find(
      (m) =>
        (m.barcode && m.barcode === item.barcode) ||
        m.name.toLowerCase() === item.name.toLowerCase()
    );
    if (!exists) {
      try {
        const saved = await Food.create(item);
        merged.push(saved);
      } catch {
        merged.push(item);
      }
    }
  }

  res.json(merged.slice(0, 20));
}

export async function getById(req, res) {
  const food = await Food.findById(req.params.id);
  if (!food) return res.status(404).json({ message: 'Food not found' });
  res.json(food);
}

export async function createManual(req, res) {
  const food = await Food.create({ ...req.validated, source: 'manual' });
  res.status(201).json(food);
}

async function findBestMatch(query) {
  const cached = await Food.find(
    { $text: { $search: query } },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(3);

  if (cached.length > 0) return cached[0];

  const external = await searchByName(query);
  if (external.length > 0) {
    try {
      return await Food.create(external[0]);
    } catch {
      return external[0];
    }
  }

  return null;
}

export async function batchSearch(req, res) {
  const { ingredients } = req.body;
  if (!ingredients || !Array.isArray(ingredients)) {
    return res.status(400).json({ message: 'ingredients array is required' });
  }

  const results = await Promise.all(
    ingredients.map(async (query) => {
      try {
        const match = await findBestMatch(query);
        return { query, match };
      } catch {
        return { query, match: null };
      }
    })
  );

  res.json(results);
}
