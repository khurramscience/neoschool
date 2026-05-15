// Global variables
let currentTask = null;
let practiceStats = { correct: 0, total: 0 };
let testQuestions = [];
let currentQuestionIndex = 0;
let testAnswers = [];
let testTimer = null;
let testStartTime = null;

// Functions for working with fractions
function parseFraction(input) {
    input = input.trim();
    
    // Check if input is a common fraction (e.g., "1/2", "-3/4")
    const fractionRegex = /^(-?\d+)\/(-?\d+)$/;
    const match = input.match(fractionRegex);
    
    if (match) {
        const numerator = parseInt(match[1]);
        const denominator = parseInt(match[2]);
        
        if (denominator === 0) {
            return null; // Division by zero
        }
        
        return numerator / denominator;
    }
    
    // Check if input is a decimal number
    const decimal = parseFloat(input);
    if (!isNaN(decimal)) {
        return decimal;
    }
    
    return null; // Invalid input
}

function formatAnswer(answer) {
    // If answer is an integer
    if (Number.isInteger(answer)) {
        return answer.toString();
    }
    
    // If answer is a fractional number, try to represent as a simple fraction
    const tolerance = 0.001;
    
    // Check simple fractions
    const simpleFractions = [
        [1, 2], [1, 3], [2, 3], [1, 4], [3, 4], 
        [1, 5], [2, 5], [3, 5], [4, 5], [1, 6], 
        [5, 6], [1, 8], [3, 8], [5, 8], [7, 8]
    ];
    
    for (let [num, den] of simpleFractions) {
        // Check positive fractions
        if (Math.abs(answer - num/den) < tolerance) {
            return `${num}/${den}`;
        }
        // Check negative fractions
        if (Math.abs(answer + num/den) < tolerance) {
            return `-${num}/${den}`;
        }
    }
    
    // If simple fraction not found, return decimal number
    return answer.toFixed(3).replace(/\.?0+$/, '');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializePractice();
    initializeTest();
});

// Navigation between sections
function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSection = button.getAttribute('data-section');
            
            // Remove active class from all buttons and sections
            navButtons.forEach(btn => btn.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Add active class to selected button and section
            button.classList.add('active');
            document.getElementById(targetSection).classList.add('active');
        });
    });
}

// Инициализация раздела практики
function initializePractice() {
    const generateBtn = document.getElementById('generateTask');
    const checkBtn = document.getElementById('checkAnswer');
    const showSolutionBtn = document.getElementById('showSolution');
    const userAnswerInput = document.getElementById('userAnswer');

    generateBtn.addEventListener('click', generateNewTask);
    checkBtn.addEventListener('click', checkAnswer);
    showSolutionBtn.addEventListener('click', showSolution);
    
    userAnswerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
}

// Инициализация раздела тестирования
function initializeTest() {
    const startTestBtn = document.getElementById('startTest');
    const submitTestBtn = document.getElementById('submitTest');
    const retakeTestBtn = document.getElementById('retakeTest');
    const submitAnswerBtn = document.getElementById('submitAnswer');
    const testUserAnswerInput = document.getElementById('testUserAnswer');

    startTestBtn.addEventListener('click', startTest);
    submitTestBtn.addEventListener('click', submitTest);
    retakeTestBtn.addEventListener('click', retakeTest);
    submitAnswerBtn.addEventListener('click', submitTestAnswer);
    
    testUserAnswerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitTestAnswer();
        }
    });
}

// Генерация новой задачи
function generateNewTask() {
    const taskTypes = [
        'addition_negative',
        'subtraction_negative', 
        'mixed_operations',
        'fractions'
    ];
    
    const randomType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
    currentTask = generateTaskByType(randomType);
    
    document.getElementById('taskText').textContent = currentTask.question;
    document.getElementById('userAnswer').value = '';
    document.getElementById('result').innerHTML = '';
    document.getElementById('solution').classList.add('hidden');
    
    // Фокусируемся на поле ввода
    document.getElementById('userAnswer').focus();
}

// Генерация задачи по типу
function generateTaskByType(type) {
    switch(type) {
        case 'addition_negative':
            return generateAdditionTask();
        case 'subtraction_negative':
            return generateSubtractionTask();
        case 'mixed_operations':
            return generateMixedTask();
        case 'fractions':
            return generateFractionTask();
        default:
            return generateAdditionTask();
    }
}

// Генерация задачи на сложение
function generateAdditionTask() {
    const a = Math.floor(Math.random() * 20) - 10; // от -10 до 10
    const b = Math.floor(Math.random() * 20) - 10;
    const answer = a + b;
    
    return {
        question: `${a} + ${b} = ?`,
        answer: answer,
        solution: `${a} + ${b} = ${answer}`,
        type: 'addition'
    };
}

