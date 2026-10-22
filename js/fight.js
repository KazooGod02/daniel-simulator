'use strict';
// ================= SISTEMA DE PELEAS 2D =================
const GY = 160;
let F = null;
const COMBO_TITLES = { 5: '¡ÁNDALE!', 10: '¡QUÉ *PEDO*!', 15: '¡NO *MAMES*!', 20: 'CATEGORÍA 5' };

// ---- Movimientos de Daniel ----
const HT = (f, d, box, dmg, kb, hs, x = {}) => ({ f, d, box, dmg, kb, hs, ...x });
const PM = {
  jab: { lvl: 1, pose: 'punch', tot: 14, hits: [HT(3, 3, [6, -42, 16, 10], 4, 1.2, 14)] },
  heavy: { lvl: 2, pose: 'heavy', tot: 24, hits: [HT(7, 4, [8, -40, 18, 12], 9, 2.6, 20)] },
  kick: { lvl: 2, pose: 'kick', tot: 22, hits: [HT(6, 4, [8, -34, 18, 12], 7, 2.2, 18)] },
  sweep: { lvl: 2, pose: 'sweep', tot: 28, low: 1, hits: [HT(6, 6, [4, -9, 24, 9], 6, 0.6, 30, { knock: 1 })] },
  airA: { lvl: 1, pose: 'punch', tot: 14, air: 1, hits: [HT(3, 6, [4, -44, 16, 14], 5, 1, 16)] },
  airC: { lvl: 2, pose: 'airkick', tot: 20, air: 1, hits: [HT(4, 10, [6, -26, 18, 14], 7, 2, 18)] },
  grab: { lvl: 2, pose: 'heavy', tot: 30, hits: [HT(3, 2, [4, -44, 14, 40], 12, 3, 30, { unb: 1, knock: 1, launch: -3 })] },
  grenazo: { lvl: 3, pose: 'idle', shake: 1, tot: 30, hits: [HT(8, 2, [2, -58, 18, 22], 3, 0.5, 16), HT(13, 2, [2, -58, 18, 22], 3, 0.5, 16), HT(18, 2, [2, -58, 18, 22], 4, 2, 20)], proj: { f: 20, kind: 'gota' } },
  cabezazo: { lvl: 3, pose: 'upper', tot: 34, inv: 8, jump: -4.6, fwd: 1.5, hits: [HT(3, 10, [0, -62, 18, 36], 10, 1, 24, { launch: -6.5 })] },
  chancla: { lvl: 3, pose: 'throw2', pre: 'throw1', tot: 28, req: 'chancla', proj: { f: 10, kind: 'chancla' } },
  escobazo: { lvl: 3, pose: 'heavy', broom: 1, tot: 34, req: 'escoba', hits: [HT(9, 5, [6, -36, 36, 10], 13, 4.5, 26, { gb: 1 })] },
  mordida: { lvl: 3, pose: 'bite', tot: 36, fwd: 2.5, req: 'mordida', hits: [HT(6, 2, [6, -24, 16, 14], 3, 0.3, 14), HT(11, 2, [6, -24, 16, 14], 3, 0.3, 14), HT(16, 2, [6, -24, 16, 14], 3, 0.3, 14), HT(22, 2, [6, -24, 16, 14], 6, 3, 24)] },
  taunt: { lvl: 0, pose: 'taunt', tot: 60, taunt: 1 },
  cara: { lvl: 0, pose: 'taunt', tot: 40, counter: 1 },
  dogo: { lvl: 4, sup: 1, cost: 100, pose: 'heavy', tot: 46, dash: 5, name: '¡DOGO CON TODO!', hits: [HT(12, 14, [2, -46, 24, 34], 28, 4, 40, { knock: 1, launch: -4, sup: 1 })] },
  tormenta: { lvl: 4, sup: 1, cost: 200, req: 'super2', pose: 'idle', shake: 1, tot: 50, name: '¡TORMENTA RIZADA!', proj: { f: 14, kind: 'tornado' } },
  aullido: { lvl: 4, sup: 1, cost: 300, req: 'aullido', pose: 'win', tot: 80, name: '¡AULLIDO DE LA PRIMAVERA!', aullido: 1 },
};
const REQ_MSG = { chancla: 'Aún no tienes la chancla', escoba: 'Aún no tienes la escoba', mordida: 'Junta 3 rastros de Nieve', super2: 'Se desbloquea en el Acto 3', aullido: 'Solo en el Acto 5' };

// ---- Personajes ----
function mkFighter(o) {
  return { x: 80, y: GY, vx: 0, vy: 0, f: 1, st: 'idle', move: null, mt: 0, hs: 0, bs: 0, air: false, jumps: 0, combo: 0, wb: false, inv: 0, down: 0, stun: 0, guardOff: 0, knock: false, launched: false, flashT: 0, hitsDone: new Set(), ...o };
}
function mkPlayer() {
  return mkFighter({ isP: true, hp: G.hp, maxhp: G.maxhp, meter: 0, pancho: 100, parry: 0, hist: [], lastD: 5, charge: 0, held: null, counter: 0, slow: 0, pflash: 0, tapL: -99, tapR: -99 });
}
function mkEnemy(name, x) {
  const d = ENEMIES[name];
  return mkFighter({ name, def: d, x, f: -1, hp: d.hp, maxhp: d.hp, w: d.w, h: d.h, cd: ri(40, 80), ai: {}, blocking: 0 });
}
function hurt(c) {
  if (c.isP) {
    if (c.st === 'down') return null;
    const m = c.move, h = c.crouch ? 30 : m && m.low ? 14 : m && m.pose === 'bite' ? 24 : 50;
    return { x: c.x - 7, y: c.y - h, w: 14, h };
  }
  if (c.hidden || c.hp <= 0 || c.st === 'down') return null;
  return { x: c.x - c.w / 2, y: c.y - c.h, w: c.w, h: c.h };
}
const boxOf = (c, b) => ({ x: c.f > 0 ? c.x + b[0] : c.x - b[0] - b[2], y: c.y + b[1], w: b[2], h: b[3] });
const foes = c => c.isP ? F.es.filter(e => e.hp > 0) : [F.p];
const nearestFoe = p => { let b = null, bd = 1e9; for (const e of F.es) if (e.hp > 0 && !e.hidden) { const d = Math.abs(e.x - p.x); if (d < bd) { bd = d; b = e; } } return b; };
function pop(x, y, s, c = '#fff', z = 8) { F.pops.push({ x, y, s, c, z, t: 50 }); }
function onBeat() { const ph = beatPhase(); return ph < 0.2 || ph > 0.84; }

