/* ============================================================
   HAVEN 24 — main.js (Fix Pass 2)
   Key fixes:
   - Local-date handling (Africa/Lagos) — no toISOString
   - Preloader & animation don't depend on window.load
   - Studio filter works
   - Search respects guest capacity
   - lenis.scrollTo instead of scrollIntoView
   - Focus traps in drawer / date picker / guest sheet
   - VIEW cursor via event delegation
   - IMAGES restructured: tour.living = { src, hotspots }
   - experience uses day + night from same room (with overlay fallback)
   - Apartment images are interior-only; exterior separate
   ============================================================ */

/* ---------- 1. IMAGES CONFIG ---------- */
const IMAGES = {
  // Exterior — used only in hero foreground & location
  exterior: {
    hero: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80",
    foreground: "" // transparent PNG cutout — leave empty to use arch fallback
  },
  heroFallback: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
  statementRow: [
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80"
  ],
  bookingSteps: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1200&q=80",
  // Experience — same room, different light. If pair unavailable, only day is used and night applies overlay.
  experience: {
    day: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1000&q=80",
    night: "" // leave empty to use day image + dusk overlay
  },
  // Tour — each room with its own hotspots. Adjust x/y if you change the photo.
  tour: {
    living: {
      src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
      hotspots: [
        { x: "25%", y: "45%", tip: "Handmade oak dining table" },
        { x: "70%", y: "30%", tip: "Blackout curtains" },
        { x: "55%", y: "75%", tip: "Smart TV" }
      ]
    },
    bedroom: {
      src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
      hotspots: [
        { x: "40%", y: "35%", tip: "Linen bedding" },
        { x: "65%", y: "60%", tip: "Reading lamp" }
      ]
    },
    kitchen: {
      src: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&q=80",
      hotspots: [
        { x: "30%", y: "50%", tip: "Gas hob" },
        { x: "60%", y: "40%", tip: "Full‑size fridge" }
      ]
    },
    terrace: {
      src: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1200&q=80",
      hotspots: [
        { x: "50%", y: "55%", tip: "Outdoor seating" },
        { x: "30%", y: "30%", tip: "Garden view" }
      ]
    },
    bathroom: {
      src: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&q=80",
      hotspots: [
        { x: "35%", y: "40%", tip: "Rain shower" },
        { x: "65%", y: "55%", tip: "Heated towel rail" }
      ]
    }
  }
};

/* ---------- 2. LOCAL DATE HELPERS (Africa/Lagos) ---------- */
const TIMEZONE = "Africa/Lagos";
const today = new Date();

function dateToISO(d) {
  // Format YYYY-MM-DD in the target timezone
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric", month: "2-digit", day: "2-digit"
  });
  return fmt.format(d); // "YYYY-MM-DD"
}
function isoToDate(iso) {
  // Parse ISO date as local midnight in the target timezone by adding T00:00:00
  return new Date(iso + "T00:00:00");
}
function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function formatFriendlyDate(iso) {
  if (!iso) return "";
  const d = isoToDate(iso);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    weekday: "short", day: "numeric", month: "short"
  }).format(d); // "Mon 28 Sep"
}
function todayISO() {
  return dateToISO(new Date());
}

/* ---------- 3. APARTMENTS DATA ---------- */
const APARTMENTS = [
  {
    name: "The Studio", slug: "studio",
    pitch: "Compact and bright with a dedicated work desk and kitchenette. Perfect for solo travellers or a couple.",
    guests: 2, bedrooms: 0, baths: 1, sqm: 38, rate: 40000, cleaning: 10000, minNights: 1,
    features: ["Work desk", "Kitchenette", "Smart TV", "Fast Wi‑Fi", "Air conditioning", "Blackout curtains"],
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80"
    ],
    booked: [
      { start: dateToISO(addDays(today, 3)), end: dateToISO(addDays(today, 6)) },
      { start: dateToISO(addDays(today, 14)), end: dateToISO(addDays(today, 17)) }
    ]
  },
  {
    name: "The Garden One‑Bed", slug: "garden-one-bed",
    pitch: "A one‑bedroom apartment with a private patio opening onto a quiet garden. Morning coffee outside.",
    guests: 3, bedrooms: 1, baths: 1, sqm: 62, rate: 65000, cleaning: 15000, minNights: 2,
    features: ["Private patio", "Garden view", "Full kitchen", "Smart TV", "Fast Wi‑Fi", "Air conditioning"],
    images: [
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&q=80",
      "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80"
    ],
    booked: [
      { start: dateToISO(addDays(today, 7)), end: dateToISO(addDays(today, 10)) },
      { start: dateToISO(addDays(today, 20)), end: dateToISO(addDays(today, 24)) }
    ]
  },
  {
    name: "The Terrace Two‑Bed", slug: "terrace-two-bed",
    pitch: "Two bedrooms, a full kitchen, a living room and a large terrace for slow evenings.",
    guests: 5, bedrooms: 2, baths: 2, sqm: 95, rate: 95000, cleaning: 20000, minNights: 2,
    features: ["Large terrace", "Full kitchen", "Living room", "Smart TV", "Fast Wi‑Fi", "Air conditioning"],
    images: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80"
    ],
    booked: [
      { start: dateToISO(addDays(today, 5)), end: dateToISO(addDays(today, 9)) },
      { start: dateToISO(addDays(today, 18)), end: dateToISO(addDays(today, 21)) }
    ]
  },
  {
    name: "The Penthouse", slug: "penthouse",
    pitch: "Three bedrooms, three baths and a rooftop terrace with panoramic views across Ijebu‑Ode.",
    guests: 7, bedrooms: 3, baths: 3, sqm: 140, rate: 150000, cleaning: 25000, minNights: 2,
    features: ["Rooftop terrace", "Panoramic views", "Full kitchen", "Living room", "Smart TV", "Fast Wi‑Fi"],
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80"
    ],
    booked: [
      { start: dateToISO(addDays(today, 2)), end: dateToISO(addDays(today, 5)) },
      { start: dateToISO(addDays(today, 12)), end: dateToISO(addDays(today, 16)) },
      { start: dateToISO(addDays(today, 25)), end: dateToISO(addDays(today, 30)) }
    ]
  }
];

