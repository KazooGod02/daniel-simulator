'use strict';
// ================= HISTORIA, MAPAS, ESCENAS Y FINALES =================
function newG() {
  return { act: 1, clock: 0, loyalty: 0, karma: 0, bond: 0, rastros: {}, money: 30, dogos: 1, hp: 120, maxhp: 120, flags: {}, dead: {}, panchoUses: 0, panchoActUses: 0, censor: META.censor !== false, un: { chancla: false, escoba: false, mordida: false, super2: false, aullido: false } };
}
let META = { endings: {}, finished: false, censor: true };
try { META = { ...META, ...JSON.parse(localStorage.getItem('dsim_meta') || '{}') }; } catch (e) { }
function saveMeta() { try { localStorage.setItem('dsim_meta', JSON.stringify(META)); } catch (e) { } }
let G = newG();
function saveGame() { try { localStorage.setItem('dsim_save', JSON.stringify({ G, px: OW.px, py: OW.py })); } catch (e) { } }
function hasSave() { try { return !!localStorage.getItem('dsim_save'); } catch (e) { return false; } }
function loadSave() {
  try { const s = JSON.parse(localStorage.getItem('dsim_save')); G = { ...newG(), ...s.G }; G.censor = META.censor !== false; loadAct(G.act, { x: s.px, y: s.py }); return true; } catch (e) { return false; }
}

// ---- Mapas ----
const ACTS = {
  1: {
    name: 'SE ME VOLÓ EL PERRO', place: 'La Primavera', floor: '.', music: 'world', rain: 0.5, wind: 0.6, enc: ['tlac', 'flamingo', 'tlac', 'flamingo'],
    fight: { bg: 'prim', rainI: 0.5, wind: 0.3, windCycle: 480, windMax: 0.5, debris: 1 },
    map: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T######.....,.......T...OOOOOO.T',
      'T#####D..K......e.......OOOOOO.T',
      'T...P...................OOSOOO.T',
      'T.......====================...T',
      'T..d....=.....,.........d..=...T',
      'T.......=..######..1.......=.g.T',
      'T..T....=..#####D......e...=...T',
      'T.......=..........T.......=...T',
      'T====================......=...T',
      'T.....,.....d.....=........=...T',
      'T..######.........=..######=...T',
      'T..#####D.....e...=..#####D=...T',
      'T.................=........=.,.T',
      'T..n.....T........====C=====...T',
      'TfffffffffffffffffffXffffffffffT',
      'TTTTTTTTTTTTTTTTTTTTXTTTTTTTTTTT'],
    onLoad() {
      if (G.flags.seen1) return; G.flags.seen1 = 1;
      talk([['pan', '¡DANIEL! ¡Aquí afuera! ¡En la jaula! ¡El viento me aventó hasta el patio!'], ['narr', 'OBJETIVO: Encontrar a Nieve antes de que el ojo del huracán toque La Primavera. (Z para interactuar)']]);
    },
  },
  2: {
    name: 'RÍO ABAJO', place: 'Malecón y Río Tamazula', floor: '-', music: 'world', rain: 0.7, wind: 0.8, enc: ['tlac', 'llanta', 'tlac', 'llanta'], npcLook: 'vec2',
    fight: { bg: 'malecon', rainI: 0.7, wind: 0.4, windCycle: 420, windMax: 0.6, debris: 1 },
    map: [
      'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
      'w--P-----wwwwwwwwwwwwwwwwwwwwwww',
      'w--------wwwwwwwwwwrrerrrwwwwwww',
      'w--g-----wwwwwwwwwwrrr2rrwwwwwww',
      'w---n----oooowwwwwwrrrrrrwwwwwww',
      'w-T------wwwowwwwwwowwwowwwwwwww',
      'w-----L--wwwowwwwwwowwwowwwwwwww',
      'w------e-wwwowwwwwwowwwowwwwwwww',
      'wwwwwwwwwwwwoooeoooowwwowwwwwwww',
      'wwwwwwwwwwwwwwwwwwwwwwwoooowwwww',
      'wwwwwwwwwwwwwwwwwwwwwwwwwwowwwww',
      'wwwwwwwwwwwwwwwwwwwwwwww------ww',
      'wwwwwwwwwwwwwwwwwwwwwwww-l-S--ww',
      'wwwwwwwwwwwwwwwwwwwwwwww--e---ww',
      'wwwwwwwwwwwwwwwwwwwwwwww--B---ww',
      'wwwwwwwwwwwwwwwwwwwwwwww--X---ww',
      'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww'],
    pad: 'w', voidC: '#1f4a72',
    bossDraw(x, y) { drawTlac(x - 8, y, 1, 1, 0); drawTlac(x + 8, y, -1, 1, 1); drawTlac(x, y - 8, 1, 1, 0); R(x - 4, y - 22, 8, 3, '#ffd84a'); R(x - 4, y - 24, 2, 2, '#ffd84a'); R(x + 2, y - 24, 2, 2, '#ffd84a'); },
    onLoad() {
      if (G.flags.seen2) return; G.flags.seen2 = 1;
      talk([['narr', 'El Malecón está bajo el agua. El río Tamazula se salió a dar la vuelta.'], ['pan', 'Brinca por las llantas, Daniel. Y si ves al de la lancha, no le preguntes de dónde la sacó.']]);
    },
  },
  3: {
    name: 'CENTRO DE DESMADRE', place: 'Centro Histórico', floor: 'p', music: 'world', rain: 0.6, wind: 0.2, enc: ['paraguas', 'tinaco', 'paraguas'], animals: ['gato', 'iguana'],
    fight: { bg: 'centro', rainI: 0.6, wind: 0.6, windCycle: 360, windMax: 0.9, debris: 1 },
    map: [
      'TTTTTTTTTTTTTTTXXTTTTTTTTTTTTTTT',
      'T....QQQQQQQQQQppQQQQQQQQQQ....T',
      'T.a..QQQQQQQQQQppQQQQQQQQQQ..3.T',
      'T....ppppppppppppppppppppppp...T',
      'T....pppppppppppBpppppppppppp..T',
      'T....ppppppppppppppppppppppp...T',
      'Tkkkkvvvvkkkkkkvvvvkkkkkkkkk.kkT',
      'T.kk.vvvv.kk.q.vvvv.kk.k.....e.T',
      'T.kk.vvvv.kk...vvvv.kk.k......T',
      'T....vvvv..e...vvvv....4..k....T',
      'T=====vvvv=====vvvv============T',
      'T.....g......a.....kk...kk..S..T',
      'T..P........e...........n......T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'],
    bossDraw(x, y) { drawNPCOW(x - 10, y, OWC.banda); drawNPCOW(x, y - 2, { ...OWC.banda, top: '#3060c0', hat: '#222' }); drawNPCOW(x + 10, y, { ...OWC.banda, top: '#8030a0', hat: '#e8dcb0' }); if (tick % 30 < 15) txt('♪', x + 14, y - 34, '#ffd84a', 6, 'center', false); },
    onLoad() {
      if (G.flags.seen3) return; G.flags.seen3 = 1; G.un.super2 = true;
      talk([['narr', 'Centro de Culiacán. Llueve aguachile. Literal.'], ['pan', 'Aguas con las corrientes de viento, te empujan pa\'trás. Hay un hueco a la derecha, nomás digo.'], ['narr', '¡Desbloqueaste el súper TORMENTA RIZADA! (V+X, 2 barras de Desmadre)']]);
    },
  },
  4: {
    name: 'RAMÍREZ', place: 'La antena de la televisora', floor: 'H', music: 'world', rain: 0.8, wind: 0.9, enc: ['rayo', 'paraguas'], pad: ' ', voidC: '#0c0e1c', lightning: 1,
    fight: { bg: 'antena', rainI: 0.8, wind: 0.5, windCycle: 400, windMax: 0.7 },
    map: [
      '                    ',
      '    HHHHHHHHHHH     ',
      '    HHHHHBHHHHH     ',
      '    HHHHHHHHHHH     ',
      '         zz         ',
      '         HH         ',
      '  HHHHHHHHHzzzHHH   ',
      '  H5           HH   ',
      '  HH           zz   ',
      '  HH           HH   ',
      '  HHHHHzzHHHeHHHH   ',
      '        HH          ',
      '        zz          ',
      '   HHHHHHHHHHHHH    ',
      '   HeH     HHSHH    ',
      '   HHH     HHHHH    ',
      '   zzz     HH       ',
      '   HHHHHHHHHH       ',
      '          HH        ',
      '          HP        ',
      '                    '],
    bossDraw(x, y) { drawNPCOW(x, y, OWC.ram); R(x - 1, y - 60, 2, 30, '#888'); R(x - 8, y - 52, 16, 14, '#c8b040'); drawNieve(x, y - 40, 1, 0.5, 0); for (let i = 0; i < 4; i++) R(x - 8 + i * 5, y - 52, 1, 14, '#c8b040'); },
    onLoad() {
      if (G.flags.seen4) return; G.flags.seen4 = 1;
      talk([['narr', 'La antena del canal. Rayos cayendo cada dos segundos. Ramírez está hasta arriba.'], ['pan', 'Las rayas amarillas es donde caen los rayos. No te pares ahí, genio.']]);
    },
  },
  5: {
    name: 'EL OJO DE LA PRIMAVERA', place: 'La Primavera (dentro del ojo)', floor: '.', music: 'eye', rain: 0, calm: 1, enc: [], grass: ['#4a8a40', '#4e9044'],
    map: [
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
      'WWWWWWW..............WWWWWWW',
      'WWWW....................WWWW',
      'WW......######..........,.WW',
      'WW......#####D....6.......WW',
      'W..........................W',
      'W............B.............W',
      'W.....................g....W',
      'W...T..................T...W',
      'WW..........S.............WW',
      'WWW..........P...........WWW',
      'WWWWWW................WWWWWW',
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWW'],
    pad: 'W',
    bossDraw(x, y) { for (let i = 0; i < 8; i++) { const a = tick / 15 + i * 0.785; R(x + Math.cos(a) * 10, y - 6 + Math.sin(a) * 5, 2, 2, '#cde'); } sparkle(x, y - 10, '#9cf'); },
    onLoad() {
      if (G.flags.seen5) return; G.flags.seen5 = 1; G.un.aullido = true;
      talk([['narr', 'Daniel regresó a La Primavera. Todo estaba en silencio.'], ['narr', 'Cielo azul arriba. Paredes de tormenta alrededor. Estaba dentro del ojo del huracán.'],
        G.loyalty >= 2 ? ['pan', 'Vamos por él.'] : ['pan', 'Pues ya qué. Vamos.'],
        ['narr', 'El centro del ojo está frente a tu casa. Súper AULLIDO DE LA PRIMAVERA disponible (V+C, 3 barras).']]);
    },
  },
};

