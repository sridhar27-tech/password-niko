const passwordOutput = document.getElementById('passwordOutput');
const copyBtn = document.getElementById('copyBtn');
const generateBtn = document.getElementById('generateBtn');
const lengthSlider = document.getElementById('lengthSlider');
const lengthVal = document.getElementById('lengthVal');
const strengthText = document.getElementById('strengthText');
const strengthBars = document.querySelectorAll('.bar');
const tooltip = copyBtn.querySelector('.tooltip');

const uppercaseEl = document.getElementById('uppercase');
const lowercaseEl = document.getElementById('lowercase');
const numbersEl = document.getElementById('numbers');
const symbolsEl = document.getElementById('symbols');

const CHAR_SETS = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-='
};

// Secure random number generator using Crypto API
function getRandomValues(limit) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % limit;
}

function generatePassword() {
    let charset = '';
    if (uppercaseEl.checked) charset += CHAR_SETS.uppercase;
    if (lowercaseEl.checked) charset += CHAR_SETS.lowercase;
    if (numbersEl.checked) charset += CHAR_SETS.numbers;
    if (symbolsEl.checked) charset += CHAR_SETS.symbols;

    if (charset === '') {
        passwordOutput.innerText = 'Select Options';
        updateStrength(0);
        return;
    }

    let password = '';
    const length = lengthSlider.value;
    
    // Ensure at least one character from each selected set is included for better security
    const guaranteedChars = [];
    if (uppercaseEl.checked) guaranteedChars.push(CHAR_SETS.uppercase[getRandomValues(CHAR_SETS.uppercase.length)]);
    if (lowercaseEl.checked) guaranteedChars.push(CHAR_SETS.lowercase[getRandomValues(CHAR_SETS.lowercase.length)]);
    if (numbersEl.checked) guaranteedChars.push(CHAR_SETS.numbers[getRandomValues(CHAR_SETS.numbers.length)]);
    if (symbolsEl.checked) guaranteedChars.push(CHAR_SETS.symbols[getRandomValues(CHAR_SETS.symbols.length)]);

    for (let i = 0; i < length - guaranteedChars.length; i++) {
        password += charset[getRandomValues(charset.length)];
    }

    // Mix in the guaranteed characters
    password += guaranteedChars.join('');
    
    // Final shuffle
    password = password.split('').sort(() => 0.5 - Math.random()).join('');

    passwordOutput.innerText = password;
    evaluateStrength(password);
}

function evaluateStrength(password) {
    let score = 0;
    if (!password) return updateStrength(0);

    const length = password.length;
    
    // Length contribution
    if (length >= 12) score += 1;
    if (length >= 16) score += 1;

    // Diversity contribution
    let variations = 0;
    if (/[a-z]/.test(password)) variations++;
    if (/[A-Z]/.test(password)) variations++;
    if (/[0-9]/.test(password)) variations++;
    if (/[^a-zA-Z0-9]/.test(password)) variations++;

    if (variations >= 3) score += 1;
    if (variations === 4 && length >= 12) score += 1;

    updateStrength(score);
}

function updateStrength(score) {
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#8b5cf6'];
    const labels = ['Weak', 'Medium', 'Strong', 'Secure'];
    
    strengthBars.forEach((bar, index) => {
        if (index < score) {
            bar.style.background = colors[score - 1];
            bar.style.boxShadow = `0 0 10px ${colors[score - 1]}66`;
        } else {
            bar.style.background = 'rgba(255, 255, 255, 0.1)';
            bar.style.boxShadow = 'none';
        }
    });

    if (score === 0) {
        strengthText.innerText = 'Strength: -';
        strengthText.style.color = 'var(--text-secondary)';
    } else {
        strengthText.innerText = `Strength: ${labels[score - 1]}`;
        strengthText.style.color = colors[score - 1];
    }
}

// Event Listeners
passwordOutput.addEventListener('input', () => {
    evaluateStrength(passwordOutput.innerText.trim());
});

// Select text on click for easier editing/copying
passwordOutput.addEventListener('focus', () => {
    const range = document.createRange();
    range.selectNodeContents(passwordOutput);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
});

lengthSlider.addEventListener('input', () => {
    lengthVal.innerText = lengthSlider.value;
    generatePassword();
});

generateBtn.addEventListener('click', generatePassword);

copyBtn.addEventListener('click', async () => {
    const password = passwordOutput.innerText;
    if (password === 'Select Options' || !password) return;

    try {
        await navigator.clipboard.writeText(password);
        tooltip.classList.add('show');
        setTimeout(() => tooltip.classList.remove('show'), 2000);
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
});

// Initial generation
generatePassword();
