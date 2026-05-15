// Place value names
const digitNames = {
    0: 'ones',
    1: 'tens',
    2: 'hundreds',
    3: 'thousands',
    4: 'ten thousands',
    5: 'hundred thousands',
    6: 'millions',
    7: 'ten millions',
    8: 'hundred millions'
};

// Multipliers for each place value
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

// DOM elements
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

// Function to analyze a number
function analyzeNumber(number) {
    const digits = number.toString().split('').reverse();
    const analysis = [];
    
    digits.forEach((digit, index) => {
        const value = parseInt(digit) * multipliers[index];
        analysis.push({
            digit: digit,
            position: index,
            name: digitNames[index] || `place value ${index + 1}`,
            multiplier: multipliers[index],
            value: value
        });
    });
    
    return analysis.reverse();
}

// Function to display number analysis
function displayAnalysis(number) {
    const analysis = analyzeNumber(number);
    
    // Display the number
    numberDisplay.innerHTML = `<div class="number">${number}</div>`;
    
    // Create cards for each digit
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
    
    // Create explanation
    const total = analysis.reduce((sum, item) => sum + item.value, 0);
    const explanationText = analysis.map(item => 
        `${item.digit} (${item.name}) = ${item.value}`
    ).join(' + ');
    
    explanation.innerHTML = `
        <h3>Analysis of number ${number}</h3>
        <p><strong>${explanationText} = ${total}</strong></p>
        <p>Each digit in a number has its own place (position) and value. 
        The value of a digit depends on its position in the number.</p>
    `;
    
    analysisSection.style.display = 'block';
}

// Function to generate random number
function generateRandomNumber() {
    const min = 100;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to create practice task
function createPracticeTask() {
    const number = generateRandomNumber();
    const analysis = analyzeNumber(number);
    
    practiceNumber.textContent = number;
    
    // Create input fields for each place value
    practiceInputs.innerHTML = '';
    analysis.forEach((item, index) => {
        const inputContainer = document.createElement('div');
        inputContainer.className = 'practice-input';
        
        const label = document.createElement('label');
        label.textContent = `${item.name}:`;
        
        const input = document.createElement('input');
        input.type = 'number';
        input.placeholder = 'Enter value';
        input.dataset.position = item.position;
        input.dataset.correctValue = item.value;
        
        inputContainer.appendChild(label);
        inputContainer.appendChild(input);
        practiceInputs.appendChild(inputContainer);
    });
    
    practiceArea.style.display = 'block';
    result.innerHTML = '';
}

// Function to check answers
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
                🎉 Excellent! All answers are correct! 
                You correctly broke down the number ${practiceNumber.textContent}.
            </div>
        `;
    } else {
        result.innerHTML = `
            <div class="result incorrect">
                📝 Correct answers: ${correctCount} out of ${totalCount}. 
                Try again!
            </div>
        `;
    }
}

// Function to clear everything
function clearAll() {
    numberInput.value = '';
    analysisSection.style.display = 'none';
    practiceArea.style.display = 'none';
    result.innerHTML = '';
    
    // Reset input field styles
    const inputs = practiceInputs.querySelectorAll('input');
    inputs.forEach(input => {
        input.style.borderColor = '#e2e8f0';
        input.style.backgroundColor = 'white';
    });
}

// Event handlers
analyzeBtn.addEventListener('click', () => {
    const number = parseInt(numberInput.value);
    if (number && number > 0) {
        displayAnalysis(number);
    } else {
        alert('Please enter a positive number!');
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

// Add handlers for practice input fields
practiceInputs.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        checkAnswers();
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Add example on load
    numberInput.value = '1234';
    
    // Add animation for element appearance
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
    
    // Add interactivity to theory cards
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

// Function to add sound effects (optional)
function playSound(type) {
    // Sound effects can be added here
    // For example, for correct/incorrect answers
    console.log(`Playing ${type} sound`);
}

// Function to save progress (optional)
function saveProgress() {
    const progress = {
        lastNumber: numberInput.value,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('numberAnalysisProgress', JSON.stringify(progress));
}

// Function to load progress (optional)
function loadProgress() {
    const saved = localStorage.getItem('numberAnalysisProgress');
    if (saved) {
        const progress = JSON.parse(saved);
        numberInput.value = progress.lastNumber || '';
    }
}

// Load progress on page load
document.addEventListener('DOMContentLoaded', loadProgress);

// Save progress when analyzing number
analyzeBtn.addEventListener('click', saveProgress); 