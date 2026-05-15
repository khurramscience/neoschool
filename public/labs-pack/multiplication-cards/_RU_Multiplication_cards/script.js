class MultiplicationGame {
    constructor() {
        this.currentMode = null;
        this.currentCard = 0;
        this.totalCards = 10;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.cards = [];
        this.currentExample = null;
        
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        // Получаем элементы DOM
        this.modeSelection = document.getElementById('mode-selection');
        this.gameArea = document.getElementById('game-area');
        this.results = document.getElementById('results');
        
        this.progressFill = document.getElementById('progress-fill');
        this.currentCardSpan = document.getElementById('current-card');
        this.totalCardsSpan = document.getElementById('total-cards');
        
        this.exampleText = document.getElementById('example-text');
        this.answerInput = document.getElementById('answer-input');
        this.submitBtn = document.getElementById('submit-btn');
        
        this.correctAnswersSpan = document.getElementById('correct-answers');
        this.incorrectAnswersSpan = document.getElementById('incorrect-answers');
        this.successRateSpan = document.getElementById('success-rate');
    }

    bindEvents() {
        // Обработчики для кнопок режимов
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = parseInt(e.currentTarget.dataset.mode);
                this.startGame(mode);
            });
        });

        // Обработчик для кнопки "Проверить"
        this.submitBtn.addEventListener('click', () => this.checkAnswer());

        // Обработчик для Enter в поле ввода
        this.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAnswer();
            }
        });

        // Обработчик для кнопки "Назад"
        document.getElementById('back-btn').addEventListener('click', () => {
            this.showModeSelection();
        });

        // Обработчики для кнопок результатов
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.startGame(this.currentMode);
        });

        document.getElementById('new-mode-btn').addEventListener('click', () => {
            this.showModeSelection();
        });
    }

    startGame(mode) {
        this.currentMode = mode;
        this.currentCard = 0;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.cards = this.generateCards(mode);
        
        this.showGameArea();
        this.showNextCard();
    }

    generateCards(mode) {
        const cards = [];
        
        for (let i = 0; i < this.totalCards; i++) {
            let a, b;
            
            switch (mode) {
                case 1: // Однозначные × Однозначные
                    a = Math.floor(Math.random() * 9) + 1; // 1-9
                    b = Math.floor(Math.random() * 9) + 1; // 1-9
                    break;
                    
                case 2: // Однозначные × 10-19
                    a = Math.floor(Math.random() * 9) + 1; // 1-9
                    b = Math.floor(Math.random() * 10) + 10; // 10-19
                    break;
                    
                case 3: // Однозначные × 10-99
                    a = Math.floor(Math.random() * 9) + 1; // 1-9
                    b = Math.floor(Math.random() * 90) + 10; // 10-99
                    break;
                    
                case 4: // Двузначные × Двузначные
                    a = Math.floor(Math.random() * 90) + 10; // 10-99
                    b = Math.floor(Math.random() * 90) + 10; // 10-99
                    break;
                    
                case 5: // Смешанный режим
                    const subMode = Math.floor(Math.random() * 4) + 1;
                    const subCards = this.generateCards(subMode);
                    cards.push(...subCards);
                    continue;
            }
            
            cards.push({
                a: a,
                b: b,
                answer: a * b,
                example: `${a} × ${b} = ?`
            });
        }
        
        // Для смешанного режима берем только первые 10 карточек
        return cards.slice(0, this.totalCards);
    }

    showNextCard() {
        if (this.currentCard >= this.totalCards) {
            this.showResults();
            return;
        }

        this.currentExample = this.cards[this.currentCard];
        this.exampleText.textContent = this.currentExample.example;
        this.answerInput.value = '';
        this.answerInput.focus();
        
        this.updateProgress();
    }

    checkAnswer() {
        const userAnswer = parseInt(this.answerInput.value);
        
        if (isNaN(userAnswer)) {
            alert('Пожалуйста, введите число!');
            return;
        }

        const isCorrect = userAnswer === this.currentExample.answer;
        
        if (isCorrect) {
            this.correctAnswers++;
            this.showCorrectAnswer();
        } else {
            this.incorrectAnswers++;
            this.showIncorrectAnswer();
        }

        this.currentCard++;
        
        // Небольшая задержка перед следующим примером
        setTimeout(() => {
            this.showNextCard();
        }, 1500);
    }

    showCorrectAnswer() {
        this.answerInput.style.borderColor = '#4CAF50';
        this.answerInput.style.backgroundColor = '#f1f8e9';
        this.submitBtn.textContent = '✓ Правильно!';
        this.submitBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
        
        setTimeout(() => {
            this.answerInput.style.borderColor = '#ddd';
            this.answerInput.style.backgroundColor = 'white';
            this.submitBtn.textContent = 'Проверить';
            this.submitBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }, 1500);
    }

    showIncorrectAnswer() {
        this.answerInput.style.borderColor = '#f44336';
        this.answerInput.style.backgroundColor = '#ffebee';
        this.submitBtn.textContent = `✗ Неправильно! Правильный ответ: ${this.currentExample.answer}`;
        this.submitBtn.style.background = 'linear-gradient(135deg, #f44336, #d32f2f)';
        
        setTimeout(() => {
            this.answerInput.style.borderColor = '#ddd';
            this.answerInput.style.backgroundColor = 'white';
            this.submitBtn.textContent = 'Проверить';
            this.submitBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }, 1500);
    }

    updateProgress() {
        const progress = (this.currentCard / this.totalCards) * 100;
        this.progressFill.style.width = `${progress}%`;
        this.currentCardSpan.textContent = this.currentCard + 1;
        this.totalCardsSpan.textContent = this.totalCards;
    }

    showResults() {
        const successRate = Math.round((this.correctAnswers / this.totalCards) * 100);
        
        this.correctAnswersSpan.textContent = this.correctAnswers;
        this.incorrectAnswersSpan.textContent = this.incorrectAnswers;
        this.successRateSpan.textContent = `${successRate}%`;
        
        this.gameArea.classList.add('hidden');
        this.results.classList.remove('hidden');
    }

    showGameArea() {
        this.modeSelection.classList.add('hidden');
        this.results.classList.add('hidden');
        this.gameArea.classList.remove('hidden');
    }

    showModeSelection() {
        this.gameArea.classList.add('hidden');
        this.results.classList.add('hidden');
        this.modeSelection.classList.remove('hidden');
    }
}

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new MultiplicationGame();
}); 