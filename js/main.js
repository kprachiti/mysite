// Autoplaying walkthrough videos stay paused for visitors who prefer reduced motion
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('video[autoplay]').forEach((v) => { v.removeAttribute('autoplay'); v.pause(); });
  });
}

// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Project tiles: a simple pencil frame round each cover (two light passes, corners slightly overshooting)
  document.querySelectorAll('.project-card .thumb').forEach((thumb, n) => {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'tile-frame');
    svg.setAttribute('viewBox', '0 0 1000 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    const j = (k) => (Math.sin(n * 7.1 + k * 3.7) * 0.6).toFixed(2);   // tiny, repeatable wobble
    const main = `M-6 ${2 + +j(1)} L1004 ${1.4 + +j(2)} M${998 + +j(3)} -3 L${999 + +j(4)} 103 M1006 ${98.6 + +j(5)} L-4 ${99 + +j(6)} M${1.2 + +j(7)} 104 L${0.8 + +j(8)} -4`;
    const faint = `M14 ${3.6 + +j(9)} L760 ${2.8 + +j(10)} M${996.5 + +j(11)} 30 L${997.4 + +j(12)} 96`;
    svg.innerHTML = `<g filter="url(#tile-graphite)"><path pathLength="1" d="${main}"/><path pathLength="1" class="faint" d="${faint}"/></g>`;
    thumb.before(svg);
    const fit = () => { svg.style.height = `${thumb.offsetHeight + 18}px`; };
    fit();
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(thumb);
  });
  if (document.querySelector('.tile-frame')) {
    const defs = document.createElement('div');
    defs.innerHTML = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="tile-graphite" x="-2%" y="-10%" width="104%" height="120%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="4" result="n"/>' +
      '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.75" result="g"/>' +
      '<feComposite in="SourceGraphic" in2="g" operator="in"/></filter></svg>';
    document.body.append(defs.firstChild);
  }

  // Project tiles: a pixel-halftone copy of each cover washes in on hover (same effect as the home lipstick)
  document.querySelectorAll('.project-card .thumb .photo > img').forEach((img) => {
    const name = (img.getAttribute('src') || '').split('/').pop().replace(/\.\w+$/, '');
    const ht = document.createElement('img');
    ht.className = 'thumb-ht';
    ht.alt = '';
    ht.setAttribute('aria-hidden', 'true');
    ht.src = img.getAttribute('src').replace(/[^/]+$/, `ht/${name}.webp`);
    img.after(ht);
    const card = img.closest('.project-card');
    const on = () => { card.classList.remove('ht-out'); card.classList.add('ht-in'); };
    const off = () => { if (card.classList.contains('ht-in')) { card.classList.remove('ht-in'); card.classList.add('ht-out'); } };
    card.addEventListener('mouseenter', on);
    card.addEventListener('mouseleave', off);
    card.addEventListener('focus', on);
    card.addEventListener('blur', off);
  });

  // Project tiles: the "View case study" label follows the cursor over the image (mouse only)
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.project-card .thumb').forEach((thumb) => {
      const cta = thumb.querySelector('.case-cta');
      if (!cta) return;
      thumb.addEventListener('pointermove', (e) => {
        const r = thumb.getBoundingClientRect();
        cta.style.setProperty('--cx', `${e.clientX - r.left}px`);
        cta.style.setProperty('--cy', `${e.clientY - r.top}px`);
        cta.classList.add('follow');
      });
    });
  }

  // Scroll-reveal animations
  const revealTargets = document.querySelectorAll(
    '.project-card, .case-section, .reveal, .paintings-grid figure'
  );

  if ('IntersectionObserver' in window && revealTargets.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('in-view'));
  }
});

// Review stars: each "★☆☆☆☆" rating becomes pencil-outlined stars, the earned ones coloured in
// with a quick highlighter scribble that strays a little outside the lines.
document.addEventListener('DOMContentLoaded', () => {
  const rows = document.querySelectorAll('.quote-card .stars[data-rating]');
  if (!rows.length) return;
  const NS = 'http://www.w3.org/2000/svg';

  // pencil grain for the outlines
  const defs = document.createElementNS(NS, 'svg');
  defs.setAttribute('width', '0');
  defs.setAttribute('height', '0');
  defs.setAttribute('aria-hidden', 'true');
  defs.style.position = 'absolute';
  defs.innerHTML =
    '<filter id="star-pencil" x="-15%" y="-15%" width="130%" height="130%">' +
    '<feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="5" result="n"/>' +
    '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.7" result="g"/>' +
    '<feComposite in="SourceGraphic" in2="g" operator="in"/></filter>';
  document.body.append(defs);

  let seed = 11;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) - 0.5;
  const f = (n) => n.toFixed(1);
  const star = (cx, cy, R, jit) => {
    let d = '';
    for (let i = 0; i <= 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? R * 0.45 : R;
      d += `${i ? 'L' : 'M'}${f(cx + Math.cos(a) * r + rand() * jit)} ${f(cy + Math.sin(a) * r + rand() * jit)} `;
    }
    return d;
  };
  // highlighter fill: a star-shaped swipe, a touch bigger and off-centre so it slips over the lines
  const scribble = () => star(12 + rand() * 2.4, 12.8 + rand() * 2.4, 10.4, 1.6) + 'Z';

  rows.forEach((row) => {
    const rating = Number(row.dataset.rating) || 0;
    row.textContent = '';
    for (let i = 0; i < 5; i++) {
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('class', i < rating ? 'star on' : 'star');
      svg.style.transform = `rotate(${f(rand() * 14)}deg)`;
      svg.innerHTML =
        (i < rating ? `<path class="star-hl" d="${scribble()}"/>` : '') +
        `<g filter="url(#star-pencil)"><path class="star-line" d="${star(12, 12.8, 10, 0.9)}Z"/>` +
        `<path class="star-line faint" d="${star(12.3, 12.5, 10.2, 1.2)}Z"/></g>`;
      row.append(svg);
    }
  });
});
