'use strict';
// ================= ENEMIGOS Y JEFES =================
const ENEMIES = {};
const tele = (e, until) => e.move && e.mt < until ? (tick % 4 < 2 ? -1 : 1) : 0;
const eproj = (e, o) => proj({ owner: 'e', src: e, ...o });
function boltDraw(z) {
  if (z.warn > 0) { if (tick % 6 < 3) { g.globalAlpha = 0.25; R(z.x, 0, z.w, GY, '#ff8'); g.globalAlpha = 1; } R(z.x, GY - 3, z.w, 3, '#ff8'); return; }
  let x = z.x + z.w / 2; for (let y = 0; y < GY; y += 10) { const nx = x + ri(-6, 6); limb(x, y, nx, y + 10, 4, '#fff'); limb(x, y, nx, y + 10, 2, '#ff4'); x = nx; }
}
function bolt(e, x, warn = 45) { hazard({ x: x - 10, y: 0, w: 20, h: GY, warn, act: 10, dmg: 12, kb: 2, hs: 24, knock: 1, src: e, sfx: () => { SFX.thunder(); flash('#ccf', 3); }, draw: boltDraw }); }

// ---- Comunes ----
ENEMIES.tlac = {
  name: 'TLACUACHE MUTANTE', hp: 45, w: 30, h: 18, spd: 1.5, money: 15, block: 0.1, keep: 26,
  atk: [
    { range: 34, tot: 30, hits: [HT(12, 4, [2, -16, 22, 14], 6, 1.5, 14)] },
    { range: 110, min: 40, tot: 46, fwd: 3.6, roll: 1, hits: [HT(12, 22, [-8, -16, 26, 16], 8, 2.5, 18)] },
  ],
  draw(e, o) {
    if (e.move && e.move.roll && e.mt > 10) { circ(e.x, e.y - 9, 9, o.flash ? '#fff' : '#8d8d95'); R(e.x - 3 + 4 * e.f, e.y - 12, 2, 2, '#ff3030'); return; }
    if (o.flash) g.globalAlpha = 0.5;
    drawTlac(e.x + tele(e, 12), e.y, e.f, 2, e.st === 'walk' ? (tick >> 3) % 2 : 0); g.globalAlpha = 1;
  },
};
ENEMIES.mini = {
  name: 'TLACUACHITO', minion: 1, hp: 14, w: 20, h: 12, spd: 2.2, money: 0, block: 0, keep: 18, cdMin: 30, cdMax: 60,
  atk: [{ range: 24, tot: 24, hits: [HT(8, 4, [2, -12, 18, 10], 4, 1, 12)] }],
  draw(e, o) { if (o.flash) g.globalAlpha = 0.5; drawTlac(e.x, e.y, e.f, 1, (tick >> 2) % 2); g.globalAlpha = 1; },
};
ENEMIES.flamingo = {
  name: 'FLAMINGO INFLABLE', hp: 50, w: 22, h: 40, spd: 1.1, money: 15, block: 0.1, keep: 30, jumpy: 3,
  atk: [
    { range: 40, tot: 32, peck: 1, hits: [HT(14, 4, [4, -42, 22, 12], 7, 2, 16)] },
    { range: 130, min: 50, tot: 60, jump: -5.5, fwd: 2.6, hits: [HT(10, 30, [-10, -32, 26, 32], 10, 3, 22, { knock: 1 })] },
  ],
  draw(e, o) {
    const bob = e.air ? 0 : Math.sin(tick / 8) * 2, x = e.x + tele(e, 12), y = e.y + bob, f = e.f;
    const c = o.flash ? '#fff' : '#ff7bb0', c2 = o.flash ? '#fff' : '#e05a95';
    limb(x - 2, y - 10, x - 3, y, 1, c2); limb(x + 2, y - 10, x + 3, y, 1, c2);
    R(x - 11, y - 22, 22, 12, c); R(x - 9, y - 24, 18, 2, c); R(x - 11, y - 12, 22, 2, c2);
    const peck = e.move && e.move.peck && e.mt > 10 && e.mt < 20, nx = x + (peck ? 12 : 6) * f;
    limb(x + 4 * f, y - 22, nx, y - 36, 3, c);
    R(nx - 3, y - 41, 7, 5, c); R(f > 0 ? nx + 4 : nx - 8, y - 39, 5, 2, '#222'); R(nx + f, y - 40, 1, 1, '#000');
    R(x - 8 * f, y - 18, 2, 2, '#fff');
  },
};
ENEMIES.llanta = {
  name: 'LLANTA LOCA', hp: 55, w: 24, h: 26, spd: 1.3, money: 15, block: 0.05, keep: 30,
  atk: [
    { range: 150, min: 30, tot: 50, fwd: 4.2, hits: [HT(14, 26, [-12, -26, 26, 26], 9, 3, 20)] },
    { range: 44, tot: 44, jump: -6, fwd: 1.5, hits: [HT(18, 20, [-12, -26, 26, 26], 8, 2, 18, { knock: 1 })] },
  ],
  draw(e, o) {
    const x = e.x + tele(e, 14), y = e.y - 13, a = e.x / 6;
    circ(x, y, 13, o.flash ? '#fff' : '#1a1a1a'); circ(x, y, 8, '#555'); circ(x, y, 4, '#888');
    for (let i = 0; i < 6; i++) { const an = a + i * 1.05; R(x + Math.cos(an) * 10.5 - 1, y + Math.sin(an) * 10.5 - 1, 2, 2, '#333'); }
    R(x - 5, y - 3, 4, 3, '#fff'); R(x + 2, y - 3, 4, 3, '#fff'); R(x - 4 + e.f, y - 2, 2, 2, '#d00'); R(x + 3 + e.f, y - 2, 2, 2, '#d00');
  },
};
ENEMIES.paraguas = {
  name: 'PARAGUAS MALDITO', hp: 55, w: 20, h: 40, spd: 1.4, money: 18, block: 0.15, keep: 28, jumpy: 2,
  atk: [
    { range: 38, tot: 40, spin: 1, hits: [HT(10, 3, [-16, -42, 40, 20], 3, 0.5, 12), HT(18, 3, [-16, -42, 40, 20], 3, 0.5, 12), HT(26, 3, [-16, -42, 40, 20], 4, 2.5, 18)] },
    { range: 110, min: 20, tot: 70, jump: -7, fwd: 2, act(e, t) { if (t === 28) e.vy = 6; }, hits: [HT(30, 22, [-12, -14, 24, 14], 10, 2, 22, { knock: 1 })] },
  ],
  draw(e, o) {
    const x = e.x + (e.move && e.move.spin && e.mt > 8 ? (tick % 4 < 2 ? -3 : 3) : 0), y = e.y, c = o.flash ? '#fff' : '#1e1e26';
    limb(x, y - 30, x, y - 6, 2, '#777'); R(x, y - 6, 4, 2, '#777'); R(x + 3, y - 8, 2, 2, '#777');
    for (let k = 0; k < 11; k++) { const w = Math.round(Math.sqrt(121 - (11 - k) * (11 - k)) * 1.6); R(x - w, y - 42 + k, w * 2, 1, c); }
    for (let i = 0; i < 4; i++) R(x - 16 + i * 8, y - 31, 8, 2, i % 2 ? '#c22' : c);
    R(x - 6, y - 37, 4, 3, '#fff'); R(x + 2, y - 37, 4, 3, '#fff'); R(x - 5 + e.f, y - 36, 2, 2, '#e22'); R(x + 3 + e.f, y - 36, 2, 2, '#e22');
  },
};
ENEMIES.tinaco = {
  name: 'TINACO VIVIENTE', hp: 85, w: 26, h: 38, spd: 0.7, money: 22, block: 0.2, keep: 60, cdMin: 50, cdMax: 90,
  atk: [
    { range: 170, min: 30, tot: 44, proj: { f: 16, make(e) { eproj(e, { x: e.x + 14 * e.f, y: e.y - 30, vx: 3.6 * e.f, w: 10, h: 6, dmg: 6, hs: 16, life: 80, c: '#7cf' }); } } },
    { range: 100, tot: 70, jump: -6.5, fwd: 1.6, act(e, t) {
      if (t === 1) e.ai.slam = 0;
      if (!e.air && t > 10 && !e.ai.slam) { e.ai.slam = 1; shake = 4; SFX.heavy(); [-1, 1].forEach(s => eproj(e, { x: e.x + s * 14, y: GY - 8, vx: 3 * s, w: 12, h: 8, dmg: 9, kb: 2, hs: 20, life: 60, c: '#cba' })); }
    } },
  ],
  draw(e, o) {
    const x = e.x + tele(e, 16), y = e.y, c = o.flash ? '#fff' : '#1c1c20';
    R(x - 6, y - 4, 3, 4, '#555'); R(x + 3, y - 4, 3, 4, '#555');
    R(x - 13, y - 36, 26, 32, c); R(x - 12, y - 34, 24, 1, '#3a3a40'); R(x - 12, y - 22, 24, 1, '#3a3a40'); R(x - 7, y - 40, 14, 4, '#2a2a30');
    R(x - 7, y - 30, 4, 4, '#fff'); R(x + 3, y - 30, 4, 4, '#fff'); R(x - 6 + e.f, y - 29, 2, 2, '#e22'); R(x + 4 + e.f, y - 29, 2, 2, '#e22');
    R(x - 5, y - 20, 10, 3, '#000'); if (tick % 30 < 15) R(x + 9 * e.f, y - 6, 1, 3, '#7cf');
  },
};
ENEMIES.rayo = {
  name: 'RAYO CON PATAS', hp: 60, w: 16, h: 44, spd: 2, money: 20, block: 0.1, keep: 70,
  atk: [
    { range: 220, min: 30, tot: 36, proj: { f: 14, make(e) { eproj(e, { x: e.x + 10 * e.f, y: e.y - 34, vx: 5.2 * e.f, w: 10, h: 4, dmg: 7, hs: 16, life: 70, c: '#ff4' }); } } },
    { range: 400, tot: 50, act(e, t) { if (t === 1) bolt(e, F.p.x); } },
    { range: 70, tot: 34, act(e, t) { if (t === 14) { burst(e.x, e.y - 20, 8, '#ff4'); e.x = clamp(F.p.x - 30 * F.p.f, 20, 300); e.f = F.p.x > e.x ? 1 : -1; burst(e.x, e.y - 20, 8, '#ff4'); } }, hits: [HT(20, 4, [2, -40, 18, 14], 7, 2, 16)] },
  ],
  draw(e, o) {
    const x = e.x + tele(e, 12), y = e.y, c = o.flash ? '#fff' : '#ffe04a';
    limb(x - 3, y - 12, x - 4, y, 2, '#888'); limb(x + 3, y - 12, x + 4, y, 2, '#888');
    limb(x + 4, y - 44, x - 4, y - 30, 7, c); limb(x - 4, y - 30, x + 5, y - 24, 7, c); limb(x + 5, y - 24, x - 2, y - 12, 6, c);
    R(x - 3, y - 40, 3, 3, '#000'); R(x + 1, y - 40, 3, 3, '#000'); R(x - 2 + e.f, y - 39, 1, 1, '#fff');
    if (tick % 10 < 3) part(x + rnd(-8, 8), y - rnd(10, 40), rnd(-1, 1), -1, 8, '#fff', 1, 0);
  },
};

