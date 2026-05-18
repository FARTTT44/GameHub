/* =====================================================
   POCKET ARCADE — script.js
   Everything is split into sections by feature so it's easy to scan:
     1. NAV + THEME
     2. REACTION CLICK
     3. RUNE GAMBIT
     4. GALLERY SLIDER
     5. FEEDBACK FORM
     6. UTILITIES
     7. NEON LABYRINTH
     8. GLITCH GARDEN
===================================================== */

"use strict";

/* =====================================================
   1. NAVIGATION + THEME
===================================================== */

// grab the nav buttons and section panels
const navBtns  = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".section");

// theme + home cta
const themeToggle = document.getElementById("themeToggleBtn");
const playNowBtn  = document.getElementById("playNowBtn");

// flip between sections
function showSection(targetId) {
  sections.forEach((sec) => sec.classList.toggle("active", sec.id === targetId));
  navBtns.forEach((btn) => btn.classList.toggle("active", btn.dataset.target === targetId));
  window.scrollTo({ top: 0, behavior: "smooth" });

  // gallery slider needs a kick when shown
  if (targetId === "gallery") renderSlide();

  // rune game gets a fresh start whenever you visit
  if (targetId === "rune") initRuneGame();
}

navBtns.forEach((btn) => btn.addEventListener("click", () => showSection(btn.dataset.target)));
if (playNowBtn) playNowBtn.addEventListener("click", () => showSection("reaction"));

// also wire the home CTAs that use data-target
document.querySelectorAll('[data-target]').forEach((el) => {
  if (el.classList.contains('nav-btn')) return; // already handled
  el.addEventListener('click', () => showSection(el.dataset.target));
});

/* theme toggle — flips dark <-> light */
let isDarkTheme = true;
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle("theme-dark",  isDarkTheme);
    document.body.classList.toggle("theme-light", !isDarkTheme);

    // little label flash so you know what changed
    const original = themeToggle.textContent;
    themeToggle.textContent = isDarkTheme ? "Light Mode" : "Dark Mode";
    clearTimeout(themeToggle._reset);
    themeToggle._reset = setTimeout(() => { themeToggle.textContent = original; }, 1500);
  });
}


/* =====================================================
   2. REACTION CLICK
===================================================== */

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

let reactionScore = 0;
let reactionTime = 20;
let reactionTimerID = null;
let reactionRunning = false;
let reactionPlayerName = "";

// move the pink dot somewhere new
function rcMoveTarget() {
  const areaRect = reactionArea.getBoundingClientRect();
  const tSize = 50, padding = 8;
  const maxX = areaRect.width  - tSize - padding;
  const maxY = areaRect.height - tSize - padding;
  reactionTarget.style.left = (Math.floor(Math.random() * maxX) + padding) + "px";
  reactionTarget.style.top  = (Math.floor(Math.random() * maxY) + padding) + "px";
}

