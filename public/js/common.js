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

// Language Management
function initializeLanguage() {
    const languageSelect = document.getElementById('languageSelect');
    const savedLanguage = localStorage.getItem('language') || 'en';
    
    // Set initial language
    languageSelect.value = savedLanguage;
    document.documentElement.lang = savedLanguage;
    updatePageTranslations();

    // Language change handler
    languageSelect.addEventListener('change', (e) => {
        const newLang = e.target.value;
        localStorage.setItem('language', newLang);
        document.documentElement.lang = newLang;
        updatePageTranslations();
    });
}

function updatePageTranslations() {
    const currentLang = localStorage.getItem('language') || 'en';
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const pageName = currentPage.replace('.html', '');
    
    // Update settings panel translations
    document.querySelector('.settings-header h3').textContent = translations[currentLang].settings.title;
    document.querySelector('.settings-section h4:first-of-type').textContent = translations[currentLang].settings.language;
    document.querySelector('.settings-section h4:last-of-type').textContent = translations[currentLang].settings.fontSize;
    
    // Update font size button texts
    document.querySelectorAll('.font-size-btn').forEach(btn => {
        const size = btn.dataset.size;
        btn.textContent = translations[currentLang].settings[size];
    });

    // Update page-specific content
    if (translations[currentLang][pageName]) {
        Object.entries(translations[currentLang][pageName]).forEach(([key, value]) => {
            const elements = document.querySelectorAll(`[data-i18n="${key}"]`);
            elements.forEach(el => {
                if (el.tagName === 'INPUT') {
                    el.placeholder = value;
                } else {
                    el.textContent = value;
                }
            });
        });

        // Handle nested translations (like prompt suggestions)
        Object.entries(translations[currentLang][pageName]).forEach(([key, value]) => {
            if (typeof value === 'object') {
                Object.entries(value).forEach(([nestedKey, nestedValue]) => {
                    const elements = document.querySelectorAll(`[data-i18n="${key}.${nestedKey}"]`);
                    elements.forEach(el => el.textContent = nestedValue);
                });
            }
        });
    }
}

// Font Size Management
function initializeFontSize() {
    const fontSizeButtons = document.querySelectorAll('.font-size-btn');
    const savedSize = localStorage.getItem('fontSize') || 'medium';
    
    // Set initial font size
    document.documentElement.setAttribute('data-font-size', savedSize);
    updateActiveFontSizeButton(savedSize);

    // Font size button click handlers
    fontSizeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const newSize = btn.dataset.size;
            localStorage.setItem('fontSize', newSize);
            document.documentElement.setAttribute('data-font-size', newSize);
            updateActiveFontSizeButton(newSize);
        });
    });
}

function updateActiveFontSizeButton(activeSize) {
    document.querySelectorAll('.font-size-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.size === activeSize);
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeSidebarState();
    initializeSettings();
    initializeLanguage();
    initializeFontSize();
});
