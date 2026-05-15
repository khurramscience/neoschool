// Глобальные переменные
let currentOperator = '';
let firstNumber = '';
let secondNumber = '';
let practiceStats = {
    correct: 0,
    total: 0
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeCalculator();
    updateProgress();
});

// Система вкладок
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Убираем активный класс со всех кнопок и контента
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Добавляем активный класс к выбранной кнопке и контенту
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Функции конвертера
function convertToTernary() {
    const decimalInput = document.getElementById('decimal-input').value;
    const resultSpan = document.getElementById('decimal-result');
    const stepsDiv = document.getElementById('conversion-steps');
    
    if (!decimalInput || isNaN(decimalInput) || decimalInput < 0) {
        resultSpan.textContent = 'Введите корректное число!';
        stepsDiv.innerHTML = '';
        return;
    }
    
    const decimal = parseInt(decimalInput);
    const ternary = decimalToTernary(decimal);
    const steps = getDecimalToTernarySteps(decimal);
    
    resultSpan.textContent = `${decimal}₁₀ = ${ternary}₃`;
    stepsDiv.innerHTML = steps;
}

function convertToDecimal() {
    const ternaryInput = document.getElementById('ternary-input').value;
    const resultSpan = document.getElementById('ternary-result');
    const stepsDiv = document.getElementById('ternary-steps');
    
    if (!ternaryInput || !/^[0-2]+$/.test(ternaryInput)) {
        resultSpan.textContent = 'Введите корректное третичное число!';
        stepsDiv.innerHTML = '';
        return;
    }
    
    const decimal = ternaryToDecimal(ternaryInput);
    const steps = getTernaryToDecimalSteps(ternaryInput);
    
    resultSpan.textContent = `${ternaryInput}₃ = ${decimal}₁₀`;
    stepsDiv.innerHTML = steps;
}

// Алгоритмы конвертации
function decimalToTernary(decimal) {
    if (decimal === 0) return '0';
    
    let result = '';
    let num = decimal;
    
    while (num > 0) {
        result = (num % 3) + result;
        num = Math.floor(num / 3);
    }
    
    return result;
}

function ternaryToDecimal(ternary) {
    let result = 0;
    const digits = ternary.split('').reverse();
    
    for (let i = 0; i < digits.length; i++) {
        result += parseInt(digits[i]) * Math.pow(3, i);
    }
    
    return result;
}

// Генерация пошаговых решений
function getDecimalToTernarySteps(decimal) {
    if (decimal === 0) return '0 ÷ 3 = 0 остаток 0<br>Результат: 0₃';
    
    let steps = '';
    let num = decimal;
    let remainders = [];
    
    while (num > 0) {
        const remainder = num % 3;
        const quotient = Math.floor(num / 3);
        steps += `${num} ÷ 3 = ${quotient} остаток ${remainder}<br>`;
        remainders.unshift(remainder);
        num = quotient;
    }
    
    steps += `<br><strong>Результат: ${remainders.join('')}₃</strong>`;
    return steps;
}

function getTernaryToDecimalSteps(ternary) {
    let steps = '';
    const digits = ternary.split('').reverse();
    let result = 0;
    
    steps += `${ternary}₃ = `;
    
    for (let i = 0; i < digits.length; i++) {
        const digit = parseInt(digits[i]);
        const power = Math.pow(3, i);
        const term = digit * power;
        result += term;
        
        steps += `${digit} × 3^${i}`;
        if (i < digits.length - 1) steps += ' + ';
    }
    
    steps += `<br>= ${result}₁₀`;
    return steps;
}

// Калькулятор
function initializeCalculator() {
    // Обработчики для ввода с клавиатуры
    document.addEventListener('keydown', function(e) {
        if (e.key >= '0' && e.key <= '2') {
            appendToCalc(e.key);
        } else if (e.key === '+') {
            setOperator('+');
        } else if (e.key === '-') {
            setOperator('-');
        } else if (e.key === '*') {
            setOperator('×');
        } else if (e.key === '/') {
            setOperator('÷');
        } else if (e.key === 'Enter' || e.key === '=') {
            calculate();
        } else if (e.key === 'Escape') {
            clearCalc();
        }
    });
}

function appendToCalc(digit) {
    const display = document.getElementById('calc-display');
    
    if (currentOperator === '') {
        if (firstNumber === '0') {
            firstNumber = digit;
        } else {
            firstNumber += digit;
        }
        display.value = firstNumber;
    } else {
        if (secondNumber === '0') {
            secondNumber = digit;
        } else {
            secondNumber += digit;
        }
        display.value = secondNumber;
    }
}

