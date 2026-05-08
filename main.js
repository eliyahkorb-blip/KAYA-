/* ============================================================
   KAYA DÖNER – main.js
   ============================================================ */
'use strict';

(function () {
  /* Footer Jahr */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Sticky Header */
  var header = document.getElementById('site-header');
  if (header) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          header.classList.toggle('scrolled', window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* Mobile Nav */
  var burger = document.querySelector('.hamburger');
  var mobileNav = document.getElementById('mobile-nav');
  if (burger && mobileNav) {
    function closeMenu() {
      mobileNav.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Menü öffnen');
      burger.classList.remove('open');
      document.body.style.overflow = '';
    }
    function openMenu() {
      mobileNav.hidden = false;
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Menü schließen');
      burger.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    burger.addEventListener('click', function () { mobileNav.hidden ? openMenu() : closeMenu(); });
    mobileNav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !mobileNav.hidden) closeMenu(); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 960 && !mobileNav.hidden) closeMenu(); });
  }

  /* Smooth Scroll (ohne scrollIntoView) */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 64;
      var top = target.getBoundingClientRect().top + window.scrollY - navH + 1;
      window.scrollTo({ top: top, behavior: 'smooth' });
      history.replaceState(null, '', id);
    });
  });

  /* Aktive Nav-Links (IntersectionObserver) */
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-links a, .mobile-nav a');
  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          navLinks.forEach(function (link) {
            var match = link.getAttribute('href') === '#' + id;
            link.classList.toggle('active', match);
            if (match) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
          });
        }
      });
    }, { rootMargin: '-25% 0px -65% 0px', threshold: 0 });
    sections.forEach(function (s) { navObs.observe(s); });
  }

  /* Speisekarte Tabs */
  var tabs = document.querySelectorAll('[role="tab"]');
  var panels = document.querySelectorAll('[role="tabpanel"]');
  if (tabs.length) {
    function activateTab(btn) {
      tabs.forEach(function (t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); t.setAttribute('tabindex', '-1'); });
      panels.forEach(function (p) { p.classList.remove('active'); p.hidden = true; });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      btn.setAttribute('tabindex', '0');
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (panel) { panel.classList.add('active'); panel.hidden = false; }
    }
    tabs.forEach(function (btn) {
      btn.addEventListener('click', function () { activateTab(btn); });
      btn.addEventListener('keydown', function (e) {
        var list = Array.from(tabs); var idx = list.indexOf(btn); var next = null;
        if (e.key === 'ArrowRight') next = list[(idx + 1) % list.length];
        if (e.key === 'ArrowLeft')  next = list[(idx - 1 + list.length) % list.length];
        if (e.key === 'Home')       next = list[0];
        if (e.key === 'End')        next = list[list.length - 1];
        if (next) { e.preventDefault(); next.focus(); activateTab(next); }
      });
    });
  }

  /* Heutiger Tag in Öffnungszeiten hervorheben */
  var today = new Date().getDay();
  document.querySelectorAll('.hours-table tr[data-day]').forEach(function (row) {
    if (parseInt(row.getAttribute('data-day'), 10) === today) row.classList.add('today');
  });

  /* Cookie / Google Maps Consent */
  var KEY = 'kaya_maps_consent';
  var banner     = document.getElementById('cookie-banner');
  var acceptBtn  = document.getElementById('cookie-accept');
  var rejectBtn  = document.getElementById('cookie-reject');
  var loadMapBtn = document.getElementById('load-map');
  var settingsBtn = document.getElementById('cookie-settings-btn');
  var mapGate    = document.getElementById('map-gate');
  var mapFrame   = document.getElementById('map-frame');

  function getConsent() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setConsent(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function loadMap() {
    if (!mapGate || !mapFrame || mapFrame.querySelector('iframe')) return;
    var iframe = document.createElement('iframe');
    iframe.src = 'https://maps.google.com/maps?q=Rote+Wiese+2,+97267+Himmelstadt&output=embed&hl=de&z=16';
    iframe.title = 'Standort KAYA Döner – Rote Wiese 2, 97267 Himmelstadt';
    iframe.loading = 'lazy';
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    mapFrame.appendChild(iframe);
    mapFrame.hidden = false;
    mapGate.hidden = true;
  }
  function showBanner() { if (banner) banner.hidden = false; }
  function hideBanner() { if (banner) banner.hidden = true; }

  var consent = getConsent();
  if (consent === 'accepted') { loadMap(); hideBanner(); }
  else if (consent === null) { showBanner(); }
  else { hideBanner(); }

  if (acceptBtn)   acceptBtn.addEventListener('click',   function () { setConsent('accepted'); hideBanner(); loadMap(); });
  if (rejectBtn)   rejectBtn.addEventListener('click',   function () { setConsent('rejected'); hideBanner(); });
  if (loadMapBtn)  loadMapBtn.addEventListener('click',  function () { setConsent('accepted'); hideBanner(); loadMap(); });
  if (settingsBtn) settingsBtn.addEventListener('click', function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
    if (mapFrame) { mapFrame.innerHTML = ''; mapFrame.hidden = true; }
    if (mapGate) mapGate.hidden = false;
    showBanner();
  });

  /* Scroll Fade-in */
  var fadeEls = document.querySelectorAll('.fade-up');
  if (fadeEls.length && 'IntersectionObserver' in window) {
    var fadeObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); fadeObs.unobserve(entry.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    fadeEls.forEach(function (el) { fadeObs.observe(el); });
  } else {
    fadeEls.forEach(function (el) { el.classList.add('visible'); });
  }
})();
