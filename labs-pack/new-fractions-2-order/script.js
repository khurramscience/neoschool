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
let isCompareMode = false;
let compareColors = { a: '#ef4444', b: '#3b82f6' };
let compareAnswer = 'E'; // 'A' red more, 'B' blue more, 'E' equal
let refineVertical = true;
let compareDifficulty = 'normal'; // easy | normal | hard
let compareRound = { total: 10, current: 0, correct: 0 };

// Per-mode isolated state
let cellsGame = [{ x: 0, y: 0, w: 100, h: 100, depth: 0 }];
let dirGame = true;
let cellsDraw = [{ x: 0, y: 0, w: 100, h: 100, depth: 0, color: DEFAULT_DRAW_COLOR }];
let dirDraw = true;
let cellsCompare = [];
let dirCompare = true;
// Deep Compare state
let isDeepMode = false;
let cellsDeep = [];
let dirDeep = true;
let deepRound = { total: 3, current: 0, correct: 0 };
let glueToolActive = false;
let glueFirstIndex = null; // first selected cell index
// Order mode state (3-5 colors with ranking)
let isOrderMode = false;
let orderRound = { total: 5, current: 0, correct: 0 };
let orderPalette = ['#ef4444', '#fbbf24', '#3b82f6', '#ec4899', '#10b981'];
let orderActiveColors = [];
const colorNames = {
  '#ef4444': 'red',
  '#fbbf24': 'yellow',
  '#3b82f6': 'blue',
  '#ec4899': 'pink',
  '#10b981': 'green'
};

function deepCloneCells(arr) {
  return arr.map(c => ({ ...c }));
}

function showDeepCompare() {
  saveCurrentModeState();
  sectionTheory.classList.add('hidden');
  sectionGame.classList.remove('hidden');
  btnTheory.classList.remove('active');
  btnGame.classList.remove('active');
  btnDraw.classList.remove('active');
  btnCompare.classList.remove('active');
  btnDeepCompare.classList.add('active');
  if (btnOrder) btnOrder.classList.remove('active');
  btnTheory.setAttribute('aria-pressed', 'false');
  btnGame.setAttribute('aria-pressed', 'false');
  btnDraw.setAttribute('aria-pressed', 'false');
  btnCompare.setAttribute('aria-pressed', 'false');
  btnDeepCompare.setAttribute('aria-pressed', 'true');
  if (btnOrder) btnOrder.setAttribute('aria-pressed', 'false');
  isDrawingMode = false;
  isCompareMode = false;
  isDeepMode = true;
  drawControls.classList.add('hidden');
  compareControls.classList.remove('hidden');
  compareControls.classList.add('deep');
  chatAside.classList.remove('hidden');
  btnSubmit.classList.add('hidden');
  if (btnGlueTool) btnGlueTool.classList.add('hidden');
  if (compareResult) compareResult.classList.add('hidden');
  if (btnClear) btnClear.classList.add('hidden');
  if (btnGlueTool) btnGlueTool.classList.remove('hidden');
  currentTool = 'split';
  gridEl.classList.remove('paint');
  if (btnPaint) { btnPaint.classList.remove('tool-active'); btnPaint.setAttribute('aria-pressed', 'false'); }
  inspectFraction = false;
  if (btnFraction) { btnFraction.classList.remove('tool-active'); btnFraction.setAttribute('aria-pressed', 'false'); }
  // reset deep board to force fresh challenge
  cellsDeep = [];
  if (chatLog) chatLog.innerHTML = '';
  startDeepRound();
  if (btnGlueTool) btnGlueTool.classList.remove('hidden');
  renderLegendForMode();
}

function showOrder() {
  saveCurrentModeState();
  sectionTheory.classList.add('hidden');
  sectionGame.classList.remove('hidden');
  btnTheory.classList.remove('active');
  btnGame.classList.remove('active');
  btnDraw.classList.remove('active');
  btnCompare.classList.remove('active');
  btnDeepCompare.classList.remove('active');
  if (btnOrder) btnOrder.classList.add('active');
  btnTheory.setAttribute('aria-pressed', 'false');
  btnGame.setAttribute('aria-pressed', 'false');
  btnDraw.setAttribute('aria-pressed', 'false');
  btnCompare.setAttribute('aria-pressed', 'false');
  btnDeepCompare.setAttribute('aria-pressed', 'false');
  if (btnOrder) btnOrder.setAttribute('aria-pressed', 'true');
  isDrawingMode = false;
  isCompareMode = false;
  isDeepMode = false;
  isOrderMode = true;
  drawControls.classList.add('hidden');
  compareControls.classList.remove('hidden');
  chatAside.classList.remove('hidden');
  btnSubmit.classList.add('hidden');
  if (btnClear) btnClear.classList.add('hidden');
  if (compareResult) compareResult.classList.add('hidden');
  if (btnGlueTool) btnGlueTool.classList.remove('hidden');
  // reset order board to force fresh challenge
  cells = [{ x: 0, y: 0, w: 100, h: 100, depth: 0, color: null }];
  if (chatLog) chatLog.innerHTML = '';
  startOrderRound();
  renderLegendForMode();
}

