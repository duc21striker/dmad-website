/* ============================================================
   MERIDIAN & CO. — Main Script v2
   Author: DMAD
   ============================================================ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     1. PRELOADER
     ============================================================ */
  function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    let hidden = false;
    const hide = () => {
      if (hidden) return;
      hidden = true;
      preloader.classList.add('done');
      setTimeout(() => preloader.remove(), 700);
    };

    if (document.readyState === 'complete') {
      setTimeout(hide, 2600);
    } else {
      window.addEventListener('load', () => setTimeout(hide, 2600), { once: true });
    }

    // Fail-safe
    setTimeout(hide, 5000);
  }

  /* ============================================================
     2. NAV SCROLL
     ============================================================ */
  function initNavScroll() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    let ticking = false;
    const update = () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
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
     3. MOBILE NAV
     ============================================================ */
  function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMobile');
    if (!toggle || !menu) return;

    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-hidden', String(!open));
      menu.classList.toggle('open', open);
      document.body.classList.toggle('nav-open', open);
    };

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      setOpen(!isOpen);
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setOpen(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* ============================================================
     4. REVEAL
     ============================================================ */
  function initReveal() {
    if (prefersReducedMotion) {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const parent = entry.target.parentElement;
          if (parent) {
            const siblings = Array.from(parent.querySelectorAll(':scope > .reveal'));
            const index = siblings.indexOf(entry.target);
            entry.target.style.transitionDelay = `${Math.max(0, index) * 90}ms`;
          }

          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  }

  /* ============================================================
     5. STATS COUNT-UP
     ============================================================ */
  function initStats() {
    const stats = document.querySelectorAll('[data-count]');
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
     6. FAQ
     ============================================================ */
  function initFAQ() {
    const buttons = document.querySelectorAll('.faq__q');
    const answerEl = document.getElementById('faqAnswer');
    const titleEl = document.getElementById('faqAnswerTitle');
    const textEl = document.getElementById('faqAnswerText');
    if (!buttons.length || !answerEl) return;

    const data = [
      {
        q: 'What types of businesses do you work with?',
        a: 'We work with businesses across manufacturing, retail, fintech, healthcare, education, and professional services. Our clients range from early-stage startups to established groups with 100+ employees.',
      },
      {
        q: 'How long does a typical engagement last?',
        a: 'Most engagements run between 6 and 16 weeks, depending on scope. We also offer ongoing advisory retainers for businesses that need continuous support.',
      },
      {
        q: 'Do you work with startups or established companies?',
        a: 'Both. Our work with startups tends to focus on fundraising, financial modelling, and go-to-market strategy. Our work with established companies tends to focus on operations, structure, and expansion.',
      },
      {
        q: 'What is your fee structure?',
        a: 'We work on a fixed-fee basis for defined engagements and a monthly retainer for ongoing advisory. We will give you a clear scope and price before any work begins.',
      },
      {
        q: 'Do you work remotely or on-site?',
        a: 'Both. Most discovery and strategy work happens remotely. For operational engagements, we typically spend time on-site with your team.',
      },
      {
        q: 'How do we get started?',
        a: 'Book a 30-minute introductory call. We will listen, ask questions, and tell you honestly whether we are the right fit.',
      },
    ];

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const idx = parseInt(btn.dataset.faq, 10);
        const item = data[idx];
        if (!item) return;

        answerEl.style.opacity = '0';
        answerEl.style.transform = 'translateY(10px)';

        setTimeout(() => {
          titleEl.textContent = item.q;
          textEl.textContent = item.a;
          answerEl.style.opacity = '1';
          answerEl.style.transform = 'translateY(0)';
        }, 150);
      });
    });
  }

  /* ============================================================
     7. ACCORDION (Difference Section)
     ============================================================ */
  function initAccordion() {
    const items = document.querySelectorAll('.accordion__item');
    if (!items.length) return;

    items.forEach((item) => {
      const trigger = item.querySelector('.accordion__trigger');
      if (!trigger) return;

      trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all
        items.forEach((i) => {
          i.classList.remove('active');
          const t = i.querySelector('.accordion__trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        });

        // Toggle current
        if (!isActive) {
          item.classList.add('active');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ============================================================
     8. CONTACT FORM
     ============================================================ */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = form.querySelector('#name');
      const email = form.querySelector('#email');
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!name.value.trim()) { name.focus(); return; }
      if (!emailPattern.test(email.value.trim())) { email.focus(); return; }

      // Replace with real backend:
      // fetch('/api/contact', { method: 'POST', body: new FormData(form) })

      alert('Thank you. We will be in touch within one business day.');
      form.reset();
    });
  }

  /* ============================================================
     9. NEWSLETTER
     ============================================================ */
  function initNewsletterForm() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(input.value.trim())) { input.focus(); return; }

      alert('Subscribed.');
      form.reset();
    });
  }

  /* ============================================================
     10. HERO PARALLAX
     ============================================================ */
  function initHeroParallax() {
    if (prefersReducedMotion) return;
    if (window.innerWidth < 1024) return;

    const heroContent = document.querySelector('.hero__content');
    const heroCards = document.querySelector('.hero__cards');
    if (!heroContent) return;

    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      if (y < vh) {
        const factor = y / vh;
        heroContent.style.transform = `translateY(${y * 0.12}px)`;
        heroContent.style.opacity = String(Math.max(0, 1 - factor * 1.1));
        if (heroCards) {
          heroCards.style.transform = `translateY(${y * 0.06}px)`;
          heroCards.style.opacity = String(Math.max(0, 1 - factor * 0.9));
        }
      }
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ============================================================
     11. SMOOTH ANCHORS (fallback)
     ============================================================ */
  function initSmoothAnchors() {
    if ('scrollBehavior' in document.documentElement.style) return;

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
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
    initPreloader();
    initNavScroll();
    initMobileNav();
    initReveal();
    initStats();
    initFAQ();
    initAccordion();
    initContactForm();
    initNewsletterForm();
    initHeroParallax();
    initSmoothAnchors();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
