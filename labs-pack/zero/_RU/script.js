// Navigation between sections
document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const contentSections = document.querySelectorAll('.content-section');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSection = button.getAttribute('data-section');
            
            // Remove active class from all buttons and sections
            navButtons.forEach(btn => btn.classList.remove('active'));
            contentSections.forEach(section => section.classList.remove('active'));
            
            // Add active class to selected button and section
            button.classList.add('active');
            document.getElementById(targetSection).classList.add('active');
        });
    });

    // Initialize practice exercises
    initPracticeExercises();
    
    // Initialize quiz
    initQuiz();
});

// Practice exercises
function initPracticeExercises() {
    const itemsContainer = document.getElementById('itemsContainer');
    const addItemBtn = document.getElementById('addItem');
    const removeItemBtn = document.getElementById('removeItem');
    const clearAllBtn = document.getElementById('clearAll');
    const userAnswerInput = document.getElementById('userAnswer');
    const checkAnswerBtn = document.getElementById('checkAnswer');
    const feedbackDiv = document.getElementById('feedback');
    
    const items = ['🍎', '🍌', '🍊', '🍓', '🍇', '🍉', '🍍', '🥝'];
    let currentItems = [];

    // Add item
    addItemBtn.addEventListener('click', () => {
        if (currentItems.length < 10) {
            const randomItem = items[Math.floor(Math.random() * items.length)];
            currentItems.push(randomItem);
            updateItemsDisplay();
        }
    });

    // Remove item
    removeItemBtn.addEventListener('click', () => {
        if (currentItems.length > 0) {
            currentItems.pop();
            updateItemsDisplay();
        }
    });

    // Clear all items
    clearAllBtn.addEventListener('click', () => {
        currentItems = [];
        updateItemsDisplay();
        feedbackDiv.innerHTML = '';
        feedbackDiv.className = 'feedback';
    });

    // Check answer
    checkAnswerBtn.addEventListener('click', () => {
        const userAnswer = parseInt(userAnswerInput.value);
        const correctAnswer = currentItems.length;
        
        if (isNaN(userAnswer)) {
            showFeedback('Please enter a number!', 'incorrect');
            return;
        }
        
        if (userAnswer === correctAnswer) {
            showFeedback(`Correct! You have ${correctAnswer} objects. Great job! 🎉`, 'correct');
        } else {
            showFeedback(`Incorrect. You have ${correctAnswer} objects, not ${userAnswer}. Try again!`, 'incorrect');
        }
    });

    function updateItemsDisplay() {
        itemsContainer.innerHTML = '';
        currentItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'item';
            itemElement.textContent = item;
            itemsContainer.appendChild(itemElement);
        });
    }

    function showFeedback(message, type) {
        feedbackDiv.textContent = message;
        feedbackDiv.className = `feedback ${type}`;
    }

    // Fill in the blanks exercise
    const checkBlanksBtn = document.getElementById('checkBlanks');
    const blanksFeedbackDiv = document.getElementById('blanksFeedback');
    const blankInputs = document.querySelectorAll('.blank-input');

    checkBlanksBtn.addEventListener('click', () => {
        let allCorrect = true;
        let correctCount = 0;
        
        blankInputs.forEach(input => {
            const userValue = parseInt(input.value);
            const correctValue = parseInt(input.getAttribute('data-correct'));
            
            if (isNaN(userValue)) {
                allCorrect = false;
                input.style.borderColor = '#f56565';
                input.style.backgroundColor = '#fed7d7';
            } else if (userValue === correctValue) {
                correctCount++;
                input.style.borderColor = '#48bb78';
                input.style.backgroundColor = '#c6f6d5';
            } else {
                allCorrect = false;
                input.style.borderColor = '#f56565';
                input.style.backgroundColor = '#fed7d7';
            }
        });

        if (allCorrect) {
            blanksFeedbackDiv.textContent = 'Excellent! All answers are correct! 🎉';
            blanksFeedbackDiv.className = 'feedback correct';
        } else {
            blanksFeedbackDiv.textContent = `You have ${correctCount} out of ${blankInputs.length} correct answers. Try again!`;
            blanksFeedbackDiv.className = 'feedback incorrect';
        }
    });
}

