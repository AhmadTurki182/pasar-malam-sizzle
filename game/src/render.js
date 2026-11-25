// Pasar Malam Sizzle — every pixel the game shows is drawn here on canvas.
// Night-market look: deep indigo sky, warm lanterns, striped awnings and a
// wooden counter, so the screenshots read at a glance even when shrunk.

import { DISH_BY_ID, ING_BY_ID } from './dishes.js';

export const W = 1280;
export const H = 720;

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function text(ctx, str, x, y, size, color, align = 'center', weight = 800, font = 'system-ui, sans-serif') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// Split a line into as many lines as fit maxWidth at the given size.
export function wrapText(ctx, str, size, maxWidth) {
  ctx.font = `600 ${size}px system-ui, sans-serif`;
  const words = str.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function outlineText(ctx, str, x, y, size, color, stroke, align = 'center', weight = 900) {  ctx.font = `${weight} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.lineWidth = Math.max(3, size / 6);
  ctx.lineJoin = 'round';
  ctx.strokeStyle = stroke;
  ctx.strokeText(str, x, y);
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

// ---- dish and ingredient icons (shared by bubbles, tray and plates) ----

export function drawDishIcon(ctx, dishId, cx, cy, s) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  if (dishId === 'nasi-goreng') {
    ctx.fillStyle = '#f5b942';
    ctx.beginPath(); ctx.arc(0, 4, 16, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff8e0';
    ctx.beginPath(); ctx.ellipse(-4, -2, 8, 6, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f0c040';
    ctx.beginPath(); ctx.arc(-4, -2, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3f9e3f';
    ctx.fillRect(4, 2, 5, 2); ctx.fillRect(9, -3, 4, 2);
  } else if (dishId === 'mie-goreng') {
    ctx.strokeStyle = '#ff9d45'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-14, 6); ctx.quadraticCurveTo(-8, -8, 0, 4);
    ctx.quadraticCurveTo(8, 14, 14, -2); ctx.stroke();
    ctx.strokeStyle = '#e8a33d'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-12, 10); ctx.quadraticCurveTo(-4, 0, 4, 10);
    ctx.quadraticCurveTo(10, 16, 14, 8); ctx.stroke();
    ctx.fillStyle = '#3f9e3f'; ctx.fillRect(-12, -6, 5, 2); ctx.fillRect(6, -8, 5, 2);
  } else if (dishId === 'sate-ayam') {
    ctx.strokeStyle = '#d9c9a8'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(-12, -10); ctx.lineTo(12, 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-10, 10); ctx.lineTo(10, -12); ctx.stroke();
    ctx.fillStyle = '#a8642a';
    [[-8, -6], [-2, 0], [4, 6]].forEach(([x, y]) => {
      ctx.beginPath(); ctx.arc(x, y, 5.5, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = '#e8382a';
    ctx.beginPath(); ctx.arc(9, -8, 3, 0, Math.PI * 2); ctx.fill();
  } else {
    // es teh manis: glass, amber tea, ice, straw
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath(); ctx.moveTo(-10, -12); ctx.lineTo(10, -12); ctx.lineTo(7, 12); ctx.lineTo(-7, 12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d98e32';
    ctx.beginPath(); ctx.moveTo(-8, -6); ctx.lineTo(8, -6); ctx.lineTo(6, 10); ctx.lineTo(-6, 10); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(-5, -2, 4, 4); ctx.fillRect(2, 2, 4, 4);
    ctx.strokeStyle = '#e8382a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(6, -14); ctx.lineTo(10, -24); ctx.stroke();
  }
  ctx.restore();
}

export function drawIngredientIcon(ctx, ingId, cx, cy, r) {
  const g = ING_BY_ID[ingId];
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = g.color;
  ctx.strokeStyle = g.accent;
  ctx.lineWidth = 2;
  if (ingId === 'nasi') {
    ctx.beginPath(); ctx.arc(0, 4, r * 0.8, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  } else if (ingId === 'mie') {
    ctx.strokeStyle = g.accent; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.55, 0.3, Math.PI * 1.6); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, r * 0.3, 0.8, Math.PI * 1.9); ctx.stroke();
  } else if (ingId === 'ayam') {
    ctx.beginPath(); ctx.ellipse(-2, 0, r * 0.6, r * 0.45, -0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(r * 0.45, r * 0.35); ctx.lineTo(r * 0.85, r * 0.7); ctx.stroke();
  } else if (ingId === 'telur') {
    ctx.beginPath(); ctx.ellipse(0, 0, r * 0.75, r * 0.55, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f0c040';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2); ctx.fill();
  } else if (ingId === 'sayur') {
    ctx.fillStyle = '#7ed957';
    for (let i = 0; i < 3; i++) {
      ctx.save(); ctx.rotate((i - 1) * 0.7);
      ctx.beginPath(); ctx.ellipse(0, -r * 0.35, r * 0.28, r * 0.55, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  } else if (ingId === 'sate') {
    ctx.strokeStyle = '#d9c9a8'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(-r * 0.7, -r * 0.7); ctx.lineTo(r * 0.7, r * 0.7); ctx.stroke();
    ctx.fillStyle = '#a8642a';
    [[-0.35, -0.35], [0, 0], [0.35, 0.35]].forEach(([x, y]) => {
      ctx.beginPath(); ctx.arc(x * r, y * r, r * 0.32, 0, Math.PI * 2); ctx.fill();
    });
  } else if (ingId === 'sambal') {
    ctx.beginPath(); ctx.arc(0, 2, r * 0.7, 0, Math.PI); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e8382a';
    [[-0.3, -0.2], [0.1, -0.35], [0.35, -0.1]].forEach(([x, y]) => {
      ctx.beginPath(); ctx.arc(x * r, y * r, r * 0.16, 0, Math.PI * 2); ctx.fill();
    });
  } else {
    // teh: glass
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath(); ctx.moveTo(-r * 0.5, -r * 0.6); ctx.lineTo(r * 0.5, -r * 0.6); ctx.lineTo(r * 0.35, r * 0.6); ctx.lineTo(-r * 0.35, r * 0.6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d98e32';
    ctx.beginPath(); ctx.moveTo(-r * 0.4, -r * 0.2); ctx.lineTo(r * 0.4, -r * 0.2); ctx.lineTo(r * 0.3, r * 0.5); ctx.lineTo(-r * 0.3, r * 0.5); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

// ---- scene pieces ----

function drawStringLights(ctx, time) {
  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.quadraticCurveTo(320, 44, 640, 12);
  ctx.quadraticCurveTo(960, 44, 1280, 8);
  ctx.stroke();
  const colors = ['#ff5d73', '#ffd23f', '#7ed957', '#4cc9f0', '#ff9de2', '#ffb347'];
  for (let i = 0; i < 26; i++) {
    const t = i / 25;
    const x = t * 1280;
    // bulbs hang from the wire in a gentle sag
    const ly = 12 + 30 * Math.sin(t * Math.PI);
    const tw = 0.75 + 0.25 * Math.sin(time / 300 + i * 1.7);
    ctx.globalAlpha = tw;
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath(); ctx.arc(x, ly + 4, 5, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = tw * 0.25;
    ctx.beginPath(); ctx.arc(x, ly + 4, 10, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function patienceColor(frac) {
  if (frac > 0.55) return '#7ed957';
  if (frac > 0.28) return '#ffd23f';
  return '#ff4d4d';
}

function drawCustomer(ctx, c, slotX, baseY, time) {
  const bob = Math.sin(time / 420 + c.slot * 2) * 2;
  const impatience = 1 - c.patience / c.maxPatience;
  const x = slotX;
  const y = baseY + bob;
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(x, baseY + 4, 34, 7, 0, 0, Math.PI * 2); ctx.fill();
  // body
  ctx.fillStyle = c.shirt;
  roundRect(ctx, x - 30, y - 62, 60, 62, 16);
  ctx.fill();
  // arms
  ctx.fillStyle = c.shirt;
  ctx.fillRect(x - 38, y - 56, 10, 34);
  ctx.fillRect(x + 28, y - 56, 10, 34);
  // head
  ctx.fillStyle = c.skin;
  ctx.beginPath(); ctx.arc(x, y - 82, 26, 0, Math.PI * 2); ctx.fill();
  // hair / hat
  ctx.fillStyle = c.hair;
  if (c.hat === 'cap') {
    ctx.beginPath(); ctx.arc(x, y - 88, 26, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.fillRect(x - 26, y - 92, 52, 8);
    ctx.fillRect(x + 8, y - 90, 26, 6);
  } else if (c.hat === 'band') {
    ctx.beginPath(); ctx.arc(x, y - 88, 26, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ff5d73'; ctx.fillRect(x - 26, y - 96, 52, 7);
  } else if (c.hat === 'topi') {
    ctx.fillStyle = c.hair;
    ctx.beginPath(); ctx.ellipse(x, y - 102, 34, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y - 102, 18, Math.PI, 0); ctx.closePath(); ctx.fill();
  } else {
    ctx.beginPath(); ctx.arc(x, y - 90, 26, Math.PI * 0.95, Math.PI * 2.05); ctx.closePath(); ctx.fill();
  }
  // face
  const eyeY = y - 84;
  ctx.fillStyle = '#222';
  ctx.beginPath(); ctx.arc(x - 9, eyeY, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 9, eyeY, 3, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#222'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath();
  if (impatience > 0.7) {
    // angry frown
    ctx.moveTo(x - 8, y - 66); ctx.quadraticCurveTo(x, y - 74, x + 8, y - 66);
    ctx.beginPath(); ctx.moveTo(x - 13, eyeY - 6); ctx.lineTo(x - 5, eyeY - 3);
    ctx.moveTo(x + 13, eyeY - 6); ctx.lineTo(x + 5, eyeY - 3);
  } else if (impatience > 0.4) {
    ctx.moveTo(x - 7, y - 69); ctx.lineTo(x + 7, y - 69);
  } else {
    ctx.moveTo(x - 8, y - 72); ctx.quadraticCurveTo(x, y - 64, x + 8, y - 72);
  }
  ctx.stroke();
  // blush when happy
  if (impatience < 0.25) {
    ctx.fillStyle = 'rgba(255,93,115,0.5)';
    ctx.beginPath(); ctx.arc(x - 16, y - 74, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 16, y - 74, 4, 0, Math.PI * 2); ctx.fill();
  }
  // order bubble
  const dish = DISH_BY_ID[c.dish];
  const bx = x - 52, by = y - 168, bw = 104, bh = 52;
  ctx.fillStyle = 'rgba(255,255,255,0.97)';
  roundRect(ctx, bx, by, bw, bh, 12); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.moveTo(x - 8, by + bh - 1); ctx.lineTo(x + 8, by + bh - 1); ctx.lineTo(x, by + bh + 10); ctx.closePath(); ctx.fill();
  drawDishIcon(ctx, c.dish, x, by + 20, 1.0);
  text(ctx, dish.short, x, by + 42, 11, '#333', 'center', 800);
  // patience bar
  const frac = Math.max(0, c.patience / c.maxPatience);
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  roundRect(ctx, x - 30, y - 8, 60, 9, 4); ctx.fill();
  ctx.fillStyle = patienceColor(frac);
  if (frac > 0.02) { roundRect(ctx, x - 29, y - 7, 58 * frac, 7, 3); ctx.fill(); }
  if (frac < 0.28) {
    const blink = 0.5 + 0.5 * Math.sin(time / 120);
    ctx.globalAlpha = blink;
    text(ctx, '!', x + 34, y - 30, 22, '#ff4d4d', 'center', 900);
    ctx.globalAlpha = 1;
  }
}

function drawFlame(ctx, cx, cy, s, time, seed) {
  const f = Math.sin(time / 90 + seed) * 0.15 + Math.sin(time / 47 + seed * 2) * 0.1;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1 + f * 0.3, 1 - f * 0.2);
  ctx.fillStyle = '#ff9d00';
  ctx.beginPath();
  ctx.moveTo(-14 * s, 0);
  ctx.quadraticCurveTo(-12 * s, -22 * s, 0, -34 * s);
  ctx.quadraticCurveTo(12 * s, -22 * s, 14 * s, 0);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffe66d';
  ctx.beginPath();
  ctx.moveTo(-7 * s, 0);
  ctx.quadraticCurveTo(-6 * s, -12 * s, 0, -20 * s);
  ctx.quadraticCurveTo(6 * s, -12 * s, 7 * s, 0);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawSmoke(ctx, x, y, time, seed) {
  for (let i = 0; i < 3; i++) {
    const ph = ((time / 1400 + seed + i * 0.33) % 1);
    const sx = x + Math.sin(ph * 6 + seed * 5) * 8;
    const sy = y - ph * 46;
    ctx.globalAlpha = 0.28 * (1 - ph);
    ctx.fillStyle = '#cfd6e4';
    ctx.beginPath(); ctx.arc(sx, sy, 5 + ph * 9, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ---- main scene ----

export function drawScene(ctx, g, time) {
  // night sky + tent glow
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#171138');
  sky.addColorStop(0.45, '#241a55');
  sky.addColorStop(1, '#3a2060');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  // stars
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  for (let i = 0; i < 40; i++) {
    const sx = (i * 173) % 1280;
    const sy = (i * 97) % 120;
    ctx.globalAlpha = 0.3 + 0.4 * Math.abs(Math.sin(time / 700 + i));
    ctx.fillRect(sx, sy, 2, 2);
  }
  ctx.globalAlpha = 1;
  // striped awning across the top
  for (let i = 0; i < 16; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#e84545' : '#fff3e0';
    ctx.beginPath();
    ctx.moveTo(i * 80, 0);
    ctx.lineTo(i * 80 + 80, 0);
    ctx.lineTo(i * 80 + 68, 26);
    ctx.lineTo(i * 80 + 12, 26);
    ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(0, 26, W, 4);
  drawStringLights(ctx, time);

  // ---- top bar: title, timer, score ----
  text(ctx, 'PASAR MALAM SIZZLE', 150, 48, 26, '#ffd23f', 'left', 900);
  text(ctx, 'warung kaki lima • masak cepat, sajikan panas', 150, 70, 12, '#e8dff5', 'left', 600);
  // day timer
  const dayFrac = Math.max(0, g.dayLeft / g.dayTotal);
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  roundRect(ctx, 480, 36, 320, 34, 10); ctx.fill();
  text(ctx, '⏱ ' + fmtTime(g.dayLeft), 500, 53, 20, '#fff', 'left', 800);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  roundRect(ctx, 600, 46, 180, 12, 6); ctx.fill();
  ctx.fillStyle = dayFrac > 0.3 ? '#ffd23f' : '#ff4d4d';
  roundRect(ctx, 601, 47, 178 * dayFrac, 10, 5); ctx.fill();
  // score / combo / level
  text(ctx, 'SKOR', 1080, 40, 12, '#ffd23f', 'right', 800);
  text(ctx, 'Rp ' + g.score.toLocaleString('id-ID'), 1080, 62, 22, '#fff', 'right', 900);
  text(ctx, 'LV ' + g.level, 1120, 40, 14, '#7ed957', 'left', 800);
  if (g.combo >= 2) {
    const pulse = 1 + 0.08 * Math.sin(time / 150);
    ctx.save(); ctx.translate(1180, 62); ctx.scale(pulse, pulse);
    text(ctx, 'KOMBO x' + g.combo, 0, 0, 20, '#ff9de2', 'center', 900);
    ctx.restore();
  } else {
    text(ctx, 'KOMBO x' + g.combo, 1180, 62, 16, '#b9a8d9', 'center', 700);
  }

  // ---- order board (left) ----
  ctx.fillStyle = '#5a3a22';
  roundRect(ctx, 10, 84, 226, 432, 12); ctx.fill();
  ctx.fillStyle = '#3d2716';
  roundRect(ctx, 18, 92, 210, 416, 8); ctx.fill();
  text(ctx, '— PESANAN —', 123, 112, 16, '#ffd23f', 'center', 800);
  ctx.strokeStyle = 'rgba(255,210,63,0.4)';
  ctx.beginPath(); ctx.moveTo(30, 126); ctx.lineTo(216, 126); ctx.stroke();
  const orders = g.customers.filter((c) => c.state === 'waiting' || c.state === 'eating');
  if (orders.length === 0) {
    text(ctx, 'Belum ada pesanan.', 123, 180, 14, '#c9b8a3', 'center', 600);
    text(ctx, 'Pelanggan segera datang!', 123, 204, 13, '#c9b8a3', 'center', 600);
  }
  orders.forEach((c, i) => {
    const y = 150 + i * 62;
    const dish = DISH_BY_ID[c.dish];
    drawDishIcon(ctx, c.dish, 48, y + 12, 0.85);
    text(ctx, dish.short, 76, y + 4, 14, '#fff3e0', 'left', 700);
    text(ctx, 'Rp ' + dish.price.toLocaleString('id-ID'), 76, y + 24, 12, '#ffd23f', 'left', 700);
    const frac = Math.max(0, c.patience / c.maxPatience);
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    roundRect(ctx, 76, y + 36, 140, 8, 4); ctx.fill();
    ctx.fillStyle = patienceColor(frac);
    roundRect(ctx, 77, y + 37, 138 * frac, 6, 3); ctx.fill();
    if (g.selected === c.id) {
      ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 3;
      roundRect(ctx, 24, y - 8, 198, 54, 8); ctx.stroke();
    }
  });
  // strikes + hints
  text(ctx, 'KABUR: ' + '🌶'.repeat(Math.max(0, 3 - g.strikes)) + '·'.repeat(g.strikes), 123, 470, 15, '#ff9de2', 'center', 800);
  text(ctx, '1-8 bahan • Spasi masak', 123, 492, 11, '#c9b8a3', 'center', 600);
  text(ctx, 'Enter sajikan • T buang • M suara', 123, 506, 11, '#c9b8a3', 'center', 600);

  // ---- customers behind the counter ----
  const slots = [340, 520, 700, 880];
  g.customers.forEach((c) => {
    if (c.state === 'gone') return;
    drawCustomer(ctx, c, slots[c.slot], 252, time);
  });

  // ---- wooden counter ----
  ctx.fillStyle = '#7a4a26';
  roundRect(ctx, 244, 252, 778, 26, 8); ctx.fill();
  ctx.fillStyle = '#96603a';
  ctx.fillRect(244, 252, 778, 8);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  for (let x = 260; x < 1000; x += 46) ctx.fillRect(x, 258, 3, 16);

  // ---- cooking stations ----
  drawStations(ctx, g, time);

  // ---- assembly tray ----
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  roundRect(ctx, 300, 440, 520, 76, 12); ctx.fill();
  text(ctx, 'PIRING RACIKAN', 560, 454, 12, '#ffd23f', 'center', 800);
  if (g.tray.length === 0) {
    text(ctx, 'Klik bahan di bawah untuk meracik pesanan…', 560, 488, 14, '#b9a8d9', 'center', 600);
  } else {
    g.tray.forEach((ingId, i) => {
      const cx = 340 + i * 64;
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.beginPath(); ctx.arc(cx, 488, 24, 0, Math.PI * 2); ctx.fill();
      drawIngredientIcon(ctx, ingId, cx, 488, 18);
    });
    const cand = g.candidates;
    if (cand.length === 1) {
      text(ctx, '→ ' + cand[0].short + ' • siap dimasak!', 700, 488, 14, '#7ed957', 'left', 800);
    } else if (cand.length > 1) {
      text(ctx, 'bisa jadi: ' + cand.map((d) => d.short).join(' / '), 700, 488, 13, '#e8dff5', 'left', 600);
    }
  }

  // ---- timing bar (when cooking) ----
  if (g.cooking) drawTimingBar(ctx, g, time);

  // ---- serve panel (right) ----
  ctx.fillStyle = '#5a3a22';
  roundRect(ctx, 1030, 84, 240, 432, 12); ctx.fill();
  ctx.fillStyle = '#3d2716';
  roundRect(ctx, 1038, 92, 224, 416, 8); ctx.fill();
  text(ctx, '— PIRING SAJI —', 1150, 112, 16, '#ffd23f', 'center', 800);
  // big plate
  ctx.fillStyle = '#f5efe2';
  ctx.beginPath(); ctx.ellipse(1150, 192, 92, 74, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e2d7bd';
  ctx.beginPath(); ctx.ellipse(1150, 192, 70, 54, 0, 0, Math.PI * 2); ctx.fill();
  if (g.plate) {
    drawDishIcon(ctx, g.plate.dish, 1150, 188, 2.2);
    drawSmoke(ctx, 1150, 142, time, 3);
    if (g.plate.quality === 'perfect') {
      const tw = 0.6 + 0.4 * Math.sin(time / 200);
      ctx.globalAlpha = tw;
      text(ctx, '★ SEMPURNA ★', 1150, 278, 16, '#ffd23f', 'center', 900);
      ctx.globalAlpha = 1;
    }
  } else {
    text(ctx, 'piring kosong', 1150, 192, 14, '#8a7a63', 'center', 600);
  }
  // serve button
  const serveReady = !!g.plate && g.selected != null;
  ctx.fillStyle = serveReady ? '#2f9e44' : '#555';
  roundRect(ctx, 1058, 292, 184, 52, 12); ctx.fill();
  if (serveReady) {
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    roundRect(ctx, 1058, 292, 184, 20, 12); ctx.fill();
  }
  text(ctx, 'SAJIKAN  ⏎', 1150, 318, 20, '#fff', 'center', 900);
  // cook button
  const cookReady = g.cookReady && !g.cooking;
  ctx.fillStyle = cookReady ? '#e8590c' : '#555';
  roundRect(ctx, 1058, 356, 184, 52, 12); ctx.fill();
  if (cookReady) {
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    roundRect(ctx, 1058, 356, 184, 20, 12); ctx.fill();
  }
  text(ctx, 'MASAK  ␣', 1150, 382, 20, '#fff', 'center', 900);
  // trash button
  ctx.fillStyle = g.tray.length ? '#862e2e' : '#555';
  roundRect(ctx, 1058, 420, 184, 36, 10); ctx.fill();
  text(ctx, 'BUANG BAHAN  (T)', 1150, 438, 14, '#fff', 'center', 800);
  // tip line, wrapped to fit the panel
  const tipLines = wrapText(ctx, g.tip, 13, 204);
  tipLines.slice(0, 2).forEach((line, i) => {
    text(ctx, line, 1150, 478 + i * 16, 13, '#e8dff5', 'center', 600);
  });

  // ---- ingredient counter (bottom) ----
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  roundRect(ctx, 10, 556, 1260, 152, 14); ctx.fill();
  text(ctx, 'BAHAN DI COUNTER  —  klik mangkuk atau tekan 1-8', 640, 576, 13, '#ffd23f', 'center', 800);
  g.ingredients.forEach((ing, i) => {
    const cx = 92 + i * 158;
    const cy = 640;
    const inTray = g.tray.includes(ing.id);
    ctx.fillStyle = inTray ? 'rgba(255,210,63,0.25)' : 'rgba(255,255,255,0.08)';
    ctx.beginPath(); ctx.arc(cx, cy, 44, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = inTray ? '#ffd23f' : 'rgba(255,255,255,0.25)';
    ctx.lineWidth = inTray ? 3 : 2;
    ctx.beginPath(); ctx.arc(cx, cy, 44, 0, Math.PI * 2); ctx.stroke();
    drawIngredientIcon(ctx, ing.id, cx, cy - 4, 30);
    text(ctx, ing.name, cx, cy + 40, 13, '#fff', 'center', 700);
    // key badge
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath(); ctx.arc(cx + 32, cy - 36, 12, 0, Math.PI * 2); ctx.fill();
    text(ctx, ing.key, cx + 32, cy - 35, 13, '#222', 'center', 900);
  });

  // ---- popups ----
  g.popups.forEach((p) => {
    const life = p.life / p.maxLife;
    ctx.globalAlpha = Math.min(1, life * 2);
    outlineText(ctx, p.text, p.x, p.y - (1 - life) * 40, p.size, p.color, 'rgba(0,0,0,0.7)');
    ctx.globalAlpha = 1;
  });

  // ---- overlays ----
  if (g.mode === 'title') drawTitle(ctx, g, time);
  if (g.mode === 'over') drawGameOver(ctx, g, time);
}

function drawStations(ctx, g, time) {
  // WAJAN station
  const wx = 400, wy = 300;
  text(ctx, '🔥 WAJAN', wx, wy - 8, 15, '#ffd23f', 'center', 800);
  ctx.fillStyle = '#2b2b3a';
  roundRect(ctx, wx - 86, wy + 62, 172, 18, 6); ctx.fill();
  const wajanHot = g.cooking && g.cooking.station === 'wajan';
  if (wajanHot || g.stationGlow === 'wajan') {
    drawFlame(ctx, wx - 30, wy + 60, 1.1, time, 1);
    drawFlame(ctx, wx + 30, wy + 60, 1.1, time, 4);
  }
  ctx.fillStyle = '#3a3a4a';
  ctx.beginPath(); ctx.ellipse(wx, wy + 34, 78, 26, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#565670';
  ctx.beginPath(); ctx.ellipse(wx, wy + 30, 70, 20, 0, 0, Math.PI * 2); ctx.fill();
  if (wajanHot) {
    ctx.fillStyle = '#f5b942';
    ctx.beginPath(); ctx.ellipse(wx, wy + 30, 52, 14, 0, 0, Math.PI * 2); ctx.fill();
    drawSmoke(ctx, wx, wy - 6, time, 1);
  }
  ctx.fillStyle = '#1c1c28';
  ctx.fillRect(wx - 78, wy + 82, 12, 26);
  ctx.fillRect(wx + 66, wy + 82, 12, 26);
  // PANGGANGAN station
  const gx = 760, gy = 300;
  text(ctx, '🍢 PANGGANGAN', gx, gy - 8, 15, '#ffd23f', 'center', 800);
  ctx.fillStyle = '#2b2b3a';
  roundRect(ctx, gx - 86, gy + 62, 172, 18, 6); ctx.fill();
  const grillHot = g.cooking && g.cooking.station === 'panggang';
  if (grillHot || g.stationGlow === 'panggang') {
    drawFlame(ctx, gx - 34, gy + 60, 0.9, time, 2);
    drawFlame(ctx, gx + 34, gy + 60, 0.9, time, 6);
  }
  ctx.fillStyle = '#4a3220';
  roundRect(ctx, gx - 78, gy + 8, 156, 52, 10); ctx.fill();
  ctx.strokeStyle = '#1c1c28'; ctx.lineWidth = 3;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath(); ctx.moveTo(gx - 70, gy + 18 + i * 9); ctx.lineTo(gx + 70, gy + 18 + i * 9); ctx.stroke();
  }
  if (grillHot) {
    ctx.strokeStyle = '#d9c9a8'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(gx - 52, gy + 12); ctx.lineTo(gx + 52, gy + 48); ctx.stroke();
    ctx.fillStyle = '#a8642a';
    [[-30, 22], [-6, 32], [18, 42]].forEach(([dx, dy]) => {
      ctx.beginPath(); ctx.arc(gx + dx, gy + dy, 7, 0, Math.PI * 2); ctx.fill();
    });
    drawSmoke(ctx, gx, gy - 6, time, 2);
  }
  ctx.fillStyle = '#1c1c28';
  ctx.fillRect(gx - 78, gy + 82, 12, 26);
  ctx.fillRect(gx + 66, gy + 82, 12, 26);
}

function drawTimingBar(ctx, g, time) {
  const c = g.cooking;
  const x = 270, y = 528, w = 590, h = 22;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  roundRect(ctx, x - 10, y - 26, w + 20, h + 40, 10); ctx.fill();
  text(ctx, 'TEKAN SPASI DI ZONA HIJAU!', x + w / 2, y - 12, 14, '#fff', 'center', 800);
  // zones: red edges, yellow mid, green center
  ctx.fillStyle = '#ff4d4d';
  roundRect(ctx, x, y, w, h, 8); ctx.fill();
  ctx.fillStyle = '#ffd23f';
  ctx.fillRect(x + w * c.zone.yellow[0], y, w * (c.zone.yellow[1] - c.zone.yellow[0]), h);
  ctx.fillStyle = '#2f9e44';
  ctx.fillRect(x + w * c.zone.green[0], y, w * (c.zone.green[1] - c.zone.green[0]), h);
  // perfect center line
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x + w * 0.5, y - 4); ctx.lineTo(x + w * 0.5, y + h + 4); ctx.stroke();
  // marker: white line through the bar, triangle pointing up from below
  const mx = x + w * c.pos;
  ctx.fillStyle = '#fff';
  ctx.fillRect(mx - 3, y - 2, 6, h + 4);
  ctx.beginPath();
  ctx.moveTo(mx, y + h + 12); ctx.lineTo(mx - 8, y + h + 2); ctx.lineTo(mx + 8, y + h + 2); ctx.closePath(); ctx.fill();
  void time;
}

function drawTitle(ctx, g, time) {
  ctx.fillStyle = 'rgba(10,6,28,0.72)';
  ctx.fillRect(0, 0, W, H);
  const bob = Math.sin(time / 500) * 6;
  outlineText(ctx, 'PASAR MALAM', 640, 168 + bob, 60, '#ffd23f', '#7a2e0d');
  outlineText(ctx, 'SIZZLE', 640, 234 + bob, 82, '#ff5d73', '#5c1030');
  text(ctx, 'Warung kaki lima paling ramai se-kota. Masak cepat, sajikan panas,', 640, 302, 19, '#fff', 'center', 600);
  text(ctx, 'jangan sampai pelangganmu kabur kelaparan!', 640, 330, 19, '#fff', 'center', 600);
  // menu card
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  roundRect(ctx, 420, 352, 440, 132, 14); ctx.fill();
  ctx.strokeStyle = 'rgba(255,210,63,0.6)'; ctx.lineWidth = 2;
  roundRect(ctx, 420, 352, 440, 132, 14); ctx.stroke();
  text(ctx, 'MENU MALAM INI', 640, 374, 15, '#ffd23f', 'center', 800);
  const menu = [
    ['Nasi Goreng', 'Rp 15.000', 'Wajan'],
    ['Mie Goreng', 'Rp 14.000', 'Wajan'],
    ['Sate Ayam', 'Rp 18.000', 'Panggangan'],
    ['Es Teh Manis', 'Rp 8.000', 'Tanpa masak'],
  ];
  menu.forEach(([name, price, st], i) => {
    text(ctx, name, 450, 400 + i * 20, 14, '#fff', 'left', 700);
    text(ctx, price + ' • ' + st, 830, 400 + i * 20, 14, '#ffd23f', 'right', 700);
  });
  const blink = 0.6 + 0.4 * Math.sin(time / 250);
  ctx.globalAlpha = blink;
  text(ctx, 'KLIK ATAU TEKAN SPASI UNTUK MULAI', 640, 520, 22, '#fff', 'center', 900);
  ctx.globalAlpha = 1;
  text(ctx, '1-8 pilih bahan  •  Spasi masak / berhenti  •  Enter sajikan  •  T buang  •  M suara', 640, 552, 14, '#b9a8d9', 'center', 600);
  if (g.best > 0) text(ctx, 'Skor terbaik: Rp ' + g.best.toLocaleString('id-ID'), 640, 580, 15, '#7ed957', 'center', 800);
}

function drawGameOver(ctx, g, time) {
  void time;
  ctx.fillStyle = 'rgba(10,6,28,0.78)';
  ctx.fillRect(0, 0, W, H);
  outlineText(ctx, 'WARUNG TUTUP!', 640, 200, 56, '#ff5d73', '#5c1030');
  text(ctx, 'Tiga pelanggan kabur — atau hari sudah malam.', 640, 262, 18, '#fff', 'center', 600);
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  roundRect(ctx, 440, 292, 400, 168, 14); ctx.fill();
  text(ctx, 'SKOR AKHIR', 640, 318, 15, '#ffd23f', 'center', 800);
  text(ctx, 'Rp ' + g.score.toLocaleString('id-ID'), 640, 352, 34, '#fff', 'center', 900);
  text(ctx, 'Hidangan tersaji: ' + g.served + '   •   Sempurna: ' + g.perfects, 640, 392, 16, '#e8dff5', 'center', 700);
  text(ctx, 'Kombo terbaik: x' + g.bestCombo + '   •   Level: ' + g.level, 640, 420, 16, '#e8dff5', 'center', 700);
  if (g.score >= g.best && g.score > 0) {
    text(ctx, '★ SKOR TERBAIK BARU! ★', 640, 448, 17, '#ffd23f', 'center', 900);
  }
  const blink = 0.6 + 0.4 * Math.sin(time / 250);
  ctx.globalAlpha = blink;
  text(ctx, 'TEKAN R UNTUK BUKA LAGI', 640, 520, 22, '#fff', 'center', 900);
  ctx.globalAlpha = 1;
}

export function fmtTime(sec) {
  const s = Math.max(0, Math.ceil(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0');
}
