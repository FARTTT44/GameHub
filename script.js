/* =====================================================
   POCKET ARCADE — script.js
   Implements navigation, theme toggle, Reaction Click, Gallery, Feedback,
   Neon Labyrinth (simplified) and Glitch Garden tower defense.
===================================================== */

"use strict";

/* DOM SELECTORS */
// Navigation
const navBtns   = document.querySelectorAll(".nav-btn");
const sections  = document.querySelectorAll(".section");
// Theme
const themeToggle = document.getElementById("themeToggleBtn");
// Home CTA
const playNowBtn  = document.getElementById("playNowBtn");

// Reaction Click selectors
const reactionSetup   = document.getElementById("reactionSetup");
const reactionArena   = document.getElementById("reactionArena");
const reactionOver    = document.getElementById("reactionOver");
const reactionPlayer  = document.getElementById("reactionPlayer");
const reactionStart   = document.getElementById("reactionStart");
const reactionRestart = document.getElementById("reactionRestart");
const reactionTarget  = document.getElementById("reactionTarget");
const reactionArea    = document.getElementById("reactionArea");
const reactionName    = document.getElementById("reactionName");
const reactionScoreEl = document.getElementById("reactionScore");
const reactionTimerEl = document.getElementById("reactionTimer");
const reactionFinal   = document.getElementById("reactionFinal");

// Gallery
const sliderImg     = document.getElementById("sliderImg");
const sliderCaption = document.getElementById("sliderCaption");
const sliderCount   = document.getElementById("sliderCount");
const prevBtn       = document.getElementById("prevBtn");
const nextBtn       = document.getElementById("nextBtn");
const dotsContainer = document.getElementById("sliderDots");

// Feedback
const feedbackForm   = document.getElementById("feedbackForm");
const feedbackThanks = document.getElementById("feedbackThanks");
const fbName         = document.getElementById("fbName");
const fbGame         = document.getElementById("fbGame");
const fbMessage      = document.getElementById("fbMessage");

// Labyrinth
const labyrinthCanvas = document.getElementById("labyrinthCanvas");
const labCtx          = labyrinthCanvas ? labyrinthCanvas.getContext("2d") : null;
const labyrinthStart  = document.getElementById("labyrinthStart");

// Glitch Garden selectors
const glitchBoard    = document.getElementById("glitchBoard");
const glitchToolbar  = document.getElementById("glitchToolbar");
const ggWaveEl       = document.getElementById("ggWave");
const ggMoneyEl      = document.getElementById("ggMoney");
const ggLivesEl      = document.getElementById("ggLives");
const ggStartWaveBtn = document.getElementById("ggStartWave");
const ggResetBtn     = document.getElementById("ggReset");
const ggMessage      = document.getElementById("ggMessage");

/* STATE VARIABLES */
// Theme
let isDarkTheme = true;

// Navigation show/hide
function showSection(targetId) {
  sections.forEach((sec) => {
    sec.classList.toggle("active", sec.id === targetId);
  });
  navBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.target === targetId);
  });
  // scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
  // When gallery becomes active ensure slider shows
  if (targetId === "gallery") renderSlide();

  // Initialize Rune game when entering Rune section
  if (targetId === 'rune') {
    // Always reinitialize for a fresh game
    initRuneGame();
  }
}
navBtns.forEach((btn) => {
  btn.addEventListener("click", () => showSection(btn.dataset.target));
});
// Home hero CTA for Reaction Click
if (playNowBtn) {
  playNowBtn.addEventListener("click", () => showSection("reaction"));
}

/* THEME TOGGLE */
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle("theme-dark",  isDarkTheme);
    document.body.classList.toggle("theme-light", !isDarkTheme);
    // Temporary label to indicate theme
    const original = themeToggle.textContent;
    themeToggle.textContent = isDarkTheme ? "Light Mode" : "Dark Mode";
    clearTimeout(themeToggle._reset);
    themeToggle._reset = setTimeout(() => {
      themeToggle.textContent = original;
    }, 1500);
  });
}

/* REACTION CLICK GAME */
let reactionScore   = 0;
let reactionTime    = 20;
let reactionTimerID = null;
let reactionRunning = false;
let reactionPlayerName = "";

function rcMoveTarget() {
  const areaRect = reactionArea.getBoundingClientRect();
  const tSize = 50;
  const padding = 8;
  const maxX = areaRect.width  - tSize - padding;
  const maxY = areaRect.height - tSize - padding;
  const rx   = Math.floor(Math.random() * maxX) + padding;
  const ry   = Math.floor(Math.random() * maxY) + padding;
  reactionTarget.style.left = rx + "px";
  reactionTarget.style.top  = ry + "px";
}
function rcStartTimer() {
  reactionTimerID = setInterval(() => {
    reactionTime--;
    reactionTimerEl.textContent = reactionTime;
    if (reactionTime <= 5) {
      reactionTimerEl.classList.add("timer-val");
    }
    if (reactionTime <= 0) rcEndGame();
  }, 1000);
}
function rcInitGame() {
  reactionPlayerName = reactionPlayer.value.trim() || "Player";
  reactionScore = 0;
  reactionTime = 20;
  reactionRunning = true;
  reactionName.textContent = reactionPlayerName;
  reactionScoreEl.textContent = "0";
  reactionTimerEl.textContent = "20";
  reactionTimerEl.classList.remove("timer-val");
  reactionSetup.classList.add("hidden");
  reactionOver.classList.add("hidden");
  reactionArena.classList.remove("hidden");
  reactionTarget.style.display = "block";
  rcMoveTarget();
  rcStartTimer();
}
function rcEndGame() {
  clearInterval(reactionTimerID);
  reactionRunning = false;
  reactionTarget.style.display = "none";
  reactionArena.classList.add("hidden");
  reactionOver.classList.remove("hidden");
  // Build final message
  const score = reactionScore;
  let remark;
  if (score >= 20) remark = "Amazing reflexes!";
  else if (score >= 12) remark = "Great job!";
  else remark = "Keep practising!";
  reactionFinal.innerHTML =
    `Well played, <strong>${escapeHTML(reactionPlayerName)}</strong>!<br/>` +
    `You scored <strong class="accent">${score} points</strong> in 20 seconds.<br/>${remark}`;
}
function rcResetGame() {
  clearInterval(reactionTimerID);
  reactionRunning = false;
  reactionTarget.style.display = "none";
  reactionTimerEl.classList.remove("timer-val");
  reactionOver.classList.add("hidden");
  reactionArena.classList.add("hidden");
  reactionSetup.classList.remove("hidden");
  reactionPlayer.value = "";
}
if (reactionTarget) {
  reactionTarget.addEventListener("click", (e) => {
    if (!reactionRunning) return;
    e.stopPropagation();
    reactionScore++;
    reactionScoreEl.textContent = reactionScore;
    rcMoveTarget();
  });
}
if (reactionStart) reactionStart.addEventListener("click", rcInitGame);
if (reactionRestart) reactionRestart.addEventListener("click", rcResetGame);
if (reactionPlayer) {
  reactionPlayer.addEventListener("keydown", (e) => {
    if (e.key === "Enter") rcInitGame();
  });
}

