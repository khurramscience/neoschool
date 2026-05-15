// Глобальные переменные
let currentProblem = null;
let practiceStats = {
    total: 0,
    correct: 0
};

let testData = {
    questions: [],
    currentQuestion: 0,
    answers: [],
    totalQuestions: 0
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializePractice();
    initializeTest();
    updateStats();
});

// Функции для работы с табами
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Убираем активный класс со всех кнопок и контента
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Добавляем активный класс к выбранной кнопке и контенту
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Функции для блока тренировки
function initializePractice() {
    const generateBtn = document.getElementById('generateProblem');
    const checkBtn = document.getElementById('checkAnswer');
    const userAnswerInput = document.getElementById('userAnswer');

    generateBtn.addEventListener('click', generateProblem);
    checkBtn.addEventListener('click', checkAnswer);
    
    userAnswerInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
}

function generateProblem() {
    const topDigits = parseInt(document.getElementById('topDigits').value);
    const bottomDigits = parseInt(document.getElementById('bottomDigits').value);

    // Проверка на некорректные настройки
    if (topDigits < bottomDigits) {
        document.getElementById('problemContainer').style.display = 'none';
        alert('Number of digits in the minuend must be greater than or equal to the subtrahend!');
        return;
    }

    // Генерируем числа с заданным количеством разрядов
    const minTop = Math.pow(10, topDigits - 1);
    const maxTop = Math.pow(10, topDigits) - 1;
    const minBottom = Math.pow(10, bottomDigits - 1);
    const maxBottom = Math.pow(10, bottomDigits) - 1;

    let num1, num2;
    let attempts = 0;
    const maxAttempts = 1000;
    do {
        num1 = Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop;
        num2 = Math.floor(Math.random() * (maxBottom - minBottom + 1)) + minBottom;
        attempts++;
        if (attempts > maxAttempts) {
            alert('Failed to generate a valid problem. Please change the settings.');
            return;
        }
    } while (num1 <= num2);

    currentProblem = {
        num1: num1,
        num2: num2,
        answer: num1 - num2
    };

    displayProblem();

    // Показываем контейнер с задачей
    document.getElementById('problemContainer').style.display = 'block';
    document.getElementById('userAnswer').value = '';
    document.getElementById('resultMessage').innerHTML = '';
    document.getElementById('solution').style.display = 'none';

    // Фокусируемся на поле ввода
    document.getElementById('userAnswer').focus();
}

function displayProblem() {
    const problemDisplay = document.getElementById('problemDisplay');
    const num1Str = currentProblem.num1.toString();
    const num2Str = currentProblem.num2.toString();
    
    // Выравниваем числа по правому краю
    const maxLength = Math.max(num1Str.length, num2Str.length);
    const num1Formatted = num1Str.padStart(maxLength, ' ');
    const num2Formatted = num2Str.padStart(maxLength, ' ');
    
    problemDisplay.innerHTML = `
        <div style="font-family: 'Courier New', monospace; text-align: right;">
            <div>${num1Formatted}</div>
            <div>- ${num2Formatted}</div>
            <div style="border-bottom: 2px solid #333; margin: 10px 0;">${'─'.repeat(maxLength + 2)}</div>
            <div style="color: #667eea; font-weight: bold;">?</div>
        </div>
    `;
}

function checkAnswer() {
    const userAnswer = parseInt(document.getElementById('userAnswer').value);
    const resultMessage = document.getElementById('resultMessage');
    const solution = document.getElementById('solution');
    
    if (isNaN(userAnswer)) {
        resultMessage.innerHTML = 'Please enter a number!';
        resultMessage.className = 'result-message incorrect';
        return;
    }
    
    practiceStats.total++;
    
    if (userAnswer === currentProblem.answer) {
        practiceStats.correct++;
        resultMessage.innerHTML = '✅ Correct! Excellent work!';
        resultMessage.className = 'result-message correct';
        solution.style.display = 'none';
    } else {
        resultMessage.innerHTML = `❌ Incorrect. Correct answer: ${currentProblem.answer}`;
        resultMessage.className = 'result-message incorrect';
        showDetailedSolution();
    }
    
    updateStats();
}

