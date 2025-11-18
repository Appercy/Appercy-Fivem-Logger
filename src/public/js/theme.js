// Theme management
function getCurrentTheme() {
    return localStorage.getItem('theme') || 'light';
}

function setTheme(theme) {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

function toggleTheme() {
    const currentTheme = getCurrentTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const currentTheme = getCurrentTheme();
        themeToggle.textContent = currentTheme === 'light' ? '🌙' : '☀️';
    }
}

// Initialize theme on page load
function initTheme() {
    const savedTheme = getCurrentTheme();
    applyTheme(savedTheme);
    updateThemeIcon();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getCurrentTheme, setTheme, toggleTheme, initTheme };
}
