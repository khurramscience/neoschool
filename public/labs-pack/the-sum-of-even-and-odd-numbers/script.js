// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSection = button.getAttribute('data-section');
            
            // Update navigation buttons
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show target section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
        });
    });

    // Initialize game and quiz
    initializeGame();
    initializeQuiz();
});

// Game functionality
let gameScore = 0;
let gameLevel = 1;
let currentNumbers = [];
let gameActive = false;

function initializeGame() {
    const newGameBtn = document.getElementById('newGameBtn');
    const predictionBtns = document.querySelectorAll('.prediction-btn');
    
    newGameBtn.addEventListener('click', startNewGame);
    
    predictionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (gameActive) {
                makePrediction(btn.getAttribute('data-prediction'));
            }
        });
    });
}

function startNewGame() {
    gameScore = 0;
    gameLevel = 1;
    gameActive = true;
    
    updateGameStats();
    generateNewNumbers();
    
    // Reset UI
    document.getElementById('feedback').innerHTML = '';
    document.getElementById('feedback').className = 'feedback';
    document.getElementById('result').textContent = '?';
    document.getElementById('result').className = 'result-box';
    
    // Enable prediction buttons
    document.querySelectorAll('.prediction-btn').forEach(btn => {
        btn.disabled = false;
    });
}

function generateNewNumbers() {
    const maxNumber = Math.min(20 + gameLevel * 5, 50); // Increase difficulty with level
    const num1 = Math.floor(Math.random() * maxNumber) + 1;
    const num2 = Math.floor(Math.random() * maxNumber) + 1;
    
    currentNumbers = [num1, num2];
    
    const num1Element = document.getElementById('num1');
    const num2Element = document.getElementById('num2');
    
    num1Element.textContent = num1;
    num2Element.className = `number-box ${isEven(num1) ? 'even' : 'odd'}`;
    
    num2Element.textContent = num2;
    num2Element.className = `number-box ${isEven(num2) ? 'even' : 'odd'}`;
}

function makePrediction(prediction) {
    const sum = currentNumbers[0] + currentNumbers[1];
    const actualResult = isEven(sum) ? 'even' : 'odd';
    const isCorrect = prediction === actualResult;
    
    // Show result
    document.getElementById('result').textContent = sum;
    document.getElementById('result').className = `result-box ${actualResult}`;
    
    // Show feedback
    const feedback = document.getElementById('feedback');
    if (isCorrect) {
        feedback.innerHTML = `🎉 Correct! ${currentNumbers[0]} + ${currentNumbers[1]} = ${sum} (${actualResult})`;
        feedback.className = 'feedback correct';
        gameScore += 10;
        
        // Level up every 5 correct answers
        if (gameScore % 50 === 0) {
            gameLevel++;
        }
    } else {
        feedback.innerHTML = `❌ Incorrect! ${currentNumbers[0]} + ${currentNumbers[1]} = ${sum} (${actualResult})`;
        feedback.className = 'feedback incorrect';
    }
    
    updateGameStats();
    
    // Disable prediction buttons
    document.querySelectorAll('.prediction-btn').forEach(btn => {
        btn.disabled = true;
    });
    
    // Generate new numbers after a delay
    setTimeout(() => {
        if (gameActive) {
            generateNewNumbers();
            document.getElementById('feedback').innerHTML = '';
            document.getElementById('feedback').className = 'feedback';
            document.getElementById('result').textContent = '?';
            document.getElementById('result').className = 'result-box';
            
            // Re-enable prediction buttons
            document.querySelectorAll('.prediction-btn').forEach(btn => {
                btn.disabled = false;
            });
        }
    }, 2000);
}

function updateGameStats() {
    document.getElementById('score').textContent = gameScore;
    document.getElementById('level').textContent = gameLevel;
}

function isEven(num) {
    return num % 2 === 0;
}

// Quiz functionality
let currentQuestionIndex = 0;
let quizScore = 0;
let questions = [];

