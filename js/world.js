'use strict';
// ================= EXPLORACIÓN (vista cenital estilo Undertale) =================
const TS = 16;
const SOLID = new Set(['#', 'D', 'O', 'T', 'f', 'd', 'k', 'Q', 'w', ' ', 'W']);
const ENT_CHARS = 'PKCgS123456eBnLlqaX';
let OW = null;

function baseTile(map, x, y, floor) {
  const cnt = {};
  for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
    const c = (map[y + dy] || [])[x + dx];
    if (c && !SOLID.has(c) && !ENT_CHARS.includes(c)) cnt[c] = (cnt[c] || 0) + 1;
  }
  let best = floor, n = 0; for (const c in cnt) if (cnt[c] > n) { n = cnt[c]; best = c; }
  return best;
}
function loadAct(n, spawn) {
  const A = ACTS[n]; G.act = n;
  const w = Math.max(...A.map.map(r => r.length));
  const map = A.map.map(r => r.padEnd(w, A.pad || 'T').split(''));
  const ents = []; let px = 40, py = 40, ei = 0;
  for (let y = 0; y < map.length; y++) for (let x = 0; x < w; x++) {
    const ch = map[y][x]; if (!ENT_CHARS.includes(ch)) continue;
    map[y][x] = baseTile(map, x, y, A.floor);
    if (ch === 'P') { px = x * TS + 8; py = y * TS + 12; continue; }
    const key = `${n}:${x},${y}`;
    const e = { ch, tx: x, ty: y, key, x: x * TS + 8, y: y * TS + 13, hx: x * TS + 8, hy: y * TS + 13, solid: !'123456eXlB'.includes(ch), t: ri(0, 200), vx: 0, vy: 0 };
    if (ch === 'e') { e.kind = A.enc[ei++ % A.enc.length]; }
    if (ch === 'a') { e.kind = A.animals[ents.filter(q => q.ch === 'a').length % A.animals.length]; }
    if (G.dead[key] || (/[1-6]/.test(ch) && G.rastros[ch])) continue;
    ents.push(e);
  }
  OW = { A, n, map, w, h: map.length, ents, px, py, dir: 'down', fr: 0, ft: 0, cam: { x: 0, y: 0 }, clockT: 0, strikes: [], msg: '', msgT: 0, pan: { x: px - 12, y: py - 20 }, kb: 0, trig: null };
  if (spawn) { OW.px = spawn.x; OW.py = spawn.y; OW.pan = { x: spawn.x, y: spawn.y - 20 }; }
  setScene(WorldScene); music(A.music);
  if (A.onLoad) A.onLoad();
}
function backToWorld() { setScene(WorldScene); music(OW.A.music); }
const tileAt = (x, y) => { const r = OW.map[Math.floor(y / TS)]; return r ? (r[Math.floor(x / TS)] ?? 'T') : 'T'; };
function blocked(x, y) {
  for (const [cx, cy] of [[x - 4, y - 4], [x + 4, y - 4], [x - 4, y], [x + 4, y]]) if (SOLID.has(tileAt(cx, cy))) return true;
  for (const e of OW.ents) if (e.solid && Math.abs(e.x - x) < 11 && y > e.y - 9 && y < e.y + 5) return true;
  return false;
}
function owMsg(s) { OW.msg = s; OW.msgT = 150; }
function addClock(n) { G.clock = Math.min(99, G.clock + n); }