const CONFIG = {
  whatsapp: "2348000000000",
  email: "hello@haven24.example",
  currency: "NGN",
  locale: "en-NG",
  weeklyDiscount: 0.10
};

/* ---------- 4. STATE ---------- */
const state = {
  checkIn: null, checkOut: null, guests: 2,
  activeApartment: null, filter: "all",
  typeFilter: "all", priceView: "night",
  datePickerTarget: null, datePickerView: new Date(),
  tourRoom: "living", tourPanning: true, drawerOpen: false
};

/* ---------- 5. HELPERS ---------- */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const nf = new Intl.NumberFormat(CONFIG.locale, { style: "currency", currency: CONFIG.currency, minimumFractionDigits: 0 });
const formatPrice = (n) => nf.format(n);

function nightsBetween(a, b) {
  if (!a || !b) return 0;
  return Math.max(0, Math.round((isoToDate(b) - isoToDate(a)) / 86400000));
}
function isBooked(apt, iso) {
  const d = isoToDate(iso);
  return apt.booked.some(r => {
    const s = isoToDate(r.start);
    const e = isoToDate(r.end);
    return d >= s && d < e;
  });
}
function isRangeAvailable(apt, start, end) {
  if (!start || !end) return false;
  let d = isoToDate(start);
  const e = isoToDate(end);
  while (d < e) {
    if (isBooked(apt, dateToISO(d))) return false;
    d = addDays(d, 1);
  }
  return true;
}
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("is-visible");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("is-visible"), 3000);
}
function totalPrice(apt, nights) { return apt.rate * nights + apt.cleaning; }
function weeklyPrice(apt) { return Math.round(apt.rate * 7 * (1 - CONFIG.weeklyDiscount)); }

