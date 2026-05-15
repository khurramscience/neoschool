// Египетские иероглифы и их значения (пути к PNG)
const hieroglyphs = {
    1: 'img/1_.png',
    10: 'img/10_.png',
    100: 'img/100_.png',
    1000: 'img/1000_.png',
    10000: 'img/10000_.png',
    100000: 'img/100000_.png',
    1000000: 'img/1000000_.png'
};

// Генерация HTML для египетского числа с PNG-картинками
function egyptianNumberToHTML(number) {
    if (number <= 0 || number > 9999999) return '';
    let html = '';
    const values = [1000000, 100000, 10000, 1000, 100, 10, 1];
    for (let value of values) {
        if (number >= value) {
            const count = Math.floor(number / value);
            for (let i = 0; i < count; i++) {
                html += `<img src="${hieroglyphs[value]}" alt="${value}" class="egyptian-img" />`;
            }
            number %= value;
        }
    }
    return html;
}

// Навигация между разделами
document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.content-section');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSection = button.getAttribute('data-section');
            
            // Убираем активный класс со всех кнопок и секций
            navButtons.forEach(btn => btn.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Добавляем активный класс к выбранной кнопке и секции
            button.classList.add('active');
            document.getElementById(targetSection).classList.add('active');
        });
    });

    // Инициализация всех функций
    initConverter();
    initPractice();
    initQuiz();

    const exampleEgyptian = document.getElementById('example-egyptian');
    if (exampleEgyptian) {
        exampleEgyptian.innerHTML = egyptianNumberToHTML(3247);
    }
});

// Функция конвертации арабского числа в египетское (текстовая строка для обратной совместимости)
function convertToEgyptian(number) {
    if (number <= 0 || number > 9999999) {
        return { hieroglyphs: '', explanation: 'Число должно быть от 1 до 9,999,999', html: '' };
    }
    let result = '';
    let explanation = '';
    let html = '';
    const values = [1000000, 100000, 10000, 1000, 100, 10, 1];
    const symbols = {
        1: '|',
        10: '∩',
        100: '⊂',
        1000: '⊃',
        10000: '⊄',
        100000: '⊅',
        1000000: '⊆'
    };
    for (let value of values) {
        if (number >= value) {
            const count = Math.floor(number / value);
            result += symbols[value].repeat(count);
            if (explanation) explanation += ' + ';
            explanation += `${count} × ${value}`;
            for (let i = 0; i < count; i++) {
                html += `<img src="${hieroglyphs[value]}" alt="${value}" class="egyptian-img" />`;
            }
            number %= value;
        }
    }
    return { hieroglyphs: result, explanation: explanation, html: html };
}

// Функция конвертации египетского числа в арабское
function convertFromEgyptian(egyptianString) {
    let result = 0;
    const symbolToValue = {
        '|': 1,
        '∩': 10,
        '⊂': 100,
        '⊃': 1000,
        '⊄': 10000,
        '⊅': 100000,
        '⊆': 1000000
    };
    for (let char of egyptianString) {
        if (symbolToValue[char]) {
            result += symbolToValue[char];
        }
    }
    return result;
}

// Инициализация конвертера
function initConverter() {
    const convertBtn = document.getElementById('convert-btn');
    const arabicInput = document.getElementById('arabic-input');
    const egyptianResult = document.getElementById('egyptian-result');
    const explanationResult = document.getElementById('explanation-result');
    const exampleItems = document.querySelectorAll('.example-item');

    convertBtn.addEventListener('click', () => {
        const number = parseInt(arabicInput.value);
        if (number && number > 0 && number <= 9999999) {
            const result = convertToEgyptian(number);
            egyptianResult.innerHTML = result.html;
            explanationResult.textContent = result.explanation;
        } else {
            egyptianResult.textContent = 'Введите корректное число';
            explanationResult.textContent = '';
        }
    });

    // Примеры для быстрого конвертирования
    exampleItems.forEach(item => {
        item.addEventListener('click', () => {
            const number = parseInt(item.getAttribute('data-number'));
            arabicInput.value = number;
            const result = convertToEgyptian(number);
            egyptianResult.innerHTML = result.html;
            explanationResult.textContent = result.explanation;
        });
    });

    // Конвертация по Enter
    arabicInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            convertBtn.click();
        }
    });
}

