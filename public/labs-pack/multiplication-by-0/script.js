// Global variables
let currentProblem = null;
let practiceStats = { correct: 0, total: 0 };
let quizData = [];
let currentQuizQuestion = 0;
let quizAnswers = [];

// DOM elements
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');

// Navigation functionality
navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetSection = button.getAttribute('data-section');
        
        // Update navigation buttons
        navButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Update sections
        sections.forEach(section => section.classList.remove('active'));
        document.getElementById(targetSection).classList.add('active');
    });
});

// Practice Section Logic
class PracticeManager {
    constructor() {
        this.generateBtn = document.getElementById('generateProblem');
        this.checkBtn = document.getElementById('checkAnswer');
        this.showSolutionBtn = document.getElementById('showSolution');
        this.problemDisplay = document.getElementById('currentProblem');
        this.userAnswerInput = document.getElementById('userAnswer');
        this.answerFeedback = document.getElementById('answerFeedback');
        this.solutionDiv = document.getElementById('solution');
        this.solutionText = document.getElementById('solutionText');
        this.correctCount = document.getElementById('correctCount');
        this.totalCount = document.getElementById('totalCount');
        this.progressFill = document.getElementById('progressFill');
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.generateBtn.addEventListener('click', () => this.generateNewProblem());
        this.checkBtn.addEventListener('click', () => this.checkAnswer());
        this.showSolutionBtn.addEventListener('click', () => this.showSolution());
        this.userAnswerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkAnswer();
        });
    }

    generateNewProblem() {
        const problemTypes = [
            'small_integer',
            'large_integer', 
            'fraction',
            'decimal',
            'zero_by_zero',
            'negative_number'
        ];
        
        const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
        currentProblem = this.createProblem(type);
        
        this.problemDisplay.textContent = currentProblem.question;
        this.userAnswerInput.value = '';
        this.answerFeedback.textContent = '';
        this.answerFeedback.className = 'feedback';
        this.solutionDiv.classList.add('hidden');
        
        this.userAnswerInput.focus();
    }

    createProblem(type) {
        let firstNumber, secondNumber, question, answer, explanation;
        
        switch(type) {
            case 'small_integer':
                firstNumber = Math.floor(Math.random() * 20) + 1;
                secondNumber = 0;
                question = `${firstNumber} × 0 = ?`;
                answer = 0;
                explanation = `When you multiply any number by zero, the result is always zero. So ${firstNumber} × 0 = 0.`;
                break;
                
            case 'large_integer':
                firstNumber = Math.floor(Math.random() * 1000000) + 1000;
                secondNumber = 0;
                question = `${firstNumber.toLocaleString()} × 0 = ?`;
                answer = 0;
                explanation = `Even large numbers become zero when multiplied by zero. ${firstNumber.toLocaleString()} × 0 = 0.`;
                break;
                
            case 'fraction':
                const numerators = [1, 2, 3, 4, 5, 7, 8, 9];
                const denominators = [2, 3, 4, 5, 6, 7, 8, 9];
                const num = numerators[Math.floor(Math.random() * numerators.length)];
                const den = denominators[Math.floor(Math.random() * denominators.length)];
                firstNumber = num / den;
                secondNumber = 0;
                question = `${num}/${den} × 0 = ?`;
                answer = 0;
                explanation = `Fractions also become zero when multiplied by zero. ${num}/${den} × 0 = 0.`;
                break;
                
            case 'decimal':
                firstNumber = (Math.random() * 10).toFixed(2);
                secondNumber = 0;
                question = `${firstNumber} × 0 = ?`;
                answer = 0;
                explanation = `Decimal numbers also become zero when multiplied by zero. ${firstNumber} × 0 = 0.`;
                break;
                
            case 'zero_by_zero':
                firstNumber = 0;
                secondNumber = Math.floor(Math.random() * 100) + 1;
                question = `0 × ${secondNumber} = ?`;
                answer = 0;
                explanation = `Zero multiplied by any number equals zero. 0 × ${secondNumber} = 0.`;
                break;
                
            case 'negative_number':
                firstNumber = -(Math.floor(Math.random() * 20) + 1);
                secondNumber = 0;
                question = `${firstNumber} × 0 = ?`;
                answer = 0;
                explanation = `Even negative numbers become zero when multiplied by zero. ${firstNumber} × 0 = 0.`;
                break;
        }
        
        return { question, answer, explanation, type };
    }

    checkAnswer() {
        if (!currentProblem) {
            this.answerFeedback.textContent = 'Please generate a problem first!';
            this.answerFeedback.className = 'feedback incorrect';
            return;
        }

        const userAnswer = parseFloat(this.userAnswerInput.value);
        
        if (isNaN(userAnswer)) {
            this.answerFeedback.textContent = 'Please enter a valid number!';
            this.answerFeedback.className = 'feedback incorrect';
            return;
        }

        const isCorrect = Math.abs(userAnswer - currentProblem.answer) < 0.001;
        
        if (isCorrect) {
            this.answerFeedback.textContent = '✅ Correct! Well done!';
            this.answerFeedback.className = 'feedback correct';
            practiceStats.correct++;
        } else {
            this.answerFeedback.textContent = `❌ Incorrect. The answer is ${currentProblem.answer}.`;
            this.answerFeedback.className = 'feedback incorrect';
        }
        
        practiceStats.total++;
        this.updateProgress();
    }

    showSolution() {
        if (!currentProblem) {
            this.answerFeedback.textContent = 'Please generate a problem first!';
            this.answerFeedback.className = 'feedback incorrect';
            return;
        }

        this.solutionText.innerHTML = `
            <p><strong>Problem:</strong> ${currentProblem.question}</p>
            <p><strong>Answer:</strong> ${currentProblem.answer}</p>
            <p><strong>Explanation:</strong> ${currentProblem.explanation}</p>
        `;
        this.solutionDiv.classList.remove('hidden');
    }

    updateProgress() {
        this.correctCount.textContent = practiceStats.correct;
        this.totalCount.textContent = practiceStats.total;
        
        const percentage = practiceStats.total > 0 ? (practiceStats.correct / practiceStats.total) * 100 : 0;
        this.progressFill.style.width = `${percentage}%`;
    }
}