function scrollToEl(el) {
  if (window.lenis) {
    window.lenis.scrollTo(el, { offset: -80 });
  } else if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/* Focus trap helper */
function trapFocus(container, opener) {
  const focusable = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (!focusable.length) return () => {};
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  function handler(e) {
    if (e.key !== "Tab") return;
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  container.addEventListener("keydown", handler);
  first.focus();
  return () => container.removeEventListener("keydown", handler);
}

/* ---------- 6. HERO ---------- */
function initHero() {
  const bg = $("#heroBg img");
  if (bg) bg.src = IMAGES.exterior.hero;
  const fg = $("#heroForeground");
  if (fg) {
    if (IMAGES.exterior.foreground && IMAGES.exterior.foreground.length > 0) {
      fg.innerHTML = `<img src="${IMAGES.exterior.foreground}" alt="" aria-hidden="true">`;
    } else {
      fg.innerHTML = `<div class="hero__fallback"><img src="${IMAGES.heroFallback}" alt="" aria-hidden="true"></div>`;
    }
  }
}

/* ---------- 7. SECTION IMAGES ---------- */
function initStatementPhotos() {
  $$(".statement__photo img").forEach((img, i) => {
    if (IMAGES.statementRow[i]) img.src = IMAGES.statementRow[i];
  });
}
function initHowImage() {
  const img = $(".how__image img");
  if (img) img.src = IMAGES.bookingSteps;
}
function initExperience() {
  const day = $(".experience__img--day");
  const night = $(".experience__img--night");
  if (day) day.src = IMAGES.experience.day;
  // If night image is empty, use the same day image + rely on overlay
  if (night) night.src = IMAGES.experience.night && IMAGES.experience.night.length > 0
    ? IMAGES.experience.night
    : IMAGES.experience.day;
}

/* ---------- 8. RENDER APARTMENTS ---------- */
function matchesFilter(apt, filter) {
  if (filter === "all") return true;
  if (filter === "studio") return apt.bedrooms === 0;
  return String(apt.bedrooms) === String(filter);
}

function renderApartments(filter = "all") {
  const grid = $("#apartmentsGrid");
  if (!grid) return;
  let list = APARTMENTS.filter(a => matchesFilter(a, filter));

  // Apply guest capacity check from search when dates are set
  grid.innerHTML = list.map(a => {
    const nights = nightsBetween(state.checkIn, state.checkOut);
    const enoughCapacity = state.guests <= a.guests;
    const available = state.checkIn && state.checkOut
      ? (isRangeAvailable(a, state.checkIn, state.checkOut) && enoughCapacity)
      : null;
    const total = available && nights > 0 ? totalPrice(a, nights) : null;
    const specLine = a.bedrooms === 0
      ? "Studio"
      : `${a.bedrooms} bed${a.bedrooms > 1 ? "s" : ""}`;
    return `
      <article class="apartment-card ${available === false ? "is-unavailable" : ""}" data-slug="${a.slug}">
        <div class="apartment-card__image" data-images='${JSON.stringify(a.images)}' data-index="0">
          <img src="${a.images[0]}" alt="${a.name} interior" loading="lazy" width="800" height="600">
          <div class="apartment-card__slider-dots">
            ${a.images.map((_, i) => `<span class="apartment-card__dot ${i === 0 ? "is-active" : ""}" data-dot="${i}"></span>`).join("")}
          </div>
        </div>
        <div class="apartment-card__body">
          <h3 class="apartment-card__name">${a.name}</h3>
          <p class="apartment-card__spec">${a.guests} guests · ${specLine} · ${a.baths} bath · ${a.sqm} m²</p>
          <p class="apartment-card__price">${state.priceView === "week" ? "From " + formatPrice(weeklyPrice(a)) + " / week" : "From " + formatPrice(a.rate) + " / night"}</p>
          <div class="apartment-card__actions">
            <button class="btn btn--outline btn--sm view-apartment" data-slug="${a.slug}">View apartment</button>
            <button class="btn btn--ink btn--sm book-apartment" data-slug="${a.slug}">Book</button>
          </div>
          ${available === true ? `<p class="apartment-card__available">Available — ${formatPrice(total)} total</p>` : ""}
          ${available === false && !enoughCapacity ? `<p class="apartment-card__available">Too small for ${state.guests} guests</p>` : ""}
          ${available === false && enoughCapacity ? `<p class="apartment-card__available">Not available for selected dates</p>` : ""}
        </div>
      </article>
    `;
  }).join("");

  $$(".apartment-card__image").forEach(el => {
    const imgs = JSON.parse(el.dataset.images);
    let idx = 0, interval;
    el.addEventListener("mouseenter", () => {
      interval = setInterval(() => {
        idx = (idx + 1) % imgs.length;
        const img = el.querySelector("img");
        if (img) img.src = imgs[idx];
        el.querySelectorAll(".apartment-card__dot").forEach((d, i) => d.classList.toggle("is-active", i === idx));
      }, 1200);
    });
    el.addEventListener("mouseleave", () => clearInterval(interval));
  });

  $$(".view-apartment").forEach(btn => btn.addEventListener("click", () => openDrawer(btn.dataset.slug)));
  $$(".book-apartment").forEach(btn => {
    btn.addEventListener("click", () => {
      const apt = APARTMENTS.find(a => a.slug === btn.dataset.slug);
      if (!apt) return;
      state.activeApartment = apt;
      syncBookingForm(apt);
      scrollToEl($("#book"));
      toast(`Prefilled booking for ${apt.name}`);
    });
  });
}

/* ---------- 9. FILTERS ---------- */
$$(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    $$(".filter-btn").forEach(b => { b.classList.remove("is-active"); b.setAttribute("aria-selected", "false"); });
    btn.classList.add("is-active");
    btn.setAttribute("aria-selected", "true");
    state.filter = btn.dataset.filter;
    renderApartments(state.filter);
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });
});

$$(".type-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    $$(".type-tab").forEach(t => { t.classList.remove("is-active"); t.setAttribute("aria-selected", "false"); });
    tab.classList.add("is-active");
    tab.setAttribute("aria-selected", "true");
    state.typeFilter = tab.dataset.type;
  });
});

$$(".price-toggle__btn").forEach(btn => {
  btn.addEventListener("click", () => {
    $$(".price-toggle__btn").forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    state.priceView = btn.dataset.price;
    renderApartments(state.filter);
  });
});

/* ---------- 10. DRAWER ---------- */
let drawerTrapCleanup = null;

