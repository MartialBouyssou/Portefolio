'use strict';

// ─────────────────────────────────────────────
// 1) CURSEUR
// ─────────────────────────────────────────────
const cursor   = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let mx = 0, my = 0, fx = 0, fy = 0;

document.addEventListener('mousemove', (e) => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top  = my + 'px';
});

(function loop() {
  fx += (mx - fx) * 0.12;
  fy += (my - fy) * 0.12;
  follower.style.left = fx + 'px';
  follower.style.top  = fy + 'px';
  requestAnimationFrame(loop);
})();

// ─────────────────────────────────────────────
// 2) NAVIGATION ENTRE PAGES
// ─────────────────────────────────────────────
let currentPageId   = 'home';
let isTransitioning = false;

function goToPage(targetId) {
  if (targetId === currentPageId || isTransitioning) return;

  const fromPage = document.getElementById(currentPageId);
  const toPage   = document.getElementById(targetId);
  if (!fromPage || !toPage) return;

  isTransitioning = true;
  fromPage.classList.add('exit-up');

  setTimeout(() => {
    fromPage.classList.remove('active', 'exit-up');
    toPage.classList.add('active');
    currentPageId = targetId;

    if (targetId === 'hard-skills') resetHub();
    if (targetId === 'about') startCounters();
    updateNavLinks(targetId);

    setTimeout(() => { isTransitioning = false; }, 600);
  }, 300);
}

document.querySelectorAll('[data-goto]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    goToPage(el.dataset.goto);
  });
});

function updateNavLinks(id) {
  document.querySelectorAll('.nav-link').forEach(l =>
    l.classList.toggle('active', l.dataset.goto === id)
  );
}

// ─────────────────────────────────────────────
// 3) HARD SKILLS HUB
// ─────────────────────────────────────────────
const hardSkillsPage = document.getElementById('hard-skills');
const hubCenter      = document.getElementById('hubCenter');
const skillPanels    = document.querySelectorAll('.skill-panel');
const orbitBtns      = document.querySelectorAll('.orbit-anchor');

let activePanel = null;

function openPanel(targetId) {
  const panel = document.getElementById(targetId);
  if (!panel) return;

  hubCenter.classList.add('hidden');
  hardSkillsPage.classList.add('panel-open');

  panel.classList.add('active');
  activePanel = panel;
}

function closePanel() {
  if (!activePanel) return;

  const closing = activePanel;
  activePanel = null;

  // Réactive immédiatement tout ce qui est hub (ancres + bouton accueil)
  hardSkillsPage.classList.remove('panel-open');

  // Lance la transition de sortie
  closing.classList.remove('active');

  // À la fin, on ré-affiche la carte centrale
  const onEnd = () => {
    hubCenter.classList.remove('hidden');
  };

  const fallback = setTimeout(onEnd, 650);
  closing.addEventListener('transitionend', () => {
    clearTimeout(fallback);
    onEnd();
  }, { once: true });
}

function resetHub() {
  skillPanels.forEach(p => p.classList.remove('active'));
  hubCenter.classList.remove('hidden');
  hardSkillsPage.classList.remove('panel-open');
  activePanel = null;
}

orbitBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    openPanel(btn.dataset.target);
  });
});

// Retour au hub depuis un panel
document.querySelectorAll('.panel-back-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closePanel();
  });
});

// ─────────────────────────────────────────────
// 4) PARALLAXE HERO
// ─────────────────────────────────────────────
const heroContent = document.querySelector('.hero-content');
const heroBg      = document.querySelector('.hero-bg-grid');
const heroTags    = document.querySelector('.hero-floating-tags');

document.addEventListener('mousemove', (e) => {
  if (currentPageId !== 'home') return;

  const dx = (e.clientX - window.innerWidth  / 2) / (window.innerWidth  / 2);
  const dy = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);

  if (heroContent) heroContent.style.transform = `translate(${dx * -8}px, ${dy * -8}px)`;
  if (heroBg)      heroBg.style.transform      = `translate(${dx * 14}px, ${dy * 14}px)`;
  if (heroTags)    heroTags.style.transform    = `translate(${dx * -18}px, ${dy * -18}px)`;
});

// ─────────────────────────────────────────────
// 5) TILT SOFT CARDS
// ─────────────────────────────────────────────
document.querySelectorAll('.soft-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform =
      `perspective(600px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

// ─────────────────────────────────────────────
// 6) COMPTEURS ABOUT
// ─────────────────────────────────────────────
let countersStarted = false;
function startCounters() {
  if (countersStarted) return;
  countersStarted = true;

  document.querySelectorAll('.stat-number').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    let step = 0; const steps = 40;
    const timer = setInterval(() => {
      step++;
      el.textContent = Math.min(Math.round(target / steps * step), target);
      if (step >= steps) clearInterval(timer);
    }, 1200 / steps);
  });
}

// ─────────────────────────────────────────────
// 7) CLAVIER
// ─────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  const map = { KeyH:'home', KeyA:'about', KeyS:'hard-skills', KeyL:'soft-skills' };
  if (map[e.code]) goToPage(map[e.code]);

  if (e.key === 'Escape' && currentPageId === 'hard-skills' && activePanel) {
    closePanel();
  }
});

// ─────────────────────────────────────────────
// 8) INIT
// ─────────────────────────────────────────────
document.getElementById('home').classList.add('active');
updateNavLinks('home');