// ---- Interacciones ----
const LINES = {
  dogo: { 1: '¿Con todo, joven? Dogo sinaloense: $25. Tocino, mayonesa, jalapeño y fe.', 2: '¿Dogo? Lo preparo arriba de la lancha, pero sabe igual.', 3: 'Aquí sigo, joven. El huracán no me va a quitar la clientela.', 5: 'El ojo del huracán es buen lugar pa\' vender. Nadie se mueve.' },
  oxxo: { 1: 'Bienvenido a OXXO. Por la tormenta le guardo partida y le recargo la vida gratis.', 2: 'OXXO flotante, joven. Abrimos 24/7, aunque se acabe el mundo.', 3: 'Bienvenido. Se nos voló el techo, pero el Wi-Fi sigue.', 4: 'Máquina de OXXO. Hasta aquí arriba llegamos.', 5: 'El OXXO sigue abierto. Como siempre.' },
  npc: {
    1: [['vec', '¿Usted también se quedó dormido, joven? Yo estaba viendo a los Tomateros.'], ['vec', 'Ganaron, por cierto. Luego se voló el estadio.']],
    2: [['vec', 'Mi casa se fue río abajo. Si la ve, salúdemela de mi parte.'], ['vec', 'Es la azul. Con tinaco. Bueno, ya sin tinaco.']],
    3: [['vec', 'Joven, está lloviendo aguachile. Ya me eché tres tostadas.'], ['vec', 'Pica machín. Ah, y en la plaza hay una banda poseída. Tocan bien, eso sí.']],
  },
  rastro: {
    1: 'La correa de Nieve... rota. Huele a perro mojado.', 2: 'Un mechón de pelo de husky del tamaño de una oveja.', 3: 'La pelota mordida de Nieve. Todavía tiene baba.',
    4: 'Una huella de pata... en el techo de un puesto. ¿Cómo?', 5: 'El plato de Nieve, abollado. ¿Cómo llegó hasta aquí arriba?', 6: 'La cobija de Nieve. Todavía huele a él.',
  },
};
const STORY = {
  exitOpen() { const n = OW.n; return n === 1 ? G.flags.pancho && G.flags.boss1 : n === 2 ? G.flags.boss2 : n === 3 ? G.flags.boss3 : false; },
  interact(e) {
    const n = OW.n, ch = e.ch;
    if (ch === 'K') {
      if (G.flags.pancho) { Dlg.say('narr', 'La jaula de Pancho. Vacía. Pancho no piensa regresar ahí nunca.'); return; }
      ask('pan', '¡Daniel! ¡Sácame de esta jaula antes de que me lleve el viento!', ['Abrirla con cuidado', 'Romperla a madrazos'], i => {
        G.flags.pancho = 1;
        if (i === 0) { G.loyalty++; talk([['pan', 'Ay, qué caballero. Por eso te quiero, Daniel. Poquito, pero te quiero.']], joined); }
        else { G.loyalty--; G.flags.verga = 1; shake = 6; SFX.heavy(); talk([['pan', '¡¿QUÉ TE PASA?! ¡Casi me sacas un ojo, *verga*!'], ['pan', '...Oye. Qué bonita palabra. *Verga*. *Verga*. Me la voy a quedar.']], joined); }
      });
      function joined() { talk([['pan', 'Voy contigo. No por Nieve, eh. Por el chisme.'], ['narr', '¡PANCHO SE UNIÓ! En peleas, presiona S para que te ayude.']]); }
    }
    else if (ch === 'C') chayoFight(e);
    else if (ch === 'g') ask('dogo', LINES.dogo[n] || LINES.dogo[1], ['Comprar dogo ($25)', 'Nada'], i => {
      if (i) return;
      if (G.money < 25) { Dlg.say('dogo', 'No le alcanza, joven. Pártale la madre a unos tlacuaches y regresa.'); return; }
      G.money -= 25; G.dogos++; SFX.coin(); Dlg.say('dogo', '¡Con todo! Cómaselo desde el menú (ENTER).');
    });
    else if (ch === 'S') ask('oxxo', LINES.oxxo[n], ['Guardar y descansar', 'Nada'], i => {
      if (i) return; G.hp = G.maxhp; saveGame(); SFX.heal(); Dlg.say('oxxo', 'Listo. Partida guardada y vida llena. ¿Algo más, joven?');
    });
    else if (ch === 'n') talk(LINES.npc[n] || [['vec', '...']]);
    else if (ch === 'L') ask('lancha', '¿Lo llevo, joven? Esta lancha no sé de dónde la saqué, pero jala.', ['Súbete (ahorra tiempo)', 'Mejor a pie'], i => {
      if (i) return; const l = OW.ents.find(q => q.ch === 'l'); SFX.jump(); fade = 1;
      talk([['lancha', '¡Agárrese, joven!']], () => { OW.px = l.x; OW.py = l.y; fade = 0; owMsg('Llegaste en lancha (te saltaste el camino de llantas)'); });
    });
    else if (ch === 'q') ask('perro', '(Un perrito callejero atorado bajo un puesto. Te ve con ojitos.)', ['Ayudarlo (cuesta tiempo)', 'Ahorita no, perrito'], i => {
      if (i) { Dlg.say('pan', '...Frío. Bien frío, Daniel.'); return; }
      G.karma++; addClock(6); G.dead[e.key] = 1; OW.ents = OW.ents.filter(q => q !== e);
      talk([['dan', 'Ya estás, compa.'], ['perro', '¡Guau!'], ['pan', 'Ay, se me metió algo en el ojo. Es lluvia. Es lluvia, Daniel.'], ['narr', 'Karma Perruno +1 (Huracán +6%)']]);
    });
    else if (ch === 'a') {
      const cat = e.kind === 'gato';
      ask('narr', cat ? 'Un gato atorado en un bote de basura. Maúlla bien feo.' : 'Una iguana parada en medio de la calle, sin rumbo, como tú en la prepa.', [cat ? 'Sacarlo (cuesta tiempo)' : 'Moverla a un lugar seguro', 'Ahorita no'], i => {
        if (i) return; G.karma++; addClock(3); G.dead[e.key] = 1; OW.ents = OW.ents.filter(q => q !== e);
        talk([['narr', cat ? 'El gato te rasguñó, pero se fue feliz.' : 'La iguana te vio con desprecio, pero se fue.'], ['narr', 'Karma Perruno +1 (Huracán +3%)']]);
      });
    }
    else if (ch === 'B') this.touch(e);
  },
  touch(e) {
    const ch = e.ch, n = OW.n;
    if (/[1-6]/.test(ch)) {
      G.rastros[ch] = 1; G.bond++; SFX.pick(); OW.ents = OW.ents.filter(q => q !== e);
      const after = () => { if (G.bond === 3 && !G.un.mordida) { G.un.mordida = true; talk([['narr', '¡Aprendiste MORDIDA DE HUSKY! (↓V o ↓↓+C). Ridícula pero poderosa.']]); } };
      talk([['narr', `RASTRO DE NIEVE ${G.bond}/6: ${LINES.rastro[ch]}`], ['dan', pick(['...Ya voy, compa.', 'Aguanta, Nieve.', 'Ya casi.', 'Nieve...'])]], () => { if (ch === '2') flashback(after); else after(); });
    }
    else if (ch === 'e') encounter(e);
    else if (ch === 'X') {
      if (n === 1 && !G.flags.pancho) { Dlg.say('dan', 'Ni madres... primero voy por Pancho.'); return; }
      if (n === 1 && !G.flags.boss1) { const c = OW.ents.find(q => q.ch === 'C'); if (c) chayoFight(c); return; }
      if (!this.exitOpen()) { Dlg.say('pan', 'Todavía no, Daniel. Hay algo bloqueando el camino.'); return; }
      endAct(n);
    }
    else if (ch === 'B') ({ 2: reyFight, 3: bandaFight, 4: ramFight, 5: finalIntro })[n](e);
  },
};