function setOperator(operator) {
    if (firstNumber !== '') {
        currentOperator = operator;
        const display = document.getElementById('calc-display');
        display.value = operator;
    }
}

function calculate() {
    if (firstNumber !== '' && currentOperator !== '' && secondNumber !== '') {
        const num1 = parseInt(firstNumber, 3);
        const num2 = parseInt(secondNumber, 3);
        let result;
        
        switch (currentOperator) {
            case '+':
                result = num1 + num2;
                break;
            case '-':
                result = num1 - num2;
                break;
            case '×':
                result = num1 * num2;
                break;
            case '÷':
                if (num2 === 0) {
                    alert('Деление на ноль невозможно!');
                    return;
                }
                result = Math.floor(num1 / num2);
                break;
        }
        
        const ternaryResult = decimalToTernary(Math.abs(result));
        const sign = result < 0 ? '-' : '';
        
        const resultDisplay = document.getElementById('calc-result-display');
        resultDisplay.innerHTML = `
            <div class="calculation">
                <p>${firstNumber}₃ ${currentOperator} ${secondNumber}₃</p>
                <p>= ${num1}₁₀ ${currentOperator} ${num2}₁₀</p>
                <p>= ${result}₁₀</p>
                <p><strong>= ${sign}${ternaryResult}₃</strong></p>
            </div>
        `;
        
        // Сброс для следующего вычисления
        firstNumber = ternaryResult;
        secondNumber = '';
        currentOperator = '';
        document.getElementById('calc-display').value = ternaryResult;
    }
}

function clearCalc() {
    firstNumber = '';
    secondNumber = '';
    currentOperator = '';
    document.getElementById('calc-display').value = '0';
    document.getElementById('calc-result-display').innerHTML = 'Введите числа и операцию';
}

// Практические задания
const practiceTasks = [
    {
        type: 'decimal_to_ternary',
        question: 'Переведите число {number} из десятичной системы в третичную',
        generate: () => Math.floor(Math.random() * 50) + 1,
        check: (input, answer) => decimalToTernary(answer) === input
    },
    {
        type: 'ternary_to_decimal',
        question: 'Переведите число {number} из третичной системы в десятичную',
        generate: () => {
            const decimal = Math.floor(Math.random() * 30) + 1;
            return decimalToTernary(decimal);
        },
        check: (input, answer) => parseInt(input) === ternaryToDecimal(answer)
    },
    {
        type: 'addition',
        question: 'Выполните сложение в третичной системе: {number1}₃ + {number2}₃',
        generate: () => {
            const num1 = Math.floor(Math.random() * 20) + 1;
            const num2 = Math.floor(Math.random() * 20) + 1;
            return {
                num1: decimalToTernary(num1),
                num2: decimalToTernary(num2),
                answer: decimalToTernary(num1 + num2)
            };
        },
        check: (input, answer) => input === answer
    },
    {
        type: 'comparison',
        question: 'Сравните числа в третичной системе: {number1}₃ и {number2}₃. Какое больше?',
        generate: () => {
            const num1 = Math.floor(Math.random() * 20) + 1;
            const num2 = Math.floor(Math.random() * 20) + 1;
            return {
                num1: decimalToTernary(num1),
                num2: decimalToTernary(num2),
                answer: num1 > num2 ? '1' : num1 < num2 ? '2' : '0'
            };
        },
        check: (input, answer) => input === answer
    }
];

let currentTask = null;

function generateNewTask() {
    const taskType = practiceTasks[Math.floor(Math.random() * practiceTasks.length)];
    const taskData = taskType.generate();
    
    let question = taskType.question;
    
    if (taskType.type === 'decimal_to_ternary') {
        question = question.replace('{number}', taskData);
        currentTask = {
            type: taskType.type,
            question: question,
            answer: taskData,
            correctAnswer: decimalToTernary(taskData)
        };
    } else if (taskType.type === 'ternary_to_decimal') {
        question = question.replace('{number}', taskData);
        currentTask = {
            type: taskType.type,
            question: question,
            answer: taskData,
            correctAnswer: ternaryToDecimal(taskData)
        };
    } else if (taskType.type === 'addition') {
        question = question.replace('{number1}', taskData.num1).replace('{number2}', taskData.num2);
        currentTask = {
            type: taskType.type,
            question: question,
            answer: taskData.answer,
            num1: taskData.num1,
            num2: taskData.num2
        };
    } else if (taskType.type === 'comparison') {
        question = question.replace('{number1}', taskData.num1).replace('{number2}', taskData.num2);
        currentTask = {
            type: taskType.type,
            question: question,
            answer: taskData.answer,
            num1: taskData.num1,
            num2: taskData.num2
        };
    }
    
    document.getElementById('task-text').textContent = currentTask.question;
    document.getElementById('user-answer').value = '';
    document.getElementById('feedback').className = 'feedback-box';
    document.getElementById('feedback').style.display = 'none';
}

