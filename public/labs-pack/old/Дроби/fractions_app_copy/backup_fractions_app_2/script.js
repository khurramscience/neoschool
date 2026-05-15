// Массив заданий
const exercises = [
    // Графические вопросы
    {
        type: "graphic",
        question: "Выберите фигуру, закрашенную на 1/2:",
        options: [
            { value: "1/2", svg: `<svg width='60' height='60'><rect x='5' y='5' width='50' height='50' fill='#eee' stroke='#333'/><rect x='5' y='5' width='25' height='50' fill='#1a73e8'/></svg>` },
            { value: "1/3", svg: `<svg width='60' height='60'><rect x='5' y='5' width='50' height='50' fill='#eee' stroke='#333'/><rect x='5' y='5' width='16.6' height='50' fill='#1a73e8'/></svg>` },
            { value: "3/4", svg: `<svg width='60' height='60'><rect x='5' y='5' width='50' height='50' fill='#eee' stroke='#333'/><rect x='5' y='5' width='37.5' height='50' fill='#1a73e8'/></svg>` },
            { value: "2/3", svg: `<svg width='60' height='60'><rect x='5' y='5' width='50' height='50' fill='#eee' stroke='#333'/><rect x='5' y='5' width='33.3' height='50' fill='#1a73e8'/></svg>` }
        ],
        answer: "1/2"
    },
    {
        type: "graphic",
        question: "Выберите фигуру, закрашенную на 3/4:",
        options: [
            { value: "1/2", svg: `<svg width='60' height='60'><rect x='5' y='5' width='50' height='50' fill='#eee' stroke='#333'/><rect x='5' y='5' width='25' height='50' fill='#1a73e8'/></svg>` },
            { value: "3/4", svg: `<svg width='60' height='60'><rect x='5' y='5' width='50' height='50' fill='#eee' stroke='#333'/><rect x='5' y='5' width='37.5' height='50' fill='#1a73e8'/></svg>` },
            { value: "1/3", svg: `<svg width='60' height='60'><rect x='5' y='5' width='50' height='50' fill='#eee' stroke='#333'/><rect x='5' y='5' width='16.6' height='50' fill='#1a73e8'/></svg>` },
            { value: "2/3", svg: `<svg width='60' height='60'><rect x='5' y='5' width='50' height='50' fill='#eee' stroke='#333'/><rect x='5' y='5' width='33.3' height='50' fill='#1a73e8'/></svg>` }
        ],
        answer: "3/4"
    },
    {
        type: "graphic",
        question: "Выберите фигуру, закрашенную на 2/3:",
        options: [
            { value: "1/2", svg: `<svg width='60' height='60'><rect x='5' y='5' width='50' height='50' fill='#eee' stroke='#333'/><rect x='5' y='5' width='25' height='50' fill='#1a73e8'/></svg>` },
            { value: "1/3", svg: `<svg width='60' height='60'><rect x='5' y='5' width='50' height='50' fill='#eee' stroke='#333'/><rect x='5' y='5' width='16.6' height='50' fill='#1a73e8'/></svg>` },
            { value: "2/3", svg: `<svg width='60' height='60'><rect x='5' y='5' width='50' height='50' fill='#eee' stroke='#333'/><rect x='5' y='5' width='33.3' height='50' fill='#1a73e8'/></svg>` },
            { value: "3/4", svg: `<svg width='60' height='60'><rect x='5' y='5' width='50' height='50' fill='#eee' stroke='#333'/><rect x='5' y='5' width='37.5' height='50' fill='#1a73e8'/></svg>` }
        ],
        answer: "2/3"
    },
    // Новые текстовые вопросы
    {
        question: "Представьте дробь 2/5 в виде десятичной дроби",
        answer: "0.4",
        hint: "Разделите числитель на знаменатель"
    },
    {
        question: "Сократите дробь 4/12",
        answer: "1/3",
        hint: "Найдите наибольший общий делитель числителя и знаменателя"
    },
    {
        question: "Сложите дроби: 1/3 + 1/6",
        answer: "1/2",
        hint: "Приведите дроби к общему знаменателю"
    },
    {
        question: "Вычтите дроби: 5/6 - 1/3",
        answer: "1/2",
        hint: "Приведите дроби к общему знаменателю перед вычитанием"
    },
    {
        question: "Умножьте дроби: 2/3 × 3/4",
        answer: "1/2",
        hint: "Перемножьте числители и знаменатели, затем сократите"
    },
    {
        question: "Разделите дроби: 3/4 ÷ 1/2",
        answer: "3/2",
        hint: "Умножьте первую дробь на перевернутую вторую"
    },
    {
        question: "Представьте 0.25 в виде обыкновенной дроби",
        answer: "1/4",
        hint: "0.25 = 25/100, сократите дробь"
    },
    // Существующие текстовые вопросы
    {
        question: "Представьте дробь 3/4 в виде десятичной дроби",
        answer: "0.75",
        hint: "Разделите числитель на знаменатель"
    },
    {
        question: "Сократите дробь 6/8",
        answer: "3/4",
        hint: "Найдите наибольший общий делитель числителя и знаменателя"
    },
    {
        question: "Сложите дроби: 1/4 + 1/2",
        answer: "3/4",
        hint: "Приведите дроби к общему знаменателю"
    },
    {
        question: "Вычтите дроби: 3/4 - 1/4",
        answer: "1/2",
        hint: "При одинаковых знаменателях вычитаем только числители"
    },
    {
        question: "Умножьте дроби: 1/2 × 1/2",
        answer: "1/4",
        hint: "Перемножьте числители и знаменатели"
    },
    {
        question: "Разделите дроби: 1/2 ÷ 1/4",
        answer: "2",
        hint: "Умножьте первую дробь на перевернутую вторую"
    },
    {
        question: "Представьте 0.5 в виде обыкновенной дроби",
        answer: "1/2",
        hint: "0.5 = 5/10, сократите дробь"
    }
];

