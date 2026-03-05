'use strict';

const IS_MOBILE = window.matchMedia('(max-width: 768px)').matches;

/* ============================================================
   CURSOR (desktop uniquement)
   ============================================================ */
const cursor   = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');

if (!IS_MOBILE && cursor && follower) {
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
}

/* ============================================================
   PARALLAX HOME (grid + floating tags, desktop uniquement)
   ============================================================ */
if (!IS_MOBILE) {
  const heroGrid = document.querySelector('#home .hero-bg-grid');

  // Chaque tag a sa propre "profondeur" pour un effet de parallaxe en couches
  const floatingTags = [
    ...document.querySelectorAll('#home .floating-tag')
  ].map((el, i) => {
    // Amplitude alternée : certains bougent plus que d'autres, et en sens opposé
    const depths = [1.0, -0.7, 0.5, -1.2, 0.85];
    return { el, depth: depths[i % depths.length] };
  });

  // États courants (lerp séparé pour grid et tags)
  let targetX = 0, targetY = 0;
  let gridX = 0, gridY = 0;

  // Amplitudes max
  const GRID_SHIFT = 18;   // pixels max pour le quadrillage
  const TAG_SHIFT  = 28;   // pixels max pour les tags (un peu plus prononcé)

  document.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth  - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // États lerp individuels pour chaque tag
  const tagStates = floatingTags.map(() => ({ x: 0, y: 0 }));

  (function animateParallax() {
    // Grid : lerp lent et paresseux
    gridX += (targetX - gridX) * 0.04;
    gridY += (targetY - gridY) * 0.04;

    if (heroGrid) {
      heroGrid.style.transform = `translate(${gridX * GRID_SHIFT}px, ${gridY * GRID_SHIFT}px)`;
    }

    // Tags : lerp légèrement plus réactif, chacun avec sa profondeur
    floatingTags.forEach(({ el, depth }, i) => {
      const state = tagStates[i];
      const tx = targetX * TAG_SHIFT * depth;
      const ty = targetY * TAG_SHIFT * depth;

      state.x += (tx - state.x) * 0.055;
      state.y += (ty - state.y) * 0.055;

      el.style.transform = `translate(calc(-50% + ${state.x}px), calc(-50% + ${state.y}px))`;
    });

    requestAnimationFrame(animateParallax);
  })();
}

/* ============================================================
   SPA NAVIGATION (desktop uniquement)
   ============================================================ */
let currentPageId   = 'home';
let isTransitioning = false;

function updateNavLinks(id) {
  document.querySelectorAll('.nav-link').forEach(l =>
    l.classList.toggle('active', l.dataset.goto === id)
  );
}

function goToPage(targetId) {
  if (IS_MOBILE) return;
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

    if (targetId === 'hard-skills') resetHardHub();
    if (targetId === 'soft-skills') resetSoftHub();
    if (targetId === 'about')       startCounters();
    updateNavLinks(targetId);

    setTimeout(() => { isTransitioning = false; }, 600);
  }, 300);
}

/* data-goto bindings */
document.querySelectorAll('[data-goto]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    const id = el.dataset.goto;

    if (IS_MOBILE) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    goToPage(id);
  });
});

/* Desktop init */
if (!IS_MOBILE) updateNavLinks('home');

/* ============================================================
   HARD HUB (desktop)
   ============================================================ */
const hardSkillsPage = document.getElementById('hard-skills');
const hardHubCenter  = document.getElementById('hubCenter');
let hardActivePanel  = null;

function resetHardHub() {
  if (!hardSkillsPage || !hardHubCenter) return;
  hardSkillsPage.querySelectorAll('.skill-panel').forEach(p => p.classList.remove('active'));
  hardHubCenter.classList.remove('hidden');
  hardSkillsPage.classList.remove('panel-open');
  hardActivePanel = null;
}
function openHardPanel(targetId) {
  const panel = document.getElementById(targetId);
  if (!panel || !hardSkillsPage || !hardHubCenter) return;
  hardHubCenter.classList.add('hidden');
  hardSkillsPage.classList.add('panel-open');
  panel.classList.add('active');
  hardActivePanel = panel;
}
function closeHardPanel() {
  if (!hardActivePanel || !hardSkillsPage || !hardHubCenter) return;
  const closing  = hardActivePanel;
  hardActivePanel = null;
  hardSkillsPage.classList.remove('panel-open');
  closing.classList.remove('active');
  const onEnd    = () => hardHubCenter.classList.remove('hidden');
  const fallback = setTimeout(onEnd, 650);
  closing.addEventListener('transitionend', () => { clearTimeout(fallback); onEnd(); }, { once: true });
}

