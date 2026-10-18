/**
 * SciFiLens - Real Science Explorer Page Logic
 */

let allConcepts = [];
let filteredConcepts = [];
let allMoviesMap = {}; // id -> movie object cache

const filters = {
    search: '',
    difficulties: [],
    categories: []
};

// Helper: Synchronously render LaTeX using KaTeX if loaded, or return math delimiter span
function renderEquation(tex, isBlock = true) {
    if (!tex) return '';
    if (window.katex && typeof window.katex.renderToString === 'function') {
        try {
            return window.katex.renderToString(tex, {
                displayMode: isBlock,
                throwOnError: false
            });
        } catch (e) {
            console.warn('KaTeX render warning:', e);
        }
    }
    return isBlock ? `<span class="equation-tex">\\[ ${tex} \\]</span>` : `<span class="equation-tex">\\(${tex}\\)</span>`;
}

document.addEventListener('DOMContentLoaded', async () => {
    // Load both science concepts and movies data in parallel
    const [scienceData, moviesData] = await Promise.all([
        fetchJSON('data/science-concepts.json'),
        fetchJSON('data/movies.json')
    ]);

    // Build movie lookup map
    if (moviesData && moviesData.movies) {
        moviesData.movies.forEach(m => { allMoviesMap[m.id] = m; });
    }
    
    if (scienceData && scienceData.concepts) {
        allConcepts = scienceData.concepts;
        filteredConcepts = [...allConcepts];
        
        setupFilterUI();
        setupEventListeners();
        displayConcepts();
        updateConceptCount();
        
        // Auto-open modal if specified in URL query
        const urlParams = new URLSearchParams(window.location.search);
        const conceptId = urlParams.get('id');
        if (conceptId) {
            showConceptModal(parseInt(conceptId));
        }
    }
    
    setupModalFunctionality();
});

function setupFilterUI() {
    const difficulties = [...new Set(allConcepts.map(c => c.difficulty || 'Intermediate'))];
    setupFilterOptions('difficultyFilters', difficulties, 'difficulties');
    
    const categories = [...new Set(allConcepts.map(c => c.category))];
    setupFilterOptions('categoryFilters', categories, 'categories');
}

function setupFilterOptions(containerId, items, filterKey) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = items.map(item => `
        <label class="filter-checkbox">
            <input type="checkbox" data-value="${item}">
            <span>${item}</span>
        </label>
    `).join('');
    
    container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const value = e.target.dataset.value;
            if (e.target.checked) {
                if (!filters[filterKey].includes(value)) {
                    filters[filterKey].push(value);
                }
            } else {
                filters[filterKey] = filters[filterKey].filter(v => v !== value);
            }
            applyFilters();
        });
    });
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            filters.search = e.target.value.toLowerCase().trim();
            applyFilters();
        }, 150));
    }
    
    const resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            filters.search = '';
            filters.difficulties = [];
            filters.categories = [];
            
            const sInput = document.getElementById('searchInput');
            if (sInput) sInput.value = '';
            document.querySelectorAll('.filter-checkbox input[type="checkbox"]').forEach(cb => cb.checked = false);
            
            applyFilters();
        });
    }
}

function applyFilters() {
    filteredConcepts = allConcepts.filter(concept => {
        if (filters.search) {
            const query = filters.search;
            const inTitle = concept.title && concept.title.toLowerCase().includes(query);
            const inDesc = concept.description && concept.description.toLowerCase().includes(query);
            const inCat = concept.category && concept.category.toLowerCase().includes(query);
            const inMovies = (concept.relatedMovieTitles || []).some(t => t.toLowerCase().includes(query));
            if (!inTitle && !inDesc && !inCat && !inMovies) {
                return false;
            }
        }
        
        if (filters.difficulties.length > 0 && !filters.difficulties.includes(concept.difficulty)) {
            return false;
        }
        
        if (filters.categories.length > 0 && !filters.categories.includes(concept.category)) {
            return false;
        }
        
        return true;
    });
    
    updateConceptCount();
    displayConcepts();
}

function updateConceptCount() {
    const countElement = document.getElementById('conceptsCount');
    if (countElement) {
        countElement.textContent = `Showing ${filteredConcepts.length} of ${allConcepts.length} scientific principles`;
    }
}

