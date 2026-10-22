'use strict';
// ===== Canvas: mundo a 320x180, texto nítido encima a 3x =====
const W = 320, H = 180, S = 3;
const cv = document.getElementById('c'); cv.width = W * S; cv.height = H * S;
const out = cv.getContext('2d'); out.imageSmoothingEnabled = false;
const buf = document.createElement('canvas'); buf.width = W; buf.height = H;
let g = buf.getContext('2d'); g.imageSmoothingEnabled = false;
const FONT = '"Press Start 2P", monospace';
let texts = [], fade = 0, shake = 0, flashC = '#fff', flashT = 0;

function txt(s, x, y, c = '#fff', z = 8, a = 'left', sh = true) { texts.push([String(s), x, y, c, z, a, sh]); }
function flush() {
  let ox = 0, oy = 0;
  if (shake > 0) { ox = (Math.random() * 2 - 1) * shake * S; oy = (Math.random() * 2 - 1) * shake * S; shake *= 0.9; if (shake < 0.3) shake = 0; }
  out.fillStyle = '#000'; out.fillRect(0, 0, cv.width, cv.height);
  out.drawImage(buf, ox, oy, W * S, H * S);
  out.textBaseline = 'top';
  for (const [s, x, y, c, z, a, sh] of texts) {
    out.font = `${z * S}px ${FONT}`; out.textAlign = a;
    if (sh) { out.fillStyle = '#000'; out.fillText(s, x * S + S, y * S + S); }
    out.fillStyle = c; out.fillText(s, x * S, y * S);
  }
  texts = [];
  if (flashT > 0) { out.globalAlpha = Math.min(1, flashT / 6); out.fillStyle = flashC; out.fillRect(0, 0, cv.width, cv.height); out.globalAlpha = 1; flashT--; }
  if (fade > 0) { out.globalAlpha = Math.min(1, fade); out.fillStyle = '#000'; out.fillRect(0, 0, cv.width, cv.height); out.globalAlpha = 1; }
}
function flash(c = '#fff', t = 8) { flashC = c; flashT = t; }

// ===== Dibujo =====
function R(x, y, w, h, c) { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
function limb(x1, y1, x2, y2, t, c) {
  g.fillStyle = c;
  const dx = x2 - x1, dy = y2 - y1, n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)))), h = t / 2;
  for (let i = 0; i <= n; i++) g.fillRect(Math.round(x1 + dx * i / n - h), Math.round(y1 + dy * i / n - h), t, t);
}
function circ(cx, cy, r, c) {
  g.fillStyle = c;
  for (let dy = -r; dy <= r; dy++) { const w = Math.round(Math.sqrt(r * r - dy * dy)); g.fillRect(Math.round(cx - w), Math.round(cy + dy), w * 2 + 1, 1); }
}
function frame9(x, y, w, h, bg = '#000') { R(x, y, w, h, '#fff'); R(x + 2, y + 2, w - 4, h - 4, bg); }
const sprCache = new Map();
function mkSpr(map, pal, flip) {
  const h = map.length, w = map[0].length, c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d');
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const ch = map[j][flip ? w - 1 - i : i];
    if (ch !== '.' && pal[ch]) { x.fillStyle = pal[ch]; x.fillRect(i, j, 1, 1); }
  }
  return c;
}
function spr(map, pal, x, y, s = 1, flip = false) {
  let c = sprCache.get(map);
  if (!c) { c = [mkSpr(map, pal, false), mkSpr(map, pal, true)]; sprCache.set(map, c); }
  const im = c[flip ? 1 : 0];
  g.drawImage(im, Math.round(x), Math.round(y), im.width * s, im.height * s);
}

// ===== Utilidades =====
const rnd = (a, b) => a + Math.random() * (b - a);
const ri = (a, b) => Math.floor(rnd(a, b + 1));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = a => a[ri(0, a.length - 1)];
const sign = v => v < 0 ? -1 : v > 0 ? 1 : 0;
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

// ===== Partículas =====
let parts = [];
function part(x, y, vx, vy, life, c, s = 1, grav = 0.1) { parts.push({ x, y, vx, vy, life, c, s, grav }); }
function burst(x, y, n, c, sp = 2, s = 2) { for (let i = 0; i < n; i++) part(x, y, rnd(-sp, sp), rnd(-sp * 1.3, sp * 0.5), ri(15, 35), c, s); }
function updParts() { for (const p of parts) { p.x += p.vx; p.y += p.vy; p.vy += p.grav; p.life--; } parts = parts.filter(p => p.life > 0); }
function drawParts() { for (const p of parts) R(p.x, p.y, p.s, p.s, p.c); }

