'use strict';
// ===== Poses de esqueleto (mirando a la derecha, origen en los pies) =====
const P0 = { hip: [0, -22], sh: [1, -37], hd: [2, -45], fk: [4, -11], ff: [5, 0], bk: [-3, -11], bf: [-5, 0], fe: [7, -29], fh: [10, -35], be: [3, -29], bh: [7, -36] };
const POSES = {
  idle: P0,
  idle2: { ...P0, sh: [1, -36], hd: [2, -44], fh: [10, -34], bh: [7, -35] },
  walk1: { ...P0, fk: [6, -11], ff: [8, 0], bk: [-4, -10], bf: [-8, 0] },
  walk2: { ...P0, fk: [1, -11], ff: [-2, 0], bk: [2, -11], bf: [3, 0] },
  punch: { hip: [1, -22], sh: [3, -37], hd: [4, -45], fk: [6, -11], ff: [8, 0], bk: [-3, -11], bf: [-6, 0], fe: [11, -35], fh: [19, -36], be: [2, -30], bh: [7, -34] },
  heavy: { hip: [2, -21], sh: [6, -35], hd: [8, -42], fk: [9, -11], ff: [12, 0], bk: [-3, -10], bf: [-8, 0], fe: [14, -34], fh: [23, -33], be: [3, -29], bh: [6, -25] },
  kick: { hip: [-1, -23], sh: [-4, -38], hd: [-5, -46], fk: [8, -24], ff: [19, -27], bk: [-1, -11], bf: [-2, 0], fe: [0, -30], fh: [4, -35], be: [-7, -31], bh: [-11, -28] },
  crouch: { hip: [0, -13], sh: [2, -27], hd: [4, -34], fk: [7, -8], ff: [6, 0], bk: [-5, -6], bf: [-6, 0], fe: [8, -21], fh: [11, -26], be: [4, -20], bh: [8, -25] },
  jump: { hip: [0, -22], sh: [1, -37], hd: [2, -45], fk: [6, -16], ff: [3, -8], bk: [-3, -14], bf: [-6, -6], fe: [6, -34], fh: [9, -40], be: [-2, -33], bh: [-6, -38] },
  airkick: { hip: [0, -22], sh: [-2, -37], hd: [-3, -45], fk: [8, -20], ff: [18, -16], bk: [-3, -14], bf: [-6, -6], fe: [2, -32], fh: [6, -36], be: [-6, -32], bh: [-10, -30] },
  hurt: { hip: [-1, -22], sh: [-5, -36], hd: [-8, -42], fk: [3, -11], ff: [4, 0], bk: [-4, -11], bf: [-6, 0], fe: [-1, -28], fh: [4, -24], be: [-8, -30], bh: [-12, -26] },
  block: { hip: [-1, -21], sh: [0, -36], hd: [1, -43], fk: [3, -11], ff: [5, 0], bk: [-4, -10], bf: [-7, 0], fe: [6, -33], fh: [7, -42], be: [4, -31], bh: [6, -40] },
  upper: { hip: [1, -25], sh: [5, -41], hd: [8, -50], fk: [5, -14], ff: [4, -4], bk: [-3, -13], bf: [-6, -3], fe: [8, -46], fh: [10, -56], be: [-1, -34], bh: [-4, -30] },
  sweep: { hip: [-3, -8], sh: [-10, -13], hd: [-16, -16], fk: [7, -6], ff: [18, -2], bk: [-1, -3], bf: [4, 0], fe: [-12, -6], fh: [-14, 0], be: [-6, -8], bh: [-4, -2] },
  throw1: { ...P0, sh: [-1, -37], hd: [0, -45], fe: [-2, -38], fh: [-6, -46] },
  throw2: { hip: [1, -22], sh: [3, -37], hd: [4, -45], fk: [6, -11], ff: [8, 0], bk: [-3, -11], bf: [-6, 0], fe: [10, -38], fh: [18, -42], be: [2, -30], bh: [7, -34] },
  taunt: { hip: [0, -22], sh: [0, -37], hd: [1, -45], fk: [3, -11], ff: [4, 0], bk: [-3, -11], bf: [-4, 0], fe: [2, -29], fh: [3, -22], be: [-1, -29], bh: [-1, -22] },
  down: { hip: [0, -4], sh: [-14, -4], hd: [-21, -5], fk: [7, -6], ff: [14, -2], bk: [6, -3], bf: [13, -1], fe: [-10, -8], fh: [-6, -2], be: [-14, -2], bh: [-10, -1] },
  bite: { hip: [-6, -14], sh: [6, -16], hd: [13, -17], fk: [-3, -7], ff: [-4, 0], bk: [-8, -7], bf: [-9, 0], fe: [8, -8], fh: [10, 0], be: [4, -8], bh: [5, 0] },
  win: { ...P0, fe: [6, -44], fh: [8, -54] },
  sit: { hip: [0, -8], sh: [1, -23], hd: [2, -31], fk: [8, -10], ff: [10, 0], bk: [6, -9], bf: [9, 0], fe: [5, -15], fh: [9, -11], be: [3, -15], bh: [7, -11] },
  hold: { ...P0, fe: [6, -27], fh: [12, -28], be: [5, -27], bh: [11, -29] },
};

