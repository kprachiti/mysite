// Gallery home: the corner signage. Counts the works on the wall and keeps a quiet local clock.
(function () {
  const count = document.querySelector('.hud-count');
  if (count) count.textContent = document.querySelectorAll('.projects .project-card').length + ' works on view';

  const clock = document.querySelector('.hud-clock');
  if (!clock) return;
  const fmt = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit' });
  const tick = () => { clock.textContent = fmt.format(new Date()).toLowerCase(); };
  tick();
  setInterval(tick, 1000);
})();
