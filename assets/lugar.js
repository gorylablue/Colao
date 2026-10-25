// Ilustración animada de Colao' (Calle Main Este, Ponce).
// La cámara recorre la escena con el scroll: la calle con el árbol y los carros,
// la entrada, el foodtruck y la terraza. El mundo mide ~2900 x 1000 unidades.
(() => {
  const svg = document.getElementById('place');
  const fig = document.getElementById('placeFig');
  if (!svg || !fig || !window.gsap) return;

  const NS = 'http://www.w3.org/2000/svg';
  const INK = '#2A1FB8', DEEP = '#1A1373', CREAM = '#F2F6D8', SKY = '#A9D9F6';
  const G1 = '#2E6B45', G2 = '#3F8A57', G3 = '#5FA866', G4 = '#7CC46E';
  const WOOD = '#7A4A2B', WOOD2 = '#9C6238', WOOD3 = '#6B3F24';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrowQ = window.matchMedia('(max-width: 700px)');

  // Repeatable randomness so the drawing is the same on every visit
  let seed = 11;
  const r = (a, b) => { seed = (seed * 16807) % 2147483647; return a + (seed / 2147483647) * (b - a); };

  function el(tag, attrs = {}, parent = svg) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    parent.appendChild(n);
    return n;
  }
  const g = (parent = svg, attrs = {}) => el('g', attrs, parent);
  const line = { stroke: INK, 'stroke-width': 4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
  const ambient = [];
  const loop = (t) => { ambient.push(t); return t; };

  // ---------- defs ----------
  const defs = el('defs');
  const clip = (id, attrs) => { const c = el('clipPath', { id }, defs); el('rect', attrs, c); };
  clip('lgStreet', { x: -1200, y: 0, width: 2436, height: 2000 });
  clip('lgWindow', { x: 1500, y: 395, width: 420, height: 170, rx: 8 });
  clip('lgTruck', { x: 1450, y: 575, width: 520, height: 135, rx: 26 });

  // ---------- sky ----------
  el('rect', { x: -1500, y: -1500, width: 5200, height: 3000, fill: SKY });
  el('circle', { cx: 260, cy: 150, r: 64, fill: '#FFF3B8' });
  el('circle', { cx: 260, cy: 150, r: 96, fill: '#FFF3B8', opacity: 0.35 });
  const clouds = g();
  [[80, 120, 1], [760, 70, 0.8], [1500, 110, 1.1], [2300, 60, 0.9], [-500, 90, 1]].forEach(([x, y, s]) => {
    const c = g(clouds, { transform: `translate(${x} ${y}) scale(${s})` });
    [[0, 0, 70, 26], [50, -18, 50, 30], [100, 0, 60, 24]].forEach(([cx, cy, rx, ry]) =>
      el('ellipse', { cx, cy, rx, ry, fill: '#FFFFFF', opacity: 0.92 }, c));
    loop(gsap.to(c, { x: `+=${r(160, 300)}`, duration: r(30, 50), repeat: -1, yoyo: true, ease: 'sine.inOut' }));
  });

  // ---------- background: neighbourhood, palms, pink wall (parallax layer) ----------
  const bg = g();
  function palm(x, baseY, h, lean = 1) {
    const p = g(bg);
    const topX = x + 40 * lean, topY = baseY - h;
    el('path', { d: `M${x} ${baseY} Q${x + 10 * lean} ${baseY - h / 2} ${topX} ${topY}`, fill: 'none', stroke: '#8A6A4A', 'stroke-width': 16, 'stroke-linecap': 'round' }, p);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.3;
      const ex = topX + Math.cos(a) * 110, ey = topY + Math.sin(a) * 50 + 30;
      el('path', { d: `M${topX} ${topY} Q${(topX + ex) / 2} ${topY - 40} ${ex} ${ey}`, fill: 'none', stroke: i % 2 ? G2 : G3, 'stroke-width': 18, 'stroke-linecap': 'round' }, p);
    }
  }
  [[-160, 270, 240, '#F4C7D6'], [130, 220, 200, '#F7E6A6'], [370, 300, 250, '#CFE8DA'], [700, 240, 210, '#FFFFFF'], [960, 270, 240, '#F7D2B4']]
    .forEach(([x, w, h, fill]) => {
      el('rect', { x, y: 720 - h, width: w, height: h, fill, stroke: INK, 'stroke-width': 3 }, bg);
      el('rect', { x: x - 8, y: 720 - h - 14, width: w + 16, height: 16, fill: '#E9E4D6', stroke: INK, 'stroke-width': 3 }, bg);
      for (let wx = x + 30; wx < x + w - 50; wx += 90) {
        el('rect', { x: wx, y: 720 - h + 40, width: 46, height: 52, fill: '#CFEAFB', stroke: INK, 'stroke-width': 3 }, bg);
      }
    });
  palm(100, 720, 400, 1); palm(1020, 720, 440, -1);
  el('rect', { x: 1320, y: 380, width: 1700, height: 380, fill: '#F6B3CE' }, bg);
  el('rect', { x: 1320, y: 372, width: 1700, height: 14, fill: '#FBD3E2' }, bg);
  palm(2330, 720, 520, -1); palm(2560, 720, 470, 1); palm(1880, 720, 560, 1);

  // ---------- outside: bushes, fence and banners ----------
  for (let x = 70; x < 1230; x += 38) {
    el('circle', { cx: x, cy: 690 + r(-24, 6), r: r(30, 52), fill: [G1, G2, G3][Math.floor(r(0, 3))] });
  }
  el('rect', { x: 60, y: 578, width: 1180, height: 10, fill: '#FFFFFF', ...line, 'stroke-width': 2.5 });
  const pillars = [60, 310, 560, 810, 1060];
  for (let x = 92; x < 1236; x += 24) {
    if (pillars.some((p) => x > p - 8 && x < p + 50)) continue;
    el('rect', { x, y: 586, width: 7, height: 118, fill: '#FFFFFF', stroke: INK, 'stroke-width': 2 });
  }
  el('rect', { x: 60, y: 700, width: 1180, height: 50, fill: '#F7F7F2', ...line });
  pillars.forEach((x) => {
    el('rect', { x, y: 548, width: 46, height: 202, fill: '#F7F7F2', ...line });
    el('rect', { x: x - 6, y: 536, width: 58, height: 16, fill: '#FFFFFF', ...line, 'stroke-width': 3 });
  });
  function banner(x, y, w, h, text, size) {
    const b = g();
    el('line', { x1: x + 8, y1: y + 4, x2: x - 4, y2: 588, stroke: INK, 'stroke-width': 2 }, b);
    el('line', { x1: x + w - 8, y1: y + 4, x2: x + w + 4, y2: 588, stroke: INK, 'stroke-width': 2 }, b);
    el('path', { d: `M${x} ${y} H${x + w} V${y + h} Q${x + w * 0.75} ${y + h - 8} ${x + w / 2} ${y + h} T${x} ${y + h} Z`, fill: '#FFFFFF', ...line, 'stroke-width': 3 }, b);
    const t = el('text', { x: x + w / 2, y: y + h / 2 + size * 0.34, 'text-anchor': 'middle', 'font-family': 'Kaushan Script, Brush Script MT, cursive', 'font-size': size, fill: DEEP }, b);
    t.textContent = text;
    loop(gsap.to(b, { rotation: r(0.8, 1.4), svgOrigin: `${x + w / 2} ${y}`, duration: r(1.8, 2.6), repeat: -1, yoyo: true, ease: 'sine.inOut' }));
  }
  banner(118, 604, 180, 80, 'Frappés', 40);
  banner(362, 606, 190, 78, 'Sándwiches', 33);
  banner(866, 604, 178, 82, 'Café', 46);

  // ---------- sidewalk and street ----------
  el('rect', { x: -1200, y: 748, width: 2440, height: 64, fill: '#E7E1D2' });
  for (let x = -1180; x < 1236; x += 72) el('line', { x1: x, y1: 750, x2: x - 14, y2: 810, stroke: '#CFC6B0', 'stroke-width': 3 });
  el('line', { x1: -1200, y1: 748, x2: 1236, y2: 748, stroke: INK, 'stroke-width': 3 });
  el('rect', { x: -1200, y: 810, width: 2440, height: 14, fill: '#CBC3AE', stroke: INK, 'stroke-width': 3 });
  el('rect', { x: -1200, y: 824, width: 2440, height: 1200, fill: '#4B4F70' });
  for (let x = -1180; x < 1236; x += 96) el('rect', { x, y: 912, width: 50, height: 7, rx: 3, fill: CREAM, opacity: 0.8 });

  // ---------- the big tree (it's still there) ----------
  el('ellipse', { cx: 760, cy: 790, rx: 420, ry: 22, fill: DEEP, opacity: 0.16 });
  el('path', { d: 'M686 762C696 690 688 610 640 530L664 518C706 584 724 612 734 650C750 596 782 548 826 508L846 524C802 570 772 650 774 762Z', fill: '#6B4A33', ...line });
  const crown = g();
  const blob = (n, rmin, rmax, fill, cxr, cyr, dy = 0) => {
    for (let i = 0; i < n; i++) {
      let x, y;
      do { x = r(-1, 1); y = r(-1, 1); } while (x * x + y * y > 1);
      el('circle', { cx: 730 + x * cxr, cy: 370 + y * cyr + dy, r: r(rmin, rmax), fill }, crown);
    }
  };
  blob(46, 50, 88, G1, 440, 150);
  blob(42, 40, 72, G2, 410, 140, 10);
  blob(30, 26, 52, G3, 380, 120, 30);
  blob(16, 12, 24, G4, 360, 110, 20);
  loop(gsap.to(crown, { rotation: 1.1, svgOrigin: '730 760', duration: 3.2, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
  for (let i = 0; i < 5; i++) {
    const leaf = el('ellipse', { cx: 0, cy: 0, rx: 9, ry: 5, fill: i % 2 ? G3 : G2 });
    const sx = r(420, 1060);
    loop(gsap.timeline({ repeat: -1, delay: i * 1.7, repeatDelay: r(1, 4) })
      .set(leaf, { x: sx, y: r(470, 530), rotation: 0, opacity: 1 })
      .to(leaf, { y: 770, duration: 4.2, ease: 'sine.in' }, 0)
      .to(leaf, { x: sx + r(-90, 90), rotation: r(-200, 200), duration: 4.2, ease: 'sine.inOut' }, 0)
      .to(leaf, { opacity: 0, duration: 0.4 }, 3.8));
  }

  // ---------- sidewalk bistro sets ----------
  function bistro(x) {
    const b = g();
    const chair = (cx, dir) => {
      el('path', { d: `M${cx} 806 L${cx + 26 * dir} 760 M${cx + 26 * dir} 806 L${cx} 760 M${cx - 4 * dir} 762 H${cx + 30 * dir} M${cx + 28 * dir} 762 L${cx + 34 * dir} 712`, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 6, 'stroke-linecap': 'round' }, b);
      el('path', { d: `M${cx} 806 L${cx + 26 * dir} 760 M${cx + 26 * dir} 806 L${cx} 760 M${cx - 4 * dir} 762 H${cx + 30 * dir} M${cx + 28 * dir} 762 L${cx + 34 * dir} 712`, fill: 'none', stroke: INK, 'stroke-width': 2, 'stroke-linecap': 'round' }, b);
    };
    chair(x - 80, -1); chair(x + 80, 1);
    el('line', { x1: x, y1: 770, x2: x, y2: 806, stroke: INK, 'stroke-width': 4 }, b);
    el('path', { d: `M${x - 22} 808 L${x} 790 L${x + 22} 808`, fill: 'none', stroke: INK, 'stroke-width': 3 }, b);
    el('ellipse', { cx: x, cy: 768, rx: 40, ry: 8, fill: '#FFFFFF', stroke: INK, 'stroke-width': 3 }, b);
  }
  bistro(640); bistro(1000);

  // ---------- street sign ----------
  el('rect', { x: 1100, y: 430, width: 10, height: 330, fill: '#9AA0B5', stroke: INK, 'stroke-width': 2 });
  el('rect', { x: 996, y: 404, width: 216, height: 42, rx: 6, fill: INK, stroke: DEEP, 'stroke-width': 3 });
  const sign = el('text', { x: 1104, y: 432, 'text-anchor': 'middle', 'font-family': 'Rubik Mono One, Arial Black, sans-serif', 'font-size': 17, fill: CREAM });
  sign.textContent = 'C. MAIN ESTE';

  // ---------- inside: deck, pergola, lights, fans ----------
  el('rect', { x: 1328, y: 745, width: 1700, height: 1300, fill: WOOD2 });
  for (let y = 770; y < 1300; y += 28) el('line', { x1: 1328, y1: y, x2: 3028, y2: y, stroke: '#7E4B2A', 'stroke-width': 3 });
  el('line', { x1: 1328, y1: 745, x2: 3028, y2: 745, stroke: INK, 'stroke-width': 4 });
  el('rect', { x: 1990, y: 745, width: 330, height: 44, fill: '#4FA25B' });

  // right side: white fence wrapped in pothos
  for (let x = 2700; x < 3020; x += 26) el('rect', { x, y: 520, width: 9, height: 225, fill: '#FFFFFF', stroke: INK, 'stroke-width': 2 });
  el('rect', { x: 2690, y: 512, width: 340, height: 12, fill: '#FFFFFF', stroke: INK, 'stroke-width': 3 });

  // the food truck
  const truck = g();
  [[1570, 712], [1870, 712]].forEach(([cx, cy]) => {
    el('circle', { cx, cy, r: 44, fill: DEEP, stroke: INK, 'stroke-width': 4 }, truck);
    el('circle', { cx, cy, r: 16, fill: '#C9CCDA', stroke: INK, 'stroke-width': 3 }, truck);
  });
  el('rect', { x: 1450, y: 330, width: 520, height: 380, rx: 26, fill: '#F6D23A', stroke: INK, 'stroke-width': 5 }, truck);
  const mural = g(truck, { 'clip-path': 'url(#lgTruck)' });
  const mcol = ['#EE6AA7', '#53B060', '#3C8DE0', '#F28C38', '#8E5CD9'];
  for (let i = 0; i < 26; i++) {
    const x = r(1460, 1960), y = r(590, 700), s = r(14, 30), c = mcol[i % mcol.length];
    if (i % 3) {
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2;
        el('ellipse', { cx: x + Math.cos(a) * s * 0.7, cy: y + Math.sin(a) * s * 0.7, rx: s * 0.55, ry: s * 0.35, fill: c, transform: `rotate(${(a * 180) / Math.PI} ${x + Math.cos(a) * s * 0.7} ${y + Math.sin(a) * s * 0.7})` }, mural);
      }
      el('circle', { cx: x, cy: y, r: s * 0.3, fill: '#F6D23A', stroke: INK, 'stroke-width': 2 }, mural);
    } else {
      el('path', { d: `M${x} ${y} q${s} ${-s * 1.6} ${s * 2.4} ${-s * 0.4} q${-s} ${s * 1.4} ${-s * 2.4} ${s * 0.4}Z`, fill: '#3F8A57', stroke: INK, 'stroke-width': 2 }, mural);
    }
  }
  el('line', { x1: 1450, y1: 575, x2: 1970, y2: 575, stroke: INK, 'stroke-width': 4 }, truck);

  // the truck window and what happens inside
  el('rect', { x: 1500, y: 395, width: 420, height: 170, rx: 8, fill: '#FBF3DE', stroke: INK, 'stroke-width': 4 }, truck);
  const inside = g(truck, { 'clip-path': 'url(#lgWindow)' });
  el('line', { x1: 1500, y1: 438, x2: 1920, y2: 438, stroke: WOOD, 'stroke-width': 5 }, inside);
  for (let x = 1530; x < 1640; x += 26) el('rect', { x, y: 414, width: 18, height: 22, rx: 3, fill: '#FFFFFF', stroke: INK, 'stroke-width': 2 }, inside);
  el('rect', { x: 1556, y: 452, width: 38, height: 104, rx: 6, fill: '#E2483D', stroke: INK, 'stroke-width': 3 }, inside);
  el('path', { d: 'M1552 452L1560 420H1590L1598 452Z', fill: '#C9A27A', stroke: INK, 'stroke-width': 3 }, inside);
  el('rect', { x: 1640, y: 470, width: 140, height: 82, rx: 8, fill: '#C9CCDA', stroke: INK, 'stroke-width': 3 }, inside);
  el('rect', { x: 1660, y: 520, width: 30, height: 14, fill: '#5C6080', stroke: INK, 'stroke-width': 2 }, inside);
  el('rect', { x: 1730, y: 520, width: 30, height: 14, fill: '#5C6080', stroke: INK, 'stroke-width': 2 }, inside);
  el('rect', { x: 1666, y: 538, width: 18, height: 16, rx: 3, fill: '#FFFFFF', stroke: INK, 'stroke-width': 2 }, inside);
  const shot = el('rect', { x: 1673, y: 534, width: 4, height: 4, fill: '#4E2814' }, inside);
  loop(gsap.fromTo(shot, { attr: { height: 0 } }, { attr: { height: 6 }, duration: 0.9, repeat: -1, repeatDelay: 2, ease: 'none' }));
  const barista = g(inside);
  el('rect', { x: 1822, y: 500, width: 60, height: 80, rx: 22, fill: INK, stroke: DEEP, 'stroke-width': 3 }, barista);
  el('circle', { cx: 1852, cy: 476, r: 22, fill: '#C68B5E', stroke: INK, 'stroke-width': 3 }, barista);
  el('path', { d: 'M1830 470C1826 444 1876 440 1876 468C1872 456 1840 452 1830 470Z', fill: '#2A1A14' }, barista);
  loop(gsap.timeline({ repeat: -1, yoyo: true, repeatDelay: 1.2 })
    .to(barista, { x: -110, duration: 1.6, ease: 'power1.inOut' })
    .to(barista, { y: 4, duration: 0.3, yoyo: true, repeat: 3 }));
  el('rect', { x: 1488, y: 558, width: 444, height: 16, fill: WOOD2, stroke: INK, 'stroke-width': 3 }, truck);
  el('rect', { x: 1530, y: 532, width: 34, height: 26, fill: '#FFFFFF', stroke: INK, 'stroke-width': 3 }, truck);
  el('rect', { x: 1860, y: 522, width: 30, height: 36, rx: 4, fill: '#DDEEF5', stroke: INK, 'stroke-width': 3 }, truck);
  el('path', { d: 'M1590 558L1594 524H1620L1624 558Z', fill: '#FFFFFF', stroke: INK, 'stroke-width': 3 }, truck);
  el('rect', { x: 1588, y: 518, width: 38, height: 8, rx: 3, fill: INK }, truck);
  const truckSteam = g(truck);
  [1600, 1614].forEach((x, i) => {
    const s = el('path', { d: `M${x} 510c-8-10 8-16 0-28`, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 4, 'stroke-linecap': 'round' }, truckSteam);
    loop(gsap.fromTo(s, { opacity: 0, y: 6 }, { opacity: 0.9, y: -10, duration: 1.4, repeat: -1, ease: 'sine.out', delay: i * 0.6 }));
  });
  el('path', { d: 'M1488 392H1932L1966 344H1454Z', fill: CREAM, stroke: INK, 'stroke-width': 4 }, truck);
  const tSign = el('text', { x: 1710, y: 380, 'text-anchor': 'middle', 'font-family': 'Rubik Mono One, Arial Black, sans-serif', 'font-size': 30, fill: INK }, truck);
  tSign.textContent = "COLAO'";

  // chalkboard menu
  el('rect', { x: 1998, y: 410, width: 170, height: 336, fill: '#2C2C3E', stroke: WOOD, 'stroke-width': 10 });
  const chalk = el('text', { x: 2083, y: 466, 'text-anchor': 'middle', 'font-family': 'Kaushan Script, Brush Script MT, cursive', 'font-size': 34, fill: CREAM });
  chalk.textContent = "Colao'";
  [[2020, 500, 90], [2020, 522, 120], [2020, 544, 70], [2020, 578, 110], [2020, 600, 80], [2020, 634, 124], [2020, 656, 96], [2020, 690, 70]]
    .forEach(([x, y, w]) => el('rect', { x, y, width: w, height: 5, rx: 2, fill: CREAM, opacity: 0.65 }));

  // pergola roof, posts and string lights (drawn after the truck so it frames it)
  [1338, 2648].forEach((x) => el('rect', { x, y: 170, width: 30, height: 580, fill: WOOD, stroke: INK, 'stroke-width': 3 }));
  el('rect', { x: 1328, y: 30, width: 1700, height: 136, fill: WOOD3, stroke: INK, 'stroke-width': 4 });
  for (let x = 1340; x < 3028; x += 64) el('line', { x1: x, y1: 50, x2: x + 40, y2: 160, stroke: '#8E5631', 'stroke-width': 10 });
  el('rect', { x: 1328, y: 158, width: 1700, height: 28, fill: '#80502E', stroke: INK, 'stroke-width': 4 });
  const pts = [];
  for (let i = 0; i <= 26; i++) { const t = i / 26; pts.push([1360 + t * 1600, 196 + 300 * t * (1 - t)]); }
  el('polyline', { points: pts.map((p) => p.join(',')).join(' '), fill: 'none', stroke: DEEP, 'stroke-width': 2 });
  const glows = pts.slice(1, -1).map(([x, y]) => {
    el('line', { x1: x, y1: y, x2: x, y2: y + 10, stroke: DEEP, 'stroke-width': 3 });
    const glow = el('circle', { cx: x, cy: y + 18, r: 18, fill: '#FFE9A8', opacity: 0.45 });
    el('circle', { cx: x, cy: y + 18, r: 7, fill: '#FFF4CC', stroke: INK, 'stroke-width': 2 });
    return glow;
  });
  loop(gsap.to(glows, { opacity: 0.08, duration: 1.1, repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: { each: 0.15, from: 'random', repeat: -1, yoyo: true } }));
  [1640, 2380].forEach((x) => {
    el('line', { x1: x, y1: 186, x2: x, y2: 236, stroke: DEEP, 'stroke-width': 5 });
    const blades = g();
    el('ellipse', { cx: x, cy: 246, rx: 96, ry: 6, fill: '#C9CCDA', stroke: INK, 'stroke-width': 2.5 }, blades);
    el('ellipse', { cx: x, cy: 246, rx: 20, ry: 11, fill: '#9AA0B5', stroke: INK, 'stroke-width': 3 });
    loop(gsap.fromTo(blades, { scaleX: 1 }, { scaleX: -1, svgOrigin: `${x} 246`, duration: 0.32, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
  });

  // hanging ferns
  function fern(x, potY) {
    const f = g();
    el('line', { x1: x, y1: 186, x2: x, y2: potY, stroke: DEEP, 'stroke-width': 2 }, f);
    for (let i = 0; i < 11; i++) {
      const dir = i % 2 ? 1 : -1, len = r(90, 170), spread = r(20, 110) * dir;
      el('path', { d: `M${x + r(-14, 14)} ${potY + 10} q${spread} ${-10} ${spread * 1.2} ${len}`, fill: 'none', stroke: i % 3 ? G3 : G2, 'stroke-width': 11, 'stroke-linecap': 'round', 'stroke-dasharray': '2 9' }, f);
      el('path', { d: `M${x + r(-10, 10)} ${potY + 10} q${spread * 0.8} ${-6} ${spread} ${len * 0.9}`, fill: 'none', stroke: G2, 'stroke-width': 3, 'stroke-linecap': 'round' }, f);
    }
    el('path', { d: `M${x - 34} ${potY} H${x + 34} L${x + 26} ${potY + 34} H${x - 26} Z`, fill: '#EDEDE6', stroke: INK, 'stroke-width': 3 }, f);
    loop(gsap.to(f, { rotation: r(2, 3.5), svgOrigin: `${x} 186`, duration: r(2.4, 3.4), repeat: -1, yoyo: true, ease: 'sine.inOut' }));
  }
  fern(1420, 250); fern(2240, 262); fern(2560, 250);

  // potted monsteras
  function monstera(x, baseY, s = 1) {
    const m = g();
    const leaves = [[-50, -150, -30], [40, -170, 25], [-10, -210, -5], [70, -110, 50], [-80, -100, -55]];
    leaves.forEach(([dx, dy, rot]) => {
      el('line', { x1: x, y1: baseY - 50 * s, x2: x + dx * s, y2: baseY + dy * s + 40 * s, stroke: '#3F7A45', 'stroke-width': 5 }, m);
    });
    leaves.forEach(([dx, dy, rot]) => {
      const lx = x + dx * s, ly = baseY + dy * s;
      const leaf = g(m, { transform: `translate(${lx} ${ly}) rotate(${rot}) scale(${s})` });
      el('path', { d: 'M0 50C-46 40-62-6-38-36-20-58 12-56 24-40 52-20 50 30 0 50Z', fill: G1, stroke: INK, 'stroke-width': 3 }, leaf);
      el('path', { d: 'M0 46C0 10 0-20 4-42M-30-10L-6 0M-28 18L-4 22M30-8L6 2M28 18L4 24', fill: 'none', stroke: SKY, 'stroke-width': 3, 'stroke-linecap': 'round' }, leaf);
    });
    el('path', { d: `M${x - 46 * s} ${baseY - 60 * s} H${x + 46 * s} L${x + 34 * s} ${baseY} H${x - 34 * s} Z`, fill: '#C9673F', stroke: INK, 'stroke-width': 3 }, m);
    loop(gsap.to(m, { rotation: 1.4, svgOrigin: `${x} ${baseY}`, duration: r(2.8, 3.6), repeat: -1, yoyo: true, ease: 'sine.inOut' }));
  }
  monstera(1420, 772, 1);
  monstera(2245, 784, 0.9);

  // terrace tables with coffee
  function table(x, baseY) {
    const t = g();
    const chair = (cx, dir) => {
      el('path', { d: `M${cx} ${baseY} V${baseY - 54} M${cx + 44 * dir} ${baseY} V${baseY - 54} M${cx - 4 * dir} ${baseY - 56} H${cx + 48 * dir} M${cx} ${baseY - 56} V${baseY - 120}`, fill: 'none', stroke: DEEP, 'stroke-width': 7, 'stroke-linecap': 'round' }, t);
    };
    chair(x - 120, 1); chair(x + 120, -1);
    el('path', { d: `M${x - 54} ${baseY} L${x} ${baseY - 70} L${x + 54} ${baseY}`, fill: 'none', stroke: DEEP, 'stroke-width': 7, 'stroke-linecap': 'round' }, t);
    el('rect', { x: x - 84, y: baseY - 80, width: 168, height: 14, rx: 4, fill: '#2A2D45', stroke: INK, 'stroke-width': 3 }, t);
    return t;
  }
  table(2440, 872);
  const t2 = table(2830, 872);
  // latte with steam
  el('ellipse', { cx: 2410, cy: 793, rx: 30, ry: 6, fill: '#FFFFFF', stroke: INK, 'stroke-width': 3 });
  el('path', { d: 'M2394 792L2390 764H2430L2426 792Z', fill: '#FFFFFF', stroke: INK, 'stroke-width': 3 });
  el('ellipse', { cx: 2410, cy: 764, rx: 20, ry: 4, fill: '#B5733C' });
  [2402, 2418].forEach((x, i) => {
    const s = el('path', { d: `M${x} 752c-8-10 8-16 0-28`, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 4, 'stroke-linecap': 'round' });
    loop(gsap.fromTo(s, { opacity: 0, y: 6 }, { opacity: 0.95, y: -12, duration: 1.6, repeat: -1, ease: 'sine.out', delay: i * 0.7 }));
  });
  // iced matcha
  el('path', { d: 'M2466 792L2462 742H2494L2490 792Z', fill: '#9CCB72', stroke: INK, 'stroke-width': 3 });
  el('rect', { x: 2462, y: 742, width: 32, height: 18, fill: '#E6F2D6' });
  el('path', { d: 'M2462 742H2494L2490 792H2466Z', fill: 'none', stroke: INK, 'stroke-width': 3 });
  el('line', { x1: 2484, y1: 750, x2: 2496, y2: 716, stroke: INK, 'stroke-width': 4, 'stroke-linecap': 'round' });
  el('rect', { x: 2808, y: 770, width: 34, height: 22, rx: 4, fill: '#FFFFFF', stroke: INK, 'stroke-width': 3 }, t2);

  // pothos on the right fence and posts
  function vine(x, y1, y2, sway) {
    const v = g();
    el('path', { d: `M${x} ${y1} C${x + 30} ${(y1 + y2) / 2} ${x - 30} ${(y1 + y2) / 2} ${x} ${y2}`, fill: 'none', stroke: '#3F7A45', 'stroke-width': 4 }, v);
    for (let y = y1 + 20; y < y2; y += 34) {
      const dir = (y / 34) % 2 > 1 ? 1 : -1;
      el('path', { d: 'M0 0C-12-10-18 8 0 22 18 8 12-10 0 0Z', fill: (y / 34) % 3 > 1.5 ? '#9BC94F' : G3, stroke: INK, 'stroke-width': 2, transform: `translate(${x + 14 * dir} ${y}) rotate(${dir * 40}) scale(1.3)` }, v);
    }
    if (sway) loop(gsap.to(v, { rotation: 2, svgOrigin: `${x} ${y1}`, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
  }
  vine(2752, 520, 740, false); vine(2860, 520, 740, false); vine(2960, 520, 740, false);
  vine(2662, 190, 470, true); vine(1352, 190, 420, true);

  // ---------- the entrance column with 107 (between street and terrace) ----------
  el('rect', { x: 1236, y: 300, width: 92, height: 1800, fill: '#F7F7F2', ...line });
  el('rect', { x: 1226, y: 286, width: 112, height: 20, fill: '#FFFFFF', ...line, 'stroke-width': 3 });
  el('rect', { x: 1254, y: 470, width: 56, height: 34, rx: 4, fill: INK });
  const num = el('text', { x: 1282, y: 495, 'text-anchor': 'middle', 'font-family': 'Rubik Mono One, Arial Black, sans-serif', 'font-size': 20, fill: CREAM });
  num.textContent = '107';
  vine(1300, 306, 760, true);

  // ---------- cars on Calle Main Este ----------
  const cars = g(svg, { 'clip-path': 'url(#lgStreet)' });
  function car(color, dir, laneY, scale, dur, delay, kind) {
    const c = g(cars);
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
      loop(gsap.to(hub, { rotation: 360 * dir, svgOrigin: `${wx} -6`, duration: 0.5, repeat: -1, ease: 'none' }));
    });
    gsap.set(c, { y: laneY, scaleX: dir * scale, scaleY: scale, transformOrigin: '0 0' });
    const from = dir > 0 ? -1400 : 1700, to = dir > 0 ? 1700 : -1400;
    loop(gsap.fromTo(c, { x: from }, { x: to, duration: dur, delay, repeat: -1, repeatDelay: r(1, 4), ease: 'none' }));
    loop(gsap.to(c, { y: laneY - 2, duration: 0.18, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
  }
  car('#E2483D', 1, 892, 0.92, 7.5, 0.4);
  car('#F4F4F0', 1, 892, 0.92, 9, 5.2);
  car('#3C8DE0', -1, 980, 1.05, 6.5, 2.4, 'van');
  car('#F6D23A', -1, 980, 1.05, 8, 7);

  // ---------- camera ----------
  const bgBase = 1200;
  const cam = { cx: 640, cy: 520, w: 1500 };
  const keys = [
    { cx: 880, cy: 560, w: 1200, d: 0.3 },
    { cx: 1270, cy: 520, w: 1000, d: 0.22 },
    { cx: 1745, cy: 440, w: 1250, d: 0.24 },
    { cx: 2330, cy: 470, w: 1300, d: 0.24 },
  ];
  function render() {
    const box = svg.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const aspect = box.width / box.height;
    const w = cam.w * (narrowQ.matches ? 0.56 : 1);
    const h = w / aspect;
    svg.setAttribute('viewBox', `${(cam.cx - w / 2).toFixed(1)} ${(cam.cy - h / 2).toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`);
    bg.setAttribute('transform', `translate(${((cam.cx - bgBase) * 0.3).toFixed(1)} 0)`);
    clouds.setAttribute('transform', `translate(${((cam.cx - bgBase) * 0.6).toFixed(1)} 0)`);
  }

  const labelEl = document.getElementById('placeLabel');
  const hint = fig.querySelector('.place-hint');
  const stops = [
    [0, 'Calle Main Este, Ponce', 'Calle Main Este, Ponce'],
    [0.32, 'La entrada', 'The entrance'],
    [0.55, 'El foodtruck', 'The food truck'],
    [0.8, 'La terraza', 'The terrace'],
  ];
  let lastLabel = -1, progress = 0;
  function updateLabel() {
    const en = document.documentElement.lang === 'en';
    let i = 0;
    stops.forEach((s, k) => { if (progress >= s[0]) i = k; });
    const text = en ? stops[i][2] : stops[i][1];
    if (labelEl.textContent !== text) {
      labelEl.textContent = text;
      if (lastLabel !== -1 && !reduce) gsap.fromTo(labelEl.parentNode, { y: -6, opacity: 0.4 }, { y: 0, opacity: 1, duration: 0.3 });
      lastLabel = i;
    }
    if (hint) hint.classList.toggle('gone', progress > 0.06);
  }
  // the language switch rewrites labels; keep this one in sync
  new MutationObserver(updateLabel).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  const camTl = gsap.timeline({ paused: true, onUpdate: render });
  keys.forEach((k) => camTl.to(cam, { cx: k.cx, cy: k.cy, w: k.w, duration: k.d, ease: 'sine.inOut' }));

  render(); updateLabel();
  addEventListener('resize', render);
  narrowQ.addEventListener?.('change', render);

  if (reduce) { ambient.forEach((t) => t.kill()); return; }

  if (window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.create({
      trigger: fig, start: 'center center', end: () => '+=' + Math.round(innerHeight * (narrowQ.matches ? 1.1 : 1.3)),
      pin: true, scrub: 0.8, animation: camTl, invalidateOnRefresh: true,
      onUpdate: (self) => { progress = self.progress; updateLabel(); },
    });
    // layout above can still move (fonts, photos, the menu opening), so re-measure
    addEventListener('load', () => ScrollTrigger.refresh());
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    // only keep the little world moving while it's on screen
    ScrollTrigger.create({
      trigger: fig, start: 'top bottom', end: 'bottom top',
      onToggle: (self) => ambient.forEach((t) => (self.isActive ? t.resume() : t.pause())),
    });
  }
})();
