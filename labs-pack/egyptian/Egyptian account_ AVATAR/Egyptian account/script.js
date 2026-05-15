// Египетские иероглифы и их значения (пути к PNG)
const hieroglyphs = {
    1: 'img/1_.png',
    10: 'img/10_.png',
    100: 'img/100_.png',
    1000: 'img/1000_.png',
    10000: 'img/10000_.png',
    100000: 'img/100000_.png',
    1000000: 'img/1000000_.png'
};

// Генерация HTML для египетского числа с PNG-картинками
function egyptianNumberToHTML(number) {
    if (number <= 0 || number > 9999999) return '';
    let html = '';
    const values = [1000000, 100000, 10000, 1000, 100, 10, 1];
    for (let value of values) {
        if (number >= value) {
            const count = Math.floor(number / value);
            for (let i = 0; i < count; i++) {
                html += `<img src="${hieroglyphs[value]}" alt="${value}" class="egyptian-img" />`;
            }
            number %= value;
        }
    }
    return html;
}

// Навигация между разделами
document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.content-section');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSection = button.getAttribute('data-section');
            
            // Убираем активный класс со всех кнопок и секций
            navButtons.forEach(btn => btn.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Добавляем активный класс к выбранной кнопке и секции
            button.classList.add('active');
            document.getElementById(targetSection).classList.add('active');
        });
    });

    // Инициализация всех функций
    initConverter();
    initPractice();
    initQuiz();
    initChat();
    initChatToggle();
    initTeacherVideo();

    const exampleEgyptian = document.getElementById('example-egyptian');
    if (exampleEgyptian) {
        exampleEgyptian.innerHTML = egyptianNumberToHTML(3247);
    }
});

// Функция конвертации арабского числа в египетское (текстовая строка для обратной совместимости)
function convertToEgyptian(number) {
    if (number <= 0 || number > 9999999) {
        return { hieroglyphs: '', explanation: 'Число должно быть от 1 до 9,999,999', html: '' };
    }
    let result = '';
    let explanation = '';
    let html = '';
    const values = [1000000, 100000, 10000, 1000, 100, 10, 1];
    const symbols = {
        1: '|',
        10: '∩',
        100: '⊂',
        1000: '⊃',
        10000: '⊄',
        100000: '⊅',
        1000000: '⊆'
    };
    for (let value of values) {
        if (number >= value) {
            const count = Math.floor(number / value);
            result += symbols[value].repeat(count);
            if (explanation) explanation += ' + ';
            explanation += `${count} × ${value}`;
            for (let i = 0; i < count; i++) {
                html += `<img src="${hieroglyphs[value]}" alt="${value}" class="egyptian-img" />`;
            }
            number %= value;
        }
    }
    return { hieroglyphs: result, explanation: explanation, html: html };
}

// Функция конвертации египетского числа в арабское
function convertFromEgyptian(egyptianString) {
    let result = 0;
    const symbolToValue = {
        '|': 1,
        '∩': 10,
        '⊂': 100,
        '⊃': 1000,
        '⊄': 10000,
        '⊅': 100000,
        '⊆': 1000000
    };
    for (let char of egyptianString) {
        if (symbolToValue[char]) {
            result += symbolToValue[char];
        }
    }
    return result;
}

// Инициализация конвертера
function initConverter() {
    const convertBtn = document.getElementById('convert-btn');
    const arabicInput = document.getElementById('arabic-input');
    const egyptianResult = document.getElementById('egyptian-result');
    const explanationResult = document.getElementById('explanation-result');
    const exampleItems = document.querySelectorAll('.example-item');

    convertBtn.addEventListener('click', () => {
        const number = parseInt(arabicInput.value);
        if (number && number > 0 && number <= 9999999) {
            const result = convertToEgyptian(number);
            egyptianResult.innerHTML = result.html;
            explanationResult.textContent = result.explanation;
        } else {
            egyptianResult.textContent = 'Введите корректное число';
            explanationResult.textContent = '';
        }
    });

    // Примеры для быстрого конвертирования
    exampleItems.forEach(item => {
        item.addEventListener('click', () => {
            const number = parseInt(item.getAttribute('data-number'));
            arabicInput.value = number;
            const result = convertToEgyptian(number);
            egyptianResult.innerHTML = result.html;
            explanationResult.textContent = result.explanation;
        });
    });

    // Конвертация по Enter
    arabicInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            convertBtn.click();
        }
    });
}

