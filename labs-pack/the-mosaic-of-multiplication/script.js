class MultiplicationMosaic {
    constructor() {
        this.currentDifficulty = 'easy';
        this.score = 0;
        this.completedPuzzles = 0;
        this.totalPuzzles = 0;
        this.startTime = null;
        this.gameTimer = null;
        this.puzzles = [];
        this.mosaicPieces = [];
        this.selectedPiece = null;
        
        this.initializeGame();
        this.setupEventListeners();
    }

    initializeGame() {
        this.updateTimer();
        this.startTimer();
        this.generatePuzzles();
        this.generateMosaicPieces();
        this.renderGame();
    }

    setupEventListeners() {
        // Difficulty buttons
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setDifficulty(e.target.dataset.difficulty);
            });
        });

        // New game button
        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.newGame();
        });

        // Click-based interaction for better reliability
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('mosaic-piece') && !e.target.classList.contains('used')) {
                this.selectPiece(e.target);
            }
        });

        // Drag and drop for mosaic pieces (fallback)
        document.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('mosaic-piece') && !e.target.classList.contains('used')) {
                this.startDrag(e);
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.selectedPiece) {
                this.drag(e);
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.selectedPiece) {
                this.endDrag();
            }
        });

        // Touch events for mobile
        document.addEventListener('touchstart', (e) => {
            if (e.target.classList.contains('mosaic-piece') && !e.target.classList.contains('used')) {
                this.startDrag(e);
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (this.selectedPiece) {
                e.preventDefault();
                this.drag(e);
            }
        });

        document.addEventListener('touchend', () => {
            if (this.selectedPiece) {
                this.endDrag();
            }
        });
    }

    setDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        
        // Update active button
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('active');
        
        this.newGame();
    }

    generatePuzzles() {
        this.puzzles = [];
        let puzzleCount;
        
        switch (this.currentDifficulty) {
            case 'easy':
                puzzleCount = 2;
                break;
            case 'medium':
                puzzleCount = 3;
                break;
            case 'hard':
                puzzleCount = Math.random() < 0.5 ? 4 : 5;
                break;
        }

        this.totalPuzzles = puzzleCount;

        for (let i = 0; i < puzzleCount; i++) {
            const puzzle = this.createPuzzle();
            this.puzzles.push(puzzle);
        }
    }

    createPuzzle() {
        // Generate random multiplication problem
        const num1 = Math.floor(Math.random() * 12) + 1;
        const num2 = Math.floor(Math.random() * 12) + 1;
        const result = num1 * num2;

        // Randomly choose which number to hide (1 = first number, 2 = second number, 3 = result)
        const hiddenPosition = Math.floor(Math.random() * 3) + 1;
        
        let puzzleText = '';
        let answer = 0;

        switch (hiddenPosition) {
            case 1:
                puzzleText = `___ × ${num2} = ${result}`;
                answer = num1;
                break;
            case 2:
                puzzleText = `${num1} × ___ = ${result}`;
                answer = num2;
                break;
            case 3:
                puzzleText = `${num1} × ${num2} = ___`;
                answer = result;
                break;
        }

        return {
            text: puzzleText,
            answer: answer,
            completed: false,
            id: `puzzle-${Date.now()}-${Math.random()}`
        };
    }

    generateMosaicPieces() {
        this.mosaicPieces = [];
        const answers = this.puzzles.map(p => p.answer);
        
        // Add correct answers
        answers.forEach(answer => {
            this.mosaicPieces.push({
                value: answer,
                isCorrect: true,
                used: false
            });
        });

        // Add wrong answers (distractors)
        const wrongAnswersCount = Math.max(answers.length * 2, 6);
        for (let i = 0; i < wrongAnswersCount; i++) {
            let wrongAnswer;
            do {
                wrongAnswer = Math.floor(Math.random() * 144) + 1;
            } while (answers.includes(wrongAnswer));
            
            this.mosaicPieces.push({
                value: wrongAnswer,
                isCorrect: false,
                used: false
            });
        }

        // Shuffle pieces
        this.mosaicPieces = this.shuffleArray(this.mosaicPieces);
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    selectPiece(pieceElement) {
        const pieceIndex = parseInt(pieceElement.dataset.pieceIndex);
        const piece = this.mosaicPieces[pieceIndex];
        
        // Highlight the selected piece
        document.querySelectorAll('.mosaic-piece').forEach(p => p.classList.remove('selected'));
        pieceElement.classList.add('selected');
        
        // Show available puzzles
        document.querySelectorAll('.puzzle').forEach(puzzle => {
            if (!puzzle.classList.contains('completed')) {
                puzzle.classList.add('available');
            }
        });
        
        // Store selected piece for puzzle completion
        this.selectedPieceForPuzzle = { piece, pieceIndex };
        
        // Add click handler for puzzles
        this.addPuzzleClickHandlers();
    }

    addPuzzleClickHandlers() {
        document.querySelectorAll('.puzzle').forEach(puzzle => {
            if (!puzzle.classList.contains('completed')) {
                puzzle.addEventListener('click', this.handlePuzzleClick.bind(this));
            }
        });
    }

    handlePuzzleClick(e) {
        if (!this.selectedPieceForPuzzle) return;
        
        const puzzleElement = e.currentTarget;
        const puzzleId = puzzleElement.dataset.puzzleId;
        const puzzle = this.puzzles.find(p => p.id === puzzleId);
        
        if (puzzle && this.selectedPieceForPuzzle.piece.value === puzzle.answer) {
            this.completePuzzle(puzzle, this.selectedPieceForPuzzle.piece, this.selectedPieceForPuzzle.pieceIndex);
        } else {
            this.showMessage('Try again! That\'s not the right answer.', 'error');
        }
        
        // Clear selection
        this.clearSelection();
    }

    clearSelection() {
        document.querySelectorAll('.mosaic-piece').forEach(p => p.classList.remove('selected'));
        document.querySelectorAll('.puzzle').forEach(p => p.classList.remove('available'));
        this.selectedPieceForPuzzle = null;
    }

    renderGame() {
        this.renderPuzzles();
        this.renderMosaicPieces();
        this.updateGameInfo();
    }

    renderPuzzles() {
        const container = document.getElementById('puzzleContainer');
        container.innerHTML = '';

        this.puzzles.forEach((puzzle, index) => {
            const puzzleElement = document.createElement('div');
            puzzleElement.className = `puzzle ${puzzle.completed ? 'completed' : ''}`;
            puzzleElement.dataset.puzzleId = puzzle.id;
            
            if (puzzle.completed) {
                puzzleElement.innerHTML = `
                    <span style="text-decoration: line-through; opacity: 0.7;">${puzzle.text}</span>
                    <br>
                    <span style="color: #28a745; font-weight: 700;">✓ Completed!</span>
                `;
            } else {
                puzzleElement.innerHTML = puzzle.text;
            }
            
            container.appendChild(puzzleElement);
        });
    }

    renderMosaicPieces() {
        const container = document.getElementById('mosaicPieces');
        container.innerHTML = '<h3>Mosaic Pieces:</h3>';

        this.mosaicPieces.forEach((piece, index) => {
            if (!piece.used) {
                const pieceElement = document.createElement('div');
                pieceElement.className = 'mosaic-piece';
                pieceElement.textContent = piece.value;
                pieceElement.dataset.pieceIndex = index;
                
                // Add different colors for variety
                const colors = [
                    'linear-gradient(45deg, #ff6b6b, #ee5a24)',
                    'linear-gradient(45deg, #4ecdc4, #44a08d)',
                    'linear-gradient(45deg, #45b7d1, #96c93d)',
                    'linear-gradient(45deg, #f9ca24, #f0932b)',
                    'linear-gradient(45deg, #6c5ce7, #a29bfe)',
                    'linear-gradient(45deg, #fd79a8, #fdcb6e)'
                ];
                pieceElement.style.background = colors[index % colors.length];
                
                container.appendChild(pieceElement);
            }
        });
    }

    startDrag(e) {
        e.preventDefault();
        this.selectedPiece = e.target;
        this.selectedPiece.style.opacity = '0.7';
        this.selectedPiece.style.transform = 'scale(1.1)';
        this.selectedPiece.style.zIndex = '1000';
        
        // Store initial position
        const rect = this.selectedPiece.getBoundingClientRect();
        this.dragOffset = {
            x: (e.clientX || e.touches[0].clientX) - rect.left,
            y: (e.clientY || e.touches[0].clientY) - rect.top
        };
    }

    drag(e) {
        if (!this.selectedPiece) return;
        
        e.preventDefault();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        
        if (clientX && clientY) {
            const x = clientX - this.dragOffset.x;
            const y = clientY - this.dragOffset.y;
            
            this.selectedPiece.style.position = 'fixed';
            this.selectedPiece.style.left = x + 'px';
            this.selectedPiece.style.top = y + 'px';
        }
    }

    endDrag() {
        if (!this.selectedPiece) return;

        const pieceIndex = parseInt(this.selectedPiece.dataset.pieceIndex);
        const piece = this.mosaicPieces[pieceIndex];
        
        // Get the element under the cursor
        const clientX = event.clientX || (event.changedTouches && event.changedTouches[0].clientX);
        const clientY = event.clientY || (event.changedTouches && event.changedTouches[0].clientY);
        
        let puzzleElement = null;
        if (clientX && clientY) {
            puzzleElement = document.elementFromPoint(clientX, clientY);
        }
        
        // Find the closest puzzle element
        if (!puzzleElement || !puzzleElement.classList.contains('puzzle')) {
            const puzzles = document.querySelectorAll('.puzzle');
            let closestPuzzle = null;
            let closestDistance = Infinity;
            
            puzzles.forEach(puzzle => {
                const rect = puzzle.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const distance = Math.sqrt(
                    Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2)
                );
                
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestPuzzle = puzzle;
                }
            });
            
            puzzleElement = closestPuzzle;
        }

        if (puzzleElement && puzzleElement.classList.contains('puzzle') && !puzzleElement.classList.contains('completed')) {
            const puzzleId = puzzleElement.dataset.puzzleId;
            const puzzle = this.puzzles.find(p => p.id === puzzleId);
            
            if (puzzle && piece.value === puzzle.answer) {
                this.completePuzzle(puzzle, piece, pieceIndex);
            } else {
                this.showMessage('Try again! That\'s not the right answer.', 'error');
            }
        }

        // Reset piece position
        this.selectedPiece.style.position = '';
        this.selectedPiece.style.left = '';
        this.selectedPiece.style.top = '';
        this.selectedPiece.style.opacity = '';
        this.selectedPiece.style.transform = '';
        this.selectedPiece.style.zIndex = '';
        this.selectedPiece = null;
        this.dragOffset = null;
    }

    completePuzzle(puzzle, piece, pieceIndex) {
        puzzle.completed = true;
        piece.used = true;
        this.completedPuzzles++;
        this.score += 100;

        // Add bonus for speed
        const timeBonus = Math.max(0, 50 - Math.floor((Date.now() - this.startTime) / 1000));
        this.score += timeBonus;

        this.showMessage(`Correct! +100 points${timeBonus > 0 ? ` +${timeBonus} speed bonus` : ''}`, 'success');
        
        // Add bounce animation to the piece
        const pieceElement = document.querySelector(`[data-piece-index="${pieceIndex}"]`);
        if (pieceElement) {
            pieceElement.classList.add('bounce');
            setTimeout(() => {
                pieceElement.classList.remove('bounce');
            }, 600);
        }

        // Clear selection
        this.clearSelection();

        this.renderGame();

        if (this.completedPuzzles === this.totalPuzzles) {
            this.gameComplete();
        }
    }

    gameComplete() {
        const timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = timeElapsed % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        this.showMessage(
            `🎉 Congratulations! You completed all puzzles in ${timeString}! Final score: ${this.score}`,
            'complete'
        );
        
        this.stopTimer();
    }

    showMessage(text, type) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = text;
        messageElement.className = `message show ${type}`;
        
        setTimeout(() => {
            messageElement.classList.remove('show');
        }, 3000);
    }

    updateGameInfo() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('completed').textContent = this.completedPuzzles;
        document.getElementById('total').textContent = this.totalPuzzles;
    }

    startTimer() {
        this.startTime = Date.now();
        this.gameTimer = setInterval(() => {
            this.updateTimer();
        }, 1000);
    }

    stopTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }

    updateTimer() {
        if (!this.startTime) return;
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    newGame() {
        this.score = 0;
        this.completedPuzzles = 0;
        this.selectedPiece = null;
        
        this.stopTimer();
        this.initializeGame();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MultiplicationMosaic();
}); 