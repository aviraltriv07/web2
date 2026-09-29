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
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
        });
        
        // Close menu when a link is clicked
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    navMenu.style.display = 'none';
                    navMenu.classList.remove('active');
                }
            });
        });
    }
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
            <div class="equation-display">${concept.formula}</div>
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
    ` : (concept.formula ? `<div class="equation-card"><div class="equation-display">${concept.formula}</div></div>` : '');

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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
    setupHamburgerMenu();
    setupSmoothScroll();
    setupModal('.modal');
    setupModal('.experiment-modal');
    setupOmniSearch();
    updateNavbarAuthState();
    setupAuthListener();

    // Attach click listeners to any .concept-tag dynamically
    document.addEventListener('click', (e) => {
        const tag = e.target.closest('.concept-tag');
        if (tag && tag.dataset.concept) {
            e.preventDefault();
            openGlobalConceptModal(tag.dataset.concept);
        }
    });
});

