// Global variables
let currentQuestion = 0;
let correctAnswers = 0;
let testQuestions = [];
let userAnswers = [];

// Initialization when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeVisualGrid();
    generateTestQuestions();
    setupEventListeners();
});

// Navigation between sections
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Show the required section
    document.getElementById(sectionName).classList.add('active');
    
    // Add active class to the required button
    event.target.classList.add('active');
}

// Setup event listeners
function setupEventListeners() {
    // Handle Enter key in input fields
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const exerciseId = this.id.replace('answer', '');
                if (exerciseId === '1') {
                    checkAnswer(1);
                } else if (exerciseId === '2') {
                    checkVisualAnswer();
                }
            }
        });
    });
}

// Initialize visual grid
function initializeVisualGrid() {
    const grid = document.getElementById('visualGrid');
    const rows = 4;
    const cols = 3;
    
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    
    for (let i = 0; i < rows * cols; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        grid.appendChild(dot);
    }
    
    document.getElementById('visualQuestion').textContent = `${rows} × ${cols} = ?`;
}

// Check answer for exercise 1
function checkAnswer(exerciseId) {
    const answer = parseInt(document.getElementById(`answer${exerciseId}`).value);
    const num1 = parseInt(document.getElementById('num1').textContent);
    const num2 = parseInt(document.getElementById('num2').textContent);
    const correctAnswer = num1 * num2;
    
    const resultDiv = document.getElementById(`result${exerciseId}`);
    
    if (answer === correctAnswer) {
        resultDiv.textContent = `✅ Correct! ${num1} × ${num2} = ${correctAnswer}`;
        resultDiv.className = 'result correct';
    } else {
        resultDiv.textContent = `❌ Incorrect. Correct answer: ${correctAnswer}`;
        resultDiv.className = 'result incorrect';
    }
}

// Check visual answer
function checkVisualAnswer() {
    const answer = parseInt(document.getElementById('answer2').value);
    const correctAnswer = 4 * 3; // 4 rows × 3 columns
    
    const resultDiv = document.getElementById('result2');
    
    if (answer === correctAnswer) {
        resultDiv.textContent = `✅ Correct! There are ${correctAnswer} dots in the 4 × 3 grid`;
        resultDiv.className = 'result correct';
    } else {
        resultDiv.textContent = `❌ Incorrect. There are ${correctAnswer} dots in the 4 × 3 grid`;
        resultDiv.className = 'result incorrect';
    }
}

// Check fill in the blanks
function checkBlanks() {
    const answers = [
        parseInt(document.getElementById('blank1').value),
        parseInt(document.getElementById('blank2').value),
        parseInt(document.getElementById('blank3').value),
        parseInt(document.getElementById('blank4').value)
    ];
    
    const correctAnswers = [4, 4, 15, 4];
    let correctCount = 0;
    
    answers.forEach((answer, index) => {
        if (answer === correctAnswers[index]) {
            correctCount++;
        }
    });
    
    const resultDiv = document.getElementById('result3');
    
    if (correctCount === 4) {
        resultDiv.textContent = `✅ Excellent! All answers are correct!`;
        resultDiv.className = 'result correct';
    } else {
        resultDiv.textContent = `❌ Correct answers: ${correctCount} out of 4. Try again!`;
        resultDiv.className = 'result incorrect';
    }
}

// Generate new exercise
function generateNewExercise() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    
    document.getElementById('num1').textContent = num1;
    document.getElementById('num2').textContent = num2;
    
    // Clear input fields and results
    document.getElementById('answer1').value = '';
    document.getElementById('answer2').value = '';
    document.getElementById('result1').textContent = '';
    document.getElementById('result2').textContent = '';
    document.getElementById('result1').className = 'result';
    document.getElementById('result2').className = 'result';
    
    // Generate new visual grid
    const rows = Math.floor(Math.random() * 5) + 2;
    const cols = Math.floor(Math.random() * 5) + 2;
    
    const grid = document.getElementById('visualGrid');
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    
    for (let i = 0; i < rows * cols; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        grid.appendChild(dot);
    }
    
    document.getElementById('visualQuestion').textContent = `${rows} × ${cols} = ?`;
}

