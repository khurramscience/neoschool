// Main functions for working with the binary system
class BinaryConverter {
    // Convert decimal to binary
    static decimalToBinary(decimal) {
        if (decimal === 0) return '0';
        let binary = '';
        let num = decimal;
        
        while (num > 0) {
            binary = (num % 2) + binary;
            num = Math.floor(num / 2);
        }
        
        return binary;
    }
    
    // Convert binary to decimal
    static binaryToDecimal(binary) {
        let decimal = 0;
        let power = 0;
        
        for (let i = binary.length - 1; i >= 0; i--) {
            if (binary[i] === '1') {
                decimal += Math.pow(2, power);
            }
            power++;
        }
        
        return decimal;
    }
    
    // Get 8-bit representation
    static to8Bit(binary) {
        return binary.padStart(8, '0');
    }
    
    // Check if binary is valid
    static isValidBinary(binary) {
        return /^[01]+$/.test(binary);
    }
}

// Class for managing interactive elements
class BinaryApp {
    constructor() {
        this.currentExercise = 5;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.createInteractiveBits();
        this.createPowersTable();
        this.generateNewExercise();
    }
    
    setupEventListeners() {
        // Converter
        const decimalInput = document.getElementById('decimal-input');
        decimalInput.addEventListener('input', (e) => this.updateConverter(e.target.value));
        
        // Exercises
        const checkButton = document.getElementById('check-answer');
        const newExerciseButton = document.getElementById('new-exercise');
        
        checkButton.addEventListener('click', () => this.checkExercise());
        newExerciseButton.addEventListener('click', () => this.generateNewExercise());
        
        // Enter in answer field
        const exerciseAnswer = document.getElementById('exercise-answer');
        exerciseAnswer.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkExercise();
            }
        });
    }
    
    // Update converter
    updateConverter(decimalValue) {
        const binaryBits = document.getElementById('binary-bits');
        const result = document.getElementById('result');
        
        if (decimalValue === '' || decimalValue < 0) {
            binaryBits.innerHTML = '<span class="bit-placeholder">00000000</span>';
            result.textContent = 'Enter a number';
            binaryBits.classList.remove('active');
            return;
        }
        
        const decimal = parseInt(decimalValue);
        if (decimal > 255) {
            binaryBits.innerHTML = '<span class="bit-placeholder">Number too large</span>';
            result.textContent = 'Maximum is 255';
            return;
        }
        
        const binary = BinaryConverter.decimalToBinary(decimal);
        const binary8Bit = BinaryConverter.to8Bit(binary);
        
        // Create nice bit display
        binaryBits.innerHTML = '';
        for (let i = 0; i < 8; i++) {
            const bitSpan = document.createElement('span');
            bitSpan.className = 'bit';
            bitSpan.textContent = binary8Bit[i];
            bitSpan.style.margin = '0 2px';
            binaryBits.appendChild(bitSpan);
        }
        
        result.textContent = `${decimal}₁₀ = ${binary8Bit}₂`;
        binaryBits.classList.add('active');
    }
    
    // Create interactive bits
    createInteractiveBits() {
        const container = document.getElementById('interactive-bits');
        container.innerHTML = '';
        
        for (let i = 7; i >= 0; i--) {
            const bit = document.createElement('div');
            bit.className = 'interactive-bit';
            bit.textContent = '0';
            bit.dataset.position = i;
            bit.dataset.value = '0';
            
            bit.addEventListener('click', () => this.toggleBit(bit));
            container.appendChild(bit);
        }
        
        this.updateInteractiveResult();
    }
    
    // Toggle bit
    toggleBit(bitElement) {
        const currentValue = bitElement.dataset.value;
        const newValue = currentValue === '0' ? '1' : '0';
        
        bitElement.dataset.value = newValue;
        bitElement.textContent = newValue;
        
        if (newValue === '1') {
            bitElement.classList.add('active');
        } else {
            bitElement.classList.remove('active');
        }
        
        this.updateInteractiveResult();
    }
    
    // Update result of interactive bits
    updateInteractiveResult() {
        const bits = document.querySelectorAll('.interactive-bit');
        let binaryString = '';
        
        // Collect bits in correct order (left to right)
        for (let i = bits.length - 1; i >= 0; i--) {
            binaryString += bits[i].dataset.value;
        }
        
        const decimal = BinaryConverter.binaryToDecimal(binaryString);
        document.getElementById('interactive-decimal').textContent = decimal;
    }
    
    // Generate new exercise
    generateNewExercise() {
        this.currentExercise = Math.floor(Math.random() * 50) + 1; // 1-50
        document.getElementById('exercise-number').textContent = this.currentExercise;
        document.getElementById('exercise-answer').value = '';
        document.getElementById('exercise-result').innerHTML = '';
        document.getElementById('exercise-result').className = 'exercise-result';
    }
    
    // Check exercise
    checkExercise() {
        const userAnswer = document.getElementById('exercise-answer').value.trim();
        const correctAnswer = BinaryConverter.decimalToBinary(this.currentExercise);
        const resultElement = document.getElementById('exercise-result');
        
        if (!userAnswer) {
            resultElement.textContent = 'Please enter your answer!';
            resultElement.className = 'exercise-result incorrect';
            return;
        }
        
        if (!BinaryConverter.isValidBinary(userAnswer)) {
            resultElement.textContent = 'Please enter a valid binary number (only 0 and 1)!';
            resultElement.className = 'exercise-result incorrect';
            return;
        }
        
        if (userAnswer === correctAnswer) {
            resultElement.innerHTML = `✅ Correct! ${this.currentExercise}₁₀ = ${correctAnswer}₂`;
            resultElement.className = 'exercise-result correct';
        } else {
            resultElement.innerHTML = `❌ Incorrect! Correct answer: ${correctAnswer}₂<br>Your answer: ${userAnswer}₂`;
            resultElement.className = 'exercise-result incorrect';
        }
    }
    
    // Create powers of two table
    createPowersTable() {
        const tbody = document.getElementById('powers-table-body');
        tbody.innerHTML = '';
        
        for (let i = 0; i <= 10; i++) {
            const row = document.createElement('tr');
            const power = Math.pow(2, i);
            
            row.innerHTML = `
                <td>${i}</td>
                <td>2<sup>${i}</sup></td>
                <td>${power}</td>
            `;
            
            tbody.appendChild(row);
        }
    }
}

