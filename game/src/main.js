// Pasar Malam Sizzle — game loop, state and input.
// The stall runs on a 150-second day: customers queue with patience bars,
// the cook assembles their dish from the counter, cooks it at the right
// station with a timing bar, and serves it before the customer walks away.

import { INGREDIENTS, DISHES, DISH_BY_ID, trayMatches, trayCandidates, patienceFor, randomDish, makeRng, COOK_MS } from './dishes.js';
import { SoundBank } from './audio.js';
import { drawScene, W, H } from './render.js';
import { buildShot } from './shots.js';

const DAY_SECONDS = 150;
const MAX_CUSTOMERS = 4;
const STRIKES_TO_CLOSE = 3;
const SERVES_PER_LEVEL = 6;

const CUSTOMER_LOOKS = [
  { skin: '#f2c79b', shirt: '#e84545', hair: '#2b2118', hat: 'cap' },
  { skin: '#d9a066', shirt: '#4cc9f0', hair: '#111111', hat: 'band' },
  { skin: '#f2c79b', shirt: '#7ed957', hair: '#5a3a22', hat: 'topi' },
  { skin: '#c98d5f', shirt: '#ff9de2', hair: '#1a1a1a', hat: 'none' },
  { skin: '#f2c79b', shirt: '#ffd23f', hair: '#3d2716', hat: 'cap' },
  { skin: '#d9a066', shirt: '#b388ff', hair: '#222222', hat: 'band' },
];

const TIPS = [
  'Pilih pelanggan dulu, baru racik pesanannya.',
  'Zona hijau = masakan sempurna. Tengah-tengahnya +bonus!',
  'Es Teh Manis tidak perlu dimasak — langsung sajikan.',
  'Sajikan cepat selagi pelanggan sabar: ada tip!',
  'Kombo naik kalau sajianmu beruntun tanpa gagal.',
];