function openDrawer(slug) {
  const apt = APARTMENTS.find(a => a.slug === slug);
  if (!apt) return;
  state.activeApartment = apt;
  state.drawerOpen = true;
  const drawer = $("#drawer");
  const content = $("#drawerContent");
  const nights = nightsBetween(state.checkIn, state.checkOut);
  const total = nights > 0 ? totalPrice(apt, nights) : 0;

  content.innerHTML = `
    <div class="drawer-gallery">
      <div class="drawer-gallery__main"><img id="drawerMainImg" src="${apt.images[0]}" alt="${apt.name}"></div>
      <div class="drawer-gallery__thumbs">
        ${apt.images.map((img, i) => `<div class="drawer-gallery__thumb ${i === 0 ? "is-active" : ""}" data-index="${i}"><img src="${img}" alt="${apt.name} view ${i + 1}"></div>`).join("")}
      </div>
    </div>
    <h2>${apt.name}</h2>
    <p class="drawer__spec">${apt.guests} guests · ${apt.bedrooms === 0 ? "Studio" : apt.bedrooms + " bed" + (apt.bedrooms > 1 ? "s" : "")} · ${apt.baths} bath · ${apt.sqm} m²</p>
    <p class="drawer__pitch">${apt.pitch}</p>
    <ul class="drawer__features">${apt.features.map(f => `<li>${f}</li>`).join("")}</ul>
    <div class="drawer__booking">
      <h3>Your stay</h3>
      <div class="form-row"><label>Check‑in</label>
        <button class="field-input date-trigger" data-date-target="checkin">
          <span class="field-input__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/></svg></span>
          <span class="field-input__value">${state.checkIn ? formatFriendlyDate(state.checkIn) : "Add date"}</span>
          <span class="field-input__chevron">›</span>
        </button>
      </div>
      <div class="form-row"><label>Check‑out</label>
        <button class="field-input date-trigger" data-date-target="checkout">
          <span class="field-input__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/></svg></span>
          <span class="field-input__value">${state.checkOut ? formatFriendlyDate(state.checkOut) : "Add date"}</span>
          <span class="field-input__chevron">›</span>
        </button>
      </div>
      <div class="form-row"><label>Guests</label>
        <div class="stepper-field" data-stepper="guests">
          <button class="stepper-field__btn" data-step="-1">−</button>
          <span class="stepper-field__value">${state.guests}</span>
          <button class="stepper-field__btn" data-step="1">+</button>
        </div>
      </div>
      <div class="price-summary" style="background:var(--bone-card);border-color:var(--stone-deep);margin-top:1rem;">
        <div class="price-summary__row"><span>Nightly rate</span><span>${formatPrice(apt.rate)}</span></div>
        <div class="price-summary__row"><span>Nights</span><span>${nights}</span></div>
        <div class="price-summary__row"><span>Cleaning</span><span>${formatPrice(apt.cleaning)}</span></div>
        <div class="price-summary__row price-summary__row--total"><span>Total</span><span>${formatPrice(total)}</span></div>
      </div>
      <button class="btn btn--brass reserve-btn" style="width:100%;margin-top:1rem;">Reserve</button>
    </div>
  `;

  $$(".drawer-gallery__thumb").forEach(t => {
    t.addEventListener("click", () => {
      const i = parseInt(t.dataset.index);
      $("#drawerMainImg").src = apt.images[i];
      $$(".drawer-gallery__thumb").forEach(x => x.classList.remove("is-active"));
      t.classList.add("is-active");
    });
  });

  $("#drawerMainImg").addEventListener("click", () => {
    $("#lightbox .lightbox__img").src = $("#drawerMainImg").src;
    $("#lightbox").classList.add("is-open");
  });

  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  if (window.lenis) window.lenis.stop();

  bindDateTriggers(content);
  bindSteppers(content);

  $(".reserve-btn", content).addEventListener("click", () => {
    syncBookingForm(apt);
    closeDrawer();
    scrollToEl($("#book"));
  });

  // Focus trap
  drawerTrapCleanup = trapFocus(drawer.querySelector(".drawer__panel"));
}

function closeDrawer() {
  const drawer = $("#drawer");
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  state.drawerOpen = false;
  if (drawerTrapCleanup) { drawerTrapCleanup(); drawerTrapCleanup = null; }
  if (window.lenis) window.lenis.start();
}

/* ---------- 11. DATE PICKER ---------- */
function bindDateTriggers(container = document) {
  $$(".date-trigger", container).forEach(btn => {
    if (btn._bound) return;
    btn._bound = true;
    btn.addEventListener("click", () => {
      state.datePickerTarget = btn.dataset.dateTarget;
      state.datePickerView = new Date();
      renderDatePicker();
      $("#datePickerModal").classList.add("is-open");
      $("#datePickerModal").setAttribute("aria-hidden", "false");
      if (window.lenis) window.lenis.stop();
      trapFocus($(".date-modal__panel"));
    });
  });
}

