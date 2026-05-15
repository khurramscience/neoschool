// Array of exercises
const exercises = [
    // Graphic questions
    {
        type: "graphic",
        question: "Select the figure shaded by 1/2:",
        options: [
            { value: "1/2", svg: `<svg width='60' height='60'><rect x='5' y='5' width='50' height='50' fill='#eee' stroke='#333'/><rect x='5' y='5' width='25' height='50' fill='#1a73e8'/></svg>` },
            { value: "1/3", svg: `<svg width='60' height='60'><rect x='5' y='5' width='50' height='50' fill='#eee' stroke='#333'/><rect x='5' y='5' width='16.6' height='50' fill='#1a73e8'/></svg>` },
            { value: "3/4", svg: `<svg width='60' height='60'><rect x='5' y='5' width='50' height='50' fill='#eee' stroke='#333'/><rect x='5' y='5' width='37.5' height='50' fill='#1a73e8'/></svg>` },
            { value: "2/3", svg: `<svg width='60' height='60'><rect x='5' y='5' width='50' height='50' fill='#eee' stroke='#333'/><rect x='5' y='5' width='33.3' height='50' fill='#1a73e8'/></svg>` }
        ],
        answer: "1/2"
    },
    {
        type: "graphic",
        question: "Select the figure shaded by 3/4:",
        options: [
            { value: "1/2", svg: `<svg width='60' height='60'><rect x='5' y='5' width='50' height='50' fill='#eee' stroke='#333'/><rect x='5' y='5' width='25' height='50' fill='#1a73e8'/></svg>` },
            { value: "3/4", svg: `<svg width='60' height='60'><rect x='5' y='5' width='50' height='50' fill='#eee' stroke='#333'/><rect x='5' y='5' width='37.5' height='50' fill='#1a73e8'/></svg>` },
            { value: "1/3", svg: `<svg width='60' height='60'><rect x='5' y='5' width='50' height='50' fill='#eee' stroke='#333'/><rect x='5' y='5' width='16.6' height='50' fill='#1a73e8'/></svg>` },
            { value: "2/3", svg: `<svg width='60' height='60'><rect x='5' y='5' width='50' height='50' fill='#eee' stroke='#333'/><rect x='5' y='5' width='33.3' height='50' fill='#1a73e8'/></svg>` }
        ],
        answer: "3/4"
    },
    {
        type: "graphic",
        question: "Select the figure shaded by 2/3:",
        options: [
            { value: "1/2", svg: `<svg width='60' height='60'><rect x='5' y='5' width='50' height='50' fill='#eee' stroke='#333'/><rect x='5' y='5' width='25' height='50' fill='#1a73e8'/></svg>` },
            { value: "1/3", svg: `<svg width='60' height='60'><rect x='5' y='5' width='50' height='50' fill='#eee' stroke='#333'/><rect x='5' y='5' width='16.6' height='50' fill='#1a73e8'/></svg>` },
            { value: "2/3", svg: `<svg width='60' height='60'><rect x='5' y='5' width='50' height='50' fill='#eee' stroke='#333'/><rect x='5' y='5' width='33.3' height='50' fill='#1a73e8'/></svg>` },
            { value: "3/4", svg: `<svg width='60' height='60'><rect x='5' y='5' width='50' height='50' fill='#eee' stroke='#333'/><rect x='5' y='5' width='37.5' height='50' fill='#1a73e8'/></svg>` }
        ],
        answer: "2/3"
    },
    // New text questions
    {
        question: "Convert the fraction 2/5 to a decimal",
        answer: "0.4",
        hint: "Divide the numerator by the denominator"
    },
    {
        question: "Simplify the fraction 4/12",
        answer: "1/3",
        hint: "Find the greatest common divisor of the numerator and denominator"
    },
    {
        question: "Add the fractions: 1/3 + 1/6",
        answer: "1/2",
        hint: "Convert fractions to a common denominator"
    },
    {
        question: "Subtract the fractions: 5/6 - 1/3",
        answer: "1/2",
        hint: "Convert fractions to a common denominator before subtracting"
    },
    {
        question: "Multiply the fractions: 2/3 × 3/4",
        answer: "1/2",
        hint: "Multiply numerators and denominators, then simplify"
    },
    {
        question: "Divide the fractions: 3/4 ÷ 1/2",
        answer: "3/2",
        hint: "Multiply the first fraction by the reciprocal of the second"
    },
    {
        question: "Convert 0.25 to a fraction",
        answer: "1/4",
        hint: "0.25 = 25/100, simplify the fraction"
    },
    // Existing text questions
    {
        question: "Convert the fraction 3/4 to a decimal",
        answer: "0.75",
        hint: "Divide the numerator by the denominator"
    },
    {
        question: "Simplify the fraction 6/8",
        answer: "3/4",
        hint: "Find the greatest common divisor of the numerator and denominator"
    },
    {
        question: "Add the fractions: 1/4 + 1/2",
        answer: "3/4",
        hint: "Convert fractions to a common denominator"
    },
    {
        question: "Subtract the fractions: 3/4 - 1/4",
        answer: "1/2",
        hint: "With the same denominators, subtract only the numerators"
    },
    {
        question: "Multiply the fractions: 1/2 × 1/2",
        answer: "1/4",
        hint: "Multiply numerators and denominators"
    },
    {
        question: "Divide the fractions: 1/2 ÷ 1/4",
        answer: "2",
        hint: "Multiply the first fraction by the reciprocal of the second"
    },
    {
        question: "Convert 0.5 to a fraction",
        answer: "1/2",
        hint: "0.5 = 5/10, simplify the fraction"
    }
];