function saveCurrentModeState() {
  if (isCompareMode) {
    cellsCompare = deepCloneCells(cells);
    dirCompare = splitNextIsVertical;
  } else if (isDeepMode) {
    cellsDeep = deepCloneCells(cells);
    dirDeep = splitNextIsVertical;
  } else if (isDrawingMode) {
    cellsDraw = deepCloneCells(cells);
    dirDraw = splitNextIsVertical;
  } else {
    cellsGame = deepCloneCells(cells.map(c => { const { color, ...rest } = c; return rest; }));
    dirGame = splitNextIsVertical;
  }
}

let tasks = [];
let currentTaskIndex = 0;

// DOM
const btnTheory = document.getElementById('btnTheory');
const btnGame = document.getElementById('btnGame');
const btnDraw = document.getElementById('btnDraw');
const btnCompare = document.getElementById('btnCompare');
const btnDeepCompare = document.getElementById('btnDeepCompare');
const btnOrder = document.getElementById('btnOrder');
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
// Compare controls
const compareControls = document.getElementById('compareControls');
const btnRefineAll = document.getElementById('btnRefineAll');
const btnAnsRed = document.getElementById('btnAnsRed');
const btnAnsBlue = document.getElementById('btnAnsBlue');
const btnAnsEqual = document.getElementById('btnAnsEqual');
const compareResult = document.getElementById('compareResult');
const compareDifficultyEl = document.getElementById('compareDifficulty');
const btnCompareNew = document.getElementById('btnCompareNew');
const btnGlueTool = document.getElementById('btnGlueTool');
const legendEl = document.getElementById('legend');

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
    const hasOwnColor = rect.color != null;
    el.style.backgroundColor = hasOwnColor ? rect.color : (isDrawingMode ? (rect.color || DEFAULT_DRAW_COLOR) : colorForDepth(rect.depth));
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

const WHOLE_AREA = 100 * 100;
const MIN_DEEP_FRACTION = 1 / 64; // children must not be smaller than this
function canSplitInDeep(rect) {
  const childFraction = (rect.w * rect.h) / WHOLE_AREA / 2;
  return childFraction >= MIN_DEEP_FRACTION - 1e-9;
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
  // In Deep mode, do not split below 1/64
  if (isDeepMode && !canSplitInDeep(rect)) {
    addTeacherMsg('Too small to split in Deep (limit is 1/64).', 'err');
    return;
  }
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
  cells = [{ x: 0, y: 0, w: 100, h: 100, depth: 0, color: (isDrawingMode ? DEFAULT_DRAW_COLOR : (isCompareMode ? compareColors.b : undefined)) }];
  splitNextIsVertical = true;
  if (isCompareMode) dirCompare = true; else if (isDrawingMode) dirDraw = true; else dirGame = true;
  renderGrid();
}