const WorldScene = {
  update(busy) {
    updParts();
    const o = OW; o.ft++;
    o.pan.x += (o.px - 14 - o.pan.x) * 0.06; o.pan.y += (o.py - 22 - o.pan.y) * 0.06;
    for (const s of o.strikes) s.t--;
    if (busy) return;
    if (o.msgT > 0) o.msgT--;
    if (pressed['enter']) { openMenu(); return; }
    // reloj del huracán
    if (++o.clockT >= 840) { o.clockT = 0; addClock(1); }
    // movimiento
    let dx = 0, dy = 0;
    if (keys['arrowleft']) dx = -1; if (keys['arrowright']) dx = 1; if (keys['arrowup']) dy = -1; if (keys['arrowdown']) dy = 1;
    if (dx && dy) { dx *= 0.71; dy *= 0.71; }
    if (dx < 0) o.dir = 'left'; else if (dx > 0) o.dir = 'right'; else if (dy < 0) o.dir = 'up'; else if (dy > 0) o.dir = 'down';
    let spd = keys['x'] ? 2 : 1.3; const under = tileAt(o.px, o.py);
    if (under === '~') spd *= 0.6;
    if (o.kb > 0) { o.kb--; dy = 1.5; dx = 0; spd = 1.6; }
    if (!blocked(o.px + dx * spd, o.py)) o.px += dx * spd;
    if (!blocked(o.px, o.py + dy * spd)) o.py += dy * spd;
    if (under === 'v' && !blocked(o.px, o.py + 0.95)) { o.py += 0.95; if (o.ft % 4 === 0) part(o.px + rnd(-10, 10), o.py - 30, 0, 3, 12, '#cde', 1, 0); }
    if (dx || dy) { if (o.ft % 10 === 0) o.fr++; } else o.fr = 0;
    // interactuar
    if (OK()) {
      const fx = o.px + (o.dir === 'left' ? -12 : o.dir === 'right' ? 12 : 0), fy = o.py + (o.dir === 'up' ? -12 : o.dir === 'down' ? 12 : 0) - 4;
      const e = o.ents.find(e => Math.abs(e.x - fx) < 14 && Math.abs(e.y - 4 - fy) < 14);
      if (e) { STORY.interact(e); return; }
    }
    // enemigos que deambulan
    for (const e of o.ents) {
      if (e.ch !== 'e') continue;
      const d = Math.hypot(o.px - e.x, o.py - e.y);
      if (d < 70) { e.vx = sign(o.px - e.x) * 0.6; e.vy = sign(o.py - e.y) * 0.6; }
      else if (e.t++ % 60 === 0) { e.vx = rnd(-0.5, 0.5); e.vy = rnd(-0.5, 0.5); }
      const nx = e.x + e.vx, ny = e.y + e.vy;
      if (!SOLID.has(tileAt(nx, ny)) && Math.abs(nx - e.hx) < 40 && Math.abs(ny - e.hy) < 40) { e.x = nx; e.y = ny; }
    }
    // disparadores por contacto
    const hit = o.ents.find(e => !e.solid && Math.abs(e.x - o.px) < 11 && Math.abs(e.y - o.py) < 11);
    if (hit && hit !== o.trig) { o.trig = hit; STORY.touch(hit); return; }
    if (!hit) o.trig = null;
    // rayos en la antena
    if (o.A.lightning && o.ft % 100 === 0) {
      const tx = Math.floor(o.px / TS), ty = Math.floor(o.py / TS), zs = [];
      for (let y = ty - 5; y <= ty + 5; y++) for (let x = tx - 6; x <= tx + 6; x++) if ((o.map[y] || [])[x] === 'z') zs.push([x, y]);
      for (let i = 0; i < 2 && zs.length; i++) { const z = zs.splice(ri(0, zs.length - 1), 1)[0]; o.strikes.push({ tx: z[0], ty: z[1], t: 70 }); }
    }
    for (const s of o.strikes) if (s.t === 10) {
      SFX.thunder(); flash('#ccf', 4);
      if (Math.floor(o.px / TS) === s.tx && Math.floor(o.py / TS) === s.ty) { o.kb = 20; addClock(2); shake = 5; owMsg('¡TE CAYÓ UN RAYO! (+2% huracán)'); }
    }
    o.strikes = o.strikes.filter(s => s.t > 0);
  },
  draw() {
    const o = OW, A = o.A;
    o.cam.x = o.w * TS <= W ? (o.w * TS - W) / 2 : clamp(o.px - W / 2, 0, o.w * TS - W);
    o.cam.y = o.h * TS <= H ? (o.h * TS - H) / 2 : clamp(o.py - H / 2, 0, o.h * TS - H);
    const cx = Math.round(o.cam.x), cy = Math.round(o.cam.y);
    R(0, 0, W, H, A.voidC || '#111');
    if (A.pad === ' ') { for (let i = 0; i < 50; i++) R((i * 71 - cx * 0.2) % W, 100 + (i * 37) % 80 - cy * 0.05, 1, 1, i % 3 ? '#ffd860' : '#f86'); }
    const x0 = Math.floor(cx / TS), y0 = Math.floor(cy / TS);
    for (let y = y0; y <= y0 + 12; y++) for (let x = x0; x <= x0 + 20; x++) { const c = (o.map[y] || [])[x]; if (c !== undefined) drawTile(c, x * TS - cx, y * TS - cy, x, y); }
    for (const s of o.strikes) { const x = s.tx * TS - cx, y = s.ty * TS - cy; if (s.t > 10) { if (tick % 6 < 3) { g.globalAlpha = 0.4; R(x, y, TS, TS, '#ff4'); g.globalAlpha = 1; } } else { limb(x + 8, y - 160, x + 4, y + 8, 3, '#fff'); limb(x + 8, y - 160, x + 4, y + 8, 1, '#ff4'); } }
    const list = o.ents.map(e => ({ y: e.y, d: () => drawEnt(e, e.x - cx, e.y - cy) }));
    list.push({ y: o.py, d: () => drawDanOW(o.px - cx, o.py - cy, o.dir, o.fr) });
    list.sort((a, b) => a.y - b.y).forEach(l => l.d());
    if (G.flags.pancho) drawPancho(o.pan.x - cx, o.pan.y - cy + Math.sin(tick / 9) * 2, o.px > o.pan.x ? 1 : -1, 1);
    drawParts();
    const dark = A.calm ? 0.05 : 0.12 + G.clock * 0.004;
    g.globalAlpha = dark; R(0, 0, W, H, '#0a0f25'); g.globalAlpha = 1;
    if (A.rain) rain(A.rain, A.wind || 0.5);
    // HUD
    R(0, 0, W, 13, 'rgba(0,0,0,0.55)');
    txt(`VIDA ${G.hp}/${G.maxhp}`, 4, 3, G.hp < 40 ? '#f66' : '#fff', 5);
    txt(`$${G.money}  DOGOS x${G.dogos}  NIEVE ${G.bond}/6`, 84, 3, '#ffd84a', 5);
    txt('HURACÁN', 236, 3, '#9cf', 5); bar(276, 3, 40, 5, G.clock / 100, G.clock >= 70 ? '#f44' : '#9cf', '#123');
    if (o.msgT > 0) { R(0, 150, W, 14, 'rgba(0,0,0,0.7)'); txt(o.msg, W / 2, 153, '#fff', 6, 'center'); }
    if (o.ft < 200 && !Dlg.active()) txt('ENTER: menú · Z: hablar · X: correr', W / 2, 168, '#aaa', 5, 'center');
  },
};