// countdown timer
function rcStartTimer() {
  reactionTimerID = setInterval(() => {
    reactionTime--;
    reactionTimerEl.textContent = reactionTime;
    if (reactionTime <= 5) reactionTimerEl.classList.add("timer-val"); // turns red when low
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
if (reactionStart)   reactionStart.addEventListener("click", rcInitGame);
if (reactionRestart) reactionRestart.addEventListener("click", rcResetGame);
if (reactionPlayer) {
  reactionPlayer.addEventListener("keydown", (e) => { if (e.key === "Enter") rcInitGame(); });
}


/* =====================================================
   3. RUNE GAMBIT — dice-style battler
===================================================== */

const runeRoundEl    = document.getElementById("runeRound");
const runeHpEl       = document.getElementById("runeHp");
const runeGoldEl     = document.getElementById("runeGold");
const runeEnemyNameEl= document.getElementById("runeEnemyName");
const runeEnemyHpEl  = document.getElementById("runeEnemyHp");
const runeRunesEl    = document.getElementById("runeRunes");
const runeRollBtn    = document.getElementById("runeRollBtn");
const runeFightBtn   = document.getElementById("runeFightBtn");
const runeMessageEl  = document.getElementById("runeMessage");
const runeUpgradesEl = document.getElementById("runeUpgrades");
const runeUpgradeOptionsEl = runeUpgradesEl ? runeUpgradesEl.querySelector(".upgrade-options") : null;

let runePlayer, runeEnemy, runeRunes, runeLocked, runeRollsLeft, runeGameState;

function initRuneGame() {
  runePlayer = { hp: 30, gold: 0, round: 1, rerolls: 3, attackMult: 1, defenceMult: 1 };
  startRuneRound();
}

function startRuneRound() {
  runeRollsLeft = runePlayer.rerolls;
  runeLocked = [false, false, false, false, false];

  // enemies scale with round
  const enemyNames = ["Slime","Goblin","Imp","Skeleton","Orc","Mage","Troll","Golem","Dragon"];
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
  runeGameState = "rolling";
  if (runeUpgradesEl) runeUpgradesEl.classList.add("hidden");
  if (runeFightBtn) runeFightBtn.disabled = true;
  if (runeRollBtn) runeRollBtn.disabled = false;
}

function generateRuneRunes() {
  runeRunes = [];
  const types = ["ATK","DEF","ARC","HP","G$"];
  for (let i = 0; i < 5; i++) {
    runeRunes.push({
      type: types[Math.floor(Math.random() * types.length)],
      value: 1 + Math.floor(Math.random() * 6)
    });
  }
}

function renderRuneRunes() {
  if (!runeRunesEl) return;
  runeRunesEl.innerHTML = "";
  runeRunes.forEach((rune, i) => {
    const card = document.createElement("div");
    const typeLower = rune.type.toLowerCase().replace("$", "\\$");
    card.className = `rune-card rune-${typeLower}` + (runeLocked[i] ? " locked" : "");
    card.innerHTML = `<span class="rune-type">${rune.type}</span><span class="rune-val">${rune.value}</span>`;
    card.addEventListener("click", () => toggleRuneLock(i));
    runeRunesEl.appendChild(card);
  });
}

function toggleRuneLock(i) {
  if (runeGameState !== "rolling") return;
  runeLocked[i] = !runeLocked[i];
  renderRuneRunes();
}

function rollRuneRunes() {
  if (runeGameState !== "rolling") return;
  if (runeRollsLeft <= 0) return;
  const types = ["ATK","DEF","ARC","HP","G$"];
  runeRunes.forEach((rune, i) => {
    if (!runeLocked[i]) {
      rune.type = types[Math.floor(Math.random() * types.length)];
      rune.value = 1 + Math.floor(Math.random() * 6);
    }
  });
  runeRollsLeft--;
  renderRuneRunes();
  if (runeMessageEl) {
    runeMessageEl.textContent = runeRollsLeft <= 0
      ? "No rerolls left; press Fight"
      : `${runeRollsLeft} reroll${runeRollsLeft > 1 ? "s" : ""} left`;
  }
  if (runeFightBtn) runeFightBtn.disabled = false;
}

function fightRuneEnemy() {
  if (runeGameState !== "rolling" && runeGameState !== "defending") return;

  // tally up rune effects
  let atk = 0, def = 0, arc = 0, hpGain = 0, goldGain = 0;
  runeRunes.forEach((rune) => {
    switch (rune.type) {
      case "ATK": atk += rune.value; break;
      case "DEF": def += rune.value; break;
      case "ARC": arc += rune.value; break;
      case "HP":  hpGain += rune.value; break;
      case "G$":  goldGain += rune.value; break;
    }
  });
  atk = Math.floor(atk * (1 + arc * 0.2) * runePlayer.attackMult); // arcane boosts attack
  def = Math.floor(def * runePlayer.defenceMult);
  runePlayer.hp += hpGain;
  runePlayer.gold += goldGain;

  let battleLog = "";
  runeEnemy.hp -= atk;
  battleLog += `You deal ${atk} damage.`;

  if (runeEnemy.hp > 0) {
    // enemy hits back
    let dmg = Math.max(0, runeEnemy.atk - def);
    runePlayer.hp -= dmg;
    battleLog += ` The ${runeEnemy.name} survives and hits you for ${dmg}.`;
    runeGameState = "defending";
    renderRuneRunes();
  } else {
    battleLog += ` You slay the ${runeEnemy.name}!`;
    runePlayer.round++;
    runeGameState = "upgrading";
  }

  updateRuneHud();
  if (runeMessageEl) runeMessageEl.textContent = battleLog;

  if (runePlayer.hp <= 0) {
    if (runeMessageEl) runeMessageEl.textContent = "You have fallen! Game over.";
    runeGameState = "over";
    if (runeRollBtn) runeRollBtn.disabled = true;
    if (runeFightBtn) runeFightBtn.disabled = true;
    return;
  }
  if (runeGameState === "defending") {
    if (runeRollBtn) runeRollBtn.disabled = true;
    if (runeFightBtn) runeFightBtn.disabled = false;
    return;
  }
  if (runeGameState === "upgrading") showRuneUpgrades();
}

function showRuneUpgrades() {
  if (!runeUpgradesEl || !runeUpgradeOptionsEl) { startRuneRound(); return; }
  runeUpgradesEl.classList.remove("hidden");
  runeUpgradeOptionsEl.innerHTML = "";

  const options = [
    { id:"hp",     text:"Increase HP by 10 (cost 10 G$)",                cost: 10, apply: () => { runePlayer.hp += 10; } },
    { id:"atk",    text:"Increase attack multiplier by 0.2 (cost 15 G$)", cost: 15, apply: () => { runePlayer.attackMult += 0.2; } },
    { id:"def",    text:"Increase defence multiplier by 0.2 (cost 15 G$)",cost: 15, apply: () => { runePlayer.defenceMult += 0.2; } },
    { id:"reroll", text:"Gain +1 reroll next round (cost 5 G$)",          cost: 5,  apply: () => { runePlayer.rerolls += 1; } }
  ];
  options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline btn-full";
    btn.textContent = opt.text;
    btn.addEventListener("click", () => {
      if (runePlayer.gold < opt.cost) {
        if (runeMessageEl) runeMessageEl.textContent = "Not enough gold for this upgrade.";
        return;
      }
      runePlayer.gold -= opt.cost;
      opt.apply();
      runeUpgradesEl.classList.add("hidden");
      startRuneRound();
    });
    runeUpgradeOptionsEl.appendChild(btn);
  });
  if (runeMessageEl) runeMessageEl.textContent = "Choose one upgrade:";
}

function updateRuneHud() {
  if (runeRoundEl)     runeRoundEl.textContent = runePlayer.round;
  if (runeHpEl)        runeHpEl.textContent = runePlayer.hp;
  if (runeGoldEl)      runeGoldEl.textContent = runePlayer.gold;
  if (runeEnemyNameEl) runeEnemyNameEl.textContent = runeEnemy.name;
  if (runeEnemyHpEl)   runeEnemyHpEl.textContent = runeEnemy.hp > 0 ? runeEnemy.hp : 0;
  if (runeRollBtn)     runeRollBtn.disabled = false;
}

if (runeRollBtn)  runeRollBtn.addEventListener("click", rollRuneRunes);
if (runeFightBtn) runeFightBtn.addEventListener("click", fightRuneEnemy);


/* =====================================================
   4. GALLERY SLIDER
===================================================== */

const sliderImg     = document.getElementById("sliderImg");
const sliderCaption = document.getElementById("sliderCaption");
const sliderCount   = document.getElementById("sliderCount");
const prevBtn       = document.getElementById("prevBtn");
const nextBtn       = document.getElementById("nextBtn");
const dotsContainer = document.getElementById("sliderDots");

let currentSlide = 0;
const slides = [
  { src: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=900&q=80", caption: "Classic Arcade Vibes" },
  { src: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=900&q=80", caption: "Retro Gaming Paradise" },
  { src: "https://images.unsplash.com/photo-1614294149010-950b698f72c0?w=900&q=80", caption: "Neon Nights & High Scores" },
  { src: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=900&q=80", caption: "Game On, Player One" }
];

function buildDots() {
  if (!dotsContainer) return;
  dotsContainer.innerHTML = "";
  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "dot" + (i === currentSlide ? " active" : "");
    dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
    dot.addEventListener("click", () => { currentSlide = i; renderSlide(); });
    dotsContainer.appendChild(dot);
  });
}

function renderSlide() {
  const slide = slides[currentSlide];
  if (!slide || !sliderImg) return;
  sliderImg.style.opacity = 0;
  setTimeout(() => {
    sliderImg.src = slide.src;
    sliderImg.alt = slide.caption;
    if (sliderCaption) sliderCaption.textContent = slide.caption;
    if (sliderCount)   sliderCount.textContent = `${currentSlide + 1} / ${slides.length}`;
    sliderImg.style.opacity = 1;
  }, 200);
  buildDots();
}

if (prevBtn) prevBtn.addEventListener("click", () => { currentSlide = (currentSlide - 1 + slides.length) % slides.length; renderSlide(); });
if (nextBtn) nextBtn.addEventListener("click", () => { currentSlide = (currentSlide + 1) % slides.length; renderSlide(); });

// auto-advance every 5s
setInterval(() => { currentSlide = (currentSlide + 1) % slides.length; renderSlide(); }, 5000);
renderSlide();


/* =====================================================
   5. FEEDBACK FORM
===================================================== */

const feedbackForm   = document.getElementById("feedbackForm");
const feedbackThanks = document.getElementById("feedbackThanks");
const fbName    = document.getElementById("fbName");
const fbGame    = document.getElementById("fbGame");
const fbMessage = document.getElementById("fbMessage");

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
      `${message ? `We'll keep your thoughts in mind: "<em>${escapeHTML(message.slice(0, 150))}${message.length > 150 ? "…" : ""}</em>"` : ""}` +
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


/* =====================================================
   6. UTILITIES
===================================================== */

// keep user-typed text from breaking the html
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}


/* =====================================================
   7. NEON LABYRINTH
   Recursive-backtracking maze + a hunter that actually
   chases you with BFS pathfinding through the corridors.
===================================================== */

const labyrinthCanvas = document.getElementById("labyrinthCanvas");
const labCtx          = labyrinthCanvas ? labyrinthCanvas.getContext("2d") : null;
const labyrinthStart  = document.getElementById("labyrinthStart");

if (labCtx) {
  // grid size
  const LAB_ROWS = 10;
  const LAB_COLS = 10;
  const cellSize = labyrinthCanvas.width / LAB_COLS;

  // colours used directly so they always look right in either theme
  const WALL_COLOR    = "#00d4a6"; // mint = walls (glows nicely)
  const PLAYER_COLOR  = "#00d4a6"; // mint = you
  const EXIT_COLOR    = "#eb1f5b"; // pink = exit
  const KEY_COLOR     = "#fbbf24"; // gold = keys to collect
  const TRAP_COLOR    = "#ef4444"; // red  = traps, ouch
  const HUNTER_COLOR  = "#9155d4"; // purple = chasing AI

  let maze = [];
  let playerPos = { r: 0, c: 0 };
  let exitPos   = { r: LAB_ROWS - 1, c: LAB_COLS - 1 };

  // dynamic entities — refreshed each room
  let labHunters = [];
  let labTraps   = [];
  let labKeys    = [];

  // persistent across rooms
  let labLevel = 1;
  let labLives = 3;
  let labKeysRequired = 1;
  let labKeysCollected = 0;
  let labRunning = false;

  // separate timer so hunters move on their own (not just when you do)
  let hunterTickID = null;

  /* ── maze build (recursive backtracker) ── */

  function createMazeGrid() {
    maze = [];
    for (let r = 0; r < LAB_ROWS; r++) {
      const row = [];
      for (let c = 0; c < LAB_COLS; c++) {
        row.push({ r, c, walls: { top:true, right:true, bottom:true, left:true }, visited:false });
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
      { dr: -1, dc:  0, wall: "top",    opp: "bottom" },
      { dr:  1, dc:  0, wall: "bottom", opp: "top" },
      { dr:  0, dc: -1, wall: "left",   opp: "right" },
      { dr:  0, dc:  1, wall: "right",  opp: "left" }
    ]);
    dirs.forEach(({ dr, dc, wall, opp }) => {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= LAB_ROWS || nc < 0 || nc >= LAB_COLS) return;
      const neighbor = maze[nr][nc];
      if (!neighbor.visited) {
        cell.walls[wall] = false;
        neighbor.walls[opp] = false;
        generateMaze(nr, nc);
      }
    });
  }

  /* ── drawing — fixed order so walls actually show! ── */
  function drawMaze() {
    // 1. paint background first (was the bug before — walls got covered)
    labCtx.fillStyle = "#0c0e23";
    if (document.body.classList.contains("theme-light")) labCtx.fillStyle = "#e9edff";
    labCtx.fillRect(0, 0, labyrinthCanvas.width, labyrinthCanvas.height);

    // 2. exit tile
    labCtx.fillStyle = EXIT_COLOR;
    labCtx.fillRect(exitPos.c * cellSize + 6, exitPos.r * cellSize + 6, cellSize - 12, cellSize - 12);

    // 3. keys (yellow stars-ish)
    labCtx.fillStyle = KEY_COLOR;
    labKeys.forEach(({ r, c }) => {
      const cx = c * cellSize + cellSize / 2;
      const cy = r * cellSize + cellSize / 2;
      const size = cellSize * 0.22;
      // simple 5-point starlike shape
      labCtx.beginPath();
      for (let i = 0; i < 10; i++) {
        const ang = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const rad = (i % 2 === 0) ? size : size * 0.5;
        const x = cx + Math.cos(ang) * rad;
        const y = cy + Math.sin(ang) * rad;
        if (i === 0) labCtx.moveTo(x, y); else labCtx.lineTo(x, y);
      }
      labCtx.closePath();
      labCtx.fill();
    });

    // 4. traps (red triangles)
    labCtx.fillStyle = TRAP_COLOR;
    labTraps.forEach(({ r, c }) => {
      const cx = c * cellSize + cellSize / 2;
      const cy = r * cellSize + cellSize / 2;
      const s = cellSize * 0.28;
      labCtx.beginPath();
      labCtx.moveTo(cx, cy - s);
      labCtx.lineTo(cx + s, cy + s);
      labCtx.lineTo(cx - s, cy + s);
      labCtx.closePath();
      labCtx.fill();
    });

    // 5. hunters (purple squares)
    labCtx.fillStyle = HUNTER_COLOR;
    labHunters.forEach((h) => {
      labCtx.shadowColor = HUNTER_COLOR;
      labCtx.shadowBlur = 8;
      labCtx.fillRect(h.c * cellSize + cellSize * 0.22, h.r * cellSize + cellSize * 0.22, cellSize * 0.56, cellSize * 0.56);
    });
    labCtx.shadowBlur = 0;

    // 6. player (mint circle, glowing)
    labCtx.fillStyle = PLAYER_COLOR;
    labCtx.shadowColor = PLAYER_COLOR;
    labCtx.shadowBlur = 10;
    labCtx.beginPath();
    labCtx.arc(playerPos.c * cellSize + cellSize / 2, playerPos.r * cellSize + cellSize / 2, cellSize * 0.27, 0, Math.PI * 2);
    labCtx.fill();
    labCtx.shadowBlur = 0;

    // 7. walls LAST so they're always visible on top
    labCtx.strokeStyle = WALL_COLOR;
    labCtx.lineWidth = 3;
    labCtx.lineCap = "square";
    labCtx.shadowColor = WALL_COLOR;
    labCtx.shadowBlur = 4;
    for (let r = 0; r < LAB_ROWS; r++) {
      for (let c = 0; c < LAB_COLS; c++) {
        const cell = maze[r][c];
        const x = c * cellSize, y = r * cellSize;
        labCtx.beginPath();
        if (cell.walls.top)    { labCtx.moveTo(x, y);              labCtx.lineTo(x + cellSize, y); }
        if (cell.walls.right)  { labCtx.moveTo(x + cellSize, y);   labCtx.lineTo(x + cellSize, y + cellSize); }
        if (cell.walls.bottom) { labCtx.moveTo(x, y + cellSize);   labCtx.lineTo(x + cellSize, y + cellSize); }
        if (cell.walls.left)   { labCtx.moveTo(x, y);              labCtx.lineTo(x, y + cellSize); }
        labCtx.stroke();
      }
    }
    labCtx.shadowBlur = 0;
  }

  /* ── helpers: BFS over the maze (respects walls) ── */

  // returns neighbors a player/hunter can actually walk into (no wall in between)
  function openNeighbors(r, c) {
    const cell = maze[r][c];
    const out = [];
    if (!cell.walls.top    && r > 0)              out.push({ r: r - 1, c });
    if (!cell.walls.bottom && r < LAB_ROWS - 1)   out.push({ r: r + 1, c });
    if (!cell.walls.left   && c > 0)              out.push({ r, c: c - 1 });
    if (!cell.walls.right  && c < LAB_COLS - 1)   out.push({ r, c: c + 1 });
    return out;
  }

  function findFarthestCell(start) {
    const queue = [{ r: start.r, c: start.c, d: 0 }];
    const visited = Array.from({ length: LAB_ROWS }, () => Array(LAB_COLS).fill(false));
    visited[start.r][start.c] = true;
    let farthest = { r: start.r, c: start.c, d: 0 };
    while (queue.length) {
      const { r, c, d } = queue.shift();
      if (d > farthest.d) farthest = { r, c, d };
      openNeighbors(r, c).forEach(({ r: nr, c: nc }) => {
        if (!visited[nr][nc]) { visited[nr][nc] = true; queue.push({ r: nr, c: nc, d: d + 1 }); }
      });
    }
    return farthest;
  }

  function getReachableCells() {
    const start = { r: playerPos.r, c: playerPos.c };
    const queue = [start];
    const visited = Array.from({ length: LAB_ROWS }, () => Array(LAB_COLS).fill(false));
    visited[start.r][start.c] = true;
    const reachable = [start];
    while (queue.length) {
      const { r, c } = queue.shift();
      openNeighbors(r, c).forEach(({ r: nr, c: nc }) => {
        if (!visited[nr][nc]) { visited[nr][nc] = true; queue.push({ r: nr, c: nc }); reachable.push({ r: nr, c: nc }); }
      });
    }
    return reachable;
  }

  // BFS-based "next step toward target" — this is the real chase AI
  function nextStepToward(from, target) {
    if (from.r === target.r && from.c === target.c) return null;
    const queue = [{ r: from.r, c: from.c }];
    const visited = Array.from({ length: LAB_ROWS }, () => Array(LAB_COLS).fill(false));
    visited[from.r][from.c] = true;
    const parent = {}; // key "r,c" -> previous "r,c"
    while (queue.length) {
      const cur = queue.shift();
      if (cur.r === target.r && cur.c === target.c) {
        // walk back to the step just after `from`
        let key = `${cur.r},${cur.c}`;
        const fromKey = `${from.r},${from.c}`;
        while (parent[key] && parent[key] !== fromKey) key = parent[key];
        const [r, c] = key.split(",").map(Number);
        return { r, c };
      }
      openNeighbors(cur.r, cur.c).forEach(({ r: nr, c: nc }) => {
        if (!visited[nr][nc]) {
          visited[nr][nc] = true;
          parent[`${nr},${nc}`] = `${cur.r},${cur.c}`;
          queue.push({ r: nr, c: nc });
        }
      });
    }
    return null; // unreachable (shouldn't happen in a connected maze)
  }

  function updateLabStats() {
    const roomEl  = document.getElementById("labRoom");
    const livesEl = document.getElementById("labLives");
    const keysEl  = document.getElementById("labKeys");
    if (roomEl)  roomEl.textContent = labLevel;
    if (livesEl) livesEl.textContent = labLives;
    if (keysEl)  keysEl.textContent = Math.max(0, labKeysRequired - labKeysCollected);
  }

  function placeKeysTrapsHunters() {
    labKeys = []; labTraps = []; labHunters = [];
    labKeysCollected = 0;

    // scale difficulty with level
    labKeysRequired   = 1 + Math.floor((labLevel - 1) / 3);
    const trapCount   = Math.min(3 + Math.floor(labLevel / 2), 10);
    const hunterCount = 1 + Math.floor((labLevel - 1) / 4); // a touch more aggressive

    // pool of valid cells (not player, not exit)
    const reachable = getReachableCells();
    const filtered = reachable.filter(({ r, c }) =>
      !(r === playerPos.r && c === playerPos.c) &&
      !(r === exitPos.r   && c === exitPos.c));

    function pickRandomCell() {
      if (!filtered.length) return null;
      const idx = Math.floor(Math.random() * filtered.length);
      return filtered.splice(idx, 1)[0];
    }

    // keys
    for (let i = 0; i < labKeysRequired; i++) {
      const cell = pickRandomCell();
      if (cell) labKeys.push(cell);
    }
    // traps
    for (let i = 0; i < trapCount; i++) {
      const cell = pickRandomCell();
      if (cell) labTraps.push(cell);
    }
    // hunters — first one spawns far from player so it's fair
    for (let i = 0; i < hunterCount; i++) {
      let cell = null;
      if (i === 0) {
        const far = findFarthestCell(playerPos);
        if (!(far.r === playerPos.r && far.c === playerPos.c) &&
            !(far.r === exitPos.r   && far.c === exitPos.c)) {
          cell = { r: far.r, c: far.c };
          // remove it from the pool if present
          const idx = filtered.findIndex(f => f.r === cell.r && f.c === cell.c);
          if (idx >= 0) filtered.splice(idx, 1);
        }
      }
      if (!cell) cell = pickRandomCell();
      if (cell) labHunters.push({ r: cell.r, c: cell.c, moveCounter: 0 });
    }
  }

  function resetLab() {
    createMazeGrid();
    generateMaze(0, 0);
    playerPos = { r: 0, c: 0 };
    exitPos   = { r: LAB_ROWS - 1, c: LAB_COLS - 1 };
    placeKeysTrapsHunters();
    labRunning = true;
    updateLabStats();
    drawMaze();

    // hunters tick on their own clock — this is what makes them chase
    if (hunterTickID) clearInterval(hunterTickID);
    hunterTickID = setInterval(hunterTick, 450);
  }

  // called every tick — each hunter takes one BFS step toward the player
  function hunterTick() {
    if (!labRunning) return;
    let caught = false;
    labHunters.forEach((h) => {
      const step = nextStepToward(h, playerPos);
      if (step) { h.r = step.r; h.c = step.c; }
      if (h.r === playerPos.r && h.c === playerPos.c) caught = true;
    });
    if (caught) handleCaught();
    drawMaze();
  }

  function handleCaught() {
    labLives--;
    updateLabStats();
    if (labLives <= 0) {
      labRunning = false;
      if (hunterTickID) { clearInterval(hunterTickID); hunterTickID = null; }
      setTimeout(() => alert("You have no lives left! Game over."), 0);
      labLevel = 1; labLives = 3;
      // give the player a moment, then start fresh
      setTimeout(resetLab, 100);
      return;
    }
    // soft reset position
    playerPos = { r: 0, c: 0 };
    setTimeout(() => alert("Caught by a hunter! Sent back to the start."), 0);
  }

  function labMovePlayer(dr, dc) {
    if (!labRunning) return;
    const { r, c } = playerPos;
    const cell = maze[r][c];
    let nr = r, nc = c;
    if (dr === -1 && !cell.walls.top)    nr--;
    if (dr ===  1 && !cell.walls.bottom) nr++;
    if (dc === -1 && !cell.walls.left)   nc--;
    if (dc ===  1 && !cell.walls.right)  nc++;
    if (nr === r && nc === c) return; // blocked by wall
    if (nr < 0 || nr >= LAB_ROWS || nc < 0 || nc >= LAB_COLS) return;
    playerPos = { r: nr, c: nc };

    // pick up keys
    for (let i = labKeys.length - 1; i >= 0; i--) {
      const k = labKeys[i];
      if (k.r === playerPos.r && k.c === playerPos.c) { labKeys.splice(i, 1); labKeysCollected++; }
    }
    // step on a trap?
    for (let i = labTraps.length - 1; i >= 0; i--) {
      const t = labTraps[i];
      if (t.r === playerPos.r && t.c === playerPos.c) {
        labLives--;
        labTraps.splice(i, 1);
        updateLabStats();
        if (labLives <= 0) {
          labRunning = false;
          if (hunterTickID) { clearInterval(hunterTickID); hunterTickID = null; }
          setTimeout(() => alert("You have no lives left! Game over."), 0);
          labLevel = 1; labLives = 3;
          setTimeout(resetLab, 100);
          return;
        }
        setTimeout(() => alert("You triggered a trap! Lost a life."), 0);
        playerPos = { r: 0, c: 0 };
      }
    }
    // walked into a hunter?
    for (const h of labHunters) {
      if (h.r === playerPos.r && h.c === playerPos.c) { handleCaught(); break; }
    }
    // reached the exit?
    if (playerPos.r === exitPos.r && playerPos.c === exitPos.c) {
      if (labKeysCollected < labKeysRequired) {
        const need = labKeysRequired - labKeysCollected;
        setTimeout(() => alert(`You still need ${need} key${need > 1 ? "s" : ""} to exit!`), 0);
      } else {
        labLevel++;
        if ((labLevel - 1) % 5 === 0) {
          labLives++;
          setTimeout(() => alert("Room cleared! Bonus life for clearing 5 rooms."), 0);
        } else {
          setTimeout(() => alert("Room cleared! Onto the next maze."), 0);
        }
        resetLab();
        return;
      }
    }
    updateLabStats();
    drawMaze();
  }

  if (labyrinthStart) labyrinthStart.addEventListener("click", resetLab);

  // keyboard controls — only when labyrinth section is active
  window.addEventListener("keydown", (e) => {
    const labSection = document.getElementById("labyrinth");
    if (!labSection || !labSection.classList.contains("active")) return;
    if (!labRunning) return;
    if (["ArrowUp","w","W"].includes(e.key))         { e.preventDefault(); labMovePlayer(-1, 0); }
    else if (["ArrowDown","s","S"].includes(e.key))  { e.preventDefault(); labMovePlayer( 1, 0); }
    else if (["ArrowLeft","a","A"].includes(e.key))  { e.preventDefault(); labMovePlayer(0, -1); }
    else if (["ArrowRight","d","D"].includes(e.key)) { e.preventDefault(); labMovePlayer(0,  1); }
  });
}