// Массив сообщений поддержки
const supportMessages = {
    correct: [
        "Отлично! Ты правильно решил задачу!",
        "Превосходно! Ты хорошо разбираешься в дробях!",
        "Молодец! Продолжай в том же духе!"
    ],
    incorrect: [
        "Не переживай, давай попробуем еще раз!",
        "Подумай внимательнее, ты почти у цели!",
        "Давай разберем это вместе!"
    ],
    hints: [
        "Помни, что при сложении дробей нужно привести их к общему знаменателю",
        "Не забудь сократить дробь, если это возможно",
        "При делении дробей не забудь перевернуть вторую дробь"
    ]
};

let currentExerciseIndex = 0;

// Массив подсказок для разных типов ошибок
const errorHints = {
    decimal: {
        pattern: /^\d+\.\d+$/,
        message: "Попробуйте представить ответ в виде обыкновенной дроби"
    },
    fraction: {
        pattern: /^\d+\/\d+$/,
        message: "Попробуйте представить ответ в виде десятичной дроби"
    },
    tooBig: {
        check: (answer) => parseFloat(answer) > 1,
        message: "Проверьте, не получилось ли у вас число больше 1"
    },
    tooSmall: {
        check: (answer) => parseFloat(answer) < 0,
        message: "Проверьте, не получилось ли у вас отрицательное число"
    }
};

// Объект для хранения статистики
const statistics = {
    totalAnswers: 0,
    correctAnswers: 0,
    exerciseStats: {},
    startTime: null
};

// Функция для отображения текущего задания
function showExercise() {
    const exerciseElement = document.getElementById('exercise');
    const textAnswerInput = document.getElementById('text-answer-input');
    const current = exercises[currentExerciseIndex];
    
    exerciseElement.innerHTML = '';
    
    if (current.type === 'graphic') {
        // Графический вопрос
        textAnswerInput.style.display = 'none'; // Скрываем поле ввода для текстовых ответов
        
        const q = document.createElement('div');
        q.textContent = current.question;
        q.className = 'graphic-question';
        exerciseElement.appendChild(q);
        
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'graphic-options';
        
        current.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'graphic-option-btn';
            btn.innerHTML = opt.svg;
            btn.onclick = () => checkGraphicAnswer(opt.value);
            optionsDiv.appendChild(btn);
        });
        
        exerciseElement.appendChild(optionsDiv);
    } else {
        // Текстовый вопрос
        textAnswerInput.style.display = 'flex'; // Показываем поле ввода для текстовых ответов
        exerciseElement.textContent = current.question;
        addTeacherMessage("Давай решим это задание! " + current.hint);
    }
}