// ---- Peleas ----
function blackScene() { return { update() { updParts(); }, draw() { R(0, 0, W, H, '#000'); } }; }
function loseFight(retry) {
  G.hp = G.maxhp; addClock(5); setScene(blackScene());
  talk([['pan', pick(['Te partieron la *madre*. Levántate, que Nieve no se va a rescatar sola.', 'Uy. Eso dolió hasta acá. Otra vez, pero ahora sí con ganas.', 'Tip: si tocas A justo cuando te van a pegar, haces PARRY. Nomás digo.'])], ['narr', '(Huracán +5%)']], retry);
}
const fcfg = o => ({ ...OW.A.fight, ...o });
function encounter(e) {
  const ens = e.kind === 'tlac' && OW.n === 2 && e.tx % 2 === 0 ? ['tlac', 'tlac'] : [e.kind];
  const go = () => startFight(fcfg({ enemies: ens, tutorial: !G.flags.tut, onWin() { G.flags.tut = 1; G.dead[e.key] = 1; OW.ents = OW.ents.filter(x => x !== e); backToWorld(); owMsg(`¡Ganaste! Ahora tienes $${G.money}`); }, onLose() { loseFight(go); } }));
  if (!G.flags.tut) talk([
    ['pan', '¡Un bicho mutante! Ok, escúchame bien porque no lo voy a repetir:'],
    ['pan', 'Z golpe ligero, X fuerte, C patada. V es tu especial. A para bloquear. Flecha arriba para brincar.'],
    ['pan', 'Si tocas A justo cuando te van a pegar, haces PARRY. Si me picas S, yo te ayudo.'],
    ['pan', 'Y ENTER si se te olvida todo. Que seguro sí.']], go);
  else go();
}
function chayoFight(e) {
  if (!G.flags.pancho) { Dlg.say('chayo', 'Ve por tu pajarraco primero, muchacho. Lo oigo gritar desde aquí.'); return; }
  const go = () => startFight(fcfg({ enemies: ['chayo'], music: 'boss', title: '¡DOÑA CHAYO!', subtitle: 'LA VECINA QUE NUNCA EVACÚA', onWin() {
    G.flags.boss1 = 1; G.un.chancla = G.un.escoba = true; G.dead[e.key] = 1; OW.ents = OW.ents.filter(x => x !== e); backToWorld();
    talk([['chayo', 'Ay... ay, mi cadera. Está bien, muchacho, ganaste.'], ['chayo', 'Toma mi chancla y mi escoba. Nomás me las devuelves lavadas.'],
      ['narr', '¡Aprendiste CHANCLA PRESTADA (←V) y ESCOBAZO (↘V)! El escobazo rompe guardias.'],
      ['chayo', 'Y otra cosa: vi un perro blanco volando hacia el centro. Con manchas grises. Iba aullando bien dramático.'], ['dan', 'Nieve.'], ['chayo', 'Ándale pues. Y no me pises las plantas al salir.']]);
  }, onLose() { loseFight(go); } }));
  talk([['chayo', '¡ALTO AHÍ, MUCHACHO!'], ['chayo', 'Tú fuiste el que pisó mis plantas en 2019. No creas que se me olvida.'], ['dan', '...Doña Chayo, se está cayendo el cielo.'], ['chayo', '¡El cielo se puede caer, pero mis petunias NO!'], ['pan', 'Uy, ya se puso intensa la señora.'], ['chayo', '¡¿QUÉ DIJISTE, PÁJARO?!']], go);
}
function reyFight(e) {
  const go = () => startFight(fcfg({ enemies: ['rey'], music: 'boss', title: '¡REY TLACUACHE!', subtitle: '400 TLACUACHES PEGADOS CON LODO', ex: 230, onWin() { G.flags.boss2 = 1; G.dead[e.key] = 1; OW.ents = OW.ents.filter(x => x !== e); ramTV(); }, onLose() { loseFight(go); } }));
  talk([['tlac', '¡KSSSSHH! ¡ESTE RÍO ES MÍO, MORRO!'], ['dan', '¿Los tlacuaches hablan?'], ['pan', 'Todos hablan en este juego, Daniel. Acéptalo.'], ['tlac', '¡Somos 400 y estamos pegados con lodo! ¡TIEMBLA!'], ['pan', 'Cuando se desarme, noquea a los chiquitos rápido.']], go);
}
function bandaFight(e) {
  const go = () => startFight(fcfg({ enemies: ['tambora', 'clarinete', 'trompeta', 'tuba'], music: 'banda', rhythm: 1, wind: 0, windCycle: 0, debris: 0, ex: 170, gap: 40, tick: bandTick, title: '¡LA BANDA POSEÍDA!', subtitle: 'PÉGALES AL RITMO = DOBLE DAÑO', onWin() { G.flags.boss3 = 1; G.dead[e.key] = 1; OW.ents = OW.ents.filter(x => x !== e); backToWorld(); talk([['banda', '♪ Y aquí se acaba... el corrido... del Daniel... ♪'], ['pan', 'Tocaban bien, la neta.'], ['narr', 'La salida al norte de la plaza está abierta. La antena de la televisora te espera.']]); }, onLose() { loseFight(go); } }));
  talk([['banda', '♪ ¡Y SE OYE, Y SE SIENTE, CHUYITA ESTÁ PRESENTE! ♪'], ['pan', 'Es una banda... poseída.'], ['banda', '♪ ¡Ningún huerco pasa la plaza sin oír nuestro corrido! ♪'], ['pan', 'Tip: pégales AL RITMO y haces doble daño. Y la tuba no se deja hasta el final.']], go);
}
function ramFight(e) {
  const go = () => startFight(fcfg({ enemies: ['ram'], music: 'boss', title: '¡RAMÍREZ!', subtitle: 'EL METEORÓLOGO QUE SE EQUIVOCÓ', onWin() { G.dead[e.key] = 1; G.flags.boss4 = 1; afterRam(); }, onLose() { loseFight(go); } }));
  talk([['ram', 'Llegaste, Daniel. Bienvenido a mi estudio del clima.'], ['nieve', '¡AUUUUUU!'], ['dan', '¡NIEVE!'], ['ram', 'El pelo de husky es el mejor conductor climático del universo. Con él, Chuyita es imparable.'], ['pan', 'Eso no tiene ningún sentido científico.'], ['ram', '¡LA CIENCIA SOY YO!']], go);
}
function finalIntro(e) {
  const lines = [['chuy', 'Llegaste, huerco.'], ['dan', 'Devuélveme a mi perro.'], ['chuy', '¿Este? Suelta pelo por todos lados. Igual que tú, por cierto.'], ['dan', '...'], ['chuy', '¡VEN Y QUÍTAMELO!']];
  if (G.karma >= 2) lines.push(['narr', 'Los animales que rescataste llegan a echarte porras. ¡Empiezas con 1 barra de Desmadre!']);
  if (G.bond >= 4) lines.push(['nieve', '(Se oye un aullido desde adentro del huracán.)']);
  talk(lines, finalFight);
}
function finalFight() {
  G.hp = G.maxhp;
  startFight({ enemies: ['chuy'], bg: 'ojo', music: 'boss', rainI: 0.2, arenaR: 238, wind: 0, title: '¡HURACÁN CHUYITA!', subtitle: 'AVIÉNTALE SUS PROPIAS COSAS (X)',
    onWin() { (G.clock < 70 && G.bond >= 4) ? endingA() : endingB(); },
    onLose() { G.loyalty >= 4 ? endingC() : endingD(); } });
  if (G.karma >= 2) F.p.meter = 100;
}
function endAct(n) {
  const go = () => actCard(n + 1);
  if (G.panchoActUses < 2 && G.flags.pancho) { G.loyalty--; G.panchoActUses = 0; talk([['pan', 'Oye... ni me pelaste en todo el acto. Nomás digo. (Usa S en las peleas)']], go); }
  else { G.panchoActUses = 0; go(); }
}

