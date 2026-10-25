// Colao' por dentro y por fuera, ilustrado en capas con profundidad.
// Desde la Calle Main Este se ve el árbol grande y la verja; el salón queda detrás de la verja,
// tapado por las plantas y el árbol. La cámara camina hacia la entrada, la cruza y queda de
// frente al foodtruck: el salón a la izquierda y la pizarra a la derecha.
// Capas (más lejos → más cerca): cielo, fondo (D=3), adentro (D=1.6), calle (D=1).
(() => {
  const svg = document.getElementById('place');
  const stage = document.getElementById('placeFig');
  if (!svg || !stage || !window.gsap) return;

  const NS = 'http://www.w3.org/2000/svg';
  const INK = '#2A1FB8', DEEP = '#1A1373', CREAM = '#F2F6D8', SKY = '#A9D9F6';
  const G1 = '#2E6B45', G2 = '#3F8A57', G3 = '#5FA866', G4 = '#7CC46E';
  const WOOD = '#7A4A2B', WOOD2 = '#9C6238', WOOD3 = '#6B3F24';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let seed = 11;
  const r = (a, b) => { seed = (seed * 16807) % 2147483647; return a + (seed / 2147483647) * (b - a); };

  let P = svg; // current layer being drawn
  function el(tag, attrs = {}, parent = P) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    parent.appendChild(n);
    return n;
  }
  const g = (parent = P, attrs = {}) => el('g', attrs, parent);
  const line = { stroke: INK, 'stroke-width': 4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
  const ambient = [];
  const loop = (t) => { ambient.push(t); return t; };
  const sway = (node, deg, origin, dur) =>
    loop(gsap.to(node, { rotation: deg, transformOrigin: origin, duration: dur, repeat: -1, yoyo: true, ease: 'sine.inOut' }));

  const defs = el('defs', {}, svg);
  const clipRect = (id, attrs) => { const c = el('clipPath', { id }, defs); el('rect', attrs, c); };

  // ======================= SKY (doesn't move) =======================
  const skyL = g(svg);
  P = skyL;
  el('rect', { x: -5000, y: -5000, width: 10000, height: 10000, fill: SKY });
  const sun = g();
  el('circle', { cx: 0, cy: 0, r: 64, fill: '#FFF3B8' }, sun);
  el('circle', { cx: 0, cy: 0, r: 100, fill: '#FFF3B8', opacity: 0.35 }, sun);
  const clouds = [];
  for (let i = 0; i < 6; i++) {
    const c = g();
    [[0, 0, 70, 26], [50, -18, 50, 30], [100, 0, 60, 24]].forEach(([cx, cy, rx, ry]) =>
      el('ellipse', { cx, cy, rx, ry, fill: '#FFFFFF', opacity: 0.92 }, c));
    clouds.push({ node: c, fx: r(0.02, 0.98), fy: r(0.04, 0.3), s: r(0.7, 1.2) });
  }

  // ======================= FAR (D = 3): neighbours, palms, pink wall =======================
  const farL = g(svg);
  P = farL;
  function palm(x, baseY, h, lean = 1) {
    const p = g();
    const topX = x + 40 * lean, topY = baseY - h;
    el('path', { d: `M${x} ${baseY} Q${x + 10 * lean} ${baseY - h / 2} ${topX} ${topY}`, fill: 'none', stroke: '#8A6A4A', 'stroke-width': 16, 'stroke-linecap': 'round' }, p);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.3;
      const ex = topX + Math.cos(a) * 110, ey = topY + Math.sin(a) * 50 + 30;
      el('path', { d: `M${topX} ${topY} Q${(topX + ex) / 2} ${topY - 40} ${ex} ${ey}`, fill: 'none', stroke: i % 2 ? G2 : G3, 'stroke-width': 18, 'stroke-linecap': 'round' }, p);
    }
    return p;
  }
  [[-700, 300, 230, '#F4C7D6'], [-380, 260, 200, '#F7E6A6'], [-90, 320, 250, '#CFE8DA'], [260, 280, 210, '#FFFFFF'], [2080, 300, 240, '#F7D2B4'], [2420, 280, 200, '#CFE8DA']]
    .forEach(([x, w, h, fill]) => {
      el('rect', { x, y: 720 - h, width: w, height: h, fill, stroke: INK, 'stroke-width': 3 });
      el('rect', { x: x - 8, y: 706 - h, width: w + 16, height: 16, fill: '#E9E4D6', stroke: INK, 'stroke-width': 3 });
      for (let wx = x + 30; wx < x + w - 50; wx += 90) el('rect', { x: wx, y: 760 - h, width: 46, height: 52, fill: '#CFEAFB', stroke: INK, 'stroke-width': 3 });
    });
  el('rect', { x: 1150, y: 360, width: 900, height: 400, fill: '#F6B3CE', stroke: INK, 'stroke-width': 3 });
  el('rect', { x: 1140, y: 348, width: 920, height: 16, fill: '#FBD3E2', stroke: INK, 'stroke-width': 3 });
  palm(-200, 740, 470, 1); palm(820, 740, 560, -1); palm(1700, 740, 600, 1); palm(2250, 740, 500, -1);

  // ======================= INSIDE (D = 1.6): salón | foodtruck | pizarra =======================
  const inL = g(svg);
  P = inL;
  // floor: wooden deck under the salón, plain cement where the truck is parked
  el('rect', { x: -900, y: 745, width: 2020, height: 1400, fill: WOOD2 });
  for (let y = 772; y < 2100; y += 28) el('line', { x1: -900, y1: y, x2: 1120, y2: y, stroke: '#7E4B2A', 'stroke-width': 3 });
  el('rect', { x: 1120, y: 745, width: 1900, height: 1400, fill: '#CFCBC2', stroke: INK, 'stroke-width': 3 });
  for (let x = 1120; x < 3000; x += 160) el('line', { x1: x, y1: 745, x2: x - 60, y2: 2100, stroke: '#B5B0A5', 'stroke-width': 3 });
  for (let y = 840; y < 2100; y += 120) el('line', { x1: 1120, y1: y, x2: 3000, y2: y, stroke: '#B5B0A5', 'stroke-width': 3 });
  el('line', { x1: -900, y1: 745, x2: 3000, y2: 745, stroke: INK, 'stroke-width': 4 });

  // back of the salón (left of the truck): a wooden slat wall
  el('rect', { x: 120, y: 440, width: 1000, height: 305, fill: '#5E3A22', stroke: INK, 'stroke-width': 3 });
  for (let x = 128; x < 1110; x += 30) el('rect', { x, y: 448, width: 24, height: 297, fill: x % 60 < 30 ? '#8E5631' : '#9C6238' });
  el('rect', { x: 110, y: 430, width: 1020, height: 16, fill: WOOD3, stroke: INK, 'stroke-width': 3 });

  // potted monsteras
  function monstera(x, baseY, s = 1) {
    const m = g();
    const leaves = [[-50, -150, -30], [40, -170, 25], [-10, -210, -5], [70, -110, 50], [-80, -100, -55]];
    leaves.forEach(([dx, dy]) => el('line', { x1: x, y1: baseY - 50 * s, x2: x + dx * s, y2: baseY + dy * s + 40 * s, stroke: '#3F7A45', 'stroke-width': 5 }, m));
    leaves.forEach(([dx, dy, rot]) => {
      const leaf = g(m, { transform: `translate(${x + dx * s} ${baseY + dy * s}) rotate(${rot}) scale(${s})` });
      el('path', { d: 'M0 50C-46 40-62-6-38-36-20-58 12-56 24-40 52-20 50 30 0 50Z', fill: G1, stroke: INK, 'stroke-width': 3 }, leaf);
      el('path', { d: 'M0 46C0 10 0-20 4-42M-30-10L-6 0M-28 18L-4 22M30-8L6 2M28 18L4 24', fill: 'none', stroke: SKY, 'stroke-width': 3, 'stroke-linecap': 'round' }, leaf);
    });
    el('path', { d: `M${x - 46 * s} ${baseY - 60 * s} H${x + 46 * s} L${x + 34 * s} ${baseY} H${x - 34 * s} Z`, fill: '#C9673F', stroke: INK, 'stroke-width': 3 }, m);
    sway(m, 1.4, '50% 100%', r(2.8, 3.6));
  }
  monstera(230, 772, 1.05);

  // salón tables (black metal, Tolix-style chairs)
  function table(x, baseY, items) {
    const t = g();
    const chair = (cx, dir) => el('path', { d: `M${cx} ${baseY} V${baseY - 54} M${cx + 44 * dir} ${baseY} V${baseY - 54} M${cx - 4 * dir} ${baseY - 56} H${cx + 48 * dir} M${cx} ${baseY - 56} V${baseY - 120}`, fill: 'none', stroke: DEEP, 'stroke-width': 7, 'stroke-linecap': 'round' }, t);
    chair(x - 120, 1); chair(x + 120, -1);
    el('path', { d: `M${x - 54} ${baseY} L${x} ${baseY - 70} L${x + 54} ${baseY}`, fill: 'none', stroke: DEEP, 'stroke-width': 7, 'stroke-linecap': 'round' }, t);
    el('rect', { x: x - 84, y: baseY - 80, width: 168, height: 14, rx: 4, fill: '#2A2D45', stroke: INK, 'stroke-width': 3 }, t);
    const top = baseY - 80;
    if (items.includes('latte')) {
      el('ellipse', { cx: x - 30, cy: top - 1, rx: 30, ry: 6, fill: '#FFFFFF', stroke: INK, 'stroke-width': 3 }, t);
      el('path', { d: `M${x - 46} ${top - 2}L${x - 50} ${top - 30}H${x - 10}L${x - 14} ${top - 2}Z`, fill: '#FFFFFF', stroke: INK, 'stroke-width': 3 }, t);
      el('ellipse', { cx: x - 30, cy: top - 30, rx: 20, ry: 4, fill: '#B5733C' }, t);
      [x - 38, x - 22].forEach((sx, i) => {
        const s = el('path', { d: `M${sx} ${top - 42}c-8-10 8-16 0-28`, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 4, 'stroke-linecap': 'round' }, t);
        loop(gsap.fromTo(s, { opacity: 0, y: 6 }, { opacity: 0.95, y: -12, duration: 1.6, repeat: -1, ease: 'sine.out', delay: i * 0.7 }));
      });
    }
    if (items.includes('matcha')) {
      el('path', { d: `M${x + 22} ${top}L${x + 18} ${top - 50}H${x + 50}L${x + 46} ${top}Z`, fill: '#9CCB72', stroke: INK, 'stroke-width': 3 }, t);
      el('line', { x1: x + 40, y1: top - 42, x2: x + 52, y2: top - 76, stroke: INK, 'stroke-width': 4, 'stroke-linecap': 'round' }, t);
    }
    if (items.includes('plate')) {
      el('ellipse', { cx: x + 10, cy: top - 4, rx: 44, ry: 8, fill: '#FFFFFF', stroke: INK, 'stroke-width': 3 }, t);
      el('path', { d: `M${x - 14} ${top - 8}q24-24 48 0Z`, fill: '#E4A85A', stroke: INK, 'stroke-width': 3 }, t);
    }
  }
  table(380, 860, ['latte', 'matcha']);
  table(800, 880, ['plate']);
  table(560, 1010, ['latte', 'plate']);
  monstera(1080, 960, 0.9);
  table(1150, 1170, ['matcha', 'latte']);

  // the food truck, facing the entrance (centred on x = 1400)
  clipRect('lgWindow', { x: 1190, y: 395, width: 420, height: 170, rx: 8 });
  clipRect('lgTruck', { x: 1140, y: 575, width: 520, height: 135, rx: 26 });
  const truck = g();
  [[1260, 712], [1560, 712]].forEach(([cx, cy]) => {
    el('circle', { cx, cy, r: 44, fill: DEEP, stroke: INK, 'stroke-width': 4 }, truck);
    el('circle', { cx, cy, r: 16, fill: '#C9CCDA', stroke: INK, 'stroke-width': 3 }, truck);
  });
  el('rect', { x: 1140, y: 330, width: 520, height: 380, rx: 26, fill: '#F6D23A', stroke: INK, 'stroke-width': 5 }, truck);
  const mural = g(truck, { 'clip-path': 'url(#lgTruck)' });
  const mcol = ['#EE6AA7', '#53B060', '#3C8DE0', '#F28C38', '#8E5CD9'];
  for (let i = 0; i < 26; i++) {
    const x = r(1150, 1650), y = r(590, 700), s = r(14, 30), c = mcol[i % mcol.length];
    if (i % 3) {
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2, px = x + Math.cos(a) * s * 0.7, py = y + Math.sin(a) * s * 0.7;
        el('ellipse', { cx: px, cy: py, rx: s * 0.55, ry: s * 0.35, fill: c, transform: `rotate(${(a * 180) / Math.PI} ${px} ${py})` }, mural);
      }
      el('circle', { cx: x, cy: y, r: s * 0.3, fill: '#F6D23A', stroke: INK, 'stroke-width': 2 }, mural);
    } else {
      el('path', { d: `M${x} ${y} q${s} ${-s * 1.6} ${s * 2.4} ${-s * 0.4} q${-s} ${s * 1.4} ${-s * 2.4} ${s * 0.4}Z`, fill: G2, stroke: INK, 'stroke-width': 2 }, mural);
    }
  }
  el('line', { x1: 1140, y1: 575, x2: 1660, y2: 575, stroke: INK, 'stroke-width': 4 }, truck);
  el('rect', { x: 1190, y: 395, width: 420, height: 170, rx: 8, fill: '#FBF3DE', stroke: INK, 'stroke-width': 4 }, truck);
  const inside = g(truck, { 'clip-path': 'url(#lgWindow)' });
  el('line', { x1: 1190, y1: 438, x2: 1610, y2: 438, stroke: WOOD, 'stroke-width': 5 }, inside);
  for (let x = 1220; x < 1330; x += 26) el('rect', { x, y: 414, width: 18, height: 22, rx: 3, fill: '#FFFFFF', stroke: INK, 'stroke-width': 2 }, inside);
  el('rect', { x: 1246, y: 452, width: 38, height: 104, rx: 6, fill: '#E2483D', stroke: INK, 'stroke-width': 3 }, inside);
  el('path', { d: 'M1242 452L1250 420H1280L1288 452Z', fill: '#C9A27A', stroke: INK, 'stroke-width': 3 }, inside);
  el('rect', { x: 1330, y: 470, width: 140, height: 82, rx: 8, fill: '#C9CCDA', stroke: INK, 'stroke-width': 3 }, inside);
  el('rect', { x: 1350, y: 520, width: 30, height: 14, fill: '#5C6080', stroke: INK, 'stroke-width': 2 }, inside);
  el('rect', { x: 1420, y: 520, width: 30, height: 14, fill: '#5C6080', stroke: INK, 'stroke-width': 2 }, inside);
  el('rect', { x: 1356, y: 538, width: 18, height: 16, rx: 3, fill: '#FFFFFF', stroke: INK, 'stroke-width': 2 }, inside);
  const shot = el('rect', { x: 1363, y: 534, width: 4, height: 4, fill: '#4E2814' }, inside);
  loop(gsap.fromTo(shot, { attr: { height: 0 } }, { attr: { height: 6 }, duration: 0.9, repeat: -1, repeatDelay: 2, ease: 'none' }));
  const barista = g(inside);
  el('rect', { x: 1512, y: 500, width: 60, height: 80, rx: 22, fill: INK, stroke: DEEP, 'stroke-width': 3 }, barista);
  el('circle', { cx: 1542, cy: 476, r: 22, fill: '#C68B5E', stroke: INK, 'stroke-width': 3 }, barista);
  el('path', { d: 'M1520 470C1516 444 1566 440 1566 468C1562 456 1530 452 1520 470Z', fill: '#2A1A14' }, barista);
  loop(gsap.timeline({ repeat: -1, yoyo: true, repeatDelay: 1.2 })
    .to(barista, { x: -110, duration: 1.6, ease: 'power1.inOut' })
    .to(barista, { y: 4, duration: 0.3, yoyo: true, repeat: 3 }));
  el('rect', { x: 1178, y: 558, width: 444, height: 16, fill: WOOD2, stroke: INK, 'stroke-width': 3 }, truck);
  el('rect', { x: 1220, y: 532, width: 34, height: 26, fill: '#FFFFFF', stroke: INK, 'stroke-width': 3 }, truck);
  el('rect', { x: 1550, y: 522, width: 30, height: 36, rx: 4, fill: '#DDEEF5', stroke: INK, 'stroke-width': 3 }, truck);
  el('path', { d: 'M1280 558L1284 524H1310L1314 558Z', fill: '#FFFFFF', stroke: INK, 'stroke-width': 3 }, truck);
  el('rect', { x: 1278, y: 518, width: 38, height: 8, rx: 3, fill: INK }, truck);
  [1290, 1304].forEach((x, i) => {
    const s = el('path', { d: `M${x} 510c-8-10 8-16 0-28`, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 4, 'stroke-linecap': 'round' }, truck);
    loop(gsap.fromTo(s, { opacity: 0, y: 6 }, { opacity: 0.9, y: -10, duration: 1.4, repeat: -1, ease: 'sine.out', delay: i * 0.6 }));
  });
  el('path', { d: 'M1178 392H1622L1656 344H1144Z', fill: CREAM, stroke: INK, 'stroke-width': 4 }, truck);
  el('text', { x: 1400, y: 380, 'text-anchor': 'middle', 'font-family': 'Rubik Mono One, Arial Black, sans-serif', 'font-size': 30, fill: INK }, truck).textContent = "COLAO'";

  // the small A-frame chalkboard, standing in front to the right of the truck
  el('path', { d: 'M1560 800L1582 570M1670 800L1648 570', fill: 'none', stroke: WOOD, 'stroke-width': 8, 'stroke-linecap': 'round' });
  el('path', { d: 'M1584 566H1646L1660 716H1570Z', fill: '#2C2C3E', stroke: WOOD, 'stroke-width': 7, 'stroke-linejoin': 'round' });
  el('text', { x: 1615, y: 608, 'text-anchor': 'middle', 'font-family': 'Kaushan Script, Brush Script MT, cursive', 'font-size': 22, fill: CREAM }).textContent = "Colao'";
  [[1590, 626, 50], [1588, 642, 56], [1586, 658, 44], [1584, 676, 60], [1582, 692, 48]]
    .forEach(([x, y, w]) => el('rect', { x, y, width: w, height: 4, rx: 2, fill: CREAM, opacity: 0.65 }));

  // right edge: white fence wrapped in pothos
  function vine(x, y1, y2, swing) {
    const v = g();
    el('path', { d: `M${x} ${y1} C${x + 30} ${(y1 + y2) / 2} ${x - 30} ${(y1 + y2) / 2} ${x} ${y2}`, fill: 'none', stroke: '#3F7A45', 'stroke-width': 4 }, v);
    for (let y = y1 + 20; y < y2; y += 34) {
      const dir = (y / 34) % 2 > 1 ? 1 : -1;
      el('path', { d: 'M0 0C-12-10-18 8 0 22 18 8 12-10 0 0Z', fill: (y / 34) % 3 > 1.5 ? '#9BC94F' : G3, stroke: INK, 'stroke-width': 2, transform: `translate(${x + 14 * dir} ${y}) rotate(${dir * 40}) scale(1.3)` }, v);
    }
    if (swing) sway(v, 2, '50% 0%', 3);
    return v;
  }
  for (let x = 2120; x < 2600; x += 26) el('rect', { x, y: 520, width: 9, height: 225, fill: '#FFFFFF', stroke: INK, 'stroke-width': 2 });
  el('rect', { x: 2110, y: 512, width: 500, height: 12, fill: '#FFFFFF', stroke: INK, 'stroke-width': 3 });
  [2150, 2260, 2380, 2500].forEach((x) => vine(x, 520, 740, false));

  // pergola over everything, string lights, fans, ferns
  [100, 1080, 2080].forEach((x) => el('rect', { x, y: 170, width: 30, height: 580, fill: WOOD, stroke: INK, 'stroke-width': 3 }));
  el('rect', { x: 60, y: 30, width: 2240, height: 136, fill: WOOD3, stroke: INK, 'stroke-width': 4 });
  for (let x = 70; x < 2260; x += 64) el('line', { x1: x, y1: 50, x2: x + 40, y2: 160, stroke: '#8E5631', 'stroke-width': 10 });
  el('rect', { x: 60, y: 158, width: 2240, height: 28, fill: '#80502E', stroke: INK, 'stroke-width': 4 });
  const pts = [];
  for (let i = 0; i <= 30; i++) { const t = i / 30; pts.push([0 + t * 2200, 196 + 300 * t * (1 - t)]); }
  el('polyline', { points: pts.map((p) => p.join(',')).join(' '), fill: 'none', stroke: DEEP, 'stroke-width': 2 });
  const glows = pts.slice(1, -1).map(([x, y]) => {
    el('line', { x1: x, y1: y, x2: x, y2: y + 10, stroke: DEEP, 'stroke-width': 3 });
    const glow = el('circle', { cx: x, cy: y + 18, r: 18, fill: '#FFE9A8', opacity: 0.45 });
    el('circle', { cx: x, cy: y + 18, r: 7, fill: '#FFF4CC', stroke: INK, 'stroke-width': 2 });
    return glow;
  });
  loop(gsap.to(glows, { opacity: 0.08, duration: 1.1, repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: { each: 0.15, from: 'random', repeat: -1, yoyo: true } }));
  [400, 900, 1900].forEach((x) => {
    el('line', { x1: x, y1: 186, x2: x, y2: 236, stroke: DEEP, 'stroke-width': 5 });
    const blades = g();
    el('ellipse', { cx: x, cy: 246, rx: 96, ry: 6, fill: '#C9CCDA', stroke: INK, 'stroke-width': 2.5 }, blades);
    el('ellipse', { cx: x, cy: 246, rx: 20, ry: 11, fill: '#9AA0B5', stroke: INK, 'stroke-width': 3 });
    loop(gsap.fromTo(blades, { scaleX: 1 }, { scaleX: -1, transformOrigin: '50% 50%', duration: 0.32, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
  });
  function fern(x, potY) {
    const f = g();
    el('line', { x1: x, y1: 186, x2: x, y2: potY, stroke: DEEP, 'stroke-width': 2 }, f);
    for (let i = 0; i < 11; i++) {
      const dir = i % 2 ? 1 : -1, len = r(90, 170), spread = r(20, 110) * dir;
      el('path', { d: `M${x + r(-14, 14)} ${potY + 10} q${spread} -10 ${spread * 1.2} ${len}`, fill: 'none', stroke: i % 3 ? G3 : G2, 'stroke-width': 11, 'stroke-linecap': 'round', 'stroke-dasharray': '2 9' }, f);
      el('path', { d: `M${x + r(-10, 10)} ${potY + 10} q${spread * 0.8} -6 ${spread} ${len * 0.9}`, fill: 'none', stroke: G2, 'stroke-width': 3, 'stroke-linecap': 'round' }, f);
    }
    el('path', { d: `M${x - 34} ${potY} H${x + 34} L${x + 26} ${potY + 34} H${x - 26} Z`, fill: '#EDEDE6', stroke: INK, 'stroke-width': 3 }, f);
    sway(f, r(2, 3.5), '50% 0%', r(2.4, 3.4));
  }
  [[220, 250], [560, 270], [760, 245], [1010, 262], [1980, 250]].forEach(([x, y]) => fern(x, y));
  vine(115, 190, 470, true); vine(2095, 190, 470, true);

  // ======================= STREET (D = 1): tree, fence, entrance, cars =======================
  const exL = g(svg);
  P = exL;
  // bushes behind the fence hide the salón
  // left of the fence: an open parking lot
  el('rect', { x: -2400, y: 690, width: 2220, height: 60, fill: '#6A6E88' });
  for (let x = -2300; x < -220; x += 160) el('line', { x1: x, y1: 694, x2: x + 30, y2: 748, stroke: CREAM, 'stroke-width': 4, opacity: 0.8 });
  function parked(x, color) {
    const c = g(P, { transform: `translate(${x} 712) scale(0.62)` });
    el('path', { d: 'M0-30Q0-52 22-56L60-60Q78-92 110-94L170-94Q196-92 214-60L252-56Q274-52 274-30L274-14Q274-6 266-6L8-6Q0-6 0-14Z', fill: color, stroke: INK, 'stroke-width': 5 }, c);
    el('path', { d: 'M76-60Q92-86 114-86H140V-60ZM150-86H168Q188-86 204-60H150Z', fill: '#CFEAFB', stroke: INK, 'stroke-width': 4 }, c);
    [62, 214].forEach((wx) => el('circle', { cx: wx, cy: -6, r: 23, fill: DEEP, stroke: INK, 'stroke-width': 4 }, c));
  }
  parked(-1500, '#F4F4F0'); parked(-1080, '#8E5CD9'); parked(-620, '#53B060');
  palm(-1250, 700, 330, 1);
  for (let x = -180; x < 1260; x += 34) {
    el('circle', { cx: x, cy: 610 + r(-40, 10), r: r(44, 70), fill: [G1, G2, G3][Math.floor(r(0, 3))] });
  }
  const FL = -200, FR = 1180; // fence from the left edge up to the entrance
  el('rect', { x: FL, y: 578, width: FR - FL, height: 10, fill: '#FFFFFF', ...line, 'stroke-width': 2.5 });
  const pillars = [];
  for (let x = FL; x < FR - 60; x += 250) pillars.push(x);
  for (let x = FL + 10; x < FR; x += 24) {
    if (pillars.some((p) => x > p - 8 && x < p + 50)) continue;
    el('rect', { x, y: 586, width: 7, height: 118, fill: '#FFFFFF', stroke: INK, 'stroke-width': 2 });
  }
  el('rect', { x: FL, y: 700, width: FR - FL, height: 50, fill: '#F7F7F2', ...line });
  pillars.forEach((x) => {
    el('rect', { x, y: 548, width: 46, height: 202, fill: '#F7F7F2', ...line });
    el('rect', { x: x - 6, y: 536, width: 58, height: 16, fill: '#FFFFFF', ...line, 'stroke-width': 3 });
  });
  function banner(x, y, w, h, text, size) {
    const b = g();
    el('line', { x1: x + 8, y1: y + 4, x2: x - 4, y2: 588, stroke: INK, 'stroke-width': 2 }, b);
    el('line', { x1: x + w - 8, y1: y + 4, x2: x + w + 4, y2: 588, stroke: INK, 'stroke-width': 2 }, b);
    el('path', { d: `M${x} ${y} H${x + w} V${y + h} Q${x + w * 0.75} ${y + h - 8} ${x + w / 2} ${y + h} T${x} ${y + h} Z`, fill: '#FFFFFF', ...line, 'stroke-width': 3 }, b);
    el('text', { x: x + w / 2, y: y + h / 2 + size * 0.34, 'text-anchor': 'middle', 'font-family': 'Kaushan Script, Brush Script MT, cursive', 'font-size': size, fill: DEEP }, b).textContent = text;
    sway(b, r(0.8, 1.4), '50% 0%', r(1.8, 2.6));
  }
  banner(-140, 604, 180, 80, 'Frappés', 40);
  banner(108, 606, 186, 78, 'Sándwiches', 32);
  banner(858, 604, 178, 82, 'Café', 46);

  // sidewalk and street
  el('rect', { x: -3000, y: 748, width: 7000, height: 64, fill: '#E7E1D2' });
  for (let x = -2980; x < 4000; x += 72) el('line', { x1: x, y1: 750, x2: x - 14, y2: 810, stroke: '#CFC6B0', 'stroke-width': 3 });
  el('line', { x1: -3000, y1: 748, x2: 4000, y2: 748, stroke: INK, 'stroke-width': 3 });
  el('rect', { x: -3000, y: 810, width: 7000, height: 14, fill: '#CBC3AE', stroke: INK, 'stroke-width': 3 });
  el('rect', { x: -3000, y: 824, width: 7000, height: 2400, fill: '#4B4F70' });
  for (let x = -2980; x < 4000; x += 96) el('rect', { x, y: 912, width: 50, height: 7, rx: 3, fill: CREAM, opacity: 0.8 });

  // the entrance: two white columns with the 107, then a lower wall covered in pothos
  // the entrance is as wide as the truck: looking in from the street, truck and chalkboard fill it
  const EX = 1400;
  [[FR, 1250], [1550, 1620]].forEach(([a, b]) => {
    el('rect', { x: a, y: 330, width: b - a, height: 420, fill: '#F7F7F2', ...line });
    el('rect', { x: a - 10, y: 316, width: b - a + 20, height: 20, fill: '#FFFFFF', ...line, 'stroke-width': 3 });
  });
  el('rect', { x: 1188, y: 470, width: 54, height: 34, rx: 4, fill: INK });
  el('text', { x: 1215, y: 495, 'text-anchor': 'middle', 'font-family': 'Rubik Mono One, Arial Black, sans-serif', 'font-size': 19, fill: CREAM }).textContent = '107';
  vine(1605, 336, 740, true);
  // the fence starts again on the other side of the entrance, wrapped in pothos
  for (let x = 1630; x < 3000; x += 24) el('rect', { x, y: 586, width: 7, height: 118, fill: '#FFFFFF', stroke: INK, 'stroke-width': 2 });
  el('rect', { x: 1620, y: 578, width: 1380, height: 10, fill: '#FFFFFF', ...line, 'stroke-width': 2.5 });
  el('rect', { x: 1620, y: 700, width: 1380, height: 50, fill: '#F7F7F2', ...line });
  [1990, 2240, 2490, 2740].forEach((x) => {
    el('rect', { x, y: 548, width: 46, height: 202, fill: '#F7F7F2', ...line });
    el('rect', { x: x - 6, y: 536, width: 58, height: 16, fill: '#FFFFFF', ...line, 'stroke-width': 3 });
  });
  for (let x = 1660; x < 3000; x += 60) vine(x, 588, 740, false);

  // street sign
  el('rect', { x: 1830, y: 430, width: 10, height: 330, fill: '#9AA0B5', stroke: INK, 'stroke-width': 2 });
  el('rect', { x: 1726, y: 404, width: 216, height: 42, rx: 6, fill: INK, stroke: DEEP, 'stroke-width': 3 });
  el('text', { x: 1834, y: 432, 'text-anchor': 'middle', 'font-family': 'Rubik Mono One, Arial Black, sans-serif', 'font-size': 17, fill: CREAM }).textContent = 'C. MAIN ESTE';

  // the big tree, in front of the fence
  el('ellipse', { cx: 700, cy: 790, rx: 460, ry: 22, fill: DEEP, opacity: 0.16 });
  el('path', { d: 'M626 762C636 690 628 610 580 530L604 518C646 584 664 612 674 650C690 596 722 548 766 508L786 524C742 570 712 650 714 762Z', fill: '#6B4A33', ...line });
  const crown = g();
  const blob = (n, rmin, rmax, fill, cxr, cyr, dy = 0) => {
    for (let i = 0; i < n; i++) {
      let x, y;
      do { x = r(-1, 1); y = r(-1, 1); } while (x * x + y * y > 1);
      el('circle', { cx: 670 + x * cxr, cy: 370 + y * cyr + dy, r: r(rmin, rmax), fill }, crown);
    }
  };
  blob(52, 50, 90, G1, 480, 160);
  blob(46, 40, 74, G2, 450, 150, 10);
  blob(32, 26, 52, G3, 420, 130, 30);
  blob(18, 12, 24, G4, 400, 120, 20);
  sway(crown, 1.1, '50% 100%', 3.2);
  for (let i = 0; i < 5; i++) {
    const leaf = el('ellipse', { cx: 0, cy: 0, rx: 9, ry: 5, fill: i % 2 ? G3 : G2 });
    const sx = r(320, 1040);
    loop(gsap.timeline({ repeat: -1, delay: i * 1.7, repeatDelay: r(1, 4) })
      .set(leaf, { x: sx, y: r(470, 530), rotation: 0, opacity: 1 })
      .to(leaf, { y: 770, duration: 4.2, ease: 'sine.in' }, 0)
      .to(leaf, { x: sx + r(-90, 90), rotation: r(-200, 200), duration: 4.2, ease: 'sine.inOut' }, 0)
      .to(leaf, { opacity: 0, duration: 0.4 }, 3.8));
  }

  // sidewalk bistro sets
  function bistro(x) {
    const b = g();
    const d = (cx, dir) => `M${cx} 806 L${cx + 26 * dir} 760 M${cx + 26 * dir} 806 L${cx} 760 M${cx - 4 * dir} 762 H${cx + 30 * dir} M${cx + 28 * dir} 762 L${cx + 34 * dir} 712`;
    [[x - 80, -1], [x + 80, 1]].forEach(([cx, dir]) => {
      el('path', { d: d(cx, dir), fill: 'none', stroke: '#FFFFFF', 'stroke-width': 6, 'stroke-linecap': 'round' }, b);
      el('path', { d: d(cx, dir), fill: 'none', stroke: INK, 'stroke-width': 2, 'stroke-linecap': 'round' }, b);
    });
    el('line', { x1: x, y1: 770, x2: x, y2: 806, stroke: INK, 'stroke-width': 4 }, b);
    el('path', { d: `M${x - 22} 808 L${x} 790 L${x + 22} 808`, fill: 'none', stroke: INK, 'stroke-width': 3 }, b);
    el('ellipse', { cx: x, cy: 768, rx: 40, ry: 8, fill: '#FFFFFF', stroke: INK, 'stroke-width': 3 }, b);
  }
  bistro(1060); bistro(1900);

  // cars on Calle Main Este
  function car(color, dir, laneY, scale, dur, delay, kind) {
    const c = g();
    const body = kind === 'van'
      ? 'M0-30Q0-118 30-120L210-120Q252-118 262-70L272-60Q280-50 280-30L280-14Q280-6 272-6L8-6Q0-6 0-14Z'
      : 'M0-30Q0-52 22-56L60-60Q78-92 110-94L170-94Q196-92 214-60L252-56Q274-52 274-30L274-14Q274-6 266-6L8-6Q0-6 0-14Z';
    el('path', { d: body, fill: color, stroke: INK, 'stroke-width': 4, 'stroke-linejoin': 'round' }, c);
    if (kind === 'van') {
      el('path', { d: 'M150-108H210Q238-106 246-72H150Z', fill: '#CFEAFB', stroke: INK, 'stroke-width': 3 }, c);
      el('rect', { x: 30, y: -106, width: 100, height: 34, rx: 4, fill: '#CFEAFB', stroke: INK, 'stroke-width': 3 }, c);
    } else {
      el('path', { d: 'M76-60Q92-86 114-86H140V-60Z', fill: '#CFEAFB', stroke: INK, 'stroke-width': 3 }, c);
      el('path', { d: 'M150-86H168Q188-86 204-60H150Z', fill: '#CFEAFB', stroke: INK, 'stroke-width': 3 }, c);
    }
    el('rect', { x: 260, y: -44, width: 12, height: 10, rx: 3, fill: '#FFE9A8', stroke: INK, 'stroke-width': 2 }, c);
    el('rect', { x: 2, y: -44, width: 10, height: 10, rx: 3, fill: '#E2483D', stroke: INK, 'stroke-width': 2 }, c);
    [62, 214].forEach((wx) => {
      el('circle', { cx: wx, cy: -6, r: 23, fill: DEEP, stroke: INK, 'stroke-width': 3 }, c);
      const hub = g(c);
      el('circle', { cx: wx, cy: -6, r: 9, fill: '#C9CCDA' }, hub);
      el('line', { x1: wx - 9, y1: -6, x2: wx + 9, y2: -6, stroke: INK, 'stroke-width': 3 }, hub);
      loop(gsap.to(hub, { rotation: 360 * dir, transformOrigin: '50% 50%', duration: 0.5, repeat: -1, ease: 'none' }));
    });
    gsap.set(c, { y: laneY, scaleX: dir * scale, scaleY: scale, transformOrigin: '0 0' });
    const from = dir > 0 ? -2200 : 3000, to = dir > 0 ? 3000 : -2200;
    loop(gsap.fromTo(c, { x: from }, { x: to, duration: dur, delay, repeat: -1, repeatDelay: r(1, 4), ease: 'none' }));
  }
  car('#E2483D', 1, 892, 0.92, 9, 0.4);
  car('#F4F4F0', 1, 892, 0.92, 11, 6);
  car('#3C8DE0', -1, 980, 1.05, 8, 2.4, 'van');
  car('#F6D23A', -1, 980, 1.05, 10, 8);

  // ======================= camera =======================
  // F turns world units into screen units; each layer is drawn at scale F / (depth - z).
  const D = { far: 3, in: 1.6, ex: 1 };
  // start on the street; on phones the street sits lower so the text fits in the sky above it
  const tall = window.matchMedia('(max-aspect-ratio: 1/1)').matches;
  const cam = tall ? { x: 560, y: 340, z: 0, ex: 1, k: 1 } : { x: 120, y: 560, z: 0, ex: 1, k: 1 };
  let VW = 1600, VH = 1000, F = 1;
  function layer(node, depth) {
    const s = (F * cam.k) / (depth - cam.z);
    node.setAttribute('transform', `translate(${VW / 2} ${VH / 2}) scale(${s.toFixed(4)}) translate(${-cam.x} ${-cam.y})`);
  }
  function render() {
    const box = svg.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const aspect = box.width / box.height;
    VW = VH * aspect;
    svg.setAttribute('viewBox', `0 0 ${VW.toFixed(1)} ${VH}`);
    F = VW / (aspect > 1 ? 1500 : 820);
    layer(farL, D.far); layer(inL, D.in); layer(exL, D.ex);
    exL.setAttribute('opacity', cam.ex.toFixed(3));
    sun.setAttribute('transform', `translate(${(VW * 0.12).toFixed(1)} ${(VH * 0.12).toFixed(1)})`);
    clouds.forEach((c) => c.node.setAttribute('transform', `translate(${(c.fx * VW - cam.x * 0.05).toFixed(1)} ${(c.fy * VH).toFixed(1)}) scale(${c.s})`));
  }
  clouds.forEach((c) => loop(gsap.to(c, { fx: c.fx + r(0.05, 0.12), duration: r(30, 50), repeat: -1, yoyo: true, ease: 'sine.inOut', onUpdate: render })));

  // one timeline, scrubbed by the page scroll
  const copy = document.getElementById('placeCopy');
  const labelEl = document.getElementById('placeLabel');
  const hint = stage.querySelector('.place-hint');
  const tl = gsap.timeline({ paused: true, onUpdate: render, defaults: { ease: 'sine.inOut' } });
  tl.to(cam, { x: 1300, y: tall ? 420 : 560, z: 0.2, duration: 0.28 })   // walk along the fence towards the entrance
    .to(cam, { x: EX, y: 560, z: 0.95, duration: 0.22, ease: 'power1.in' }) // walk through the entrance
    .to(cam, { ex: 0, duration: 0.05, ease: 'none' }, '-=0.05')
    .to(cam, { x: 1420, y: tall ? 600 : 560, z: 0.8, k: tall ? 0.95 : 1, duration: 0.14, ease: 'power1.out' }); // ends facing the truck, board on the right
  if (copy) tl.to(copy, { opacity: 0, y: -40, duration: 0.12, ease: 'power1.in' }, 0.02);
  const stops = [
    [0, 'Calle Main Este, Ponce', 'Calle Main Este, Ponce'],
    [0.4, 'La entrada', 'The entrance'],
    [0.8, "Bienvenido a Colao'", "Welcome to Colao'"],
  ];
  let progress = 0;
  function updateLabel() {
    const en = document.documentElement.lang === 'en';
    let i = 0;
    stops.forEach((s, k) => { if (progress >= s[0]) i = k; });
    const text = en ? stops[i][2] : stops[i][1];
    if (labelEl && labelEl.textContent !== text) {
      labelEl.textContent = text;
      if (!reduce) gsap.fromTo(labelEl.parentNode, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35 });
    }
    if (hint) hint.classList.toggle('gone', progress > 0.04);
  }
  new MutationObserver(updateLabel).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  render(); updateLabel();
  addEventListener('resize', render);

  if (reduce) { ambient.forEach((t) => t.kill()); return; }

  if (window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    // iOS Safari resizes the viewport when its address bar hides; don't re-measure mid-scroll
    ScrollTrigger.config({ ignoreMobileResize: true });
    ScrollTrigger.create({
      trigger: stage, start: 'top top', end: () => '+=' + Math.round(innerHeight * 2),
      // anticipatePin locks the scene a moment early, so the page doesn't overshoot and snap back
      pin: true, anticipatePin: 1, refreshPriority: 1, scrub: 1, animation: tl, invalidateOnRefresh: true,
      onUpdate: (self) => { progress = self.progress; updateLabel(); },
    });
    ScrollTrigger.create({
      trigger: stage, start: 'top bottom', end: () => '+=' + Math.round(innerHeight * 5),
      onToggle: (self) => ambient.forEach((t) => (self.isActive ? t.resume() : t.pause())),
    });
    addEventListener('load', () => ScrollTrigger.refresh());
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }
  window.__lugar = { tl, cam, render };
})();
