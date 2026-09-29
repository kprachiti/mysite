// Home page sketches that draw themselves in pencil.
//  - Hero: hover a sticky note (or scroll it into view on touch) and a note sketches itself beside it:
//    "prev. UX @ IBM" by the nametag, an EDIPT design cycle by the sticky note, an iced coffee by the card.
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

  // Hand-drawn circle that overshoots its start a little, like a real pencil loop
  function loop(cx, cy, r) {
    const f = (n) => n.toFixed(1);
    return `M${f(cx - r)} ${f(cy + 1)} C${f(cx - r)} ${f(cy - r * 0.8)} ${f(cx + r * 0.8)} ${f(cy - r * 1.1)} ${f(cx + r)} ${f(cy - 1)} ` +
      `C${f(cx + r * 1.1)} ${f(cy + r * 0.8)} ${f(cx - r * 0.2)} ${f(cy + r * 1.1)} ${f(cx - r * 0.85)} ${f(cy + r * 0.6)} ` +
      `C${f(cx - r * 1.05)} ${f(cy + r * 0.3)} ${f(cx - r * 1.05)} ${f(cy - r * 0.1)} ${f(cx - r * 0.85)} ${f(cy - r * 0.35)}`;
  }

  // Stanford d.school cycle: Empathize → Define → Ideate → Prototype → Test
  function edipt() {
    const C = 60, R = 40, r = 12, strokes = [];
    const pt = (deg, rad = R) => [C + rad * Math.cos(deg * Math.PI / 180), C + rad * Math.sin(deg * Math.PI / 180)];
    const f = (n) => n.toFixed(1);
    'EDIPT'.split('').forEach((letter, i) => {
      const a = -90 + i * 72;
      const [x, y] = pt(a);
      strokes.push(['path', loop(x, y, r)]);
      strokes.push(['text', letter, { x: f(x), y: f(y + 1), size: 17, cls: 'center' }]);
      // arc to the next stage with an arrowhead
      const a1 = a + 22, a2 = a + 72 - 22;
      const [x1, y1] = pt(a1), [x2, y2] = pt(a2);
      const t = [-Math.sin(a2 * Math.PI / 180), Math.cos(a2 * Math.PI / 180)];   // clockwise tangent
      const n = [Math.cos(a2 * Math.PI / 180), Math.sin(a2 * Math.PI / 180)];
      const h1 = [x2 - 6 * t[0] + 3.5 * n[0], y2 - 6 * t[1] + 3.5 * n[1]];
      const h2 = [x2 - 6 * t[0] - 3.5 * n[0], y2 - 6 * t[1] - 3.5 * n[1]];
      strokes.push(['path', `M${f(x1)} ${f(y1)} A${R} ${R} 0 0 1 ${f(x2)} ${f(y2)} M${f(h1[0])} ${f(h1[1])} L${f(x2)} ${f(y2)} L${f(h2[0])} ${f(h2[1])}`, 'thin']);
    });
    return strokes;
  }

  // Each doodle: viewBox + strokes, drawn one after another.
  // ['path', d, className?] or ['text', words, { x, y, size, cls? }]
  const DOODLES = {
    ibm: ['0 0 240 60', [
      ['text', 'prev. UX @ IBM', { x: 6, y: 34, size: 32 }],
      ['path', 'M8 46 C60 41 120 49 178 43', 'thin'],
    ]],
    edipt: ['0 0 120 120', edipt()],
    iced: ['0 0 140 110', [
      ['path', 'M9 32 L15 102 Q30 106 45 102 L51 32'],          // cup
      ['path', 'M5 32 L55 32 M10 31 C12 15 48 15 50 31'],       // lid rim + dome
      ['path', 'M33 17 L43 2 L50 4'],                           // straw
      ['path', 'M12 54 C22 49 37 58 48 52', 'thin'],            // coffee line
      ['path', 'M19 64 L29 61 L32 71 L22 74 Z M32 78 L41 76 L43 85 L34 87 Z', 'thin'],   // ice
      ['path', 'M5 60 C3 65 8 66 7 61 M6 76 C4 80 8 81 7 77', 'thin'],                   // condensation
      ['text', '+ honey', { x: 64, y: 70, size: 26 }],
    ]],
    arrow: ['0 0 120 90', [
      ['path', 'M6 14 C40 2 92 10 100 44 C104 60 98 72 90 82'],
      ['path', 'M76 72 L90 83 L97 66'],
    ]],
    underline: ['0 0 200 12', [
      ['path', 'M2 7 C40 3 80 10 120 6 S180 3 198 7'],
      ['path', 'M186 9 C140 12 90 8 26 11', 'thin'],
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
    strokes.forEach(([kind, value, opt]) => {
      let el;
      if (kind === 'text') {
        el = document.createElementNS(SVG_NS, 'text');
        el.textContent = value;
        el.setAttribute('x', opt.x);
        el.setAttribute('y', opt.y);
        el.setAttribute('font-size', opt.size);
        if (opt.cls) el.setAttribute('class', opt.cls);
        el.style.setProperty('--d', `${delay}s`);
        delay += opt.cls ? 0.08 : 0.6;
      } else {
        el = document.createElementNS(SVG_NS, 'path');
        el.setAttribute('d', value);
        el.setAttribute('pathLength', '1');
        if (opt) el.setAttribute('class', opt);
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

    const out = style === 'scallop' ? 12 : style === 'ornate' ? 18 : 16;
    // nail + string (the frames hang, like the reference sheet)
    const nx = x + w / 2, ny = y - out - Math.min(34, h * 0.18);
    const strokes = [
      ['path', `M${f(nx - 3)} ${f(ny)} a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0 M${f(nx)} ${f(ny)} l0.4 0.4`, 'thin'],
      ['path', line(nx, ny + 3, x + w * 0.22, y - out) + ' ' + line(nx, ny + 3, x + w * 0.78, y - out), 'thin'],
    ];

    if (style === 'bevel') {
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
    let svg = null;
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
      if (svg) {
        if (svg.classList.contains('drawn')) next.classList.add('drawn');
        svg.replaceWith(next);
      } else {
        fig.append(next);
      }
      svg = next;
    };
    const f1 = (n) => n.toFixed(1);
    if (img.complete) build(); else img.addEventListener('load', build, { once: true });
    if ('ResizeObserver' in window) new ResizeObserver(build).observe(img);
    onScrollIn(fig, () => setTimeout(() => svg && svg.classList.add('drawn'), 200), 0.3);
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

  function init() {
    ensureGraphite();
    // Hero sticky notes
    // hero sketches are laid out for the home page board (About uses a different board)
    const board = document.querySelector('.sticky-board:not(.has-photo)');
    if (board) {
      const pairs = [
        ['.note-name', sketch('ibm', 'sketch-ibm')],
        ['.note-empathy', sketch('edipt', 'sketch-edipt')],
        ['.note-blurb', sketch('iced', 'sketch-iced')],
      ];
      pairs.forEach(([sel, svg]) => {
        const note = board.querySelector(sel);
        if (!note) return;
        board.append(svg);
        if (canHover) {
          note.addEventListener('mouseenter', () => draw(svg, true));
        }
      });
      if (!canHover) {
        onScrollIn(board, () => pairs.forEach(([, svg]) => draw(svg, true)), 0.5);
      }
    }

    // About page: doodled frames around each painting
    document.querySelectorAll('.about-collage .art').forEach(frameArt);

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