// ---- Escenas cinemáticas ----
function cutscene(pages, done) {
  let i = -1;
  const S = { t: 0, page: null, update(busy) { this.t++; updParts(); if (this.page && this.page.wait && !busy && this.t >= this.page.wait) next(); if (this.page && this.page.tick) this.page.tick(this.t); }, draw() { if (this.page && this.page.draw) this.page.draw(this.t); else R(0, 0, W, H, '#000'); } };
  function next() {
    i++; S.t = 0; if (i >= pages.length) { done && done(); return; }
    const p = pages[i]; S.page = p; if (p.music !== undefined) { if (p.music) music(p.music); else { song = null; songName = ''; } } if (p.on) p.on();
    if (p.lines) talk(p.lines, next, p.top ? { top: 1 } : {}); else if (!p.wait) next();
  }
  setScene(S); next();
}
function nightSky(t, c = '#0e1424') { R(0, 0, W, H, c); for (let i = 0; i < 6; i++) { const x = (i * 70 + t * 0.4) % 400 - 40; circ(x, 20 + (i % 3) * 14, 18, '#1a2236'); } }
function house(x, y, roof = true) { R(x, y, 90, 50, '#d8c8a8'); if (roof) R(x - 6, y - 12, 102, 12, '#b04a30'); R(x + 10, y + 12, 18, 14, '#4a6a8a'); R(x + 60, y + 18, 16, 32, '#6a4020'); }
function tv(x, y, w, h, inner) { R(x - 4, y - 4, w + 8, h + 8, '#222'); R(x, y, w, h, '#1a3a2a'); inner(); R(x + w / 2 - 10, y + h + 4, 20, 6, '#333'); for (let i = 0; i < h; i += 3) { g.globalAlpha = 0.12; R(x, y + i, w, 1, '#000'); g.globalAlpha = 1; } }
function yard(t, sky = '#7a8aa0') { R(0, 0, W, 100, sky); R(0, 100, W, 80, '#3d6b35'); R(0, 150, W, 30, '#4a4a52'); }
function bigDaniel(x, y, f, pose, o, s = 2) { g.save(); g.translate(x, y); g.scale(s, s); drawDaniel(0, 0, f, pose, o); g.restore(); }

