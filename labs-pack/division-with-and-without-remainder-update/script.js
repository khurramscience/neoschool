// Division Laboratory
let quizData = {
    currentQuestion: 0,
    questions: [],
    score: 0
};

document.addEventListener('DOMContentLoaded', function() {
    // Navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const mode = this.getAttribute('data-mode');
            
            // Update buttons
            navButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update sections
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(mode).classList.add('active');
        });
    });
    
    // Quiz functionality
    const startQuizBtn = document.getElementById('startQuiz');
    if (startQuizBtn) {
        startQuizBtn.addEventListener('click', function() {
            beginQuiz();
        });
    }
    
    // Quiz navigation
    const nextQuestionBtn = document.getElementById('nextQuestion');
    const finishQuizBtn = document.getElementById('finishQuiz');
    const retakeQuizBtn = document.getElementById('retakeQuiz');
    
    if (nextQuestionBtn) nextQuestionBtn.addEventListener('click', nextQuestion);
    if (finishQuizBtn) finishQuizBtn.addEventListener('click', finishQuiz);
    if (retakeQuizBtn) retakeQuizBtn.addEventListener('click', beginQuiz);
    
    // Practice functionality
    const newProblemBtn = document.getElementById('newProblem');
    const checkAnswerBtn = document.getElementById('checkAnswer');
    const resetProblemBtn = document.getElementById('resetProblem');
    
    if (newProblemBtn) {
        newProblemBtn.addEventListener('click', function() {
            generateSimpleProblem();
        });
    }
    
    if (checkAnswerBtn) {
        checkAnswerBtn.addEventListener('click', function() {
            checkAnswer();
        });
    }
    
    if (resetProblemBtn) {
        resetProblemBtn.addEventListener('click', function() {
            resetProblem();
        });
    }

    // Fallback delegation in case direct listeners fail to bind
    document.addEventListener('click', function(e) {
        const target = e.target;
        if (target && target.id === 'startQuiz') {
            beginQuiz();
        }
        if (target && target.id === 'retakeQuiz') {
            beginQuiz();
        }
    });
});

function beginQuiz() {
    generateQuizQuestions();
    
    quizData.currentQuestion = 0;
    quizData.score = 0;
    
    const quizIntro = document.getElementById('quizIntro');
    const quizContainer = document.getElementById('quizContainer');
    const quizResults = document.getElementById('quizResults');
    
    if (quizIntro) quizIntro.style.display = 'none';
    if (quizContainer) quizContainer.style.display = 'block';
    if (quizResults) quizResults.style.display = 'none';
    
    displayQuizQuestion();
}

function generateQuizQuestions() {
    quizData.questions = [];
    
    for (let i = 0; i < 10; i++) {
        const questionType = Math.random() < 0.5 ? 'division' : 'remainder';
        let question, correctAnswer, options;
        
        if (questionType === 'division') {
            const dividend = Math.floor(Math.random() * 50) + 10;
            const divisor = Math.floor(Math.random() * 8) + 2;
            const quotient = Math.floor(dividend / divisor);
            
            question = `What is the whole number result (quotient) when ${dividend} is divided by ${divisor}?`;
            correctAnswer = quotient;
            
            // Safely generate 4 unique options without infinite loops
            const optionSet = new Set([correctAnswer]);
            // First try nearby numbers
            for (let delta = -3; delta <= 3 && optionSet.size < 4; delta++) {
                const candidate = correctAnswer + delta;
                if (candidate >= 0) optionSet.add(candidate);
            }
            // If still not enough, add broader randoms
            let guard = 0;
            while (optionSet.size < 4 && guard < 50) {
                guard++;
                const candidate = Math.max(0, correctAnswer + Math.floor(Math.random() * 10) - 5);
                optionSet.add(candidate);
            }
            options = Array.from(optionSet).slice(0, 4);
        } else {
            const dividend = Math.floor(Math.random() * 30) + 10;
            const divisor = Math.floor(Math.random() * 6) + 2;
            const remainder = dividend % divisor;
            
            question = `What is the remainder (leftover) when ${dividend} is divided by ${divisor}?`;
            correctAnswer = remainder;
            
            // Generate up to 4 options; include values within [0, divisor-1] first
            const optionSet = new Set([correctAnswer]);
            for (let v = 0; v < divisor && optionSet.size < 4; v++) {
                optionSet.add(v);
            }
            // If divisor < 4, add a few plausible distractors >= divisor
            let extra = divisor;
            while (optionSet.size < 4 && extra <= divisor + 3) {
                optionSet.add(extra);
                extra++;
            }
            options = Array.from(optionSet).slice(0, 4);
        }
        
        // Shuffle options
        for (let j = options.length - 1; j > 0; j--) {
            const k = Math.floor(Math.random() * (j + 1));
            [options[j], options[k]] = [options[k], options[j]];
        }
        
        quizData.questions.push({
            question,
            options,
            correctAnswer,
            type: questionType
        });
    }
}

