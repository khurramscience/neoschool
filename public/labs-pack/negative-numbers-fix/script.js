// Navigation between sections
document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const contentSections = document.querySelectorAll('.content-section');

    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            
            // Remove active class from all buttons and sections
            navButtons.forEach(btn => btn.classList.remove('active'));
            contentSections.forEach(section => section.classList.remove('active'));
            
            // Add active class to selected button and section
            this.classList.add('active');
            document.getElementById(targetSection).classList.add('active');
        });
    });

    // Initialize interactive elements
    initTemperatureDemo();
    initMoneyCalculator();
    initFloorCalculator();
    initTest();
});

// Temperature slider
function initTemperatureDemo() {
    const tempSlider = document.getElementById('tempSlider');
    const tempValue = document.getElementById('tempValue');
    const warmUpBtn = document.getElementById('warmUp');
    const tempResult = document.getElementById('tempResult');

    if (tempSlider && tempValue) {
        tempSlider.addEventListener('input', function() {
            const value = parseInt(this.value);
            tempValue.textContent = value + '°C';
            
            // Change color depending on temperature
            if (value > 0) {
                tempValue.style.color = '#ff6b6b';
            } else if (value === 0) {
                tempValue.style.color = '#feca57';
            } else {
                tempValue.style.color = '#48dbfb';
            }
        });
    }

    if (warmUpBtn && tempResult) {
        warmUpBtn.addEventListener('click', function() {
            const currentTemp = parseInt(tempSlider.value);
            const newTemp = currentTemp + 8;
            
            // Temperature change animation
            animateTemperatureChange(currentTemp, newTemp);
            
            setTimeout(() => {
                tempSlider.value = newTemp;
                tempValue.textContent = newTemp + '°C';
                
                if (newTemp > 0) {
                    tempValue.style.color = '#ff6b6b';
                } else if (newTemp === 0) {
                    tempValue.style.color = '#feca57';
                } else {
                    tempValue.style.color = '#48dbfb';
                }
                
                tempResult.textContent = `Temperature changed from ${currentTemp}°C to ${newTemp}°C`;
                tempResult.className = 'result correct';
            }, 1000);
        });
    }
}

// Temperature change animation
function animateTemperatureChange(from, to) {
    const tempValue = document.getElementById('tempValue');
    const steps = 10;
    const step = (to - from) / steps;
    let current = from;
    
    const interval = setInterval(() => {
        current += step;
        if ((step > 0 && current >= to) || (step < 0 && current <= to)) {
            current = to;
            clearInterval(interval);
        }
        tempValue.textContent = Math.round(current) + '°C';
    }, 100);
}

// Money calculator
function initMoneyCalculator() {
    const calculateMoneyBtn = document.getElementById('calculateMoney');
    const moneyResult = document.getElementById('moneyResult');

    if (calculateMoneyBtn && moneyResult) {
        calculateMoneyBtn.addEventListener('click', function() {
            const startMoney = parseInt(document.getElementById('startMoney').value);
            const purchase = parseInt(document.getElementById('purchase').value);
            const result = startMoney - purchase;
            
            let resultText = '';
            let resultClass = '';
            
            if (result >= 0) {
                resultText = `You have ${result} dollars left`;
                resultClass = 'correct';
            } else {
                resultText = `You owe ${Math.abs(result)} dollars (negative balance: ${result})`;
                resultClass = 'incorrect';
            }
            
            moneyResult.textContent = resultText;
            moneyResult.className = `result ${resultClass}`;
        });
    }
}

// Floor calculator
function initFloorCalculator() {
    const goDownBtn = document.getElementById('goDown');
    const floorResult = document.getElementById('floorResult');
    const currentFloorSpan = document.getElementById('currentFloor');

    if (goDownBtn && floorResult) {
        goDownBtn.addEventListener('click', function() {
            const currentFloor = parseInt(currentFloorSpan.textContent);
            const newFloor = currentFloor - 5;
            
            // Descent animation
            animateFloorChange(currentFloor, newFloor);
            
            setTimeout(() => {
                currentFloorSpan.textContent = newFloor;
                
                let resultText = '';
                let resultClass = '';
                
                if (newFloor > 0) {
                    resultText = `You are on the ${newFloor}${getOrdinalSuffix(newFloor)} floor`;
                    resultClass = 'correct';
                } else if (newFloor === 0) {
                    resultText = 'You are on the street (ground floor)';
                    resultClass = 'correct';
                } else {
                    resultText = `You are in the basement on the ${Math.abs(newFloor)}${getOrdinalSuffix(Math.abs(newFloor))} underground floor`;
                    resultClass = 'correct';
                }
                
                floorResult.textContent = resultText;
                floorResult.className = `result ${resultClass}`;
            }, 1000);
        });
    }
}