// ---- JEFE 1: DOÑA CHAYO ----
ENEMIES.chayo = {
  name: 'DOÑA CHAYO', boss: 1, hp: 220, w: 18, h: 50, spd: 1.0, money: 50, block: 0.3, keep: 40, cdMin: 35, cdMax: 70,
  init(e) { e.ai.ch = 1; },
  atk: [
    { range: 400, min: 50, ok: e => e.ai.ch, pose: 'throw2', pre: 'throw1', tot: 34, proj: { f: 12, make(e) {
      e.ai.ch = 0; e.ai.weak = 0; pop(e.x, e.y - 64, '¡CHANCLA!', '#f8f', 6);
      eproj(e, { kind: 'chancla', x: e.x + 10 * e.f, y: e.y - 44, vx: 2.4 * e.f, home: 0.09, w: 10, h: 6, dmg: 8, kb: 2, hs: 22, life: 170, windy: 0 });
    } } },
    { range: 58, pose: 'heavy', broom: 1, tot: 44, hits: [HT(16, 6, [4, -9, 34, 9], 9, 2, 26, { knock: 1 })], act(e, t) { if (t === 2) pop(e.x, e.y - 64, '¡ESCOBAZO!', '#fff', 6); } },
    { range: 28, pose: 'punch', tot: 40, hits: [HT(14, 3, [4, -46, 16, 26], 12, 1, 40, { unb: 1, parryable: 1, knock: 1, launch: -3 })], act(e, t) { if (t === 2) pop(e.x, e.y - 64, '¡VEN ACÁ, MUCHACHO!', '#fc8', 5); } },
    { range: 32, pose: 'punch', tot: 26, hits: [HT(9, 3, [4, -42, 18, 10], 6, 2, 16)] },
  ],
  always(e) {
    if (!e.ai.ch && ++e.ai.weak > 220) { e.ai.ch = 1; pop(e.x, e.y - 64, '¡Mi otra chancla!', '#f8f', 5); }
    if (tick % 400 === 0 && e.hp > 0) pop(e.x, e.y - 72, pick(['¡Mis plantas!', '¡Desde 2019, Daniel!', '¡Le voy a decir a tu mamá!']), '#fff', 5);
  },
  dmgMod(t, a, h, d) { return t.ai.ch ? d : d * 1.5; },
  draw(e, o) {
    const throwing = e.move && e.move.proj && e.mt > 12;
    drawRig(e.x + tele(e, 8), e.y, e.f, o.pose, CHAYO, { flash: o.flash, chancla: e.ai.ch && !throwing, broom: e.move && e.move.broom });
    if (!e.ai.ch) txt('¡SIN CHANCLA!', e.x, e.y - 72, '#ff9', 4, 'center');
  },
};

