// Global variables
let currentScore = 0;
let currentLevel = 1;
let gameActive = false;

// Initialization when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeVisualization();
    initializePractice();
    initializeGame();
    
    // Show first section by default
    showSection('theory');
});

// Navigation between sections
function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            
            // Update active button
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding section
            showSection(section);
        });
    });
}

function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// Decimal fraction visualization
function initializeVisualization() {
    const decimalInput = document.getElementById('decimal-input');
    const visualizeBtn = document.getElementById('visualize-btn');
    const gridContainer = document.getElementById('grid-container');
    
    // Create 10x10 grid
    createGrid(gridContainer, 10, 10);
    
    // Visualization button handler
    visualizeBtn.addEventListener('click', function() {
        const decimal = parseFloat(decimalInput.value);
        if (decimal >= 0 && decimal <= 1) {
            visualizeDecimal(decimal);
            updateFractionInfo(decimal);
        } else {
            alert('Please enter a number between 0 and 1');
        }
    });
    
    // Enter key handler in input field
    decimalInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            visualizeBtn.click();
        }
    });
    
    // Show initial visualization
    visualizeDecimal(0.5);
    updateFractionInfo(0.5);
}

function createGrid(container, rows, cols) {
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    
    for (let i = 0; i < rows * cols; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.setAttribute('data-index', i);
        container.appendChild(cell);
    }
}

function visualizeDecimal(decimal) {
    const cells = document.querySelectorAll('.grid-cell');
    const totalCells = cells.length;
    const filledCells = Math.round(decimal * totalCells);
    
    cells.forEach((cell, index) => {
        if (index < filledCells) {
            cell.classList.add('filled');
        } else {
            cell.classList.remove('filled');
        }
    });
}

function updateFractionInfo(decimal) {
    const fractionDisplay = document.getElementById('fraction-display');
    const decimalDisplay = document.getElementById('decimal-display');
    const percentDisplay = document.getElementById('percent-display');
    
    // Find simple fraction
    const fraction = decimalToFraction(decimal);
    
    fractionDisplay.textContent = fraction;
    decimalDisplay.textContent = decimal.toFixed(3);
    percentDisplay.textContent = `${(decimal * 100).toFixed(1)}%`;
}

function decimalToFraction(decimal) {
    // Simple cases for better understanding
    const simpleFractions = {
        0.25: '1/4',
        0.5: '1/2',
        0.75: '3/4',
        0.2: '1/5',
        0.4: '2/5',
        0.6: '3/5',
        0.8: '4/5',
        0.125: '1/8',
        0.375: '3/8',
        0.625: '5/8',
        0.875: '7/8',
        0.1: '1/10',
        0.3: '3/10',
        0.7: '7/10',
        0.9: '9/10'
    };
    
    // Round to 3 decimal places for comparison
    const rounded = Math.round(decimal * 1000) / 1000;
    
    if (simpleFractions[rounded]) {
        return simpleFractions[rounded];
    }
    
    // If no simple fraction, show decimal
    return `${Math.round(decimal * 100)}/100`;
}

// Practice exercises
function initializePractice() {
    // Exercise 1: Fraction conversion
    const checkFractionBtn = document.getElementById('check-fraction');
    checkFractionBtn.addEventListener('click', checkFractionConversion);
    
    // Exercise 2: Fraction comparison
    const checkComparisonBtn = document.getElementById('check-comparison');
    checkComparisonBtn.addEventListener('click', checkComparison);
    
    // Enter key handlers for input fields
    document.getElementById('numerator').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') checkFractionConversion();
    });
    
    document.getElementById('denominator').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') checkFractionConversion();
    });
    
    document.getElementById('decimal-result').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') checkFractionConversion();
    });
    
    document.getElementById('compare1').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') checkComparison();
    });
    
    document.getElementById('compare2').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') checkComparison();
    });
}

function checkFractionConversion() {
    const numerator = parseInt(document.getElementById('numerator').value);
    const denominator = parseInt(document.getElementById('denominator').value);
    const userResult = parseFloat(document.getElementById('decimal-result').value);
    const feedback = document.getElementById('fraction-feedback');
    
    if (isNaN(numerator) || isNaN(denominator) || isNaN(userResult)) {
        showFeedback(feedback, 'Please fill all fields with numbers', 'incorrect');
        return;
    }
    
    if (denominator === 0) {
        showFeedback(feedback, 'Denominator cannot be zero!', 'incorrect');
        return;
    }
    
    const correctResult = numerator / denominator;
    const tolerance = 0.001; // Acceptable error
    
    if (Math.abs(userResult - correctResult) < tolerance) {
        showFeedback(feedback, `Correct! ${numerator}/${denominator} = ${correctResult.toFixed(3)}`, 'correct');
    } else {
        showFeedback(feedback, `Incorrect. ${numerator}/${denominator} = ${correctResult.toFixed(3)}`, 'incorrect');
    }
}

