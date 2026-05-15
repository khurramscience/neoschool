// Данные задач
const tasks = {
    1: {
        title: "🚴 Велосипедная прогулка",
        story: "Вы с 11 друзьями на велосипедах хотите переехать через мост. По мосту можно проехать троим за раз. На сколько групп нужно разделиться, чтобы переехать мост всем?",
        question: "Сколько групп получится?",
        dividend: 12, // вы + 11 друзей
        divisor: 3,
        answer: 4
    },
    2: {
        title: "🍕 Пицца для друзей",
        story: "У вас есть 1 большая пицца, которую нужно разделить между 8 друзьями поровну. Каждый должен получить одинаковое количество кусочков.",
        question: "На сколько кусочков нужно разрезать пиццу?",
        dividend: 8,
        divisor: 1,
        answer: 8
    },
    3: {
        title: "📚 Библиотека",
        story: "В библиотеке есть 24 книги, которые нужно расставить на 6 полках поровну. Сколько книг будет на каждой полке?",
        question: "Сколько книг поместится на одной полке?",
        dividend: 24,
        divisor: 6,
        answer: 4
    },
    4: {
        title: "🎨 Художественная мастерская",
        story: "У вас есть 18 баночек с красками, которые нужно разделить между 3 группами художников поровну. Сколько баночек получит каждая группа?",
        question: "Сколько баночек с красками получит каждая группа?",
        dividend: 18,
        divisor: 3,
        answer: 6
    },
    5: {
        title: "🏀 Спортивная площадка",
        story: "На спортивной площадке 15 учеников хотят играть в баскетбол. В каждой команде должно быть по 5 игроков. Сколько команд получится?",
        question: "Сколько команд можно составить?",
        dividend: 15,
        divisor: 5,
        answer: 3
    },
    6: {
        title: "🌱 Садоводство",
        story: "У вас есть 20 семян цветов, которые нужно посадить в 4 клумбы поровну. Сколько семян нужно посадить в каждую клумбу?",
        question: "Сколько семян посадить в одну клумбу?",
        dividend: 20,
        divisor: 4,
        answer: 5
    },
    7: {
        title: "🎪 Цирковое представление",
        story: "В цирке 28 зрителей хотят сесть в ряды. В каждом ряду помещается 7 человек. Сколько рядов понадобится?",
        question: "Сколько рядов нужно для всех зрителей?",
        dividend: 28,
        divisor: 7,
        answer: 4
    },
    8: {
        title: "🚌 Школьный автобус",
        story: "В школьный автобус нужно посадить 32 ученика. В каждом ряду сидений помещается 4 человека. Сколько рядов понадобится?",
        question: "Сколько рядов сидений нужно занять?",
        dividend: 32,
        divisor: 4,
        answer: 8
    },
    9: {
        title: "🎁 День рождения",
        story: "На день рождения пришло 16 гостей. У вас есть 2 больших торта, которые нужно разрезать на равные кусочки для всех гостей. Сколько кусочков нужно от каждого торта?",
        question: "Сколько кусочков нужно от каждого торта?",
        dividend: 16,
        divisor: 2,
        answer: 8
    }
};

// Состояние приложения
let completedTasks = new Set();
let currentTask = null;

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    loadProgress();
    setupEventListeners();
    updateProgress();
});

// Настройка обработчиков событий
function setupEventListeners() {
    // Обработчики для карточек тем
    document.querySelectorAll('.topic-card').forEach(card => {
        card.addEventListener('click', function() {
            const topicId = parseInt(this.dataset.topic);
            startTask(topicId);
        });
    });

    // Обработчик для поля ввода
    document.getElementById('answer-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
}

// Загрузка прогресса из localStorage
function loadProgress() {
    const saved = localStorage.getItem('divisionLabProgress');
    if (saved) {
        completedTasks = new Set(JSON.parse(saved));
    }
}

// Сохранение прогресса в localStorage
function saveProgress() {
    localStorage.setItem('divisionLabProgress', JSON.stringify([...completedTasks]));
}

// Обновление отображения прогресса
function updateProgress() {
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const completedCount = completedTasks.size;
    
    const percentage = (completedCount / 9) * 100;
    progressFill.style.width = percentage + '%';
    progressText.textContent = `${completedCount}/9 завершено`;

    // Обновление карточек тем
    document.querySelectorAll('.topic-card').forEach(card => {
        const topicId = parseInt(card.dataset.topic);
        if (completedTasks.has(topicId)) {
            card.classList.add('completed');
        } else {
            card.classList.remove('completed');
        }
    });
}

// Начало выполнения задачи
function startTask(topicId) {
    currentTask = topicId;
    const task = tasks[topicId];
    
    document.getElementById('task-title').textContent = task.title;
    document.getElementById('story-text').textContent = task.story;
    document.getElementById('question-text').textContent = task.question;
    
    // Очистка поля ввода и сообщения
    document.getElementById('answer-input').value = '';
    document.getElementById('result-message').className = 'result-message';
    document.getElementById('result-message').style.display = 'none';
    
    showScreen('task-screen');
}

// Проверка ответа
function checkAnswer() {
    const userAnswer = parseFloat(document.getElementById('answer-input').value);
    const task = tasks[currentTask];
    const resultMessage = document.getElementById('result-message');
    
    if (isNaN(userAnswer)) {
        showResult('Пожалуйста, введите число!', 'error');
        return;
    }
    
    if (Math.abs(userAnswer - task.answer) < 0.01) { // Допуск для дробных чисел
        showResult('Правильно! Отличная работа! 🎉', 'success');
        completedTasks.add(currentTask);
        saveProgress();
        updateProgress();
        
        // Проверка завершения всех задач
        if (completedTasks.size === 9) {
            setTimeout(() => {
                showCongratulations();
            }, 2000);
        } else {
            setTimeout(() => {
                showMainMenu();
            }, 2000);
        }
    } else {
        const hint = getHint(task);
        showResult(`Неправильно. ${hint}`, 'error');
    }
}

// Показать результат
function showResult(message, type) {
    const resultMessage = document.getElementById('result-message');
    resultMessage.textContent = message;
    resultMessage.className = `result-message ${type}`;
    resultMessage.style.display = 'block';
}

// Получить подсказку
function getHint(task) {
    const quotient = task.dividend / task.divisor;
    if (quotient === Math.floor(quotient)) {
        return `Попробуйте разделить ${task.dividend} на ${task.divisor}.`;
    } else {
        return `Попробуйте разделить ${task.dividend} на ${task.divisor}. Результат может быть дробным числом.`;
    }
}

// Показать главное меню
function showMainMenu() {
    showScreen('main-menu');
}

// Показать экран поздравления
function showCongratulations() {
    showScreen('congratulations-screen');
}

// Переключение экранов
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Перезапуск лабораторной работы
function restartLab() {
    completedTasks.clear();
    saveProgress();
    updateProgress();
    showMainMenu();
}

// Глобальные функции для HTML
window.showMainMenu = showMainMenu;
window.checkAnswer = checkAnswer;
window.restartLab = restartLab; 