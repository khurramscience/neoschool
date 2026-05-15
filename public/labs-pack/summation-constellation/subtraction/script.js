// Глобальные переменные
let currentDifficulty = 'easy';
let currentNum1 = 0;
let currentNum2 = 0;
let correctAnswer = 0;
let correctCount = 0;
let totalCount = 0;
let testQuestions = [];
let currentTestQuestion = 0;
let testAttempts = 3;
let testCorrect = 0;
let testResults = [];

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializePractice();
    initializeTest();
    generateNewProblem();
});

// Навигация между секциями
function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSection = button.getAttribute('data-section');
            
            // Обновляем активные кнопки
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Показываем нужную секцию
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
        });
    });
}

// Инициализация тренировки
function initializePractice() {
    // Кнопки выбора сложности
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            difficultyButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentDifficulty = button.getAttribute('data-difficulty');
            generateNewProblem();
        });
    });

    // Кнопки управления
    document.getElementById('check-btn').addEventListener('click', checkAnswer);
    document.getElementById('next-btn').addEventListener('click', generateNewProblem);
    document.getElementById('hint-btn').addEventListener('click', showHint);

    // Обработка Enter в поле ответа
    document.getElementById('answer').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
}

// Инициализация тестирования
function initializeTest() {
    document.getElementById('start-test').addEventListener('click', startTest);
    document.getElementById('submit-answer').addEventListener('click', submitTestAnswer);
    document.getElementById('skip-question').addEventListener('click', skipTestQuestion);
    document.getElementById('retake-test').addEventListener('click', startTest);
    document.getElementById('view-answers').addEventListener('click', viewTestAnswers);

    // Обработка Enter в поле ответа теста
    document.getElementById('test-answer').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitTestAnswer();
        }
    });
}

// Генерация нового примера для тренировки
function generateNewProblem() {
    const difficultySettings = {
        easy: { min: 1, max: 99, digits: 2 },
        medium: { min: 10, max: 999, digits: 3 },
        hard: { min: 100, max: 9999, digits: 4 }
    };

    const settings = difficultySettings[currentDifficulty];
    
    // Генерируем числа с учетом сложности
    currentNum1 = Math.floor(Math.random() * (settings.max - settings.min + 1)) + settings.min;
    currentNum2 = Math.floor(Math.random() * (currentNum1 - 1)) + 1; // Второе число всегда меньше первого
    
    correctAnswer = currentNum1 - currentNum2;

    // Обновляем отображение
    document.getElementById('num1').textContent = currentNum1;
    document.getElementById('num2').textContent = currentNum2;
    document.getElementById('answer').value = '';
    document.getElementById('answer').focus();

    // Очищаем предыдущий фидбек
    clearFeedback();
}

// Проверка ответа в тренировке
function checkAnswer() {
    const userAnswer = parseInt(document.getElementById('answer').value);
    const feedback = document.getElementById('feedback');
    const answerInput = document.getElementById('answer');

    if (isNaN(userAnswer)) {
        feedback.textContent = 'Please enter a number!';
        feedback.className = 'feedback incorrect';
        return;
    }

    totalCount++;
    
    if (userAnswer === correctAnswer) {
        correctCount++;
        feedback.textContent = '✅ Correct! Excellent work!';
        feedback.className = 'feedback correct';
        answerInput.classList.add('correct-answer');
        answerInput.classList.remove('incorrect-answer');
    } else {
        feedback.textContent = `❌ Incorrect. Correct answer: ${correctAnswer}`;
        feedback.className = 'feedback incorrect';
        answerInput.classList.add('incorrect-answer');
        answerInput.classList.remove('correct-answer');
    }

    updateStats();
}