// Инициализация практических заданий
function initPractice() {
    let currentTaskNumber = 0;
    let currentEgyptianTask = '';
    let builderSum = 0;
    let builderHieroglyphs = [];

    // Генерация случайного числа для задания
    function generateTaskNumber() {
        return Math.floor(Math.random() * 9999) + 1;
    }

    // Генерация случайного египетского числа для задания
    function generateEgyptianTask() {
        const number = Math.floor(Math.random() * 999) + 1;
        return convertToEgyptian(number).hieroglyphs;
    }

    // Обновление задания 1
    function updateTask1() {
        currentTaskNumber = generateTaskNumber();
        document.getElementById('task-number').textContent = currentTaskNumber;
        clearBuilder();
    }

    // Обновление задания 2
    function updateTask2() {
        currentEgyptianTask = generateEgyptianTask();
        document.getElementById('egyptian-task-display').innerHTML = egyptianNumberToHTMLFromSymbols(currentEgyptianTask);
        document.getElementById('answer-input').value = '';
        document.getElementById('answer-feedback').textContent = '';
        document.getElementById('answer-feedback').className = 'feedback';
    }

    // Очистка строителя иероглифов
    function clearBuilder() {
        builderSum = 0;
        builderHieroglyphs = [];
        document.getElementById('builder-result').textContent = '';
        document.getElementById('builder-sum').textContent = '0';
        document.getElementById('task-feedback').textContent = '';
        document.getElementById('task-feedback').className = 'feedback';
    }

    // Обработчики кнопок строителя
    const hieroglyphButtons = document.querySelectorAll('.hieroglyph-btn');
    hieroglyphButtons.forEach(button => {
        button.addEventListener('click', () => {
            const value = parseInt(button.getAttribute('data-value'));
            builderSum += value;
            builderHieroglyphs.push(value);
            
            document.getElementById('builder-result').innerHTML = builderHieroglyphs.map(v => `<img src='${hieroglyphs[v]}' alt='${v}' class='egyptian-img' />`).join('');
            document.getElementById('builder-sum').textContent = builderSum;
        });
    });

    // Кнопка очистки
    document.getElementById('clear-btn').addEventListener('click', clearBuilder);

    // Кнопка проверки задания 1
    document.getElementById('check-btn').addEventListener('click', () => {
        const feedback = document.getElementById('task-feedback');
        if (builderSum === currentTaskNumber) {
            feedback.textContent = '✅ Correct! Great job!';
            feedback.className = 'feedback correct';
            showCorrectAnswer();
            setTimeout(() => {
                updateTask1();
            }, 2000);
        } else {
            feedback.textContent = `❌ Incorrect. You got ${builderSum}, but the correct answer is ${currentTaskNumber}`;
            feedback.className = 'feedback incorrect';
            playTeacherVideoWrong();
        }
    });

    // Кнопка проверки задания 2
    document.getElementById('check-answer-btn').addEventListener('click', () => {
        const userAnswer = parseInt(document.getElementById('answer-input').value);
        const correctAnswer = convertFromEgyptian(currentEgyptianTask);
        const feedback = document.getElementById('answer-feedback');
        
        if (userAnswer === correctAnswer) {
            feedback.textContent = '✅ Correct! Great job!';
            feedback.className = 'feedback correct';
            showCorrectAnswer();
            setTimeout(() => {
                updateTask2();
            }, 2000);
        } else {
            feedback.textContent = `❌ Incorrect. The correct answer is: ${correctAnswer}`;
            feedback.className = 'feedback incorrect';
            playTeacherVideoWrong();
        }
    });

    // Инициализация заданий
    updateTask1();
    updateTask2();
}

