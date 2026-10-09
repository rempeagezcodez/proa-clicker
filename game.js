/* ============================================
   PROA CLICKER — GAME LOGIC
   ============================================ */

// ---- Game State ----
const state = {
  score: 0,
  totalScore: 0,
  totalClicks: 0,
  clickPower: 1,
  perSecond: 0,
  level: 1,
  upgradesBought: 0,
  // Generators owned
  generators: {},
  // Boosters owned
  boosters: {},
  // Rebirth (Graduación)
  rebirths: 0,
  rebirthMultiplier: 1,
  rebirthPoints: 0,
  rebirthShopUpgrades: {},  // { upgradeId: count }
  // Boss fight
  bossDefeated: {},   // { levelMilestone: true }
  bossPending: false, // boss ready to fight but not yet started
  // Tracking
  gameStartTime: Date.now(),
};

// ---- Generators Data ----
const GENERATORS = [
  {
    id: 'compañero',
    name: 'PRs',
    icon: '👫',
    desc: 'Nuestros pequeños amiguitos.',
    baseCost: 15,
    baseProduction: 0.4,
    costMultiplier: 1.15,
  },
  {
    id: 'tutor',
    name: 'Profesor Bonacci',
    icon: '🧑‍🏫',
    desc: 'Por si dudas mucho de tu aura.',
    baseCost: 100,
    baseProduction: 2,
    costMultiplier: 1.15,
  },
  {
    id: 'biblioteca',
    name: 'Semaforo',
    icon: '❓',
    desc: '¿Para que pones el instagram?',
    baseCost: 500,
    baseProduction: 10,
    costMultiplier: 1.15,
  },
  {
    id: 'laboratorio',
    name: 'Laboratorio',
    icon: '🔬',
    desc: 'Experimentos que generan aura.',
    baseCost: 2000,
    baseProduction: 40,
    costMultiplier: 1.15,
  },
  {
    id: 'aula_virtual',
    name: 'Copa Robotica',
    icon: '💻',
    desc: '¿A donde vamos? ¡Robooootica!',
    baseCost: 7500,
    baseProduction: 150,
    costMultiplier: 1.15,
  },
  {
    id: 'campus',
    name: 'ClauMiniGPT',
    icon: '🤖',
    desc: 'Una pequeña ayudita no hace mal.',
    baseCost: 30000,
    baseProduction: 600,
    costMultiplier: 1.15,
  },
  {
    id: 'universidad',
    name: 'Pasantias',
    icon: '🎓',
    desc: 'Vamos buscando laburito.',
    baseCost: 150000,
    baseProduction: 3000,
    costMultiplier: 1.15,
  },
  {
    id: 'instituto',
    name: 'Voto a la lista verde',
    icon: '🏛️',
    desc: 'Apoyo a la lista verde de Franco y Bautista',
    baseCost: 750000,
    baseProduction: 15000,
    costMultiplier: 1.15,
  },
];

// ---- Boosters Data ----
const BOOSTERS = [
  {
    id: 'lapiz',
    name: 'La Puerta',
    icon: '🚪',
    desc: '+1 aura por click.',
    baseCost: 50,
    costMultiplier: 1.5,
    effect: { type: 'clickPower', value: 1 },
  },
  {
    id: 'cuaderno',
    name: 'Hojas Gloria',
    icon: '📓',
    desc: '+3 aura por click.',
    baseCost: 300,
    costMultiplier: 1.6,
    effect: { type: 'clickPower', value: 3 },
  },
  {
    id: 'mochila',
    name: 'Bolsa de Yerba',
    icon: '🎒',
    desc: '+10 aura por click.',
    baseCost: 2000,
    costMultiplier: 1.7,
    effect: { type: 'clickPower', value: 10 },
  },
  {
    id: 'wifi',
    name: 'La Caro',
    icon: '👩‍🏫',
    desc: 'Duplica la producción de la Copa Robotica.',
    baseCost: 10000,
    costMultiplier: 2,
    effect: { type: 'generatorBoost', target: 'aula_virtual', value: 2 },
    maxOwned: 3,
  },
  {
    id: 'beca',
    name: 'Beca Progresar',
    icon: '🏅',
    desc: '+50 aura por click.',
    baseCost: 50000,
    costMultiplier: 2,
    effect: { type: 'clickPower', value: 50 },
  },
  {
    id: 'diploma',
    name: 'Diploma Honorífico',
    icon: '📜',
    desc: '+200 aura por click.',
    baseCost: 500000,
    costMultiplier: 2.5,
    effect: { type: 'clickPower', value: 200 },
  },
];

// ---- Achievements Data ----
const ACHIEVEMENTS = [
  { id: 'first_click', icon: '👆', name: 'Primer Click', desc: 'Hacé tu primer click.', check: () => state.totalClicks >= 1 },
  { id: 'clicks_100', icon: '💪', name: '100 Clicks', desc: 'Llegá a 100 clicks.', check: () => state.totalClicks >= 100 },
  { id: 'clicks_1000', icon: '🔥', name: '1.000 Clicks', desc: 'Llegá a 1.000 clicks.', check: () => state.totalClicks >= 1000 },
  { id: 'score_100', icon: '📗', name: 'Estudiante', desc: 'Acumulá 100 de aura.', check: () => state.totalScore >= 100 },
  { id: 'score_1000', icon: '📘', name: 'Avanzado', desc: 'Acumulá 1.000 de aura.', check: () => state.totalScore >= 1000 },
  { id: 'score_10000', icon: '📕', name: 'Experto', desc: 'Acumulá 10.000 de aura.', check: () => state.totalScore >= 10000 },
  { id: 'score_100000', icon: '🌟', name: 'Genio', desc: 'Acumulá 100.000 de aura.', check: () => state.totalScore >= 100000 },
  { id: 'score_million', icon: '🚀', name: 'Millonario', desc: 'Acumulá 1.000.000 de aura.', check: () => state.totalScore >= 1000000 },
  { id: 'first_gen', icon: '🤝', name: 'Primera Mejora', desc: 'Comprá tu primer generador.', check: () => state.upgradesBought >= 1 },
  { id: 'upgrades_10', icon: '⚙️', name: 'Equipado', desc: 'Comprá 10 mejoras.', check: () => state.upgradesBought >= 10 },
  { id: 'upgrades_25', icon: '🛠️', name: 'Bien Equipado', desc: 'Comprá 25 mejoras.', check: () => state.upgradesBought >= 25 },
  { id: 'level_5', icon: '⭐', name: 'Nivel 5', desc: 'Alcanzá el nivel 5.', check: () => state.level >= 5 },
  { id: 'level_10', icon: '🌈', name: 'Nivel 10', desc: 'Alcanzá el nivel 10.', check: () => state.level >= 10 },
  { id: 'per_sec_10', icon: '⏱️', name: 'Automático', desc: 'Generá 10/seg.', check: () => state.perSecond >= 10 },
  { id: 'per_sec_100', icon: '⚡', name: 'Supersónico', desc: 'Generá 100/seg.', check: () => state.perSecond >= 100 },
  { id: 'first_boss', icon: '👾', name: 'Primer Boss', desc: 'Derrotá tu primer Boss.', check: () => Object.keys(state.bossDefeated).length >= 1 },
  { id: 'first_rebirth', icon: '🎓', name: 'Graduado', desc: 'Completá tu primera Graduación.', check: () => state.rebirths >= 1 },
  { id: 'rebirth_3', icon: '🏆', name: 'Triple Graduado', desc: 'Graduate 3 veces.', check: () => state.rebirths >= 3 },
];

