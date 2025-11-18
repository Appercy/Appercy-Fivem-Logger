// Initialize locale selector and apply translations
document.addEventListener('DOMContentLoaded', () => {
    const localeSelector = document.getElementById('localeSelector');
    if (localeSelector) {
        localeSelector.value = getCurrentLocale();
    }
    applyTranslations();
});

// Apply translations to all elements with data-i18n attribute
function applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
}

document.getElementById('setupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const messageEl = document.getElementById('message');
    
    // Clear previous messages
    messageEl.className = 'message';
    messageEl.textContent = '';
    
    // Validate passwords match
    if (password !== confirmPassword) {
        messageEl.className = 'message error';
        messageEl.textContent = 'Passwords do not match';
        return;
    }
    
    // Validate password strength
    if (password.length < 8) {
        messageEl.className = 'message error';
        messageEl.textContent = 'Password must be at least 8 characters';
        return;
    }
    
    try {
        const response = await fetch('/api/setup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            messageEl.className = 'message success';
            messageEl.textContent = 'Admin account created successfully! Redirecting to login...';
            
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
        } else {
            messageEl.className = 'message error';
            messageEl.textContent = data.error || 'Failed to create admin account';
        }
    } catch (error) {
        messageEl.className = 'message error';
        messageEl.textContent = 'An error occurred. Please try again.';
    }
});
