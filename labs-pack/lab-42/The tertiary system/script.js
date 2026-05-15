// Global variables
let currentOperator = '';
let firstNumber = '';
let secondNumber = '';
let practiceStats = {
    correct: 0,
    total: 0
};

// Initialization when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeCalculator();
    updateProgress();
});

// Tab system
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Remove active class from all buttons and content
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to selected button and content
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Converter functions
function convertToTernary() {
    const decimalInput = document.getElementById('decimal-input').value;
    const resultSpan = document.getElementById('decimal-result');
    const stepsDiv = document.getElementById('conversion-steps');
    
    if (!decimalInput || isNaN(decimalInput) || decimalInput < 0) {
        resultSpan.textContent = 'Please enter a valid number!';
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
        resultSpan.textContent = 'Please enter a valid ternary number!';
        stepsDiv.innerHTML = '';
        return;
    }
    
    const decimal = ternaryToDecimal(ternaryInput);
    const steps = getTernaryToDecimalSteps(ternaryInput);
    
    resultSpan.textContent = `${ternaryInput}₃ = ${decimal}₁₀`;
    stepsDiv.innerHTML = steps;
}

// Conversion algorithms
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

// Generate step-by-step solutions
function getDecimalToTernarySteps(decimal) {
    if (decimal === 0) return '0 ÷ 3 = 0 remainder 0<br>Result: 0₃';
    
    let steps = '';
    let num = decimal;
    let remainders = [];
    
    while (num > 0) {
        const remainder = num % 3;
        const quotient = Math.floor(num / 3);
        steps += `${num} ÷ 3 = ${quotient} remainder ${remainder}<br>`;
        remainders.unshift(remainder);
        num = quotient;
    }
    
    steps += `<br><strong>Result: ${remainders.join('')}₃</strong>`;
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

// Calculator
function initializeCalculator() {
    // Keyboard input handlers
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
                    alert('Division by zero is not possible!');
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
        
        // Reset for next calculation
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
    document.getElementById('calc-result-display').innerHTML = 'Enter numbers and operation';
}

// Practice exercises
const practiceTasks = [
    {
        type: 'decimal_to_ternary',
        question: 'Convert the number {number} from decimal to ternary system',
        generate: () => Math.floor(Math.random() * 50) + 1,
        check: (input, answer) => decimalToTernary(answer) === input
    },
    {
        type: 'ternary_to_decimal',
        question: 'Convert the number {number} from ternary to decimal system',
        generate: () => {
            const decimal = Math.floor(Math.random() * 30) + 1;
            return decimalToTernary(decimal);
        },
        check: (input, answer) => parseInt(input) === ternaryToDecimal(answer)
    },
    {
        type: 'addition',
        question: 'Perform addition in ternary system: {number1}₃ + {number2}₃',
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
        question: 'Compare numbers in ternary system: {number1}₃ and {number2}₃. Which one is greater?',
        generate: () => {
            const num1 = Math.floor(Math.random() * 20) + 1;
            const num2 = Math.floor(Math.random() * 20) + 1;
            return {
                num1: decimalToTernary(num1),
                num2: decimalToTernary(num2),
                answer: num1 > num2 ? 'first' : num1 < num2 ? 'second' : 'equal'
            };
        },
        check: (input, answer) => input.toLowerCase() === answer
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
        alert('Please generate a task first!');
        return;
    }
    
    const userAnswer = document.getElementById('user-answer').value.trim();
    const feedbackBox = document.getElementById('feedback');
    
    if (!userAnswer) {
        alert('Please enter an answer!');
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
        const expected = currentTask.answer === 'first' ? 'first' : 
                        currentTask.answer === 'second' ? 'second' : 'equal';
        isCorrect = userAnswer.toLowerCase() === expected;
    }
    
    practiceStats.total++;
    if (isCorrect) {
        practiceStats.correct++;
        feedbackBox.className = 'feedback-box success';
        feedbackBox.innerHTML = '✅ Correct! Excellent work!';
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
            correctAnswer = currentTask.answer === 'first' ? 'first' : 
                           currentTask.answer === 'second' ? 'second' : 'equal';
        }
        
        feedbackBox.innerHTML = `❌ Incorrect. Correct answer: ${correctAnswer}`;
    }
    
    feedbackBox.style.display = 'block';
    updateProgress();
}

function showHint() {
    if (!currentTask) {
        alert('Please generate a task first!');
        return;
    }
    
    let hint = '';
    
    if (currentTask.type === 'decimal_to_ternary') {
        hint = `Hint: Divide ${currentTask.answer} by 3 and write the remainders in reverse order.`;
    } else if (currentTask.type === 'ternary_to_decimal') {
        hint = `Hint: Multiply each digit by the corresponding power of 3.`;
    } else if (currentTask.type === 'addition') {
        hint = `Hint: Convert numbers to decimal system, add them, then convert back to ternary.`;
    } else if (currentTask.type === 'comparison') {
        hint = `Hint: Convert both numbers to decimal system for comparison.`;
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

// Additional functions for better UX
function validateTernaryInput(input) {
    return /^[0-2]*$/.test(input);
}

// Event handlers for better UX
document.addEventListener('DOMContentLoaded', function() {
    // Validate ternary number input
    const ternaryInput = document.getElementById('ternary-input');
    if (ternaryInput) {
        ternaryInput.addEventListener('input', function() {
            if (!validateTernaryInput(this.value)) {
                this.value = this.value.replace(/[^0-2]/g, '');
            }
        });
    }
    
    // Auto-generate first task
    setTimeout(generateNewTask, 1000);
}); 