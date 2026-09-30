// Doodle mode: click and drag on any empty part of the page to draw in pencil.
// Doodles scroll with the page and stay for about a second, then fade away on their own.
// Text, links and embeds are left alone so reading, selecting and clicking still work.
// A switch in the footer turns doodle mode on/off; the choice is remembered on this browser.
(function () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const NO_DRAW = 'a, button, input, textarea, select, label, summary, iframe, [contenteditable], ' +
    'p, h1, h2, h3, h4, h5, li, figcaption, blockquote, strong, em, .doodle-chip, .lb-zoomable, .lb, .project-card';
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const PENCIL_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M4 20l1-4L16 5l3 3L8 19z" fill="#f0dd8c"/><path d="M14 7l3 3"/></svg>';


  const STORE_KEY = 'doodleMode';
  const TIP_KEY = 'doodleTipClosed';
  let enabled = true, tipClosed = false;
  try {
    enabled = localStorage.getItem(STORE_KEY) !== 'off';
    tipClosed = sessionStorage.getItem(TIP_KEY) === '1';   // closed tip stays closed for this visit only
    localStorage.removeItem(TIP_KEY);                        // clear the old permanent flag
  } catch (e) {}

  function init() {
    // Page-anchored layer: a 1×1 SVG with visible overflow, so drawings scroll with the content
    const layer = document.createElementNS(SVG_NS, 'svg');
    layer.setAttribute('class', 'doodle-layer');
    layer.setAttribute('width', '1');
    layer.setAttribute('height', '1');
    layer.setAttribute('aria-hidden', 'true');
    // graphite grain: speckled, slightly wobbly stroke (shared with js/sketches.js)
    layer.innerHTML =
      '<defs><filter id="graphite" x="-10%" y="-10%" width="120%" height="120%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="7" result="noise"/>' +
      '<feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.75" result="grain"/>' +
      '<feComposite in="SourceGraphic" in2="grain" operator="in" result="grainy"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="2" result="warp"/>' +
      '<feDisplacementMap in="grainy" in2="warp" scale="1.8"/></filter></defs>';
    document.body.append(layer);

    // Pop-up index card in the lower-right corner: slides in shortly after the page loads and
    // stays until the visitor closes it; once closed it doesn't come back on other pages this visit.
    const hint = document.createElement('div');
    hint.className = 'doodle-chip hint';
    hint.setAttribute('role', 'status');
    hint.innerHTML = PENCIL_ICON + '<span>click + drag anywhere to doodle</span>' +
      '<button type="button" class="doodle-chip-close" aria-label="Close tip">&times;</button>';
    hint.hidden = true;
    document.body.append(hint);

    hint.querySelector('.doodle-chip-close').addEventListener('click', () => {
      tipClosed = true;
      try { sessionStorage.setItem(TIP_KEY, '1'); } catch (e) {}
      hint.classList.add('fade');
      setTimeout(() => { hint.hidden = true; }, 350);
    });
    // On the home page, wait for the opening animation to turn to home before showing the tip
    const root = document.documentElement;
    if (root.classList.contains('intro-run')) {
      const obs = new MutationObserver(() => {
        if (root.classList.contains('intro-run')) return;
        obs.disconnect();
        setTimeout(() => { hint.hidden = !enabled || tipClosed; }, 900);
      });
      obs.observe(root, { attributes: true, attributeFilter: ['class'] });
    } else {
      setTimeout(() => { hint.hidden = !enabled || tipClosed; }, 2400);
    }

    // The line is drawn as a chain of short segments; each one holds for about a second, then fades out
    // (CSS animation), so the doodle trails away behind the pencil.
    const SEGMENT = 6;                          // curve pieces per segment
    let seg = null, d = '', count = 0, px = 0, py = 0, sx = 0, sy = 0, drawing = false, armed = false;

    function newSegment(x, y) {
      seg = document.createElementNS(SVG_NS, 'path');
      seg.setAttribute('filter', 'url(#graphite)');
      const self = seg;
      self.addEventListener('animationend', () => self.remove(), { once: true });
      layer.append(self);
      d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
      count = 0;
    }

    function begin(e) {
      if (!enabled) return;
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      if (e.target.closest && e.target.closest(NO_DRAW)) return;
      e.preventDefault();                       // no text selection or image drag while drawing
      armed = true;
      drawing = false;
      sx = px = e.pageX; sy = py = e.pageY;
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', end, { once: true });
    }

    function move(e) {
      const x = e.pageX, y = e.pageY;
      if (!drawing) {
        if (Math.hypot(x - sx, y - sy) < 3) return;   // a plain click doesn't leave a dot
        drawing = true;
        document.documentElement.classList.add('doodling');
        newSegment(sx, sy);
      }
      if (Math.hypot(x - px, y - py) < 2) return;
      // quadratic curve through midpoints = smooth, hand-drawn line
      const mx = (px + x) / 2, my = (py + y) / 2;
      d += ` Q${px.toFixed(1)} ${py.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
      seg.setAttribute('d', d);
      px = x; py = y;
      if (++count >= SEGMENT) newSegment(mx, my);     // next piece starts where this one ends
    }

    function end() {
      document.removeEventListener('mousemove', move);
      document.documentElement.classList.remove('doodling');
      if (drawing) {
        seg.setAttribute('d', d + ` L${px.toFixed(1)} ${py.toFixed(1)}`);
      }
      seg = null;
      drawing = false;
      armed = false;
    }

    // Footer switch
    const footer = document.querySelector('.site-footer .footer-nav');
    if (footer) {
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'doodle-toggle';
      toggle.setAttribute('role', 'switch');
      toggle.innerHTML = PENCIL_ICON + '<span>DOODLE MODE</span><span class="doodle-toggle-track" aria-hidden="true"></span>';
      const sync = () => {
        toggle.setAttribute('aria-checked', String(enabled));
        document.documentElement.classList.toggle('doodle-off', !enabled);
      };
      toggle.addEventListener('click', () => {
        enabled = !enabled;
        try { localStorage.setItem(STORE_KEY, enabled ? 'on' : 'off'); } catch (e) {}
        if (!enabled && !hint.hidden) {
          hint.classList.add('fade');
          setTimeout(() => { hint.hidden = true; hint.classList.remove('fade'); }, 350);
        }
        sync();
      });
      sync();
      footer.append(toggle);
    }

    document.addEventListener('mousedown', begin);
    document.addEventListener('dragstart', (e) => { if (armed) e.preventDefault(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