function intro() {
  cutscene([
    { music: '', draw: t => { R(0, 0, W, H, '#05060a'); tv(70, 30, 180, 100, () => { R(70, 30, 180, 100, '#2a6a4a'); R(150, 60, 70, 50, '#3a8a3a'); txt('LLUVIAS LIGERAS', 160, 36, '#fff', 7, 'center'); drawRig(110, 128, 1, 'punch', RAMIREZ, { pointer: 1 }); circ(200, 74, 10 + Math.sin(t / 10), '#aab'); }); },
      lines: [['tv', 'Buenas noches, Culiacán. Aquí su meteorólogo de confianza: Ramírez.'], ['tv', 'El huracán Chuyita pasará LEJOS. Esperen lluvias ligeras. Nada de qué preocuparse.'], ['tv', 'Repito: LLUVIAS. LIGERAS. Duerman tranquilos, plebes.']] },
    { draw: t => {
      R(0, 0, W, H, '#141a2c'); R(0, 130, W, 50, '#2a2420'); R(40, 100, 120, 30, '#5a3a6a'); R(40, 96, 30, 10, '#ddd');
      g.save(); g.translate(120, 108); g.rotate(-1.5708); g.restore();
      drawDaniel(110, 104, -1, 'down', { blink: 1 }); R(84, 96, 8, 3, '#d22'); R(86, 93, 4, 2, '#222');
      drawNieve(220, 146, -1, 1, 2); txt('z', 230, 120 - (t % 60) / 3, '#9cf', 6); txt('Z', 96, 80 - (t % 60) / 3, '#fff', 7);
      R(270, 60, 30, 40, '#c8b040'); drawPancho(285, 92, -1, 1, false); for (let i = 0; i < 5; i++) R(270 + i * 7, 60, 1, 40, '#c8b040');
      R(200, 30, 50, 40, '#0a0f20'); if (t % 90 < 4) { R(200, 30, 50, 40, '#ccf'); } R(224, 30, 2, 40, '#555'); R(200, 49, 50, 2, '#555');
    }, lines: [['narr', 'Fraccionamiento La Primavera, Culiacán. 41 grados a la sombra. 11:58 PM.'], ['dan', 'zzz...'], ['pan', '¡DANIEL! ¡DANIEL! ¡Se está volando la *pinche* casa!'], ['narr', '(Daniel tiene los audífonos a todo volumen.)'], ['nieve', '¿Auu?']] },
    { on: () => { SFX.thunder(); flash('#fff', 10); shake = 8; }, draw: t => {
      nightSky(t, '#0a0e1a'); house(110, 90, false); const rx = 104 + t * 2, ry = 78 - t * 1.5; g.save(); g.translate(rx + 50, ry); g.rotate(t / 30); R(-51, -6, 102, 12, '#b04a30'); g.restore();
      R(0, 140, W, 40, '#2a3a2a'); rain(1, 1.5); if (t % 70 < 3) { flash('#ccf', 3); SFX.thunder(); }
      if (t > 40) { g.globalAlpha = Math.min(1, (t - 40) / 60) * 0.85; circ(260, 50, 40, '#5a6478'); circ(260, 50, 26, '#9aa4b8'); R(248, 42, 8, 6, '#fff'); R(264, 42, 8, 6, '#fff'); R(250, 44, 3, 3, '#d00'); R(266, 44, 3, 3, '#d00'); R(250, 58, 20, 6, '#222'); for (let i = 0; i < 4; i++) R(234 + i * 13, 22, 9, 5, '#ff8fc0'); g.globalAlpha = 1; }
    }, lines: [['narr', 'Esa noche, el huracán Chuyita decidió que siempre sí.'], ['chuy', '¡¿LLUVIAS LIGERAS?! ¡LLUVIAS LIGERAS TU *MADRE*, RAMÍREZ!'], ['narr', 'Se llevó techos, tinacos, trampolines, un flamingo inflable... y algo más.']] },
    { on: () => { shake = 0; }, music: 'sad', draw: t => {
      yard(t, '#5a6478'); house(20, 60, false); R(14, 54, 30, 8, '#7a6a5a'); R(80, 54, 40, 6, '#7a6a5a');
      drawDaniel(170, 150, -1, 'idle', { blink: t % 150 < 6, wave: Math.round(Math.sin(t / 8)) });
      limb(130, 150, 150, 148, 1, '#d22'); R(126, 148, 4, 3, '#d22'); rain(0.3, 0.6);
    }, lines: [['narr', 'A la mañana siguiente... bueno, seguía de noche. El huracán apenas iba llegando.'], ['dan', '...'], ['dan', '¿Nieve?'], ['narr', 'Solo quedaba la correa. Y pelo de husky. Mucho pelo de husky.'], ['dan', 'Se me voló el perro, compa.']] },
  ], () => actCard(1));
}
function flashback(done) {
  cutscene([
    { music: 'sad', draw: t => {
      R(0, 0, W, H, '#4a3a2a'); R(0, 120, W, 60, '#6a5a40'); R(40, 30, 240, 60, '#c8a060'); R(60, 40, 80, 30, '#e8c880'); txt('LEY', 100, 46, '#c02020', 12, 'center', false); R(180, 50, 40, 40, '#5a4a3a');
      R(150, 132, 30, 18, '#a07a4a'); R(150, 130, 30, 3, '#8a6a3a'); g.save(); g.translate(166, 136); g.scale(0.5, 0.5); drawNieve(0, 0, 1, 1, 0); g.restore();
      bigDaniel(120, 150, 1, t > 200 ? 'hold' : 'idle', { blink: t % 120 < 6 }, 1);
      g.globalAlpha = 0.25; R(0, 0, W, H, '#c8a060'); g.globalAlpha = 1; for (let i = 0; i < 30; i++) R((i * 47 + t) % W, (i * 23) % H, 1, 1, '#fff8e0');
    }, lines: [['narr', 'Hace tres años.'], ['narr', 'Una caja de cartón afuera del Ley. Adentro, un cachorro de husky temblando.'], ['dan', '...¿Y tú qué, compa?'], ['nieve', '(aullido chiquito)'],
      ['narr', 'Nadie lo quería porque "suelta mucho pelo". Daniel se lo llevó a su casa ese mismo día.'], ['narr', 'Le puso Nieve. Porque era blanco. Daniel no es bueno para los nombres.'], ['narr', 'Desde ese día, no existe una sola prenda de Daniel sin pelo de husky.']] },
  ], () => { backToWorld(); done && done(); });
}
function ramTV() {
  cutscene([
    { music: 'boss', draw: t => { R(0, 0, W, H, '#0e1420'); rain(0.6, 0.8); tv(50, 16, 220, 120, () => { R(50, 16, 220, 120, '#1a8a3a'); R(80, 40, 160, 80, '#2a6a8a'); circ(200, 70, 20 + Math.sin(t / 8) * 2, '#9aa4b8'); drawRig(110, 132, 1, 'win', RAMIREZ, { wii: 1 }); if (t % 40 < 20) txt('EN VIVO', 230, 20, '#f22', 6, 'center'); }); },
      lines: [['tv', '¡ATENCIÓN, CULIACÁN!'], ['ram', 'Soy yo. Ramírez. El meteorólogo.'], ['ram', 'Dicen que me equivoqué. Que "lluvias ligeras" fue el peor pronóstico de la historia.'], ['ram', 'Yo no me equivoqué. El CLIMA se equivocó. Y ahora lo voy a CORREGIR.'],
        ['ram', 'Con este control de Wii conectado a un satélite, ¡yo alimento a Chuyita!'], ['pan', '¿Un control de Wii? ¿En serio?'], ['ram', '¡CON EL NUNCHUCK Y TODO!'], ['dan', '...'], ['dan', 'Le voy a ir a dar en su *madre*.'],
        ['narr', 'La salida al sur del Malecón ya está libre.']] },
  ], backToWorld);
}
function afterRam() {
  cutscene([
    { music: '', draw: t => { drawFightBG('antena', F || {}); drawRig(200, GY, -1, 'hurt', RAMIREZ, {}); drawDaniel(110, GY, 1, 'idle', {}); R(150, 30, 30, 30, '#c8b040'); for (let i = 0; i < 6; i++) R(150 + i * 6, 30, 1, 30, '#c8b040'); drawNieve(165, 58, 1, 1, (t >> 4) % 2); limb(165, 0, 165, 30, 1, '#888'); },
      lines: [['ram', 'No... no puede ser... me ganó un morro con piercings...'], ['ram', 'Perdón, Culiacán. Sí me equivoqué. Eran lluvias FUERTES.']] },
    { on: () => { SFX.thunder(); shake = 10; flash('#fff', 10); }, music: 'boss', draw: t => {
      drawFightBG('antena', F || {}); const s = Math.min(1, t / 60); circ(240, 60, 20 + s * 50, '#5a6478'); circ(240, 60, 14 + s * 30, '#9aa4b8');
      R(220, 48, 12, 8, '#fff'); R(248, 48, 12, 8, '#fff'); R(223, 50, 4, 4, '#d00'); R(251, 50, 4, 4, '#d00'); R(225, 70, 30, 10, '#222');
      const nx = t < 120 ? 165 : 165 + (t - 120) * 1.2, ny = t < 120 ? 58 : 58 - (t - 120) * 0.3; if (t < 200) { R(nx - 15, ny - 28, 30, 30, '#c8b040'); drawNieve(nx, ny, 1, 1, 0); }
      drawDaniel(110, GY, 1, t > 120 ? 'win' : 'idle', {}); drawRig(200, GY, -1, 'down', RAMIREZ, {});
    }, lines: [['chuy', 'JAJAJAJA. ¿Creíste que tú me controlabas, Ramírez?'], ['chuy', 'Yo ya no necesito a nadie. Y este perrito... me lo quedo. Suelta un pelo bien chilo.'], ['dan', '¡NIEVE!'], ['nieve', '¡AUUUUUUU!'], ['chuy', 'Nos vemos en La Primavera, plebe. Ahí voy a tocar tierra.'], ['pan', 'Daniel... el ojo del huracán va directo a tu casa.']] },
  ], () => endAct(4));
}
function actCard(n) {
  const A = ACTS[n]; music(''); song = null; songName = '';
  let t = 0;
  setScene({ update(busy) { t++; if (t > 170 || (t > 30 && OK())) loadAct(n); }, draw() {
    R(0, 0, W, H, '#000'); txt('ACTO ' + n, W / 2, 60, '#ffd84a', 16, 'center'); txt(A.name, W / 2, 88, '#fff', 9, 'center'); txt(A.place, W / 2, 106, '#9cf', 6, 'center');
    if (n === 1) txt('Cuidado: este juego tiene groserías, humor negro y un huracán con cara.', W / 2, 150, '#888', 5, 'center');
  } });
}

