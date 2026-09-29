// Lightbox for case-study images: click (or Enter/Space on) any image in the page content to
// see it larger. Arrow keys / buttons step through the page's images; Esc, the × button or a
// click on the backdrop closes it, and focus returns to the image that opened it.
(function () {
  function init() {
    const imgs = [...document.querySelectorAll('main img')].filter((img) => !img.closest('a, .lb'));
    if (!imgs.length) return;

    imgs.forEach((img, i) => {
      img.classList.add('lb-zoomable');
      img.tabIndex = 0;
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', `Enlarge image: ${img.alt || 'project image'}`);
      img.addEventListener('click', () => open(i));
      img.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
      });
    });

    const box = document.createElement('div');
    box.className = 'lb';
    box.hidden = true;
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Image viewer');
    box.innerHTML = `
      <button type="button" class="lb-close" aria-label="Close">&times;</button>
      <button type="button" class="lb-nav lb-prev" aria-label="Previous image">&larr;</button>
      <figure class="lb-figure">
        <img class="lb-img" alt="">
        <figcaption class="lb-caption"></figcaption>
      </figure>
      <button type="button" class="lb-nav lb-next" aria-label="Next image">&rarr;</button>
      <div class="lb-count" aria-live="polite"></div>`;
    document.body.append(box);

    const big = box.querySelector('.lb-img');
    const caption = box.querySelector('.lb-caption');
    const count = box.querySelector('.lb-count');
    const closeBtn = box.querySelector('.lb-close');
    const prevBtn = box.querySelector('.lb-prev');
    const nextBtn = box.querySelector('.lb-next');
    let index = 0, opener = null;

    function show(i) {
      index = (i + imgs.length) % imgs.length;
      const img = imgs[index];
      big.src = img.currentSrc || img.src;
      big.alt = img.alt;
      // small screenshots get scaled up (to 1.75× their file size) so the view is actually larger;
      // max-width / max-height in the CSS still keep it on screen
      big.style.width = img.naturalWidth ? `${Math.round(img.naturalWidth * 1.75)}px` : '';
      caption.textContent = img.dataset.caption || img.alt;   // data-caption: a lightbox-only caption
      count.textContent = `${index + 1} / ${imgs.length}`;
      const single = imgs.length < 2;
      prevBtn.hidden = single;
      nextBtn.hidden = single;
    }

    function open(i) {
      opener = document.activeElement;
      show(i);
      box.hidden = false;
      document.documentElement.classList.add('lb-open');
      requestAnimationFrame(() => box.classList.add('lb-visible'));
      closeBtn.focus();
    }

    function close() {
      box.classList.remove('lb-visible');
      document.documentElement.classList.remove('lb-open');
      setTimeout(() => { box.hidden = true; }, 200);
      if (opener && opener.focus) opener.focus();
    }

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', () => show(index - 1));
    nextBtn.addEventListener('click', () => show(index + 1));
    box.addEventListener('click', (e) => { if (e.target === box) close(); });

    document.addEventListener('keydown', (e) => {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(index - 1);
      else if (e.key === 'ArrowRight') show(index + 1);
      else if (e.key === 'Tab') {
        // keep focus inside the viewer
        const focusables = [closeBtn, prevBtn, nextBtn].filter((b) => !b.hidden);
        const at = focusables.indexOf(document.activeElement);
        e.preventDefault();
        focusables[(at + (e.shiftKey ? -1 : 1) + focusables.length) % focusables.length].focus();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
