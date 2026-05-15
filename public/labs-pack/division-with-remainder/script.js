// Global variables
let currentNumber = 0;
let practiceScore = 0;
let practiceTotal = 0;
let sortScore = 0;
let sortTotal = 0;
let testQuestions = [];
let currentQuestionIndex = 0;
let testScore = 0;
let testTimer = null;
let questionTimer = null;
let testStartTime = null;

// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeApp();
    
    // Navigation event listeners
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            switchSection(targetSection);
        });
    });
});

function initializeApp() {
    // Initialize demo grid
    generateDemoGrid();
    
    // Initialize practice exercises
    initializePractice();
    
    // Initialize sorting exercise
    initializeSorting();
    
    // Initialize test
    initializeTest();
}

function switchSection(sectionName) {
    // Remove active class from all sections and buttons
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to target section and button
    document.getElementById(sectionName).classList.add('active');
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
}

// Theory Section - Interactive Demo
function generateDemoGrid() {
    const demoGrid = document.getElementById('demoGrid');
    demoGrid.innerHTML = '';
    
    // Generate random numbers for demo
    for (let i = 0; i < 12; i++) {
        const number = Math.floor(Math.random() * 50) + 1;
        const isEven = number % 2 === 0;
        const numberElement = document.createElement('div');
        numberElement.className = `number ${isEven ? 'even' : 'odd'}`;
        numberElement.textContent = number;
        numberElement.addEventListener('click', () => showDemoResult(number, isEven));
        demoGrid.appendChild(numberElement);
    }
}

function showDemoResult(number, isEven) {
    const resultElement = document.getElementById('demoResult');
    const result = isEven ? 'EVEN' : 'ODD';
    const color = isEven ? '#4299e1' : '#e53e3e';
    
    resultElement.innerHTML = `
        <strong>${number}</strong> is <span style="color: ${color}; font-weight: bold;">${result}</span>!
        <br><small>${number} ${isEven ? 'can' : 'cannot'} be divided by 2 without remainder</small>
    `;
    resultElement.style.borderColor = color;
    resultElement.classList.add('bounce');
    
    setTimeout(() => {
        resultElement.classList.remove('bounce');
    }, 600);
}

// Practice Section - Exercise 1
function initializePractice() {
    generateNewNumber();
}

function generateNewNumber() {
    currentNumber = Math.floor(Math.random() * 100) + 1;
    document.getElementById('practiceNumber').textContent = currentNumber;
    document.getElementById('practiceFeedback').innerHTML = '';
    document.getElementById('practiceFeedback').className = 'feedback';
}

function checkAnswer(answer) {
    const isEven = currentNumber % 2 === 0;
    const correctAnswer = isEven ? 'even' : 'odd';
    const feedbackElement = document.getElementById('practiceFeedback');
    
    practiceTotal++;
    
    if (answer === correctAnswer) {
        practiceScore++;
        feedbackElement.textContent = `Correct! ${currentNumber} is ${correctAnswer}.`;
        feedbackElement.className = 'feedback correct';
        feedbackElement.classList.add('bounce');
    } else {
        feedbackElement.textContent = `Incorrect! ${currentNumber} is ${correctAnswer}, not ${answer}.`;
        feedbackElement.className = 'feedback incorrect';
        feedbackElement.classList.add('shake');
    }
    
    // Update score display
    document.getElementById('practiceScore').textContent = practiceScore;
    document.getElementById('practiceTotal').textContent = practiceTotal;
    
    // Remove animation classes
    setTimeout(() => {
        feedbackElement.classList.remove('bounce', 'shake');
    }, 600);
    
    // Generate new number after a short delay
    setTimeout(generateNewNumber, 1500);
}

// Practice Section - Exercise 2 (Sorting)
function initializeSorting() {
    generateSortingNumbers();
    setupDragAndDrop();
}

