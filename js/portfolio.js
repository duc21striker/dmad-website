/* ============================================================
   DMAD — Portfolio Section Scripts
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     1. FILTER TABS
     ============================================================ */
  function initFilters() {
    const filters = document.querySelectorAll('.work-filter');
    const cards = document.querySelectorAll('.work-card-portfolio');
    if (!filters.length || !cards.length) return;

    filters.forEach((filter) => {
      filter.addEventListener('click', () => {
        const category = filter.dataset.filter;

        // Update active state
        filters.forEach((f) => {
          f.classList.remove('active');
          f.setAttribute('aria-selected', 'false');
        });
        filter.classList.add('active');
        filter.setAttribute('aria-selected', 'true');

        // Filter cards
        cards.forEach((card) => {
          const cardCats = (card.dataset.category || '').split(' ');
          const shouldShow = category === 'all' || cardCats.includes(category);

          if (shouldShow) {
            card.classList.remove('is-hidden');
            // Small re-entry animation
            card.style.animation = 'none';
            void card.offsetWidth; // force reflow
            card.style.animation = 'portfolioFadeIn 0.4s ease both';
          } else {
            card.classList.add('is-hidden');
          }
        });
      });
    });

    // Inject keyframes for the re-entry animation once
    if (!document.getElementById('portfolio-filter-keyframes')) {
      const style = document.createElement('style');
      style.id = 'portfolio-filter-keyframes';
      style.textContent = `
        @keyframes portfolioFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /* ============================================================
     2. SCROLL REVEAL FOR CARDS
     ============================================================ */
  function initScrollReveal() {
    const cards = document.querySelectorAll('.work-card-portfolio');
    if (!cards.length) return;

    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      cards.forEach((c) => c.classList.add('is-visible'));
      return;
    }

    // Inject reveal CSS once
    if (!document.getElementById('portfolio-reveal-styles')) {
      const style = document.createElement('style');
      style.id = 'portfolio-reveal-styles';
      style.textContent = `
        .work-card-portfolio {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.7s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .work-card-portfolio.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .work-card-portfolio.is-visible:hover {
          transform: translateY(-8px);
        }
      `;
      document.head.appendChild(style);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // Stagger based on position in viewport
            const delay = (i % 3) * 80;
            setTimeout(() => {
              entry.target.classList.add('is-visible');
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    );

    cards.forEach((card) => observer.observe(card));
  }

  /* ============================================================
     3. KEYBOARD ACCESSIBILITY FOR FILTERS
     ============================================================ */
  function initFilterKeyboard() {
    const filters = document.querySelectorAll('.work-filter');
    if (!filters.length) return;

    filters.forEach((filter) => {
      filter.addEventListener('keydown', (e) => {
        const currentIndex = Array.from(filters).indexOf(filter);
        let nextIndex = -1;

        if (e.key === 'ArrowRight') {
          nextIndex = (currentIndex + 1) % filters.length;
        } else if (e.key === 'ArrowLeft') {
          nextIndex = (currentIndex - 1 + filters.length) % filters.length;
        } else if (e.key === 'Home') {
          nextIndex = 0;
        } else if (e.key === 'End') {
          nextIndex = filters.length - 1;
        }

        if (nextIndex !== -1) {
          e.preventDefault();
          filters[nextIndex].focus();
          filters[nextIndex].click();
        }
      });
    });
  }

  /* ============================================================
     4. INIT
     ============================================================ */
  function init() {
    initFilters();
    initScrollReveal();
    initFilterKeyboard();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