function drawRig(x, y, f, pn, st, o = {}) {
  const p = POSES[pn] || P0, X = v => x + v * f, Y = v => y + v, fl = o.flash ? '#ffffff' : null, c = k => fl || st[k];
  const aw = st.aw || 4, lw = st.lw || 5;
  limb(X(p.sh[0]), Y(p.sh[1] + 2), X(p.be[0]), Y(p.be[1]), aw, c('sleeveB'));
  limb(X(p.be[0]), Y(p.be[1]), X(p.bh[0]), Y(p.bh[1]), aw - 1, c('skinB'));
  limb(X(p.hip[0]), Y(p.hip[1]), X(p.bk[0]), Y(p.bk[1]), lw, c('legB'));
  limb(X(p.bk[0]), Y(p.bk[1]), X(p.bf[0]), Y(p.bf[1] - 1), lw - 1, c('legB'));
  R(X(p.bf[0]) - (f > 0 ? 2 : 3), Y(p.bf[1]) - 2, 6, 2, c('shoe'));
  limb(X(p.hip[0]), Y(p.hip[1]), X(p.sh[0]), Y(p.sh[1] + 3), st.tw || 10, c('top'));
  if (st.torso) st.torso(x, y, f, p, X, Y, fl, o);
  limb(X(p.hip[0]), Y(p.hip[1]), X(p.fk[0]), Y(p.fk[1]), lw, c('leg'));
  limb(X(p.fk[0]), Y(p.fk[1]), X(p.ff[0]), Y(p.ff[1] - 1), lw - 1, c('leg'));
  R(X(p.ff[0]) - (f > 0 ? 2 : 3), Y(p.ff[1]) - 2, 6, 2, c('shoe'));
  st.head(X(p.hd[0]), Y(p.hd[1]), f, o, fl);
  limb(X(p.sh[0]), Y(p.sh[1] + 2), X(p.fe[0]), Y(p.fe[1]), aw, c('sleeve'));
  limb(X(p.fe[0]), Y(p.fe[1]), X(p.fh[0]), Y(p.fh[1]), aw - 1, c('skin'));
  if (st.hand) st.hand(X(p.fh[0]), Y(p.fh[1]), f, o);
}
const mir = (hx, hy, f, fl) => (dx, dy, w, h, c) => R(f > 0 ? hx + dx : hx - dx - w + 1, hy + dy, w, h, fl || c);

