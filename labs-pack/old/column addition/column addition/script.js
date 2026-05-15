// Global variables
let currentDemo = null;
let currentPractice = null;
let testQuestions = [];
let currentTestQuestion = 0;
let testAnswers = [];
let practiceStats = { correct: 0, total: 0 };

// Tab switching function
function showTab(tabName) {
    // Hide all tabs
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Remove active class from all buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Show the needed tab
    document.getElementById(tabName).classList.add('active');
    
    // Make button active
    event.target.classList.add('active');
}

// Functions for interactive demonstration
function generateDemo() {
    const num1 = Math.floor(Math.random() * 900) + 100; // 100-999
    const num2 = Math.floor(Math.random() * 900) + 100; // 100-999
    
    currentDemo = {
        num1: num1,
        num2: num2,
        result: num1 + num2,
        step: 0
    };
    
    displayDemo();
}

function displayDemo() {
    const demoArea = document.getElementById('demo-area');
    const { num1, num2, step } = currentDemo;
    
    if (step === 0) {
        demoArea.innerHTML = `
            <div style="text-align: center;">
                <h4>Example: ${num1} + ${num2}</h4>
                <div style="font-family: 'Courier New', monospace; font-size: 1.2rem; margin: 20px 0;">
                    <div>${num1}</div>
                    <div>+ ${num2}</div>
                    <div style="border-top: 2px solid white; margin: 10px 0; padding-top: 10px;">?</div>
                </div>
                <p>Click "Next Step" to see the solution</p>
            </div>
        `;
    } else if (step === 1) {
        // Show ones addition
        const units1 = num1 % 10;
        const units2 = num2 % 10;
        const unitsSum = units1 + units2;
        const carry = Math.floor(unitsSum / 10);
        const unitsResult = unitsSum % 10;
        
        demoArea.innerHTML = `
            <div style="text-align: center;">
                <h4>Step 1: Add the ones</h4>
                <div style="font-family: 'Courier New', monospace; font-size: 1.2rem; margin: 20px 0;">
                    <div>${num1}</div>
                    <div>+ ${num2}</div>
                    <div style="border-top: 2px solid white; margin: 10px 0; padding-top: 10px;">
                        ${carry > 0 ? carry : ' '} ${unitsResult}
                    </div>
                </div>
                <p>${units1} + ${units2} = ${unitsSum}. Write ${unitsResult}${carry > 0 ? `, carry ${carry}` : ''}</p>
            </div>
        `;
    } else if (step === 2) {
        // Show tens addition
        const tens1 = Math.floor((num1 % 100) / 10);
        const tens2 = Math.floor((num2 % 100) / 10);
        const units1 = num1 % 10;
        const units2 = num2 % 10;
        const unitsSum = units1 + units2;
        const carry1 = Math.floor(unitsSum / 10);
        const tensSum = tens1 + tens2 + carry1;
        const carry2 = Math.floor(tensSum / 10);
        const tensResult = tensSum % 10;
        const unitsResult = unitsSum % 10;
        
        demoArea.innerHTML = `
            <div style="text-align: center;">
                <h4>Step 2: Add the tens</h4>
                <div style="font-family: 'Courier New', monospace; font-size: 1.2rem; margin: 20px 0;">
                    <div>${num1}</div>
                    <div>+ ${num2}</div>
                    <div>+ ${carry1} (carry)</div>
                    <div style="border-top: 2px solid white; margin: 10px 0; padding-top: 10px;">
                        ${carry2 > 0 ? carry2 : ' '} ${tensResult} ${unitsResult}
                    </div>
                </div>
                <p>${tens1} + ${tens2} + ${carry1} = ${tensSum}. Write ${tensResult}${carry2 > 0 ? `, carry ${carry2}` : ''}</p>
            </div>
        `;
    } else if (step === 3) {
        // Show final result
        const result = num1 + num2;
        
        demoArea.innerHTML = `
            <div style="text-align: center;">
                <h4>Result</h4>
                <div style="font-family: 'Courier New', monospace; font-size: 1.2rem; margin: 20px 0;">
                    <div>${num1}</div>
                    <div>+ ${num2}</div>
                    <div style="border-top: 2px solid white; margin: 10px 0; padding-top: 10px;">
                        ${result}
                    </div>
                </div>
                <p style="color: #ffd700; font-weight: bold;">${num1} + ${num2} = ${result}</p>
            </div>
        `;
    }
}

