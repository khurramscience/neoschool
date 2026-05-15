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

    // Инициализация практических упражнений
    initPracticeExercises();
    
    // Инициализация теста
    initQuiz();
});

// Практические упражнения
function initPracticeExercises() {
    const itemsContainer = document.getElementById('itemsContainer');
    const addItemBtn = document.getElementById('addItem');
    const removeItemBtn = document.getElementById('removeItem');
    const clearAllBtn = document.getElementById('clearAll');
    const userAnswerInput = document.getElementById('userAnswer');
    const checkAnswerBtn = document.getElementById('checkAnswer');
    const feedbackDiv = document.getElementById('feedback');
    
    const items = ['🍎', '🍌', '🍊', '🍓', '🍇', '🍉', '🍍', '🥝'];
    let currentItems = [];

    // Добавить предмет
    addItemBtn.addEventListener('click', () => {
        if (currentItems.length < 10) {
            const randomItem = items[Math.floor(Math.random() * items.length)];
            currentItems.push(randomItem);
            updateItemsDisplay();
        }
    });

    // Убрать предмет
    removeItemBtn.addEventListener('click', () => {
        if (currentItems.length > 0) {
            currentItems.pop();
            updateItemsDisplay();
        }
    });

    // Убрать все предметы
    clearAllBtn.addEventListener('click', () => {
        currentItems = [];
        updateItemsDisplay();
        feedbackDiv.innerHTML = '';
        feedbackDiv.className = 'feedback';
    });

    // Проверить ответ
    checkAnswerBtn.addEventListener('click', () => {
        const userAnswer = parseInt(userAnswerInput.value);
        const correctAnswer = currentItems.length;
        
        if (isNaN(userAnswer)) {
            showFeedback('Пожалуйста, введите число!', 'incorrect');
            return;
        }
        
        if (userAnswer === correctAnswer) {
            showFeedback(`Правильно! У тебя ${correctAnswer} предметов. Отличная работа! 🎉`, 'correct');
        } else {
            showFeedback(`Неправильно. У тебя ${correctAnswer} предметов, а не ${userAnswer}. Попробуй еще раз!`, 'incorrect');
        }
    });

    function updateItemsDisplay() {
        itemsContainer.innerHTML = '';
        currentItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'item';
            itemElement.textContent = item;
            itemsContainer.appendChild(itemElement);
        });
    }

    function showFeedback(message, type) {
        feedbackDiv.textContent = message;
        feedbackDiv.className = `feedback ${type}`;
    }

    // Упражнение с заполнением пропусков
    const checkBlanksBtn = document.getElementById('checkBlanks');
    const blanksFeedbackDiv = document.getElementById('blanksFeedback');
    const blankInputs = document.querySelectorAll('.blank-input');

    checkBlanksBtn.addEventListener('click', () => {
        let allCorrect = true;
        let correctCount = 0;
        
        blankInputs.forEach(input => {
            const userValue = parseInt(input.value);
            const correctValue = parseInt(input.getAttribute('data-correct'));
            
            if (isNaN(userValue)) {
                allCorrect = false;
                input.style.borderColor = '#f56565';
                input.style.backgroundColor = '#fed7d7';
            } else if (userValue === correctValue) {
                correctCount++;
                input.style.borderColor = '#48bb78';
                input.style.backgroundColor = '#c6f6d5';
            } else {
                allCorrect = false;
                input.style.borderColor = '#f56565';
                input.style.backgroundColor = '#fed7d7';
            }
        });

        if (allCorrect) {
            blanksFeedbackDiv.textContent = 'Отлично! Все ответы правильные! 🎉';
            blanksFeedbackDiv.className = 'feedback correct';
        } else {
            blanksFeedbackDiv.textContent = `У тебя ${correctCount} из ${blankInputs.length} правильных ответов. Попробуй еще раз!`;
            blanksFeedbackDiv.className = 'feedback incorrect';
        }
    });
}

