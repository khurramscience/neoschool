// Global variables
let currentExercise = null;
let correctAnswers = 0;
let incorrectAnswers = 0;
let gameScore = 0;
let gameTimer = null;
let gameTimeLeft = 60;
let isGameActive = false;

// Navigation
document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.content-section');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSection = button.getAttribute('data-section');
            
            // Remove active class from all buttons and sections
            navButtons.forEach(btn => btn.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Add active class to selected button and section
            button.classList.add('active');
            document.getElementById(targetSection).classList.add('active');
        });
    });
});

// Converter functions
function convertToRoman() {
    const input = document.getElementById('arabicInput').value;
    const result = document.getElementById('romanValue');
    
    if (!input || input < 1 || input > 3999) {
        result.textContent = 'Error: enter a number from 1 to 3999';
        return;
    }
    
    const roman = arabicToRoman(parseInt(input));
    result.textContent = roman;
}

function convertToArabic() {
    const input = document.getElementById('romanInput').value.toUpperCase();
    const result = document.getElementById('arabicValue');
    
    if (!input) {
        result.textContent = 'Error: enter Roman numerals';
        return;
    }
    
    const arabic = romanToArabic(input);
    if (arabic === -1) {
        result.textContent = 'Error: invalid Roman numeral format';
    } else {
        result.textContent = arabic;
    }
}

function quickConvert(number) {
    document.getElementById('arabicInput').value = number;
    convertToRoman();
}

// Convert Arabic numbers to Roman
function arabicToRoman(num) {
    const romanNumerals = [
        { value: 1000, numeral: 'M' },
        { value: 900, numeral: 'CM' },
        { value: 500, numeral: 'D' },
        { value: 400, numeral: 'CD' },
        { value: 100, numeral: 'C' },
        { value: 90, numeral: 'XC' },
        { value: 50, numeral: 'L' },
        { value: 40, numeral: 'XL' },
        { value: 10, numeral: 'X' },
        { value: 9, numeral: 'IX' },
        { value: 5, numeral: 'V' },
        { value: 4, numeral: 'IV' },
        { value: 1, numeral: 'I' }
    ];
    
    let result = '';
    
    for (let i = 0; i < romanNumerals.length; i++) {
        while (num >= romanNumerals[i].value) {
            result += romanNumerals[i].numeral;
            num -= romanNumerals[i].value;
        }
    }
    
    return result;
}

// Convert Roman numbers to Arabic
function romanToArabic(roman) {
    const romanValues = {
        'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000
    };
    
    let result = 0;
    let prevValue = 0;
    
    for (let i = roman.length - 1; i >= 0; i--) {
        const currentValue = romanValues[roman[i]];
        
        if (!currentValue) {
            return -1; // Invalid character
        }
        
        if (currentValue >= prevValue) {
            result += currentValue;
        } else {
            result -= currentValue;
        }
        
        prevValue = currentValue;
    }
    
    return result;
}