// Array of support messages
const supportMessages = {
    correct: [
        "Excellent! You solved the problem correctly!",
        "Great job! You're really good at fractions!",
        "Well done! Keep up the good work!"
    ],
    incorrect: [
        "Don't worry, let's try again!",
        "Think carefully, you're almost there!",
        "Let's figure this out together!"
    ],
    hints: [
        "Remember to convert fractions to a common denominator when adding them",
        "Don't forget to simplify the fraction if possible",
        "When dividing fractions, don't forget to flip the second fraction"
    ]
};

let currentExerciseIndex = 0;

// Array of hints for different types of errors
const errorHints = {
    decimal: {
        pattern: /^\d+\.\d+$/,
        message: "Try to represent the answer as a fraction"
    },
    fraction: {
        pattern: /^\d+\/\d+$/,
        message: "Try to represent the answer as a decimal"
    },
    tooBig: {
        check: (answer) => parseFloat(answer) > 1,
        message: "Check if the result is not greater than 1"
    },
    tooSmall: {
        check: (answer) => parseFloat(answer) < 0,
        message: "Check if the result is not negative"
    }
};

// Object for storing statistics
const statistics = {
    totalAnswers: 0,
    correctAnswers: 0,
    exerciseStats: {},
    startTime: null
};

// Function to display the current exercise
function showExercise() {
    const exerciseElement = document.getElementById('exercise');
    const textAnswerInput = document.getElementById('text-answer-input');
    const current = exercises[currentExerciseIndex];
    
    exerciseElement.innerHTML = '';
    
    if (current.type === 'graphic') {
        // Graphic question
        textAnswerInput.style.display = 'none'; // Hide text answer input field
        
        const q = document.createElement('div');
        q.textContent = current.question;
        q.className = 'graphic-question';
        exerciseElement.appendChild(q);
        
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'graphic-options';
        
        current.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'graphic-option-btn';
            btn.innerHTML = opt.svg;
            btn.onclick = () => checkGraphicAnswer(opt.value);
            optionsDiv.appendChild(btn);
        });
        
        exerciseElement.appendChild(optionsDiv);
    } else {
        // Text question
        textAnswerInput.style.display = 'flex'; // Show text answer input field
        exerciseElement.textContent = current.question;
        addTeacherMessage("Let's solve this exercise! " + current.hint);
    }
}

// Function to add teacher message
function addTeacherMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message teacher-message';
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to add student message
function addStudentMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message student-message';
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to analyze wrong answer
function analyzeWrongAnswer(userAnswer, correctAnswer) {
    // Check answer format
    if (errorHints.decimal.pattern.test(userAnswer) && !errorHints.decimal.pattern.test(correctAnswer)) {
        return errorHints.decimal.message;
    }
    if (errorHints.fraction.pattern.test(userAnswer) && !errorHints.fraction.pattern.test(correctAnswer)) {
        return errorHints.fraction.message;
    }

    // Check value
    const numericAnswer = parseFloat(userAnswer);
    if (!isNaN(numericAnswer)) {
        if (errorHints.tooBig.check(userAnswer)) {
            return errorHints.tooBig.message;
        }
        if (errorHints.tooSmall.check(userAnswer)) {
            return errorHints.tooSmall.message;
        }
    }

    // If other checks don't match, return general hint
    return exercises[currentExerciseIndex].hint;
}

// Function to convert common fraction to decimal
function fractionToDecimal(fraction) {
    const [numerator, denominator] = fraction.split('/').map(Number);
    if (denominator === 0) return null;
    return numerator / denominator;
}

// Function to convert decimal to common fraction
function decimalToFraction(decimal) {
    const tolerance = 0.0001;
    let numerator = 1;
    let denominator = 1;
    
    while (Math.abs(numerator / denominator - decimal) > tolerance) {
        if (numerator / denominator < decimal) {
            numerator++;
        } else {
            denominator++;
        }
    }
    
    return `${numerator}/${denominator}`;
}

