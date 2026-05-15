// Утилиты математики
const S = n => n * n; // квадратное число
const T = n => (n * (n + 1)) / 2; // треугольное число

// Вспомогательные
function formatInt(num) {
  return new Intl.NumberFormat('ru-RU').format(num);
}

function createDot(color) {
  const d = document.createElement('span');
  d.className = `dot ${color || ''}`.trim();
  return d;
}

function renderSquare(container, n, colorCycle = ["", "green", "pink", "yellow"]) {
  container.replaceChildren();
  container.style.gridTemplateColumns = `repeat(${n}, auto)`;
  container.classList.add('sq');
  for (let i = 0; i < n * n; i++) {
    const color = colorCycle[i % colorCycle.length];
    container.appendChild(createDot(color));
  }
}

function renderTriangle(container, n, colorCycle = ["", "orange", "green", "pink"]) {
  container.replaceChildren();
  container.classList.add('tri');
  for (let row = 1; row <= n; row++) {
    for (let col = 0; col < row; col++) {
      const idx = ((row - 1) * row) / 2 + col;
      const color = colorCycle[idx % colorCycle.length];
      container.appendChild(createDot(color));
    }
    container.appendChild(document.createElement('br'));
  }
}

// Треугольник, выровненный по сетке side×side (заполняем невидимыми плейсхолдерами)
function renderTriangleGrid(container, n, colorCycle = ["", "orange", "green", "pink"], rot = 0) {
  container.replaceChildren();
  container.classList.remove('tri');
  container.classList.add('sq');
  container.style.gridTemplateColumns = `repeat(${n}, auto)`;
  // Локальные помощники (вне области initPractice)
  const triCellsRaw = side => {
    const pts = [];
    for (let y = 0; y < side; y++) for (let x = 0; x <= y; x++) pts.push({ x, y });
    return pts;
  };
  const rotatePtsRaw = (pts, side, quarterTurns) => {
    let res = pts.map(p => ({ ...p }));
    for (let i = 0; i < ((quarterTurns % 4) + 4) % 4; i++) {
      res = res.map(({ x, y }) => ({ x: side - 1 - y, y: x }));
    }
    return res;
  };
  // Сформируем множество занятых клеток у треугольника с поворотом rot
  const set = new Set(rotatePtsRaw(triCellsRaw(n), n, rot).map(p => `${p.x},${p.y}`));
  let idx = 0;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (set.has(`${x},${y}`)) {
        const color = colorCycle[idx++ % colorCycle.length];
        container.appendChild(createDot(color));
      } else {
        const ph = createDot("");
        ph.style.opacity = '0';
        ph.style.pointerEvents = 'none';
        container.appendChild(ph);
      }
    }
  }
}

// Навигация вкладок
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');
tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('is-active'));
    panels.forEach(p => p.classList.remove('is-active'));
    btn.classList.add('is-active');
    document.getElementById(btn.dataset.tab).classList.add('is-active');
  });
});

// Теория
(function initTheory() {
  const slider = document.getElementById('n-slider');
  const nVal = document.getElementById('n-value');
  const triN = document.getElementById('tri-n');
  const triN1 = document.getElementById('tri-n1');
  const sqN = document.getElementById('sq-n');
  const triNVal = document.getElementById('tri-n-val');
  const triN1Val = document.getElementById('tri-n1-val');
  const sqNVal = document.getElementById('sq-n-val');

  function rerender() {
    const n = Number(slider.value);
    nVal.textContent = n;
    renderTriangle(triN, n);
    renderTriangle(triN1, n - 1);
    renderSquare(sqN, n);
    triNVal.textContent = `T(${n}) = ${formatInt(T(n))}`;
    triN1Val.textContent = `T(${n - 1}) = ${formatInt(T(n - 1))}`;
    sqNVal.textContent = `S(${n}) = ${formatInt(S(n))}`;
  }

  slider.addEventListener('input', rerender);
  rerender();
})();