// Функция для добавления сообщения учителя
function addTeacherMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message teacher-message';
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Функция для добавления сообщения ученика
function addStudentMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message student-message';
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Функция для анализа неправильного ответа
function analyzeWrongAnswer(userAnswer, correctAnswer) {
    // Проверяем формат ответа
    if (errorHints.decimal.pattern.test(userAnswer) && !errorHints.decimal.pattern.test(correctAnswer)) {
        return errorHints.decimal.message;
    }
    if (errorHints.fraction.pattern.test(userAnswer) && !errorHints.fraction.pattern.test(correctAnswer)) {
        return errorHints.fraction.message;
    }

    // Проверяем значение
    const numericAnswer = parseFloat(userAnswer);
    if (!isNaN(numericAnswer)) {
        if (errorHints.tooBig.check(userAnswer)) {
            return errorHints.tooBig.message;
        }
        if (errorHints.tooSmall.check(userAnswer)) {
            return errorHints.tooSmall.message;
        }
    }

    // Если не подошли другие проверки, возвращаем общую подсказку
    return exercises[currentExerciseIndex].hint;
}

// Функция для преобразования обыкновенной дроби в десятичную
function fractionToDecimal(fraction) {
    const [numerator, denominator] = fraction.split('/').map(Number);
    if (denominator === 0) return null;
    return numerator / denominator;
}

// Функция для преобразования десятичной дроби в обыкновенную
function decimalToFraction(decimal) {
    const tolerance = 0.0001;
    let numerator = 1;
    let denominator = 1;
    
    while (Math.abs(numerator / denominator - decimal) > tolerance) {
        if (numerator / denominator < decimal) {
            numerator++;
        } else {
            denominator++;
        }
    }
    
    return `${numerator}/${denominator}`;
}

// Функция для нормализации ответа
function normalizeAnswer(answer) {
    // Убираем пробелы и приводим к нижнему регистру
    answer = answer.toLowerCase().replace(/\s+/g, '');
    
    // Если это обыкновенная дробь
    if (answer.includes('/')) {
        const decimal = fractionToDecimal(answer);
        return decimal !== null ? decimal.toString() : answer;
    }
    
    // Если это десятичная дробь
    if (answer.includes('.')) {
        const fraction = decimalToFraction(parseFloat(answer));
        return fraction;
    }
    
    return answer;
}

// Функция для обновления статистики
function updateStatistics(isCorrect) {
    statistics.totalAnswers++;
    if (isCorrect) {
        statistics.correctAnswers++;
    }
    
    // Обновляем статистику по конкретному заданию
    const currentExercise = exercises[currentExerciseIndex];
    if (!statistics.exerciseStats[currentExercise.question]) {
        statistics.exerciseStats[currentExercise.question] = {
            attempts: 0,
            correct: 0
        };
    }
    statistics.exerciseStats[currentExercise.question].attempts++;
    if (isCorrect) {
        statistics.exerciseStats[currentExercise.question].correct++;
    }
}

// Функция для отображения итоговых результатов
function showFinalResults() {
    const timeSpent = Math.round((Date.now() - statistics.startTime) / 1000);
    const minutes = Math.floor(timeSpent / 60);
    const seconds = timeSpent % 60;
    
    let resultsHTML = `
        <h3>Итоговые результаты:</h3>
        <p>Всего ответов: ${statistics.totalAnswers}</p>
        <p>Правильных ответов: ${statistics.correctAnswers}</p>
        <p>Процент правильных: ${Math.round((statistics.correctAnswers / statistics.totalAnswers) * 100)}%</p>
        <p>Время решения: ${minutes} мин. ${seconds} сек.</p>
        
        <h3>Статистика по заданиям:</h3>
    `;
    
    for (const [question, stats] of Object.entries(statistics.exerciseStats)) {
        const successRate = Math.round((stats.correct / stats.attempts) * 100);
        resultsHTML += `
            <div class="exercise-stat">
                <p><strong>Задание:</strong> ${question}</p>
                <p>Попыток: ${stats.attempts}</p>
                <p>Правильно: ${stats.correct}</p>
                <p>Успешность: ${successRate}%</p>
            </div>
        `;
    }
    
    document.getElementById('final-results').innerHTML = resultsHTML;
}