function renderDatePicker() {
  const grid = $("#dateModalGrid");
  const view = state.datePickerView;
  const year = view.getFullYear();
  const month = view.getMonth();
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const startDay = first.getDay();
  const apt = state.activeApartment || APARTMENTS[0];

  $("#dateModalMonth").textContent = first.toLocaleString("en-GB", { month: "long", year: "numeric", timeZone: TIMEZONE });

  let html = ["S", "M", "T", "W", "T", "F", "S"].map(d => `<div class="day-label">${d}</div>`).join("");
  for (let i = 0; i < startDay; i++) html += `<div></div>`;
  const todayIso = todayISO();
  for (let d = 1; d <= days; d++) {
    const date = new Date(year, month, d);
    const iso = dateToISO(date);
    const isPast = iso < todayIso;
    const booked = isBooked(apt, iso);
    const selected = (state.checkIn === iso || state.checkOut === iso);
    const inRange = state.checkIn && state.checkOut && iso > state.checkIn && iso < state.checkOut;
    html += `<button ${isPast || booked ? "disabled" : ""} class="${selected ? "is-selected" : ""} ${inRange ? "is-in-range" : ""}" data-date="${iso}">${d}</button>`;
  }
  grid.innerHTML = html;

  $$("button[data-date]", grid).forEach(btn => {
    btn.addEventListener("click", () => {
      const iso = btn.dataset.date;
      if (state.datePickerTarget === "checkin") {
        state.checkIn = iso;
        if (state.checkOut && state.checkOut <= iso) state.checkOut = null;
      } else {
        if (!state.checkIn) { toast("Please select a check‑in date first."); return; }
        if (iso <= state.checkIn) { toast("Check‑out must be after check‑in."); return; }
        if (!isRangeAvailable(apt, state.checkIn, iso)) { toast("Your dates include a booked period. Try a different range."); return; }
        if (nightsBetween(state.checkIn, iso) < apt.minNights) { toast(`${apt.name} has a ${apt.minNights}-night minimum.`); return; }
        state.checkOut = iso;
      }
      updateDateTriggers();
      updatePriceSummary();
      closeDatePicker();
      renderApartments(state.filter);
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  });
}

let dateModalTrapCleanup = null;
function closeDatePicker() {
  $("#datePickerModal").classList.remove("is-open");
  $("#datePickerModal").setAttribute("aria-hidden", "true");
  if (dateModalTrapCleanup) { dateModalTrapCleanup(); dateModalTrapCleanup = null; }
  if (window.lenis && !state.drawerOpen) window.lenis.start();
}

function updateDateTriggers() {
  $$(".date-trigger").forEach(btn => {
    const valueEl = btn.querySelector(".field-input__value");
    const isCheckin = btn.dataset.dateTarget === "checkin";
    const iso = isCheckin ? state.checkIn : state.checkOut;
    const label = iso ? formatFriendlyDate(iso) : "Add date";
    if (valueEl) valueEl.textContent = label;
    else btn.textContent = label; // hero panel uses simple button
  });
  const gt = $("[data-guests-trigger]");
  if (gt) gt.textContent = state.guests + (state.guests === 1 ? " guest" : " guests");
}

$$(".date-modal__nav").forEach(btn => {
  btn.addEventListener("click", () => {
    state.datePickerView.setMonth(state.datePickerView.getMonth() + parseInt(btn.dataset.month));
    renderDatePicker();
  });
});
$(".date-modal__close").addEventListener("click", closeDatePicker);
$(".date-modal__overlay").addEventListener("click", closeDatePicker);
$("#datePickerModal").addEventListener("keydown", e => { if (e.key === "Escape") closeDatePicker(); });

/* ---------- 12. STEPPERS ---------- */
function bindSteppers(container = document) {
  $$(".stepper, .stepper-field", container).forEach(el => {
    if (el._bound) return;
    el._bound = true;
    const val = el.querySelector(".stepper__value, .stepper-field__value");
    el.querySelectorAll(".stepper__btn, .stepper-field__btn").forEach(btn => {
      btn.addEventListener("click", () => {
        let v = parseInt(val.textContent);
        v += parseInt(btn.dataset.step);
        const max = state.activeApartment ? state.activeApartment.guests : 10;
        v = Math.max(1, Math.min(max, v));
        val.textContent = v;
        state.guests = v;
        updateDateTriggers();
        updatePriceSummary();
      });
    });
  });
}

/* Guest trigger */
let guestSheetTrapCleanup = null;
const guestTrigger = $("[data-guests-trigger]");
if (guestTrigger) {
  guestTrigger.addEventListener("click", () => {
    $("#guestSheet").classList.add("is-open");
    $("#guestSheet").setAttribute("aria-hidden", "false");
    if (window.lenis) window.lenis.stop();
    guestSheetTrapCleanup = trapFocus($(".guest-sheet__panel"));
  });
}
$(".guest-sheet__overlay").addEventListener("click", closeGuestSheet);
$(".guest-sheet__done").addEventListener("click", closeGuestSheet);
function closeGuestSheet() {
  $("#guestSheet").classList.remove("is-open");
  $("#guestSheet").setAttribute("aria-hidden", "true");
  if (guestSheetTrapCleanup) { guestSheetTrapCleanup(); guestSheetTrapCleanup = null; }
  if (window.lenis && !state.drawerOpen) window.lenis.start();
  updateDateTriggers();
  updatePriceSummary();
}

/* ---------- 13. PRICE SUMMARY ---------- */
function updatePriceSummary() {
  const apt = state.activeApartment || APARTMENTS[0];
  const nights = nightsBetween(state.checkIn, state.checkOut);
  const total = nights > 0 ? totalPrice(apt, nights) : 0;
  const rateEl = $("#summaryRate"), nightsEl = $("#summaryNights"), cleanEl = $("#summaryCleaning"), totalEl = $("#summaryTotal");
  if (rateEl) rateEl.textContent = formatPrice(apt.rate);
  if (nightsEl) nightsEl.textContent = nights;
  if (cleanEl) cleanEl.textContent = formatPrice(apt.cleaning);
  if (totalEl) totalEl.textContent = formatPrice(total);
}

/* ---------- 14. BOOKING FORM ---------- */
function syncBookingForm(apt) {
  const sel = $("#book-apartment");
  if (sel) sel.value = apt.slug;
  state.activeApartment = apt;
  updateDateTriggers();
  updatePriceSummary();
  const stepper = $("#book .stepper-field__value");
  if (stepper) { stepper.textContent = Math.min(state.guests, apt.guests); state.guests = parseInt(stepper.textContent); }
}

function populateApartmentSelect() {
  const sel = $("#book-apartment");
  if (!sel) return;
  sel.innerHTML = APARTMENTS.map(a => `<option value="${a.slug}">${a.name} — ${formatPrice(a.rate)} / night</option>`).join("");
  sel.addEventListener("change", () => {
    const apt = APARTMENTS.find(a => a.slug === sel.value);
    if (apt) { state.activeApartment = apt; syncBookingForm(apt); }
  });
}

/* Search button */
$("#searchBtn").addEventListener("click", () => {
  if (!state.checkIn || !state.checkOut) {
    $("#heroBarMessage").textContent = "Please select check‑in and check‑out dates.";
    return;
  }
  $("#heroBarMessage").textContent = "";
  if (state.typeFilter !== "all") {
    state.filter = state.typeFilter;
    $$(".filter-btn").forEach(b => {
      b.classList.toggle("is-active", b.dataset.filter === state.filter);
      b.setAttribute("aria-selected", b.dataset.filter === state.filter);
    });
  }
  renderApartments(state.filter);
  scrollToEl($("#apartments"));
  toast("Availability shown below.");
  if (window.ScrollTrigger) ScrollTrigger.refresh();
});

/* Mobile bottom sheet */
$("#mobileBookingTrigger").addEventListener("click", function () {
  const open = this.getAttribute("aria-expanded") === "true";
  this.setAttribute("aria-expanded", String(!open));
  $("#bottomSheet").classList.toggle("is-open", !open);
  $("#bottomSheet").setAttribute("aria-hidden", String(open));
  if (window.lenis) open ? window.lenis.start() : window.lenis.stop();
});
$(".bottom-sheet__overlay").addEventListener("click", () => {
  $("#bottomSheet").classList.remove("is-open");
  $("#mobileBookingTrigger").setAttribute("aria-expanded", "false");
  if (window.lenis) window.lenis.start();
});

/* Booking form submit */
$("#bookingForm").addEventListener("submit", e => {
  e.preventDefault();
  const form = e.target;
  const name = form.name.value.trim();
  const phone = form.phone.value.trim();
  if (!name || !phone) { toast("Please add your name and phone."); return; }
  if (!state.checkIn || !state.checkOut) { toast("Please select dates."); return; }
  const apt = state.activeApartment || APARTMENTS[0];
  if (!isRangeAvailable(apt, state.checkIn, state.checkOut)) { toast("Those dates are not available."); return; }
  const nights = nightsBetween(state.checkIn, state.checkOut);
  if (nights < apt.minNights) { toast(`${apt.name} requires ${apt.minNights} nights.`); return; }
  if (state.guests > apt.guests) { toast(`${apt.name} sleeps up to ${apt.guests} guests.`); return; }
  $("#bookSuccess").textContent = "Thank you — your request has been sent. We’ll reply within a few hours.";
  form.reset();
  syncBookingForm(apt);
  toast("Booking request sent (simulated).");
});

/* WhatsApp */
function updateWhatsApp() {
  const apt = state.activeApartment || APARTMENTS[0];
  const nights = nightsBetween(state.checkIn, state.checkOut);
  const total = nights > 0 ? totalPrice(apt, nights) : 0;
  const msg = `Hello Haven 24, I'd like to book ${apt.name} from ${state.checkIn || "—"} to ${state.checkOut || "—"} for ${state.guests} guest(s). Total: ${formatPrice(total)}.`;
  const link = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
  const w = $("#whatsappBtn"); if (w) w.href = link;
  const n = $("#navWhatsApp"); if (n) n.href = link;
}
setInterval(updateWhatsApp, 1000);

/* ---------- 15. FAQ ---------- */
const FAQS = [
  { q: "Check‑in and check‑out times", a: "Check‑in from 2pm. Check‑out by 11am. Early or late can be arranged on request." },
  { q: "What is the cancellation policy?", a: "Full refund up to 7 days before check‑in. 50% up to 48 hours. No refund within 48 hours." },
  { q: "Is there 24/7 power?", a: "Yes. Solar and inverter backup run through the night — no generator noise." },
  { q: "Is parking included?", a: "Yes, secure on‑site parking is included for one vehicle per apartment." },
  { q: "Are pets allowed?", a: "We love animals but cannot host pets at this time." },
  { q: "Is the area secure?", a: "The property is gated with controlled access and CCTV. The GRA is a quiet residential area." },
  { q: "Can I arrange airport or Lagos pickup?", a: "Yes — airport and Lagos pickup can be arranged on request for an additional fee." },
  { q: "What is the caution deposit?", a: "A refundable caution deposit of ₦20,000 is required and returned within 48 hours of check‑out." }
];
function renderFAQ() {
  const list = $("#faqList");
  if (!list) return;
  list.innerHTML = FAQS.map((f, i) => `
    <div class="faq-item">
      <button class="faq-item__trigger" aria-expanded="false" aria-controls="faq-panel-${i}">
        <span>${f.q}</span><span class="faq-item__icon">+</span>
      </button>
      <div class="faq-item__content" id="faq-panel-${i}" role="region"><p>${f.a}</p></div>
    </div>
  `).join("");
  $$(".faq-item__trigger").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const content = item.querySelector(".faq-item__content");
      const open = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open);
      content.style.maxHeight = open ? content.scrollHeight + "px" : "0";
    });
  });
}