/* =====================================================
   RUNE GAMBIT GAME
   A dice‑based battler with lockable runes and upgrades.
===================================================== */
// Rune selectors
const runeRoundEl  = document.getElementById('runeRound');
const runeHpEl     = document.getElementById('runeHp');
const runeGoldEl   = document.getElementById('runeGold');
const runeEnemyNameEl = document.getElementById('runeEnemyName');
const runeEnemyHpEl   = document.getElementById('runeEnemyHp');
const runeRunesEl  = document.getElementById('runeRunes');
const runeRollBtn  = document.getElementById('runeRollBtn');
const runeFightBtn = document.getElementById('runeFightBtn');
const runeMessageEl= document.getElementById('runeMessage');
const runeUpgradesEl   = document.getElementById('runeUpgrades');
const runeUpgradeOptionsEl = runeUpgradesEl ? runeUpgradesEl.querySelector('.upgrade-options') : null;

let runePlayer, runeEnemy, runeRunes, runeLocked, runeRollsLeft, runeGameState;

function initRuneGame() {
  runePlayer = { hp: 30, gold: 0, round: 1, rerolls: 3, attackMult: 1, defenceMult: 1 };
  startRuneRound();
}

function startRuneRound() {
  runeRollsLeft = runePlayer.rerolls;
  runeLocked = [false, false, false, false, false];
  // Random enemy based on current round
  const enemyNames = ['Slime','Goblin','Imp','Skeleton','Orc','Mage','Troll','Golem','Dragon'];
  const baseHp  = 10 + runePlayer.round * 5;
  const baseAtk = 2 + Math.floor(runePlayer.round / 2);
  runeEnemy = {
    name: enemyNames[Math.floor(Math.random() * enemyNames.length)],
    hp: baseHp,
    atk: baseAtk
  };
  updateRuneHud();
  generateRuneRunes();
  renderRuneRunes();
  if (runeMessageEl) runeMessageEl.textContent = `Round ${runePlayer.round}: Roll your runes`;
  runeGameState = 'rolling';
  if (runeUpgradesEl) runeUpgradesEl.classList.add('hidden');
  if (runeFightBtn) runeFightBtn.disabled = true;
  if (runeRollBtn) runeRollBtn.disabled = false;
}

function generateRuneRunes() {
  runeRunes = [];
  const types = ['ATK','DEF','ARC','HP','G$'];
  for (let i = 0; i < 5; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const val = 1 + Math.floor(Math.random() * 6);
    runeRunes.push({ type, value: val });
  }
}

function renderRuneRunes() {
  if (!runeRunesEl) return;
  runeRunesEl.innerHTML = '';
  runeRunes.forEach((rune, i) => {
    const card = document.createElement('div');
    const typeLower = rune.type.toLowerCase().replace('$','\\$');
    card.className = `rune-card rune-${typeLower}` + (runeLocked[i] ? ' locked' : '');
    card.innerHTML = `<span class="rune-type">${rune.type}</span><span class="rune-val">${rune.value}</span>`;
    card.addEventListener('click', () => toggleRuneLock(i));
    runeRunesEl.appendChild(card);
  });
}

function toggleRuneLock(i) {
  if (runeGameState !== 'rolling') return;
  runeLocked[i] = !runeLocked[i];
  renderRuneRunes();
}

function rollRuneRunes() {
  if (runeGameState !== 'rolling') return;
  if (runeRollsLeft <= 0) return;
  const types = ['ATK','DEF','ARC','HP','G$'];
  runeRunes.forEach((rune, i) => {
    if (!runeLocked[i]) {
      rune.type = types[Math.floor(Math.random() * types.length)];
      rune.value = 1 + Math.floor(Math.random() * 6);
    }
  });
  runeRollsLeft--;
  renderRuneRunes();
  if (runeRollsLeft <= 0) {
    if (runeMessageEl) runeMessageEl.textContent = 'No rerolls left; press Fight';
  } else {
    if (runeMessageEl) runeMessageEl.textContent = `${runeRollsLeft} reroll${runeRollsLeft > 1 ? 's' : ''} left`;
  }
  if (runeFightBtn) runeFightBtn.disabled = false;
}

function fightRuneEnemy() {
  if (runeGameState !== 'rolling' && runeGameState !== 'defending') return;
  // compute totals
  let atk = 0, def = 0, arc = 0, hpGain = 0, goldGain = 0;
  runeRunes.forEach((rune) => {
    switch (rune.type) {
      case 'ATK': atk += rune.value; break;
      case 'DEF': def += rune.value; break;
      case 'ARC': arc += rune.value; break;
      case 'HP':  hpGain += rune.value; break;
      case 'G$':  goldGain += rune.value; break;
    }
  });
  atk = Math.floor(atk * (1 + arc * 0.2) * runePlayer.attackMult);
  def = Math.floor(def * (runePlayer.defenceMult));
  runePlayer.hp += hpGain;
  runePlayer.gold += goldGain;
  let battleLog = '';
  // Player attacks
  runeEnemy.hp -= atk;
  battleLog += `You deal ${atk} damage.`;
  if (runeEnemy.hp > 0) {
    // Enemy retaliates
    let dmg = runeEnemy.atk - def;
    if (dmg < 0) dmg = 0;
    runePlayer.hp -= dmg;
    battleLog += ` The ${runeEnemy.name} survives and hits you for ${dmg}.`;
    runeGameState = 'defending';
    // After a retaliation, disable rolls and allow another fight
    renderRuneRunes();
  } else {
    battleLog += ` You slay the ${runeEnemy.name}!`;
    runePlayer.round++;
    runeGameState = 'upgrading';
  }
  updateRuneHud();
  if (runeMessageEl) runeMessageEl.textContent = battleLog;
  if (runePlayer.hp <= 0) {
    if (runeMessageEl) runeMessageEl.textContent = 'You have fallen! Game over.';
    runeGameState = 'over';
    if (runeRollBtn) runeRollBtn.disabled = true;
    if (runeFightBtn) runeFightBtn.disabled = true;
    return;
  }
  if (runeGameState === 'defending') {
    // disable roll; allow fight again
    if (runeRollBtn) runeRollBtn.disabled = true;
    if (runeFightBtn) runeFightBtn.disabled = false;
    return;
  }
  if (runeGameState === 'upgrading') {
    showRuneUpgrades();
    return;
  }
}

