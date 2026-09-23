/* ============================================================
   OAK & OVEN — Fix Pass JS
   - IMAGES config drives every image in the page
   - Nigeria timezone (Africa/Lagos) drives open/closed + hours
   - Monday disabled in date picker; time slots computed per day
   - Toast replaces alert()
   - Lenis stop/start on modal + mobile menu
   - Gallery distance is a function; refresh after images load
   ============================================================ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;
  const isDesktop = window.innerWidth > 900;
  const lowPower = isTouch || window.innerWidth < 640;

  /* ==========================================================
     IMAGES — single source of truth for every image on the page
     ----------------------------------------------------------
     To swap any image: change the path here.
     Set cutout: true when the file is a transparent PNG.
     ========================================================== */
  const IMAGES = {
    hero: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80',

    heroDish: {
      src: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=900&q=80',
      cutout: false
    },

    ticketThumb: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&q=80',

    table: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=1200&q=80',

    dishes: [
      { src: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80', alt: 'The Oak Board', cutout: false },
      { src: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80', alt: 'Whole Oven-Baked Croaker', cutout: false },
      { src: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800&q=80', alt: 'Oven-Roasted Lamb Shank', cutout: false }
    ],

    experience: [
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
      'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80'
    ],

    /* Story portrait — distinct from chef portrait */
    portrait: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80',

    chef: {
      src: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=900&q=80',
      cutout: false
    },

    menuPreviewFallback: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=500&q=80',

    gallery: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
      'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&q=80',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80',
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',
      'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&q=80',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
      'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&q=80'
    ]
  };

  /* ==========================================================
     MENU DATA — each item has an optional "image" field
     If missing, a per-category fallback is used.
     ========================================================== */
  const MENU_FALLBACK_IMAGE = {
    starters: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&q=80',
    mains: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=500&q=80',
    signatures: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&q=80',
    desserts: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=500&q=80',
    drinks: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=500&q=80'
  };

  const MENU = {
    starters: [
      { name: 'Suya-Spiced Beef Tartare', desc: 'Hand-cut beef, suya spice, quail egg, toasted peanut', price: '₦9,500', tags: ['Spicy'], image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&q=80' },
      { name: 'Pepper Soup Velouté with Catfish', desc: 'Silky pepper soup, smoked catfish, scent leaf oil', price: '₦8,000', tags: ['Spicy'], image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500&q=80' },
      { name: 'Plantain and Crab Cakes', desc: 'Sweet plantain, fresh crab, scotch bonnet aioli', price: '₦9,000', tags: [], image: 'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=500&q=80' },
      { name: 'Burnt Aubergine, Ata Rodo and Whipped Feta', desc: 'Charred aubergine, ata rodo, whipped feta, mint', price: '₦7,500', tags: ['V'], image: 'https://images.unsplash.com/photo-1625938145312-c96f1c1c3ce6?w=500&q=80' }
    ],
    mains: [
      { name: 'Wood-Fired Ofada Risotto', desc: 'Creamy ofada rice, smoked prawns, ayamase oil', price: '₦18,500', tags: ['GF'], image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=500&q=80' },
      { name: 'Oven-Roasted Lamb Shank, Egusi Jus', desc: 'Slow-roasted lamb, egusi jus, roasted root vegetables', price: '₦28,000', tags: [], image: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=500&q=80' },
      { name: 'Smoked Jollof, Charred Prawns', desc: 'Smoky jollof rice, charred tiger prawns, pickled onions', price: '₦22,000', tags: ['Spicy'], image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=500&q=80' },
      { name: 'Grilled Seabass, Yam Purée, Palm Butter', desc: 'Whole grilled seabass, smooth yam purée, palm butter sauce', price: '₦24,500', tags: ['GF'], image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&q=80' }
    ],
    signatures: [
      { name: 'The Oak Board', desc: 'Dry-aged suya, ram, grilled chicken, sides. Serves 2.', price: '₦55,000', tags: [], image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&q=80' },
      { name: 'Whole Oven-Baked Croaker, Tatashe Glaze', desc: 'Whole croaker, tatashe glaze, charred lemon, jollof', price: '₦38,000', tags: ['Spicy'], image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&q=80' }
    ],
    desserts: [
      { name: 'Zobo and Hibiscus Panna Cotta', desc: 'Hibiscus panna cotta, zobo syrup, toasted coconut', price: '₦7,000', tags: ['V'], image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&q=80' },
      { name: 'Burnt Honey and Coconut Tart', desc: 'Burnt honey custard, coconut, lime creme fraiche', price: '₦7,500', tags: ['V'], image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&q=80' },
      { name: 'Chocolate, Uda and Orange Fondant', desc: 'Dark chocolate fondant, uda spice, orange gel', price: '₦8,500', tags: ['V'], image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80' }
    ],
    drinks: [
      { name: 'Zobo Negroni', desc: 'Gin, campari, zobo reduction, orange bitters', price: '₦8,000', tags: [], image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&q=80' },
      { name: 'Chapman Reimagined', desc: 'Brandy, curacao, angostura, cucumber, citrus', price: '₦7,000', tags: [], image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=500&q=80' },
      { name: 'Palm Wine Spritz', desc: 'Palm wine, soda, lime, mint', price: '₦6,500', tags: [], image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500&q=80' },
      { name: 'Tamarind Margarita', desc: 'Tequila, tamarind, lime, chili salt rim', price: '₦8,500', tags: ['Spicy'], image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=500&q=80' }
    ]
  };

  /* ==========================================================
     OPENING HOURS — used by both the location status and the
     reservation date/time logic. Values are Nigeria local time.
     Last seating is the cutoff for slot generation.
     ========================================================== */
  const HOURS = {
    0: { open: 12, close: 21, lastSeating: 19.5 },        // Sunday
    1: null,                                              // Monday closed
    2: { open: 12, close: 22, lastSeating: 20.5 },        // Tue
    3: { open: 12, close: 22, lastSeating: 20.5 },        // Wed
    4: { open: 12, close: 22, lastSeating: 20.5 },        // Thu
    5: { open: 12, close: 23.5, lastSeating: 22 },        // Fri
    6: { open: 12, close: 23.5, lastSeating: 22 }         // Sat
  };

  /* ==========================================================
     NIGERIA TIME HELPERS (Africa/Lagos)
     ========================================================== */
  const LAGOS_TZ = 'Africa/Lagos';

  // Returns { year, month, day, hour, minute, weekday } as they are in Lagos
  function nowInLagos() {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: LAGOS_TZ,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
      hour12: false, weekday: 'short'
    });
    const parts = {};
    fmt.formatToParts(new Date()).forEach((p) => { if (p.type !== 'literal') parts[p.type] = p.value; });
    return {
      year: +parts.year,
      month: +parts.month,
      day: +parts.day,
      hour: +parts.hour,
      minute: +parts.minute,
      weekday: parts.weekday // Mon, Tue...
    };
  }

  // Weekday index 0..6 for Lagos today
  function lagosWeekdayIndex() {
    const wd = nowInLagos().weekday;
    const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return map[wd];
  }

  // Parse a yyyy-mm-dd date string as a local date (no timezone shifting)
  function parseDateInput(value) {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  // Given a yyyy-mm-dd date string, return its weekday index (0..6)
  function weekdayIndexForDate(value) {
    return parseDateInput(value).getDay();
  }

  // Format number hours (e.g. 20.5) as HH:MM
  function hoursToHHMM(h) {
    const hh = Math.floor(h);
    const mm = Math.round((h - hh) * 60);
    return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
  }

  /* ==========================================================
     PRELOADER
     ========================================================== */
  const preloader = document.getElementById('preloader');
  const preloaderBar = document.getElementById('preloaderBar');
  const preloaderCounter = document.getElementById('preloaderCounter');

  if (sessionStorage.getItem('oakVisited')) {
    preloader.classList.add('hidden');
    initSite();
  } else {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        preloaderBar.style.width = '100%';
        preloaderCounter.textContent = '100%';
        setTimeout(() => {
          preloader.classList.add('hidden');
          sessionStorage.setItem('oakVisited', 'true');
          initSite();
        }, 400);
      } else {
        preloaderBar.style.width = progress + '%';
        preloaderCounter.textContent = Math.floor(progress) + '%';
      }
    }, 150);
  }

  /* ==========================================================
     IMAGE BINDING
     Walk the DOM, apply the IMAGES config to every [data-img].
     ========================================================== */
  function bindImages() {
    document.querySelectorAll('[data-img]').forEach((img) => {
      const key = img.getAttribute('data-img');
      const src = resolveImageKey(key);
      if (src) img.src = src;
    });

    // Handle cutout flags
    const heroPlate = document.querySelector('.hero-dish-plate');
    const heroPlateImg = heroPlate?.querySelector('img');
    if (heroPlate && heroPlateImg && IMAGES.heroDish.cutout) {
      heroPlate.setAttribute('data-real-cutout', 'true');
      heroPlateImg.setAttribute('data-real-cutout', 'true');
    }

    document.querySelectorAll('.dish-panel').forEach((panel) => {
      const i = parseInt(panel.dataset.dishIndex, 10);
      const cfg = IMAGES.dishes[i];
      if (cfg?.cutout) {
        const img = panel.querySelector('.dish-cutout img');
        if (img) img.setAttribute('data-real-cutout', 'true');
      }
    });

    const chefImg = document.querySelector('.chef-portrait img');
    if (chefImg && IMAGES.chef.cutout) {
      chefImg.setAttribute('data-real-cutout', 'true');
    }
  }

  function resolveImageKey(key) {
    if (!key) return '';
    if (key === 'hero') return IMAGES.hero;
    if (key === 'heroDish') return IMAGES.heroDish.src;
    if (key === 'ticketThumb') return IMAGES.ticketThumb;
    if (key === 'table') return IMAGES.table;
    if (key === 'portrait') return IMAGES.portrait;
    if (key === 'chef') return IMAGES.chef.src;
    if (key.startsWith('dish-')) {
      const i = parseInt(key.split('-')[1], 10);
      return IMAGES.dishes[i]?.src || '';
    }
    if (key.startsWith('exp-')) {
      const i = parseInt(key.split('-')[1], 10);
      return IMAGES.experience[i] || '';
    }
    if (key.startsWith('gal-')) {
      const i = parseInt(key.split('-')[1], 10);
      return IMAGES.gallery[i] || '';
    }
    return '';
  }

  /* ==========================================================
     SITE INITIALIZATION
     ========================================================== */
  function initSite() {

    bindImages();

    /* ---------- Lenis ---------- */
    let lenis = null;
    if (!prefersReducedMotion && typeof Lenis !== 'undefined') {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 2
      });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    const stopScroll = () => { if (lenis) lenis.stop(); };
    const startScroll = () => { if (lenis) lenis.start(); };

    /* ---------- Scroll progress ---------- */
    const progressBar = document.getElementById('scroll-progress');
    window.addEventListener('scroll', () => {
      const st = window.scrollY;
      const dh = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = (dh > 0 ? (st / dh) * 100 : 0) + '%';
    }, { passive: true });

    /* ---------- Nav ---------- */
    const header = document.querySelector('header');
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const cs = window.scrollY;
      header.classList.toggle('nav-scrolled', cs > 100);
      if (cs > lastScroll && cs > 400) header.classList.add('nav-hidden');
      else header.classList.remove('nav-hidden');
      lastScroll = cs;
    }, { passive: true });

    /* ---------- Mobile menu (with Lenis stop/start) ---------- */
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mobileOverlay = document.getElementById('mobileOverlay');
    if (mobileToggle && mobileOverlay) {
      mobileToggle.addEventListener('click', () => {
        const isOpen = mobileOverlay.classList.contains('open');
        mobileOverlay.classList.toggle('open');
        mobileToggle.classList.toggle('open');
        mobileToggle.setAttribute('aria-expanded', String(!isOpen));
        document.body.style.overflow = isOpen ? '' : 'hidden';
        if (isOpen) startScroll(); else stopScroll();
      });
      mobileOverlay.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          mobileOverlay.classList.remove('open');
          mobileToggle.classList.remove('open');
          mobileToggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
          startScroll();
        });
      });
    }

    /* ---------- Toast (replaces alert) ---------- */
    const toastEl = document.getElementById('toast');
    let toastTimer;
    function showToast(msg) {
      if (!toastEl) return;
      toastEl.textContent = msg;
      toastEl.classList.add('visible');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toastEl.classList.remove('visible'), 3000);
    }

    /* ---------- Hero animations ---------- */
    if (!prefersReducedMotion) {
      const heroTl = gsap.timeline({ delay: 0.3 });
      heroTl
        .to('.hero-title .line-mask span', { y: '0%', duration: 1.2, ease: 'expo.out' })
        .to('.hero-tagline .line-mask span', { y: '0%', duration: 1.0, ease: 'expo.out' }, '-=0.8')
        .to('.hero-cta', { opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.6')
        .to('.tasting-ticket', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.4');

      gsap.to('.hero-text', {
        y: -80, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
      });
      gsap.to('.hero-bg img', {
        scale: 1.3, ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
      });
      // Scroll tween on the OUTER wrapper (scale/rotate/y) — FIX 4
      gsap.to('.hero-dish-scroll', {
        scale: 1.15, rotate: 8, y: 100, ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    } else {
      document.querySelectorAll('.hero-title .line-mask span, .hero-tagline .line-mask span')
        .forEach((el) => { el.style.transform = 'translateY(0)'; });
      const cta = document.querySelector('.hero-cta');
      const ticket = document.querySelector('.tasting-ticket');
      if (cta) cta.style.opacity = '1';
      if (ticket) { ticket.style.opacity = '1'; ticket.style.transform = 'translateX(-50%)'; }
    }

    /* ---------- Hero dish mouse parallax (inner element — FIX 4) ---------- */
    if (!isTouch && !prefersReducedMotion) {
      const heroDish = document.querySelector('.hero-dish');
      const hero = document.getElementById('hero');
      if (heroDish && hero) {
        let mx = 0, my = 0, dx = 0, dy = 0;
        hero.addEventListener('mousemove', (e) => {
          const r = hero.getBoundingClientRect();
          mx = (e.clientX - r.left) / r.width - 0.5;
          my = (e.clientY - r.top) / r.height - 0.5;
        });
        hero.addEventListener('mouseleave', () => { mx = 0; my = 0; });
        (function loop() {
          dx += (mx - dx) * 0.06;
          dy += (my - dy) * 0.06;
          gsap.set(heroDish, { x: dx * 30, y: dy * 20 });
          requestAnimationFrame(loop);
        })();
      }
    }

    /* ---------- Embers ---------- */
    initEmbers();

    /* ---------- Corner brackets ---------- */
    document.querySelectorAll('[data-bracket]').forEach((el) => {
      ScrollTrigger.create({
        trigger: el, start: 'top 82%', once: true,
        onEnter: () => el.classList.add('bracket-in')
      });
    });

    /* ---------- Clip-path reveals ---------- */
    document.querySelectorAll('.reveal-clip, .table-image-wrap, .story-portrait').forEach((el) => {
      if (prefersReducedMotion) { el.classList.add('revealed'); return; }
      ScrollTrigger.create({
        trigger: el, start: 'top 80%', once: true,
        onEnter: () => el.classList.add('revealed')
      });
    });

    /* ---------- Statement word reveal ---------- */
    const words = document.querySelectorAll('.table-statement .word');
    if (!prefersReducedMotion && words.length) {
      ScrollTrigger.create({
        trigger: '.table-statement', start: 'top 78%', end: 'bottom 45%', scrub: true,
        onUpdate: (self) => {
          const n = Math.floor(self.progress * words.length * 1.5);
          words.forEach((w, i) => w.classList.toggle('active', i < n));
        }
      });
    } else {
      words.forEach((w) => w.classList.add('active'));
    }

    /* ---------- Stat counters ---------- */
    document.querySelectorAll('.stat-number').forEach((el) => {
      const target = parseInt(el.dataset.target, 10);
      if (prefersReducedMotion) { el.textContent = target; return; }
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: () => {
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target, duration: 2, ease: 'power2.out',
            onUpdate: () => { el.textContent = Math.round(obj.val); }
          });
        }
      });
    });

    /* ---------- Signature dish parallax ---------- */
    if (!prefersReducedMotion && isDesktop) {
      document.querySelectorAll('.dish-panel').forEach((panel, i) => {
        const cutout = panel.querySelector('.dish-cutout');
        if (!cutout) return;
        gsap.fromTo(cutout,
          { rotate: i % 2 === 0 ? 3 : -3, y: 30 },
          {
            rotate: i % 2 === 0 ? -3 : 3, y: -30, ease: 'none',
            scrollTrigger: { trigger: panel, start: 'top bottom', end: 'bottom top', scrub: true }
          }
        );
      });
    }

    /* ---------- Dish "add to reservation notes" ---------- */
    document.querySelectorAll('.dish-add-note').forEach((btn) => {
      btn.addEventListener('click', () => {
        const dish = btn.dataset.dish || btn.closest('.dish-panel')?.querySelector('.dish-name')?.textContent;
        if (!dish) return;
        openModalWithDish(dish);
      });
    });

    /* ---------- Menu ---------- */
    const menuList = document.getElementById('menuList');
    const menuTabsWrap = document.querySelector('.menu-tabs');
    const menuTabs = document.querySelectorAll('.menu-tab');
    const tabIndicator = document.querySelector('.tab-indicator');
    let currentMenuCategory = 'starters';

    function moveIndicatorTo(tab) {
      if (!tabIndicator || !tab || !menuTabsWrap) return;
      const rect = tab.getBoundingClientRect();
      const parentRect = menuTabsWrap.getBoundingClientRect();
      tabIndicator.style.width = rect.width + 'px';
      tabIndicator.style.transform = `translateX(${rect.left - parentRect.left - 0.4 * 16}px)`;
    }

    function renderMenu(category) {
      currentMenuCategory = category;
      const items = MENU[category] || [];
      if (!menuList) return;

      menuList.innerHTML = items.map((item) => {
        const previewSrc = item.image || MENU_FALLBACK_IMAGE[category] || IMAGES.menuPreviewFallback;
        return `
          <div class="menu-item" data-preview="${escapeAttr(previewSrc)}" style="opacity:0;transform:translateY(20px);">
            <div class="menu-item-left">
              <div class="menu-item-name">${escapeHtml(item.name)}</div>
              <div class="menu-item-desc">${escapeHtml(item.desc)}</div>
            </div>
            <div class="menu-item-right">
              <div class="menu-item-price">${item.price}</div>
              <div class="menu-item-tags">
                ${item.tags.map((t) => `<span class="menu-tag">${t}</span>`).join('')}
              </div>
            </div>
          </div>
        `;
      }).join('');

      const newItems = menuList.querySelectorAll('.menu-item');
      if (prefersReducedMotion) {
        newItems.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
      } else {
        newItems.forEach((el, i) => {
          gsap.to(el, { opacity: 1, y: 0, duration: 0.6, delay: i * 0.07, ease: 'power3.out' });
        });
      }

      attachMenuPreviewHandlers();
    }

    menuTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        menuTabs.forEach((t) => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        moveIndicatorTo(tab);

        const currentItems = menuList.querySelectorAll('.menu-item');
        if (prefersReducedMotion) {
          renderMenu(tab.dataset.category);
        } else {
          gsap.to(currentItems, {
            opacity: 0, y: -20, duration: 0.3, stagger: 0.03,
            onComplete: () => renderMenu(tab.dataset.category)
          });
        }
      });
    });

    renderMenu('starters');
    requestAnimationFrame(() => {
      const active = document.querySelector('.menu-tab.active');
      if (active) moveIndicatorTo(active);
    });
    window.addEventListener('resize', () => {
      const active = document.querySelector('.menu-tab.active');
      if (active) moveIndicatorTo(active);
    });

    /* ---------- Menu cursor-follow preview ---------- */
    let menuPreview = null;
    if (!isTouch && !prefersReducedMotion && !lowPower) {
      menuPreview = document.createElement('div');
      menuPreview.className = 'menu-preview';
      menuPreview.innerHTML = '<img alt="" aria-hidden="true">';
      document.body.appendChild(menuPreview);

      let mx = 0, my = 0, px = 0, py = 0;
      window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });
      (function loop() {
        px += (mx - px) * 0.12;
        py += (my - py) * 0.12;
        menuPreview.style.left = px + 'px';
        menuPreview.style.top = py + 'px';
        requestAnimationFrame(loop);
      })();
    }

    function attachMenuPreviewHandlers() {
      if (!menuPreview) return;
      const img = menuPreview.querySelector('img');
      menuList.querySelectorAll('.menu-item').forEach((item) => {
        item.addEventListener('mouseenter', () => {
          const src = item.dataset.preview || IMAGES.menuPreviewFallback;
          if (img) img.src = src;
          menuPreview.classList.add('visible');
        });
        item.addEventListener('mouseleave', () => {
          menuPreview.classList.remove('visible');
        });
      });
    }

    /* ---------- Cursor reveal on first mousemove (FIX 3) ---------- */
    if (!isTouch && !prefersReducedMotion) {
      const reveal = () => {
        document.body.classList.add('cursor-on');
        window.removeEventListener('mousemove', reveal);
      };
      window.addEventListener('mousemove', reveal, { passive: true });
    }

    /* ---------- Lens cursor ---------- */
    if (!isTouch && !prefersReducedMotion && !lowPower) {
      const lens = document.querySelector('.cursor-lens');
      const dot = document.querySelector('.cursor-dot');
      const ring = document.querySelector('.cursor-ring');
      if (lens && dot && ring) {
        let mx = 0, my = 0, lx = 0, ly = 0;
        window.addEventListener('mousemove', (e) => {
          mx = e.clientX; my = e.clientY;
          dot.style.left = mx + 'px';
          dot.style.top = my + 'px';
        });
        (function animate() {
          lx += (mx - lx) * 0.14;
          ly += (my - ly) * 0.14;
          lens.style.left = lx + 'px';
          lens.style.top = ly + 'px';
          ring.style.left = lx + 'px';
          ring.style.top = ly + 'px';
          requestAnimationFrame(animate);
        })();

        document.querySelectorAll('.dish-cutout, .gallery-item, .chef-portrait, .hero-dish').forEach((el) => {
          el.addEventListener('mouseenter', () => {
            lens.classList.add('visible');
            dot.style.opacity = '0';
            ring.style.opacity = '0';
          });
          el.addEventListener('mouseleave', () => {
            lens.classList.remove('visible');
            dot.style.opacity = '';
            ring.style.opacity = '';
          });
        });
      }
    }

    /* ---------- Glass specular ---------- */
    if (!isTouch && !prefersReducedMotion) {
      document.querySelectorAll('.glass').forEach((el) => {
        el.addEventListener('mousemove', (e) => {
          const r = el.getBoundingClientRect();
          el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
          el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
        });
      });
    }

    /* ---------- Timeline ---------- */
    const timelineLine = document.getElementById('timelineLine');
    if (timelineLine) {
      if (prefersReducedMotion) {
        timelineLine.classList.add('drawn');
        document.querySelectorAll('.timeline-item').forEach((i) => i.classList.add('visible'));
      } else {
        ScrollTrigger.create({
          trigger: '#timeline', start: 'top 78%', once: true,
          onEnter: () => {
            timelineLine.classList.add('drawn');
            document.querySelectorAll('.timeline-item').forEach((item, i) => {
              setTimeout(() => item.classList.add('visible'), i * 140);
            });
          }
        });
      }
    }

    /* ---------- Gallery horizontal scroll (FIX 6) ---------- */
    if (!prefersReducedMotion && isDesktop) {
      const track = document.getElementById('galleryTrack');
      const section = document.getElementById('gallery');
      if (track && section) {
        const distance = () => -(track.scrollWidth - window.innerWidth + 128);

        const tween = gsap.to(track, {
          x: distance,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => '+=' + Math.abs(distance()) + 400,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true
          }
        });

        track.querySelectorAll('.gallery-item').forEach((item) => {
          gsap.to(item, {
            scale: 1.05, ease: 'power2.out',
            scrollTrigger: {
              trigger: item,
              containerAnimation: tween,
              start: 'left right',
              end: 'right left',
              scrub: true
            }
          });
        });

        // FIX 6: refresh after all gallery images load
        const galleryImgs = Array.from(track.querySelectorAll('img'));
        Promise.all(galleryImgs.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((res) => {
            img.addEventListener('load', res, { once: true });
            img.addEventListener('error', res, { once: true });
          });
        })).then(() => {
          if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        });
      }
    }

    /* ---------- Testimonials ---------- */
    const tCards = document.querySelectorAll('.testimonial-card');
    const tDots = document.getElementById('testDots');
    let tIndex = 0;
    let tAuto;
    if (tCards.length && tDots) {
      tCards.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
        dot.addEventListener('click', () => goToT(i));
        tDots.appendChild(dot);
      });
      function goToT(i) {
        tCards[tIndex].classList.remove('active');
        tDots.children[tIndex].classList.remove('active');
        tIndex = (i + tCards.length) % tCards.length;
        tCards[tIndex].classList.add('active');
        tDots.children[tIndex].classList.add('active');
      }
      tCards[0].classList.add('active');
      document.getElementById('testPrev')?.addEventListener('click', () => { goToT(tIndex - 1); resetTAuto(); });
      document.getElementById('testNext')?.addEventListener('click', () => { goToT(tIndex + 1); resetTAuto(); });
      function startTAuto() {
        if (prefersReducedMotion) return;
        tAuto = setInterval(() => goToT(tIndex + 1), 6000);
      }
      function resetTAuto() { clearInterval(tAuto); startTAuto(); }
      startTAuto();
    }

    /* ==========================================================
       RESERVATION MODAL — with Lenis stop/start + Lagos hours
       ========================================================== */
    const modal = document.getElementById('reservationModal');
    const openBtn = document.getElementById('openReservation');
    const closeBtn = document.getElementById('closeReservation');
    const form = document.getElementById('reservationForm');
    const formContainer = document.getElementById('formContainer');
    const formSuccess = document.getElementById('formSuccess');
    const requestsField = document.getElementById('resRequests');
    const dateInput = document.getElementById('resDate');
    const timeSlotsWrap = document.getElementById('timeSlots');

    let guestCount = 2;
    let selectedTime = '';
    let lastFocused = null;

    // Restrict the date picker to Nigeria's "today" or later
    function setDateMinToLagosToday() {
      const n = nowInLagos();
      const iso = `${n.year}-${String(n.month).padStart(2, '0')}-${String(n.day).padStart(2, '0')}`;
      dateInput.min = iso;
    }

    function openModal() {
      lastFocused = document.activeElement;
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      stopScroll();

      formContainer.style.display = 'block';
      formSuccess.classList.remove('visible');
      form.reset();
      guestCount = 2;
      document.getElementById('guestCount').textContent = guestCount;
      selectedTime = '';
      clearErrors();
      setDateMinToLagosToday();
      renderTimeSlots(''); // no date yet
      setTimeout(() => form.querySelector('input')?.focus(), 100);
    }
    function openModalWithDish(dish) {
      openModal();
      if (requestsField) {
        const existing = requestsField.value.trim();
        requestsField.value = (existing ? existing + '\n' : '') + `Interested in: ${dish}`;
      }
    }
    function closeModal() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
      startScroll();
      if (lastFocused) lastFocused.focus();
    }

    openBtn?.addEventListener('click', openModal);
    closeBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal?.classList.contains('open')) closeModal();
    });
    modal?.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' || !modal.classList.contains('open')) return;
      const f = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    // Guest stepper
    document.getElementById('guestMinus')?.addEventListener('click', () => {
      if (guestCount > 1) { guestCount--; document.getElementById('guestCount').textContent = guestCount; }
    });
    document.getElementById('guestPlus')?.addEventListener('click', () => {
      if (guestCount < 12) { guestCount++; document.getElementById('guestCount').textContent = guestCount; }
    });

    /* ---------- Time slots depend on the selected date ---------- */
    function renderTimeSlots(dateStr) {
      if (!timeSlotsWrap) return;
      timeSlotsWrap.innerHTML = '';
      selectedTime = '';

      if (!dateStr) {
        timeSlotsWrap.innerHTML = '<span style="font-family:var(--font-sans);font-size:.75rem;color:var(--ivory-40);">Choose a date to see available times.</span>';
        return;
      }

      const wd = weekdayIndexForDate(dateStr);
      const cfg = HOURS[wd];
      if (!cfg) {
        timeSlotsWrap.innerHTML = '<span style="font-family:var(--font-sans);font-size:.75rem;color:var(--ivory-40);">Closed on this day — please choose another.</span>';
        return;
      }

      // Build slots hourly from open → lastSeating
      const slots = [];
      for (let h = cfg.open; h <= cfg.lastSeating; h++) slots.push(h);

      // If the date is Nigeria's "today", disable past slots
      const n = nowInLagos();
      const isToday = `${n.year}-${String(n.month).padStart(2, '0')}-${String(n.day).padStart(2, '0')}` === dateStr;
      const nowHours = n.hour + n.minute / 60;

      slots.forEach((h) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'time-slot';
        btn.dataset.time = hoursToHHMM(h);
        btn.textContent = hoursToHHMM(h);
        const isPast = isToday && h <= nowHours;
        if (isPast) btn.disabled = true;
        btn.addEventListener('click', () => {
          if (btn.disabled) return;
          timeSlotsWrap.querySelectorAll('.time-slot').forEach((s) => s.classList.remove('selected'));
          btn.classList.add('selected');
          selectedTime = btn.dataset.time;
          document.getElementById('resTimeError')?.classList.remove('visible');
        });
        timeSlotsWrap.appendChild(btn);
      });
    }

    // When date changes, re-render slots and show Monday message
    dateInput?.addEventListener('change', () => {
      const val = dateInput.value;
      document.getElementById('resDateClosedError')?.classList.remove('visible');
      document.getElementById('resDateError')?.classList.remove('visible');
      if (!val) { renderTimeSlots(''); return; }

      const wd = weekdayIndexForDate(val);
      if (wd === 1) {
        // Monday — show friendly message and disable slots
        document.getElementById('resDateClosedError')?.classList.add('visible');
        renderTimeSlots('');
        return;
      }
      renderTimeSlots(val);
    });

    function clearErrors() {
      document.querySelectorAll('.error-msg').forEach((e) => e.classList.remove('visible'));
      document.querySelectorAll('.error').forEach((e) => e.classList.remove('error'));
    }
    function showError(id, msgId) {
      document.getElementById(id)?.classList.add('error');
      document.getElementById(msgId)?.classList.add('visible');
    }

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErrors();
      let ok = true;

      const name = document.getElementById('resName').value.trim();
      const phone = document.getElementById('resPhone').value.trim();
      const date = document.getElementById('resDate').value;

      if (!name) { showError('resName', 'resNameError'); ok = false; }
      if (!phone || phone.length < 7) { showError('resPhone', 'resPhoneError'); ok = false; }
      if (!date) {
        showError('resDate', 'resDateError');
        ok = false;
      } else if (weekdayIndexForDate(date) === 1) {
        document.getElementById('resDateClosedError')?.classList.add('visible');
        ok = false;
      }
      if (!selectedTime) {
        document.getElementById('resTimeError')?.classList.add('visible');
        ok = false;
      }
      if (!ok) return;

      /* ============================================================
         FORM SERVICE HOOK — connect Formspree / Web3Forms here.
         ============================================================ */
      showSuccess();
    });

    function showSuccess() {
      formContainer.style.display = 'none';
      formSuccess.classList.add('visible');
    }

    /* ==========================================================
       LOCATION — Nigeria timezone (Africa/Lagos)
       ========================================================== */
    const dow = lagosWeekdayIndex();
    document.querySelectorAll('#hoursTable tr').forEach((row) => {
      if (parseInt(row.dataset.day, 10) === dow) row.classList.add('today');
    });

    function updateOpenStatus() {
      const n = nowInLagos();
      const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      const day = map[n.weekday];
      const statusEl = document.getElementById('openStatus');
      const statusText = document.getElementById('statusText');
      if (!statusEl || !statusText) return;

      const cfg = HOURS[day];
      if (!cfg) {
        statusEl.classList.add('closed');
        statusText.textContent = 'Closed today';
        return;
      }
      const h = n.hour + n.minute / 60;
      if (h >= cfg.open && h < cfg.close) {
        statusEl.classList.remove('closed');
        statusText.textContent = 'Open now';
      } else {
        statusEl.classList.add('closed');
        statusText.textContent = 'Closed now';
      }
    }
    updateOpenStatus();
    setInterval(updateOpenStatus, 60000);

    /* ---------- Newsletter ---------- */
    const nForm = document.getElementById('newsletterForm');
    const nSuccess = document.getElementById('newsletterSuccess');
    nForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = nForm.querySelector('input');
      if (input.value.trim() && input.value.includes('@')) {
        nForm.style.display = 'none';
        nSuccess.style.display = 'block';
      }
    });

    /* ---------- Placeholder toasts (FIX 9) ---------- */
    document.getElementById('menuDownload')?.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Full menu PDF coming soon — ask your server tonight.');
    });
    document.getElementById('meetTeam')?.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Team page coming soon. In the meantime, say hello at the pass.');
    });

    /* ---------- Smooth anchor scroll ---------- */
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const id = anchor.getAttribute('href');
        if (id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { offset: -80 });
        else target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      });
    });

    /* ---------- Refresh on load + after gallery images ---------- */
    window.addEventListener('load', () => {
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      // FIX 6: also refresh once every image on the page has settled
      const allImgs = Array.from(document.images);
      Promise.all(allImgs.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((res) => {
          img.addEventListener('load', res, { once: true });
          img.addEventListener('error', res, { once: true });
        });
      })).then(() => ScrollTrigger.refresh());
    });

    let rTimer;
    window.addEventListener('resize', () => {
      clearTimeout(rTimer);
      rTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
    });
  }

  /* ==========================================================
     EMBERS
     ========================================================== */
  function initEmbers() {
    if (prefersReducedMotion) return;
    document.querySelectorAll('canvas[data-embers]').forEach((canvas) => {
      const ctx = canvas.getContext('2d');
      let running = true, rafId, particles = [], W = 0, H = 0;

      function resize() {
        const rect = canvas.getBoundingClientRect();
        W = canvas.width = rect.width * Math.min(2, window.devicePixelRatio || 1);
        H = canvas.height = rect.height * Math.min(2, window.devicePixelRatio || 1);
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
      }
      function makeParticle() {
        return {
          x: Math.random() * W,
          y: H + Math.random() * 40,
          r: (Math.random() * 1.6 + 0.6) * (lowPower ? 0.8 : 1),
          vy: -(0.15 + Math.random() * 0.4) * (lowPower ? 1.2 : 1),
          vx: (Math.random() - 0.5) * 0.15,
          life: 0,
          maxLife: 300 + Math.random() * 300,
          alpha: 0
        };
      }
      function count() { return lowPower ? 18 : 34; }
      function reset() {
        particles = [];
        for (let i = 0; i < count(); i++) {
          const p = makeParticle();
          p.y = Math.random() * H;
          p.life = Math.random() * p.maxLife;
          particles.push(p);
        }
      }
      function draw() {
        if (!running) return;
        ctx.clearRect(0, 0, W, H);
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.life++; p.x += p.vx; p.y += p.vy;
          const t = p.life / p.maxLife;
          if (t < 0.15) p.alpha = t / 0.15;
          else if (t > 0.7) p.alpha = Math.max(0, 1 - (t - 0.7) / 0.3);
          else p.alpha = 1;

          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
          grad.addColorStop(0, `rgba(211, 154, 102, ${0.85 * p.alpha})`);
          grad.addColorStop(0.4, `rgba(184, 115, 51, ${0.4 * p.alpha})`);
          grad.addColorStop(1, 'rgba(184, 115, 51, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2); ctx.fill();

          if (p.life >= p.maxLife || p.y < -20) particles[i] = makeParticle();
        }
        rafId = requestAnimationFrame(draw);
      }
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!running) { running = true; draw(); }
          } else {
            running = false; cancelAnimationFrame(rafId);
          }
        });
      }, { threshold: 0 });
      resize(); reset(); draw(); io.observe(canvas);
      window.addEventListener('resize', () => { resize(); reset(); });
    });
  }

  /* ==========================================================
     HELPERS
     ========================================================== */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function escapeAttr(str) { return escapeHtml(str); }

})();