function checkAnswer() {
    if (!currentTask) {
        alert('Сначала сгенерируйте задание!');
        return;
    }
    
    const userAnswer = document.getElementById('user-answer').value.trim();
    const feedbackBox = document.getElementById('feedback');
    
    if (!userAnswer) {
        alert('Введите ответ!');
        return;
    }
    
    let isCorrect = false;
    
    if (currentTask.type === 'decimal_to_ternary') {
        isCorrect = userAnswer === currentTask.correctAnswer;
    } else if (currentTask.type === 'ternary_to_decimal') {
        isCorrect = parseInt(userAnswer) === currentTask.correctAnswer;
    } else if (currentTask.type === 'addition') {
        isCorrect = userAnswer === currentTask.answer;
    } else if (currentTask.type === 'comparison') {
        const expected = currentTask.answer === '1' ? 'первое' : 
                        currentTask.answer === '2' ? 'второе' : 'равны';
        isCorrect = userAnswer.toLowerCase() === expected;
    }
    
    practiceStats.total++;
    if (isCorrect) {
        practiceStats.correct++;
        feedbackBox.className = 'feedback-box success';
        feedbackBox.innerHTML = '✅ Правильно! Отличная работа!';
    } else {
        feedbackBox.className = 'feedback-box error';
        let correctAnswer = '';
        
        if (currentTask.type === 'decimal_to_ternary') {
            correctAnswer = currentTask.correctAnswer;
        } else if (currentTask.type === 'ternary_to_decimal') {
            correctAnswer = currentTask.correctAnswer;
        } else if (currentTask.type === 'addition') {
            correctAnswer = currentTask.answer;
        } else if (currentTask.type === 'comparison') {
            correctAnswer = currentTask.answer === '1' ? 'первое' : 
                           currentTask.answer === '2' ? 'второе' : 'равны';
        }
        
        feedbackBox.innerHTML = `❌ Неправильно. Правильный ответ: ${correctAnswer}`;
    }
    
    feedbackBox.style.display = 'block';
    updateProgress();
}

function showHint() {
    if (!currentTask) {
        alert('Сначала сгенерируйте задание!');
        return;
    }
    
    let hint = '';
    
    if (currentTask.type === 'decimal_to_ternary') {
        hint = `Подсказка: Разделите ${currentTask.answer} на 3 и запишите остатки в обратном порядке.`;
    } else if (currentTask.type === 'ternary_to_decimal') {
        hint = `Подсказка: Умножьте каждую цифру на соответствующую степень числа 3.`;
    } else if (currentTask.type === 'addition') {
        hint = `Подсказка: Переведите числа в десятичную систему, сложите, затем переведите обратно в третичную.`;
    } else if (currentTask.type === 'comparison') {
        hint = `Подсказка: Переведите оба числа в десятичную систему для сравнения.`;
    }
    
    alert(hint);
}

function updateProgress() {
    const progressFill = document.getElementById('progress-fill');
    const correctCount = document.getElementById('correct-count');
    const totalCount = document.getElementById('total-count');
    
    const percentage = practiceStats.total > 0 ? (practiceStats.correct / practiceStats.total) * 100 : 0;
    
    progressFill.style.width = percentage + '%';
    correctCount.textContent = practiceStats.correct;
    totalCount.textContent = practiceStats.total;
}

// Дополнительные функции для улучшения UX
function validateTernaryInput(input) {
    return /^[0-2]*$/.test(input);
}

// Обработчики событий для улучшения UX
document.addEventListener('DOMContentLoaded', function() {
    // Валидация ввода третичных чисел
    const ternaryInput = document.getElementById('ternary-input');
    if (ternaryInput) {
        ternaryInput.addEventListener('input', function() {
            if (!validateTernaryInput(this.value)) {
                this.value = this.value.replace(/[^0-2]/g, '');
            }
        });
    }
    
    // Автоматическая генерация первого задания
    setTimeout(generateNewTask, 1000);
}); 