// Инициализация теста
function initQuiz() {
    const questions = [
        {
            question: "Which hieroglyph represents the number 100?",
            options: ["|", "∩", "⊂", "⊃"],
            correct: 2
        },
        {
            question: "How do you write the number 25 in the Egyptian system?",
            options: ["∩∩|||||", "∩∩|∩∩∩∩∩", "∩∩|∩∩∩", "∩∩|∩∩∩∩∩"],
            correct: 0
        },
        {
            question: "What is the result of 2 × 1000 + 3 × 100 + 4 × 10 + 5 × 1?",
            options: ["2345", "2435", "2354", "2453"],
            correct: 0
        },
        {
            question: "Which hieroglyph represents the largest number?",
            options: ["|", "∩", "⊂", "⊆"],
            correct: 3
        },
        {
            question: "How do you write the number 1000 in the Egyptian system?",
            options: ["⊃", "|||", "∩∩∩", "⊂⊂"],
            correct: 0
        }
    ];

    let currentQuestion = 0;
    let score = 0;
    let selectedAnswer = null;

    const questionText = document.getElementById('question-text');
    const quizOptions = document.getElementById('quiz-options');
    const nextBtn = document.getElementById('next-question-btn');
    const questionNumber = document.getElementById('question-number');
    const totalQuestions = document.getElementById('total-questions');
    const quizQuestion = document.getElementById('quiz-question');
    const quizResults = document.getElementById('quiz-results');

    totalQuestions.textContent = questions.length;

    function showQuestion() {
        const question = questions[currentQuestion];
        questionNumber.textContent = currentQuestion + 1;
        questionText.textContent = question.question;
        
        quizOptions.innerHTML = '';
        question.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'quiz-option';
            // Если вопрос про иероглиф или запись числа (на английском или русском)
            if (
                question.question.toLowerCase().includes('hieroglyph') ||
                question.question.toLowerCase().includes('write the number') ||
                question.question.toLowerCase().includes('обозначает число') ||
                question.question.toLowerCase().includes('записать число')
            ) {
                // Маппинг символов на PNG
                const symbolToPng = {
                    '|': 'img/1_.png',
                    '∩': 'img/10_.png',
                    '⊂': 'img/100_.png',
                    '⊃': 'img/1000_.png',
                    '⊄': 'img/10000_.png',
                    '⊅': 'img/100000_.png',
                    '⊆': 'img/1000000_.png'
                };
                // Если вариант состоит только из этих символов, рендерим соответствующее количество PNG
                if (/^[|∩⊂⊃⊄⊅⊆]+$/.test(option)) {
                    let html = '';
                    for (let char of option) {
                        if (symbolToPng[char]) {
                            html += `<img src="${symbolToPng[char]}" alt="${char}" class="egyptian-img" />`;
                        }
                    }
                    optionDiv.innerHTML = html;
                } else {
                    // Одиночный символ
                    let imgSrc = symbolToPng[option] || '';
                    if (imgSrc) {
                        optionDiv.innerHTML = `<img src="${imgSrc}" alt="${option}" class="egyptian-img" />`;
                    } else {
                        optionDiv.textContent = option;
                    }
                }
            } else {
                optionDiv.textContent = option;
            }
            optionDiv.addEventListener('click', () => selectOption(index, optionDiv));
            quizOptions.appendChild(optionDiv);
        });

        selectedAnswer = null;
        nextBtn.style.display = 'none';
    }

    function selectOption(index, optionDiv) {
        // Убираем выделение со всех опций
        document.querySelectorAll('.quiz-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Выделяем выбранную опцию
        optionDiv.classList.add('selected');
        selectedAnswer = index;
        nextBtn.style.display = 'inline-block';
    }

    function checkAnswer() {
        if (selectedAnswer === null) return;

        const question = questions[currentQuestion];
        const options = document.querySelectorAll('.quiz-option');
        
        options.forEach((option, index) => {
            if (index === question.correct) {
                option.classList.add('correct');
            } else if (index === selectedAnswer) {
                option.classList.add('incorrect');
            }
        });

        if (selectedAnswer === question.correct) {
            score++;
            showCorrectAnswer();
        } else {
            playTeacherVideoWrong();
        }

        nextBtn.textContent = currentQuestion < questions.length - 1 ? 'Next question' : 'Show results';
    }

    function showResults() {
        quizQuestion.style.display = 'none';
        quizResults.classList.remove('hidden');
        
        document.getElementById('correct-answers').textContent = score;
        document.getElementById('total-answers').textContent = questions.length;
        
        const percentage = Math.round((score / questions.length) * 100);
        document.getElementById('percentage').textContent = percentage + '%';
        document.getElementById('progress-fill').style.width = percentage + '%';
    }

    function restartQuiz() {
        currentQuestion = 0;
        score = 0;
        selectedAnswer = null;
        
        quizQuestion.style.display = 'block';
        quizResults.classList.add('hidden');
        
        showQuestion();
    }

    nextBtn.addEventListener('click', () => {
        if (selectedAnswer === null) return;
        
        checkAnswer();
        
        if (currentQuestion < questions.length - 1) {
            currentQuestion++;
            setTimeout(showQuestion, 1500);
        } else {
            setTimeout(showResults, 1500);
        }
    });

    document.getElementById('restart-quiz-btn').addEventListener('click', restartQuiz);

    // Начинаем тест
    showQuestion();
}

