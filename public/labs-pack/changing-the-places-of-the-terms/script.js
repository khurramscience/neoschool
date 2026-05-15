// Навигация между разделами
document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const contentSections = document.querySelectorAll('.content-section');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSection = button.getAttribute('data-section');
            
            // Убираем активный класс со всех кнопок и секций
            navButtons.forEach(btn => btn.classList.remove('active'));
            contentSections.forEach(section => section.classList.remove('active'));
            
            // Добавляем активный класс к выбранной кнопке и секции
            button.classList.add('active');
            document.getElementById(targetSection).classList.add('active');
        });
    });

    // Инициализация практических заданий
    initPractice();
    
    // Инициализация теста
    initTest();
});

// Практические задания
function initPractice() {
    const calculateBtn = document.getElementById('calculateBtn');
    const resultDisplay = document.getElementById('result');
    
    calculateBtn.addEventListener('click', () => {
        const num1 = parseInt(document.getElementById('num1').value);
        const num2 = parseInt(document.getElementById('num2').value);
        
        if (num1 && num2) {
            const result1 = num1 * num2;
            const result2 = num2 * num1;
            
            document.getElementById('calc1').textContent = `${num1} × ${num2}`;
            document.getElementById('result1').textContent = result1;
            document.getElementById('calc2').textContent = `${num2} × ${num1}`;
            document.getElementById('result2').textContent = result2;
            
            const conclusion = document.getElementById('conclusion');
            if (result1 === result2) {
                conclusion.textContent = `✅ Excellent! ${num1} × ${num2} = ${num2} × ${num1} = ${result1}. The commutative property works!`;
                conclusion.style.background = '#d4edda';
                conclusion.style.color = '#155724';
            } else {
                conclusion.textContent = `❌ Something went wrong. Check your calculations.`;
                conclusion.style.background = '#f8d7da';
                conclusion.style.color = '#721c24';
            }
            
            // Создаем визуальное представление
            createVisualDots(num1, num2, result1);
            
            resultDisplay.style.display = 'block';
        }
    });
}

// Функция для создания визуального представления точек
function createVisualDots(num1, num2, result) {
    const visualTitle1 = document.getElementById('visual-title1');
    const visualTitle2 = document.getElementById('visual-title2');
    const visualDots1 = document.getElementById('visual-dots1');
    const visualDots2 = document.getElementById('visual-dots2');
    
    visualTitle1.textContent = `${num1} × ${num2} = ${result}`;
    visualTitle2.textContent = `${num2} × ${num1} = ${result}`;
    
    // Создаем первый массив (num1 строк по num2 точки)
    let dots1Html = '';
    for (let i = 0; i < num1; i++) {
        dots1Html += '<div class="dot-row">';
        for (let j = 0; j < num2; j++) {
            dots1Html += '<span class="dot">●</span>';
        }
        dots1Html += '</div>';
    }
    visualDots1.innerHTML = dots1Html;
    
    // Создаем второй массив (num2 строк по num1 точки)
    let dots2Html = '';
    for (let i = 0; i < num2; i++) {
        dots2Html += '<div class="dot-row">';
        for (let j = 0; j < num1; j++) {
            dots2Html += '<span class="dot">●</span>';
        }
        dots2Html += '</div>';
    }
    visualDots2.innerHTML = dots2Html;
}

// Функция для вычисления примеров в практическом задании
function calculateExample(button) {
    const container = button.parentElement;
    const inputs = container.querySelectorAll('.ex-num');
    const results = container.querySelectorAll('.ex-result');
    
    const num1 = parseInt(inputs[0].value);
    const num2 = parseInt(inputs[1].value);
    const num3 = parseInt(inputs[2].value);
    const num4 = parseInt(inputs[3].value);
    
    if (num1 && num2 && num3 && num4) {
        const result1 = num1 * num2;
        const result2 = num3 * num4;
        
        results[0].textContent = result1;
        results[1].textContent = result2;
        
        if (result1 === result2) {
            results[0].style.color = '#28a745';
            results[1].style.color = '#28a745';
        } else {
            results[0].style.color = '#dc3545';
            results[1].style.color = '#dc3545';
        }
    }
}

