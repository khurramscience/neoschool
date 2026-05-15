class MultiplicationBlaster {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.grid = [];
        this.currentLevel = 1;
        this.score = 0;
        this.lineLength = 1;
        this.shots = 0;
        this.maxLevels = 5;
        
        // Размеры сетки
        this.gridSize = 30;
        this.gridWidth = Math.floor(this.canvas.width / this.gridSize);
        this.gridHeight = Math.floor(this.canvas.height / this.gridSize);
        
        // Задания для каждого уровня
        this.levels = [
            { a: 3, b: 4, target: 12 },
            { a: 5, b: 3, target: 15 },
            { a: 6, b: 7, target: 42 },
            { a: 4, b: 8, target: 32 },
            { a: 7, b: 9, target: 63 }
        ];
        
        this.currentTask = this.levels[0];
        
        this.init();
    }
    
    init() {
        this.initializeGrid();
        this.setupEventListeners();
        this.updateDisplay();
        this.drawGrid();
    }
    
    initializeGrid() {
        this.grid = [];
        for (let y = 0; y < this.gridHeight; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                this.grid[y][x] = false;
            }
        }
    }
    
    setupEventListeners() {
        // Управление длиной линии
        const lineLengthSlider = document.getElementById('line-length');
        const lineLengthDisplay = document.getElementById('line-length-display');
        
        lineLengthSlider.addEventListener('input', (e) => {
            this.lineLength = parseInt(e.target.value);
            lineLengthDisplay.textContent = this.lineLength;
        });
        
        // Кнопка стрельбы
        document.getElementById('shoot-btn').addEventListener('click', () => {
            this.shoot();
        });
        
        // Кнопка очистки
        document.getElementById('clear-btn').addEventListener('click', () => {
            this.clearGrid();
        });
        
        // Кнопка следующего уровня
        document.getElementById('next-level-btn').addEventListener('click', () => {
            this.nextLevel();
        });
        
        // Кнопка перезапуска
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
        
        // Клики по канвасу для стрельбы
        this.canvas.addEventListener('click', (e) => {
            this.handleCanvasClick(e);
        });
    }
    
    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const gridX = Math.floor(x / this.gridSize);
        const gridY = Math.floor(y / this.gridSize);
        
        if (gridX >= 0 && gridX < this.gridWidth && gridY >= 0 && gridY < this.gridHeight) {
            this.shootAtPosition(gridX, gridY);
        }
    }
    
    shootAtPosition(startX, startY) {
        // Проверяем, можно ли разместить линию
        if (startX + this.lineLength > this.gridWidth) {
            this.showStatus('Line doesn\'t fit! Try a different position.', 'error');
            return;
        }
        
        // Размещаем линию
        for (let i = 0; i < this.lineLength; i++) {
            if (startX + i < this.gridWidth) {
                this.grid[startY][startX + i] = true;
            }
        }
        
        this.shots++;
        this.drawGrid();
        this.updateGridInfo();
        this.checkResult();
    }
    
    shoot() {
        // Автоматическая стрельба - размещаем линию в случайном месте
        const maxAttempts = 50;
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            const startX = Math.floor(Math.random() * (this.gridWidth - this.lineLength + 1));
            const startY = Math.floor(Math.random() * this.gridHeight);
            
            // Проверяем, есть ли место для линии
            let canPlace = true;
            for (let i = 0; i < this.lineLength; i++) {
                if (this.grid[startY][startX + i]) {
                    canPlace = false;
                    break;
                }
            }
            
            if (canPlace) {
                this.shootAtPosition(startX, startY);
                return;
            }
            
            attempts++;
        }
        
        this.showStatus('Could not find space for the line! Clear the field.', 'error');
    }
    
    clearGrid() {
        this.initializeGrid();
        this.shots = 0;
        this.drawGrid();
        this.updateGridInfo();
        this.clearStatus();
    }
    
    drawGrid() {
        // Очищаем канвас
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисуем сетку
        this.ctx.strokeStyle = '#e2e8f0';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.gridWidth; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.gridSize, 0);
            this.ctx.lineTo(x * this.gridSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.gridHeight; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.gridSize);
            this.ctx.lineTo(this.canvas.width, y * this.gridSize);
            this.ctx.stroke();
        }
        
        // Рисуем заполненные ячейки
        this.ctx.fillStyle = '#ff6b6b';
        
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.grid[y][x]) {
                    this.ctx.fillRect(
                        x * this.gridSize + 2,
                        y * this.gridSize + 2,
                        this.gridSize - 4,
                        this.gridSize - 4
                    );
                }
            }
        }
    }
    
    countFilledCells() {
        let count = 0;
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.grid[y][x]) count++;
            }
        }
        return count;
    }
    
    updateGridInfo() {
        const filledCells = this.countFilledCells();
        const rows = this.shots;
        const cols = this.lineLength;
        
        document.getElementById('grid-size').textContent = `${rows} × ${cols} = ${filledCells}`;
    }
    
    checkResult() {
        const filledCells = this.countFilledCells();
        const expectedResult = this.currentTask.target;
        
        if (filledCells === expectedResult) {
            this.score += 100;
            this.showStatus(`Excellent! Correct! ${this.currentTask.a} × ${this.currentTask.b} = ${expectedResult}`, 'success');
            document.getElementById('next-level-btn').style.display = 'inline-block';
        } else if (filledCells > expectedResult) {
            this.showStatus(`Too many! Need ${expectedResult}, but you have ${filledCells}`, 'error');
        } else {
            this.showStatus(`Keep going! Need ${expectedResult}, you have ${filledCells}`, 'error');
        }
    }
    
    nextLevel() {
        if (this.currentLevel < this.maxLevels) {
            this.currentLevel++;
            this.currentTask = this.levels[this.currentLevel - 1];
            this.clearGrid();
            this.updateDisplay();
            this.clearStatus();
            document.getElementById('next-level-btn').style.display = 'none';
        } else {
            this.showVictory();
        }
    }
    
    showVictory() {
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('victory-modal').style.display = 'flex';
    }
    
    restartGame() {
        this.currentLevel = 1;
        this.score = 0;
        this.currentTask = this.levels[0];
        this.clearGrid();
        this.updateDisplay();
        this.clearStatus();
        document.getElementById('next-level-btn').style.display = 'none';
        document.getElementById('victory-modal').style.display = 'none';
    }
    
    updateDisplay() {
        document.getElementById('current-level').textContent = this.currentLevel;
        document.getElementById('score').textContent = this.score;
        document.getElementById('current-task').textContent = `${this.currentTask.a} × ${this.currentTask.b} = ?`;
        document.getElementById('target-result').textContent = `Цель: ${this.currentTask.target}`;
    }
    
    showStatus(message, type) {
        const statusElement = document.getElementById('status-message');
        statusElement.textContent = message;
        statusElement.className = `status-message ${type}`;
    }
    
    clearStatus() {
        const statusElement = document.getElementById('status-message');
        statusElement.textContent = '';
        statusElement.className = 'status-message';
    }
}

// Запускаем игру когда страница загружена
document.addEventListener('DOMContentLoaded', () => {
    new MultiplicationBlaster();
}); 