/* ============================================================
   MERIDIAN & CO. — Case Study Script
   Author: DMAD
   Depends on: script.js (for shared utilities; runs on top)
   ============================================================ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     1. STATS COUNT-UP (scoped to case page)
     ============================================================ */
  function initCaseStats() {
    const stats = document.querySelectorAll('.case-page [data-count]');
    if (!stats.length) return;

    if (prefersReducedMotion) {
      stats.forEach((el) => {
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        el.textContent = prefix + el.dataset.count + suffix;
      });
      return;
    }

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const animate = (el) => {
      const target = parseFloat(el.dataset.count);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const duration = 1600;
      const start = performance.now();

      const frame = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = easeOutCubic(progress);
        const value = Math.floor(eased * target);
        el.textContent = prefix + value + suffix;

        if (progress < 1) {
          requestAnimationFrame(frame);
        } else {
          el.textContent = prefix + target + suffix;
        }
      };

      requestAnimationFrame(frame);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    stats.forEach((el) => observer.observe(el));
  }

  /* ============================================================
     2. STICKY SIDEBAR SENTINEL
     ------------------------------------------------------------
     On desktop, the sidebar is sticky. We add a subtle class
     when it becomes "stuck" so we can style it slightly differently
     (e.g. add a shadow or gold accent line).
     ============================================================ */
  function initStickySidebar() {
    if (window.innerWidth < 1024) return;

    const sidebars = document.querySelectorAll('.glance__sidebar, .case-section__text');
    if (!sidebars.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (entry.intersectionRatio < 1) {
            el.classList.add('is-stuck');
          } else {
            el.classList.remove('is-stuck');
          }
        });
      },
      { threshold: [1] }
    );

    sidebars.forEach((el) => observer.observe(el));
  }

  /* ============================================================
     3. READING PROGRESS BAR
     ------------------------------------------------------------
     Thin gold bar at the top of the page showing scroll progress.
     Fits the editorial feel — subtle, useful, on-brand.
     ============================================================ */
  function initReadingProgress() {
    if (prefersReducedMotion) return;

    const bar = document.createElement('div');
    bar.className = 'reading-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    let ticking = false;

    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
      bar.style.transform = `scaleX(${progress})`;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  }

  /* ============================================================
     4. RELATED CARD HOVER PRELOAD (optional, subtle)
     ------------------------------------------------------------
     On hover, we do a very light preload signal — nothing
     network-heavy. Just a class toggle for future use.
     ============================================================ */
  function initRelatedCards() {
    const cards = document.querySelectorAll('.related-card');
    if (!cards.length) return;

    cards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        card.classList.add('is-hovered');
      });
      card.addEventListener('mouseleave', () => {
        card.classList.remove('is-hovered');
      });
    });
  }

  /* ============================================================
     5. SMOOTH SCROLL FOR ON-PAGE ANCHORS
     ============================================================ */
  function initCaseAnchors() {
    document.querySelectorAll('.case-page a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('href');
        if (id === '#' || id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* ============================================================
     INIT
     ============================================================ */
  function init() {
    initCaseStats();
    initStickySidebar();
    initReadingProgress();
    initRelatedCards();
    initCaseAnchors();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();