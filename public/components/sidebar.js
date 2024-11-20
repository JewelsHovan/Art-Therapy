class Sidebar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.images = [];
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
                    <h3>${this.truncateText(image.prompt, 30)}</h3>
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
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    z-index: 999;
                    border-right: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
                    padding: 0;
                }

                .header {
                    padding: 24px 20px;
                    background-color: var(--primary-blue, #7b9ed9);
                    margin-bottom: 20px;
                    cursor: pointer;
                    width: 100%;
                    box-sizing: border-box;
                }

                .header h1 {
                    font-size: 1.5rem;
                    margin-bottom: 8px;
                    color: white;
                    font-weight: 600;
                }

                .header p {
                    font-size: 0.9rem;
                    color: rgba(255, 255, 255, 0.8);
                }

                .menu {
                    padding: 0 15px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    overflow-y: auto;
                    max-height: calc(100vh - 100px);
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

                @media screen and (max-width: 768px) {
                    .sidebar {
                        transform: translateX(-100%);
                        box-shadow: none;
                    }

                    .sidebar.active {
                        transform: translateX(0);
                        box-shadow: 5px 0 15px rgba(0,0,0,0.2);
                    }

                    .menu {
                        padding: 15px;
                        gap: 12px;
                    }

                    .header {
                        padding: 20px 15px;
                        margin-bottom: 15px;
                    }
                }

                @media screen and (max-width: 320px) {
                    .menu {
                        padding: 12px;
                        gap: 10px;
                    }

                    .header {
                        padding: 15px 12px;
                        margin-bottom: 12px;
                    }
                }

                @supports (padding: max(0px)) {
                    .sidebar {
                        padding-left: max(20px, env(safe-area-inset-left));
                        padding-right: max(20px, env(safe-area-inset-right));
                    }
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
            </style>
            <aside class="sidebar">
                <div class="header" onclick="window.location.href='index.html'">
                    <h1>Art Sessions</h1>
                    <p>Your creative journey</p>
                </div>
                <nav class="menu">
                    ${this.images.length ? this.generateMenuItems() : `
                        <div class="empty-state">
                            <p>No artwork generated yet</p>
                        </div>
                    `}
                </nav>
            </aside>
        `;
    }

    setupEventListeners() {
        window.addEventListener('custom-toggle-sidebar', () => {
            const sidebar = this.shadowRoot.querySelector('.sidebar');
            sidebar.classList.toggle('active');
        });

        const menuItems = this.shadowRoot.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const imageId = item.dataset.imageId;
                console.log('Clicked image:', imageId);
            });
        });
    }
}

customElements.define('art-sidebar', Sidebar);
