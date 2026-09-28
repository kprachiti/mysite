// Home page sketches that draw themselves in pencil.
//  - Hero: hover a sticky note (or scroll it into view on touch) and a doodle appears beside it.
//  - "featured projects": an arrow sketches toward the work as it scrolls into view.
//  - Project cards: a themed doodle draws on the corner when the card scrolls in;
//    hovering a card underlines its title.
(function () {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Each doodle: viewBox + strokes. Stroke = [d, className?]. Strokes draw one after another.
  const DOODLES = {
    bubble: ['0 0 100 66', [
      ['M10 30 C8 12 82 4 88 24 C93 40 48 50 28 44 L14 58 L19 41 C12 38 10 34 10 30 Z'],
      ['M34 18 L34 38 M34 30 C38 24 46 24 46 38'],
      ['M55 29 L55 38 M55 21 L55.5 21.8'],
      ['M65 15 L64 31 M64 37 L64.5 37.6'],
    ]],
    hearts: ['0 0 90 80', [
      ['M30 62 C10 48 16 30 30 42 C44 30 50 48 30 62 Z', 'pink'],
      ['M62 36 C50 28 54 16 62 24 C70 16 74 28 62 36 Z', 'pink'],
      ['M78 14 C72 10 74 3 78 7 C82 3 84 10 78 14 Z', 'pink thin'],
    ]],
    steam: ['0 0 60 110', [
      ['M14 104 C2 88 24 78 12 60 C2 46 22 38 14 22'],
      ['M32 100 C22 86 42 76 32 58 C24 44 42 34 34 14'],
      ['M50 104 C42 92 58 84 50 70 C44 60 56 52 50 42', 'thin'],
    ]],
    arrow: ['0 0 120 90', [
      ['M6 14 C40 2 92 10 100 44 C104 60 98 72 90 82'],
      ['M76 72 L90 83 L97 66'],
    ]],
    underline: ['0 0 200 12', [
      ['M2 7 C40 3 80 10 120 6 S180 3 198 7'],
      ['M186 9 C140 12 90 8 26 11', 'thin'],
    ]],
    // themed corner doodles, keyed by case-study slug
    ibm: ['0 0 76 70', [
      ['M10 12 L64 10 L66 46 L8 48 Z'],
      ['M20 22 L27 28 L20 34'],
      ['M31 35 L42 35'],
      ['M31 48 L28 58 M43 47 L46 58 M20 59 L54 58'],
    ]],
    adobe: ['0 0 76 70', [
      ['M34 6 C36 24 40 28 58 31 C40 34 36 38 34 58 C32 38 28 34 10 31 C28 28 32 24 34 6 Z'],
      ['M60 6 C61 13 62 14 69 15 C62 16 61 17 60 24 C59 17 58 16 51 15 C58 14 59 13 60 6 Z', 'thin'],
      ['M62 48 L62 58 M57 53 L67 53', 'thin'],
    ]],
    haven: ['0 0 76 70', [
      ['M8 34 L38 8 L68 34'],
      ['M15 29 L15 62 L61 62 L61 29'],
      ['M38 54 C22 43 27 30 38 38 C49 30 54 43 38 54 Z', 'pink'],
    ]],
    wopet: ['0 0 76 70', [
      ['M26 56 C22 44 50 42 50 54 C50 62 28 64 26 56 Z'],
      ['M18 40 C12 34 18 26 23 32 C27 37 23 44 18 40 Z'],
      ['M30 30 C26 22 34 16 37 24 C39 30 33 35 30 30 Z'],
      ['M44 30 C44 22 52 20 52 28 C52 34 45 36 44 30 Z'],
      ['M56 42 C56 34 64 34 63 41 C62 47 56 48 56 42 Z'],
    ]],
  };

  function sketch(name, className) {
    const [viewBox, strokes] = DOODLES[name];
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', viewBox);
    svg.setAttribute('class', `sketch ${className}`);
    svg.setAttribute('aria-hidden', 'true');
    if (name === 'underline') svg.setAttribute('preserveAspectRatio', 'none');
    let delay = 0;
    strokes.forEach(([d, cls]) => {
      const p = document.createElementNS(SVG_NS, 'path');
      p.setAttribute('d', d);
      p.setAttribute('pathLength', '1');
      if (cls) p.setAttribute('class', cls);
      p.style.setProperty('--d', `${delay}s`);
      delay += 0.22;
      svg.append(p);
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

  function init() {
    // Hero sticky notes
    const board = document.querySelector('.sticky-board');
    if (board) {
      const pairs = [
        ['.note-name', sketch('bubble', 'sketch-bubble')],
        ['.note-empathy', sketch('hearts', 'sketch-hearts')],
        ['.note-blurb', sketch('steam', 'sketch-steam')],
      ];
      pairs.forEach(([sel, svg]) => {
        const note = board.querySelector(sel);
        if (!note) return;
        board.append(svg);
        if (canHover) {
          note.addEventListener('mouseenter', () => draw(svg, true));
          note.addEventListener('mouseleave', () => draw(svg, false));
        }
      });
      if (!canHover) {
        onScrollIn(board, () => pairs.forEach(([, svg]) => draw(svg, true)), 0.5);
      }
    }

    // Arrow from "featured projects" down to the work
    const tag = document.querySelector('.featured-tag');
    if (tag) {
      const arrow = sketch('arrow', 'sketch-arrow');
      tag.append(arrow);
      onScrollIn(tag, () => setTimeout(() => draw(arrow, true), 150), 1);
    }

    // Project cards: corner doodle on scroll, title underline on hover
    document.querySelectorAll('.project-card').forEach((card) => {
      const slug = (card.getAttribute('href') || '').replace(/^.*\/|\.html$/g, '');
      if (DOODLES[slug]) {
        const corner = sketch(slug, 'sketch-corner');
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