// Chat helpers
function addMsg(who, text, bubbleClass = '') {
  const wrap = document.createElement('div');
  wrap.className = `msg ${who === 'You' ? 'me' : 'ai'}`;
  const whoEl = document.createElement('div');
  whoEl.className = 'who';
  whoEl.textContent = who;
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = text;
  if (bubbleClass) bubble.classList.add(bubbleClass);
  wrap.appendChild(whoEl);
  wrap.appendChild(bubble);
  chatLog.appendChild(wrap);
  chatLog.scrollTop = chatLog.scrollHeight;
}
function addTeacherMsg(text, bubbleClass = '') { addMsg('Teacher', text, bubbleClass); }
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
  saveCurrentModeState();
  sectionTheory.classList.remove('hidden');
  sectionGame.classList.add('hidden');
  btnTheory.classList.add('active');
  btnGame.classList.remove('active');
  btnDraw.classList.remove('active');
  btnCompare.classList.remove('active');
  if (btnOrder) btnOrder.classList.remove('active');
  btnDeepCompare.classList.remove('active');
  btnDeepCompare.classList.remove('active');
  btnDeepCompare.classList.remove('active');
  btnTheory.setAttribute('aria-pressed', 'true');
  btnGame.setAttribute('aria-pressed', 'false');
  btnDraw.setAttribute('aria-pressed', 'false');
  btnCompare.setAttribute('aria-pressed', 'false');
  btnDeepCompare.setAttribute('aria-pressed', 'false');
  if (btnOrder) btnOrder.setAttribute('aria-pressed', 'false');
  if (btnOrder) btnOrder.setAttribute('aria-pressed', 'false');
  if (btnOrder) btnOrder.setAttribute('aria-pressed', 'false');
  isDrawingMode = false;
  isCompareMode = false;
  isDeepMode = false;
  isOrderMode = false;
  isOrderMode = false;
  drawControls.classList.add('hidden');
  compareControls.classList.add('hidden');
  chatAside.classList.remove('hidden');
  btnSubmit.classList.remove('hidden');
  if (btnGlueTool) btnGlueTool.classList.add('hidden');
  currentTool = 'split';
  btnPaint.classList.remove('tool-active');
  btnPaint.setAttribute('aria-pressed', 'false');
  gridEl.classList.remove('paint');
  inspectFraction = false;
  if (btnFraction) { btnFraction.classList.remove('tool-active'); btnFraction.setAttribute('aria-pressed', 'false'); }
}
function showGame() {
  saveCurrentModeState();
  sectionTheory.classList.add('hidden');
  sectionGame.classList.remove('hidden');
  btnTheory.classList.remove('active');
  btnGame.classList.add('active');
  btnDraw.classList.remove('active');
  btnCompare.classList.remove('active');
  if (btnOrder) btnOrder.classList.remove('active');
  btnTheory.setAttribute('aria-pressed', 'false');
  btnGame.setAttribute('aria-pressed', 'true');
  btnDraw.setAttribute('aria-pressed', 'false');
  btnCompare.setAttribute('aria-pressed', 'false');
  btnDeepCompare.setAttribute('aria-pressed', 'false');
  if (btnOrder) btnOrder.setAttribute('aria-pressed', 'false');
  isDrawingMode = false;
  isCompareMode = false;
  isDeepMode = false;
  drawControls.classList.add('hidden');
  compareControls.classList.add('hidden');
  chatAside.classList.remove('hidden');
  btnSubmit.classList.remove('hidden');
  if (btnClear) btnClear.classList.remove('hidden');
  if (btnGlueTool) btnGlueTool.classList.add('hidden');
  // fully reset any paint UI/state
  currentTool = 'split';
  gridEl.classList.remove('paint');
  if (btnPaint) {
    btnPaint.classList.remove('tool-active');
    btnPaint.setAttribute('aria-pressed', 'false');
  }
  if (compareResult) compareResult.classList.remove('hidden');
  inspectFraction = false;
  if (btnFraction) { btnFraction.classList.remove('tool-active'); btnFraction.setAttribute('aria-pressed', 'false'); }
  // restore game board
  // always reset the game board to a clean whole when entering Game
  cellsGame = [{ x: 0, y: 0, w: 100, h: 100, depth: 0 }];
  dirGame = true;
  depthColorMap.clear && depthColorMap.clear();
  cells = deepCloneCells(cellsGame);
  splitNextIsVertical = dirGame;
  renderGrid();
  // clear chat from other modes and start game instructions
  if (chatLog) chatLog.innerHTML = '';
  startFirstTask();
  // reset any special tools
  glueToolActive = false;
  glueFirstIndex = null;
}
function showDraw() {
  saveCurrentModeState();
  sectionTheory.classList.add('hidden');
  sectionGame.classList.remove('hidden');
  btnTheory.classList.remove('active');
  btnGame.classList.remove('active');
  btnDraw.classList.add('active');
  btnCompare.classList.remove('active');
  btnTheory.setAttribute('aria-pressed', 'false');
  btnGame.setAttribute('aria-pressed', 'false');
  btnDraw.setAttribute('aria-pressed', 'true');
  btnCompare.setAttribute('aria-pressed', 'false');
  btnDeepCompare.setAttribute('aria-pressed', 'false');
  if (btnOrder) btnOrder.setAttribute('aria-pressed', 'false');
  isDrawingMode = true;
  isCompareMode = false;
  isDeepMode = false;
  isOrderMode = false;
  drawControls.classList.remove('hidden');
  compareControls.classList.add('hidden');
  chatAside.classList.add('hidden');
  btnSubmit.classList.add('hidden');
  if (btnGlueTool) btnGlueTool.classList.add('hidden');
  // reset draw board to single whole on enter
  cellsDraw = [{ x: 0, y: 0, w: 100, h: 100, depth: 0, color: DEFAULT_DRAW_COLOR }];
  cells = deepCloneCells(cellsDraw).map(c => ({ ...c, color: c.color ?? DEFAULT_DRAW_COLOR }));
  splitNextIsVertical = dirDraw;
  inspectFraction = false;
  if (btnFraction) { btnFraction.classList.remove('tool-active'); btnFraction.setAttribute('aria-pressed', 'false'); }
  renderGrid();
}
function showCompare() {
  saveCurrentModeState();
  sectionTheory.classList.add('hidden');
  sectionGame.classList.remove('hidden');
  btnTheory.classList.remove('active');
  btnGame.classList.remove('active');
  btnDraw.classList.remove('active');
  btnCompare.classList.add('active');
  if (btnOrder) btnOrder.classList.remove('active');
  btnTheory.setAttribute('aria-pressed', 'false');
  btnGame.setAttribute('aria-pressed', 'false');
  btnDraw.setAttribute('aria-pressed', 'false');
  btnCompare.setAttribute('aria-pressed', 'true');
  btnDeepCompare.setAttribute('aria-pressed', 'false');
  if (btnOrder) btnOrder.setAttribute('aria-pressed', 'false');
  isDrawingMode = false;
  isCompareMode = true;
  isDeepMode = false;
  drawControls.classList.add('hidden');
  compareControls.classList.remove('hidden');
  chatAside.classList.remove('hidden');
  btnSubmit.classList.add('hidden');
  // hide bottom compare prompt label in this mode
  if (compareResult) compareResult.classList.add('hidden');
  // hide Clear board button in compare
  if (btnClear) btnClear.classList.add('hidden');
  // fully reset any paint UI/state
  currentTool = 'split';
  gridEl.classList.remove('paint');
  if (btnPaint) {
    btnPaint.classList.remove('tool-active');
    btnPaint.setAttribute('aria-pressed', 'false');
  }
  inspectFraction = false;
  if (btnFraction) {
    btnFraction.classList.remove('tool-active');
    btnFraction.setAttribute('aria-pressed', 'false');
  }
  // reset compare board to force fresh challenge
  cellsCompare = [];
  if (!cellsCompare || cellsCompare.length === 0) {
    if (chatLog) chatLog.innerHTML = '';
    startCompareRound();
  } else {
    cells = deepCloneCells(cellsCompare);
    splitNextIsVertical = dirCompare;
    renderGrid();
  }
  renderLegendForMode();
}