// ---- Arranque ----
function startFight(cfg) {
  F = { cfg, p: mkPlayer(), es: [], projs: [], hz: [], objs: [], pops: [], t: 0, hitstop: 0, freeze: 0, freezeName: '', wind: cfg.wind || 0, windT: 0, combo: 0, comboT: 0, comboTitle: '', end: 0, result: null, banner: 90, clouds: [], spirit: 0, pancho: null, paused: false, arenaR: cfg.arenaR || 308, objT: 400 };
  cfg.enemies.forEach((n, i) => F.es.push(mkEnemy(n, (cfg.ex || 240) + i * (cfg.gap || 26))));
  F.es.forEach(e => e.def.init && e.def.init(e));
  parts = [];
  setScene(FightScene);
  music(cfg.music || 'fight');
}

// ---- Golpes ----
function applyHit(a, t, h, dir, proj) {
  if (t.inv > 0 || t.hp <= 0 || (t.isP && t.st === 'down')) return false;
  if (t.isP && t.counter > 0 && !h.unb) {
    t.counter = 0; t.move = null; SFX.parry(); flash('#fff', 5); F.hitstop = 10; pop(t.x, t.y - 64, 'CARA DE NADA', '#ffd84a');
    if (!a.isP && a.hp > 0 && !proj) applyHit(t, a, HT(0, 0, 0, 15, 3, 30, { knock: 1 }), -dir);
    return false;
  }
  if (t.isP && t.parry > 0 && t.hs <= 0 && (!h.unb || h.parryable)) {
    t.parry = 0; F.hitstop = 8; flash('#fff', 4); SFX.parry(); t.meter = Math.min(300, t.meter + 75);
    pop(t.x, t.y - 62, 'Nel.', '#7fd8ff', 10);
    if (!a.isP && !proj && a.hp > 0) { a.stun = 40; a.move = null; }
    return false;
  }
  const canBlock = t.isP ? (keys['a'] && !t.move && t.hs <= 0 && !t.held && !t.air) : t.blocking > 0;
  if (canBlock && !h.unb && !h.gb && !(t.guardOff > 0)) {
    t.hp -= Math.ceil(h.dmg * 0.12); t.bs = Math.max(8, h.hs * 0.6 | 0); t.vx = dir * h.kb * 0.6;
    SFX.block(); burst(t.x + (dir > 0 ? -6 : 6), t.y - 34, 4, '#9cf', 1.5, 1);
    if (t.isP) t.meter = Math.min(300, t.meter + h.dmg); a.connected = true;
    if (t.hp <= 0) { t.hp = 1; }
    return false;
  }
  let dmg = h.dmg * (h.resetScale ? 1 : Math.max(0.4, 1 - 0.1 * t.combo));
  if (Math.abs(F.wind) > 0.3 && sign(F.wind) === dir) dmg *= 1.25;
  if (a.isP && F.cfg.rhythm && onBeat()) { dmg *= 2; pop(t.x, t.y - t.h - 18, 'x2 ¡AL RITMO!', '#ffd84a', 6); }
  if (t.def && t.def.dmgMod) dmg = t.def.dmgMod(t, a, h, dmg, dir, proj);
  if (dmg <= 0) { if (a.isP) { a.meter = Math.min(300, a.meter + 15); a.connected = true; } SFX.block(); return false; }
  dmg = Math.max(1, Math.round(dmg));
  t.hp -= dmg; t.combo++; t.hs = h.hs; t.move = null; t.blocking = 0; t.flashT = 6; t.stun = 0;
  if (!(t.def && t.def.heavy)) {
    t.vx = dir * h.kb;
    if (h.launch || t.air) { t.vy = h.launch || Math.min(t.vy, -2.5); t.air = true; t.launched = true; }
    if (h.knock) t.knock = true;
  }
  F.hitstop = dmg >= 10 ? 7 : 4;
  (dmg >= 10 ? SFX.heavy : SFX.hit)();
  const hb = hurt(t); if (hb) burst(hb.x + hb.w / 2, hb.y + hb.h / 3, dmg >= 10 ? 10 : 5, '#fff', 2.5, 2);
  if (a.isP) {
    a.connected = true; a.meter = Math.min(300, a.meter + dmg * 2.2);
    if (dmg >= 10) a.pflash = 10;
    F.combo = t.combo; F.comboT = 90;
    if (COMBO_TITLES[t.combo] || (t.combo > 20 && t.combo % 5 === 0)) { F.comboTitle = COMBO_TITLES[t.combo] || 'CATEGORÍA 5'; }
  } else if (t.isP) { t.meter = Math.min(300, t.meter + dmg * 1.5); shake = dmg >= 10 ? 4 : 2; t.held = null; }
  if (t.hp <= 0) ko(t, a, dir);
  return true;
}
function ko(t, a, dir) {
  if (t.isP) { t.hp = 0; t.st = 'down'; t.down = 9999; if (!F.result) { F.result = 'lose'; F.end = 150; SFX.ko(); } return; }
  if (t.def.onDeath && t.def.onDeath(t)) return;
  t.hp = 0; t.dying = 50; t.vy = -4; t.air = true; t.vx = dir * 2;
  G.money += t.def.money || 0;
  if (t.def.money) pop(t.x, t.y - 40, '+$' + t.def.money, '#7f7');
  if (F.es.every(e => e.hp <= 0) && !F.result) { F.result = 'win'; F.end = 150; SFX.ko(); flash('#fff', 10); }
}