const unlockedAchievements = new Set();

// ---- Rebirth Shop Data ----
const REBIRTH_SHOP = [
  {
    id: 'rb_click',
    name: 'Puño de Graduado',
    icon: '👊',
    desc: 'x5 aura por click (permanente)',
    baseCost: 1,
    costMultiplier: 1.8,
    effect: { type: 'clickMult', value: 5 },
  },
  {
    id: 'rb_production',
    name: 'Sabiduría Ancestral',
    icon: '📚',
    desc: 'x5 producción de generadores (permanente)',
    baseCost: 2,
    costMultiplier: 2.5,
    effect: { type: 'productionMult', value: 5 },
  },
];

function getRebirthUpgradeCost(upgrade) {
  const owned = state.rebirthShopUpgrades[upgrade.id] || 0;
  return Math.ceil(upgrade.baseCost * Math.pow(upgrade.costMultiplier, owned));
}

function getRebirthPointsForGraduation(rebirthCount) {
  // Exponentially more points each rebirth: 1, 2, 4, 8, 16...
  return Math.floor(Math.pow(2, rebirthCount));
}

function getRequiredLevelForRebirth(rebirthCount) {
  // Rebirth posible cada 5 niveles por rebirth (15, 20, 25, 30...)
  return 12 + (rebirthCount * 3);
}

// ---- Boss Fight Config ----
// Boss fight triggers every BOSS_EVERY levels
const BOSS_EVERY = 5;

// Preload boss images
const BOSS_IMAGES = {
  catri: new Image(),
  maxi: new Image(),
  joel: new Image(),
  nati: new Image(),
  virginia: new Image(),
};
BOSS_IMAGES.catri.src = './imagenes/catri.png';
BOSS_IMAGES.maxi.src = './imagenes/maxi.png';
BOSS_IMAGES.joel.src = './imagenes/joel.png';
BOSS_IMAGES.nati.src = './imagenes/nati.png';
BOSS_IMAGES.virginia.src = './imagenes/virginia.png';

// Boss data per milestone (repeating pattern, difficulty scales)
function getBossData(milestone) {
  const tier = Math.floor((milestone / BOSS_EVERY) - 1); // 0-indexed tier
  const bosses = [
    { name: 'Catri', icon: '😼', imageKey: 'catri', color: '#FF6B6B', hp: 75, bulletSpeed: 3.8, bulletCount: 10, pattern: 'spread' },
    { name: 'Maxi', icon: '😎', imageKey: 'maxi', color: '#FFA502', hp: 150, bulletSpeed: 3.8, bulletCount: 9, pattern: 'spiral' },
    { name: 'Joel', icon: '😱', imageKey: 'joel', color: '#6C63FF', hp: 255, bulletSpeed: 2.8, bulletCount: 5, pattern: 'wave' },
    { name: 'Nati', icon: '💀', imageKey: 'nati', color: '#FF4757', hp: 500, bulletSpeed: 1.8, bulletCount: 14, pattern: 'cross' },
    { name: 'Virginia', icon: '🏛️', imageKey: 'virginia', color: '#2ED573', hp: 1250, bulletSpeed: 2, bulletCount: 3, pattern: 'chaos' },
  ];
  return bosses[tier % bosses.length];
}

function getBossBadgeHtml(boss, size = 24) {
  if (boss.imageKey && BOSS_IMAGES[boss.imageKey]) {
    return `<img src="./imagenes/${boss.imageKey}.png" alt="${boss.name}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;vertical-align:middle;display:inline-block;margin-right:6px;border:1px solid rgba(255,255,255,0.4);" />`;
  }
  return boss.icon + ' ';
}

// ---- DOM References ----
const DOM = {
  scoreDisplay: document.getElementById('score-display'),
  displayPerSec: document.getElementById('display-per-sec'),
  displayTotal: document.getElementById('display-total'),
  statClicks: document.getElementById('stat-clicks'),
  statClickPower: document.getElementById('stat-click-power'),
  statLevel: document.getElementById('stat-level'),
  statUpgrades: document.getElementById('stat-upgrades'),
  levelBar: document.getElementById('level-bar'),
  levelLabel: document.getElementById('level-label'),
  levelProgress: document.getElementById('level-progress'),
  clickTarget: document.getElementById('click-target'),
  floatNumbers: document.getElementById('float-numbers'),
  shopGenerators: document.getElementById('shop-generators'),
  shopBoosters: document.getElementById('shop-boosters'),
  achievementsList: document.getElementById('achievements-list'),
  toastContainer: document.getElementById('toast-container'),
  bossBtn: document.getElementById('boss-btn'),
  manualRebirthBtn: document.getElementById('manual-rebirth-btn'),
  endGameBtn: document.getElementById('end-game-btn'),
  rebirthInfo: document.getElementById('rebirth-info'),
  rebirthCount: document.getElementById('rebirth-count'),
  rebirthMult: document.getElementById('rebirth-mult'),
  rebirthPointsDisplay: document.getElementById('rebirth-points'),
  shopRebirthContainer: document.getElementById('shop-rebirth'),
  resetGameBtn: document.getElementById('reset-game-btn'),
};

// ---- Utility Functions ----
function formatNumber(n) {
  if (n >= 1e12) return (n / 1e12).toFixed(1) + 'T';
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return Math.floor(n).toLocaleString('es-AR');
}

function getGeneratorCost(gen) {
  const owned = state.generators[gen.id] || 0;
  return Math.floor(gen.baseCost * Math.pow(gen.costMultiplier, owned));
}

function getBoosterCost(booster) {
  const owned = state.boosters[booster.id] || 0;
  return Math.floor(booster.baseCost * Math.pow(booster.costMultiplier, owned));
}

function getLevelThreshold(level) {
  return Math.floor(200 * Math.pow(2.2, level - 1));
}

// ---- Click Handler ----
function handleClick(e) {
  // Calculate points
  const basePoints = state.clickPower;
  const critBonus = (state.rebirthShopUpgrades['rb_crit'] || 0) * 0.05;
  const isCrit = Math.random() < (0.08 + critBonus);
  const critMultiplier = isCrit ? 3 : 1;
  const rbClickOwned = state.rebirthShopUpgrades['rb_click'] || 0;
  const rbClickMult = rbClickOwned > 0 ? Math.pow(5, rbClickOwned) : 1;
  const points = Math.floor(basePoints * rbClickMult * critMultiplier * state.rebirthMultiplier);

  state.score += points;
  state.totalScore += points;
  state.totalClicks++;

  // Floating number
  spawnFloatNumber(e, points, isCrit);

  // Score bump animation
  DOM.scoreDisplay.classList.add('bump');
  setTimeout(() => DOM.scoreDisplay.classList.remove('bump'), 100);

  // Check level up
  checkLevelUp();

  // Update display
  updateDisplay();

  // Check achievements
  checkAchievements();
}

