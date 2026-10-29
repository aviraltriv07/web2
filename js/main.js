/**
 * SciFiLens - Main JavaScript
 * Shared functionality across all pages
 */

let cachedMovies = null;
let cachedConcepts = null;
let cachedWhatIfs = null;

// Navigation active state
function updateNavigation() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (!href) return;
        
        const cleanHref = href.split('?')[0].split('#')[0];
        if (currentPath.includes(cleanHref) || 
            (cleanHref === 'index.html' && (currentPath.endsWith('/') || currentPath.endsWith('index.html')))) {
            link.classList.add('active');
        }
    });
}

// Mobile hamburger menu
function setupHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        const closeMenu = () => {
            navMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        };

        hamburger.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', String(isOpen));
        });

        // Close menu when a link is clicked
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 1024) {
                    closeMenu();
                }
            });
        });

        // Close menu when clicking outside navbar
        document.addEventListener('click', (e) => {
            if (e.target instanceof Element && !e.target.closest('.navbar')) {
                closeMenu();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMenu();
        });
    }
}

function setupResponsiveFilters() {
    document.querySelectorAll('.filters-toggle').forEach(button => {
        const panel = document.getElementById(button.getAttribute('aria-controls'));
        if (!panel) return;

        button.addEventListener('click', () => {
            const isOpen = panel.classList.toggle('is-open');
            button.setAttribute('aria-expanded', String(isOpen));
        });
    });
}

// Modal functionality
function setupModal(modalSelector) {
    const modal = document.querySelector(modalSelector);
    if (!modal) return;
    
    const closeBtn = modal.querySelector('.modal-close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// Smooth scroll for internal links
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href && href !== '#') {
                e.preventDefault();
                const element = document.querySelector(href);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

// Utility functions for data fetching
async function fetchJSON(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching JSON:', error);
        return null;
    }
}

// Debounce helper
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

// Throttle helper
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Generate star rating HTML
function generateStarRating(rating, maxRating = 5) {
    let stars = '';
    for (let i = 0; i < maxRating; i++) {
        const filled = i < Math.floor(rating);
        const partial = i < rating && !filled;
        stars += `<span class="accuracy-star ${!filled && !partial ? 'empty' : ''}" title="${rating}">★</span>`;
    }
    return stars;
}

// Format numbers
function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

// Get score color
function getScoreColor(score) {
    if (score >= 4.5) return '#22c55e'; // Green
    if (score >= 3.5) return '#f59e0b'; // Amber
    if (score >= 2.5) return '#ef4444'; // Red
    return '#ef4444';
}

// Math Rendering Helper
window.renderMath = function(element) {
    if (window.renderMathInElement && element) {
        window.renderMathInElement(element, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '\\[', right: '\\]', display: true},
                {left: '$', right: '$', display: false},
                {left: '\\(', right: '\\)', display: false}
            ],
            throwOnError: false
        });
    }
};

