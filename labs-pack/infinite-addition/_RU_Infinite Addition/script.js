class AdditionLab {
    constructor() {
        this.currentProblem = null;
        this.stats = {
            solved: 0,
            correct: 0
        };
        
        this.initializeElements();
        this.bindEvents();
        this.generateNewProblem();
        this.updateStats();
    }

    initializeElements() {
        this.digitsSelect = document.getElementById('digits');
        this.generateBtn = document.getElementById('generateBtn');
        this.checkBtn = document.getElementById('checkBtn');
        this.showSolutionBtn = document.getElementById('showSolutionBtn');
        this.problemDisplay = document.getElementById('problemDisplay');
        this.solutionWorkspace = document.getElementById('solutionWorkspace');
        this.resultMessage = document.getElementById('resultMessage');
        
        // Статистика
        this.solvedCount = document.getElementById('solvedCount');
        this.correctCount = document.getElementById('correctCount');
        this.successRate = document.getElementById('successRate');
    }

    bindEvents() {
        this.generateBtn.addEventListener('click', () => this.generateNewProblem());
        this.checkBtn.addEventListener('click', () => this.checkAnswer());
        this.showSolutionBtn.addEventListener('click', () => this.showSolution());
        this.digitsSelect.addEventListener('change', () => this.generateNewProblem());
    }

    generateNewProblem() {
        const digits = parseInt(this.digitsSelect.value);
        this.currentProblem = this.createProblem(digits);
        this.displayProblem();
        this.createSolutionInputs();
        this.hideResult();
    }

    createProblem(digits) {
        const numbers = [];
        for (let i = 0; i < 3; i++) {
            const min = Math.pow(10, digits - 1);
            const max = Math.pow(10, digits) - 1;
            numbers.push(Math.floor(Math.random() * (max - min + 1)) + min);
        }
        
        const sum = numbers.reduce((a, b) => a + b, 0);
        
        return {
            numbers: numbers,
            sum: sum,
            digits: digits,
            steps: this.calculateSteps(numbers)
        };
    }

    calculateSteps(numbers) {
        const steps = [];
        const maxDigits = Math.max(...numbers.map(n => n.toString().length));
        
        for (let position = 0; position < maxDigits; position++) {
            const digits = numbers.map(num => {
                const str = num.toString();
                return position < str.length ? parseInt(str[str.length - 1 - position]) : 0;
            });
            
            const sum = digits.reduce((a, b) => a + b, 0);
            const carry = Math.floor(sum / 10);
            const remainder = sum % 10;
            
            steps.push({
                position: position,
                digits: digits,
                sum: sum,
                carry: carry,
                remainder: remainder
            });
        }
        
        return steps.reverse();
    }

    displayProblem() {
        const numbers = this.currentProblem.numbers;
        const steps = this.currentProblem.steps;
        const maxLength = Math.max(...numbers.map(n => n.toString().length));
        
        let html = '<div style="font-family: monospace; font-size: 1.5rem; text-align: right;">';
        
        // Строка для переносов (изначально скрыта)
        let carryRow = '<div id="carryRow" style="margin-bottom: 5px; color: #e74c3c; font-size: 1rem; opacity: 0; transition: opacity 0.3s;">';
        for (let i = 0; i < maxLength; i++) {
            const step = steps.find(s => s.position === maxLength - 1 - i);
            if (step && step.carry > 0) {
                carryRow += `<span class="carry-digit" data-position="${i}" style="margin: 0 2px; display: none;">${step.carry}</span>`;
            } else {
                carryRow += '<span style="margin: 0 2px;">&nbsp;</span>';
            }
        }
        carryRow += '</div>';
        html += carryRow;
        
        // Отображаем числа в столбик
        numbers.forEach((num, index) => {
            const numStr = num.toString().padStart(maxLength);
            html += `<div class="addition-display">${numStr}</div>`;
        });
        
        // Добавляем линию для суммы
        html += `<div class="addition-display sum-line">${'─'.repeat(maxLength)}</div>`;
        
        // Добавляем кнопку для показа переносов
        html += '<div style="text-align: center; margin-top: 15px;">';
        html += '<button id="showCarryBtn" class="btn-info" style="font-size: 0.9rem; padding: 8px 16px;">👁️ Показать переносы</button>';
        html += '</div>';
        
        html += '</div>';
        
        this.problemDisplay.innerHTML = html;
        
        // Добавляем обработчик для кнопки показа переносов
        const showCarryBtn = document.getElementById('showCarryBtn');
        if (showCarryBtn) {
            showCarryBtn.addEventListener('click', () => this.toggleCarryDisplay());
        }
    }

    createSolutionInputs() {
        const sumStr = this.currentProblem.sum.toString();
        const maxLength = Math.max(...this.currentProblem.numbers.map(n => n.toString().length));
        
        let html = '<div style="text-align: right; font-family: monospace; font-size: 1.3rem;">';
        
        // Показываем числа для справки
        this.currentProblem.numbers.forEach(num => {
            html += `<div style="margin-bottom: 5px;">${num.toString().padStart(maxLength)}</div>`;
        });
        
        // Линия
        html += `<div style="border-top: 2px solid #333; margin: 5px 0; padding-top: 5px;">`;
        
        // Поля для ввода ответа
        for (let i = 0; i < sumStr.length; i++) {
            html += `<input type="text" class="digit-input" data-position="${i}" maxlength="1" style="width: 30px; text-align: center; margin: 0 2px;">`;
        }
        
        html += '</div>';
        
        this.solutionWorkspace.innerHTML = html;
        this.solutionWorkspace.classList.remove('empty');
        
        // Добавляем обработчики для полей ввода
        const inputs = this.solutionWorkspace.querySelectorAll('.digit-input');
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const value = e.target.value;
                if (value && /^\d$/.test(value)) {
                    // Автоматически переходим к следующему полю
                    const nextInput = input.nextElementSibling;
                    if (nextInput && nextInput.classList.contains('digit-input')) {
                        nextInput.focus();
                    }
                } else if (value && !/^\d$/.test(value)) {
                    e.target.value = '';
                }
            });
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value) {
                    // Переходим к предыдущему полю при удалении
                    const prevInput = input.previousElementSibling;
                    if (prevInput && prevInput.classList.contains('digit-input')) {
                        prevInput.focus();
                    }
                }
            });
        });
    }

    checkAnswer() {
        const inputs = this.solutionWorkspace.querySelectorAll('.digit-input');
        const userAnswer = Array.from(inputs).map(input => input.value).join('');
        const correctAnswer = this.currentProblem.sum.toString();
        
        this.stats.solved++;
        
        if (userAnswer === correctAnswer) {
            this.stats.correct++;
            this.showResult('Правильно! 🎉 Отличная работа!', 'success');
            this.highlightCorrectAnswer();
        } else {
            this.showResult(`Неправильно. Правильный ответ: ${correctAnswer}`, 'error');
            this.highlightIncorrectAnswer(userAnswer, correctAnswer);
        }
        
        this.updateStats();
    }

    showSolution() {
        const steps = this.currentProblem.steps;
        const numbers = this.currentProblem.numbers;
        const maxLength = Math.max(...numbers.map(n => n.toString().length));
        
        let html = '<div style="font-family: monospace; font-size: 1.2rem; text-align: right;">';
        
        // Показываем числа в столбик с переносами
        html += '<div style="margin-bottom: 20px;">';
        
        // Строка для переносов
        let carryRow = '<div style="margin-bottom: 5px; color: #e74c3c; font-size: 0.9rem;">';
        for (let i = 0; i < maxLength; i++) {
            const step = steps.find(s => s.position === maxLength - 1 - i);
            if (step && step.carry > 0) {
                carryRow += `<span style="margin: 0 2px;">${step.carry}</span>`;
            } else {
                carryRow += '<span style="margin: 0 2px;">&nbsp;</span>';
            }
        }
        carryRow += '</div>';
        html += carryRow;
        
        // Показываем числа
        numbers.forEach(num => {
            const numStr = num.toString().padStart(maxLength);
            html += `<div style="margin-bottom: 5px;">${numStr}</div>`;
        });
        
        // Линия
        html += `<div style="border-top: 2px solid #333; margin: 5px 0; padding-top: 5px;">`;
        
        // Показываем результат по разрядам
        const resultStr = this.currentProblem.sum.toString().padStart(maxLength);
        html += `${resultStr}</div>`;
        html += '</div>';
        
        // Детальное объяснение
        html += '<div style="text-align: left; margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">';
        html += '<h4 style="margin-bottom: 15px; color: #333;">📝 Пошаговое объяснение:</h4>';
        
        steps.forEach((step, index) => {
            const positionName = ['единиц', 'десятков', 'сотен', 'тысяч', 'десятков тысяч'][step.position] || `${step.position + 1}-го разряда`;
            
            html += `<div style="margin-bottom: 15px; padding: 10px; border-left: 3px solid #667eea; background: white;">`;
            html += `<strong>Шаг ${index + 1}: Сложение ${positionName}</strong><br>`;
            
            if (step.carry > 0) {
                html += `<span style="color: #e74c3c;">➕ Перенос из предыдущего разряда: ${step.carry}</span><br>`;
            }
            
            html += `Складываем: `;
            step.digits.forEach((digit, digitIndex) => {
                html += `<span style="font-weight: bold; color: #667eea;">${digit}</span>`;
                if (digitIndex < step.digits.length - 1) html += ' + ';
            });
            
            if (step.carry > 0) {
                html += ` + <span style="color: #e74c3c; font-weight: bold;">${step.carry}</span>`;
            }
            
            html += ` = <span style="font-weight: bold; color: #28a745;">${step.sum}</span><br>`;
            html += `Записываем: <span style="font-weight: bold;">${step.remainder}</span>`;
            
            if (step.carry > 0 && step.position < maxLength - 1) {
                html += `, переносим: <span style="color: #e74c3c; font-weight: bold;">${step.carry}</span> в следующий разряд`;
            }
            
            html += '</div>';
        });
        
        html += `<div style="margin-top: 15px; padding: 10px; background: #d4edda; border-radius: 5px; text-align: center;">`;
        html += `<strong>🎯 Итоговый результат: ${this.currentProblem.sum}</strong>`;
        html += '</div>';
        html += '</div>';
        
        this.solutionWorkspace.innerHTML = html;
        this.solutionWorkspace.classList.remove('empty');
    }

    highlightCorrectAnswer() {
        const inputs = this.solutionWorkspace.querySelectorAll('.digit-input');
        inputs.forEach(input => {
            input.classList.add('correct');
        });
    }

    highlightIncorrectAnswer(userAnswer, correctAnswer) {
        const inputs = this.solutionWorkspace.querySelectorAll('.digit-input');
        const userDigits = userAnswer.split('');
        const correctDigits = correctAnswer.split('');
        
        inputs.forEach((input, index) => {
            if (index < userDigits.length && index < correctDigits.length) {
                if (userDigits[index] === correctDigits[index]) {
                    input.classList.add('correct');
                } else {
                    input.classList.add('incorrect');
                }
            } else if (index < correctDigits.length) {
                input.classList.add('incorrect');
            }
        });
    }

    showResult(message, type) {
        this.resultMessage.textContent = message;
        this.resultMessage.className = `result-message ${type}`;
    }

    hideResult() {
        this.resultMessage.className = 'result-message';
    }

    toggleCarryDisplay() {
        const carryRow = document.getElementById('carryRow');
        const showCarryBtn = document.getElementById('showCarryBtn');
        const carryDigits = document.querySelectorAll('.carry-digit');
        
        if (carryRow.style.opacity === '1') {
            // Скрываем переносы
            carryRow.style.opacity = '0';
            carryDigits.forEach(digit => digit.style.display = 'none');
            showCarryBtn.textContent = '👁️ Показать переносы';
            showCarryBtn.style.background = 'linear-gradient(45deg, #2196F3, #21CBF3)';
        } else {
            // Показываем переносы
            carryRow.style.opacity = '1';
            carryDigits.forEach(digit => digit.style.display = 'inline');
            showCarryBtn.textContent = '🙈 Скрыть переносы';
            showCarryBtn.style.background = 'linear-gradient(45deg, #ff9800, #ff5722)';
        }
    }

    updateStats() {
        this.solvedCount.textContent = this.stats.solved;
        this.correctCount.textContent = this.stats.correct;
        
        const successRate = this.stats.solved > 0 
            ? Math.round((this.stats.correct / this.stats.solved) * 100) 
            : 0;
        this.successRate.textContent = `${successRate}%`;
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    new AdditionLab();
}); 