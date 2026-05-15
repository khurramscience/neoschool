// Global variables for statistics
let totalExercises = 0;
let correctAnswers = 0;
let currentExercise = null;

// DOM elements
const numberInput = document.getElementById('numberInput');
const decimalPlaces = document.getElementById('decimalPlaces');
const roundBtn = document.getElementById('roundBtn');
const resultSection = document.getElementById('resultSection');
const originalNumber = document.getElementById('originalNumber');
const roundedNumber = document.getElementById('roundedNumber');
const explanation = document.getElementById('explanation');

const generateExerciseBtn = document.getElementById('generateExercise');
const checkAnswerBtn = document.getElementById('checkAnswer');
const exerciseDisplay = document.getElementById('exerciseDisplay');
const exerciseText = document.getElementById('exerciseText');
const userAnswer = document.getElementById('userAnswer');
const exerciseResult = document.getElementById('exerciseResult');

const totalExercisesEl = document.getElementById('totalExercises');
const correctAnswersEl = document.getElementById('correctAnswers');
const accuracyEl = document.getElementById('accuracy');

// Function to round a number
function roundNumber(number, decimalPlaces) {
    const multiplier = Math.pow(10, decimalPlaces);
    return Math.round(number * multiplier) / multiplier;
}

// Function to get rounding explanation
function getExplanation(original, rounded, decimalPlaces) {
    const originalStr = original.toString();
    const roundedStr = rounded.toString();
    
    if (decimalPlaces === 0) {
        // Rounding to whole numbers
        const decimalPart = original - Math.floor(original);
        if (decimalPart >= 0.5) {
            return `The digit after the decimal point ${decimalPart.toFixed(1)} ≥ 0.5, so we round up to ${rounded}`;
        } else {
            return `The digit after the decimal point ${decimalPart.toFixed(1)} < 0.5, so we round down to ${rounded}`;
        }
    } else {
        // Rounding to decimal places
        const targetPosition = decimalPlaces;
        const nextDigit = originalStr.split('.')[1]?.[targetPosition];
        
        if (nextDigit && parseInt(nextDigit) >= 5) {
            return `The digit in position ${targetPosition + 1} after the decimal point (${nextDigit}) ≥ 5, so we increase the digit in position ${targetPosition} by 1`;
        } else {
            return `The digit in position ${targetPosition + 1} after the decimal point (${nextDigit || 0}) < 5, so we leave the digit in position ${targetPosition} unchanged`;
        }
    }
}

