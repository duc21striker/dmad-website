/* ============================================================
   DMAD — Motion & interaction layer
   Apple-design skill: real springs via Motion.
   ============================================================ */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Wait for Motion to be available (loaded via module script in HTML) */
  function onMotionReady(cb) {
    if (window.__motion) return cb(window.__motion);
    window.addEventListener('motion:ready', () => cb(window.__motion), { once: true });
  }

  /* ---------- Preloader ---------- */
  function initPreloader() {
    const pre = document.getElementById('preloader');
    if (!pre) return;
    const hide = () => {
      pre.classList.add('done');
      setTimeout(() => pre.remove(), 700);
    };
    if (document.readyState === 'complete') setTimeout(hide, 1200);
    else window.addEventListener('load', () => setTimeout(hide, 1200), { once: true });
    setTimeout(hide, 3500);
  }

  /* ---------- Nav scroll state ---------- */
  function initNavScroll() {
    const nav = document.getElementById('nav');
    if (!nav) return;
    let ticking = false;
    const update = () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  /* ---------- Mobile nav ---------- */
  function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (!toggle || !links) return;
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      links.classList.toggle('is-open', !open);
    });
    links.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        links.classList.remove('is-open');
      });
    });
  }

  /* ---------- Theme toggle ---------- */
  function initTheme() {
    const btn = document.getElementById('themeToggle');
    const icon = document.getElementById('themeIcon');
    const html = document.documentElement;
    if (!btn || !icon) return;

    const saved = localStorage.getItem('dmad-theme');
    if (saved === 'dark' || (!saved && matchMedia('(prefers-color-scheme: dark)').matches)) {
      html.setAttribute('data-theme', 'dark');
      icon.className = 'fas fa-sun';
    } else {
      icon.className = 'fas fa-moon';
    }

    btn.addEventListener('click', () => {
      const isDark = html.getAttribute('data-theme') === 'dark';
      if (isDark) {
        html.removeAttribute('data-theme');
        localStorage.setItem('dmad-theme', 'light');
        icon.className = 'fas fa-moon';
      } else {
        html.setAttribute('data-theme', 'dark');
        localStorage.setItem('dmad-theme', 'dark');
        icon.className = 'fas fa-sun';
      }
    });
  }

  /* ---------- Responsive press on buttons (real spring) ---------- */
  function initSpringPress(motion) {
    if (reduceMotion) return;
    const pressables = document.querySelectorAll('[data-spring-press]');
    if (!pressables.length) return;

    const { animate, spring } = motion;

    pressables.forEach((el) => {
      // Store the current scale in a data attr so we can interrupt cleanly
      let releaseTimer = null;

      const press = () => {
        if (releaseTimer) { clearTimeout(releaseTimer); releaseTimer = null; }
        animate(el, { scale: 0.96 }, {
          type: 'spring',
          stiffness: 600,
          damping: 30,
          mass: 0.6
        });
      };

      const release = () => {
        animate(el, { scale: 1 }, {
          type: 'spring',
          stiffness: 400,
          damping: 22,
          mass: 0.6
        });
      };

      el.addEventListener('pointerdown', press, { passive: true });
      el.addEventListener('pointerup', release);
      el.addEventListener('pointercancel', release);
      el.addEventListener('pointerleave', release);
    });
  }

  /* ---------- Reveal on scroll (spring stagger) ---------- */
  function initReveal(motion) {
    const els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;

    if (reduceMotion) {
      els.forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    const { animate, spring } = motion;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        // Group siblings for stagger
        const parent = entry.target.parentElement;
        let delay = 0;
        if (parent) {
          const sibs = Array.from(parent.querySelectorAll(':scope > [data-reveal]'));
          const idx = sibs.indexOf(entry.target);
          delay = Math.min(idx * 0.06, 0.3);
        }

        setTimeout(() => {
          animate(
            entry.target,
            { opacity: 1, y: [24, 0] },
            {
              type: 'spring',
              stiffness: 220,
              damping: 28,
              mass: 0.8
            }
          );
        }, delay * 1000);

        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    els.forEach((el) => observer.observe(el));
  }

  /* ---------- Card hover springs ---------- */
  function initSpringHover(motion) {
    if (reduceMotion) return;
    const hoverables = document.querySelectorAll('[data-spring-hover]');
    if (!hoverables.length) return;

    const { animate, spring } = motion;

    hoverables.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        animate(el, { y: -4 }, {
          type: 'spring',
          stiffness: 350,
          damping: 25,
          mass: 0.7
        });
      });
      el.addEventListener('mouseleave', () => {
        animate(el, { y: 0 }, {
          type: 'spring',
          stiffness: 350,
          damping: 25,
          mass: 0.7
        });
      });
    });
  }

  /* ---------- Icon rotation on card hover ---------- */
  function initIconRotation() {
    if (reduceMotion) return;
    document.querySelectorAll('[data-spring-hover]').forEach((card) => {
      const icon = card.querySelector('.info-card__icon, .service-card__icon, .step-card__icon');
      if (!icon) return;

      card.addEventListener('mouseenter', () => {
        icon.style.transform = 'rotate(-6deg) scale(1.06)';
      });
      card.addEventListener('mouseleave', () => {
        icon.style.transform = '';
      });
    });
  }

  /* ---------- Smooth anchor scroll ---------- */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (!id || id === '#' || id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.pageYOffset - 90;
        window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });
  }

  /* ---------- Contact form ---------- */
  function initForm() {
    const form = document.getElementById('dmadContactForm');
    if (!form) return;
    const btn = document.getElementById('dmadSubmitBtn');
    const status = document.getElementById('dmadFormStatus');
    if (!btn || !status) return;

    const originalHTML = btn.innerHTML;

    const setStatus = (msg, type) => {
      status.textContent = msg;
      status.className = 'form-status ' + (type || '');
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      status.className = 'form-status';
      btn.disabled = true;
      btn.innerHTML = 'Sending...';

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });

        if (res.ok) {
          form.reset();
          setStatus("Thank you — we'll be in touch within one business day.", 'success');
          btn.innerHTML = '✓ Sent';
          setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
            status.className = 'form-status';
          }, 5000);
        } else {
          const data = await res.json().catch(() => ({}));
          setStatus(
            data.errors?.[0]?.message || 'Something went wrong. Try WhatsApp instead.',
            'error'
          );
          btn.innerHTML = originalHTML;
          btn.disabled = false;
        }
      } catch (err) {
        setStatus('Network error. Please try again or use WhatsApp.', 'error');
        btn.innerHTML = originalHTML;
        btn.disabled = false;
      }
    });
  }

  /* ---------- Init ---------- */
  function init(motion) {
    initPreloader();
    initNavScroll();
    initMobileNav();
    initTheme();
    initReveal(motion);
    initSpringPress(motion);
    initSpringHover(motion);
    initIconRotation();
    initAnchors();
    initForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => onMotionReady(init));
  } else {
    onMotionReady(init);
  }
})();
