// Global variables
let currentProblem = null;
let practiceStats = {
    correct: 0,
    total: 0
};

let quizData = {
    currentQuestion: 0,
    answers: [],
    questions: []
};

// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSection = button.getAttribute('data-section');
            
            // Update navigation
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update sections
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(targetSection).classList.add('active');
        });
    });

    // Initialize practice section
    initializePractice();
    
    // Initialize quiz section
    initializeQuiz();
});

// Practice Section Functions
function initializePractice() {
    const newProblemBtn = document.getElementById('newProblem');
    const checkAnswerBtn = document.getElementById('checkAnswer');
    const userAnswerInput = document.getElementById('userAnswer');

    newProblemBtn.addEventListener('click', generateNewProblem);
    checkAnswerBtn.addEventListener('click', checkAnswer);
    
    userAnswerInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
}

function generateNewProblem() {
    const problemTypes = [
        { type: 'single', description: 'Multiply by 10' },
        { type: 'double', description: 'Multiply by 10 twice' },
        { type: 'triple', description: 'Multiply by 10 three times' }
    ];
    
    const randomType = problemTypes[Math.floor(Math.random() * problemTypes.length)];
    const baseNumber = Math.floor(Math.random() * 100) + 1;
    
    let answer, problemText;
    
    switch(randomType.type) {
        case 'single':
            answer = baseNumber * 10;
            problemText = `${baseNumber} × 10 = ?`;
            break;
        case 'double':
            answer = baseNumber * 100;
            problemText = `${baseNumber} × 10 × 10 = ?`;
            break;
        case 'triple':
            answer = baseNumber * 1000;
            problemText = `${baseNumber} × 10 × 10 × 10 = ?`;
            break;
    }
    
    currentProblem = {
        text: problemText,
        answer: answer,
        type: randomType.type,
        baseNumber: baseNumber
    };
    
    document.getElementById('problemText').textContent = problemText;
    document.getElementById('userAnswer').value = '';
    document.getElementById('result').textContent = '';
    document.getElementById('result').className = 'result-message';
}

function checkAnswer() {
    if (!currentProblem) {
        alert('Please generate a new problem first!');
        return;
    }
    
    const userAnswer = parseInt(document.getElementById('userAnswer').value);
    const resultDiv = document.getElementById('result');
    
    if (isNaN(userAnswer)) {
        resultDiv.textContent = 'Please enter a valid number!';
        resultDiv.className = 'result-message incorrect';
        return;
    }
    
    practiceStats.total++;
    
    if (userAnswer === currentProblem.answer) {
        practiceStats.correct++;
        resultDiv.textContent = `✅ Correct! ${currentProblem.text.replace('?', currentProblem.answer)}`;
        resultDiv.className = 'result-message correct';
    } else {
        resultDiv.textContent = `❌ Incorrect! The answer is ${currentProblem.answer}. ${currentProblem.text.replace('?', currentProblem.answer)}`;
        resultDiv.className = 'result-message incorrect';
    }
    
    updatePracticeStats();
}

function updatePracticeStats() {
    document.getElementById('correctCount').textContent = practiceStats.correct;
    document.getElementById('totalCount').textContent = practiceStats.total;
    
    const score = practiceStats.total > 0 ? Math.round((practiceStats.correct / practiceStats.total) * 100) : 0;
    document.getElementById('score').textContent = `${score}%`;
}

// Quiz Section Functions
function initializeQuiz() {
    const startQuizBtn = document.getElementById('startQuiz');
    const nextQuestionBtn = document.getElementById('nextQuestion');
    const finishQuizBtn = document.getElementById('finishQuiz');
    const retakeQuizBtn = document.getElementById('retakeQuiz');

    startQuizBtn.addEventListener('click', startQuiz);
    nextQuestionBtn.addEventListener('click', nextQuestion);
    finishQuizBtn.addEventListener('click', finishQuiz);
    retakeQuizBtn.addEventListener('click', retakeQuiz);
}

function generateQuizQuestions() {
    const questions = [];
    
    // Question 1: Basic multiplication by 10
    const num1 = Math.floor(Math.random() * 50) + 1;
    questions.push({
        question: `What is ${num1} × 10?`,
        options: [
            num1 * 10,
            num1 + 10,
            num1 * 100,
            num1 * 5
        ],
        correct: 0
    });
    
    // Question 2: Multiple multiplication by 10
    const num2 = Math.floor(Math.random() * 20) + 1;
    questions.push({
        question: `What is ${num2} × 10 × 10?`,
        options: [
            num2 * 100,
            num2 * 10,
            num2 * 1000,
            num2 * 20
        ],
        correct: 0
    });
    
    // Question 3: Pattern recognition
    const num3 = Math.floor(Math.random() * 10) + 1;
    questions.push({
        question: `If ${num3} × 10 = ${num3 * 10}, then ${num3} × 100 = ?`,
        options: [
            num3 * 100,
            num3 * 10,
            num3 * 1000,
            num3 * 50
        ],
        correct: 0
    });
    
    // Question 4: Reverse thinking
    const result1 = Math.floor(Math.random() * 50) * 10;
    const base1 = result1 / 10;
    questions.push({
        question: `What number multiplied by 10 equals ${result1}?`,
        options: [
            base1,
            base1 * 10,
            base1 * 100,
            result1
        ],
        correct: 0
    });
    
    // Question 5: Triple multiplication
    const num4 = Math.floor(Math.random() * 10) + 1;
    questions.push({
        question: `What is ${num4} × 10 × 10 × 10?`,
        options: [
            num4 * 1000,
            num4 * 100,
            num4 * 10,
            num4 * 10000
        ],
        correct: 0
    });
    
    // Question 6: Word problem
    const num5 = Math.floor(Math.random() * 20) + 1;
    questions.push({
        question: `If you have ${num5} boxes and each box contains 10 items, how many items do you have in total?`,
        options: [
            num5 * 10,
            num5 + 10,
            num5 * 100,
            num5 * 5
        ],
        correct: 0
    });
    
    // Question 7: Pattern continuation
    const num6 = Math.floor(Math.random() * 10) + 1;
    questions.push({
        question: `Complete the pattern: ${num6}, ${num6 * 10}, ${num6 * 100}, ?`,
        options: [
            num6 * 1000,
            num6 * 200,
            num6 * 50,
            num6 * 100
        ],
        correct: 0
    });
    
    // Question 8: Multiple choice with explanation
    const num7 = Math.floor(Math.random() * 30) + 1;
    questions.push({
        question: `When you multiply ${num7} by 10, you:`,
        options: [
            `Add one zero to ${num7}`,
            `Add two zeros to ${num7}`,
            `Subtract one zero from ${num7}`,
            `Divide ${num7} by 10`
        ],
        correct: 0
    });
    
    // Question 9: Comparison
    const num8 = Math.floor(Math.random() * 15) + 1;
    questions.push({
        question: `Which is greater: ${num8} × 10 or ${num8} × 100?`,
        options: [
            `${num8} × 100`,
            `${num8} × 10`,
            `They are equal`,
            `Cannot be determined`
        ],
        correct: 0
    });
    
    // Question 10: Final challenge
    const num9 = Math.floor(Math.random() * 10) + 1;
    questions.push({
        question: `What is the result of ${num9} × 10 × 10 × 10 × 10?`,
        options: [
            num9 * 10000,
            num9 * 1000,
            num9 * 100,
            num9 * 10
        ],
        correct: 0
    });
    
    return questions;
}