// Практика
(function initPractice() {
  const tasks = window.PUZZLE_TASKS;
  const primes = window.PRIME_SIDES;

  let idx = Number(localStorage.getItem('sqtri.idx') || 0);
  let solvedMask = JSON.parse(localStorage.getItem('sqtri.solved') || '[]');

  const elIndex = document.getElementById('task-index');
  const elTargetN = document.getElementById('target-n');
  const elTargetN2 = document.getElementById('target-n2');
  const elTargetBoard = document.getElementById('target-board');
  const elTargetSum = document.getElementById('target-sum');
  const elPalette = document.getElementById('palette-list');
  const elBoard = document.getElementById('board');
  const elBoardGrid = document.getElementById('board-grid');
  const elBoardLayer = document.getElementById('board-layer');
  const elSum = document.getElementById('current-sum');
  const elSumBreakdown = document.getElementById('sum-breakdown');
  const elResult = document.getElementById('result');

  const btnCheck = document.getElementById('btn-check');
  const btnClear = document.getElementById('btn-clear');
  const btnHint = document.getElementById('btn-hint');
  const btnNext = document.getElementById('btn-next');

  let target = 0;
  let currentSum = 0;
  let boardSize = 0; // n
  let occupied = new Set(); // keys "x,y"
  let allowed = new Set(); // маска допустимых клеток
  let pieces = []; // {id, kind, side, rot, x, y, value, cells}
  let pieceSeq = 1;

  function boardMetrics() {
    const st = getComputedStyle(elBoardGrid);
    const cell = parseFloat(st.getPropertyValue('--cell')) || 18;
    const gap = parseFloat(st.getPropertyValue('--gap')) || 4;
    const rect = elBoardLayer.getBoundingClientRect();
    return { cell, gap, pitch: cell + gap, left: rect.left + window.scrollX, top: rect.top + window.scrollY };
  }

  function key(x, y) { return `${x},${y}`; }
  function inside(x, y) { return x >= 0 && y >= 0 && x < boardSize && y < boardSize; }

  function triCells(side) {
    const pts = [];
    for (let y = 0; y < side; y++) for (let x = 0; x <= y; x++) pts.push({ x, y });
    return pts;
  }
  function rotatePts(pts, side, quarterTurns) {
    let res = pts.map(p => ({...p}));
    for (let i = 0; i < ((quarterTurns % 4) + 4) % 4; i++) {
      res = res.map(({x,y}) => ({ x: side - 1 - y, y: x }));
    }
    return res;
  }

  function shapeCells(kind, side, rot) {
    if (kind === 'sq') {
      const pts = [];
      for (let y = 0; y < side; y++) for (let x = 0; x < side; x++) pts.push({ x, y });
      return pts;
    } else {
      return rotatePts(triCells(side), side, rot || 0);
    }
  }

  function canPlace(kind, side, rot, x, y) {
    const pts = shapeCells(kind, side, rot);
    for (const p of pts) {
      const gx = x + p.x; const gy = y + p.y;
      if (!inside(gx, gy)) return false;
      if (allowed.size && !allowed.has(key(gx, gy))) return false;
      if (occupied.has(key(gx, gy))) return false;
    }
    return true;
  }

  function occupy(cells, flag) {
    for (const {x,y} of cells) {
      const k = key(x, y);
      if (flag) occupied.add(k); else occupied.delete(k);
    }
  }

  function cellsToAbsolute(cells) {
    const { pitch } = boardMetrics();
    const xs = cells.map(c => c.x), ys = cells.map(c => c.y);
    const minX = Math.min(...xs), minY = Math.min(...ys);
    const maxX = Math.max(...xs), maxY = Math.max(...ys);
    return { left: minX * pitch, top: minY * pitch, width: (maxX - minX + 1) * pitch - (pitch - boardMetrics().cell), height: (maxY - minY + 1) * pitch - (pitch - boardMetrics().cell) };
  }

  function setResult(msg, cls) {
    elResult.className = `result ${cls || ''}`.trim();
    elResult.textContent = msg || '';
  }

  function persist() {
    localStorage.setItem('sqtri.idx', String(idx));
    localStorage.setItem('sqtri.solved', JSON.stringify(solvedMask));
  }

  function makePiece(kind, side) {
    // kind: 'sq' | 'tri'
    const el = document.createElement('div');
    el.className = 'piece';
    el.draggable = true;
    el.dataset.kind = kind;
    el.dataset.side = String(side);

    const art = document.createElement('div');
    art.className = `shape ${kind === 'sq' ? 'sq' : 'tri'}`;
    if (kind === 'sq') renderSquare(art, side);
    else renderTriangleGrid(art, side, undefined, 0);
    el.appendChild(art);

    const meta = document.createElement('div');
    meta.className = 'meta';
    const value = kind === 'sq' ? S(side) : T(side);
    meta.textContent = `${kind === 'sq' ? 'S' : 'T'}(${side}) = ${value}`;
    const plus = document.createElement('span');
    plus.textContent = 'добавить';
    plus.style.cursor = 'pointer';
    plus.addEventListener('click', () => {
      const best = findNearestPlacement(kind, Number(side), 0, 0, 0);
      if (best) tryPlace(kind, Number(side), 0, best.x, best.y);
      else setResult('Нет свободного места для этой фигуры.', 'warn');
    });
    meta.appendChild(plus);
    el.appendChild(meta);

    el.addEventListener('dragstart', ev => {
      ev.dataTransfer?.setData('text/plain', JSON.stringify({ kind, side }));
    });

    return el;
  }

  function placeVisual(kind, side, rot, x, y, id) {
    const { cell, gap, pitch } = boardMetrics();
    const el = document.createElement('div');
    el.className = 'placed';
    el.dataset.id = String(id);
    el.style.left = `${x * pitch}px`;
    el.style.top = `${y * pitch}px`;
    el.draggable = true;
    el.addEventListener('dragstart', ev => {
      ev.dataTransfer?.setData('text/plain', JSON.stringify({ moveId: id }));
    });
    // Контент
    const art = document.createElement('div');
    art.className = `shape ${kind === 'sq' ? 'sq' : 'tri'}`;
    art.style.setProperty('--dot', `${cell}px`);
    art.style.setProperty('--gap', `${gap}px`);
    if (kind === 'sq') renderSquare(art, side);
    else renderTriangleGrid(art, side, undefined, rot);
    el.appendChild(art);

    const rm = document.createElement('button');
    rm.className = 'remove';
    rm.textContent = '×';
    rm.addEventListener('click', () => removePiece(id));
    el.appendChild(rm);

    if (kind === 'tri') {
      const rotBtn = document.createElement('button');
      rotBtn.className = 'remove rotate';
      rotBtn.textContent = '↻';
      rotBtn.title = 'Повернуть';
      rotBtn.addEventListener('click', () => rotatePiece(id));
      el.appendChild(rotBtn);
    }

    elBoardLayer.appendChild(el);
  }

  function tryPlace(kind, side, rot, x, y) {
    if (!canPlace(kind, side, rot, x, y)) return false;
    const cellsRel = shapeCells(kind, side, rot).map(p => ({ x: x + p.x, y: y + p.y }));
    const id = pieceSeq++;
    occupy(cellsRel, true);
    const value = kind === 'sq' ? S(side) : T(side);
    pieces.push({ id, kind, side, rot, x, y, value, cells: cellsRel });
    placeVisual(kind, side, rot, x, y, id);
    currentSum += value;
    refreshSum();
    return true;
  }

  function removePiece(id) {
    const idxP = pieces.findIndex(p => p.id === id);
    if (idxP < 0) return;
    const p = pieces[idxP];
    occupy(p.cells, false);
    currentSum -= p.value;
    pieces.splice(idxP, 1);
    const el = elBoardLayer.querySelector(`[data-id="${id}"]`);
    if (el) el.remove();
    refreshSum();
    setResult('', '');
  }

  function rotatePiece(id) {
    const p = pieces.find(q => q.id === id);
    if (!p || p.kind !== 'tri') return;
    const newRot = ((p.rot || 0) + 1) % 4;
    // попытка повернуть на месте
    const newCells = shapeCells(p.kind, p.side, newRot).map(c => ({ x: p.x + c.x, y: p.y + c.y }));
    // проверка границ и пересечений: временно освобождаем текущие клетки
    occupy(p.cells, false);
    const ok = newCells.every(c => inside(c.x, c.y) && !occupied.has(key(c.x, c.y)));
    if (ok) {
      p.rot = newRot;
      p.cells = newCells;
      occupy(p.cells, true);
      // перерисовать
      const el = elBoardLayer.querySelector(`[data-id="${id}"]`);
      if (el) {
        const art = el.querySelector('.shape');
        renderTriangleGrid(art, p.side, undefined, p.rot);
      }
      setResult('Rotated the triangle.', '');
    } else {
      // revert
      occupy(p.cells, true);
      setResult('Cannot rotate here: no space.', 'warn');
    }
  }

  function setupDnD() {
    elBoard.addEventListener('dragover', ev => {
      ev.preventDefault();
    });
    elBoard.addEventListener('drop', ev => {
      ev.preventDefault();
      const payload = ev.dataTransfer?.getData('text/plain');
      try {
        const data = JSON.parse(payload || '{}');
        const m = boardMetrics();
        const px = Math.floor((ev.pageX - m.left) / m.pitch);
        const py = Math.floor((ev.pageY - m.top) / m.pitch);
        if (data.moveId) {
          // Перемещение существующей фигуры
          const p = pieces.find(q => q.id === Number(data.moveId));
          if (!p) return;
          // освободим временно
          occupy(p.cells, false);
          const best = findNearestPlacement(p.kind, p.side, p.rot || 0, px, py);
          if (best && canPlace(p.kind, p.side, p.rot || 0, best.x, best.y)) {
            p.x = best.x; p.y = best.y;
            p.cells = shapeCells(p.kind, p.side, p.rot || 0).map(c => ({ x: p.x + c.x, y: p.y + c.y }));
            occupy(p.cells, true);
            const el = elBoardLayer.querySelector(`[data-id="${p.id}"]`);
            if (el) {
              el.style.left = `${p.x * m.pitch}px`;
              el.style.top = `${p.y * m.pitch}px`;
            }
            setResult('Piece moved.', '');
          } else {
            // вернуть
            occupy(p.cells, true);
            setResult('Cannot move to this area.', 'warn');
          }
        } else {
          const { kind, side } = data;
          if (!kind || !side) return;
          const sideNum = Number(side);
          // Попробуем подобрать ближайшую позицию в маске
          const best = findNearestPlacement(kind, sideNum, 0, px, py);
          if (best) tryPlace(kind, sideNum, 0, best.x, best.y);
          else setResult('Cannot place here (no suitable free space).', 'warn');
        }
      } catch {}
    });
  }

  function findNearestPlacement(kind, side, rot, prefX, prefY) {
    let best = null;
    let bestDist = Infinity;
    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        if (!canPlace(kind, side, rot, x, y)) continue;
        const d = (x - prefX) * (x - prefX) + (y - prefY) * (y - prefY);
        if (d < bestDist) { bestDist = d; best = { x, y }; }
      }
    }
    return best;
  }

  function refreshSum() {
    elSum.textContent = String(currentSum);
    // Расклад по значениям используемых фигур
    const parts = pieces.map(p => p.value).sort((a,b) => b - a);
    elSumBreakdown.textContent = parts.length ? `${parts.join(' + ')} = ${currentSum}` : '';
    if (currentSum === target) {
      setResult('Great! The total matches the target square.', 'ok');
    } else if (currentSum < target) {
      setResult(`Need ${target - currentSum} more dots.`, 'warn');
    } else {
      setResult(`Too many by ${currentSum - target} dots. Remove some pieces.`, 'err');
    }
  }

  function renderPalette(maxValue, n) {
    elPalette.replaceChildren();
    // Только фигуры, значение которых не превышает целевое n^2
    const candidates = [];
    for (const p of primes) {
      const sVal = S(p);
      const tVal = T(p);
      // Исключаем только S(n), остальные добавляем, пока не превышают цель
      if (sVal <= maxValue && p !== n) candidates.push(['sq', p]);
      if (tVal <= maxValue) candidates.push(['tri', p]);
    }
    // Чтобы палитра не была пустой на больших n, ограничим p видимым диапазоном
    const list = candidates.filter(([_, side]) => side <= n);
    for (const [kind, side] of (list.length ? list : candidates)) {
      elPalette.appendChild(makePiece(kind, side));
    }
  }

  function clearWorkspace() {
    // очистка слоя и состояний
    elBoardLayer.replaceChildren();
    occupied = new Set();
    pieces = [];
    currentSum = 0;
    refreshSum();
  }

  function coinHint(total) {
    // Поиск разложения total по значениям фигур с простыми сторонами (жадный + корректировка)
    const items = [];
    for (const p of primes) {
      const sVal = S(p);
      const tVal = T(p);
      if (sVal <= total) items.push({ kind: 'sq', side: p, val: sVal });
      if (tVal <= total) items.push({ kind: 'tri', side: p, val: tVal });
    }
    // Сортируем по убыванию
    items.sort((a, b) => b.val - a.val);

    let remaining = total;
    const take = [];
    for (const it of items) {
      const cnt = Math.floor(remaining / it.val);
      if (cnt > 0) {
        take.push({ ...it, count: cnt });
        remaining -= cnt * it.val;
      }
    }
    // Если остаток > 0, попробуем грубую корректировку: заменим одну крупную фигуру двумя/тремя поменьше
    if (remaining !== 0) {
      for (let i = 0; i < items.length && remaining !== 0; i++) {
        const tryReplace = items[i];
        const candidate = take.find(t => t.val >= tryReplace.val && t.count > 0);
        if (!candidate) continue;
        candidate.count -= 1;
        remaining += candidate.val;
        const cnt = Math.floor(remaining / tryReplace.val);
        if (cnt > 0) {
          const ex = take.find(t => t.kind === tryReplace.kind && t.side === tryReplace.side);
          if (ex) ex.count += cnt; else take.push({ ...tryReplace, count: cnt });
          remaining -= cnt * tryReplace.val;
        }
        if (candidate.count === 0) {
          const pos = take.indexOf(candidate);
          if (pos >= 0) take.splice(pos, 1);
        }
      }
    }
    // Фильтруем нули
    return { parts: take.filter(t => t.count > 0), ok: remaining === 0 };
  }

  function showHint() {
    const n = tasks[idx].n;
    const n2 = S(n);
    const basic = `Hint: use T(${n}) + T(${n - 1}) = ${n}²`;
    const hint = coinHint(n2);
    if (hint.ok && hint.parts.length) {
      const list = hint.parts
        .map(p => `${p.count}×${p.kind === 'sq' ? 'S' : 'T'}(${p.side})`)
        .join(' + ');
      setResult(`${basic}. One decomposition: ${list}.`, 'warn');
    } else {
      setResult(`${basic}. Try combining pieces from the palette.`, 'warn');
    }
  }

  function renderTask() {
    const task = tasks[idx];
    const n = task.n;
    target = S(n);
    boardSize = n;
    elIndex.textContent = String(idx + 1);
    elTargetN.textContent = String(n);
    elTargetN2.textContent = String(target);
    elTargetSum.textContent = String(target);
    renderSquare(elTargetBoard, n);
    // фон доски n×n
    elBoardGrid.replaceChildren();
    elBoardGrid.style.gridTemplateColumns = `repeat(${n}, auto)`;
    for (let i = 0; i < n * n; i++) elBoardGrid.appendChild(createDot(''));
    // маска: для текущего задания вся площадь n×n разрешена
    allowed = new Set();
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) allowed.add(key(x, y));
    renderPalette(target, n);
    clearWorkspace();
    setResult('Drag pieces onto the board and match the exact number of dots.', '');
  }

  btnClear.addEventListener('click', () => {
    clearWorkspace();
  });

  btnCheck.addEventListener('click', () => {
    if (currentSum === target) {
      setResult('Correct! Task completed.', 'ok');
      solvedMask[idx] = true;
      persist();
    } else if (currentSum < target) {
      setResult(`Not enough: need ${target - currentSum} more dots.`, 'warn');
    } else {
      setResult(`Too many by ${currentSum - target} dots.`, 'err');
    }
  });

  btnHint.addEventListener('click', showHint);

  btnNext.addEventListener('click', () => {
    idx = (idx + 1) % tasks.length;
    persist();
    renderTask();
  });

  setupDnD();
  renderTask();
})();