function splitRect(rect, vertical) {
  if (vertical) {
    const half = rect.w / 2;
    return [
      { x: rect.x, y: rect.y, w: half, h: rect.h, depth: rect.depth + 1, color: rect.color },
      { x: rect.x + half, y: rect.y, w: half, h: rect.h, depth: rect.depth + 1, color: rect.color }
    ];
  } else {
    const half = rect.h / 2;
    return [
      { x: rect.x, y: rect.y, w: rect.w, h: half, depth: rect.depth + 1, color: rect.color },
      { x: rect.x, y: rect.y + half, w: rect.w, h: half, depth: rect.depth + 1, color: rect.color }
    ];
  }
}

function tryGlueCells(i, j) {
  if (i === j) { addTeacherMsg('Pick a different second part.'); return; }
  const a = cells[i];
  const b = cells[j];
  if (!a || !b) { glueFirstIndex = null; return; }
  // same color required
  if (a.color !== b.color) { addTeacherMsg('Glue failed: colors must be the same.', 'err'); glueFirstIndex = null; return; }
  // same size (area) required
  const areaA = +(a.w * a.h).toFixed(6);
  const areaB = +(b.w * b.h).toFixed(6);
  if (areaA !== areaB) { addTeacherMsg('Glue failed: sizes must match.', 'err'); glueFirstIndex = null; return; }
  // must be adjacent and share full side
  const ax2 = +(a.x + a.w).toFixed(6), ay2 = +(a.y + a.h).toFixed(6);
  const bx2 = +(b.x + b.w).toFixed(6), by2 = +(b.y + b.h).toFixed(6);
  const shareVertical = (a.y === b.y && ay2 === by2 && (a.x === bx2 || ax2 === b.x));
  const shareHorizontal = (a.x === b.x && ax2 === bx2 && (a.y === by2 || ay2 === b.y));
  if (!shareVertical && !shareHorizontal) { addTeacherMsg('Glue failed: parts must be neighbors sharing a full edge.', 'err'); glueFirstIndex = null; return; }
  // Create merged rect
  const merged = {
    x: shareVertical ? Math.min(a.x, b.x) : a.x,
    y: shareHorizontal ? Math.min(a.y, b.y) : a.y,
    w: shareVertical ? a.w + b.w : a.w,
    h: shareHorizontal ? a.h + b.h : a.h,
    depth: Math.min(a.depth, b.depth) - 1 >= 0 ? Math.min(a.depth, b.depth) - 1 : Math.min(a.depth, b.depth),
    color: a.color
  };
  // Remove higher index first
  const first = Math.min(i, j), second = Math.max(i, j);
  cells.splice(second, 1);
  cells.splice(first, 1, merged);
  glueFirstIndex = null;
  addTeacherMsg('Parts glued.', 'ok');
  renderGrid();
}

function refineAllOnce() {
  const old = cells.slice();
  const vertical = refineVertical;
  refineVertical = !refineVertical;
  const next = [];
  for (let i = 0; i < old.length; i++) {
    const rect = old[i];
    if (isDeepMode && !canSplitInDeep(rect)) {
      next.push(rect);
      continue;
    }
    const parts2 = splitRect(rect, vertical);
    next.push(parts2[0], parts2[1]);
  }
  cells = next;
  renderGrid();
  flashCells();
}