function spawnFloatNumber(e, points, isCrit) {
  const el = document.createElement('div');
  el.className = 'float-number' + (isCrit ? ' crit' : '');
  el.textContent = (isCrit ? '💥 ' : '+') + formatNumber(points);

  // Position near the click
  const rect = DOM.floatNumbers.getBoundingClientRect();
  const x = e.clientX - rect.left + (Math.random() - 0.5) * 60;
  const y = e.clientY - rect.top - 20;

  el.style.left = x + 'px';
  el.style.top = y + 'px';

  DOM.floatNumbers.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

// ---- Level System ----
function checkLevelUp() {
  if (state.level >= 29) return;
  // Prohibit leveling up if a boss is pending or if the current level milestone boss hasn't been defeated yet
  if (state.bossPending) return;
  if (state.level % BOSS_EVERY === 0 && !state.bossDefeated[state.level]) return;

  const threshold = getLevelThreshold(state.level);
  if (state.totalScore >= threshold) {
    const nextLevel = state.level + 1;
    // If the next level triggers a boss, unlock boss and allow level up to that boss level
    state.level++;
    showToast(`🎉 ¡Nivel ${state.level}! Escuela mejorada.`, 'level-toast');
    flashScreen();
    checkAchievements();

    // Check if this new level is a boss milestone
    if (state.level % BOSS_EVERY === 0 && !state.bossDefeated[state.level]) {
      state.bossPending = true;
      updateBossButton();
      showToast(`👾 ¡Boss desbloqueado! Nivel ${state.level} — ¡Derrotá al Boss para seguir avanzando!`, 'boss-toast');
    }
  }
}

function flashScreen() {
  const flash = document.createElement('div');
  flash.className = 'level-up-flash';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 800);
}

function updateBossButton() {
  if (!DOM.bossBtn) return;
  if (state.bossPending) {
    DOM.bossBtn.style.display = 'block';
    DOM.bossBtn.classList.add('boss-pulse');
    const milestone = Math.floor(state.level / BOSS_EVERY) * BOSS_EVERY;
    const boss = getBossData(milestone);
    DOM.bossBtn.innerHTML = `👾 ¡ENFRENTÁ AL BOSS! ${getBossBadgeHtml(boss, 22)}${boss.name}`;
  } else {
    DOM.bossBtn.style.display = 'none';
    DOM.bossBtn.classList.remove('boss-pulse');
  }
}

// ---- Production (per second) ----
function calculatePerSecond() {
  let total = 0;
  GENERATORS.forEach(gen => {
    const owned = state.generators[gen.id] || 0;
    if (owned > 0) {
      let production = gen.baseProduction * owned;
      // Check boosters that boost this generator
      BOOSTERS.forEach(b => {
        if (b.effect.type === 'generatorBoost' && b.effect.target === gen.id) {
          const bOwned = state.boosters[b.id] || 0;
          if (bOwned > 0) {
            production *= Math.pow(b.effect.value, bOwned);
          }
        }
      });
      total += production;
    }
  });
  // Apply rebirth shop production multiplier
  const rbProdOwned = state.rebirthShopUpgrades['rb_production'] || 0;
  const rbProdMult = rbProdOwned > 0 ? Math.pow(5, rbProdOwned) : 1;
  return total * state.rebirthMultiplier * rbProdMult;
}

function gameTick() {
  state.perSecond = calculatePerSecond();
  if (state.perSecond > 0) {
    const gain = state.perSecond / 20; // 50ms ticks
    state.score += gain;
    state.totalScore += gain;
    checkLevelUp();
  }
  updateDisplay();
}

// ---- Shop ----
function buyGenerator(genId) {
  const gen = GENERATORS.find(g => g.id === genId);
  const cost = getGeneratorCost(gen);
  if (state.score >= cost) {
    state.score -= cost;
    state.generators[gen.id] = (state.generators[gen.id] || 0) + 1;
    state.upgradesBought++;
    state.perSecond = calculatePerSecond();
    renderShop();
    updateDisplay();
    checkAchievements();
    showToast(`✅ ${gen.icon} ${gen.name} comprado!`);
  }
}

function buyBooster(boosterId) {
  const booster = BOOSTERS.find(b => b.id === boosterId);
  const cost = getBoosterCost(booster);
  if (booster.maxOwned && (state.boosters[booster.id] || 0) >= booster.maxOwned) return;
  if (state.score >= cost) {
    state.score -= cost;
    state.boosters[booster.id] = (state.boosters[booster.id] || 0) + 1;
    state.upgradesBought++;

    // Apply click power effects immediately
    if (booster.effect.type === 'clickPower') {
      state.clickPower += booster.effect.value;
    }

    state.perSecond = calculatePerSecond();
    renderShop();
    updateDisplay();
    checkAchievements();
    showToast(`✅ ${booster.icon} ${booster.name} comprado!`);
  }
}

function buyRebirthUpgrade(upgradeId) {
  const upgrade = REBIRTH_SHOP.find(u => u.id === upgradeId);
  if (!upgrade) return;
  const cost = getRebirthUpgradeCost(upgrade);
  const owned = state.rebirthShopUpgrades[upgrade.id] || 0;
  if (upgrade.maxOwned && owned >= upgrade.maxOwned) return;
  if (state.rebirthPoints >= cost) {
    state.rebirthPoints -= cost;
    state.rebirthShopUpgrades[upgrade.id] = owned + 1;

    if (upgrade.effect.type === 'clickPower') {
      state.clickPower += upgrade.effect.value;
    }
    state.perSecond = calculatePerSecond();
    renderShop();
    updateDisplay();
    showToast(`✅ ${upgrade.icon} ${upgrade.name} comprado!`);
  }
}

function renderShop() {
  // Generators
  DOM.shopGenerators.innerHTML = '';
  GENERATORS.forEach(gen => {
    const owned = state.generators[gen.id] || 0;
    const cost = getGeneratorCost(gen);
    const canAfford = state.score >= cost;

    const item = document.createElement('div');
    item.className = 'shop-item' + (canAfford ? '' : ' cannot-afford');
    item.id = `gen-${gen.id}`;
    item.innerHTML = `
      <div class="shop-item-icon">${gen.icon}</div>
      <div class="shop-item-info">
        <div class="shop-item-name">${gen.name}</div>
        <div class="shop-item-desc">${gen.desc} (+${gen.baseProduction}/seg)</div>
        <div class="shop-item-meta">
          <div class="shop-item-cost">📚 ${formatNumber(cost)}</div>
          <div class="shop-item-owned">${owned} poseídos</div>
        </div>
      </div>
    `;
    item.addEventListener('click', () => buyGenerator(gen.id));
    DOM.shopGenerators.appendChild(item);
  });

  // Boosters
  DOM.shopBoosters.innerHTML = '';
  BOOSTERS.forEach(booster => {
    const owned = state.boosters[booster.id] || 0;
    const cost = getBoosterCost(booster);
    const canAfford = state.score >= cost;
    const maxed = booster.maxOwned && owned >= booster.maxOwned;

    const item = document.createElement('div');
    item.className = 'shop-item' + (canAfford && !maxed ? '' : ' cannot-afford');
    item.id = `boost-${booster.id}`;
    item.innerHTML = `
      <div class="shop-item-icon">${booster.icon}</div>
      <div class="shop-item-info">
        <div class="shop-item-name">${booster.name}</div>
        <div class="shop-item-desc">${booster.desc}</div>
        <div class="shop-item-meta">
          <div class="shop-item-cost">${maxed ? '✅ MÁXIMO' : '📚 ' + formatNumber(cost)}</div>
          <div class="shop-item-owned">${owned} poseídos</div>
        </div>
      </div>
    `;
    if (!maxed) {
      item.addEventListener('click', () => buyBooster(booster.id));
    }
    DOM.shopBoosters.appendChild(item);
  });

  // Rebirth Shop
  if (DOM.shopRebirthContainer) {
    DOM.shopRebirthContainer.innerHTML = '';
    REBIRTH_SHOP.forEach(upgrade => {
      const owned = state.rebirthShopUpgrades[upgrade.id] || 0;
      const cost = getRebirthUpgradeCost(upgrade);
      const canAfford = state.rebirthPoints >= cost;
      const maxed = upgrade.maxOwned && owned >= upgrade.maxOwned;

      const item = document.createElement('div');
      item.className = 'shop-item' + (canAfford && !maxed ? '' : ' cannot-afford');
      item.id = `rb-${upgrade.id}`;
      item.innerHTML = `
        <div class="shop-item-icon">${upgrade.icon}</div>
        <div class="shop-item-info">
          <div class="shop-item-name">${upgrade.name}</div>
          <div class="shop-item-desc">${upgrade.desc}</div>
          <div class="shop-item-meta">
            <div class="shop-item-cost">${maxed ? '✅ MÁXIMO' : '💎 ' + cost + ' Puntos'}</div>
            <div class="shop-item-owned">${owned} poseídos</div>
          </div>
        </div>
      `;
      if (!maxed) {
        item.addEventListener('click', () => buyRebirthUpgrade(upgrade.id));
      }
      DOM.shopRebirthContainer.appendChild(item);
    });
  }
}