/* ---------- 16. REVIEWS ---------- */
const REVIEWS = [
  { name: "Adaeze O.", type: "The Garden One‑Bed", date: "Jan 2026", text: "Quiet nights, no generator noise. The patio was my favourite spot." },
  { name: "Tunde A.", type: "The Studio", date: "Dec 2025", text: "Easy check‑in, fast Wi‑Fi, and the desk made working a pleasure." },
  { name: "Ngozi K.", type: "The Terrace Two‑Bed", date: "Nov 2025", text: "The terrace is huge. We had breakfast outside every morning." },
  { name: "Emeka O.", type: "The Penthouse", date: "Oct 2025", text: "Panoramic views and space for everyone. The rooftop is unforgettable." },
  { name: "Funke B.", type: "The Garden One‑Bed", date: "Sep 2025", text: "Blackout curtains saved my sleep. Clean, calm, and well‑kept." }
];
function renderReviews() {
  const scroller = $("#reviewsScroller");
  if (!scroller) return;
  scroller.innerHTML = REVIEWS.map(r => `
    <div class="review-card">
      <div class="review-card__avatar">${r.name.charAt(0)}</div>
      <p class="review-card__name">${r.name}</p>
      <p class="review-card__meta">${r.type} · ${r.date}</p>
      <p class="review-card__text">“${r.text}”</p>
    </div>
  `).join("");
  const prev = $(".reviews__arrow--prev");
  const next = $(".reviews__arrow--next");
  if (prev) prev.addEventListener("click", () => scroller.scrollBy({ left: -340, behavior: "smooth" }));
  if (next) next.addEventListener("click", () => scroller.scrollBy({ left: 340, behavior: "smooth" }));
}