function showStep() {
    if (currentDemo) {
        currentDemo.step++;
        if (currentDemo.step > 3) {
            currentDemo.step = 3;
        }
        displayDemo();
    } else {
        alert('Generate an example first!');
    }
}

function resetDemo() {
    currentDemo = null;
    document.getElementById('demo-area').innerHTML = '<p>Click "New Example" to start the demonstration</p>';
}

// Functions for practice
function generatePractice() {
    const num1 = Math.floor(Math.random() * 900) + 100; // 100-999
    const num2 = Math.floor(Math.random() * 900) + 100; // 100-999
    
    currentPractice = {
        num1: num1,
        num2: num2,
        result: num1 + num2
    };
    
    document.getElementById('practice-problem').innerHTML = `
        <div style="font-family: 'Courier New', monospace; font-size: 1.5rem;">
            <div>${num1}</div>
            <div>+ ${num2}</div>
            <div style="border-top: 2px solid #333; margin: 10px 0; padding-top: 10px;">?</div>
        </div>
    `;
    
    document.getElementById('user-answer').value = '';
    document.getElementById('practice-feedback').innerHTML = '';
}

function checkAnswer() {
    if (!currentPractice) {
        alert('Generate an exercise first!');
        return;
    }
    
    const userAnswer = parseInt(document.getElementById('user-answer').value);
    const feedback = document.getElementById('practice-feedback');
    
    if (isNaN(userAnswer)) {
        feedback.innerHTML = '<p style="color: #721c24; background: #f8d7da; padding: 10px; border-radius: 5px;">Please enter a number!</p>';
        return;
    }
    
    practiceStats.total++;
    
    if (userAnswer === currentPractice.result) {
        practiceStats.correct++;
        feedback.innerHTML = '<p style="color: #155724; background: #d4edda; padding: 10px; border-radius: 5px;">✅ Correct! Well done!</p>';
    } else {
        feedback.innerHTML = `<p style="color: #721c24; background: #f8d7da; padding: 10px; border-radius: 5px;">❌ Incorrect. Correct answer: ${currentPractice.result}</p>`;
    }
    
    updateStats();
}

function showSolution() {
    if (!currentPractice) {
        alert('Generate an exercise first!');
        return;
    }
    
    const { num1, num2, result } = currentPractice;
    
    // Show step-by-step solution
    const feedback = document.getElementById('practice-feedback');
    feedback.innerHTML = `
        <div style="background: #e3f2fd; padding: 15px; border-radius: 10px; margin-top: 15px;">
            <h4>Step-by-step solution:</h4>
            <div style="font-family: 'Courier New', monospace; font-size: 1.1rem;">
                <div>${num1}</div>
                <div>+ ${num2}</div>
                <div style="border-top: 2px solid #333; margin: 10px 0; padding-top: 10px;">${result}</div>
            </div>
            <p style="margin-top: 10px;"><strong>Check:</strong> ${num1} + ${num2} = ${result}</p>
        </div>
    `;
}

function updateStats() {
    document.getElementById('correct-count').textContent = practiceStats.correct;
    document.getElementById('total-count').textContent = practiceStats.total;
    
    const percentage = practiceStats.total > 0 ? Math.round((practiceStats.correct / practiceStats.total) * 100) : 0;
    document.getElementById('percentage').textContent = percentage + '%';
}

// Functions for test
function startTest() {
    // Generate 10 questions
    testQuestions = [];
    for (let i = 0; i < 10; i++) {
        const num1 = Math.floor(Math.random() * 900) + 100;
        const num2 = Math.floor(Math.random() * 900) + 100;
        testQuestions.push({
            num1: num1,
            num2: num2,
            result: num1 + num2
        });
    }
    
    testAnswers = [];
    currentTestQuestion = 0;
    
    document.getElementById('test-intro').style.display = 'none';
    document.getElementById('test-area').style.display = 'block';
    document.getElementById('test-results').style.display = 'none';
    
    showTestQuestion();
}