// Тест
function initQuiz() {
    const questions = [
        {
            question: "Что означает число 0?",
            options: [
                "Отсутствие количества",
                "Очень большое число",
                "Отрицательное число",
                "Дробное число"
            ],
            correct: 0
        },
        {
            question: "Если у тебя 0 конфет, это означает:",
            options: [
                "У тебя много конфет",
                "У тебя одна конфета",
                "У тебя нет конфет",
                "У тебя половина конфеты"
            ],
            correct: 2
        },
        {
            question: "В числе 10 ноль показывает:",
            options: [
                "Что число отрицательное",
                "Что нет единиц",
                "Что число очень большое",
                "Что число дробное"
            ],
            correct: 1
        },
        {
            question: "Сколько яблок у тебя, если на столе ничего нет?",
            options: [
                "1",
                "2",
                "0",
                "10"
            ],
            correct: 2
        },
        {
            question: "Без нуля мы не могли бы:",
            options: [
                "Считать большие числа",
                "Писать числа больше 9",
                "Точно сказать, что у нас ничего нет",
                "Все ответы верны"
            ],
            correct: 2
        }
    ];

    let currentQuestionIndex = 0;
    let userAnswers = new Array(questions.length).fill(null);
    let quizCompleted = false;

    const quizContent = document.getElementById('quizContent');
    const currentQuestionSpan = document.getElementById('currentQuestion');
    const totalQuestionsSpan = document.getElementById('totalQuestions');
    const prevQuestionBtn = document.getElementById('prevQuestion');
    const nextQuestionBtn = document.getElementById('nextQuestion');
    const finishQuizBtn = document.getElementById('finishQuiz');
    const quizResults = document.getElementById('quizResults');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const restartQuizBtn = document.getElementById('restartQuiz');

    totalQuestionsSpan.textContent = questions.length;

    function displayQuestion(index) {
        const question = questions[index];
        currentQuestionSpan.textContent = index + 1;
        
        let optionsHtml = '';
        question.options.forEach((option, optionIndex) => {
            const isSelected = userAnswers[index] === optionIndex;
            optionsHtml += `
                <div class="option ${isSelected ? 'selected' : ''}" data-option="${optionIndex}">
                    ${option}
                </div>
            `;
        });

        quizContent.innerHTML = `
            <div class="question">
                <h4>${question.question}</h4>
                <div class="options">
                    ${optionsHtml}
                </div>
            </div>
        `;

        // Добавляем обработчики для вариантов ответов
        const optionElements = quizContent.querySelectorAll('.option');
        optionElements.forEach(option => {
            option.addEventListener('click', () => {
                const selectedOption = parseInt(option.getAttribute('data-option'));
                userAnswers[index] = selectedOption;
                
                // Убираем выделение со всех вариантов
                optionElements.forEach(opt => opt.classList.remove('selected'));
                // Выделяем выбранный вариант
                option.classList.add('selected');
                
                updateNavigationButtons();
            });
        });

        updateNavigationButtons();
    }

    function updateNavigationButtons() {
        prevQuestionBtn.disabled = currentQuestionIndex === 0;
        nextQuestionBtn.style.display = currentQuestionIndex === questions.length - 1 ? 'none' : 'inline-block';
        finishQuizBtn.style.display = currentQuestionIndex === questions.length - 1 ? 'inline-block' : 'none';
    }

    prevQuestionBtn.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayQuestion(currentQuestionIndex);
        }
    });

    nextQuestionBtn.addEventListener('click', () => {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            displayQuestion(currentQuestionIndex);
        }
    });

    finishQuizBtn.addEventListener('click', () => {
        showResults();
    });

    restartQuizBtn.addEventListener('click', () => {
        restartQuiz();
    });

    function showResults() {
        let correctAnswers = 0;
        let resultsHtml = '';

        questions.forEach((question, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer === question.correct;
            
            if (isCorrect) {
                correctAnswers++;
            }

            resultsHtml += `
                <div style="margin-bottom: 15px; padding: 10px; background: ${isCorrect ? '#c6f6d5' : '#fed7d7'}; border-radius: 8px;">
                    <strong>Вопрос ${index + 1}:</strong> ${question.question}<br>
                    <strong>Твой ответ:</strong> ${question.options[userAnswer] || 'Не отвечен'}<br>
                    <strong>Правильный ответ:</strong> ${question.options[question.correct]}<br>
                    <strong>Результат:</strong> ${isCorrect ? '✅ Правильно' : '❌ Неправильно'}
                </div>
            `;
        });

        const percentage = Math.round((correctAnswers / questions.length) * 100);
        let message = '';
        
        if (percentage === 100) {
            message = 'Отлично! Ты отлично понимаешь важность нуля! 🎉';
        } else if (percentage >= 80) {
            message = 'Хорошо! Ты хорошо понимаешь важность нуля! 👍';
        } else if (percentage >= 60) {
            message = 'Неплохо! Но нужно еще немного подучить теорию. 📚';
        } else {
            message = 'Попробуй еще раз изучить теорию и пройти тест заново. 📖';
        }

        scoreDisplay.innerHTML = `
            <div style="font-size: 1.5rem; margin-bottom: 10px;">
                Твой результат: ${correctAnswers} из ${questions.length} (${percentage}%)
            </div>
            <div style="margin-bottom: 15px;">${message}</div>
            ${resultsHtml}
        `;

        quizContent.style.display = 'none';
        document.querySelector('.quiz-controls').style.display = 'none';
        quizResults.style.display = 'block';
        quizCompleted = true;
    }

    function restartQuiz() {
        currentQuestionIndex = 0;
        userAnswers = new Array(questions.length).fill(null);
        quizCompleted = false;
        
        quizContent.style.display = 'block';
        document.querySelector('.quiz-controls').style.display = 'flex';
        quizResults.style.display = 'none';
        
        displayQuestion(0);
    }

    // Показываем первый вопрос при загрузке
    displayQuestion(0);
} 