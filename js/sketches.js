// Home page scrapbook extras and pencil sketches.
//  - Hero (nothing on load or scroll): hover or tap a note:
//    a stick-figure girl (paintbrush + laptop) is doodled beside the nametag, a one-line design-loop doodle
//    (empathize → define → ideate → prototype → test → back again) appears by the sticky note,
//    and a coffee receipt prints out from under the notecard.
//  - "featured projects": an arrow sketches toward the work as it scrolls into view.
//  - Project cards: a themed doodle draws on the corner when the card scrolls in;
//    hovering a card underlines its title.
//  - About page: each painting gets a hand-doodled hanging frame when it scrolls into view.
(function () {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Pencil-grain filter: speckles the stroke like graphite on paper and adds a slight wobble.
  function ensureGraphite() {
    if (document.getElementById('graphite')) return;
    const defs = document.createElementNS(SVG_NS, 'svg');
    defs.setAttribute('width', '0');
    defs.setAttribute('height', '0');
    defs.setAttribute('aria-hidden', 'true');
    defs.style.position = 'absolute';
    defs.innerHTML = GRAPHITE_FILTER;
    document.body.append(defs);
  }
  const GRAPHITE_FILTER =
    '<filter id="graphite" x="-10%" y="-10%" width="120%" height="120%">' +
    '<feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="7" result="noise"/>' +
    '<feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.75" result="grain"/>' +
    '<feComposite in="SourceGraphic" in2="grain" operator="in" result="grainy"/>' +
    '<feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="2" result="warp"/>' +
    '<feDisplacementMap in="grainy" in2="warp" scale="1.8"/></filter>';

  // Design loop: one continuous pencil line that curls once per stage (labels alternate
  // above and below), then swoops back underneath to the start, as if drawn without lifting the pencil.
  function designLoop() {
    const words = ['empathize', 'define', 'ideate', 'prototype', 'test'];
    const B = 70;                                     // baseline
    let d = `M8 ${B} L20 ${B}`;
    const strokes = [];
    words.forEach((word, i) => {
      const cx = 35 + i * 40, s = i % 2 ? 1 : -1;     // curl above (-1) or below (+1) the line
      d += ` C${cx + 2} ${B} ${cx + 10} ${B + 14 * s} ${cx + 2} ${B + 20 * s}` +
           ` C${cx - 6} ${B + 26 * s} ${cx - 12} ${B + 14 * s} ${cx - 2} ${B + 6 * s}` +
           ` C${cx + 6} ${B} ${cx + 14} ${B} ${cx + 25} ${B}`;
    });
    strokes.push(['path', d]);
    words.forEach((word, i) => {
      const cx = 35 + i * 40, above = i % 2 === 0;
      strokes.push(['text', word, { x: cx, y: above ? 40 : 113, size: 20, anchor: 'middle' }]);
    });
    // back to the start, with an arrowhead
    strokes.push(['path', `M220 ${B} C238 110 170 134 110 132 C50 130 6 118 8 84 M3 91 L8 82 L14 90`, 'thin']);
    return strokes;
  }

  // Each doodle: viewBox + strokes, drawn one after another.
  // ['path', d, className?, fill?], ['text', words, { x, y, size, anchor?, cls? }] or ['blob', { cx, cy, r, color }]
  const DOODLES = {
    cycle: ['0 20 240 120', designLoop()],
    // nametag caption: stick-figure girl, arms up in a V with a paintbrush and a laptop,
    // pencil-shaded hair, smile and a touch of sticky-note-pink blush
    girl: ['0 0 124 130', [
      ['path', 'M47 44 C44 27 53 24 60 26 C69 23 78 29 73 44 C75 55 75 63 77 71 C73 72 70 71 68 69 C70 60 70 52 69 45 C67 37 53 36 51 45 C50 52 50 60 52 69 C50 71 46 72 43 71 C45 63 46 55 47 44 Z', null, 'rgba(95, 98, 104, 0.5)'],
      ['path', 'M51 45 C50 55 56 58 60 58 C65 58 70 55 69 45', null],
      ['path', 'M56 45 l0.4 0.6 M64 45 l0.4 0.6', 'dot'],
      ['path', 'M56.5 50 Q60 53.5 63.5 50', 'thin'],
      ['path', 'M52.2 50.5 a2.4 1.6 0 1 0 4.8 0 a2.4 1.6 0 1 0 -4.8 0 M63 50.5 a2.4 1.6 0 1 0 4.8 0 a2.4 1.6 0 1 0 -4.8 0', 'nostroke', '#ffa8f2'],
      ['path', 'M60 58 L60 66 M60 64 L47 100 L73 100 Z', null],
      ['path', 'M58 70 L36 36 M62 70 L84 36', null],
      // paintbrush: slim handle held in the fist, a metal ferrule, and a fat bristle tuft dipped in pink
      ['path', 'M36 36 m-2.6 0 a2.6 2.6 0 1 0 5.2 0 a2.6 2.6 0 1 0 -5.2 0 M25.3 28.6 L41.0 37.3 Q42.5 39.8 39.6 39.8 L24.4 30.1', null],
      ['path', 'M25.8 27.7 L21.6 25.0 L19.4 28.6 L23.8 31.0 Z M23.9 26.5 L21.8 29.9', 'thin', '#fffdf6'],
      ['path', 'M21.6 25.0 C20.8 20.5 14.5 17.4 7.4 17.6 C10.4 24.3 15.0 30.3 19.4 28.6 Z', 'thin', '#ff8ddc'],
      ['path', 'M7.9 23.6 q-2.4 3.6 0 4.8 q2.4 -1.2 0 -4.8 Z M11.9 30.6 q-1.7 2.6 0 3.5 q1.7 -0.9 0 -3.5 Z', 'nostroke', '#ff8ddc'],
      ['path', 'M78 30 L80 8 L104 6 L102 28 Z M78 30 L102 28 L110 34 L84 36 Z', null, '#fffdf6'],
      ['path', 'M54 100 L52 124 L47 125 M66 100 L68 124 L73 125', null],
      ['path', 'M20 50 l0 7 M16.5 53.5 l7 0 M114 12 l0 7 M110.5 15.5 l7 0', 'thin'],
    ]],
    arrow: ['0 0 120 90', [
      ['path', 'M6 18 C44 2 96 8 104 42 C108 58 104 70 97 80'],
      // arrowhead: two barbs set back along the curve's final direction
      ['path', 'M108.6 74.1 L97 80 L98.6 67.1'],
    ]],
    underline: ['0 0 200 12', [
      ['path', 'M2 7 C50 4 130 9 198 5'],
    ]],
    // About page: notes beside each painting (arrow points back at the painting)
    'note-still-life': ['0 0 200 80', [
      ['path', 'M26 36 C14 38 8 46 4 58 M2 49 L4 59 L12 53', 'thin'],
      ['text', 'the first painting', { x: 30, y: 30, size: 23 }],
      ['text', 'I sold!', { x: 30, y: 58, size: 23 }],
    ]],
    'note-hands-tea': ['0 0 200 100', [
      ['text', 'a childhood memory:', { x: 4, y: 26, size: 23 }],
      ['text', "my dad's", { x: 4, y: 52, size: 23 }],
      ['text', 'morning chai', { x: 4, y: 78, size: 23 }],
      ['path', 'M126 72 C150 70 170 76 186 90 M176 90 L187 91 L184 80', 'thin'],
    ]],
    'note-lipstick': ['0 0 200 80', [
      ['path', 'M26 30 C14 30 8 22 4 12 M3 22 L4 11 L12 17', 'thin'],
      ['text', 'first showcase piece', { x: 30, y: 30, size: 23 }],
      ['text', '@ Crocker Museum', { x: 30, y: 58, size: 23 }],
    ]],
    // themed corner doodles, keyed by case-study slug
    ibmCard: ['0 0 76 70', [
      ['path', 'M10 12 L64 10 L66 46 L8 48 Z'],
      ['path', 'M20 22 L27 28 L20 34'],
      ['path', 'M31 35 L42 35'],
      ['path', 'M31 48 L28 58 M43 47 L46 58 M20 59 L54 58'],
    ]],
    adobe: ['0 0 76 70', [
      ['path', 'M34 6 C36 24 40 28 58 31 C40 34 36 38 34 58 C32 38 28 34 10 31 C28 28 32 24 34 6 Z'],
      ['path', 'M60 6 C61 13 62 14 69 15 C62 16 61 17 60 24 C59 17 58 16 51 15 C58 14 59 13 60 6 Z', 'thin'],
      ['path', 'M62 48 L62 58 M57 53 L67 53', 'thin'],
    ]],
    haven: ['0 0 76 70', [
      ['path', 'M8 34 L38 8 L68 34'],
      ['path', 'M15 29 L15 62 L61 62 L61 29'],
      ['path', 'M38 54 C22 43 27 30 38 38 C49 30 54 43 38 54 Z'],
    ]],
    wopet: ['0 0 76 70', [
      ['path', 'M26 56 C22 44 50 42 50 54 C50 62 28 64 26 56 Z'],
      ['path', 'M18 40 C12 34 18 26 23 32 C27 37 23 44 18 40 Z'],
      ['path', 'M30 30 C26 22 34 16 37 24 C39 30 33 35 30 30 Z'],
      ['path', 'M44 30 C44 22 52 20 52 28 C52 34 45 36 44 30 Z'],
      ['path', 'M56 42 C56 34 64 34 63 41 C62 47 56 48 56 42 Z'],
    ]],
  };
  const CARD_DOODLE = { ibm: 'ibmCard', adobe: 'adobe', haven: 'haven', wopet: 'wopet' };

  function sketch(name, className) {
    const [viewBox, strokes] = DOODLES[name];
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', viewBox);
    svg.setAttribute('class', `sketch ${className}`);
    svg.setAttribute('aria-hidden', 'true');
    if (name === 'underline') svg.setAttribute('preserveAspectRatio', 'none');
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('filter', 'url(#graphite)');
    svg.append(g);
    let delay = 0;
    strokes.forEach(([kind, value, opt, fill]) => {
      let el;
      if (kind === 'text') {
        el = document.createElementNS(SVG_NS, 'text');
        el.textContent = value;
        el.setAttribute('x', opt.x);
        el.setAttribute('y', opt.y);
        el.setAttribute('font-size', opt.size);
        if (opt.anchor) el.setAttribute('text-anchor', opt.anchor);
        if (opt.cls) el.setAttribute('class', opt.cls);
        el.style.setProperty('--d', `${delay}s`);
        delay += opt.cls === 'center' ? 0.08 : opt.cls === 'label' ? 0.3 : value.length < 3 ? 0.15 : 0.6;
      } else if (kind === 'blob') {
        // soft coloured-pencil disc that pops in
        el = document.createElementNS(SVG_NS, 'circle');
        el.setAttribute('cx', value.cx);
        el.setAttribute('cy', value.cy);
        el.setAttribute('r', value.r);
        el.setAttribute('class', 'blob');
        el.style.fill = value.color;
        el.style.setProperty('--d', `${delay}s`);
        delay += 0.1;
      } else {
        el = document.createElementNS(SVG_NS, 'path');
        el.setAttribute('d', value);
        el.setAttribute('pathLength', '1');
        if (opt) el.setAttribute('class', opt);
        if (fill) { el.classList.add('filled'); el.style.fill = fill; }
        el.style.setProperty('--d', `${delay}s`);
        delay += 0.18;
      }
      g.append(el);
    });
    return svg;
  }


  // ---------- Doodled picture frames (About page paintings) ----------
  // The painting photos are pre-rotated on transparent canvases, so each frame is drawn
  // around the painting's real rectangle: size as a fraction of image width, tilt in degrees,
  // centre as a fraction of the image box (measured from the images' alpha channel).
  const PAINTINGS = {
    'still-life': { w: 0.877, h: 0.697, rot: -9.54, cx: 0.499, cy: 0.489 },
    'hands-tea':  { w: 0.766, h: 0.761, rot: -20.24, cx: 0.5, cy: 0.491 },
    'lipstick':   { w: 0.854, h: 1.088, rot: 7.42, cx: 0.497, cy: 0.492 },
  };

  // tiny seeded random so each frame wobbles the same way on every visit
  function rng(seed) {
    return () => ((seed = (seed * 16807) % 2147483647) / 2147483647) - 0.5;
  }

  function frameStrokes(style, x, y, w, h, rand) {
    const f = (n) => n.toFixed(1);
    const line = (x1, y1, x2, y2) =>
      `M${f(x1)} ${f(y1)} Q${f((x1 + x2) / 2 + rand() * 2)} ${f((y1 + y2) / 2 + rand() * 2)} ${f(x2)} ${f(y2)}`;
    const rect = (o) =>
      line(x - o, y - o, x + w + o, y - o) + ' ' + line(x + w + o, y - o, x + w + o, y + h + o) + ' ' +
      line(x + w + o, y + h + o, x - o, y + h + o) + ' ' + line(x - o, y + h + o, x - o, y - o);

    const out = style === 'scallop' ? 12 : style === 'ornate' || style === 'hearts' ? 18 : 16;
    const strokes = [];
    if (style !== 'hearts') {
      // nail + string (the painting frames hang, like the reference sheet)
      const nx = x + w / 2, ny = y - out - Math.min(34, h * 0.18);
      strokes.push(['path', `M${f(nx - 3)} ${f(ny)} a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0 M${f(nx)} ${f(ny)} l0.4 0.4`, 'thin']);
      strokes.push(['path', line(nx, ny + 3, x + w * 0.22, y - out) + ' ' + line(nx, ny + 3, x + w * 0.78, y - out), 'thin']);
    }

    if (style === 'hearts') {
      // double-line frame with a little heart on each corner
      strokes.push(['path', rect(8)]);
      strokes.push(['path', rect(out), 'thin']);
      const heart = (cx, cy) =>
        `M${f(cx)} ${f(cy + 10)} C${f(cx - 15)} ${f(cy)} ${f(cx - 11)} ${f(cy - 14)} ${f(cx)} ${f(cy - 6)} ` +
        `C${f(cx + 11)} ${f(cy - 14)} ${f(cx + 15)} ${f(cy)} ${f(cx)} ${f(cy + 10)} Z`;
      strokes.push(['path', [heart(x - out, y - out), heart(x + w + out, y - out),
        heart(x + w + out, y + h + out), heart(x - out, y + h + out)].join(' ')]);
    } else if (style === 'bevel') {
      strokes.push(['path', rect(out)]);
      strokes.push(['path', rect(4)]);
      strokes.push(['path',
        line(x - out, y - out, x - 4, y - 4) + ' ' + line(x + w + out, y - out, x + w + 4, y - 4) + ' ' +
        line(x + w + out, y + h + out, x + w + 4, y + h + 4) + ' ' + line(x - out, y + h + out, x - 4, y + h + 4), 'thin']);
    } else if (style === 'scallop') {
      strokes.push(['path', rect(4)]);
      strokes.push(['path', rect(out), 'thin']);
      // bumps all the way round, traced clockwise so every arc bulges outward
      const o = out, corners = [[x - o, y - o], [x + w + o, y - o], [x + w + o, y + h + o], [x - o, y + h + o]];
      let d = `M${f(corners[0][0])} ${f(corners[0][1])}`;
      for (let i = 0; i < 4; i++) {
        const [ax, ay] = corners[i], [bx, by] = corners[(i + 1) % 4];
        const len = Math.hypot(bx - ax, by - ay), n = Math.max(3, Math.round(len / 13)), r = len / n / 2;
        for (let k = 1; k <= n; k++) {
          d += ` A${f(r)} ${f(r)} 0 0 1 ${f(ax + (bx - ax) * k / n)} ${f(ay + (by - ay) * k / n)}`;
        }
      }
      strokes.push(['path', d]);
    } else {
      strokes.push(['path', rect(out)]);
      strokes.push(['path', rect(5)]);
      // rope-like ticks across the band
      let t = '';
      const tick = (px, py, dx, dy) => { t += ` M${f(px)} ${f(py)} l${f(dx)} ${f(dy)}`; };
      for (let px = x + 4; px < x + w - 4; px += 7) { tick(px, y - 14, 0, 6); tick(px, y + h + 8, 0, 6); }
      for (let py = y + 4; py < y + h - 4; py += 7) { tick(x - 14, py, 6, 0); tick(x + w + 8, py, 6, 0); }
      strokes.push(['path', t.trim(), 'thin']);
      // little leaves in each corner
      const leaf = (cx, cy, sx, sy) =>
        `M${f(cx)} ${f(cy)} q${f(sx * 9)} ${f(sy * -1)} ${f(sx * 11)} ${f(sy * 11)} q${f(sx * -10)} ${f(sy * -1)} ${f(sx * -11)} ${f(sy * -11)} ` +
        `M${f(cx + sx * 2)} ${f(cy + sy * 2)} l${f(sx * 7)} ${f(sy * 7)}`;
      strokes.push(['path', [
        leaf(x - 16, y - 16, 1, 1), leaf(x + w + 16, y - 16, -1, 1),
        leaf(x + w + 16, y + h + 16, -1, -1), leaf(x - 16, y + h + 16, 1, -1)].join(' '), 'thin']);
    }
    return strokes;
  }

  function frameArt(fig) {
    const img = fig.querySelector('img');
    const key = (img.getAttribute('src') || '').replace(/^.*\/|\.\w+$/g, '');
    const spec = PAINTINGS[key];
    if (!spec) return;
    // The paintings lazy-load, so the frame may only be buildable after the painting has already
    // scrolled into view. Remember that it should be drawn and apply it whenever it gets built.
    let svg = null, wantDrawn = false;
    const build = () => {
      const bw = img.offsetWidth, bh = img.offsetHeight;
      if (!bw || !bh) return;
      const w = spec.w * bw, h = spec.h * bw;
      const x = spec.cx * bw - w / 2, y = spec.cy * bh - h / 2;
      const name = `frame-${key}`;
      DOODLES[name] = [`0 0 ${bw} ${bh}`, frameStrokes(fig.dataset.frame, x, y, w, h, rng(key.length * 977))];
      const next = sketch(name, 'sketch-frame');
      next.querySelector('g').setAttribute('transform', `rotate(${spec.rot} ${f1(spec.cx * bw)} ${f1(spec.cy * bh)})`);
      next.style.width = `${bw}px`;
      next.style.height = `${bh}px`;
      const wasDrawn = !!svg && svg.classList.contains('drawn');
      if (svg) svg.replaceWith(next); else fig.append(next);
      svg = next;
      if (wasDrawn) {
        svg.classList.add('drawn');                  // a resize rebuild: stay drawn, no replay
      } else if (wantDrawn) {
        // built after it was already due: paint it undrawn first, then animate whichever frame is current
        requestAnimationFrame(() => requestAnimationFrame(() => svg.classList.add('drawn')));
      }
    };
    const f1 = (n) => n.toFixed(1);
    if (img.complete) build(); else img.addEventListener('load', build, { once: true });
    if ('ResizeObserver' in window) new ResizeObserver(build).observe(img);
    onScrollIn(fig, () => setTimeout(() => { wantDrawn = true; if (svg) svg.classList.add('drawn'); }, 200), 0.15);

    // handwritten note beside the painting, written as its frame finishes drawing
    if (DOODLES[`note-${key}`]) {
      const note = sketch(`note-${key}`, `sketch-art-note art-note-${key}`);
      fig.parentElement.append(note);
      onScrollIn(fig, () => setTimeout(() => note.classList.add('drawn'), 900), 0.15);
    }
  }

  // About hero: heart-cornered frame doodled around the headshot. The photo clips its own
  // overflow, so the frame is a sibling on the board, sized and placed to match the photo.
  function framePhoto(photo) {
    const board = photo.parentElement;
    let svg = null, wantDrawn = false;
    const build = () => {
      const w = photo.offsetWidth, h = photo.offsetHeight;
      if (!w || !h) return;
      const pad = 36;
      DOODLES['frame-photo'] = [`${-pad} ${-pad} ${w + pad * 2} ${h + pad * 2}`, frameStrokes('hearts', 0, 0, w, h, rng(4242))];
      const next = sketch('frame-photo', 'sketch-photo-frame');
      Object.assign(next.style, {
        left: `${photo.offsetLeft - pad}px`, top: `${photo.offsetTop - pad}px`,
        width: `${w + pad * 2}px`, height: `${h + pad * 2}px`,
      });
      const wasDrawn = !!svg && svg.classList.contains('drawn');
      if (svg) svg.replaceWith(next); else board.append(next);
      svg = next;
      if (wasDrawn) svg.classList.add('drawn');
      else if (wantDrawn) requestAnimationFrame(() => requestAnimationFrame(() => svg.classList.add('drawn')));
    };
    build();
    if ('ResizeObserver' in window) new ResizeObserver(build).observe(photo);
    const drawFrame = () => setTimeout(() => { wantDrawn = true; if (svg) svg.classList.add('drawn'); }, 300);
    // arriving from home, wait for the notes to finish moving aside (js/page-transition.js)
    onScrollIn(photo, () => {
      if (document.documentElement.classList.contains('vt-running')) {
        addEventListener('pk:transition-done', drawFrame, { once: true });
      } else drawFrame();
    }, 0.3);
  }

  // About page secret: five iced matchas drawn in coloured pencil, hidden under looping pencil
  // scribbles that spell SHHHH!. Hover (or tap) and the scribbles erase themselves, the drinks come
  // into focus and "... i might like matcha more" is written underneath.
  const DRINKS_W = 560, DRINKS_H = 210;
  // layers top→bottom as [until, colour]; lid: 'flat' | 'dome' | 'spout'
  const DRINKS = [
    { layers: [[0.46, '#8db766'], [0.56, '#dfe8c7'], [1, '#f2a6b9']], straw: '#d9dde2', lid: 'flat', tilt: -4 },
    { layers: [[0.6, '#6f9f4c'], [1, '#9db0e6']], straw: '#e4e7ea', lid: 'flat', lidTint: '#c6dc7a', sticker: true, tilt: 3 },
    { layers: [[0.55, '#93bd63'], [1, '#efe5c6']], straw: '#b99a6a', lid: 'flat', tilt: -2 },
    { layers: [[0.3, '#f6c3d1'], [0.8, '#a4c46f'], [0.93, '#f5efe7'], [1, '#b3496b']], straw: null, lid: 'spout', tilt: 4 },
    { layers: [[0.42, '#efc8cf'], [1, '#79ab52']], straw: '#e8eaec', lid: 'dome', flakes: true, label: true, tilt: -3 },
  ];

  function drawDrinks() {
    const f = (n) => n.toFixed(1);
    const top = 58, bot = 196, topW = 74, botW = 56;
    let defs = '<pattern id="pencil-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">' +
      '<line x1="0" y1="0" x2="0" y2="5" stroke="rgba(255,255,255,0.4)" stroke-width="1.6"/></pattern>';
    let body = '';
    DRINKS.forEach((d, i) => {
      const cx = 56 + i * 112;
      const cup = `M${cx - topW / 2} ${top} L${cx + topW / 2} ${top} L${cx + botW / 2} ${bot} Q${cx} ${bot + 5} ${cx - botW / 2} ${bot} Z`;
      defs += `<clipPath id="cup-${i}"><path d="${cup}"/></clipPath>`;
      let g = `<g transform="rotate(${d.tilt} ${cx} ${bot})">`;
      // straw behind the lid
      if (d.straw) g += `<path d="M${cx + 8} ${top + 60} L${cx + 22} ${top - 46}" stroke="${d.straw}" stroke-width="5" stroke-linecap="round"/>` +
        `<path class="ink" d="M${cx + 5.6} ${top + 60} L${cx + 19.6} ${top - 46} L${cx + 24.4} ${top - 46.6} L${cx + 10.4} ${top + 60}"/>`;
      // drink layers, pencil-hatched, clipped to the cup
      let y = top + 6, fill = '';
      d.layers.forEach(([until, col]) => {
        const y2 = top + 6 + (bot - top - 6) * until;
        fill += `<rect x="${cx - 50}" y="${f(y)}" width="100" height="${f(y2 - y + 1)}" fill="${col}"/>`;
        y = y2;
      });
      fill += `<rect x="${cx - 50}" y="${top}" width="100" height="${bot - top + 6}" fill="url(#pencil-hatch)"/>`;
      if (d.flakes) for (let k = 0; k < 9; k++) fill += `<circle cx="${f(cx - 16 + ((k * 37) % 32))}" cy="${f(top + 10 + ((k * 13) % 9))}" r="1.9" fill="#d2463f"/>`;
      g += `<g clip-path="url(#cup-${i})">${fill}</g>`;
      if (d.sticker) g += `<circle cx="${cx}" cy="${top + 70}" r="17" fill="#f3e3c2"/>` +
        `<path d="M${cx} ${top + 70} m0 -8 a4 4 0 1 1 0.1 0 M${cx} ${top + 70} m8 0 a4 4 0 1 1 0 0.1 M${cx} ${top + 70} m0 8 a4 4 0 1 1 -0.1 0 M${cx} ${top + 70} m-8 0 a4 4 0 1 1 0 -0.1" fill="#3f7d4f"/>`;
      if (d.label) g += `<rect x="${cx - 13}" y="${top + 84}" width="26" height="28" fill="#2f5d45"/>` +
        `<path d="M${cx - 6} ${top + 92} h10 M${cx - 6} ${top + 98} h8 M${cx - 6} ${top + 104} h10" stroke="#e7efe6" stroke-width="1.4"/>`;
      g += `<path class="ink" d="${cup}"/>`;
      // lid
      if (d.lid === 'dome') g += `<path d="M${cx - 40} ${top} Q${cx} ${top - 34} ${cx + 40} ${top} Z" fill="rgba(240,244,246,0.75)"/><path class="ink" d="M${cx - 40} ${top} Q${cx} ${top - 34} ${cx + 40} ${top} M${cx - 41} ${top} H${cx + 41}"/>`;
      else if (d.lid === 'spout') g += `<path d="M${cx - 39} ${top} C${cx - 36} ${top - 18} ${cx + 36} ${top - 18} ${cx + 39} ${top} Z" fill="rgba(244,238,240,0.85)"/><rect x="${cx - 10}" y="${top - 22}" width="20" height="9" rx="2" fill="#f0609b"/><path class="ink" d="M${cx - 39} ${top} C${cx - 36} ${top - 18} ${cx + 36} ${top - 18} ${cx + 39} ${top} M${cx - 10} ${top - 13} v-9 h20 v9"/>`;
      else g += `<rect x="${cx - 41}" y="${top - 7}" width="82" height="9" rx="3" fill="${d.lidTint || 'rgba(235,240,242,0.8)'}"/><path class="ink" d="M${cx - 41} ${top + 2} v-6 q0 -3 3 -3 h76 q3 0 3 3 v6 Z"/>`;
      body += g + '</g>';
    });
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${DRINKS_W} ${DRINKS_H}`);
    svg.setAttribute('class', 'drinks-art');
    svg.innerHTML = `<defs>${defs}</defs><g filter="url(#graphite)">${body}</g>`;
    return svg;
  }

  // "SHHHH!" written as a chain of little pencil loops that follow each letter's strokes
  const GLYPHS = {
    S: [[[58, 20], [40, 4], [16, 10], [10, 36], [32, 58], [56, 76], [58, 108], [36, 128], [8, 116]]],
    H: [[[8, 4], [8, 128]], [[58, 4], [58, 128]], [[8, 66], [58, 66]]],
    '!': [[[24, 4], [24, 90]], [[24, 116], [24, 122]]],
  };
  function loopScribble(points, ox, oy, r) {
    const pts = [];
    for (let i = 0; i < points.length - 1; i++) {
      const [x1, y1] = points[i], [x2, y2] = points[i + 1];
      const n = Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1) / 1.7));
      for (let k = 0; k < n; k++) pts.push([x1 + ((x2 - x1) * k) / n, y1 + ((y2 - y1) * k) / n]);
    }
    pts.push(points[points.length - 1]);
    let a = 0, d = '';
    pts.forEach(([x, y], i) => {
      a += 0.72;
      const px = ox + x + Math.cos(a) * r, py = oy + y + Math.sin(a) * r * 0.85;
      d += `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)} `;
    });
    return d;
  }
  function drawShh() {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${DRINKS_W} ${DRINKS_H}`);
    svg.setAttribute('class', 'sketch shh-art');
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('filter', 'url(#graphite)');
    svg.append(g);
    let i = 0;
    [...'SHHHH!'].forEach((ch, n) => {
      GLYPHS[ch].forEach((stroke) => {
        const p = document.createElementNS(SVG_NS, 'path');
        p.setAttribute('d', loopScribble(stroke, 14 + n * 90 - (ch === '!' ? 4 : 0), 34, 6.5));
        p.setAttribute('pathLength', '1');
        p.style.setProperty('--d', `${(i++ * 0.12).toFixed(2)}s`);
        g.append(p);
      });
    });
    return svg;
  }

  function matchaSecret(btn) {
    btn.querySelector('.matcha-drinks').append(drawDrinks());
    const shh = drawShh();
    btn.querySelector('.matcha-shh').append(shh);
    onScrollIn(btn, () => setTimeout(() => draw(shh, true), 200), 0.4);
    const reveal = () => {
      if (btn.classList.contains('revealed')) return;
      // erase in reverse, last loop first
      const paths = [...shh.querySelectorAll('path')].reverse();
      paths.forEach((p, k) => p.style.setProperty('--d', `${(k * 0.06).toFixed(2)}s`));
      draw(shh, false);
      btn.classList.add('revealed');
      btn.setAttribute('aria-expanded', 'true');
    };
    if (canHover) btn.addEventListener('mouseenter', reveal);
    btn.addEventListener('click', reveal);
  }

  const draw = (el, on) => el.classList.toggle('drawn', on);

  function onScrollIn(target, cb, threshold = 0.4) {
    if (!('IntersectionObserver' in window)) return cb();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { cb(); io.disconnect(); }
      });
    }, { threshold });
    io.observe(target);
  }

  // ---------- Hero: IBM note, design-loop doodle, printed receipt ----------

  function receiptHTML() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const date = `${pad(now.getMonth() + 1)}/${pad(now.getDate())}/${String(now.getFullYear()).slice(2)}`;
    const row = (l, r) => `<div class="r-row"><span>${l}</span><span>${r}</span></div>`;
    // pencil doodle of a cockapoo in side profile (facing right) at the top of the receipt
    const dog = `
      <svg class="r-dog" viewBox="0 0 80 50" aria-hidden="true"><g filter="url(#graphite)">
        <path d="M14 31 q-5 -6 1 -9 q2 -5 8 -4 q4 -4 9 -1 q5 -3 9 0 q6 -2 8 3 q4 1 4 5"/>
        <path d="M15 32 q-1 4 4 4 q6 2 11 0 q6 2 11 0 q5 1 8 -2"/>
        <path d="M20 36 q-1 5 -1 8 q-1 2 3 1 M27 37 l0 7 q0 2 3 1 M41 37 l1 7 q0 2 3 1 M47 35 l2 8 q0 2 3 1"/>
        <path d="M13 26 q-7 -3 -6 -11 q4 1 3 5 q4 1 2 6"/>
        <path d="M50 24 q-3 -7 3 -10 q2 -6 9 -5 q6 -1 8 5 q4 3 1 8 q-2 3 -6 3"/>
        <path d="M68 17 q5 -1 8 3 q0 4 -6 4 q-3 0 -5 -2"/>
        <path d="M75 19.5 l0.6 0.4 M63 14.5 l0.6 0.4"/>
        <path d="M55 13 q-6 3 -5 11 q1 6 5 6 q3 -3 1 -8 q2 -4 -1 -9"/>
      </g></svg>`;
    return `
      ${dog}
      <div class="r-head">THE DOODLE CAFE</div>
      ${row('#0826', date)}
      <div class="r-rule"></div>
      ${row('ICED LATTE', '5.25')}
      ${row('+ honey', '0.75')}
      <div class="r-rule"></div>
      ${row('<b>TOTAL</b>', '<b>6.00</b>')}
      <div class="r-barcode"></div>`;
  }

  function heroExtras(board) {
    // 1. "prev. UX @ IBM" written beside the nametag
    const ibm = sketch('girl', 'sketch-girl');
    board.append(ibm);

    // 2. Design-cycle doodle beside the sticky note
    const cycle = sketch('cycle', 'sketch-cycle');
    board.append(cycle);
    board.classList.add('has-cycle');

    // 3. Coffee receipt printed out from under the notecard
    const card = board.querySelector('.note-blurb');
    const slot = document.createElement('div');
    slot.className = 'receipt-slot';
    slot.setAttribute('aria-hidden', 'true');
    slot.innerHTML = `<div class="receipt">${receiptHTML()}</div>`;
    if (card) card.append(slot);

    const items = [
      { note: board.querySelector('.note-name'), reveal: () => ibm.classList.add('drawn') },
      { note: board.querySelector('.note-empathy'), reveal: () => cycle.classList.add('drawn') },
      { note: card, reveal: () => slot.classList.add('printing') },
    ].filter((i) => i.note);

    // Nothing appears on load or on scroll: each extra is revealed (and then kept) only when its
    // note is hovered, or tapped on a touch screen.
    items.forEach((item) => {
      let shown = false;
      const reveal = () => { if (!shown) { shown = true; item.reveal(); } };
      item.note.addEventListener('mouseenter', reveal);
      item.note.addEventListener('pointerdown', reveal, { passive: true });
    });
  }

  function init() {
    ensureGraphite();
    // Hero scrapbook extras (home page board only; About uses a different board)
    const board = document.querySelector('.sticky-board:not(.has-photo)');
    if (board) heroExtras(board);

    // About page: doodled frames around each painting
    document.querySelectorAll('.about-collage .art').forEach(frameArt);
    const secret = document.querySelector('.matcha-secret');
    if (secret) matchaSecret(secret);
    const photo = document.querySelector('.sticky-board.has-photo .note-photo');
    if (photo) framePhoto(photo);

    // Arrow from "featured projects" down to the work (home page only)
    const tag = document.querySelector('.projects') && document.querySelector('.featured-tag');
    if (tag) {
      const arrow = sketch('arrow', 'sketch-arrow');
      tag.append(arrow);
      onScrollIn(tag, () => setTimeout(() => draw(arrow, true), 150), 1);
    }

    // Project cards: corner doodle on scroll, title underline on hover
    document.querySelectorAll('.project-card').forEach((card) => {
      const slug = (card.getAttribute('href') || '').replace(/^.*\/|\.html$/g, '');
      if (CARD_DOODLE[slug]) {
        const corner = sketch(CARD_DOODLE[slug], 'sketch-corner');
        card.append(corner);
        onScrollIn(card, () => setTimeout(() => draw(corner, true), 350), 0.35);
      }
      const title = card.querySelector('.meta h3');
      if (title && canHover) {
        const line = sketch('underline', 'sketch-underline');
        title.append(line);
        card.addEventListener('mouseenter', () => draw(line, true));
        card.addEventListener('mouseleave', () => draw(line, false));
        card.addEventListener('focus', () => draw(line, true));
        card.addEventListener('blur', () => draw(line, false));
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