// Дополнительные функции для улучшения UX
function addConfetti() {
    // Простая анимация конфетти для правильных ответов
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10px';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = '50%';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '9999';
            confetti.style.animation = 'fall 3s linear forwards';
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }, i * 100);
    }
}

// Добавляем CSS анимацию для конфетти
const style = document.createElement('style');
style.textContent = `
    @keyframes fall {
        to {
            transform: translateY(100vh) rotate(360deg);
        }
    }
`;
document.head.appendChild(style);

// Функция для показа правильного ответа с конфетти и видео учителя
function showCorrectAnswer() {
    addConfetti();
    playTeacherVideo();
}

// Функция для отображения египетского числа по строке-символам (например, '|||∩∩')
function egyptianNumberToHTMLFromSymbols(symbols) {
    const symbolToPng = {
        '|': 'img/1_.png',
        '∩': 'img/10_.png',
        '⊂': 'img/100_.png',
        '⊃': 'img/1000_.png',
        '⊄': 'img/10000_.png',
        '⊅': 'img/100000_.png',
        '⊆': 'img/1000000_.png'
    };
    let html = '';
    for (let char of symbols) {
        if (symbolToPng[char]) {
            html += `<img src='${symbolToPng[char]}' alt='${char}' class='egyptian-img' />`;
        }
    }
    return html;
}

// Экспортируем функции для использования в других частях приложения
window.egyptianConverter = {
    convertToEgyptian,
    convertFromEgyptian,
    showCorrectAnswer
};