// ---- Achievements ----
function renderAchievements() {
  DOM.achievementsList.innerHTML = '';
  ACHIEVEMENTS.forEach(a => {
    const div = document.createElement('div');
    div.className = 'achievement' + (unlockedAchievements.has(a.id) ? ' unlocked' : '');
    div.textContent = a.icon;
    div.setAttribute('data-tooltip', `${a.name}: ${a.desc}`);
    div.id = `ach-${a.id}`;
    DOM.achievementsList.appendChild(div);
  });
}

function checkAchievements() {
  ACHIEVEMENTS.forEach(a => {
    if (!unlockedAchievements.has(a.id) && a.check()) {
      unlockedAchievements.add(a.id);
      showToast(`🏆 Logro desbloqueado: ${a.name}!`, 'achievement-toast');
      renderAchievements();
    }
  });
}

// ---- Display Update ----
function updateDisplay() {
  DOM.scoreDisplay.textContent = formatNumber(state.score);
  DOM.displayPerSec.textContent = formatNumber(state.perSecond);
  DOM.displayTotal.textContent = formatNumber(state.totalScore);
  DOM.statClicks.textContent = formatNumber(state.totalClicks);
  DOM.statClickPower.textContent = formatNumber(state.clickPower);
  DOM.statLevel.textContent = state.level;
  DOM.statUpgrades.textContent = state.upgradesBought;

  // Level bar
  const currentThreshold = getLevelThreshold(state.level);
  const prevThreshold = state.level > 1 ? getLevelThreshold(state.level - 1) : 0;
  let progress = Math.min(100, ((state.totalScore - prevThreshold) / (currentThreshold - prevThreshold)) * 100);

  const isBossBlocked = state.bossPending || (state.level % BOSS_EVERY === 0 && !state.bossDefeated[state.level]);
  if (isBossBlocked && progress >= 100) {
    progress = 100;
  }

  DOM.levelBar.style.width = (state.level >= 29 ? 100 : progress) + '%';
  DOM.levelLabel.textContent = state.level;
  
  if (state.level >= 29) {
    DOM.levelProgress.textContent = 'MAX (🏆 ¡Terminá el juego!)';
  } else {
    DOM.levelProgress.textContent = isBossBlocked ? '100 (👾 Vencé al Boss)' : Math.floor(progress);
  }

  // Rebirth info
  if (DOM.rebirthCount) DOM.rebirthCount.textContent = state.rebirths;
  if (DOM.rebirthMult) DOM.rebirthMult.textContent = 'x' + state.rebirthMultiplier.toFixed(1);
  if (DOM.rebirthPointsDisplay) DOM.rebirthPointsDisplay.textContent = state.rebirthPoints;

  // Manual Rebirth button visibility (escala cada 5 niveles por rebirth: 15, 20, 25...)
  if (DOM.manualRebirthBtn) {
    const requiredLevel = getRequiredLevelForRebirth(state.rebirths);
    DOM.manualRebirthBtn.textContent = `🎓 ¡GRADUARSE! (Rebirth Nivel ${requiredLevel})`;
    if (state.level >= requiredLevel) {
      DOM.manualRebirthBtn.style.display = 'block';
      DOM.manualRebirthBtn.classList.add('boss-pulse');
    } else {
      DOM.manualRebirthBtn.style.display = 'none';
      DOM.manualRebirthBtn.classList.remove('boss-pulse');
    }
  }

  // End game button visibility (level 29)
  if (DOM.endGameBtn) {
    if (state.level >= 29) {
      DOM.endGameBtn.style.display = 'block';
    } else {
      DOM.endGameBtn.style.display = 'none';
    }
  }

  // Update shop affordability
  updateShopAffordability();
}

function updateShopAffordability() {
  GENERATORS.forEach(gen => {
    const cost = getGeneratorCost(gen);
    const el = document.getElementById(`gen-${gen.id}`);
    if (el) {
      el.classList.toggle('cannot-afford', state.score < cost);
    }
  });
  BOOSTERS.forEach(b => {
    const cost = getBoosterCost(b);
    const maxed = b.maxOwned && (state.boosters[b.id] || 0) >= b.maxOwned;
    const el = document.getElementById(`boost-${b.id}`);
    if (el) {
      el.classList.toggle('cannot-afford', state.score < cost || maxed);
    }
  });
  REBIRTH_SHOP.forEach(u => {
    const cost = getRebirthUpgradeCost(u);
    const maxed = u.maxOwned && (state.rebirthShopUpgrades[u.id] || 0) >= u.maxOwned;
    const el = document.getElementById(`rb-${u.id}`);
    if (el) {
      el.classList.toggle('cannot-afford', state.rebirthPoints < cost || maxed);
    }
  });
}

// ---- Toast Notifications ----
function showToast(message, className = '') {
  const toast = document.createElement('div');
  toast.className = 'toast ' + className;
  toast.textContent = message;
  DOM.toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ---- Shop Tabs ----
function initShopTabs() {
  const tabs = document.querySelectorAll('.shop-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const tabName = tab.dataset.tab;
      DOM.shopGenerators.style.display = tabName === 'generators' ? 'flex' : 'none';
      DOM.shopBoosters.style.display = tabName === 'boosters' ? 'flex' : 'none';
      if (DOM.shopRebirthContainer) {
        DOM.shopRebirthContainer.style.display = tabName === 'rebirth' ? 'flex' : 'none';
      }
    });
  });
}