// ===== DANIEL =====
const SK = '#dba57c', SK2 = '#bf8660', HAIR = '#2b1a12', HAIR2 = '#4d3020';
function danHead(hx, hy, f, o = {}, fl) {
  const r = mir(hx, hy, f, fl), wv = o.wave || 0;
  r(-1, 4, 4, 4, SK2);
  r(-7 + wv, -4, 4, 10, HAIR); r(-9 + wv, -1, 2, 6, HAIR); r(-6 + wv, 6, 3, 2, HAIR2); r(-9 + wv, 4, 2, 2, HAIR2);
  r(-3, -5, 8, 10, SK);
  r(-6, -10, 11, 6, HAIR); r(-5, -12, 8, 2, HAIR); r(-8, -8, 3, 7, HAIR); r(-3, -13, 2, 1, HAIR); r(1, -13, 2, 1, HAIR);
  r(2, -6, 4, 3, HAIR); r(4, -5, 2, 3, HAIR); r(-1, -5, 2, 2, HAIR2); r(5, -3, 1, 2, HAIR);
  r(-4, -9, 1, 1, HAIR2); r(-1, -11, 1, 1, HAIR2); r(2, -9, 1, 1, HAIR2); r(-7, -3, 1, 1, HAIR2); r(-6, 2, 1, 1, HAIR2); r(3, -11, 1, 1, HAIR2);
  r(-2, -1, 2, 3, SK2);
  if (o.blink) r(2, 0, 2, 1, '#1a1010'); else { r(2, -1, 2, 2, '#fff'); r(3, -1, 1, 2, '#1a1010'); }
  r(1, -3, 3, 1, HAIR);
  r(5, -1, 1, 3, SK2);
  r(3, 3, 2, 1, '#8a4a3a'); if (o.smile) { r(2, 2, 1, 1, '#8a4a3a'); r(5, 2, 1, 1, '#8a4a3a'); }
  const pc = o.pflash ? '#fff7a0' : '#e3e7ee'; r(5, 3, 1, 1, pc); r(2, 4, 1, 1, pc); r(4, 4, 1, 1, pc);
}
const DAN = {
  top: '#3b3d45', sleeve: '#43454e', sleeveB: '#2f3138', skin: SK, skinB: SK2, leg: '#30354a', legB: '#252938', shoe: '#e8e8e8', head: danHead,
  torso(x, y, f, p, X, Y, fl) { const sx = X(p.sh[0]), sy = Y(p.sh[1]); R(sx - 3, sy - 1, 6, 3, fl || '#555862'); R(sx + f, sy + 3, 1, 1, fl || '#202127'); R(sx + f, sy + 6, 1, 1, fl || '#202127'); },
};
function drawDaniel(x, y, f, pose, o = {}) { drawRig(x, y, f, pose, DAN, o); }

// Daniel en vista cenital (exploración)
function drawDanOW(x, y, dir, fr, o = {}) {
  x = Math.round(x); y = Math.round(y);
  R(x - 5, y - 1, 10, 2, 'rgba(0,0,0,0.35)');
  const st = fr % 2 ? 1 : 0;
  R(x - 4, y - 6 + (st ? 1 : 0), 3, 6 - (st ? 1 : 0), '#2a2f42'); R(x + 1, y - 6 + (st ? 0 : 1), 3, 6 - (st ? 0 : 1), '#2a2f42');
  R(x - 4, y - 1, 3, 1, '#ddd'); R(x + 1, y - 1, 3, 1, '#ddd');
  R(x - 5, y - 13, 10, 8, '#3b3d45'); R(x - 2, y - 13, 4, 2, '#555862');
  R(x - 7, y - 12 + (st ? 1 : 0), 2, 6, SK); R(x + 5, y - 12 + (st ? 0 : 1), 2, 6, SK);
  R(x - 5, y - 22, 10, 9, SK);
  if (dir === 'up') { R(x - 6, y - 25, 12, 11, HAIR); R(x - 5, y - 26, 10, 1, HAIR); R(x - 3, y - 22, 1, 1, HAIR2); R(x + 2, y - 19, 1, 1, HAIR2); }
  else {
    R(x - 6, y - 25, 12, 5, HAIR); R(x - 5, y - 26, 10, 1, HAIR); R(x - 3, y - 27, 2, 1, HAIR); R(x + 1, y - 27, 2, 1, HAIR);
    if (dir === 'down') {
      R(x - 7, y - 22, 2, 7, HAIR); R(x + 5, y - 22, 2, 7, HAIR); R(x - 4, y - 21, 3, 2, HAIR); R(x + 1, y - 21, 2, 1, HAIR);
      R(x - 3, y - 18, 1, 2, '#1a1010'); R(x + 2, y - 18, 1, 2, '#1a1010');
      R(x - 1, y - 15, 2, 1, '#8a4a3a'); R(x - 2, y - 15, 1, 1, '#e3e7ee'); R(x + 1, y - 15, 1, 1, '#e3e7ee');
    } else {
      const s = dir === 'left' ? -1 : 1;
      R(s > 0 ? x - 7 : x + 3, y - 23, 4, 9, HAIR); R(s > 0 ? x + 1 : x - 5, y - 21, 4, 2, HAIR);
      R(x + 2 * s, y - 18, 1, 2, '#1a1010'); R(s > 0 ? x + 4 : x - 5, y - 15, 1, 1, '#e3e7ee');
    }
    R(x - 4, y - 24, 1, 1, HAIR2); R(x + 2, y - 23, 1, 1, HAIR2);
  }
}

