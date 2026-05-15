// Навигация между разделами
document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const contentSections = document.querySelectorAll('.content-section');

    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            
            // Убираем активный класс со всех кнопок и секций
            navButtons.forEach(btn => btn.classList.remove('active'));
            contentSections.forEach(section => section.classList.remove('active'));
            
            // Добавляем активный класс к выбранной кнопке и секции
            this.classList.add('active');
            document.getElementById(targetSection).classList.add('active');
        });
    });

    // Инициализация интерактивных элементов
    initTemperatureDemo();
    initMoneyCalculator();
    initFloorCalculator();
    initTest();
});

// Температурный слайдер
function initTemperatureDemo() {
    const tempSlider = document.getElementById('tempSlider');
    const tempValue = document.getElementById('tempValue');
    const warmUpBtn = document.getElementById('warmUp');
    const tempResult = document.getElementById('tempResult');

    if (tempSlider && tempValue) {
        tempSlider.addEventListener('input', function() {
            const value = parseInt(this.value);
            tempValue.textContent = value + '°C';
            
            // Изменяем цвет в зависимости от температуры
            if (value > 0) {
                tempValue.style.color = '#ff6b6b';
            } else if (value === 0) {
                tempValue.style.color = '#feca57';
            } else {
                tempValue.style.color = '#48dbfb';
            }
        });
    }

    if (warmUpBtn && tempResult) {
        warmUpBtn.addEventListener('click', function() {
            const currentTemp = parseInt(tempSlider.value);
            const newTemp = currentTemp + 8;
            
            // Анимация изменения температуры
            animateTemperatureChange(currentTemp, newTemp);
            
            setTimeout(() => {
                tempSlider.value = newTemp;
                tempValue.textContent = newTemp + '°C';
                
                if (newTemp > 0) {
                    tempValue.style.color = '#ff6b6b';
                } else if (newTemp === 0) {
                    tempValue.style.color = '#feca57';
                } else {
                    tempValue.style.color = '#48dbfb';
                }
                
                tempResult.textContent = `Температура изменилась с ${currentTemp}°C на ${newTemp}°C`;
                tempResult.className = 'result correct';
            }, 1000);
        });
    }
}

// Анимация изменения температуры
function animateTemperatureChange(from, to) {
    const tempValue = document.getElementById('tempValue');
    const steps = 10;
    const step = (to - from) / steps;
    let current = from;
    
    const interval = setInterval(() => {
        current += step;
        if ((step > 0 && current >= to) || (step < 0 && current <= to)) {
            current = to;
            clearInterval(interval);
        }
        tempValue.textContent = Math.round(current) + '°C';
    }, 100);
}

// Калькулятор денег
function initMoneyCalculator() {
    const calculateMoneyBtn = document.getElementById('calculateMoney');
    const moneyResult = document.getElementById('moneyResult');

    if (calculateMoneyBtn && moneyResult) {
        calculateMoneyBtn.addEventListener('click', function() {
            const startMoney = parseInt(document.getElementById('startMoney').value);
            const purchase = parseInt(document.getElementById('purchase').value);
            const result = startMoney - purchase;
            
            let resultText = '';
            let resultClass = '';
            
            if (result >= 0) {
                resultText = `У тебя осталось ${result} рублей`;
                resultClass = 'correct';
            } else {
                resultText = `У тебя долг ${Math.abs(result)} рублей (отрицательный баланс: ${result})`;
                resultClass = 'incorrect';
            }
            
            moneyResult.textContent = resultText;
            moneyResult.className = `result ${resultClass}`;
        });
    }
}

// Калькулятор этажей
function initFloorCalculator() {
    const goDownBtn = document.getElementById('goDown');
    const floorResult = document.getElementById('floorResult');
    const currentFloorSpan = document.getElementById('currentFloor');

    if (goDownBtn && floorResult) {
        goDownBtn.addEventListener('click', function() {
            const currentFloor = parseInt(currentFloorSpan.textContent);
            const newFloor = currentFloor - 5;
            
            // Анимация спуска
            animateFloorChange(currentFloor, newFloor);
            
            setTimeout(() => {
                currentFloorSpan.textContent = newFloor;
                
                let resultText = '';
                let resultClass = '';
                
                if (newFloor > 0) {
                    resultText = `Ты на ${newFloor}-м этаже`;
                    resultClass = 'correct';
                } else if (newFloor === 0) {
                    resultText = 'Ты на улице (нулевой этаж)';
                    resultClass = 'correct';
                } else {
                    resultText = `Ты в подвале на ${Math.abs(newFloor)}-м подземном этаже`;
                    resultClass = 'correct';
                }
                
                floorResult.textContent = resultText;
                floorResult.className = `result ${resultClass}`;
            }, 1000);
        });
    }
}

// Анимация изменения этажа
function animateFloorChange(from, to) {
    const currentFloorSpan = document.getElementById('currentFloor');
    const steps = 5;
    const step = (to - from) / steps;
    let current = from;
    
    const interval = setInterval(() => {
        current += step;
        if ((step > 0 && current >= to) || (step < 0 && current <= to)) {
            current = to;
            clearInterval(interval);
        }
        currentFloorSpan.textContent = Math.round(current);
    }, 200);
}