// ---- JEFE 2: REY TLACUACHE ----
const rollDraw = pr => { circ(pr.x, pr.y + 7, 7, '#8d8d95'); R(pr.x - 2 + sign(pr.vx) * 3, pr.y + 4, 2, 2, '#f33'); };
ENEMIES.rey = {
  name: 'REY TLACUACHE', boss: 1, heavy: 1, hp: 300, w: 56, h: 50, spd: 0.8, money: 60, block: 0, keep: 52, cdMin: 50, cdMax: 90,
  init(e) { e.ai.th = [210, 120]; },
  atk: [
    { range: 400, min: 60, tot: 70, act(e, t) { if (t === 10 || t === 30 || t === 50) eproj(e, { x: e.x + 20 * e.f, y: GY - 14, vx: 3 * e.f, w: 14, h: 14, dmg: 7, kb: 2, hs: 18, life: 130, draw: rollDraw }); } },
    { range: 300, min: 40, tot: 40, proj: { f: 18, make(e) {
      eproj(e, { x: e.x, y: e.y - 50, vx: (F.p.x - e.x) / 55, vy: -5, grav: 0.18, w: 10, h: 10, dmg: 6, hs: 16, life: 130, c: '#6a4a2a', onHit(pr, t) { t.slow = 150; pop(t.x, t.y - 60, '¡LODO!', '#a86', 6); } });
    } } },
    { range: 220, min: 30, tot: 80, jump: -6, act(e, t) {
      if (t === 1) e.ai.sl = 0;
      if (t < 40) e.vx = sign(F.p.x - e.x) * 2;
      if (!e.air && t > 8 && !e.ai.sl) { e.ai.sl = 1; shake = 6; SFX.heavy(); [-1, 1].forEach(s => eproj(e, { x: e.x + s * 30, y: GY - 10, vx: 3.2 * s, w: 14, h: 10, dmg: 10, kb: 2, hs: 22, life: 70, c: '#7a5a3a' })); }
    } },
    { range: 62, tot: 36, hits: [HT(16, 5, [0, -40, 40, 30], 9, 3, 20)] },
  ],
  always(e) {
    if (e.hidden) {
      const minis = F.es.filter(m => m.def.minion && m.hp > 0);
      if (!minis.length || --e.ai.splitT <= 0) {
        e.hidden = false; e.x = clamp(F.p.x + (F.p.x < 160 ? 90 : -90), 50, 270); SFX.heavy(); shake = 6; burst(e.x, e.y - 20, 20, '#8d8d95', 3, 3);
        if (!minis.length) { e.stun = 160; pop(e.x, e.y - 72, '¡MAREADO!', '#ffd84a', 8); }
        else { e.hp = Math.min(e.maxhp, e.hp + 30); minis.forEach(m => { m.hp = 0; m.dying = 1; }); pop(e.x, e.y - 72, '¡SE REARMÓ!', '#f88', 7); }
      }
      return;
    }
    if (e.ai.th.length && e.hp <= e.ai.th[0]) {
      e.ai.th.shift(); e.hidden = true; e.move = null; e.ai.splitT = 600; burst(e.x, e.y - 20, 30, '#8d8d95', 3, 3); shake = 6;
      for (let i = 0; i < 5; i++) { const m = mkEnemy('mini', clamp(e.x + (i - 2) * 22, 20, 300)); m.vy = -4 - (i % 2); m.air = true; F.es.push(m); }
      pop(e.x, e.y - 72, '¡SE DESARMÓ! ¡NOQUÉALOS!', '#ffd84a', 6);
    }
  },
  draw(e, o) {
    const x = e.x + tele(e, 10), y = e.y;
    circ(x, y - 8, 28, '#4a3420'); R(x - 30, y - 8, 60, 8, '#4a3420');
    const pos = [[-18, -4], [6, -2], [-6, -14], [16, -16], [-20, -22], [2, -28], [-8, -38], [12, -38], [0, -48]];
    if (o.flash) g.globalAlpha = 0.6;
    pos.forEach((p, i) => drawTlac(x + p[0], y + p[1], i % 2 ? 1 : -1, 1.5, ((tick >> 4) + i) % 2));
    g.globalAlpha = 1;
    R(x - 8, y - 66, 16, 6, '#ffd84a'); R(x - 8, y - 70, 3, 4, '#ffd84a'); R(x - 2, y - 72, 3, 6, '#ffd84a'); R(x + 5, y - 70, 3, 4, '#ffd84a'); R(x - 1, y - 64, 2, 2, '#e22');
  },
};

