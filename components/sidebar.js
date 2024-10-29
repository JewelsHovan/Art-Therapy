class Sidebar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
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
            </style>
            <aside class="sidebar">
                <div class="header" onclick="window.location.href='index.html'">
                    <h1>Art Sessions</h1>
                    <p>Your creative journey</p>
                </div>
                <nav class="menu">
                    <div class="menu-item">
                        <div class="session-info">
                            <h3>Abstract Landscape</h3>
                            <p>Generated artwork with mountain themes</p>
                            <span class="timestamp">Today at 2:30 PM</span>
                        </div>
                    </div>
                    <div class="menu-item">
                        <div class="session-info">
                            <h3>Portrait Study</h3>
                            <p>Edited portrait with vibrant colors</p>
                            <span class="timestamp">Today at 11:45 AM</span>
                        </div>
                    </div>
                    <div class="menu-item">
                        <div class="session-info">
                            <h3>Nature Scene</h3>
                            <p>Generated forest artwork</p>
                            <span class="timestamp">Yesterday at 4:15 PM</span>
                        </div>
                    </div>
                    <div class="menu-item">
                        <div class="session-info">
                            <h3>Urban Sketch</h3>
                            <p>City landscape with neon effects</p>
                            <span class="timestamp">Yesterday at 2:00 PM</span>
                        </div>
                    </div>
                    <div class="menu-item">
                        <div class="session-info">
                            <h3>Abstract Patterns</h3>
                            <p>Generated geometric patterns</p>
                            <span class="timestamp">Jul 20, 2023</span>
                        </div>
                    </div>
                    <div class="menu-item">
                        <div class="session-info">
                            <h3>Watercolor Style</h3>
                            <p>Edited artwork with watercolor effects</p>
                            <span class="timestamp">Jul 19, 2023</span>
                        </div>
                    </div>
                </nav>
            </aside>
        `;
    }

    setupEventListeners() {
        window.addEventListener('custom-toggle-sidebar', () => {
            const sidebar = this.shadowRoot.querySelector('.sidebar');
            sidebar.classList.toggle('active');
        });
    }
}

customElements.define('art-sidebar', Sidebar);