function displayConcepts() {
    const grid = document.getElementById('scienceGrid');
    if (!grid) return;
    
    if (filteredConcepts.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--bg-glass-light); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
                <p style="font-size: 1.2rem; color: var(--text-secondary); margin-bottom: 1rem;">
                    No concepts found matching your criteria
                </p>
                <button class="btn btn-secondary" onclick="document.getElementById('resetFilters').click()">
                    Reset Filters
                </button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filteredConcepts.map(concept => {
        const likeBtnHtml = typeof renderConceptLikeButton === 'function'
            ? renderConceptLikeButton(concept.id, 'Like', '')
            : `<button class="like-btn concept-like-btn" data-concept-id="${concept.id}" onclick="handleConceptLikeClick(event, '${concept.id}')"><span class="like-heart-icon">♡</span> <span class="like-btn-label">Like</span></button>`;

        // Build movie poster thumbnails for the card
        const relatedMovieIds = concept.relatedMovies || [];
        const relatedMoviesForCard = relatedMovieIds.slice(0, 5).map(id => allMoviesMap[id]).filter(Boolean);
        const movieThumbsHtml = relatedMoviesForCard.length > 0 ? `
            <div style="margin-top: 0.85rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.08);">
                <div style="font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-secondary); font-weight: 700; margin-bottom: 0.45rem;">
                    🎬 Featured in ${relatedMovieIds.length} film${relatedMovieIds.length !== 1 ? 's' : ''}
                </div>
                <div style="display: flex; gap: 0.45rem; align-items: center; flex-wrap: wrap;">
                    ${relatedMoviesForCard.map(movie => `
                        <div title="${movie.title} (${movie.year})" 
                             style="width: 38px; height: 56px; border-radius: 5px; overflow: hidden; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.18); transition: transform 0.18s, border-color 0.18s; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.35);" 
                             onmouseenter="this.style.transform='scale(1.12)';this.style.borderColor='rgba(56,189,248,0.7)'" 
                             onmouseleave="this.style.transform='scale(1)';this.style.borderColor='rgba(255,255,255,0.18)'">
                            ${movie.posterUrl 
                                ? `<img src="${movie.posterUrl}" alt="${movie.title}" style="width:100%;height:100%;object-fit:cover;display:block;" onerror="this.onerror=null;this.parentElement.style.background='${movie.posterImage||'linear-gradient(135deg,#1a1a3f,#0d0d2b)'}';this.style.display='none';">` 
                                : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${movie.posterImage||'linear-gradient(135deg,#1a1a3f,#0d0d2b)'};font-size:1.2rem;">${movie.poster||'🎬'}</div>`
                            }
                        </div>
                    `).join('')}
                    ${relatedMovieIds.length > 5 ? `<div style="width:38px;height:56px;border-radius:5px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;font-size:0.7rem;color:var(--text-secondary);font-weight:700;">+${relatedMovieIds.length - 5}</div>` : ''}
                </div>
            </div>
        ` : '';

        return `
            <div class="science-card" onclick="showConceptModal(${concept.id})" style="display: flex; flex-direction: column; justify-content: space-between; position: relative;">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; gap: 0.5rem;">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div class="science-card-icon" style="font-size: 1.6rem; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.05); border-radius: 8px;">
                                ${concept.icon || '⚛️'}
                            </div>
                            <span class="confidence-badge ${getConfidenceClass(concept.confidenceLabel || 'Established Science')}">
                                ${concept.confidenceLabel || 'Established Science'}
                            </span>
                        </div>
                        <div onclick="event.stopPropagation()">
                            ${likeBtnHtml}
                        </div>
                    </div>
                    <h3 class="science-card-title" style="font-size: 1.25rem; font-weight: 800; color: #f8fafc; margin-bottom: 0.4rem;">${concept.title}</h3>
                    <p class="science-card-description" style="font-size: 0.9rem; color: #cbd5e1; line-height: 1.5; margin-bottom: 0.6rem;">${concept.description}</p>
                    ${concept.formula ? `
                        <div class="science-card-formula-box" style="margin: 0.75rem 0; padding: 0.5rem 0.75rem; background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 8px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.5); text-align: center; overflow-x: auto; overflow-y: hidden;">
                            ${renderEquation(concept.formula, true)}
                        </div>
                    ` : ''}
                    ${movieThumbsHtml}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.06);">
                    <span style="font-size: 0.75rem; color: #38bdf8; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">${concept.category}</span>
                    <div class="difficulty-badge ${(concept.difficulty || 'intermediate').toLowerCase()}">
                        ${concept.difficulty || 'Intermediate'}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Trigger KaTeX math rendering over grid if loaded
    if (window.renderMath) {
        window.renderMath(grid);
    }

    if (typeof syncAllLikeButtons === 'function') {
        syncAllLikeButtons();
    }
}

function setupModalFunctionality() {
    const modal = document.getElementById('scienceModal');
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

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
}

function showConceptModal(conceptId) {
    const concept = allConcepts.find(c => c.id === conceptId);
    if (!concept) return;
    
    const modal = document.getElementById('scienceModal');
    if (!modal) return;
    
    document.getElementById('modalTitle').textContent = concept.title;
    document.getElementById('modalIcon').textContent = concept.icon || '⚛️';
    
    const catBadge = document.getElementById('modalCategoryBadge');
    if (catBadge) {
        catBadge.innerHTML = `
            <span style="color: #38bdf8; font-size: 0.85rem; font-weight: 700;">${concept.category}</span> • 
            <span class="difficulty-badge ${(concept.difficulty || 'intermediate').toLowerCase()}">${concept.difficulty || 'Intermediate'}</span> • 
            <span class="confidence-badge ${getConfidenceClass(concept.confidenceLabel || 'Established Science')}">${concept.confidenceLabel || 'Established Science'}</span>
        `;
    }
    
    document.getElementById('modalDescription').textContent = concept.description;

    // 3-Tier Depth Switcher
    const levels = concept.levels || {
        beginner: concept.description,
        explorer: concept.description,
        deepScience: concept.description
    };

    const levelBox = document.getElementById('scienceLevelBox');
    const switcher = document.getElementById('scienceLevelSwitcher');
    if (levelBox && switcher) {
        switcher.querySelectorAll('.level-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.level === 'beginner');
            btn.onclick = () => {
                switcher.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const lvl = btn.dataset.level;
                levelBox.className = `level-content-box ${lvl}`;
                levelBox.innerHTML = levels[lvl] || levels.beginner;
                if (window.renderMath) {
                    window.renderMath(levelBox);
                }
            };
        });
        levelBox.className = 'level-content-box beginner';
        levelBox.innerHTML = levels.beginner;
        if (window.renderMath) {
            window.renderMath(levelBox);
        }
    }
    
    // Formula Section
    const formulaContainer = document.getElementById('modalFormulaContainer');
    if (formulaContainer) {
        if (concept.formulaBreakdown) {
            formulaContainer.innerHTML = `
                <div class="equation-card">
                    <div class="equation-display" style="padding: 0.85rem 0.5rem; text-align: center; background: rgba(15, 23, 42, 0.7); border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.2); margin-bottom: 0.85rem; overflow-x: auto;">
                        ${renderEquation(concept.formula, true)}
                    </div>
                    <p style="font-size: 0.95rem; color: #e2e8f0; margin-bottom: 0.85rem; line-height: 1.55;">${concept.formulaBreakdown.meaning}</p>
                    <div class="equation-variables" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.5rem; margin-bottom: 0.85rem;">
                        ${(concept.formulaBreakdown.variables || []).map(v => `
                            <div class="var-item" style="padding: 0.45rem 0.65rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; display: flex; align-items: baseline; gap: 0.5rem;">
                                <span class="var-symbol" style="color: #38bdf8; font-weight: 700; min-width: 28px;">${renderEquation(v.symbol, false)}</span>
                                <span class="var-meaning" style="font-size: 0.82rem; color: #cbd5e1;"><strong style="color: #f1f5f9;">${v.name}</strong>: ${v.value}</span>
                            </div>
                        `).join('')}
                    </div>
                    ${concept.formulaBreakdown.utility ? `
                        <div style="margin-top: 0.75rem; padding: 0.65rem 0.85rem; background: rgba(56, 189, 248, 0.08); border-left: 3px solid #38bdf8; border-radius: 4px; font-size: 0.85rem; color: #cbd5e1; line-height: 1.5;">
                            <strong style="color: #38bdf8;">Practical Utility:</strong> ${concept.formulaBreakdown.utility}
                        </div>
                    ` : ''}
                    ${concept.formulaBreakdown.example ? `
                        <div style="margin-top: 0.5rem; padding: 0.65rem 0.85rem; background: rgba(16, 185, 129, 0.08); border-left: 3px solid #10b981; border-radius: 4px; font-size: 0.85rem; color: #cbd5e1; line-height: 1.5;">
                            <strong style="color: #34d399;">Worked Example:</strong> ${concept.formulaBreakdown.example}
                        </div>
                    ` : ''}
                </div>
            `;
        } else if (concept.formula) {
            formulaContainer.innerHTML = `
                <div class="equation-card">
                    <div class="equation-display" style="padding: 0.85rem 0.5rem; text-align: center; background: rgba(15, 23, 42, 0.7); border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.2); overflow-x: auto;">
                        ${renderEquation(concept.formula, true)}
                    </div>
                </div>
            `;
        } else {
            formulaContainer.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.9rem;">Qualitative physical principle with no closed-form single equation.</p>';
        }
    }
    
    // Set related movies with poster images
    const movieIds = concept.relatedMovies || [];
    const relatedMovies = movieIds.map(id => allMoviesMap[id]).filter(Boolean);
    
    const moviesContainer = document.getElementById('modalMovies');
    if (moviesContainer) {
        if (relatedMovies.length === 0) {
            moviesContainer.innerHTML = '<p style="color: var(--text-secondary);">No related movies currently in catalog</p>';
        } else {
            moviesContainer.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 0.85rem;">
                    ${relatedMovies.map(movie => {
                        const scoreColor = movie.scientificAccuracy >= 4 ? '#22c55e' : movie.scientificAccuracy >= 2.5 ? '#f59e0b' : '#ef4444';
                        return `
                        <div onclick="window.location.href='movie-detail.html?id=${movie.id}'" 
                             style="cursor: pointer; border-radius: 8px; overflow: hidden; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.3);"
                             onmouseenter="this.style.transform='translateY(-4px)';this.style.borderColor='rgba(56,189,248,0.6)';this.style.boxShadow='0 8px 18px rgba(0,0,0,0.45)'"
                             onmouseleave="this.style.transform='translateY(0)';this.style.borderColor='rgba(255,255,255,0.12)';this.style.boxShadow='0 4px 10px rgba(0,0,0,0.3)'">
                            <div style="width: 100%; aspect-ratio: 2/3; overflow: hidden; position: relative;">
                                ${movie.posterUrl 
                                    ? `<img src="${movie.posterUrl}" alt="${movie.title}" 
                                            style="width: 100%; height: 100%; object-fit: cover; display: block;"
                                            onerror="this.onerror=null; this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${movie.posterImage || 'linear-gradient(135deg,#1a1a3f,#0d0d2b)'};font-size:2rem;\\'>${movie.poster || '🎬'}</div>'">`
                                    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${movie.posterImage || 'linear-gradient(135deg,#1a1a3f,#0d0d2b)'};font-size:2rem;">${movie.poster || '🎬'}</div>`
                                }
                                <div style="position:absolute;top:5px;right:5px;background:rgba(0,0,0,0.75);backdrop-filter:blur(4px);color:${scoreColor};font-size:0.68rem;font-weight:700;padding:2px 6px;border-radius:4px;border:1px solid rgba(255,255,255,0.15);">
                                    ${movie.scientificAccuracy.toFixed(1)}★
                                </div>
                            </div>
                            <div style="padding: 0.5rem 0.6rem;">
                                <div style="font-size: 0.78rem; font-weight: 700; color: #f1f5f9; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${movie.title}</div>
                                <div style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 2px;">${movie.year}</div>
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            `;
        }
    }
    
    // Set applications
    const appsList = document.getElementById('applicationsList');
    if (appsList) {
        appsList.innerHTML = (concept.applications || []).map(app => `<li>${app}</li>`).join('');
    }
    
    modal.classList.add('active');
    if (window.renderMath) {
        window.renderMath(modal);
    }
}

window.showConceptModal = showConceptModal;
