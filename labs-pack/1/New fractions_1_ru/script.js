// State (дерево прямоугольников)
/**
 * Узел прямоугольника: { x, y, w, h, depth } в процентах от контейнера [0..100].
 * depth — количество делений данной области (0 у целого, 1 после первого деления и т.д.)
 */
let cells = [{ x: 0, y: 0, w: 100, h: 100, depth: 0 }];
let splitNextIsVertical = true; // направление следующего удара по умолчанию

let tasks = [];
let currentTaskIndex = 0;

// DOM
const btnTheory = document.getElementById('btnTheory');
const btnGame = document.getElementById('btnGame');
const sectionTheory = document.getElementById('sectionTheory');
const sectionGame = document.getElementById('sectionGame');

const gridEl = document.getElementById('grid');
const partsCountEl = document.getElementById('partsCount');
const nextSplitEl = document.getElementById('nextSplit');

const btnHammer = document.getElementById('btnHammer');
const btnToggleDir = document.getElementById('btnToggleDir');
const btnClear = document.getElementById('btnClear');
const btnSubmit = document.getElementById('btnSubmit');

const chatLog = document.getElementById('chatLog');

// Utils
function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function parts() { return cells.length; }

// Цвета для размеров (depth -> color)
const depthColorMap = new Map();
function hsl(h, s, l) { return `hsl(${h} ${s}% ${l}%)`; }
function pickDistinctHue() {
  // стараемся выбирать оттенок не ближе 18° к уже выбранным
  const usedHues = Array.from(depthColorMap.values()).map(c => {
    const m = c.match(/hsl\((\d+)/);
    return m ? Number(m[1]) : null;
  }).filter(v => v !== null);
  for (let tries = 0; tries < 20; tries++) {
    const h = Math.floor(Math.random() * 360);
    if (usedHues.length === 0) return h;
    const ok = usedHues.every(u => Math.min(Math.abs(u - h), 360 - Math.abs(u - h)) >= 18);
    if (ok) return h;
  }
  return Math.floor(Math.random() * 360);
}
function colorForDepth(depth) {
  if (depth === 0) return 'var(--cell)';
  if (!depthColorMap.has(depth)) {
    const hue = pickDistinctHue();
    const color = hsl(hue, 70, 86); // пастельный
    depthColorMap.set(depth, color);
  }
  return depthColorMap.get(depth);
}

function renderGrid() {
  gridEl.innerHTML = '';
  const total = parts();
  for (let i = 0; i < total; i++) {
    const rect = cells[i];
    const el = document.createElement('div');
    el.className = 'cell';
    el.style.left = rect.x + '%';
    el.style.top = rect.y + '%';
    el.style.width = rect.w + '%';
    el.style.height = rect.h + '%';
    el.style.backgroundColor = colorForDepth(rect.depth);
    el.dataset.index = String(i);
    gridEl.appendChild(el);
  }
  partsCountEl.textContent = String(total);
  nextSplitEl.textContent = splitNextIsVertical ? 'по вертикали' : 'по горизонтали';
}

function flashCells() {
  const cells = gridEl.querySelectorAll('.cell');
  cells.forEach(c => {
    c.classList.remove('flash');
    // force reflow
    // eslint-disable-next-line no-unused-expressions
    c.offsetWidth;
    c.classList.add('flash');
  });
}

function splitWithHammerOnCell(targetIndex, forceDirection /* 'vertical' | 'horizontal' | null */ = null, invert = false) {
  // Hard cap to avoid too many DOM nodes
  if (parts() >= 1024) {
    addTeacherMsg('Дальше дробить не будем — слишком много частей. Попробуй отправить на проверку или очистить поле.');
    return;
  }

  // decide which direction to use for this hit
  let useVertical;
  if (forceDirection === 'vertical') {
    useVertical = true;
  } else if (forceDirection === 'horizontal') {
    useVertical = false;
  } else {
    useVertical = invert ? !splitNextIsVertical : splitNextIsVertical;
  }

  const rect = cells[targetIndex];
  if (!rect) return;
  // Разбиваем выбранную ячейку пополам по выбранной оси
  if (useVertical) {
    const half = rect.w / 2;
    const left = { x: rect.x, y: rect.y, w: half, h: rect.h, depth: rect.depth + 1 };
    const right = { x: rect.x + half, y: rect.y, w: half, h: rect.h, depth: rect.depth + 1 };
    cells.splice(targetIndex, 1, left, right);
  } else {
    const half = rect.h / 2;
    const top = { x: rect.x, y: rect.y, w: rect.w, h: half, depth: rect.depth + 1 };
    const bottom = { x: rect.x, y: rect.y + half, w: rect.w, h: half, depth: rect.depth + 1 };
    cells.splice(targetIndex, 1, top, bottom);
  }
  // направление больше НЕ переключаем автоматически — им управляет кнопка/модификаторы
  renderGrid();
  flashCells();
}

function clearField() {
  cells = [{ x: 0, y: 0, w: 100, h: 100, depth: 0 }];
  splitNextIsVertical = true;
  renderGrid();
}

// Chat helpers
function addMsg(who, text) {
  const wrap = document.createElement('div');
  wrap.className = `msg ${who === 'Ты' ? 'me' : 'ai'}`;
  const whoEl = document.createElement('div');
  whoEl.className = 'who';
  whoEl.textContent = who;
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = text;
  wrap.appendChild(whoEl);
  wrap.appendChild(bubble);
  chatLog.appendChild(wrap);
  chatLog.scrollTop = chatLog.scrollHeight;
}
function addTeacherMsg(text) { addMsg('Учитель', text); }
function addStudentMsg(text) { addMsg('Ты', text); }

// Tasks
function buildTasks() {
  // Чередуем задания: количество частей и доля 1/n (n — степень двойки)
  const targets = [2, 4, 8, 16, 32, 64, 8, 4, 16, 32];
  tasks = targets.map((n, idx) => {
    const type = idx % 2 === 0 ? 'parts' : 'fraction';
    const text = type === 'parts'
      ? `Задание ${idx + 1}: сделай на поле ровно <b>${n}</b> частей (можно разного размера).`
      : `Задание ${idx + 1}: сделай долю <b>1/${n}</b> — то есть получи хотя бы одну часть размером 1/${n}.`;
    return { n, type, text };
  });
}

function startFirstTask() {
  currentTaskIndex = 0;
  const t = tasks[currentTaskIndex];
  addTeacherMsg('Добро пожаловать в игру! Каждый удар делит выбранную область на две части и увеличивает общее число частей на 1.');
  addTeacherMsg(t.text);
}

function moveToNextTaskOrFinish() {
  currentTaskIndex += 1;
  if (currentTaskIndex >= tasks.length) {
    addTeacherMsg('Отличная работа! Все задания выполнены. Поле будет очищено.');
    clearField();
    return;
  }
  clearField();
  const t = tasks[currentTaskIndex];
  addTeacherMsg(`Новое задание. ${t.text}`);
}

function submitForCheck() {
  const task = tasks[currentTaskIndex];
  const now = parts();
  const target = task.n;
  addStudentMsg(`Отправляю на проверку: сейчас частей <b>${now}</b>.`);

  if (task.type === 'parts') {
    if (now === target) {
      addTeacherMsg('Правильно! Молодец. Переходим к следующему заданию.');
      moveToNextTaskOrFinish();
      return;
    }
    if (now < target) {
      const hits = target - now;
      addTeacherMsg(`Ещё рано: у тебя <b>${now}</b>, нужно <b>${target}</b>. Подсказка: сделай ещё <b>${hits}</b> удар(ов), деля любые части.`);
    } else {
      addTeacherMsg(`Перебор: у тебя <b>${now}</b>, а нужно <b>${target}</b>. Очисти поле и попробуй снова.`);
    }
    return;
  }

  // fraction 1/n
  const k = Math.log2(target);
  const isPow2 = Number.isInteger(k);
  if (!isPow2) {
    addTeacherMsg('Это задание требует долю 1/n, где n — степень двойки. Пожалуйста, сообщи автору об ошибке задания.');
    return;
  }
  const hasExact = cells.some(c => c.depth === k);
  if (hasExact) {
    addTeacherMsg('Правильно! На поле есть часть размера 1/' + target + '. Переходим дальше.');
    moveToNextTaskOrFinish();
    return;
  }
  const minDepth = Math.min(...cells.map(c => c.depth));
  const maxDepth = Math.max(...cells.map(c => c.depth));
  if (minDepth > k) {
    addTeacherMsg(`Части уже меньше, чем 1/${target}. Решение недостижимо без очистки: нажми «Очистить поле».`);
    return;
  }
  // Найдём наибольшую глубину, которая меньше целевой
  const bestDepth = Math.max(...cells.map(c => c.depth).filter(d => d < k));
  const hits = k - bestDepth;
  addTeacherMsg(`Пока нет части 1/${target}. Подсказка: выбери более крупную часть (глубина ${bestDepth}) и раздели её ещё <b>${hits}</b> раз(а).`);
}

// Mode switching
function showTheory() {
  sectionTheory.classList.remove('hidden');
  sectionGame.classList.add('hidden');
  btnTheory.classList.add('active');
  btnGame.classList.remove('active');
  btnTheory.setAttribute('aria-pressed', 'true');
  btnGame.setAttribute('aria-pressed', 'false');
}
function showGame() {
  sectionTheory.classList.add('hidden');
  sectionGame.classList.remove('hidden');
  btnTheory.classList.remove('active');
  btnGame.classList.add('active');
  btnTheory.setAttribute('aria-pressed', 'false');
  btnGame.setAttribute('aria-pressed', 'true');
}

// Init
function init() {
  buildTasks();
  renderGrid();
  startFirstTask();

  // Кнопка молотка бьёт по самой большой части
  btnHammer.addEventListener('click', () => {
    const idx = indexOfLargestCell();
    splitWithHammerOnCell(idx);
  });
  btnToggleDir.addEventListener('click', () => {
    splitNextIsVertical = !splitNextIsVertical;
    nextSplitEl.textContent = splitNextIsVertical ? 'по вертикали' : 'по горизонтали';
    btnToggleDir.textContent = `Направление: ${splitNextIsVertical ? 'вертикально' : 'горизонтально'}`;
    btnToggleDir.setAttribute('aria-pressed', String(!splitNextIsVertical));
  });
  btnClear.addEventListener('click', () => {
    addStudentMsg('Очищаю поле.');
    clearField();
  });
  btnSubmit.addEventListener('click', submitForCheck);

  btnTheory.addEventListener('click', showTheory);
  btnGame.addEventListener('click', showGame);

  // Mouse controls on the grid
  gridEl.addEventListener('click', (e) => {
    // Вычисляем, по какой ячейке кликнули
    const target = e.target.closest('.cell');
    if (!target) return;
    const idx = Number(target.dataset.index);
    // Left click: default; Shift forces vertical; Ctrl/Meta forces horizontal
    const force = e.shiftKey ? 'vertical' : ((e.ctrlKey || e.metaKey) ? 'horizontal' : null);
    splitWithHammerOnCell(idx, force);
    gridEl.classList.add('hit');
    setTimeout(() => gridEl.classList.remove('hit'), 140);
  });
  gridEl.addEventListener('contextmenu', (e) => {
    // Right click on cell: invert current planned direction for that cell
    e.preventDefault();
    const target = e.target.closest('.cell');
    if (!target) return;
    const idx = Number(target.dataset.index);
    splitWithHammerOnCell(idx, null, true);
    gridEl.classList.add('hit');
    setTimeout(() => gridEl.classList.remove('hit'), 140);
  });
}

function indexOfLargestCell() {
  let best = 0;
  let bestArea = -1;
  for (let i = 0; i < cells.length; i++) {
    const a = cells[i].w * cells[i].h;
    if (a > bestArea) { bestArea = a; best = i; }
  }
  return best;
}

window.addEventListener('DOMContentLoaded', init);


