// Global variables
let currentTestQuestion = 0;
let testQuestions = [];
let testScore = 0;
let totalQuestions = 0;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    createMultiplicationTables();
    initializeEventListeners();
});

// Navigation functionality
function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSection = button.getAttribute('data-section');
            
            // Update active button
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show target section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
        });
    });
}

// Create multiplication tables
function createMultiplicationTables() {
    const tableIds = ['theory-table', 'practice-table', 'test-table'];
    
    tableIds.forEach(tableId => {
        const tableContainer = document.getElementById(tableId);
        if (tableContainer) {
            createTable(tableContainer, tableId);
        }
    });
}

function createTable(container, tableId) {
    const size = 12;
    
    // Create header row
    for (let col = 0; col <= size; col++) {
        const cell = document.createElement('div');
        cell.className = 'table-cell header';
        if (col === 0) {
            cell.textContent = '×';
        } else {
            cell.textContent = col;
        }
        container.appendChild(cell);
    }
    
    // Create data rows
    for (let row = 1; row <= size; row++) {
        for (let col = 0; col <= size; col++) {
            const cell = document.createElement('div');
            cell.className = 'table-cell';
            
            if (col === 0) {
                cell.textContent = row;
                cell.classList.add('header');
            } else {
                cell.textContent = row * col;
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.dataset.value = row * col;
            }
            
            container.appendChild(cell);
        }
    }
    
    // Add event listeners based on table type
    if (tableId === 'theory-table') {
        addTheoryTableListeners(container);
    } else if (tableId === 'practice-table') {
        addPracticeTableListeners(container);
    } else if (tableId === 'test-table') {
        addTestTableListeners(container);
    }
}

// Theory table event listeners (hover effects)
function addTheoryTableListeners(container) {
    const cells = container.querySelectorAll('.table-cell:not(.header)');
    
    cells.forEach(cell => {
        cell.addEventListener('mouseenter', () => {
            highlightRowAndColumn(container, cell.dataset.row, cell.dataset.col);
        });
        
        cell.addEventListener('mouseleave', () => {
            clearHighlights(container);
        });
    });
}

// Practice table event listeners (click to show problem)
function addPracticeTableListeners(container) {
    const cells = container.querySelectorAll('.table-cell:not(.header)');
    const problemDisplay = document.getElementById('practice-problem');
    
    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const result = parseInt(cell.dataset.value);
            
            // Show the problem
            problemDisplay.innerHTML = `
                <p><strong>${row} × ${col} = ${result}</strong></p>
                <p>Click on another cell to practice more!</p>
            `;
            
            // Highlight the clicked cell
            clearHighlights(container);
            cell.classList.add('clicked');
            
            // Remove highlight after 2 seconds
            setTimeout(() => {
                cell.classList.remove('clicked');
            }, 2000);
        });
    });
}

// Test table event listeners (reference only)
function addTestTableListeners(container) {
    const cells = container.querySelectorAll('.table-cell:not(.header)');
    
    cells.forEach(cell => {
        cell.addEventListener('mouseenter', () => {
            highlightRowAndColumn(container, cell.dataset.row, cell.dataset.col);
        });
        
        cell.addEventListener('mouseleave', () => {
            clearHighlights(container);
        });
    });
}

// Highlight row and column
function highlightRowAndColumn(container, row, col) {
    const cells = container.querySelectorAll('.table-cell:not(.header)');
    
    cells.forEach(cell => {
        const cellRow = cell.dataset.row;
        const cellCol = cell.dataset.col;
        
        if (cellRow === row && cellCol === col) {
            cell.classList.add('highlight-both');
        } else if (cellRow === row) {
            cell.classList.add('highlight-row');
        } else if (cellCol === col) {
            cell.classList.add('highlight-col');
        }
    });
}

// Clear all highlights
function clearHighlights(container) {
    const cells = container.querySelectorAll('.table-cell');
    cells.forEach(cell => {
        cell.classList.remove('highlight-row', 'highlight-col', 'highlight-both');
    });
}

// Initialize event listeners for buttons
function initializeEventListeners() {
    // Practice reset button
    const resetPracticeBtn = document.getElementById('reset-practice');
    if (resetPracticeBtn) {
        resetPracticeBtn.addEventListener('click', () => {
            const problemDisplay = document.getElementById('practice-problem');
            problemDisplay.innerHTML = '<p>Click on any cell in the table to start practicing!</p>';
            clearHighlights(document.getElementById('practice-table'));
        });
    }
    
    // Test start button
    const startTestBtn = document.getElementById('start-test');
    if (startTestBtn) {
        startTestBtn.addEventListener('click', startTest);
    }
    
    // Test reset button
    const resetTestBtn = document.getElementById('reset-test');
    if (resetTestBtn) {
        resetTestBtn.addEventListener('click', resetTest);
    }
    
    // Submit answer button
    const submitAnswerBtn = document.getElementById('submit-answer');
    if (submitAnswerBtn) {
        submitAnswerBtn.addEventListener('click', submitAnswer);
    }
    
    // Enter key for answer input
    const answerInput = document.getElementById('answer-input');
    if (answerInput) {
        answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitAnswer();
            }
        });
    }
}