const quizQuestions = [
    {
        question: "Which of the following numbers is even?",
        options: ["7", "13", "16", "21"],
        correct: 2,
        explanation: "16 is even because it can be divided by 2 without remainder."
    },
    {
        question: "What is the result of adding two odd numbers?",
        options: ["Always odd", "Always even", "Sometimes odd, sometimes even", "Never even"],
        correct: 1,
        explanation: "When you add two odd numbers, the result is always even."
    },
    {
        question: "Which number is odd?",
        options: ["24", "36", "42", "37"],
        correct: 3,
        explanation: "37 is odd because it ends with 7 and cannot be divided by 2 without remainder."
    },
    {
        question: "What happens when you add an even number and an odd number?",
        options: ["The result is always even", "The result is always odd", "The result can be either even or odd", "The result is never odd"],
        correct: 1,
        explanation: "When you add an even number and an odd number, the result is always odd."
    },
    {
        question: "Which of these numbers ends with an even digit?",
        options: ["123", "456", "789", "321"],
        correct: 1,
        explanation: "456 ends with 6, which is an even digit."
    },
    {
        question: "What is 8 + 5?",
        options: ["12", "13", "14", "15"],
        correct: 1,
        explanation: "8 + 5 = 13, which is an odd number."
    },
    {
        question: "Which rule is correct for even numbers?",
        options: ["Even + Even = Odd", "Even + Even = Even", "Even + Even = Sometimes even", "Even + Even = Never even"],
        correct: 1,
        explanation: "When you add two even numbers, the result is always even."
    },
    {
        question: "What is the smallest even number greater than 10?",
        options: ["10", "11", "12", "13"],
        correct: 2,
        explanation: "12 is the smallest even number greater than 10."
    },
    {
        question: "Which of these is NOT an odd number?",
        options: ["15", "23", "28", "31"],
        correct: 2,
        explanation: "28 is even because it can be divided by 2 without remainder."
    },
    {
        question: "What is the result of 7 + 9?",
        options: ["14", "15", "16", "17"],
        correct: 2,
        explanation: "7 + 9 = 16, which is even (odd + odd = even)."
    }
];

function initializeQuiz() {
    const retryBtn = document.getElementById('retryBtn');
    retryBtn.addEventListener('click', startQuiz);
    
    // Start quiz automatically when quiz section is shown
    const quizNavBtn = document.querySelector('[data-section="quiz"]');
    quizNavBtn.addEventListener('click', () => {
        setTimeout(startQuiz, 500); // Small delay for section transition
    });
}

function startQuiz() {
    currentQuestionIndex = 0;
    quizScore = 0;
    questions = [...quizQuestions]; // Create a copy to shuffle
    
    // Shuffle questions
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }
    
    showQuestion();
    updateQuizProgress();
    
    // Show quiz area, hide results
    document.getElementById('question').style.display = 'block';
    document.getElementById('quizResults').style.display = 'none';
}

function showQuestion() {
    if (currentQuestionIndex >= questions.length) {
        showQuizResults();
        return;
    }
    
    const question = questions[currentQuestionIndex];
    document.getElementById('questionText').textContent = question.question;
    
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.addEventListener('click', () => selectAnswer(index));
        optionsContainer.appendChild(button);
    });
    
    // Clear previous feedback
    document.getElementById('quizFeedback').innerHTML = '';
    document.getElementById('quizFeedback').className = 'quiz-feedback';
}

function selectAnswer(selectedIndex) {
    const question = questions[currentQuestionIndex];
    const isCorrect = selectedIndex === question.correct;
    
    // Disable all buttons
    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach(btn => btn.disabled = true);
    
    // Show correct/incorrect styling
    optionButtons.forEach((btn, index) => {
        if (index === question.correct) {
            btn.classList.add('correct');
        } else if (index === selectedIndex && !isCorrect) {
            btn.classList.add('incorrect');
        }
    });
    
    // Show feedback
    const feedback = document.getElementById('quizFeedback');
    if (isCorrect) {
        feedback.innerHTML = `✅ Correct! ${question.explanation}`;
        feedback.className = 'quiz-feedback correct';
        quizScore++;
    } else {
        feedback.innerHTML = `❌ Incorrect. ${question.explanation}`;
        feedback.className = 'quiz-feedback incorrect';
    }
    
    // Move to next question after delay
    setTimeout(() => {
        currentQuestionIndex++;
        showQuestion();
        updateQuizProgress();
    }, 2000);
}

function updateQuizProgress() {
    const progress = (currentQuestionIndex / questions.length) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
    document.getElementById('questionCounter').textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
}

function showQuizResults() {
    const percentage = Math.round((quizScore / questions.length) * 100);
    
    document.getElementById('finalScore').textContent = quizScore;
    document.getElementById('totalQuestions').textContent = questions.length;
    document.getElementById('percentage').textContent = percentage;
    
    const gradeElement = document.getElementById('grade');
    if (percentage >= 90) {
        gradeElement.textContent = '🌟 Excellent!';
        gradeElement.className = 'grade excellent';
    } else if (percentage >= 70) {
        gradeElement.textContent = '👍 Good Job!';
        gradeElement.className = 'grade good';
    } else {
        gradeElement.textContent = '📚 Keep Learning!';
        gradeElement.className = 'grade average';
    }
    
    // Hide quiz area, show results
    document.getElementById('question').style.display = 'none';
    document.getElementById('quizResults').style.display = 'block';
}

// Add some interactive animations
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to theory cards
    const theoryCards = document.querySelectorAll('.theory-card');
    theoryCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add click sound effect (optional)
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Add a subtle animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}); 