// ---- FINALES ----
function endingA() {
  cutscene([
    { music: '', on: () => { SFX.boom(); flash('#fff', 20); }, draw: t => { drawFightBG('ojo', {}); for (let i = 0; i < 4; i++) part(276 + rnd(-30, 30), rnd(40, 140), rnd(-3, 3), rnd(-3, 3), 30, '#9aa4b8', 3, 0); drawParts(); drawDaniel(200, GY, 1, 'hold', {}); drawNieve(214, GY - 26, 1, 1, 0); },
      lines: [['narr', 'Daniel se metió al centro del huracán y jaló la jaula con todas sus fuerzas.'], ['chuy', '¡NOOO! ¡MI PELITO CONDUCTOR!'], ['narr', 'El huracán Chuyita se deshizo en una lluvia normal de verano.']] },
    { music: 'happy', draw: t => {
      R(0, 0, W, 100, '#f0a060'); R(0, 0, W, 40, '#6aa0e0'); circ(260, 90, 20, '#ffe080'); R(0, 100, W, 80, '#3d6b35'); house(20, 60, false); rain(0.15, 0);
      drawPancho(150 + Math.sin(t / 20) * 30, 60 + Math.sin(t / 13) * 10, 1, 2);
      bigDaniel(140, 170, 1, 'hold', { smile: t > 180 && t < 260, blink: t % 140 < 6 }, 2);
      g.save(); g.translate(164, 120); g.scale(2, 2); drawNieve(0, 0, -1, 1, 0); g.restore();
      if (t > 180 && t < 260) { txt('(sonrisa: 1 frame)', 220, 40, '#fff', 5, 'center'); }
    }, lines: [['nieve', '¡AUUU!'], ['narr', 'Nieve le lamió toda la cara. Y Daniel, por primera vez en todo el juego...'], ['narr', '...sonrió.'], ['pan', '¡QUÉ *VERGA*, SÍ PUDO!']] },
    { draw: t => { yard(t, '#6aa0e0'); drawObj('carrito', 120, 150); drawRig(146, 150, -1, 'idle', RAMIREZ, {}); drawDaniel(80, 150, 1, 'idle', {}); },
      lines: [['narr', 'Una semana después.'], ['ram', '¿Con todo, joven? Pronóstico de hoy: soleado. Creo.'], ['chayo', '¡DANIEL! ¡ME VOLVISTE A PISAR LAS PLANTAS!']] },
  ], () => credits('A', 'YA ESTÁS, NIEVE'));
}
function endingB() {
  cutscene([
    { music: '', draw: t => { drawFightBG('ojo', {}); rain(0.6, 0.2); drawDaniel(160, GY, 1, 'idle', {}); },
      lines: [['narr', 'Chuyita cayó. Pero Daniel había tardado demasiado.']] },
    { draw: t => { R(0, 0, W, H, '#2a3040'); R(0, 120, W, 60, '#3a3a30'); rain(0.8, 0.2, 'rgba(150,170,200,0.4)'); R(170, 136, 30, 4, '#5a4a3a'); drawDaniel(120, 158, 1, 'sit', { blink: 1 }); drawNieve(160, 160, 1, 1, 2); },
      wait: 0, lines: [['narr', 'La jaula estaba abierta en el lodo. Nieve estaba ahí. Quieto. Empapado.'], ['dan', '...'], ['dan', 'Ya estás, compa. Ya estás.'], ['narr', 'Pancho no dijo nada. Por primera vez en todo el juego.']] },
    { music: 'sad', tick: t => { if (t % 4 === 0) part(140 + rnd(-6, 6), 120, rnd(1, 3), rnd(-1.5, -0.5), 140, '#f4f6f8', 2, -0.005); }, draw: t => { yard(t, '#8ab0e0'); house(20, 60, true); drawDaniel(140, 150, 1, 'idle', { blink: t % 160 < 6 }); limb(150, 128, 158, 140, 1, '#d22'); drawPancho(116, 100, 1, 1, false); drawParts(); },
      lines: [['narr', 'Días después.'], ['narr', 'Un mechón de pelo blanco salió volando con el viento.'], ['narr', 'Y otro. Y otro. Y otro más.'], ['dan', '...Hasta muerto sigues soltando pelo, *cabrón*.'], ['narr', 'Daniel se rió llorando.'], ['narr', 'Los huskies nunca se van del todo. Su pelo se queda en tu ropa para siempre.']] },
  ], () => credits('B', 'PERRO QUE SE VA'));
}
function endingC() {
  cutscene([
    { music: '', draw: t => { drawFightBG('ojo', {}); ENEMIES.chuy.draw({ x: 276, ai: { ph: 2, at: 0, inhale: 1 } }, {}); drawDaniel(150, GY, 1, 'down', {}); drawPancho(140, 120, 1, 1); },
      lines: [['narr', 'Daniel cayó. Chuyita abrió la boca para tragárselos a los dos.'], ['chuy', '¡SE ACABÓ, HUERCO!'], ['pan', '...'], ['pan', 'Oye, Chuyita.']] },
    { on: () => tone(1000, 8, 'sine', 0.3), wait: 480, tick: () => { shake = 6; }, draw: t => { R(0, 0, W, H, t % 10 < 5 ? '#200' : '#000'); txt(G.censor ? '#@$%&!#@$%&!#@$%&!' : '*PIIIIIIIIIIIIIIIP*', W / 2, 70, '#ff4', 12, 'center'); drawPancho(160, 130, 1, 3); txt(Math.ceil((480 - t) / 60) + 's', W / 2, 150, '#888', 6, 'center'); } },
    { draw: t => { drawFightBG('ojo', {}); ENEMIES.chuy.draw({ x: 276 + t * 0.5, ai: { ph: 1, at: 99 } }, {}); drawPancho(140, 110, 1, 2); },
      lines: [['narr', '(Pancho dijo la grosería más fuerte jamás pronunciada en Sinaloa.)'], ['chuy', 'Ay... qué grosero.'], ['chuy', 'Yo me voy a Arizona. Allá la gente es educada.']] },
    { music: 'happy', draw: t => { R(0, 0, W, H, '#6aa0e0'); for (let i = 0; i < 5; i++) circ((i * 80 - t) % 400, 40 + i * 20, 14, '#fff'); const y = 70 + Math.sin(t / 15) * 6; drawPancho(160, y + 40, 1, 7); drawDaniel(140, y + 80, 1, 'jump', {}); drawNieve(186, y + 80, 1, 1, 1); },
      lines: [['narr', 'Pancho se infló 40 veces su tamaño (física imposible) y cargó a los dos.']] },
    { draw: t => { yard(t, '#6aa0e0'); R(40, 60, 240, 90, '#d81e28'); R(40, 76, 240, 8, '#f4c020'); txt('OXXO', 160, 64, '#fff', 10, 'center', false); R(130, 100, 60, 50, '#9cd8f0'); drawDaniel(110, 160, 1, 'idle', {}); drawNieve(150, 160, 1, 1, 0); drawPancho(200, 140, -1, 2, false); },
      lines: [['oxxo', '¿Algo más, joven?']] },
    { draw: t => { R(0, 0, W, H, '#05060a'); tv(70, 30, 180, 100, () => { R(70, 30, 180, 100, '#2a6a4a'); txt('EL CLIMA CON PANCHO', 160, 36, '#fff', 6, 'center'); drawPancho(160, 110, 1, 4); }); },
      lines: [['tv', 'Y ahora, el clima con Pancho.'], ['pan', 'Mañana: soleado. Si llueve, me vale *madre*. Buenas noches.']] },
  ], () => credits('C', 'PANCHO EX MACHINA'));
}
function endingD() {
  const earth = (t, s) => { R(0, 0, W, H, '#020208'); for (let i = 0; i < 60; i++) R((i * 97) % W, (i * 53) % H, 1, 1, '#fff'); circ(160, 90, 50, '#2a5ab0'); R(130, 70, 30, 20, '#3a8a3a'); R(170, 100, 20, 14, '#3a8a3a'); if (s) { g.globalAlpha = Math.min(0.95, s); circ(160, 90, 52, '#7a8498'); g.globalAlpha = 1; R(140, 76, 10, 8, '#fff'); R(170, 76, 10, 8, '#fff'); R(143, 79, 4, 4, '#d00'); R(173, 79, 4, 4, '#d00'); R(145, 100, 30, 8, '#222'); } };
  cutscene([
    { music: 'boss', draw: t => { drawFightBG('ojo', {}); ENEMIES.chuy.draw({ x: 276, ai: { ph: 3, at: 99 } }, {}); drawDaniel(150, GY, 1, 'down', {}); },
      lines: [['narr', 'Daniel cayó. Chuyita absorbió a Nieve.'], ['chuy', '¡¿QUÉ ES ESTE PODER?! ¡ESTE PELO DE HUSKY ES...!']] },
    { draw: t => { R(0, 0, W, H, '#1a2a1a'); for (let i = 0; i < 20; i++) R((i * 37) % W, (i * 61) % H, 10, 6, '#3a3a40'); circ(160, 90, Math.min(200, 10 + t), '#5a6478'); circ(160, 90, Math.min(140, 6 + t * 0.7), '#7a8498'); },
      lines: [['narr', 'El huracán creció. Se tragó Culiacán.'], ['narr', 'Se tragó Sinaloa.'], ['narr', 'Se tragó México.']] },
    { draw: t => earth(t, Math.min(1, t / 80)), lines: [['chuy', '¡SOY... INFINITAAAAAA!']] },
    { on: () => { SFX.boom(); setTimeout(SFX.boom, 400); shake = 14; flash('#fff', 30); for (let i = 0; i < 160; i++) part(160, 90, rnd(-5, 5), rnd(-5, 5), ri(40, 140), pick(['#2a5ab0', '#3a8a3a', '#f80', '#ff4', '#fff', '#7a8498']), ri(1, 3), 0); }, wait: 170,
      draw: t => { R(0, 0, W, H, '#020208'); for (let i = 0; i < 60; i++) R((i * 97) % W, (i * 53) % H, 1, 1, '#fff'); drawParts(); if (t < 30) circ(160, 90, 50 + t * 3, '#fff'); if (t > 40) txt('BOOOOOOOOM', W / 2, 30, '#f80', 14, 'center'); } },
    { music: 'sad', draw: t => {
      R(0, 0, W, H, '#020208'); for (let i = 0; i < 60; i++) R((i * 97) % W, (i * 53) % H, 1, 1, '#fff'); for (let i = 0; i < 20; i++) R((i * 43 + t * 0.2) % W, (i * 71) % H, 2, 2, pick(['#2a5ab0', '#3a8a3a']));
      const fl = (x, y, a, fn) => { g.save(); g.translate(x, y + Math.sin(t / 30 + x) * 4); g.rotate(a + t / 300); fn(); g.restore(); };
      fl(80, 90, 0.2, () => drawDaniel(0, 20, 1, 'idle', {})); fl(140, 70, -0.3, () => drawNieve(0, 8, 1, 1, 0)); fl(190, 100, 0.1, () => drawPancho(0, 0, 1, 1)); fl(250, 60, 0.4, () => drawObj('carrito', 0, 10));
      fl(270, 130, -0.2, () => { R(-20, -14, 40, 28, '#d81e28'); R(-20, -8, 40, 4, '#f4c020'); R(-6, 0, 12, 14, '#9cd8f0'); });
    }, lines: [['dan', '...'], ['pan', 'Ni modo.'], ['oxxo', '¿Algo más, joven?']] },
  ], () => {
    META.endings.D = 1; META.finished = true; saveMeta();
    setScene({ update() { }, draw() { R(0, 0, W, H, '#000'); txt('GAME OVER', W / 2, 50, '#f44', 18, 'center'); txt('(DEL PLANETA)', W / 2, 76, '#f88', 8, 'center'); txt('FINAL D: CULIACÁN SUPERNOVA', W / 2, 96, '#ffd84a', 6, 'center'); } });
    ask('narr', '¿Volver a intentarlo? El planeta te lo agradecería.', ['Reintentar pelea final', 'Ver créditos'], i => i ? credits('D', 'CULIACÁN SUPERNOVA') : finalFight());
  });
}