function drawTile(c, x, y, tx, ty) {
  const A = OW.A, v = (tx * 7 + ty * 13) % 5, t = tick;
  const grass = A.grass || ['#3d6b35', '#41723a'];
  switch (c) {
    case '.': R(x, y, TS, TS, grass[v % 2]); if (v === 0) R(x + 4, y + 6, 1, 2, '#5a8a4a'); break;
    case ',': R(x, y, TS, TS, grass[0]); R(x + 4, y + 5, 2, 2, '#f6c'); R(x + 10, y + 9, 2, 2, '#ff6'); break;
    case '=': R(x, y, TS, TS, '#4a4a52'); if (tx % 2 === 0 && v < 3) R(x + 6, y + 7, 4, 1, '#bba860'); break;
    case '-': R(x, y, TS, TS, '#8a8478'); R(x, y, TS, 1, '#9a9488'); R(x, y, 1, TS, '#7a7468'); break;
    case 'p': R(x, y, TS, TS, '#8a7a70'); R(x, y, 8, 8, '#968678'); R(x + 8, y + 8, 8, 8, '#968678'); break;
    case 'H': R(x, y, TS, TS, '#4a5262'); for (let i = 0; i < TS; i += 4) R(x + i, y, 1, TS, '#363c4a'); R(x, y, TS, 1, '#6a7282'); break;
    case 'z': R(x, y, TS, TS, '#4a5262'); for (let i = 0; i < TS; i += 4) R(x + ((i + (tx % 2) * 2) % TS), y + i, 4, 2, '#d8b020'); break;
    case 'v': R(x, y, TS, TS, '#8a7a70'); { const o = (t * 1.5) % TS; R(x + 4, y + o, 1, 5, '#cde'); R(x + 11, y + (o + 8) % TS, 1, 5, '#cde'); } break;
    case '~': R(x, y, TS, TS, '#3a6a8a'); R(x + ((t >> 3) + tx * 3) % 12, y + 6, 4, 1, '#7ab'); break;
    case 'w': R(x, y, TS, TS, '#1f4a72'); R(x + ((t >> 2) + tx * 5) % 14, y + 4 + (ty % 3) * 3, 3, 1, '#5a8ab8'); break;
    case 'o': R(x, y, TS, TS, '#1f4a72'); circ(x + 8, y + 8 + Math.sin(t / 15 + tx) , 6, '#1a1a1a'); circ(x + 8, y + 8 + Math.sin(t / 15 + tx), 3, '#1f4a72'); break;
    case 'r': R(x, y, TS, TS, '#a04428'); for (let i = 0; i < TS; i += 4) R(x, y + i, TS, 1, '#7a3018'); break;
    case '#': {
      const top = (OW.map[ty - 1] || [])[tx] !== '#' && (OW.map[ty - 1] || [])[tx] !== 'D';
      R(x, y, TS, TS, '#d8c8a8'); if (top) { R(x, y, TS, 6, '#b04a30'); R(x, y + 6, TS, 1, '#7a3020'); } else if (v < 2) { R(x + 4, y + 4, 8, 7, '#4a6a8a'); R(x + 7, y + 4, 1, 7, '#d8c8a8'); }
    } break;
    case 'D': R(x, y, TS, TS, '#d8c8a8'); R(x + 3, y + 2, 10, 14, '#6a4020'); R(x + 10, y + 9, 2, 2, '#ffd84a'); break;
    case 'O': { R(x, y, TS, TS, '#d81e28'); R(x, y + 5, TS, 3, '#f4c020'); const top = (OW.map[ty - 1] || [])[tx] !== 'O'; if (top) { R(x, y, TS, 2, '#8a1018'); } } break;
    case 'T': R(x, y, TS, TS, grass[0]); { const b = Math.round(Math.sin(t / 20 + tx) * 2 * (OW.A.calm ? 0 : 1)); R(x + 6, y + 8, 4, 8, '#5a3a1a'); circ(x + 8 + b, y + 6, 6, '#2a5a2a'); circ(x + 6 + b, y + 4, 3, '#3a7a3a'); } break;
    case 'f': R(x, y, TS, TS, grass[0]); R(x, y + 6, TS, 2, '#a07a4a'); R(x, y + 11, TS, 2, '#a07a4a'); R(x + 2, y + 3, 2, 12, '#8a6a3a'); R(x + 11, y + 3, 2, 12, '#8a6a3a'); break;
    case 'd': R(x, y, TS, TS, grass[v % 2]); R(x + 2, y + 6, 12, 6, '#7a6a5a'); R(x + 4, y + 3, 6, 4, '#a04428'); R(x + 9, y + 9, 5, 3, '#ccc'); break;
    case 'k': R(x, y, TS, TS, '#8a7a70'); R(x + 1, y + 4, 14, 10, '#6a4a3a'); R(x, y + 1, TS, 4, tx % 2 ? '#c03030' : '#3070c0'); R(x + 3, y + 7, 3, 3, '#ffd84a'); R(x + 9, y + 7, 3, 3, '#3c3'); break;
    case 'Q': { R(x, y, TS, TS, '#c8b890'); const top = (OW.map[ty - 1] || [])[tx] !== 'Q'; if (top) { R(x, y, TS, 3, '#a89870'); if (tx % 4 === 1) { R(x + 4, y - 8, 8, 8, '#c8b890'); R(x + 7, y - 13, 2, 5, '#ffd84a'); } } else if (v < 2) { R(x + 5, y + 2, 6, 10, '#5a4a7a'); circ(x + 8, y + 3, 3, '#5a4a7a'); } } break;
    case 'W': { R(x, y, TS, TS, '#3a4050'); const o = (t * 2 + tx * 5 + ty * 3) % TS; R(x + (tx * 3) % 12, y + o, 2, 6, '#8a90a0'); R(x + (tx * 7) % 14, y + (o + 9) % TS, 1, 4, '#c0c6d0'); } break;
    case ' ': break;
    default: R(x, y, TS, TS, grass[0]);
  }
}