// Lluvia en pantalla (intensidad 0..1, viento -1..1)
const drops = Array.from({ length: 160 }, () => ({ x: rnd(0, W), y: rnd(0, H), v: rnd(4, 7) }));
function rain(int, wind = 0.5, col = 'rgba(170,200,255,0.55)') {
  const n = Math.floor(drops.length * int);
  g.fillStyle = col;
  for (let i = 0; i < n; i++) {
    const d = drops[i]; d.y += d.v; d.x += wind * d.v * 0.6;
    if (d.y > H) { d.y = -6; d.x = rnd(-40, W + 40); }
    if (d.x > W + 40) d.x -= W + 80; if (d.x < -40) d.x += W + 80;
    limb(d.x, d.y, d.x - wind * 3, d.y - 5, 1, col);
  }
}

// ===== Input (teclado + táctil) =====
const keys = {}, pressed = {}, lastPress = {};
let tick = 0;
function keyDown(k) { if (!keys[k]) { pressed[k] = true; lastPress[k] = tick; } keys[k] = true; audioInit(); }
function keyUp(k) { keys[k] = false; }
addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'enter'].includes(k)) e.preventDefault();
  if (!e.repeat) keyDown(k);
});
addEventListener('keyup', e => keyUp(e.key.toLowerCase()));
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
function endTick() { for (const k in pressed) delete pressed[k]; }
const OK = () => pressed['z'] || pressed['enter'] || pressed[' '];
const BACK = () => pressed['x'] || pressed['escape'];

if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
  const t = document.getElementById('touch'); t.style.display = 'block';
  t.querySelectorAll('[data-k]').forEach(b => {
    const k = b.dataset.k;
    const on = e => { e.preventDefault(); keyDown(k); b.classList.add('on'); };
    const off = e => { e.preventDefault(); keyUp(k); b.classList.remove('on'); };
    b.addEventListener('touchstart', on, { passive: false }); b.addEventListener('touchend', off, { passive: false });
    b.addEventListener('touchcancel', off, { passive: false });
  });
}

// ===== Audio: chiptune con WebAudio =====
let AC = null, master = null, noiseBuf = null;
function audioInit() {
  if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
  try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
  master = AC.createGain(); master.gain.value = 0.22; master.connect(AC.destination);
  noiseBuf = AC.createBuffer(1, AC.sampleRate, AC.sampleRate);
  const ch = noiseBuf.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
  nextT = AC.currentTime + 0.05; songT0 = nextT;
}
function tone(f, d, type = 'square', v = 0.3, when = 0, slide = 0) {
  if (!AC) return;
  const t = AC.currentTime + Math.max(0, when), o = AC.createOscillator(), gn = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f + slide), t + d);
  gn.gain.setValueAtTime(v, t); gn.gain.exponentialRampToValueAtTime(0.001, t + d);
  o.connect(gn); gn.connect(master); o.start(t); o.stop(t + d + 0.02);
}
function noise(d, v = 0.3, when = 0, hp = 0) {
  if (!AC) return;
  const t = AC.currentTime + Math.max(0, when), s = AC.createBufferSource(), gn = AC.createGain();
  s.buffer = noiseBuf; gn.gain.setValueAtTime(v, t); gn.gain.exponentialRampToValueAtTime(0.001, t + d);
  let n = s; if (hp) { const f = AC.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp; s.connect(f); n = f; }
  n.connect(gn); gn.connect(master); s.start(t); s.stop(t + d);
}
const SFX = {
  hit: () => { noise(0.1, 0.5, 0, 800); tone(160, 0.08, 'square', 0.25, 0, -80); },
  heavy: () => { noise(0.2, 0.7); tone(90, 0.2, 'square', 0.35, 0, -50); },
  block: () => tone(220, 0.06, 'square', 0.2),
  jump: () => tone(260, 0.12, 'square', 0.15, 0, 260),
  blip: () => tone(700 + Math.random() * 60, 0.03, 'square', 0.06),
  sel: () => tone(990, 0.05, 'square', 0.12),
  beep: (d = 0.35) => tone(1000, d, 'sine', 0.3),
  thunder: () => { noise(1.4, 0.7); noise(0.3, 0.6, 0, 3000); },
  parry: () => { tone(1200, 0.08, 'square', 0.2); tone(1800, 0.15, 'square', 0.2, 0.06); },
  ko: () => tone(500, 0.8, 'square', 0.3, 0, -460),
  pick: () => { tone(660, 0.07); tone(990, 0.1, 'square', 0.3, 0.07); },
  bark: () => { tone(520, 0.08, 'sawtooth', 0.3, 0, -220); tone(470, 0.1, 'sawtooth', 0.3, 0.13, -220); },
  howl: () => { tone(300, 1.6, 'sawtooth', 0.25, 0, 300); tone(450, 1.4, 'triangle', 0.25, 0.1, 200); },
  squawk: () => { tone(1300, 0.12, 'sawtooth', 0.15, 0, 700); tone(1500, 0.1, 'sawtooth', 0.12, 0.13, -400); },
  super: () => { for (let i = 0; i < 6; i++) tone(300 + i * 120, 0.08, 'square', 0.2, i * 0.05); },
  boom: () => { noise(1.5, 0.9); tone(60, 1.2, 'sine', 0.6, 0, -40); },
  coin: () => { tone(988, 0.06); tone(1319, 0.2, 'square', 0.25, 0.06); },
  heal: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.1, 'triangle', 0.3, i * 0.07)); },
};

