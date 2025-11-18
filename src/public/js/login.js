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

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageEl = document.getElementById('message');
    
    // Clear previous messages
    messageEl.className = 'message';
    messageEl.textContent = '';
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store session ID
            localStorage.setItem('sessionId', data.sessionId);
            localStorage.setItem('username', data.username);
            
            // Redirect to dashboard
            window.location.href = '/dashboard.html';
        } else {
            messageEl.className = 'message error';
            messageEl.textContent = data.error || 'Invalid credentials';
        }
    } catch (error) {
        messageEl.className = 'message error';
        messageEl.textContent = 'An error occurred. Please try again.';
    }
});