function generateSortingNumbers() {
    const numbersToSort = document.getElementById('numbersToSort');
    numbersToSort.innerHTML = '';
    
    // Generate 8 random numbers (4 even, 4 odd)
    const numbers = [];
    const evenNumbers = [];
    const oddNumbers = [];
    
    while (evenNumbers.length < 4) {
        const num = Math.floor(Math.random() * 50) * 2; // Even numbers
        if (!evenNumbers.includes(num)) {
            evenNumbers.push(num);
        }
    }
    
    while (oddNumbers.length < 4) {
        const num = Math.floor(Math.random() * 50) * 2 + 1; // Odd numbers
        if (!oddNumbers.includes(num)) {
            oddNumbers.push(num);
        }
    }
    
    numbers.push(...evenNumbers, ...oddNumbers);
    
    // Shuffle the array
    for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    
    // Create sortable number elements
    numbers.forEach(number => {
        const isEven = number % 2 === 0;
        const numberElement = document.createElement('div');
        numberElement.className = `sortable-number ${isEven ? 'even' : 'odd'}`;
        numberElement.textContent = number;
        numberElement.draggable = true;
        numberElement.dataset.number = number;
        numberElement.dataset.type = isEven ? 'even' : 'odd';
        numbersToSort.appendChild(numberElement);
    });
}

function setupDragAndDrop() {
    const sortableNumbers = document.querySelectorAll('.sortable-number');
    const dropZones = document.querySelectorAll('.drop-zone');
    
    sortableNumbers.forEach(number => {
        number.addEventListener('dragstart', handleDragStart);
        number.addEventListener('dragend', handleDragEnd);
    });
    
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('drop', handleDrop);
    });
}

function handleDragStart(e) {
    e.target.style.opacity = '0.5';
    e.dataTransfer.setData('text/plain', e.target.dataset.number);
}

function handleDragEnd(e) {
    e.target.style.opacity = '1';
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    const number = e.dataTransfer.getData('text/plain');
    const numberElement = document.querySelector(`[data-number="${number}"]`);
    
    if (numberElement && !numberElement.parentElement.classList.contains('drop-zone')) {
        e.target.appendChild(numberElement);
    }
}

function checkSorting() {
    const evenDropZone = document.getElementById('evenDropZone');
    const oddDropZone = document.getElementById('oddDropZone');
    const feedbackElement = document.getElementById('sortingFeedback');
    
    const evenNumbers = Array.from(evenDropZone.children).map(el => parseInt(el.dataset.number));
    const oddNumbers = Array.from(oddDropZone.children).map(el => parseInt(el.dataset.number));
    
    let correct = 0;
    let total = 0;
    
    // Check even numbers
    evenNumbers.forEach(num => {
        total++;
        if (num % 2 === 0) correct++;
    });
    
    // Check odd numbers
    oddNumbers.forEach(num => {
        total++;
        if (num % 2 === 1) correct++;
    });
    
    sortScore = correct;
    sortTotal = total;
    
    document.getElementById('sortScore').textContent = sortScore;
    document.getElementById('sortTotal').textContent = sortTotal;
    
    if (correct === total && total > 0) {
        feedbackElement.textContent = 'Excellent! All numbers are correctly sorted!';
        feedbackElement.className = 'feedback correct';
        feedbackElement.classList.add('bounce');
    } else {
        feedbackElement.textContent = `You got ${correct} out of ${total} correct. Try again!`;
        feedbackElement.className = 'feedback incorrect';
        feedbackElement.classList.add('shake');
    }
    
    setTimeout(() => {
        feedbackElement.classList.remove('bounce', 'shake');
    }, 600);
}

function resetSorting() {
    document.getElementById('evenDropZone').innerHTML = '';
    document.getElementById('oddDropZone').innerHTML = '';
    document.getElementById('sortingFeedback').innerHTML = '';
    document.getElementById('sortingFeedback').className = 'feedback';
    generateSortingNumbers();
    setupDragAndDrop();
}

// Test Section
function initializeTest() {
    generateTestQuestions();
    document.getElementById('testQuestionCount').textContent = '10';
}

function generateTestQuestions() {
    testQuestions = [];
    
    // Generate 10 random test questions
    for (let i = 0; i < 10; i++) {
        const number = Math.floor(Math.random() * 100) + 1;
        const isEven = number % 2 === 0;
        const correctAnswer = isEven ? 'even' : 'odd';
        
        testQuestions.push({
            number: number,
            correctAnswer: correctAnswer,
            question: `Is the number ${number} even or odd?`
        });
    }
}

