'use strict';

const IS_MOBILE = window.matchMedia('(max-width: 768px)').matches;

/* Cursor (desktop) */
const cursor = document.getElementById('cursor');
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

/* SPA navigation (desktop only) */
let currentPageId = 'home';
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
    if (targetId === 'about') startCounters();
    updateNavLinks(targetId);

    setTimeout(() => { isTransitioning = false; }, 600);
  }, 300);
}

/* data-goto binding */
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

/* Desktop init: home is already active in HTML */
if (!IS_MOBILE) updateNavLinks('home');

/* Hard hub */
const hardSkillsPage = document.getElementById('hard-skills');
const hardHubCenter  = document.getElementById('hubCenter');
let hardActivePanel = null;

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

  const closing = hardActivePanel;
  hardActivePanel = null;

  hardSkillsPage.classList.remove('panel-open');
  closing.classList.remove('active');

  const onEnd = () => hardHubCenter.classList.remove('hidden');
  const fallback = setTimeout(onEnd, 650);
  closing.addEventListener('transitionend', () => {
    clearTimeout(fallback);
    onEnd();
  }, { once: true });
}

if (!IS_MOBILE && hardSkillsPage) {
  hardSkillsPage.querySelectorAll('.orbit-anchor').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openHardPanel(btn.dataset.target);
    });
  });

  hardSkillsPage.querySelectorAll('.panel-back-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeHardPanel();
    });
  });
}

/* Soft hub */
const softSkillsPage = document.getElementById('soft-skills');
const softHubCenter  = document.getElementById('softHubCenter');
let softActivePanel = null;

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

  const closing = softActivePanel;
  softActivePanel = null;

  softSkillsPage.classList.remove('panel-open');
  closing.classList.remove('active');

  const onEnd = () => softHubCenter.classList.remove('hidden');
  const fallback = setTimeout(onEnd, 650);
  closing.addEventListener('transitionend', () => {
    clearTimeout(fallback);
    onEnd();
  }, { once: true });
}

if (!IS_MOBILE && softSkillsPage) {
  softSkillsPage.querySelectorAll('.soft-anchor').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openSoftPanel(btn.dataset.target);
    });
  });

  softSkillsPage.querySelectorAll('.soft-panel-back').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeSoftPanel();
    });
  });
}

/* About counters */
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