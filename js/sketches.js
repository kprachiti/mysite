// Home page scrapbook extras and pencil sketches.
//  - Hero: move the pointer near a note (or scroll the hero into view on touch):
//    the nametag gets a blue "prev. UX @ IBM" sticker stuck down beside it, the sticky note gets
//    a doodled Empathize → Define → Ideate → Prototype → Test cycle, and a coffee receipt prints
//    out from under the notecard.
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

  // Small circular design cycle: five overlapping pastel discs, each with a doodled icon,
  // hand-lettered stage names around the outside on curvy leader lines.
  const EDIPT_RING = ['0 0 280 225', [
    ['blob', { cx: 140, cy: 66, r: 30, color: 'rgba(160, 205, 240, 0.55)' }],
    ['blob', { cx: 183.7, cy: 97.8, r: 30, color: 'rgba(205, 180, 240, 0.55)' }],
    ['blob', { cx: 167, cy: 149.2, r: 30, color: 'rgba(235, 150, 195, 0.5)' }],
    ['blob', { cx: 113, cy: 149.2, r: 30, color: 'rgba(245, 190, 165, 0.55)' }],
    ['blob', { cx: 96.3, cy: 97.8, r: 30, color: 'rgba(248, 228, 150, 0.6)' }],
    // Empathize: heart
    ['path', 'M140 77 C123 66 127 52 140 60 C153 52 157 66 140 77 Z', null, '#e8706a'],
    ['text', 'EMPATHIZE', { x: 140, y: 20, size: 17, anchor: 'middle', cls: 'label' }],
    ['path', 'M156 25 C167 28 165 37 154 40', 'thin'],
    // Define: pencil
    ['path', 'M175 109 L190 92 L195 97 L180 114 Z M175 109 L172 117 L180 114 M187 89 L193 95', null, '#fff'],
    ['text', 'DEFINE', { x: 216, y: 74, size: 17, cls: 'label' }],
    ['path', 'M216 79 C207 81 206 87 209 92', 'thin'],
    // Ideate: light bulb with an orange filament
    ['path', 'M161 153 C154 147 157 137 167 137 C177 137 180 147 173 153 L172 158 L162 158 Z M163 161 L171 161 M164 164 L170 164', null, '#fff'],
    ['path', 'M164 152 L167 145 L170 152', 'thin orange'],
    ['text', 'IDEATE', { x: 190, y: 208, size: 17, cls: 'label' }],
    ['path', 'M196 195 C198 186 191 180 183 178', 'thin'],
    // Prototype: wireframe card
    ['path', 'M101 138 L125 138 L125 161 L101 161 Z', null, '#b89bd6'],
    ['path', 'M104 141 L122 141 L122 148 L104 148 Z M104 152 h5 v5 h-5 Z M110.5 152 h5 v5 h-5 Z M117 152 h5 v5 h-5 Z', 'thin', '#fff'],
    ['text', 'PROTOTYPE', { x: 116, y: 208, size: 17, anchor: 'end', cls: 'label' }],
    ['path', 'M102 195 C99 186 103 180 108 177', 'thin'],
    // Test: clipboard with ticks
    ['path', 'M87 87 L106 87 L106 111 L87 111 Z', null, '#fff'],
    ['path', 'M92 84 L101 84 L101 89 L92 89 Z', 'thin', '#f2a93b'],
    ['path', 'M90 95 l2 2 l3 -4 M90 102 l2 2 l3 -4 M98 95 h5 M98 102 h5 M91 107 h11', 'thin'],
    ['text', 'TEST', { x: 58, y: 74, size: 17, anchor: 'end', cls: 'label' }],
    ['path', 'M61 79 C67 81 70 87 69 93', 'thin'],
  ]];

  // Each doodle: viewBox + strokes, drawn one after another.
  // ['path', d, className?, fill?], ['text', words, { x, y, size, anchor?, cls? }] or ['blob', { cx, cy, r, color }]
  const DOODLES = {
    edipt: EDIPT_RING,
    arrow: ['0 0 120 90', [
      ['path', 'M6 14 C40 2 92 10 100 44 C104 60 98 72 90 82'],
      ['path', 'M76 72 L90 83 L97 66'],
    ]],
    underline: ['0 0 200 12', [
      ['path', 'M2 7 C50 4 130 9 198 5'],
    ]],
    // About page: notes beside each painting (arrow points back at the painting)
    'note-still-life': ['0 0 200 80', [
      ['path', 'M26 36 C14 38 8 46 4 58 M2 49 L4 59 L12 53', 'thin'],
      ['text', 'the first painting', { x: 30, y: 30, size: 23 }],
      ['text', 'I sold!', { x: 30, y: 58, size: 23 }],
      ['path', 'M88 64 C110 60 128 66 150 61', 'thin'],
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
        delay += opt.cls === 'center' ? 0.08 : opt.cls === 'label' ? 0.3 : 0.6;
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

    // handwritten note beside the painting, written on hover (or after the frame on touch)
    if (DOODLES[`note-${key}`]) {
      const note = sketch(`note-${key}`, `sketch-art-note art-note-${key}`);
      fig.parentElement.append(note);
      if (canHover) {
        fig.addEventListener('mouseenter', () => note.classList.add('drawn'));
      } else {
        onScrollIn(fig, () => setTimeout(() => note.classList.add('drawn'), 1600), 0.5);
      }
    }
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

  // ---------- Hero: sticker, design-cycle doodle, printed receipt ----------

  function receiptHTML() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const date = `${pad(now.getMonth() + 1)}/${pad(now.getDate())}/${String(now.getFullYear()).slice(2)}`;
    const row = (l, r) => `<div class="r-row"><span>${l}</span><span>${r}</span></div>`;
    return `
      <div class="r-head">THE DESIGN BREW</div>
      ${row('#0826', date)}
      <div class="r-rule"></div>
      ${row('ICED LATTE', '5.25')}
      ${row('+ honey', '0.75')}
      <div class="r-rule"></div>
      ${row('<b>TOTAL</b>', '<b>6.00</b>')}
      <div class="r-barcode"></div>`;
  }

  function heroExtras(board) {
    // 1. Blue sticker stuck down to the right of the nametag
    const sticker = document.createElement('div');
    sticker.className = 'hero-sticker';
    sticker.innerHTML = '<span class="s-small">prev. UX</span><span class="s-big">@ IBM</span><span class="s-stars">★★★</span>';
    board.append(sticker);

    // 2. Design cycle doodled beside the sticky note
    const cycle = sketch('edipt', 'sketch-edipt');
    board.append(cycle);

    // 3. Coffee receipt printed out from under the notecard
    const card = board.querySelector('.note-blurb');
    const slot = document.createElement('div');
    slot.className = 'receipt-slot';
    slot.setAttribute('aria-hidden', 'true');
    slot.innerHTML = `<div class="receipt">${receiptHTML()}</div>`;
    if (card) card.append(slot);

    const items = [
      { note: board.querySelector('.note-name'), reveal: () => sticker.classList.add('placed') },
      { note: board.querySelector('.note-empathy'), reveal: () => cycle.classList.add('drawn') },
      { note: card, reveal: () => slot.classList.add('printing') },
    ].filter((i) => i.note);

    if (!canHover) {
      // touch: play all three in turn when the hero comes into view
      onScrollIn(board, () => items.forEach((i, n) => setTimeout(i.reveal, 400 + n * 900)), 0.4);
      return;
    }

    // mouse: reveal each one when the pointer comes near its note (and keep it)
    const NEAR = 48;
    let queued = false, lastX = 0, lastY = 0;
    function check() {
      queued = false;
      for (let n = items.length - 1; n >= 0; n--) {
        const r = items[n].note.getBoundingClientRect();
        if (lastX > r.left - NEAR && lastX < r.right + NEAR && lastY > r.top - NEAR && lastY < r.bottom + NEAR) {
          items[n].reveal();
          items.splice(n, 1);
        }
      }
      if (!items.length) removeEventListener('pointermove', onMove);
    }
    function onMove(e) {
      lastX = e.clientX; lastY = e.clientY;
      if (!queued) { queued = true; requestAnimationFrame(check); }
    }
    addEventListener('pointermove', onMove, { passive: true });
  }

  function init() {
    ensureGraphite();
    // Hero scrapbook extras (home page board only; About uses a different board)
    const board = document.querySelector('.sticky-board:not(.has-photo)');
    if (board) heroExtras(board);

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
