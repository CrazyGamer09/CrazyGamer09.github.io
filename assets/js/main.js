/* ═══════════════════════════════════════════════════════════
   DURVESH PANCHBHAI — profile interactions
   Vanilla JS, no dependencies. Degrades to a readable page.
   ═══════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. THEME SWITCHER ─────────────────────────────────── */
  const THEMES = ['cursed', 'note', 'chakra'];
  const themeBtns = $$('.theme-switch button');

  function applyTheme(name, persist = true) {
    if (!THEMES.includes(name)) name = 'cursed';
    document.documentElement.dataset.anime = name;
    themeBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.theme === name)));
    if (persist) { try { localStorage.setItem('dp-theme', name); } catch (_) {} }
    window.dispatchEvent(new CustomEvent('themechange'));
  }

  let stored = null;
  try { stored = localStorage.getItem('dp-theme'); } catch (_) {}
  applyTheme(stored || 'cursed', false);
  themeBtns.forEach(b => b.addEventListener('click', () => applyTheme(b.dataset.theme)));

  /* ── 2. NAV: stuck state, progress bar, scroll spy ─────── */
  const nav      = $('#nav');
  const progress = $('#progressBar');
  const navLinks = $$('.nav-links a');
  const sections = navLinks
    .map(a => $(a.getAttribute('href')))
    .filter(Boolean);

  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('is-stuck', y > 24);

    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';

    // scroll spy — the section occupying the upper third wins
    const mark = y + window.innerHeight * 0.32;
    let current = -1;
    sections.forEach((sec, i) => { if (sec.offsetTop <= mark) current = i; });
    navLinks.forEach((a, i) => a.classList.toggle('is-active', i === current));

    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ── 3. MOBILE MENU ────────────────────────────────────── */
  const toggle = $('#menuToggle');
  const menu   = $('.nav-links');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('is-open', open);
  }
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  navLinks.forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ── 4. REVEAL ON SCROLL (with stagger per group) ──────── */
  const revealables = $$('[data-reveal]');

  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(el => el.classList.add('is-in'));
    $$('.power').forEach(fillMeter);
    $$('.hero-stats b').forEach(el => el.textContent = finalText(el));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      // stagger siblings that enter together
      const hits = entries.filter(e => e.isIntersecting);
      hits.forEach((entry, i) => {
        const el = entry.target;
        el.style.setProperty('--d', `${Math.min(i, 6) * 80}ms`);
        el.classList.add('is-in');
        if (el.classList.contains('power')) setTimeout(() => fillMeter(el), 180);
        if (el.classList.contains('hero-stats')) countUp(el);
        obs.unobserve(el);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    revealables.forEach(el => io.observe(el));
  }

  function fillMeter(power) {
    const bar = $('.meter-fill', power);
    if (bar) bar.style.width = Math.max(0, Math.min(100, +power.dataset.level || 0)) + '%';
  }

  /* ── 5. STAT COUNT-UP ──────────────────────────────────── */
  function finalText(el) {
    const n = el.dataset.count;
    return (el.dataset.prefix || '') + n + (el.dataset.suffix || '');
  }

  function countUp(scope) {
    $$('b[data-count]', scope).forEach(el => {
      const target   = parseFloat(el.dataset.count);
      const decimals = (el.dataset.count.split('.')[1] || '').length;
      const pre = el.dataset.prefix || '';
      const suf = el.dataset.suffix || '';
      const dur = 1400;
      let start = null;

      function step(ts) {
        if (start === null) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = pre + (target * eased).toFixed(decimals) + suf;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = pre + target.toFixed(decimals) + suf;
      }
      el.textContent = pre + (0).toFixed(decimals) + suf;
      requestAnimationFrame(step);
    });
  }

  /* ── 6. TYPEWRITER ─────────────────────────────────────── */
  const LINES = [
    'backend engineer',
    'golang · python · aws',
    'payment infrastructure',
    'event-driven systems',
    'Rs.50Cr+ a day, 99.9% up'
  ];
  const tw = $('#typewriter');

  if (tw) {
    if (reduced) {
      tw.textContent = LINES[0];
    } else {
      let li = 0, ci = 0, deleting = false;
      (function tick() {
        const line = LINES[li];
        ci += deleting ? -1 : 1;
        tw.textContent = line.slice(0, ci);

        let wait = deleting ? 38 : 68;
        if (!deleting && ci === line.length) { deleting = true; wait = 1900; }
        else if (deleting && ci === 0)       { deleting = false; li = (li + 1) % LINES.length; wait = 380; }
        setTimeout(tick, wait);
      })();
    }
  }

  /* ── 7. CURSED-ENERGY CANVAS ───────────────────────────── */
  const cv = $('#energy');
  if (cv && !reduced) {
    const ctx = cv.getContext('2d', { alpha: true });
    let w = 0, h = 0, dpr = 1, motes = [], accent = '139,92,246', raf = null;

    function readAccent() {
      const hex = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent').trim();
      const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (m) accent = `${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)}`;
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round(Math.min(70, Math.max(22, (w * h) / 26000)));
      motes = Array.from({ length: count }, () => spawn(true));
    }

    function spawn(anywhere) {
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : h + 14,
        r: 0.6 + Math.random() * 1.9,
        vy: 0.16 + Math.random() * 0.48,
        vx: (Math.random() - 0.5) * 0.22,
        a: 0.12 + Math.random() * 0.5,
        ph: Math.random() * Math.PI * 2,
        sp: 0.006 + Math.random() * 0.016
      };
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        m.y -= m.vy;
        m.ph += m.sp;
        m.x += m.vx + Math.sin(m.ph) * 0.28;
        if (m.y < -14) Object.assign(m, spawn(false));

        const flick = m.a * (0.6 + 0.4 * Math.sin(m.ph * 2.3));
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${accent},${flick.toFixed(3)})`;
        ctx.shadowBlur = m.r * 5;
        ctx.shadowColor = `rgba(${accent},${(flick * 0.8).toFixed(3)})`;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(frame);
    }

    function start() { if (raf === null) raf = requestAnimationFrame(frame); }
    function stop()  { if (raf !== null) { cancelAnimationFrame(raf); raf = null; } }

    readAccent();
    resize();
    start();

    window.addEventListener('themechange', readAccent);
    window.addEventListener('resize', debounce(resize, 180));
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  }

  function debounce(fn, ms) {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  }

  /* ── 8. DOMAIN EXPANSION (type "domain") ───────────────── */
  const overlay = $('#domainOverlay');
  const SECRET = 'domain';
  let buf = '';

  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    if (e.key.length !== 1) return;

    buf = (buf + e.key.toLowerCase()).slice(-SECRET.length);
    if (buf === SECRET && overlay && !overlay.classList.contains('is-on')) {
      overlay.classList.add('is-on');
      setTimeout(() => overlay.classList.remove('is-on'), 2200);
      buf = '';
    }
  });
})();
