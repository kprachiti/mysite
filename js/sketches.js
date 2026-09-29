// Home page scrapbook extras and pencil sketches.
//  - Hero (nothing on load or scroll): hover or tap a note:
//    a stick-figure girl (paintbrush + laptop) is doodled beside the nametag, a one-line design-loop doodle
//    (empathize → define → ideate → prototype → test → back again) appears by the sticky note,
//    and a coffee receipt prints out from under the notecard.
//  - "featured projects": an arrow sketches toward the work as it scrolls into view.
//  - Project cards: a themed doodle draws on the corner when the card scrolls in; hovering
//    sketches white-pencil doodles (hatching, stippling, spirals...) over the blurred thumbnail and
//    underlines its title.
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
      ['path', 'M36 36 m-2.6 0 a2.6 2.6 0 1 0 5.2 0 a2.6 2.6 0 1 0 -5.2 0 M41.5 37.4 L17 22.9 L15.9 24.9 L40.4 39.4 Z M16.4 23.9 L12 21.5', null],
      ['path', 'M13 19.8 C10 18.5 6.5 17.5 4.2 17 C6 18.8 8.8 21.6 11 23.2 Z', 'thin', '#ffa8f2'],
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

  // White-pencil doodles over a project thumbnail's hover blur. Each card mixes a few
  // drawing techniques (cross-hatching, stippling, spirals, little sketches...) in the space
  // to either side of the "See case study" pill. Coordinates are in the thumbnail's 1151x302 box.
  const THUMB_W = 1151, THUMB_H = 302;
  const f1 = (n) => n.toFixed(1);

  const TECHNIQUES = {
    // two layers of diagonal hatching clipped to a loose ellipse
    crosshatch(r, cx, cy, rx, ry) {
      const layer = (angle, gap) => {
        let d = '';
        const ca = Math.cos(angle), sa = Math.sin(angle);
        for (let t = -Math.max(rx, ry); t <= Math.max(rx, ry); t += gap) {
          // line: points p = c + t*n + s*dir, clip to the ellipse
          const nx = -sa, ny = ca;
          const px = t * nx, py = t * ny;
          const A = (ca * ca) / (rx * rx) + (sa * sa) / (ry * ry);
          const B = 2 * ((px * ca) / (rx * rx) + (py * sa) / (ry * ry));
          const C = (px * px) / (rx * rx) + (py * py) / (ry * ry) - 1;
          const disc = B * B - 4 * A * C;
          if (disc <= 0) continue;
          const s1 = (-B - Math.sqrt(disc)) / (2 * A), s2 = (-B + Math.sqrt(disc)) / (2 * A);
          const j = () => r() * 6;
          d += `M${f1(cx + px + s1 * ca + j())} ${f1(cy + py + s1 * sa + j())} L${f1(cx + px + s2 * ca + j())} ${f1(cy + py + s2 * sa + j())} `;
        }
        return d;
      };
      return [['', layer(-0.8, 11)], ['', layer(0.75, 13)]];
    },
    // stippled cloud: denser toward the middle
    stipple(r, cx, cy, rad, n = 150) {
      let d = '';
      for (let i = 0; i < n; i++) {
        const a = (r() + 0.5) * Math.PI * 2;
        const dist = Math.pow(r() + 0.5, 1.6) * rad;
        const x = cx + Math.cos(a) * dist * 1.5, y = cy + Math.sin(a) * dist;
        d += `M${f1(x)} ${f1(y)} l0.4 0.3 `;
      }
      return [['dot', d]];
    },
    spiral(r, cx, cy, rad, turns = 4) {
      let d = `M${cx} ${cy}`;
      const steps = turns * 28;
      for (let i = 1; i <= steps; i++) {
        const a = (i / 28) * Math.PI * 2;
        const rr = (i / steps) * rad + r() * 2.5;
        d += ` L${f1(cx + Math.cos(a) * rr)} ${f1(cy + Math.sin(a) * rr)}`;
      }
      return [['', d]];
    },
    // loose concentric rings, like circling an idea over and over
    rings(r, cx, cy, rad) {
      return [0.45, 0.72, 1].map((k) => {
        let d = '';
        const start = r() * 6;
        for (let i = 0; i <= 40; i++) {
          const a = start + (i / 36) * Math.PI * 2;
          const rr = rad * k + r() * 5;
          d += `${i ? 'L' : 'M'}${f1(cx + Math.cos(a) * rr)} ${f1(cy + Math.sin(a) * rr * 0.9)} `;
        }
        return ['thin', d];
      });
    },
    // stacked wavy contour lines
    waves(r, x, y, w, rows = 5) {
      return Array.from({ length: rows }, (_, row) => {
        let d = `M${x} ${y + row * 16}`;
        for (let sx = 0; sx <= w; sx += 14) {
          d += ` L${f1(x + sx)} ${f1(y + row * 16 + Math.sin(sx / 18 + row) * 7 + r() * 2)}`;
        }
        return ['thin', d];
      });
    },
    // back-and-forth zigzag shading
    zigzag(r, x, y, w, h) {
      let d = `M${x} ${y}`;
      for (let sx = 0, up = false; sx <= w; sx += 7, up = !up) {
        d += ` L${f1(x + sx + r() * 2)} ${f1((up ? y : y + h) + r() * 5)}`;
      }
      return [['thin', d]];
    },
    star(r, cx, cy, s) {
      let d = '';
      for (let i = 0; i <= 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const rr = i % 2 ? s * 0.42 : s;
        d += `${i ? 'L' : 'M'}${f1(cx + Math.cos(a) * rr + r() * 3)} ${f1(cy + Math.sin(a) * rr + r() * 3)} `;
      }
      return [['', d]];
    },
    sparkles(r, pts) {
      return [['thin', pts.map(([x, y, s]) =>
        `M${x} ${y - s} Q${x + 2} ${y - 2} ${x + s} ${y} Q${x + 2} ${y + 2} ${x} ${y + s} Q${x - 2} ${y + 2} ${x - s} ${y} Q${x - 2} ${y - 2} ${x} ${y - s}`).join(' ')]];
    },
    flower(r, cx, cy, s) {
      let d = '';
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const tx = cx + Math.cos(a) * s, ty = cy + Math.sin(a) * s;
        const lx = Math.cos(a + 0.5) * s * 0.55, ly = Math.sin(a + 0.5) * s * 0.55;
        d += `M${cx} ${cy} Q${f1(cx + lx + Math.cos(a) * s * 0.5)} ${f1(cy + ly + Math.sin(a) * s * 0.5)} ${f1(tx)} ${f1(ty)} Q${f1(cx - lx + Math.cos(a) * s * 0.5 + (lx * 0.1))} ${f1(cy - ly + Math.sin(a) * s * 0.5)} ${cx} ${cy} `;
      }
      const c = s * 0.22;
      return [['', d], ['', `M${cx - c} ${cy} a${c} ${c} 0 1 0 ${2 * c} 0 a${c} ${c} 0 1 0 ${-2 * c} 0 M${cx} ${cy + s * 0.25} Q${cx - 6} ${cy + s * 1.4} ${cx + 4} ${cy + s * 2.1}`]];
    },
    heart(r, cx, cy, s) {
      return [['', `M${cx} ${cy + s * 0.9} C${cx - s * 1.4} ${cy - s * 0.1} ${cx - s * 0.8} ${cy - s * 1.1} ${cx} ${cy - s * 0.35} C${cx + s * 0.8} ${cy - s * 1.1} ${cx + s * 1.4} ${cy - s * 0.1} ${cx + 2} ${cy + s * 0.92}`]];
    },
    paw(r, cx, cy, s) {
      const o = (x, y, rx, ry) => `M${f1(x - rx)} ${f1(y)} a${rx} ${ry} 0 1 0 ${f1(2 * rx)} 0 a${rx} ${ry} 0 1 0 ${f1(-2 * rx)} 0 `;
      return [['', o(cx, cy + s * 0.35, s * 0.5, s * 0.4)],
        ['', o(cx - s * 0.62, cy - s * 0.25, s * 0.17, s * 0.22) + o(cx - s * 0.22, cy - s * 0.62, s * 0.17, s * 0.22) +
          o(cx + s * 0.22, cy - s * 0.62, s * 0.17, s * 0.22) + o(cx + s * 0.62, cy - s * 0.25, s * 0.17, s * 0.22)]];
    },
    squiggle(r, x, y, w) {
      let d = `M${x} ${y}`;
      for (let sx = 0; sx < w; sx += 22) {
        d += ` c8 -16 18 -16 14 0 s-12 16 8 0`;
      }
      return [['', d]];
    },
  };

  // Which techniques go where on each card (left of the pill / right of the pill / corners).
  const THUMB_DOODLES = {
    ibm: (r, T) => [
      ...T.crosshatch(r, 190, 150, 120, 85),
      ...T.sparkles(r, [[360, 60, 16], [60, 250, 11]]),
      ...T.spiral(r, 930, 150, 78, 4),
      ...T.stipple(r, 1070, 70, 32, 60),
    ],
    adobe: (r, T) => [
      ...T.stipple(r, 200, 150, 95, 190),
      ...T.star(r, 380, 70, 30),
      ...T.rings(r, 930, 155, 90),
      ...T.zigzag(r, 1040, 230, 80, 40),
    ],
    haven: (r, T) => [
      ...T.flower(r, 170, 120, 50),
      ...T.heart(r, 330, 200, 34),
      ...T.waves(r, 800, 95, 260, 5),
      ...T.stipple(r, 1070, 235, 28, 55),
      ...T.sparkles(r, [[390, 60, 12]]),
    ],
    wopet: (r, T) => [
      ...T.spiral(r, 180, 155, 72, 3.5),
      ...T.paw(r, 350, 110, 42),
      ...T.crosshatch(r, 950, 150, 115, 75),
      ...T.squiggle(r, 790, 265, 180),
    ],
  };

  function thumbDoodle(slug, seed) {
    const make = THUMB_DOODLES[slug];
    if (!make) return null;
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${THUMB_W} ${THUMB_H}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.setAttribute('class', 'sketch sketch-thumb');
    svg.setAttribute('aria-hidden', 'true');
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('filter', 'url(#graphite)');
    svg.append(g);
    make(rng(seed), TECHNIQUES).forEach(([cls, d], i) => {
      const p = document.createElementNS(SVG_NS, 'path');
      p.setAttribute('d', d);
      p.setAttribute('pathLength', '1');
      if (cls) p.setAttribute('class', cls);
      p.style.setProperty('--d', `${(i * 0.09).toFixed(2)}s`);
      g.append(p);
    });
    return svg;
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
      const thumb = card.querySelector('.thumb');
      const scribbles = canHover && thumb && thumbDoodle(slug, 97 + slug.length * 131);
      if (scribbles) {
        thumb.querySelector('.case-cta').before(scribbles);
        card.addEventListener('mouseenter', () => draw(scribbles, true));
        card.addEventListener('mouseleave', () => draw(scribbles, false));
        card.addEventListener('focus', () => draw(scribbles, true));
        card.addEventListener('blur', () => draw(scribbles, false));
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