// Функция для запуска конфетти
function launchConfetti() {
    // Запускаем конфетти слева
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: 0, y: 0.6 }
    });

    // Запускаем конфетти справа
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: 1, y: 0.6 }
    });

    // Запускаем конфетти сверху
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: 0.5, y: 0 }
    });

    // Повторяем запуск конфетти несколько раз
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Запускаем конфетти с разных сторон
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
    }, 250);
}

// Функция для завершения теста
function finishTest() {
    // Отключаем возможность ввода ответов
    document.getElementById('answer').disabled = true;
    document.getElementById('check-answer').disabled = true;
    
    // Скрываем контейнер с заданиями
    document.querySelector('.exercise-container').style.display = 'none';
    
    // Показываем экран завершения
    document.getElementById('test-complete').style.display = 'block';
    
    // Показываем итоговые результаты
    showFinalResults();
    
    // Запускаем конфетти
    launchConfetti();
    
    // Добавляем сообщение в чат
    addTeacherMessage("Тест завершен! Вы можете пройти его еще раз, нажав на кнопку 'Пройти еще раз'.");
}

// Функция для перезапуска теста
function restartTest() {
    // Сбрасываем статистику
    statistics.totalAnswers = 0;
    statistics.correctAnswers = 0;
    statistics.exerciseStats = {};
    statistics.startTime = Date.now();
    
    // Сбрасываем индекс текущего задания
    currentExerciseIndex = 0;
    
    // Очищаем чат
    document.getElementById('chat-messages').innerHTML = '';
    
    // Включаем возможность ввода ответов
    document.getElementById('answer').disabled = false;
    document.getElementById('check-answer').disabled = false;
    
    // Показываем контейнер с заданиями и скрываем результаты
    document.querySelector('.exercise-container').style.display = 'block';
    document.getElementById('test-complete').style.display = 'none';
    
    // Показываем первое задание
    showExercise();
    
    // Добавляем приветственное сообщение
    addTeacherMessage("Давайте начнем тест заново! Я уверен, что в этот раз у вас получится еще лучше!");
}

// Функция для отображения промежуточной статистики
function showStatistics() {
    const timeSpent = Math.round((Date.now() - statistics.startTime) / 1000);
    const minutes = Math.floor(timeSpent / 60);
    const seconds = timeSpent % 60;
    
    let statsMessage = `
        📊 Статистика за последние 5 ответов:
        Всего ответов: ${statistics.totalAnswers}
        Правильных ответов: ${statistics.correctAnswers}
        Процент правильных: ${Math.round((statistics.correctAnswers / statistics.totalAnswers) * 100)}%
        Время решения: ${minutes} мин. ${seconds} сек.
        
        📝 Статистика по заданиям:
    `;
    
    for (const [question, stats] of Object.entries(statistics.exerciseStats)) {
        const successRate = Math.round((stats.correct / stats.attempts) * 100);
        statsMessage += `
        Задание: ${question}
        Попыток: ${stats.attempts}
        Правильно: ${stats.correct}
        Успешность: ${successRate}%
        `;
    }
    
    // Показываем статистику в чате
    addTeacherMessage(statsMessage);
}

// Функция для анимации робота при правильном ответе
function animateRobotCorrect() {
    const robotContainer = document.querySelector('.chat-container');
    robotContainer.classList.add('robot-correct');
    setTimeout(() => {
        robotContainer.classList.remove('robot-correct');
    }, 2000);
}