// Chat functionality
function initChat() {
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-message-btn');
    const suggestionButtons = document.querySelectorAll('.suggestion-btn');

    // Add user message to chat
    function addUserMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.innerHTML = `
            <div class="message-avatar">👤</div>
            <div class="message-content">
                <div class="message-text">${text}</div>
                <div class="message-time">${getCurrentTime()}</div>
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Add AI message to chat
    function addAIMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai-message';
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <img src="AI_ava.png" alt="AI" class="ai-avatar">
            </div>
            <div class="message-content">
                <div class="message-text">${text}</div>
                <div class="message-time">${getCurrentTime()}</div>
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Show typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing-indicator-message';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <img src="AI_ava.png" alt="AI" class="ai-avatar">
            </div>
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return typingDiv;
    }

    // Remove typing indicator
    function removeTypingIndicator(typingDiv) {
        if (typingDiv && typingDiv.parentNode) {
            typingDiv.parentNode.removeChild(typingDiv);
        }
    }

    // Get current time
    function getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }

    // AI response generator
    function generateAIResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Responses for different types of questions
        if (message.includes('2024') || message.includes('two thousand twenty four')) {
            const egyptian2024 = egyptianNumberToHTML(2024);
            return `The number 2024 in the Egyptian system is written as:<br><br>
                    <div class="egyptian-display">${egyptian2024}</div><br>
                    This means: 2 × 1000 + 2 × 10 + 4 × 1 = 2024`;
        }
        
        if (message.includes('adding') || message.includes('addition') || message.includes('plus') || message.includes('sum')) {
            return `In the Egyptian system, addition is simple - you just combine all the symbols!<br><br>
                    <strong>Example:</strong> 123 + 456<br>
                    <div class="egyptian-display">${egyptianNumberToHTML(123)} + ${egyptianNumberToHTML(456)} = ${egyptianNumberToHTML(579)}</div><br>
                    Simply add all symbols together and group similar ones.`;
        }
        
        if (message.includes('comparing') || message.includes('difference') || message.includes('compare') || message.includes('systems')) {
            return `<strong>Main differences between Egyptian and modern numeral systems:</strong><br><br>
                    <strong>Egyptian system:</strong>
                    <ul>
                        <li>Additive (each symbol has a fixed value)</li>
                        <li>No positional principle</li>
                        <li>No zero</li>
                        <li>Symbols are grouped by value</li>
                    </ul>
                    <strong>Modern system:</strong>
                    <ul>
                        <li>Positional (digit value depends on position)</li>
                        <li>Uses zero</li>
                        <li>Base 10</li>
                        <li>More compact notation</li>
                    </ul>`;
        }
        
        if (message.includes('rules') || message.includes('how to write') || message.includes('system')) {
            return `<strong>Main rules of the Egyptian numeral system:</strong><br><br>
                    <ul>
                        <li>Symbols are arranged from left to right in descending order</li>
                        <li>Similar symbols are grouped together</li>
                        <li>The number is read as the sum of all symbols</li>
                        <li>There was no zero in the Egyptian system!</li>
                        <li>Each symbol has a fixed value</li>
                    </ul>
                    <br><strong>Example:</strong> 3247 = 3×1000 + 2×100 + 4×10 + 7×1`;
        }
        
        if (message.includes('hieroglyph') || message.includes('symbol')) {
            return `The Egyptian system used the following symbols:<br><br>
                    <div class="hieroglyphs-grid">
                        <div class="hieroglyph-item">
                            <img src="img/1_.png" alt="1" width="32" height="42" />
                            <span>1</span>
                        </div>
                        <div class="hieroglyph-item">
                            <img src="img/10_.png" alt="10" width="32" height="42" />
                            <span>10</span>
                        </div>
                        <div class="hieroglyph-item">
                            <img src="img/100_.png" alt="100" width="32" height="42" />
                            <span>100</span>
                        </div>
                        <div class="hieroglyph-item">
                            <img src="img/1000_.png" alt="1000" width="32" height="42" />
                            <span>1000</span>
                        </div>
                        <div class="hieroglyph-item">
                            <img src="img/10000_.png" alt="10000" width="32" height="42" />
                            <span>10000</span>
                        </div>
                        <div class="hieroglyph-item">
                            <img src="img/100000_.png" alt="100000" width="32" height="42" />
                            <span>100000</span>
                        </div>
                        <div class="hieroglyph-item">
                            <img src="img/1000000_.png" alt="1000000" width="32" height="42" />
                            <span>1000000</span>
                        </div>
                    </div>`;
        }
        
        // Check if user is asking about a specific number
        const numberMatch = message.match(/(\d+)/);
        if (numberMatch) {
            const number = parseInt(numberMatch[1]);
            if (number > 0 && number <= 9999999) {
                const egyptianNumber = egyptianNumberToHTML(number);
                return `The number ${number} in the Egyptian system is written as:<br><br>
                        <div class="egyptian-display">${egyptianNumber}</div><br>
                        This means: ${convertToEgyptian(number).explanation}`;
            }
        }
        
        // Default response
        return `Great question! I specialize in the Egyptian numeral system. 
                Try asking me about:
                <ul>
                    <li>Converting specific numbers (e.g., "How to write 1234?")</li>
                    <li>Rules of the Egyptian system</li>
                    <li>Adding Egyptian numbers</li>
                    <li>Comparing with modern system</li>
                    <li>Hieroglyphs and their meanings</li>
                </ul>
                Or use the quick question buttons below!`;
    }

    // Send message function
    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message
        addUserMessage(message);
        chatInput.value = '';

        // Show typing indicator
        const typingIndicator = showTypingIndicator();

        // Simulate AI thinking time
        setTimeout(() => {
            removeTypingIndicator(typingIndicator);
            const aiResponse = generateAIResponse(message);
            addAIMessage(aiResponse);
        }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Suggestion buttons
    suggestionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const suggestion = button.getAttribute('data-suggestion');
            chatInput.value = suggestion;
            sendMessage();
        });
    });
}

// Chat toggle functionality
function initChatToggle() {
    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    const chatPanel = document.querySelector('.chat-panel');
    
    chatToggleBtn.addEventListener('click', () => {
        chatPanel.classList.toggle('collapsed');
        
        // Update button text
        if (chatPanel.classList.contains('collapsed')) {
            chatToggleBtn.textContent = '+';
        } else {
            chatToggleBtn.textContent = '−';
        }
        
        // Save state to localStorage
        localStorage.setItem('chatCollapsed', chatPanel.classList.contains('collapsed'));
    });
    
    // Restore state from localStorage
    const wasCollapsed = localStorage.getItem('chatCollapsed') === 'true';
    if (wasCollapsed) {
        chatPanel.classList.add('collapsed');
        chatToggleBtn.textContent = '+';
    }
}

// Teacher video functionality
function initTeacherVideo() {
    const teacherVideo = document.getElementById('teacher-video');
    const teacherVideoWrong = document.getElementById('teacher-video-wrong');
    const teacherVideoOpen = document.getElementById('teacher-video-open');
    const teacherAvatar = document.getElementById('teacher-avatar');
    
    // Configure video settings
    teacherVideo.loop = false; // Don't loop
    teacherVideo.muted = false; // Enable sound
    teacherVideoWrong.loop = false; // Don't loop
    teacherVideoWrong.muted = false; // Enable sound
    teacherVideoOpen.loop = false; // Don't loop
    teacherVideoOpen.muted = false; // Enable sound
    
    // Add event listener for when video ends
    teacherVideo.addEventListener('ended', () => {
        hideTeacherVideo();
    });
    
    teacherVideoWrong.addEventListener('ended', () => {
        hideTeacherVideoWrong();
    });
    
    teacherVideoOpen.addEventListener('ended', () => {
        hideTeacherVideoOpen();
    });
    
    // Add event listener for when video can play
    teacherVideo.addEventListener('canplay', () => {
        console.log('Teacher video ready to play');
    });
    
    teacherVideoWrong.addEventListener('canplay', () => {
        console.log('Teacher video wrong ready to play');
    });
    
    teacherVideoOpen.addEventListener('canplay', () => {
        console.log('Teacher video open1 ready to play');
    });
    
    // Add event listener for video errors
    teacherVideo.addEventListener('error', (e) => {
        console.error('Error loading teacher video:', e);
    });
    
    teacherVideoWrong.addEventListener('error', (e) => {
        console.error('Error loading teacher video wrong:', e);
    });
    
    teacherVideoOpen.addEventListener('error', (e) => {
        console.error('Error loading teacher video open1:', e);
    });
    
    // Add event listener for when video starts playing
    teacherVideo.addEventListener('play', () => {
        console.log('Teacher video started playing');
    });
    
    teacherVideoWrong.addEventListener('play', () => {
        console.log('Teacher video wrong started playing');
    });
    
    teacherVideoOpen.addEventListener('play', () => {
        console.log('Teacher video open1 started playing');
    });
    
    // Initialize teacher image click handler
    initTeacherImageClick();
    
    // Make openVideoPlayed accessible globally
    window.openVideoPlayed = false;
}

// Function to play teacher video
function playTeacherVideo() {
    const teacherVideo = document.getElementById('teacher-video');
    const teacherAvatar = document.getElementById('teacher-avatar');
    
    if (teacherVideo && teacherAvatar) {
        // Hide avatar and show video
        teacherAvatar.classList.add('hidden');
        teacherVideo.classList.add('playing');
        
        // Reset video to beginning and play once
        teacherVideo.currentTime = 0;
        teacherVideo.loop = false; // Ensure it plays only once
        
        // Play video with sound
        teacherVideo.play().catch(error => {
            console.error('Error playing teacher video:', error);
            // Try to play muted as fallback
            teacherVideo.muted = true;
            teacherVideo.play().catch(mutedError => {
                console.error('Error playing muted teacher video:', mutedError);
                // Final fallback: show avatar again
                hideTeacherVideo();
            });
        });
    }
}

// Function to play teacher video for wrong answers
function playTeacherVideoWrong() {
    const teacherVideoWrong = document.getElementById('teacher-video-wrong');
    const teacherAvatar = document.getElementById('teacher-avatar');
    
    if (teacherVideoWrong && teacherAvatar) {
        // Hide avatar and show video
        teacherAvatar.classList.add('hidden');
        teacherVideoWrong.classList.add('playing');
        
        // Reset video to beginning and play once
        teacherVideoWrong.currentTime = 0;
        teacherVideoWrong.loop = false; // Ensure it plays only once
        
        // Play video with sound
        teacherVideoWrong.play().catch(error => {
            console.error('Error playing teacher video wrong:', error);
            // Try to play muted as fallback
            teacherVideoWrong.muted = true;
            teacherVideoWrong.play().catch(mutedError => {
                console.error('Error playing muted teacher video wrong:', mutedError);
                // Final fallback: show avatar again
                hideTeacherVideoWrong();
            });
        });
    }
}

// Function to play teacher video for opening
function playTeacherVideoOpen() {
    const teacherVideoOpen = document.getElementById('teacher-video-open');
    const teacherAvatar = document.getElementById('teacher-avatar');
    
    if (teacherVideoOpen && teacherAvatar && !window.openVideoPlayed) {
        // Mark as played
        window.openVideoPlayed = true;
        
        // Hide avatar and show video
        teacherAvatar.classList.add('hidden');
        teacherVideoOpen.classList.add('playing');
        
        // Reset video to beginning and play once
        teacherVideoOpen.currentTime = 0;
        teacherVideoOpen.loop = false; // Ensure it plays only once
        
        // Try to play with current muted state (might be muted due to autoplay policy)
        teacherVideoOpen.play().catch(error => {
            console.error('Error playing teacher video open1:', error);
            // If it's already muted, just show avatar
            if (teacherVideoOpen.muted) {
                console.log('Video is muted, showing avatar instead');
                hideTeacherVideoOpen();
            } else {
                // Try to play muted as fallback
                teacherVideoOpen.muted = true;
                teacherVideoOpen.play().catch(mutedError => {
                    console.error('Error playing muted teacher video open1:', mutedError);
                    // Final fallback: show avatar again
                    hideTeacherVideoOpen();
                });
            }
        });
    }
}

// Function to hide teacher video for opening
function hideTeacherVideoOpen() {
    const teacherVideoOpen = document.getElementById('teacher-video-open');
    const teacherAvatar = document.getElementById('teacher-avatar');
    
    if (teacherVideoOpen && teacherAvatar) {
        // Pause video
        teacherVideoOpen.pause();
        
        // Reset video settings
        teacherVideoOpen.muted = false; // Re-enable sound for next play
        teacherVideoOpen.loop = false; // Ensure no looping
        
        // Hide video and show avatar
        teacherVideoOpen.classList.remove('playing');
        teacherAvatar.classList.remove('hidden');
    }
}

// Function to hide teacher video for wrong answers
function hideTeacherVideoWrong() {
    const teacherVideoWrong = document.getElementById('teacher-video-wrong');
    const teacherAvatar = document.getElementById('teacher-avatar');
    
    if (teacherVideoWrong && teacherAvatar) {
        // Pause video
        teacherVideoWrong.pause();
        
        // Reset video settings
        teacherVideoWrong.muted = false; // Re-enable sound for next play
        teacherVideoWrong.loop = false; // Ensure no looping
        
        // Hide video and show avatar
        teacherVideoWrong.classList.remove('playing');
        teacherAvatar.classList.remove('hidden');
    }
}

// Function to hide teacher video
function hideTeacherVideo() {
    const teacherVideo = document.getElementById('teacher-video');
    const teacherAvatar = document.getElementById('teacher-avatar');
    
    if (teacherVideo && teacherAvatar) {
        // Pause video
        teacherVideo.pause();
        
        // Reset video settings
        teacherVideo.muted = false; // Re-enable sound for next play
        teacherVideo.loop = false; // Ensure no looping
        
        // Hide video and show avatar
        teacherVideo.classList.remove('playing');
        teacherAvatar.classList.remove('hidden');
    }
}

// Function to initialize teacher image click handler
function initTeacherImageClick() {
    const teacherAvatar = document.getElementById('teacher-avatar');
    
    if (teacherAvatar) {
        // Add click event listener to teacher image
        teacherAvatar.addEventListener('click', () => {
            // Enable sound for all videos
            const teacherVideo = document.getElementById('teacher-video');
            const teacherVideoWrong = document.getElementById('teacher-video-wrong');
            const teacherVideoOpen = document.getElementById('teacher-video-open');
            
            if (teacherVideo) teacherVideo.muted = false;
            if (teacherVideoWrong) teacherVideoWrong.muted = false;
            if (teacherVideoOpen) teacherVideoOpen.muted = false;
            
            // If open video hasn't played yet, play it with sound
            if (!window.openVideoPlayed) {
                playTeacherVideoOpen();
            } else {
                // Show a message that teacher is ready to help
                showTeacherReadyMessage();
            }
        });
    }
}

// Function to show teacher ready message
function showTeacherReadyMessage() {
    // Create a temporary message
    const message = document.createElement('div');
    message.textContent = '👨‍🏫 Teacher is ready to help!';
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 25px;
        font-size: 16px;
        font-weight: 500;
        z-index: 3000;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        animation: fadeInOut 2s ease-in-out;
    `;
    
    // Add animation keyframes if not already added
    if (!document.querySelector('#teacher-message-style')) {
        const style = document.createElement('style');
        style.id = 'teacher-message-style';
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(message);
    
    // Remove message after animation
    setTimeout(() => {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
    }, 2000);
}

 