export function createGame(canvas) {
  const ctx = canvas.getContext('2d');
  const sounds = new SoundBank();
  const rng = makeRng((Date.now() % 2147483647) || 7);

  const g = {
    mode: 'title',
    time: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
    level: 1,
    served: 0,
    perfects: 0,
    strikes: 0,
    dayLeft: DAY_SECONDS,
    dayTotal: DAY_SECONDS,
    customers: [],
    nextCustomerId: 1,
    selected: null,
    tray: [],
    candidates: [],
    cookReady: false,
    cooking: null,
    plate: null,
    popups: [],
    stationGlow: null,
    tip: TIPS[0],
    tipTimer: 0,
    ingredients: INGREDIENTS,
    best: 0,
    spawnTimer: 2.2,
    shot: null,
    sounds,
  };
  try { g.best = Number(localStorage.getItem('pasar-malam-sizzle-best') || 0) || 0; } catch { g.best = 0; }

  function saveBest() {
    if (g.score > g.best) {
      g.best = g.score;
      try { localStorage.setItem('pasar-malam-sizzle-best', String(g.best)); } catch { /* no storage */ }
    }
  }

  function popup(x, y, text, color, size = 22) {
    g.popups.push({ x, y, text, color, size, life: 1.6, maxLife: 1.6 });
  }

  function freeSlot() {
    for (let i = 0; i < MAX_CUSTOMERS; i++) {
      if (!g.customers.some((c) => c.slot === i && c.state !== 'gone')) return i;
    }
    return -1;
  }

  function spawnCustomer() {
    const slot = freeSlot();
    if (slot < 0) return;
    const look = CUSTOMER_LOOKS[Math.floor(rng() * CUSTOMER_LOOKS.length)];
    const dish = randomDish(rng, g.level);
    const maxPatience = patienceFor(g.level) * (0.9 + rng() * 0.25);
    g.customers.push({
      id: g.nextCustomerId++,
      dish: dish.id,
      patience: maxPatience,
      maxPatience,
      slot,
      state: 'waiting',
      leaveT: 0,
      ...look,
    });
  }

  function refreshCookReady() {
    g.candidates = trayCandidates(g.tray);
    const exact = DISHES.find((d) => trayMatches(g.tray, d));
    if (!exact) { g.cookReady = false; return; }
    const wanted = g.customers.some((c) => c.state === 'waiting' && c.dish === exact.id);
    const selectedWants = g.selected != null &&
      g.customers.some((c) => c.id === g.selected && c.state === 'waiting' && c.dish === exact.id);
    g.cookReady = wanted && (selectedWants || g.selected == null);
    if (exact && wanted && !selectedWants && g.selected != null) {
      g.tip = 'Pesanan itu bukan milik pelanggan terpilih — pilih yang memesannya.';
    }
  }

  function selectCustomer(id) {
    const c = g.customers.find((x) => x.id === id);
    if (!c || c.state !== 'waiting') return;
    g.selected = id;
    sounds.click();
    refreshCookReady();
  }

  function addIngredient(ingId) {
    if (g.mode !== 'play' || g.cooking) return;
    if (g.tray.includes(ingId)) { sounds.drop(); return; }
    if (g.tray.length >= 3) { sounds.drop(); return; }
    g.tray.push(ingId);
    sounds.pick();
    refreshCookReady();
  }

  function clearTray() {
    if (g.tray.length === 0) return;
    g.tray = [];
    sounds.drop();
    refreshCookReady();
  }

  function startCooking() {
    if (g.mode !== 'play' || g.cooking || !g.cookReady) return;
    const dish = DISHES.find((d) => trayMatches(g.tray, d));
    if (!dish) return;
    if (dish.station === null) {
      // Cold drink: no timing game, straight to the serving plate.
      g.plate = { dish: dish.id, quality: 'ok' };
      g.tray = [];
      g.stationGlow = null;
      sounds.serve();
      popup(1150, 150, 'Es Teh siap!', '#7ed957', 20);
      refreshCookReady();
      return;
    }
    g.cooking = {
      dish: dish.id,
      station: dish.station,
      pos: 0,
      dir: 1,
      ms: COOK_MS[dish.station],
      zone: { green: [0.42, 0.58], yellow: [0.30, 0.70] },
    };
    g.stationGlow = dish.station;
    sounds.sizzle();
  }

  function stopCooking() {
    const c = g.cooking;
    if (!c) return;
    const dish = DISH_BY_ID[c.dish];
    const d = Math.abs(c.pos - 0.5);
    g.cooking = null;
    g.stationGlow = null;
    if (d <= 0.03) {
      g.plate = { dish: c.dish, quality: 'perfect' };
      g.tray = [];
      sounds.perfect();
      popup(560, 300, 'SEMPURNA! +Rp 5.000', '#ffd23f', 26);
    } else if (d <= 0.08) {
      g.plate = { dish: c.dish, quality: 'good' };
      g.tray = [];
      sounds.serve();
      popup(560, 300, 'Matang pas!', '#7ed957', 22);
    } else if (d <= 0.20) {
      g.plate = { dish: c.dish, quality: 'ok' };
      g.tray = [];
      sounds.serve();
      popup(560, 300, 'Agak gosong dikit…', '#ffb347', 20);
    } else {
      g.tray = [];
      g.combo = 0;
      sounds.burnt();
      popup(560, 300, 'GOSONG! Bahan terbuang.', '#ff4d4d', 24);
    }
    refreshCookReady();
  }

  function serve() {
    if (g.mode !== 'play' || !g.plate || g.selected == null) return;
    const c = g.customers.find((x) => x.id === g.selected && x.state === 'waiting');
    if (!c || c.dish !== g.plate.dish) {
      sounds.drop();
      g.tip = 'Piring ini bukan pesanan pelanggan terpilih.';
      return;
    }
    const dish = DISH_BY_ID[g.plate.dish];
    const mult = 1 + g.combo * 0.1;
    let gain = Math.round(dish.price * mult);
    if (g.plate.quality === 'perfect') gain += 5000;
    if (c.patience / c.maxPatience > 0.7) gain += 2000;
    g.score += gain;
    g.combo += 1;
    g.bestCombo = Math.max(g.bestCombo, g.combo);
    g.served += 1;
    if (g.plate.quality === 'perfect') g.perfects += 1;
    sounds.serve();
    if (g.combo >= 3) sounds.coins();
    popup(700, 180, '+Rp ' + gain.toLocaleString('id-ID'), '#ffd23f', 24);
    c.state = 'eating';
    c.leaveT = 0.7;
    g.plate = null;
    g.selected = null;
    if (g.served % SERVES_PER_LEVEL === 0) {
      g.level += 1;
      sounds.levelUp();
      popup(640, 120, 'LEVEL ' + g.level + '! Pelanggan makin lapar!', '#ff9de2', 26);
    }
    refreshCookReady();
  }

  function startDay() {
    g.mode = 'play';
    g.score = 0; g.combo = 0; g.bestCombo = 0; g.level = 1;
    g.served = 0; g.perfects = 0; g.strikes = 0;
    g.dayLeft = DAY_SECONDS;
    g.customers = [];
    g.selected = null; g.tray = []; g.cooking = null; g.plate = null;
    g.popups = [];
    g.spawnTimer = 1.2;
    g.tip = TIPS[0];
    spawnCustomer();
    spawnCustomer();
  }

  function endDay() {
    g.mode = 'over';
    saveBest();
    sounds.gameOver();
  }

  function update(dt) {
    g.time += dt * 1000;
    g.popups = g.popups.filter((p) => (p.life -= dt) > 0);
    if (g.mode !== 'play' || g.shot) {
      // Frozen screenshot scenes still animate their cooking marker.
      if (g.shot && g.cooking) {
        const c = g.cooking;
        c.pos += (c.dir * dt * 1000) / c.ms;
        if (c.pos >= 1) { c.pos = 1; c.dir = -1; }
        if (c.pos <= 0) { c.pos = 0; c.dir = 1; }
      }
      return;
    }
    g.dayLeft -= dt;
    if (g.dayLeft <= 0) { g.dayLeft = 0; endDay(); return; }
    g.tipTimer += dt;
    if (g.tipTimer > 9) {
      g.tipTimer = 0;
      g.tip = TIPS[Math.floor(Math.random() * TIPS.length)];
    }
    // spawn
    g.spawnTimer -= dt;
    const interval = Math.max(2.2, 4.6 - g.level * 0.35);
    if (g.spawnTimer <= 0) {
      g.spawnTimer = interval * (0.85 + Math.random() * 0.3);
      spawnCustomer();
    }
    // patience + leaving customers
    for (const c of g.customers) {
      if (c.state === 'waiting') {
        c.patience -= dt;
        if (c.patience <= 0) {
          c.state = 'leaving';
          c.leaveT = 0.9;
          g.strikes += 1;
          g.combo = 0;
          sounds.angry();
          popup(340 + c.slot * 180, 140, 'Pelanggan kabur!', '#ff4d4d', 20);
          if (g.selected === c.id) { g.selected = null; refreshCookReady(); }
          if (g.strikes >= STRIKES_TO_CLOSE) { endDay(); return; }
        }
      } else if (c.state === 'eating' || c.state === 'leaving') {
        c.leaveT -= dt;
        if (c.leaveT <= 0) c.state = 'gone';
      }
    }
    g.customers = g.customers.filter((c) => c.state !== 'gone');
    // cooking marker sweep
    if (g.cooking) {
      const c = g.cooking;
      c.pos += (c.dir * dt * 1000) / c.ms;
      if (c.pos >= 1) { c.pos = 1; c.dir = -1; }
      if (c.pos <= 0) { c.pos = 0; c.dir = 1; }
    }
  }

  // ---- input ----

  function canvasPos(ev) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (ev.clientX - rect.left) * (W / rect.width),
      y: (ev.clientY - rect.top) * (H / rect.height),
    };
  }

  function hitCustomer(x, y) {
    const slots = [340, 520, 700, 880];
    for (const c of g.customers) {
      if (c.state !== 'waiting') continue;
      const sx = slots[c.slot];
      if (x >= sx - 55 && x <= sx + 55 && y >= 70 && y <= 260) return c;
    }
    return null;
  }

  function hitOrderRow(x, y) {
    if (x < 24 || x > 222) return null;
    const orders = g.customers.filter((c) => c.state === 'waiting' || c.state === 'eating');
    for (let i = 0; i < orders.length; i++) {
      const ry = 142 + i * 62;
      if (y >= ry && y <= ry + 54) return orders[i];
    }
    return null;
  }

  function hitIngredient(x, y) {
    if (y < 592 || y > 700) return null;
    for (let i = 0; i < INGREDIENTS.length; i++) {
      const cx = 92 + i * 158;
      if (Math.abs(x - cx) <= 52) return INGREDIENTS[i];
    }
    return null;
  }

  function inRect(x, y, rx, ry, rw, rh) {
    return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh;
  }

  function handleClick(x, y) {
    sounds.ensure();
    if (g.mode === 'title') { startDay(); return; }
    if (g.mode === 'over') { startDay(); return; }
    if (g.mode !== 'play') return;
    if (g.cooking) { stopCooking(); return; }
    const cust = hitCustomer(x, y) || hitOrderRow(x, y);
    if (cust) { selectCustomer(cust.id); return; }
    // click a chip on the assembly tray to take that ingredient back out
    if (g.tray.length && y >= 464 && y <= 512) {
      for (let i = 0; i < g.tray.length; i++) {
        if (Math.abs(x - (340 + i * 64)) <= 26) {
          g.tray.splice(i, 1);
          sounds.drop();
          refreshCookReady();
          return;
        }
      }
    }
    const ing = hitIngredient(x, y);
    if (ing) { addIngredient(ing.id); return; }
    if (inRect(x, y, 1058, 292, 184, 52)) { serve(); return; }
    if (inRect(x, y, 1058, 356, 184, 52)) { startCooking(); return; }
    if (inRect(x, y, 1058, 420, 184, 36)) { clearTray(); return; }
  }

  function handleKey(key) {
    sounds.ensure();
    if (key === 'm' || key === 'M') {
      const muted = sounds.toggleMute();
      g.tip = muted ? 'Suara dimatikan.' : 'Suara dinyalakan.';
      return;
    }
    if (g.mode === 'title' && (key === ' ' || key === 'Enter')) { startDay(); return; }
    if (g.mode === 'over' && (key === 'r' || key === 'R' || key === ' ')) { startDay(); return; }
    if (g.mode !== 'play') return;
    if (key >= '1' && key <= '8') {
      const ing = INGREDIENTS[Number(key) - 1];
      if (ing) addIngredient(ing.id);
      return;
    }
    if (key === ' ') {
      if (g.cooking) stopCooking();
      else startCooking();
      return;
    }
    if (key === 'Enter') { serve(); return; }
    if (key === 't' || key === 'T') { clearTray(); return; }
    if (key === 'r' || key === 'R') { startDay(); return; }
  }

  canvas.addEventListener('click', (ev) => {
    const p = canvasPos(ev);
    handleClick(p.x, p.y);
  });
  window.addEventListener('keydown', (ev) => {
    if ([' ', 'Enter'].includes(ev.key)) ev.preventDefault();
    handleKey(ev.key);
  });

  // ---- shots (fixed scenes for screenshots) ----
  const params = new URLSearchParams(window.location.search);
  const shotName = params.get('shot');
  if (shotName) {
    const seed = Number(params.get('seed') || 7);
    buildShot(g, shotName, seed, { spawnCustomer, selectCustomer, refreshCookReady });
    g.shot = shotName;
  }

  // ---- debug hook for automated drive tests ----
  window.__sizzle = {
    game: g,
    click(x, y) { handleClick(x, y); },
    key(k) { handleKey(k); },
    state() {
      return {
        mode: g.mode,
        score: g.score,
        combo: g.combo,
        level: g.level,
        served: g.served,
        perfects: g.perfects,
        strikes: g.strikes,
        dayLeft: Math.round(g.dayLeft),
        tray: [...g.tray],
        plate: g.plate ? { ...g.plate } : null,
        cooking: !!g.cooking,
        cookReady: g.cookReady,
        selected: g.selected,
        customers: g.customers.map((c) => ({ id: c.id, dish: c.dish, state: c.state, patience: Math.round(c.patience) })),
      };
    },
  };

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    drawScene(ctx, g, g.time);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return g;
}

// Boot: the page's only script tag loads this module, so start here.
const canvas = document.getElementById('game');
if (canvas) createGame(canvas);
