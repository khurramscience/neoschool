class DivisionGame {
    constructor() {
        this.currentDifficulty = null;
        this.timer = null;
        this.timeLeft = 30;
        this.score = 0;
        this.correctAnswers = 0;
        this.totalQuestions = 0;
        this.currentProblem = null;
        this.isGameActive = false;
        this.isPaused = false;

        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        // Screens
        this.startScreen = document.getElementById('startScreen');
        this.gameScreen = document.getElementById('gameScreen');
        this.resultsScreen = document.getElementById('resultsScreen');

        // Start screen elements
        this.difficultyButtons = document.querySelectorAll('.difficulty-btn');
        this.startButton = document.getElementById('startGame');

        // Game screen elements
        this.timerElement = document.getElementById('timer');
        this.scoreElement = document.getElementById('score');
        this.cardNumberElement = document.querySelector('.card-number');
        this.dividendElement = document.getElementById('dividend');
        this.divisorElement = document.getElementById('divisor');
        this.answerInput = document.getElementById('answer');
        this.submitButton = document.getElementById('submitAnswer');
        this.pauseButton = document.getElementById('pauseGame');
        this.endButton = document.getElementById('endGame');

        // Results screen elements
        this.finalScoreElement = document.getElementById('finalScore');
        this.correctAnswersElement = document.getElementById('correctAnswers');
        this.totalQuestionsElement = document.getElementById('totalQuestions');
        this.accuracyElement = document.getElementById('accuracy');
        this.playAgainButton = document.getElementById('playAgain');
        this.backToMenuButton = document.getElementById('backToMenu');
    }

    bindEvents() {
        // Difficulty selection
        this.difficultyButtons.forEach(button => {
            button.addEventListener('click', () => this.selectDifficulty(button));
        });

        // Start game
        this.startButton.addEventListener('click', () => this.startGame());

        // Game controls
        this.submitButton.addEventListener('click', () => this.submitAnswer());
        this.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitAnswer();
        });
        this.pauseButton.addEventListener('click', () => this.togglePause());
        this.endButton.addEventListener('click', () => this.endGame());

        // Results screen
        this.playAgainButton.addEventListener('click', () => this.playAgain());
        this.backToMenuButton.addEventListener('click', () => this.backToMenu());
    }

    selectDifficulty(button) {
        // Remove selected class from all buttons
        this.difficultyButtons.forEach(btn => btn.classList.remove('selected'));
        
        // Add selected class to clicked button
        button.classList.add('selected');
        
        // Store difficulty
        this.currentDifficulty = button.dataset.difficulty;
        
        // Enable start button
        this.startButton.disabled = false;
    }

    startGame() {
        if (!this.currentDifficulty) return;

        this.isGameActive = true;
        this.timeLeft = 30;
        this.score = 0;
        this.correctAnswers = 0;
        this.totalQuestions = 0;

        this.showScreen(this.gameScreen);
        this.updateTimer();
        this.updateScore();
        this.generateNewProblem();
        this.startTimer();
        this.answerInput.focus();
    }

    startTimer() {
        this.timer = setInterval(() => {
            if (!this.isPaused) {
                this.timeLeft--;
                this.updateTimer();
                
                if (this.timeLeft <= 0) {
                    this.endGame();
                } else if (this.timeLeft <= 10) {
                    this.timerElement.classList.add('warning');
                }
            }
        }, 1000);
    }

    updateTimer() {
        this.timerElement.textContent = this.timeLeft;
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
    }

    generateNewProblem() {
        let minDivisor, maxDivisor, maxDividend;

        switch (this.currentDifficulty) {
            case 'easy':
                minDivisor = 2;
                maxDivisor = 5;
                maxDividend = 50;
                break;
            case 'medium':
                minDivisor = 6;
                maxDivisor = 10;
                maxDividend = 100;
                break;
            case 'hard':
                minDivisor = 11;
                maxDivisor = 15;
                maxDividend = 150;
                break;
            default:
                minDivisor = 2;
                maxDivisor = 5;
                maxDividend = 50;
        }

        // Generate divisor
        const divisor = Math.floor(Math.random() * (maxDivisor - minDivisor + 1)) + minDivisor;
        
        // Generate quotient (result)
        const quotient = Math.floor(Math.random() * 10) + 1;
        
        // Calculate dividend (divisor * quotient)
        const dividend = divisor * quotient;

        this.currentProblem = {
            dividend: dividend,
            divisor: divisor,
            quotient: quotient
        };

        this.totalQuestions++;
        this.cardNumberElement.textContent = this.totalQuestions;
        this.dividendElement.textContent = dividend;
        this.divisorElement.textContent = divisor;
        this.answerInput.value = '';
        this.answerInput.focus();
    }

    submitAnswer() {
        if (!this.isGameActive || this.isPaused) return;

        const userAnswer = parseInt(this.answerInput.value);
        
        if (isNaN(userAnswer)) {
            this.showFeedback('Please enter a valid number!', 'error');
            return;
        }

        if (userAnswer === this.currentProblem.quotient) {
            this.correctAnswers++;
            this.score += 10;
            this.showFeedback('Correct! +10 points', 'success');
        } else {
            this.showFeedback(`Wrong! ${this.currentProblem.dividend} ÷ ${this.currentProblem.divisor} = ${this.currentProblem.quotient}`, 'error');
        }

        this.updateScore();
        this.generateNewProblem();
    }

    showFeedback(message, type) {
        // Create feedback element
        const feedback = document.createElement('div');
        feedback.className = `feedback ${type}`;
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            background: ${type === 'success' ? '#48bb78' : '#e53e3e'};
        `;

        document.body.appendChild(feedback);

        // Remove after 2 seconds
        setTimeout(() => {
            feedback.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        }, 2000);
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.pauseButton.textContent = this.isPaused ? 'Resume' : 'Pause';
        
        if (this.isPaused) {
            this.answerInput.disabled = true;
            this.submitButton.disabled = true;
        } else {
            this.answerInput.disabled = false;
            this.submitButton.disabled = false;
            this.answerInput.focus();
        }
    }

    endGame() {
        this.isGameActive = false;
        this.isPaused = false;
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        this.showResults();
    }

    showResults() {
        const accuracy = this.totalQuestions > 0 ? Math.round((this.correctAnswers / this.totalQuestions) * 100) : 0;
        
        this.finalScoreElement.textContent = this.score;
        this.correctAnswersElement.textContent = this.correctAnswers;
        this.totalQuestionsElement.textContent = this.totalQuestions;
        this.accuracyElement.textContent = `${accuracy}%`;

        this.showScreen(this.resultsScreen);
    }

    playAgain() {
        this.resetGame();
        this.startGame();
    }

    backToMenu() {
        this.resetGame();
        this.showScreen(this.startScreen);
    }

    resetGame() {
        this.currentDifficulty = null;
        this.timeLeft = 30;
        this.score = 0;
        this.correctAnswers = 0;
        this.totalQuestions = 0;
        this.currentProblem = null;
        this.isGameActive = false;
        this.isPaused = false;

        // Reset UI
        this.difficultyButtons.forEach(btn => btn.classList.remove('selected'));
        this.startButton.disabled = true;
        this.timerElement.classList.remove('warning');
        this.pauseButton.textContent = 'Pause';
        this.answerInput.disabled = false;
        this.submitButton.disabled = false;
    }

    showScreen(screen) {
        // Hide all screens
        this.startScreen.classList.remove('active');
        this.gameScreen.classList.remove('active');
        this.resultsScreen.classList.remove('active');

        // Show target screen
        screen.classList.add('active');
    }
}

// Add CSS animations for feedback
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DivisionGame();
}); 