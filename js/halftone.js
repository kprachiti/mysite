// Halftone sweep for the home hero painting (the lipstick).
// A scan line moves down the painting, turning it into a dot grid in its own colours, with a band of
// chunky pixels riding the line; it holds, then a second sweep brings the painting back. Loops.
// Markup: <div class="halftone"><img ...><canvas aria-hidden="true"></canvas></div>
// The <img> stays as the fallback (no JS, reduced motion, or before the image loads).
(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  const CELL = 9;                 // dot grid pitch, in CSS px
  const SWEEP = 2300, HOLD = 1500; // ms
  const LOOP = 2 * (SWEEP + HOLD);
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  function setup(wrap) {
    const img = wrap.querySelector('img');
    const canvas = wrap.querySelector('canvas');
    if (!img || !canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, dpr = 1, cell = CELL, cols = 0, rows = 0, grid = null, running = false, visible = true;
    let pixGrid = null, pcols = 0, prows = 0, pcell = 0;

    // sample the painting into a grid of average colours (and coverage), once per size
    function sample(size) {
      const cs = Math.max(2, Math.round(size));
      const c = Math.ceil(W / cs), r = Math.ceil(H / cs);
      const off = document.createElement('canvas');
      off.width = c; off.height = r;
      const o = off.getContext('2d', { willReadFrequently: true });
      o.imageSmoothingQuality = 'high';
      o.drawImage(img, 0, 0, c, r);            // downscaling averages each cell for us
      return { data: o.getImageData(0, 0, c, r).data, c, r, cs };
    }

    function resize() {
      // on-screen size (already includes any zoom on the hero canvas), in device pixels
      const rect = wrap.getBoundingClientRect();
      const scale = rect.width / (img.offsetWidth || rect.width);   // < 1 when the hero is zoomed down
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(rect.width * dpr));
      H = Math.max(1, Math.round(rect.height * dpr));
      canvas.width = W; canvas.height = H;
      cell = Math.max(4, CELL * dpr * Math.max(scale, 0.6));       // keep dots readable on small screens
      const g = sample(cell); grid = g.data; cols = g.c; rows = g.r; cell = g.cs;
      const p = sample(cell * 2.4); pixGrid = p.data; pcols = p.c; prows = p.r; pcell = p.cs;
    }

    function dots(y0, y1, t) {
      const r0 = Math.max(0, Math.floor(y0 / cell)), r1 = Math.min(rows, Math.ceil(y1 / cell));
      for (let ry = r0; ry < r1; ry++) {
        for (let cx = 0; cx < cols; cx++) {
          const i = (ry * cols + cx) * 4;
          const a = grid[i + 3] / 255;
          if (a < 0.35) continue;
          const R = grid[i], G = grid[i + 1], B = grid[i + 2];
          const lum = (0.299 * R + 0.587 * G + 0.114 * B) / 255;
          // darker areas -> bigger dots; a gentle shimmer so the grid feels alive
          const shimmer = 0.88 + 0.12 * Math.sin(t / 260 + cx * 0.9 + ry * 1.7);
          const rad = (cell / 2) * (0.28 + 0.78 * Math.sqrt(1 - lum)) * shimmer * a;
          ctx.fillStyle = `rgb(${R},${G},${B})`;
          ctx.beginPath();
          ctx.arc(cx * cell + cell / 2, ry * cell + cell / 2, rad, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    function pixels(y0, y1) {
      const r0 = Math.max(0, Math.floor(y0 / pcell)), r1 = Math.min(prows, Math.ceil(y1 / pcell));
      for (let ry = r0; ry < r1; ry++) {
        for (let cx = 0; cx < pcols; cx++) {
          const i = (ry * pcols + cx) * 4;
          if (pixGrid[i + 3] < 90) continue;
          ctx.fillStyle = `rgb(${pixGrid[i]},${pixGrid[i + 1]},${pixGrid[i + 2]})`;
          ctx.fillRect(cx * pcell, ry * pcell, pcell + 0.5, pcell + 0.5);
        }
      }
    }

    function normal(y0, y1) {
      if (y1 <= y0) return;
      ctx.drawImage(img, 0, (y0 / H) * img.naturalHeight, img.naturalWidth, ((y1 - y0) / H) * img.naturalHeight, 0, y0, W, y1 - y0);
    }

    function frame(now) {
      if (!running) return;
      const t = now % LOOP;
      const band = pcell * 2;                  // height of the pixel band riding the scan line
      ctx.clearRect(0, 0, W, H);
      let front, above, below;                 // above/below = what the line leaves behind / has not reached
      if (t < SWEEP) { front = ease(t / SWEEP); above = 'dots'; below = 'normal'; }
      else if (t < SWEEP + HOLD) { front = 1.2; above = 'dots'; below = 'normal'; }
      else if (t < 2 * SWEEP + HOLD) { front = ease((t - SWEEP - HOLD) / SWEEP); above = 'normal'; below = 'dots'; }
      else { front = 1.2; above = 'normal'; below = 'dots'; }
      const y = front * (H + band) - band / 2;
      const draw = (kind, y0, y1) => (kind === 'dots' ? dots(y0, y1, now) : normal(y0, y1));
      draw(above, 0, Math.max(0, y - band / 2));
      draw(below, Math.min(H, y + band / 2), H);
      if (y > -band && y < H + band) pixels(y - band / 2, y + band / 2);
      requestAnimationFrame(frame);
    }

    function start() { if (!running && visible && !document.hidden) { running = true; requestAnimationFrame(frame); } }
    function stop() { running = false; }

    function init() {
      resize();
      wrap.classList.add('live');
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); }).observe(wrap);
      }
      document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
      let raf = 0;
      addEventListener('resize', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(resize); });
      start();
    }

    if (img.complete && img.naturalWidth) init();
    else img.addEventListener('load', init, { once: true });
  }

  const go = () => document.querySelectorAll('.halftone').forEach(setup);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
  else go();
})();