function sumAreaByColor() {
  let a = 0, b = 0;
  for (let i = 0; i < cells.length; i++) {
    const area = cells[i].w * cells[i].h;
    if (cells[i].color === compareColors.a) a += area; else if (cells[i].color === compareColors.b) b += area;
  }
  return { a, b };
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateDeepChallenge() {
  // Create pieces with highly varied sizes from 1/8..1/256
  cells = [{ x: 0, y: 0, w: 100, h: 100, depth: 0, color: null }];
  // Base grid 1/16..1/64
  let baseSplits = 4 + Math.floor(Math.random() * 2); // 16..32
  refineVertical = true;
  for (let i = 0; i < baseSplits; i++) refineAllOnce();
  // Additional random splits to reach 1/256 in places
  const extraOps = 12 + Math.floor(Math.random() * 12);
  for (let k = 0; k < extraOps; k++) {
    const idx = Math.floor(Math.random() * cells.length);
    const rect = cells[idx];
    if (!canSplitInDeep(rect)) continue; // enforce 1/64 limit
    const vert = Math.random() < 0.5;
    const parts2 = splitRect(rect, vert);
    cells.splice(idx, 1, parts2[0], parts2[1]);
  }
  // Color assignment with imbalance
  const total = cells.length;
  const indices = shuffle(Array.from({ length: total }, (_, i) => i));
  // choose red proportion 40..60%
  const redTiles = Math.max(1, Math.min(total - 1, Math.floor(total * (0.4 + Math.random() * 0.2))));
  const redSet = new Set(indices.slice(0, redTiles));
  for (let i = 0; i < total; i++) cells[i].color = redSet.has(i) ? compareColors.a : compareColors.b;
  renderGrid();
  cellsDeep = deepCloneCells(cells);
  dirDeep = splitNextIsVertical;
}

function startDeepRound() {
  deepRound = { total: 3, current: 0, correct: 0 };
  chatLog.innerHTML = '';
  addTeacherMsg('Deep mode: 3 tasks on very mixed piece sizes (1/8..1/256). Answer which color has more area.');
  addTeacherMsg('If your answer is wrong, enter first the number of BLUE parts, then the number of RED parts. Both must be correct to proceed.');
  const inlineAnswers = document.querySelector('.compare-controls .answers');
  if (inlineAnswers) inlineAnswers.classList.add('hidden');
  nextDeepTask();
}

function nextDeepTask() {
  if (deepRound.current >= deepRound.total) {
    addTeacherMsg(`Round finished! Correct answers: <b>${deepRound.correct}</b> / ${deepRound.total}.`, 'ok');
    promptPlayAgain('deep');
    return;
  }
  deepRound.current += 1;
  generateDeepChallenge();
  const taskHtml = `Task ${deepRound.current}/${deepRound.total}: Which color has a larger area?
    <div class="chat-answers">
      <button class="chat-answer" data-ans="A">Red more</button>
      <button class="chat-answer" data-ans="E">Equal</button>
      <button class="chat-answer" data-ans="B">Blue more</button>
    </div>`;
  addTeacherMsg(taskHtml);
  const lastMsg = chatLog.lastElementChild;
  const buttons = lastMsg ? lastMsg.querySelectorAll('.chat-answer') : [];
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const chosen = btn.getAttribute('data-ans');
      buttons.forEach(b => b.disabled = true);
      const { a, b } = sumAreaByColor();
      const correct = a > b ? 'A' : (a < b ? 'B' : 'E');
      if (chosen === correct) {
        addTeacherMsg('Correct!', 'ok');
        deepRound.correct += 1;
        nextDeepTask();
      } else {
        addTeacherMsg('Wrong. Enter BLUE parts count.', 'err');
        promptDeepCountsSequential();
      }
    });
  });
}

function promptDeepCountsSequential() {
  // Step 1: ask Blue count
  const htmlBlue = `<div class="chat-answers">
      <input id="deepBlueCount" type="number" min="0" placeholder="Blue count" style="width:130px;padding:6px 8px;border:1px solid #e5e7eb;border-radius:8px;" />
      <button class="chat-answer" id="deepSubmitBlue">Submit</button>
    </div>`;
  addTeacherMsg(htmlBlue);
  const blueInput = document.getElementById('deepBlueCount');
  const blueBtn = document.getElementById('deepSubmitBlue');
  if (!blueBtn) return;
  blueBtn.addEventListener('click', () => {
    const blue = Number(blueInput.value);
    addTeacherMsg(`Blue entered: ${blue}. Now enter RED parts count.`);
    // Step 2: ask Red
    const htmlRed = `<div class="chat-answers">
        <input id="deepRedCount" type="number" min="0" placeholder="Red count" style="width:130px;padding:6px 8px;border:1px solid #e5e7eb;border-radius:8px;" />
        <button class="chat-answer" id="deepSubmitRed">Submit</button>
      </div>`;
    addTeacherMsg(htmlRed);
    const redInput = document.getElementById('deepRedCount');
    const redBtn = document.getElementById('deepSubmitRed');
    if (!redBtn) return;
    redBtn.addEventListener('click', () => {
      const red = Number(redInput.value);
      const actual = countPiecesByColor();
      const ok = red === actual.red && blue === actual.blue;
      addTeacherMsg(ok ? 'Counts are correct!' : 'Counts are not correct.', ok ? 'ok' : 'err');
      if (ok) {
        nextDeepTask();
      } else {
        addTeacherMsg('Try again. Enter BLUE parts count.', 'err');
        promptDeepCountsSequential();
      }
    });
  });
}