// ---- Save / Load (localStorage) ----
function saveGame() {
  const saveData = {
    score: state.score,
    totalScore: state.totalScore,
    totalClicks: state.totalClicks,
    clickPower: state.clickPower,
    level: state.level,
    upgradesBought: state.upgradesBought,
    generators: state.generators,
    boosters: state.boosters,
    rebirths: state.rebirths,
    rebirthMultiplier: state.rebirthMultiplier,
    rebirthPoints: state.rebirthPoints,
    rebirthShopUpgrades: state.rebirthShopUpgrades,
    bossDefeated: state.bossDefeated,
    bossPending: state.bossPending,
    gameStartTime: state.gameStartTime,
    achievements: Array.from(unlockedAchievements),
    timestamp: Date.now(),
  };
  try {
    localStorage.setItem('proaClickerSave', JSON.stringify(saveData));
  } catch (e) {
    // Silently fail
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem('proaClickerSave');
    if (!raw) return;
    const data = JSON.parse(raw);

    state.score = data.score || 0;
    state.totalScore = data.totalScore || 0;
    state.totalClicks = data.totalClicks || 0;
    state.clickPower = data.clickPower || 1;
    state.level = data.level || 1;
    state.upgradesBought = data.upgradesBought || 0;
    state.generators = data.generators || {};
    state.boosters = data.boosters || {};
    state.rebirths = data.rebirths || 0;
    state.rebirthMultiplier = data.rebirthMultiplier || 1;
    state.rebirthPoints = data.rebirthPoints || 0;
    state.rebirthShopUpgrades = data.rebirthShopUpgrades || {};
    state.bossDefeated = data.bossDefeated || {};
    state.bossPending = data.bossPending || false;
    state.gameStartTime = data.gameStartTime || Date.now();

    if (data.achievements) {
      data.achievements.forEach(a => unlockedAchievements.add(a));
    }

    // Calculate offline earnings
    if (data.timestamp) {
      const elapsed = (Date.now() - data.timestamp) / 1000; // seconds
      state.perSecond = calculatePerSecond();
      if (state.perSecond > 0 && elapsed > 5) {
        const maxOffline = 3600; // max 1 hour offline earnings
        const offlineTime = Math.min(elapsed, maxOffline);
        const offlineEarnings = Math.floor(state.perSecond * offlineTime * 0.5); // 50% efficiency
        if (offlineEarnings > 0) {
          state.score += offlineEarnings;
          state.totalScore += offlineEarnings;
          setTimeout(() => {
            showToast(`💤 Ganaste ${formatNumber(offlineEarnings)} mientras estabas afuera!`);
          }, 500);
        }
      }
    }
  } catch (e) {
    // Silently fail
  }
}

