// Gallery home: a round room you walk through.
// The wall is built from thin slices arranged in a circle; each .station hangs on it.
// Drag, scroll, swipe, arrow keys or the walk buttons turn the room; it glides, then settles on the nearest piece.
(function () {
  const room = document.querySelector('.room');
  if (!room) return;
  const stage = room.querySelector('.stage');
  const ring = room.querySelector('.ring');
  const walls = room.querySelector('.walls');
  const stations = [...ring.querySelectorAll('.station')];
  const idxEl = document.querySelector('.walk-idx');
  const titleEl = document.querySelector('.walk-title');
  const hint = document.querySelector('.walk-hint');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const n = stations.length, step = 360 / n;
  const R = 1000;                 // radius the work hangs at
  const RW = 1110;                // radius of the wall: far enough back that a flat 880px piece never pokes through
  const N = 40, segA = 360 / N;   // wall slices
  const wrap = (a) => ((a % 360) + 540) % 360 - 180;   // -180..180

  // ---- build the wall
  const segW = 2 * RW * Math.tan(Math.PI / N);
  const segs = [];
  for (let i = 0; i < N; i++) {
    const s = document.createElement('div');
    s.className = 'seg';
    Object.assign(s.style, {
      width: `${segW + 1.5}px`, left: `${-(segW + 1.5) / 2}px`,
      transform: `rotateY(${-i * segA}deg) translateZ(${-RW}px)`,
      backgroundSize: `${N * segW}px 100%`, backgroundPosition: `${-i * segW}px 0`,
    });
    walls.appendChild(s);
    segs.push({ el: s, a: i * segA, shown: true });
  }
  stations.forEach((st, i) => { st.style.transform = `rotateY(${-i * step}deg) translateZ(${-R}px)`; st._a = i * step; st._shown = true; });

  // ---- camera: perspective chosen so a piece fills about half the screen
  let P = 900;
  function fit() {
    const w = innerWidth, h = innerHeight;
    P = w <= 700 ? Math.min(0.9 * w * R / 620, 0.5 * h * R / 560) : Math.min(0.56 * w * R / 880, 0.6 * h * R / 520);
    stage.style.setProperty('--p', `${P}px`);
    dirty = true;
  }

  // ---- motion state
  let theta = 0, vel = 0, target = null, dragging = false, lastX = 0, moved = 0, pid = 0, phase = 0, dirty = true, cur = -1;

  function nearest(a) { return Math.round(a / step) * step; }
  function goTo(i) {
    const a = i * step;
    target = theta + wrap(a - theta);
    if (reduce) { theta = target; target = null; }
    dirty = true; kick();
  }
  function current() { return ((Math.round(theta / step) % n) + n) % n; }

  function render(dTheta) {
    const bob = reduce ? 0 : Math.sin(phase) * Math.min(3, Math.abs(dTheta) * 5);
    ring.style.transform = `translateY(${bob - 20}px) translateZ(${P}px) rotateY(${theta}deg)`;
    for (const s of segs) {
      const show = Math.abs(wrap(s.a - theta)) < 80;
      if (show !== s.shown) { s.el.style.visibility = show ? '' : 'hidden'; s.shown = show; }
    }
    for (const st of stations) {
      const rel = Math.abs(wrap(st._a - theta));
      const show = rel < 72;
      if (show !== st._shown) { st.style.visibility = show ? '' : 'hidden'; st._shown = show; }
      st.style.setProperty('--f', Math.max(0, 1 - rel / step).toFixed(3));
    }
    const c = current();
    if (c !== cur) {
      cur = c;
      if (idxEl) idxEl.textContent = `${c + 1} / ${n}`;
      if (titleEl) titleEl.textContent = stations[c].dataset.title || '';
    }
  }

  let raf = 0;
  function kick() { if (!raf) raf = requestAnimationFrame(tick); }
  function tick() {
    raf = 0;
    const before = theta;
    if (!dragging) {
      if (target !== null) {
        theta += (target - theta) * 0.085;
        if (Math.abs(target - theta) < 0.02) { theta = target; target = null; }
      } else if (Math.abs(vel) > 0.06) {
        theta += vel; vel *= 0.93;
      } else if (Math.abs(theta - nearest(theta)) > 0.02) {
        vel = 0; target = nearest(theta);
      }
    }
    const d = theta - before;
    phase += Math.abs(d) * 0.35;
    if (d !== 0 || dirty) { render(d); dirty = false; }
    if (dragging || target !== null || Math.abs(vel) > 0.06 || Math.abs(theta - nearest(theta)) > 0.02) kick();
  }

  function settled() { if (hint) hint.classList.add('gone'); }

  // ---- drag / swipe
  room.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    dragging = true; moved = 0; lastX = e.clientX; vel = 0; target = null; pid = e.pointerId;
    kick();
  });
  room.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx);
    // only take over the pointer once it's really a drag, so a plain click still opens the work
    if (moved > 6 && !room.classList.contains('dragging')) { room.setPointerCapture(pid); room.classList.add('dragging'); }
    const k = 52 / Math.max(innerWidth, 1);   // a full-width drag turns about one piece
    theta -= dx * k; vel = -dx * k; kick();
  });
  const end = () => { if (!dragging) return; dragging = false; room.classList.remove('dragging'); if (moved > 6) settled(); kick(); };
  room.addEventListener('pointerup', end);
  room.addEventListener('pointercancel', end);
  // a drag that ends on a work is not a click on it
  room.addEventListener('click', (e) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);

  // ---- scroll / trackpad
  room.addEventListener('wheel', (e) => {
    e.preventDefault();
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (reduce) { if (Math.abs(d) > 4 && target === null) goTo(current() + Math.sign(d)); return; }
    vel = Math.max(-4, Math.min(4, vel + d * 0.012)); target = null; settled(); kick();
  }, { passive: false });

  // ---- keys and buttons
  document.addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current() + 1); settled(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current() - 1); settled(); }
  });
  document.querySelector('.walk-next')?.addEventListener('click', () => { goTo(current() + 1); settled(); });
  document.querySelector('.walk-prev')?.addEventListener('click', () => { goTo(current() - 1); settled(); });
  // tabbing to a work walks you over to it
  stations.forEach((st, i) => st.addEventListener('focusin', () => goTo(i)));

  addEventListener('resize', () => { fit(); kick(); });
  fit(); render(0); kick();

  // ---- corner signage: works on view and a quiet local clock
  const count = document.querySelector('.hud-count');
  if (count) count.textContent = ring.querySelectorAll('.station.work').length + ' works on view';
  const clock = document.querySelector('.hud-clock');
  if (clock) {
    const fmt = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit' });
    const t = () => { clock.textContent = fmt.format(new Date()).toLowerCase(); };
    t(); setInterval(t, 1000);
  }
})();