// ---- Proyectiles y peligros ----
function proj(o) { F.projs.push({ vx: 0, vy: 0, w: 8, h: 8, grav: 0, life: 120, hs: 16, kb: 1.5, dmg: 5, cool: 0, hitsLeft: 1, ...o }); }
function spawnPlayerProj(p, kind) {
  const f = p.f;
  if (kind === 'gota') proj({ owner: 'p', kind, x: p.x + 14 * f, y: p.y - 46, vx: 4.5 * f, w: 8, h: 6, dmg: 4, hs: 16, life: 50 });
  if (kind === 'chancla') proj({ owner: 'p', kind, x: p.x + 12 * f, y: p.y - 40, vx: 5.5 * f, ax: -0.16 * f, w: 9, h: 5, dmg: 6, hs: 22, kb: 2, life: 100, hitsLeft: 2, multi: 20, boomer: 1 });
  if (kind === 'tornado') proj({ owner: 'p', kind, x: p.x + 16 * f, y: p.y - 44, vx: 1.6 * f, w: 22, h: 44, dmg: 4, hs: 16, kb: 0.2, launch: -1.6, life: 110, hitsLeft: 9, multi: 6, sup: 1 });
}
function hazard(o) { F.hz.push({ warn: 50, act: 10, dmg: 8, kb: 2, hs: 20, done: false, ...o }); }
const HZA = { isP: false, connected: false, f: 1, hp: 1 };
function updProjs() {
  for (const pr of F.projs) {
    pr.life--; pr.cool--;
    if (pr.ax) pr.vx += pr.ax;
    if (pr.home) { const p = F.p; pr.vx += sign(p.x - pr.x) * pr.home; pr.vy += sign(p.y - 40 - pr.y) * pr.home * 0.4; pr.vx = clamp(pr.vx, -3.2, 3.2); pr.vy = clamp(pr.vy, -1.5, 1.5); }
    pr.vy += pr.grav; pr.x += pr.vx + F.wind * (pr.windy || 0.1); pr.y += pr.vy;
    if (pr.boomer && Math.abs(pr.vx) < 5.6 && sign(pr.vx) !== sign(pr.ax) * -1 && pr.life < 70 && Math.abs(pr.x - F.p.x) < 10) pr.life = 0;
    if (pr.ground && pr.y >= GY - pr.h) { pr.y = GY - pr.h; if (pr.onLand) { pr.onLand(pr); } }
    if (pr.x < -40 || pr.x > W + 40 || pr.y > H + 20) pr.life = 0;
    if (pr.life <= 0 || pr.cool > 0) continue;
    const box = { x: pr.x - pr.w / 2, y: pr.y, w: pr.w, h: pr.h };
    const tgts = pr.owner === 'p' ? F.es.filter(e => e.hp > 0) : [F.p];
    for (const t of tgts) {
      const hu = hurt(t); if (!hu || !overlap(box, hu)) continue;
      const att = pr.owner === 'p' ? F.p : (pr.src || HZA);
      applyHit(att, t, { dmg: pr.dmg, kb: pr.kb, hs: pr.hs, launch: pr.launch, knock: pr.knock, unb: pr.unb, sup: pr.sup, resetScale: pr.resetScale, obj: pr.obj, parryable: true }, sign(pr.vx) || 1, pr);
      if (pr.onHit) pr.onHit(pr, t);
      pr.hitsLeft--; pr.cool = pr.multi || 0;
      if (pr.hitsLeft <= 0) pr.life = 0;
      break;
    }
  }
  F.projs = F.projs.filter(p => p.life > 0);
  for (const z of F.hz) {
    if (z.warn > 0) { z.warn--; if (z.warn === 0 && z.sfx) z.sfx(); continue; }
    z.act--;
    if (!z.done || (z.tickDmg && F.t % 15 === 0)) {
      const hu = hurt(F.p);
      if (hu && overlap(z, hu)) { applyHit(z.src || HZA, F.p, { dmg: z.dmg, kb: z.kb, hs: z.hs, knock: z.knock, launch: z.launch, unb: z.unb }, sign(F.p.x - (z.x + z.w / 2)) || 1, z); z.done = true; }
    }
  }
  F.hz = F.hz.filter(z => z.warn > 0 || z.act > 0);
}

// ---- Movimientos (genérico para jugador y enemigos) ----
function startMove(c, m) {
  c.move = m; c.mt = 0; c.hitsDone = new Set(); c.connected = false;
  if (m.inv) c.inv = m.inv;
  if (m.jump) { c.vy = m.jump; c.air = true; }
  if (m.start) m.start(c);
  if (m.sup) { F.freeze = 36; F.freezeName = m.name; SFX.super(); flash('#ffd84a', 6); }
}
function updMove(c) {
  const m = c.move, t = ++c.mt;
  if (m.fwd && t < m.tot * 0.6) c.vx = m.fwd * c.f;
  if (m.dash && t >= 6 && t < 22) c.vx = m.dash * c.f;
  if (m.hits) m.hits.forEach((h, i) => {
    if (t < h.f || t >= h.f + h.d || c.hitsDone.has(i)) return;
    const hb = boxOf(c, h.box); let hit = false;
    for (const tg of foes(c)) { const hu = hurt(tg); if (hu && overlap(hb, hu)) { applyHit(c, tg, h, c.f); hit = true; } }
    if (hit) c.hitsDone.add(i);
  });
  if (m.proj && t === m.proj.f) { if (c.isP) spawnPlayerProj(c, m.proj.kind); else m.proj.make(c); }
  if (m.act) m.act(c, t);
  if (m.aullido && t === 30) {
    F.spirit = 70; SFX.howl(); shake = 8;
    for (const e of F.es) if (e.hp > 0 && !e.hidden) applyHit(c, e, HT(0, 0, 0, 55, 5, 60, { knock: 1, launch: -5, unb: 1, sup: 1 }), sign(e.x - c.x) || 1);
  }
  if (m.taunt && t === m.tot - 1) { c.meter = Math.min(300, c.meter + 50); for (const e of F.es) e.ai.angry = 150; pop(c.x, c.y - 64, '...', '#aaa'); }
  if (m.counter && t === 1) c.counter = m.tot;
  if (t >= m.tot) { c.move = null; if (m.air && c.air) c.st = 'jump'; }
}
function canCancel(c, nm) {
  const cur = c.move, nx = PM[nm];
  if (!cur || !nx) return false;
  if (nx.sup && c.mt < 6 && !cur.sup) return true;
  if (!c.connected || cur.sup || cur.lvl === 0) return false;
  if (nx.lvl > cur.lvl) return true;
  if (nx.lvl === cur.lvl && cur.lvl <= 2 && nx !== cur) return true;
  if (cur === PM.jab && nx === PM.jab && c.combo < 3) return true;
  return false;
}