// Animations and extra effects
class Animations {
    static addHoverEffects() {
        // Add effects on section hover
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            section.addEventListener('mouseenter', () => {
                section.style.transform = 'translateY(-5px) scale(1.02)';
            });
            
            section.addEventListener('mouseleave', () => {
                section.style.transform = 'translateY(0) scale(1)';
            });
        });
    }
    
    static addTypingEffect(element, text, speed = 50) {
        let i = 0;
        element.textContent = '';
        
        function typeWriter() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            }
        }
        
        typeWriter();
    }
}

// App initialization
document.addEventListener('DOMContentLoaded', () => {
    const app = new BinaryApp();
    Animations.addHoverEffects();
    
    // Welcome message
    const header = document.querySelector('.header h1');
    setTimeout(() => {
        header.style.opacity = '0';
        header.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            header.textContent = '🔢 Binary Number System';
            header.style.opacity = '1';
            header.style.transform = 'translateY(0)';
        }, 300);
    }, 1000);
    
    // Tooltips
    const tooltips = [
        '💡 Try entering the number 5 in the converter!',
        '💡 Click on the bits to change their value!',
        '💡 Solve the exercise and check your answer!'
    ];
    
    let tooltipIndex = 0;
    setInterval(() => {
        const subtitle = document.querySelector('.subtitle');
        subtitle.style.opacity = '0';
        
        setTimeout(() => {
            subtitle.textContent = tooltips[tooltipIndex];
            subtitle.style.opacity = '1';
            tooltipIndex = (tooltipIndex + 1) % tooltips.length;
        }, 500);
    }, 5000);
});

// Extra utilities
const Utils = {
    // Format number with spaces
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    },
    
    // Get random color
    getRandomColor() {
        const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'];
        return colors[Math.floor(Math.random() * colors.length)];
    },
    
    // Fade in animation
    fadeIn(element, duration = 500) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100);
    }
};

// Export for possible use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BinaryConverter, BinaryApp, Animations, Utils };
} 