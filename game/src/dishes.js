// Pasar Malam Sizzle — recipes, ingredients and prices.
// Every dish is an original Indonesian night-market favourite. A dish is
// defined by the ingredients it needs, the station that cooks it (or none
// for a cold drink) and its base price in rupiah.

// Seeded random: the same seed always deals the same customers and orders,
// so screenshots and replays are reproducible.
export function makeRng(seed) {
  let s = (seed >>> 0) || 1;
  return function next() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function pick(rng, list) {
  return list[Math.floor(rng() * list.length)];
}

export const INGREDIENTS = [
  { id: 'nasi',   name: 'Nasi',    key: '1', color: '#fff3d6', accent: '#e8c87a', price: 0 },
  { id: 'mie',    name: 'Mie',     key: '2', color: '#ffd27a', accent: '#e8a33d', price: 0 },
  { id: 'ayam',   name: 'Ayam',    key: '3', color: '#f2b879', accent: '#c47a2e', price: 0 },
  { id: 'telur',  name: 'Telur',   key: '4', color: '#fff8e0', accent: '#f0c040', price: 0 },
  { id: 'sayur',  name: 'Sayur',   key: '5', color: '#7ed957', accent: '#3f9e3f', price: 0 },
  { id: 'sate',   name: 'Sate',    key: '6', color: '#c97b3d', accent: '#7a3f14', price: 0 },
  { id: 'sambal', name: 'Sambal',  key: '7', color: '#e8382a', accent: '#8f1408', price: 0 },
  { id: 'teh',    name: 'Es Teh',  key: '8', color: '#d98e32', accent: '#8a5a14', price: 0 },
];

export const ING_BY_ID = Object.fromEntries(INGREDIENTS.map((g) => [g.id, g]));

// station: 'wajan' (wok), 'panggang' (grill) or null (served cold, no cooking).
export const DISHES = [
  {
    id: 'nasi-goreng', name: 'Nasi Goreng', station: 'wajan', price: 15000,
    needs: ['nasi', 'telur', 'sayur'],
    short: 'Nasi Goreng', color: '#f5b942', icon: 'nasi',
  },
  {
    id: 'mie-goreng', name: 'Mie Goreng', station: 'wajan', price: 14000,
    needs: ['mie', 'ayam', 'sayur'],
    short: 'Mie Goreng', color: '#ff9d45', icon: 'mie',
  },
  {
    id: 'sate-ayam', name: 'Sate Ayam', station: 'panggang', price: 18000,
    needs: ['sate', 'sambal'],
    short: 'Sate Ayam', color: '#c97b3d', icon: 'sate',
  },
  {
    id: 'es-teh', name: 'Es Teh Manis', station: null, price: 8000,
    needs: ['teh'],
    short: 'Es Teh Manis', color: '#d98e32', icon: 'teh',
  },
];

export const DISH_BY_ID = Object.fromEntries(DISHES.map((d) => [d.id, d]));

// How long a dish takes to cook on its station (ms of marker sweep).
export const COOK_MS = { wajan: 2600, panggang: 2200 };

// Patience (seconds) a fresh customer waits; it shrinks as levels rise.
export function patienceFor(level) {
  return Math.max(18, 34 - level * 3);
}

// Pick a dish for a new customer: cheap cold drinks are common early on,
// grilled sate shows up more once the stall levels up.
export function randomDish(rng, level) {
  const pool = ['nasi-goreng', 'mie-goreng', 'es-teh', 'es-teh', 'sate-ayam'];
  if (level >= 2) pool.push('sate-ayam', 'nasi-goreng');
  if (level >= 3) pool.push('mie-goreng');
  return DISH_BY_ID[pick(rng, pool)];
}

// A dish's tray matches when it holds exactly the recipe's ingredients.
export function trayMatches(tray, dish) {
  if (tray.length !== dish.needs.length) return false;
  const have = [...tray].sort().join(',');
  const want = [...dish.needs].sort().join(',');
  return have === want;
}

// Which dishes could the current tray still become?
export function trayCandidates(tray) {
  return DISHES.filter((d) => tray.every((g) => d.needs.includes(g)));
}