/* ---------- 17. TOUR ---------- */
function renderTour(room = "living") {
  state.tourRoom = room;
  const stage = $("#tourStage");
  if (!stage) return;
  const hs = $("#tourHotspots");
  $$("img", stage).forEach(i => i.remove());
  const roomData = IMAGES.tour[room];
  const img = document.createElement("img");
  img.src = roomData.src;
  img.alt = `${room} at Haven 24`;
  img.loading = "lazy";
  img.className = "is-active";
  img.addEventListener("load", () => {
    hs.classList.add("is-ready");
  });
  stage.prepend(img);
  hs.classList.remove("is-ready");
  hs.innerHTML = (roomData.hotspots || []).map(h => `
    <div class="tour__hotspot" style="left:${h.x};top:${h.y};">
      <span class="tour__hotspot-tip">${h.tip}</span>
    </div>
  `).join("");
  $$(".tour__tab").forEach(t => {
    const active = t.dataset.room === room;
    t.classList.toggle("is-active", active);
    t.setAttribute("aria-selected", active);
  });
}
$$(".tour__tab").forEach(tab => tab.addEventListener("click", () => renderTour(tab.dataset.room)));
$("#tourPanToggle").addEventListener("click", function () {
  state.tourPanning = !state.tourPanning;
  this.textContent = state.tourPanning ? "Pause pan" : "Play pan";
  this.setAttribute("aria-pressed", String(!state.tourPanning));
});

/* ---------- 18. EXPERIENCE ---------- */
$$(".experience__toggle-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    $$(".experience__toggle-btn").forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    const time = btn.dataset.time;
    $$(".experience__img").forEach(i => i.classList.remove("is-active"));
    const target = $(`.experience__img--${time}`);
    if (target) target.classList.add("is-active");
    $(".experience__image-stage").classList.toggle("is-night", time === "night");
  });
});

/* ---------- 19. MOBILE MENU ---------- */
$(".nav__toggle").addEventListener("click", function () {
  const open = this.getAttribute("aria-expanded") === "true";
  this.setAttribute("aria-expanded", String(!open));
  $("#mobileMenu").classList.toggle("is-open", !open);
  $("#mobileMenu").setAttribute("aria-hidden", String(open));
  if (window.lenis) open ? window.lenis.start() : window.lenis.stop();
});
$$("#mobileMenu a").forEach(a => {
  a.addEventListener("click", () => {
    $(".nav__toggle").setAttribute("aria-expanded", "false");
    $("#mobileMenu").classList.remove("is-open");
    $("#mobileMenu").setAttribute("aria-hidden", "true");
    if (window.lenis) window.lenis.start();
  });
});

/* ---------- 20. LIGHTBOX ---------- */
$(".lightbox__close").addEventListener("click", () => $("#lightbox").classList.remove("is-open"));
$("#lightbox").addEventListener("click", e => { if (e.target.id === "lightbox") $("#lightbox").classList.remove("is-open"); });
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    $("#lightbox").classList.remove("is-open");
    closeDrawer();
    closeDatePicker();
    closeGuestSheet();
  }
});

/* ---------- 21. NEWSLETTER ---------- */
$("#newsletterForm")?.addEventListener("submit", e => {
  e.preventDefault();
  const input = e.target.querySelector("input");
  if (!input.value.includes("@")) { toast("Please enter a valid email."); return; }
  e.target.querySelector(".newsletter__success").textContent = "You’re on the list.";
  input.value = "";
  toast("Subscribed (simulated).");
});

/* ---------- 22. PLACEHOLDERS ---------- */
$$("[data-placeholder]").forEach(a => {
  a.addEventListener("click", e => { e.preventDefault(); toast("This is a placeholder link."); });
});