// ---- Input del jugador ----
function dirNum(p) {
  const fw = p.f > 0 ? keys['arrowright'] : keys['arrowleft'], bw = p.f > 0 ? keys['arrowleft'] : keys['arrowright'];
  const x = fw && !bw ? 1 : bw && !fw ? -1 : 0, y = keys['arrowup'] ? 1 : keys['arrowdown'] ? -1 : 0;
  return (y + 1) * 3 + x + 2;
}
function motion(p, seq, win = 14) {
  let i = seq.length - 1; const lim = F.t - win * seq.length;
  for (let k = p.hist.length - 1; k >= 0 && i >= 0; k--) { const h = p.hist[k]; if (h.t < lim) break; if (h.d === +seq[i]) i--; }
  return i < 0;
}
const recent = k => tick - (lastPress[k] ?? -99) <= 5;
function readAttack(p) {
  const zp = pressed['z'], xp = pressed['x'], cp = pressed['c'], vp = pressed['v'];
  if (!(zp || xp || cp || vp)) return null;
  const d = dirNum(p);
  if ((vp && recent('z')) || (zp && recent('v')) || (zp && motion(p, '236236'))) return 'dogo';
  if ((vp && recent('x')) || (xp && recent('v')) || (xp && motion(p, '214214'))) return 'tormenta';
  if ((vp && recent('c')) || (cp && recent('v')) || (vp && motion(p, '236214'))) return 'aullido';
  if (vp) return d === 6 || d === 9 ? 'cabezazo' : d === 4 || d === 7 ? 'chancla' : d === 2 || d === 1 ? 'mordida' : d === 3 ? 'escobazo' : 'grenazo';
  if (zp && motion(p, '236')) return 'grenazo';
  if (xp && motion(p, '623')) return 'cabezazo';
  if (zp && motion(p, '214')) return 'chancla';
  if (cp && motion(p, '252')) return 'mordida';
  if (xp && p.charge >= 50 && (d === 6 || d === 3)) return 'escobazo';
  if (p.air) return cp ? 'airC' : 'airA';
  if (xp) {
    if (p.held) return 'throwObj';
    if (F.objs.some(o => o.state === 'ground' && Math.abs(o.x - p.x) < 16)) return 'pickup';
    const e = nearestFoe(p);
    if (d === 6 && e && Math.abs(e.x - p.x) < 24) return 'grab';
    return 'heavy';
  }
  if (cp) return d <= 3 ? 'sweep' : 'kick';
  return 'jab';
}
function checkMove(p, nm) {
  const m = PM[nm];
  if (m.req && !G.un[m.req]) { pop(p.x, p.y - 66, REQ_MSG[m.req], '#f88', 5); return false; }
  if (m.sup) {
    const cost = m.cost + (p.move && p.move.lvl === 3 ? 100 : 0);
    if (p.meter < cost) { pop(p.x, p.y - 66, '¡FALTA DESMADRE!', '#f88', 6); return false; }
    p.meter -= cost;
  }
  return true;
}
function doAction(p, nm) {
  if (nm === 'pickup') { const o = F.objs.find(o => o.state === 'ground' && Math.abs(o.x - p.x) < 16); o.state = 'held'; p.held = o; SFX.pick(); return; }
  if (nm === 'throwObj') {
    const o = p.held; p.held = null; o.state = 'gone';
    proj({ owner: 'p', kind: 'obj', obj: o.kind, x: p.x + 10 * p.f, y: p.y - 56, vx: 6 * p.f, vy: -1.2, grav: 0.12, w: 20, h: 16, dmg: 14, kb: 4, hs: 30, knock: 1, resetScale: 1, life: 90 });
    SFX.jump(); p.st = 'idle'; return;
  }
  if (!checkMove(p, nm)) return;
  startMove(p, PM[nm]);
}
function panchoAssist(p) {
  if (p.pancho < 100) { pop(p.x, p.y - 66, 'Pancho está cansado', '#aaa', 5); return; }
  const type = keys['arrowup'] ? 'rescate' : keys['arrowdown'] ? 'grito' : (keys['arrowleft'] || keys['arrowright']) ? 'chisme' : 'pico';
  p.pancho = 0; G.panchoUses++; G.panchoActUses++;
  if (G.panchoUses % 6 === 0) G.loyalty = Math.min(5, G.loyalty + 1);
  F.pancho = { type, t: 0, x: p.x - 14 * p.f, y: p.y - 62 }; SFX.squawk();
  if (type === 'rescate') { p.hs = 0; p.down = 0; p.st = 'idle'; p.inv = 45; p.knock = false; p.vy = -3; p.air = true; p.combo = 0; pop(p.x, p.y - 70, '¡TE TENGO!', '#3c3'); }
}
function updPancho() {
  const P = F.pancho, p = F.p; if (!P) return;
  P.t++;
  const e = nearestFoe(p);
  if (P.type === 'pico' && e) {
    const tx = e.x, ty = e.y - e.h * 0.6; P.x += clamp(tx - P.x, -5, 5); P.y += clamp(ty - P.y, -4, 4);
    if (!P.hit && Math.abs(P.x - tx) < 10 && Math.abs(P.y - ty) < 14) { P.hit = 1; applyHit(p, e, HT(0, 0, 0, 5, 0.5, 26), sign(e.x - p.x) || 1, true); }
    if (P.hit || P.t > 70) P.type = 'back';
  } else if (P.type === 'grito' && P.t === 12) {
    pop(P.x, P.y - 14, censor('¡*VERGA*!'), '#ff4', 10); SFX.beep(0.6); shake = 5;
    for (const e2 of F.es) if (e2.hp > 0 && Math.abs(e2.x - p.x) < 150 && !e2.def.heavy) { e2.stun = 75; e2.move = null; }
    for (const e2 of F.es) if (e2.def.heavy) e2.ai.stunned = 40;
  } else if (P.type === 'chisme' && P.t === 12 && e) {
    pop(e.x, e.y - e.h - 16, '¿Ya supiste que...?', '#ff9', 6); for (const e2 of F.es) e2.guardOff = 240;
  }
  if ((P.type !== 'pico' && P.t > 40) || P.type === 'back') { P.y -= 3; P.x -= 2 * p.f; if (P.y < -20) F.pancho = null; }
}