function countPiecesByColor() {
  let red = 0, blue = 0;
  for (let i = 0; i < cells.length; i++) {
    if (cells[i].color === compareColors.a) red++; else if (cells[i].color === compareColors.b) blue++;
  }
  return { red, blue };
}
function generateCompareChallenge() {
  // Start with uniform tiles: 2^r pieces
  cells = [{ x: 0, y: 0, w: 100, h: 100, depth: 0, color: null }];
  let r = 4 + Math.floor(Math.random() * 2); // 16..32 tiles
  if (compareDifficulty === 'easy') r = 4; // 16
  if (compareDifficulty === 'hard') r = 5 + Math.floor(Math.random() * 2); // 32..64
  refineVertical = true;
  for (let i = 0; i < r; i++) {
    refineAllOnce();
  }
  // On hard: create varied sizes by randomly splitting a subset of cells further
  if (compareDifficulty === 'hard') {
    const extraSplits = 6 + Math.floor(Math.random() * 6);
    for (let k = 0; k < extraSplits; k++) {
      const idx = Math.floor(Math.random() * cells.length);
      const vert = Math.random() < 0.5;
      const parts2 = splitRect(cells[idx], vert);
      cells.splice(idx, 1, parts2[0], parts2[1]);
    }
  }
  // Assign colors by tiles to get one of three outcomes fairly
  const total = cells.length; // 2^r
  const scenario = Math.random();
  let redTiles;
  if (scenario < 0.4) {
    // Red more
    redTiles = Math.floor(total * (0.55 + Math.random() * 0.25));
    compareAnswer = 'A';
  } else if (scenario < 0.8) {
    // Blue more
    redTiles = Math.floor(total * (0.25 + Math.random() * 0.2));
    compareAnswer = 'B';
  } else {
    // Equal
    redTiles = total / 2;
    compareAnswer = 'E';
  }
  redTiles = Math.max(1, Math.min(total - 1, redTiles));
  if (compareAnswer === 'E') redTiles = total / 2; // total is power of two

  const indices = shuffle(Array.from({ length: total }, (_, i) => i));
  const redSet = new Set(indices.slice(0, redTiles));
  for (let i = 0; i < total; i++) {
    cells[i].color = redSet.has(i) ? compareColors.a : compareColors.b;
  }
  renderGrid();
  // save as current compare board
  cellsCompare = deepCloneCells(cells);
  dirCompare = splitNextIsVertical;
}

function generateOrderChallenge() {
  // 3-5 colors
  const k = 3 + Math.floor(Math.random() * 3);
  orderActiveColors = shuffle(orderPalette.slice()).slice(0, k);
  // base tiling
  cells = [{ x: 0, y: 0, w: 100, h: 100, depth: 0, color: null }];
  let r = 5; // 32 tiles baseline
  refineVertical = true;
  for (let i = 0; i < r; i++) refineAllOnce();
  // use varied sizes lightly
  const extra = 6 + Math.floor(Math.random() * 6);
  for (let i = 0; i < extra; i++) {
    const idx = Math.floor(Math.random() * cells.length);
    const parts2 = splitRect(cells[idx], Math.random() < 0.5);
    cells.splice(idx, 1, parts2[0], parts2[1]);
  }
  // Assign colors proportional randomly
  const total = cells.length;
  const indices = shuffle(Array.from({ length: total }, (_, i) => i));
  let cursor = 0;
  const quotas = [];
  for (let i = 0; i < orderActiveColors.length; i++) {
    const rest = total - cursor;
    const remainingColors = orderActiveColors.length - i;
    const q = i === orderActiveColors.length - 1 ? rest : Math.max(1, Math.floor(rest / remainingColors + (Math.random() * rest * 0.1 - rest * 0.05)));
    quotas.push(q);
    cursor += q;
  }
  cursor = 0;
  for (let i = 0; i < orderActiveColors.length; i++) {
    const color = orderActiveColors[i];
    for (let j = 0; j < quotas[i]; j++) {
      const idx = indices[cursor + j];
      if (idx != null) cells[idx].color = color;
    }
    cursor += quotas[i];
  }
  renderGrid();
}