// Инициализация практических заданий
function initPractice() {
    let currentTaskNumber = 0;
    let currentEgyptianTask = '';
    let builderSum = 0;
    let builderHieroglyphs = [];

    // Генерация случайного числа для задания
    function generateTaskNumber() {
        return Math.floor(Math.random() * 9999) + 1;
    }

    // Генерация случайного египетского числа для задания
    function generateEgyptianTask() {
        const number = Math.floor(Math.random() * 999) + 1;
        return convertToEgyptian(number).hieroglyphs;
    }

    // Обновление задания 1
    function updateTask1() {
        currentTaskNumber = generateTaskNumber();
        document.getElementById('task-number').textContent = currentTaskNumber;
        clearBuilder();
    }

    // Обновление задания 2
    function updateTask2() {
        currentEgyptianTask = generateEgyptianTask();
        document.getElementById('egyptian-task-display').innerHTML = egyptianNumberToHTMLFromSymbols(currentEgyptianTask);
        document.getElementById('answer-input').value = '';
        document.getElementById('answer-feedback').textContent = '';
        document.getElementById('answer-feedback').className = 'feedback';
    }

    // Очистка строителя иероглифов
    function clearBuilder() {
        builderSum = 0;
        builderHieroglyphs = [];
        document.getElementById('builder-result').textContent = '';
        document.getElementById('builder-sum').textContent = '0';
        document.getElementById('task-feedback').textContent = '';
        document.getElementById('task-feedback').className = 'feedback';
    }

    // Обработчики кнопок строителя
    const hieroglyphButtons = document.querySelectorAll('.hieroglyph-btn');
    hieroglyphButtons.forEach(button => {
        button.addEventListener('click', () => {
            const value = parseInt(button.getAttribute('data-value'));
            builderSum += value;
            builderHieroglyphs.push(value);
            
            document.getElementById('builder-result').innerHTML = builderHieroglyphs.map(v => `<img src='${hieroglyphs[v]}' alt='${v}' class='egyptian-img' />`).join('');
            document.getElementById('builder-sum').textContent = builderSum;
        });
    });

    // Кнопка очистки
    document.getElementById('clear-btn').addEventListener('click', clearBuilder);

    // Кнопка проверки задания 1
    document.getElementById('check-btn').addEventListener('click', () => {
        const feedback = document.getElementById('task-feedback');
        if (builderSum === currentTaskNumber) {
            feedback.textContent = '✅ Correct! Great job!';
            feedback.className = 'feedback correct';
            setTimeout(() => {
                updateTask1();
            }, 2000);
        } else {
            feedback.textContent = `❌ Incorrect. You got ${builderSum}, but the correct answer is ${currentTaskNumber}`;
            feedback.className = 'feedback incorrect';
        }
    });

    // Кнопка проверки задания 2
    document.getElementById('check-answer-btn').addEventListener('click', () => {
        const userAnswer = parseInt(document.getElementById('answer-input').value);
        const correctAnswer = convertFromEgyptian(currentEgyptianTask);
        const feedback = document.getElementById('answer-feedback');
        
        if (userAnswer === correctAnswer) {
            feedback.textContent = '✅ Correct! Great job!';
            feedback.className = 'feedback correct';
            setTimeout(() => {
                updateTask2();
            }, 2000);
        } else {
            feedback.textContent = `❌ Incorrect. The correct answer is: ${correctAnswer}`;
            feedback.className = 'feedback incorrect';
        }
    });

    // Инициализация заданий
    updateTask1();
    updateTask2();
}