function drawNPCOW(x, y, c) {
  x = Math.round(x); y = Math.round(y);
  R(x - 5, y - 1, 10, 2, 'rgba(0,0,0,0.35)');
  R(x - 4, y - 6, 3, 6, c.bottom || '#333'); R(x + 1, y - 6, 3, 6, c.bottom || '#333');
  if (c.dress) R(x - 6, y - 9, 12, 5, c.top);
  R(x - 5, y - 13, 10, 8, c.top); R(x - 7, y - 12, 2, 6, c.skin); R(x + 5, y - 12, 2, 6, c.skin);
  R(x - 5, y - 22, 10, 9, c.skin);
  if (c.hair) { R(x - 6, y - 24, 12, 4, c.hair); R(x - 6, y - 21, 2, 4, c.hair); R(x + 4, y - 21, 2, 4, c.hair); }
  if (c.bun) R(x - 3, y - 27, 6, 3, c.hair);
  if (c.hat) { R(x - 8, y - 22, 16, 2, c.hat); R(x - 5, y - 27, 10, 5, c.hat); }
  if (c.cap) { R(x - 6, y - 25, 12, 4, c.cap); R(x - 6, y - 21, 13, 1, c.cap); }
  R(x - 3, y - 18, 1, 2, '#111'); R(x + 2, y - 18, 1, 2, '#111');
  if (c.stache) R(x - 2, y - 15, 5, 1, c.stache);
  if (c.glasses) { R(x - 4, y - 19, 3, 2, '#222'); R(x + 1, y - 19, 3, 2, '#222'); }
}
const OWC = {
  chayo: { top: '#8b3a8f', skin: '#c98b62', hair: '#c9c9c9', bun: 1, glasses: 1, dress: 1, bottom: '#a8714d' },
  dogo: { top: '#fff', skin: '#b97a50', cap: '#e33', stache: '#222', bottom: '#335' },
  oxxo: { top: '#d22', skin: '#d8a07a', cap: '#d22', bottom: '#335' },
  vec: { top: '#3a7a3a', skin: '#c99068', hair: '#3a2a1a', bottom: '#335' },
  vec2: { top: '#c86', skin: '#a87050', hair: '#222', bun: 1, dress: 1, bottom: '#a87050' },
  lancha: { top: '#6a8aaa', skin: '#a06a44', hat: '#e8dcb0', stache: '#ddd', bottom: '#444' },
  ram: { top: '#2b3a67', skin: '#d29a70', hair: '#111', glasses: 1, stache: '#111', bottom: '#2b3a67' },
  banda: { top: '#c03030', skin: '#c08458', hat: '#fff', stache: '#2a1a10', bottom: '#222' },
};
function owEnemyDraw(kind, x, y, f) {
  if (kind === 'tlac') drawTlac(x, y, f, 1, (tick >> 3) % 2);
  else if (kind === 'flamingo') drawObj('flamingo', x, y + Math.sin(tick / 8));
  else if (kind === 'llanta') { circ(x, y - 7, 7, '#1a1a1a'); circ(x, y - 7, 3, '#777'); R(x - 3, y - 9, 2, 2, '#fff'); R(x + 1, y - 9, 2, 2, '#fff'); }
  else if (kind === 'paraguas') { for (let k = 0; k < 6; k++) R(x - k * 1.5 - 1, y - 20 + k, k * 3 + 2, 1, '#1e1e26'); R(x, y - 14, 1, 12, '#777'); R(x - 3, y - 17, 2, 2, '#e22'); R(x + 1, y - 17, 2, 2, '#e22'); }
  else if (kind === 'tinaco') drawObj('tinaco', x, y);
  else if (kind === 'rayo') { limb(x + 3, y - 22, x - 3, y - 14, 4, '#ffe04a'); limb(x - 3, y - 14, x + 3, y - 8, 4, '#ffe04a'); limb(x - 1, y - 8, x - 2, y, 1, '#888'); limb(x + 2, y - 8, x + 3, y, 1, '#888'); }
}
function sparkle(x, y, c = '#fff') { const s = (tick >> 3) % 4; R(x - s, y, s * 2 + 1, 1, c); R(x, y - s, 1, s * 2 + 1, c); }
function drawEnt(e, x, y) {
  const ch = e.ch;
  if (ch === 'K') { R(x - 8, y - 18, 16, 18, 'rgba(0,0,0,0)'); if (!G.flags.pancho) drawPancho(x, y - 3, 1, 1, false); for (let i = 0; i < 5; i++) R(x - 8 + i * 4, y - 18, 1, 18, '#c8b040'); R(x - 9, y - 19, 18, 2, '#c8b040'); R(x - 9, y - 1, 18, 2, '#c8b040'); if (!G.flags.pancho) sparkle(x + 10, y - 22, '#ffd84a'); }
  else if (ch === 'C') drawNPCOW(x, y, OWC.chayo);
  else if (ch === 'g') { drawObj('carrito', x, y + 2); drawNPCOW(x + 14, y, OWC.dogo); }
  else if (ch === 'S') {
    if (OW.n === 1) { R(x - 7, y - 16, 14, 16, '#9cd8f0'); R(x - 1, y - 16, 1, 16, '#ddd'); }
    else { R(x - 8, y - 18, 16, 18, '#d81e28'); R(x - 8, y - 14, 16, 3, '#f4c020'); R(x - 4, y - 9, 8, 9, '#9cd8f0'); }
    R(x - 7, y - 26, 14, 6, '#d81e28'); R(x - 6, y - 25, 2, 4, '#f4c020'); R(x - 3, y - 25, 2, 4, '#fff'); R(x, y - 25, 2, 4, '#f4c020'); R(x + 3, y - 25, 2, 4, '#fff');
  }
  else if (/[1-6]/.test(ch)) { const b = Math.sin(tick / 10) * 2; R(x - 4, y - 8 + b, 8, 6, '#f4f6f8'); R(x - 2, y - 10 + b, 4, 2, '#8f98a3'); sparkle(x + 6, y - 14 + b, '#9cf'); sparkle(x - 7, y - 4 - b, '#fff'); }
  else if (ch === 'e') owEnemyDraw(e.kind, x, y, e.vx >= 0 ? 1 : -1);
  else if (ch === 'n') drawNPCOW(x, y, OWC[OW.A.npcLook || 'vec']);
  else if (ch === 'L') { R(x - 14, y - 6, 28, 7, '#c86a3a'); R(x - 12, y - 2, 24, 3, '#a04a2a'); drawNPCOW(x, y - 4, OWC.lancha); }
  else if (ch === 'q') { R(x - 6, y - 8, 12, 6, '#a0703a'); R(x + 4, y - 11, 5, 5, '#a0703a'); R(x + 5, y - 13, 2, 2, '#7a5020'); R(x - 5, y - 2, 2, 2, '#a0703a'); R(x + 2, y - 2, 2, 2, '#a0703a'); R(x + 7, y - 10, 1, 1, '#111'); R(x - 10, y - 14, 20, 4, '#3070c0'); if (tick % 60 < 30) txt('?', x, y - 26, '#fff', 6, 'center'); }
  else if (ch === 'a') { if (e.kind === 'gato') { R(x - 6, y - 10, 12, 10, '#888'); R(x - 4, y - 14, 8, 6, '#e8a040'); R(x - 4, y - 16, 2, 2, '#e8a040'); R(x + 2, y - 16, 2, 2, '#e8a040'); R(x - 2, y - 12, 1, 1, '#111'); R(x + 1, y - 12, 1, 1, '#111'); } else { R(x - 8, y - 5, 14, 4, '#4a9a3a'); R(x + 5, y - 7, 5, 4, '#4a9a3a'); R(x - 12, y - 4, 5, 2, '#4a9a3a'); R(x + 8, y - 6, 1, 1, '#111'); } if (tick % 60 < 30) txt('!', x, y - 26, '#ff9', 6, 'center'); }
  else if (ch === 'B') OW.A.bossDraw(x, y);
  else if (ch === 'X') { if (STORY.exitOpen()) { const b = (tick >> 3) % 2; R(x - 2, y - 10 + b, 4, 6, '#ffd84a'); R(x - 5, y - 6 + b, 10, 2, '#ffd84a'); } }
}