function startCompareRound() {
  compareRound = { total: 10, current: 0, correct: 0 };
  chatLog.innerHTML = '';
  addTeacherMsg('Compare mode: You will get 10 tasks. Decide which color has more area, or if they are equal.');
  addTeacherMsg(`Difficulty: <b>${compareDifficulty}</b>. Use the hammer and Glue to help count if needed.`);
  // Hide inline controls answers to encourage chat answers
  const inlineAnswers = document.querySelector('.compare-controls .answers');
  if (inlineAnswers) inlineAnswers.classList.add('hidden');
  nextCompareTask();
}

function startOrderRound() {
  orderRound = { total: 5, current: 0, correct: 0 };
  chatLog.innerHTML = '';
  addTeacherMsg('Order mode: rank colors by area from largest to smallest.');
  const inlineAnswers = document.querySelector('.compare-controls .answers');
  if (inlineAnswers) inlineAnswers.classList.add('hidden');
  nextOrderTask();
}

function nextOrderTask() {
  if (orderRound.current >= orderRound.total) {
    addTeacherMsg(`Round finished! Correct answers: <b>${orderRound.correct}</b> / ${orderRound.total}.`, 'ok');
    promptPlayAgain('order');
    return;
  }
  orderRound.current += 1;
  generateOrderChallenge();
  // Build options as all permutations would be huge; offer a few shuffled candidates inc. correct
  const areas = aggregateAreasByColor();
  const correctOrder = orderActiveColors.slice().sort((a, b) => areas[b] - areas[a]);
  const correctLabel = correctOrder.map(c => colorNames[c] || c).join(' > ');
  // produce 2 distractors by slight swaps
  const distractor1 = correctOrder.slice();
  if (distractor1.length > 2) [distractor1[1], distractor1[2]] = [distractor1[2], distractor1[1]];
  const distractor2 = correctOrder.slice().reverse();
  const variants = shuffle([
    { key: 'C', seq: correctOrder },
    { key: 'X1', seq: distractor1 },
    { key: 'X2', seq: distractor2 }
  ]);
  const html = `Task ${orderRound.current}/${orderRound.total}: Pick ranking (largest > ...):
    <div class="chat-answers">
      ${variants.map(v => `<button class="chat-answer" data-key="${v.key}">${v.seq.map(c => colorNames[c] || c).join(' > ')}</button>`).join('')}
    </div>`;
  addTeacherMsg(html);
  const last = chatLog.lastElementChild;
  const btns = last ? last.querySelectorAll('.chat-answer') : [];
  btns.forEach(b => b.addEventListener('click', () => {
    btns.forEach(x => x.disabled = true);
    const chosenKey = b.getAttribute('data-key');
    const ok = chosenKey === 'C';
    addTeacherMsg(ok ? `Correct: ${correctLabel}` : `Wrong. Correct: ${correctLabel}`, ok ? 'ok' : 'err');
    if (ok) orderRound.correct += 1;
    nextOrderTask();
  }));
}

function aggregateAreasByColor() {
  const map = {};
  for (let i = 0; i < cells.length; i++) {
    const c = cells[i].color;
    const area = cells[i].w * cells[i].h;
    map[c] = (map[c] || 0) + area;
  }
  return map;
}

function renderLegendForMode() {
  if (!legendEl) return;
  if (isOrderMode) {
    const colors = orderActiveColors.length ? orderActiveColors : orderPalette;
    legendEl.innerHTML = colors.map(c => `<span class="dot" style="--dot: ${c}"></span><span>${colorNames[c] || c}</span>`).join(' ');
    return;
  }
  legendEl.innerHTML = `<span class="dot" style="--dot: ${compareColors.a}"></span><span>Red</span>
    <span class=\"dot\" style=\"--dot: ${compareColors.b}\"></span><span>Blue</span>`;
}

function promptPlayAgain(mode) {
  const html = `<div class="chat-answers">
      <button class="chat-answer" data-act="yes">Play again</button>
      <button class="chat-answer" data-act="no">No, thanks</button>
    </div>`;
  addTeacherMsg('Play another round?', '');
  addTeacherMsg(html);
  const last = chatLog.lastElementChild;
  const btns = last ? last.querySelectorAll('.chat-answer') : [];
  btns.forEach(b => b.addEventListener('click', () => {
    btns.forEach(x => x.disabled = true);
    const act = b.getAttribute('data-act');
    if (act === 'yes') {
      if (mode === 'compare') startCompareRound();
      else if (mode === 'deep') startDeepRound();
      else if (mode === 'order') startOrderRound();
    } else {
      addTeacherMsg('Okay. You can start a new set anytime.', '');
    }
  }));
}

