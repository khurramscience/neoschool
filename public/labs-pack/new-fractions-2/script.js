// State (rectangles tree)
/**
 * Rectangle node: { x, y, w, h, depth } in percents of container [0..100].
 * depth — number of splits applied to the area (0 for the whole, 1 after first split, etc.)
 */
let cells = [{ x: 0, y: 0, w: 100, h: 100, depth: 0 }];
let splitNextIsVertical = true; // default hammer direction

// Draw mode state
const DEFAULT_DRAW_COLOR = '#dbeafe'; // light blue
let isDrawingMode = false;
let currentTool = 'split'; // 'split' | 'paint'
let selectedColor = '#3b82f6';
let inspectFraction = false;

let tasks = [];
let currentTaskIndex = 0;

// DOM
const btnTheory = document.getElementById('btnTheory');
const btnGame = document.getElementById('btnGame');
const btnDraw = document.getElementById('btnDraw');
const sectionTheory = document.getElementById('sectionTheory');
const sectionGame = document.getElementById('sectionGame');

const gridEl = document.getElementById('grid');
const partsCountEl = document.getElementById('partsCount');
const nextSplitEl = document.getElementById('nextSplit');

const btnHammer = document.getElementById('btnHammer');
const btnToggleDir = document.getElementById('btnToggleDir');
const btnClear = document.getElementById('btnClear');
const btnSubmit = document.getElementById('btnSubmit');
const btnFraction = document.getElementById('btnFraction');

// Draw controls
const drawControls = document.getElementById('drawControls');
const btnPaint = document.getElementById('btnPaint');
const colorPicker = document.getElementById('colorPicker');

const chatAside = document.querySelector('.right.chat');

const chatLog = document.getElementById('chatLog');

// Utils
function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function parts() { return cells.length; }

// Colors for sizes (depth -> color)
const depthColorMap = new Map();
function hsl(h, s, l) { return `hsl(${h} ${s}% ${l}%)`; }
function pickDistinctHue() {
  // try to pick hue not closer than 18° to already used ones
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
    const color = hsl(hue, 70, 86); // pastel
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
    el.style.backgroundColor = isDrawingMode ? (rect.color || DEFAULT_DRAW_COLOR) : colorForDepth(rect.depth);
    el.dataset.index = String(i);
    if (inspectFraction) {
      const k = cells[i].depth;
      const label = document.createElement('div');
      label.className = 'fraction-label';
      label.textContent = `1/${2 ** k}`;
      el.appendChild(label);
    }
    gridEl.appendChild(el);
  }
  partsCountEl.textContent = String(total);
  nextSplitEl.textContent = splitNextIsVertical ? 'vertical' : 'horizontal';
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
    addTeacherMsg('No further splitting — too many parts. Try submitting or clear the board.');
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
  // Split selected cell in half along chosen axis
  if (useVertical) {
    const half = rect.w / 2;
    const left = { x: rect.x, y: rect.y, w: half, h: rect.h, depth: rect.depth + 1, color: rect.color };
    const right = { x: rect.x + half, y: rect.y, w: half, h: rect.h, depth: rect.depth + 1, color: rect.color };
    cells.splice(targetIndex, 1, left, right);
  } else {
    const half = rect.h / 2;
    const top = { x: rect.x, y: rect.y, w: rect.w, h: half, depth: rect.depth + 1, color: rect.color };
    const bottom = { x: rect.x, y: rect.y + half, w: rect.w, h: half, depth: rect.depth + 1, color: rect.color };
    cells.splice(targetIndex, 1, top, bottom);
  }
  // направление больше НЕ переключаем автоматически — им управляет кнопка/модификаторы
  renderGrid();
  flashCells();
}

function clearField() {
  cells = [{ x: 0, y: 0, w: 100, h: 100, depth: 0, color: isDrawingMode ? DEFAULT_DRAW_COLOR : undefined }];
  splitNextIsVertical = true;
  renderGrid();
}

