/**
 * SciFiLens - Movies Page
 */

let allMovies = [];
let filteredMovies = [];

const filters = {
    search: '',
    genres: [],
    years: [],
    concepts: [],
    accuracy: null,
    sort: 'popularity'
};

document.addEventListener('DOMContentLoaded', async () => {
    const moviesData = await fetchJSON('data/movies.json');
    
    if (moviesData && moviesData.movies && moviesData.movies.length > 0) {
        allMovies = moviesData.movies;
        filteredMovies = [...allMovies];
        
        setupFilterUI();
        setupEventListeners();
        displayMovies();
        updateMovieCount();
    } else {
        // Show error if movies didn't load
        const grid = document.getElementById('moviesGrid');
        const countEl = document.getElementById('moviesCount');
        if (grid) {
            grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-secondary);">Failed to load movies. Please refresh the page.</div>';
        }
        if (countEl) {
            countEl.textContent = '0 of 0 movies';
        }
    }
});

function setupFilterUI() {
    // Setup genre filters
    const genres = [...new Set(allMovies.flatMap(m => m.genre.split(', ')))];
    setupFilterOptions('genreFilters', genres, 'genres');
    
    // Setup year filters
    const years = [...new Set(allMovies.map(m => m.year))].sort((a, b) => b - a);
    setupFilterOptions('yearFilters', years, 'years');
    
    // Setup concept filters
    const concepts = [...new Set(allMovies.flatMap(m => m.concepts))];
    setupFilterOptions('conceptFilters', concepts, 'concepts');
    
    // Setup accuracy filters
    const accuracyContainer = document.getElementById('accuracyFilters');
    if (accuracyContainer) {
        const options = [
            { value: 5, label: '5.0' },
            { value: 4, label: '4.0+' },
            { value: 3, label: '3.0+' },
            { value: 2, label: '2.0+' },
            { value: 0, label: 'All' }
        ];
        
        accuracyContainer.innerHTML = options.map(opt => `
            <button class="accuracy-filter-option" data-value="${opt.value}">
                ${opt.label}
            </button>
        `).join('');
        
        accuracyContainer.querySelectorAll('.accuracy-filter-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                accuracyContainer.querySelectorAll('.accuracy-filter-option').forEach(b => b.classList.remove('active'));
                if (e.target.dataset.value !== '0') {
                    e.target.classList.add('active');
                    filters.accuracy = parseFloat(e.target.dataset.value);
                } else {
                    filters.accuracy = null;
                }
                applyFilters();
            });
        });
    }
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
    
    // Sort dropdown
    const sortSelect = document.getElementById('sortBy');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            filters.sort = e.target.value;
            applyFilters();
        });
    }
    
    // Reset button
    const resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            filters.search = '';
            filters.genres = [];
            filters.years = [];
            filters.concepts = [];
            filters.accuracy = null;
            filters.sort = 'popularity';
            
            // Reset UI
            document.getElementById('searchInput').value = '';
            document.getElementById('sortBy').value = 'popularity';
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            document.querySelectorAll('.accuracy-filter-option').forEach(btn => btn.classList.remove('active'));
            
            applyFilters();
        });
    }
}

function applyFilters() {
    filteredMovies = allMovies.filter(movie => {
        // Search filter
        if (filters.search && !movie.title.toLowerCase().includes(filters.search) && 
            !movie.description.toLowerCase().includes(filters.search)) {
            return false;
        }
        
        // Genre filter
        if (filters.genres.length > 0) {
            const movieGenres = movie.genre.split(', ');
            if (!filters.genres.some(genre => movieGenres.includes(genre))) {
                return false;
            }
        }
        
        // Year filter
        if (filters.years.length > 0 && !filters.years.includes(movie.year.toString())) {
            return false;
        }
        
        // Concept filter
        if (filters.concepts.length > 0) {
            if (!filters.concepts.some(concept => movie.concepts.includes(concept))) {
                return false;
            }
        }
        
        // Accuracy filter
        if (filters.accuracy !== null && movie.scientificAccuracy < filters.accuracy) {
            return false;
        }
        
        return true;
    });
    
    // Apply sorting
    sortMovies();
    
    // Update display
    updateMovieCount();
    displayMovies();
}

function sortMovies() {
    switch (filters.sort) {
        case 'accuracy':
            filteredMovies.sort((a, b) => b.scientificAccuracy - a.scientificAccuracy);
            break;
        case 'year':
            filteredMovies.sort((a, b) => b.year - a.year);
            break;
        case 'title':
            filteredMovies.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'popularity':
        default:
            filteredMovies.sort((a, b) => b.scientificAccuracy - a.scientificAccuracy);
            break;
    }
}

function updateMovieCount() {
    const countElement = document.getElementById('moviesCount');
    if (countElement) {
        const count = filteredMovies.length;
        const total = allMovies.length;
        countElement.textContent = `${count} of ${total} movies`;
    }
}

function displayMovies() {
    const grid = document.getElementById('moviesGrid');
    if (!grid) return;
    
    if (filteredMovies.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <p style="font-size: 1.2rem; color: var(--text-secondary); margin-bottom: 1rem;">
                    No movies found matching your criteria
                </p>
                <button class="btn btn-secondary" onclick="document.getElementById('resetFilters').click()">
                    Reset Filters
                </button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filteredMovies.map(movie => {
        const scorePercentage = (movie.scientificAccuracy / 5) * 100;
        const posterHtml = movie.posterUrl 
            ? `<img src="${movie.posterUrl}" alt="${movie.title} poster" class="movie-poster-image" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'movie-poster-fallback\\'>${movie.poster || '🎬'}</div>';">`
            : `<div class="movie-poster-fallback">${movie.poster || '🎬'}</div>`;

        const likeBtnHtml = typeof renderMovieLikeButton === 'function'
            ? renderMovieLikeButton(movie.id, 'Like', '')
            : `<button class="like-btn movie-like-btn" data-movie-id="${movie.id}" onclick="handleMovieLikeClick(event, '${movie.id}')"><span class="like-heart-icon">♡</span> <span class="like-btn-label">Like</span></button>`;

        return `
            <div class="movie-card" style="position: relative;" onclick="window.location.href='movie-detail.html?id=${movie.id}'">
                <div class="movie-card-like-badge" onclick="event.stopPropagation()">
                    ${likeBtnHtml}
                </div>
                <div class="movie-poster">
                    ${posterHtml}
                </div>
                <div class="movie-card-content">
                    <h3 class="movie-card-title">${movie.title}</h3>
                    <div class="movie-card-meta">
                        <span class="movie-year">${movie.year}</span>
                        <span class="movie-genre">${movie.genre.split(',')[0]}</span>
                    </div>
                    <div class="accuracy-rating">
                        <span>${movie.scientificAccuracy.toFixed(1)}</span>
                        <div class="accuracy-stars">
                            ${generateStarRating(movie.scientificAccuracy)}
                        </div>
                    </div>
                    <div class="score-bar" style="margin-top: 0.5rem;">
                        <div class="score-bar-fill" style="width: ${scorePercentage}%"></div>
                    </div>
                    <div class="concepts-tags" style="margin-top: 0.75rem;">
                        ${movie.concepts.slice(0, 2).map(concept => 
                            `<span class="concept-tag">${concept}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    if (typeof syncAllLikeButtons === 'function') {
        syncAllLikeButtons();
    }
}