// Инициализация теста
function initQuiz() {
    const questions = [
        {
            question: "Which hieroglyph represents the number 100?",
            options: ["|", "∩", "⊂", "⊃"],
            correct: 2
        },
        {
            question: "How do you write the number 25 in the Egyptian system?",
            options: ["∩∩|||||", "∩∩|∩∩∩∩∩", "∩∩|∩∩∩", "∩∩|∩∩∩∩∩"],
            correct: 0
        },
        {
            question: "What is the result of 2 × 1000 + 3 × 100 + 4 × 10 + 5 × 1?",
            options: ["2345", "2435", "2354", "2453"],
            correct: 0
        },
        {
            question: "Which hieroglyph represents the largest number?",
            options: ["|", "∩", "⊂", "⊆"],
            correct: 3
        },
        {
            question: "How do you write the number 1000 in the Egyptian system?",
            options: ["⊃", "|||", "∩∩∩", "⊂⊂"],
            correct: 0
        }
    ];

    let currentQuestion = 0;
    let score = 0;
    let selectedAnswer = null;

    const questionText = document.getElementById('question-text');
    const quizOptions = document.getElementById('quiz-options');
    const nextBtn = document.getElementById('next-question-btn');
    const questionNumber = document.getElementById('question-number');
    const totalQuestions = document.getElementById('total-questions');
    const quizQuestion = document.getElementById('quiz-question');
    const quizResults = document.getElementById('quiz-results');

    totalQuestions.textContent = questions.length;

    function showQuestion() {
        const question = questions[currentQuestion];
        questionNumber.textContent = currentQuestion + 1;
        questionText.textContent = question.question;
        
        quizOptions.innerHTML = '';
        question.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'quiz-option';
            // Если вопрос про иероглиф или запись числа (на английском или русском)
            if (
                question.question.toLowerCase().includes('hieroglyph') ||
                question.question.toLowerCase().includes('write the number') ||
                question.question.toLowerCase().includes('обозначает число') ||
                question.question.toLowerCase().includes('записать число')
            ) {
                // Маппинг символов на PNG
                const symbolToPng = {
                    '|': 'img/1_.png',
                    '∩': 'img/10_.png',
                    '⊂': 'img/100_.png',
                    '⊃': 'img/1000_.png',
                    '⊄': 'img/10000_.png',
                    '⊅': 'img/100000_.png',
                    '⊆': 'img/1000000_.png'
                };
                // Если вариант состоит только из этих символов, рендерим соответствующее количество PNG
                if (/^[|∩⊂⊃⊄⊅⊆]+$/.test(option)) {
                    let html = '';
                    for (let char of option) {
                        if (symbolToPng[char]) {
                            html += `<img src="${symbolToPng[char]}" alt="${char}" class="egyptian-img" />`;
                        }
                    }
                    optionDiv.innerHTML = html;
                } else {
                    // Одиночный символ
                    let imgSrc = symbolToPng[option] || '';
                    if (imgSrc) {
                        optionDiv.innerHTML = `<img src="${imgSrc}" alt="${option}" class="egyptian-img" />`;
                    } else {
                        optionDiv.textContent = option;
                    }
                }
            } else {
                optionDiv.textContent = option;
            }
            optionDiv.addEventListener('click', () => selectOption(index, optionDiv));
            quizOptions.appendChild(optionDiv);
        });

        selectedAnswer = null;
        nextBtn.style.display = 'none';
    }

    function selectOption(index, optionDiv) {
        // Убираем выделение со всех опций
        document.querySelectorAll('.quiz-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Выделяем выбранную опцию
        optionDiv.classList.add('selected');
        selectedAnswer = index;
        nextBtn.style.display = 'inline-block';
    }

    function checkAnswer() {
        if (selectedAnswer === null) return;

        const question = questions[currentQuestion];
        const options = document.querySelectorAll('.quiz-option');
        
        options.forEach((option, index) => {
            if (index === question.correct) {
                option.classList.add('correct');
            } else if (index === selectedAnswer) {
                option.classList.add('incorrect');
            }
        });

        if (selectedAnswer === question.correct) {
            score++;
        }

        nextBtn.textContent = currentQuestion < questions.length - 1 ? 'Next question' : 'Show results';
    }

    function showResults() {
        quizQuestion.style.display = 'none';
        quizResults.classList.remove('hidden');
        
        document.getElementById('correct-answers').textContent = score;
        document.getElementById('total-answers').textContent = questions.length;
        
        const percentage = Math.round((score / questions.length) * 100);
        document.getElementById('percentage').textContent = percentage + '%';
        document.getElementById('progress-fill').style.width = percentage + '%';
    }

    function restartQuiz() {
        currentQuestion = 0;
        score = 0;
        selectedAnswer = null;
        
        quizQuestion.style.display = 'block';
        quizResults.classList.add('hidden');
        
        showQuestion();
    }

    nextBtn.addEventListener('click', () => {
        if (selectedAnswer === null) return;
        
        checkAnswer();
        
        if (currentQuestion < questions.length - 1) {
            currentQuestion++;
            setTimeout(showQuestion, 1500);
        } else {
            setTimeout(showResults, 1500);
        }
    });

    document.getElementById('restart-quiz-btn').addEventListener('click', restartQuiz);

    // Начинаем тест
    showQuestion();
}

// Дополнительные функции для улучшения UX
function addConfetti() {
    // Простая анимация конфетти для правильных ответов
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
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
                confetti.remove();
            }, 3000);
        }, i * 100);
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

// Функция для показа правильного ответа с конфетти
function showCorrectAnswer() {
    addConfetti();
}

// Функция для отображения египетского числа по строке-символам (например, '|||∩∩')
function egyptianNumberToHTMLFromSymbols(symbols) {
    const symbolToPng = {
        '|': 'img/1_.png',
        '∩': 'img/10_.png',
        '⊂': 'img/100_.png',
        '⊃': 'img/1000_.png',
        '⊄': 'img/10000_.png',
        '⊅': 'img/100000_.png',
        '⊆': 'img/1000000_.png'
    };
    let html = '';
    for (let char of symbols) {
        if (symbolToPng[char]) {
            html += `<img src='${symbolToPng[char]}' alt='${char}' class='egyptian-img' />`;
        }
    }
    return html;
}

// Экспортируем функции для использования в других частях приложения
window.egyptianConverter = {
    convertToEgyptian,
    convertFromEgyptian,
    showCorrectAnswer
}; 