/* Samabe link tree — seamless entrance motion + subtle card tilt */

(function () {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealEls = Array.from(document.querySelectorAll('[data-reveal]'));

  /* ---- Staggered scroll reveal ---- */
  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const i = revealEls.indexOf(el);
          el.style.transitionDelay = Math.max(0, i) * 70 + 'ms';
          el.classList.add('is-in');
          obs.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---- Subtle pointer tilt on image cards (desktop only) ---- */
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!reduce && fine) {
    const cards = document.querySelectorAll('.card');
    const MAX = 5; // degrees

    cards.forEach((card) => {
      const media = card.querySelector('.card-media');

      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          'translateY(-6px) perspective(900px) rotateX(' +
          (-py * MAX).toFixed(2) + 'deg) rotateY(' +
          (px * MAX).toFixed(2) + 'deg)';
        if (media) {
          media.style.transform =
            'scale(1.07) translate(' +
            (px * -10).toFixed(1) + 'px,' + (py * -10).toFixed(1) + 'px)';
        }
      });

      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
        if (media) media.style.transform = '';
      });
    });
  }

  /* ---- Restaurant & Bar in-card slide-in panel ---- */
  const trigger   = document.getElementById('open-restaurant');
  const panel     = document.getElementById('rb-panel');
  const closeBtn  = document.getElementById('close-restaurant');
  const stageMain = document.getElementById('stage-main');
  const rbScroll  = panel ? panel.querySelector('.rb-scroll') : null;
  let lastFocus = null;

  function setMainInert(on) {
    if (!stageMain) return;
    if (on) {
      stageMain.setAttribute('inert', '');
      stageMain.setAttribute('aria-hidden', 'true');
    } else {
      stageMain.removeAttribute('inert');
      stageMain.removeAttribute('aria-hidden');
    }
  }

  function openPanel(e) {
    if (e) e.preventDefault();
    if (!panel || panel.classList.contains('is-open')) return;
    lastFocus = document.activeElement;
    if (rbScroll) rbScroll.scrollTop = 0;
    panel.setAttribute('aria-hidden', 'false');
    panel.classList.add('is-open');
    setMainInert(true);
    requestAnimationFrame(() => closeBtn && closeBtn.focus());
  }

  function closePanel() {
    if (!panel || !panel.classList.contains('is-open')) return;
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    setMainInert(false);
    // Return focus to the trigger (avoid stranding focus on the hidden back button)
    const back = (lastFocus && typeof lastFocus.focus === 'function' && lastFocus !== closeBtn)
      ? lastFocus
      : trigger;
    if (back && typeof back.focus === 'function') back.focus();
  }

  if (trigger && panel && closeBtn) {
    trigger.addEventListener('click', openPanel);
    closeBtn.addEventListener('click', closePanel);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) closePanel();
    });
  }
})();
