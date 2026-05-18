/* =====================================================
   POCKET ARCADE — script.js
   Stable vanilla JS build for navigation, theme storage,
   Reaction Click, Rune Gambit, Neon Labyrinth, Glitch Garden,
   gallery, and feedback form.
===================================================== */

"use strict";

(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const isTypingField = (el) => el && ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);

  const safeStorage = (() => {
    try {
      const key = "__pocket_arcade_test__";
      window.localStorage.setItem(key, "1");
      window.localStorage.removeItem(key);
      return window.localStorage;
    } catch {
      const memory = new Map();
      return {
        getItem: (key) => memory.has(key) ? memory.get(key) : null,
        setItem: (key, value) => memory.set(key, String(value)),
        removeItem: (key) => memory.delete(key)
      };
    }
  })();

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setMessage(el, text, autoHideMs = 0) {
    if (!el) return;
    el.textContent = text;
    el.classList.remove("hidden");
    if (el._hideTimer) clearTimeout(el._hideTimer);
    if (autoHideMs > 0) {
      el._hideTimer = setTimeout(() => el.classList.add("hidden"), autoHideMs);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initTheme();
    initReactionClick();
    initRuneGambit();
    initGallery();
    initFeedback();
    initLabyrinth();
    initGlitchGarden();
    showSection("home", { instant: true });
  });

  function initNavigation() {
    $$('[data-target]').forEach((button) => {
      button.addEventListener("click", () => {
        const target = button.dataset.target;
        if (target && document.getElementById(target)) showSection(target);
      });
    });
  }

  function showSection(targetId, options = {}) {
    $$(".section").forEach((section) => {
      section.classList.toggle("active", section.id === targetId);
    });
    $$(".nav-btn").forEach((button) => {
      button.classList.toggle("active", button.dataset.target === targetId);
    });
    if (!options.instant) window.scrollTo({ top: 0, behavior: "smooth" });
    if (targetId === "gallery") renderSlide();
  }

  function initTheme() {
    const themeToggle = $("#themeToggleBtn");
    const savedTheme = safeStorage.getItem("pocketArcade.theme") || "dark";
    applyTheme(savedTheme);
    if (!themeToggle) return;
    themeToggle.addEventListener("click", () => {
      const next = document.body.classList.contains("theme-dark") ? "light" : "dark";
      applyTheme(next);
      safeStorage.setItem("pocketArcade.theme", next);
    });

    function applyTheme(theme) {
      const dark = theme !== "light";
      document.body.classList.toggle("theme-dark", dark);
      document.body.classList.toggle("theme-light", !dark);
      if (themeToggle) {
        themeToggle.textContent = dark ? "Light Mode" : "Dark Mode";
        themeToggle.setAttribute("aria-pressed", String(dark));
      }
      window.dispatchEvent(new CustomEvent("pocketarcade:themechange"));
    }
  }

  function initReactionClick() {
    const setup = $("#reactionSetup");
    const arena = $("#reactionArena");
    const over = $("#reactionOver");
    const playerInput = $("#reactionPlayer");
    const startBtn = $("#reactionStart");
    const restartBtn = $("#reactionRestart");
    const target = $("#reactionTarget");
    const area = $("#reactionArea");
    const nameEl = $("#reactionName");
    const scoreEl = $("#reactionScore");
    const timerEl = $("#reactionTimer");
    const finalEl = $("#reactionFinal");
    if (!setup || !arena || !over || !target || !area) return;

    const state = {
      running: false,
      score: 0,
      timeLeft: 20,
      timerId: null,
      playerName: "Player"
    };

    function moveTarget() {
      const rect = area.getBoundingClientRect();
      const size = target.offsetWidth || 50;
      const pad = 8;
      const x = randInt(pad, Math.max(pad, Math.floor(rect.width - size - pad)));
      const y = randInt(pad, Math.max(pad, Math.floor(rect.height - size - pad)));
      target.style.left = `${x}px`;
      target.style.top = `${y}px`;
    }

    function startGame() {
      clearInterval(state.timerId);
      state.running = true;
      state.score = 0;
      state.timeLeft = 20;
      state.playerName = (playerInput?.value || "").trim().slice(0, 20) || "Player";
      nameEl.textContent = state.playerName;
      scoreEl.textContent = "0";
      timerEl.textContent = "20";
      timerEl.classList.remove("timer-val");
      setup.classList.add("hidden");
      over.classList.add("hidden");
      arena.classList.remove("hidden");
      target.style.display = "block";
      requestAnimationFrame(moveTarget);
      state.timerId = setInterval(() => {
        state.timeLeft -= 1;
        timerEl.textContent = String(state.timeLeft);
        timerEl.classList.toggle("timer-val", state.timeLeft <= 5);
        if (state.timeLeft <= 0) endGame();
      }, 1000);
    }

    function endGame() {
      if (!state.running) return;
      clearInterval(state.timerId);
      state.running = false;
      target.style.display = "none";
      arena.classList.add("hidden");
      over.classList.remove("hidden");
      const previousBest = Number(safeStorage.getItem("pocketArcade.reactionBest") || 0);
      const newBest = Math.max(previousBest, state.score);
      safeStorage.setItem("pocketArcade.reactionBest", String(newBest));
      const remark = state.score >= 20 ? "Amazing reflexes." : state.score >= 12 ? "Great run." : "Keep practicing.";
      finalEl.innerHTML =
        `Well played, <strong>${escapeHTML(state.playerName)}</strong>.<br>` +
        `You scored <strong class="accent">${state.score}</strong> in 20 seconds.<br>` +
        `Best score: <strong class="accent">${newBest}</strong>.<br>${remark}`;
    }

    function resetGame() {
      clearInterval(state.timerId);
      state.running = false;
      target.style.display = "none";
      timerEl.classList.remove("timer-val");
      over.classList.add("hidden");
      arena.classList.add("hidden");
      setup.classList.remove("hidden");
      if (playerInput) playerInput.value = "";
    }

    target.addEventListener("pointerdown", (event) => {
      if (!state.running) return;
      event.preventDefault();
      event.stopPropagation();
      state.score += 1;
      scoreEl.textContent = String(state.score);
      moveTarget();
    });
    startBtn?.addEventListener("click", startGame);
    restartBtn?.addEventListener("click", resetGame);
    playerInput?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") startGame();
    });
  }

  function initRuneGambit() {
    const roundEl = $("#runeRound");
    const hpEl = $("#runeHp");
    const goldEl = $("#runeGold");
    const enemyNameEl = $("#runeEnemyName");
    const enemyHpEl = $("#runeEnemyHp");
    const runesEl = $("#runeRunes");
    const rollBtn = $("#runeRollBtn");
    const fightBtn = $("#runeFightBtn");
    const messageEl = $("#runeMessage");
    const upgradesEl = $("#runeUpgrades");
    const upgradeOptionsEl = upgradesEl?.querySelector(".upgrade-options");
    if (!runesEl || !rollBtn || !fightBtn) return;

    const runeTypes = ["ATK", "DEF", "ARC", "HP", "G$"];
    const classByType = { ATK: "rune-atk", DEF: "rune-def", ARC: "rune-arc", HP: "rune-hp", "G$": "rune-gold" };
    const enemyNames = ["Slime", "Goblin", "Imp", "Skeleton", "Orc", "Mage", "Troll", "Golem", "Dragon"];
    let player;
    let enemy;
    let runes = [];
    let locked = [];
    let rollsLeft = 0;
    let phase = "idle";

    function init() {
      player = { hp: 30, gold: 0, round: 1, rerolls: 3, attackMult: 1, defenceMult: 1 };
      startRound();
    }

    function startRound() {
      phase = "rolling";
      rollsLeft = player.rerolls;
      locked = Array(5).fill(false);
      enemy = {
        name: choice(enemyNames),
        hp: 12 + player.round * 5,
        maxHp: 12 + player.round * 5,
        atk: 2 + Math.floor(player.round * 0.75)
      };
      runes = Array.from({ length: 5 }, randomRune);
      upgradesEl?.classList.add("hidden");
      rollBtn.disabled = false;
      fightBtn.disabled = true;
      setMessage(messageEl, `Round ${player.round}: roll your runes, then lock the ones you want to keep.`);
      renderRunes();
      updateHud();
    }

    function randomRune() {
      return { type: choice(runeTypes), value: randInt(1, 6) };
    }

    function renderRunes() {
      runesEl.innerHTML = "";
      runes.forEach((rune, index) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = `rune-card ${classByType[rune.type]}${locked[index] ? " locked" : ""}`;
        card.setAttribute("aria-pressed", String(locked[index]));
        card.innerHTML = `<span class="rune-type">${rune.type}</span><span class="rune-val">${rune.value}</span>`;
        card.addEventListener("click", () => {
          if (phase !== "rolling") return;
          locked[index] = !locked[index];
          renderRunes();
        });
        runesEl.appendChild(card);
      });
    }

    function roll() {
      if (phase !== "rolling" || rollsLeft <= 0) return;
      runes = runes.map((rune, index) => locked[index] ? rune : randomRune());
      rollsLeft -= 1;
      fightBtn.disabled = false;
      rollBtn.disabled = rollsLeft <= 0;
      setMessage(messageEl, rollsLeft > 0 ? `${rollsLeft} reroll${rollsLeft === 1 ? "" : "s"} left.` : "No rerolls left. Press Fight.");
      renderRunes();
    }

    function fight() {
      if (phase !== "rolling") return;
      const totals = { ATK: 0, DEF: 0, ARC: 0, HP: 0, "G$": 0 };
      runes.forEach((rune) => totals[rune.type] += rune.value);
      const attack = Math.floor(totals.ATK * (1 + totals.ARC * 0.18) * player.attackMult);
      const defence = Math.floor(totals.DEF * player.defenceMult);
      player.hp += totals.HP;
      player.gold += totals["G$"];
      enemy.hp -= attack;

      let log = `You dealt ${attack} damage, gained ${totals.HP} HP, and earned ${totals["G$"]} gold.`;
      if (enemy.hp > 0) {
        const damageTaken = Math.max(0, enemy.atk - defence);
        player.hp -= damageTaken;
        log += ` ${enemy.name} hit back for ${damageTaken}.`;
      } else {
        player.round += 1;
        player.gold += 5;
        phase = "upgrade";
        log += ` ${enemy.name} defeated. Bonus: 5 gold.`;
      }

      updateHud();
      setMessage(messageEl, log);
      if (player.hp <= 0) {
        phase = "over";
        rollBtn.disabled = true;
        fightBtn.disabled = true;
        setMessage(messageEl, "You fell. Press Roll to restart a new run.");
        rollBtn.disabled = false;
        rollBtn.textContent = "New Run";
        return;
      }
      if (phase === "upgrade") showUpgrades();
      else {
        phase = "rolling";
        rollsLeft = player.rerolls;
        locked = Array(5).fill(false);
        runes = Array.from({ length: 5 }, randomRune);
        rollBtn.disabled = false;
        fightBtn.disabled = true;
        renderRunes();
      }
    }

    function showUpgrades() {
      if (!upgradesEl || !upgradeOptionsEl) {
        startRound();
        return;
      }
      const options = [
        { text: "+10 HP", cost: 10, apply: () => { player.hp += 10; } },
        { text: "+20% attack", cost: 15, apply: () => { player.attackMult += 0.2; } },
        { text: "+20% defence", cost: 15, apply: () => { player.defenceMult += 0.2; } },
        { text: "+1 reroll", cost: 8, apply: () => { player.rerolls += 1; } }
      ];
      upgradesEl.classList.remove("hidden");
      upgradeOptionsEl.innerHTML = "";
      options.forEach((option) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn btn-outline btn-full";
        button.textContent = `${option.text} — ${option.cost} gold`;
        button.disabled = player.gold < option.cost;
        button.addEventListener("click", () => {
          if (player.gold < option.cost) return;
          player.gold -= option.cost;
          option.apply();
          startRound();
        });
        upgradeOptionsEl.appendChild(button);
      });
      const skip = document.createElement("button");
      skip.type = "button";
      skip.className = "btn btn-primary btn-full";
      skip.textContent = "Save gold";
      skip.addEventListener("click", startRound);
      upgradeOptionsEl.appendChild(skip);
      rollBtn.disabled = true;
      fightBtn.disabled = true;
      setMessage(messageEl, "Choose an upgrade or save your gold.");
    }

    function updateHud() {
      if (roundEl) roundEl.textContent = String(player.round);
      if (hpEl) hpEl.textContent = String(Math.max(0, player.hp));
      if (goldEl) goldEl.textContent = String(player.gold);
      if (enemyNameEl) enemyNameEl.textContent = enemy.name;
      if (enemyHpEl) enemyHpEl.textContent = `${Math.max(0, enemy.hp)} / ${enemy.maxHp}`;
    }

    rollBtn.addEventListener("click", () => {
      if (phase === "over") {
        rollBtn.textContent = "Roll";
        init();
      } else {
        roll();
      }
    });
    fightBtn.addEventListener("click", fight);
    init();
  }

  const slides = [
    { src: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=900&q=80", caption: "Classic Arcade Vibes" },
    { src: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=900&q=80", caption: "Retro Gaming Paradise" },
    { src: "https://images.unsplash.com/photo-1614294149010-950b698f72c0?w=900&q=80", caption: "Neon Nights and High Scores" },
    { src: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=900&q=80", caption: "Game On, Player One" }
  ];
  let currentSlide = 0;
  let galleryReady = false;

  function initGallery() {
    const prevBtn = $("#prevBtn");
    const nextBtn = $("#nextBtn");
    prevBtn?.addEventListener("click", () => {
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
      renderSlide();
    });
    nextBtn?.addEventListener("click", () => {
      currentSlide = (currentSlide + 1) % slides.length;
      renderSlide();
    });
    renderSlide();
    setInterval(() => {
      if (document.hidden) return;
      currentSlide = (currentSlide + 1) % slides.length;
      renderSlide();
    }, 6000);
  }

  function renderSlide() {
    const img = $("#sliderImg");
    const caption = $("#sliderCaption");
    const count = $("#sliderCount");
    const dots = $("#sliderDots");
    if (!img || !caption || !count || !dots) return;
    const slide = slides[currentSlide];
    img.style.opacity = galleryReady ? "0" : "1";
    setTimeout(() => {
      img.src = slide.src;
      img.alt = slide.caption;
      caption.textContent = slide.caption;
      count.textContent = `${currentSlide + 1} / ${slides.length}`;
      img.style.opacity = "1";
      galleryReady = true;
    }, galleryReady ? 160 : 0);
    dots.innerHTML = "";
    slides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = `dot${index === currentSlide ? " active" : ""}`;
      dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
      dot.addEventListener("click", () => {
        currentSlide = index;
        renderSlide();
      });
      dots.appendChild(dot);
    });
  }

  function initFeedback() {
    const form = $("#feedbackForm");
    const thanks = $("#feedbackThanks");
    const nameInput = $("#fbName");
    const gameInput = $("#fbGame");
    const messageInput = $("#fbMessage");
    if (!form || !thanks) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = (nameInput?.value || "").trim() || "Anonymous";
      const game = gameInput?.value || "a game";
      const message = (messageInput?.value || "").trim().slice(0, 180);
      thanks.innerHTML =
        `<h3>Thanks for the feedback.</h3>` +
        `<p>Message received from <strong>${escapeHTML(name)}</strong> about <strong>${escapeHTML(game)}</strong>.` +
        `${message ? `<br><em>"${escapeHTML(message)}${messageInput.value.length > 180 ? "…" : ""}"</em>` : ""}</p>`;
      thanks.classList.remove("hidden");
      form.reset();
      form.classList.add("hidden");
      setTimeout(() => {
        thanks.classList.add("hidden");
        form.classList.remove("hidden");
      }, 5000);
    });
  }

  function initLabyrinth() {
    const canvas = $("#labyrinthCanvas");
    const ctx = canvas?.getContext("2d");
    const startBtn = $("#labyrinthStart");
    const statusEl = $("#labStatus") || createLabStatus();
    const roomEl = $("#labRoom");
    const livesEl = $("#labLives");
    const keysEl = $("#labKeys");
    if (!canvas || !ctx || !startBtn) return;

    const rows = 10;
    const cols = 10;
    const cellSize = canvas.width / cols;
    const dirs = [
      { key: "top", opposite: "bottom", dr: -1, dc: 0 },
      { key: "right", opposite: "left", dr: 0, dc: 1 },
      { key: "bottom", opposite: "top", dr: 1, dc: 0 },
      { key: "left", opposite: "right", dr: 0, dc: -1 }
    ];

    let maze = [];
    let player = { r: 0, c: 0 };
    let exit = { r: rows - 1, c: cols - 1 };
    let keys = [];
    let traps = [];
    let hunters = [];
    let room = 1;
    let lives = 3;
    let requiredKeys = 1;
    let collectedKeys = 0;
    let running = false;

    createControls();
    drawEmptyBoard();

    function createLabStatus() {
      const info = $(".labyrinth-info");
      const div = document.createElement("div");
      div.id = "labStatus";
      div.className = "lab-status";
      div.setAttribute("aria-live", "polite");
      div.textContent = "Press Start Labyrinth to begin.";
      info?.insertBefore(div, startBtn || null);
      return div;
    }

    function makeGrid() {
      maze = Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => ({
        r,
        c,
        visited: false,
        walls: { top: true, right: true, bottom: true, left: true }
      })));
    }

    function shuffleLocal(arr) {
      for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    function carve(r = 0, c = 0) {
      maze[r][c].visited = true;
      shuffleLocal([...dirs]).forEach((dir) => {
        const nr = r + dir.dr;
        const nc = c + dir.dc;
        if (!inBounds(nr, nc) || maze[nr][nc].visited) return;
        maze[r][c].walls[dir.key] = false;
        maze[nr][nc].walls[dir.opposite] = false;
        carve(nr, nc);
      });
    }

    function inBounds(r, c) {
      return r >= 0 && r < rows && c >= 0 && c < cols;
    }

    function openNeighbors(pos) {
      const cell = maze[pos.r][pos.c];
      return dirs
        .filter((dir) => !cell.walls[dir.key])
        .map((dir) => ({ r: pos.r + dir.dr, c: pos.c + dir.dc }))
        .filter((next) => inBounds(next.r, next.c));
    }

    function bfs(start, goal = null) {
      const queue = [{ ...start, d: 0 }];
      const seen = Array.from({ length: rows }, () => Array(cols).fill(false));
      const parent = new Map();
      const keyOf = (p) => `${p.r},${p.c}`;
      seen[start.r][start.c] = true;
      let farthest = { ...start, d: 0 };
      while (queue.length) {
        const current = queue.shift();
        if (current.d > farthest.d) farthest = current;
        if (goal && current.r === goal.r && current.c === goal.c) {
          const path = [];
          let cursor = current;
          while (cursor) {
            path.push({ r: cursor.r, c: cursor.c });
            cursor = parent.get(keyOf(cursor));
          }
          return path.reverse();
        }
        openNeighbors(current).forEach((next) => {
          if (seen[next.r][next.c]) return;
          seen[next.r][next.c] = true;
          const entry = { ...next, d: current.d + 1 };
          parent.set(keyOf(entry), current);
          queue.push(entry);
        });
      }
      return goal ? [] : farthest;
    }

    function allReachable() {
      const queue = [{ ...player }];
      const seen = Array.from({ length: rows }, () => Array(cols).fill(false));
      const result = [];
      seen[player.r][player.c] = true;
      while (queue.length) {
        const current = queue.shift();
        result.push(current);
        openNeighbors(current).forEach((next) => {
          if (seen[next.r][next.c]) return;
          seen[next.r][next.c] = true;
          queue.push(next);
        });
      }
      return result;
    }

    function placeEntities() {
      keys = [];
      traps = [];
      hunters = [];
      collectedKeys = 0;
      requiredKeys = Math.min(1 + Math.floor((room - 1) / 3), 6);
      const trapCount = Math.min(2 + Math.floor(room / 2), 10);
      const hunterCount = Math.min(1 + Math.floor((room - 1) / 5), 4);
      const pool = allReachable().filter((cell) => {
        const isStart = cell.r === player.r && cell.c === player.c;
        const isExit = cell.r === exit.r && cell.c === exit.c;
        return !isStart && !isExit;
      });
      shuffleLocal(pool);
      for (let i = 0; i < requiredKeys && pool.length; i += 1) keys.push(pool.pop());
      for (let i = 0; i < trapCount && pool.length; i += 1) traps.push(pool.pop());
      const far = bfs(player);
      if (!(far.r === exit.r && far.c === exit.c)) hunters.push({ r: far.r, c: far.c });
      for (let i = hunters.length; i < hunterCount && pool.length; i += 1) hunters.push(pool.pop());
    }

    function startRoom(resetRun = false) {
      if (resetRun) {
        room = 1;
        lives = 3;
      }
      makeGrid();
      carve(0, 0);
      player = { r: 0, c: 0 };
      exit = { r: rows - 1, c: cols - 1 };
      placeEntities();
      running = true;
      startBtn.textContent = "Restart Labyrinth";
      setMessage(statusEl, `Room ${room}. Collect ${requiredKeys} key${requiredKeys === 1 ? "" : "s"} and reach the exit.`);
      updateHud();
      draw();
    }

    function drawEmptyBoard() {
      ctx.fillStyle = cssVar("--bg2");
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = cssVar("--text-muted");
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Start the labyrinth", canvas.width / 2, canvas.height / 2);
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = cssVar("--bg2");
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = cssVar("--card-border");
      ctx.lineWidth = 2;
      maze.flat().forEach((cell) => {
        const x = cell.c * cellSize;
        const y = cell.r * cellSize;
        ctx.beginPath();
        if (cell.walls.top) { ctx.moveTo(x, y); ctx.lineTo(x + cellSize, y); }
        if (cell.walls.right) { ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize, y + cellSize); }
        if (cell.walls.bottom) { ctx.moveTo(x, y + cellSize); ctx.lineTo(x + cellSize, y + cellSize); }
        if (cell.walls.left) { ctx.moveTo(x, y); ctx.lineTo(x, y + cellSize); }
        ctx.stroke();
      });

      drawCell(exit, cssVar("--accent2"), "▣");
      keys.forEach((key) => drawCell(key, cssVar("--accent3"), "◆"));
      traps.forEach((trap) => drawCell(trap, cssVar("--accent2"), "▲"));
      hunters.forEach((hunter) => drawCell(hunter, cssVar("--accent3"), "■"));
      drawPlayer();
    }

    function drawCell(cell, color, symbol) {
      const x = cell.c * cellSize + cellSize / 2;
      const y = cell.r * cellSize + cellSize / 2;
      ctx.fillStyle = color;
      ctx.font = `${Math.floor(cellSize * 0.45)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(symbol, x, y);
    }

    function drawPlayer() {
      ctx.fillStyle = cssVar("--accent");
      ctx.beginPath();
      ctx.arc(player.c * cellSize + cellSize / 2, player.r * cellSize + cellSize / 2, cellSize * 0.24, 0, Math.PI * 2);
      ctx.fill();
    }

    function cssVar(name) {
      return getComputedStyle(document.body).getPropertyValue(name).trim() || "#fff";
    }

    function updateHud() {
      if (roomEl) roomEl.textContent = String(room);
      if (livesEl) livesEl.textContent = String(lives);
      if (keysEl) keysEl.textContent = String(Math.max(0, requiredKeys - collectedKeys));
    }

    function movePlayer(dr, dc) {
      if (!running) return;
      const current = maze[player.r][player.c];
      const dir = dirs.find((d) => d.dr === dr && d.dc === dc);
      if (!dir || current.walls[dir.key]) return;
      const next = { r: player.r + dr, c: player.c + dc };
      if (!inBounds(next.r, next.c)) return;
      player = next;

      const keyIndex = keys.findIndex((key) => key.r === player.r && key.c === player.c);
      if (keyIndex >= 0) {
        keys.splice(keyIndex, 1);
        collectedKeys += 1;
        setMessage(statusEl, `Key collected. ${Math.max(0, requiredKeys - collectedKeys)} left.`);
      }

      const trapIndex = traps.findIndex((trap) => trap.r === player.r && trap.c === player.c);
      if (trapIndex >= 0) {
        traps.splice(trapIndex, 1);
        lives -= 1;
        player = { r: 0, c: 0 };
        setMessage(statusEl, "Trap triggered. You lost one life and returned to spawn.");
      }

      moveHunters();
      if (hunters.some((hunter) => hunter.r === player.r && hunter.c === player.c)) {
        lives -= 1;
        player = { r: 0, c: 0 };
        setMessage(statusEl, "A hunter caught you. You returned to spawn.");
      }

      if (lives <= 0) {
        running = false;
        setMessage(statusEl, "Game over. Press Restart Labyrinth for a new run.");
        updateHud();
        draw();
        return;
      }

      if (player.r === exit.r && player.c === exit.c) {
        if (collectedKeys < requiredKeys) {
          setMessage(statusEl, `Exit locked. You still need ${requiredKeys - collectedKeys} key${requiredKeys - collectedKeys === 1 ? "" : "s"}.`);
        } else {
          room += 1;
          if ((room - 1) % 5 === 0) lives += 1;
          startRoom(false);
          return;
        }
      }
      updateHud();
      draw();
    }

    function moveHunters() {
      hunters.forEach((hunter) => {
        const path = bfs(hunter, player);
        if (path.length > 1) {
          hunter.r = path[1].r;
          hunter.c = path[1].c;
        }
      });
    }

    function createControls() {
      if ($("#labControls")) return;
      const wrap = document.createElement("div");
      wrap.id = "labControls";
      wrap.className = "lab-controls";
      wrap.innerHTML = `
        <button class="btn btn-outline" type="button" data-lab-move="0,-1">◀</button>
        <div class="lab-control-stack">
          <button class="btn btn-outline" type="button" data-lab-move="-1,0">▲</button>
          <button class="btn btn-outline" type="button" data-lab-move="1,0">▼</button>
        </div>
        <button class="btn btn-outline" type="button" data-lab-move="0,1">▶</button>`;
      startBtn.parentElement?.insertBefore(wrap, startBtn.nextSibling);
      $$('[data-lab-move]', wrap).forEach((button) => {
        button.addEventListener("click", () => {
          const [dr, dc] = button.dataset.labMove.split(",").map(Number);
          movePlayer(dr, dc);
        });
      });
    }

    startBtn.addEventListener("click", () => startRoom(true));
    window.addEventListener("keydown", (event) => {
      if (!running || isTypingField(document.activeElement)) return;
      const moves = {
        ArrowUp: [-1, 0], w: [-1, 0], W: [-1, 0],
        ArrowDown: [1, 0], s: [1, 0], S: [1, 0],
        ArrowLeft: [0, -1], a: [0, -1], A: [0, -1],
        ArrowRight: [0, 1], d: [0, 1], D: [0, 1]
      };
      const move = moves[event.key];
      if (!move) return;
      event.preventDefault();
      movePlayer(move[0], move[1]);
    });
    window.addEventListener("pocketarcade:themechange", () => running ? draw() : drawEmptyBoard());
  }

  function initGlitchGarden() {
    const boardEl = $("#glitchBoard");
    const toolbarEl = $("#glitchToolbar");
    const waveEl = $("#ggWave");
    const moneyEl = $("#ggMoney");
    const livesEl = $("#ggLives");
    const startBtn = $("#ggStartWave");
    const resetBtn = $("#ggReset");
    const messageEl = $("#ggMessage");
    if (!boardEl || !toolbarEl || !startBtn || !resetBtn) return;

    const rows = 12;
    const cols = 12;
    const towerDefs = [
      { id: "laser", name: "Laser", cost: 25, range: 3, rate: 0.55, damage: 4, note: "steady single target" },
      { id: "frost", name: "Frost", cost: 30, range: 3, rate: 0.9, damage: 2, slow: 1.2, note: "slows runners" },
      { id: "flame", name: "Flame", cost: 35, range: 2, rate: 0.85, damage: 2, burn: 1.6, canSeeStealth: true, note: "burns over time" },
      { id: "tesla", name: "Tesla", cost: 40, range: 3, rate: 1.15, damage: 3, chain: 2, canSeeStealth: true, note: "chains targets" },
      { id: "missile", name: "Missile", cost: 50, range: 4, rate: 1.6, damage: 7, aoe: 1, canSeeStealth: true, note: "splash damage" },
      { id: "poison", name: "Poison", cost: 45, range: 3, rate: 0.95, damage: 1, poison: 2.3, canSeeStealth: true, note: "stacking pressure" },
      { id: "shock", name: "Shock", cost: 55, range: 2, rate: 1.9, damage: 4, pulse: true, canSeeStealth: true, note: "hits all in range" }
    ];
    const trapDefs = [
      { id: "spike", name: "Spike", cost: 20, damage: 8, single: true, note: "single target" },
      { id: "bomb", name: "Bomb", cost: 30, damage: 6, aoe: 1, single: true, note: "small blast" },
      { id: "tar", name: "Tar", cost: 25, slow: 1.8, note: "reusable slow" },
      { id: "mine", name: "Mine", cost: 35, damage: 11, aoe: 1, single: true, note: "heavy blast" }
    ];
    const enemyDefs = {
      normal: { label: "N", hp: 12, speed: 1.25, reward: 5, cls: "enemy-normal" },
      fast: { label: "F", hp: 9, speed: 1.95, reward: 6, cls: "enemy-fast" },
      tank: { label: "T", hp: 28, speed: 0.85, reward: 11, cls: "enemy-tank" },
      fly: { label: "A", hp: 14, speed: 1.65, reward: 8, cls: "enemy-fly", flying: true },
      shielded: { label: "S", hp: 17, shield: 10, speed: 1.05, reward: 12, cls: "enemy-shield" },
      regenerator: { label: "R", hp: 20, speed: 1.1, reward: 13, regen: 1.4, cls: "enemy-regenerator" },
      splitter: { label: "X", hp: 18, speed: 1.25, reward: 15, splitter: true, cls: "enemy-splitter" },
      stealth: { label: "?", hp: 12, speed: 1.45, reward: 9, stealth: true, cls: "enemy-stealth" },
      boss: { label: "B", hp: 110, speed: 0.8, reward: 55, cls: "enemy-boss" },
      child: { label: "c", hp: 8, speed: 1.7, reward: 2, cls: "enemy-split-child" }
    };

    let board = [];
    let path = [];
    let towers = [];
    let traps = [];
    let enemies = [];
    let selected = null;
    let wave = 1;
    let money = 120;
    let lives = 10;
    let mode = "build";
    let raf = 0;
    let lastTime = 0;
    let waveSpawn = { remaining: 0, timer: 0, index: 0 };

    buildToolbar();
    createAutoPathButton();
    resetGame();

    function buildToolbar() {
      toolbarEl.innerHTML = "";
      addToolbarHeader("Towers");
      towerDefs.forEach((def) => addToolbarItem("tower", def));
      addToolbarHeader("Traps");
      trapDefs.forEach((def) => addToolbarItem("trap", def));
    }

    function addToolbarHeader(text) {
      const title = document.createElement("div");
      title.className = "sidebar-title toolbar-heading";
      title.textContent = text;
      toolbarEl.appendChild(title);
    }

    function addToolbarItem(type, def) {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "toolbar-item";
      item.dataset.type = type;
      item.dataset.id = def.id;
      item.innerHTML = `
        <span class="toolbar-icon ${type === "tower" ? `tower-${def.id}` : `trap-${def.id}`}"></span>
        <span class="toolbar-name">${def.name}<small>${def.note}</small></span>
        <span class="toolbar-cost">$${def.cost}</span>`;
      item.addEventListener("click", () => {
        $$(".toolbar-item", toolbarEl).forEach((el) => el.classList.remove("selected"));
        item.classList.add("selected");
        selected = { type, id: def.id };
      });
      toolbarEl.appendChild(item);
    }

    function createAutoPathButton() {
      const controls = $(".sidebar-controls");
      if (!controls || $("#ggAutoPath")) return;
      const auto = document.createElement("button");
      auto.id = "ggAutoPath";
      auto.className = "btn btn-outline btn-full";
      auto.type = "button";
      auto.textContent = "Auto Path";
      auto.addEventListener("click", autoPathToBase);
      controls.insertBefore(auto, startBtn);
    }

    function resetGame() {
      cancelAnimationFrame(raf);
      raf = 0;
      lastTime = 0;
      startBtn.disabled = false;
      boardEl.querySelectorAll(".bullet,.enemy").forEach((el) => el.remove());
      board = [];
      path = [];
      towers = [];
      traps = [];
      enemies = [];
      selected = null;
      wave = 1;
      money = 120;
      lives = 10;
      mode = "build";
      waveSpawn = { remaining: 0, timer: 0, index: 0 };
      $$(".toolbar-item", toolbarEl).forEach((el) => el.classList.remove("selected"));
      buildBoard();
      updateHud();
      setMessage(messageEl, "Dig a connected route from the green spawn to the red base, then build towers.", 5000);
    }

    function buildBoard() {
      boardEl.innerHTML = "";
      for (let r = 0; r < rows; r += 1) {
        const row = [];
        for (let c = 0; c < cols; c += 1) {
          const cell = { r, c, type: "block", base: r === rows - 1 && c === cols - 1, spawn: r === 0 && c === 0, tower: null, trap: null, el: null };
          const div = document.createElement("button");
          div.type = "button";
          div.className = "cell block";
          if (cell.spawn) div.classList.add("spawn");
          if (cell.base) div.classList.add("base");
          div.setAttribute("aria-label", cell.spawn ? "Spawn" : cell.base ? "Base" : `Cell ${r + 1}, ${c + 1}`);
          div.addEventListener("click", () => onCellClick(cell));
          cell.el = div;
          boardEl.appendChild(div);
          row.push(cell);
        }
        board.push(row);
      }
      const spawn = board[0][0];
      spawn.type = "path";
      path.push(spawn);
      syncCell(spawn);
      highlightNextCells();
    }

    function onCellClick(cell) {
      if (mode !== "build") return;
      if (cell.el.classList.contains("highlight")) {
        digCell(cell);
        return;
      }
      if (!selected) return;
      if (selected.type === "tower") placeTower(cell, selected.id);
      else placeTrap(cell, selected.id);
    }

    function digCell(cell) {
      if (cell.type === "path") return;
      cell.type = "path";
      path.push(cell);
      syncCell(cell);
      highlightNextCells();
      if (cell.base) setMessage(messageEl, "Path connected. Place towers beside the route, then start the wave.", 4000);
    }

    function syncCell(cell) {
      cell.el.className = "cell";
      cell.el.classList.add(cell.type === "path" ? "path" : "block");
      if (cell.spawn) cell.el.classList.add("spawn");
      if (cell.base) cell.el.classList.add("base");
    }

    function highlightNextCells() {
      board.flat().forEach((cell) => cell.el.classList.remove("highlight"));
      if (isPathComplete()) return;
      const last = path[path.length - 1];
      neighbors(last).forEach((cell) => {
        if (cell.type !== "block") return;
        if (!cell.base && touchesOldPath(cell, last)) return;
        cell.el.classList.add("highlight");
      });
    }

    function touchesOldPath(cell, except) {
      return neighbors(cell).some((near) => near.type === "path" && near !== except);
    }

    function neighbors(cell) {
      return [[-1, 0], [1, 0], [0, -1], [0, 1]]
        .map(([dr, dc]) => board[cell.r + dr]?.[cell.c + dc])
        .filter(Boolean);
    }

    function autoPathToBase() {
      if (mode !== "build") return;
      if (towers.length || traps.length) {
        setMessage(messageEl, "Auto Path is only for the empty setup map. Use Reset Map first if you want a new route.", 3500);
        return;
      }
      resetPathOnly();
      let current = path[path.length - 1];
      while (current.c < cols - 1) {
        current = board[current.r][current.c + 1];
        digCell(current);
      }
      while (current.r < rows - 1) {
        current = board[current.r + 1][current.c];
        digCell(current);
      }
      setMessage(messageEl, "Auto path created. Add towers and traps before starting the wave.", 4000);
    }

    function resetPathOnly() {
      board.flat().forEach((cell) => {
        cell.type = "block";
        cell.tower = null;
        cell.trap = null;
        cell.el.innerHTML = "";
        syncCell(cell);
      });
      towers = [];
      traps = [];
      path = [];
      const spawn = board[0][0];
      spawn.type = "path";
      path.push(spawn);
      syncCell(spawn);
    }

    function placeTower(cell, id) {
      const def = towerDefs.find((item) => item.id === id);
      if (!def || cell.type !== "block" || cell.base || cell.spawn || cell.tower || money < def.cost) {
        if (def && money < def.cost) setMessage(messageEl, "Not enough money for that tower.", 2000);
        return;
      }
      money -= def.cost;
      const tower = { ...def, r: cell.r, c: cell.c, cooldown: 0 };
      towers.push(tower);
      cell.tower = tower;
      const el = document.createElement("span");
      el.className = `tower tower-${id}`;
      el.textContent = def.name[0];
      cell.el.appendChild(el);
      updateHud();
    }

    function placeTrap(cell, id) {
      const def = trapDefs.find((item) => item.id === id);
      if (!def || cell.type !== "path" || cell.spawn || cell.base || cell.trap || money < def.cost) {
        if (def && money < def.cost) setMessage(messageEl, "Not enough money for that trap.", 2000);
        return;
      }
      money -= def.cost;
      const trap = { ...def, r: cell.r, c: cell.c, triggered: false };
      traps.push(trap);
      cell.trap = trap;
      const el = document.createElement("span");
      el.className = `trap trap-${id}`;
      el.textContent = id === "tar" ? "T" : id === "mine" ? "M" : id === "bomb" ? "B" : "S";
      cell.el.appendChild(el);
      updateHud();
    }

    function isPathComplete() {
      return path[path.length - 1]?.base === true;
    }

    function startWave() {
      if (mode !== "build") return;
      if (!isPathComplete()) {
        setMessage(messageEl, "Connect the path to the red base first. Use Auto Path if needed.", 3500);
        return;
      }
      mode = "wave";
      board.flat().forEach((cell) => cell.el.classList.remove("highlight"));
      waveSpawn = { remaining: Math.min(6 + wave * 2, 42), timer: 0, index: 0 };
      startBtn.disabled = true;
      lastTime = 0;
      setMessage(messageEl, `Wave ${wave} started.`);
      if (!raf) raf = requestAnimationFrame(loop);
    }

    function loop(time) {
      if (mode !== "wave") {
        raf = 0;
        return;
      }
      const dt = lastTime ? clamp((time - lastTime) / 1000, 0, 0.05) : 0;
      lastTime = time;
      updateSpawning(dt);
      updateEnemies(dt);
      updateTraps();
      updateTowers(dt);
      cleanupEnemies();
      if (lives <= 0) {
        mode = "over";
        startBtn.disabled = true;
        setMessage(messageEl, "Game over. Press Reset Map to try again.");
        raf = 0;
        return;
      }
      if (waveSpawn.remaining <= 0 && enemies.length === 0) {
        mode = "build";
        wave += 1;
        money += 18;
        startBtn.disabled = false;
        highlightNextCells();
        updateHud();
        setMessage(messageEl, `Wave ${wave - 1} cleared. Bonus money awarded.`, 4500);
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(loop);
    }

    function updateSpawning(dt) {
      if (waveSpawn.remaining <= 0) return;
      waveSpawn.timer -= dt;
      if (waveSpawn.timer > 0) return;
      spawnEnemy(getEnemyForWave(wave, waveSpawn.index));
      waveSpawn.index += 1;
      waveSpawn.remaining -= 1;
      waveSpawn.timer = Math.max(0.32, 0.85 - wave * 0.02);
    }

    function getEnemyForWave(currentWave, index) {
      if (currentWave % 10 === 0 && index === 0) return scaleEnemy("boss", currentWave);
      if (currentWave >= 8 && index % 7 === 0) return scaleEnemy(choice(["shielded", "regenerator", "splitter", "stealth"]), currentWave);
      if (currentWave >= 5 && index % 5 === 0) return scaleEnemy(choice(["tank", "fly", "fast"]), currentWave);
      if (currentWave >= 3 && index % 3 === 0) return scaleEnemy(choice(["fast", "tank"]), currentWave);
      return scaleEnemy("normal", currentWave);
    }

    function scaleEnemy(type, currentWave) {
      const base = enemyDefs[type];
      return {
        type,
        label: base.label,
        hp: Math.floor(base.hp + currentWave * (type === "boss" ? 14 : 2.5)),
        maxHp: Math.floor(base.hp + currentWave * (type === "boss" ? 14 : 2.5)),
        shield: base.shield || 0,
        speed: base.speed,
        reward: base.reward + Math.floor(currentWave / 3),
        regen: base.regen || 0,
        splitter: Boolean(base.splitter),
        stealth: Boolean(base.stealth),
        flying: Boolean(base.flying),
        cls: base.cls,
        pathIndex: 0,
        progress: 0,
        slow: 0,
        burn: 0,
        poison: 0,
        reachedBase: false,
        child: type === "child"
      };
    }

    function spawnEnemy(data) {
      const el = document.createElement("span");
      el.className = `enemy ${data.cls}`;
      el.textContent = data.label;
      boardEl.appendChild(el);
      const enemy = { ...data, el };
      enemies.push(enemy);
      renderEnemy(enemy);
    }

    function spawnChild(parent) {
      const child = scaleEnemy("child", wave);
      child.pathIndex = parent.pathIndex;
      child.progress = parent.progress;
      spawnEnemy(child);
    }

    function updateEnemies(dt) {
      enemies.forEach((enemy) => {
        if (enemy.hp <= 0 || enemy.reachedBase) return;
        if (enemy.slow > 0) enemy.slow -= dt;
        if (enemy.burn > 0) {
          enemy.burn -= dt;
          enemy.hp -= 3.2 * dt;
        }
        if (enemy.poison > 0) {
          enemy.poison -= dt;
          enemy.hp -= 2.4 * dt;
        }
        if (enemy.regen > 0) enemy.hp = Math.min(enemy.maxHp, enemy.hp + enemy.regen * dt);
        const speedMultiplier = enemy.slow > 0 ? 0.48 : 1;
        enemy.progress += enemy.speed * speedMultiplier * dt;
        while (enemy.progress >= 1 && !enemy.reachedBase) {
          enemy.progress -= 1;
          enemy.pathIndex += 1;
          if (enemy.pathIndex >= path.length - 1) {
            enemy.reachedBase = true;
            enemy.hp = 0;
            lives -= enemy.type === "boss" ? 3 : 1;
            updateHud();
          }
        }
        renderEnemy(enemy);
      });
    }

    function renderEnemy(enemy) {
      const a = path[clamp(enemy.pathIndex, 0, path.length - 1)];
      const b = path[clamp(enemy.pathIndex + 1, 0, path.length - 1)] || a;
      const start = cellCenter(a);
      const end = cellCenter(b);
      const x = start.x + (end.x - start.x) * enemy.progress;
      const y = start.y + (end.y - start.y) * enemy.progress;
      enemy.el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      enemy.el.title = `${enemy.type}: ${Math.ceil(enemy.hp)} HP${enemy.shield ? `, ${Math.ceil(enemy.shield)} shield` : ""}`;
    }

    function updateTraps() {
      for (let i = traps.length - 1; i >= 0; i -= 1) {
        const trap = traps[i];
        let used = false;
        enemies.forEach((enemy) => {
          if (enemy.hp <= 0 || enemy.reachedBase || enemy.flying) return;
          const currentCell = path[enemy.pathIndex];
          if (!currentCell || currentCell.r !== trap.r || currentCell.c !== trap.c) return;
          if (trap.slow) enemy.slow = Math.max(enemy.slow, trap.slow);
          if (trap.damage) {
            if (trap.aoe) damageAround(trap, trap.damage, trap.aoe);
            else applyDamage(enemy, trap.damage);
          }
          used = used || trap.single;
        });
        if (used) removeTrap(i);
      }
    }

    function removeTrap(index) {
      const trap = traps[index];
      const cell = board[trap.r][trap.c];
      cell.trap = null;
      cell.el.querySelector(".trap")?.remove();
      traps.splice(index, 1);
    }

    function updateTowers(dt) {
      towers.forEach((tower) => {
        tower.cooldown -= dt;
        if (tower.cooldown > 0) return;
        const targets = enemies
          .filter((enemy) => enemy.hp > 0 && !enemy.reachedBase)
          .filter((enemy) => !enemy.stealth || tower.canSeeStealth)
          .filter((enemy) => distance(tower, path[enemy.pathIndex]) <= tower.range)
          .sort((a, b) => (b.pathIndex + b.progress) - (a.pathIndex + a.progress));
        if (!targets.length) return;
        if (tower.pulse) {
          targets.forEach((enemy) => applyTowerEffect(tower, enemy));
          pulseAt(tower);
        } else {
          const chosen = targets.slice(0, 1 + (tower.chain || 0));
          chosen.forEach((enemy) => {
            applyTowerEffect(tower, enemy);
            shootVisual(tower, enemy);
            if (tower.aoe) damageAround(path[enemy.pathIndex], tower.damage, tower.aoe, enemy);
          });
        }
        tower.cooldown = tower.rate;
      });
    }

    function applyTowerEffect(tower, enemy) {
      applyDamage(enemy, tower.damage);
      if (tower.slow) enemy.slow = Math.max(enemy.slow, tower.slow);
      if (tower.burn) enemy.burn = Math.max(enemy.burn, tower.burn);
      if (tower.poison) enemy.poison = Math.max(enemy.poison, tower.poison);
    }

    function applyDamage(enemy, amount) {
      if (enemy.shield > 0) {
        const used = Math.min(enemy.shield, amount);
        enemy.shield -= used;
        amount -= used;
      }
      enemy.hp -= Math.max(0, amount);
    }

    function damageAround(centerCell, amount, radius, skip = null) {
      enemies.forEach((enemy) => {
        if (enemy === skip || enemy.hp <= 0 || enemy.reachedBase) return;
        if (distance(centerCell, path[enemy.pathIndex]) <= radius) applyDamage(enemy, amount * 0.75);
      });
    }

    function cleanupEnemies() {
      for (let i = enemies.length - 1; i >= 0; i -= 1) {
        const enemy = enemies[i];
        if (enemy.hp > 0) continue;
        if (!enemy.reachedBase) {
          money += enemy.reward;
          if (enemy.splitter && !enemy.child) {
            spawnChild(enemy);
            spawnChild(enemy);
          }
        }
        enemy.el.remove();
        enemies.splice(i, 1);
        updateHud();
      }
    }

    function shootVisual(tower, enemy) {
      const bullet = document.createElement("span");
      bullet.className = `bullet bullet-${tower.id}`;
      const start = cellCenter(tower);
      const end = cellCenter(path[enemy.pathIndex]);
      bullet.style.transform = `translate(${start.x}px, ${start.y}px) translate(-50%, -50%)`;
      boardEl.appendChild(bullet);
      requestAnimationFrame(() => {
        bullet.style.transform = `translate(${end.x}px, ${end.y}px) translate(-50%, -50%)`;
        bullet.style.opacity = "0";
      });
      setTimeout(() => bullet.remove(), 360);
    }

    function pulseAt(tower) {
      const pulse = document.createElement("span");
      pulse.className = "bullet bullet-shock pulse-ring";
      const center = cellCenter(tower);
      pulse.style.transform = `translate(${center.x}px, ${center.y}px) translate(-50%, -50%)`;
      boardEl.appendChild(pulse);
      requestAnimationFrame(() => {
        pulse.style.transform = `translate(${center.x}px, ${center.y}px) translate(-50%, -50%) scale(${tower.range * 2.2})`;
        pulse.style.opacity = "0";
      });
      setTimeout(() => pulse.remove(), 520);
    }

    function cellCenter(cell) {
      const cellEl = board[cell.r]?.[cell.c]?.el;
      if (!cellEl) return { x: 0, y: 0 };
      const boardRect = boardEl.getBoundingClientRect();
      const rect = cellEl.getBoundingClientRect();
      return { x: rect.left - boardRect.left + rect.width / 2, y: rect.top - boardRect.top + rect.height / 2 };
    }

    function distance(a, b) {
      if (!a || !b) return Infinity;
      return Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
    }

    function updateHud() {
      if (waveEl) waveEl.textContent = String(wave);
      if (moneyEl) moneyEl.textContent = String(Math.floor(money));
      if (livesEl) livesEl.textContent = String(Math.max(0, lives));
    }

    startBtn.addEventListener("click", startWave);
    resetBtn.addEventListener("click", resetGame);
  }
})();