function displayQuizQuestion() {
    const currentQ = quizData.questions[quizData.currentQuestion];
    
    const currentQuestionEl = document.getElementById('currentQuestion');
    const totalQuestionsEl = document.getElementById('totalQuestions');
    const quizQuestionEl = document.getElementById('quizQuestion');
    const optionsContainer = document.getElementById('quizOptions');
    
    if (currentQuestionEl) currentQuestionEl.textContent = quizData.currentQuestion + 1;
    if (totalQuestionsEl) totalQuestionsEl.textContent = quizData.questions.length;
    if (quizQuestionEl) quizQuestionEl.textContent = currentQ.question;
    
    if (optionsContainer) {
        optionsContainer.innerHTML = '';
        
        currentQ.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'quiz-option';
            optionElement.textContent = option;
            optionElement.dataset.value = option;
            optionElement.addEventListener('click', () => selectQuizOption(optionElement, option));
            optionsContainer.appendChild(optionElement);
        });
    }
    
    const nextQuestionBtn = document.getElementById('nextQuestion');
    const finishQuizBtn = document.getElementById('finishQuiz');
    
    if (nextQuestionBtn) nextQuestionBtn.style.display = 'none';
    if (finishQuizBtn) finishQuizBtn.style.display = 'none';
}

function selectQuizOption(optionElement, value) {
    document.querySelectorAll('.quiz-option').forEach(opt => {
        opt.classList.remove('selected', 'correct', 'incorrect');
    });
    
    optionElement.classList.add('selected');
    
    const currentQ = quizData.questions[quizData.currentQuestion];
    const isCorrect = value === currentQ.correctAnswer;
    
    document.querySelectorAll('.quiz-option').forEach(opt => {
        if (opt.dataset.value == currentQ.correctAnswer) {
            opt.classList.add('correct');
        } else if (opt.classList.contains('selected') && !isCorrect) {
            opt.classList.add('incorrect');
        }
    });
    
    if (isCorrect) {
        quizData.score++;
    }
    
    const nextQuestionBtn = document.getElementById('nextQuestion');
    const finishQuizBtn = document.getElementById('finishQuiz');
    
    if (quizData.currentQuestion < quizData.questions.length - 1) {
        if (nextQuestionBtn) nextQuestionBtn.style.display = 'inline-block';
    } else {
        if (finishQuizBtn) finishQuizBtn.style.display = 'inline-block';
    }
}

function nextQuestion() {
    quizData.currentQuestion++;
    displayQuizQuestion();
}

function finishQuiz() {
    const quizContainer = document.getElementById('quizContainer');
    const quizResults = document.getElementById('quizResults');
    
    if (quizContainer) quizContainer.style.display = 'none';
    if (quizResults) quizResults.style.display = 'block';
    
    const correctAnswers = quizData.score;
    const totalQuestions = quizData.questions.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    
    const quizCorrect = document.getElementById('quizCorrect');
    const quizScore = document.getElementById('quizScore');
    const resultsFeedback = document.getElementById('resultsFeedback');
    
    if (quizCorrect) quizCorrect.textContent = correctAnswers;
    if (quizScore) quizScore.textContent = percentage + '%';
    
    let feedback = '';
    if (percentage >= 90) {
        feedback = '🎉 Excellent! You have mastered division concepts!';
    } else if (percentage >= 70) {
        feedback = '👍 Good job! You understand division well, but keep practicing!';
    } else if (percentage >= 50) {
        feedback = '📚 Not bad! Review the theory and practice more to improve!';
    } else {
        feedback = '📖 Keep studying! Review the theory section and practice regularly!';
    }
    
    if (resultsFeedback) resultsFeedback.textContent = feedback;
}

let currentProblem = null;
let practiceStats = {
    correct: 0,
    total: 0
};

const objectTypes = ['🍎', '🍊', '🍌', '🍇', '🍓', '🍉', '🥭', '🍍', '🥥', '🥝'];