// ---- JEFE 3: LA BANDA POSEÍDA ----
const BS = { tambora: bandStyle('#c03030', '#fff'), clarinete: bandStyle('#3060c0', '#222'), trompeta: bandStyle('#30a050', '#fff'), tuba: bandStyle('#8030a0', '#e8dcb0') };
function bandDraw(e, o) {
  const k = e.name, p = POSES[o.pose] || P0, hx = e.x + p.hd[0] * e.f, hy = e.y + p.hd[1], f = e.f;
  const bounce = onBeat() ? -1 : 0;
  if (k === 'tuba') { circ(e.x - 2 * f, e.y - 30 + bounce, 12, '#d4a830'); circ(e.x - 2 * f, e.y - 30 + bounce, 7, '#8a6a10'); }
  drawRig(e.x, e.y + bounce, f, o.pose, BS[k], { flash: o.flash });
  if (k === 'tambora') { circ(e.x + 8 * f, e.y - 26 + bounce, 9, '#e8dcc0'); R(e.x + 8 * f - 9, e.y - 28 + bounce, 19, 3, '#c22'); }
  if (k === 'clarinete') { limb(hx + 4 * f, hy + 3, hx + 14 * f, hy + 18, 2, '#111'); if (e.ai.aim > 0 && tick % 4 < 2) R(12, GY - 42, Math.max(0, e.x - 12), 1, '#f22'); }
  if (k === 'trompeta') { limb(hx + 4 * f, hy + 3, hx + 16 * f, hy + 3, 2, '#e8c040'); R(hx + (f > 0 ? 15 : -19), hy, 5, 7, '#e8c040'); }
  if (k === 'tuba') { R(e.x - 8 * f - 4, hy - 14, 10, 8, '#d4a830'); if (e.ai.solo > 0) txt('SOLO DE TUBA: ' + Math.ceil(e.ai.solo / 60), 160, 44, tick % 20 < 10 ? '#f44' : '#ffd84a', 7, 'center'); }
}
function bandMember(name, title, hp) {
  return { name: title, boss: 1, hp, w: 16, h: 50, spd: 0.3, money: 20, block: 0.15, keep: 26, cdMin: 70, cdMax: 120, atk: [{ range: 28, pose: 'punch', tot: 30, hits: [HT(10, 4, [4, -42, 18, 14], 5, 3, 16)] }], draw: bandDraw, init(e) { e.name = name; e.ai.home = e.x; }, always(e) { e.x = clamp(e.x, e.ai.home - 30, e.ai.home + 30); } };
}
ENEMIES.tambora = bandMember('tambora', 'LA TAMBORA', 70);
ENEMIES.clarinete = bandMember('clarinete', 'EL CLARINETE', 70);
ENEMIES.trompeta = bandMember('trompeta', 'LA TROMPETA', 70);
ENEMIES.tuba = { ...bandMember('tuba', 'LA TUBA', 110), dmgMod(t, a, h, d) { if (F.es.some(x => x !== t && x.hp > 0)) { if (tick - (t.ai.nt || 0) > 40) { pop(t.x, t.y - 64, '¡LA TUBA VA AL ÚLTIMO!', '#ffd84a', 5); t.ai.nt = tick; } return 0; } return d; } };
function bandTick(F) {
  const n = AC && song ? Math.floor((AC.currentTime - songT0) / (stepDur() * 2)) : Math.floor(F.t / 30);
  for (const e of F.es) if (e.name === 'clarinete' && e.hp > 0 && e.ai.aim > 0 && --e.ai.aim === 0) eproj(e, { x: e.x - 12, y: GY - 44, vx: 7 * sign(F.p.x - e.x || -1), w: 12, h: 5, dmg: 8, hs: 18, life: 60, c: '#fff' });
  const tuba = F.es.find(e => e.name === 'tuba');
  const alone = tuba && tuba.hp > 0 && F.es.every(e => e === tuba || e.hp <= 0);
  if (alone) {
    if (!tuba.ai.solo) { tuba.ai.solo = 1200; pop(160, 60, '¡LA TUBA SE AVENTÓ UN SOLO!', '#ffd84a', 7); }
    F.wind = -0.8 * sign(tuba.x - F.p.x || 1);
    if (--tuba.ai.solo <= 1) { tuba.ai.solo = 600; hazard({ x: 0, y: 0, w: W, h: GY, warn: 30, act: 8, dmg: 30, kb: 5, hs: 40, knock: 1, unb: 1, src: tuba, sfx: () => { SFX.boom(); shake = 10; }, draw: z => { if (z.warn > 0) { if (tick % 6 < 3) { g.globalAlpha = 0.2; R(0, 0, W, GY, '#ffd84a'); g.globalAlpha = 1; } } else { g.globalAlpha = 0.5; R(0, 0, W, GY, '#ffd84a'); g.globalAlpha = 1; } } }); }
  }
  if (n === F.lastBeat) return;
  F.lastBeat = n;
  if (F.result) return;
  for (const e of F.es) {
    if (e.hp <= 0 || e.stun > 0 || e.hs > 0) continue;
    if (e.name === 'tambora' && n % 4 === 0) { shake = 2; [-1, 1].forEach(s => eproj(e, { x: e.x + s * 10, y: GY - 10, vx: 2.6 * s, w: 10, h: 10, dmg: 8, kb: 2, hs: 18, life: 120, c: '#e8dcc0' })); }
    if (e.name === 'clarinete' && n % 6 === 3) e.ai.aim = 40;
    if (e.name === 'trompeta' && n % 3 === 1) eproj(e, { x: e.x, y: e.y - 48, vx: (F.p.x - e.x) / 60, vy: -3, grav: 0.1, w: 7, h: 7, dmg: 5, hs: 14, life: 120, draw: pr => { R(pr.x - 2, pr.y + 3, 4, 4, '#ffd84a'); R(pr.x + 1, pr.y - 3, 1, 7, '#ffd84a'); } });
    if (e.name === 'tuba' && alone && n % 2 === 0) eproj(e, { x: e.x, y: e.y - 30 - ri(0, 1) * 18, vx: 2.4 * sign(F.p.x - e.x || -1), w: 8, h: 8, dmg: 6, hs: 14, life: 140, draw: pr => { R(pr.x - 3, pr.y + 3, 5, 4, '#d4a830'); R(pr.x + 1, pr.y - 4, 1, 8, '#d4a830'); } });
  }
}