// Функция для анимации робота при неправильном ответе
function animateRobotIncorrect() {
    const robotContainer = document.querySelector('.chat-container');
    robotContainer.classList.add('robot-incorrect');
    setTimeout(() => {
        robotContainer.classList.remove('robot-incorrect');
    }, 2000);
}

// Функция для проверки ответа
function checkAnswer() {
    if (statistics.totalAnswers >= 12) {
        return;
    }

    const answerInput = document.getElementById('answer');
    const userAnswer = answerInput.value.trim();
    const correctAnswer = exercises[currentExerciseIndex].answer;
    const exerciseElement = document.getElementById('exercise');

    const normalizedUserAnswer = normalizeAnswer(userAnswer);
    const normalizedCorrectAnswer = normalizeAnswer(correctAnswer);

    const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer || 
                     Math.abs(parseFloat(normalizedUserAnswer) - parseFloat(normalizedCorrectAnswer)) < 0.0001;

    updateStatistics(isCorrect);

    if (isCorrect) {
        exerciseElement.style.backgroundColor = '#e8f5e9';
        addTeacherMessage(supportMessages.correct[Math.floor(Math.random() * supportMessages.correct.length)]);
        animateRobotCorrect();
        
        if (statistics.totalAnswers >= 12) {
            setTimeout(finishTest, 1500);
            return;
        }
        
        currentExerciseIndex = (currentExerciseIndex + 1) % exercises.length;
        setTimeout(() => {
            exerciseElement.style.backgroundColor = '#f8f9fa';
            showExercise();
        }, 1500);
    } else {
        exerciseElement.style.backgroundColor = '#ffebee';
        const specificHint = analyzeWrongAnswer(userAnswer, correctAnswer);
        addTeacherMessage(supportMessages.incorrect[Math.floor(Math.random() * supportMessages.incorrect.length)]);
        animateRobotIncorrect();
        setTimeout(() => {
            addTeacherMessage("Подсказка: " + specificHint);
        }, 1000);
        setTimeout(() => {
            exerciseElement.style.backgroundColor = '#f8f9fa';
        }, 1500);
    }
    answerInput.value = '';
}

// Функция для проверки графического ответа
function checkGraphicAnswer(selectedValue) {
    const current = exercises[currentExerciseIndex];
    const isCorrect = selectedValue === current.answer;
    updateStatistics(isCorrect);
    const exerciseElement = document.getElementById('exercise');
    if (isCorrect) {
        exerciseElement.style.backgroundColor = '#e8f5e9';
        addTeacherMessage(supportMessages.correct[Math.floor(Math.random() * supportMessages.correct.length)]);
        animateRobotCorrect();
        
        if (statistics.totalAnswers >= 12) {
            setTimeout(finishTest, 1500);
            return;
        }
        currentExerciseIndex = (currentExerciseIndex + 1) % exercises.length;
        setTimeout(() => {
            exerciseElement.style.backgroundColor = '#f8f9fa';
            showExercise();
        }, 1500);
    } else {
        exerciseElement.style.backgroundColor = '#ffebee';
        addTeacherMessage(supportMessages.incorrect[Math.floor(Math.random() * supportMessages.incorrect.length)]);
        animateRobotIncorrect();
        setTimeout(() => {
            exerciseElement.style.backgroundColor = '#f8f9fa';
        }, 1500);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем время начала
    statistics.startTime = Date.now();
    showExercise();
    
    // Обработчик кнопки проверки ответа
    document.getElementById('check-answer').addEventListener('click', checkAnswer);
    
    // Обработчик ввода ответа по Enter
    document.getElementById('answer').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });

    // Обработчик отправки сообщения в чат
    document.getElementById('send-message').addEventListener('click', () => {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();
        if (message) {
            addStudentMessage(message);
            chatInput.value = '';
            // Имитация ответа учителя
            setTimeout(() => {
                addTeacherMessage(supportMessages.hints[Math.floor(Math.random() * supportMessages.hints.length)]);
            }, 1000);
        }
    });

    // Обработчик отправки сообщения по Enter
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('send-message').click();
        }
    });

    // Обработчик кнопки перезапуска теста
    document.getElementById('restart-test').addEventListener('click', restartTest);
}); 