// Test functionality
function startTest() {
    generateTestQuestions();
    currentTestQuestion = 0;
    testScore = 0;
    totalQuestions = testQuestions.length;
    
    document.getElementById('total-questions').textContent = totalQuestions;
    document.getElementById('score').textContent = testScore;
    
    showNextQuestion();
    
    document.getElementById('test-input').style.display = 'flex';
    document.getElementById('start-test').disabled = true;
}

function generateTestQuestions() {
    testQuestions = [];
    const questions = [];
    
    // Generate random multiplication problems
    for (let i = 0; i < 10; i++) {
        const row = Math.floor(Math.random() * 12) + 1;
        const col = Math.floor(Math.random() * 12) + 1;
        const answer = row * col;
        
        questions.push({
            row: row,
            col: col,
            answer: answer,
            question: `${row} × ${col} = ?`
        });
    }
    
    // Shuffle questions
    testQuestions = questions.sort(() => Math.random() - 0.5);
}

function showNextQuestion() {
    if (currentTestQuestion >= testQuestions.length) {
        endTest();
        return;
    }
    
    const question = testQuestions[currentTestQuestion];
    const problemDisplay = document.getElementById('test-problem');
    
    problemDisplay.innerHTML = `<p><strong>Question ${currentTestQuestion + 1}:</strong></p><p>${question.question}</p>`;
    
    document.getElementById('answer-input').value = '';
    document.getElementById('answer-input').focus();
}

function submitAnswer() {
    const answerInput = document.getElementById('answer-input');
    const userAnswer = parseInt(answerInput.value);
    const question = testQuestions[currentTestQuestion];
    
    if (isNaN(userAnswer)) {
        alert('Please enter a valid number!');
        return;
    }
    
    const problemDisplay = document.getElementById('test-problem');
    
    if (userAnswer === question.answer) {
        testScore++;
        problemDisplay.innerHTML = `
            <p><strong>Correct!</strong></p>
            <p>${question.question} = ${question.answer}</p>
        `;
        problemDisplay.className = 'problem-display correct-answer';
    } else {
        problemDisplay.innerHTML = `
            <p><strong>Incorrect!</strong></p>
            <p>${question.question} = ${question.answer}</p>
            <p>Your answer: ${userAnswer}</p>
        `;
        problemDisplay.className = 'problem-display incorrect-answer';
    }
    
    document.getElementById('score').textContent = testScore;
    
    // Show next question after 2 seconds
    setTimeout(() => {
        currentTestQuestion++;
        problemDisplay.className = 'problem-display';
        showNextQuestion();
    }, 2000);
}

function endTest() {
    const problemDisplay = document.getElementById('test-problem');
    const percentage = Math.round((testScore / totalQuestions) * 100);
    
    let message = '';
    if (percentage >= 90) {
        message = 'Excellent! You are a multiplication master!';
    } else if (percentage >= 70) {
        message = 'Good job! Keep practicing to improve!';
    } else if (percentage >= 50) {
        message = 'Not bad! More practice will help you improve!';
    } else {
        message = 'Keep practicing! You can do better!';
    }
    
    problemDisplay.innerHTML = `
        <p><strong>Test Complete!</strong></p>
        <p>Your score: ${testScore}/${totalQuestions} (${percentage}%)</p>
        <p>${message}</p>
    `;
    
    document.getElementById('test-input').style.display = 'none';
    document.getElementById('start-test').disabled = false;
}

function resetTest() {
    currentTestQuestion = 0;
    testScore = 0;
    totalQuestions = 0;
    
    document.getElementById('score').textContent = '0';
    document.getElementById('total-questions').textContent = '0';
    document.getElementById('test-problem').innerHTML = '<p>Click "Start Test" to begin!</p>';
    document.getElementById('test-problem').className = 'problem-display';
    document.getElementById('test-input').style.display = 'none';
    document.getElementById('start-test').disabled = false;
    
    clearHighlights(document.getElementById('test-table'));
}

// Add some visual feedback for better UX
function addVisualFeedback() {
    // Add loading animation for buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

// Initialize visual feedback
addVisualFeedback(); 