// Function for correct English endings
function getOrdinalSuffix(num) {
    if (num >= 11 && num <= 13) return 'th';
    switch (num % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

// Floor change animation
function animateFloorChange(from, to) {
    const currentFloorSpan = document.getElementById('currentFloor');
    const steps = 5;
    const step = (to - from) / steps;
    let current = from;
    
    const interval = setInterval(() => {
        current += step;
        if ((step > 0 && current >= to) || (step < 0 && current <= to)) {
            current = to;
            clearInterval(interval);
        }
        currentFloorSpan.textContent = Math.round(current);
    }, 200);
}

// Test
function initTest() {
    const submitTestBtn = document.getElementById('submitTest');
    const testResults = document.getElementById('testResults');
    const testContainer = document.getElementById('testContainer');
    const retakeTestBtn = document.getElementById('retakeTest');

    // Correct answers
    const correctAnswers = {
        q1: 'a', // -5°C is lower
        q2: 'b', // -30 dollars
        q3: 'b', // -1st floor
        q4: 'c', // -5 is greater
        q5: 'b'  // -5
    };

    if (submitTestBtn) {
        submitTestBtn.addEventListener('click', function() {
            const answers = {};
            let score = 0;
            
            // Collect answers
            Object.keys(correctAnswers).forEach(question => {
                const selected = document.querySelector(`input[name="${question}"]:checked`);
                if (selected) {
                    answers[question] = selected.value;
                    if (selected.value === correctAnswers[question]) {
                        score++;
                    }
                }
            });
            
            // Check that all questions are answered
            if (Object.keys(answers).length < Object.keys(correctAnswers).length) {
                alert('Please answer all questions!');
                return;
            }
            
            // Show results
            showTestResults(score, answers, correctAnswers);
        });
    }

    if (retakeTestBtn) {
        retakeTestBtn.addEventListener('click', function() {
            // Reset all answers
            document.querySelectorAll('input[type="radio"]').forEach(radio => {
                radio.checked = false;
            });
            
            // Hide results and show test
            testResults.classList.add('hidden');
            testContainer.style.display = 'block';
        });
    }
}

// Show test results
function showTestResults(score, answers, correctAnswers) {
    const testResults = document.getElementById('testResults');
    const testContainer = document.getElementById('testContainer');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const answersReview = document.getElementById('answersReview');
    
    const totalQuestions = Object.keys(correctAnswers).length;
    const percentage = (score / totalQuestions) * 100;
    
    // Determine grade
    let grade, gradeClass;
    if (percentage >= 80) {
        grade = 'Excellent!';
        gradeClass = 'excellent';
    } else if (percentage >= 60) {
        grade = 'Good!';
        gradeClass = 'good';
    } else {
        grade = 'Need to review the material';
        gradeClass = 'poor';
    }
    
    // Show overall result
    scoreDisplay.textContent = `${grade} You answered ${score} out of ${totalQuestions} questions correctly (${percentage}%)`;
    scoreDisplay.className = gradeClass;
    
    // Show detailed review
    let reviewHTML = '<h4>Answer Review:</h4>';
    
    const questionTexts = {
        q1: 'Which temperature is lower?',
        q2: 'You have $50, but you owe $80. Your balance:',
        q3: 'You are on the 3rd floor, go up 2 floors, then go down 6 floors. Where are you?',
        q4: 'Which number is greater?',
        q5: '-8 + 3 = ?'
    };
    
    const correctTexts = {
        q1: 'Correct: -5°C is lower than +2°C and 0°C',
        q2: 'Correct: 50 - 80 = -30 dollars (debt)',
        q3: 'Correct: 3 + 2 - 6 = -1 (basement)',
        q4: 'Correct: -5 is greater than -10 and -15',
        q5: 'Correct: -8 + 3 = -5'
    };
    
    Object.keys(correctAnswers).forEach(question => {
        const isCorrect = answers[question] === correctAnswers[question];
        const questionClass = isCorrect ? 'correct' : 'incorrect';
        
        reviewHTML += `
            <div class="answer-item ${questionClass}">
                <strong>Question ${question.slice(1)}:</strong> ${questionTexts[question]}<br>
                <strong>Your answer:</strong> ${getAnswerText(question, answers[question])}<br>
                <strong>Correct answer:</strong> ${getAnswerText(question, correctAnswers[question])}<br>
                <em>${correctTexts[question]}</em>
            </div>
        `;
    });
    
    answersReview.innerHTML = reviewHTML;
    
    // Show results
    testContainer.style.display = 'none';
    testResults.classList.remove('hidden');
}

// Get answer text
function getAnswerText(question, answer) {
    const answerTexts = {
        q1: { a: '-5°C', b: '+2°C', c: '0°C' },
        q2: { a: '+$30', b: '-$30', c: '+$130' },
        q3: { a: '1st floor', b: '-1st floor', c: '5th floor' },
        q4: { a: '-10', b: '-15', c: '-5' },
        q5: { a: '-11', b: '-5', c: '+5' }
    };
    
    return answerTexts[question][answer] || 'Not selected';
}

// Add animations when page loads
window.addEventListener('load', function() {
    // Element appearance animation
    const elements = document.querySelectorAll('.theory-card, .practice-card, .test-card');
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.5s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200);
    });
}); 