// ---- Particles background ----
function createParticles() {
  const container = document.getElementById('particles-bg');
  for (let i = 0; i < 25; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position: absolute;
      width: ${3 + Math.random() * 4}px;
      height: ${3 + Math.random() * 4}px;
      background: rgba(108, 99, 255, ${0.1 + Math.random() * 0.2});
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: particleFloat ${8 + Math.random() * 12}s ease-in-out infinite alternate;
      animation-delay: ${-Math.random() * 10}s;
    `;
    container.appendChild(p);
  }

  // Add keyframes dynamically
  const style = document.createElement('style');
  style.textContent = `
    @keyframes particleFloat {
      0% { transform: translate(0, 0) scale(1); opacity: 0.3; }
      50% { opacity: 0.8; }
      100% { transform: translate(${-30 + Math.random() * 60}px, ${-40 + Math.random() * 80}px) scale(${0.5 + Math.random()}); opacity: 0.3; }
    }
  `;
  document.head.appendChild(style);
}

// ============================================
//   BOSS FIGHT — Bullet Hell
// ============================================

const bossState = {
  active: false,
  canvas: null,
  ctx: null,
  animId: null,
  milestone: 0,
  hp: 0,
  maxHp: 0,
  bullets: [],
  mouseX: 0,
  mouseY: 0,
  playerRadius: 10,
  bossX: 0,
  bossY: 0,
  bossVx: 2,
  bossVy: 1.5,
  bossRadius: 50,
  shootTimer: 0,
  shootInterval: 60, // frames between shots
  frameCount: 0,
  timeLeft: 0,       // seconds to survive / defeat
  totalTime: 0,
  won: false,
  lost: false,
  explosions: [],
};

function startBossFight() {
  if (bossState.active) return;

  const milestone = Math.floor(state.level / BOSS_EVERY) * BOSS_EVERY;
  const boss = getBossData(milestone);

  bossState.active = true;
  bossState.milestone = milestone;
  // Apply boss weaken from rebirth shop
  const bossWeakenStacks = state.rebirthShopUpgrades['rb_bossweaken'] || 0;
  const weakenMult = Math.max(0.2, 1 - bossWeakenStacks * 0.10);
  const effectiveHp = Math.max(5, Math.ceil(boss.hp * weakenMult));
  bossState.hp = effectiveHp;
  bossState.maxHp = effectiveHp;
  bossState.bullets = [];
  bossState.explosions = [];
  bossState.frameCount = 0;
  bossState.won = false;
  bossState.lost = false;
  bossState.totalTime = 30 + milestone * 2; // more time per milestone
  bossState.timeLeft = bossState.totalTime;

  // Build overlay
  const overlay = document.createElement('div');
  overlay.id = 'boss-overlay';

  overlay.innerHTML = `
    <div id="boss-hud">
      <div id="boss-hud-left">
        <div class="boss-label">BOSS</div>
        <div id="boss-name-display">${getBossBadgeHtml(boss, 28)}${boss.name}</div>
        <div class="boss-hp-bar-bg"><div id="boss-hp-bar" class="boss-hp-bar-fill"></div></div>
        <div id="boss-hp-text">${boss.hp} / ${boss.hp}</div>
      </div>
      <div id="boss-hud-right">
        <div class="boss-label">TIEMPO</div>
        <div id="boss-timer">${bossState.timeLeft}s</div>
        <div class="boss-label" style="margin-top:8px">CLICKS PARA DAÑAR</div>
        <div id="boss-click-hint">Clickeá al Boss</div>
      </div>
    </div>
    <canvas id="boss-canvas"></canvas>
    <div id="boss-instructions">🖱️ Mové el cursor para esquivar • 🖱️ Clickeá al Boss para dañarlo</div>
  `;
  document.body.appendChild(overlay);

  const canvas = document.getElementById('boss-canvas');
  bossState.canvas = canvas;
  bossState.ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    bossState.bossX = canvas.width / 2;
    bossState.bossY = canvas.height * 0.25;
    bossState.mouseX = canvas.width / 2;
    bossState.mouseY = canvas.height * 0.75;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  bossState._resizeHandler = resizeCanvas;

  // Set random boss initial movement direction
  const bossSpeed = 2 + Math.min(milestone * 0.2, 3);
  const bossAngle = Math.random() * Math.PI * 2;
  bossState.bossVx = Math.cos(bossAngle) * bossSpeed;
  bossState.bossVy = Math.sin(bossAngle) * bossSpeed;

  canvas.addEventListener('mousemove', onBossMouseMove);
  canvas.addEventListener('touchmove', onBossTouchMove, { passive: false });
  canvas.addEventListener('click', onBossClick);

  bossState.shootInterval = Math.max(15, 70 - milestone * 3);

  bossState.animId = requestAnimationFrame(bossLoop);
  bossState._timerInterval = setInterval(() => {
    if (!bossState.active) return;
    bossState.timeLeft--;
    const el = document.getElementById('boss-timer');
    if (el) el.textContent = bossState.timeLeft + 's';
    if (bossState.timeLeft <= 0 && !bossState.won && !bossState.lost) {
      endBossFight(false);
    }
  }, 1000);
}

function onBossMouseMove(e) {
  bossState.mouseX = e.clientX;
  bossState.mouseY = e.clientY;
}

function onBossTouchMove(e) {
  e.preventDefault();
  bossState.mouseX = e.touches[0].clientX;
  bossState.mouseY = e.touches[0].clientY;
}

function onBossClick(e) {
  if (!bossState.active || bossState.won || bossState.lost) return;
  const canvas = bossState.canvas;
  const dx = e.clientX - bossState.bossX;
  const dy = e.clientY - bossState.bossY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist <= bossState.bossRadius + 20) {
    // Apply rebirth damage multiplier to boss
    const damage = Math.max(1, state.rebirthMultiplier);
    bossState.hp -= damage;
    spawnBossExplosion(bossState.bossX + (Math.random() - 0.5) * 60, bossState.bossY + (Math.random() - 0.5) * 40);
    updateBossHpBar();
    if (bossState.hp <= 0) {
      endBossFight(true);
    }
  }
}

function spawnBossExplosion(x, y) {
  bossState.explosions.push({ x, y, r: 5, maxR: 30 + Math.random() * 20, life: 1.0 });
}

function updateBossHpBar() {
  const bar = document.getElementById('boss-hp-bar');
  const txt = document.getElementById('boss-hp-text');
  if (bar) bar.style.width = Math.max(0, (bossState.hp / bossState.maxHp) * 100) + '%';
  if (txt) txt.textContent = Math.max(0, bossState.hp) + ' / ' + bossState.maxHp;
}

// Generate a random spawn point FAR from the player cursor
function getRandomSpawnPosition(W, H) {
  const minDist = 250; // minimum distance from cursor
  let x, y, attempts = 0;
  do {
    const edge = Math.floor(Math.random() * 4);
    switch (edge) {
      case 0: x = Math.random() * W; y = -15; break;
      case 1: x = W + 15; y = Math.random() * H; break;
      case 2: x = Math.random() * W; y = H + 15; break;
      case 3: x = -15; y = Math.random() * H; break;
    }
    const dx = x - bossState.mouseX;
    const dy = y - bossState.mouseY;
    if (Math.sqrt(dx * dx + dy * dy) >= minDist || attempts > 10) break;
    attempts++;
  } while (true);
  return { x, y };
}

// Generate random screen position far from cursor (for spiral/cross patterns)
function getRandomScreenPositionFarFromCursor(W, H) {
  const minDist = 200;
  let x, y, attempts = 0;
  do {
    x = Math.random() * (W * 0.8) + W * 0.1;
    y = Math.random() * (H * 0.8) + H * 0.1;
    const dx = x - bossState.mouseX;
    const dy = y - bossState.mouseY;
    if (Math.sqrt(dx * dx + dy * dy) >= minDist || attempts > 10) break;
    attempts++;
  } while (true);
  return { x, y };
}

function shootBullets() {
  const boss = getBossData(bossState.milestone);
  const canvas = bossState.canvas;
  const W = canvas.width;
  const H = canvas.height;
  const speed = boss.bulletSpeed;
  const count = boss.bulletCount;
  const pattern = boss.pattern;
  const frameOffset = bossState.frameCount * 0.05;

  switch (pattern) {
    case 'spread': {
      // Spawn from a random spot outside the screen targeting the player with a spread
      const origin = getRandomSpawnPosition(W, H);
      const angleToPlayer = Math.atan2(bossState.mouseY - origin.y, bossState.mouseX - origin.x);
      for (let i = 0; i < count; i++) {
        const spread = (count === 1) ? 0 : (i / (count - 1) - 0.5) * 0.8;
        const angle = angleToPlayer + spread;
        bossState.bullets.push({
          x: origin.x,
          y: origin.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: 8,
          color: boss.color,
        });
      }
      break;
    }
    case 'spiral': {
      // Pick 2 random points far from cursor and emit spiral bullets
      const spawns = [
        getRandomScreenPositionFarFromCursor(W, H),
        getRandomScreenPositionFarFromCursor(W, H)
      ];
      spawns.forEach(origin => {
        for (let i = 0; i < Math.max(2, Math.floor(count / 2)); i++) {
          const angle = frameOffset + (i / count) * Math.PI * 2;
          bossState.bullets.push({
            x: origin.x,
            y: origin.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            r: 9,
            color: boss.color,
          });
        }
      });
      break;
    }
    case 'wave': {
      // Spawn multiple bullets from random edges all aiming across toward the cursor
      for (let i = 0; i < count; i++) {
        const origin = getRandomSpawnPosition(W, H);
        const baseAngle = Math.atan2(bossState.mouseY - origin.y, bossState.mouseX - origin.x);
        const angle = baseAngle + (Math.sin(frameOffset + i) * 0.4);
        bossState.bullets.push({
          x: origin.x,
          y: origin.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: 8,
          color: boss.color,
        });
      }
      break;
    }
    case 'cross': {
      // Pick random position far from cursor that bursts in 4 cross directions
      const origin = getRandomScreenPositionFarFromCursor(W, H);
      const angles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
      angles.forEach(a => {
        bossState.bullets.push({
          x: origin.x,
          y: origin.y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          r: 10,
          color: boss.color,
        });
      });
      break;
    }
    case 'chaos': {
      // Completely random positions on or around the screen firing towards random or player directions
      for (let i = 0; i < count; i++) {
        const origin = getRandomSpawnPosition(W, H);
        const angleToPlayer = Math.atan2(bossState.mouseY - origin.y, bossState.mouseX - origin.x);
        const jitter = (Math.random() - 0.5) * 1.2;
        const spd = speed * (0.8 + Math.random() * 0.6);
        bossState.bullets.push({
          x: origin.x,
          y: origin.y,
          vx: Math.cos(angleToPlayer + jitter) * spd,
          vy: Math.sin(angleToPlayer + jitter) * spd,
          r: 7 + Math.random() * 5,
          color: boss.color,
        });
      }
      break;
    }
  }
}

function bossLoop() {
  if (!bossState.active) return;
  const canvas = bossState.canvas;
  const ctx = bossState.ctx;
  const W = canvas.width;
  const H = canvas.height;
  bossState.frameCount++;

  // Update boss position - moving and bouncing around the screen
  bossState.bossX += bossState.bossVx;
  bossState.bossY += bossState.bossVy;

  // Boss boundary bounds with smooth bouncing (avoid going underneath top HUD or off screen)
  const topBound = 90 + bossState.bossRadius;
  const bottomBound = H - 60 - bossState.bossRadius;
  const leftBound = 40 + bossState.bossRadius;
  const rightBound = W - 40 - bossState.bossRadius;

  if (bossState.bossX <= leftBound) {
    bossState.bossX = leftBound;
    bossState.bossVx = Math.abs(bossState.bossVx);
  } else if (bossState.bossX >= rightBound) {
    bossState.bossX = rightBound;
    bossState.bossVx = -Math.abs(bossState.bossVx);
  }

  if (bossState.bossY <= topBound) {
    bossState.bossY = topBound;
    bossState.bossVy = Math.abs(bossState.bossVy);
  } else if (bossState.bossY >= bottomBound) {
    bossState.bossY = bottomBound;
    bossState.bossVy = -Math.abs(bossState.bossVy);
  }

  // Periodic subtle steering so boss trajectory doesn't get stuck in simple loop
  if (bossState.frameCount % 90 === 0) {
    const angleChange = (Math.random() - 0.5) * 0.6;
    const currentSpeed = Math.sqrt(bossState.bossVx * bossState.bossVx + bossState.bossVy * bossState.bossVy);
    const newAngle = Math.atan2(bossState.bossVy, bossState.bossVx) + angleChange;
    bossState.bossVx = Math.cos(newAngle) * currentSpeed;
    bossState.bossVy = Math.sin(newAngle) * currentSpeed;
  }

  // Clear
  ctx.clearRect(0, 0, W, H);

  // Draw background tint
  ctx.fillStyle = 'rgba(5, 5, 20, 0.85)';
  ctx.fillRect(0, 0, W, H);

  // Grid lines (bullet hell aesthetic)
  ctx.strokeStyle = 'rgba(108,99,255,0.06)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  const boss = getBossData(bossState.milestone);

  // Shoot
  bossState.shootTimer++;
  if (bossState.shootTimer >= bossState.shootInterval) {
    bossState.shootTimer = 0;
    shootBullets();
  }

  // Update bullets
  bossState.bullets = bossState.bullets.filter(b => {
    b.x += b.vx;
    b.y += b.vy;
    return b.x > -50 && b.x < W + 50 && b.y > -50 && b.y < H + 50;
  });

  // Draw bullets
  bossState.bullets.forEach(b => {
    ctx.save();
    ctx.shadowColor = b.color;
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = b.color;
    ctx.fill();
    // Inner glow
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fill();
    ctx.restore();
  });

  // Draw boss
  const bossAlive = bossState.hp > 0;
  if (bossAlive) {
    const pulse = 1 + Math.sin(bossState.frameCount * 0.08) * 0.05;
    const r = bossState.bossRadius * pulse;

    ctx.save();
    ctx.shadowColor = boss.color;
    ctx.shadowBlur = 40;
    // Boss glow ring
    const gradient = ctx.createRadialGradient(bossState.bossX, bossState.bossY, r * 0.3, bossState.bossX, bossState.bossY, r * 1.5);
    gradient.addColorStop(0, boss.color + 'AA');
    gradient.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(bossState.bossX, bossState.bossY, r * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Boss body
    ctx.beginPath();
    ctx.arc(bossState.bossX, bossState.bossY, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15,15,30,0.9)';
    ctx.strokeStyle = boss.color;
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Boss image or emoji
    const bossImg = boss.imageKey ? BOSS_IMAGES[boss.imageKey] : null;
    if (bossImg && bossImg.complete && bossImg.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(bossState.bossX, bossState.bossY, r - 3, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(
        bossImg,
        bossState.bossX - (r - 3),
        bossState.bossY - (r - 3),
        (r - 3) * 2,
        (r - 3) * 2
      );
      ctx.restore();
    } else {
      ctx.font = `${bossState.bossRadius * 0.9}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(boss.icon, bossState.bossX, bossState.bossY);
    }

    // Clickable hint ring (pulsing)
    if (bossState.frameCount % 60 < 30) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(bossState.bossX, bossState.bossY, bossState.bossRadius + 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // Draw explosions
  bossState.explosions = bossState.explosions.filter(ex => {
    ex.r += 2;
    ex.life -= 0.06;
    if (ex.life <= 0) return false;
    ctx.save();
    ctx.globalAlpha = ex.life;
    ctx.beginPath();
    ctx.arc(ex.x, ex.y, ex.r, 0, Math.PI * 2);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    return true;
  });

  // Draw player cursor
  const px = bossState.mouseX;
  const py = bossState.mouseY;
  const pr = bossState.playerRadius;

  // Player glow
  ctx.save();
  ctx.shadowColor = '#6C63FF';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(px, py, pr, 0, Math.PI * 2);
  ctx.fillStyle = '#6C63FF';
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Inner dot (hitbox indicator)
  ctx.beginPath();
  ctx.arc(px, py, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.restore();

  // Collision detection
  if (!bossState.won && !bossState.lost) {
    for (const b of bossState.bullets) {
      const dx = px - b.x;
      const dy = py - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < pr + b.r * 0.4) { // tight hitbox
        endBossFight(false);
        return;
      }
    }
  }

  bossState.animId = requestAnimationFrame(bossLoop);
}

function endBossFight(won) {
  bossState.won = won;
  bossState.lost = !won;
  bossState.active = false;

  cancelAnimationFrame(bossState.animId);
  clearInterval(bossState._timerInterval);

  if (bossState._resizeHandler) {
    window.removeEventListener('resize', bossState._resizeHandler);
  }

  const overlay = document.getElementById('boss-overlay');

  if (won) {
    // Mark boss as defeated
    state.bossDefeated[bossState.milestone] = true;
    state.bossPending = false;
    updateBossButton();
    checkAchievements();

    overlay.remove();
    showToast(`🎉 ¡Derrotaste al Boss! Ahora podés seguir subiendo de nivel.`);
  } else {
    // Lost — show retry screen
    showBossLostScreen(bossState.milestone, overlay);
  }
}

function showManualGraduationScreen() {
  const overlay = document.createElement('div');
  overlay.id = 'boss-overlay'; // Reusing for full-screen styles
  const pointsGained = getRebirthPointsForGraduation(state.rebirths);
  const nextMultiplier = (state.rebirthMultiplier * 2).toFixed(1);
  
  overlay.innerHTML = `
    <div id="graduation-screen">
      <div class="graduation-confetti-bg"></div>
      <div class="graduation-content">
        <div class="graduation-emoji">🎓</div>
        <h1 class="graduation-title">¡GRADUACIÓN!</h1>
        <p class="graduation-subtitle">Alcanzaste el <strong>Nivel ${state.level}</strong></p>
        <div class="graduation-divider"></div>
        <p class="graduation-desc">
          ¿Querés <strong>Graduarte</strong> y reiniciar tu progreso<br>
          a cambio de un multiplicador de daño x2 y Puntos Rebirth?
        </p>
        <div class="graduation-bonus">
          <div class="graduation-bonus-item">
            <div class="bonus-icon">💥</div>
            <div class="bonus-text"><strong>2x Daño Permanente</strong><br><span class="bonus-sub">Actual: x${state.rebirthMultiplier.toFixed(1)} → Nuevo: x${nextMultiplier}</span></div>
          </div>
          <div class="graduation-bonus-item">
            <div class="bonus-icon">💎</div>
            <div class="bonus-text">+<strong>${pointsGained} Puntos Rebirth</strong><br><span class="bonus-sub">Puntos para gastar en la Tienda de Graduación</span></div>
          </div>
          <div class="graduation-bonus-item">
            <div class="bonus-icon">🔄</div>
            <div class="bonus-text">Progreso reiniciado<br><span class="bonus-sub">Score, niveles y generadores vuelven a cero</span></div>
          </div>
        </div>
        <div class="graduation-buttons">
          <button id="btn-rebirth" class="grad-btn-primary">🎓 ¡Sí, Graduarme!</button>
          <button id="btn-skip-rebirth" class="grad-btn-secondary">Cancelar</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('btn-rebirth').addEventListener('click', () => {
    doRebirth();
    overlay.remove();
  });
  document.getElementById('btn-skip-rebirth').addEventListener('click', () => {
    overlay.remove();
  });
}

function showBossLostScreen(milestone, overlay) {
  const boss = getBossData(milestone);
  overlay.innerHTML = `
    <div id="boss-lost-screen">
      <div class="boss-lost-content">
        <div class="boss-lost-emoji">💀</div>
        <h2 class="boss-lost-title">¡Fuiste derrotado!</h2>
        <p class="boss-lost-sub">${getBossBadgeHtml(boss, 22)}${boss.name} ganó esta vez...</p>
        <div class="boss-lost-buttons">
          <button id="btn-retry-boss" class="grad-btn-primary">🔄 Intentar de nuevo</button>
          <button id="btn-skip-boss" class="grad-btn-secondary">🚪 Volver al juego</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-retry-boss').addEventListener('click', () => {
    overlay.remove();
    state.bossPending = true;
    updateBossButton();
    startBossFight();
  });
  document.getElementById('btn-skip-boss').addEventListener('click', () => {
    overlay.remove();
    state.bossPending = true;
    updateBossButton();
    showToast('⚠️ El Boss sigue esperando. ¡Intentalo cuando estés listo!');
  });
}