// ---- JEFE 4: EL METEORÓLOGO RAMÍREZ ----
const graphDraw = z => { if (z.warn > 0) { R(z.x, GY - 2, z.w, 2, tick % 6 < 3 ? '#f22' : '#000'); const yy = -40 + (50 - z.warn) * 2; R(z.x, yy, z.w, 30, '#4ac'); } else { R(z.x, z.y, z.w, z.h, '#4ac'); R(z.x + 2, z.y + 2, z.w - 4, 4, '#8ef'); } };
const acidDraw = z => { if (z.warn > 0) { if (tick % 8 < 4) { g.globalAlpha = 0.3; R(z.x, GY - 4, z.w, 4, '#7f3'); g.globalAlpha = 1; } } else { for (let i = 0; i < 10; i++) R(z.x + ri(0, z.w), ri(0, GY), 1, 6, '#9f4'); g.globalAlpha = 0.25; R(z.x, 0, z.w, GY, '#7f3'); g.globalAlpha = 1; } };
ENEMIES.ram = {
  name: 'METEORÓLOGO RAMÍREZ', boss: 1, hp: 420, w: 18, h: 50, spd: 1.1, money: 80, block: 0.2, keep: 64, cdMin: 40, cdMax: 70,
  init(e) { e.ai.ph = 1; },
  always(e) {
    const ph = e.hp > 280 ? 1 : e.hp > 140 ? 2 : 3;
    if (ph !== e.ai.ph) { e.ai.ph = ph; e.inv = 60; e.move = null; flash('#fff', 10); shake = 6; SFX.thunder(); pop(e.x, e.y - 72, ph === 2 ? '¡IMPERMEABLE ROBÓTICO!' : '¡ME FUSIONO CON EL MAPA!', '#ffd84a', 6); }
  },
  atk: [
    { range: 999, tot: 60, pose: 'punch', ok: e => e.ai.ph < 3, act(e, t) { if (t === 1) { const hi = Math.random() < 0.5; hazard({ x: 12, y: hi ? GY - 48 : GY - 12, w: 296, h: hi ? 10 : 12, warn: 45, act: 12, dmg: 10, kb: 2, hs: 20, src: e, c: '#f44' }); pop(e.x, e.y - 64, hi ? '¡LÁSER! (agáchate)' : '¡LÁSER! (brinca)', '#f88', 5); } } },
    { range: 999, tot: 50, ok: e => e.ai.ph === 1, act(e, t) { if (t === 1) for (let i = 0; i < 3; i++) { const x = clamp(F.p.x + (i - 1) * 50 + ri(-10, 10), 14, 290); hazard({ x, y: 40, w: 22, h: GY - 40, warn: 50 + i * 8, act: 10, dmg: 9, kb: 1, hs: 20, src: e, draw: graphDraw }); } } },
    { range: 48, tot: 30, pose: 'punch', hits: [HT(10, 4, [4, -40, 30, 6], 7, 2, 16)] },
    { range: 999, tot: 40, ok: e => e.ai.ph === 2, act(e, t) { if (t === 1) [F.p.x - 20, rnd(20, 280)].forEach(x => hazard({ x: clamp(x, 12, 268), y: 0, w: 40, h: GY, warn: 60, act: 70, dmg: 3, kb: 0.5, hs: 8, tickDmg: 1, src: e, draw: acidDraw })); } },
    { range: 999, tot: 50, ok: e => e.ai.ph === 3, act(e, t) { if (t % 12 === 0 && t <= 36) eproj(e, { x: e.x, y: e.y - 60, vx: (F.p.x - e.x) / 50 + rnd(-0.5, 0.5), vy: -3.5, grav: 0.14, w: 9, h: 9, dmg: 7, hs: 16, life: 140, draw: pr => { circ(pr.x, pr.y + 4, 4, '#f80'); circ(pr.x, pr.y + 4, 2, '#ff4'); } }); } },
    { range: 999, tot: 30, ok: e => e.ai.ph === 3, act(e, t) { if (t === 1) { F.clouds.push({ x: rnd(60, 260), y: rnd(70, 130), t: 240 }); pop(e.x, e.y - 72, '¡NUBLADO!', '#ccc', 6); } } },
    { range: 999, tot: 70, ok: e => e.ai.ph === 3, act(e, t) { if (t === 1) [0, 40, -40].forEach((d, i) => bolt(e, clamp(F.p.x + d, 20, 300), 40 + i * 15)); } },
    { range: 999, tot: 100, ok: e => e.ai.ph === 3, act(e, t) { if (t === 1) pop(e.x, e.y - 72, '¡¿GRANIZO EN CULIACÁN?!', '#cff', 5); if (t % 6 === 0) eproj(e, { x: rnd(20, 300), y: -10, vy: 3, w: 6, h: 6, dmg: 3, hs: 10, kb: 0.5, life: 80, draw: pr => R(pr.x - 3, pr.y, 6, 6, '#e0f8ff') }); } },
  ],
  dmgMod(t, a, h, d, dir) {
    if (t.ai.ph === 2 && dir === -t.f && !h.gb && !h.unb && !h.sup && !(t.guardOff > 0)) { if (tick - (t.ai.umb || 0) > 20) { pop(t.x, t.y - 64, '¡PARAGUAS! (usa escoba o agarre)', '#9cf', 5); t.ai.umb = tick; } return 0; }
    return d;
  },
  draw(e, o) {
    const ph = e.ai.ph, fl = ph === 3 ? Math.sin(tick / 10) * 3 - 6 : 0;
    if (ph === 3) { g.globalAlpha = 0.35; circ(e.x, e.y - 28 + fl, 30, '#2f2'); g.globalAlpha = 1; ['☀', '☁', '⚡', '❄'].forEach((s, i) => { const a = tick / 25 + i * 1.57; txt(s, e.x + Math.cos(a) * 30, e.y - 34 + fl + Math.sin(a) * 18, '#fff', 7, 'center', false); }); }
    drawRig(e.x + tele(e, 8), e.y + fl, e.f, o.pose, ph === 2 ? RAMIREZ2 : RAMIREZ, { flash: o.flash, pointer: ph === 1, wii: ph === 3 });
    if (ph === 2) { const ux = e.x + 14 * e.f; R(ux - (e.f > 0 ? 0 : 3), e.y - 54, 4, 40, '#3a3'); R(ux - (e.f > 0 ? 0 : 3), e.y - 54, 4, 4, '#7f7'); }
  },
};