// Quiz Section Logic
class QuizManager {
    constructor() {
        this.startBtn = document.getElementById('startQuiz');
        this.submitBtn = document.getElementById('submitQuiz');
        this.retakeBtn = document.getElementById('retakeQuiz');
        this.quizContainer = document.getElementById('quizContainer');
        this.questionContainer = document.getElementById('questionContainer');
        this.currentQuestionSpan = document.getElementById('currentQuestion');
        this.totalQuestionsSpan = document.getElementById('totalQuestions');
        this.prevBtn = document.getElementById('prevQuestion');
        this.nextBtn = document.getElementById('nextQuestion');
        this.quizResults = document.getElementById('quizResults');
        this.finalScore = document.getElementById('finalScore');
        this.maxScore = document.getElementById('maxScore');
        this.scoreMessage = document.getElementById('scoreMessage');
        this.resultsBreakdown = document.getElementById('resultsBreakdown');
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startQuiz());
        this.submitBtn.addEventListener('click', () => this.submitQuiz());
        this.retakeBtn.addEventListener('click', () => this.retakeQuiz());
        this.prevBtn.addEventListener('click', () => this.previousQuestion());
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
    }

    startQuiz() {
        this.generateQuizQuestions();
        currentQuizQuestion = 0;
        quizAnswers = new Array(quizData.length).fill(null);
        
        this.startBtn.classList.add('hidden');
        this.quizContainer.classList.remove('hidden');
        this.quizResults.classList.add('hidden');
        this.submitBtn.classList.remove('hidden');
        
        this.showQuestion(0);
    }

    generateQuizQuestions() {
        quizData = [
            {
                question: "What is 5 × 0?",
                options: ["0", "5", "1", "10"],
                correct: 0,
                explanation: "Any number multiplied by zero equals zero."
            },
            {
                question: "What is 1,000 × 0?",
                options: ["1,000", "0", "10,000", "100"],
                correct: 1,
                explanation: "Even large numbers become zero when multiplied by zero."
            },
            {
                question: "What is ½ × 0?",
                options: ["½", "0", "1", "2"],
                correct: 1,
                explanation: "Fractions also become zero when multiplied by zero."
            },
            {
                question: "What is 0 × 7?",
                options: ["7", "0", "1", "70"],
                correct: 1,
                explanation: "Zero multiplied by any number equals zero."
            },
            {
                question: "What is 0.5 × 0?",
                options: ["0.5", "0", "1", "0.05"],
                correct: 1,
                explanation: "Decimal numbers also become zero when multiplied by zero."
            },
            {
                question: "What is -3 × 0?",
                options: ["-3", "0", "3", "-1"],
                correct: 1,
                explanation: "Even negative numbers become zero when multiplied by zero."
            },
            {
                question: "What is 0 × 0?",
                options: ["1", "0", "2", "undefined"],
                correct: 1,
                explanation: "Zero multiplied by zero equals zero."
            },
            {
                question: "What is 999,999 × 0?",
                options: ["999,999", "0", "1", "999,998"],
                correct: 1,
                explanation: "No matter how large the number, multiplying by zero gives zero."
            },
            {
                question: "What is ¾ × 0?",
                options: ["¾", "0", "1", "0.75"],
                correct: 1,
                explanation: "Fractions become zero when multiplied by zero."
            },
            {
                question: "What is 0 × 0.25?",
                options: ["0.25", "0", "1", "0.025"],
                correct: 1,
                explanation: "Zero multiplied by any decimal equals zero."
            }
        ];
        
        this.totalQuestionsSpan.textContent = quizData.length;
    }

    showQuestion(index) {
        const question = quizData[index];
        this.currentQuestionSpan.textContent = index + 1;
        
        this.questionContainer.innerHTML = `
            <div class="question">${question.question}</div>
            <div class="options">
                ${question.options.map((option, i) => `
                    <div class="option ${quizAnswers[index] === i ? 'selected' : ''}" 
                         data-index="${i}">
                        ${option}
                    </div>
                `).join('')}
            </div>
        `;
        
        // Add event listeners to options
        this.questionContainer.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', () => this.selectOption(parseInt(option.dataset.index)));
        });
        
        // Update navigation buttons
        this.prevBtn.disabled = index === 0;
        this.nextBtn.disabled = index === quizData.length - 1;
    }

    selectOption(optionIndex) {
        quizAnswers[currentQuizQuestion] = optionIndex;
        
        // Update visual selection
        this.questionContainer.querySelectorAll('.option').forEach((option, i) => {
            option.classList.toggle('selected', i === optionIndex);
        });
    }

    previousQuestion() {
        if (currentQuizQuestion > 0) {
            currentQuizQuestion--;
            this.showQuestion(currentQuizQuestion);
        }
    }

    nextQuestion() {
        if (currentQuizQuestion < quizData.length - 1) {
            currentQuizQuestion++;
            this.showQuestion(currentQuizQuestion);
        }
    }

    submitQuiz() {
        const score = quizAnswers.reduce((total, answer, index) => {
            return total + (answer === quizData[index].correct ? 1 : 0);
        }, 0);
        
        this.finalScore.textContent = score;
        this.maxScore.textContent = quizData.length;
        
        // Generate score message
        const percentage = (score / quizData.length) * 100;
        if (percentage === 100) {
            this.scoreMessage.textContent = "🎉 Perfect! You've mastered multiplication by zero!";
        } else if (percentage >= 80) {
            this.scoreMessage.textContent = "🌟 Excellent! You understand the concept very well!";
        } else if (percentage >= 60) {
            this.scoreMessage.textContent = "👍 Good job! You have a solid understanding!";
        } else if (percentage >= 40) {
            this.scoreMessage.textContent = "📚 Keep practicing! Review the theory section.";
        } else {
            this.scoreMessage.textContent = "📖 Please review the theory and practice sections!";
        }
        
        // Generate results breakdown
        this.resultsBreakdown.innerHTML = quizData.map((question, index) => {
            const userAnswer = quizAnswers[index];
            const isCorrect = userAnswer === question.correct;
            const status = isCorrect ? 'correct' : 'incorrect';
            const userAnswerText = userAnswer !== null ? question.options[userAnswer] : 'Not answered';
            
            return `
                <div class="result-item ${status}">
                    <div class="result-question">
                        <strong>Q${index + 1}:</strong> ${question.question}
                        <br><small>Your answer: ${userAnswerText}</small>
                    </div>
                    <div class="result-status ${status}">
                        ${isCorrect ? '✅' : '❌'}
                    </div>
                </div>
            `;
        }).join('');
        
        this.quizContainer.classList.add('hidden');
        this.submitBtn.classList.add('hidden');
        this.quizResults.classList.remove('hidden');
        this.retakeBtn.classList.remove('hidden');
    }

    retakeQuiz() {
        this.retakeBtn.classList.add('hidden');
        this.quizResults.classList.add('hidden');
        this.startQuiz();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const practiceManager = new PracticeManager();
    const quizManager = new QuizManager();
    
    // Add some interactive animations
    document.querySelectorAll('.example-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add confetti effect for correct answers
    window.showConfetti = () => {
        // Simple confetti effect
        const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'];
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.top = '-10px';
                confetti.style.width = '10px';
                confetti.style.height = '10px';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.borderRadius = '50%';
                confetti.style.pointerEvents = 'none';
                confetti.style.zIndex = '9999';
                confetti.style.animation = 'fall 3s linear forwards';
                
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    document.body.removeChild(confetti);
                }, 3000);
            }, i * 50);
        }
    };
    
    // Add CSS animation for confetti
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fall {
            to {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});

// Enhanced feedback for practice section
function enhancePracticeFeedback() {
    const checkAnswer = document.getElementById('checkAnswer');
    const originalCheckAnswer = checkAnswer.onclick;
    
    checkAnswer.addEventListener('click', function() {
        if (originalCheckAnswer) originalCheckAnswer();
        
        // Add confetti for correct answers
        const feedback = document.getElementById('answerFeedback');
        if (feedback.classList.contains('correct')) {
            setTimeout(() => {
                if (typeof window.showConfetti === 'function') {
                    window.showConfetti();
                }
            }, 500);
        }
    });
}

// Call the enhancement function
document.addEventListener('DOMContentLoaded', enhancePracticeFeedback); 