// Task data
const tasks = {
    1: {
        title: "🚴 Bicycle Ride",
        story: "You and 11 friends on bicycles want to cross a bridge. Only 3 people can cross the bridge at a time. Into how many groups do you need to divide to cross the bridge with everyone?",
        question: "How many groups will there be?",
        dividend: 12, // you + 11 friends
        divisor: 3,
        answer: 4
    },
    2: {
        title: "🍕 Pizza for Friends",
        story: "You have 1 large pizza that needs to be divided equally among 8 friends. Each person should get the same number of slices.",
        question: "How many slices should the pizza be cut into?",
        dividend: 8,
        divisor: 1,
        answer: 8
    },
    3: {
        title: "📚 Library",
        story: "There are 24 books in the library that need to be arranged equally on 6 shelves. How many books will be on each shelf?",
        question: "How many books will fit on one shelf?",
        dividend: 24,
        divisor: 6,
        answer: 4
    },
    4: {
        title: "🎨 Art Studio",
        story: "You have 18 jars of paint that need to be divided equally among 3 groups of artists. How many jars will each group get?",
        question: "How many paint jars will each group receive?",
        dividend: 18,
        divisor: 3,
        answer: 6
    },
    5: {
        title: "🏀 Sports Ground",
        story: "On the sports ground, 15 students want to play basketball. Each team should have 5 players. How many teams can be formed?",
        question: "How many teams can be made?",
        dividend: 15,
        divisor: 5,
        answer: 3
    },
    6: {
        title: "🌱 Gardening",
        story: "You have 20 flower seeds that need to be planted equally in 4 flower beds. How many seeds should be planted in each flower bed?",
        question: "How many seeds to plant in one flower bed?",
        dividend: 20,
        divisor: 4,
        answer: 5
    },
    7: {
        title: "🎪 Circus Show",
        story: "At the circus, 28 spectators want to sit in rows. Each row can accommodate 7 people. How many rows will be needed?",
        question: "How many rows are needed for all spectators?",
        dividend: 28,
        divisor: 7,
        answer: 4
    },
    8: {
        title: "🚌 School Bus",
        story: "32 students need to be seated in a school bus. Each row of seats can accommodate 4 people. How many rows will be needed?",
        question: "How many rows of seats need to be occupied?",
        dividend: 32,
        divisor: 4,
        answer: 8
    },
    9: {
        title: "🎁 Birthday Party",
        story: "16 guests came to the birthday party. You have 2 large cakes that need to be cut into equal pieces for all guests. How many pieces are needed from each cake?",
        question: "How many pieces are needed from each cake?",
        dividend: 16,
        divisor: 2,
        answer: 8
    }
};

// Application state
let completedTasks = new Set();
let currentTask = null;

// Application initialization
document.addEventListener('DOMContentLoaded', function() {
    loadProgress();
    setupEventListeners();
    updateProgress();
});

// Event handlers setup
function setupEventListeners() {
    // Handlers for topic cards
    document.querySelectorAll('.topic-card').forEach(card => {
        card.addEventListener('click', function() {
            const topicId = parseInt(this.dataset.topic);
            startTask(topicId);
        });
    });

    // Input field handler
    document.getElementById('answer-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
}

// Load progress from localStorage
function loadProgress() {
    const saved = localStorage.getItem('divisionLabProgress');
    if (saved) {
        completedTasks = new Set(JSON.parse(saved));
    }
}

// Save progress to localStorage
function saveProgress() {
    localStorage.setItem('divisionLabProgress', JSON.stringify([...completedTasks]));
}

// Update progress display
function updateProgress() {
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const completedCount = completedTasks.size;
    
    const percentage = (completedCount / 9) * 100;
    progressFill.style.width = percentage + '%';
    progressText.textContent = `${completedCount}/9 completed`;

    // Update topic cards
    document.querySelectorAll('.topic-card').forEach(card => {
        const topicId = parseInt(card.dataset.topic);
        if (completedTasks.has(topicId)) {
            card.classList.add('completed');
        } else {
            card.classList.remove('completed');
        }
    });
}

// Start task execution
function startTask(topicId) {
    currentTask = topicId;
    const task = tasks[topicId];
    
    document.getElementById('task-title').textContent = task.title;
    document.getElementById('story-text').textContent = task.story;
    document.getElementById('question-text').textContent = task.question;
    
    // Clear input field and message
    document.getElementById('answer-input').value = '';
    document.getElementById('result-message').className = 'result-message';
    document.getElementById('result-message').style.display = 'none';
    
    showScreen('task-screen');
}

// Check answer
function checkAnswer() {
    const userAnswer = parseFloat(document.getElementById('answer-input').value);
    const task = tasks[currentTask];
    const resultMessage = document.getElementById('result-message');
    
    if (isNaN(userAnswer)) {
        showResult('Please enter a number!', 'error');
        return;
    }
    
    if (Math.abs(userAnswer - task.answer) < 0.01) { // Tolerance for decimal numbers
        showResult('Correct! Excellent work! 🎉', 'success');
        completedTasks.add(currentTask);
        saveProgress();
        updateProgress();
        
        // Check if all tasks are completed
        if (completedTasks.size === 9) {
            setTimeout(() => {
                showCongratulations();
            }, 2000);
        } else {
            setTimeout(() => {
                showMainMenu();
            }, 2000);
        }
    } else {
        const hint = getHint(task);
        showResult(`Incorrect. ${hint}`, 'error');
    }
}

// Show result
function showResult(message, type) {
    const resultMessage = document.getElementById('result-message');
    resultMessage.textContent = message;
    resultMessage.className = `result-message ${type}`;
    resultMessage.style.display = 'block';
}

// Get hint
function getHint(task) {
    const quotient = task.dividend / task.divisor;
    if (quotient === Math.floor(quotient)) {
        return `Try dividing ${task.dividend} by ${task.divisor}.`;
    } else {
        return `Try dividing ${task.dividend} by ${task.divisor}. The result may be a decimal number.`;
    }
}

// Show main menu
function showMainMenu() {
    showScreen('main-menu');
}

// Show congratulations screen
function showCongratulations() {
    showScreen('congratulations-screen');
}

// Switch screens
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Restart laboratory work
function restartLab() {
    completedTasks.clear();
    saveProgress();
    updateProgress();
    showMainMenu();
}

// Global functions for HTML
window.showMainMenu = showMainMenu;
window.checkAnswer = checkAnswer;
window.restartLab = restartLab; 