function updPlayer(p) {
  if (p.parry > 0) p.parry--; if (p.inv > 0) p.inv--; if (p.slow > 0) p.slow--; if (p.counter > 0) p.counter--; if (p.pflash > 0) p.pflash--; if (p.guardOff > 0) p.guardOff--;
  if (p.pancho < 100) p.pancho += 100 / 420;
  const d = dirNum(p);
  if (d !== p.lastD) { p.hist.push({ d, t: F.t }); if (p.hist.length > 24) p.hist.shift(); p.lastD = d; }
  if (d === 4 || d === 1 || d === 7) p.charge++; else if (p.charge > 0) p.charge = p.charge > 50 ? p.charge - 1 : 0;
  if (F.result) { physics(p); return; }
  if (p.st === 'down') {
    if (pressed['s'] && keys['arrowup'] && p.pancho >= 100) panchoAssist(p);
    if (--p.down <= 0) { p.st = 'idle'; p.inv = 24; p.combo = 0; }
    physics(p); return;
  }
  if (p.hs > 0) {
    if (pressed['s'] && keys['arrowup']) panchoAssist(p);
    else { if (!p.air) p.hs--; p.st = 'hurt'; }
    physics(p); return;
  }
  if (p.bs > 0) { p.bs--; p.st = 'block'; physics(p); return; }
  if (p.stun > 0) { p.stun--; p.st = 'hurt'; physics(p); return; }
  if ((pressed['a'] && recent('s')) || (pressed['s'] && recent('a'))) { if (!p.move) { startMove(p, PM.cara); physics(p); return; } }
  else if (pressed['s']) panchoAssist(p);
  if (p.move) {
    const nm = readAttack(p);
    if (nm && PM[nm] && canCancel(p, nm) && (!PM[nm].air || p.air) && checkMove(p, nm)) startMove(p, PM[nm]);
    else updMove(p);
    if (p.move && !p.move.fwd && !p.move.dash && !p.air) p.vx *= 0.8;
    physics(p); return;
  }
  const e = nearestFoe(p);
  if (e && !p.air) p.f = e.x >= p.x ? 1 : -1;
  if (pressed['a']) p.parry = 8;
  p.crouch = !p.air && d <= 3;
  if (keys['a'] && !p.air) { p.st = 'block'; p.vx *= 0.6; physics(p); return; }
  if (pressed['q'] && !p.air) { startMove(p, PM.taunt); physics(p); return; }
  const nm = readAttack(p);
  if (nm) { doAction(p, nm); if (p.move) { physics(p); return; } }
  const spd = (p.slow > 0 ? 0.8 : 1.6), w = F.wind * (F.cfg.windPush || 0.35);
  if (!p.air) {
    let mv = 0;
    if (!p.crouch) { if (keys['arrowleft']) mv = -1; if (keys['arrowright']) mv = 1; }
    if (pressed['arrowright']) { if (tick - p.tapR < 14) { p.vx = 4.2; p.dash = 10; burst(p.x, p.y - 2, 4, '#887', 1, 2); } p.tapR = tick; }
    if (pressed['arrowleft']) { if (tick - p.tapL < 14) { p.vx = -4.2; p.dash = 10; burst(p.x, p.y - 2, 4, '#887', 1, 2); } p.tapL = tick; }
    if (p.dash > 0) p.dash--; else p.vx = mv * spd + w;
    if (pressed['arrowup']) { p.vy = -5.4; p.air = true; p.jumps = 1; SFX.jump(); }
  } else {
    if (keys['arrowleft']) p.vx = Math.max(p.vx - 0.15, -1.8); if (keys['arrowright']) p.vx = Math.min(p.vx + 0.15, 1.8);
    if (pressed['arrowup'] && p.jumps < 2) { p.vy = -4.6; p.jumps = 2; SFX.jump(); burst(p.x, p.y, 5, '#ccd', 1.5, 1); }
  }
  p.st = p.air ? 'jump' : p.crouch ? 'crouch' : Math.abs(p.vx - w) > 0.3 ? 'walk' : 'idle';
  physics(p);
}

function physics(c) {
  if (c.def && c.def.fixed) { c.hs = Math.max(0, c.hs - 1); return; }
  c.x += c.vx;
  if (c.air) {
    c.vy += 0.28; c.y += c.vy;
    if (c.y >= GY) {
      c.y = GY; c.air = false; c.vy = 0; c.jumps = 0;
      if ((c.knock || c.launched) && c.hp > 0 && c.hs > 0) { c.st = 'down'; c.down = c.isP ? 40 : 46; c.hs = 0; c.knock = false; c.launched = false; c.vx *= 0.3; shake = Math.max(shake, 2); burst(c.x, c.y, 6, '#887', 2, 2); }
      if (c.move && c.move.air) c.move = null;
    }
  } else {
    if (c.knock && c.hs <= 0 && c.hp > 0) { c.st = 'down'; c.down = c.isP ? 40 : 46; c.knock = false; }
    if (!c.isP || c.hs > 0 || c.bs > 0) c.vx *= 0.82;
  }
  const L = 12, Rr = c.isP ? F.arenaR : 308;
  if (c.x < L || c.x > Rr) {
    if (c.hs > 0 && Math.abs(c.vx) > 3 && !c.wb) { c.vx = -c.vx * 0.5; c.vy = -3.5; c.air = true; c.launched = true; c.wb = true; c.hs += 12; shake = 4; burst(c.x, c.y - 30, 8, '#fff', 2, 2); pop(c.x, c.y - 70, '¡REBOTE!', '#fff', 6); }
    c.x = clamp(c.x, L, Rr);
  }
  if (c.hs <= 0 && !c.air && c.st !== 'down') { c.combo = 0; c.wb = false; c.launched = false; }
}

function genericAI(e) {
  const p = F.p, dx = p.x - e.x, dist = Math.abs(dx), d = e.def;
  if (e.move) { updMove(e); return; }
  e.f = dx >= 0 ? 1 : -1;
  if (e.ai.angry > 0) e.ai.angry--;
  if (p.move && dist < 56 && !e.ai.angry && !(e.guardOff > 0) && Math.random() < (d.block || 0.1) * 0.25) e.blocking = 22;
  if (e.blocking > 0) { e.blocking--; e.st = 'block'; e.vx *= 0.5; return; }
  e.cd -= (d.boss && p.hp < p.maxhp * 0.3) ? 0.6 : 1;
  if (e.ai.angry > 0) e.cd -= 1;
  if (e.cd <= 0) {
    const opts = d.atk.filter(a => dist <= a.range && dist >= (a.min || 0) && (!a.ok || a.ok(e)));
    if (opts.length) { startMove(e, pick(opts)); e.cd = ri(d.cdMin || 40, d.cdMax || 90); return; }
  }
  const keep = d.keep || 26;
  if (dist > keep + 4) e.vx = d.spd * sign(dx); else if (dist < keep - 10) e.vx = -d.spd * 0.6 * sign(dx); else e.vx = 0;
  if (!e.air && Math.random() < 0.004 * (d.jumpy || 1)) { e.vy = -5; e.air = true; }
  e.st = Math.abs(e.vx) > 0.2 ? 'walk' : 'idle';
}
function updEnemy(e) {
  if (e.flashT > 0) e.flashT--; if (e.inv > 0) e.inv--; if (e.guardOff > 0) e.guardOff--;
  if (e.hp <= 0) { if (e.dying > 0) { e.dying--; e.vy += 0.2; e.y = Math.min(GY, e.y + e.vy); e.x += e.vx; } return; }
  if (e.def.always) e.def.always(e);
  if (e.hidden) return;
  if (e.st === 'down') { if (--e.down <= 0) { e.st = 'idle'; e.inv = 14; e.combo = 0; } physics(e); return; }
  if (e.hs > 0) { if (!e.air) e.hs--; e.st = 'hurt'; physics(e); return; }
  if (e.bs > 0) { e.bs--; e.st = 'block'; physics(e); return; }
  if (e.stun > 0) { e.stun--; e.st = 'hurt'; e.vx *= 0.8; physics(e); return; }
  if (F.result) { e.vx = 0; physics(e); return; }
  (e.def.ai || genericAI)(e);
  physics(e);
}