// ===== NIEVE (husky) =====
const NIEVE_PAL = { W: '#f4f6f8', s: '#8f98a3', d: '#5d6570', k: '#111', e: '#4fb0ff', p: '#ff7b9c' };
const NIEVE1 = [
  '..................d..d..', '..ss.............dd.dd..', '.sWWs...........ssssss..', '.s..s...........sWssWs..',
  '..sWs...........WWWWeWW.', '...sW..........WWWWWWWWk', '....ssssssssssssWWWWWWW.', '...WssssssssssssWWWWWdp.',
  '...WWsssssssssWWWWWW....', '...WWWWsssssWWWWWWW.....', '...WWWWWWWWWWWWWWWW.....', '....WWWWWWWWWWWWWW......',
  '....WW.W......WW.W......', '....WW.W......WW.W......', '....WW.W......WW.W......', '....ss.s......ss.s......'];
const NIEVE2 = NIEVE1.slice(0, 12).concat(['....W.WW......W.WW......', '....W.WW......W.WW......', '....W.WW......W.WW......', '....s.ss......s.ss......']);
const NIEVE_LIE = [
  '........................', '........................', '........................', '........................',
  '........................', '........................', '..................d..d..', '.................dd.dd..',
  '................ssssss..', '................sWssWs..', '..ss............WWWWdWW.', '.sWWssssssssssssWWWWWWWk',
  '.sWWsssssssssssWWWWWWWd.', '..WWWWWWWWWWWWWWWWWWWW..', '..WWWWWWWWWWWWWWWWWW....', '..ss.ss.........ss.ss...'];
function drawNieve(x, y, f = 1, s = 1, fr = 0) { spr(fr === 2 ? NIEVE_LIE : fr % 2 ? NIEVE2 : NIEVE1, NIEVE_PAL, x - 12 * s, y - 16 * s, s, f < 0); }

// ===== PANCHO (loro) =====
const PAN_PAL = { r: '#e53b3b', g: '#33c13f', w: '#fff', k: '#111', b: '#3a3a3a', u: '#2f6fe0', y: '#f5d020' };
const PAN1 = ['....rr....', '...rggg...', '..gggwkb..', '..ggggbbb.', '..gggg.b..', '.yggggg...', 'yyggggg...', '.ygguggg..', '..gguu....', '...gg.....', '..k.k.....'];
const PAN2 = ['....rr....', '...rggg...', '..gggwkb..', 'u.ggggbbb.', 'uuggggb...', 'uugggg....', '.ugggg....', '..gggg....', '...gg.....', '..k.k.....', '..........'];
function drawPancho(x, y, f = 1, s = 1, fly = true) { spr(fly && (tick >> 3) % 2 ? PAN2 : PAN1, PAN_PAL, x - 5 * s, y - 11 * s, s, f < 0); }

// ===== TLACUACHE =====
const TLA_PAL = { g: '#8d8d95', l: '#c9c9cf', w: '#f0f0f0', k: '#111', p: '#f0a0b0', r: '#ff3030' };
const TLA1 = ['...........k.k....', '......ggggggglwl..', '.....gggggggglrwww', 'pp..gggggggggwwwwp', '..p.ggggggggggwww.', '...pggggggggggg...', '....lllllllllll...', '.....kk....kk.....', '.....kk....kk.....'];
const TLA2 = TLA1.slice(0, 7).concat(['....kk......kk....', '....kk......kk....']);
function drawTlac(x, y, f = 1, s = 1, fr = 0) { spr(fr % 2 ? TLA2 : TLA1, TLA_PAL, x - 9 * s, y - 9 * s, s, f < 0); }

