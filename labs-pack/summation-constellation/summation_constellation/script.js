class MathGame {
    constructor() {
        this.boardSize = 8;
        this.gameBoard = [];
        this.selectedCells = [];
        this.score = 0;
        this.level = 1;
        this.targetSum = 15;
        this.timeLeft = 60;
        this.gameRunning = false;
        this.gamePaused = false;
        this.timer = null;
        this.isDragging = false;
        this.dragDirection = null;
        
        this.initializeElements();
        this.bindEvents();
        this.createBoard();
        this.updateDisplay();
    }

    initializeElements() {
        this.boardElement = document.getElementById('game-board');
        this.scoreElement = document.getElementById('score');
        this.timerElement = document.getElementById('timer');
        this.targetSumElement = document.getElementById('target-sum');
        this.levelElement = document.getElementById('level');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.testBtn = document.getElementById('test-btn');
        this.gameOverModal = document.getElementById('game-over-modal');
        this.finalScoreElement = document.getElementById('final-score');
        this.finalLevelElement = document.getElementById('final-level');
        this.playAgainBtn = document.getElementById('play-again-btn');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.testBtn.addEventListener('click', () => this.findPossibleSequences());
        this.playAgainBtn.addEventListener('click', () => this.restartGame());
        
        // Обработка событий мыши для перетаскивания
        this.boardElement.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.boardElement.addEventListener('mouseover', (e) => this.handleMouseOver(e));
        this.boardElement.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.boardElement.addEventListener('mouseleave', (e) => this.handleMouseLeave(e));
        
        // Предотвращение контекстного меню
        this.boardElement.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Обработка касаний для мобильных устройств
        this.boardElement.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.boardElement.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.boardElement.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    }

    createBoard() {
        this.boardElement.innerHTML = '';
        this.gameBoard = [];
        
        for (let row = 0; row < this.boardSize; row++) {
            this.gameBoard[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Генерируем числа от 1 до 9 для разнообразия
                const value = Math.floor(Math.random() * 9) + 1;
                this.gameBoard[row][col] = value;
                cell.textContent = value;
                
                this.boardElement.appendChild(cell);
            }
        }
    }

    handleMouseDown(e) {
        if (!this.gameRunning || this.gamePaused) return;
        
        const cell = e.target.closest('.cell');
        if (!cell) return;
        
        this.isDragging = true;
        this.selectedCells = [];
        this.dragDirection = null;
        
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        this.selectCell(row, col);
        e.preventDefault();
    }

    handleMouseOver(e) {
        if (!this.isDragging || !this.gameRunning || this.gamePaused) return;
        
        const cell = e.target.closest('.cell');
        if (!cell) return;
        
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        // Определяем направление перетаскивания
        if (this.selectedCells.length === 1) {
            const firstCell = this.selectedCells[0];
            const rowDiff = row - firstCell.row;
            const colDiff = col - firstCell.col;
            
            if (Math.abs(rowDiff) > Math.abs(colDiff)) {
                this.dragDirection = 'vertical';
            } else if (Math.abs(colDiff) > Math.abs(rowDiff)) {
                this.dragDirection = 'horizontal';
            }
        }
        
        // Проверяем, можно ли добавить эту ячейку
        if (this.canAddCell(row, col)) {
            this.selectCell(row, col);
        }
    }

    handleMouseUp(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.checkSequence();
    }

    handleMouseLeave(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.checkSequence();
    }

    handleTouchStart(e) {
        if (!this.gameRunning || this.gamePaused) return;
        
        const touch = e.touches[0];
        const cell = document.elementFromPoint(touch.clientX, touch.clientY).closest('.cell');
        if (!cell) return;
        
        this.isDragging = true;
        this.selectedCells = [];
        this.dragDirection = null;
        
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        this.selectCell(row, col);
        e.preventDefault();
    }

    handleTouchMove(e) {
        if (!this.isDragging || !this.gameRunning || this.gamePaused) return;
        
        const touch = e.touches[0];
        const cell = document.elementFromPoint(touch.clientX, touch.clientY).closest('.cell');
        if (!cell) return;
        
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        // Определяем направление перетаскивания
        if (this.selectedCells.length === 1) {
            const firstCell = this.selectedCells[0];
            const rowDiff = row - firstCell.row;
            const colDiff = col - firstCell.col;
            
            if (Math.abs(rowDiff) > Math.abs(colDiff)) {
                this.dragDirection = 'vertical';
            } else if (Math.abs(colDiff) > Math.abs(rowDiff)) {
                this.dragDirection = 'horizontal';
            }
        }
        
        // Проверяем, можно ли добавить эту ячейку
        if (this.canAddCell(row, col)) {
            this.selectCell(row, col);
        }
        
        e.preventDefault();
    }

    handleTouchEnd(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.checkSequence();
    }

    canTurnLine(row, col) {
        const lastCell = this.selectedCells[this.selectedCells.length - 1];
        const secondLastCell = this.selectedCells[this.selectedCells.length - 2];
        
        // Проверяем, можно ли повернуть линию на 90 градусов
        if (this.dragDirection === 'horizontal') {
            // Если текущее направление горизонтальное, проверяем вертикальный поворот
            // Ячейка должна быть в том же столбце, что и последняя, и соседняя по строке
            if (col === lastCell.col && Math.abs(row - lastCell.row) === 1) {
                // Проверяем, что это действительно поворот (не продолжение линии)
                // Для поворота новая ячейка должна быть в другом столбце, чем предпоследняя
                if (col !== secondLastCell.col) {
                    console.log(`🔄 Rotation from horizontal to vertical: ${row},${col}`);
                    this.dragDirection = 'vertical';
                    return true;
                }
            }
        } else if (this.dragDirection === 'vertical') {
            // Если текущее направление вертикальное, проверяем горизонтальный поворот
            // Ячейка должна быть в той же строке, что и последняя, и соседняя по столбцу
            if (row === lastCell.row && Math.abs(col - lastCell.col) === 1) {
                // Проверяем, что это действительно поворот (не продолжение линии)
                // Для поворота новая ячейка должна быть в другой строке, чем предпоследняя
                if (row !== secondLastCell.row) {
                    console.log(`🔄 Rotation from vertical to horizontal: ${row},${col}`);
                    this.dragDirection = 'horizontal';
                    return true;
                }
            }
        }
        
        return false;
    }

    canAddCell(row, col) {
        // Проверяем, что ячейка еще не выбрана
        if (this.selectedCells.some(cell => cell.row === row && cell.col === col)) {
            console.log(`❌ Cell ${row},${col} already selected`);
            return false;
        }
        
        // Если это первая ячейка, можно выбрать любую
        if (this.selectedCells.length === 0) {
            console.log(`✅ First cell: ${row},${col}`);
            return true;
        }
        
        const firstCell = this.selectedCells[0];
        const lastCell = this.selectedCells[this.selectedCells.length - 1];
        
        // Если у нас только одна ячейка, определяем направление
        if (this.selectedCells.length === 1) {
            const rowDiff = row - firstCell.row;
            const colDiff = col - firstCell.col;
            
            if (Math.abs(rowDiff) > Math.abs(colDiff)) {
                this.dragDirection = 'vertical';
            } else if (Math.abs(colDiff) > Math.abs(rowDiff)) {
                this.dragDirection = 'horizontal';
            }
            console.log(`🎯 Direction determined: ${this.dragDirection}`);
        }
        
        // Проверяем возможность поворота линии
        if (this.selectedCells.length >= 2) {
            const canTurn = this.canTurnLine(row, col);
            if (canTurn) {
                console.log(`🔄 Line turn at ${row},${col}`);
                return true;
            }
        }
        
        // Проверяем, можно ли добавить эту ячейку в текущем направлении
        if (this.dragDirection === 'horizontal') {
            // Проверяем, что ячейка в той же строке и соседняя с последней выбранной
            const canAdd = row === lastCell.row && Math.abs(col - lastCell.col) === 1;
            if (canAdd) {
                console.log(`➡️ Horizontal continuation: ${row},${col}`);
            } else {
                console.log(`❌ Cannot add horizontally: ${row},${col}`);
            }
            return canAdd;
        } else if (this.dragDirection === 'vertical') {
            // Проверяем, что ячейка в том же столбце и соседняя с последней выбранной
            const canAdd = col === lastCell.col && Math.abs(row - lastCell.row) === 1;
            if (canAdd) {
                console.log(`⬇️ Vertical continuation: ${row},${col}`);
            } else {
                console.log(`❌ Cannot add vertically: ${row},${col}`);
            }
            return canAdd;
        }
        
        console.log(`❌ Unknown direction for ${row},${col}`);
        return false;
    }

    selectCell(row, col) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell && !cell.classList.contains('selected')) {
            cell.classList.add('selected');
            this.selectedCells.push({ row, col, value: this.gameBoard[row][col] });
            
            // Отладочная информация
            console.log(`✅ Cell selected: ${this.gameBoard[row][col]} (${row},${col})`);
            console.log(`📊 Total selected: ${this.selectedCells.length} cells`);
            console.log(`🎯 Direction: ${this.dragDirection}`);
        }
    }

    checkSequence() {
        if (this.selectedCells.length === 0) return;
        
        // Проверяем, что все ячейки соединены правильно (последовательно)
        if (!this.isValidSequence()) {
            console.log('❌ Sequence is not valid');
            this.clearSelection();
            return;
        }
        
        // Вычисляем сумму
        const sum = this.selectedCells.reduce((total, cell) => total + cell.value, 0);
        
        // Отладочная информация
        console.log('Sequence check:', {
            cells: this.selectedCells.map(c => `${c.value}(${c.row},${c.col})`),
            sum: sum,
            targetSum: this.targetSum,
            direction: this.dragDirection
        });
        
        if (sum === this.targetSum) {
            console.log('✅ Match found!');
            this.handleMatch();
        } else {
            console.log('❌ Sum does not match');
            this.clearSelection();
        }
    }

    isValidSequence() {
        if (this.selectedCells.length <= 1) return true;
        
        // Проверяем, что все ячейки соединены последовательно
        for (let i = 1; i < this.selectedCells.length; i++) {
            const prev = this.selectedCells[i - 1];
            const curr = this.selectedCells[i];
            
            const rowDiff = Math.abs(curr.row - prev.row);
            const colDiff = Math.abs(curr.col - prev.col);
            
            // Ячейки должны быть соседними (разница в позиции = 1)
            if (rowDiff + colDiff !== 1) {
                return false;
            }
        }
        
        return true;
    }

    handleMatch() {
        // Добавляем очки (больше очков за длинные последовательности)
        const points = this.selectedCells.length * 10;
        this.score += points;
        
        // Показываем анимацию совпадения
        this.selectedCells.forEach(cell => {
            const cellElement = document.querySelector(`[data-row="${cell.row}"][data-col="${cell.col}"]`);
            cellElement.classList.remove('selected');
            cellElement.classList.add('matched');
            
            // Удаляем ячейку через анимацию
            setTimeout(() => {
                cellElement.classList.add('removed');
                this.gameBoard[cell.row][cell.col] = 0;
            }, 600);
        });
        
        // Заполняем пустые места новыми числами
        setTimeout(() => {
            this.fillEmptyCells();
            this.updateDisplay();
        }, 900);
        
        this.selectedCells = [];
        
        // Проверяем, нужно ли повысить уровень
        if (this.score >= this.level * 100) {
            this.levelUp();
        }
    }

    fillEmptyCells() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.gameBoard[row][col] === 0) {
                    const newValue = Math.floor(Math.random() * 9) + 1;
                    this.gameBoard[row][col] = newValue;
                    
                    const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    cellElement.textContent = newValue;
                    cellElement.classList.remove('matched', 'removed');
                }
            }
        }
    }

    clearSelection() {
        this.selectedCells.forEach(cell => {
            const cellElement = document.querySelector(`[data-row="${cell.row}"][data-col="${cell.col}"]`);
            cellElement.classList.remove('selected');
        });
        this.selectedCells = [];
    }

    levelUp() {
        this.level++;
        this.targetSum = Math.min(15 + this.level * 2, 25); // Увеличиваем сложность
        this.updateDisplay();
        
        // Показываем уведомление о повышении уровня
        this.showLevelUpNotification();
    }

    showLevelUpNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(145deg, #48bb78, #38a169);
            color: white;
            padding: 20px 40px;
            border-radius: 15px;
            font-size: 1.5rem;
            font-weight: bold;
            z-index: 1001;
            animation: fadeInOut 2s ease-in-out;
        `;
        notification.textContent = `🎉 Level ${this.level}!`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 2000);
    }

    startGame() {
        this.gameRunning = true;
        this.gamePaused = false;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        
        this.timer = setInterval(() => {
            if (!this.gamePaused) {
                this.timeLeft--;
                this.updateDisplay();
                
                if (this.timeLeft <= 0) {
                    this.endGame();
                }
            }
        }, 1000);
    }

    togglePause() {
        this.gamePaused = !this.gamePaused;
        this.pauseBtn.textContent = this.gamePaused ? 'Continue' : 'Pause';
    }

    endGame() {
        this.gameRunning = false;
        clearInterval(this.timer);
        
        this.finalScoreElement.textContent = this.score;
        this.finalLevelElement.textContent = this.level;
        this.gameOverModal.classList.remove('hidden');
    }

    restartGame() {
        this.score = 0;
        this.level = 1;
        this.targetSum = 15;
        this.timeLeft = 60;
        this.gameRunning = false;
        this.gamePaused = false;
        this.selectedCells = [];
        this.isDragging = false;
        
        clearInterval(this.timer);
        
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = 'Pause';
        
        this.gameOverModal.classList.add('hidden');
        this.createBoard();
        this.updateDisplay();
        
        // Очищаем все выделения
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('selected', 'matched', 'removed');
        });
    }

    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.timerElement.textContent = this.timeLeft;
        this.targetSumElement.textContent = this.targetSum;
        this.levelElement.textContent = this.level;
    }

    // Тестовая функция для поиска всех возможных последовательностей
    findPossibleSequences() {
        console.log('🔍 Searching for possible sequences...');
        let foundSequences = [];
        
        // Поиск горизонтальных последовательностей
        for (let row = 0; row < this.boardSize; row++) {
            for (let startCol = 0; startCol < this.boardSize - 1; startCol++) {
                for (let endCol = startCol + 1; endCol < this.boardSize; endCol++) {
                    let sum = 0;
                    let sequence = [];
                    
                    for (let col = startCol; col <= endCol; col++) {
                        sum += this.gameBoard[row][col];
                        sequence.push({ row, col, value: this.gameBoard[row][col] });
                    }
                    
                    if (sum === this.targetSum) {
                        foundSequences.push({
                            type: 'horizontal',
                            sequence: sequence,
                            sum: sum,
                            length: sequence.length
                        });
                    }
                }
            }
        }
        
        // Поиск вертикальных последовательностей
        for (let col = 0; col < this.boardSize; col++) {
            for (let startRow = 0; startRow < this.boardSize - 1; startRow++) {
                for (let endRow = startRow + 1; endRow < this.boardSize; endRow++) {
                    let sum = 0;
                    let sequence = [];
                    
                    for (let row = startRow; row <= endRow; row++) {
                        sum += this.gameBoard[row][col];
                        sequence.push({ row, col, value: this.gameBoard[row][col] });
                    }
                    
                    if (sum === this.targetSum) {
                        foundSequences.push({
                            type: 'vertical',
                            sequence: sequence,
                            sum: sum,
                            length: sequence.length
                        });
                    }
                }
            }
        }
        
        // Поиск L-образных последовательностей (горизонталь + вертикаль)
        for (let row = 0; row < this.boardSize - 1; row++) {
            for (let col = 0; col < this.boardSize - 1; col++) {
                // Проверяем все возможные L-формы
                this.findLShapedSequences(row, col, foundSequences);
            }
        }
        
        console.log(`📊 Found ${foundSequences.length} sequences:`);
        foundSequences.forEach((seq, index) => {
            console.log(`${index + 1}. ${seq.type} (${seq.length} cells): ${seq.sequence.map(c => c.value).join(' + ')} = ${seq.sum}`);
        });
        
        // Находим самую длинную последовательность
        if (foundSequences.length > 0) {
            const longest = foundSequences.reduce((max, seq) => seq.length > max.length ? seq : max);
            console.log(`🏆 Longest sequence: ${longest.length} cells (${longest.type})`);
        }
        
        return foundSequences;
    }

    findLShapedSequences(row, col, foundSequences) {
        const targetSum = this.targetSum;
        
        // Проверяем L-формы: горизонталь вправо + вертикаль вниз
        for (let hLen = 1; hLen <= 4; hLen++) {
            for (let vLen = 1; vLen <= 4; vLen++) {
                if (col + hLen <= this.boardSize && row + vLen <= this.boardSize) {
                    let sum = 0;
                    let sequence = [];
                    
                    // Горизонтальная часть
                    for (let i = 0; i < hLen; i++) {
                        sum += this.gameBoard[row][col + i];
                        sequence.push({ row, col: col + i, value: this.gameBoard[row][col + i] });
                    }
                    
                    // Вертикальная часть (начиная с угла)
                    for (let i = 1; i < vLen; i++) {
                        sum += this.gameBoard[row + i][col + hLen - 1];
                        sequence.push({ row: row + i, col: col + hLen - 1, value: this.gameBoard[row + i][col + hLen - 1] });
                    }
                    
                    if (sum === targetSum && sequence.length >= 3) {
                        foundSequences.push({
                            type: 'L-shaped',
                            sequence: sequence,
                            sum: sum,
                            length: sequence.length
                        });
                    }
                }
            }
        }
        
        // Проверяем L-формы: вертикаль вниз + горизонталь вправо
        for (let vLen = 1; vLen <= 4; vLen++) {
            for (let hLen = 1; hLen <= 4; hLen++) {
                if (row + vLen <= this.boardSize && col + hLen <= this.boardSize) {
                    let sum = 0;
                    let sequence = [];
                    
                    // Вертикальная часть
                    for (let i = 0; i < vLen; i++) {
                        sum += this.gameBoard[row + i][col];
                        sequence.push({ row: row + i, col, value: this.gameBoard[row + i][col] });
                    }
                    
                    // Горизонтальная часть (начиная с угла)
                    for (let i = 1; i < hLen; i++) {
                        sum += this.gameBoard[row + vLen - 1][col + i];
                        sequence.push({ row: row + vLen - 1, col: col + i, value: this.gameBoard[row + vLen - 1][col + i] });
                    }
                    
                    if (sum === targetSum && sequence.length >= 3) {
                        foundSequences.push({
                            type: 'L-shaped',
                            sequence: sequence,
                            sum: sum,
                            length: sequence.length
                        });
                    }
                }
            }
        }
    }
}

// Добавляем CSS для анимации уведомления о повышении уровня
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    }
`;
document.head.appendChild(style);

// Инициализируем игру при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new MathGame();
}); 