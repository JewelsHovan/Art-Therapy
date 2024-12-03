class Sidebar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.images = [];
        this.isOpen = true;
        this.isLoading = true;
        this.error = null;
        this.page = 1;
        this.itemsPerPage = 10;
        this.hasMore = true;
        this.observer = null;
    }

    async connectedCallback() {
        this.setupIntersectionObserver();
        await this.fetchImages();
        this.render();
    }

    setupIntersectionObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isLoading && this.hasMore) {
                    this.loadMoreImages();
                }
            });
        }, { threshold: 0.5 });
    }

    async fetchImages() {
        this.isLoading = true;
        this.error = null;
        this.render();

        try {
            const response = await fetch(`/api/images?page=${this.page}&limit=${this.itemsPerPage}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch images: ${response.statusText}`);
            }
            const data = await response.json();
            
            // Append new images to existing ones
            this.images = this.page === 1 ? data.images : [...this.images, ...data.images];
            this.hasMore = data.hasMore || false;
            
            if (this.hasMore) {
                this.page++;
            }
        } catch (error) {
            console.error('Error fetching images:', error);
            this.error = error.message;
            this.images = [];
        } finally {
            this.isLoading = false;
            this.render();
            this.observeLastItem();
        }
    }

    async loadMoreImages() {
        if (!this.isLoading && this.hasMore) {
            await this.fetchImages();
        }
    }

    observeLastItem() {
        if (this.hasMore) {
            const lastItem = this.shadowRoot.querySelector('.menu-item:last-child');
            if (lastItem) {
                this.observer.observe(lastItem);
            }
        }
    }

    disconnectedCallback() {
        if (this.observer) {
            this.observer.disconnect();
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
        if (this.isLoading) {
            return `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Loading images...</p>
                </div>
            `;
        }

        if (this.error) {
            return `
                <div class="error-state">
                    <p>Error: ${this.error}</p>
                    <button class="retry-button">Retry</button>
                </div>
            `;
        }

        if (this.images.length === 0) {
            return `
                <div class="empty-state">
                    <p>No images found</p>
                </div>
            `;
        }

        return this.images.map(image => `
            <div class="menu-item" data-image-id="${image.id}">
                <div class="session-info">
                    <div class="image-preview" style="background-image: url('${image.file_path}')"></div>
                    <h3>${this.truncateText(image.prompt, 50)}</h3>
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
        const toggleButton = this.shadowRoot.querySelector('.sidebar-toggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => this.toggleSidebar());
        }

        window.addEventListener('custom-toggle-sidebar', () => this.toggleSidebar());

        // Add retry button listener
        const retryButton = this.shadowRoot.querySelector('.retry-button');
        if (retryButton) {
            retryButton.addEventListener('click', () => this.fetchImages());
        }

        const menuItems = this.shadowRoot.querySelectorAll('.menu-item');
        if (menuItems.length > 0) {
            menuItems.forEach(item => {
                item.addEventListener('click', () => {
                    const imageId = item.dataset.imageId;
                    console.log('Clicked image:', imageId);
                });
            });
        }
    }

    toggleSidebar() {
        this.isOpen = !this.isOpen;
        const sidebar = this.shadowRoot.querySelector('.sidebar');
        const toggleButton = this.shadowRoot.querySelector('.sidebar-toggle');
        
        sidebar.classList.toggle('closed', !this.isOpen);
        toggleButton.classList.toggle('closed', !this.isOpen);

        // Dispatch custom event for layout updates
        document.dispatchEvent(new CustomEvent('sidebar-toggle', {
            detail: { isOpen: this.isOpen }
        }));
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
                .loading-state, .error-state, .empty-state {
                    padding: 20px;
                    text-align: center;
                    color: #666;
                }

                .loading-spinner {
                    width: 30px;
                    height: 30px;
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #3498db;
                    border-radius: 50%;
                    margin: 0 auto 10px;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .retry-button {
                    margin-top: 10px;
                    padding: 8px 16px;
                    background-color: #3498db;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }

                .retry-button:hover {
                    background-color: #2980b9;
                }
                
                .header {
                    display: flex;
                    align-items: center;
                    padding: 1rem;
                    cursor: pointer;
                }
                .header h1 {
                    font-size: 1.5rem;
                    color: #333;
                    margin: 0;
                    margin-left: 0.5rem;
                    font-weight: 600;
                }
                .header img {
                    width: 32px;
                    height: 32px;
                }
            </style>
            <div class="sidebar">
                <div class="header" onclick="window.location.href='/index.html'">
                    <img src="/images/palette.png" alt="Art Therapy Icon" />
                    <h1>Art Therapy</h1>
                </div>
                <div class="menu-items">
                    ${this.generateMenuItems()}
                </div>
                <button class="sidebar-toggle" aria-label="Toggle Sidebar"></button>
            </div>
        `;
        
        // Setup event listeners after rendering
        this.setupEventListeners();
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