/* =====================================================
   8. GLITCH GARDEN — tower defense
   - The bottom-right cell is your BASE (with a heart).
   - Click the green highlight tiles to dig a path from
     the top-left start to the base.
   - Place towers on dark blocks, traps on the path.
===================================================== */

const glitchBoard    = document.getElementById("glitchBoard");
const glitchToolbar  = document.getElementById("glitchToolbar");
const ggWaveEl       = document.getElementById("ggWave");
const ggMoneyEl      = document.getElementById("ggMoney");
const ggLivesEl      = document.getElementById("ggLives");
const ggStartWaveBtn = document.getElementById("ggStartWave");
const ggResetBtn     = document.getElementById("ggReset");
const ggMessage      = document.getElementById("ggMessage");

if (glitchBoard) {
  const ROWS = 12, COLS = 12;

  let board = [];
  let pathCells = [];
  let towers = [];
  let traps = [];
  let enemies = [];
  let wave = 1;
  let money = 100;
  let lives = 10;
  let gameState = "build"; // 'build' | 'wave' | 'over'
  let selectedItem = null;
  let spawnInterval = null;
  let animFrame = null;
  let gameOverAnnounced = false;

  // ── definitions ──
  const towerDefs = [
    { id:"laser",   name:"Laser",     cost:25, range:3, rate:600,  damage:3, canTargetStealth:false },
    { id:"frost",   name:"Frost",     cost:30, range:2, rate:800,  damage:2, slow:0.5, canTargetStealth:false },
    { id:"flame",   name:"Flame",     cost:35, range:2, rate:1000, damage:1, burn:2, canTargetStealth:true  },
    { id:"tesla",   name:"Tesla",     cost:40, range:3, rate:1200, damage:3, chain:2, canTargetStealth:true },
    { id:"missile", name:"Missile",   cost:50, range:4, rate:1500, damage:6, aoe:true, canTargetStealth:true },
    { id:"poison",  name:"Poison",    cost:45, range:3, rate:1000, damage:1, poison:2, canTargetStealth:true },
    { id:"shock",   name:"Shockwave", cost:55, range:2, rate:2000, damage:3, pulse:true, canTargetStealth:true }
  ];
  const trapDefs = [
    { id:"spike", name:"Spike Trap", cost:20, damage:5, single:true },
    { id:"bomb",  name:"Bomb Trap",  cost:30, damage:4, aoe:true },
    { id:"tar",   name:"Tar Trap",   cost:25, slow:0.5, single:false },
    { id:"mine",  name:"Mine",       cost:35, damage:8, aoe:true, single:true }
  ];
  const enemyDefs = {
    normal:     { speed: 1.0, hp: 10,  reward: 5,  class:"enemy-normal" },
    fast:       { speed: 1.6, hp: 8,   reward: 6,  class:"enemy-fast" },
    tank:       { speed: 0.7, hp: 20,  reward: 10, class:"enemy-tank" },
    fly:        { speed: 1.4, hp: 12,  reward: 8,  class:"enemy-fly" },
    boss:       { speed: 0.8, hp: 100, reward: 50, class:"enemy-boss" },
    shielded:   { speed: 0.9, hp: 15,  reward: 12, class:"enemy-shield", shield: 8 },
    regenerator:{ speed: 1.0, hp: 14,  reward: 12, class:"enemy-regenerator", regen: 0.02 },
    splitter:   { speed: 1.1, hp: 16,  reward: 15, class:"enemy-splitter", splitter:true },
    stealth:    { speed: 1.2, hp: 10,  reward: 8,  class:"enemy-stealth", stealth:true },
    splitChild: { speed: 1.4, hp: 8,   reward: 2,  class:"enemy-split-child", child:true }
  };

  // shield soaks damage before hp
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

  // splitter babies on death
  function spawnChildEnemy(parent) {
    const base = enemyDefs.splitChild;
    const startCell = pathCells[parent.pathIndex];
    if (!startCell) return;
    const elem = document.createElement("div");
    elem.className = "enemy " + base.class;
    elem.textContent = "C";
    addHpBar(elem);
    startCell.element.appendChild(elem);
    enemies.push({
      type: "splitChild",
      hp: base.hp, maxHp: base.hp,
      speed: base.speed, reward: base.reward,
      pathIndex: parent.pathIndex, progress: parent.progress,
      el: elem,
      slowTimer: 0, burnTimer: 0, poisonTimer: 0,
      shield: 0, regen: 0, splitter: false, stealth: false, child: true,
      x: 0, y: 0
    });
  }

  /* ── toolbar (towers + traps) ── */

  function buildToolbar() {
    glitchToolbar.innerHTML = "";

    const towerTitle = document.createElement("div");
    towerTitle.className = "sidebar-title";
    towerTitle.textContent = "Towers";
    glitchToolbar.appendChild(towerTitle);

    towerDefs.forEach((def) => glitchToolbar.appendChild(makeToolbarItem("tower", def, getTowerColor(def.id))));

    const sep = document.createElement("div");
    sep.style.margin = "0.6rem 0";
    sep.style.height = "1px";
    sep.style.background = "var(--card-border)";
    glitchToolbar.appendChild(sep);

    const trapTitle = document.createElement("div");
    trapTitle.className = "sidebar-title";
    trapTitle.textContent = "Traps";
    glitchToolbar.appendChild(trapTitle);

    trapDefs.forEach((def) => glitchToolbar.appendChild(makeToolbarItem("trap", def, getTrapColor(def.id))));
  }

  function makeToolbarItem(type, def, colour) {
    const item = document.createElement("div");
    item.className = "toolbar-item";
    item.dataset.type = type;
    item.dataset.id   = def.id;

    const icon = document.createElement("div");
    icon.className = "toolbar-icon";
    icon.style.background = colour;

    const name = document.createElement("div");
    name.className = "toolbar-name";
    name.textContent = def.name;

    const cost = document.createElement("div");
    cost.className = "toolbar-cost";
    cost.textContent = `$${def.cost}`;

    item.appendChild(icon);
    item.appendChild(name);
    item.appendChild(cost);
    item.addEventListener("click", () => selectItem(item));
    return item;
  }

  // tower icon colours
  function getTowerColor(id) {
    switch (id) {
      case "laser":   return "#00d4a6"; // mint
      case "frost":   return "#2d9fe8"; // blue
      case "flame":   return "#e8423f"; // red
      case "tesla":   return "#a855f7"; // purple
      case "missile": return "#fbbf24"; // gold
      case "poison":  return "#10b981"; // green
      case "shock":   return "#f59e0b"; // amber
      default:        return "#ccc";
    }
  }
  // trap icon colours
  function getTrapColor(id) {
    switch (id) {
      case "spike": return "#fbbf24"; // yellow
      case "bomb":  return "#ef4444"; // red
      case "tar":   return "#6b7280"; // gray
      case "mine":  return "#f43f5e"; // pink-red
      default:      return "#ccc";
    }
  }

  function selectItem(item) {
    glitchToolbar.querySelectorAll(".toolbar-item").forEach((el) => el.classList.remove("selected"));
    item.classList.add("selected");
    selectedItem = { type: item.dataset.type, id: item.dataset.id };
  }

  /* ── board ── */

  function buildBoard() {
    glitchBoard.innerHTML = "";
    board = [];
    for (let r = 0; r < ROWS; r++) {
      const row = [];
      for (let c = 0; c < COLS; c++) {
        const cell = { r, c, type: "block", tower: null, trap: null, element: null };
        const cellDiv = document.createElement("div");
        cellDiv.className = "cell block";
        cellDiv.dataset.r = r;
        cellDiv.dataset.c = c;
        cell.element = cellDiv;
        cellDiv.addEventListener("click", () => handleCellClick(cell));
        glitchBoard.appendChild(cellDiv);
        row.push(cell);
      }
      board.push(row);
    }

    pathCells = [];

    // top-left is the spawn start
    const startCell = board[0][0];
    startCell.type = "path";
    startCell.element.classList.remove("block");
    startCell.element.classList.add("path", "start");
    pathCells.push(startCell);

    // bottom-right is the BASE — visible target with a heart icon
    const baseCell = board[ROWS - 1][COLS - 1];
    baseCell.type = "path";
    baseCell.isBase = true;
    baseCell.element.classList.remove("block");
    baseCell.element.classList.add("path", "base");

    highlightNextCells();
  }

  function handleCellClick(cell) {
    if (gameState !== "build") return;

    // dig path on a highlighted cell
    if (cell.element.classList.contains("highlight")) { digPath(cell); return; }

    // otherwise place tower/trap if an item is selected
    if (!selectedItem) return;

    if (selectedItem.type === "tower") {
      if (cell.type !== "block" || cell.tower) return;
      const def = towerDefs.find(t => t.id === selectedItem.id);
      if (money < def.cost) return;
      money -= def.cost;
      updateHUD();
      const tower = {
        id: def.id, r: cell.r, c: cell.c,
        range: def.range, rate: def.rate, damage: def.damage,
        slow: def.slow || 0, burn: def.burn || 0,
        chain: def.chain || 0, aoe: def.aoe || false,
        poison: def.poison || 0, pulse: def.pulse || false,
        canTargetStealth: def.canTargetStealth === undefined ? true : def.canTargetStealth,
        nextShot: performance.now()
      };
      towers.push(tower);
      cell.tower = tower;
      const towerEl = document.createElement("div");
      towerEl.className = "tower tower-" + def.id;
      towerEl.textContent = def.name.charAt(0);
      cell.element.appendChild(towerEl);
    } else if (selectedItem.type === "trap") {
      // traps go on the path — but not on the start or the base
      const isStart = (cell.r === pathCells[0].r && cell.c === pathCells[0].c);
      const isBase  = !!cell.isBase;
      if (cell.type !== "path" || cell.trap || isStart || isBase) return;
      const def = trapDefs.find(t => t.id === selectedItem.id);
      if (money < def.cost) return;
      money -= def.cost;
      updateHUD();
      const trap = {
        id: def.id, r: cell.r, c: cell.c,
        damage: def.damage || 0, slow: def.slow || 0,
        single: def.single || false, aoe: def.aoe || false
      };
      traps.push(trap);
      cell.trap = trap;
      const trapEl = document.createElement("div");
      trapEl.className = "trap trap-" + def.id;
      trapEl.textContent = def.id.charAt(0).toUpperCase();
      cell.element.appendChild(trapEl);
    }
  }

  function digPath(cell) {
    cell.type = "path";
    cell.element.classList.remove("block", "highlight");
    cell.element.classList.add("path");
    pathCells.push(cell);
    highlightNextCells();
  }

  // show "you can dig here" tiles next to the path tip
  function highlightNextCells() {
    board.flat().forEach((cell) => cell.element.classList.remove("highlight"));

    // if the path already touches the base, no more digging needed
    const last = pathCells[pathCells.length - 1];
    if (last.isBase) return;

    const directions = [{ dr:-1, dc:0 }, { dr:1, dc:0 }, { dr:0, dc:-1 }, { dr:0, dc:1 }];
    directions.forEach(({ dr, dc }) => {
      const nr = last.r + dr, nc = last.c + dc;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return;
      const ncell = board[nr][nc];
      // can highlight a block, OR the base tile so the player can connect to it
      if (ncell.type === "block") {
        if (!adjacentPathOtherThan(ncell, last)) ncell.element.classList.add("highlight");
      } else if (ncell.isBase) {
        // make the base also part of the path chain when adjacent
        ncell.element.classList.add("highlight");
      }
    });
  }

  // would adding this cell to the path create a loop? (we don't allow that)
  // exception: touching the base doesn't count — base IS the destination
  function adjacentPathOtherThan(cell, except) {
    const dirs = [{ dr:-1, dc:0 }, { dr:1, dc:0 }, { dr:0, dc:-1 }, { dr:0, dc:1 }];
    for (const { dr, dc } of dirs) {
      const nr = cell.r + dr, nc = cell.c + dc;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
      const neighbor = board[nr][nc];
      if (neighbor.type === "path" && neighbor !== except) {
        if (neighbor.isBase) continue; // touching the base is allowed
        return true;
      }
    }
    return false;
  }

  function updateHUD() {
    ggWaveEl.textContent  = wave;
    ggMoneyEl.textContent = money;
    ggLivesEl.textContent = lives;
  }

  function resetGlitch() {
    if (spawnInterval) clearInterval(spawnInterval);
    if (animFrame)     cancelAnimationFrame(animFrame);
    spawnInterval = null; animFrame = null;
    towers = []; traps = []; enemies = [];
    wave = 1; money = 100; lives = 10;
    gameState = "build";
    gameOverAnnounced = false;
    ggMessage.classList.add("hidden");
    ggMessage.textContent = "";
    buildBoard();
    updateHUD();
  }

  function startWave() {
    if (gameState !== "build") return;
    // path must reach the base or you can't start
    const baseCell = board[ROWS - 1][COLS - 1];
    const lastPath = pathCells[pathCells.length - 1];
    const pathReachesBase = lastPath === baseCell ||
      (Math.abs(lastPath.r - baseCell.r) + Math.abs(lastPath.c - baseCell.c) === 1);

    if (!pathReachesBase) {
      ggMessage.textContent = "Dig a path all the way to the base before starting!";
      ggMessage.classList.remove("hidden");
      setTimeout(() => ggMessage.classList.add("hidden"), 3500);
      return;
    }
    // ensure base is in pathCells (so enemies actually walk to it)
    if (pathCells[pathCells.length - 1] !== baseCell) pathCells.push(baseCell);

    gameState = "wave";
    board.flat().forEach(cell => cell.element.classList.remove("highlight"));

    // spawn a batch of enemies
    let spawnCount = Math.min(5 + wave * 2, 40);
    let spawned = 0;
    spawnInterval = setInterval(() => {
      if (spawned >= spawnCount) {
        clearInterval(spawnInterval);
        spawnInterval = null;
        return;
      }
      spawnEnemy(getEnemyForWave(wave, spawned));
      spawned++;
    }, 800);

    if (!animFrame) animFrame = requestAnimationFrame(updateGlitch);
  }

  function getEnemyForWave(wave, index) {
    // boss every 10 waves
    if (wave % 10 === 0 && index === 0) {
      return { type:"boss", hp: enemyDefs.boss.hp + wave * 10, speed: enemyDefs.boss.speed, reward: enemyDefs.boss.reward + wave * 2 };
    }
    let pool;
    if (wave >= 40)      pool = ["fast","tank","fly","shielded","regenerator","splitter","stealth","normal"];
    else if (wave >= 30) pool = ["fast","tank","fly","shielded","regenerator","splitter","normal"];
    else if (wave >= 20) pool = ["fast","tank","fly","normal"];
    else if (wave >= 10) pool = ["fast","tank","normal"];
    else                 pool = ["normal"];
    const t = pool[Math.floor(Math.random() * pool.length)];
    const base = enemyDefs[t];
    const hpScale = wave >= 30 ? 1.8 : wave >= 20 ? 1.5 : 1.0;
    return { type: t, hp: base.hp + wave * hpScale, speed: base.speed, reward: base.reward + Math.floor(wave / 3) };
  }

  // tiny green hp bar above each enemy
  function addHpBar(elem) {
    const bar = document.createElement("div");
    bar.className = "enemy-hpbar";
    const fill = document.createElement("span");
    bar.appendChild(fill);
    elem.appendChild(bar);
  }

  function spawnEnemy(info) {
    const start = pathCells[0];
    const elem = document.createElement("div");
    elem.className = "enemy " + enemyDefs[info.type].class;
    elem.textContent = info.type.charAt(0).toUpperCase();
    addHpBar(elem);
    start.element.appendChild(elem);
    const base = enemyDefs[info.type] || {};
    enemies.push({
      type: info.type,
      hp: info.hp, maxHp: info.hp,
      speed: info.speed, reward: info.reward,
      pathIndex: 0, progress: 0,
      el: elem,
      slowTimer: 0, burnTimer: 0, poisonTimer: 0,
      shield: base.shield || 0,
      regen: base.regen || 0,
      splitter: base.splitter || false,
      stealth: base.stealth || false,
      child: base.child || false,
      x: 0, y: 0
    });
  }

  /* ── main loop ── */
  function updateGlitch(timestamp) {
    // 1. move enemies + tick status effects
    enemies.forEach((enemy) => {
      let moveSpeed = enemy.speed;
      if (enemy.slowTimer > 0) moveSpeed *= 0.5; // slowed
      enemy.slowTimer = Math.max(0, enemy.slowTimer - 16);

      enemy.burnTimer = Math.max(0, enemy.burnTimer - 16);
      if (enemy.burnTimer > 0) enemy.hp -= 0.03 * enemy.speed; // burn DoT

      enemy.poisonTimer = Math.max(0, enemy.poisonTimer - 16);
      if (enemy.poisonTimer > 0) enemy.hp -= 0.02 * enemy.speed; // poison DoT

      if (enemy.regen) enemy.hp = Math.min(enemy.maxHp, enemy.hp + enemy.regen); // regen heal
      if (enemy.hp <= 0) return;

      // walk along the path
      const currentCell = pathCells[enemy.pathIndex];
      const nextCell    = pathCells[enemy.pathIndex + 1];
      if (!nextCell) {
        // reached the base — player loses a life
        enemy.hp = 0;
        lives--;
        updateHUD();
        enemy.el.remove();
        return;
      }

      // pixel-perfect tween between two cells
      const boardRect = glitchBoard.getBoundingClientRect();
      const fromRect  = currentCell.element.getBoundingClientRect();
      const toRect    = nextCell.element.getBoundingClientRect();
      const fx = fromRect.left - boardRect.left + fromRect.width / 2;
      const fy = fromRect.top  - boardRect.top  + fromRect.height / 2;
      const tx = toRect.left   - boardRect.left + toRect.width / 2;
      const ty = toRect.top    - boardRect.top  + toRect.height / 2;

      enemy.progress += moveSpeed * 0.04;
      if (enemy.progress >= 1) {
        enemy.pathIndex++;
        enemy.progress = 0;
      }
      const px = fx + (tx - fx) * enemy.progress;
      const py = fy + (ty - fy) * enemy.progress;
      enemy.el.style.transform = `translate(-50%, -50%) translate(${px}px, ${py}px)`;

      // update hp bar
      const bar = enemy.el.querySelector(".enemy-hpbar > span");
      if (bar) {
        const pct = Math.max(0, Math.min(1, enemy.hp / enemy.maxHp));
        bar.style.width = (pct * 100) + "%";
        bar.style.background = pct > 0.6 ? "#4ade80" : pct > 0.3 ? "#fbbf24" : "#ef4444";
      }
    });

    // 2. remove dead enemies (and reward + split if applicable)
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (e.hp <= 0) {
        if (e.pathIndex < pathCells.length - 1) money += e.reward; // only reward if killed in transit
        if (e.splitter && !e.child) { spawnChildEnemy(e); spawnChildEnemy(e); }
        e.el.remove();
        enemies.splice(i, 1);
        updateHUD();
      }
    }

    // 3. towers attack
    towers.forEach((tower) => {
      if (!tower) return;
      if (timestamp < tower.nextShot) return;
      const cell = board[tower.r][tower.c];

      let candidates = enemies.filter((e) => {
        if (e.hp <= 0) return false;
        if (e.stealth && !tower.canTargetStealth) return false;
        const enemyCell = pathCells[e.pathIndex];
        if (!enemyCell) return false;
        const dist = Math.abs(enemyCell.r - tower.r) + Math.abs(enemyCell.c - tower.c);
        return dist <= tower.range;
      });
      if (!candidates.length) return;

      // pulse tower: hits everyone in range at once
      if (tower.pulse) {
        candidates.forEach((target) => {
          target.hp -= tower.damage;
          if (tower.slow)   target.slowTimer = 1000;
          if (tower.burn)   target.burnTimer = 1000;
          if (tower.poison) target.poisonTimer = 1000;
        });
        const bullet = document.createElement("div");
        bullet.className = "bullet bullet-" + tower.id;
        glitchBoard.appendChild(bullet);
        const boardRect = glitchBoard.getBoundingClientRect();
        const startRect = cell.element.getBoundingClientRect();
        const sx = startRect.left - boardRect.left + startRect.width / 2;
        const sy = startRect.top  - boardRect.top  + startRect.height / 2;
        bullet.style.left = sx + "px";
        bullet.style.top  = sy + "px";
        bullet.style.transition = "transform 0.5s ease, opacity 0.5s ease";
        bullet.style.width = "0px";
        bullet.style.height = "0px";
        bullet.style.borderRadius = "50%";
        bullet.style.opacity = "0.8";
        requestAnimationFrame(() => {
          bullet.style.transform = "scale(8)";
          bullet.style.opacity = "0";
        });
        setTimeout(() => bullet.remove(), 500);
        tower.nextShot = timestamp + tower.rate;
        return;
      }

      // normal tower: target farthest-along enemy, maybe chain
      candidates.sort((a, b) => b.pathIndex - a.pathIndex);
      const targets = [candidates[0]];
      if (tower.chain) {
        for (let i = 1; i <= tower.chain && i < candidates.length; i++) targets.push(candidates[i]);
      }
      targets.forEach((target) => {
        applyDamage(target, tower.damage);
        if (tower.slow)   target.slowTimer = 1000;
        if (tower.burn)   target.burnTimer = 1000;
        if (tower.poison) target.poisonTimer = 1000;
        // missile splash damage
        if (tower.aoe) {
          const tCell = pathCells[target.pathIndex];
          enemies.forEach((e2) => {
            if (e2 === target || e2.hp <= 0) return;
            const c2 = pathCells[e2.pathIndex];
            if (!c2) return;
            const dist = Math.abs(c2.r - tCell.r) + Math.abs(c2.c - tCell.c);
            if (dist <= 1) applyDamage(e2, tower.damage);
          });
        }
        // bullet animation
        const bullet = document.createElement("div");
        bullet.className = "bullet bullet-" + tower.id;
        glitchBoard.appendChild(bullet);
        const boardRect = glitchBoard.getBoundingClientRect();
        const startRect = cell.element.getBoundingClientRect();
        const endRect   = pathCells[target.pathIndex].element.getBoundingClientRect();
        const sx = startRect.left - boardRect.left + startRect.width / 2;
        const sy = startRect.top  - boardRect.top  + startRect.height / 2;
        const ex = endRect.left   - boardRect.left + endRect.width / 2;
        const ey = endRect.top    - boardRect.top  + endRect.height / 2;
        bullet.style.left = sx + "px";
        bullet.style.top  = sy + "px";
        bullet.style.transition = "transform 0.35s linear";
        requestAnimationFrame(() => {
          bullet.style.transform = `translate(${ex - sx}px, ${ey - sy}px)`;
        });
        setTimeout(() => bullet.remove(), 400);
      });
      tower.nextShot = timestamp + tower.rate;
    });

    // 4. trap effects (when an enemy is on a trap tile)
    for (let idx = traps.length - 1; idx >= 0; idx--) {
      const trap = traps[idx];
      let removeTrap = false;
      enemies.forEach((enemy) => {
        if (enemy.hp <= 0) return;
        const enemyCell = pathCells[enemy.pathIndex];
        if (!enemyCell) return;
        if (enemyCell.r !== trap.r || enemyCell.c !== trap.c) return;

        if (trap.slow) enemy.slowTimer = 1000;
        if (trap.damage) {
          if (trap.aoe) {
            enemies.forEach((e2) => {
              const cell2 = pathCells[e2.pathIndex];
              if (!cell2) return;
              const dist = Math.abs(cell2.r - trap.r) + Math.abs(cell2.c - trap.c);
              if (dist <= 1) e2.hp -= trap.damage;
            });
          } else {
            applyDamage(enemy, trap.damage);
          }
        }
        if (trap.single) removeTrap = true;
      });
      if (removeTrap) {
        const cell = board[trap.r][trap.c];
        cell.trap = null;
        const trapEl = cell.element.querySelector(".trap");
        if (trapEl) trapEl.remove();
        traps.splice(idx, 1);
      }
    }

    // 5. end-of-wave check
    if (gameState === "wave" && spawnInterval === null && enemies.length === 0) {
      gameState = "build";
      wave++;
      money += 10;
      updateHUD();
      highlightNextCells();
      ggMessage.textContent = `Wave ${wave - 1} cleared! Build or upgrade your defenses.`;
      ggMessage.classList.remove("hidden");
      setTimeout(() => ggMessage.classList.add("hidden"), 4000);
    }

    // 6. game-over check (only fire the alert once)
    if (lives <= 0 && gameState !== "over") {
      gameState = "over";
      if (!gameOverAnnounced) {
        gameOverAnnounced = true;
        ggMessage.textContent = `Game over! Your base fell on wave ${wave}. Press Reset to try again.`;
        ggMessage.classList.remove("hidden");
        // also nuke any straggler enemies so the board's clean
        enemies.forEach(e => e.el && e.el.remove());
        enemies = [];
        if (spawnInterval) { clearInterval(spawnInterval); spawnInterval = null; }
      }
      // stop the loop here — don't queue another frame
      animFrame = null;
      return;
    }

    animFrame = requestAnimationFrame(updateGlitch);
  }

  // wire up
  if (ggResetBtn)     ggResetBtn.addEventListener("click", resetGlitch);
  if (ggStartWaveBtn) ggStartWaveBtn.addEventListener("click", startWave);

  // init
  buildToolbar();
  buildBoard();
  updateHUD();
  resetGlitch();
}


/* =====================================================
   STARTUP — show home section by default
===================================================== */
showSection("home");
