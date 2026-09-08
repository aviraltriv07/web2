/**
 * SciFiLens - Science Explorer Page
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
    const moviesData = await fetchJSON('data/movies.json');
    
    if (scienceData) {
        allConcepts = scienceData.concepts;
        filteredConcepts = [...allConcepts];
        
        setupFilterUI();
        setupEventListeners();
        displayConcepts();
    }
    
    setupModalFunctionality();
});

function setupFilterUI() {
    // Setup difficulty filters
    const difficulties = [...new Set(allConcepts.map(c => c.difficulty))];
    setupFilterOptions('difficultyFilters', difficulties, 'difficulties');
    
    // Setup category filters
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
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            filters.search = e.target.value.toLowerCase();
            applyFilters();
        }, 300));
    }
    
    // Reset button
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
        // Search filter
        if (filters.search && 
            !concept.title.toLowerCase().includes(filters.search) && 
            !concept.description.toLowerCase().includes(filters.search)) {
            return false;
        }
        
        // Difficulty filter
        if (filters.difficulties.length > 0 && !filters.difficulties.includes(concept.difficulty)) {
            return false;
        }
        
        // Category filter
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
        const count = filteredConcepts.length;
        const total = allConcepts.length;
        countElement.textContent = `${count} of ${total} concepts`;
    }
}

function displayConcepts() {
    const grid = document.getElementById('scienceGrid');
    if (!grid) return;
    
    if (filteredConcepts.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
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
    
    grid.innerHTML = filteredConcepts.map(concept => `
        <div class="science-card" onclick="showConceptModal(${concept.id})">
            <div class="science-card-icon">${concept.icon}</div>
            <h3 class="science-card-title">${concept.title}</h3>
            <p class="science-card-description">${concept.description}</p>
            <div class="difficulty-badge ${concept.difficulty.toLowerCase()}">
                ${concept.difficulty}
            </div>
        </div>
    `).join('');
}

function setupModalFunctionality() {
    const modal = document.getElementById('scienceModal');
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
    
    // Set title and icon
    document.getElementById('modalTitle').textContent = concept.title;
    document.getElementById('modalIcon').textContent = concept.icon;
    
    // Set description
    document.getElementById('modalDescription').innerHTML = `
        <p>${concept.description}</p>
        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
            <p><strong>Category:</strong> ${concept.category}</p>
            <p><strong>Difficulty:</strong> <span class="difficulty-badge ${concept.difficulty.toLowerCase()}">${concept.difficulty}</span></p>
        </div>
    `;
    
    // Set formula
    const formulaEl = document.getElementById('modalFormula');
    if (formulaEl) {
        formulaEl.textContent = concept.formula;
    }
    
    // Set related movies (fetch from movies data)
    const moviesData = await fetchJSON('data/movies.json');
    const movieIds = concept.relatedMovies;
    const relatedMovies = moviesData ? moviesData.movies.filter(m => movieIds.includes(m.id)) : [];
    
    const moviesContainer = document.getElementById('modalMovies');
    if (moviesContainer) {
        if (relatedMovies.length === 0) {
            moviesContainer.innerHTML = '<p style="color: var(--text-secondary);">No related movies</p>';
        } else {
            moviesContainer.innerHTML = relatedMovies.map(movie => `
                <div class="modal-movie" onclick="window.location.href='movie-detail.html?id=${movie.id}'">
                    <strong>${movie.title}</strong> (${movie.year})
                </div>
            `).join('');
        }
    }
    
    // Set applications
    const appsList = document.getElementById('applicationsList');
    if (appsList) {
        appsList.innerHTML = concept.applications.map(app => `<li>${app}</li>`).join('');
    }
    
    // Set resources
    const resourcesList = document.getElementById('resourcesList');
    if (resourcesList) {
        resourcesList.innerHTML = concept.resources.map(resource => `
            <div class="resource-item">${resource}</div>
        `).join('');
    }
    
    // Show modal with full explanation
    modal.classList.add('active');
}