// Generate test questions
function generateTestQuestions() {
    testQuestions = [
        {
            question: "What is 3 × 4?",
            type: "multiple_choice",
            options: ["7", "12", "8", "10"],
            correct: 1
        },
        {
            question: "What is 5 × 0?",
            type: "multiple_choice",
            options: ["5", "0", "1", "10"],
            correct: 1
        },
        {
            question: "What number should be multiplied by 2 to get 8?",
            type: "multiple_choice",
            options: ["3", "4", "6", "5"],
            correct: 1
        },
        {
            question: "What is 7 × 6?",
            type: "multiple_choice",
            options: ["42", "36", "48", "54"],
            correct: 0
        },
        {
            question: "What is 9 × 1?",
            type: "multiple_choice",
            options: ["10", "8", "9", "1"],
            correct: 2
        },
        {
            question: "Which property of multiplication shows that 3 × 4 = 4 × 3?",
            type: "multiple_choice",
            options: ["Associative", "Commutative", "Distributive", "Identity"],
            correct: 1
        },
        {
            question: "What is 2 × 2 × 2?",
            type: "multiple_choice",
            options: ["6", "8", "4", "10"],
            correct: 1
        },
        {
            question: "What is 6 × 5?",
            type: "multiple_choice",
            options: ["25", "30", "35", "40"],
            correct: 1
        },
        {
            question: "What number should be multiplied by 3 to get 21?",
            type: "multiple_choice",
            options: ["6", "7", "8", "9"],
            correct: 1
        },
        {
            question: "What is 4 × 8?",
            type: "multiple_choice",
            options: ["28", "32", "36", "40"],
            correct: 1
        }
    ];
    
    userAnswers = new Array(testQuestions.length).fill(null);
}

// Show test question
function showQuestion(questionIndex) {
    const question = testQuestions[questionIndex];
    const questionContent = document.getElementById('questionContent');
    const answerOptions = document.getElementById('answerOptions');
    
    document.getElementById('questionText').textContent = `Question ${questionIndex + 1}`;
    document.getElementById('currentQuestion').textContent = questionIndex + 1;
    
    questionContent.innerHTML = `<p>${question.question}</p>`;
    
    answerOptions.innerHTML = '';
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'answer-option';
        optionDiv.textContent = option;
        optionDiv.onclick = () => selectAnswer(index);
        
        if (userAnswers[questionIndex] === index) {
            optionDiv.classList.add('selected');
        }
        
        answerOptions.appendChild(optionDiv);
    });
    
    document.getElementById('nextBtn').style.display = 'none';
}

// Select answer
function selectAnswer(optionIndex) {
    userAnswers[currentQuestion] = optionIndex;
    
    // Remove selection from all options
    document.querySelectorAll('.answer-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Highlight selected option
    event.target.classList.add('selected');
    
    // Show "Next question" button
    document.getElementById('nextBtn').style.display = 'block';
}

// Next question
function nextQuestion() {
    if (userAnswers[currentQuestion] === null) {
        alert('Please select an answer!');
        return;
    }
    
    currentQuestion++;
    
    if (currentQuestion < testQuestions.length) {
        showQuestion(currentQuestion);
    } else {
        showTestResults();
    }
}

// Show test results
function showTestResults() {
    correctAnswers = 0;
    
    userAnswers.forEach((answer, index) => {
        if (answer === testQuestions[index].correct) {
            correctAnswers++;
        }
    });
    
    const percentage = Math.round((correctAnswers / testQuestions.length) * 100);
    
    document.getElementById('correctAnswers').textContent = correctAnswers;
    document.getElementById('totalAnswers').textContent = testQuestions.length;
    document.getElementById('percentage').textContent = percentage + '%';
    
    const gradeDiv = document.getElementById('grade');
    if (percentage >= 90) {
        gradeDiv.textContent = 'Excellent! 🏆';
        gradeDiv.className = 'grade excellent';
    } else if (percentage >= 70) {
        gradeDiv.textContent = 'Good! 👍';
        gradeDiv.className = 'grade good';
    } else {
        gradeDiv.textContent = 'Need to improve knowledge 📚';
        gradeDiv.className = 'grade satisfactory';
    }
    
    document.getElementById('testQuestion').style.display = 'none';
    document.getElementById('testResults').style.display = 'block';
}

// Restart test
function restartTest() {
    currentQuestion = 0;
    correctAnswers = 0;
    userAnswers = new Array(testQuestions.length).fill(null);
    
    document.getElementById('testQuestion').style.display = 'block';
    document.getElementById('testResults').style.display = 'none';
    
    showQuestion(0);
}

// Show first question when switching to test tab
document.addEventListener('click', function(e) {
    if (e.target.textContent.includes('Test')) {
        setTimeout(() => {
            if (currentQuestion === 0) {
                showQuestion(0);
            }
        }, 100);
    }
}); 