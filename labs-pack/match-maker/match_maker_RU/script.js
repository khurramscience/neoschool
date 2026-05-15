class MemoryGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.steps = 0;
        this.gameMode = 'steps'; // 'steps' или 'time'
        this.difficulty = 'medium';
        this.gameStarted = false;
        this.gameTimer = null;
        this.startTime = null;
        this.totalPairs = 0;
        
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.gameBoard = document.getElementById('gameBoard');
        this.stepsCount = document.getElementById('stepsCount');
        this.timeCount = document.getElementById('timeCount');
        this.pairsFound = document.getElementById('pairsFound');
        this.startGameBtn = document.getElementById('startGame');
        this.gameOverModal = document.getElementById('gameOver');
        this.finalSteps = document.getElementById('finalSteps');
        this.finalTime = document.getElementById('finalTime');
        this.playAgainBtn = document.getElementById('playAgain');
        this.difficultySelect = document.getElementById('difficulty');
    }

    bindEvents() {
        // Режимы игры
        document.getElementById('stepsMode').addEventListener('click', () => this.setGameMode('steps'));
        document.getElementById('timeMode').addEventListener('click', () => this.setGameMode('time'));
        
        // Кнопки
        this.startGameBtn.addEventListener('click', () => this.startGame());
        this.playAgainBtn.addEventListener('click', () => this.resetGame());
        
        // Сложность
        this.difficultySelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
        });
    }

    setGameMode(mode) {
        this.gameMode = mode;
        
        // Обновляем активную кнопку
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(mode + 'Mode').classList.add('active');
        
        // Скрываем/показываем соответствующие элементы
        if (mode === 'time') {
            this.timeCount.parentElement.style.display = 'block';
        } else {
            this.timeCount.parentElement.style.display = 'block';
        }
    }

    generateMathPairs() {
        const pairs = [];
        const difficultySettings = {
            easy: { pairs: 6, maxNumber: 10 },
            medium: { pairs: 8, maxNumber: 15 },
            hard: { pairs: 12, maxNumber: 20 }
        };

        const settings = difficultySettings[this.difficulty];
        this.totalPairs = settings.pairs;

        // Генерируем математические примеры
        for (let i = 0; i < settings.pairs; i++) {
            let a, b, answer, operation;
            
            // Выбираем случайную операцию
            const operations = ['+', '-', '×'];
            operation = operations[Math.floor(Math.random() * operations.length)];
            
            switch (operation) {
                case '+':
                    a = Math.floor(Math.random() * (settings.maxNumber - 1)) + 1;
                    b = Math.floor(Math.random() * (settings.maxNumber - a)) + 1;
                    answer = a + b;
                    break;
                case '-':
                    a = Math.floor(Math.random() * (settings.maxNumber - 1)) + 2;
                    b = Math.floor(Math.random() * (a - 1)) + 1;
                    answer = a - b;
                    break;
                case '×':
                    a = Math.floor(Math.random() * Math.floor(Math.sqrt(settings.maxNumber))) + 1;
                    b = Math.floor(Math.random() * Math.floor(settings.maxNumber / a)) + 1;
                    answer = a * b;
                    break;
            }

            // Создаем пару: пример и ответ
            pairs.push({
                id: i * 2,
                content: `${a} ${operation} ${b}`,
                answer: answer,
                type: 'example'
            });
            
            pairs.push({
                id: i * 2 + 1,
                content: answer.toString(),
                answer: answer,
                type: 'answer'
            });
        }

        return pairs;
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    createCard(cardData) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.id = cardData.id;
        card.dataset.answer = cardData.answer;
        card.dataset.type = cardData.type;
        
        // Создаем рубашку карточки (видимая сторона)
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        cardBack.innerHTML = '🧮';
        
        // Создаем лицевую сторону карточки (скрытая)
        const cardFront = document.createElement('div');
        cardFront.className = 'card-front';
        cardFront.textContent = cardData.content;
        
        card.appendChild(cardBack);
        card.appendChild(cardFront);
        
        card.addEventListener('click', () => this.flipCard(card));
        
        return card;
    }

    renderGameBoard() {
        this.gameBoard.innerHTML = '';
        
        // Определяем количество колонок в зависимости от сложности
        let columns;
        switch (this.difficulty) {
            case 'easy': columns = 4; break;
            case 'medium': columns = 4; break;
            case 'hard': columns = 6; break;
        }
        
        this.gameBoard.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        
        this.cards.forEach(card => {
            this.gameBoard.appendChild(card);
        });
    }

    startGame() {
        this.gameStarted = true;
        this.matchedPairs = 0;
        this.steps = 0;
        this.flippedCards = [];
        
        // Генерируем карточки
        const cardData = this.generateMathPairs();
        const shuffledData = this.shuffleArray(cardData);
        
        this.cards = shuffledData.map(data => this.createCard(data));
        
        this.renderGameBoard();
        this.updateDisplay();
        
        // Запускаем таймер если режим времени
        if (this.gameMode === 'time') {
            this.startTimer();
        }
        
        this.startGameBtn.textContent = 'Перезапустить игру';
    }

    flipCard(card) {
        if (!this.gameStarted || card.classList.contains('flipped') || 
            card.classList.contains('matched') || this.flippedCards.length >= 2) {
            return;
        }

        card.classList.add('flipped');
        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            this.steps++;
            this.checkMatch();
        }
        
        this.updateDisplay();
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;
        const isMatch = card1.dataset.answer === card2.dataset.answer;

        setTimeout(() => {
            if (isMatch) {
                card1.classList.add('matched');
                card2.classList.add('matched');
                this.matchedPairs++;
                
                if (this.matchedPairs === this.totalPairs) {
                    this.endGame();
                }
            } else {
                // Если карточки не совпали, переворачиваем их обратно
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
            }
            
            this.flippedCards = [];
            this.updateDisplay();
        }, 1000);
    }

    startTimer() {
        this.startTime = Date.now();
        this.gameTimer = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            this.timeCount.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }

    updateDisplay() {
        this.stepsCount.textContent = this.steps;
        this.pairsFound.textContent = `${this.matchedPairs} / ${this.totalPairs}`;
    }

    endGame() {
        this.stopTimer();
        this.gameStarted = false;
        
        // Показываем результаты
        this.finalSteps.textContent = this.steps;
        this.finalTime.textContent = this.timeCount.textContent;
        
        this.gameOverModal.classList.remove('hidden');
    }

    resetGame() {
        this.gameOverModal.classList.add('hidden');
        this.stopTimer();
        this.gameStarted = false;
        this.matchedPairs = 0;
        this.steps = 0;
        this.flippedCards = [];
        this.cards = [];
        this.timeCount.textContent = '00:00';
        this.stepsCount.textContent = '0';
        this.pairsFound.textContent = '0';
        this.gameBoard.innerHTML = '';
        this.startGameBtn.textContent = 'Начать игру';
    }
}

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
}); 