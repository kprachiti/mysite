// Doodle mode: click and drag on any empty part of the page to draw in pencil.
// Doodles stay on the page (they scroll with it) until the visitor erases them.
// Text, links and embeds are left alone so reading, selecting and clicking still work.
(function () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const NO_DRAW = 'a, button, input, textarea, select, label, summary, iframe, [contenteditable], ' +
    'p, h1, h2, h3, h4, h5, li, figcaption, blockquote, strong, em, .doodle-chip';
  const HINT_KEY = 'doodleHintSeen';
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const ERASER_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M4 16.5 13.5 7a2 2 0 0 1 2.8 0l3 3a2 2 0 0 1 0 2.8L12 20H7.5z" fill="#f0a8d4"/>' +
    '<path d="M9 11.5l5.5 5.5M7.5 20H20"/></svg>';
  const PENCIL_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M4 20l1-4L16 5l3 3L8 19z" fill="#f0dd8c"/><path d="M14 7l3 3"/></svg>';

  function readHint() { try { return localStorage.getItem(HINT_KEY) === '1'; } catch (e) { return false; } }
  function saveHint() { try { localStorage.setItem(HINT_KEY, '1'); } catch (e) {} }

  function init() {
    // Page-anchored layer: a 1×1 SVG with visible overflow, so drawings scroll with the content
    const layer = document.createElementNS(SVG_NS, 'svg');
    layer.setAttribute('class', 'doodle-layer');
    layer.setAttribute('width', '1');
    layer.setAttribute('height', '1');
    layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML =
      '<defs><filter id="graphite" x="-5%" y="-5%" width="110%" height="110%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="1" seed="3" result="grain"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="grain" scale="1.4"/></filter></defs>';
    document.body.append(layer);

    // Corner chip: a hint until the first doodle, then an eraser button while doodles exist
    const hint = document.createElement('div');
    hint.className = 'doodle-chip hint';
    hint.innerHTML = PENCIL_ICON + '<span>psst, click + drag to doodle</span>';
    hint.hidden = true;
    const eraser = document.createElement('button');
    eraser.type = 'button';
    eraser.className = 'doodle-chip';
    eraser.innerHTML = ERASER_ICON + '<span>Erase doodles</span>';
    eraser.hidden = true;
    document.body.append(hint, eraser);

    if (!readHint()) {
      setTimeout(() => { hint.hidden = false; }, 2200);
    }

    let path = null, d = '', px = 0, py = 0, sx = 0, sy = 0, armed = false;

    function begin(e) {
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      if (e.target.closest && e.target.closest(NO_DRAW)) return;
      e.preventDefault();                       // no text selection or image drag while drawing
      armed = true;
      sx = px = e.pageX; sy = py = e.pageY;
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', end, { once: true });
    }

    function move(e) {
      const x = e.pageX, y = e.pageY;
      if (!path) {
        if (Math.hypot(x - sx, y - sy) < 3) return;   // a plain click doesn't leave a dot
        document.documentElement.classList.add('doodling');
        path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('filter', 'url(#graphite)');
        layer.append(path);
        d = `M${sx.toFixed(1)} ${sy.toFixed(1)}`;
      }
      if (Math.hypot(x - px, y - py) < 2) return;
      // quadratic curve through midpoints = smooth, hand-drawn line
      d += ` Q${px.toFixed(1)} ${py.toFixed(1)} ${((px + x) / 2).toFixed(1)} ${((py + y) / 2).toFixed(1)}`;
      path.setAttribute('d', d);
      px = x; py = y;
    }

    function end() {
      document.removeEventListener('mousemove', move);
      document.documentElement.classList.remove('doodling');
      if (path) {
        path.setAttribute('d', d + ` L${px.toFixed(1)} ${py.toFixed(1)}`);
        eraser.hidden = false;
        if (!hint.hidden) {
          hint.classList.add('fade');
          setTimeout(() => { hint.hidden = true; }, 300);
        }
        saveHint();
      }
      path = null;
      armed = false;
    }

    eraser.addEventListener('click', () => {
      layer.classList.add('erasing');
      setTimeout(() => {
        layer.querySelectorAll('path').forEach((p) => p.remove());
        layer.classList.remove('erasing');
        eraser.hidden = true;
      }, 450);
    });

    document.addEventListener('mousedown', begin);
    document.addEventListener('dragstart', (e) => { if (armed) e.preventDefault(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