// Function to handle rounding
function handleRounding() {
    const number = parseFloat(numberInput.value);
    const places = parseInt(decimalPlaces.value);
    
    if (isNaN(number)) {
        alert('Please enter a valid number');
        return;
    }
    
    const rounded = roundNumber(number, places);
    
    // Display result
    originalNumber.textContent = number;
    roundedNumber.textContent = rounded;
    explanation.textContent = getExplanation(number, rounded, places);
    
    resultSection.style.display = 'block';
    
    // Smooth scroll to result
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Function to generate random exercise
function generateExercise() {
    const decimalPlacesOptions = [0, 1, 2];
    const targetPlaces = decimalPlacesOptions[Math.floor(Math.random() * decimalPlacesOptions.length)];
    
    // Generate number with required decimal places
    let number;
    if (targetPlaces === 0) {
        number = Math.random() * 100; // From 0 to 100
    } else {
        const maxDigits = targetPlaces + 2; // Additional digits for rounding
        number = Math.random() * 100;
        number = parseFloat(number.toFixed(maxDigits));
    }
    
    const correctAnswer = roundNumber(number, targetPlaces);
    
    currentExercise = {
        number: number,
        decimalPlaces: targetPlaces,
        correctAnswer: correctAnswer
    };
    
    // Form task text
    let placesText;
    switch (targetPlaces) {
        case 0:
            placesText = 'whole numbers';
            break;
        case 1:
            placesText = '1 decimal place';
            break;
        case 2:
            placesText = '2 decimal places';
            break;
        default:
            placesText = `${targetPlaces} decimal places`;
    }
    
    exerciseText.textContent = `Round the number ${number} to ${placesText}`;
    
    // Show exercise interface
    exerciseDisplay.style.display = 'block';
    checkAnswerBtn.style.display = 'inline-block';
    exerciseResult.style.display = 'none';
    userAnswer.value = '';
    
    // Focus on input field
    userAnswer.focus();
    
    // Smooth scroll to exercise
    exerciseDisplay.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Function to check answer
function checkAnswer() {
    if (!currentExercise) return;
    
    const userValue = parseFloat(userAnswer.value);
    
    if (isNaN(userValue)) {
        alert('Please enter a valid number');
        return;
    }
    
    totalExercises++;
    const isCorrect = Math.abs(userValue - currentExercise.correctAnswer) < 0.001;
    
    if (isCorrect) {
        correctAnswers++;
        exerciseResult.className = 'exercise-result correct';
        exerciseResult.innerHTML = `
            ✅ <strong>Correct!</strong><br>
            ${currentExercise.number} rounded to ${currentExercise.decimalPlaces === 0 ? 'whole numbers' : `${currentExercise.decimalPlaces} decimal place(s)`} = ${currentExercise.correctAnswer}
        `;
    } else {
        exerciseResult.className = 'exercise-result incorrect';
        exerciseResult.innerHTML = `
            ❌ <strong>Incorrect!</strong><br>
            Correct answer: ${currentExercise.correctAnswer}<br>
            Your answer: ${userValue}
        `;
    }
    
    exerciseResult.style.display = 'block';
    updateStats();
    
    // Smooth scroll to result
    exerciseResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Function to update statistics
function updateStats() {
    totalExercisesEl.textContent = totalExercises;
    correctAnswersEl.textContent = correctAnswers;
    
    const accuracy = totalExercises > 0 ? Math.round((correctAnswers / totalExercises) * 100) : 0;
    accuracyEl.textContent = `${accuracy}%`;
}

// Function to animate numbers in statistics
function animateNumber(element, start, end, duration = 1000) {
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.round(start + (end - start) * progress);
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// Event handlers
roundBtn.addEventListener('click', handleRounding);

numberInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        handleRounding();
    }
});

generateExerciseBtn.addEventListener('click', generateExercise);

checkAnswerBtn.addEventListener('click', checkAnswer);

userAnswer.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        checkAnswer();
    }
});

// Initialization when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Add animation for element appearance
    const sections = document.querySelectorAll('.theory-section, .practice-section, .exercise-section, .stats-section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
    
    // Initialize statistics
    updateStats();
    
    // Add tooltips on hover
    const tooltips = {
        'numberInput': 'Enter any decimal number for rounding',
        'decimalPlaces': 'Choose how many decimal places to round to',
        'roundBtn': 'Click to perform rounding',
        'generateExercise': 'Create a new random exercise',
        'userAnswer': 'Enter your answer in the field above'
    };
    
    Object.keys(tooltips).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.title = tooltips[id];
        }
    });
});

// Function to create sound effect (optional)
function playSound(type) {
    // Can add sound effects for correct/incorrect answers
    // For example, using Web Audio API
}

// Function to save statistics to localStorage
function saveStats() {
    const stats = {
        totalExercises,
        correctAnswers,
        timestamp: Date.now()
    };
    localStorage.setItem('roundingStats', JSON.stringify(stats));
}

// Function to load statistics from localStorage
function loadStats() {
    const saved = localStorage.getItem('roundingStats');
    if (saved) {
        const stats = JSON.parse(saved);
        // Can add logic to restore statistics
        // For example, if less than 24 hours have passed
        const hoursSinceLastSave = (Date.now() - stats.timestamp) / (1000 * 60 * 60);
        if (hoursSinceLastSave < 24) {
            totalExercises = stats.totalExercises || 0;
            correctAnswers = stats.correctAnswers || 0;
            updateStats();
        }
    }
}

// Save statistics when changed
function updateStatsWithSave() {
    updateStats();
    saveStats();
}

// Load statistics when page loads
document.addEventListener('DOMContentLoaded', loadStats);

// Override statistics update function
const originalUpdateStats = updateStats;
updateStats = function() {
    originalUpdateStats();
    saveStats();
}; 