// Показать подсказку
function showHint() {
    const hintText = document.getElementById('hint-text');
    const num1Str = currentNum1.toString();
    const num2Str = currentNum2.toString();
    
    let hint = '';
    
    if (currentDifficulty === 'easy') {
        hint = `Try to calculate: ${currentNum1} - ${currentNum2} = ?`;
    } else if (currentDifficulty === 'medium') {
        hint = `Start with ones: ${num1Str.slice(-1)} - ${num2Str.slice(-1)}`;
        if (parseInt(num1Str.slice(-1)) < parseInt(num2Str.slice(-1))) {
            hint += ' (need to borrow from tens)';
        }
    } else {
        hint = `Break into parts: ${currentNum1} = ${Math.floor(currentNum1/1000)}000 + ${Math.floor((currentNum1%1000)/100)}00 + ${Math.floor((currentNum1%100)/10)}0 + ${currentNum1%10}`;
    }
    
    hintText.textContent = hint;
    hintText.style.display = 'block';
}

// Очистить фидбек
function clearFeedback() {
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
    document.getElementById('hint-text').style.display = 'none';
    document.getElementById('answer').classList.remove('correct-answer', 'incorrect-answer');
}

// Обновить статистику
function updateStats() {
    document.getElementById('correct-count').textContent = correctCount;
    document.getElementById('total-count').textContent = totalCount;
    const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    document.getElementById('percentage').textContent = percentage + '%';
}

// Начать тест
function startTest() {
    const includeNegative = document.getElementById('include-negative').checked;
    const includeDecimals = document.getElementById('include-decimals').checked;
    
    // Генерируем вопросы для теста
    testQuestions = generateTestQuestions(includeNegative, includeDecimals);
    currentTestQuestion = 0;
    testCorrect = 0;
    testResults = [];
    testAttempts = 3;

    // Показываем область теста
    document.getElementById('test-intro').style.display = 'none';
    document.getElementById('test-area').style.display = 'block';
    document.getElementById('test-results').style.display = 'none';

    showTestQuestion();
}

// Генерация вопросов для теста
function generateTestQuestions(includeNegative, includeDecimals) {
    const questions = [];
    
    for (let i = 0; i < 10; i++) {
        let num1, num2;
        
        // Разная сложность для разных вопросов
        if (i < 3) {
            // Легкие вопросы (1-2 разряда)
            num1 = Math.floor(Math.random() * 99) + 1;
            num2 = Math.floor(Math.random() * num1) + 1;
        } else if (i < 7) {
            // Средние вопросы (2-3 разряда)
            num1 = Math.floor(Math.random() * 999) + 10;
            num2 = Math.floor(Math.random() * (num1 - 10)) + 1;
        } else {
            // Сложные вопросы (3-4 разряда)
            num1 = Math.floor(Math.random() * 9999) + 100;
            num2 = Math.floor(Math.random() * (num1 - 100)) + 1;
        }

        // Добавляем отрицательные числа если включено
        if (includeNegative && Math.random() > 0.7) {
            num2 = num1 + Math.floor(Math.random() * 100) + 1;
        }

        // Добавляем десятичные дроби если включено
        if (includeDecimals && Math.random() > 0.8) {
            num1 = Math.round((num1 + Math.random()) * 10) / 10;
            num2 = Math.round((num2 + Math.random()) * 10) / 10;
        }

        questions.push({
            num1: num1,
            num2: num2,
            answer: num1 - num2,
            userAnswer: null,
            attempts: 0,
            correct: false
        });
    }
    
    return questions;
}

// Показать вопрос теста
function showTestQuestion() {
    if (currentTestQuestion >= testQuestions.length) {
        showTestResults();
        return;
    }

    const question = testQuestions[currentTestQuestion];
    document.getElementById('test-num1').textContent = question.num1;
    document.getElementById('test-num2').textContent = question.num2;
    document.getElementById('test-answer').value = '';
    document.getElementById('test-answer').focus();

    // Обновляем прогресс
    const progress = ((currentTestQuestion + 1) / testQuestions.length) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';
    document.getElementById('question-counter').textContent = `Question ${currentTestQuestion + 1} of ${testQuestions.length}`;

    // Очищаем фидбек
    document.getElementById('test-feedback').textContent = '';
    document.getElementById('test-feedback').className = 'test-feedback';
    document.getElementById('attempts-left').textContent = `Attempts left: ${testAttempts}`;
}