function showDetailedSolution() {
    const solution = document.getElementById('solution');
    const solutionSteps = document.getElementById('solutionSteps');
    
    const num1 = currentProblem.num1;
    const num2 = currentProblem.num2;
    const answer = currentProblem.answer;
    
    // Create step-by-step solution
    const num1Str = num1.toString();
    const num2Str = num2.toString();
    const answerStr = answer.toString();
    
    let steps = `<div style="font-family: 'Courier New', monospace; margin-bottom: 20px;">
        <div style="text-align: right; font-size: 1.2rem;">
            <div>${num1Str}</div>
            <div>- ${num2Str}</div>
            <div style="border-bottom: 2px solid #333; margin: 5px 0;">${'─'.repeat(Math.max(num1Str.length, num2Str.length) + 2)}</div>
            <div style="color: #667eea; font-weight: bold;">${answerStr}</div>
        </div>
    </div>`;
    
    // Add step-by-step explanation
    steps += '<div style="margin-top: 20px;">';
    steps += '<p><strong>Step-by-step solution:</strong></p>';
    
    // Break numbers into digits and show subtraction process
    const num1Digits = num1Str.split('').reverse();
    const num2Digits = num2Str.padStart(num1Str.length, '0').split('').reverse();
    
    for (let i = 0; i < num1Digits.length; i++) {
        const digit1 = parseInt(num1Digits[i]);
        const digit2 = parseInt(num2Digits[i]);
        
        if (digit1 >= digit2) {
            steps += `<p>${i + 1}. ${digit1} - ${digit2} = ${digit1 - digit2}</p>`;
        } else {
            // Show borrowing
            steps += `<p>${i + 1}. ${digit1} - ${digit2} = impossible, borrow 1 from higher place: ${digit1 + 10} - ${digit2} = ${digit1 + 10 - digit2}</p>`;
        }
    }
    
    steps += '</div>';
    
    solutionSteps.innerHTML = steps;
    solution.style.display = 'block';
}

function updateStats() {
    document.getElementById('totalProblems').textContent = practiceStats.total;
    document.getElementById('correctAnswers').textContent = practiceStats.correct;
    
    const successRate = practiceStats.total > 0 ? Math.round((practiceStats.correct / practiceStats.total) * 100) : 0;
    document.getElementById('successRate').textContent = successRate + '%';
}

// Функции для блока тестирования
function initializeTest() {
    const startTestBtn = document.getElementById('startTest');
    const nextQuestionBtn = document.getElementById('nextQuestion');
    const retakeTestBtn = document.getElementById('retakeTest');
    const testAnswerInput = document.getElementById('testAnswer');

    startTestBtn.addEventListener('click', startTest);
    nextQuestionBtn.addEventListener('click', nextQuestion);
    retakeTestBtn.addEventListener('click', retakeTest);
    
    testAnswerInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            nextQuestion();
        }
    });
}

function startTest() {
    const totalQuestions = parseInt(document.getElementById('testQuestions').value);
    const minDigits = parseInt(document.getElementById('testMinDigits').value);
    const maxDigits = parseInt(document.getElementById('testMaxDigits').value);

    // Проверка на некорректные настройки
    if (minDigits > maxDigits) {
        alert('Minimum number of digits must be less than or equal to maximum!');
        return;
    }
    // Генерируем вопросы для теста
    testData.questions = [];
    testData.answers = [];
    testData.currentQuestion = 0;
    testData.totalQuestions = totalQuestions;

    for (let i = 0; i < totalQuestions; i++) {
        const minNum = Math.pow(10, minDigits - 1);
        const maxNum = Math.pow(10, maxDigits) - 1;

        let num1, num2;
        let attempts = 0;
        const maxAttempts = 1000;
        do {
            num1 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
            num2 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
            attempts++;
            if (attempts > maxAttempts) {
                alert('Failed to generate a valid problem. Please change the settings.');
                return;
            }
        } while (num1 <= num2);

        testData.questions.push({
            num1: num1,
            num2: num2,
            answer: num1 - num2
        });
    }

    // Показываем первый вопрос
    showTestQuestion();

    // Переключаем интерфейс
    document.getElementById('testSetup').style.display = 'none';
    document.getElementById('testContainer').style.display = 'block';
    document.getElementById('testResults').style.display = 'none';
}

