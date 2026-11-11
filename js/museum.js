// The museum map: a little pixel museum seen from above.
// Five works stand in a ring (you see their tops and a sliver of each face, painted in that work's colours),
// a pixel visitor wanders between them, and vases, a bust, plants and a bench fill the room.
// Hovering a work shows its wall label; the center of the ring (or any work) leads into the gallery room.
// Everything is drawn at a low resolution and scaled up, so each logical pixel is a crisp square.
(function () {
  const view = document.querySelector('.map-view');
  if (!view) return;
  const museum = view.querySelector('.museum');
  const canvas = view.querySelector('.museum-canvas');
  const hits = view.querySelector('.map-hits');
  const center = view.querySelector('.map-center');
  const tag = view.querySelector('.map-tag');
  const roomView = document.querySelector('.room-view');
  const works = [...document.querySelectorAll('.room .station.work')];
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const noHover = window.matchMedia('(hover: none)').matches;

  if (noHover) {
    const sub = view.querySelector('.map-sub');
    if (sub) sub.textContent = 'Welcome in. Tap a work to read its label, then tap the center to see the case studies.';
  }

  // ---------- palette and sprites ----------
  const PAL = {
    k: '#2b1d19', h: '#3a2622', s: '#e8b593', S: '#c98f6c', r: '#b62d26', R: '#8a1f1b', p: '#34405a', o: '#1e1a18',
    W: '#ffffff', w: '#e9e4dc', x: '#d6cfc4', V: '#c46a4a', v: '#e39a74', U: '#3d5a8a', u: '#7f9dcc',
    B: '#8a5a3c', b: '#6e4630', g: '#6f9a55', G: '#44703a', T: '#b8693f', t: '#d98a5c', M: '#9c7a45', m: '#c9a45a',
  };
  const body = { // the visitor, 8 x 12; rows 10-11 are the legs, swapped per walk frame
    down: ['..kkkk..', '.khhhhk.', 'khhhhhhk', 'khsssshk', 'kskssksk', '.kssssk.', '.krrrrk.', 'krrrrrrk', 'ksrrrrsk', '.kppppk.'],
    up:   ['..kkkk..', '.khhhhk.', 'khhhhhhk', 'khhhhhhk', 'khhhhhhk', '.khhhhk.', '.krrrrk.', 'krrrrrrk', 'ksrrrrsk', '.kppppk.'],
    side: ['..kkkk..', '.khhhhk.', 'khhhhhhk', 'khhhsssk', 'khhhsksk', '.khhsssk', '..krrk..', '.krrrrk.', '.krrsrk.', '.kpppk..'],
  };
  const legs = {
    front: [['.kpkkpk.', '.oo..oo.'], ['.kpk.kk.', '.oo.....'], ['.kk.kpk.', '.....oo.']],
    side:  [['.kpkpk..', '.oo.oo..'], ['.kp.kp..', 'oo...oo.'], ['..kpk...', '..ooo...']],
  };
  function visitor(dir, frame) {
    const top = dir === 'left' || dir === 'right' ? body.side : body[dir];
    const l = (dir === 'left' || dir === 'right' ? legs.side : legs.front)[frame];
    const rows = top.concat(l);
    return dir === 'left' ? rows.map((r) => [...r].reverse().join('')) : rows;
  }
  const PROPS = {
    vase: ['...kkk...', '..kVVVk..', '..kVvVk..', '.kVVVVVk.', 'kVVvVVVVk', 'kVVVVVVVk', '.kVVVVVk.', '..kVVVk..', '.kkkkkkk.', '.kWWWWWk.', '.kwwwwwk.', '.kwwwwwk.', '.kwwwwwk.', '.kxxxxxk.', '.kkkkkkk.'],
    urn:  ['..kkkkk..', '.kUUUUUk.', '..kUuUk..', '.kUUuUUk.', 'kUUUUUUUk', 'kUuUUUUUk', '.kUUUUUk.', '..kkkkk..', '.kWWWWWk.', '.kwwwwwk.', '.kwwwwwk.', '.kxxxxxk.', '.kkkkkkk.'],
    bust: ['...kkk...', '..kMMMk..', '..kMmMk..', '...kMk...', '..kMMMk..', '.kMmMMMk.', '.kkkkkkk.', '.kWWWWWk.', '.kwwwwwk.', '.kwwwwwk.', '.kwwwwwk.', '.kwwwwwk.', '.kxxxxxk.', '.kkkkkkk.'],
    plant: ['...g.g.g...', '..gGgGgGg..', '.gGgGGgGgg.', 'gGgGgGgGgGg', '.gGgGgGgGg.', '..ggGgGgg..', '...kkkkk...', '..kTTTTTk..', '..kTttTTk..', '..kTTTTTk..', '...kTTTk...', '....kkk....'],
    bench: ['kkkkkkkkkkkkkkkkkk', 'kBBBBBBBBBBBBBBBBk', 'kbbbbbbbbbbbbbbbbk', 'kkkkkkkkkkkkkkkkkk', '.kk............kk.', '.kk............kk.'],
  };
  function blit(rows, x, y, shadow) {
    const h = rows.length, w = rows[0].length, x0 = Math.round(x - w / 2), y0 = Math.round(y - h);
    if (shadow) { ctx.fillStyle = 'rgba(70,52,40,0.16)'; ctx.fillRect(x0 + 1, y0 + h - 1, w, 2); }
    for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) {
      const ch = rows[r][c];
      if (ch !== '.' && PAL[ch]) { ctx.fillStyle = PAL[ch]; ctx.fillRect(x0 + c, y0 + r, 1, 1); }
    }
  }

  // ---------- layout ----------
  let S = 4, LW = 0, LH = 0, cx = 0, cy = 0, rx = 0, ry = 0, frameLen = 34;
  let floor = null, frames = [], props = [];
  const artColors = works.map(() => ['#c9c2b8', '#a99f93', '#d9d2c8', '#8f857a']);

  // sample a few colours from each work's image for the sliver of canvas you see from above
  works.forEach((st, i) => {
    const src = st.querySelector('.frame img').getAttribute('src');
    const im = new Image();
    im.onload = () => {
      const c = document.createElement('canvas'); c.width = 4; c.height = 1;
      const x = c.getContext('2d'); x.drawImage(im, 0, 0, 4, 1);
      const d = x.getImageData(0, 0, 4, 1).data;
      artColors[i] = [0, 1, 2, 3].map((j) => `rgb(${d[j * 4]},${d[j * 4 + 1]},${d[j * 4 + 2]})`);
      if (LW) buildFrames();
    };
    im.src = src;
  });

  function rng(seed) { return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646; }

  function buildFloor() {
    floor = document.createElement('canvas'); floor.width = LW; floor.height = LH;
    const f = floor.getContext('2d'), rand = rng(7);
    f.fillStyle = '#f4f2ee'; f.fillRect(0, 0, LW, LH);
    f.fillStyle = '#efece6';                       // stone tiles, barely there
    for (let x = 0; x < LW; x += 20) f.fillRect(x, 0, 1, LH);
    for (let y = 0; y < LH; y += 14) f.fillRect(0, y, LW, 1);
    for (let i = 0; i < LW * LH / 40; i++) {       // speckles in the stone
      f.fillStyle = rand() < 0.5 ? '#ebe7e0' : '#f8f7f4';
      f.fillRect(Math.floor(rand() * LW), Math.floor(rand() * LH), 1, 1);
    }
    // the inlaid ring the works stand on, and the medallion at its center
    ring(f, cx, cy, rx + 12, ry + 8, '#e2dbd0', 2);
    ring(f, cx, cy, rx - 12, ry - 8, '#e8e2d8', 1);
    fillEllipse(f, cx, cy, 15, 9, '#ece4d8');
    ring(f, cx, cy, 15, 9, '#b9a58a', 1);
    ring(f, cx, cy, 10, 6, '#c7b59c', 1);
  }
  function fillEllipse(g, x0, y0, a, b, col) {
    g.fillStyle = col;
    for (let y = -b; y <= b; y++) { const w = Math.round(a * Math.sqrt(1 - (y * y) / (b * b))); g.fillRect(Math.round(x0 - w), Math.round(y0 + y), w * 2 + 1, 1); }
  }
  function ring(g, x0, y0, a, b, col, t) {
    g.fillStyle = col;
    const n = Math.ceil(2 * Math.PI * Math.max(a, b) * 2);
    for (let i = 0; i < n; i++) { const th = (i / n) * 2 * Math.PI; g.fillRect(Math.round(x0 + a * Math.cos(th)), Math.round(y0 + b * Math.sin(th)), t, t); }
  }

  // a frame seen from above: the top of the moulding, plus a sliver of the face below it
  function buildFrames() {
    frames = works.map((st, i) => {
      const a = (-90 + (i * 360) / works.length) * Math.PI / 180;
      const px = cx + rx * Math.cos(a), py = cy + ry * Math.sin(a);
      let tx = -Math.sin(a) * rx, ty = Math.cos(a) * ry; const tl = Math.hypot(tx, ty); tx /= tl; ty /= tl;
      const nx = -ty, ny = tx, hl = frameLen / 2, th = 1.2, F = 6;
      const A = [px - tx * hl, py - ty * hl], B = [px + tx * hl, py + ty * hl];
      const top = [[A[0] + nx * th, A[1] + ny * th], [B[0] + nx * th, B[1] + ny * th], [B[0] - nx * th, B[1] - ny * th], [A[0] - nx * th, A[1] - ny * th]];
      const low = top.slice().sort((p, q) => q[1] - p[1]);
      // the slab's lower long edge, in left-to-right order
      const e = ny > 0 ? [top[0], top[1]] : [top[3], top[2]];
      const facePoly = [e[0], e[1], [e[1][0], e[1][1] + F], [e[0][0], e[0][1] + F]];
      const px_ = [];
      raster(facePoly, (x, y, edge) => {
        let col;
        // a sliver of the work itself, in its own colours, framed in dark wood
        if (edge) col = '#3a2a24';
        else { const fr = ((x - A[0]) * tx + (y - A[1]) * ty) / frameLen; col = artColors[i][Math.max(0, Math.min(3, Math.floor(fr * 4)))]; }
        px_.push([x, y, col]);
      });
      raster(top, (x, y, edge) => px_.push([x, y, edge ? '#5a3d30' : '#8a6150']));
      const xs = px_.map((p) => p[0]), ys = px_.map((p) => p[1]);
      const box = { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
      const set = new Set(px_.map((p) => p[0] + ',' + p[1]));
      const outline = [];
      for (const [x, y] of px_) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!set.has(x + dx + ',' + (y + dy))) outline.push([x + dx, y + dy]);
      // where the visitor stands to look at it: a little inside the ring, in front of the work
      const stand = [cx + (rx - 16) * Math.cos(a), cy + (ry - 10) * Math.sin(a) + 6];
      const face = Math.abs(Math.cos(a)) > 0.8 ? (Math.cos(a) > 0 ? 'right' : 'left') : (Math.sin(a) < 0 ? 'up' : 'down');
      return { i, a, px: px_, box, outline, base: low[0][1] + F, stand, face };
    });
    placeHits();
  }
  function raster(poly, put) {
    const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
    const inside = (x, y) => {
      let s = 0;
      for (let k = 0; k < poly.length; k++) {
        const [x1, y1] = poly[k], [x2, y2] = poly[(k + 1) % poly.length];
        const c = (x2 - x1) * (y - y1) - (y2 - y1) * (x - x1);
        if (c !== 0) { if (s === 0) s = Math.sign(c); else if (Math.sign(c) !== s) return false; }
      }
      return true;
    };
    for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++)
      for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++) {
        if (!inside(x + 0.5, y + 0.5)) continue;
        const edge = !inside(x + 1.5, y + 0.5) || !inside(x - 0.5, y + 0.5) || !inside(x + 0.5, y + 1.5) || !inside(x + 0.5, y - 0.5);
        put(x, y, edge);
      }
  }

  function placeProps() {
    const P = (k, fx, fy) => ({ k, x: Math.round(fx * LW), y: Math.round(fy * LH) });
    props = LW < 200
      ? [P('plant', 0.1, 0.95), P('vase', 0.9, 0.95), P('bust', 0.88, 0.36), P('urn', 0.12, 0.36)]
      : [P('vase', 0.1, 0.66), P('bust', 0.24, 0.9), P('plant', 0.06, 0.92), P('bench', 0.5, 0.95),
         P('urn', 0.87, 0.36), P('plant', 0.94, 0.92), P('vase', 0.8, 0.86), P('plant', 0.9, 0.2)];
  }

  // invisible buttons over each frame, so the works can be hovered, focused and clicked
  function placeHits() {
    hits.innerHTML = '';
    frames.forEach((f) => {
      const st = works[f.i], b = document.createElement('button');
      b.type = 'button'; b.className = 'map-hit';
      b.setAttribute('aria-label', `${st.dataset.title}: read its label, or open it in the gallery`);
      const pad = 4;
      Object.assign(b.style, { left: `${(f.box.x0 - pad) * S}px`, top: `${(f.box.y0 - pad) * S}px`, width: `${(f.box.x1 - f.box.x0 + 1 + pad * 2) * S}px`, height: `${(f.box.y1 - f.box.y0 + 1 + pad * 2) * S}px` });
      b.addEventListener('pointerenter', () => focusWork(f.i));
      b.addEventListener('focus', () => focusWork(f.i));
      b.addEventListener('pointerleave', () => blurWork(f.i));
      b.addEventListener('blur', () => blurWork(f.i));
      b.addEventListener('click', () => {
        if (noHover && armed !== f.i) { armed = f.i; focusWork(f.i); return; }   // on touch, the first tap reads the label
        armed = -1; enter(f.i);
      });
      hits.appendChild(b);
    });
    Object.assign(center.style, { left: `${(cx - 18) * S}px`, top: `${(cy - 12) * S}px`, width: `${36 * S}px`, height: `${24 * S}px` });
  }

  function fit() {
    const w = museum.clientWidth, h = museum.clientHeight;
    S = w < 700 ? 3 : 4;
    LW = Math.ceil(w / S); LH = Math.ceil(h / S);
    canvas.width = LW; canvas.height = LH;
    canvas.style.width = `${LW * S}px`; canvas.style.height = `${LH * S}px`;
    const narrow = LW < 200;
    frameLen = narrow ? 26 : 34;
    cx = Math.round(LW * (narrow ? 0.5 : 0.55)); cy = Math.round(LH * (narrow ? 0.62 : 0.56));
    rx = Math.round(Math.min(LW * (narrow ? 0.36 : 0.24), LH * 0.36 / 0.62)); ry = Math.round(rx * 0.62);
    buildFloor(); placeProps(); buildFrames();
    if (!me.x) { me.x = cx + rx * 0.4; me.y = cy + ry + 14; }
  }

  // ---------- the visitor ----------
  const me = { x: 0, y: 0, dir: 'down', frame: 0, t: 0, goal: null, wait: 1.2, look: -1 };
  let hovered = -1, centerHover = false, armed = -1;
  function pickGoal() {
    me.look = (Math.max(me.look, 0) + 1 + Math.floor(Math.random() * 2)) % works.length;
    me.goal = frames[me.look] ? frames[me.look].stand.slice() : null;
  }
  function stepVisitor(dt) {
    if (reduce) { me.dir = 'up'; me.frame = 0; return; }
    if (!me.goal) { me.wait -= dt; me.frame = 0; if (me.wait <= 0) pickGoal(); return; }
    const dx = me.goal[0] - me.x, dy = me.goal[1] - me.y, d = Math.hypot(dx, dy), sp = 26 * dt;
    if (d <= sp) {
      me.x = me.goal[0]; me.y = me.goal[1]; me.goal = null; me.frame = 0;
      me.dir = me.look >= 0 && frames[me.look] ? frames[me.look].face : 'down';   // turn to face the work
      me.wait = 1.6 + Math.random() * 1.8; return;
    }
    me.x += (dx / d) * sp; me.y += (dy / d) * sp;
    me.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    me.t += dt; me.frame = 1 + (Math.floor(me.t / 0.16) % 2);
  }

  // ---------- drawing ----------
  function draw() {
    ctx.drawImage(floor, 0, 0);
    if (centerHover) { fillEllipse(ctx, cx, cy, 16, 10, 'rgba(182,45,38,0.18)'); }
    const items = [];
    frames.forEach((f) => items.push({ y: f.base, draw: () => {
      ctx.fillStyle = 'rgba(70,52,40,0.14)';
      for (const [x, y] of f.px) ctx.fillRect(x + 2, y + 3, 1, 1);        // shadow on the floor
      for (const [x, y, c] of f.px) { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); }
      if (hovered === f.i) { ctx.fillStyle = '#e0b04a'; for (const [x, y] of f.outline) ctx.fillRect(x, y, 1, 1); }
    } }));
    props.forEach((p) => items.push({ y: p.y, draw: () => blit(PROPS[p.k], p.x, p.y, true) }));
    items.push({ y: me.y, draw: () => blit(visitor(me.dir, me.frame), me.x, me.y, true) });
    items.sort((a, b) => a.y - b.y).forEach((it) => it.draw());
  }

  let last = performance.now(), running = true;
  function loop(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    stepVisitor(dt); draw();
    requestAnimationFrame(loop);
  }

  // ---------- labels ----------
  function focusWork(i) {
    hovered = i;
    const f = frames[i], st = works[i];
    tag.innerHTML = st.querySelector('.art-tag').innerHTML;
    const cta = tag.querySelector('.at-cta');
    if (cta) cta.textContent = noHover ? 'Tap again to see it in the gallery' : 'Click to see it in the gallery';
    tag.classList.add('show');
    // hang the label beside the work, on the side away from the center
    const r = museum.getBoundingClientRect(), tw = tag.offsetWidth, th = tag.offsetHeight;
    const fx = ((f.box.x0 + f.box.x1) / 2) * S + r.left, fy = ((f.box.y0 + f.box.y1) / 2) * S + r.top;
    let x = fx < (cx * S + r.left) ? fx - tw - (frameLen / 2) * S : fx + (frameLen / 2) * S;
    let y = fy - th / 2;
    x = Math.max(12, Math.min(innerWidth - tw - 12, x)); y = Math.max(76, Math.min(innerHeight - th - 12, y));
    tag.style.left = `${x}px`; tag.style.top = `${y}px`;
    if (!reduce) { me.goal = f.stand.slice(); me.look = i; }
  }
  function blurWork(i) { if (hovered === i) { hovered = -1; tag.classList.remove('show'); } }
  center.addEventListener('pointerenter', () => { centerHover = true; if (!reduce) { me.goal = [cx + 4, cy + 16]; me.look = -1; } });
  center.addEventListener('pointerleave', () => { centerHover = false; });
  center.addEventListener('focus', () => { centerHover = true; });
  center.addEventListener('blur', () => { centerHover = false; });
  center.addEventListener('click', () => enter(0));

  // ---------- into the gallery and back ----------
  function enter(i) {
    tag.classList.remove('show');
    const go = () => {
      view.hidden = true; roomView.hidden = false; running = false;
      document.body.classList.add('in-room');
      window.PKGallery && window.PKGallery.show(i);
      if (!reduce && roomView.animate) roomView.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, easing: 'ease' });
      try { if (location.hash !== '#gallery') history.pushState({ room: i }, '', '#gallery'); } catch (e) { /* sandboxed previews can't change history */ }
    };
    if (reduce) return go();
    museum.style.transformOrigin = `${cx * S}px ${cy * S}px`;
    view.classList.add('leaving');
    setTimeout(() => { go(); view.classList.remove('leaving'); }, 520);
  }
  function leave(push) {
    roomView.hidden = true; view.hidden = false; document.body.classList.remove('in-room');
    window.PKGallery && window.PKGallery.hide();
    try { if (push && location.hash === '#gallery') history.pushState({}, '', location.pathname); } catch (e) { /* as above */ }
    if (!running) { running = true; last = performance.now(); requestAnimationFrame(loop); }
    center.focus({ preventScroll: true });
  }
  document.querySelector('.room-back')?.addEventListener('click', () => leave(true));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !roomView.hidden) leave(true); });
  addEventListener('popstate', () => { if (location.hash === '#gallery') enter(0); else if (!roomView.hidden) leave(false); });

  addEventListener('resize', fit);
  fit();
  requestAnimationFrame(loop);
  // arriving at #gallery (a reload or the back button) opens the room once gallery.js has loaded
  setTimeout(() => { if (location.hash === '#gallery') enter(0); }, 0);

  // the pixel visitor, shared with the gallery room (seen from behind there)
  window.PKSprites = { visitor, PAL };
})();
