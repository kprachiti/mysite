// The museum map: a soft, warmly lit museum floor seen from above, in a hazy painted style.
// A path of glowing stepping stones enters from the lower left, loops around a ring of five works
// and branches into the center. A little visitor strolls the path from work to work, among vases,
// a bust, plants and a bench. Hovering a work walks the visitor over and shows its wall label;
// the center of the ring (or any work) leads into the gallery room.
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
  const TAU = Math.PI * 2;

  if (noHover) {
    const sub = view.querySelector('.map-sub');
    if (sub) sub.textContent = 'Welcome in. Tap a work to read its label, then tap the center to see the case studies.';
  }

  // the works' cover images, drawn small onto their easels
  const covers = works.map((st) => { const im = new Image(); im.src = st.querySelector('.frame img').getAttribute('src'); im.onload = () => { if (W) buildWorks(); }; return im; });

  // ---------- the visitor: soft shapes, shared with the gallery room ----------
  // dir: 'front' | 'back' | 'left' | 'right'; step: walk phase in radians (0 when still)
  function drawFigure(g, x, y, s, dir, step, moving) {
    const swing = moving ? Math.sin(step) : 0, bob = moving ? Math.abs(Math.sin(step)) * 1.2 * s : 0;
    g.save(); g.translate(x, y - bob);
    // shadow on the ground
    g.save(); g.translate(3 * s, bob); g.scale(1, 0.34);
    const sh = g.createRadialGradient(0, 0, 0, 0, 0, 10 * s);
    sh.addColorStop(0, 'rgba(80,50,35,0.3)'); sh.addColorStop(1, 'rgba(80,50,35,0)');
    g.fillStyle = sh; g.beginPath(); g.arc(0, 0, 10 * s, 0, TAU); g.fill(); g.restore();
    const side = dir === 'left' || dir === 'right', flip = dir === 'left' ? -1 : 1;
    // legs
    g.strokeStyle = '#3b3f52'; g.lineCap = 'round'; g.lineWidth = 3.2 * s;
    const leg = (dx, sw) => { g.beginPath(); g.moveTo(dx * s, -10 * s); g.lineTo((dx + sw * (side ? 3.5 : 1.2)) * s, -1 * s); g.stroke(); };
    if (side) { leg(-1 * flip, swing * flip); leg(1 * flip, -swing * flip); } else { leg(-2.2, swing); leg(2.2, -swing); }
    // body: a soft red top
    const bodyG = g.createLinearGradient(-6 * s, -24 * s, 6 * s, -10 * s);
    bodyG.addColorStop(0, '#d0463c'); bodyG.addColorStop(1, '#9e2621');
    g.fillStyle = bodyG; g.beginPath(); g.roundRect(-6 * s, -24 * s, 12 * s, 15 * s, 5 * s); g.fill();
    // arms
    g.strokeStyle = '#b8332b'; g.lineWidth = 2.6 * s;
    if (!side) { [-1, 1].forEach((k) => { g.beginPath(); g.moveTo(k * 5.5 * s, -21 * s); g.lineTo(k * 6.8 * s, (-13 - k * swing * 1.5) * s); g.stroke(); }); }
    else { g.beginPath(); g.moveTo(0, -21 * s); g.lineTo(-swing * 3 * flip * s, -13 * s); g.stroke(); }
    // head and hair
    g.fillStyle = '#e8b593'; g.beginPath(); g.arc(0, -30 * s, 6 * s, 0, TAU); g.fill();
    g.fillStyle = '#3a2622'; g.beginPath();
    if (dir === 'back') { g.arc(0, -30.5 * s, 6.4 * s, 0, TAU); g.fill(); g.beginPath(); g.ellipse(0, -24 * s, 5 * s, 3.5 * s, 0, 0, TAU); }
    else if (side) { g.arc(-1.6 * flip * s, -31.5 * s, 6 * s, Math.PI * (flip > 0 ? 0.55 : -0.45), Math.PI * (flip > 0 ? 2.05 : 1.05)); }
    else { g.arc(0, -31.5 * s, 6.3 * s, Math.PI * 0.95, Math.PI * 2.05); }
    g.fill();
    if (dir === 'front') { g.fillStyle = '#3a2622'; [-2.2, 2.2].forEach((k) => { g.beginPath(); g.arc(k * s, -29.5 * s, 0.7 * s, 0, TAU); g.fill(); }); }
    if (side) { g.fillStyle = '#3a2622'; g.beginPath(); g.arc(3 * flip * s, -29.5 * s, 0.7 * s, 0, TAU); g.fill(); }
    g.restore();
  }
  window.PKFigure = drawFigure;

  // ---------- layout ----------
  let W = 0, H = 0, dpr = 1, cx = 0, cy = 0, rx = 0, ry = 0, rPath = 0, narrow = false;
  let ground = null, entry = [], ringStones = [], spur = [], workSprites = [], props = [];

  // paint something once (blurs and all) into its own little canvas, to be placed each frame
  function bake(x0, y0, w, h, paint) {
    const c = document.createElement('canvas');
    c.width = Math.ceil(w * dpr); c.height = Math.ceil(h * dpr);
    const g = c.getContext('2d'); g.scale(dpr, dpr); g.translate(-x0, -y0); paint(g);
    return { c, x0, y0, w, h };
  }
  const place = (b) => ctx.drawImage(b.c, b.x0, b.y0, b.w, b.h);

  function fit() {
    W = museum.clientWidth; H = museum.clientHeight; dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
    narrow = W < 700;
    cx = W * (narrow ? 0.5 : 0.56); cy = H * (narrow ? 0.64 : 0.58);
    rx = Math.min(W * (narrow ? 0.3 : 0.25), H * (narrow ? 0.4 : 0.34) / 0.58); ry = rx * 0.58;
    rPath = 0.7;
    buildPath(); buildGround(); buildWorks(); buildProps(); placeHits();
    if (!me.placed) { me.mode = 'entry'; me.s = 0; me.placed = true; }
  }

  // the route: an entry walk from the lower left, the loop around the ring, and a spur into the center
  const ringPt = (phi, k = rPath) => [cx + rx * k * Math.cos(phi), cy + ry * k * Math.sin(phi)];
  const joinPhi = () => Math.PI * 0.78;   // where the entry path meets the loop (lower left)
  function curve(pts, n) {           // Catmull-Rom through the points, sampled evenly-ish
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let t = 0; t < 1; t += 1 / n) {
        const t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map((k) => 0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)));
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }
  function resample(line, gap) {      // points every `gap` px along a polyline, with the heading there
    const out = []; let carry = 0;
    for (let i = 0; i < line.length - 1; i++) {
      const [x1, y1] = line[i], [x2, y2] = line[i + 1], seg = Math.hypot(x2 - x1, y2 - y1), ang = Math.atan2(y2 - y1, x2 - x1);
      let d = carry ? gap - carry : 0;
      while (d <= seg) { const t = d / seg; out.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, ang]); d += gap; }
      carry = seg - (d - gap);
    }
    return out;
  }
  function buildPath() {
    const j = ringPt(joinPhi());
    const entryPts = narrow
      ? [[W * 0.08, H * 1.04], [W * 0.14, H * 0.93], [j[0] - 10, j[1] + 18], j]
      : [[W * -0.02, H * 1.04], [W * 0.14, H * 0.9], [W * 0.28, H * 0.86], [j[0] - 24, j[1] + 16], j];
    entry = curve(entryPts, 16);
    entryLen = 0; for (let k = 1; k < entry.length; k++) entryLen += Math.hypot(entry[k][0] - entry[k - 1][0], entry[k][1] - entry[k - 1][1]);
    const loop = []; for (let k = 0; k <= 120; k++) loop.push(ringPt((k / 120) * TAU));
    const gap = narrow ? 30 : 44;
    ringStones = resample(loop, gap);
    const sp = ringPt(Math.PI * 0.5);
    spur = curve([sp, [cx, cy + ry * 0.36]], 8);
    stones = [...resample(entry, gap), ...ringStones, ...resample(spur, gap).slice(1)];
  }
  let stones = [], entryLen = 1;

  // ---------- painting the floor ----------
  function buildGround() {
    ground = document.createElement('canvas'); ground.width = canvas.width; ground.height = canvas.height;
    const g = ground.getContext('2d'); g.scale(dpr, dpr);
    // a warm, hazy floor: peach light from the left, pale cream to the right
    const base = g.createLinearGradient(0, 0, W, H);
    base.addColorStop(0, '#f6dccb'); base.addColorStop(0.55, '#f7ece2'); base.addColorStop(1, '#f6f1ea');
    g.fillStyle = base; g.fillRect(0, 0, W, H);
    const glow = g.createRadialGradient(W * -0.05, H * 0.55, 0, W * -0.05, H * 0.55, W * 0.7);
    glow.addColorStop(0, 'rgba(240,168,124,0.55)'); glow.addColorStop(0.5, 'rgba(244,196,160,0.22)'); glow.addColorStop(1, 'rgba(244,196,160,0)');
    g.fillStyle = glow; g.fillRect(0, 0, W, H);
    const haze = g.createRadialGradient(W, 0, 0, W, 0, W * 0.6);
    haze.addColorStop(0, 'rgba(255,253,250,0.85)'); haze.addColorStop(1, 'rgba(255,253,250,0)');
    g.fillStyle = haze; g.fillRect(0, 0, W, H);
    // a soft shadowed corner, as if from a doorway, lower left
    g.save(); g.filter = 'blur(40px)'; g.fillStyle = 'rgba(70,44,34,0.22)';
    g.beginPath(); g.ellipse(-W * 0.04, H * 1.04, W * 0.24, H * 0.14, -0.25, 0, TAU); g.fill(); g.restore();
    // the round platform the works stand on, and the medallion at its heart
    g.save(); g.filter = 'blur(10px)';
    g.fillStyle = 'rgba(255,250,242,0.55)'; g.beginPath(); g.ellipse(cx, cy, rx * 1.12, ry * 1.12, 0, 0, TAU); g.fill();
    g.restore();
    // the stepping stones: pale, glowing slabs laid along the route
    const sw = narrow ? 30 : 44, sh = narrow ? 15 : 20;
    for (const [x, y, ang] of stones) {
      g.save(); g.translate(x, y); g.scale(1, 0.62); g.rotate(ang);
      g.filter = 'blur(6px)'; g.fillStyle = 'rgba(160,110,80,0.13)';
      g.beginPath(); g.roundRect(-sw / 2 + 3, -sh / 2 + 5, sw, sh, sh / 2); g.fill();
      g.filter = 'blur(1.6px)';
      const sg = g.createLinearGradient(0, -sh / 2, 0, sh / 2);
      sg.addColorStop(0, 'rgba(250,251,232,0.95)'); sg.addColorStop(1, 'rgba(236,240,212,0.9)');
      g.fillStyle = sg; g.beginPath(); g.roundRect(-sw / 2, -sh / 2, sw, sh, sh / 2); g.fill();
      g.restore();
    }
    // the medallion where the spur ends
    g.save(); g.filter = 'blur(2px)';
    g.fillStyle = 'rgba(252,247,232,0.95)'; g.beginPath(); g.ellipse(cx, cy, rx * 0.2, ry * 0.2, 0, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(200,160,110,0.5)'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(cx, cy, rx * 0.15, ry * 0.15, 0, 0, TAU); g.stroke();
    g.restore();
    // a few soft tufts of grass by the path, as in a garden
    const tufts = narrow ? [[0.86, 0.94], [0.08, 0.5]] : [[0.36, 0.95], [0.07, 0.62], [0.83, 0.92], [0.92, 0.5]];
    for (const [fx, fy] of tufts) tuft(g, W * fx, H * fy);
  }
  function tuft(g, x, y) {
    g.save(); g.lineCap = 'round';
    for (let k = -3; k <= 3; k++) {
      g.strokeStyle = k % 2 ? '#5f8a4a' : '#7ea35e'; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(x + k * 2, y); g.quadraticCurveTo(x + k * 3, y - 10, x + k * 4.5 + 2, y - 16 - Math.abs(k)); g.stroke();
    }
    g.fillStyle = '#e0894a'; g.beginPath(); g.ellipse(x + 3, y - 20, 1.8, 4, 0.2, 0, TAU); g.fill();
    g.restore();
  }

  // ---------- the works: small framed canvases on easels, standing on the ring ----------
  function buildWorks() {
    const fw = narrow ? 80 : 132;
    workSprites = works.map((st, i) => {
      const a = (-90 + (i * 360) / works.length) * Math.PI / 180;
      const x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a);
      const im = covers[i], ar = im.naturalWidth ? im.naturalHeight / im.naturalWidth : 0.26;
      const ah = fw * ar, mat = narrow ? 4 : 6, fr = narrow ? 4 : 5, lift = narrow ? 14 : 18;
      const w = fw + (mat + fr) * 2, h = ah + (mat + fr) * 2;
      // stand facing the visitor on the path, a little turned toward the center
      const lean = Math.cos(a) * -0.08;
      return { i, a, x, y, w, h, ah, fw, mat, fr, lift, lean, im,
        box: { x0: x - w / 2 - 6, y0: y - lift - h - 8, x1: x + w / 2 + 6, y1: y + 6 },
        stop: ringPt(a, rPath), face: Math.abs(Math.cos(a)) > 0.8 ? (Math.cos(a) > 0 ? 'right' : 'left') : (Math.sin(a) < 0 ? 'back' : 'front') };
    });
    workSprites.forEach((wk) => {
      const x0 = wk.x - wk.w - 30, y0 = wk.y - wk.lift - wk.h - 60, bw = wk.w * 2.4 + 60, bh = wk.lift + wk.h + 90;
      wk.plain = bake(x0, y0, bw, bh, (g) => drawWork(g, wk, false));
      wk.lit = bake(x0, y0, bw, bh, (g) => drawWork(g, wk, true));
    });
  }
  function drawWork(g, wk, lit) {
    const { x, y, w, h, fw, ah, mat, fr, lift, lean, im } = wk;
    g.save();
    // soft shadow thrown to the right on the floor
    g.save(); g.filter = 'blur(8px)'; g.fillStyle = 'rgba(110,70,50,0.25)';
    g.beginPath(); g.ellipse(x + w * 0.22, y + 2, w * 0.55, 7, -0.06, 0, TAU); g.fill(); g.restore();
    if (lit) {   // a warm glow when you're looking at it
      g.save(); g.filter = 'blur(18px)'; g.fillStyle = 'rgba(255,214,150,0.75)';
      g.beginPath(); g.ellipse(x, y - lift - h / 2, w * 0.7, h * 0.9 + 14, 0, 0, TAU); g.fill(); g.restore();
    }
    g.translate(x, y); g.transform(1, 0, lean, 1, 0, 0);
    // the easel's legs
    g.strokeStyle = '#7a5642'; g.lineWidth = 2.4; g.lineCap = 'round';
    [[-w * 0.3, -w * 0.36], [w * 0.3, w * 0.36]].forEach(([a, b]) => { g.beginPath(); g.moveTo(a, -lift - h * 0.4); g.lineTo(b, 0); g.stroke(); });
    // frame, mat, and the work itself
    g.translate(-w / 2, -lift - h);
    g.fillStyle = '#4a3128'; g.beginPath(); g.roundRect(0, 0, w, h, 2); g.fill();
    g.fillStyle = '#fbf6ee'; g.fillRect(fr, fr, w - fr * 2, h - fr * 2);
    if (im.naturalWidth) g.drawImage(im, fr + mat, fr + mat, fw, ah); else { g.fillStyle = '#ddd5ca'; g.fillRect(fr + mat, fr + mat, fw, ah); }
    // a sheen across the glass
    const sheen = g.createLinearGradient(0, 0, w, h);
    sheen.addColorStop(0, 'rgba(255,255,255,0.18)'); sheen.addColorStop(0.5, 'rgba(255,255,255,0)'); sheen.addColorStop(1, 'rgba(255,240,220,0.12)');
    g.fillStyle = sheen; g.fillRect(fr, fr, w - fr * 2, h - fr * 2);
    if (lit) { g.strokeStyle = 'rgba(224,176,74,0.95)'; g.lineWidth = 2; g.beginPath(); g.roundRect(-3, -3, w + 6, h + 6, 4); g.stroke(); }
    g.restore();
  }

  // ---------- painted props ----------
  function buildProps() {
    const P = (k, fx, fy, s = 1) => ({ k, x: W * fx, y: H * fy, s });
    props = narrow
      ? [P('plant', 0.12, 0.42, 0.8), P('vase', 0.88, 0.42, 0.8), P('bust', 0.9, 0.96, 0.8)]
      : [P('vase', 0.13, 0.68), P('bust', 0.24, 0.97), P('plant', 0.05, 0.9), P('bench', 0.56, 0.98),
         P('urn', 0.88, 0.4), P('plant', 0.95, 0.94), P('vase', 0.82, 0.86, 0.9), P('plant', 0.9, 0.22, 0.85)];
    props.forEach((p) => { p.img = bake(p.x - 60 * p.s, p.y - 90 * p.s, 140 * p.s, 110 * p.s, (g) => drawProp(g, p)); });
  }
  function shadowUnder(g, x, y, w) { g.save(); g.filter = 'blur(6px)'; g.fillStyle = 'rgba(110,70,50,0.22)'; g.beginPath(); g.ellipse(x + w * 0.35, y, w, w * 0.28, 0, 0, TAU); g.fill(); g.restore(); }
  function plinth(g, x, y, w, h) {
    const pg = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
    pg.addColorStop(0, '#fffdf9'); pg.addColorStop(1, '#e6ded3');
    g.fillStyle = pg; g.beginPath(); g.roundRect(x - w / 2, y - h, w, h, 2); g.fill();
    g.fillStyle = '#fffefb'; g.beginPath(); g.ellipse(x, y - h, w / 2, w * 0.16, 0, 0, TAU); g.fill();
  }
  function drawProp(g, p) {
    const { x, y } = p, s = p.s;
    g.save();
    if (p.k === 'vase' || p.k === 'urn') {
      shadowUnder(g, x, y, 18 * s); plinth(g, x, y, 26 * s, 30 * s);
      const top = y - 30 * s, c1 = p.k === 'vase' ? '#e08a64' : '#7f9dcc', c2 = p.k === 'vase' ? '#a8492f' : '#34507e';
      const vg = g.createRadialGradient(x - 4 * s, top - 18 * s, 2, x, top - 14 * s, 16 * s);
      vg.addColorStop(0, c1); vg.addColorStop(1, c2);
      g.fillStyle = vg; g.beginPath();
      if (p.k === 'vase') { g.ellipse(x, top - 13 * s, 10 * s, 13 * s, 0, 0, TAU); g.fill(); g.beginPath(); g.roundRect(x - 4 * s, top - 32 * s, 8 * s, 9 * s, 2 * s); }
      else { g.ellipse(x, top - 11 * s, 12 * s, 10 * s, 0, 0, TAU); g.fill(); g.beginPath(); g.roundRect(x - 7 * s, top - 24 * s, 14 * s, 6 * s, 3 * s); }
      g.fill();
    } else if (p.k === 'bust') {
      shadowUnder(g, x, y, 18 * s); plinth(g, x, y, 26 * s, 34 * s);
      const top = y - 34 * s, bg = g.createRadialGradient(x - 3 * s, top - 22 * s, 2, x, top - 14 * s, 18 * s);
      bg.addColorStop(0, '#e2c27a'); bg.addColorStop(1, '#8a6a34');
      g.fillStyle = bg; g.beginPath(); g.roundRect(x - 10 * s, top - 10 * s, 20 * s, 10 * s, 5 * s); g.fill();
      g.beginPath(); g.ellipse(x, top - 19 * s, 6.5 * s, 8 * s, 0, 0, TAU); g.fill();
    } else if (p.k === 'plant') {
      shadowUnder(g, x, y, 16 * s);
      const pot = g.createLinearGradient(x - 9 * s, 0, x + 9 * s, 0); pot.addColorStop(0, '#d98a5c'); pot.addColorStop(1, '#a95a33');
      g.fillStyle = pot; g.beginPath(); g.moveTo(x - 10 * s, y - 16 * s); g.lineTo(x + 10 * s, y - 16 * s); g.lineTo(x + 7 * s, y); g.lineTo(x - 7 * s, y); g.fill();
      g.filter = 'blur(0.4px)';
      for (let k = 0; k < 9; k++) {
        const ang = -Math.PI / 2 + (k - 4) * 0.32, len = (18 + (k % 3) * 6) * s;
        g.fillStyle = k % 2 ? '#5f8a4a' : '#86ad66';
        g.save(); g.translate(x, y - 16 * s); g.rotate(ang + Math.PI / 2); g.beginPath(); g.ellipse(0, -len / 2, 4 * s, len / 2, 0, 0, TAU); g.fill(); g.restore();
      }
    } else if (p.k === 'bench') {
      shadowUnder(g, x, y, 34 * s);
      g.fillStyle = '#6e4630'; [-26, 22].forEach((dx) => g.fillRect(x + dx * s, y - 12 * s, 4 * s, 12 * s));
      const bg = g.createLinearGradient(0, y - 18 * s, 0, y - 10 * s); bg.addColorStop(0, '#a87250'); bg.addColorStop(1, '#7c5038');
      g.fillStyle = bg; g.beginPath(); g.roundRect(x - 32 * s, y - 18 * s, 64 * s, 7 * s, 3 * s); g.fill();
    }
    g.restore();
  }

  // invisible buttons over each work, so they can be hovered, focused and clicked
  function placeHits() {
    hits.innerHTML = '';
    workSprites.forEach((wk) => {
      const st = works[wk.i], b = document.createElement('button');
      b.type = 'button'; b.className = 'map-hit';
      b.setAttribute('aria-label', `${st.dataset.title}: read its label, or open it in the gallery`);
      Object.assign(b.style, { left: `${wk.box.x0}px`, top: `${wk.box.y0}px`, width: `${wk.box.x1 - wk.box.x0}px`, height: `${wk.box.y1 - wk.box.y0}px` });
      b.addEventListener('pointerenter', () => focusWork(wk.i));
      b.addEventListener('focus', () => focusWork(wk.i));
      b.addEventListener('pointerleave', () => blurWork(wk.i));
      b.addEventListener('blur', () => blurWork(wk.i));
      b.addEventListener('click', () => {
        if (noHover && armed !== wk.i) { armed = wk.i; focusWork(wk.i); return; }   // on touch, the first tap reads the label
        armed = -1; enter(wk.i);
      });
      hits.appendChild(b);
    });
    const cw = rx * 0.5, ch = ry * 0.5;
    Object.assign(center.style, { left: `${cx - cw / 2}px`, top: `${cy - ch / 2}px`, width: `${cw}px`, height: `${ch}px` });
  }

  // ---------- the visitor walks the path ----------
  // modes: 'entry' (s = 0..1 along the entry path), 'ring' (phi on the loop), 'spur' (t = 0..1 toward the center)
  const me = { placed: false, mode: 'entry', s: 0, phi: joinPhi(), t: 0, x: 0, y: 0, dir: 'back', step: 0, moving: false, wait: 0, look: -1, goal: null };
  let hovered = -1, centerHover = false, armed = -1;
  const SPEED = 80;   // px per second along the stones
  function pathPos() {
    if (me.mode === 'entry') { const k = me.s * (entry.length - 1), i = Math.min(entry.length - 2, Math.floor(k)), f = k - i; return [entry[i][0] + (entry[i + 1][0] - entry[i][0]) * f, entry[i][1] + (entry[i + 1][1] - entry[i][1]) * f]; }
    if (me.mode === 'spur') { const a = ringPt(Math.PI * 0.5), b = [cx, cy + ry * 0.36]; return [a[0] + (b[0] - a[0]) * me.t, a[1] + (b[1] - a[1]) * me.t]; }
    return ringPt(me.phi);
  }
  function setGoal(goal) { me.goal = goal; me.wait = 0; }
  function nextWander() { me.look = (Math.max(me.look, 0) + 1 + Math.floor(Math.random() * 2)) % works.length; setGoal({ work: me.look }); }
  const angDiff = (a, b) => { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };
  function stepVisitor(dt) {
    const before = pathPos();
    me.moving = false;
    if (!me.goal) { me.wait -= dt; if (me.wait <= 0 && !reduce) nextWander(); }
    else {
      const move = SPEED * dt;
      if (me.mode === 'entry') {
        me.s = Math.min(1, me.s + move / entryLen); me.moving = true;
        if (me.s >= 1) { me.mode = 'ring'; me.phi = joinPhi(); }
      } else if (me.mode === 'spur') {
        const len = ry * 0.7 + 1, toCenter = me.goal.center;
        me.t = Math.max(0, Math.min(1, me.t + (toCenter ? 1 : -1) * move / len)); me.moving = true;
        if (toCenter && me.t >= 1) arrive('front');
        if (!toCenter && me.t <= 0) me.mode = 'ring';
      } else {
        const target = me.goal.center ? Math.PI * 0.5 : workSprites[me.goal.work] ? workSprites[me.goal.work].a : me.phi;
        const d = angDiff(me.phi, target), arc = (rx * rPath + ry * rPath) / 2, dphi = move / arc;
        if (Math.abs(d) <= dphi) {
          me.phi = target;
          if (me.goal.center) { me.mode = 'spur'; me.t = 0; } else arrive(workSprites[me.goal.work].face);
        } else { me.phi += Math.sign(d) * dphi; me.moving = true; }
      }
    }
    const [x, y] = pathPos(), dx = x - before[0], dy = y - before[1];
    if (me.moving && Math.hypot(dx, dy) > 0.01) {
      me.dir = Math.abs(dx) > Math.abs(dy) * 1.2 ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'front' : 'back');
      me.step += dt * 11;
    }
    me.x = x; me.y = y;
  }
  function arrive(face) { me.goal = null; me.moving = false; me.dir = face; me.wait = 1.8 + Math.random() * 2; }

  // ---------- drawing ----------
  function draw(now) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.drawImage(ground, 0, 0, W, H);
    if (centerHover) {
      ctx.save(); ctx.translate(cx, cy); ctx.scale(1, ry / rx);
      const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, rx * 0.34);
      cg.addColorStop(0, 'rgba(255,206,150,0.85)'); cg.addColorStop(1, 'rgba(255,206,150,0)');
      ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(0, 0, rx * 0.34, 0, TAU); ctx.fill(); ctx.restore();
    }
    const items = [];
    workSprites.forEach((wk) => items.push({ y: wk.y, draw: () => place(hovered === wk.i ? wk.lit : wk.plain) }));
    props.forEach((p) => items.push({ y: p.y, draw: () => place(p.img) }));
    items.push({ y: me.y, draw: () => drawFigure(ctx, me.x, me.y, narrow ? 1 : 1.25, me.dir, me.step, me.moving && !reduce) });
    items.sort((a, b) => a.y - b.y).forEach((it) => it.draw());
  }

  let last = performance.now(), running = true;
  function loop(now) {
    if (!running) return;
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;   // the first frame can be stamped a hair early
    stepVisitor(dt); draw(now);
    requestAnimationFrame(loop);
  }

  // ---------- labels ----------
  function focusWork(i) {
    hovered = i;
    const wk = workSprites[i], st = works[i];
    tag.innerHTML = st.querySelector('.art-tag').innerHTML;
    const cta = tag.querySelector('.at-cta');
    if (cta) cta.textContent = noHover ? 'Tap again to see it in the gallery' : 'Click to see it in the gallery';
    tag.classList.add('show');
    // hang the label beside the work, on the side away from the center
    const r = museum.getBoundingClientRect(), tw = tag.offsetWidth, th = tag.offsetHeight;
    const fx = wk.x + r.left, fy = (wk.box.y0 + wk.box.y1) / 2 + r.top;
    let x = wk.x < cx ? fx - wk.w / 2 - tw - 18 : fx + wk.w / 2 + 18;
    let y = fy - th / 2;
    x = Math.max(12, Math.min(innerWidth - tw - 12, x)); y = Math.max(76, Math.min(innerHeight - th - 12, y));
    tag.style.left = `${x}px`; tag.style.top = `${y}px`;
    if (!reduce) { me.look = i; setGoal({ work: i }); }
  }
  function blurWork(i) { if (hovered === i) { hovered = -1; tag.classList.remove('show'); } }
  center.addEventListener('pointerenter', () => { centerHover = true; if (!reduce) setGoal({ center: true }); });
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
    museum.style.transformOrigin = `${cx}px ${cy}px`;
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
  if (reduce) { me.mode = 'ring'; me.phi = joinPhi(); }
  else setGoal({ work: 0 });     // walk in along the path to the first work
  requestAnimationFrame(loop);
  // arriving at #gallery (a reload or the back button) opens the room once gallery.js has loaded
  setTimeout(() => { if (location.hash === '#gallery') enter(0); }, 0);
})();