function showEndGameScreen() {
  const overlay = document.createElement('div');
  overlay.id = 'boss-overlay';
  
  const elapsedSec = Math.floor((Date.now() - state.gameStartTime) / 1000);
  const minutes = Math.floor(elapsedSec / 60);
  const seconds = elapsedSec % 60;
  const hours = Math.floor(minutes / 60);
  const displayMinutes = minutes % 60;
  const timeFormatted = hours > 0 
    ? `${hours}h ${displayMinutes}m ${seconds}s` 
    : `${minutes}m ${seconds}s`;

  overlay.innerHTML = `
    <div id="graduation-screen">
      <div class="graduation-confetti-bg"></div>
      <div class="graduation-content" style="max-width: 620px;">
        <div class="graduation-emoji">🏆</div>
        <h1 class="graduation-title">¡VICTORIA TOTAL!</h1>
        <p class="graduation-subtitle">¡Has completado <strong>PROA Clicker</strong> al Nivel ${state.level}!</p>
        <div class="graduation-divider"></div>
        
        <h3 style="color:#FFD700; margin-bottom:16px; font-family:var(--font-display);">📊 Estadísticas Finales de la Partida</h3>
        
        <div class="graduation-bonus" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="graduation-bonus-item">
            <div class="bonus-icon">⏱️</div>
            <div class="bonus-text">Tiempo de Juego<br><span class="bonus-sub" style="font-size:0.95rem; color:#FFD700; font-weight:bold;">${timeFormatted}</span></div>
          </div>
          <div class="graduation-bonus-item">
            <div class="bonus-icon">👆</div>
            <div class="bonus-text">Clicks Totales<br><span class="bonus-sub" style="font-size:0.95rem; color:#FFD700; font-weight:bold;">${formatNumber(state.totalClicks)}</span></div>
          </div>
          <div class="graduation-bonus-item">
            <div class="bonus-icon">🔥</div>
            <div class="bonus-text">Aura Acumulada<br><span class="bonus-sub" style="font-size:0.95rem; color:#FFD700; font-weight:bold;">${formatNumber(state.totalScore)}</span></div>
          </div>
          <div class="graduation-bonus-item">
            <div class="bonus-icon">🎓</div>
            <div class="bonus-text">Graduaciones<br><span class="bonus-sub" style="font-size:0.95rem; color:#FFD700; font-weight:bold;">${state.rebirths}</span></div>
          </div>
          <div class="graduation-bonus-item">
            <div class="bonus-icon">⭐</div>
            <div class="bonus-text">Nivel Alcanzado<br><span class="bonus-sub" style="font-size:0.95rem; color:#FFD700; font-weight:bold;">Nivel ${state.level}</span></div>
          </div>
          <div class="graduation-bonus-item">
            <div class="bonus-icon">🏆</div>
            <div class="bonus-text">Logros Desbloqueados<br><span class="bonus-sub" style="font-size:0.95rem; color:#FFD700; font-weight:bold;">${unlockedAchievements.size} / ${ACHIEVEMENTS.length}</span></div>
          </div>
        </div>

        <div class="graduation-buttons" style="margin-top:20px;">
          <button id="btn-close-endgame" class="grad-btn-primary">🎉 ¡Seguir Jugando!</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('btn-close-endgame').addEventListener('click', () => {
    overlay.remove();
  });
}

function doRebirth() {
  const pointsGained = getRebirthPointsForGraduation(state.rebirths);
  state.rebirths++;
  state.rebirthMultiplier = parseFloat((state.rebirthMultiplier * 2).toFixed(1));
  state.rebirthPoints += pointsGained;

  // Calculate start bonus aura from rebirth shop
  const startBonus = (state.rebirthShopUpgrades['rb_startboost'] || 0) * 500;

  // Reset progress including school levels
  state.score = startBonus;
  state.totalScore = startBonus;
  state.level = 1;
  state.generators = {};
  state.boosters = {};
  state.upgradesBought = 0;

  // Base click power
  state.clickPower = 1;

  state.bossDefeated = {};
  state.bossPending = false;

  state.perSecond = calculatePerSecond();
  renderShop();
  updateDisplay();
  checkAchievements();
  updateBossButton();

  // Grand flash
  const flash = document.createElement('div');
  flash.className = 'rebirth-flash';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 1200);

  showToast(`🎓 ¡Graduación #${state.rebirths}! 2x Daño (x${state.rebirthMultiplier}) y +${pointsGained} 💎 Puntos Rebirth`, 'level-toast');
  saveGame();
}