// ---- Créditos ----
function credits(letter, title) {
  META.endings[letter] = 1; META.finished = true; saveMeta();
  const found = Object.keys(META.endings).length;
  const L = ['DANIEL SIMULATOR', 'EL OJO DE LA PRIMAVERA', '', `FINAL ${letter}: ${title}`, '', 'UNA PRODUCCIÓN DE', 'KAZOO STUDIOS', '', 'PROTAGONISTA', 'DANIEL', '', 'PERRO', 'NIEVE, el husky más dramático de Sinaloa', '', 'LORO', 'PANCHO (malhablado)', '', 'VILLANA', 'HURACÁN CHUYITA', '', 'METEORÓLOGO', 'RAMÍREZ (sí se equivocó)', '', 'AGRADECIMIENTOS ESPECIALES', 'EL OXXO, QUE NUNCA CIERRA', 'EL DEL CARRITO DE DOGOS', 'LAS PLANTAS DE DOÑA CHAYO', '', `FINALES ENCONTRADOS: ${found}/4`, Object.keys(META.endings).sort().join(' · '), '', '¡MODO SIN CENSURA DESBLOQUEADO EN EL TÍTULO!', '', 'Hecho con calor de Culiacán', '(literal, no hay clima)'];
  let y = H + 10; music('happy');
  setScene({ update(busy) { y -= 0.45; if (y < -L.length * 14 - 20 || (OK() && y < H - 40)) setScene(TitleScene); }, draw() {
    R(0, 0, W, H, '#000'); for (let i = 0; i < 30; i++) R((i * 97) % W, (i * 53 + tick * 0.2) % H, 1, 1, '#555');
    L.forEach((l, i) => { const yy = y + i * 14; if (yy > -10 && yy < H) txt(l, W / 2, yy, i < 2 || /KAZOO|FINAL /.test(l) ? '#ffd84a' : '#fff', i < 2 ? 9 : 6, 'center'); });
  } });
}

