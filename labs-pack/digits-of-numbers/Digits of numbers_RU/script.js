// Названия разрядов
const digitNames = {
    0: 'единицы',
    1: 'десятки',
    2: 'сотни',
    3: 'тысячи',
    4: 'десять тысяч',
    5: 'сто тысяч',
    6: 'миллионы',
    7: 'десять миллионов',
    8: 'сто миллионов'
};

// Множители для каждого разряда
const multipliers = {
    0: 1,
    1: 10,
    2: 100,
    3: 1000,
    4: 10000,
    5: 100000,
    6: 1000000,
    7: 10000000,
    8: 100000000
};

// Элементы DOM
const numberInput = document.getElementById('numberInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const analysisSection = document.getElementById('analysisSection');
const numberDisplay = document.getElementById('numberDisplay');
const digitsGrid = document.getElementById('digitsGrid');
const explanation = document.getElementById('explanation');
const generateNumberBtn = document.getElementById('generateNumberBtn');
const clearBtn = document.getElementById('clearBtn');
const practiceArea = document.getElementById('practiceArea');
const practiceNumber = document.getElementById('practiceNumber');
const practiceInputs = document.getElementById('practiceInputs');
const checkAnswerBtn = document.getElementById('checkAnswerBtn');
const result = document.getElementById('result');

// Функция для разбора числа
function analyzeNumber(number) {
    const digits = number.toString().split('').reverse();
    const analysis = [];
    
    digits.forEach((digit, index) => {
        const value = parseInt(digit) * multipliers[index];
        analysis.push({
            digit: digit,
            position: index,
            name: digitNames[index] || `разряд ${index + 1}`,
            multiplier: multipliers[index],
            value: value
        });
    });
    
    return analysis.reverse();
}

// Функция для отображения разбора числа
function displayAnalysis(number) {
    const analysis = analyzeNumber(number);
    
    // Отображаем число
    numberDisplay.innerHTML = `<div class="number">${number}</div>`;
    
    // Создаем карточки для каждой цифры
    digitsGrid.innerHTML = '';
    analysis.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'digit-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <div class="digit">${item.digit}</div>
            <div class="position">${item.name}</div>
            <div class="value">${item.digit} × ${item.multiplier} = ${item.value}</div>
        `;
        
        digitsGrid.appendChild(card);
    });
    
    // Создаем объяснение
    const total = analysis.reduce((sum, item) => sum + item.value, 0);
    const explanationText = analysis.map(item => 
        `${item.digit} (${item.name}) = ${item.value}`
    ).join(' + ');
    
    explanation.innerHTML = `
        <h3>Разбор числа ${number}</h3>
        <p><strong>${explanationText} = ${total}</strong></p>
        <p>Каждая цифра в числе имеет своё место (разряд) и значение. 
        Значение цифры зависит от её позиции в числе.</p>
    `;
    
    analysisSection.style.display = 'block';
}

// Функция для генерации случайного числа
function generateRandomNumber() {
    const min = 100;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Функция для создания практического задания
function createPracticeTask() {
    const number = generateRandomNumber();
    const analysis = analyzeNumber(number);
    
    practiceNumber.textContent = number;
    
    // Создаем поля ввода для каждого разряда
    practiceInputs.innerHTML = '';
    analysis.forEach((item, index) => {
        const inputContainer = document.createElement('div');
        inputContainer.className = 'practice-input';
        
        const label = document.createElement('label');
        label.textContent = `${item.name}:`;
        
        const input = document.createElement('input');
        input.type = 'number';
        input.placeholder = 'Введите значение';
        input.dataset.position = item.position;
        input.dataset.correctValue = item.value;
        
        inputContainer.appendChild(label);
        inputContainer.appendChild(input);
        practiceInputs.appendChild(inputContainer);
    });
    
    practiceArea.style.display = 'block';
    result.innerHTML = '';
}

// Функция для проверки ответов
function checkAnswers() {
    const inputs = practiceInputs.querySelectorAll('input');
    let allCorrect = true;
    let correctCount = 0;
    let totalCount = inputs.length;
    
    inputs.forEach(input => {
        const userValue = parseInt(input.value) || 0;
        const correctValue = parseInt(input.dataset.correctValue);
        
        if (userValue === correctValue) {
            input.style.borderColor = '#68d391';
            input.style.backgroundColor = '#f0fff4';
            correctCount++;
        } else {
            input.style.borderColor = '#fc8181';
            input.style.backgroundColor = '#fff5f5';
            allCorrect = false;
        }
    });
    
    if (allCorrect) {
        result.innerHTML = `
            <div class="result correct">
                🎉 Отлично! Все ответы правильные! 
                Вы правильно разобрали число ${practiceNumber.textContent}.
            </div>
        `;
    } else {
        result.innerHTML = `
            <div class="result incorrect">
                📝 Правильных ответов: ${correctCount} из ${totalCount}. 
                Попробуйте ещё раз!
            </div>
        `;
    }
}

// Функция для очистки
function clearAll() {
    numberInput.value = '';
    analysisSection.style.display = 'none';
    practiceArea.style.display = 'none';
    result.innerHTML = '';
    
    // Сбрасываем стили полей ввода
    const inputs = practiceInputs.querySelectorAll('input');
    inputs.forEach(input => {
        input.style.borderColor = '#e2e8f0';
        input.style.backgroundColor = 'white';
    });
}

// Обработчики событий
analyzeBtn.addEventListener('click', () => {
    const number = parseInt(numberInput.value);
    if (number && number > 0) {
        displayAnalysis(number);
    } else {
        alert('Пожалуйста, введите положительное число!');
    }
});

numberInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        analyzeBtn.click();
    }
});

generateNumberBtn.addEventListener('click', createPracticeTask);

checkAnswerBtn.addEventListener('click', checkAnswers);

clearBtn.addEventListener('click', clearAll);

// Добавляем обработчики для полей ввода в практике
practiceInputs.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        checkAnswers();
    }
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Добавляем пример при загрузке
    numberInput.value = '1234';
    
    // Добавляем анимацию появления элементов
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            section.style.transition = 'all 0.5s ease';
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Добавляем интерактивность к карточкам теории
    const theoryCards = document.querySelectorAll('.theory-card');
    theoryCards.forEach(card => {
        card.addEventListener('click', () => {
            card.style.transform = 'scale(1.02)';
            setTimeout(() => {
                card.style.transform = 'scale(1)';
            }, 200);
        });
    });
});

// Функция для добавления звуковых эффектов (опционально)
function playSound(type) {
    // Здесь можно добавить звуковые эффекты
    // Например, для правильных/неправильных ответов
    console.log(`Playing ${type} sound`);
}

// Функция для сохранения прогресса (опционально)
function saveProgress() {
    const progress = {
        lastNumber: numberInput.value,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('numberAnalysisProgress', JSON.stringify(progress));
}

// Функция для загрузки прогресса (опционально)
function loadProgress() {
    const saved = localStorage.getItem('numberAnalysisProgress');
    if (saved) {
        const progress = JSON.parse(saved);
        numberInput.value = progress.lastNumber || '';
    }
}

// Загружаем прогресс при загрузке страницы
document.addEventListener('DOMContentLoaded', loadProgress);

// Сохраняем прогресс при анализе числа
analyzeBtn.addEventListener('click', saveProgress); 