class DecimalCalculator {
    constructor() {
        this.correctCount = 0;
        this.totalCount = 0;
        this.currentAnswer = 0;
        this.currentStep = 0;
        this.solutionSteps = [];
        
        // Переменные для режима тестирования
        this.isTestMode = false;
        this.testQuestions = [];
        this.currentTestQuestion = 0;
        this.testResults = [];
        this.testStartTime = null;
        
        this.initializeElements();
        this.bindEvents();
        this.generateNewExercise();
    }

    initializeElements() {
        this.num1Element = document.getElementById('num1');
        this.num2Element = document.getElementById('num2');
        this.operatorElement = document.getElementById('operator');
        this.answerInput = document.getElementById('answer');
        this.checkBtn = document.getElementById('check-btn');
        this.newExerciseBtn = document.getElementById('new-exercise-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.resultElement = document.getElementById('result');
        this.correctCountElement = document.getElementById('correct-count');
        this.totalCountElement = document.getElementById('total-count');
        this.percentageElement = document.getElementById('percentage');
        
        // Элементы для пошагового решения
        this.stepByStepElement = document.getElementById('step-by-step');
        this.solutionStepsElement = document.getElementById('solution-steps');
        this.prevStepBtn = document.getElementById('prev-step');
        this.nextStepBtn = document.getElementById('next-step');
        this.stepCounterElement = document.getElementById('step-counter');
        this.showSolutionBtn = document.getElementById('show-solution-btn');
        
        // Элементы для режима тестирования
        this.practiceModeBtn = document.getElementById('practice-mode');
        this.testModeBtn = document.getElementById('test-mode');
        this.testResultsElement = document.getElementById('test-results');
        this.testCorrectElement = document.getElementById('test-correct');
        this.testTotalElement = document.getElementById('test-total');
        this.testPercentageElement = document.getElementById('test-percentage');
        this.testGradeElement = document.getElementById('test-grade');
        this.testDetailsElement = document.getElementById('test-details');
        this.retakeTestBtn = document.getElementById('retake-test');
        this.downloadResultsBtn = document.getElementById('download-results');
    }

    bindEvents() {
        this.checkBtn.addEventListener('click', () => this.checkAnswer());
        this.newExerciseBtn.addEventListener('click', () => this.generateNewExercise());
        this.resetBtn.addEventListener('click', () => this.resetStats());
        this.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAnswer();
            }
        });
        
        // События для пошагового решения
        this.prevStepBtn.addEventListener('click', () => this.previousStep());
        this.nextStepBtn.addEventListener('click', () => this.nextStep());
        this.showSolutionBtn.addEventListener('click', () => this.toggleSolution());
        
        // События для режима тестирования
        this.practiceModeBtn.addEventListener('click', () => this.switchToPracticeMode());
        this.testModeBtn.addEventListener('click', () => this.switchToTestMode());
        this.retakeTestBtn.addEventListener('click', () => this.startTest());
        this.downloadResultsBtn.addEventListener('click', () => this.downloadResults());
    }

    generateRandomDecimal(min, max, decimals) {
        const random = Math.random() * (max - min) + min;
        return parseFloat(random.toFixed(decimals));
    }

    generateNewExercise() {
        // Генерируем случайные десятичные дроби
        const num1 = this.generateRandomDecimal(0.1, 99.9, 2);
        const num2 = this.generateRandomDecimal(0.1, 99.9, 2);
        
        // Случайно выбираем операцию
        const operations = ['+', '-'];
        const operator = operations[Math.floor(Math.random() * operations.length)];
        
        // Вычисляем правильный ответ
        if (operator === '+') {
            this.currentAnswer = parseFloat((num1 + num2).toFixed(2));
        } else {
            // Для вычитания убеждаемся, что результат положительный
            if (num1 < num2) {
                [num1, num2] = [num2, num1]; // Меняем местами
            }
            this.currentAnswer = parseFloat((num1 - num2).toFixed(2));
        }
        
        // Обновляем отображение
        this.num1Element.textContent = num1.toFixed(2);
        this.num2Element.textContent = num2.toFixed(2);
        this.operatorElement.textContent = operator;
        
        // Очищаем поле ввода и результат
        this.answerInput.value = '';
        this.resultElement.textContent = '';
        this.resultElement.className = 'result';
        
        // Создаем пошаговое решение
        this.createStepByStepSolution(num1, num2, operator);
        
        // Фокусируемся на поле ввода
        this.answerInput.focus();
    }



    showResult(message, type) {
        this.resultElement.textContent = message;
        this.resultElement.className = `result ${type}`;
    }

    updateStats() {
        this.correctCountElement.textContent = this.correctCount;
        this.totalCountElement.textContent = this.totalCount;
        
        const percentage = this.totalCount > 0 ? Math.round((this.correctCount / this.totalCount) * 100) : 0;
        this.percentageElement.textContent = `${percentage}%`;
    }

    resetStats() {
        this.correctCount = 0;
        this.totalCount = 0;
        this.updateStats();
        this.generateNewExercise();
    }

    createStepByStepSolution(num1, num2, operator) {
        this.solutionSteps = [];
        this.currentStep = 0;
        
        if (operator === '+') {
            this.createAdditionSteps(num1, num2);
        } else {
            this.createSubtractionSteps(num1, num2);
        }
        
        this.renderStepByStep();
        this.updateStepControls();
    }

    createAdditionSteps(num1, num2) {
        const num1Str = num1.toFixed(2);
        const num2Str = num2.toFixed(2);
        const result = (num1 + num2).toFixed(2);
        
        // Шаг 1: Записываем числа столбиком
        this.solutionSteps.push({
            title: "Step 1: Write numbers in columns",
            content: `
                <div class="explanation">
                    <strong>Rule:</strong> When adding decimal numbers, write the numbers so that the commas are aligned.
                </div>
                <div class="calculation-grid">
                    <div class="number">${num1Str}</div>
                    <div class="operator">+</div>
                    <div class="number">${num2Str}</div>
                </div>
            `
        });
        
        // Шаг 2: Складываем по разрядам
        const num1Parts = num1Str.split('.');
        const num2Parts = num2Str.split('.');
        const resultParts = result.split('.');
        
        let carryOver = 0;
        let step2Content = `
            <div class="explanation">
                <strong>Add digits from right to left:</strong>
            </div>
            <div style="font-family: 'Courier New', monospace; font-size: 1.2em; text-align: center; margin: 20px 0;">
        `;
        
        // Складываем дробные части
        const fraction1 = parseInt(num1Parts[1] || '0');
        const fraction2 = parseInt(num2Parts[1] || '0');
        const fractionSum = fraction1 + fraction2;
        
        if (fractionSum >= 100) {
            carryOver = 1;
            step2Content += `
                <div style="margin: 10px 0;">
                    <span style="color: #dc3545; font-weight: bold;">1</span><br>
                    ${num1Str}<br>
                    + ${num2Str}<br>
                    <hr style="border: 1px solid #ccc;">
                    ${result}
                </div>
                <div class="explanation">
                    <strong>Explanation:</strong> ${fraction1} + ${fraction2} = ${fractionSum}. 
                    Write ${fractionSum % 100} in the fractional part, ${Math.floor(fractionSum / 100)} carry over to the integer part.
                </div>
            `;
        } else {
            step2Content += `
                <div style="margin: 10px 0;">
                    ${num1Str}<br>
                    + ${num2Str}<br>
                    <hr style="border: 1px solid #ccc;">
                    ${result}
                </div>
                <div class="explanation">
                    <strong>Explanation:</strong> ${fraction1} + ${fraction2} = ${fractionSum}. 
                    Write ${fractionSum} in the fractional part.
                </div>
            `;
        }
        
        step2Content += '</div>';
        
        this.solutionSteps.push({
            title: "Step 2: Add digits from right to left",
            content: step2Content
        });
        
        // Шаг 3: Финальный результат
        this.solutionSteps.push({
            title: "Step 3: Get the result",
            content: `
                <div class="explanation">
                    <strong>Answer:</strong> ${num1} + ${num2} = ${result}
                </div>
                <div class="calculation-grid">
                    <div class="number">${num1Str}</div>
                    <div class="operator">+</div>
                    <div class="number">${num2Str}</div>
                    <div class="result">${result}</div>
                </div>
            `
        });
    }

    createSubtractionSteps(num1, num2) {
        const num1Str = num1.toFixed(2);
        const num2Str = num2.toFixed(2);
        const result = (num1 - num2).toFixed(2);
        
        // Шаг 1: Записываем числа столбиком
        this.solutionSteps.push({
            title: "Step 1: Write numbers in columns",
            content: `
                <div class="explanation">
                    <strong>Rule:</strong> When subtracting decimal numbers, write the numbers so that the commas are aligned.
                </div>
                <div class="calculation-grid">
                    <div class="number">${num1Str}</div>
                    <div class="operator">-</div>
                    <div class="number">${num2Str}</div>
                </div>
            `
        });
        
        // Шаг 2: Вычитаем по разрядам
        const num1Parts = num1Str.split('.');
        const num2Parts = num2Str.split('.');
        
        let step2Content = `
            <div class="explanation">
                <strong>Subtract digits from right to left:</strong>
            </div>
            <div style="font-family: 'Courier New', monospace; font-size: 1.2em; text-align: center; margin: 20px 0;">
        `;
        
        // Вычитаем дробные части
        const fraction1 = parseInt(num1Parts[1] || '0');
        const fraction2 = parseInt(num2Parts[1] || '0');
        
        if (fraction1 >= fraction2) {
            step2Content += `
                <div style="margin: 10px 0;">
                    ${num1Str}<br>
                    - ${num2Str}<br>
                    <hr style="border: 1px solid #ccc;">
                    ${result}
                </div>
                <div class="explanation">
                    <strong>Explanation:</strong> ${fraction1} - ${fraction2} = ${fraction1 - fraction2}. 
                    Write ${fraction1 - fraction2} in the fractional part.
                </div>
            `;
        } else {
            step2Content += `
                <div style="margin: 10px 0;">
                    ${num1Str}<br>
                    - ${num2Str}<br>
                    <hr style="border: 1px solid #ccc;">
                    ${result}
                </div>
                <div class="explanation">
                    <strong>Explanation:</strong> ${fraction1} is less than ${fraction2}, so we borrow 1 from the integer part. 
                    ${fraction1 + 100} - ${fraction2} = ${fraction1 + 100 - fraction2}.
                </div>
            `;
        }
        
        step2Content += '</div>';
        
        this.solutionSteps.push({
            title: "Step 2: Subtract digits from right to left",
            content: step2Content
        });
        
        // Шаг 3: Финальный результат
        this.solutionSteps.push({
            title: "Step 3: Get the result",
            content: `
                <div class="explanation">
                    <strong>Answer:</strong> ${num1} - ${num2} = ${result}
                </div>
                <div class="calculation-grid">
                    <div class="number">${num1Str}</div>
                    <div class="operator">-</div>
                    <div class="number">${num2Str}</div>
                    <div class="result">${result}</div>
                </div>
            `
        });
    }

    renderStepByStep() {
        this.solutionStepsElement.innerHTML = '';
        
        this.solutionSteps.forEach((step, index) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = `step-content ${index === 0 ? 'active' : ''}`;
            stepDiv.innerHTML = `
                <h4>${step.title}</h4>
                ${step.content}
            `;
            this.solutionStepsElement.appendChild(stepDiv);
        });
    }

    updateStepControls() {
        this.prevStepBtn.disabled = this.currentStep === 0;
        this.nextStepBtn.disabled = this.currentStep === this.solutionSteps.length - 1;
        this.stepCounterElement.textContent = `Step ${this.currentStep + 1} of ${this.solutionSteps.length}`;
    }

    previousStep() {
        if (this.currentStep > 0) {
            document.querySelectorAll('.step-content').forEach((step, index) => {
                step.classList.toggle('active', index === this.currentStep - 1);
            });
            this.currentStep--;
            this.updateStepControls();
        }
    }

    nextStep() {
        if (this.currentStep < this.solutionSteps.length - 1) {
            document.querySelectorAll('.step-content').forEach((step, index) => {
                step.classList.toggle('active', index === this.currentStep + 1);
            });
            this.currentStep++;
            this.updateStepControls();
        }
    }

    toggleSolution() {
        const isVisible = this.stepByStepElement.style.display !== 'none';
        this.stepByStepElement.style.display = isVisible ? 'none' : 'block';
        this.showSolutionBtn.textContent = isVisible ? 'Show solution' : 'Hide solution';
        
        if (!isVisible) {
            // Показываем первый шаг при открытии
            this.currentStep = 0;
            this.renderStepByStep();
            this.updateStepControls();
        }
    }

    // Методы для режима тестирования
    switchToPracticeMode() {
        this.isTestMode = false;
        this.practiceModeBtn.classList.add('active');
        this.testModeBtn.classList.remove('active');
        this.testResultsElement.style.display = 'none';
        this.stepByStepElement.style.display = 'none';
        this.showSolutionBtn.style.display = 'inline-block';
        this.resetStats();
        this.generateNewExercise();
    }

    switchToTestMode() {
        this.isTestMode = true;
        this.testModeBtn.classList.add('active');
        this.practiceModeBtn.classList.remove('active');
        this.stepByStepElement.style.display = 'none';
        this.showSolutionBtn.style.display = 'none';
        this.startTest();
    }

    startTest() {
        this.testQuestions = [];
        this.currentTestQuestion = 0;
        this.testResults = [];
        this.testStartTime = new Date();
        
        // Generate 10 questions for the test
        for (let i = 0; i < 10; i++) {
            let num1 = this.generateRandomDecimal(0.1, 99.9, 2);
            let num2 = this.generateRandomDecimal(0.1, 99.9, 2);
            const operations = ['+', '-'];
            const operator = operations[Math.floor(Math.random() * operations.length)];
            
            let correctAnswer;
            let displayNum1 = num1;
            let displayNum2 = num2;
            if (operator === '+') {
                correctAnswer = parseFloat((num1 + num2).toFixed(2));
            } else {
                if (num1 < num2) {
                    [displayNum1, displayNum2] = [num2, num1];
                }
                correctAnswer = parseFloat((displayNum1 - displayNum2).toFixed(2));
            }
            
            this.testQuestions.push({
                num1: displayNum1,
                num2: displayNum2,
                operator: operator,
                correctAnswer: correctAnswer,
                userAnswer: null,
                isCorrect: false
            });
        }
        
        this.showTestQuestion();
        this.testResultsElement.style.display = 'none';
    }

    showTestQuestion() {
        if (this.currentTestQuestion >= this.testQuestions.length) {
            this.finishTest();
            return;
        }
        
        const question = this.testQuestions[this.currentTestQuestion];
        this.num1Element.textContent = question.num1.toFixed(2);
        this.num2Element.textContent = question.num2.toFixed(2);
        this.operatorElement.textContent = question.operator;
        this.currentAnswer = question.correctAnswer;
        
        this.answerInput.value = '';
        this.resultElement.textContent = '';
        this.resultElement.className = 'result';
        
        // Обновляем счетчик вопросов
        const questionCounter = document.createElement('div');
        questionCounter.style.cssText = 'text-align: center; margin: 10px 0; font-weight: bold; color: #007bff;';
        questionCounter.textContent = `Question ${this.currentTestQuestion + 1} of ${this.testQuestions.length}`;
        
        // Удаляем предыдущий счетчик, если есть
        const existingCounter = document.querySelector('.question-counter');
        if (existingCounter) {
            existingCounter.remove();
        }
        
        questionCounter.className = 'question-counter';
        this.answerInput.parentNode.insertBefore(questionCounter, this.answerInput);
        
        this.answerInput.focus();
    }

    checkAnswer() {
        const userAnswer = parseFloat(this.answerInput.value);
        
        if (isNaN(userAnswer)) {
            this.showResult('Please enter a number!', 'incorrect');
            return;
        }
        
        if (this.isTestMode) {
            this.checkTestAnswer(userAnswer);
        } else {
            this.checkPracticeAnswer(userAnswer);
        }
    }

    checkPracticeAnswer(userAnswer) {
        this.totalCount++;
        
        const isCorrect = Math.abs(userAnswer - this.currentAnswer) < 0.01;
        
        if (isCorrect) {
            this.correctCount++;
            this.showResult(`✅ Correct! ${this.num1Element.textContent} ${this.operatorElement.textContent} ${this.num2Element.textContent} = ${this.currentAnswer}`, 'correct');
        } else {
            this.showResult(`❌ Incorrect! The correct answer is: ${this.currentAnswer}. Please check the step-by-step solution below.`, 'incorrect');
            this.stepByStepElement.style.display = 'block';
            this.showSolutionBtn.textContent = 'Hide solution';
            this.currentStep = 0;
            this.renderStepByStep();
            this.updateStepControls();
        }
        
        this.updateStats();
        
        setTimeout(() => {
            this.generateNewExercise();
        }, 3000);
    }

    checkTestAnswer(userAnswer) {
        const question = this.testQuestions[this.currentTestQuestion];
        question.userAnswer = userAnswer;
        question.isCorrect = Math.abs(userAnswer - question.correctAnswer) < 0.01;
        
        if (question.isCorrect) {
            this.showResult(`✅ Correct!`, 'correct');
        } else {
            this.showResult(`❌ Incorrect! The correct answer is: ${question.correctAnswer}`, 'incorrect');
        }
        
        this.testResults.push({
            question: question,
            time: new Date()
        });
        
        this.currentTestQuestion++;
        
        setTimeout(() => {
            this.showTestQuestion();
        }, 1500);
    }

    finishTest() {
        const correctAnswers = this.testResults.filter(r => r.question.isCorrect).length;
        const totalQuestions = this.testQuestions.length;
        const percentage = Math.round((correctAnswers / totalQuestions) * 100);
        const grade = this.calculateGrade(percentage);
        
        this.testCorrectElement.textContent = correctAnswers;
        this.testTotalElement.textContent = totalQuestions;
        this.testPercentageElement.textContent = `${percentage}%`;
        this.testGradeElement.textContent = grade;
        
        this.renderTestDetails();
        this.testResultsElement.style.display = 'block';
        
        // Скрываем счетчик вопросов
        const questionCounter = document.querySelector('.question-counter');
        if (questionCounter) {
            questionCounter.remove();
        }
    }

    calculateGrade(percentage) {
        if (percentage >= 90) return '5 (Excellent)';
        if (percentage >= 75) return '4 (Good)';
        if (percentage >= 60) return '3 (Satisfactory)';
        if (percentage >= 40) return '2 (Poor)';
        return '1 (Very Poor)';
    }

    renderTestDetails() {
        this.testDetailsElement.innerHTML = '';
        
        this.testResults.forEach((result, index) => {
            const question = result.question;
            const questionDiv = document.createElement('div');
            questionDiv.className = `test-question ${question.isCorrect ? 'correct' : 'incorrect'}`;
            
            questionDiv.innerHTML = `
                <div class="test-question-header">
                    <span class="test-question-text">
                        ${question.num1.toFixed(2)} ${question.operator} ${question.num2.toFixed(2)} = ${question.userAnswer}
                    </span>
                    <span class="test-question-result ${question.isCorrect ? 'correct' : 'incorrect'}">
                        ${question.isCorrect ? '✓' : '✗'}
                    </span>
                </div>
                <div class="test-question-details">
                    ${question.isCorrect ? 
                        'Correct answer!' : 
                        `Correct answer: ${question.correctAnswer}`
                    }
                </div>
            `;
            
            this.testDetailsElement.appendChild(questionDiv);
        });
    }

    downloadResults() {
        const testData = {
            date: new Date().toLocaleString('ru-RU'),
            correctAnswers: this.testResults.filter(r => r.question.isCorrect).length,
            totalQuestions: this.testQuestions.length,
            percentage: Math.round((this.testResults.filter(r => r.question.isCorrect).length / this.testQuestions.length) * 100),
            grade: this.calculateGrade(Math.round((this.testResults.filter(r => r.question.isCorrect).length / this.testQuestions.length) * 100)),
            questions: this.testResults.map((result, index) => ({
                number: index + 1,
                question: `${result.question.num1.toFixed(2)} ${result.question.operator} ${result.question.num2.toFixed(2)}`,
                userAnswer: result.question.userAnswer,
                correctAnswer: result.question.correctAnswer,
                isCorrect: result.question.isCorrect
            }))
        };
        
        const dataStr = JSON.stringify(testData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `test_results_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new DecimalCalculator();
});

// Добавляем анимацию для чисел
function animateNumber(element, startValue, endValue, duration = 500) {
    const start = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentValue = startValue + (endValue - startValue) * progress;
        element.textContent = currentValue.toFixed(2);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
} 