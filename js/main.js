// Intro (letter stickers, doodled frame, page turn) cleanup
if (document.documentElement.classList.contains('intro-run')) {
  setTimeout(() => {
    document.documentElement.classList.remove('intro-run');
    const overlay = document.getElementById('intro-overlay');
    if (overlay) overlay.remove();
  }, 6100);
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