function startQuiz() {
    quizData.questions = generateQuizQuestions();
    quizData.currentQuestion = 0;
    quizData.answers = [];
    
    document.getElementById('quizIntro').style.display = 'none';
    document.getElementById('quizContainer').style.display = 'block';
    document.getElementById('quizResults').style.display = 'none';
    
    showQuestion();
}

function showQuestion() {
    const question = quizData.questions[quizData.currentQuestion];
    const questionCounter = document.getElementById('questionCounter');
    const questionText = document.getElementById('questionText');
    const optionsContainer = document.getElementById('optionsContainer');
    const progressFill = document.getElementById('progressFill');
    
    questionCounter.textContent = `Question ${quizData.currentQuestion + 1} of 10`;
    questionText.textContent = question.question;
    
    // Update progress bar
    const progress = ((quizData.currentQuestion + 1) / 10) * 100;
    progressFill.style.width = `${progress}%`;
    
    // Generate options
    optionsContainer.innerHTML = '';
    question.options.forEach((option, index) => {
        const optionBtn = document.createElement('button');
        optionBtn.className = 'option-btn';
        optionBtn.textContent = option;
        optionBtn.addEventListener('click', () => selectOption(index));
        optionsContainer.appendChild(optionBtn);
    });
    
    // Show/hide navigation buttons
    const nextBtn = document.getElementById('nextQuestion');
    const finishBtn = document.getElementById('finishQuiz');
    
    if (quizData.currentQuestion < 9) {
        nextBtn.style.display = 'inline-block';
        finishBtn.style.display = 'none';
    } else {
        nextBtn.style.display = 'none';
        finishBtn.style.display = 'inline-block';
    }
}

function selectOption(optionIndex) {
    const optionButtons = document.querySelectorAll('.option-btn');
    const question = quizData.questions[quizData.currentQuestion];
    
    // Disable all buttons
    optionButtons.forEach(btn => {
        btn.style.pointerEvents = 'none';
    });
    
    // Mark selected answer
    quizData.answers[quizData.currentQuestion] = optionIndex;
    
    // Show correct/incorrect feedback
    optionButtons.forEach((btn, index) => {
        if (index === question.correct) {
            btn.classList.add('correct');
        } else if (index === optionIndex && index !== question.correct) {
            btn.classList.add('incorrect');
        }
    });
    
    // Enable next/finish button
    if (quizData.currentQuestion < 9) {
        document.getElementById('nextQuestion').disabled = false;
    } else {
        document.getElementById('finishQuiz').disabled = false;
    }
}

function nextQuestion() {
    if (quizData.answers[quizData.currentQuestion] === undefined) {
        alert('Please select an answer before continuing!');
        return;
    }
    
    quizData.currentQuestion++;
    showQuestion();
}

function finishQuiz() {
    if (quizData.answers[quizData.currentQuestion] === undefined) {
        alert('Please select an answer before finishing!');
        return;
    }
    
    showQuizResults();
}

function showQuizResults() {
    const correctAnswers = quizData.answers.filter((answer, index) => 
        answer === quizData.questions[index].correct
    ).length;
    
    const score = (correctAnswers / 10) * 100;
    let grade;
    
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    else grade = 'F';
    
    document.getElementById('quizCorrect').textContent = `${correctAnswers}/10`;
    document.getElementById('quizScore').textContent = `${Math.round(score)}%`;
    document.getElementById('quizGrade').textContent = grade;
    
    document.getElementById('quizContainer').style.display = 'none';
    document.getElementById('quizResults').style.display = 'block';
}

function retakeQuiz() {
    document.getElementById('quizResults').style.display = 'none';
    document.getElementById('quizIntro').style.display = 'block';
}

// Add some interactive animations
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to theory examples
    const exampleItems = document.querySelectorAll('.example-item');
    exampleItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
            this.style.transition = 'transform 0.2s ease';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    // Add click sound effect (optional)
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Add a subtle animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 100);
        });
    });
}); 