if (!IS_MOBILE && hardSkillsPage) {
  hardSkillsPage.querySelectorAll('.orbit-anchor').forEach(btn => {
    btn.addEventListener('click', (e) => { e.preventDefault(); openHardPanel(btn.dataset.target); });
  });
  hardSkillsPage.querySelectorAll('.panel-back-btn').forEach(btn => {
    btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); closeHardPanel(); });
  });
}

/* ============================================================
   SOFT HUB (desktop)
   ============================================================ */
const softSkillsPage = document.getElementById('soft-skills');
const softHubCenter  = document.getElementById('softHubCenter');
let softActivePanel  = null;

function resetSoftHub() {
  if (!softSkillsPage || !softHubCenter) return;
  softSkillsPage.querySelectorAll('.soft-panel').forEach(p => p.classList.remove('active'));
  softHubCenter.classList.remove('hidden');
  softSkillsPage.classList.remove('panel-open');
  softActivePanel = null;
}
function openSoftPanel(targetId) {
  const panel = document.getElementById(targetId);
  if (!panel || !softSkillsPage || !softHubCenter) return;
  softHubCenter.classList.add('hidden');
  softSkillsPage.classList.add('panel-open');
  panel.classList.add('active');
  softActivePanel = panel;
}
function closeSoftPanel() {
  if (!softActivePanel || !softSkillsPage || !softHubCenter) return;
  const closing  = softActivePanel;
  softActivePanel = null;
  softSkillsPage.classList.remove('panel-open');
  closing.classList.remove('active');
  const onEnd    = () => softHubCenter.classList.remove('hidden');
  const fallback = setTimeout(onEnd, 650);
  closing.addEventListener('transitionend', () => { clearTimeout(fallback); onEnd(); }, { once: true });
}

if (!IS_MOBILE && softSkillsPage) {
  softSkillsPage.querySelectorAll('.soft-anchor').forEach(btn => {
    btn.addEventListener('click', (e) => { e.preventDefault(); openSoftPanel(btn.dataset.target); });
  });
  softSkillsPage.querySelectorAll('.soft-panel-back').forEach(btn => {
    btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); closeSoftPanel(); });
  });
}

/* ============================================================
   MODAL MOBILE
   ============================================================ */
const modalOverlay  = document.getElementById('modalOverlay');
const modalContent  = document.getElementById('modalContent');
const modalCloseBtn = document.getElementById('modalCloseBtn');

function openModal(panelId) {
  if (!modalOverlay || !modalContent) return;
  const panel = document.getElementById(panelId);
  if (!panel) return;
  const inner = panel.querySelector('.skill-panel-inner');
  if (!inner) return;

  modalContent.innerHTML = inner.innerHTML;
  modalOverlay.classList.add('open');
  modalOverlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (!modalOverlay) return;
  modalOverlay.classList.remove('open');
  modalOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

if (modalCloseBtn) {
  modalCloseBtn.addEventListener('click', closeModal);
}
if (modalOverlay) {
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
}

if (IS_MOBILE) {
  document.querySelectorAll('.skill-card-mobile[data-modal]').forEach(card => {
    const modalId = card.dataset.modal;
    if (!modalId) return;
    card.addEventListener('click', () => openModal(modalId));
  });
}

/* ============================================================
   ABOUT COUNTERS
   ============================================================ */
let countersStarted = false;
function startCounters() {
  if (countersStarted) return;
  countersStarted = true;

  document.querySelectorAll('.stat-number').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    let step = 0;
    const steps = 40;

    const timer = setInterval(() => {
      step++;
      el.textContent = Math.min(Math.round(target / steps * step), target);
      if (step >= steps) clearInterval(timer);
    }, 1200 / steps);
  });
}

if (IS_MOBILE) {
  const aboutSection = document.getElementById('about');
  if (aboutSection) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) startCounters();
    }, { threshold: 0.3 });
    observer.observe(aboutSection);
  }
}