function showRuneUpgrades() {
  if (!runeUpgradesEl || !runeUpgradeOptionsEl) {
    startRuneRound();
    return;
  }
  runeUpgradesEl.classList.remove('hidden');
  runeUpgradeOptionsEl.innerHTML = '';
  const options = [];
  options.push({ id:'hp',   text:`Increase HP by 10 (cost 10 G$)`, cost: 10, apply: () => { runePlayer.hp += 10; } });
  options.push({ id:'atk',  text:`Increase attack multiplier by 0.2 (cost 15 G$)`, cost: 15, apply: () => { runePlayer.attackMult += 0.2; } });
  options.push({ id:'def',  text:`Increase defence multiplier by 0.2 (cost 15 G$)`, cost: 15, apply: () => { runePlayer.defenceMult += 0.2; } });
  options.push({ id:'reroll', text:`Gain +1 reroll next round (cost 5 G$)`, cost: 5, apply: () => { runePlayer.rerolls += 1; } });
  options.forEach((opt) => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-outline btn-full';
    btn.textContent = opt.text;
    btn.addEventListener('click', () => {
      if (runePlayer.gold < opt.cost) {
        if (runeMessageEl) runeMessageEl.textContent = `Not enough gold for this upgrade.`;
        return;
      }
      runePlayer.gold -= opt.cost;
      opt.apply();
      runeUpgradesEl.classList.add('hidden');
      startRuneRound();
    });
    runeUpgradeOptionsEl.appendChild(btn);
  });
  if (runeMessageEl) runeMessageEl.textContent = 'Choose one upgrade:';
}

function updateRuneHud() {
  if (runeRoundEl) runeRoundEl.textContent = runePlayer.round;
  if (runeHpEl) runeHpEl.textContent    = runePlayer.hp;
  if (runeGoldEl) runeGoldEl.textContent  = runePlayer.gold;
  if (runeEnemyNameEl) runeEnemyNameEl.textContent = runeEnemy.name;
  if (runeEnemyHpEl) runeEnemyHpEl.textContent   = runeEnemy.hp > 0 ? runeEnemy.hp : 0;
  if (runeRollBtn) runeRollBtn.disabled = false;
}

// Event listeners for Rune Gambit
if (runeRollBtn) runeRollBtn.addEventListener('click', rollRuneRunes);
if (runeFightBtn) runeFightBtn.addEventListener('click', fightRuneEnemy);


/* IMAGE SLIDER */
let currentSlide = 0;
// You can replace these images with your own or royalty free images
const slides = [
  {
    src: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=900&q=80",
    caption: "Classic Arcade Vibes"
  },
  {
    src: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=900&q=80",
    caption: "Retro Gaming Paradise"
  },
  {
    src: "https://images.unsplash.com/photo-1614294149010-950b698f72c0?w=900&q=80",
    caption: "Neon Nights & High Scores"
  },
  {
    src: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=900&q=80",
    caption: "Game On, Player One"
  }
];
function buildDots() {
  dotsContainer.innerHTML = "";
  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "dot" + (i === currentSlide ? " active" : "");
    dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
    dot.addEventListener("click", () => {
      currentSlide = i;
      renderSlide();
    });
    dotsContainer.appendChild(dot);
  });
}
function renderSlide() {
  const slide = slides[currentSlide];
  if (!slide) return;
  sliderImg.style.opacity = 0;
  setTimeout(() => {
    sliderImg.src = slide.src;
    sliderImg.alt = slide.caption;
    sliderCaption.textContent = slide.caption;
    sliderCount.textContent = `${currentSlide + 1} / ${slides.length}`;
    sliderImg.style.opacity = 1;
  }, 200);
  buildDots();
}
if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    renderSlide();
  });
}
if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    currentSlide = (currentSlide + 1) % slides.length;
    renderSlide();
  });
}
// Auto-advance
setInterval(() => {
  currentSlide = (currentSlide + 1) % slides.length;
  renderSlide();
}, 5000);
// Initialise slider if gallery is first section
renderSlide();

/* FEEDBACK FORM */
if (feedbackForm) {
  feedbackForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name    = fbName.value.trim() || "Anonymous";
    const game    = fbGame.value || "a game";
    const message = fbMessage.value.trim();
    feedbackThanks.innerHTML =
      `<h3>Thanks for the feedback!</h3>` +
      `<p>Hey <strong>${escapeHTML(name)}</strong>, we got your message!<br/>` +
      `Glad you enjoy playing <strong>${escapeHTML(game)}</strong>.<br/>` +
      `${message ? `\nWe\'ll keep your thoughts in mind: \"<em>${escapeHTML(message.slice(0, 150))}${message.length > 150 ? "…" : ""}</em>\"` : ""}` +
      `</p>`;
    feedbackThanks.classList.remove("hidden");
    feedbackForm.classList.add("hidden");
    feedbackForm.reset();
    setTimeout(() => {
      feedbackThanks.classList.add("hidden");
      feedbackForm.classList.remove("hidden");
    }, 6000);
  });
}

/* UTILITY: escape HTML */
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* =====================================================
   NEON LABYRINTH (simplified)
