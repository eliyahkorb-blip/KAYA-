/* ============================================================
   KAYA DÖNER – main.js
   ============================================================ */

'use strict';

/* ── 1. STICKY HEADER ──────────────────────────────────────── */
(function () {
  const header = document.getElementById('site-header');
  if (!header) return;

  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(function () {
        header.classList.toggle('scrolled', window.scrollY > 60);
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
})();

/* ── 2. MOBILE NAV TOGGLE ──────────────────────────────────── */
(function () {
  const btn       = document.querySelector('.hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  if (!btn || !mobileNav) return;

  function closeMenu() {
    mobileNav.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Menü öffnen');
    btn.classList.remove('open');
    document.body.style.overflow = '';
  }

  function openMenu() {
    mobileNav.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Menü schließen');
    btn.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  btn.addEventListener('click', function () {
    mobileNav.hidden ? openMenu() : closeMenu();
  });

  // Close when a link is clicked
  mobileNav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (!mobileNav.hidden && !mobileNav.contains(e.target) && !btn.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !mobileNav.hidden) closeMenu();
  });
})();

/* ── 3. SMOOTH SCROLL (JS fallback + offset) ───────────────── */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const id     = anchor.getAttribute('href');
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();

      const navH = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-h')) || 72;

      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
})();

/* ── 4. ACTIVE NAV HIGHLIGHT (IntersectionObserver) ────────── */
(function () {
  const sections  = document.querySelectorAll('section[id], div[id="kontakt"]');
  const allLinks  = document.querySelectorAll('.nav-links a, .mobile-nav a');

  if (!sections.length || !allLinks.length) return;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        allLinks.forEach(function (link) {
          const matches = link.getAttribute('href') === '#' + id;
          link.classList.toggle('active', matches);
          link.setAttribute('aria-current', matches ? 'page' : 'false');
        });
      }
    });
  }, {
    rootMargin: '-25% 0px -65% 0px',
    threshold:  0
  });

  sections.forEach(function (s) { observer.observe(s); });
})();

/* ── 5. MENU TABS ───────────────────────────────────────────── */
(function () {
  const tabs   = document.querySelectorAll('[role="tab"]');
  const panels = document.querySelectorAll('[role="tabpanel"]');
  if (!tabs.length) return;

  function activateTab(btn) {
    // Deactivate all
    tabs.forEach(function (t) {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
      t.setAttribute('tabindex', '-1');
    });
    panels.forEach(function (p) {
      p.classList.remove('active');
      p.hidden = true;
    });

    // Activate selected
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    btn.setAttribute('tabindex', '0');
    const panelId = btn.getAttribute('aria-controls');
    const panel   = document.getElementById(panelId);
    if (panel) {
      panel.classList.add('active');
      panel.hidden = false;
    }
  }

  tabs.forEach(function (btn) {
    btn.addEventListener('click', function () { activateTab(btn); });

    // Keyboard navigation
    btn.addEventListener('keydown', function (e) {
      const list  = Array.from(tabs);
      const idx   = list.indexOf(btn);
      let next    = null;

      if (e.key === 'ArrowRight') next = list[(idx + 1) % list.length];
      if (e.key === 'ArrowLeft')  next = list[(idx - 1 + list.length) % list.length];
      if (e.key === 'Home')       next = list[0];
      if (e.key === 'End')        next = list[list.length - 1];

      if (next) {
        e.preventDefault();
        next.focus();
        activateTab(next);
      }
    });
  });
})();

/* ── 6. COOKIE BANNER + GOOGLE MAPS CONSENT ────────────────── */
(function () {
  var KEY        = 'kaya_maps_consent';
  var banner     = document.getElementById('cookie-banner');
  var acceptBtn  = document.getElementById('cookie-accept');
  var rejectBtn  = document.getElementById('cookie-reject');
  var loadMapBtn = document.getElementById('load-map');
  var settingsBtn = document.getElementById('cookie-settings-btn');
  var mapGate    = document.getElementById('map-gate');
  var mapFrame   = document.getElementById('map-frame');

  function getConsent()   { try { return localStorage.getItem(KEY); } catch(e) { return null; } }
  function setConsent(v)  { try { localStorage.setItem(KEY, v); } catch(e) {} }

  function loadMap() {
    if (!mapGate || !mapFrame) return;
    var iframe       = document.createElement('iframe');
    iframe.src       = 'https://maps.google.com/maps?q=Rote+Wiese+2,+97267+Himmelstadt&output=embed&hl=de&z=16';
    iframe.title     = 'Standort KAYA Döner – Rote Wiese 2, 97267 Himmelstadt';
    iframe.loading   = 'lazy';
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    iframe.style.cssText = 'width:100%;height:100%;border:0;display:block;';
    mapFrame.appendChild(iframe);
    mapFrame.hidden = false;
    mapGate.hidden  = true;
  }

  function showBanner()   { if (banner) banner.hidden = false; }
  function hideBanner()   { if (banner) banner.hidden = true; }

  // Init on load
  var consent = getConsent();
  if (consent === 'accepted') {
    loadMap();
    hideBanner();
  } else if (consent === null) {
    showBanner();
  } else {
    hideBanner(); // rejected — gate stays, banner hidden
  }

  if (acceptBtn) {
    acceptBtn.addEventListener('click', function () {
      setConsent('accepted');
      hideBanner();
      loadMap();
    });
  }
  if (rejectBtn) {
    rejectBtn.addEventListener('click', function () {
      setConsent('rejected');
      hideBanner();
    });
  }
  if (loadMapBtn) {
    loadMapBtn.addEventListener('click', function () {
      setConsent('accepted');
      hideBanner();
      loadMap();
    });
  }
  if (settingsBtn) {
    settingsBtn.addEventListener('click', function () {
      try { localStorage.removeItem(KEY); } catch(e) {}
      showBanner();
    });
  }
})();

/* ── 7. OPENING HOURS – HIGHLIGHT TODAY ─────────────────────── */
(function () {
  var today = new Date().getDay(); // 0=Sun, 1=Mon, …, 6=Sat
  var rows  = document.querySelectorAll('.hours-table tr[data-day]');
  rows.forEach(function (row) {
    if (parseInt(row.getAttribute('data-day'), 10) === today) {
      row.classList.add('today');
    }
  });
})();

/* ── 8. SCROLL FADE-IN ANIMATIONS ──────────────────────────── */
(function () {
  var targets = document.querySelectorAll('.fade-up');
  if (!targets.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach(function (el) { observer.observe(el); });
})();