// Function to normalize answer
function normalizeAnswer(answer) {
    // Remove spaces and convert to lowercase
    answer = answer.toLowerCase().replace(/\s+/g, '');
    
    // If it's a common fraction
    if (answer.includes('/')) {
        const decimal = fractionToDecimal(answer);
        return decimal !== null ? decimal.toString() : answer;
    }
    
    // If it's a decimal fraction
    if (answer.includes('.')) {
        const fraction = decimalToFraction(parseFloat(answer));
        return fraction;
    }
    
    return answer;
}

// Function to update statistics
function updateStatistics(isCorrect) {
    statistics.totalAnswers++;
    if (isCorrect) {
        statistics.correctAnswers++;
    }
    
    // Update statistics for specific exercise
    const currentExercise = exercises[currentExerciseIndex];
    if (!statistics.exerciseStats[currentExercise.question]) {
        statistics.exerciseStats[currentExercise.question] = {
            attempts: 0,
            correct: 0
        };
    }
    statistics.exerciseStats[currentExercise.question].attempts++;
    if (isCorrect) {
        statistics.exerciseStats[currentExercise.question].correct++;
    }
}

// Function to display final results
function showFinalResults() {
    const timeSpent = Math.round((Date.now() - statistics.startTime) / 1000);
    const minutes = Math.floor(timeSpent / 60);
    const seconds = timeSpent % 60;
    
    let resultsHTML = `
        <h3>Final Results:</h3>
        <p>Total Answers: ${statistics.totalAnswers}</p>
        <p>Correct Answers: ${statistics.correctAnswers}</p>
        <p>Success Rate: ${Math.round((statistics.correctAnswers / statistics.totalAnswers) * 100)}%</p>
        <p>Time Spent: ${minutes} min. ${seconds} sec.</p>
        
        <h3>Exercise Statistics:</h3>
    `;
    
    for (const [question, stats] of Object.entries(statistics.exerciseStats)) {
        const successRate = Math.round((stats.correct / stats.attempts) * 100);
        resultsHTML += `
            <div class="exercise-stat">
                <p><strong>Exercise:</strong> ${question}</p>
                <p>Attempts: ${stats.attempts}</p>
                <p>Correct: ${stats.correct}</p>
                <p>Success Rate: ${successRate}%</p>
            </div>
        `;
    }
    
    document.getElementById('final-results').innerHTML = resultsHTML;
}

// Function to launch confetti
function launchConfetti() {
    // Launch confetti from left
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: 0, y: 0.6 }
    });

    // Launch confetti from right
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: 1, y: 0.6 }
    });

    // Launch confetti from top
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: 0.5, y: 0 }
    });

    // Repeat confetti launch several times
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Launch confetti from different sides
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
    }, 250);
}

// Function to finish test
function finishTest() {
    // Disable answer input
    document.getElementById('answer').disabled = true;
    document.getElementById('check-answer').disabled = true;
    
    // Hide exercise container
    document.querySelector('.exercise-container').style.display = 'none';
    
    // Show completion screen
    document.getElementById('test-complete').style.display = 'block';
    
    // Show final results
    showFinalResults();
    
    // Launch confetti
    launchConfetti();
    
    // Add message to chat
    addTeacherMessage("Test completed! You can take it again by clicking the 'Take Again' button.");
}

// Function to restart test
function restartTest() {
    // Reset statistics
    statistics.totalAnswers = 0;
    statistics.correctAnswers = 0;
    statistics.exerciseStats = {};
    statistics.startTime = Date.now();
    
    // Reset current exercise index
    currentExerciseIndex = 0;
    
    // Clear chat
    document.getElementById('chat-messages').innerHTML = '';
    
    // Enable answer input
    document.getElementById('answer').disabled = false;
    document.getElementById('check-answer').disabled = false;
    
    // Show exercise container and hide results
    document.querySelector('.exercise-container').style.display = 'block';
    document.getElementById('test-complete').style.display = 'none';
    
    // Show first exercise
    showExercise();
    
    // Add welcome message
    addTeacherMessage("Let's start the test again! I'm sure you'll do even better this time!");
}

// Function to display intermediate statistics
function showStatistics() {
    const timeSpent = Math.round((Date.now() - statistics.startTime) / 1000);
    const minutes = Math.floor(timeSpent / 60);
    const seconds = timeSpent % 60;
    
    let statsMessage = `
        📊 Statistics for the last 5 answers:
        Total Answers: ${statistics.totalAnswers}
        Correct Answers: ${statistics.correctAnswers}
        Success Rate: ${Math.round((statistics.correctAnswers / statistics.totalAnswers) * 100)}%
        Time Spent: ${minutes} min. ${seconds} sec.
        
        📝 Exercise Statistics:
    `;
    
    for (const [question, stats] of Object.entries(statistics.exerciseStats)) {
        const successRate = Math.round((stats.correct / stats.attempts) * 100);
        statsMessage += `
        Exercise: ${question}
        Attempts: ${stats.attempts}
        Correct: ${stats.correct}
        Success Rate: ${successRate}%
        `;
    }
    
    // Show statistics in chat
    addTeacherMessage(statsMessage);
}

