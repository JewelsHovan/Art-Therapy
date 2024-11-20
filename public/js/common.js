// Theme management
function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Set initial theme based on local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.classList.toggle('dark-theme', savedTheme === 'dark');
        updateThemeIcon(savedTheme === 'dark');
    } else {
        document.body.classList.toggle('dark-theme', prefersDark.matches);
        updateThemeIcon(prefersDark.matches);
    }

    // Theme toggle button click handler
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeIcon(isDark);
    });
}

function updateThemeIcon(isDark) {
    const icon = document.querySelector('.theme-toggle i');
    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
}

// Mobile sidebar management
function initializeMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    
    mobileMenuToggle.addEventListener('click', () => {
        // Dispatch custom event that sidebar.js listens for
        window.dispatchEvent(new CustomEvent('custom-toggle-sidebar'));
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeMobileMenu();
});
