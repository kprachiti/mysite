// Home <-> About page transition helpers (loaded in <head> on those two pages; see css/page-transition.css).
(function () {
  const page = (url) => (new URL(url, location.href).pathname.match(/about(\.html)?$/) ? 'about' : 'home');

  // Leaving: only morph between home and about, and only when the board is on screen.
  addEventListener('pageswap', (e) => {
    if (!e.viewTransition) return;
    const to = e.activation && e.activation.entry && e.activation.entry.url;
    const board = document.querySelector('.sticky-board');
    const onScreen = board && board.getBoundingClientRect().bottom > 80;
    if (!to || page(to) === page(location.href) || !onScreen) e.viewTransition.skipTransition();
  });

  // Arriving: flag the transition so the headshot frame waits until the notes have settled.
  addEventListener('pagereveal', (e) => {
    if (!e.viewTransition) return;
    const root = document.documentElement;
    root.classList.add('vt-running');
    e.viewTransition.finished.finally(() => {
      root.classList.remove('vt-running');
      dispatchEvent(new Event('pk:transition-done'));
    });
  });
})();