// Генерация задачи на вычитание
function generateSubtractionTask() {
    const a = Math.floor(Math.random() * 20) - 10;
    const b = Math.floor(Math.random() * 20) - 10;
    const answer = a - b;
    
    return {
        question: `${a} - ${b} = ?`,
        answer: answer,
        solution: `${a} - ${b} = ${answer}`,
        type: 'subtraction'
    };
}

// Генерация смешанной задачи
function generateMixedTask() {
    const operations = ['+', '-'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    const a = Math.floor(Math.random() * 20) - 10;
    const b = Math.floor(Math.random() * 20) - 10;
    
    let answer, solution;
    if (operation === '+') {
        answer = a + b;
        solution = `${a} + ${b} = ${answer}`;
    } else {
        answer = a - b;
        solution = `${a} - ${b} = ${answer}`;
    }
    
    return {
        question: `${a} ${operation} ${b} = ?`,
        answer: answer,
        solution: solution,
        type: 'mixed'
    };
}

// Генерация задачи с дробями
function generateFractionTask() {
    const denominators = [2, 3, 4, 6, 8];
    const den1 = denominators[Math.floor(Math.random() * denominators.length)];
    const den2 = denominators[Math.floor(Math.random() * denominators.length)];
    
    const num1 = Math.floor(Math.random() * 5) - 2; // от -2 до 2
    const num2 = Math.floor(Math.random() * 5) - 2;
    
    const operations = ['+', '-'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let answer, solution;
    if (operation === '+') {
        answer = num1/den1 + num2/den2;
        solution = `${num1}/${den1} + ${num2}/${den2} = ${answer}`;
    } else {
        answer = num1/den1 - num2/den2;
        solution = `${num1}/${den1} - ${num2}/${den2} = ${answer}`;
    }
    
    return {
        question: `${num1}/${den1} ${operation} ${num2}/${den2} = ?`,
        answer: answer,
        solution: solution,
        type: 'fraction'
    };
}

// Проверка ответа
function checkAnswer() {
    if (!currentTask) {
        alert('Please generate a task first!');
        return;
    }
    
    const userAnswer = document.getElementById('userAnswer').value.trim();
    if (!userAnswer) {
        alert('Please enter an answer!');
        return;
    }
    
    const parsedAnswer = parseFraction(userAnswer);
    
    if (parsedAnswer === null) {
        alert('Invalid answer format! Use numbers (e.g., 5, -3) or fractions (e.g., 1/2, -3/4)');
        return;
    }
    
    const correctAnswer = currentTask.answer;
    
    const resultDiv = document.getElementById('result');
    const isCorrect = Math.abs(parsedAnswer - correctAnswer) < 0.01; // Учитываем погрешность для дробей
    
    if (isCorrect) {
        resultDiv.innerHTML = '✅ Correct! Excellent work!';
        resultDiv.className = 'result correct';
        practiceStats.correct++;
    } else {
        resultDiv.innerHTML = `❌ Incorrect. Correct answer: ${formatAnswer(correctAnswer)}`;
        resultDiv.className = 'result incorrect';
    }
    
    practiceStats.total++;
    updateStats();
}

// Показать решение
function showSolution() {
    if (!currentTask) {
        alert('Please generate a task first!');
        return;
    }
    
    const solutionDiv = document.getElementById('solution');
    // Форматируем ответ в решении, если это дробь
    let formattedSolution = currentTask.solution;
    if (currentTask.solution.includes('=')) {
        const parts = currentTask.solution.split('=');
        const answer = parseFloat(parts[1].trim());
        formattedSolution = parts[0] + '= ' + formatAnswer(answer);
    }
    
    solutionDiv.innerHTML = `<strong>Solution:</strong> ${formattedSolution}`;
    solutionDiv.classList.remove('hidden');
}

// Обновление статистики
function updateStats() {
    document.getElementById('correctCount').textContent = practiceStats.correct;
    document.getElementById('totalCount').textContent = practiceStats.total;
    
    const percentage = practiceStats.total > 0 ? 
        Math.round((practiceStats.correct / practiceStats.total) * 100) : 0;
    document.getElementById('percentage').textContent = percentage + '%';
}

// Начать тест
function startTest() {
    testQuestions = generateTestQuestions();
    currentQuestionIndex = 0;
    testAnswers = [];
    testStartTime = Date.now();
    
    document.getElementById('startTest').classList.add('hidden');
    document.getElementById('submitTest').classList.remove('hidden');
    document.getElementById('testContainer').classList.remove('hidden');
    document.getElementById('testResults').classList.add('hidden');
    
    showCurrentQuestion();
    startTimer();
}

// Generate test questions
function generateTestQuestions() {
    const questions = [];
    
    // 10 questions of different types
    for (let i = 0; i < 10; i++) {
        const taskTypes = ['addition_negative', 'subtraction_negative', 'mixed_operations', 'fractions'];
        const randomType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
        
        let task;
        switch(randomType) {
            case 'addition_negative':
                task = generateAdditionTask();
                break;
            case 'subtraction_negative':
                task = generateSubtractionTask();
                break;
            case 'mixed_operations':
                task = generateMixedTask();
                break;
            case 'fractions':
                task = generateFractionTask();
                break;
        }
        
        questions.push({
            question: task.question,
            correctAnswer: task.answer,
            type: task.type
        });
    }
    
    return questions;
}

// Перемешивание массива (оставляем для возможного использования в будущем)
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Show current question
function showCurrentQuestion() {
    const question = testQuestions[currentQuestionIndex];
    const questionsContainer = document.getElementById('testQuestions');
    
    questionsContainer.innerHTML = `
        <div class="question">
            <h4>Question ${currentQuestionIndex + 1}</h4>
            <div class="question-text">${question.question}</div>
        </div>
    `;
    
    // Show input field for answer
    document.getElementById('testAnswerInput').classList.remove('hidden');
    document.getElementById('testUserAnswer').value = '';
    document.getElementById('testUserAnswer').focus();
    
    document.getElementById('questionCounter').textContent = `Question ${currentQuestionIndex + 1} of ${testQuestions.length}`;
}

// Отправка ответа в тесте
function submitTestAnswer() {
    const userInput = document.getElementById('testUserAnswer').value.trim();
    
    if (!userInput) {
        alert('Please enter an answer!');
        return;
    }
    
    const parsedAnswer = parseFraction(userInput);
    
    if (parsedAnswer === null) {
        alert('Invalid answer format! Use numbers (e.g., 5, -3) or fractions (e.g., 1/2, -3/4)');
        return;
    }
    
    // Сохраняем ответ
    testAnswers[currentQuestionIndex] = parsedAnswer;
    
    // Show result
    const question = testQuestions[currentQuestionIndex];
    const isCorrect = Math.abs(parsedAnswer - question.correctAnswer) < 0.01;
    
    // Temporarily show result
    const resultMessage = isCorrect ? '✅ Correct!' : `❌ Incorrect. Correct answer: ${formatAnswer(question.correctAnswer)}`;
    
    // Create temporary message
    const tempResult = document.createElement('div');
    tempResult.className = isCorrect ? 'result correct' : 'result incorrect';
    tempResult.textContent = resultMessage;
    tempResult.style.marginBottom = '15px';
    
    const questionDiv = document.querySelector('.question');
    questionDiv.appendChild(tempResult);
    
    // Hide input field
    document.getElementById('testAnswerInput').classList.add('hidden');
    
    // Move to next question after 2 seconds
    setTimeout(() => {
        if (currentQuestionIndex < testQuestions.length - 1) {
            currentQuestionIndex++;
            showCurrentQuestion();
        } else {
            // Last question - show finish button
            document.getElementById('submitTest').textContent = '📤 Finish Test';
            document.getElementById('submitTest').classList.remove('hidden');
        }
    }, 2000);
}

// Завершить тест
function submitTest() {
    clearInterval(testTimer);
    
    const correctAnswers = testAnswers.filter((answer, index) => {
        const question = testQuestions[index];
        return Math.abs(answer - question.correctAnswer) < 0.01;
    }).length;
    
    showTestResults(correctAnswers);
}

// Показать результаты теста
function showTestResults(correctAnswers) {
    document.getElementById('testQuestions').classList.add('hidden');
    document.getElementById('testAnswerInput').classList.add('hidden');
    document.getElementById('submitTest').classList.add('hidden');
    document.getElementById('testResults').classList.remove('hidden');
    
    document.getElementById('finalScore').textContent = correctAnswers;
    
    const scoreDetails = document.getElementById('scoreDetails');
    scoreDetails.innerHTML = '';
    
    testQuestions.forEach((question, index) => {
        const userAnswer = testAnswers[index] || 'Not answered';
        const isCorrect = Math.abs(userAnswer - question.correctAnswer) < 0.01;
        
        const detailDiv = document.createElement('div');
        detailDiv.className = isCorrect ? 'correct' : 'incorrect';
        detailDiv.innerHTML = `
            <strong>Question ${index + 1}:</strong> ${question.question}<br>
            Your answer: ${typeof userAnswer === 'number' ? formatAnswer(userAnswer) : userAnswer} | Correct answer: ${formatAnswer(question.correctAnswer)}
        `;
        scoreDetails.appendChild(detailDiv);
    });
}

// Перезапустить тест
function retakeTest() {
    document.getElementById('startTest').classList.remove('hidden');
    document.getElementById('testContainer').classList.add('hidden');
    document.getElementById('testResults').classList.add('hidden');
    document.getElementById('testAnswerInput').classList.add('hidden');
    clearInterval(testTimer);
}

// Таймер для теста
function startTimer() {
    testTimer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - testStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('timer').textContent = 
            `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Глобальная функция для отправки ответа в тесте (нужна для onclick)
window.submitTestAnswer = submitTestAnswer; 