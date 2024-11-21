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

// Sidebar state management
function initializeSidebarState() {
    const contentWrapper = document.querySelector('.content-wrapper');
    
    document.addEventListener('sidebar-toggle', (event) => {
        contentWrapper.classList.toggle('sidebar-closed', !event.detail.isOpen);
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeSidebarState();
});