// ---- Initialize ----
function init() {
  loadGame();
  createParticles();
  renderShop();
  renderAchievements();
  initShopTabs();
  updateDisplay();
  updateBossButton();

  // Main click event
  DOM.clickTarget.addEventListener('click', handleClick);

  // Boss button
  if (DOM.bossBtn) {
    DOM.bossBtn.addEventListener('click', () => {
      if (state.bossPending) startBossFight();
    });
  }

  // Manual Rebirth button
  if (DOM.manualRebirthBtn) {
    DOM.manualRebirthBtn.addEventListener('click', () => {
      const requiredLevel = getRequiredLevelForRebirth(state.rebirths);
      if (state.level >= requiredLevel) showManualGraduationScreen();
    });
  }

  // End Game button
  if (DOM.endGameBtn) {
    DOM.endGameBtn.addEventListener('click', () => {
      if (state.level >= 29) showEndGameScreen();
    });
  }

  // Reset Game button
  if (DOM.resetGameBtn) {
    DOM.resetGameBtn.addEventListener('click', resetFullGame);
  }

  // Game loop: 50ms tick
  setInterval(gameTick, 50);

  // Auto-save every 15 seconds
  setInterval(saveGame, 15000);

  // Re-render shop every 2 seconds for affordability
  setInterval(renderShop, 2000);

  // Save on unload
  window.addEventListener('beforeunload', saveGame);
}

function resetFullGame() {
  const confirmed = confirm('⚠️ ¿Estás seguro de que querés reiniciar TODO tu progreso? (Puntos, nivel, graduaciones y logros serán eliminados).');
  if (!confirmed) return;

  try {
    localStorage.removeItem('proaClickerSave');
  } catch (e) {}

  state.score = 0;
  state.totalScore = 0;
  state.totalClicks = 0;
  state.clickPower = 1;
  state.perSecond = 0;
  state.level = 1;
  state.upgradesBought = 0;
  state.generators = {};
  state.boosters = {};
  state.rebirths = 0;
  state.rebirthMultiplier = 1;
  state.rebirthPoints = 0;
  state.rebirthShopUpgrades = {};
  state.gameStartTime = Date.now();
  state.bossDefeated = {};
  state.bossPending = false;
  unlockedAchievements.clear();

  renderShop();
  renderAchievements();
  updateDisplay();
  updateBossButton();

  showToast('🗑️ Progreso totalmente reiniciado.');
}

// Start the game
init();