function checkComparison() {
    const num1 = parseFloat(document.getElementById('compare1').value);
    const num2 = parseFloat(document.getElementById('compare2').value);
    const operator = document.getElementById('comparison-operator').value;
    const feedback = document.getElementById('comparison-feedback');
    
    if (isNaN(num1) || isNaN(num2)) {
        showFeedback(feedback, 'Please enter numbers', 'incorrect');
        return;
    }
    
    let isCorrect = false;
    let correctOperator = '';
    
    if (num1 < num2) {
        correctOperator = '<';
    } else if (num1 === num2) {
        correctOperator = '=';
    } else {
        correctOperator = '>';
    }
    
    isCorrect = operator === correctOperator;
    
    if (isCorrect) {
        showFeedback(feedback, `Correct! ${num1} ${operator} ${num2}`, 'correct');
    } else {
        showFeedback(feedback, `Incorrect. Correct answer: ${num1} ${correctOperator} ${num2}`, 'incorrect');
    }
}

function showFeedback(element, message, type) {
    element.textContent = message;
    element.className = `feedback ${type}`;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        element.textContent = '';
        element.className = 'feedback';
    }, 5000);
}

// Game
function initializeGame() {
    const nextQuestionBtn = document.getElementById('next-question');
    nextQuestionBtn.addEventListener('click', generateNewQuestion);
    
    // Start game
    generateNewQuestion();
}

function generateNewQuestion() {
    const targetFraction = document.getElementById('target-fraction');
    const optionsGrid = document.getElementById('options-grid');
    const nextQuestionBtn = document.getElementById('next-question');
    
    // Hide "Next Question" button
    nextQuestionBtn.style.display = 'none';
    
    // Generate target fraction based on level
    let targetDecimal;
    if (currentLevel <= 3) {
        // Simple fractions for initial levels
        const simpleDecimals = [0.25, 0.5, 0.75, 0.2, 0.4, 0.6, 0.8];
        targetDecimal = simpleDecimals[Math.floor(Math.random() * simpleDecimals.length)];
    } else if (currentLevel <= 6) {
        // More complex fractions
        targetDecimal = Math.round((Math.random() * 0.9 + 0.1) * 100) / 100;
    } else {
        // Random fractions with three decimal places
        targetDecimal = Math.round((Math.random() * 0.999) * 1000) / 1000;
    }
    
    targetFraction.textContent = targetDecimal.toFixed(3);
    
    // Generate answer options
    const options = generateOptions(targetDecimal);
    
    // Create buttons with options
    optionsGrid.innerHTML = '';
    options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.addEventListener('click', () => checkAnswer(option, targetDecimal, button));
        optionsGrid.appendChild(button);
    });
    
    gameActive = true;
}

function generateOptions(targetDecimal) {
    const options = [targetDecimal];
    
    // Generate wrong options
    while (options.length < 4) {
        let wrongOption;
        if (currentLevel <= 3) {
            // Simple wrong options
            wrongOption = Math.round((Math.random() * 0.9 + 0.1) * 100) / 100;
        } else {
            // More complex wrong options
            wrongOption = Math.round((Math.random() * 0.999) * 1000) / 1000;
        }
        
        // Ensure option is unique
        if (!options.includes(wrongOption)) {
            options.push(wrongOption);
        }
    }
    
    // Shuffle options
    return shuffleArray(options);
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function checkAnswer(selectedOption, targetDecimal, button) {
    if (!gameActive) return;
    
    gameActive = false;
    const tolerance = 0.001;
    const isCorrect = Math.abs(selectedOption - targetDecimal) < tolerance;
    
    if (isCorrect) {
        button.classList.add('correct');
        currentScore += currentLevel * 10;
        showFeedback(document.getElementById('comparison-feedback'), 'Correct! +' + (currentLevel * 10) + ' points', 'correct');
        
        // Increase level every 3 correct answers
        if (currentScore % (currentLevel * 30) === 0) {
            currentLevel++;
            showFeedback(document.getElementById('comparison-feedback'), `Level up! Now level ${currentLevel}`, 'correct');
        }
    } else {
        button.classList.add('incorrect');
        showFeedback(document.getElementById('comparison-feedback'), 'Incorrect! Try again', 'incorrect');
    }
    
    // Show correct answer
    const allButtons = document.querySelectorAll('.option-btn');
    allButtons.forEach(btn => {
        const btnValue = parseFloat(btn.textContent);
        if (Math.abs(btnValue - targetDecimal) < tolerance) {
            btn.classList.add('correct');
        }
    });
    
    // Update score and level
    document.getElementById('score').textContent = currentScore;
    document.getElementById('level').textContent = currentLevel;
    
    // Show "Next Question" button
    document.getElementById('next-question').style.display = 'block';
}

// Additional utilities
function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

function simplifyFraction(numerator, denominator) {
    const divisor = gcd(Math.abs(numerator), Math.abs(denominator));
    return [numerator / divisor, denominator / divisor];
} 