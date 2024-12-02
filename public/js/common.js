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
    const icon = document.querySelector('#themeToggle i');
    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
}

// Sidebar state management
function initializeSidebarState() {
    const contentWrapper = document.querySelector('.content-wrapper');
    
    document.addEventListener('sidebar-toggle', (event) => {
        contentWrapper.classList.toggle('sidebar-closed', !event.detail.isOpen);
    });
}

// Settings Panel Management
function initializeSettings() {
    const settingsButton = document.getElementById('settingsButton');
    const settingsPanel = document.getElementById('settingsPanel');
    const closeSettings = document.querySelector('.close-settings');

    // Toggle settings panel
    settingsButton.addEventListener('click', () => {
        settingsPanel.classList.toggle('hidden');
    });

    // Close settings panel
    closeSettings.addEventListener('click', () => {
        settingsPanel.classList.add('hidden');
    });

    // Close settings when clicking outside
    document.addEventListener('click', (event) => {
        if (!settingsPanel.contains(event.target) && 
            !settingsButton.contains(event.target) && 
            !settingsPanel.classList.contains('hidden')) {
            settingsPanel.classList.add('hidden');
        }
    });

    // Initialize settings panel state
    settingsPanel.classList.add('hidden');
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeSidebarState();
    initializeSettings();
});
