// Gallery wall: hovering a piece re-renders it as ASCII, characters flickering in until the
// painting is all code; leaving lets the picture flicker back. Each character takes the colour
// of the image beneath it, and denser characters stand for darker areas.
(function () {
  const pieces = [...document.querySelectorAll('.salon .piece')];
  if (!pieces.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const RAMP = ' .,:;-=+*%#@';
  const CH = 8, CW = CH * 0.6;          // character cell, in CSS px

  // on touchscreens there's no hover, so drop the hint about it
  if (window.matchMedia('(hover: none)').matches) {
    const sub = document.querySelector('.salon-sub');
    if (sub) sub.textContent = 'A small gallery of case studies in UX and product design.';
  }

  pieces.forEach((piece) => {
    const art = piece.querySelector('.art'), img = art.querySelector('img'), cv = art.querySelector('.ascii');
    const g = cv.getContext('2d');
    let cells = [], cols = 0, rows = 0, w = 0, h = 0, dpr = 1, p = 0, target = 0, raf = 0, last = 0;

    function build() {
      if (!img.naturalWidth) return;
      w = art.clientWidth; h = art.clientHeight; dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      cols = Math.max(8, Math.floor(w / CW)); rows = Math.max(6, Math.floor(h / CH));
      // the same crop the picture shows (object-fit: cover at object-position)
      const iw = img.naturalWidth, ih = img.naturalHeight, scale = Math.max(w / iw, h / ih);
      const sw = w / scale, sh = h / scale;
      const [px, py] = (getComputedStyle(art).getPropertyValue('--pos').trim() || '50% 50%').split(/\s+/).map((v) => parseFloat(v) / 100);
      const sx = (iw - sw) * (isNaN(px) ? 0.5 : px), sy = (ih - sh) * (isNaN(py) ? 0.5 : py);
      const s = document.createElement('canvas'); s.width = cols; s.height = rows;
      const sg = s.getContext('2d'); sg.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
      const d = sg.getImageData(0, 0, cols, rows).data;
      // stretch each image's contrast first, so pale covers still become a full field of characters
      const L = [];
      for (let k = 0; k < d.length; k += 4) L.push((0.299 * d[k] + 0.587 * d[k + 1] + 0.114 * d[k + 2]) / 255);
      const sorted = L.slice().sort((a, b) => a - b), lo = sorted[Math.floor(L.length * 0.02)], hi = sorted[Math.floor(L.length * 0.98)];
      cells = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const i = r * cols + c, k = i * 4, R = d[k], G = d[k + 1], B = d[k + 2];
        const n = Math.min(1, Math.max(0, (L[i] - lo) / Math.max(0.05, hi - lo)));
        const ch = RAMP[Math.max(1, Math.min(RAMP.length - 1, Math.round(Math.pow(1 - n, 0.8) * (RAMP.length - 1))))];
        // pale areas drift toward ink so they still read on the paper; saturated colours keep their hue
        const m = L[i] > 0.7 ? 0.55 : 0.12, ink = [58, 51, 46];
        const col = `rgb(${(R * (1 - m) + ink[0] * m) | 0},${(G * (1 - m) + ink[1] * m) | 0},${(B * (1 - m) + ink[2] * m) | 0})`;
        cells.push({ x: c * (w / cols), y: (r + 0.82) * (h / rows), ch, col, t: Math.random() });
      }
      draw();
    }

    function draw() {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      cv.style.opacity = p > 0 ? '1' : '0';
      img.style.opacity = String(Math.max(0, 1 - p * 1.4));
      if (p <= 0) return;
      g.globalAlpha = Math.min(1, p * 1.5);
      g.fillStyle = '#f7f5f0'; g.fillRect(0, 0, w, h);
      g.globalAlpha = 1;
      g.font = `${CH + 1}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      g.textBaseline = 'alphabetic';
      for (const c of cells) {
        if (c.t > p || c.ch === ' ') continue;
        // characters at the leading edge flicker through random glyphs, like a screen redrawing
        const glyph = c.t > p - 0.12 ? RAMP[1 + ((Math.random() * (RAMP.length - 1)) | 0)] : c.ch;
        g.fillStyle = c.col; g.fillText(glyph, c.x, c.y);
      }
    }

    function tick(now) {
      raf = 0;
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
      p = target > p ? Math.min(target, p + dt / 0.38) : Math.max(target, p - dt / 0.32);
      draw();
      if (p !== target) raf = requestAnimationFrame(tick);
    }
    function go(t) {
      target = t;
      if (!cells.length) build();
      if (reduce) { p = t; draw(); return; }
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
    }

    piece.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') go(1); });
    piece.addEventListener('pointerleave', () => go(0));
    piece.addEventListener('focus', () => go(1));
    piece.addEventListener('blur', () => go(0));
    if (img.complete) build(); else img.addEventListener('load', build, { once: true });
    addEventListener('resize', () => { cells = []; if (p > 0) build(); });
  });
})();
