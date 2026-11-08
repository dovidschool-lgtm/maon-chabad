// תפריט נייד, לשוניות התפריט, וגלילה כמו באתר של בית הספר
window.siteReady = true;
const root = document.documentElement;
const motion = root.classList.contains('motion');
const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

const btn = document.querySelector('.menu-btn');
const nav = document.getElementById('nav');
if (btn && nav) {
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
  nav.addEventListener('click', e => {
    if (e.target.tagName === 'A') { nav.classList.remove('open'); btn.setAttribute('aria-expanded', false); }
  });
}

document.querySelectorAll('[role="tab"]').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('[role="tab"]').forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', on);
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (lenis) lenis.resize();
  });
});

// גלילה חלקה בעכבר. בטלפון נשארת הגלילה הטבעית
let lenis = null;
if (motion && window.Lenis) {
  lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
  document.querySelectorAll('a[href*="#"]').forEach((a) => {
    const target = a.pathname === location.pathname && a.hash ? document.querySelector(a.hash) : null;
    if (target) a.addEventListener('click', (e) => { e.preventDefault(); lenis.scrollTo(target, { offset: -84 }); });
  });
  document.querySelectorAll('details').forEach((d) => d.addEventListener('toggle', () => lenis.resize()));
}

// כניסה בגלילה. הרשימה זהה לזו שב-style.css
if (motion) {
  const items = document.querySelectorAll('main h2, main .lead, main .sub, main .card, main .timeline li, main .table-scroll, main details.rule, main .chips li, main .flag, main .tabs, main table.cal tr');
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      reveal.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
  items.forEach((el) => {
    if (el.closest('.open-text')) return;
    const order = [...el.parentElement.children].indexOf(el);
    el.style.setProperty('--d', `${Math.min(order, 6) * 70}ms`);
    reveal.observe(el);
  });
}

// כל מה שתלוי במיקום הגלילה, פעם אחת בכל פריים
const header = document.querySelector('.topbar');
const bar = document.querySelector('.scroll-progress');
const opener = document.querySelector('[data-open-scroll]');
const openFrame = opener && opener.querySelector('.open-pin');
let queued = false;

function update() {
  queued = false;
  const y = window.scrollY;
  const vh = window.innerHeight;
  header.classList.toggle('is-scrolled', y > 12);
  const max = root.scrollHeight - vh;
  bar.style.setProperty('--scroll', max > 0 ? (y / max).toFixed(4) : '0');

  if (opener) {
    const box = opener.getBoundingClientRect();
    const p = clamp(-box.top / (box.height - vh));
    const eased = 1 - (1 - clamp(p / 0.8)) ** 2;
    const mobile = window.innerWidth < 700;
    openFrame.style.setProperty('--inset-y', `${((1 - eased) * (mobile ? 14 : 22)).toFixed(2)}%`);
    openFrame.style.setProperty('--inset-x', `${((1 - eased) * (mobile ? 8 : 26)).toFixed(2)}%`);
    openFrame.style.setProperty('--round', `${((1 - eased) * 40).toFixed(1)}px`);
    openFrame.style.setProperty('--zoom', (1.22 - eased * 0.22).toFixed(3));
    const shade = clamp((p - 0.45) / 0.35);
    openFrame.style.setProperty('--shade', shade.toFixed(3));
    openFrame.style.setProperty('--text-y', `${((1 - shade) * 24).toFixed(1)}px`);
  }
}

function requestUpdate() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(update);
}

addEventListener('scroll', requestUpdate, { passive: true });
addEventListener('resize', requestUpdate, { passive: true });
update();
