class MathGame {
    constructor() {
        this.gameState = 'start'; // start, playing, results
        this.timeLimit = 60;
        this.timeLeft = 60;
        this.timer = null;
        this.correctAnswers = 0;
        this.totalAnswers = 0;
        this.mistakes = [];
        this.currentQuestion = null;
        this.operations = ['addition', 'subtraction', 'multiplication'];
        this.difficulty = 'medium';
        
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        // Screens
        this.startScreen = document.getElementById('start-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.resultsScreen = document.getElementById('results-screen');
        
        // Settings
        this.timeLimitInput = document.getElementById('time-limit');
        this.additionCheckbox = document.getElementById('addition');
        this.subtractionCheckbox = document.getElementById('subtraction');
        this.multiplicationCheckbox = document.getElementById('multiplication');
        this.difficultySelect = document.getElementById('difficulty');
        
        // Game elements
        this.timeDisplay = document.getElementById('time-display');
        this.correctAnswersDisplay = document.getElementById('correct-answers');
        this.totalAnswersDisplay = document.getElementById('total-answers');
        this.num1Display = document.getElementById('num1');
        this.operatorDisplay = document.getElementById('operator');
        this.num2Display = document.getElementById('num2');
        this.answerInput = document.getElementById('answer-input');
        
        // Results
        this.finalCorrect = document.getElementById('final-correct');
        this.finalTotal = document.getElementById('final-total');
        this.finalPercentage = document.getElementById('final-percentage');
        this.mistakesList = document.getElementById('mistakes-list');
        
        // Buttons
        this.startBtn = document.getElementById('start-btn');
        this.submitBtn = document.getElementById('submit-btn');
        this.endGameBtn = document.getElementById('end-game-btn');
        this.playAgainBtn = document.getElementById('play-again-btn');
        this.backToMenuBtn = document.getElementById('back-to-menu-btn');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.submitBtn.addEventListener('click', () => this.submitAnswer());
        this.endGameBtn.addEventListener('click', () => this.endGame());
        this.playAgainBtn.addEventListener('click', () => this.playAgain());
        this.backToMenuBtn.addEventListener('click', () => this.backToMenu());
        
        // Handle Enter key in input field
        this.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitAnswer();
            }
        });
        
        // Auto-focus on input field when game starts
        this.answerInput.addEventListener('focus', () => {
            this.answerInput.select();
        });
    }

    startGame() {
        // Get settings
        this.timeLimit = parseInt(this.timeLimitInput.value);
        this.timeLeft = this.timeLimit;
        
        // Get selected operations
        this.operations = [];
        if (this.additionCheckbox.checked) this.operations.push('addition');
        if (this.subtractionCheckbox.checked) this.operations.push('subtraction');
        if (this.multiplicationCheckbox.checked) this.operations.push('multiplication');
        
        // Check that at least one operation is selected
        if (this.operations.length === 0) {
            alert('Please select at least one operation!');
            return;
        }
        
        this.difficulty = this.difficultySelect.value;
        
        // Reset statistics
        this.correctAnswers = 0;
        this.totalAnswers = 0;
        this.mistakes = [];
        
        // Switch to game screen
        this.showScreen('game');
        
        // Start timer
        this.startTimer();
        
        // Generate first question
        this.generateQuestion();
        
        // Focus on input field
        setTimeout(() => {
            this.answerInput.focus();
        }, 100);
    }

    startTimer() {
        this.updateTimerDisplay();
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            // Warning when time is running out
            if (this.timeLeft <= 10) {
                document.querySelector('.timer').classList.add('warning');
            }
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        this.timeDisplay.textContent = this.timeLeft;
    }

    generateQuestion() {
        const operation = this.operations[Math.floor(Math.random() * this.operations.length)];
        let num1, num2, answer, operator;
        
        const maxNumber = this.getMaxNumber();
        
        switch (operation) {
            case 'addition':
                num1 = Math.floor(Math.random() * maxNumber) + 1;
                num2 = Math.floor(Math.random() * maxNumber) + 1;
                answer = num1 + num2;
                operator = '+';
                break;
                
            case 'subtraction':
                num1 = Math.floor(Math.random() * maxNumber) + 1;
                num2 = Math.floor(Math.random() * num1) + 1; // num2 <= num1 for positive result
                answer = num1 - num2;
                operator = '-';
                break;
                
            case 'multiplication':
                num1 = Math.floor(Math.random() * Math.min(maxNumber, 12)) + 1;
                num2 = Math.floor(Math.random() * Math.min(maxNumber, 12)) + 1;
                answer = num1 * num2;
                operator = '×';
                break;
        }
        
        this.currentQuestion = { num1, num2, answer, operator, operation };
        
        // Display question
        this.num1Display.textContent = num1;
        this.operatorDisplay.textContent = operator;
        this.num2Display.textContent = num2;
        
        // Clear input field
        this.answerInput.value = '';
        this.answerInput.className = '';
        this.answerInput.focus();
    }

    getMaxNumber() {
        switch (this.difficulty) {
            case 'easy': return 10;
            case 'medium': return 50;
            case 'hard': return 100;
            default: return 50;
        }
    }

    submitAnswer() {
        const userAnswer = parseInt(this.answerInput.value);
        
        if (isNaN(userAnswer)) {
            alert('Please enter a number!');
            return;
        }
        
        this.totalAnswers++;
        this.updateScoreDisplay();
        
        const isCorrect = userAnswer === this.currentQuestion.answer;
        
        if (isCorrect) {
            this.correctAnswers++;
            this.answerInput.classList.add('correct');
            this.showFeedback('Correct! 🎉', 'success');
        } else {
            this.answerInput.classList.add('incorrect');
            this.showFeedback('Wrong! 😔', 'error');
            
            // Save mistake
            this.mistakes.push({
                question: `${this.currentQuestion.num1} ${this.currentQuestion.operator} ${this.currentQuestion.num2} = ?`,
                userAnswer: userAnswer,
                correctAnswer: this.currentQuestion.answer
            });
        }
        
        // Remove classes after 1 second
        setTimeout(() => {
            this.answerInput.classList.remove('correct', 'incorrect');
        }, 1000);
        
        // Generate new question after 1.5 seconds
        setTimeout(() => {
            this.generateQuestion();
        }, 1500);
    }

    showFeedback(message, type) {
        // Create temporary notification
        const feedback = document.createElement('div');
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 10px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            background: ${type === 'success' ? '#48bb78' : '#f56565'};
        `;
        
        document.body.appendChild(feedback);
        
        // Remove after 2 seconds
        setTimeout(() => {
            feedback.remove();
        }, 2000);
    }

    updateScoreDisplay() {
        this.correctAnswersDisplay.textContent = this.correctAnswers;
        this.totalAnswersDisplay.textContent = this.totalAnswers;
    }

    endGame() {
        clearInterval(this.timer);
        document.querySelector('.timer').classList.remove('warning');
        this.showResults();
    }

    showResults() {
        // Update statistics
        this.finalCorrect.textContent = this.correctAnswers;
        this.finalTotal.textContent = this.totalAnswers;
        
        const percentage = this.totalAnswers > 0 ? Math.round((this.correctAnswers / this.totalAnswers) * 100) : 0;
        this.finalPercentage.textContent = `${percentage}%`;
        
        // Display mistakes
        this.displayMistakes();
        
        // Switch to results screen
        this.showScreen('results');
    }

    displayMistakes() {
        this.mistakesList.innerHTML = '';
        
        if (this.mistakes.length === 0) {
            this.mistakesList.innerHTML = '<p style="color: #48bb78; text-align: center; font-style: italic;">Excellent! No mistakes! 🎉</p>';
            return;
        }
        
        this.mistakes.forEach(mistake => {
            const mistakeItem = document.createElement('div');
            mistakeItem.className = 'mistake-item';
            mistakeItem.innerHTML = `
                <div class="question-text">${mistake.question}</div>
                <div class="answer-info">
                    <div class="your-answer">Your answer: ${mistake.userAnswer}</div>
                    <div class="correct-answer">Correct answer: ${mistake.correctAnswer}</div>
                </div>
            `;
            this.mistakesList.appendChild(mistakeItem);
        });
    }

    showScreen(screenName) {
        // Hide all screens
        this.startScreen.classList.remove('active');
        this.gameScreen.classList.remove('active');
        this.resultsScreen.classList.remove('active');
        
        // Show needed screen
        switch (screenName) {
            case 'start':
                this.startScreen.classList.add('active');
                break;
            case 'game':
                this.gameScreen.classList.add('active');
                break;
            case 'results':
                this.resultsScreen.classList.add('active');
                break;
        }
        
        this.gameState = screenName;
    }

    playAgain() {
        this.showScreen('start');
    }

    backToMenu() {
        this.showScreen('start');
    }
}

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new MathGame();
}); 