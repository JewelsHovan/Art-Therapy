document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar-container');
    const toggleBtn = document.querySelector('.sidebar-toggle');
    const STORAGE_KEY = 'sidebarState';

    // Load saved state
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState === 'collapsed') {
        sidebar.classList.add('collapsed');
    }

    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        localStorage.setItem(
            STORAGE_KEY, 
            sidebar.classList.contains('collapsed') ? 'collapsed' : 'expanded'
        );
    });
});