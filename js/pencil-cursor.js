// Sketched pencil cursor. The outline "boils" like hand-drawn animation and the pencil
// tilts with movement, lifts over links and presses on click.
// Mouse/trackpad only; with reduced motion, css/sketchbook.css keeps a static pencil instead.
(function () {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduced) return;

  const SIZE = 48 / 56;                         // rendered size / viewBox size
  const TIP_X = 4 * SIZE, TIP_Y = 52 * SIZE;    // graphite tip = hotspot
  const INTERACTIVE = 'a, button, [role="button"], label, summary, .lb-zoomable';

  const PENCIL = `
    <svg class="pencil-body" viewBox="0 0 56 56" aria-hidden="true">
      <defs>
        <filter id="pencil-wobble" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="1"/>
          <feDisplacementMap in="SourceGraphic" scale="1.6"/>
        </filter>
      </defs>
      <g filter="url(#pencil-wobble)">
        <g transform="translate(4 52) rotate(-45) scale(1.08)" stroke="#182449" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round">
          <path d="M10 -4.5 L3.6 -1.7 L0 0 L3.6 1.7 L10 4.5 Q8.6 3 10 1.5 Q8.6 0 10 -1.5 Q8.6 -3 10 -4.5 Z" fill="#f3dcb4"/>
          <path d="M0 0 L3.6 -1.7 L3.6 1.7 Z" fill="#182449"/>
          <path d="M10 -4.5 H38 V4.5 H10" fill="#f0dd8c"/>
          <path d="M10 -1.5 H38 M10 1.5 H38" stroke-width="0.6" opacity="0.55"/>
          <path d="M13 4.2 l2 -2.2 M17 4.2 l2 -2.2 M21 4.2 l2 -2.2 M25 4.2 l2 -2.2 M29 4.2 l2 -2.2 M33 4.2 l2 -2.2" stroke-width="0.55" opacity="0.6"/>
          <path d="M38 -4.5 H43 V4.5 H38 Z" fill="#cfd3d8"/>
          <path d="M39.7 -4.5 V4.5 M41.3 -4.5 V4.5" stroke-width="0.55"/>
          <path d="M43 -4.5 H47 Q49.5 -4.5 49.5 -2 V2 Q49.5 4.5 47 4.5 H43 Z" fill="#f0a8d4"/>
          <!-- second, offset pass of the outline = sketchy double line -->
          <path d="M0.4 0.3 L10.3 -4.2 H38.2 V4.8 H10.3 Z M38.2 -4.2 H47.2 Q49.8 -4.2 49.8 -1.8" fill="none" stroke-width="0.5" opacity="0.45"/>
        </g>
      </g>
    </svg>`;

  function init() {
    const cursor = document.createElement('div');
    cursor.className = 'pencil-cursor';
    cursor.innerHTML = PENCIL;
    cursor.style.transformOrigin = `${TIP_X}px ${TIP_Y}px`;
    document.body.append(cursor);
    document.documentElement.classList.add('pencil-on');

    const turb = cursor.querySelector('feTurbulence');
    let x = -100, y = -100, lastX = 0, lastT = 0;
    let tilt = 0, tiltTarget = 0;
    let running = false, seed = 1, lastBoil = 0;

    function frame(now) {
      tilt += (tiltTarget - tilt) * 0.15;
      tiltTarget *= 0.9;
      cursor.style.transform = `translate3d(${x - TIP_X}px, ${y - TIP_Y}px, 0) rotate(${tilt.toFixed(2)}deg)`;
      if (now - lastBoil > 140) {
        seed = (seed % 6) + 1;
        turb.setAttribute('seed', seed);
        lastBoil = now;
      }
      // keep boiling briefly after the mouse stops, then sleep until it moves again
      if (Math.abs(tilt) > 0.05 || now - lastT < 1500) {
        requestAnimationFrame(frame);
      } else {
        running = false;
      }
    }

    addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const now = performance.now();
      x = e.clientX; y = e.clientY;
      tiltTarget = Math.max(-18, Math.min(18, ((x - lastX) / Math.max(now - lastT, 1)) * 9));
      lastX = x; lastT = now;
      cursor.classList.add('visible');
      if (!running) { running = true; requestAnimationFrame(frame); }
    }, { passive: true });

    document.addEventListener('pointerover', (e) => {
      if (e.target.tagName === 'IFRAME') cursor.classList.remove('visible');
      cursor.classList.toggle('lifted', !!(e.target.closest && e.target.closest(INTERACTIVE)));
    }, { passive: true });

    addEventListener('pointerdown', () => cursor.classList.add('pressed'), { passive: true });
    addEventListener('pointerup', () => cursor.classList.remove('pressed'), { passive: true });
    document.addEventListener('mouseout', (e) => { if (!e.relatedTarget) cursor.classList.remove('visible'); });
    addEventListener('blur', () => cursor.classList.remove('visible'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
