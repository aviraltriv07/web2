/**
 * SciFiLens - Science Explorer Page Logic
 */

let allConcepts = [];
let filteredConcepts = [];

const filters = {
    search: '',
    difficulties: [],
    categories: []
};

document.addEventListener('DOMContentLoaded', async () => {
    const scienceData = await fetchJSON('data/science-concepts.json');
    
    if (scienceData && scienceData.concepts) {
        allConcepts = scienceData.concepts;
        filteredConcepts = [...allConcepts];
        
        setupFilterUI();
        setupEventListeners();
        displayConcepts();
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
            filters.search = e.target.value.toLowerCase();
            applyFilters();
        }, 200));
    }
    
    const resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            filters.search = '';
            filters.difficulties = [];
            filters.categories = [];
            
            document.getElementById('searchInput').value = '';
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            
            applyFilters();
        });
    }
}

function applyFilters() {
    filteredConcepts = allConcepts.filter(concept => {
        if (filters.search && 
            !concept.title.toLowerCase().includes(filters.search) && 
            !concept.description.toLowerCase().includes(filters.search) &&
            !concept.category.toLowerCase().includes(filters.search)) {
            return false;
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
        countElement.textContent = `Showing ${filteredConcepts.length} of ${allConcepts.length} concepts`;
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

        return `
            <div class="science-card" onclick="showConceptModal(${concept.id})" style="display: flex; flex-direction: column; justify-content: space-between; position: relative;">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; gap: 0.5rem;">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div class="science-card-icon">${concept.icon || '⚛️'}</div>
                            <span class="confidence-badge ${getConfidenceClass(concept.confidenceLabel || 'Established Science')}">
                                ${concept.confidenceLabel || 'Established Science'}
                            </span>
                        </div>
                        <div onclick="event.stopPropagation()">
                            ${likeBtnHtml}
                        </div>
                    </div>
                    <h3 class="science-card-title">${concept.title}</h3>
                    <p class="science-card-description">${concept.description}</p>
                    ${concept.formula ? `
                        <div style="font-family: 'Cambria Math', serif; color: #38bdf8; background: rgba(0,0,0,0.3); padding: 0.4rem 0.75rem; border-radius: 4px; font-size: 0.9rem; margin: 0.75rem 0; border: 1px dashed rgba(6,182,212,0.3); text-align: center;">\\[ ${concept.formula} \\]</div>
                    ` : ''}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.06);">
                    <span style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">${concept.category}</span>
                    <div class="difficulty-badge ${(concept.difficulty || 'intermediate').toLowerCase()}">
                        ${concept.difficulty || 'Intermediate'}
                    </div>
                </div>
            </div>
        `;
    }).join('');

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
}

async function showConceptModal(conceptId) {
    const concept = allConcepts.find(c => c.id === conceptId);
    if (!concept) return;
    
    const modal = document.getElementById('scienceModal');
    
    document.getElementById('modalTitle').textContent = concept.title;
    document.getElementById('modalIcon').textContent = concept.icon || '⚛️';
    
    const catBadge = document.getElementById('modalCategoryBadge');
    if (catBadge) {
        catBadge.innerHTML = `
            <span style="color: #38bdf8; font-size: 0.85rem; font-weight: 600;">${concept.category}</span> • 
            <span class="difficulty-badge ${(concept.difficulty || 'intermediate').toLowerCase()}">${concept.difficulty || 'Intermediate'}</span>
        `;
    }
    
    document.getElementById('modalDescription').textContent = concept.description;

    // 3-Tier Depth Switcher
    const levels = concept.levels || {
        beginner: concept.description,
        explorer: concept.explanation || concept.description,
        deepScience: concept.explanation || concept.description
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
            };
        });
        levelBox.className = 'level-content-box beginner';
        levelBox.innerHTML = levels.beginner;
    }
    
    // Formula Section
    const formulaContainer = document.getElementById('modalFormulaContainer');
    if (formulaContainer) {
        if (concept.formulaBreakdown) {
            formulaContainer.innerHTML = `
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
                </div>
            `;
        } else if (concept.formula) {
            formulaContainer.innerHTML = `<div class="formula">\\[ ${concept.formula} \\]</div>`;
        } else {
            formulaContainer.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem;">Qualitative physical principle.</p>';
        }
    }
    
    // Set related movies
    const moviesData = await fetchJSON('data/movies.json');
    const movieIds = concept.relatedMovies || [];
    const relatedMovies = moviesData ? moviesData.movies.filter(m => movieIds.includes(m.id)) : [];
    
    const moviesContainer = document.getElementById('modalMovies');
    if (moviesContainer) {
        if (relatedMovies.length === 0) {
            moviesContainer.innerHTML = '<p style="color: var(--text-secondary);">No related movies in library</p>';
        } else {
            moviesContainer.innerHTML = relatedMovies.map(movie => `
                <div class="modal-movie" onclick="window.location.href='movie-detail.html?id=${movie.id}'" style="cursor: pointer;">
                    <strong>${movie.title}</strong> (${movie.year}) • Accuracy: ${movie.scientificAccuracy.toFixed(1)}/5
                </div>
            `).join('');
        }
    }
    
    // Set applications
    const appsList = document.getElementById('applicationsList');
    if (appsList) {
        appsList.innerHTML = (concept.applications || []).map(app => `<li>${app}</li>`).join('');
    }
    
    modal.classList.add('active');
    if (window.renderMath) window.renderMath(document.body);
}

window.showConceptModal = showConceptModal;