function startTest() {
    document.getElementById('testStart').style.display = 'none';
    document.getElementById('testQuestion').style.display = 'block';
    document.getElementById('testResults').style.display = 'none';
    
    currentQuestionIndex = 0;
    testScore = 0;
    testStartTime = Date.now();
    
    showQuestion();
    startQuestionTimer();
}

function showQuestion() {
    if (currentQuestionIndex >= testQuestions.length) {
        endTest();
        return;
    }
    
    const question = testQuestions[currentQuestionIndex];
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    document.getElementById('questionText').textContent = question.question;
    
    // Reset option buttons
    document.getElementById('optionEven').classList.remove('selected');
    document.getElementById('optionOdd').classList.remove('selected');
    
    // Reset question timer
    document.getElementById('questionTimer').textContent = '30';
    startQuestionTimer();
}

function startQuestionTimer() {
    let timeLeft = 30;
    document.getElementById('questionTimer').textContent = timeLeft;
    
    questionTimer = setInterval(() => {
        timeLeft--;
        document.getElementById('questionTimer').textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(questionTimer);
            selectOption('timeout');
        }
    }, 1000);
}

function selectOption(answer) {
    clearInterval(questionTimer);
    
    const question = testQuestions[currentQuestionIndex];
    const isCorrect = answer === question.correctAnswer;
    
    if (isCorrect) {
        testScore++;
    }
    
    // Visual feedback
    if (answer !== 'timeout') {
        const selectedButton = document.getElementById(`option${answer.charAt(0).toUpperCase() + answer.slice(1)}`);
        selectedButton.classList.add('selected');
        
        setTimeout(() => {
            selectedButton.classList.remove('selected');
        }, 1000);
    }
    
    currentQuestionIndex++;
    
    // Show next question after a short delay
    setTimeout(showQuestion, 1000);
}

function endTest() {
    clearInterval(questionTimer);
    clearInterval(testTimer);
    
    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - testStartTime) / 1000);
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const percentage = Math.round((testScore / testQuestions.length) * 100);
    
    document.getElementById('correctAnswers').textContent = testScore;
    document.getElementById('finalScore').textContent = `${percentage}%`;
    document.getElementById('timeTaken').textContent = timeString;
    
    // Set result message
    const resultMessage = document.getElementById('resultMessage');
    if (percentage >= 90) {
        resultMessage.textContent = '🎉 Outstanding! You have excellent understanding of even and odd numbers!';
        resultMessage.style.background = '#c6f6d5';
        resultMessage.style.color = '#22543d';
        resultMessage.style.borderColor = '#68d391';
    } else if (percentage >= 70) {
        resultMessage.textContent = '👍 Good job! You have a solid understanding of even and odd numbers.';
        resultMessage.style.background = '#c6f6d5';
        resultMessage.style.color = '#22543d';
        resultMessage.style.borderColor = '#68d391';
    } else if (percentage >= 50) {
        resultMessage.textContent = '📚 Not bad! Review the theory section and practice more.';
        resultMessage.style.background = '#fef5e7';
        resultMessage.style.color = '#744210';
        resultMessage.style.borderColor = '#f6ad55';
    } else {
        resultMessage.textContent = '📖 Keep practicing! Review the theory and try the practice exercises.';
        resultMessage.style.background = '#fed7d7';
        resultMessage.style.color = '#742a2a';
        resultMessage.style.borderColor = '#fc8181';
    }
    
    document.getElementById('testQuestion').style.display = 'none';
    document.getElementById('testResults').style.display = 'block';
}

function restartTest() {
    generateTestQuestions();
    document.getElementById('testStart').style.display = 'block';
    document.getElementById('testQuestion').style.display = 'none';
    document.getElementById('testResults').style.display = 'none';
}

// Utility functions
function isEven(number) {
    return number % 2 === 0;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to numbers in theory section
    const theoryNumbers = document.querySelectorAll('.number-grid .number');
    theoryNumbers.forEach(number => {
        number.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1) rotate(5deg)';
        });
        
        number.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
        });
    });
    
    // Add smooth scrolling for better UX
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}); 