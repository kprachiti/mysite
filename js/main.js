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

  // Pencil doodles: draw themselves in once visible
  const doodles = document.querySelectorAll('.doodle');
  const immediateDoodles = document.querySelectorAll('.doodle-underline, .doodle-spark');
  const scrollDoodles = document.querySelectorAll('.doodle-arrow');

  window.setTimeout(() => {
    immediateDoodles.forEach((d) => d.classList.add('drawn'));
  }, 500);

  if ('IntersectionObserver' in window && scrollDoodles.length) {
    const doodleObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('drawn');
            doodleObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    scrollDoodles.forEach((d) => doodleObserver.observe(d));
  } else {
    doodles.forEach((d) => d.classList.add('drawn'));
  }
});