// Chat helpers
function addMsg(who, text) {
  const wrap = document.createElement('div');
  wrap.className = `msg ${who === 'You' ? 'me' : 'ai'}`;
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
function addTeacherMsg(text) { addMsg('Teacher', text); }
function addStudentMsg(text) { addMsg('You', text); }

// Tasks
function buildTasks() {
  // Alternate tasks: exact number of parts and fraction 1/n (n is a power of two)
  const targets = [2, 4, 8, 16, 32, 64, 8, 4, 16, 32];
  tasks = targets.map((n, idx) => {
    const type = idx % 2 === 0 ? 'parts' : 'fraction';
    const text = type === 'parts'
      ? `Task ${idx + 1}: make exactly <b>${n}</b> parts on the board (sizes may vary).`
      : `Task ${idx + 1}: make a fraction <b>1/${n}</b> — get at least one part of size 1/${n}.`;
    return { n, type, text };
  });
}

function startFirstTask() {
  currentTaskIndex = 0;
  const t = tasks[currentTaskIndex];
  addTeacherMsg('Welcome! Each hit splits the selected area into two parts and increases the total number of parts by 1.');
  addTeacherMsg(t.text);
}

function moveToNextTaskOrFinish() {
  currentTaskIndex += 1;
  if (currentTaskIndex >= tasks.length) {
    addTeacherMsg('Great work! All tasks are completed. The board will be cleared.');
    clearField();
    return;
  }
  clearField();
  const t = tasks[currentTaskIndex];
  addTeacherMsg(`New task. ${t.text}`);
}

function submitForCheck() {
  const task = tasks[currentTaskIndex];
  const now = parts();
  const target = task.n;
  addStudentMsg(`Submitting for check: current parts <b>${now}</b>.`);

  if (task.type === 'parts') {
    if (now === target) {
      addTeacherMsg('Correct! Moving to the next task.');
      moveToNextTaskOrFinish();
      return;
    }
    if (now < target) {
      const hits = target - now;
      addTeacherMsg(`Not enough yet: you have <b>${now}</b>, need <b>${target}</b>. Hint: make <b>${hits}</b> more hit(s), splitting any parts.`);
    } else {
      addTeacherMsg(`Too many: you have <b>${now}</b>, need <b>${target}</b>. Clear the board and try again.`);
    }
    return;
  }

  // fraction 1/n
  const k = Math.log2(target);
  const isPow2 = Number.isInteger(k);
  if (!isPow2) {
    addTeacherMsg('This task requires 1/n where n is a power of two. Please report the task definition error.');
    return;
  }
  const hasExact = cells.some(c => c.depth === k);
  if (hasExact) {
    addTeacherMsg('Correct! There is a part of size 1/' + target + '. Moving on.');
    moveToNextTaskOrFinish();
    return;
  }
  const minDepth = Math.min(...cells.map(c => c.depth));
  const maxDepth = Math.max(...cells.map(c => c.depth));
  if (minDepth > k) {
    addTeacherMsg(`Parts are already smaller than 1/${target}. Solution is unreachable without clearing: press “Clear board”.`);
    return;
  }
  // Найдём наибольшую глубину, которая меньше целевой
  const bestDepth = Math.max(...cells.map(c => c.depth).filter(d => d < k));
  const hits = k - bestDepth;
  addTeacherMsg(`No 1/${target} part yet. Hint: pick a larger part (depth ${bestDepth}) and split it <b>${hits}</b> more time(s).`);
}

// Mode switching
function showTheory() {
  sectionTheory.classList.remove('hidden');
  sectionGame.classList.add('hidden');
  btnTheory.classList.add('active');
  btnGame.classList.remove('active');
  btnDraw.classList.remove('active');
  btnTheory.setAttribute('aria-pressed', 'true');
  btnGame.setAttribute('aria-pressed', 'false');
  btnDraw.setAttribute('aria-pressed', 'false');
  isDrawingMode = false;
  drawControls.classList.add('hidden');
  chatAside.classList.remove('hidden');
  btnSubmit.classList.remove('hidden');
  currentTool = 'split';
  btnPaint.classList.remove('tool-active');
  btnPaint.setAttribute('aria-pressed', 'false');
  gridEl.classList.remove('paint');
}
function showGame() {
  sectionTheory.classList.add('hidden');
  sectionGame.classList.remove('hidden');
  btnTheory.classList.remove('active');
  btnGame.classList.add('active');
  btnDraw.classList.remove('active');
  btnTheory.setAttribute('aria-pressed', 'false');
  btnGame.setAttribute('aria-pressed', 'true');
  btnDraw.setAttribute('aria-pressed', 'false');
  isDrawingMode = false;
  drawControls.classList.add('hidden');
  chatAside.classList.remove('hidden');
  btnSubmit.classList.remove('hidden');
  currentTool = 'split';
  btnPaint.classList.remove('tool-active');
  btnPaint.setAttribute('aria-pressed', 'false');
  gridEl.classList.remove('paint');
}
function showDraw() {
  sectionTheory.classList.add('hidden');
  sectionGame.classList.remove('hidden');
  btnTheory.classList.remove('active');
  btnGame.classList.remove('active');
  btnDraw.classList.add('active');
  btnTheory.setAttribute('aria-pressed', 'false');
  btnGame.setAttribute('aria-pressed', 'false');
  btnDraw.setAttribute('aria-pressed', 'true');
  isDrawingMode = true;
  // Initialize colors if missing
  for (let i = 0; i < cells.length; i++) {
    if (!('color' in cells[i]) || cells[i].color == null) {
      cells[i].color = DEFAULT_DRAW_COLOR;
    }
  }
  drawControls.classList.remove('hidden');
  chatAside.classList.add('hidden');
  btnSubmit.classList.add('hidden');
  renderGrid();
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
    nextSplitEl.textContent = splitNextIsVertical ? 'vertical' : 'horizontal';
    btnToggleDir.textContent = `Direction: ${splitNextIsVertical ? 'vertical' : 'horizontal'}`;
    btnToggleDir.setAttribute('aria-pressed', String(!splitNextIsVertical));
  });
  btnClear.addEventListener('click', () => {
    addStudentMsg('Clearing the board.');
    clearField();
  });
  btnSubmit.addEventListener('click', submitForCheck);
  if (btnFraction) {
    btnFraction.addEventListener('click', () => {
      inspectFraction = !inspectFraction;
      btnFraction.classList.toggle('tool-active', inspectFraction);
      btnFraction.setAttribute('aria-pressed', String(inspectFraction));
      renderGrid();
    });
  }

  btnTheory.addEventListener('click', showTheory);
  btnGame.addEventListener('click', showGame);
  btnDraw.addEventListener('click', showDraw);

  // Drawing controls
  if (btnPaint) {
    btnPaint.addEventListener('click', () => {
      if (!isDrawingMode) { return; }
      const activate = currentTool !== 'paint';
      currentTool = activate ? 'paint' : 'split';
      btnPaint.classList.toggle('tool-active', activate);
      btnPaint.setAttribute('aria-pressed', String(activate));
      gridEl.classList.toggle('paint', activate);
    });
  }
  if (colorPicker) {
    colorPicker.addEventListener('input', (e) => {
      selectedColor = e.target.value;
      document.querySelectorAll('.swatch.selected').forEach(el => el.classList.remove('selected'));
    });
  }
  document.querySelectorAll('.palette .swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedColor = btn.getAttribute('data-color');
      document.querySelectorAll('.palette .swatch').forEach(el => el.classList.remove('selected'));
      btn.classList.add('selected');
      if (colorPicker) colorPicker.value = selectedColor;
    });
  });

  // Mouse controls on the grid
  gridEl.addEventListener('click', (e) => {
    // Determine which cell was clicked
    const target = e.target.closest('.cell');
    if (!target) return;
    const idx = Number(target.dataset.index);
    if (isDrawingMode && currentTool === 'paint') {
      cells[idx].color = selectedColor;
      renderGrid();
      return;
    }
    // Left click: default; Shift forces vertical; Ctrl/Meta forces horizontal
    const force = e.shiftKey ? 'vertical' : ((e.ctrlKey || e.metaKey) ? 'horizontal' : null);
    splitWithHammerOnCell(idx, force);
    gridEl.classList.add('hit');
    setTimeout(() => gridEl.classList.remove('hit'), 140);
  });
  gridEl.addEventListener('contextmenu', (e) => {
    // Right click on cell: invert current planned direction for that cell
    e.preventDefault();
    if (isDrawingMode && currentTool === 'paint') {
      return; // do not split when painting
    }
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