// Function to animate robot on correct answer
function animateRobotCorrect() {
    const robotContainer = document.querySelector('.chat-container');
    robotContainer.classList.add('robot-correct');
    setTimeout(() => {
        robotContainer.classList.remove('robot-correct');
    }, 2000);
}

// Function to animate robot on incorrect answer
function animateRobotIncorrect() {
    const robotContainer = document.querySelector('.chat-container');
    robotContainer.classList.add('robot-incorrect');
    setTimeout(() => {
        robotContainer.classList.remove('robot-incorrect');
    }, 2000);
}

// Function to check answer
function checkAnswer() {
    if (statistics.totalAnswers >= 12) {
        return;
    }

    const answerInput = document.getElementById('answer');
    const userAnswer = answerInput.value.trim();
    const correctAnswer = exercises[currentExerciseIndex].answer;
    const exerciseElement = document.getElementById('exercise');

    const normalizedUserAnswer = normalizeAnswer(userAnswer);
    const normalizedCorrectAnswer = normalizeAnswer(correctAnswer);

    const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer || 
                     Math.abs(parseFloat(normalizedUserAnswer) - parseFloat(normalizedCorrectAnswer)) < 0.0001;

    updateStatistics(isCorrect);

    if (isCorrect) {
        exerciseElement.style.backgroundColor = '#e8f5e9';
        addTeacherMessage(supportMessages.correct[Math.floor(Math.random() * supportMessages.correct.length)]);
        animateRobotCorrect();
        
        if (statistics.totalAnswers >= 12) {
            setTimeout(finishTest, 1500);
            return;
        }
        
        currentExerciseIndex = (currentExerciseIndex + 1) % exercises.length;
        setTimeout(() => {
            exerciseElement.style.backgroundColor = '#f8f9fa';
            showExercise();
        }, 1500);
    } else {
        exerciseElement.style.backgroundColor = '#ffebee';
        const specificHint = analyzeWrongAnswer(userAnswer, correctAnswer);
        addTeacherMessage(supportMessages.incorrect[Math.floor(Math.random() * supportMessages.incorrect.length)]);
        animateRobotIncorrect();
        setTimeout(() => {
            addTeacherMessage("Hint: " + specificHint);
        }, 1000);
        setTimeout(() => {
            exerciseElement.style.backgroundColor = '#f8f9fa';
        }, 1500);
    }
    answerInput.value = '';
}

// Function to check graphic answer
function checkGraphicAnswer(selectedValue) {
    const current = exercises[currentExerciseIndex];
    const isCorrect = selectedValue === current.answer;
    updateStatistics(isCorrect);
    const exerciseElement = document.getElementById('exercise');
    if (isCorrect) {
        exerciseElement.style.backgroundColor = '#e8f5e9';
        addTeacherMessage(supportMessages.correct[Math.floor(Math.random() * supportMessages.correct.length)]);
        animateRobotCorrect();
        
        if (statistics.totalAnswers >= 12) {
            setTimeout(finishTest, 1500);
            return;
        }
        currentExerciseIndex = (currentExerciseIndex + 1) % exercises.length;
        setTimeout(() => {
            exerciseElement.style.backgroundColor = '#f8f9fa';
            showExercise();
        }, 1500);
    } else {
        exerciseElement.style.backgroundColor = '#ffebee';
        addTeacherMessage(supportMessages.incorrect[Math.floor(Math.random() * supportMessages.incorrect.length)]);
        animateRobotIncorrect();
        setTimeout(() => {
            exerciseElement.style.backgroundColor = '#f8f9fa';
        }, 1500);
    }
}

// Initialization when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize start time
    statistics.startTime = Date.now();
    showExercise();
    
    // Answer check button handler
    document.getElementById('check-answer').addEventListener('click', checkAnswer);
    
    // Answer input by Enter handler
    document.getElementById('answer').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });

    // Chat message send handler
    document.getElementById('send-message').addEventListener('click', () => {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();
        if (message) {
            addStudentMessage(message);
            chatInput.value = '';
            // Simulate teacher response
            setTimeout(() => {
                addTeacherMessage(supportMessages.hints[Math.floor(Math.random() * supportMessages.hints.length)]);
            }, 1000);
        }
    });

    // Chat message send by Enter handler
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('send-message').click();
        }
    });

    // Test restart button handler
    document.getElementById('restart-test').addEventListener('click', restartTest);
}); 