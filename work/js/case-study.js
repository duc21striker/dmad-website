/* ============================================================
   DMAD — Case Study Shared Scripts
   ============================================================ */

(function () {
  'use strict';

  // ---- Theme toggle ----
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const html = document.documentElement;

  if (themeToggle && themeIcon) {
    const savedTheme = localStorage.getItem('dmad-theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      html.setAttribute('data-theme', 'dark');
      themeIcon.className = 'fas fa-sun';
    } else {
      themeIcon.className = 'fas fa-moon';
    }

    themeToggle.addEventListener('click', () => {
      if (html.getAttribute('data-theme') === 'dark') {
        html.removeAttribute('data-theme');
        localStorage.setItem('dmad-theme', 'light');
        themeIcon.className = 'fas fa-moon';
      } else {
        html.setAttribute('data-theme', 'dark');
        localStorage.setItem('dmad-theme', 'dark');
        themeIcon.className = 'fas fa-sun';
      }
    });
  }

  // ---- Mobile nav ----
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach(l =>
      l.addEventListener('click', () => navLinks.classList.remove('open'))
    );
  }

  // ---- Navbar scroll ----
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 30);
    });
  }

  // ---- Smooth scroll for anchors ----
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const h = this.getAttribute('href');
      if (h === '#' || h.length < 2) return;
      const t = document.querySelector(h);
      if (t) {
        e.preventDefault();
        const top = t.getBoundingClientRect().top + window.pageYOffset - 90;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
})();