// ---- Objetos del clima que caen a la arena ----
function updObjs() {
  if (F.cfg.debris && !F.result && --F.objT <= 0) {
    F.objT = ri(500, 800);
    F.objs.push({ kind: pick(['silla', 'tinaco', 'flamingo']), x: rnd(40, F.arenaR - 30), y: -20, vy: 0, state: 'fall', life: 600 });
  }
  for (const o of F.objs) {
    if (o.state === 'fall') { o.vy += 0.2; o.y += o.vy; if (o.y >= GY) { o.y = GY; o.state = 'ground'; SFX.block(); burst(o.x, GY, 5, '#887'); } }
    else if (o.state === 'ground' && --o.life <= 0) o.state = 'gone';
    else if (o.state === 'held') { o.x = F.p.x; o.y = F.p.y - 52; }
  }
  F.objs = F.objs.filter(o => o.state !== 'gone');
}

// ---- Escena ----
const FightScene = {
  update(busy) {
    updParts();
    if (busy) return;
    if (pressed['enter'] && !F.result) { F.paused = !F.paused; SFX.sel(); }
    if (F.paused) return;
    if (F.banner > 0) { F.banner--; if (F.banner > 30) return; }
    if (F.freeze > 0) { F.freeze--; return; }
    if (F.hitstop > 0) { F.hitstop--; return; }
    F.t++;
    if (F.cfg.windCycle && F.t % F.cfg.windCycle === 0) F.wind = pick([-1, 1]) * rnd(0.3, F.cfg.windMax || 0.7);
    if (F.comboT > 0 && --F.comboT === 0) { F.comboTitle = ''; }
    if (F.spirit > 0) F.spirit--;
    updPlayer(F.p);
    for (const e of F.es) updEnemy(e);
    updPancho(); updProjs(); updObjs();
    for (const pp of F.pops) { pp.t--; pp.y -= 0.5; } F.pops = F.pops.filter(p => p.t > 0);
    for (const c of F.clouds) c.t--; F.clouds = F.clouds.filter(c => c.t > 0);
    if (F.cfg.tick) F.cfg.tick(F);
    if (F.end > 0 && --F.end === 0) {
      G.hp = Math.max(1, Math.round(F.p.hp));
      if (F.result === 'win') F.cfg.onWin(F); else F.cfg.onLose(F);
    }
  },
  draw() {
    drawFightBG(F.cfg.bg, F);
    for (const o of F.objs) if (o.state !== 'held') drawObj(o.kind, o.x, o.y);
    for (const z of F.hz) drawHazard(z);
    for (const e of F.es) drawEnemy(e);
    drawPlayer(F.p);
    if (F.p.held) drawObj(F.p.held.kind, F.p.x, F.p.y - 50);
    drawPanchoFight();
    for (const pr of F.projs) drawProj(pr);
    drawParts();
    if (F.spirit > 0) drawSpirit(F.spirit);
    for (const c of F.clouds) { g.globalAlpha = Math.min(1, c.t / 30) * 0.92; circ(c.x, c.y, 26, '#3a4050'); circ(c.x + 24, c.y + 6, 20, '#4a5060'); circ(c.x - 22, c.y + 8, 18, '#4a5060'); g.globalAlpha = 1; }
    if (F.cfg.rainI) rain(F.cfg.rainI, F.wind);
    drawFightHUD();
    if (F.freeze > 0) {
      g.globalAlpha = 0.6; R(0, 0, W, H, '#000'); g.globalAlpha = 1; drawPlayer(F.p);
      R(0, 70, W, 26, '#ffd84a'); R(0, 72, W, 22, '#c0202a'); txt(censor(F.freezeName), W / 2 + (36 - F.freeze) * 2 - 30, 79, '#fff', 9, 'center');
    }
    for (const pp of F.pops) txt(pp.s, pp.x, pp.y, pp.c, pp.z || 8, 'center');
    if (F.banner > 0) { const s = F.banner > 40 ? (F.cfg.title || '¡PELEA!') : '¡A DARLE!'; txt(s, W / 2, 70, '#ffd84a', 14, 'center'); if (F.cfg.subtitle && F.banner > 40) txt(F.cfg.subtitle, W / 2, 92, '#fff', 6, 'center'); }
    if (F.result && F.end < 130) txt(F.result === 'win' ? 'K.O.' : 'TE PARTIERON LA *MADRE*'.replace(/\*(.+?)\*/, (m, w) => censor('*' + w + '*')), W / 2, 66, F.result === 'win' ? '#ffd84a' : '#f44', F.result === 'win' ? 20 : 9, 'center');
    if (F.paused) drawMoveList();
  },
};