===================================================== */
// Basic maze generator using recursive backtracking
if (labCtx) {
  const LAB_ROWS = 10;
  const LAB_COLS = 10;
  const cellSize = labyrinthCanvas.width / LAB_COLS;
  let maze = [];
  let playerPos = { r: 0, c: 0 };
  let exitPos   = { r: LAB_ROWS - 1, c: LAB_COLS - 1 };
  let hunterPos = { r: 0, c: 0 };
  let labRunning = false;
  let keysPositions = [];
  let keysCollected = 0;
  // Cell object: {walls:{top,right,bottom,left}, visited}
  function createMazeGrid() {
    maze = [];
    for (let r = 0; r < LAB_ROWS; r++) {
      const row = [];
      for (let c = 0; c < LAB_COLS; c++) {
        row.push({
          r, c,
          walls: { top: true, right: true, bottom: true, left: true },
          visited: false
        });
      }
      maze.push(row);
    }
  }
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  function generateMaze(r = 0, c = 0) {
    const cell = maze[r][c];
    cell.visited = true;
    const dirs = shuffle([
      { dr: -1, dc: 0, wall: "top",    opp: "bottom" },
      { dr: 1,  dc: 0, wall: "bottom", opp: "top" },
      { dr: 0,  dc: -1,wall: "left",   opp: "right" },
      { dr: 0,  dc: 1, wall: "right",  opp: "left" }
    ]);
    dirs.forEach(({ dr, dc, wall, opp }) => {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < LAB_ROWS && nc >= 0 && nc < LAB_COLS) {
        const neighbor = maze[nr][nc];
        if (!neighbor.visited) {
          cell.walls[wall] = false;
          neighbor.walls[opp] = false;
          generateMaze(nr, nc);
        }
      }
    });
  }
  function drawMaze() {
    labCtx.clearRect(0, 0, labyrinthCanvas.width, labyrinthCanvas.height);
    // draw cells
    labCtx.lineWidth = 2;
    labCtx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--card-border');
    for (let r = 0; r < LAB_ROWS; r++) {
      for (let c = 0; c < LAB_COLS; c++) {
        const cell = maze[r][c];
        const x = c * cellSize;
        const y = r * cellSize;
        // walls
        labCtx.beginPath();
        if (cell.walls.top)    { labCtx.moveTo(x, y); labCtx.lineTo(x + cellSize, y); }
        if (cell.walls.right)  { labCtx.moveTo(x + cellSize, y); labCtx.lineTo(x + cellSize, y + cellSize); }
        if (cell.walls.bottom) { labCtx.moveTo(x, y + cellSize); labCtx.lineTo(x + cellSize, y + cellSize); }
        if (cell.walls.left)   { labCtx.moveTo(x, y); labCtx.lineTo(x, y + cellSize); }
        labCtx.stroke();
      }
    }
    // fill background
    labCtx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg2');
    labCtx.fillRect(0, 0, labyrinthCanvas.width, labyrinthCanvas.height);
    // draw exit
    labCtx.fillStyle = getComputedStyle(document.body).getPropertyValue('--accent2');
    labCtx.fillRect(exitPos.c * cellSize + 10, exitPos.r * cellSize + 10, cellSize - 20, cellSize - 20);
    // draw keys
    labCtx.fillStyle = getComputedStyle(document.body).getPropertyValue('--accent3');
    keysPositions.forEach(({ r, c, collected }) => {
      if (!collected) {
        const x = c * cellSize + cellSize * 0.3;
        const y = r * cellSize + cellSize * 0.3;
        const size = cellSize * 0.4;
        labCtx.beginPath();
        labCtx.moveTo(x + size * 0.5, y);
        labCtx.lineTo(x + size, y + size * 0.35);
        labCtx.lineTo(x + size * 0.8, y + size);
        labCtx.lineTo(x + size * 0.2, y + size);
        labCtx.lineTo(x, y + size * 0.35);
        labCtx.closePath();
        labCtx.fill();
      }
    });
    // draw player
    labCtx.fillStyle = getComputedStyle(document.body).getPropertyValue('--accent');
    labCtx.beginPath();
    labCtx.arc(playerPos.c * cellSize + cellSize / 2, playerPos.r * cellSize + cellSize / 2, cellSize * 0.25, 0, Math.PI * 2);
    labCtx.fill();
    // draw hunter
    labCtx.fillStyle = getComputedStyle(document.body).getPropertyValue('--accent3');
    labCtx.beginPath();
    labCtx.rect(hunterPos.c * cellSize + cellSize * 0.25, hunterPos.r * cellSize + cellSize * 0.25, cellSize * 0.5, cellSize * 0.5);
    labCtx.fill();
  }
  // Find the farthest cell from the player using BFS to avoid unfair spawn positions.
  function findFarthestCell(start) {
    const queue = [ { r: start.r, c: start.c, d: 0 } ];
    const visited = Array.from({ length: LAB_ROWS }, () => Array(LAB_COLS).fill(false));
    visited[start.r][start.c] = true;
    let farthest = { r: start.r, c: start.c, d: 0 };
    while (queue.length) {
      const { r, c, d } = queue.shift();
      if (d > farthest.d) farthest = { r, c, d };
      const cell = maze[r][c];
      const neighbors = [];
      if (!cell.walls.top)    neighbors.push({ r: r - 1, c });
      if (!cell.walls.bottom) neighbors.push({ r: r + 1, c });
      if (!cell.walls.left)   neighbors.push({ r, c: c - 1 });
      if (!cell.walls.right)  neighbors.push({ r, c: c + 1 });
      neighbors.forEach(({ r: nr, c: nc }) => {
        if (!visited[nr][nc]) {
          visited[nr][nc] = true;
          queue.push({ r: nr, c: nc, d: d + 1 });
        }
      });
    }
    return farthest;
  }

  function resetLab() {
    createMazeGrid();
    generateMaze(0, 0);
    // Start player at top-left corner
    playerPos = { r: 0, c: 0 };
    // Place exit at bottom-right
    exitPos   = { r: LAB_ROWS - 1, c: LAB_COLS - 1 };
    // Determine hunter spawn cell farthest from player to avoid unfair immediate collisions
    const far = findFarthestCell(playerPos);
    hunterPos = { r: far.r, c: far.c };
    // Generate key positions: three random cells excluding start, exit and hunter
    keysPositions = [];
    keysCollected = 0;
    const totalKeys = 3;
    while (keysPositions.length < totalKeys) {
      const kr = Math.floor(Math.random() * LAB_ROWS);
      const kc = Math.floor(Math.random() * LAB_COLS);
      // avoid start, exit, hunter
      const banned = (kr === playerPos.r && kc === playerPos.c) || (kr === exitPos.r && kc === exitPos.c) || (kr === hunterPos.r && kc === hunterPos.c);
      if (banned) continue;
      // avoid duplicates
      if (keysPositions.some(pos => pos.r === kr && pos.c === kc)) continue;
      keysPositions.push({ r: kr, c: kc, collected: false });
    }
    labRunning = true;
    drawMaze();
  }
  function labMovePlayer(dr, dc) {
    if (!labRunning) return;
    const { r, c } = playerPos;
    const cell = maze[r][c];
    let newR = r;
    let newC = c;
    if (dr === -1 && !cell.walls.top)    newR--;
    if (dr === 1  && !cell.walls.bottom) newR++;
    if (dc === -1 && !cell.walls.left)   newC--;
    if (dc === 1  && !cell.walls.right)  newC++;
    if (newR < 0 || newR >= LAB_ROWS || newC < 0 || newC >= LAB_COLS) return;
    playerPos = { r: newR, c: newC };
    // Check if player collects a key
    keysPositions.forEach((kp) => {
      if (!kp.collected && kp.r === playerPos.r && kp.c === playerPos.c) {
        kp.collected = true;
        keysCollected++;
        // You could add feedback here (e.g. console.log or sound)
      }
    });
    // move hunter towards player using simple greedy algorithm
    const hr = hunterPos.r;
    const hc = hunterPos.c;
    const diffR = playerPos.r - hr;
    const diffC = playerPos.c - hc;
    let moveR = 0;
    let moveC = 0;
    if (Math.abs(diffR) > Math.abs(diffC)) {
      moveR = diffR > 0 ? 1 : -1;
    } else if (diffC !== 0) {
      moveC = diffC > 0 ? 1 : -1;
    }
    // Check walls for hunter
    const hcell = maze[hr][hc];
    if (moveR === -1 && !hcell.walls.top)    hunterPos.r--;
    else if (moveR === 1 && !hcell.walls.bottom) hunterPos.r++;
    else if (moveC === -1 && !hcell.walls.left) hunterPos.c--;
    else if (moveC === 1 && !hcell.walls.right) hunterPos.c++;
    // check collisions
    if (hunterPos.r === playerPos.r && hunterPos.c === playerPos.c) {
      // Player loses and reset
      labRunning = false;
      alert("Caught by the hunter! Try again.");
      resetLab();
      return;
    }
    // check exit
    if (playerPos.r === exitPos.r && playerPos.c === exitPos.c) {
      // Player must collect all keys before exiting
      const remaining = keysPositions.filter(kp => !kp.collected).length;
      if (remaining > 0) {
        // Provide message but keep running
        alert(`You need to collect ${remaining} key${remaining > 1 ? 's' : ''} before exiting!`);
      } else {
        labRunning = false;
        alert("You escaped the maze! Well done.");
        resetLab();
        return;
      }
    }
    drawMaze();
  }
  if (labyrinthStart) {
    labyrinthStart.addEventListener("click", resetLab);
  }
  window.addEventListener("keydown", (e) => {
    if (!labRunning) return;
    if (["ArrowUp", "w", "W"].includes(e.key)) labMovePlayer(-1, 0);
    else if (["ArrowDown", "s", "S"].includes(e.key)) labMovePlayer(1, 0);
    else if (["ArrowLeft", "a", "A"].includes(e.key)) labMovePlayer(0, -1);
    else if (["ArrowRight", "d", "D"].includes(e.key)) labMovePlayer(0, 1);
  });
}