// Secuenciador: cada canción son pistas de notas por octavo (texto "C4 - E4 ...")
function N(s) { return s.trim().split(/\s+/).map(t => { const m = /^([A-G])(#?)(\d)$/.exec(t); if (!m) return 0; return 12 * (+m[3] + 1) + 'C D EF G A B'.indexOf(m[1]) + (m[2] ? 1 : 0); }); }
const mf = n => 440 * Math.pow(2, (n - 69) / 12);
const SONGS = {
  title: { bpm: 140, t: [
    { w: 'square', v: 0.13, n: N('A4 - C5 E5 D5 C5 B4 G4 A4 - E4 A4 C5 B4 A4 - F4 - A4 C5 E5 - D5 C5 B4 - G4 B4 D5 C5 B4 -') },
    { w: 'triangle', v: 0.3, n: N('A2 - A3 - A2 - A3 - A2 - A3 - E2 - E3 - F2 - F3 - F2 - F3 - G2 - G3 - G2 - G3 -') }], d: 'k-h-s-h-k-h-s-hk' },
  world: { bpm: 112, t: [
    { w: 'square', v: 0.1, n: N('E4 - G4 A4 - G4 E4 D4 C4 - D4 E4 - - - - E4 - G4 A4 - C5 B4 A4 G4 - E4 D4 - - - -') },
    { w: 'triangle', v: 0.3, n: N('C3 - G2 - C3 - G2 - A2 - E2 - A2 - E2 - F2 - C3 - F2 - C3 - G2 - D3 - G2 - D3 -') }], d: 'k-h-s-h-' },
  fight: { bpm: 160, t: [
    { w: 'square', v: 0.11, n: N('E5 E5 - E5 D5 - C5 D5 E5 - G5 - E5 D5 C5 - A4 A4 - C5 E5 - D5 C5 B4 - G4 - B4 C5 D5 -') },
    { w: 'triangle', v: 0.32, n: N('A2 A3 A2 A3 A2 A3 A2 A3 F2 F3 F2 F3 F2 F3 F2 F3 D2 D3 D2 D3 D2 D3 D2 D3 E2 E3 E2 E3 E2 E3 E2 E3') }], d: 'k-hsk-hs' },
  boss: { bpm: 172, t: [
    { w: 'square', v: 0.12, n: N('E4 F4 E4 - E4 F4 G4 - F4 E4 D4 - E4 - B3 - E4 F4 E4 - G4 A4 B4 - C5 B4 A4 - G4 - F4 -') },
    { w: 'sawtooth', v: 0.08, n: N('E5 - - - - - - - - - - - - - - - G5 - - - - - - - F5 - - - - - - -') },
    { w: 'triangle', v: 0.32, n: N('E2 E2 E3 E2 E2 E2 E3 E2 E2 E2 E3 E2 E2 E2 E3 E2 F2 F2 F3 F2 F2 F2 F3 F2 E2 E2 E3 E2 D2 D2 D3 D2') }], d: 'kkhskkhs' },
  banda: { bpm: 120, t: [
    { w: 'square', v: 0.12, n: N('C5 - E5 - G5 - E5 - F5 - D5 - B4 - G4 - A4 - C5 - E5 - C5 - D5 E5 D5 C5 B4 - C5 -') },
    { w: 'square', v: 0.06, n: N('- E4 - E4 - E4 - E4 - D4 - D4 - D4 - D4 - E4 - E4 - E4 - E4 - D4 - D4 - E4 - E4') },
    { w: 'triangle', v: 0.38, n: N('C3 - G2 - C3 - G2 - G2 - D3 - G2 - D3 - C3 - G2 - C3 - G2 - G2 - D3 - C3 - G2 -') }], d: 'k-s-k-s-' },
  sad: { bpm: 70, t: [
    { w: 'triangle', v: 0.25, n: N('A4 - - - C5 - B4 - A4 - - - E4 - - - F4 - - - E4 - D4 - E4 - - - - - - -') },
    { w: 'triangle', v: 0.25, n: N('A2 - - - A2 - - - F2 - - - E2 - - -') }], d: '' },
  eye: { bpm: 80, t: [
    { w: 'triangle', v: 0.22, n: N('E5 - - B4 - - G4 - - - - - - - - - D5 - - A4 - - F#4 - - - - - - - - -') },
    { w: 'sine', v: 0.3, n: N('E2 - - - - - - - D2 - - - - - - -') }], d: '' },
  happy: { bpm: 132, t: [
    { w: 'square', v: 0.11, n: N('C5 - E5 G5 - E5 C5 - D5 - F5 A5 - F5 D5 - E5 - G5 C6 - G5 E5 - D5 E5 F5 E5 D5 - C5 -') },
    { w: 'triangle', v: 0.3, n: N('C3 - G3 - C3 - G3 - D3 - A3 - D3 - A3 - E3 - B3 - E3 - B3 - G2 - D3 - G2 - C3 -') }], d: 'k-h-s-h-' },
};
let song = null, songName = '', step = 0, nextT = 0, songT0 = 0;
function music(name) {
  if (songName === name) return;
  songName = name; song = SONGS[name] || null; step = 0;
  if (AC) { nextT = AC.currentTime + 0.06; songT0 = nextT; }
}
function stepDur() { return song ? 60 / song.bpm / 2 : 0.25; }
// Fase del pulso (0..1) para la pelea rítmica; sin audio cae a contador de frames
function beatPhase() {
  if (AC && song) return (((AC.currentTime - songT0) / (stepDur() * 2)) % 1 + 1) % 1;
  return (tick % 30) / 30;
}
setInterval(() => {
  if (!AC || !song) return;
  const dt = stepDur();
  if (nextT < AC.currentTime - 0.5) { nextT = AC.currentTime + 0.05; }
  while (nextT < AC.currentTime + 0.12) {
    const w = nextT - AC.currentTime;
    for (const tr of song.t) { const n = tr.n[step % tr.n.length]; if (n > 0) tone(mf(n), dt * 0.9, tr.w, tr.v, w); }
    if (song.d) { const d = song.d[step % song.d.length]; if (d === 'k') tone(150, 0.12, 'sine', 0.5, w, -100); else if (d === 's') noise(0.08, 0.22, w, 1800); else if (d === 'h') noise(0.03, 0.08, w, 6000); }
    step++; nextT += dt;
  }
}, 25);

// ===== Diálogos estilo Undertale (con censura *palabra*) =====
const NAMES = { dan: 'DANIEL', pan: 'PANCHO', chayo: 'DOÑA CHAYO', ram: 'RAMÍREZ', chuy: 'CHUYITA', nieve: 'NIEVE', dogo: 'EL DEL DOGO', oxxo: 'EL DEL OXXO', lancha: 'SEÑOR LANCHA', tv: 'TELEVISIÓN', vec: 'VECINO', tlac: 'REY TLACUACHE', banda: 'LA BANDA', perro: 'PERRITO' };
function censor(t) {
  return G.censor ? t.replace(/\*(.+?)\*/g, (m, w) => w.replace(/[^ ]/g, (c, i) => '#@$%&!'[i % 6])) : t.replace(/\*/g, '');
}
function wrap(t, n) {
  const lines = []; for (const para of t.split('\n')) {
    let l = '';
    for (const w of para.split(' ')) { if ((l + ' ' + w).trim().length > n) { lines.push(l); l = w; } else l = (l ? l + ' ' : '') + w; }
    lines.push(l);
  }
  return lines;
}
const Dlg = {
  q: [], cur: null, shown: 0, sel: 0, lines: [], beeps: [],
  say(who, text, o = {}) { this.q.push({ who, text, ...o }); if (!this.cur) this.next(); },
  next() {
    this.cur = this.q.shift() || null; this.shown = 0; this.sel = 0;
    if (!this.cur) return;
    const raw = this.cur.text;
    this.beeps = []; let off = 0; raw.replace(/\*(.+?)\*/g, (m, w, i) => { this.beeps.push(i - off); off += 2; });
    const full = censor(raw);
    this.lines = wrap(full, this.cur.who && this.cur.who !== 'narr' ? 27 : 34);
    this.total = this.lines.join('').length;
    if (this.cur.who === 'pan') SFX.squawk();
    if (this.cur.who === 'nieve' || this.cur.who === 'perro') SFX.bark();
    if (this.cur.onShow) this.cur.onShow();
  },
  active() { return !!this.cur; },
  update() {
    const c = this.cur; if (!c) return;
    if (this.shown < this.total) {
      const prev = this.shown; this.shown += keys['x'] ? 3 : 1;
      if (G.censor && this.beeps.some(b => b >= prev && b < this.shown)) SFX.beep(0.3);
      else if (tick % 3 === 0) SFX.blip();
      if (pressed['z'] || pressed['enter'] || pressed[' ']) this.shown = this.total;
      return;
    }
    if (c.choices) {
      if (pressed['arrowup'] || pressed['arrowleft']) { this.sel = (this.sel + c.choices.length - 1) % c.choices.length; SFX.sel(); }
      if (pressed['arrowdown'] || pressed['arrowright']) { this.sel = (this.sel + 1) % c.choices.length; SFX.sel(); }
      if (OK()) { const cb = c.cb, i = this.sel; SFX.sel(); this.next(); cb && cb(i); }
    } else if (OK()) { const cb = c.cb; this.next(); cb && cb(); }
  },
  draw() {
    const c = this.cur; if (!c) return;
    const top = c.top, y = top ? 6 : 116, hgt = 58;
    frame9(6, y, 308, hgt);
    let tx = 14;
    if (c.who && c.who !== 'narr') { R(12, y + 8, 42, 42, '#111'); portrait(c.who, 13, y + 9); tx = 60; txt(NAMES[c.who] || c.who.toUpperCase(), tx, y + 6, '#ffd84a', 6); }
    let left = Math.floor(this.shown), ly = y + (c.who && c.who !== 'narr' ? 17 : 10);
    for (const l of this.lines) { if (left <= 0) break; txt(l.slice(0, left), tx, ly, '#fff', 8); left -= l.length; ly += 10; }
    if (this.shown >= this.total) {
      if (c.choices) {
        const bx = 200, bh = c.choices.length * 12 + 8, by = y - bh - 2 < 0 ? y + hgt + 2 : y - bh - 2;
        frame9(bx, by, 114, bh);
        c.choices.forEach((ch, i) => txt((i === this.sel ? '> ' : '  ') + ch, bx + 8, by + 6 + i * 12, i === this.sel ? '#ffd84a' : '#fff', 7));
      } else if (tick % 40 < 25) txt('▼', 302, y + hgt - 12, '#fff', 6);
    }
  },
};
// talk([[who,text],...], cb) — cb tras el último
function talk(lines, cb, o = {}) { lines.forEach((l, i) => Dlg.say(l[0], l[1], { ...o, cb: i === lines.length - 1 ? cb : null })); }
function ask(who, text, choices, cb) { Dlg.say(who, text, { choices, cb }); }

// ===== Escenas =====
let scene = null;
function setScene(s) { scene = s; s.enter && s.enter(); }
let lastT = performance.now(), acc = 0;
function loop(now) {
  acc += Math.min(100, now - lastT); lastT = now;
  while (acc >= 1000 / 60) {
    tick++;
    const busy = Dlg.active();
    if (busy) Dlg.update();
    scene.update(busy);
    endTick(); acc -= 1000 / 60;
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  scene.draw(); Dlg.draw(); flush();
  requestAnimationFrame(loop);
}
