// Pasar Malam Sizzle — fixed scenes for the entry's screenshots.
// ?shot=start|play|rush|serve&seed=N builds one deterministic moment so
// every screenshot is a real render of the game's own code, reproducible.

import { patienceFor } from './dishes.js';

const LOOKS = [
  { skin: '#f2c79b', shirt: '#e84545', hair: '#2b2118', hat: 'cap' },
  { skin: '#d9a066', shirt: '#4cc9f0', hair: '#111111', hat: 'band' },
  { skin: '#f2c79b', shirt: '#7ed957', hair: '#5a3a22', hat: 'topi' },
  { skin: '#c98d5f', shirt: '#ff9de2', hair: '#1a1a1a', hat: 'none' },
];

function makeCustomer(id, slot, dish, patienceFrac, look, level) {
  const maxPatience = patienceFor(level);
  return {
    id,
    dish,
    patience: maxPatience * patienceFrac,
    maxPatience,
    slot,
    state: 'waiting',
    leaveT: 0,
    ...look,
  };
}

export function buildShot(g, name, seed, helpers) {
  void seed;
  g.mode = name === 'start' ? 'title' : 'play';
  g.customers = [];
  g.tray = [];
  g.cooking = null;
  g.plate = null;
  g.popups = [];
  g.selected = null;
  g.stationGlow = null;

  if (name === 'start') {
    g.score = 0;
    g.combo = 0;
    g.level = 1;
    g.dayLeft = 150;
    g.customers = [
      makeCustomer(1, 0, 'nasi-goreng', 0.9, LOOKS[0], 1),
      makeCustomer(2, 2, 'es-teh', 0.8, LOOKS[2], 1),
    ];
    return;
  }

  if (name === 'play') {
    g.score = 320;
    g.combo = 2;
    g.bestCombo = 2;
    g.level = 1;
    g.served = 4;
    g.dayLeft = 98;
    g.customers = [
      makeCustomer(1, 0, 'nasi-goreng', 0.75, LOOKS[0], 1),
      makeCustomer(2, 1, 'mie-goreng', 0.6, LOOKS[1], 1),
      makeCustomer(3, 2, 'sate-ayam', 0.85, LOOKS[3], 1),
    ];
    g.selected = 1;
    // one dish mid-assembly: nasi + telur on the tray, sayur still to add
    g.tray = ['nasi', 'telur'];
    helpers.refreshCookReady();
    return;
  }

  if (name === 'rush') {
    g.score = 640;
    g.combo = 3;
    g.bestCombo = 3;
    g.level = 2;
    g.served = 9;
    g.dayLeft = 61;
    g.customers = [
      makeCustomer(1, 0, 'sate-ayam', 0.22, LOOKS[3], 2),
      makeCustomer(2, 1, 'mie-goreng', 0.3, LOOKS[1], 2),
      makeCustomer(3, 2, 'nasi-goreng', 0.18, LOOKS[0], 2),
      makeCustomer(4, 3, 'es-teh', 0.45, LOOKS[2], 2),
    ];
    g.selected = 3;
    g.tray = ['nasi', 'telur', 'sayur'];
    g.cooking = {
      dish: 'nasi-goreng',
      station: 'wajan',
      pos: 0.47,
      dir: 1,
      ms: 2600,
      zone: { green: [0.42, 0.58], yellow: [0.30, 0.70] },
    };
    g.stationGlow = 'wajan';
    helpers.refreshCookReady();
    return;
  }

  // serve
  g.score = 890;
  g.combo = 4;
  g.bestCombo = 4;
  g.level = 2;
  g.served = 12;
  g.perfects = 3;
  g.dayLeft = 45;
  g.customers = [
    makeCustomer(1, 0, 'nasi-goreng', 0.8, LOOKS[0], 2),
    makeCustomer(2, 1, 'mie-goreng', 0.55, LOOKS[1], 2),
  ];
  g.selected = 1;
  g.plate = { dish: 'nasi-goreng', quality: 'perfect' };
  g.popups.push({ x: 700, y: 180, text: '+Rp 24.000', color: '#ffd23f', size: 24, life: 1.6, maxLife: 1.6 });
  helpers.refreshCookReady();
}
