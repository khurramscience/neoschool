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
                
                tempResult.textContent = `Temperature changed from ${currentTemp}°C to ${newTemp}°C`;
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
                resultText = `You have ${result} dollars left`;
                resultClass = 'correct';
            } else {
                resultText = `You owe ${Math.abs(result)} dollars (negative balance: ${result})`;
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
                    resultText = `You are on the ${newFloor}${getOrdinalSuffix(newFloor)} floor`;
                    resultClass = 'correct';
                } else if (newFloor === 0) {
                    resultText = 'You are on the street (ground floor)';
                    resultClass = 'correct';
                } else {
                    resultText = `You are in the basement on the ${Math.abs(newFloor)}${getOrdinalSuffix(Math.abs(newFloor))} underground floor`;
                    resultClass = 'correct';
                }
                
                floorResult.textContent = resultText;
                floorResult.className = `result ${resultClass}`;
            }, 1000);
        });
    }
}

// Функция для правильных окончаний в английском
function getOrdinalSuffix(num) {
    if (num >= 11 && num <= 13) return 'th';
    switch (num % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
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
                alert('Please answer all questions!');
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
        grade = 'Excellent!';
        gradeClass = 'excellent';
    } else if (percentage >= 60) {
        grade = 'Good!';
        gradeClass = 'good';
    } else {
        grade = 'Need to review the material';
        gradeClass = 'poor';
    }
    
    // Показываем общий результат
    scoreDisplay.textContent = `${grade} You answered ${score} out of ${totalQuestions} questions correctly (${percentage}%)`;
    scoreDisplay.className = gradeClass;
    
    // Показываем детальный разбор
    let reviewHTML = '<h4>Answer Review:</h4>';
    
    const questionTexts = {
        q1: 'Which temperature is lower?',
        q2: 'You have $50, but you owe $80. Your balance:',
        q3: 'You are on the 3rd floor, go up 2 floors, then go down 6 floors. Where are you?',
        q4: 'Which number is greater?',
        q5: '-8 + 3 = ?'
    };
    
    const correctTexts = {
        q1: 'Correct: -5°C is lower than +2°C and 0°C',
        q2: 'Correct: 50 - 80 = -30 dollars (debt)',
        q3: 'Correct: 3 + 2 - 6 = -1 (basement)',
        q4: 'Correct: -5 is greater than -10 and -15',
        q5: 'Correct: -8 + 3 = -5'
    };
    
    Object.keys(correctAnswers).forEach(question => {
        const isCorrect = answers[question] === correctAnswers[question];
        const questionClass = isCorrect ? 'correct' : 'incorrect';
        
        reviewHTML += `
            <div class="answer-item ${questionClass}">
                <strong>Question ${question.slice(1)}:</strong> ${questionTexts[question]}<br>
                <strong>Your answer:</strong> ${getAnswerText(question, answers[question])}<br>
                <strong>Correct answer:</strong> ${getAnswerText(question, correctAnswers[question])}<br>
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
        q2: { a: '+30 долларов', b: '-30 долларов', c: '+130 долларов' },
        q3: { a: '1-й этаж', b: '-1-й этаж', c: '5-й этаж' },
        q4: { a: '-10', b: '-15', c: '-5' },
        q5: { a: '-11', b: '-5', c: '+5' }
    };
    
    return answerTexts[question][answer] || 'Not selected';
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