// Exercise functions
function generateExercise() {
    const exerciseTypes = [
        'arabic_to_roman',
        'roman_to_arabic',
        'addition',
        'subtraction'
    ];
    
    const type = exerciseTypes[Math.floor(Math.random() * exerciseTypes.length)];
    const exerciseContent = document.getElementById('exerciseContent');
    const userAnswer = document.getElementById('userAnswer');
    const feedback = document.getElementById('feedback');
    
    userAnswer.value = '';
    feedback.textContent = '';
    feedback.className = 'feedback';
    
    switch (type) {
        case 'arabic_to_roman':
            const arabicNum = Math.floor(Math.random() * 100) + 1;
            currentExercise = {
                type: 'arabic_to_roman',
                question: `Convert the number ${arabicNum} to Roman numerals`,
                answer: arabicToRoman(arabicNum),
                arabicNum: arabicNum
            };
            exerciseContent.textContent = currentExercise.question;
            break;
            
        case 'roman_to_arabic':
            const romanNum = generateRandomRoman();
            currentExercise = {
                type: 'roman_to_arabic',
                question: `Convert the Roman numerals ${romanNum} to Arabic numbers`,
                answer: romanToArabic(romanNum).toString(),
                romanNum: romanNum
            };
            exerciseContent.textContent = currentExercise.question;
            break;
            
        case 'addition':
            const num1 = Math.floor(Math.random() * 50) + 1;
            const num2 = Math.floor(Math.random() * 50) + 1;
            const roman1 = arabicToRoman(num1);
            const roman2 = arabicToRoman(num2);
            currentExercise = {
                type: 'addition',
                question: `Add the Roman numbers: ${roman1} + ${roman2}`,
                answer: (num1 + num2).toString(),
                roman1: roman1,
                roman2: roman2,
                num1: num1,
                num2: num2
            };
            exerciseContent.textContent = currentExercise.question;
            break;
            
        case 'subtraction':
            const num3 = Math.floor(Math.random() * 50) + 51;
            const num4 = Math.floor(Math.random() * 50) + 1;
            const roman3 = arabicToRoman(num3);
            const roman4 = arabicToRoman(num4);
            currentExercise = {
                type: 'subtraction',
                question: `Subtract the Roman numbers: ${roman3} - ${roman4}`,
                answer: (num3 - num4).toString(),
                roman3: roman3,
                roman4: roman4,
                num3: num3,
                num4: num4
            };
            exerciseContent.textContent = currentExercise.question;
            break;
    }
}

function checkAnswer() {
    if (!currentExercise) {
        alert('Generate an exercise first!');
        return;
    }
    
    const userAnswer = document.getElementById('userAnswer').value.trim();
    const feedback = document.getElementById('feedback');
    
    if (!userAnswer) {
        alert('Enter your answer!');
        return;
    }
    
    const isCorrect = userAnswer.toUpperCase() === currentExercise.answer.toUpperCase();
    
    if (isCorrect) {
        feedback.textContent = 'Correct! 🎉';
        feedback.className = 'feedback correct';
        correctAnswers++;
    } else {
        feedback.textContent = `Incorrect! The correct answer is: ${currentExercise.answer}`;
        feedback.className = 'feedback incorrect';
        incorrectAnswers++;
    }
    
    updateStats();
}

function showHint() {
    if (!currentExercise) {
        alert('Generate an exercise first!');
        return;
    }
    
    let hint = '';
    
    switch (currentExercise.type) {
        case 'arabic_to_roman':
            hint = `Hint: remember the rules for writing Roman numerals. ${currentExercise.arabicNum} can be broken down into sums of powers of 10 and 5.`;
            break;
        case 'roman_to_arabic':
            hint = `Hint: read Roman numerals from left to right. If a smaller numeral is to the right of a larger one - add them, if to the left - subtract.`;
            break;
        case 'addition':
            hint = `Hint: first convert to Arabic numbers: ${currentExercise.num1} + ${currentExercise.num2} = ${currentExercise.num1 + currentExercise.num2}`;
            break;
        case 'subtraction':
            hint = `Hint: first convert to Arabic numbers: ${currentExercise.num3} - ${currentExercise.num4} = ${currentExercise.num3 - currentExercise.num4}`;
            break;
    }
    
    alert(hint);
}

function updateStats() {
    document.getElementById('correctCount').textContent = correctAnswers;
    document.getElementById('incorrectCount').textContent = incorrectAnswers;
    
    const total = correctAnswers + incorrectAnswers;
    const percentage = total > 0 ? Math.round((correctAnswers / total) * 100) : 0;
    document.getElementById('percentage').textContent = percentage + '%';
}

// Generate random Roman number
function generateRandomRoman() {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100];
    const randomNum = numbers[Math.floor(Math.random() * numbers.length)];
    return arabicToRoman(randomNum);
}