function nextCompareTask() {
  if (compareRound.current >= compareRound.total) {
    addTeacherMsg(`Round finished! Correct answers: <b>${compareRound.correct}</b> / ${compareRound.total}.`);
    return;
  }
  compareRound.current += 1;
  generateCompareChallenge();
  // Add task with embedded answer buttons in chat
  const taskHtml = `Task ${compareRound.current}/${compareRound.total}: Which color has a larger area?
    <div class="chat-answers">
      <button class="chat-answer" data-ans="A">Red more</button>
      <button class="chat-answer" data-ans="E">Equal</button>
      <button class="chat-answer" data-ans="B">Blue more</button>
    </div>`;
  addTeacherMsg(taskHtml);
  // Wire the latest answers buttons
  const lastMsg = chatLog.lastElementChild;
  const buttons = lastMsg ? lastMsg.querySelectorAll('.chat-answer') : [];
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const chosen = btn.getAttribute('data-ans');
      // disable all to prevent double answers
      buttons.forEach(b => b.disabled = true);
      const { a, b } = sumAreaByColor();
      const correct = a > b ? 'A' : (a < b ? 'B' : 'E');
      finishAnswerAndProceed(chosen === correct);
    });
  });
}

function finishAnswerAndProceed(wasCorrect) {
  if (wasCorrect) compareRound.correct += 1;
  const { a, b } = sumAreaByColor();
  const summary = a === b ? 'Equal areas.' : (a > b ? 'Red area > Blue area.' : 'Blue area > Red area.');
  addTeacherMsg(`${wasCorrect ? 'Correct' : 'Wrong'} — ${summary}`, wasCorrect ? 'ok' : 'err');
  if (compareRound.current >= compareRound.total) {
    addTeacherMsg(`Round finished! Correct answers: <b>${compareRound.correct}</b> / ${compareRound.total}.`, 'ok');
    promptPlayAgain('compare');
  } else {
    nextCompareTask();
  }
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
    if (isCompareMode) dirCompare = splitNextIsVertical; else if (isDrawingMode) dirDraw = splitNextIsVertical; else dirGame = splitNextIsVertical;
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
  btnCompare.addEventListener('click', showCompare);
  btnDeepCompare.addEventListener('click', showDeepCompare);
  if (btnOrder) btnOrder.addEventListener('click', showOrder);

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
    // Deep glue tool
    if ((isDeepMode || isOrderMode) && glueToolActive) {
      if (glueFirstIndex === null) {
        glueFirstIndex = idx;
        addTeacherMsg('First part selected. Now click the second part to glue.');
      } else {
        tryGlueCells(glueFirstIndex, idx);
      }
      return;
    }
    if (isCompareMode && currentTool === 'paint') {
      // painting is not used in compare mode
      return;
    }
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
    if (isCompareMode) {
      return; // keep right click inactive in compare
    }
    const target = e.target.closest('.cell');
    if (!target) return;
    const idx = Number(target.dataset.index);
    splitWithHammerOnCell(idx, null, true);
    gridEl.classList.add('hit');
    setTimeout(() => gridEl.classList.remove('hit'), 140);
  });

  // Compare controls events
  if (btnRefineAll) {
    btnRefineAll.addEventListener('click', () => {
      if (!isCompareMode && !isDeepMode) return;
      refineAllOnce();
    });
  }
  if (compareDifficultyEl) {
    compareDifficultyEl.addEventListener('change', (e) => {
      compareDifficulty = e.target.value;
      if (isCompareMode) {
        addTeacherMsg(`Difficulty set to <b>${compareDifficulty}</b>.`);
      }
    });
  }
  if (btnCompareNew) {
    btnCompareNew.addEventListener('click', () => {
      if (isDeepMode) {
        startDeepRound();
        return;
      }
      if (isCompareMode) {
        startCompareRound();
        return;
      }
      if (isOrderMode) {
        startOrderRound();
        return;
      }
    });
  }
  if (btnGlueTool) {
    btnGlueTool.addEventListener('click', () => {
      if (!isDeepMode && !isOrderMode) return;
      glueToolActive = !glueToolActive;
      glueFirstIndex = null;
      btnGlueTool.classList.toggle('tool-active', glueToolActive);
      btnGlueTool.setAttribute('aria-pressed', String(glueToolActive));
      addTeacherMsg(glueToolActive ? 'Glue tool ON: select two equal same-color parts to glue.' : 'Glue tool OFF.');
    });
  }
  if (btnAnsRed) btnAnsRed.addEventListener('click', () => {
    if (!isCompareMode) return;
    const { a, b } = sumAreaByColor();
    const correct = a > b ? 'A' : (a < b ? 'B' : 'E');
    const ok = correct === 'A';
    finishAnswerAndProceed(ok);
  });
  if (btnAnsBlue) btnAnsBlue.addEventListener('click', () => {
    if (!isCompareMode) return;
    const { a, b } = sumAreaByColor();
    const correct = a > b ? 'A' : (a < b ? 'B' : 'E');
    const ok = correct === 'B';
    finishAnswerAndProceed(ok);
  });
  if (btnAnsEqual) btnAnsEqual.addEventListener('click', () => {
    if (!isCompareMode) return;
    const { a, b } = sumAreaByColor();
    const correct = a > b ? 'A' : (a < b ? 'B' : 'E');
    const ok = correct === 'E';
    finishAnswerAndProceed(ok);
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