function poseOf(c) {
  if (c.st === 'down') return 'down';
  if (c.hs > 0 || c.stun > 0) return 'hurt';
  if (c.bs > 0 || c.st === 'block') return 'block';
  if (c.move) return c.move.pre && c.mt < (c.move.proj ? c.move.proj.f : 6) ? c.move.pre : c.move.pose;
  if (c.crouch) return 'crouch';
  if (c.air) return 'jump';
  if (c.st === 'walk') return (tick >> 3) % 2 ? 'walk1' : 'walk2';
  return (tick >> 5) % 2 ? 'idle' : 'idle2';
}
function drawPlayer(p) {
  if (p.inv > 0 && p.st !== 'down' && !p.move && tick % 4 < 2) return;
  let x = p.x; const pose = poseOf(p);
  if (p.move && p.move.shake && p.mt > 4) { x += (tick % 4 < 2 ? -2 : 2); if (tick % 3 === 0) part(p.x + rnd(-8, 8), p.y - 52, rnd(-2, 2), rnd(-2, 0), 20, '#7cf', 1); }
  if (p.counter > 0) { g.globalAlpha = 0.4; circ(p.x, p.y - 28, 26, '#7fd8ff'); g.globalAlpha = 1; }
  drawDaniel(x, p.y, p.f, pose, { wave: Math.round(Math.sin(tick / 6) * 1 + F.wind), pflash: p.pflash > 0, blink: tick % 180 < 6 });
  if (p.move && p.move.broom) { const fh = POSES[pose].fh; limb(x + fh[0] * p.f, p.y + fh[1], x + (fh[0] + 18) * p.f, p.y + fh[1] + 2, 2, '#a0642c'); limb(x + (fh[0] + 17) * p.f, p.y + fh[1], x + (fh[0] + 24) * p.f, p.y + fh[1] + 3, 4, '#e8c860'); }
  if (p.move === PM.dogo && p.mt > 4) { const fh = POSES[pose].fh; drawObj('dogo', x + fh[0] * p.f, p.y + fh[1] + 2); }
  if (p.move === PM.mordida && p.mt % 6 < 3) pop(p.x + 20 * p.f, p.y - 30, '¡ÑAM!', '#fff', 5);
}
function drawPanchoFight() {
  const p = F.p, P = F.pancho;
  if (P) { drawPancho(P.x, P.y, P.type === 'back' ? -p.f : p.f, 2); return; }
  if (p.pancho >= 100) drawPancho(p.x - 16 * p.f, p.y - 66 + Math.sin(tick / 10) * 3, p.f, 1);
}
function drawEnemy(e) {
  if (e.hidden) return;
  if (e.hp <= 0 && (!e.dying || e.dying % 4 < 2)) return;
  if (e.inv > 0 && e.hp > 0 && tick % 4 < 2) return;
  e.def.draw(e, { flash: e.flashT > 0, pose: poseOf(e) });
  if (e.stun > 0 && e.hs <= 0) for (let i = 0; i < 3; i++) { const a = tick / 8 + i * 2.1; R(e.x + Math.cos(a) * 10, e.y - e.h - 6 + Math.sin(a) * 3, 2, 2, '#ffd84a'); }
  if (e.guardOff > 0) txt('!', e.x, e.y - e.h - 12, '#ff9', 6, 'center');
}
function drawProj(pr) {
  if (pr.draw) return pr.draw(pr);
  const x = pr.x, y = pr.y;
  if (pr.kind === 'gota') { R(x - 3, y, 6, 4, '#7cf'); R(x - 1, y - 1, 3, 1, '#bef'); }
  else if (pr.kind === 'chancla') { g.save(); g.translate(Math.round(x), Math.round(y + 2)); g.rotate(tick / 3); R(-4, -2, 9, 4, '#ff4fa0'); R(-1, -3, 2, 1, '#fff'); g.restore(); }
  else if (pr.kind === 'tornado') { for (let i = 0; i < 9; i++) { const r = 4 + i * 1.4, a = tick / 3 + i; R(x + Math.cos(a) * r - 2, y + 40 - i * 5, 4, 3, i % 2 ? HAIR : HAIR2); } }
  else if (pr.kind === 'obj') drawObj(pr.obj, x, y + pr.h);
  else R(x - pr.w / 2, y, pr.w, pr.h, pr.c || '#f80');
}
function drawHazard(z) {
  if (z.draw) return z.draw(z);
  if (z.warn > 0) { if (tick % 8 < 5) { g.globalAlpha = 0.35; R(z.x, z.y, z.w, z.h, z.wc || '#f22'); g.globalAlpha = 1; } }
  else R(z.x, z.y, z.w, z.h, z.c || '#ff8');
}
function drawSpirit(t) {
  const k = 70 - t, s = 5, x = -120 + k * 9, y = GY - 4 + (k > 20 ? 0 : (20 - k) * -2);
  g.globalAlpha = Math.min(1, t / 20) * 0.85; drawNieve(Math.min(x, 200), y, 1, s, (tick >> 3) % 2); g.globalAlpha = 1;
}
function bar(x, y, w, h, v, c, bg = '#311') { R(x - 1, y - 1, w + 2, h + 2, '#fff'); R(x, y, w, h, bg); R(x, y, Math.max(0, w * v), h, c); }
function drawFightHUD() {
  const p = F.p;
  txt('DANIEL', 8, 4, '#fff', 6);
  bar(8, 13, 116, 7, p.hp / p.maxhp, p.hp / p.maxhp < 0.3 ? '#f33' : '#ffd84a');
  const alive = F.es.filter(e => e.hp > 0 && !e.def.minion && !e.def.nobar);
  if (alive.length) {
    const e = alive.find(e => !e.hidden) || alive[0];
    txt(e.def.name, 312, 4, '#fff', 6, 'right');
    bar(196, 13, 116, 7, e.hp / e.maxhp, '#e33');
    alive.filter(x => x !== e).slice(0, 3).forEach((x, i) => bar(256, 24 + i * 6, 56, 3, x.hp / x.maxhp, '#c55'));
  }
  // viento
  if (Math.abs(F.wind) > 0.05) {
    const cx = 160, n = Math.round(Math.abs(F.wind) * 4) + 1;
    txt('VIENTO', cx, 4, '#9cf', 5, 'center');
    for (let i = 0; i < n; i++) txt(F.wind > 0 ? '>' : '<', cx - (n - 1) * 4 + i * 8, 12, Math.abs(F.wind) > 0.3 ? '#9cf' : '#579', 7, 'center');
  }
  // desmadre
  txt('DESMADRE', 8, 156, '#ff9', 5);
  for (let i = 0; i < 3; i++) { const v = clamp((p.meter - i * 100) / 100, 0, 1); bar(8 + i * 30, 165, 26, 5, v, v >= 1 ? (tick % 20 < 10 ? '#ff4' : '#fa0') : '#a80', '#220'); }
  // pancho
  drawPancho(110, 172, 1, 1, false);
  bar(118, 166, 26, 4, p.pancho / 100, p.pancho >= 100 ? '#3c3' : '#185', '#120');
  if (F.comboT > 0 && F.combo >= 2) { txt(F.combo + ' HITS', 8, 40, '#ffd84a', 9); if (F.comboTitle) txt(censor(F.comboTitle), 8, 54, '#fff', 7); }
  if (F.cfg.rhythm) { const ph = beatPhase(), r = ph < 0.2 ? 7 : 4; circ(160, 26, r, onBeat() ? '#ffd84a' : '#555'); txt('RITMO', 160, 34, '#ffd84a', 5, 'center'); }
  if (F.cfg.tutorial && !F.result) {
    const L = ['Z ligero  X fuerte  C patada', 'V especial (+flecha)  A bloquear', 'S Pancho   Q burla  ↑ saltar x2', 'ENTER: lista de movimientos'];
    R(150, 140, 166, 36, 'rgba(0,0,0,0.6)'); L.forEach((l, i) => txt(l, 154, 143 + i * 8, '#fff', 5));
  }
  if (F.cfg.hud) F.cfg.hud(F);
}
function drawMoveList() {
  g.globalAlpha = 0.85; R(0, 0, W, H, '#000'); g.globalAlpha = 1;
  const L = [
    ['MOVIMIENTOS (ENTER para seguir)', '#ffd84a'],
    ['Z/X/C: ligero/fuerte/patada · ↓C barrida', '#fff'],
    ['A: bloquear (tócalo justo = PARRY)', '#fff'],
    ['→→/←←: dash · ↑↑ doble salto · Q: burla', '#fff'],
    ['→X cerca: agarre · X sobre objeto: levantar/aventar', '#fff'],
    ['A+S: Cara de Nada (contraataque)', '#fff'],
    ['ESPECIALES (o V + dirección):', '#ffd84a'],
    ['↓↘→+Z / V: Greñazo', '#fff'],
    ['→↓↘+X / →V: Cabezazo Rizado', '#fff'],
    ['←↓↙+Z / ←V: Chancla Prestada', '#fff'],
    ['cargar ← y →+X / ↘V: Escobazo', '#fff'],
    ['↓↓+C / ↓V: Mordida de Husky', '#fff'],
    ['SÚPERS: V+Z Dogo(1) · V+X Tormenta(2) · V+C Aullido(3)', '#ffd84a'],
    ['PANCHO (S): solo picotazo · ↓ grito · → chisme · ↑ rescate', '#7f7'],
    ['COMBO: Z,Z,X,C → especial → súper', '#9cf'],
  ];
  L.forEach((l, i) => txt(l[0], 10, 8 + i * 11, l[1], 5));
}

