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
        
        // Only 5 levels
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
        
        // Level navigation
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
        this.levelCompleteScreen.style.display = 'none'; // Hide level complete screen
        
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
        }, 1500); // New bubble every 1.5 seconds
    }
    
    createBubble() {
        if (!this.gameRunning) return;
        
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        // Generate subtraction example
        const example = this.generateSubtractionExample();
        bubble.textContent = example.text;
        bubble.dataset.result = example.result;
        bubble.dataset.isCorrect = (example.result === this.getTargetNumber()).toString();
        
        // Random horizontal position (considering bubble size)
        const bubbleSize = 60 + Math.random() * 40; // From 60 to 100 pixels
        const maxX = this.gameArea.offsetWidth - bubbleSize;
        const x = Math.random() * maxX;
        bubble.style.left = x + 'px';
        bubble.style.top = '-80px'; // Start from top of screen
        
        // Bubble size
        bubble.style.width = bubbleSize + 'px';
        bubble.style.height = bubbleSize + 'px';
        bubble.style.fontSize = (bubbleSize * 0.3) + 'px';
        
        // Save initial X position for movement constraints
        bubble.dataset.initialX = x;
        bubble.dataset.bubbleSize = bubbleSize;
        bubble.dataset.wasPopped = 'false'; // Flag to track if bubble was popped
        
        // Add click handler
        bubble.addEventListener('click', () => this.popBubble(bubble));
        
        this.gameArea.appendChild(bubble);
        this.bubbles.push(bubble);
        
        // Falling animation
        this.animateBubble(bubble);
    }
    
    generateSubtractionExample() {
        const targetNumber = this.getTargetNumber();
        const maxNumber = Math.max(10, targetNumber + 5 + this.level * 2); // Increase difficulty with level
        
        // 70% chance to create correct example, 30% - incorrect
        const shouldBeCorrect = Math.random() < 0.7;
        
        if (shouldBeCorrect) {
            // Create example that gives target number
            const result = targetNumber;
            const secondNumber = Math.floor(Math.random() * 10) + 1;
            const firstNumber = result + secondNumber;
            return {
                text: `${firstNumber} - ${secondNumber}`,
                result: result
            };
        } else {
            // Create incorrect example
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
        const duration = 8000 + Math.random() * 4000; // 8-12 seconds
        const startTime = Date.now();
        const initialX = parseFloat(bubble.dataset.initialX);
        const bubbleSize = parseFloat(bubble.dataset.bubbleSize);
        const maxX = this.gameArea.offsetWidth - bubbleSize;
        
        const animate = () => {
            if (!this.gameRunning) return;
            
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress >= 1) {
                // Bubble reached bottom
                this.removeBubble(bubble);
                // Increase missed counter only if bubble was correct AND not popped
                if (bubble.dataset.isCorrect === 'true' && bubble.dataset.wasPopped === 'false') {
                    this.missed++;
                    this.updateDisplay();
                }
                return;
            }
            
            // Strict vertical fall with slight wobble
            const y = progress * (this.gameArea.offsetHeight + 80);
            const wobble = Math.sin(progress * 10) * 15; // Reduced wobble amplitude
            const currentX = initialX + wobble;
            
            // Constrain movement within boundaries
            const clampedX = Math.max(0, Math.min(currentX, maxX));
            
            bubble.style.top = (y - 80) + 'px';
            bubble.style.left = clampedX + 'px';
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    popBubble(bubble) {
        if (!this.gameRunning) return;
        
        // Check if bubble was already popped
        if (bubble.dataset.wasPopped === 'true') return;
        
        const isCorrect = bubble.dataset.isCorrect === 'true';
        
        // Mark bubble as popped
        bubble.dataset.wasPopped = 'true';
        
        if (isCorrect) {
            this.score += 10;
            this.correctBubbles++;
            bubble.classList.add('correct');
        } else {
            this.score -= 5;
            this.incorrectBubbles++; // Increase incorrectly popped counter
            bubble.classList.add('incorrect');
        }
        
        bubble.classList.add('popped');
        this.updateDisplay();
        
        // Remove bubble after 0.5 seconds
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
        
        // Remove all bubbles
        this.bubbles.forEach(bubble => this.removeBubble(bubble));
        this.bubbles = [];
        
        // Check if player passed the level
        // Level is passed if didn't miss any correct bubbles AND didn't pop any incorrect ones
        if (this.missed === 0 && this.incorrectBubbles === 0) {
            // Level passed
            this.level++;
            this.showLevelComplete();
        } else {
            // Level not passed
            this.showGameOver(false);
        }
    }
    
    showLevelComplete() {
        // Show level complete screen
        this.levelCompleteScreen.style.display = 'flex';
        
        // Determine the number of the just completed level
        const prevLevel = this.level - 1;
        const prevTarget = this.getTargetNumber(prevLevel);
        
        // Update screen information
        document.getElementById('levelCompleteMessage').textContent = 
            `Excellent! You correctly popped all bubbles with answer ${prevTarget}!`;
        document.getElementById('levelScore').textContent = this.score;
        document.getElementById('levelCorrectBubbles').textContent = this.correctBubbles;
        document.getElementById('nextLevelNumber').textContent = this.level;
        document.getElementById('nextLevelTarget').textContent = this.getTargetNumber(this.level);
    }
    
    showGameOver(won) {
        this.gameOverScreen.style.display = 'flex';
        document.getElementById('gameOverTitle').textContent = won ? 'Victory! 🎉' : 'Game Over!';
        
        let message = '';
        if (won) {
            message = 'You completed all levels! Well done!';
        } else {
            if (this.missed > 0 && this.incorrectBubbles > 0) {
                message = `You missed ${this.missed} correct bubbles and popped ${this.incorrectBubbles} incorrect ones. Try again!`;
            } else if (this.missed > 0) {
                message = `You missed ${this.missed} correct bubbles. Try again!`;
            } else {
                message = `You popped ${this.incorrectBubbles} incorrect bubbles. Try again!`;
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
        
        // Show instructions and start button
        document.querySelector('.instructions').style.display = 'block';
        this.startButton.style.display = 'inline-block';
    }
    
    getTargetNumber(level = null) {
        const targetLevel = level || this.level;
        return this.targetNumbers[(targetLevel - 1) % this.targetNumbers.length];
    }
    
    continueToNextLevel() {
        // Hide level complete screen
        this.levelCompleteScreen.style.display = 'none';
        
        // Go to next level
        this.level++;
        
        // Reset counters for new level
        this.timeLeft = 30;
        this.missed = 0;
        this.incorrectBubbles = 0;
        
        // Update display
        this.updateDisplay();
        
        // Start new level
        this.startGame();
    }
    
    stopGame() {
        // Hide level complete screen
        this.levelCompleteScreen.style.display = 'none';
        
        // Show final screen with results
        this.showGameOver(true);
    }
    
    playAgain() {
        // Hide level complete screen
        this.levelCompleteScreen.style.display = 'none';
        
        // Restart game from first level
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
        // Remove all bubbles if any
        this.bubbles.forEach(bubble => this.removeBubble(bubble));
        this.bubbles = [];
    }

    updateLevelNav() {
        this.levelNav.querySelectorAll('.level-nav-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.level) === this.level);
        });
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new BubbleGame();
}); 