// ===== Otros personajes (rig) =====
function npcHead(c) {
  return (hx, hy, f, o = {}, fl) => {
    const r = mir(hx, hy, f, fl);
    r(-1, 4, 4, 4, c.skin2 || c.skin); r(-4, -5, 9, 10, c.skin);
    if (c.hair) { r(-5, -7, 10, 4, c.hair); r(-5, -4, 3, 6, c.hair); }
    if (c.bun) { r(-7, -9, 4, 4, c.hair); r(-3, -8, 6, 2, c.hair); }
    if (c.hat) { r(-7, -7, 15, 2, c.hat); r(-4, -12, 9, 5, c.hat); r(-4, -9, 9, 1, c.band || c.hat); }
    if (c.cap) { r(-5, -8, 10, 4, c.cap); r(4, -6, 4, 2, c.cap); }
    if (c.glasses) { r(1, -2, 4, 3, '#222'); r(2, -1, 2, 1, '#9ee'); } else { r(2, -1, 2, 2, '#fff'); r(3, -1, 1, 2, c.eye || '#111'); }
    r(1, -3, 3, 1, c.brow || '#222');
    r(5, -1, 1, 3, c.skin2 || c.skin);
    if (c.stache) r(2, 2, 4, 2, c.stache);
    r(3, 3, 2, 1, '#6a2a2a');
    if (c.wrinkle) { r(-1, 1, 1, 1, c.skin2); r(0, -4, 3, 1, c.skin2); }
  };
}
const CHAYO = {
  top: '#8b3a8f', sleeve: '#9d4ba1', sleeveB: '#6e2c72', skin: '#c98b62', skinB: '#a8714d', leg: '#a8714d', legB: '#8e5e40', shoe: '#222', tw: 12,
  head: npcHead({ skin: '#c98b62', skin2: '#a8714d', hair: '#c9c9c9', bun: true, glasses: true, brow: '#888', wrinkle: true }),
  torso(x, y, f, p, X, Y, fl) {
    const hx = X(p.hip[0]), hy = Y(p.hip[1]);
    for (let i = 0; i < 12; i++) R(hx - 7 - i * 0.4, hy - 2 + i, 14 + i * 0.8, 1, fl || (i % 4 === 2 ? '#6e2c72' : '#8b3a8f'));
    R(hx - 3, hy - 10, 2, 2, fl || '#ffd84a'); R(hx + 2, hy - 6, 2, 2, fl || '#ff7bb0'); R(hx - 4, hy + 4, 2, 2, fl || '#ffd84a'); R(hx + 3, hy + 7, 2, 2, fl || '#ff7bb0');
  },
  hand(x, y, f, o) { if (o.chancla) { R(x - 3, y - 2, 7, 3, '#ff4fa0'); R(x - 1, y - 3, 2, 1, '#fff'); } if (o.broom) { limb(x, y, x + 16 * f, y + 6, 2, '#a0642c'); limb(x + 14 * f, y + 4, x + 20 * f, y + 9, 4, '#e8c860'); } },
};
const RAMIREZ = {
  top: '#2b3a67', sleeve: '#33467a', sleeveB: '#223055', skin: '#d29a70', skinB: '#b07d58', leg: '#2b3a67', legB: '#223055', shoe: '#111',
  head: npcHead({ skin: '#d29a70', skin2: '#b07d58', hair: '#1a1a1a', glasses: true, stache: '#1a1a1a' }),
  torso(x, y, f, p, X, Y, fl) { const sx = X(p.sh[0]), sy = Y(p.sh[1]); R(sx - 2, sy, 5, 8, fl || '#fff'); R(sx, sy + 1, 2, 9, fl || '#d22'); },
  hand(x, y, f, o) { if (o.pointer) limb(x, y, x + 14 * f, y - 6, 1, '#ccc'); if (o.wii) R(x - 1, y - 4, 3, 6, '#fff'); },
};
const RAMIREZ2 = { ...RAMIREZ, top: '#e8c020', sleeve: '#f0d040', sleeveB: '#b89010', leg: '#888', legB: '#666', tw: 13 };
function bandStyle(shirt, hat) {
  return { top: shirt, sleeve: shirt, sleeveB: shirt, skin: '#c08458', skinB: '#a06a44', leg: '#2a2a2a', legB: '#1e1e1e', shoe: '#5a3a1a', head: npcHead({ skin: '#c08458', skin2: '#a06a44', hat, band: '#c8a040', stache: '#2a1a10', eye: '#e22' }) };
}