// Quiz
function initQuiz() {
    const questions = [
        {
            question: "What does the number 0 mean?",
            options: [
                "Absence of quantity",
                "A very large number",
                "A negative number",
                "A fractional number"
            ],
            correct: 0
        },
        {
            question: "If you have 0 candies, it means:",
            options: [
                "You have many candies",
                "You have one candy",
                "You have no candies",
                "You have half a candy"
            ],
            correct: 2
        },
        {
            question: "In the number 10, zero shows:",
            options: [
                "That the number is negative",
                "That there are no ones",
                "That the number is very large",
                "That the number is fractional"
            ],
            correct: 1
        },
        {
            question: "How many apples do you have if there's nothing on the table?",
            options: [
                "1",
                "2",
                "0",
                "10"
            ],
            correct: 2
        },
        {
            question: "Without zero, we couldn't:",
            options: [
                "Count large numbers",
                "Write numbers greater than 9",
                "Accurately say that we have nothing",
                "All answers are correct"
            ],
            correct: 2
        }
    ];

    let currentQuestionIndex = 0;
    let userAnswers = new Array(questions.length).fill(null);
    let quizCompleted = false;

    const quizContent = document.getElementById('quizContent');
    const currentQuestionSpan = document.getElementById('currentQuestion');
    const totalQuestionsSpan = document.getElementById('totalQuestions');
    const prevQuestionBtn = document.getElementById('prevQuestion');
    const nextQuestionBtn = document.getElementById('nextQuestion');
    const finishQuizBtn = document.getElementById('finishQuiz');
    const quizResults = document.getElementById('quizResults');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const restartQuizBtn = document.getElementById('restartQuiz');

    totalQuestionsSpan.textContent = questions.length;

    function displayQuestion(index) {
        const question = questions[index];
        currentQuestionSpan.textContent = index + 1;
        
        let optionsHtml = '';
        question.options.forEach((option, optionIndex) => {
            const isSelected = userAnswers[index] === optionIndex;
            optionsHtml += `
                <div class="option ${isSelected ? 'selected' : ''}" data-option="${optionIndex}">
                    ${option}
                </div>
            `;
        });

        quizContent.innerHTML = `
            <div class="question">
                <h4>${question.question}</h4>
                <div class="options">
                    ${optionsHtml}
                </div>
            </div>
        `;

        // Add event handlers for answer options
        const optionElements = quizContent.querySelectorAll('.option');
        optionElements.forEach(option => {
            option.addEventListener('click', () => {
                const selectedOption = parseInt(option.getAttribute('data-option'));
                userAnswers[index] = selectedOption;
                
                // Remove selection from all options
                optionElements.forEach(opt => opt.classList.remove('selected'));
                // Highlight selected option
                option.classList.add('selected');
                
                updateNavigationButtons();
            });
        });

        updateNavigationButtons();
    }

    function updateNavigationButtons() {
        prevQuestionBtn.disabled = currentQuestionIndex === 0;
        nextQuestionBtn.style.display = currentQuestionIndex === questions.length - 1 ? 'none' : 'inline-block';
        finishQuizBtn.style.display = currentQuestionIndex === questions.length - 1 ? 'inline-block' : 'none';
    }

    prevQuestionBtn.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayQuestion(currentQuestionIndex);
        }
    });

    nextQuestionBtn.addEventListener('click', () => {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            displayQuestion(currentQuestionIndex);
        }
    });

    finishQuizBtn.addEventListener('click', () => {
        showResults();
    });

    restartQuizBtn.addEventListener('click', () => {
        restartQuiz();
    });

    function showResults() {
        let correctAnswers = 0;
        let resultsHtml = '';

        questions.forEach((question, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer === question.correct;
            
            if (isCorrect) {
                correctAnswers++;
            }

            resultsHtml += `
                <div style="margin-bottom: 15px; padding: 10px; background: ${isCorrect ? '#c6f6d5' : '#fed7d7'}; border-radius: 8px;">
                    <strong>Question ${index + 1}:</strong> ${question.question}<br>
                    <strong>Your answer:</strong> ${question.options[userAnswer] || 'Not answered'}<br>
                    <strong>Correct answer:</strong> ${question.options[question.correct]}<br>
                    <strong>Result:</strong> ${isCorrect ? '✅ Correct' : '❌ Incorrect'}
                </div>
            `;
        });

        const percentage = Math.round((correctAnswers / questions.length) * 100);
        let message = '';
        
        if (percentage === 100) {
            message = 'Excellent! You understand the importance of zero perfectly! 🎉';
        } else if (percentage >= 80) {
            message = 'Good! You understand the importance of zero well! 👍';
        } else if (percentage >= 60) {
            message = 'Not bad! But you need to study the theory a bit more. 📚';
        } else {
            message = 'Try studying the theory again and retake the test. 📖';
        }

        scoreDisplay.innerHTML = `
            <div style="font-size: 1.5rem; margin-bottom: 10px;">
                Your result: ${correctAnswers} out of ${questions.length} (${percentage}%)
            </div>
            <div style="margin-bottom: 15px;">${message}</div>
            ${resultsHtml}
        `;

        quizContent.style.display = 'none';
        document.querySelector('.quiz-controls').style.display = 'none';
        quizResults.style.display = 'block';
        quizCompleted = true;
    }

    function restartQuiz() {
        currentQuestionIndex = 0;
        userAnswers = new Array(questions.length).fill(null);
        quizCompleted = false;
        
        quizContent.style.display = 'block';
        document.querySelector('.quiz-controls').style.display = 'flex';
        quizResults.style.display = 'none';
        
        displayQuestion(0);
    }

    // Show first question on load
    displayQuestion(0);
} 