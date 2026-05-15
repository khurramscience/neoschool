// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const contentSections = document.querySelectorAll('.content-section');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSection = button.getAttribute('data-section');
            
            // Update navigation buttons
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show target section
            contentSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
        });
    });

    // Practice section functionality
    setupPracticeSection();
    
    // Quiz section functionality
    setupQuizSection();
});

function setupPracticeSection() {
    // Check answer buttons
    const checkButtons = document.querySelectorAll('.check-btn');
    checkButtons.forEach(button => {
        button.addEventListener('click', function() {
            const exerciseItem = this.closest('.exercise-item');
            const input = exerciseItem.querySelector('.answer-input');
            const result = exerciseItem.querySelector('.result');
            const correctAnswer = input.getAttribute('data-answer');
            
            if (input.value === correctAnswer) {
                result.textContent = '✅ Correct!';
                result.className = 'result correct';
                input.style.borderColor = '#28a745';
            } else {
                result.textContent = '❌ Incorrect';
                result.className = 'result incorrect';
                input.style.borderColor = '#dc3545';
            }
        });
    });

    // True/False buttons
    const tfButtons = document.querySelectorAll('.tf-btn');
    tfButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tfItem = this.closest('.tf-item');
            const buttons = tfItem.querySelectorAll('.tf-btn');
            const result = tfItem.querySelector('.tf-result');
            const isCorrect = this.getAttribute('data-correct') === 'true';
            
            // Disable all buttons in this item
            buttons.forEach(btn => {
                btn.disabled = true;
                btn.classList.add('disabled');
            });
            
            // Show correct/incorrect styling
            if (isCorrect) {
                this.classList.add('correct');
                result.textContent = '✅ Correct!';
                result.className = 'tf-result correct';
            } else {
                this.classList.add('incorrect');
                result.textContent = '❌ Incorrect';
                result.className = 'tf-result incorrect';
                
                // Show the correct answer
                buttons.forEach(btn => {
                    if (btn.getAttribute('data-correct') === 'true') {
                        btn.classList.add('correct');
                    }
                });
            }
        });
    });

    // Reset button
    const resetBtn = document.querySelector('.reset-btn');
    resetBtn.addEventListener('click', function() {
        // Reset input fields
        const inputs = document.querySelectorAll('.answer-input');
        inputs.forEach(input => {
            input.value = '';
            input.style.borderColor = '#ddd';
        });
        
        // Reset results
        const results = document.querySelectorAll('.result');
        results.forEach(result => {
            result.textContent = '';
            result.className = 'result';
        });
        
        // Reset true/false buttons
        const tfButtons = document.querySelectorAll('.tf-btn');
        tfButtons.forEach(button => {
            button.disabled = false;
            button.classList.remove('correct', 'incorrect', 'disabled');
        });
        
        const tfResults = document.querySelectorAll('.tf-result');
        tfResults.forEach(result => {
            result.textContent = '';
            result.className = 'tf-result';
        });
    });
}

function setupQuizSection() {
    const questions = document.querySelectorAll('.question');
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    const quizQuestions = document.querySelector('.quiz-questions');
    const quizResults = document.querySelector('.quiz-results');
    const scoreValue = document.querySelector('.score-value');
    const scoreMessage = document.querySelector('.score-message');
    const retakeBtn = document.querySelector('.retake-btn');
    
    let answeredQuestions = 0;
    let correctAnswers = 0;
    
    questions.forEach(question => {
        const options = question.querySelectorAll('.option');
        
        options.forEach(option => {
            option.addEventListener('click', function() {
                if (question.classList.contains('answered')) return;
                
                const isCorrect = this.getAttribute('data-correct') === 'true';
                question.classList.add('answered');
                
                // Disable all options in this question
                options.forEach(opt => {
                    opt.classList.add('disabled');
                    opt.disabled = true;
                });
                
                // Show correct/incorrect styling
                if (isCorrect) {
                    this.classList.add('correct');
                    correctAnswers++;
                } else {
                    this.classList.add('incorrect');
                    
                    // Show the correct answer
                    options.forEach(opt => {
                        if (opt.getAttribute('data-correct') === 'true') {
                            opt.classList.add('correct');
                        }
                    });
                }
                
                answeredQuestions++;
                updateProgress();
                
                // Check if quiz is complete
                if (answeredQuestions === questions.length) {
                    setTimeout(showResults, 1000);
                }
            });
        });
    });
    
    function updateProgress() {
        const percentage = (answeredQuestions / questions.length) * 100;
        progressFill.style.width = percentage + '%';
        progressText.textContent = `${answeredQuestions}/${questions.length} completed`;
    }
    
    function showResults() {
        quizQuestions.style.display = 'none';
        quizResults.style.display = 'block';
        
        scoreValue.textContent = `${correctAnswers}/${questions.length}`;
        
        const percentage = (correctAnswers / questions.length) * 100;
        let message = '';
        let messageClass = '';
        
        if (percentage >= 90) {
            message = '🎉 Excellent! You have mastered multiplication by 1!';
            messageClass = 'excellent';
        } else if (percentage >= 70) {
            message = '👍 Good job! You understand the concept well.';
            messageClass = 'good';
        } else {
            message = '📚 Keep practicing! Review the theory section and try again.';
            messageClass = 'needs-improvement';
        }
        
        scoreMessage.textContent = message;
        scoreMessage.className = `score-message ${messageClass}`;
    }
    
    retakeBtn.addEventListener('click', function() {
        // Reset quiz state
        answeredQuestions = 0;
        correctAnswers = 0;
        
        questions.forEach(question => {
            question.classList.remove('answered');
            const options = question.querySelectorAll('.option');
            options.forEach(option => {
                option.classList.remove('correct', 'incorrect', 'disabled');
                option.disabled = false;
            });
        });
        
        // Show questions again
        quizQuestions.style.display = 'block';
        quizResults.style.display = 'none';
        
        // Reset progress
        updateProgress();
    });
}

// Add some interactive animations
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to theory items
    const theoryItems = document.querySelectorAll('.theory-item');
    theoryItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add smooth scrolling for navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetSection = document.getElementById(this.getAttribute('data-section'));
            targetSection.scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            const activeButton = document.querySelector('.nav-btn.active');
            const buttons = Array.from(document.querySelectorAll('.nav-btn'));
            const currentIndex = buttons.indexOf(activeButton);
            
            let newIndex;
            if (e.key === 'ArrowRight') {
                newIndex = (currentIndex + 1) % buttons.length;
            } else {
                newIndex = (currentIndex - 1 + buttons.length) % buttons.length;
            }
            
            buttons[newIndex].click();
        }
    });
    
    // Add confetti effect for perfect scores
    function createConfetti() {
        const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.top = '-10px';
            confetti.style.borderRadius = '50%';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '9999';
            
            document.body.appendChild(confetti);
            
            const animation = confetti.animate([
                { transform: 'translateY(0px) rotate(0deg)', opacity: 1 },
                { transform: `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: Math.random() * 3000 + 2000,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            });
            
            animation.onfinish = () => {
                document.body.removeChild(confetti);
            };
        }
    }
    
    // Trigger confetti for perfect scores
    const originalShowResults = window.showResults;
    window.showResults = function() {
        if (correctAnswers === questions.length) {
            setTimeout(createConfetti, 500);
        }
        originalShowResults();
    };
}); 