/* =====================================================
   GLITCH GARDEN — Tower Defense
===================================================== */
if (glitchBoard) {
  const ROWS = 12;
  const COLS = 12;
  let board = [];
  let pathCells = [];
  let towers = [];
  let traps = [];
  let enemies = [];
  let wave = 1;
  let money = 100;
  let lives = 10;
  let gameState = 'build';
  let selectedItem = null;
  let spawnInterval = null;
  let animFrame = null;

  // Tower definitions.  Each tower has unique behaviour to encourage strategic diversity.
  // id: unique key, name: label, cost: purchase cost, range: Manhattan range, rate: ms between shots,
  // damage: base damage.  Additional properties provide special effects.
  const towerDefs = [
    { id:'laser',    name:'Laser',    cost:25, range:3, rate:600,  damage:3,  canTargetStealth:false },
    { id:'frost',    name:'Frost',    cost:30, range:2, rate:800,  damage:2,  slow:0.5, canTargetStealth:false },
    { id:'flame',    name:'Flame',    cost:35, range:2, rate:1000, damage:1,  burn:2,  canTargetStealth:true  },
    { id:'tesla',    name:'Tesla',    cost:40, range:3, rate:1200, damage:3,  chain:2, canTargetStealth:true  },
    // Missile tower fires slow but powerful rockets that explode on impact causing area damage.
    { id:'missile',  name:'Missile',  cost:50, range:4, rate:1500, damage:6,  aoe:true, canTargetStealth:true },
    // Poison tower applies a lingering poison damage over time to enemies.
    { id:'poison',   name:'Poison',   cost:45, range:3, rate:1000, damage:1,  poison:2, canTargetStealth:true },
    // Shockwave tower fires a blast that damages all enemies in range simultaneously.
    { id:'shock',    name:'Shockwave',cost:55, range:2, rate:2000, damage:3,  pulse:true, canTargetStealth:true }
  ];
  const trapDefs = [
    { id:'spike', name:'Spike Trap', cost:20, damage:5, single:true },
    { id:'bomb',  name:'Bomb Trap',  cost:30, damage:4, aoe:true },
    // Tar trap greatly slows all enemies that step on it for a short time.
    { id:'tar',   name:'Tar Trap',   cost:25, slow:0.5, single:false },
    // Mine trap deals heavy damage to a single enemy and small splash to neighbours.
    { id:'mine',  name:'Mine',       cost:35, damage:8, aoe:true, single:true }
  ];
  // Enemy definitions.  Additional fields (regen, shield, stealth, splitter) provide special behaviour.
  const enemyDefs = {
    normal:    { speed: 1.0, hp: 10,  reward: 5,  class:'enemy-normal' },
    fast:      { speed: 1.6, hp: 8,   reward: 6,  class:'enemy-fast'   },
    tank:      { speed: 0.7, hp: 20,  reward: 10, class:'enemy-tank'   },
    fly:       { speed: 1.4, hp: 12,  reward: 8,  class:'enemy-fly'    },
    boss:      { speed: 0.8, hp: 100, reward: 50, class:'enemy-boss'   },
    shielded:  { speed: 0.9, hp: 15,  reward: 12, class:'enemy-shield', shield: 8 },
    regenerator:{ speed: 1.0, hp: 14, reward: 12, class:'enemy-regenerator', regen: 0.02 },
    splitter:  { speed: 1.1, hp: 16,  reward: 15, class:'enemy-splitter', splitter:true },
    stealth:   { speed: 1.2, hp: 10,  reward: 8,  class:'enemy-stealth', stealth:true },
    splitChild:{ speed: 1.4, hp: 8,   reward: 2,  class:'enemy-split-child', child:true }
  };

  /**
   * Apply damage to an enemy, reducing shield first if present.
   * @param {object} enemy
   * @param {number} dmg
   */
  function applyDamage(enemy, dmg) {
    if (!enemy || dmg <= 0) return;
    if (enemy.shield && enemy.shield > 0) {
      const leftover = dmg - enemy.shield;
      enemy.shield = Math.max(0, enemy.shield - dmg);
      if (leftover > 0) enemy.hp -= leftover;
    } else {
      enemy.hp -= dmg;
    }
  }

  /**
   * Spawn a child enemy at the same path progress as its parent. Used for splitting enemies.
   * @param {object} parent
   */
  function spawnChildEnemy(parent) {
    const base = enemyDefs.splitChild;
    const startCell = pathCells[parent.pathIndex];
    const elem = document.createElement('div');
    elem.className = 'enemy ' + base.class;
    elem.textContent = 'C';
    startCell.element.appendChild(elem);
    const child = {
      type: 'splitChild',
      hp: base.hp,
      maxHp: base.hp,
      speed: base.speed,
      reward: base.reward,
      pathIndex: parent.pathIndex,
      progress: parent.progress,
      el: elem,
      slowTimer: 0,
      burnTimer: 0,
      poisonTimer: 0,
      shield: base.shield || 0,
      regen: base.regen || 0,
      splitter: false,
      stealth: base.stealth || false,
      child: true,
      x: 0,
      y: 0
    };
    enemies.push(child);
  }

  // Build UI toolbar
  function buildToolbar() {
    glitchToolbar.innerHTML = '';
    // Create tower section
    const towerTitle = document.createElement('div');
    towerTitle.className = 'sidebar-title';
    towerTitle.textContent = 'Towers';
    glitchToolbar.appendChild(towerTitle);
    towerDefs.forEach((def) => {
      const item = document.createElement('div');
      item.className = 'toolbar-item';
      item.dataset.type = 'tower';
      item.dataset.id   = def.id;
      const icon = document.createElement('div');
      icon.className = 'toolbar-icon';
      icon.style.background = getTowerColor(def.id);
      const name = document.createElement('div');
      name.className = 'toolbar-name';
      name.textContent = def.name;
      const cost = document.createElement('div');
      cost.className = 'toolbar-cost';
      cost.textContent = `$${def.cost}`;
      item.appendChild(icon);
      item.appendChild(name);
      item.appendChild(cost);
      item.addEventListener('click', () => selectItem(item));
      glitchToolbar.appendChild(item);
    });
    // Divider line
    const sep = document.createElement('div');
    sep.style.margin = '0.6rem 0';
    sep.style.height = '1px';
    sep.style.background = getComputedStyle(document.body).getPropertyValue('--card-border');
    glitchToolbar.appendChild(sep);
    // Create trap section
    const trapTitle = document.createElement('div');
    trapTitle.className = 'sidebar-title';
    trapTitle.textContent = 'Traps';
    glitchToolbar.appendChild(trapTitle);
    trapDefs.forEach((def) => {
      const item = document.createElement('div');
      item.className = 'toolbar-item';
      item.dataset.type = 'trap';
      item.dataset.id   = def.id;
      const icon = document.createElement('div');
      icon.className = 'toolbar-icon';
      icon.style.background = getTrapColor(def.id);
      const name = document.createElement('div');
      name.className = 'toolbar-name';
      name.textContent = def.name;
      const cost = document.createElement('div');
      cost.className = 'toolbar-cost';
      cost.textContent = `$${def.cost}`;
      item.appendChild(icon);
      item.appendChild(name);
      item.appendChild(cost);
      item.addEventListener('click', () => selectItem(item));
      glitchToolbar.appendChild(item);
    });
  }
  function getTowerColor(id) {
    switch(id) {
      case 'laser': return '#00d4a6';
      case 'frost': return '#2d9fe8';
      case 'flame': return '#e8423f';
      case 'tesla': return '#a855f7';
      case 'missile': return '#fbbf24'; // golden hue for missiles
      case 'poison': return '#10b981'; // green for poison
      case 'shock': return '#f59e0b'; // amber for shockwave
      default: return '#ccc';
    }
  }
  function getTrapColor(id) {
    switch(id) {
      case 'spike': return '#fbbf24';
      case 'bomb': return '#ef4444';
      case 'tar': return '#6b7280'; // gray for tar
      case 'mine': return '#ef4444'; // red for mine
      default: return '#ccc';
    }
  }
  function selectItem(item) {
    // deselect old
    glitchToolbar.querySelectorAll('.toolbar-item').forEach((el) => el.classList.remove('selected'));
    item.classList.add('selected');
    selectedItem = { type: item.dataset.type, id: item.dataset.id };
  }

  // Create board grid
  function buildBoard() {
    glitchBoard.innerHTML = '';
    board = [];
    for (let r = 0; r < ROWS; r++) {
      const row = [];
      for (let c = 0; c < COLS; c++) {
        const cell = {
          r, c,
          type: 'block', // 'block' or 'path'
          tower: null,
          trap: null,
          element: null
        };
        const cellDiv = document.createElement('div');
        cellDiv.className = 'cell block';
        cellDiv.dataset.r = r;
        cellDiv.dataset.c = c;
        cell.element = cellDiv;
        // Click handler
        cellDiv.addEventListener('click', () => handleCellClick(cell));
        glitchBoard.appendChild(cellDiv);
        row.push(cell);
      }
      board.push(row);
    }
    // initial path starting cell
    pathCells = [];
    const startCell = board[0][0];
    startCell.type = 'path';
    startCell.element.classList.remove('block');
    startCell.element.classList.add('path');
    pathCells.push(startCell);
    highlightNextCells();
  }
  function handleCellClick(cell) {
    if (gameState === 'build') {
      // If highlighted and no selected item: dig path
      if (cell.element.classList.contains('highlight')) {
        digPath(cell);
        return;
      }
      // place tower/trap
      if (!selectedItem) return;
      if (selectedItem.type === 'tower') {
        // must be block type and no tower
        if (cell.type === 'block' && !cell.tower) {
          const def = towerDefs.find(t => t.id === selectedItem.id);
          if (money < def.cost) return;
          money -= def.cost;
          updateHUD();
          // create tower object
          const tower = {
            id: def.id,
            r: cell.r,
            c: cell.c,
            range: def.range,
            rate: def.rate,
            damage: def.damage,
            slow: def.slow || 0,
            burn: def.burn || 0,
            chain: def.chain || 0,
            aoe: def.aoe || false,
            poison: def.poison || 0,
            pulse: def.pulse || false,
            canTargetStealth: def.canTargetStealth === undefined ? true : def.canTargetStealth,
            nextShot: performance.now()
          };
          towers.push(tower);
          cell.tower = tower;
          // visual
          const towerEl = document.createElement('div');
          towerEl.className = 'tower tower-' + def.id;
          towerEl.textContent = def.name.charAt(0);
          cell.element.appendChild(towerEl);
        }
      } else if (selectedItem.type === 'trap') {
        // must be path type and no trap and not start cell or base cell
        const isStart = (cell.r === pathCells[0].r && cell.c === pathCells[0].c);
        const isBase  = (cell.r === ROWS-1 && cell.c === COLS-1);
        if (cell.type === 'path' && !cell.trap && !isStart && !isBase) {
          const def = trapDefs.find(t => t.id === selectedItem.id);
          if (money < def.cost) return;
          money -= def.cost;
          updateHUD();
          const trap = {
            id: def.id,
            r: cell.r,
            c: cell.c,
            damage: def.damage || 0,
            slow: def.slow || 0,
            single: def.single || false,
            aoe: def.aoe || false
          };
          traps.push(trap);
          cell.trap = trap;
          const trapEl = document.createElement('div');
          trapEl.className = 'trap trap-' + def.id;
          trapEl.textContent = def.id === 'spike' ? 'S' : 'B';
          cell.element.appendChild(trapEl);
        }
      }
    }
  }
  function digPath(cell) {
    cell.type = 'path';
    cell.element.classList.remove('block', 'highlight');
    cell.element.classList.add('path');
    pathCells.push(cell);
    // highlight next cells
    highlightNextCells();
  }
  function highlightNextCells() {
    // remove old highlights
    board.flat().forEach((cell) => cell.element.classList.remove('highlight'));
    const last = pathCells[pathCells.length - 1];
    const directions = [ {dr:-1,dc:0}, {dr:1,dc:0}, {dr:0,dc:-1}, {dr:0,dc:1} ];
    directions.forEach(({dr, dc}) => {
      const nr = last.r + dr;
      const nc = last.c + dc;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
        const ncell = board[nr][nc];
        if (ncell.type === 'block' && !adjacentPathOtherThan(ncell, last)) {
          ncell.element.classList.add('highlight');
        }
      }
    });
  }
  function adjacentPathOtherThan(cell, except) {
    // Return true if the cell is adjacent to any path cell other than except cell
    const dirs = [ {dr:-1,dc:0}, {dr:1,dc:0}, {dr:0,dc:-1}, {dr:0,dc:1} ];
    for (const {dr,dc} of dirs) {
      const nr = cell.r + dr;
      const nc = cell.c + dc;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
      const neighbor = board[nr][nc];
      if (neighbor.type === 'path' && neighbor !== except) {
        return true;
      }
    }
    return false;
  }
  function updateHUD() {
    ggWaveEl.textContent = wave;
    ggMoneyEl.textContent = money;
    ggLivesEl.textContent = lives;
  }

  function resetGlitch() {
    // stop any running loops
    if (spawnInterval) clearInterval(spawnInterval);
    if (animFrame) cancelAnimationFrame(animFrame);
    // reset state
    towers = [];
    traps  = [];
    enemies= [];
    wave   = 1;
    money  = 100;
    lives  = 10;
    gameState = 'build';
    ggMessage.classList.add('hidden');
    ggMessage.textContent = '';
    buildBoard();
    updateHUD();
  }
  function startWave() {
    if (gameState !== 'build') return;
    // ensure path reaches base
    const baseCell = board[ROWS-1][COLS-1];
    if (!baseCell || baseCell.type !== 'path') {
      alert('Dig a path to the base before starting!');
      return;
    }
    gameState = 'wave';
    // remove highlights
    board.flat().forEach(cell => cell.element.classList.remove('highlight'));
    // spawn enemies
    let spawnCount = Math.min(5 + wave * 2, 40);
    let spawned = 0;
    spawnInterval = setInterval(() => {
      if (spawned >= spawnCount) {
        clearInterval(spawnInterval);
        spawnInterval = null;
        return;
      }
      const enemyInfo = getEnemyForWave(wave, spawned);
      spawnEnemy(enemyInfo);
      spawned++;
    }, 800);
    // start animation loop
    if (!animFrame) animFrame = requestAnimationFrame(updateGlitch);
  }
  function getEnemyForWave(wave, index) {
    // boss waves every 10
    if (wave % 10 === 0 && index === 0) {
      return { type:'boss', hp: enemyDefs.boss.hp + wave * 10, speed: enemyDefs.boss.speed, reward: enemyDefs.boss.reward + wave * 2 };
    }
    // Introduce advanced enemy types as waves progress
    if (wave >= 40) {
      const pool = ['fast','tank','fly','shielded','regenerator','splitter','stealth','normal'];
      const t = pool[Math.floor(Math.random()*pool.length)];
      const base = enemyDefs[t];
      return { type:t, hp: base.hp + wave * 2, speed: base.speed, reward: base.reward + Math.floor(wave/2) };
    }
    if (wave >= 30) {
      const pool = ['fast','tank','fly','shielded','regenerator','splitter','normal'];
      const t = pool[Math.floor(Math.random()*pool.length)];
      const base = enemyDefs[t];
      return { type:t, hp: base.hp + wave * 1.8, speed: base.speed, reward: base.reward + Math.floor(wave/3) };
    }
    if (wave >= 20) {
      const pool = ['fast','tank','fly','normal'];
      const t = pool[Math.floor(Math.random()*pool.length)];
      const base = enemyDefs[t];
      return { type:t, hp: base.hp + wave * 1.5, speed: base.speed, reward: base.reward };
    }
    if (wave >= 10) {
      const pool = ['fast','tank','normal'];
      const t = pool[Math.floor(Math.random()*pool.length)];
      const base = enemyDefs[t];
      return { type:t, hp: base.hp + wave, speed: base.speed, reward: base.reward };
    }
    // early waves
    const base = enemyDefs.normal;
    return { type:'normal', hp: base.hp + wave, speed: base.speed, reward: base.reward };
  }
  function spawnEnemy(info) {
    const start = pathCells[0];
    const elem = document.createElement('div');
    elem.className = 'enemy ' + enemyDefs[info.type].class;
    elem.textContent = info.type.charAt(0).toUpperCase();
    start.element.appendChild(elem);
    const base = enemyDefs[info.type] || {};
    const enemy = {
      type: info.type,
      hp: info.hp,
      maxHp: info.hp,
      speed: info.speed,
      reward: info.reward,
      pathIndex: 0,
      progress: 0,
      el: elem,
      slowTimer: 0,
      burnTimer: 0,
      poisonTimer: 0,
      shield: base.shield || 0,
      regen: base.regen || 0,
      splitter: base.splitter || false,
      stealth: base.stealth || false,
      child: base.child || false,
      x: 0,
      y: 0
    };
    enemies.push(enemy);
  }
  function updateGlitch(timestamp) {
    // move enemies
    enemies.forEach((enemy) => {
      // apply status timers
      let moveSpeed = enemy.speed;
      // slow effect from towers/traps
      if (enemy.slowTimer > 0) moveSpeed *= 0.5;
      enemy.slowTimer = Math.max(0, enemy.slowTimer - 16);
      // burn effect (fire)
      enemy.burnTimer = Math.max(0, enemy.burnTimer - 16);
      if (enemy.burnTimer > 0) {
        enemy.hp -= 0.03 * enemy.speed;
      }
      // poison effect
      enemy.poisonTimer = Math.max(0, enemy.poisonTimer - 16);
      if (enemy.poisonTimer > 0) {
        enemy.hp -= 0.02 * enemy.speed;
      }
      // regeneration (heal up to max)
      if (enemy.regen) {
        enemy.hp = Math.min(enemy.maxHp, enemy.hp + enemy.regen);
      }
      if (enemy.hp <= 0) return;
      const currentCell = pathCells[enemy.pathIndex];
      const nextCell   = pathCells[enemy.pathIndex + 1];
      if (!nextCell) {
        // reached base
        enemy.hp = 0;
        lives--;
        updateHUD();
        enemy.el.remove();
        return;
      }
      // compute position
      const from = currentCell;
      const to   = nextCell;
      // pixel positions of cells relative to board
      const boardRect = glitchBoard.getBoundingClientRect();
      const fromRect = from.element.getBoundingClientRect();
      const toRect   = to.element.getBoundingClientRect();
      const fx = fromRect.left - boardRect.left + fromRect.width/2;
      const fy = fromRect.top  - boardRect.top  + fromRect.height/2;
      const tx = toRect.left   - boardRect.left + toRect.width/2;
      const ty = toRect.top    - boardRect.top  + toRect.height/2;
      // update progress
      enemy.progress += moveSpeed * 0.04;
      if (enemy.progress >= 1) {
        enemy.pathIndex++;
        enemy.progress = 0;
      }
      const px = fx + (tx - fx) * enemy.progress;
      const py = fy + (ty - fy) * enemy.progress;
      enemy.el.style.transform = `translate(-50%, -50%) translate(${px}px, ${py}px)`;
    });
    // remove dead enemies and grant rewards
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (e.hp <= 0) {
        // reward only if killed before reaching base
        if (e.pathIndex < pathCells.length - 1) money += e.reward;
        // splitting behaviour
        if (e.splitter && !e.child) {
          // spawn two split children
          spawnChildEnemy(e);
          spawnChildEnemy(e);
        }
        e.el.remove();
        enemies.splice(i, 1);
        updateHUD();
      }
    }
    // towers attack
    towers.forEach((tower) => {
      if (!tower) return;
      if (timestamp < tower.nextShot) return;
      const cell = board[tower.r][tower.c];
      // Determine enemies within range and that can be targeted (skip stealth if tower can't target stealth)
      let candidates = enemies.filter((e) => {
        if (e.hp <= 0) return false;
        if (e.stealth && !tower.canTargetStealth) return false;
        const enemyCell = pathCells[e.pathIndex];
        const dist = Math.abs(enemyCell.r - tower.r) + Math.abs(enemyCell.c - tower.c);
        return dist <= tower.range;
      });
      if (candidates.length === 0) return;
      // If pulse tower, affect all candidates at once
      if (tower.pulse) {
        candidates.forEach((target) => {
          target.hp -= tower.damage;
          if (tower.slow) target.slowTimer = 1000;
          if (tower.burn) target.burnTimer = 1000;
          if (tower.poison) target.poisonTimer = 1000;
        });
        // Visual effect: central shockwave bullet
        const bullet = document.createElement('div');
        bullet.className = 'bullet bullet-' + tower.id;
        glitchBoard.appendChild(bullet);
        const boardRect = glitchBoard.getBoundingClientRect();
        const startRect = cell.element.getBoundingClientRect();
        const sx = startRect.left - boardRect.left + startRect.width/2;
        const sy = startRect.top  - boardRect.top  + startRect.height/2;
        bullet.style.left = sx + 'px';
        bullet.style.top  = sy + 'px';
        bullet.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
        bullet.style.width = '0px';
        bullet.style.height = '0px';
        bullet.style.borderRadius = '50%';
        bullet.style.opacity = '0.8';
        requestAnimationFrame(() => {
          bullet.style.transform = 'scale(8)';
          bullet.style.opacity = '0';
        });
        setTimeout(() => bullet.remove(), 500);
        tower.nextShot = timestamp + tower.rate;
        return;
      }
      // Normal towers: choose primary target then optionally chain/aoe
      // Sort candidates by path progress (farthest along path first)
      candidates.sort((a,b) => b.pathIndex - a.pathIndex);
      const targets = [candidates[0]];
      // chain to additional targets if chain property
      if (tower.chain) {
        for (let i=1; i<=tower.chain && i<candidates.length; i++) targets.push(candidates[i]);
      }
      targets.forEach((target) => {
        applyDamage(target, tower.damage);
        if (tower.slow) target.slowTimer = 1000;
        if (tower.burn) target.burnTimer = 1000;
        if (tower.poison) target.poisonTimer = 1000;
        // Area of effect for missile and mine towers
        if (tower.aoe) {
          // damage enemies in Manhattan distance <=1 from target
          const tCell = pathCells[target.pathIndex];
          enemies.forEach((e2) => {
            if (e2 === target || e2.hp <= 0) return;
            const c2 = pathCells[e2.pathIndex];
            const dist = Math.abs(c2.r - tCell.r) + Math.abs(c2.c - tCell.c);
            if (dist <= 1) applyDamage(e2, tower.damage);
          });
        }
        // Visual bullet animation
        const bullet = document.createElement('div');
        bullet.className = 'bullet bullet-' + tower.id;
        glitchBoard.appendChild(bullet);
        const boardRect = glitchBoard.getBoundingClientRect();
        const startRect = cell.element.getBoundingClientRect();
        const endRect   = pathCells[target.pathIndex].element.getBoundingClientRect();
        const sx = startRect.left - boardRect.left + startRect.width/2;
        const sy = startRect.top  - boardRect.top  + startRect.height/2;
        const ex = endRect.left   - boardRect.left + endRect.width/2;
        const ey = endRect.top    - boardRect.top  + endRect.height/2;
        bullet.style.left = sx + 'px';
        bullet.style.top  = sy + 'px';
        bullet.style.transition = 'transform 0.35s linear';
        requestAnimationFrame(() => {
          bullet.style.transform = `translate(${ex - sx}px, ${ey - sy}px)`;
        });
        setTimeout(() => bullet.remove(), 400);
      });
      tower.nextShot = timestamp + tower.rate;
    });
    // traps
    traps.forEach((trap, idx) => {
      enemies.forEach((enemy) => {
        if (enemy.hp <= 0) return;
        const enemyCell = pathCells[enemy.pathIndex];
        if (enemyCell.r === trap.r && enemyCell.c === trap.c) {
          // Tar trap slows enemies
          if (trap.slow) {
            enemy.slowTimer = 1000;
          }
          // Damage traps
          if (trap.damage) {
            if (trap.aoe) {
              enemies.forEach((e2) => {
                const cell2 = pathCells[e2.pathIndex];
                const dist = Math.abs(cell2.r - trap.r) + Math.abs(cell2.c - trap.c);
                if (dist <= 1) e2.hp -= trap.damage;
              });
            } else {
            applyDamage(enemy, trap.damage);
            }
          }
          // Remove trap if single use
          if (trap.single) {
            const cell = board[trap.r][trap.c];
            cell.trap = null;
            const trapEl = cell.element.querySelector('.trap');
            if (trapEl) trapEl.remove();
            traps.splice(idx, 1);
          }
        }
      });
    });
    // check end of wave
    if (gameState === 'wave' && spawnInterval === null && enemies.length === 0) {
      gameState = 'build';
      wave++;
      money += 10;
      updateHUD();
      highlightNextCells();
      // show wave cleared message
      ggMessage.textContent = `Wave ${wave-1} cleared! Build or upgrade your defenses.`;
      ggMessage.classList.remove('hidden');
      setTimeout(() => ggMessage.classList.add('hidden'), 4000);
    }
    // game over check
    if (lives <= 0 && gameState !== 'over') {
      gameState = 'over';
      alert('Game over! Refresh the page to play again.');
    }
    // continue animation
    animFrame = requestAnimationFrame(updateGlitch);
  }
  // Event listeners for controls
  if (ggResetBtn) ggResetBtn.addEventListener('click', resetGlitch);
  if (ggStartWaveBtn) ggStartWaveBtn.addEventListener('click', startWave);
  // Initialise
  buildToolbar();
  buildBoard();
  updateHUD();
  // Reset when page loads to ensure fairness
  resetGlitch();
}

// Ensure Home section active on load
showSection('home');