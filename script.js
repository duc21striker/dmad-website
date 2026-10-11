/* ============================================================
   DMAD — Motion & interaction layer
   Apple-design skill applied.
   ============================================================ */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  /* ---------- Nav state on scroll ---------- */
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

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    const els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;
    if (reduceMotion) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const parent = entry.target.parentElement;
        if (parent) {
          const sibs = Array.from(parent.querySelectorAll(':scope > [data-reveal]'));
          const idx = sibs.indexOf(entry.target);
          entry.target.style.transitionDelay = `${Math.min(idx * 70, 350)}ms`;
        }
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    els.forEach((el) => observer.observe(el));
  }

  /* ---------- Word-by-word hero title reveal ---------- */
  function initWordsReveal() {
    const title = document.querySelector('[data-reveal-words]');
    if (!title || reduceMotion) return;
    // The hero title has inline <em> tags; only wrap top-level text nodes
    title.style.opacity = '1';
  }

  /* ---------- Responsive press feedback (pointer-down, not click) ---------- */
  function initSpringPress() {
    const pressables = document.querySelectorAll('[data-spring-press]');
    if (!pressables.length || reduceMotion) return;

    pressables.forEach((el) => {
      // Highlight on pointerdown, matching Apple's "respond on touch" rule
      const press = () => { el.style.transform = 'scale(0.97)'; };
      const release = () => { el.style.transform = ''; };

      el.addEventListener('pointerdown', press, { passive: true });
      el.addEventListener('pointerup', release);
      el.addEventListener('pointercancel', release);
      el.addEventListener('pointerleave', release);
    });
  }

  /* ---------- Spring hover for cards ---------- */
  function initSpringHover() {
    if (reduceMotion) return;
    const hoverables = document.querySelectorAll('[data-spring-hover]');
    hoverables.forEach((el) => {
      el.style.transform = '';
      // CSS handles the transition; this just prepares state
    });
  }

  /* ---------- Smooth anchor scroll (native — Apple uses default behavior) ---------- */
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

  /* ---------- Contact form (Formspree) ---------- */
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
  function init() {
    initPreloader();
    initNavScroll();
    initMobileNav();
    initTheme();
    initReveal();
    initWordsReveal();
    initSpringPress();
    initSpringHover();
    initAnchors();
    initForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
