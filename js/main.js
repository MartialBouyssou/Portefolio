'use strict';

const IS_MOBILE = window.matchMedia('(max-width: 768px)').matches;

const cursor   = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');

if (!IS_MOBILE && cursor && follower) {
  let mx = 0, my = 0, fx = 0, fy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
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

if (!IS_MOBILE) {
  const heroGrid   = document.querySelector('#home .hero-bg-grid');
  const tags       = [...document.querySelectorAll('#home .floating-tag')];
  const tagDepths  = [1.0, -0.7, 0.5, -1.2, 0.85];
  const tagStates  = tags.map(() => ({ x: 0, y: 0 }));

  let targetX = 0, targetY = 0;
  let gridX   = 0, gridY   = 0;

  document.addEventListener('mousemove', e => {
    targetX = (e.clientX / window.innerWidth  - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  (function animateParallax() {
    gridX += (targetX - gridX) * 0.04;
    gridY += (targetY - gridY) * 0.04;

    if (heroGrid) {
      heroGrid.style.transform = `translate(${gridX * 18}px, ${gridY * 18}px)`;
    }

    tags.forEach((el, i) => {
      const depth = tagDepths[i] ?? 1;
      const s     = tagStates[i];
      s.x += (targetX * 28 * depth - s.x) * 0.055;
      s.y += (targetY * 28 * depth - s.y) * 0.055;
      el.style.transform = `translate(calc(-50% + ${s.x}px), calc(-50% + ${s.y}px))`;
    });

    requestAnimationFrame(animateParallax);
  })();
}

const pickerOverlay  = document.getElementById('skillsPickerOverlay');
const pickerClose    = document.getElementById('skillsPickerClose');
const btnCompetences = document.getElementById('btnVoirCompetences');
const pickHard       = document.getElementById('pickHard');
const pickSoft       = document.getElementById('pickSoft');

function openPicker() {
  pickerOverlay.classList.add('open');
  pickerOverlay.setAttribute('aria-hidden', 'false');
}

function closePicker() {
  pickerOverlay.classList.remove('open');
  pickerOverlay.setAttribute('aria-hidden', 'true');
}

if (btnCompetences) {
  btnCompetences.addEventListener('click', () => {
    if (IS_MOBILE) {
      document.getElementById('hard-skills')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      openPicker();
    }
  });
}

if (pickerClose) pickerClose.addEventListener('click', closePicker);

if (pickerOverlay) {
  pickerOverlay.addEventListener('click', e => {
    if (e.target === pickerOverlay) closePicker();
  });
}

if (pickHard) {
  pickHard.addEventListener('click', () => {
    closePicker();
    goToPage('hard-skills');
  });
}

if (pickSoft) {
  pickSoft.addEventListener('click', () => {
    closePicker();
    goToPage('soft-skills');
  });
}

let currentPageId   = 'home';
let isTransitioning = false;

function updateNavLinks(id) {
  document.querySelectorAll('.nav-link').forEach(l =>
    l.classList.toggle('active', l.dataset.goto === id)
  );
}

function goToPage(targetId) {
  if (IS_MOBILE || targetId === currentPageId || isTransitioning) return;

  const from = document.getElementById(currentPageId);
  const to   = document.getElementById(targetId);
  if (!from || !to) return;

  isTransitioning = true;
  from.classList.add('exit-up');

  setTimeout(() => {
    from.classList.remove('active', 'exit-up');
    to.classList.add('active');
    currentPageId = targetId;

    if (targetId === 'hard-skills') resetHardHub();
    if (targetId === 'soft-skills') resetSoftHub();
    if (targetId === 'about')       startCounters();
    updateNavLinks(targetId);

    setTimeout(() => { isTransitioning = false; }, 600);
  }, 300);
}

document.querySelectorAll('[data-goto]').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    const id = el.dataset.goto;
    if (IS_MOBILE) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      goToPage(id);
    }
  });
});

if (!IS_MOBILE) updateNavLinks('home');

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

function openHardPanel(id) {
  const panel = document.getElementById(id);
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
  const done = () => hardHubCenter.classList.remove('hidden');
  const t = setTimeout(done, 650);
  closing.addEventListener('transitionend', () => { clearTimeout(t); done(); }, { once: true });
}

if (!IS_MOBILE && hardSkillsPage) {
  hardSkillsPage.querySelectorAll('.orbit-anchor').forEach(btn =>
    btn.addEventListener('click', e => { e.preventDefault(); openHardPanel(btn.dataset.target); })
  );
  hardSkillsPage.querySelectorAll('.panel-back-btn').forEach(btn =>
    btn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); closeHardPanel(); })
  );
}

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

function openSoftPanel(id) {
  const panel = document.getElementById(id);
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
  const done = () => softHubCenter.classList.remove('hidden');
  const t = setTimeout(done, 650);
  closing.addEventListener('transitionend', () => { clearTimeout(t); done(); }, { once: true });
}

if (!IS_MOBILE && softSkillsPage) {
  softSkillsPage.querySelectorAll('.soft-anchor').forEach(btn =>
    btn.addEventListener('click', e => { e.preventDefault(); openSoftPanel(btn.dataset.target); })
  );
  softSkillsPage.querySelectorAll('.soft-panel-back').forEach(btn =>
    btn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); closeSoftPanel(); })
  );
}

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

if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
if (modalOverlay) modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

if (IS_MOBILE) {
  document.querySelectorAll('.skill-card-mobile[data-modal]').forEach(card => {
    if (card.dataset.modal) card.addEventListener('click', () => openModal(card.dataset.modal));
  });
}

let countersStarted = false;

function startCounters() {
  if (countersStarted) return;
  countersStarted = true;
  document.querySelectorAll('.stat-number').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    let step = 0;
    const timer = setInterval(() => {
      step++;
      el.textContent = Math.min(Math.round(target / 40 * step), target);
      if (step >= 40) clearInterval(timer);
    }, 1200 / 40);
  });
}

if (IS_MOBILE) {
  const aboutSection = document.getElementById('about');
  if (aboutSection) {
    new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) startCounters();
    }, { threshold: 0.3 }).observe(aboutSection);
  }
}