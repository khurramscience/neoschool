class MathMosaicGame {
    constructor() {
        this.currentLevel = 1;
        this.gridSize = 4;
        this.gameGrid = [];
        this.solution = [];
        this.pieces = [];
        this.usedPieces = new Set();
        this.draggedPiece = null;
        
        this.initializeGame();
        this.setupEventListeners();
    }

    initializeGame() {
        this.generateLevel();
        this.renderGame();
    }

    generateLevel() {
        // Генерируем решение для текущего уровня
        this.solution = this.generateSolution();
        
        // Создаем игровое поле
        this.gameGrid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(null));
        
        // Генерируем кусочки мозаики
        this.pieces = this.generatePieces();
        this.usedPieces.clear();
    }

    generateSolution() {
        // Генерируем случайное решение с числами от 1 до 9
        const solution = [];
        for (let i = 0; i < this.gridSize; i++) {
            solution[i] = [];
            for (let j = 0; j < this.gridSize; j++) {
                solution[i][j] = Math.floor(Math.random() * 9) + 1;
            }
        }
        return solution;
    }

    generatePieces() {
        // Создаем кусочки мозаики на основе решения
        const pieces = [];
        const allNumbers = [];
        
        // Собираем все числа из решения
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                allNumbers.push(this.solution[i][j]);
            }
        }
        
        // Перемешиваем числа для создания кусочков
        for (let i = allNumbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allNumbers[i], allNumbers[j]] = [allNumbers[j], allNumbers[i]];
        }
        
        // Создаем кусочки
        allNumbers.forEach((number, index) => {
            pieces.push({
                id: index,
                value: number,
                used: false
            });
        });
        
        return pieces;
    }

    calculateSums() {
        const horizontalSums = [];
        const verticalSums = [];
        
        // Вычисляем суммы по горизонтали
        for (let i = 0; i < this.gridSize; i++) {
            let sum = 0;
            for (let j = 0; j < this.gridSize; j++) {
                sum += this.solution[i][j];
            }
            horizontalSums.push(sum);
        }
        
        // Вычисляем суммы по вертикали
        for (let j = 0; j < this.gridSize; j++) {
            let sum = 0;
            for (let i = 0; i < this.gridSize; i++) {
                sum += this.solution[i][j];
            }
            verticalSums.push(sum);
        }
        
        return { horizontalSums, verticalSums };
    }

    renderGame() {
        this.renderGrid();
        this.renderSums();
        this.renderPieces();
        this.updateLevel();
    }

    renderGrid() {
        const gameGrid = document.getElementById('gameGrid');
        gameGrid.innerHTML = '';
        gameGrid.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        
        // Динамически изменяем размер ячеек в зависимости от размера поля
        const cellSize = this.getCellSize();
        gameGrid.style.setProperty('--cell-size', `${cellSize}px`);
        
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                if (this.gameGrid[i][j] !== null) {
                    cell.textContent = this.gameGrid[i][j];
                    cell.classList.add('filled');
                    cell.draggable = true;
                    
                    // Добавляем обработчики для перетаскивания с поля
                    cell.addEventListener('dragstart', (e) => this.handleGridDragStart(e));
                    cell.addEventListener('dragend', (e) => this.handleGridDragEnd(e));
                }
                
                cell.addEventListener('dragover', (e) => this.handleDragOver(e));
                cell.addEventListener('drop', (e) => this.handleDrop(e));
                cell.addEventListener('dragenter', (e) => this.handleDragEnter(e));
                cell.addEventListener('dragleave', (e) => this.handleDragLeave(e));
                
                gameGrid.appendChild(cell);
            }
        }
    }

    getCellSize() {
        // Возвращаем размер ячейки в зависимости от размера поля
        switch(this.gridSize) {
            case 2: return 100;
            case 3: return 80;
            case 4: return 60;
            case 5: return 50;
            case 6: return 45;
            default: return 60;
        }
    }

    renderSums() {
        const { horizontalSums, verticalSums } = this.calculateSums();
        
        // Рендерим суммы по горизонтали (сверху)
        const topSums = document.querySelector('.top-sums');
        topSums.innerHTML = '';
        horizontalSums.forEach(sum => {
            const sumCell = document.createElement('div');
            sumCell.className = 'sum-cell';
            sumCell.textContent = sum;
            topSums.appendChild(sumCell);
        });
        
        // Рендерим суммы по вертикали (слева)
        const leftSums = document.querySelector('.left-sums');
        leftSums.innerHTML = '';
        verticalSums.forEach(sum => {
            const sumCell = document.createElement('div');
            sumCell.className = 'sum-cell';
            sumCell.textContent = sum;
            leftSums.appendChild(sumCell);
        });
        
        // Рендерим суммы по вертикали (справа)
        const rightSums = document.querySelector('.right-sums');
        rightSums.innerHTML = '';
        verticalSums.forEach(sum => {
            const sumCell = document.createElement('div');
            sumCell.className = 'sum-cell';
            sumCell.textContent = sum;
            rightSums.appendChild(sumCell);
        });
        
        // Рендерим суммы по горизонтали (снизу)
        const bottomSums = document.querySelector('.bottom-sums');
        bottomSums.innerHTML = '';
        horizontalSums.forEach(sum => {
            const sumCell = document.createElement('div');
            sumCell.className = 'sum-cell';
            sumCell.textContent = sum;
            bottomSums.appendChild(sumCell);
        });
    }

    renderPieces() {
        const piecesArea = document.getElementById('piecesArea');
        piecesArea.innerHTML = '';
        
        // Применяем размер ячеек к области кусочков
        const cellSize = this.getCellSize();
        piecesArea.style.setProperty('--cell-size', `${cellSize}px`);
        
        this.pieces.forEach(piece => {
            if (!piece.used) {
                const pieceElement = document.createElement('div');
                pieceElement.className = 'piece';
                pieceElement.textContent = piece.value;
                pieceElement.dataset.pieceId = piece.id;
                pieceElement.draggable = true;
                
                pieceElement.addEventListener('dragstart', (e) => this.handleDragStart(e));
                pieceElement.addEventListener('dragend', (e) => this.handleDragEnd(e));
                
                piecesArea.appendChild(pieceElement);
            }
        });
        
        // Добавляем обработчик для сброса плиток в область кусочков
        piecesArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });
        
        piecesArea.addEventListener('drop', (e) => {
            e.preventDefault();
            const data = e.dataTransfer.getData('text/plain');
            if (data) {
                const { row, col, value } = JSON.parse(data);
                this.removePieceFromGrid(row, col, value);
            }
        });
    }

    updateLevel() {
        document.getElementById('level').textContent = this.currentLevel;
    }

    setupEventListeners() {
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
        document.getElementById('checkBtn').addEventListener('click', () => this.checkSolution());
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        document.getElementById('nextLevelBtn').addEventListener('click', () => this.nextLevel());
        
        // Селектор размера поля
        document.getElementById('gridSizeSelect').addEventListener('change', (e) => {
            this.gridSize = parseInt(e.target.value);
            this.newGame();
        });
        
        // Модальное окно
        const modal = document.getElementById('resultModal');
        const closeBtn = document.querySelector('.close');
        
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    handleDragStart(e) {
        this.draggedPiece = parseInt(e.target.dataset.pieceId);
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        this.draggedPiece = null;
    }

    handleGridDragStart(e) {
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        const value = this.gameGrid[row][col];
        
        e.target.classList.add('dragging');
        e.dataTransfer.setData('text/plain', JSON.stringify({ row, col, value }));
        e.dataTransfer.effectAllowed = 'move';
    }

    handleGridDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleDragEnter(e) {
        e.preventDefault();
        e.target.classList.add('drop-zone');
    }

    handleDragLeave(e) {
        e.target.classList.remove('drop-zone');
    }

    handleDrop(e) {
        e.preventDefault();
        e.target.classList.remove('drop-zone');
        
        if (this.draggedPiece !== null) {
            const row = parseInt(e.target.dataset.row);
            const col = parseInt(e.target.dataset.col);
            
            if (this.gameGrid[row][col] === null) {
                const piece = this.pieces.find(p => p.id === this.draggedPiece);
                if (piece && !piece.used) {
                    this.placePiece(row, col, piece);
                }
            } else {
                // Если ячейка уже занята, можно заменить плитку
                const piece = this.pieces.find(p => p.id === this.draggedPiece);
                if (piece && !piece.used) {
                    // Возвращаем старую плитку в область кусочков
                    const oldValue = this.gameGrid[row][col];
                    this.returnPieceToArea(oldValue);
                    
                    // Размещаем новую плитку
                    this.placePiece(row, col, piece);
                }
            }
        }
    }

    placePiece(row, col, piece) {
        this.gameGrid[row][col] = piece.value;
        piece.used = true;
        this.usedPieces.add(piece.id);
        
        // Обновляем отображение
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.textContent = piece.value;
        cell.classList.add('filled');
        cell.draggable = true;
        
        // Добавляем обработчики для перетаскивания с поля (если их еще нет)
        if (!cell.hasAttribute('data-drag-handlers')) {
            cell.addEventListener('dragstart', (e) => this.handleGridDragStart(e));
            cell.addEventListener('dragend', (e) => this.handleGridDragEnd(e));
            cell.setAttribute('data-drag-handlers', 'true');
        }
        
        // Проверяем правильность всех ячеек после размещения
        this.checkAllCellsCorrectness();
        
        // Удаляем кусочек из области кусочков
        const pieceElement = document.querySelector(`[data-piece-id="${piece.id}"]`);
        if (pieceElement) {
            pieceElement.classList.add('used');
            setTimeout(() => pieceElement.remove(), 300);
        }
    }

    returnPieceToArea(value) {
        // Создаем новый кусочек для возвращенного значения
        const newPiece = {
            id: Date.now() + Math.random(), // Уникальный ID
            value: value,
            used: false
        };
        
        this.pieces.push(newPiece);
        
        // Находим и освобождаем старую плитку
        const oldPiece = this.pieces.find(p => p.value === value && p.used);
        if (oldPiece) {
            oldPiece.used = false;
            this.usedPieces.delete(oldPiece.id);
        }
        
        // Перерисовываем область кусочков
        this.renderPieces();
    }

    removePieceFromGrid(row, col, value) {
        // Удаляем плитку с поля
        this.gameGrid[row][col] = null;
        
        // Находим и освобождаем плитку
        const piece = this.pieces.find(p => p.value === value && p.used);
        if (piece) {
            piece.used = false;
            this.usedPieces.delete(piece.id);
        }
        
        // Обновляем отображение
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.textContent = '';
        cell.classList.remove('filled', 'correct', 'incorrect');
        cell.draggable = false;
        cell.removeAttribute('data-drag-handlers');
        
        // Перерисовываем область кусочков
        this.renderPieces();
        
        // Проверяем правильность соседних ячеек после удаления
        this.checkAllCellsCorrectness();
    }

    checkCellCorrectness(row, col) {
        const { horizontalSums, verticalSums } = this.calculateSums();
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        
        // Убираем все классы цвета, но сохраняем draggable
        cell.classList.remove('correct', 'incorrect');
        
        // Проверяем правильность по строке
        let rowSum = 0;
        let rowFilled = true;
        for (let j = 0; j < this.gridSize; j++) {
            if (this.gameGrid[row][j] !== null) {
                rowSum += this.gameGrid[row][j];
            } else {
                rowFilled = false;
            }
        }
        
        // Проверяем правильность по столбцу
        let colSum = 0;
        let colFilled = true;
        for (let i = 0; i < this.gridSize; i++) {
            if (this.gameGrid[i][col] !== null) {
                colSum += this.gameGrid[i][col];
            } else {
                colFilled = false;
            }
        }
        
        // Определяем правильность позиции
        const rowCorrect = !rowFilled || rowSum === horizontalSums[row];
        const colCorrect = !colFilled || colSum === verticalSums[col];
        
        // Применяем цвет в зависимости от правильности
        if (rowCorrect && colCorrect) {
            cell.classList.add('correct');
        } else if (!rowCorrect || !colCorrect) {
            cell.classList.add('incorrect');
        }
        
        // Убеждаемся, что заполненные ячейки остаются перетаскиваемыми
        if (this.gameGrid[row][col] !== null) {
            cell.draggable = true;
            
            // Проверяем, есть ли уже обработчики событий
            if (!cell.hasAttribute('data-drag-handlers')) {
                cell.addEventListener('dragstart', (e) => this.handleGridDragStart(e));
                cell.addEventListener('dragend', (e) => this.handleGridDragEnd(e));
                cell.setAttribute('data-drag-handlers', 'true');
            }
        }
    }

    checkAllCellsCorrectness() {
        // Проверяем правильность всех заполненных ячеек
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.gameGrid[i][j] !== null) {
                    this.checkCellCorrectness(i, j);
                }
            }
        }
    }

    checkSolution() {
        const { horizontalSums, verticalSums } = this.calculateSums();
        let isCorrect = true;
        let correctCells = 0;
        
        // Проверяем каждую строку
        for (let i = 0; i < this.gridSize; i++) {
            let rowSum = 0;
            let rowFilled = true;
            
            for (let j = 0; j < this.gridSize; j++) {
                if (this.gameGrid[i][j] !== null) {
                    rowSum += this.gameGrid[i][j];
                } else {
                    rowFilled = false;
                }
            }
            
            if (rowFilled && rowSum !== horizontalSums[i]) {
                isCorrect = false;
            }
        }
        
        // Проверяем каждый столбец
        for (let j = 0; j < this.gridSize; j++) {
            let colSum = 0;
            let colFilled = true;
            
            for (let i = 0; i < this.gridSize; i++) {
                if (this.gameGrid[i][j] !== null) {
                    colSum += this.gameGrid[i][j];
                } else {
                    colFilled = false;
                }
            }
            
            if (colFilled && colSum !== verticalSums[j]) {
                isCorrect = false;
            }
        }
        
        // Проверяем, заполнено ли все поле
        let isComplete = true;
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.gameGrid[i][j] === null) {
                    isComplete = false;
                    break;
                }
            }
        }
        
        // Показываем результат
        this.showResult(isCorrect && isComplete, isComplete);
    }

    showResult(isCorrect, isComplete) {
        const modal = document.getElementById('resultModal');
        const title = document.getElementById('resultTitle');
        const message = document.getElementById('resultMessage');
        const nextBtn = document.getElementById('nextLevelBtn');
        
        if (isCorrect && isComplete) {
            title.textContent = '🎉 Поздравляем!';
            message.textContent = `Вы успешно решили уровень ${this.currentLevel}! Все суммы совпадают.`;
            nextBtn.style.display = 'inline-block';
        } else if (isComplete) {
            title.textContent = '❌ Попробуйте еще раз';
            message.textContent = 'Не все суммы совпадают. Проверьте свои вычисления и попробуйте снова.';
            nextBtn.style.display = 'none';
        } else {
            title.textContent = '⚠️ Поле не заполнено';
            message.textContent = 'Заполните все ячейки, чтобы проверить решение.';
            nextBtn.style.display = 'none';
        }
        
        modal.style.display = 'block';
    }

    showHint() {
        // Находим первую пустую ячейку и показываем подсказку
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.gameGrid[i][j] === null) {
                    const correctValue = this.solution[i][j];
                    const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                    
                    // Временно показываем правильное число
                    cell.textContent = correctValue;
                    cell.style.background = 'rgba(0, 184, 148, 0.3)';
                    cell.style.color = '#00b894';
                    
                    setTimeout(() => {
                        cell.textContent = '';
                        cell.style.background = '';
                        cell.style.color = '';
                    }, 2000);
                    
                    return;
                }
            }
        }
    }

    newGame() {
        this.currentLevel = 1;
        this.initializeGame();
    }

    nextLevel() {
        this.currentLevel++;
        this.initializeGame();
        document.getElementById('resultModal').style.display = 'none';
    }
}

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new MathMosaicGame();
}); 