class Sidebar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.images = [];
        this.isOpen = true; // Track sidebar state
    }

    async connectedCallback() {
        await this.fetchImages();
        this.render();
        this.setupEventListeners();
    }

    async fetchImages() {
        try {
            const response = await fetch('/api/images');
            if (!response.ok) throw new Error('Failed to fetch images');
            this.images = await response.json();
        } catch (error) {
            console.error('Error fetching images:', error);
            this.images = [];
        }
    }

    formatTimestamp(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);

        // If today
        if (date.toDateString() === now.toDateString()) {
            return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
        // If yesterday
        else if (date.toDateString() === yesterday.toDateString()) {
            return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
        // Otherwise show date
        else {
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        }
    }

    generateMenuItems() {
        return this.images.map(image => `
            <div class="menu-item" data-image-id="${image.id}">
                <div class="session-info">
                    <div class="image-preview" style="background-image: url('${image.file_path}')"></div>
                    <h3>${this.truncateText(image.prompt, 50)}</h3>
                    <p>${this.truncateText(image.prompt, 60)}</p>
                    <span class="timestamp">${this.formatTimestamp(image.created_at)}</span>
                </div>
            </div>
        `).join('');
    }

    truncateText(text, maxLength) {
        return text.length > maxLength 
            ? text.substring(0, maxLength) + '...' 
            : text;
    }

    setupEventListeners() {
        // Get the toggle button from shadow DOM
        const toggleButton = this.shadowRoot.querySelector('.sidebar-toggle');
        toggleButton.addEventListener('click', () => this.toggleSidebar());

        // Listen for custom events from outside
        window.addEventListener('custom-toggle-sidebar', () => this.toggleSidebar());

        const menuItems = this.shadowRoot.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const imageId = item.dataset.imageId;
                console.log('Clicked image:', imageId);
            });
        });
    }

    toggleSidebar() {
        this.isOpen = !this.isOpen;
        const sidebar = this.shadowRoot.querySelector('.sidebar');
        const toggleButton = this.shadowRoot.querySelector('.sidebar-toggle');
        
        sidebar.classList.toggle('closed', !this.isOpen);
        toggleButton.classList.toggle('closed', !this.isOpen);
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }

                .sidebar {
                    width: var(--sidebar-width, 250px);
                    background-color: var(--sidebar-bg, #f5f5f5);
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    height: 100vh;
                    left: 0;
                    top: 0;
                    transition: transform 0.3s ease;
                    z-index: 999;
                    border-right: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
                }

                .sidebar.closed {
                    transform: translateX(-100%);
                }

                .sidebar-toggle {
                    position: absolute;
                    right: -40px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 40px;
                    height: 40px;
                    background: var(--primary-blue, #7b9ed9);
                    border: none;
                    border-radius: 0 4px 4px 0;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    box-shadow: 2px 0 4px rgba(0,0,0,0.1);
                    transition: background-color 0.3s ease;
                }

                .sidebar-toggle:hover {
                    background: var(--primary-blue-hover, #6b8ec9);
                }

                .sidebar-toggle::after {
                    content: "◀";
                    font-size: 18px;
                    transition: transform 0.3s ease;
                }

                .sidebar-toggle.closed::after {
                    transform: rotate(180deg);
                }

                @media (max-width: 768px) {
                    .sidebar {
                        width: 100%;
                        max-width: 300px;
                    }
                    
                    .sidebar-toggle {
                        width: 32px;
                        height: 32px;
                        right: -32px;
                    }
                }

                ${this.getExistingStyles()}
            </style>
            <div class="sidebar">
                <div class="header" onclick="window.location.href='/index.html'">
                    <h1>Art Therapy</h1>
                </div>
                <div class="menu-items">
                    ${this.images.length ? this.generateMenuItems() : `
                        <div class="empty-state">
                            <p>No artwork generated yet</p>
                        </div>
                    `}
                </div>
                <button class="sidebar-toggle" aria-label="Toggle Sidebar"></button>
            </div>
        `;
    }

    getExistingStyles() {
        return `
            .header {
                padding: 24px 20px;
                background-color: var(--primary-blue, #7b9ed9);
                margin-bottom: 20px;
                cursor: pointer;
                width: 100%;
                box-sizing: border-box;
            }

            .header:hover {
                background-color: var(--primary-blue-hover, #6b8ec9);
            }

            .header h1 {
                color: white;
                margin: 0;
                font-size: 1.5rem;
            }

            .menu-items {
                overflow-y: auto;
                flex-grow: 1;
                padding: 0 10px;
            }

            .menu-item {
                background-color: var(--menu-item-bg, #ffffff);
                border-radius: 12px;
                padding: 16px;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
            }

            .menu-item:hover {
                transform: translateX(5px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                border-color: var(--primary-blue, #7b9ed9);
            }

            .session-info h3 {
                font-size: 1rem;
                margin-bottom: 6px;
                color: var(--text-color, #333333);
                font-weight: 600;
            }

            .session-info p {
                font-size: 0.85rem;
                color: var(--text-color, #333333);
                opacity: 0.8;
                margin-bottom: 10px;
                line-height: 1.4;
            }

            .timestamp {
                font-size: 0.75rem;
                color: var(--timestamp-color, #666666);
                display: block;
                padding-top: 8px;
                border-top: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
            }

            .image-preview {
                width: 100%;
                height: 120px;
                background-size: cover;
                background-position: center;
                border-radius: 8px;
                margin-bottom: 10px;
            }

            :host-context(body.dark-theme) .sidebar {
                background-color: var(--sidebar-bg-dark, #1a1a1a);
            }

            :host-context(body.dark-theme) .menu-item {
                background-color: var(--menu-item-bg-dark, #2d2d2d);
                border-color: var(--border-color-dark, rgba(255, 255, 255, 0.1));
            }

            :host-context(body.dark-theme) .session-info h3,
            :host-context(body.dark-theme) .session-info p {
                color: var(--text-color-dark, #ffffff);
            }

            :host-context(body.dark-theme) .timestamp {
                color: var(--timestamp-color-dark, #999999);
                border-top-color: var(--border-color-dark, rgba(255, 255, 255, 0.1));
            }

            :host-context(body.dark-theme) .menu-item:hover {
                border-color: var(--primary-blue, #7b9ed9);
            }
        `;
    }
}

customElements.define('art-sidebar', Sidebar);