// Auto-render math when DOM changes
document.addEventListener('DOMContentLoaded', () => {
    if (window.renderMath) {
        window.renderMath(document.body);
        
        const observer = new MutationObserver((mutations) => {
            let shouldRender = false;
            for (const mutation of mutations) {
                // Ignore KaTeX generated nodes to prevent infinite loop
                let isKatex = true;
                for (let i = 0; i < mutation.addedNodes.length; i++) {
                    const node = mutation.addedNodes[i];
                    if (node.nodeType === 1 && (node.classList.contains('katex') || node.classList.contains('katex-display'))) {
                        continue;
                    }
                    if (node.nodeType === 1 && node.querySelector('.katex')) {
                        continue; // If it contains katex, maybe it was modified by katex? Wait, no.
                    }
                    isKatex = false;
                    break;
                }
                
                if (!isKatex && mutation.addedNodes.length > 0) {
                    shouldRender = true;
                    break;
                }
            }
            if (shouldRender) {
                observer.disconnect();
                window.renderMath(document.body);
                observer.observe(document.body, { childList: true, subtree: true });
            }
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }
});

/* ============================================================
   GLOBAL OMNI-SEARCH & DISCOVERY SYSTEM
   ============================================================ */

function setupOmniSearch() {
    // Inject search modal if not present
    if (!document.getElementById('omniSearchModal')) {
        const searchModalHtml = `
            <div class="omni-search-modal" id="omniSearchModal">
                <div class="omni-search-container">
                    <div class="omni-search-bar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <input type="text" id="omniSearchInput" class="omni-search-input" placeholder="Search movies, concepts, what-if scenarios, physics, AI..." autocomplete="off">
                        <span class="omni-search-shortcut">ESC</span>
                    </div>
                    <div class="omni-search-results" id="omniSearchResults">
                        <div class="search-empty">Type to search across movies, scientific concepts, and What If? scenarios...</div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', searchModalHtml);
    }

    const modal = document.getElementById('omniSearchModal');
    const input = document.getElementById('omniSearchInput');
    const resultsContainer = document.getElementById('omniSearchResults');
    const searchBtns = document.querySelectorAll('.search-btn');

    function openSearch() {
        modal.classList.add('active');
    if (window.renderMath) window.renderMath(document.body);
        input.value = '';
        input.focus();
        loadSearchData();
        renderSearchResults('');
    }

    function closeSearch() {
        modal.classList.remove('active');
    }

    searchBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openSearch();
        });
    });

    // Keyboard shortcuts (Ctrl+K or /)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (modal.classList.contains('active')) {
                closeSearch();
            } else {
                openSearch();
            }
        } else if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
            e.preventDefault();
            openSearch();
        } else if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeSearch();
        }
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeSearch();
        }
    });

    input.addEventListener('input', debounce((e) => {
        renderSearchResults(e.target.value.trim());
    }, 150));
}

async function loadSearchData() {
    if (!cachedMovies) {
        const m = await fetchJSON('data/movies.json');
        if (m) cachedMovies = m.movies;
    }
    if (!cachedConcepts) {
        const c = await fetchJSON('data/science-concepts.json');
        if (c) cachedConcepts = c.concepts;
    }
    if (!cachedWhatIfs) {
        const w = await fetchJSON('data/what-if.json');
        if (w) cachedWhatIfs = w.scenarios;
    }
}

function renderSearchResults(query) {
    const container = document.getElementById('omniSearchResults');
    if (!container) return;

    if (!query) {
        container.innerHTML = `
            <div class="search-empty">
                <p style="margin-bottom: 0.5rem; font-weight: 600; color: #38bdf8;">Explore Knowledge Network</p>
                <p style="font-size: 0.85rem; color: var(--text-secondary);">Try searching: "Black hole", "Time dilation", "Interstellar", "Mars", "Quantum", "Gravity"</p>
            </div>
        `;
        return;
    }

    const q = query.toLowerCase();

    // 1. Filter Movies
    const matchedMovies = (cachedMovies || []).filter(m => 
        m.title.toLowerCase().includes(q) ||
        (m.genre && m.genre.toLowerCase().includes(q)) ||
        (m.concepts && m.concepts.some(c => c.toLowerCase().includes(q)))
    ).slice(0, 4);

    // 2. Filter Concepts
    const matchedConcepts = (cachedConcepts || []).filter(c => 
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    ).slice(0, 4);

    // 3. Filter What If scenarios
    const matchedWhatIfs = (cachedWhatIfs || []).filter(w => 
        w.title.toLowerCase().includes(q) ||
        w.hook.toLowerCase().includes(q) ||
        w.category.toLowerCase().includes(q) ||
        (w.keyConcepts && w.keyConcepts.some(kc => kc.name.toLowerCase().includes(q)))
    ).slice(0, 4);

    if (matchedMovies.length === 0 && matchedConcepts.length === 0 && matchedWhatIfs.length === 0) {
        container.innerHTML = `
            <div class="search-empty">
                <p>No results found for "<strong>${query}</strong>"</p>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">Try broadening your search term or exploring categories directly.</p>
            </div>
        `;
        return;
    }

    let html = '';

    // Movies group
    if (matchedMovies.length > 0) {
        html += `<div class="search-result-group-title">🎬 Movies (${matchedMovies.length})</div>`;
        matchedMovies.forEach(m => {
            html += `
                <a href="movie-detail.html?id=${m.id}" class="search-result-item">
                    <div class="search-result-icon">${m.poster || '🚀'}</div>
                    <div class="search-result-info">
                        <div class="search-result-title">${m.title} <span style="font-size: 0.8rem; color: var(--text-tertiary);">(${m.year})</span></div>
                        <div class="search-result-meta">${m.genre} • Accuracy: ${m.scientificAccuracy.toFixed(1)}/5</div>
                    </div>
                    <span class="search-result-type-badge" style="background: rgba(0, 102, 255, 0.2); color: #60a5fa;">Movie</span>
                </a>
            `;
        });
    }

    // Concepts group
    if (matchedConcepts.length > 0) {
        html += `<div class="search-result-group-title">🔬 Science Concepts (${matchedConcepts.length})</div>`;
        matchedConcepts.forEach(c => {
            html += `
                <a href="concepts.html?concept=${c.slug || c.id}" class="search-result-item">
                    <div class="search-result-icon">${c.icon || '⚛️'}</div>
                    <div class="search-result-info">
                        <div class="search-result-title">${c.title}</div>
                        <div class="search-result-meta">${c.category} • ${c.formula || c.description.substring(0, 60) + '...'}</div>
                    </div>
                    <span class="search-result-type-badge" style="background: rgba(6, 182, 212, 0.2); color: #38bdf8;">Concept</span>
                </a>
            `;
        });
    }

    // What If group
    if (matchedWhatIfs.length > 0) {
        html += `<div class="search-result-group-title">🌌 What If? Scenarios (${matchedWhatIfs.length})</div>`;
        matchedWhatIfs.forEach(w => {
            html += `
                <a href="what-if.html?scenario=${w.slug || w.id}" class="search-result-item">
                    <div class="search-result-icon">${w.icon || '🌍'}</div>
                    <div class="search-result-info">
                        <div class="search-result-title">${w.title}</div>
                        <div class="search-result-meta">${w.category} • ${w.classification}</div>
                    </div>
                    <span class="search-result-type-badge" style="background: rgba(168, 85, 247, 0.2); color: #c084fc;">What If?</span>
                </a>
            `;
        });
    }

    container.innerHTML = html;
}

/* ============================================================
   GLOBAL CONCEPT MODAL HELPER (For Clickable Tags)
   ============================================================ */

async function openGlobalConceptModal(conceptNameOrId) {
    if (!cachedConcepts) {
        const c = await fetchJSON('data/science-concepts.json');
        if (c) cachedConcepts = c.concepts;
    }

    if (!cachedConcepts) return;

    const searchTerm = String(conceptNameOrId).toLowerCase().trim();
    const concept = cachedConcepts.find(c => 
        c.id === conceptNameOrId || 
        (c.slug && c.slug.toLowerCase() === searchTerm) ||
        c.title.toLowerCase() === searchTerm ||
        c.title.toLowerCase().includes(searchTerm)
    );

    if (!concept) {
        // Fallback: navigate to concepts.html
        window.location.href = `concepts.html?search=${encodeURIComponent(conceptNameOrId)}`;
        return;
    }

    // Inject modal if not present
    if (!document.getElementById('globalConceptModal')) {
        const modalHtml = `
            <div class="modal" id="globalConceptModal">
                <div class="modal-content" style="max-width: 750px;">
                    <button class="modal-close" aria-label="Close">&times;</button>
                    <div class="modal-body" id="globalConceptModalBody"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        setupModal('#globalConceptModal');
    }

    const modal = document.getElementById('globalConceptModal');
    const body = document.getElementById('globalConceptModalBody');

    const formulaHtml = concept.formulaBreakdown ? `
        <div class="equation-card">
            <div class="equation-display">\\[ ${concept.formula} \\]</div>
            <p style="font-size: 0.9rem; color: #cbd5e1; margin-bottom: 0.75rem;">${concept.formulaBreakdown.meaning}</p>
            <div class="equation-variables">
                ${(concept.formulaBreakdown.variables || []).map(v => `
                    <div class="var-item">
                        <span class="var-symbol">${v.symbol}</span>
                        <span class="var-meaning">${v.name}: <strong>${v.value}</strong></span>
                    </div>
                `).join('')}
            </div>
            ${concept.formulaBreakdown.example ? `
                <div class="equation-example">
                    <strong>Worked Example:</strong> ${concept.formulaBreakdown.example}
                </div>
            ` : ''}
        </div>
    ` : (concept.formula ? `<div class="equation-card"><div class="equation-display">\\[ ${concept.formula} \\]</div></div>` : '');

    const levels = concept.levels || {
        beginner: concept.description,
        explorer: concept.explanation || concept.description,
        deepScience: concept.explanation || concept.description
    };

    body.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
            <div style="font-size: 2.5rem; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.05); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                ${concept.icon || '⚛️'}
            </div>
            <div>
                <span class="confidence-badge ${getConfidenceClass(concept.confidenceLabel || 'Established Science')}" style="margin-bottom: 0.35rem;">
                    ${concept.confidenceLabel || 'Established Science'}
                </span>
                <h2 style="font-size: 1.6rem; color: #ffffff; margin: 0;">${concept.title}</h2>
                <div style="font-size: 0.85rem; color: #38bdf8; font-weight: 600;">${concept.category} • Difficulty: ${concept.difficulty}</div>
            </div>
        </div>

        <p style="font-size: 1rem; color: #cbd5e1; line-height: 1.6; margin-bottom: 1rem;">${concept.description}</p>

        <!-- 3-Tier Level Switcher -->
        <div class="level-switcher" id="globalConceptLevelSwitcher">
            <button class="level-btn active" data-level="beginner">🟢 Beginner</button>
            <button class="level-btn" data-level="explorer">🟡 Explorer</button>
            <button class="level-btn" data-level="deepScience">🔴 Deep Science</button>
        </div>

        <div class="level-content-box beginner" id="globalConceptLevelBox">
            ${levels.beginner}
        </div>

        ${formulaHtml}

        <div class="modal-section" style="margin-top: 1.5rem;">
            <h3 style="font-size: 1.1rem; margin-bottom: 0.75rem; color: #ffffff;">Real-World Applications</h3>
            <ul class="applications-list" style="padding-left: 1.25rem; color: #cbd5e1; font-size: 0.9rem; line-height: 1.7;">
                ${(concept.applications || []).map(app => `<li>${app}</li>`).join('')}
            </ul>
        </div>

        <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem;">
            <a href="concepts.html?concept=${concept.slug || concept.id}" class="btn btn-primary" style="padding: 0.5rem 1.25rem; font-size: 0.85rem;">
                Open in Science Concepts Hub →
            </a>
        </div>
    `;

    // Setup level switcher
    const switcher = body.querySelector('#globalConceptLevelSwitcher');
    const contentBox = body.querySelector('#globalConceptLevelBox');
    if (switcher && contentBox) {
        switcher.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                switcher.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const level = btn.dataset.level;
                contentBox.className = `level-content-box ${level}`;
                contentBox.innerHTML = levels[level] || levels.beginner;
            });
        });
    }

    modal.classList.add('active');
    if (window.renderMath) window.renderMath(document.body);
}

function getConfidenceClass(label) {
    if (!label) return 'established';
    const l = label.toLowerCase();
    if (l.includes('established')) return 'established';
    if (l.includes('strong') || l.includes('theoretical')) return 'theoretical';
    if (l.includes('active')) return 'active-research';
    if (l.includes('speculative')) return 'speculative';
    if (l.includes('impossible')) return 'impossible';
}

/* ============================================================
   GLOBAL TOAST NOTIFICATION SYSTEM
   ============================================================ */

function showToast(message, type = 'info', action = null, duration = 4000) {
    let container = document.getElementById('scifilensToastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'scifilensToastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    if (type === 'error') icon = '✕';
    if (type === 'warning') icon = '⚠️';

    let actionBtnHtml = '';
    if (action && action.text) {
        if (action.url) {
            actionBtnHtml = `<a href="${action.url}" class="toast-action-btn">${action.text}</a>`;
        } else if (typeof action.callback === 'function') {
            actionBtnHtml = `<button type="button" class="toast-action-btn" id="toastActionBtn">${action.text}</button>`;
        }
    }

    toast.innerHTML = `
        <div class="toast-icon-wrap">${icon}</div>
        <div class="toast-message">${message}</div>
        ${actionBtnHtml}
        <button class="toast-close" aria-label="Close">&times;</button>
    `;

    container.appendChild(toast);

    if (action && typeof action.callback === 'function') {
        const btn = toast.querySelector('#toastActionBtn');
        if (btn) btn.addEventListener('click', () => {
            action.callback();
            removeToast(toast);
        });
    }

    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => removeToast(toast));
    }

    const timeout = setTimeout(() => {
        removeToast(toast);
    }, duration);

    function removeToast(el) {
        clearTimeout(timeout);
        el.classList.add('toast-exit');
        setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 300);
    }
}
window.showToast = showToast;

/* ============================================================
   CENTRALIZED AUTHENTICATION & NAVBAR STATE
   ============================================================ */

async function updateNavbarAuthState() {
    const navMenu = document.querySelector('.nav-menu');
    const profileBtns = document.querySelectorAll('.profile-btn');
    const currentPath = window.location.pathname;

    let user = null;
    let profile = null;

    if (window.SciFiLensSupabase && typeof window.SciFiLensSupabase.getCurrentUser === 'function') {
        try {
            user = await window.SciFiLensSupabase.getCurrentUser();
            if (user) {
                profile = await window.SciFiLensSupabase.getUserProfile(user.id);
            }
        } catch (e) {
            console.warn('Auth check in navbar notice:', e);
        }
    }

    // Clean previous dynamic auth items
    if (navMenu) {
        const oldAuth = navMenu.querySelector('#navAuthItem');
        const oldLogout = navMenu.querySelector('#navLogoutItem');
        if (oldAuth) oldAuth.remove();
        if (oldLogout) oldLogout.remove();

        if (user) {
            // Logged in items: My SciFiLens & Logout
            const isProfileActive = currentPath.includes('profile.html');
            const authLi = document.createElement('li');
            authLi.id = 'navAuthItem';
            authLi.innerHTML = `<a href="profile.html" class="nav-link ${isProfileActive ? 'active' : ''}">My SciFiLens</a>`;
            navMenu.appendChild(authLi);

            const logoutLi = document.createElement('li');
            logoutLi.id = 'navLogoutItem';
            logoutLi.innerHTML = `<a href="#" class="nav-link logout-link" onclick="handleNavbarLogout(event)" title="Sign out of SciFiLens">Logout</a>`;
            navMenu.appendChild(logoutLi);
        } else {
            // Logged out item: Login / Sign Up
            const isLoginActive = currentPath.includes('login.html');
            const authLi = document.createElement('li');
            authLi.id = 'navAuthItem';
            authLi.innerHTML = `<a href="login.html" class="nav-link ${isLoginActive ? 'active' : ''}">Login</a>`;
            navMenu.appendChild(authLi);
        }
    }

    // Update Profile Action Buttons
    profileBtns.forEach(btn => {
        if (user) {
            btn.setAttribute('title', `Logged in as ${profile?.full_name || user.email}`);
            btn.onclick = (e) => {
                e.preventDefault();
                window.location.href = 'profile.html';
            };

            const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture;
            if (avatarUrl) {
                btn.innerHTML = `<img src="${avatarUrl}" alt="Avatar" class="nav-avatar-img" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'nav-avatar-fallback\\'>👤</div>';">`;
            } else {
                const initial = (profile?.full_name || user.email || 'U').charAt(0).toUpperCase();
                btn.innerHTML = `<div class="nav-avatar-initial">${initial}</div>`;
            }
            btn.classList.add('logged-in');
        } else {
            btn.setAttribute('title', 'Login / Sign Up');
            btn.onclick = (e) => {
                e.preventDefault();
                window.location.href = 'login.html';
            };
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            `;
            btn.classList.remove('logged-in');
        }
    });

    updateNavigation();
}

async function handleNavbarLogout(event) {
    if (event) event.preventDefault();
    if (window.SciFiLensSupabase && window.SciFiLensSupabase.authSignOut) {
        try {
            await window.SciFiLensSupabase.authSignOut();
            showToast('You have been logged out.', 'info');
            
            // If on profile page, redirect to home
            if (window.location.pathname.includes('profile.html')) {
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 400);
            } else {
                updateNavbarAuthState();
                if (typeof syncAllLikeButtons === 'function') {
                    syncAllLikeButtons();
                }
            }
        } catch (err) {
            console.error('Logout error:', err);
            showToast('Error logging out. Please try again.', 'error');
        }
    }
}
window.handleNavbarLogout = handleNavbarLogout;
window.updateNavbarAuthState = updateNavbarAuthState;

function setupAuthListener() {
    if (window.SciFiLensSupabase) {
        const client = window.SciFiLensSupabase.getSupabase();
        if (client && client.auth) {
            client.auth.onAuthStateChange((event, session) => {
                updateNavbarAuthState();
                if (typeof initLikesSystem === 'function') {
                    initLikesSystem();
                }
            });
        }
    }
}

/* ============================================================
   SITE AUDIO — SYNTHESIZED UI EFFECTS AND HOMEPAGE AMBIENCE
   ============================================================ */
function setupSiteAudio() {
    const isHomePage = window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html');
    const storageKeys = {
        effects: 'scifilens-audio-effects-enabled',
        music: 'scifilens-home-music-enabled',
        volume: 'scifilens-audio-volume'
    };

    function readPreference(key, fallback) {
        try {
            const stored = window.localStorage.getItem(key);
            return stored === null ? fallback : stored === 'true';
        } catch (error) {
            return fallback;
        }
    }

    function writePreference(key, value) {
        try {
            window.localStorage.setItem(key, String(value));
        } catch (error) {
            // Audio remains usable if browser storage is unavailable.
        }
    }

    function readVolumePreference() {
        try {
            const stored = window.localStorage.getItem(storageKeys.volume);
            if (stored === null) return 0.72;
            const value = Number(stored);
            return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0.72;
        } catch (error) {
            return 0.72;
        }
    }

    let effectsEnabled = readPreference(storageKeys.effects, true);
    let musicEnabled = isHomePage && readPreference(storageKeys.music, false);
    let masterVolume = readVolumePreference();
    let audioContext = null;
    let effectsBus = null;
    let musicBus = null;
    let audioResumePromise = null;
    let musicRunBus = null;
    let musicTimer = null;
    let musicChordIndex = 0;
    let musicIsPlaying = false;
    let musicStartPending = false;
    let audioStatusMessage = '';
    const musicVoices = new Set();
    const AudioContextType = window.AudioContext || window.webkitAudioContext;

    const widget = document.createElement('div');
    widget.className = 'site-audio-widget';
    widget.innerHTML = `
        <section class="site-audio-panel" id="siteAudioPanel" aria-label="Sound settings" hidden>
            <div class="site-audio-panel-heading">
                <div>
                    <span class="site-audio-eyebrow">PERSONALIZE</span>
                    <h2>Sound settings</h2>
                    <p>Soft, original SciFiLens audio</p>
                </div>
                <button class="site-audio-close" type="button" data-audio-widget-close aria-label="Close sound settings">&times;</button>
            </div>
            <div class="site-audio-options">
                <div class="site-audio-option">
                    <div class="site-audio-option-copy">
                        <strong>Interface sounds</strong>
                        <span>Different tones for clicks and actions</span>
                    </div>
                    <button class="site-audio-switch" type="button" role="switch" data-audio-control="effects">
                        <span class="site-audio-switch-thumb"></span>
                    </button>
                </div>
                ${isHomePage ? `
                    <div class="site-audio-option">
                        <div class="site-audio-option-copy">
                            <strong>Home ambience</strong>
                            <span>A slow, space-inspired background tune</span>
                        </div>
                        <span class="site-audio-music-status" aria-live="polite"></span>
                        <button class="site-audio-switch" type="button" role="switch" data-audio-control="music">
                            <span class="site-audio-switch-thumb"></span>
                        </button>
                    </div>
                ` : ''}
            </div>
            <div class="site-audio-volume">
                <div class="site-audio-volume-heading">
                    <label for="siteAudioVolume">Master volume</label>
                    <output id="siteAudioVolumeValue" for="siteAudioVolume"></output>
                </div>
                <input id="siteAudioVolume" type="range" min="0" max="100" step="1" aria-label="Master audio volume">
                <span class="site-audio-volume-note">${isHomePage ? 'Music starts when you turn on home ambience.' : 'Your audio preference is saved on this device.'}</span>
            </div>
        </section>
        <button class="site-audio-trigger" type="button" aria-controls="siteAudioPanel" aria-expanded="false" aria-label="Open sound settings" title="Sound settings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <path d="M4 10v4h3l5 4V6l-5 4H4z"></path>
                <path d="M16 9a4 4 0 0 1 0 6m2.5-8.5a7.5 7.5 0 0 1 0 11"></path>
            </svg>
        </button>
    `;
    document.body.appendChild(widget);

    const audioPanel = widget.querySelector('.site-audio-panel');
    const audioTrigger = widget.querySelector('.site-audio-trigger');
    const effectsButton = widget.querySelector('[data-audio-control="effects"]');
    const musicButton = widget.querySelector('[data-audio-control="music"]');
    const musicStatus = widget.querySelector('.site-audio-music-status');
    const volumeInput = widget.querySelector('#siteAudioVolume');
    const volumeOutput = widget.querySelector('#siteAudioVolumeValue');
    const volumeNote = widget.querySelector('.site-audio-volume-note');
    let audioPanelOpen = false;

    function updateAudioControls() {
        effectsButton.setAttribute('aria-checked', String(effectsEnabled));
        effectsButton.setAttribute('aria-label', effectsEnabled ? 'Mute interface sounds' : 'Turn on interface sounds');
        effectsButton.classList.toggle('is-on', effectsEnabled);

        if (musicButton) {
            const musicStatusText = musicIsPlaying ? 'Playing' : (musicStartPending ? 'Starting' : (musicEnabled ? 'Ready' : 'Off'));
            musicButton.setAttribute('aria-checked', String(musicEnabled));
            musicButton.setAttribute('aria-label', musicIsPlaying || musicStartPending ? 'Turn off home ambience' : 'Turn on home ambience');
            musicButton.classList.toggle('is-on', musicEnabled);
            musicStatus.textContent = musicStatusText;
        }

        audioTrigger.setAttribute('aria-expanded', String(audioPanelOpen));
        audioTrigger.setAttribute('aria-label', audioPanelOpen ? 'Close sound settings' : 'Open sound settings');
        const audioEnabled = effectsEnabled || musicEnabled;
        audioTrigger.classList.toggle('has-audio', audioEnabled);
        audioTrigger.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <path d="M4 10v4h3l5 4V6l-5 4H4z"></path>
                ${audioEnabled ? '<path d="M16 9a4 4 0 0 1 0 6m2.5-8.5a7.5 7.5 0 0 1 0 11"></path>' : '<path d="m16 9 5 6m0-6-5 6"></path>'}
            </svg>
        `;
        volumeInput.value = String(Math.round(masterVolume * 100));
        volumeOutput.textContent = `${Math.round(masterVolume * 100)}%`;
        volumeNote.textContent = audioStatusMessage || (isHomePage
            ? 'Music starts when you turn on home ambience.'
            : 'Your audio preference is saved on this device.');
    }

    function setAudioPanelOpen(open) {
        audioPanelOpen = Boolean(open);
        audioPanel.hidden = !audioPanelOpen;
        updateAudioControls();
    }

    function applyMasterVolume() {
        if (!audioContext || !effectsBus || !musicBus) return;
        const now = audioContext.currentTime;
        effectsBus.gain.setTargetAtTime(0.62 * masterVolume, now, 0.025);
        musicBus.gain.setTargetAtTime(0.3 * masterVolume, now, 0.08);
    }

    function ensureAudioGraph() {
        if (!AudioContextType) {
            audioStatusMessage = 'Generated audio is not supported in this browser.';
            updateAudioControls();
            return Promise.resolve(false);
        }

        try {
            if (!audioContext || audioContext.state === 'closed') {
                audioResumePromise = null;
                audioContext = new AudioContextType();
                effectsBus = audioContext.createGain();
                musicBus = audioContext.createGain();
                effectsBus.connect(audioContext.destination);
                musicBus.connect(audioContext.destination);
                applyMasterVolume();
            }

            if (audioContext.state === 'running') {
                audioStatusMessage = '';
                return Promise.resolve(true);
            }
            if (!audioResumePromise) {
                audioResumePromise = audioContext.resume()
                    .then(() => {
                        const isRunning = audioContext.state === 'running';
                        audioStatusMessage = isRunning ? '' : 'Tap a sound control again to allow playback.';
                        updateAudioControls();
                        return isRunning;
                    })
                    .catch(() => {
                        audioStatusMessage = 'Audio could not start. Check your browser sound settings.';
                        updateAudioControls();
                        return false;
                    })
                    .then(isRunning => {
                        audioResumePromise = null;
                        return isRunning;
                    });
            }
            return audioResumePromise;
        } catch (error) {
            audioResumePromise = null;
            audioStatusMessage = 'Audio could not start. Check your browser sound settings.';
            updateAudioControls();
            return Promise.resolve(false);
        }
    }

    function scheduleTone(options, destination, trackForMusic = false) {
        const start = options.start ?? audioContext.currentTime + (options.delay || 0);
        const duration = options.duration || 0.12;
        const volume = options.volume || 0.08;
        const attack = Math.min(options.attack ?? 0.015, duration * 0.45);
        const release = Math.min(options.release ?? 0.035, duration * 0.45);
        const oscillator = audioContext.createOscillator();
        const filter = audioContext.createBiquadFilter();
        const envelope = audioContext.createGain();

        oscillator.type = options.wave || 'sine';
        oscillator.frequency.setValueAtTime(options.frequency, start);
        if (options.endFrequency && options.endFrequency !== options.frequency) {
            oscillator.frequency.exponentialRampToValueAtTime(options.endFrequency, start + duration);
        }
        if (options.detune) oscillator.detune.setValueAtTime(options.detune, start);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(options.cutoff || 4500, start);
        envelope.gain.setValueAtTime(0.0001, start);
        envelope.gain.exponentialRampToValueAtTime(volume, start + Math.max(0.005, attack));
        envelope.gain.setValueAtTime(volume, start + Math.max(attack, duration - release));
        envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);

        oscillator.connect(filter);
        filter.connect(envelope);
        envelope.connect(destination);
        oscillator.start(start);
        oscillator.stop(start + duration + 0.025);

        if (trackForMusic) {
            const voice = { oscillator, start, end: start + duration + 0.03 };
            musicVoices.add(voice);
            oscillator.addEventListener('ended', () => musicVoices.delete(voice), { once: true });
        }
    }

    const effectPatterns = {
        click: [
            { frequency: 760, endFrequency: 590, duration: 0.065, volume: 0.1, wave: 'triangle' }
        ],
        navigation: [
            { frequency: 440, endFrequency: 494, duration: 0.1, volume: 0.07, delay: 0 },
            { frequency: 587, endFrequency: 659, duration: 0.12, volume: 0.065, delay: 0.075 }
        ],
        selection: [
            { frequency: 520, endFrequency: 740, duration: 0.13, volume: 0.075, wave: 'triangle' }
        ],
        favorite: [
            { frequency: 523.25, duration: 0.18, volume: 0.065, delay: 0 },
            { frequency: 659.25, duration: 0.18, volume: 0.055, delay: 0.045 },
            { frequency: 783.99, duration: 0.2, volume: 0.045, delay: 0.09 }
        ],
        modalOpen: [
            { frequency: 360, endFrequency: 690, duration: 0.2, volume: 0.07 }
        ],
        modalClose: [
            { frequency: 690, endFrequency: 390, duration: 0.18, volume: 0.065 }
        ],
        toggleOn: [
            { frequency: 440, endFrequency: 700, duration: 0.13, volume: 0.07 }
        ],
        toggleOff: [
            { frequency: 600, endFrequency: 360, duration: 0.13, volume: 0.06 }
        ]
    };

    function playInterfaceSound(kind) {
        if (!effectsEnabled) return;

        const schedulePattern = () => {
            if (!effectsEnabled || !audioContext || audioContext.state !== 'running') return;
            const pattern = effectPatterns[kind] || effectPatterns.click;
            const start = audioContext.currentTime + 0.008;
            pattern.forEach(note => scheduleTone({ ...note, start: start + (note.delay || 0) }, effectsBus));
        };

        if (audioContext?.state === 'running') {
            schedulePattern();
            return;
        }

        ensureAudioGraph().then(isReady => {
            if (isReady) schedulePattern();
        });
    }

    const ambientProgression = [
        { pad: [130.81, 196, 261.63, 329.63], melody: [523.25, 659.25, 587.33, 392] },
        { pad: [110, 164.81, 220, 261.63], melody: [440, 523.25, 659.25, 523.25] },
        { pad: [87.31, 130.81, 174.61, 220], melody: [440, 523.25, 587.33, 659.25] },
        { pad: [98, 146.83, 196, 246.94], melody: [392, 493.88, 587.33, 523.25] }
    ];

    function scheduleAmbientPhrase() {
        if (!musicIsPlaying || !audioContext || !musicRunBus) return;

        const phrase = ambientProgression[musicChordIndex % ambientProgression.length];
        const start = audioContext.currentTime + 0.05;
        phrase.pad.forEach((frequency, index) => {
            scheduleTone({
                frequency,
                start,
                duration: 7.8,
                attack: 1.7,
                release: 1.5,
                volume: index === 0 ? 0.12 : 0.075,
                cutoff: 1050,
                wave: index === 1 ? 'triangle' : 'sine',
                detune: index === 3 ? 4 : 0
            }, musicRunBus, true);
        });

        phrase.melody.forEach((frequency, index) => {
            scheduleTone({
                frequency,
                start: start + 0.7 + index * 1.65,
                duration: 1.15,
                attack: 0.1,
                release: 0.45,
                volume: 0.045,
                cutoff: 1800,
                wave: 'sine'
            }, musicRunBus, true);
        });

        musicChordIndex += 1;
        musicTimer = window.setTimeout(scheduleAmbientPhrase, 8000);
    }

    async function startAmbientMusic() {
        if (!isHomePage || !musicEnabled || musicIsPlaying || musicStartPending) return;

        musicStartPending = true;
        updateAudioControls();
        const audioReady = await ensureAudioGraph();
        musicStartPending = false;
        if (!audioReady || document.hidden || !isHomePage || !musicEnabled || musicIsPlaying) {
            updateAudioControls();
            return;
        }

        musicIsPlaying = true;
        musicRunBus = audioContext.createGain();
        musicRunBus.gain.setValueAtTime(0.0001, audioContext.currentTime);
        musicRunBus.gain.linearRampToValueAtTime(1, audioContext.currentTime + 1.8);
        musicRunBus.connect(musicBus);
        scheduleAmbientPhrase();
        updateAudioControls();
    }

    function stopAmbientMusic() {
        musicIsPlaying = false;
        musicStartPending = false;
        if (musicTimer) {
            window.clearTimeout(musicTimer);
            musicTimer = null;
        }

        if (!audioContext || !musicRunBus) {
            updateAudioControls();
            return;
        }

        const now = audioContext.currentTime;
        musicRunBus.gain.cancelScheduledValues(now);
        musicRunBus.gain.setValueAtTime(musicRunBus.gain.value, now);
        musicRunBus.gain.linearRampToValueAtTime(0.0001, now + 0.25);
        const oldRunBus = musicRunBus;
        musicRunBus = null;
        window.setTimeout(() => {
            try { oldRunBus.disconnect(); } catch (error) {}
        }, 350);

        musicVoices.forEach(voice => {
            try { voice.oscillator.stop(Math.max(now + 0.3, voice.start + 0.03)); } catch (error) {}
        });
        updateAudioControls();
    }

    function classifyInteraction(target) {
        if (target.closest('.like-btn, .concept-like-btn, .movie-like-btn')) return 'favorite';
        if (target.closest('.modal-close, [data-modal-close]')) return 'modalClose';
        if (target.closest('.level-btn, .quiz-mode-tab, .category-tab-btn, .calc-preset-btn, .preset-btn, [role="tab"], .filters-toggle')) return 'selection';
        if (target.closest('.science-card, .experiment-card, .what-if-card, .category-card, .accuracy-card, .related-movie-card, .movie-card, .search-btn, [data-modal-open]')) return 'modalOpen';
        if (target.closest('.option')) return 'selection';
        if (target.closest('.nav-link, .nav-logo, a[href]')) return 'navigation';
        if (target.closest('button, [role="button"], [onclick]')) return 'click';
        return null;
    }

    function handleAudioInteraction(event) {
        if (!(event.target instanceof Element)) return;
        const target = event.target;
        const widgetTrigger = target.closest('[data-audio-widget-trigger]');
        const widgetClose = target.closest('[data-audio-widget-close]');
        const control = target.closest('[data-audio-control]');

        if (widgetTrigger) {
            setAudioPanelOpen(!audioPanelOpen);
            if (effectsEnabled) playInterfaceSound(audioPanelOpen ? 'toggleOn' : 'toggleOff');
            return;
        }

        if (widgetClose) {
            setAudioPanelOpen(false);
            audioTrigger.focus();
            if (effectsEnabled) playInterfaceSound('toggleOff');
            return;
        }

        if (audioPanelOpen && !widget.contains(target)) setAudioPanelOpen(false);

        if (control?.dataset.audioControl === 'effects') {
            effectsEnabled = !effectsEnabled;
            writePreference(storageKeys.effects, effectsEnabled);
            updateAudioControls();
            if (effectsEnabled) playInterfaceSound('toggleOn');
            return;
        }

        if (control?.dataset.audioControl === 'music') {
            musicEnabled = !musicIsPlaying && !musicStartPending;
            writePreference(storageKeys.music, musicEnabled);
            if (musicEnabled) startAmbientMusic();
            else stopAmbientMusic();
            if (effectsEnabled) playInterfaceSound(musicEnabled ? 'toggleOn' : 'toggleOff');
            updateAudioControls();
            return;
        }

        const soundKind = classifyInteraction(target);
        if (soundKind) playInterfaceSound(soundKind);
        if (isHomePage && musicEnabled && soundKind && soundKind !== 'navigation') startAmbientMusic();
    }

    audioTrigger.dataset.audioWidgetTrigger = 'true';
    volumeInput.value = String(Math.round(masterVolume * 100));
    volumeInput.addEventListener('input', () => {
        masterVolume = Number(volumeInput.value) / 100;
        writePreference(storageKeys.volume, masterVolume);
        applyMasterVolume();
        volumeOutput.textContent = `${Math.round(masterVolume * 100)}%`;
    });

    updateAudioControls();
    document.addEventListener('pointerdown', event => {
        if (!(event.target instanceof Element)) return;
        const target = event.target;
        const interactive = target.closest('button, a[href], [role="button"], [role="switch"], [onclick], .science-card, .experiment-card, .what-if-card, .category-card, .movie-card');
        if (interactive && (effectsEnabled || musicEnabled)) ensureAudioGraph();
    }, { capture: true, passive: true });
    document.addEventListener('click', handleAudioInteraction, true);
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && audioPanelOpen) {
            setAudioPanelOpen(false);
            audioTrigger.focus();
            return;
        }
        if (event.key === 'Enter' || event.key === ' ') {
            const target = event.target instanceof Element ? event.target : null;
            if (target?.closest('button, a[href], [role="button"], [role="switch"], [onclick]') && (effectsEnabled || musicEnabled)) {
                ensureAudioGraph();
            }
        }
    });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && (musicIsPlaying || musicStartPending)) stopAmbientMusic();
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
    setupHamburgerMenu();
    setupResponsiveFilters();
    setupSmoothScroll();
    setupModal('.modal');
    setupModal('.experiment-modal');
    setupOmniSearch();
    updateNavbarAuthState();
    setupAuthListener();
    setupSiteAudio();

    // Attach click listeners to any .concept-tag dynamically
    document.addEventListener('click', (e) => {
        const tag = e.target.closest('.concept-tag');
        if (tag && tag.dataset.concept) {
            e.preventDefault();
            openGlobalConceptModal(tag.dataset.concept);
        }
    });
});