// ---- Fondos ----
function sky(c1, c2, c3) { R(0, 0, W, 50, c1); R(0, 50, W, 40, c2); R(0, 90, W, 70, c3); }
function drawFightBG(bg, F) {
  const t = tick;
  if (bg === 'prim') {
    sky('#1b2236', '#252e48', '#2f3a58');
    for (let i = 0; i < 6; i++) { const x = (i * 64 - t * 0.2) % 384 - 32; R(x, 70, 44, 50, '#1f2638'); R(x + 4, 62, 36, 8, '#3a2224'); R(x + 8, 82, 8, 8, i % 2 ? '#ffd860' : '#333a50'); R(x + 26, 82, 8, 8, '#333a50'); }
    for (let i = 0; i < 4; i++) { const x = (i * 90 + t * 1.6) % 380 - 30; drawObj(['silla', 'flamingo', 'techo', 'silla'][i], x, 30 + i * 12 + Math.sin(t / 10 + i) * 6); }
    R(0, 120, W, 40, '#3c4256'); R(0, GY, W, 20, '#4a4a52'); for (let i = 0; i < 10; i++) R(i * 36 + 6, GY + 9, 18, 2, '#cfc070');
  } else if (bg === 'malecon') {
    sky('#1a2533', '#22334a', '#294060');
    for (let i = 0; i < 5; i++) { const x = i * 72 + 20, b = Math.sin(t / 15 + i) * 4; limb(x, GY, x + b, GY - 70, 4, '#4a3a22'); for (let k = 0; k < 4; k++) limb(x + b, GY - 70, x + b + 18 * (k % 2 ? 1 : -0.6) + 10, GY - 62 + k * 3, 2, '#2c5a2c'); }
    R(0, GY, W, 20, '#5a5a62'); for (let i = 0; i < W; i += 4) R(i, GY - 4 + Math.sin(i / 12 + t / 8) * 2, 4, 4, '#2e5f8a');
  } else if (bg === 'centro') {
    sky('#202030', '#2c2a40', '#363350');
    R(110, 30, 100, 100, '#262234'); R(118, 10, 20, 30, '#262234'); R(182, 10, 20, 30, '#262234'); R(124, 2, 8, 10, '#262234'); R(188, 2, 8, 10, '#262234'); R(150, 60, 20, 40, '#151320');
    circ(160, 46, 6, '#cfa850');
    for (let i = 0; i < 5; i++) { const x = i * 70 + 8; R(x, 108, 40, 30, '#3a2a2a'); R(x - 2, 100, 44, 8, i % 2 ? '#c03030' : '#3070c0'); }
    R(0, GY, W, 20, '#6a6070'); for (let i = 0; i < W; i += 16) R(i, GY, 1, 20, '#554c5a');
  } else if (bg === 'antena') {
    sky('#0e1020', '#141830', '#1a2040');
    for (let i = 0; i < 40; i++) R((i * 53) % W, 120 + (i * 17) % 30, 1, 1, i % 3 ? '#ffd860' : '#f86');
    if (t % 200 < 6) { flash('#ccf', 3); }
    limb(30, GY, 160, 10, 3, '#5a6070'); limb(290, GY, 160, 10, 3, '#5a6070'); R(158, 0, 4, 12, '#5a6070'); if (t % 40 < 20) R(157, 0, 6, 3, '#f22');
    R(0, GY, W, 20, '#3a4050'); for (let i = 0; i < W; i += 8) R(i, GY, 4, 20, '#2e3440');
  } else if (bg === 'ojo') {
    R(0, 0, W, H, '#3d6fb0'); circ(160, 40, 90, '#5a8fd0');
    for (let i = 0; i < 2; i++) { const side = i ? W - 30 : 0; R(side, 0, 30, H, '#3a4050'); for (let k = 0; k < 12; k++) R(side + ((k * 7 + t) % 30), (k * 17 + t * 2) % H, 2, 8, '#8a90a0'); }
    R(30, 120, W - 60, 40, '#3a7a3a'); R(60, 96, 60, 32, '#c8b090'); R(56, 90, 68, 8, '#a04428'); R(80, 108, 12, 20, '#6a4020');
    R(0, GY, W, 20, '#4a4a52');
  } else { R(0, 0, W, H, '#223'); R(0, GY, W, 20, '#555'); }
}