function showTestQuestion() {
    const question = testQuestions[currentTestQuestion];
    
    document.getElementById('current-question').textContent = currentTestQuestion + 1;
    document.getElementById('progress-fill').style.width = ((currentTestQuestion + 1) / 10) * 100 + '%';
    
    document.getElementById('test-question').innerHTML = `
        <div style="font-family: 'Courier New', monospace; font-size: 1.5rem;">
            <div>${question.num1}</div>
            <div>+ ${question.num2}</div>
            <div style="border-top: 2px solid #333; margin: 10px 0; padding-top: 10px;">?</div>
        </div>
    `;
    
    document.getElementById('test-answer').value = '';
    document.getElementById('test-feedback').innerHTML = '';
}

function submitTestAnswer() {
    const userAnswer = parseInt(document.getElementById('test-answer').value);
    const feedback = document.getElementById('test-feedback');
    
    if (isNaN(userAnswer)) {
        feedback.innerHTML = '<p style="color: #721c24; background: #f8d7da; padding: 10px; border-radius: 5px;">Please enter a number!</p>';
        return;
    }
    
    const question = testQuestions[currentTestQuestion];
    const isCorrect = userAnswer === question.result;
    
    testAnswers.push({
        question: question,
        userAnswer: userAnswer,
        isCorrect: isCorrect
    });
    
    if (isCorrect) {
        feedback.innerHTML = '<p style="color: #155724; background: #d4edda; padding: 10px; border-radius: 5px;">✅ Correct!</p>';
    } else {
        feedback.innerHTML = `<p style="color: #721c24; background: #f8d7da; padding: 10px; border-radius: 5px;">❌ Incorrect. Correct answer: ${question.result}</p>`;
    }
    
    // Move to next question after 1.5 seconds
    setTimeout(() => {
        currentTestQuestion++;
        if (currentTestQuestion < 10) {
            showTestQuestion();
        } else {
            showTestResults();
        }
    }, 1500);
}

function showTestResults() {
    const correctAnswers = testAnswers.filter(answer => answer.isCorrect).length;
    const percentage = Math.round((correctAnswers / 10) * 100);
    
    document.getElementById('test-area').style.display = 'none';
    document.getElementById('test-results').style.display = 'block';
    
    let grade = '';
    let color = '';
    
    if (percentage >= 90) {
        grade = 'Excellent! 🏆';
        color = '#28a745';
    } else if (percentage >= 70) {
        grade = 'Good! 👍';
        color = '#17a2b8';
    } else if (percentage >= 50) {
        grade = 'Satisfactory 📚';
        color = '#ffc107';
    } else {
        grade = 'Need to review the material 📖';
        color = '#dc3545';
    }
    
    document.getElementById('test-score').innerHTML = `
        <h2 style="color: ${color}; margin-bottom: 20px;">${grade}</h2>
        <p style="font-size: 1.2rem; margin-bottom: 10px;">Correct answers: ${correctAnswers} out of 10</p>
        <p style="font-size: 1.2rem; margin-bottom: 20px;">Completion percentage: ${percentage}%</p>
    `;
    
    // Show answer details
    let detailsHTML = '<h4 style="margin-bottom: 15px;">Answer details:</h4>';
    testAnswers.forEach((answer, index) => {
        const status = answer.isCorrect ? '✅' : '❌';
        detailsHTML += `
            <div style="margin-bottom: 10px; padding: 10px; background: ${answer.isCorrect ? '#d4edda' : '#f8d7da'}; border-radius: 5px;">
                <strong>Question ${index + 1}:</strong> ${answer.question.num1} + ${answer.question.num2} = ${answer.question.result}
                <br>Your answer: ${answer.userAnswer} ${status}
            </div>
        `;
    });
    
    document.getElementById('test-details').innerHTML = detailsHTML;
}

function restartTest() {
    document.getElementById('test-results').style.display = 'none';
    document.getElementById('test-intro').style.display = 'block';
}

// Initialization when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Set up event handlers for Enter key in input fields
    document.getElementById('user-answer').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
    
    document.getElementById('test-answer').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            submitTestAnswer();
        }
    });
    
    // Initialize statistics
    updateStats();
}); 