// Тест
let currentQuestionIndex = 0;
let userAnswers = [];
let testQuestions = [];

function initTest() {
    const startTestBtn = document.getElementById('startTestBtn');
    const retakeTestBtn = document.getElementById('retakeTestBtn');
    
    startTestBtn.addEventListener('click', startTest);
    retakeTestBtn.addEventListener('click', startTest);
    
    // Генерация вопросов для теста
    generateTestQuestions();
}

function generateTestQuestions() {
    testQuestions = [
        {
            question: "What does the commutative property of multiplication mean?",
            options: [
                "Changing the order of factors does not change the product",
                "Changing the order of addends does not change the sum",
                "The product is always zero",
                "The product is always one"
            ],
            correct: 0
        },
        {
            question: "Which expression demonstrates the commutative property?",
            options: [
                "3 + 4 = 4 + 3",
                "3 × 4 = 4 × 3",
                "3 - 4 = 4 - 3",
                "3 ÷ 4 = 4 ÷ 3"
            ],
            correct: 1
        },
        {
            question: "What is 7 × 5?",
            options: ["30", "35", "40", "45"],
            correct: 1
        },
        {
            question: "What is 5 × 7?",
            options: ["30", "35", "40", "45"],
            correct: 1
        },
        {
            question: "If a × b = 24, then what is b × a?",
            options: ["12", "24", "48", "Cannot be determined"],
            correct: 1
        },
        {
            question: "What property does the equality 2 × 8 = 8 × 2 demonstrate?",
            options: [
                "Associative property",
                "Commutative property",
                "Distributive property",
                "Identity property"
            ],
            correct: 1
        },
        {
            question: "Choose the correct statement:",
            options: [
                "a × b is always greater than b × a",
                "a × b is always less than b × a",
                "a × b = b × a",
                "a × b ≠ b × a"
            ],
            correct: 2
        },
        {
            question: "If 6 × 4 = 24, then 4 × 6 = ?",
            options: ["20", "24", "28", "30"],
            correct: 1
        },
        {
            question: "What number can be put instead of x in the expression 3 × x = x × 3?",
            options: ["Only 3", "Any number", "Only even numbers", "Only odd numbers"],
            correct: 1
        },
        {
            question: "Why is the commutative property useful in mathematics?",
            options: [
                "It allows simplifying calculations",
                "It makes numbers larger",
                "It changes the result",
                "It has no practical application"
            ],
            correct: 0
        }
    ];
}

function startTest() {
    currentQuestionIndex = 0;
    userAnswers = new Array(testQuestions.length).fill(null);
    
    document.getElementById('test-intro').style.display = 'none';
    document.getElementById('test-results').style.display = 'none';
    document.getElementById('test-questions').style.display = 'block';
    
    showQuestion();
}

function showQuestion() {
    const question = testQuestions[currentQuestionIndex];
    const questionContainer = document.getElementById('question-container');
    const currentQuestionSpan = document.getElementById('currentQuestion');
    const progressFill = document.querySelector('.progress-fill');
    
    currentQuestionSpan.textContent = currentQuestionIndex + 1;
    progressFill.style.width = `${((currentQuestionIndex + 1) / testQuestions.length) * 100}%`;
    
    let optionsHtml = '';
    question.options.forEach((option, index) => {
        const isSelected = userAnswers[currentQuestionIndex] === index;
        optionsHtml += `
            <div class="option ${isSelected ? 'selected' : ''}" onclick="selectOption(${index})">
                <input type="radio" name="question${currentQuestionIndex}" value="${index}" ${isSelected ? 'checked' : ''}>
                <label>${option}</label>
            </div>
        `;
    });
    
    questionContainer.innerHTML = `
        <div class="question-text">${question.question}</div>
        <div class="options">${optionsHtml}</div>
    `;
    
    updateNavigationButtons();
}