// Game functions
function startGame() {
    if (isGameActive) return;
    
    isGameActive = true;
    gameScore = 0;
    gameTimeLeft = 60;
    document.getElementById('gameScore').textContent = gameScore;
    document.getElementById('gameTime').textContent = gameTimeLeft;
    
    generateGameQuestion();
    
    gameTimer = setInterval(() => {
        gameTimeLeft--;
        document.getElementById('gameTime').textContent = gameTimeLeft;
        document.getElementById('timer').textContent = `Time: ${gameTimeLeft}`;
        
        if (gameTimeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function pauseGame() {
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
        isGameActive = false;
    }
}

function endGame() {
    clearInterval(gameTimer);
    isGameActive = false;
    
    const questionElement = document.getElementById('gameQuestion');
    const optionsElement = document.getElementById('gameOptions');
    const feedbackElement = document.getElementById('gameFeedback');
    
    questionElement.textContent = `Game Over! Your score: ${gameScore}`;
    optionsElement.innerHTML = '';
    feedbackElement.textContent = `Congratulations! You scored ${gameScore} points!`;
    feedbackElement.className = 'game-feedback correct';
}

function generateGameQuestion() {
    if (!isGameActive) return;
    
    const questionTypes = ['roman_to_arabic', 'arabic_to_roman'];
    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    
    const questionElement = document.getElementById('gameQuestion');
    const optionsElement = document.getElementById('gameOptions');
    const feedbackElement = document.getElementById('gameFeedback');
    
    feedbackElement.textContent = '';
    feedbackElement.className = 'game-feedback';
    
    let question, correctAnswer, options;
    
    if (type === 'roman_to_arabic') {
        const romanNum = generateRandomRoman();
        const arabicNum = romanToArabic(romanNum);
        question = `What is the value of ${romanNum}?`;
        correctAnswer = arabicNum.toString();
        
        // Generate wrong options
        options = [correctAnswer];
        while (options.length < 4) {
            const wrongAnswer = Math.floor(Math.random() * 100) + 1;
            if (!options.includes(wrongAnswer.toString())) {
                options.push(wrongAnswer.toString());
            }
        }
    } else {
        const arabicNum = Math.floor(Math.random() * 50) + 1;
        const romanNum = arabicToRoman(arabicNum);
        question = `Which Roman numeral corresponds to ${arabicNum}?`;
        correctAnswer = romanNum;
        
        // Generate wrong options
        options = [correctAnswer];
        while (options.length < 4) {
            const wrongNum = Math.floor(Math.random() * 50) + 1;
            const wrongRoman = arabicToRoman(wrongNum);
            if (!options.includes(wrongRoman)) {
                options.push(wrongRoman);
            }
        }
    }
    
    // Shuffle answer options
    options = shuffleArray(options);
    
    questionElement.textContent = question;
    
    optionsElement.innerHTML = '';
    options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'game-option';
        optionElement.textContent = option;
        optionElement.onclick = () => checkGameAnswer(option, correctAnswer);
        optionsElement.appendChild(optionElement);
    });
}

function checkGameAnswer(selectedAnswer, correctAnswer) {
    if (!isGameActive) return;
    
    const options = document.querySelectorAll('.game-option');
    const feedbackElement = document.getElementById('gameFeedback');
    
    options.forEach(option => {
        option.onclick = null; // Disable clicks
        if (option.textContent === correctAnswer) {
            option.classList.add('correct');
        } else if (option.textContent === selectedAnswer && selectedAnswer !== correctAnswer) {
            option.classList.add('incorrect');
        }
    });
    
    if (selectedAnswer === correctAnswer) {
        gameScore += 10;
        feedbackElement.textContent = 'Correct! +10 points';
        feedbackElement.className = 'game-feedback correct';
    } else {
        feedbackElement.textContent = `Incorrect! The correct answer is: ${correctAnswer}`;
        feedbackElement.className = 'game-feedback incorrect';
    }
    
    document.getElementById('gameScore').textContent = gameScore;
    
    // Generate new question after 2 seconds
    setTimeout(() => {
        if (isGameActive) {
            generateGameQuestion();
        }
    }, 2000);
}

// Helper function to shuffle array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set up event handlers for Enter key in input fields
    document.getElementById('arabicInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            convertToRoman();
        }
    });
    
    document.getElementById('romanInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            convertToArabic();
        }
    });
    
    document.getElementById('userAnswer').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
    
    // Initialize statistics
    updateStats();
}); 