function generateSimpleProblem() {
    const dividend = Math.floor(Math.random() * 20) + 5;
    const divisor = Math.floor(Math.random() * 5) + 2;
    const quotient = Math.floor(dividend / divisor);
    const remainder = dividend % divisor;
    
    currentProblem = {
        dividend,
        divisor,
        quotient,
        remainder,
        objectType: objectTypes[Math.floor(Math.random() * objectTypes.length)]
    };

    displayProblem();
    setupDragAndDrop();
}

function displayProblem() {
    const problemText = document.getElementById('problemText');
    if (problemText) {
        problemText.textContent = `Divide ${currentProblem.dividend} ${currentProblem.objectType} into groups of ${currentProblem.divisor}`;
    }

    const objectsArea = document.getElementById('objectsArea');
    const groupsArea = document.getElementById('groupsArea');
    
    if (objectsArea) objectsArea.innerHTML = '';
    if (groupsArea) groupsArea.innerHTML = '';

    if (objectsArea) {
        for (let i = 0; i < currentProblem.dividend; i++) {
            const object = document.createElement('div');
            object.className = 'draggable-object';
            object.textContent = currentProblem.objectType;
            object.draggable = true;
            object.dataset.index = i;
            objectsArea.appendChild(object);
        }
    }

    if (groupsArea) {
        const numGroups = Math.ceil(currentProblem.dividend / currentProblem.divisor);
        for (let i = 0; i < numGroups; i++) {
            const groupSlot = document.createElement('div');
            groupSlot.className = 'group-slot';
            groupSlot.dataset.groupIndex = i;
            groupSlot.innerHTML = `<span style="color: #999;">Group ${i + 1}</span>`;
            groupsArea.appendChild(groupSlot);
        }
    }

    const quotientInput = document.getElementById('quotientInput');
    const remainderInput = document.getElementById('remainderInput');
    const feedback = document.getElementById('feedback');
    
    if (quotientInput) quotientInput.value = '';
    if (remainderInput) remainderInput.value = '';
    if (feedback) {
        feedback.textContent = '';
        feedback.className = 'feedback';
    }
}

function setupDragAndDrop() {
    const draggableObjects = document.querySelectorAll('.draggable-object');
    const groupSlots = document.querySelectorAll('.group-slot');

    draggableObjects.forEach(object => {
        object.addEventListener('dragstart', handleDragStart);
        object.addEventListener('dragend', handleDragEnd);
    });

    groupSlots.forEach(slot => {
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('drop', handleDrop);
    });
}

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.index);
    e.target.style.opacity = '0.5';
}

function handleDragEnd(e) {
    e.target.style.opacity = '1';
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    const objectIndex = e.dataTransfer.getData('text/plain');
    const object = document.querySelector(`[data-index="${objectIndex}"]`);
    const slot = e.target.closest('.group-slot');

    if (slot && object) {
        const objectsInSlot = slot.querySelectorAll('.draggable-object').length;
        if (objectsInSlot < currentProblem.divisor) {
            slot.appendChild(object);
            slot.classList.add('filled');
        }
    }
}

function checkAnswer() {
    const userQuotient = parseInt(document.getElementById('quotientInput')?.value) || 0;
    const userRemainder = parseInt(document.getElementById('remainderInput')?.value) || 0;
    const feedback = document.getElementById('feedback');

    if (userQuotient === currentProblem.quotient && userRemainder === currentProblem.remainder) {
        if (feedback) {
            feedback.textContent = '✅ Correct! Well done!';
            feedback.className = 'feedback correct';
        }
        practiceStats.correct++;
    } else {
        if (feedback) {
            feedback.textContent = `❌ Incorrect. The answer is ${currentProblem.quotient} remainder ${currentProblem.remainder}`;
            feedback.className = 'feedback incorrect';
        }
    }

    practiceStats.total++;
    updateStats();
}

function resetProblem() {
    if (currentProblem) {
        displayProblem();
    }
}

function updateStats() {
    const correctCount = document.getElementById('correctCount');
    const totalCount = document.getElementById('totalCount');
    const score = document.getElementById('score');
    
    if (correctCount) correctCount.textContent = practiceStats.correct;
    if (totalCount) totalCount.textContent = practiceStats.total;
    
    const scorePercent = practiceStats.total > 0 ? Math.round((practiceStats.correct / practiceStats.total) * 100) : 0;
    if (score) score.textContent = scorePercent + '%';
} 