function selectOption(optionIndex) {
    userAnswers[currentQuestionIndex] = optionIndex;
    
    // Обновляем визуальное отображение выбора
    const options = document.querySelectorAll('.option');
    options.forEach((option, index) => {
        option.classList.remove('selected');
        if (index === optionIndex) {
            option.classList.add('selected');
        }
    });
    
    updateNavigationButtons();
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const finishBtn = document.getElementById('finishBtn');
    
    prevBtn.style.display = currentQuestionIndex > 0 ? 'block' : 'none';
    
    if (currentQuestionIndex === testQuestions.length - 1) {
        nextBtn.style.display = 'none';
        finishBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        finishBtn.style.display = 'none';
    }
    
    // Проверяем, есть ли ответ на текущий вопрос
    const hasAnswer = userAnswers[currentQuestionIndex] !== null;
    nextBtn.disabled = !hasAnswer;
    finishBtn.disabled = !hasAnswer;
}

// Обработчики навигации по тесту
document.addEventListener('DOMContentLoaded', function() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const finishBtn = document.getElementById('finishBtn');
    
    prevBtn.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            showQuestion();
        }
    });
    
    nextBtn.addEventListener('click', () => {
        if (userAnswers[currentQuestionIndex] !== null && currentQuestionIndex < testQuestions.length - 1) {
            currentQuestionIndex++;
            showQuestion();
        }
    });
    
    finishBtn.addEventListener('click', () => {
        if (userAnswers[currentQuestionIndex] !== null) {
            showResults();
        }
    });
});

function showResults() {
    const testQuestionsDiv = document.getElementById('test-questions');
    const testResultsDiv = document.getElementById('test-results');
    
    testQuestionsDiv.style.display = 'none';
    testResultsDiv.style.display = 'block';
    
    // Подсчет правильных ответов
    let correctAnswers = 0;
    const detailedResults = document.getElementById('detailed-results');
    let detailedHtml = '<h5>Detailed results:</h5>';
    
    userAnswers.forEach((answer, index) => {
        const question = testQuestions[index];
        const isCorrect = answer === question.correct;
        
        if (isCorrect) {
            correctAnswers++;
        }
        
        detailedHtml += `
            <div class="question-result ${isCorrect ? 'correct' : 'incorrect'}">
                <h5>Question ${index + 1}: ${question.question}</h5>
                <p>Your answer: ${question.options[answer]}</p>
                <p>Correct answer: ${question.options[question.correct]}</p>
                <p>${isCorrect ? '✅ Correct!' : '❌ Incorrect'}</p>
            </div>
        `;
    });
    
    const percentage = Math.round((correctAnswers / testQuestions.length) * 100);
    
    document.getElementById('score-percentage').textContent = `${percentage}%`;
    document.getElementById('correct-answers').textContent = correctAnswers;
    detailedResults.innerHTML = detailedHtml;
    
    // Анимация появления результатов
    setTimeout(() => {
        document.querySelector('.score-circle').style.transform = 'scale(1.1)';
        setTimeout(() => {
            document.querySelector('.score-circle').style.transform = 'scale(1)';
        }, 200);
    }, 100);
}

// Дополнительные функции для улучшения UX
function addConfetti() {
    // Простая анимация конфетти для правильных ответов
    const colors = ['#667eea', '#764ba2', '#28a745', '#ffc107', '#dc3545'];
    
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
}

// Добавляем CSS анимацию для конфетти
const style = document.createElement('style');
style.textContent = `
    @keyframes fall {
        to {
            transform: translateY(100vh) rotate(360deg);
        }
    }
`;
document.head.appendChild(style);

// Вызываем конфетти при отличном результате
function checkForExcellentResult(percentage) {
    if (percentage >= 90) {
        addConfetti();
    }
} 