/* ---------- 23. CURSOR — event delegation ---------- */
(function initCursor() {
  if (!window.matchMedia("(pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cursor = $("#cursor");
  const dot = $(".cursor__dot");
  const ring = $(".cursor__ring");
  const label = $(".cursor__label");
  let mx = 0, my = 0, rx = 0, ry = 0, shown = false;

  document.addEventListener("mousemove", e => {
    mx = e.clientX; my = e.clientY;
    if (!shown) { cursor.classList.add("is-visible"); shown = true; }
  }, { passive: true });

  function loop() {
    rx += (mx - rx) * 0.15; ry += (my - ry) * 0.15;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  }
  loop();

  // Delegation: elements with data-cursor="view"
  const VIEW_SELECTOR = "img, .experience__image-stage, .apartment-card__image, .hero__container, .tour__stage";
  document.addEventListener("mouseover", e => {
    const target = e.target.closest(VIEW_SELECTOR);
    if (target) { cursor.classList.add("is-view"); label.textContent = "VIEW"; }
  });
  document.addEventListener("mouseout", e => {
    const target = e.target.closest(VIEW_SELECTOR);
    if (target) { cursor.classList.remove("is-view"); label.textContent = ""; }
  });
})();

/* ---------- 24. ANIMATIONS (no dependency on window.load) ---------- */
function initAnimations() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Preloader — always runs
  const pre = $("#preloader");
  if (pre) {
    if (sessionStorage.getItem("h24-visited")) {
      pre.style.display = "none";
    } else {
      setTimeout(() => {
        pre.classList.add("is-done");
        sessionStorage.setItem("h24-visited", "1");
      }, 1600);
    }
  }

  // Hero letters — GSAP if available, else show immediately
  const heroLetters = $$(".hero__letter");
  if (reduced || typeof gsap === "undefined") {
    heroLetters.forEach(el => { el.style.transform = "none"; el.style.opacity = "1"; });
  } else {
    // wait for preloader
    const delay = pre && pre.style.display !== "none" ? 1.6 : 0.3;
    gsap.to(heroLetters, {
      y: "0%", opacity: 1, duration: 1.1, stagger: 0.08, ease: "power3.out", delay
    });
    gsap.from(".hero__label", { opacity: 0, y: 20, duration: 1, delay: delay + 0.6, ease: "power2.out" });
    gsap.from(".booking-panel__inner", { opacity: 0, y: 30, duration: 1, delay: delay + 0.8, ease: "power2.out" });
  }

  if (reduced || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    // Statement words — show
    const stmt = $(".statement__headline");
    if (stmt) stmt.style.opacity = "1";
    // Reveal elements
    $$("[data-reveal]").forEach(el => { el.style.opacity = "1"; el.style.transform = "none"; });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Lenis
  if (typeof Lenis !== "undefined") {
    const lenis = new Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    window.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);

    let lastScroll = 0;
    lenis.on("scroll", ({ scroll }) => {
      const nav = $("#nav");
      if (scroll > lastScroll && scroll > 200) nav.classList.add("is-hidden");
      else nav.classList.remove("is-hidden");
      lastScroll = scroll;
    });
  }

  // Hero foreground parallax
  gsap.to("#heroForeground", {
    y: -40, ease: "none",
    scrollTrigger: { trigger: ".hero__container", start: "top top", end: "bottom top", scrub: true }
  });

  // Statement words reveal
  const stmt = $(".statement__headline");
  if (stmt) {
    const walker = document.createTreeWalker(stmt, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(node => {
      const words = node.textContent.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      words.forEach(w => {
        if (w.trim()) {
          const span = document.createElement("span");
          span.className = "word";
          span.style.display = "inline-block";
          span.style.opacity = "0";
          span.style.transform = "translateY(20px)";
          span.textContent = w;
          frag.appendChild(span);
        } else {
          frag.appendChild(document.createTextNode(w));
        }
      });
      node.parentNode.replaceChild(frag, node);
    });
    gsap.to(".statement__headline .word", {
      opacity: 1, y: 0, duration: 0.7, stagger: 0.03, ease: "power2.out",
      scrollTrigger: { trigger: stmt, start: "top 80%", once: true }
    });
  }

  // Reveal elements
  $$("[data-reveal]").forEach(el => {
    gsap.from(el, { opacity: 0, y: 30, duration: 1, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 85%", once: true } });
  });

  // Parallax
  $$("[data-parallax]").forEach(el => {
    const speed = parseFloat(el.dataset.parallax);
    gsap.to(el, { y: () => -window.innerHeight * speed, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
  });

  // Review bars
  $$(".review-bar__fill").forEach(el => {
    gsap.to(el, { width: el.dataset.width + "%", duration: 1.2, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
  });

  setTimeout(() => ScrollTrigger.refresh(), 1200);
}

/* ---------- 25. INIT ---------- */
function init() {
  initHero();
  initStatementPhotos();
  initHowImage();
  initExperience();
  renderApartments();
  populateApartmentSelect();
  bindDateTriggers();
  bindSteppers();
  renderFAQ();
  renderReviews();
  renderTour("living");
  updatePriceSummary();
  syncBookingForm(APARTMENTS[0]);
  updateWhatsApp();
  updateDateTriggers();
  initAnimations();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
