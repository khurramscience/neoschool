class BubbleGame {
    constructor() {
        this.gameArea = document.getElementById('gameArea');
        this.startButton = document.getElementById('startButton');
        this.restartButton = document.getElementById('restartButton');
        this.gameOverScreen = document.getElementById('gameOver');
        this.levelCompleteScreen = document.getElementById('levelComplete');
        this.levelNav = document.getElementById('levelNav');
        
        this.level = 1;
        this.score = 0;
        this.missed = 0;
        this.correctBubbles = 0;
        this.incorrectBubbles = 0;
        this.timeLeft = 30;
        this.gameRunning = false;
        this.bubbles = [];
        this.bubbleInterval = null;
        this.timerInterval = null;
        
        // Только 5 уровней
        this.targetNumbers = [5, 3, 7, 4, 6];
        this.maxLevel = this.targetNumbers.length;
        
        this.init();
    }
    
    init() {
        this.startButton.addEventListener('click', () => this.startGame());
        this.restartButton.addEventListener('click', () => this.restartGame());
        document.getElementById('continueButton').addEventListener('click', () => this.continueToNextLevel());
        document.getElementById('stopButton').addEventListener('click', () => this.stopGame());
        document.getElementById('playAgainButton').addEventListener('click', () => this.playAgain());
        
        // Навигация по уровням
        this.levelNav.querySelectorAll('.level-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lvl = parseInt(btn.dataset.level);
                this.goToLevel(lvl);
            });
        });
        this.updateLevelNav();
        this.updateDisplay();
    }
    
    startGame() {
        this.gameRunning = true;
        this.startButton.style.display = 'none';
        document.querySelector('.instructions').style.display = 'none';
        this.levelCompleteScreen.style.display = 'none'; // Скрываем экран завершения уровня
        
        this.startTimer();
        this.startBubbleGeneration();
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.endLevel();
            }
        }, 1000);
    }
    
    startBubbleGeneration() {
        this.bubbleInterval = setInterval(() => {
            this.createBubble();
        }, 1500); // Новый пузырь каждые 1.5 секунды
    }
    
    createBubble() {
        if (!this.gameRunning) return;
        
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        // Генерируем пример на вычитание
        const example = this.generateSubtractionExample();
        bubble.textContent = example.text;
        bubble.dataset.result = example.result;
        bubble.dataset.isCorrect = (example.result === this.getTargetNumber()).toString();
        
        // Случайная позиция по горизонтали (с учетом размера пузыря)
        const bubbleSize = 60 + Math.random() * 40; // От 60 до 100 пикселей
        const maxX = this.gameArea.offsetWidth - bubbleSize;
        const x = Math.random() * maxX;
        bubble.style.left = x + 'px';
        bubble.style.top = '-80px'; // Начинаем сверху экрана
        
        // Размер пузыря
        bubble.style.width = bubbleSize + 'px';
        bubble.style.height = bubbleSize + 'px';
        bubble.style.fontSize = (bubbleSize * 0.3) + 'px';
        
        // Сохраняем начальную позицию X для ограничения движения
        bubble.dataset.initialX = x;
        bubble.dataset.bubbleSize = bubbleSize;
        bubble.dataset.wasPopped = 'false'; // Флаг для отслеживания, был ли пузырь лопнут
        
        // Добавляем обработчик клика
        bubble.addEventListener('click', () => this.popBubble(bubble));
        
        this.gameArea.appendChild(bubble);
        this.bubbles.push(bubble);
        
        // Анимация падения
        this.animateBubble(bubble);
    }
    
    generateSubtractionExample() {
        const targetNumber = this.getTargetNumber();
        const maxNumber = Math.max(10, targetNumber + 5 + this.level * 2); // Увеличиваем сложность с уровнем
        
        // 70% шанс создать правильный пример, 30% - неправильный
        const shouldBeCorrect = Math.random() < 0.7;
        
        if (shouldBeCorrect) {
            // Создаем пример, который даст целевое число
            const result = targetNumber;
            const secondNumber = Math.floor(Math.random() * 10) + 1;
            const firstNumber = result + secondNumber;
            return {
                text: `${firstNumber} - ${secondNumber}`,
                result: result
            };
        } else {
            // Создаем неправильный пример
            let result;
            do {
                const secondNumber = Math.floor(Math.random() * 10) + 1;
                const firstNumber = Math.floor(Math.random() * maxNumber) + secondNumber;
                result = firstNumber - secondNumber;
            } while (result === targetNumber);
            
            const secondNumber = Math.floor(Math.random() * 10) + 1;
            const firstNumber = result + secondNumber;
            return {
                text: `${firstNumber} - ${secondNumber}`,
                result: result
            };
        }
    }
    
    animateBubble(bubble) {
        const duration = 8000 + Math.random() * 4000; // 8-12 секунд
        const startTime = Date.now();
        const initialX = parseFloat(bubble.dataset.initialX);
        const bubbleSize = parseFloat(bubble.dataset.bubbleSize);
        const maxX = this.gameArea.offsetWidth - bubbleSize;
        
        const animate = () => {
            if (!this.gameRunning) return;
            
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress >= 1) {
                // Пузырь достиг дна
                this.removeBubble(bubble);
                // Увеличиваем счетчик пропущенных только если пузырь был правильным И не был лопнут
                if (bubble.dataset.isCorrect === 'true' && bubble.dataset.wasPopped === 'false') {
                    this.missed++;
                    this.updateDisplay();
                }
                return;
            }
            
            // Строго вертикальное падение с небольшим покачиванием
            const y = progress * (this.gameArea.offsetHeight + 80);
            const wobble = Math.sin(progress * 10) * 15; // Уменьшил амплитуду покачивания
            const currentX = initialX + wobble;
            
            // Ограничиваем движение в пределах границ
            const clampedX = Math.max(0, Math.min(currentX, maxX));
            
            bubble.style.top = (y - 80) + 'px';
            bubble.style.left = clampedX + 'px';
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    popBubble(bubble) {
        if (!this.gameRunning) return;
        
        // Проверяем, не был ли пузырь уже лопнут
        if (bubble.dataset.wasPopped === 'true') return;
        
        const isCorrect = bubble.dataset.isCorrect === 'true';
        
        // Отмечаем пузырь как лопнутый
        bubble.dataset.wasPopped = 'true';
        
        if (isCorrect) {
            this.score += 10;
            this.correctBubbles++;
            bubble.classList.add('correct');
        } else {
            this.score -= 5;
            this.incorrectBubbles++; // Увеличиваем счетчик неправильно лопнутых
            bubble.classList.add('incorrect');
        }
        
        bubble.classList.add('popped');
        this.updateDisplay();
        
        // Удаляем пузырь через 0.5 секунды
        setTimeout(() => {
            this.removeBubble(bubble);
        }, 500);
    }
    
    removeBubble(bubble) {
        const index = this.bubbles.indexOf(bubble);
        if (index > -1) {
            this.bubbles.splice(index, 1);
        }
        if (bubble.parentNode) {
            bubble.parentNode.removeChild(bubble);
        }
    }
    
    endLevel() {
        this.gameRunning = false;
        clearInterval(this.timerInterval);
        clearInterval(this.bubbleInterval);
        
        // Удаляем все пузыри
        this.bubbles.forEach(bubble => this.removeBubble(bubble));
        this.bubbles = [];
        
        // Проверяем, прошел ли игрок уровень
        // Уровень пройден, если не пропустил ни одного правильного пузыря И не лопнул ни одного неправильного
        if (this.missed === 0 && this.incorrectBubbles === 0) {
            // Уровень пройден
            this.level++;
            this.showLevelComplete();
        } else {
            // Уровень не пройден
            this.showGameOver(false);
        }
    }
    
    showLevelComplete() {
        // Показываем экран завершения уровня
        this.levelCompleteScreen.style.display = 'flex';
        
        // Определяем номер только что завершённого уровня
        const prevLevel = this.level - 1;
        const prevTarget = this.getTargetNumber(prevLevel);
        
        // Обновляем информацию на экране
        document.getElementById('levelCompleteMessage').textContent = 
            `Отлично! Ты правильно лопнул все пузыри с ответом ${prevTarget}!`;
        document.getElementById('levelScore').textContent = this.score;
        document.getElementById('levelCorrectBubbles').textContent = this.correctBubbles;
        document.getElementById('nextLevelNumber').textContent = this.level;
        document.getElementById('nextLevelTarget').textContent = this.getTargetNumber(this.level);
    }
    
    showGameOver(won) {
        this.gameOverScreen.style.display = 'flex';
        document.getElementById('gameOverTitle').textContent = won ? 'Победа! 🎉' : 'Игра окончена!';
        
        let message = '';
        if (won) {
            message = 'Ты прошел все уровни! Молодец!';
        } else {
            if (this.missed > 0 && this.incorrectBubbles > 0) {
                message = `Ты пропустил ${this.missed} правильных пузырей и лопнул ${this.incorrectBubbles} неправильных. Попробуй еще раз!`;
            } else if (this.missed > 0) {
                message = `Ты пропустил ${this.missed} правильных пузырей. Попробуй еще раз!`;
            } else {
                message = `Ты лопнул ${this.incorrectBubbles} неправильных пузырей. Попробуй еще раз!`;
            }
        }
        
        document.getElementById('gameOverMessage').textContent = message;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('correctBubbles').textContent = this.correctBubbles;
        document.getElementById('finalMissed').textContent = this.missed;
    }
    
    restartGame() {
        this.gameOverScreen.style.display = 'none';
        this.levelCompleteScreen.style.display = 'none';
        this.level = 1;
        this.score = 0;
        this.missed = 0;
        this.correctBubbles = 0;
        this.incorrectBubbles = 0;
        this.timeLeft = 30;
        this.gameRunning = false;
        
        this.updateDisplay();
        
        // Показываем инструкции и кнопку старта
        document.querySelector('.instructions').style.display = 'block';
        this.startButton.style.display = 'inline-block';
    }
    
    getTargetNumber(level = null) {
        const targetLevel = level || this.level;
        return this.targetNumbers[(targetLevel - 1) % this.targetNumbers.length];
    }
    
    continueToNextLevel() {
        // Скрываем экран завершения уровня
        this.levelCompleteScreen.style.display = 'none';
        
        // Переходим на следующий уровень
        this.level++;
        
        // Сбрасываем счетчики для нового уровня
        this.timeLeft = 30;
        this.missed = 0;
        this.incorrectBubbles = 0;
        
        // Обновляем отображение
        this.updateDisplay();
        
        // Начинаем новый уровень
        this.startGame();
    }
    
    stopGame() {
        // Скрываем экран завершения уровня
        this.levelCompleteScreen.style.display = 'none';
        
        // Показываем финальный экран с результатами
        this.showGameOver(true);
    }
    
    playAgain() {
        // Скрываем экран завершения уровня
        this.levelCompleteScreen.style.display = 'none';
        
        // Перезапускаем игру с первого уровня
        this.restartGame();
    }
    
    updateDisplay() {
        document.getElementById('level').textContent = this.level;
        document.getElementById('target-number').textContent = this.getTargetNumber();
        document.getElementById('instruction-target').textContent = this.getTargetNumber();
        document.getElementById('timer').textContent = this.timeLeft;
        document.getElementById('score').textContent = this.score;
        document.getElementById('missed').textContent = this.missed;
        document.getElementById('incorrect').textContent = this.incorrectBubbles;
    }

    goToLevel(lvl) {
        this.level = lvl;
        this.score = 0;
        this.missed = 0;
        this.correctBubbles = 0;
        this.incorrectBubbles = 0;
        this.timeLeft = 30;
        this.gameRunning = false;
        this.updateLevelNav();
        this.updateDisplay();
        document.querySelector('.instructions').style.display = 'block';
        this.startButton.style.display = 'inline-block';
        this.gameOverScreen.style.display = 'none';
        this.levelCompleteScreen.style.display = 'none';
        // Удаляем все пузыри если есть
        this.bubbles.forEach(bubble => this.removeBubble(bubble));
        this.bubbles = [];
    }

    updateLevelNav() {
        this.levelNav.querySelectorAll('.level-nav-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.level) === this.level);
        });
    }
}

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new BubbleGame();
}); 