// Тест
function initTest() {
    const submitTestBtn = document.getElementById('submitTest');
    const testResults = document.getElementById('testResults');
    const testContainer = document.getElementById('testContainer');
    const retakeTestBtn = document.getElementById('retakeTest');

    // Правильные ответы
    const correctAnswers = {
        q1: 'a', // -5°C ниже
        q2: 'b', // -30 рублей
        q3: 'b', // -1-й этаж
        q4: 'c', // -5 больше
        q5: 'b'  // -5
    };

    if (submitTestBtn) {
        submitTestBtn.addEventListener('click', function() {
            const answers = {};
            let score = 0;
            
            // Собираем ответы
            Object.keys(correctAnswers).forEach(question => {
                const selected = document.querySelector(`input[name="${question}"]:checked`);
                if (selected) {
                    answers[question] = selected.value;
                    if (selected.value === correctAnswers[question]) {
                        score++;
                    }
                }
            });
            
            // Проверяем, что все вопросы отвечены
            if (Object.keys(answers).length < Object.keys(correctAnswers).length) {
                alert('Пожалуйста, ответьте на все вопросы!');
                return;
            }
            
            // Показываем результаты
            showTestResults(score, answers, correctAnswers);
        });
    }

    if (retakeTestBtn) {
        retakeTestBtn.addEventListener('click', function() {
            // Сбрасываем все ответы
            document.querySelectorAll('input[type="radio"]').forEach(radio => {
                radio.checked = false;
            });
            
            // Скрываем результаты и показываем тест
            testResults.classList.add('hidden');
            testContainer.style.display = 'block';
        });
    }
}

// Показать результаты теста
function showTestResults(score, answers, correctAnswers) {
    const testResults = document.getElementById('testResults');
    const testContainer = document.getElementById('testContainer');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const answersReview = document.getElementById('answersReview');
    
    const totalQuestions = Object.keys(correctAnswers).length;
    const percentage = (score / totalQuestions) * 100;
    
    // Определяем оценку
    let grade, gradeClass;
    if (percentage >= 80) {
        grade = 'Отлично!';
        gradeClass = 'excellent';
    } else if (percentage >= 60) {
        grade = 'Хорошо!';
        gradeClass = 'good';
    } else {
        grade = 'Нужно повторить материал';
        gradeClass = 'poor';
    }
    
    // Показываем общий результат
    scoreDisplay.textContent = `${grade} Ты ответил правильно на ${score} из ${totalQuestions} вопросов (${percentage}%)`;
    scoreDisplay.className = gradeClass;
    
    // Показываем детальный разбор
    let reviewHTML = '<h4>Разбор ответов:</h4>';
    
    const questionTexts = {
        q1: 'Какая температура ниже?',
        q2: 'У тебя есть 50 рублей, а ты должен 80 рублей. Твой баланс:',
        q3: 'Ты на 3-м этаже и поднимаешься на 2 этажа вверх, затем спускаешься на 6 этажей. Где ты?',
        q4: 'Какое число больше?',
        q5: '-8 + 3 = ?'
    };
    
    const correctTexts = {
        q1: 'Правильно: -5°C ниже, чем +2°C и 0°C',
        q2: 'Правильно: 50 - 80 = -30 рублей (долг)',
        q3: 'Правильно: 3 + 2 - 6 = -1 (подвал)',
        q4: 'Правильно: -5 больше, чем -10 и -15',
        q5: 'Правильно: -8 + 3 = -5'
    };
    
    Object.keys(correctAnswers).forEach(question => {
        const isCorrect = answers[question] === correctAnswers[question];
        const questionClass = isCorrect ? 'correct' : 'incorrect';
        
        reviewHTML += `
            <div class="answer-item ${questionClass}">
                <strong>Вопрос ${question.slice(1)}:</strong> ${questionTexts[question]}<br>
                <strong>Твой ответ:</strong> ${getAnswerText(question, answers[question])}<br>
                <strong>Правильный ответ:</strong> ${getAnswerText(question, correctAnswers[question])}<br>
                <em>${correctTexts[question]}</em>
            </div>
        `;
    });
    
    answersReview.innerHTML = reviewHTML;
    
    // Показываем результаты
    testContainer.style.display = 'none';
    testResults.classList.remove('hidden');
}

// Получить текст ответа
function getAnswerText(question, answer) {
    const answerTexts = {
        q1: { a: '-5°C', b: '+2°C', c: '0°C' },
        q2: { a: '+30 рублей', b: '-30 рублей', c: '+130 рублей' },
        q3: { a: '1-й этаж', b: '-1-й этаж', c: '5-й этаж' },
        q4: { a: '-10', b: '-15', c: '-5' },
        q5: { a: '-11', b: '-5', c: '+5' }
    };
    
    return answerTexts[question][answer] || 'Не выбран';
}

// Добавляем анимации при загрузке страницы
window.addEventListener('load', function() {
    // Анимация появления элементов
    const elements = document.querySelectorAll('.theory-card, .practice-card, .test-card');
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.5s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200);
    });
}); 