// ---- Título ----
const TitleScene = {
  sel: 0,
  enter() { music('title'); this.sel = 0; },
  opts() { const o = ['NUEVO JUEGO']; if (hasSave()) o.push('CONTINUAR'); if (META.finished) o.push('CENSURA: ' + (META.censor !== false ? 'SÍ' : 'NO')); o.push('CÓMO SE JUEGA'); return o; },
  update(busy) {
    if (busy) return;
    const o = this.opts();
    if (pressed['arrowup']) { this.sel = (this.sel + o.length - 1) % o.length; SFX.sel(); }
    if (pressed['arrowdown']) { this.sel = (this.sel + 1) % o.length; SFX.sel(); }
    if (OK()) {
      const s = o[this.sel]; SFX.sel();
      if (s === 'NUEVO JUEGO') { G = newG(); intro(); }
      else if (s === 'CONTINUAR') loadSave();
      else if (s.startsWith('CENSURA')) { META.censor = META.censor === false; saveMeta(); }
      else talk([['narr', 'Explora con las flechas y habla con Z. Encuentra los 6 rastros de Nieve: te hacen más fuerte y cambian el final.'], ['narr', 'Pelea con Z/X/C, especiales con V + dirección, súpers con V+Z, V+X, V+C. Bloquea con A. S llama a Pancho.'], ['narr', 'El reloj del huracán sube con el tiempo. Trata bien a Pancho. Hay 4 finales.']]);
    }
  },
  draw() {
    const t = tick;
    R(0, 0, W, H, '#0e1424'); for (let i = 0; i < 6; i++) { const x = (i * 70 + t * 0.6) % 400 - 40; circ(x, 26 + (i % 3) * 16, 20, '#1a2236'); }
    if (t % 300 < 4) { R(0, 0, W, H, '#ccf'); }
    R(0, 150, W, 30, '#2a3a2a');
    bigDaniel(250, 150, -1, (t >> 5) % 2 ? 'idle' : 'idle2', { wave: Math.round(Math.sin(t / 6) * 2), blink: t % 160 < 6 }, 2);
    drawNieve(52, 150, 1, 2, (t >> 4) % 2); drawPancho(222, 92 + Math.sin(t / 12) * 4, -1, 2);
    rain(0.6, 1);
    txt('KAZOO STUDIOS PRESENTA', W / 2, 8, '#aaa', 5, 'center');
    txt('DANIEL', W / 2, 22, '#ffd84a', 20, 'center'); txt('SIMULATOR', W / 2, 46, '#ffd84a', 14, 'center');
    txt('EL OJO DE LA PRIMAVERA', W / 2, 66, '#9cf', 7, 'center');
    R(286, 6, 28, 14, '#c00'); txt('+18', 300, 9, '#fff', 6, 'center');
    const o = this.opts(); o.forEach((s, i) => txt((i === this.sel ? '> ' : '  ') + s, 112, 90 + i * 12, i === this.sel ? '#ffd84a' : '#fff', 7));
    txt('FINALES: ' + ['A', 'B', 'C', 'D'].map(l => META.endings[l] ? l : '?').join(' '), W / 2, 168, '#888', 5, 'center');
  },
};