// ===== Retratos para diálogos =====
const pcv = document.createElement('canvas'); pcv.width = 20; pcv.height = 20;
const pctx = pcv.getContext('2d'); pctx.imageSmoothingEnabled = false;
const NPC_HEADS = {
  dogo: npcHead({ skin: '#b97a50', skin2: '#94603c', cap: '#e33', stache: '#222' }),
  oxxo: npcHead({ skin: '#d8a07a', skin2: '#b8805a', cap: '#d22' }),
  lancha: npcHead({ skin: '#a06a44', skin2: '#7e5030', hat: '#e8dcb0', stache: '#ddd', wrinkle: true }),
  vec: npcHead({ skin: '#c99068', skin2: '#a87050', hair: '#3a2a1a' }),
  banda: npcHead({ skin: '#c08458', skin2: '#a06a44', hat: '#fff', band: '#c8a040', stache: '#2a1a10', eye: '#e22' }),
};
function portrait(who, x, y) {
  const main = g; g = pctx; pctx.clearRect(0, 0, 20, 20);
  try {
    if (who === 'dan') danHead(9, 12, 1, { blink: tick % 150 < 6 });
    else if (who === 'pan') drawPancho(10, 15, 1, 1, false);
    else if (who === 'chayo') CHAYO.head(9, 12, 1, {});
    else if (who === 'ram') RAMIREZ.head(9, 12, 1, {});
    else if (who === 'nieve') spr(NIEVE1, NIEVE_PAL, -11, 3, 1, false);
    else if (who === 'perro') { R(5, 7, 10, 8, '#a0703a'); R(13, 9, 5, 4, '#a0703a'); R(6, 5, 2, 3, '#7a5020'); R(15, 9, 1, 1, '#111'); R(17, 10, 1, 1, '#111'); }
    else if (who === 'tlac') spr(TLA1, TLA_PAL, 1, 6, 1, false);
    else if (who === 'chuy') { circ(10, 10, 9, '#5a6478'); circ(10, 10, 6, '#7a8498'); R(5, 7, 3, 3, '#fff'); R(12, 7, 3, 3, '#fff'); R(6, 8, 1, 1, '#d00'); R(13, 8, 1, 1, '#d00'); R(6, 13, 8, 2, '#222'); R(3, 2, 3, 2, '#ff8fc0'); R(14, 2, 3, 2, '#ff8fc0'); }
    else if (who === 'tv') { R(1, 3, 18, 14, '#333'); R(3, 5, 14, 10, '#7fd'); for (let i = 0; i < 12; i++) R(3 + ri(0, 13), 5 + ri(0, 9), 1, 1, '#fff'); R(6, 1, 1, 2, '#999'); R(12, 1, 1, 2, '#999'); }
    else if (NPC_HEADS[who]) NPC_HEADS[who](9, 12, 1, {});
  } finally { g = main; }
  g.drawImage(pcv, x, y, 40, 40);
}

// ===== Objetos =====
function drawObj(kind, x, y, f = 1) {
  if (kind === 'tsuru') { R(x - 14, y - 9, 28, 6, '#e8e8e8'); R(x - 9, y - 14, 17, 6, '#e8e8e8'); R(x - 7, y - 13, 6, 4, '#7ab'); R(x + 1, y - 13, 6, 4, '#7ab'); circ(x - 8, y - 3, 3, '#222'); circ(x + 8, y - 3, 3, '#222'); R(x + 12, y - 8, 2, 2, '#ff0'); }
  else if (kind === 'carrito') { R(x - 12, y - 16, 24, 12, '#d22'); R(x - 12, y - 18, 24, 2, '#fff'); R(x - 8, y - 13, 16, 4, '#ffd84a'); circ(x - 7, y - 3, 3, '#222'); circ(x + 7, y - 3, 3, '#222'); R(x - 2, y - 24, 2, 6, '#888'); R(x - 10, y - 27, 20, 3, '#ffd84a'); }
  else if (kind === 'techo') { for (let i = 0; i < 6; i++) R(x - 14 + i, y - 12 + i * 2, 28 - i * 2, 2, i % 2 ? '#a04428' : '#c05a34'); }
  else if (kind === 'tinaco') { R(x - 7, y - 18, 14, 18, '#222'); R(x - 6, y - 17, 12, 1, '#444'); R(x - 6, y - 10, 12, 1, '#444'); R(x - 3, y - 20, 6, 2, '#333'); }
  else if (kind === 'silla') { R(x - 6, y - 8, 12, 2, '#fff'); R(x - 6, y - 18, 2, 10, '#fff'); R(x - 6, y - 6, 2, 6, '#fff'); R(x + 4, y - 6, 2, 6, '#fff'); }
  else if (kind === 'flamingo') { R(x - 8, y - 10, 14, 8, '#ff7bb0'); R(x + 4, y - 20, 3, 12, '#ff7bb0'); R(x + 4, y - 22, 6, 3, '#ff7bb0'); R(x + 9, y - 21, 3, 2, '#222'); }
  else if (kind === 'dogo') { R(x - 6, y - 4, 12, 4, '#e8b060'); R(x - 7, y - 3, 14, 2, '#c0503a'); R(x - 5, y - 4, 10, 1, '#ffd84a'); R(x - 3, y - 5, 1, 1, '#3c3'); R(x + 2, y - 5, 1, 1, '#3c3'); }
  else if (kind === 'chancla') { R(x - 4, y - 2, 8, 3, '#ff4fa0'); R(x - 1, y - 3, 2, 1, '#fff'); }
}