// ---- JEFE FINAL: HURACÁN CHUYITA ----
ENEMIES.chuy = {
  name: 'HURACÁN CHUYITA', boss: 1, fixed: 1, heavy: 1, hp: 600, w: 56, h: 120, money: 0, block: 0,
  init(e) { e.x = 276; e.ai.ph = 1; e.ai.at = 120; e.f = -1; },
  ai(e) {
    const ph = e.hp > 400 ? 1 : e.hp > 200 ? 2 : 3, p = F.p;
    if (ph !== e.ai.ph) {
      e.ai.ph = ph; e.inv = 60; flash('#fff', 12); shake = 8; SFX.thunder(); F.projs = F.projs.filter(q => q.owner === 'p');
      if (ph === 2) { F.cfg.windCycle = 300; F.cfg.windMax = 1; F.cfg.windPush = 0.8; F.wind = -1; pop(140, 50, '¡LA REMOLINA! (pega con el viento a favor)', '#9cf', 5); }
      if (ph === 3) {
        F.cfg.windCycle = 0; F.wind = 0; e.ai.eye = 1;
        if (G.bond >= 4 && !e.ai.howl) { e.ai.howl = 1; p.meter = 300; G.un.aullido = true; SFX.howl(); pop(140, 50, '¡NIEVE AÚLLA DESDE ADENTRO!', '#9cf', 7); pop(140, 64, 'DESMADRE AL MÁXIMO · V+C', '#ffd84a', 6); }
        else pop(140, 56, '¡EL OJO! SOLO LOS SÚPERS LE HACEN DAÑO', '#fff', 5);
      }
    }
    if (e.ai.inhale > 0) { e.ai.inhale--; if (!p.air) p.x += 0.8; if (tick % 3 === 0) part(rnd(20, 240), rnd(40, 150), 3, 0, 20, '#ccd', 1, 0); }
    if (p.x > F.arenaR - 3 && p.hs <= 0 && p.st !== 'down' && tick % 20 === 0) applyHit(e, p, HT(0, 0, 0, 8, 5, 20, { knock: 1 }), -1);
    if (--e.ai.at > 0) return;
    e.ai.at = ph === 1 ? ri(70, 110) : ph === 2 ? ri(55, 85) : ri(50, 80);
    const r = Math.random();
    if (ph === 1) {
      if (r < 0.65) {
        const k = pick(['tsuru', 'carrito', 'techo']), sx = e.x - 30, tx = clamp(p.x + rnd(-24, 24), 20, 220);
        pop(e.x - 20, 30, pick(['¡AHÍ TE VA!', '¡TOMA TU TSURU!', '¡AGÁRRALA!']), '#fff', 5);
        eproj(e, { kind: 'obj', obj: k, x: sx, y: 30, vx: (tx - sx) / 70, vy: -2.5, grav: 0.1, w: 24, h: 16, dmg: 12, kb: 3, hs: 24, knock: 1, life: 240, ground: 1, windy: 0,
          onLand(pr) { pr.life = 0; F.objs.push({ kind: pr.obj, x: pr.x, y: GY, state: 'ground', life: 480 }); SFX.heavy(); shake = 3; burst(pr.x, GY, 8, '#887'); } });
      } else { F.wind = -1; e.ai.gust = 120; pop(e.x - 30, 40, '¡FIUUUU!', '#9cf', 7); }
    } else if (ph === 2) {
      const s = sign(F.wind) || 1;
      for (let i = 0; i < 2; i++) eproj(e, { x: s > 0 ? -10 - i * 40 : 250 + i * 40, y: pick([GY - 12, GY - 46]), vx: 3.4 * s, w: 14, h: 10, dmg: 6, hs: 16, life: 140, windy: 0, draw: pr => drawObj('silla', pr.x, pr.y + 10) });
      if (r < 0.3) bolt(e, p.x);
    } else {
      if (r < 0.35) [0, 36, -36].forEach((d, i) => bolt(e, clamp(p.x + d, 20, 230), 40 + i * 14));
      else if (r < 0.7) eproj(e, { x: e.x - 30, y: GY - 18, vx: -2.6, w: 14, h: 18, dmg: 8, kb: 2, hs: 18, life: 140, draw: pr => { for (let i = 0; i < 5; i++) R(pr.x - 2 - i + Math.sin(tick / 2 + i) * 3, pr.y + 16 - i * 4, 4 + i * 2, 3, '#aab'); } });
      else { e.ai.inhale = 120; pop(e.x - 40, 40, '¡SSSSHHHHP!', '#ccd', 7); }
    }
  },
  always(e) { if (e.ai.gust > 0 && --e.ai.gust === 0 && e.ai.ph === 1) F.wind = 0.15; },
  dmgMod(t, a, h, d, dir, pr) {
    if (pr && pr.obj) d = 30;
    if (t.ai.ph === 2 && Math.abs(F.wind) > 0.3) d *= sign(F.wind) === dir ? 1.6 : 0.5;
    if (t.ai.ph === 3) { if (!h.sup) { if (tick - (t.ai.tk || 0) > 40) { pop(t.x - 40, 60, '¡SOLO SÚPERS! (cargas Desmadre)', '#fff', 5); t.ai.tk = tick; } return 0; } d *= 3; }
    return d;
  },
  draw(e, o) {
    const x = e.x, y = GY - 64, t = tick, ph = e.ai.ph;
    for (let r = 64; r > 10; r -= 6) for (let k = 0; k < 16; k++) { const a = k / 16 * 6.283 + t / (14 + r / 5) * ((r / 6) % 2 ? 1 : -1); R(x + Math.cos(a) * r * 0.62 - 3, y + Math.sin(a) * r - 2, 6, 4, (r / 6) % 2 ? '#5a6478' : '#7a8498'); }
    circ(x, y, 26, o.flash ? '#fff' : '#9aa4b8');
    for (let i = 0; i < 5; i++) { R(x - 26 + i * 11, y - 30 - (i % 2) * 3, 9, 6, '#ff8fc0'); R(x - 24 + i * 11, y - 29 - (i % 2) * 3, 5, 1, '#fff'); }
    if (ph < 3) {
      R(x - 16, y - 10, 10, 8, '#fff'); R(x + 4, y - 10, 10, 8, '#fff'); R(x - 14, y - 7, 4, 4, '#d00'); R(x + 6, y - 7, 4, 4, '#d00');
      limb(x - 18, y - 16, x - 6, y - 12, 2, '#333'); limb(x + 16, y - 16, x + 4, y - 12, 2, '#333');
      const open = e.ai.at < 20 || e.ai.inhale > 0; R(x - 12, y + 6, 24, open ? 12 : 4, '#2a1a2a'); if (open) { R(x - 10, y + 6, 20, 2, '#fff'); R(x - 10, y + 16, 20, 2, '#fff'); }
    } else {
      circ(x, y, 18, '#fff'); circ(x, y, 15, '#1a2a50'); drawNieve(x + 2, y + 8, -1, 1, 0);
      R(x - 22, y - 20, 44, 3, '#333');
      if (tick % 60 < 30) txt('¡NIEVE!', x, y - 46, '#9cf', 6, 'center');
    }
    if (t % 50 < 4) limb(x - 30, y - 50, x - 50, y - 20, 2, '#ff4');
  },
};