// ---- Menú de pausa ----
function openMenu() {
  SFX.sel();
  const lo = G.loyalty >= 4 ? 'puro amor' : G.loyalty >= 2 ? 'cariño' : G.loyalty >= 0 ? 'flojera' : 'desprecio';
  ask('narr', `VIDA ${G.hp}/${G.maxhp} · $${G.money} · DOGOS ${G.dogos}\nRASTROS DE NIEVE ${G.bond}/6 · HURACÁN ${G.clock}%\n${G.flags.pancho ? 'Pancho te ve con: ' + lo : ''}`, ['Comer dogo', 'Controles', 'Cerrar'], i => {
    if (i === 0) {
      if (G.dogos <= 0) { Dlg.say('narr', 'No tienes dogos. El carrito de dogos los vende a $25.'); return; }
      if (!G.flags.pancho) { eatDogo(false); return; }
      ask('pan', 'Oye... ¿me das tantito?', ['Comérmelo todo', 'Compartir con Pancho'], j => eatDogo(j === 1));
    } else if (i === 1) {
      talk([['narr', 'EXPLORAR: flechas para moverte, Z hablar, X (mantener) correr, ENTER menú.'],
        ['narr', 'PELEAR: Z ligero, X fuerte, C patada, V especial, A bloquear (justo = parry), S Pancho, Q burla.'],
        ['narr', 'SÚPERS: V+Z, V+X, V+C. En la pelea, ENTER muestra todos los movimientos.']]);
    }
  });
}
function eatDogo(share) {
  G.dogos--; SFX.heal();
  if (share) { G.hp = Math.min(G.maxhp, G.hp + 25); G.loyalty = Math.min(5, G.loyalty + 1); Dlg.say('pan', '¡Ñam! Ay, Daniel. Por cosas así no te picoteo en la noche. (+25 vida)'); }
  else { G.hp = Math.min(G.maxhp, G.hp + 50); Dlg.say('dan', '(Se lo come entero en dos mordidas.) (+50 vida)'); if (G.flags.pancho) Dlg.say('pan', '...Ni las gracias, eh.'); }
}