function showTestQuestion() {
    const question = testData.questions[testData.currentQuestion];
    const testProblem = document.getElementById('testProblem');
    const num1Str = question.num1.toString();
    const num2Str = question.num2.toString();
    
    // Выравниваем числа по правому краю
    const maxLength = Math.max(num1Str.length, num2Str.length);
    const num1Formatted = num1Str.padStart(maxLength, ' ');
    const num2Formatted = num2Str.padStart(maxLength, ' ');
    
    testProblem.innerHTML = `
        <div style="font-family: 'Courier New', monospace; text-align: right;">
            <div>${num1Formatted}</div>
            <div>- ${num2Formatted}</div>
            <div style="border-bottom: 2px solid #333; margin: 10px 0;">${'─'.repeat(maxLength + 2)}</div>
            <div style="color: #667eea; font-weight: bold;">?</div>
        </div>
    `;
    
    // Обновляем счетчик вопросов
    document.getElementById('currentQuestion').textContent = testData.currentQuestion + 1;
    document.getElementById('totalQuestions').textContent = testData.totalQuestions;
    
    // Обновляем прогресс-бар
    const progress = ((testData.currentQuestion) / testData.totalQuestions) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    
    // Очищаем поле ввода
    document.getElementById('testAnswer').value = '';
    document.getElementById('testAnswer').focus();
}

function nextQuestion() {
    const userAnswer = parseInt(document.getElementById('testAnswer').value);
    
    if (isNaN(userAnswer)) {
        alert('Please enter a number!');
        return;
    }
    
    // Сохраняем ответ
    testData.answers.push(userAnswer);
    
    // Переходим к следующему вопросу или завершаем тест
    testData.currentQuestion++;
    
    if (testData.currentQuestion < testData.totalQuestions) {
        showTestQuestion();
    } else {
        finishTest();
    }
}

function finishTest() {
    // Calculate results
    let correct = 0;
    const reviewList = [];
    
    for (let i = 0; i < testData.totalQuestions; i++) {
        const question = testData.questions[i];
        const userAnswer = testData.answers[i];
        const isCorrect = userAnswer === question.answer;
        
        if (isCorrect) {
            correct++;
        }
        
        reviewList.push({
            question: question,
            userAnswer: userAnswer,
            isCorrect: isCorrect
        });
    }
    
    const percentage = Math.round((correct / testData.totalQuestions) * 100);
    
    // Determine grade
    let grade;
    if (percentage >= 90) grade = 'Excellent (A)';
    else if (percentage >= 75) grade = 'Good (B)';
    else if (percentage >= 60) grade = 'Satisfactory (C)';
    else grade = 'Unsatisfactory (D)';
    
    // Show results
    document.getElementById('testCorrect').textContent = correct;
    document.getElementById('testTotal').textContent = testData.totalQuestions;
    document.getElementById('testPercentage').textContent = percentage + '%';
    document.getElementById('testGrade').textContent = grade;
    
    // Create error analysis
    const reviewListElement = document.getElementById('reviewList');
    let reviewHTML = '';
    
    reviewList.forEach((item, index) => {
        const num1Str = item.question.num1.toString();
        const num2Str = item.question.num2.toString();
        const maxLength = Math.max(num1Str.length, num2Str.length);
        const num1Formatted = num1Str.padStart(maxLength, ' ');
        const num2Formatted = num2Str.padStart(maxLength, ' ');
        
        reviewHTML += `
            <div class="review-item ${item.isCorrect ? 'correct' : 'incorrect'}">
                <div style="font-family: 'Courier New', monospace; text-align: right; margin-bottom: 10px;">
                    <div>${num1Formatted}</div>
                    <div>- ${num2Formatted}</div>
                    <div style="border-bottom: 1px solid #333; margin: 5px 0;">${'─'.repeat(maxLength + 2)}</div>
                    <div>${item.question.answer}</div>
                </div>
                <div>
                    <strong>Your answer:</strong> ${item.userAnswer} 
                    ${item.isCorrect ? '✅' : '❌'}
                </div>
                ${!item.isCorrect ? `<div><strong>Correct answer:</strong> ${item.question.answer}</div>` : ''}
            </div>
        `;
    });
    
    reviewListElement.innerHTML = reviewHTML;
    
    // Switch interface
    document.getElementById('testContainer').style.display = 'none';
    document.getElementById('testResults').style.display = 'block';
}

function retakeTest() {
    // Reset test data
    testData.questions = [];
    testData.answers = [];
    testData.currentQuestion = 0;
    testData.totalQuestions = 0;
    
    // Show test settings
    document.getElementById('testSetup').style.display = 'block';
    document.getElementById('testContainer').style.display = 'none';
    document.getElementById('testResults').style.display = 'none';
} 