// Отправить ответ на тест
function submitTestAnswer() {
    const userAnswer = parseFloat(document.getElementById('test-answer').value);
    const question = testQuestions[currentTestQuestion];
    const feedback = document.getElementById('test-feedback');

    if (isNaN(userAnswer)) {
        feedback.textContent = 'Please enter a number!';
        feedback.className = 'test-feedback incorrect';
        return;
    }

    question.attempts++;
    testAttempts--;

    if (Math.abs(userAnswer - question.answer) < 0.01) { // Учитываем погрешность для десятичных
        question.correct = true;
        question.userAnswer = userAnswer;
        testCorrect++;
        feedback.textContent = '✅ Correct!';
        feedback.className = 'test-feedback correct';
        
        setTimeout(() => {
            currentTestQuestion++;
            testAttempts = 3;
            showTestQuestion();
        }, 1000);
    } else {
        question.userAnswer = userAnswer;
        feedback.textContent = `❌ Incorrect. Try again!`;
        feedback.className = 'test-feedback incorrect';
        
        if (testAttempts <= 0) {
            feedback.textContent = `❌ Correct answer: ${question.answer}`;
            setTimeout(() => {
                currentTestQuestion++;
                testAttempts = 3;
                showTestQuestion();
            }, 2000);
        }
    }

    document.getElementById('attempts-left').textContent = `Attempts left: ${testAttempts}`;
}

// Пропустить вопрос теста
function skipTestQuestion() {
    const question = testQuestions[currentTestQuestion];
    question.userAnswer = null;
    question.correct = false;
    
    currentTestQuestion++;
    testAttempts = 3;
    showTestQuestion();
}

// Показать результаты теста
function showTestResults() {
    document.getElementById('test-area').style.display = 'none';
    document.getElementById('test-results').style.display = 'block';

    const percentage = Math.round((testCorrect / testQuestions.length) * 100);
    
    document.getElementById('test-correct').textContent = testCorrect;
    document.getElementById('test-total').textContent = testQuestions.length;
    document.getElementById('test-percentage').textContent = percentage + '%';
    
    // Определяем оценку
    let grade = '';
    if (percentage >= 90) grade = 'Excellent (5)';
    else if (percentage >= 75) grade = 'Good (4)';
    else if (percentage >= 60) grade = 'Satisfactory (3)';
    else grade = 'Unsatisfactory (2)';
    
    document.getElementById('test-grade').textContent = grade;
}

// Посмотреть ответы теста
function viewTestAnswers() {
    let answersText = 'Test question answers:\n\n';
    
    testQuestions.forEach((question, index) => {
        const status = question.correct ? '✅' : '❌';
        answersText += `${index + 1}. ${question.num1} - ${question.num2} = ${question.answer} ${status}\n`;
        if (question.userAnswer !== null && !question.correct) {
            answersText += `   Your answer: ${question.userAnswer}\n`;
        }
        answersText += '\n';
    });
    
    alert(answersText);
}

// Дополнительные функции для улучшения UX

// Анимация при переключении секций
function animateSectionTransition() {
    const activeSection = document.querySelector('.section.active');
    activeSection.style.opacity = '0';
    activeSection.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        activeSection.style.opacity = '1';
        activeSection.style.transform = 'translateY(0)';
    }, 100);
}

// Звуковые эффекты (опционально)
function playSound(type) {
    // Здесь можно добавить звуковые эффекты
    // Например, для правильных/неправильных ответов
}

// Сохранение прогресса в localStorage
function saveProgress() {
    const progress = {
        correctCount,
        totalCount,
        currentDifficulty,
        lastPractice: new Date().toISOString()
    };
    localStorage.setItem('subtractionProgress', JSON.stringify(progress));
}

// Загрузка прогресса из localStorage
function loadProgress() {
    const saved = localStorage.getItem('subtractionProgress');
    if (saved) {
        const progress = JSON.parse(saved);
        correctCount = progress.correctCount || 0;
        totalCount = progress.totalCount || 0;
        currentDifficulty = progress.currentDifficulty || 'easy';
        updateStats();
        
        // Обновляем активную кнопку сложности
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-difficulty') === currentDifficulty) {
                btn.classList.add('active');
            }
        });
    }
}

// Автосохранение прогресса
setInterval(saveProgress, 30000); // Сохраняем каждые 30 секунд

// Загружаем прогресс при запуске
loadProgress(); 